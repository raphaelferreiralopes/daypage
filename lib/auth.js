'use strict';

const { clientForToken } = require('./supabase');

// jose is ESM-only; dynamic import() works from CommonJS on every Node
// version (unlike require(), which only some newer Node runtimes allow for
// ESM — Vercel's runtime doesn't). Both promises are cached at module scope,
// so this costs nothing per request after the first call.
let josePromise;
function loadJose() {
  if (!josePromise) josePromise = import('jose');
  return josePromise;
}

let jwksPromise;
async function getJWKS() {
  if (!jwksPromise) {
    const { createRemoteJWKSet } = await loadJose();
    jwksPromise = createRemoteJWKSet(new URL(`${process.env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`));
  }
  return jwksPromise;
}

// Verifies the bearer JWT locally against the project's public signing keys
// instead of calling Supabase's Auth server on every request — that round
// trip alone cost ~140ms per API call. The JWKS is fetched once and cached
// (re-fetched only on an unrecognized `kid`, e.g. after key rotation), so
// steady-state this adds no network I/O per request. This doesn't weaken
// isolation: Postgres/PostgREST verifies the same JWT again independently
// when the actual query runs, so RLS never depended on this check succeeding.
async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing Authorization header.' });

  try {
    const { jwtVerify } = await loadJose();
    const jwks = await getJWKS();
    const { payload } = await jwtVerify(token, jwks);
    req.supabase = clientForToken(token);
    req.userId = payload.sub;
    next();
  } catch (e) {
    res.status(401).json({ error: 'Invalid or expired session.' });
  }
}

module.exports = { requireAuth };
