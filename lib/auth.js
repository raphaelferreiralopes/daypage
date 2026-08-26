'use strict';

const { createRemoteJWKSet, jwtVerify } = require('jose');
const { clientForToken } = require('./supabase');

// Verifies the bearer JWT locally against the project's public signing keys
// instead of calling Supabase's Auth server on every request — that round
// trip alone cost ~140ms per API call. createRemoteJWKSet fetches the keys
// once and caches them (re-fetching only on an unrecognized `kid`, e.g. after
// key rotation), so steady-state this adds no network I/O per request. This
// doesn't weaken isolation: Postgres/PostgREST verifies the same JWT again
// independently when the actual query runs, so RLS never depended on this
// check succeeding.
const JWKS = createRemoteJWKSet(new URL(`${process.env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`));

async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing Authorization header.' });

  let payload;
  try {
    ({ payload } = await jwtVerify(token, JWKS));
  } catch (e) {
    return res.status(401).json({ error: 'Invalid or expired session.' });
  }

  req.supabase = clientForToken(token);
  req.userId = payload.sub;
  next();
}

module.exports = { requireAuth };
