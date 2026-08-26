'use strict';

const { clientForToken } = require('./supabase');

// Verifies the bearer JWT with Supabase Auth, then attaches a request-scoped
// client (authenticated as that user) plus the user id to every handler.
async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing Authorization header.' });

  try {
    const supabase = clientForToken(token);
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) return res.status(401).json({ error: 'Invalid or expired session.' });

    req.supabase = supabase;
    req.userId = data.user.id;
    next();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

module.exports = { requireAuth };
