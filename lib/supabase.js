'use strict';

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// One client per request, authenticated as the requesting user's own JWT —
// so Postgres row-level security (not application code) is what actually
// keeps one user's data from another's. Never share a client across users.
function clientForToken(accessToken) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be set.');
  }
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// Service-role client — bypasses RLS, so it's used for exactly one thing:
// deleting a user's own auth.users row (via the admin API) when they ask to
// delete their account. Every table's user_id FK is `on delete cascade`
// (see supabase/migrations/0001_init.sql), so that single delete wipes all
// of their data too. Never used to read/write on a user's behalf otherwise.
let admin;
function adminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set for account deletion.');
  }
  if (!admin) admin = createClient(SUPABASE_URL, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return admin;
}

module.exports = { clientForToken, adminClient };
