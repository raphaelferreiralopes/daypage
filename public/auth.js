'use strict';

// Gatekeeper loaded before app.js: signs the user in via Supabase Auth, then
// only injects app.js once a session exists. Every API call app.js makes
// goes through the global `apiFetch` defined here, which attaches the
// current session's JWT — that JWT is what Postgres RLS checks to keep
// each user's data separate (see lib/auth.js and supabase/migrations).

let supabaseClient = null;

const authOverlay = document.getElementById('authOverlay');
const authForm = document.getElementById('authForm');
const authEmail = document.getElementById('authEmail');
const authPassword = document.getElementById('authPassword');
const authError = document.getElementById('authError');
const authNotice = document.getElementById('authNotice');
const authSubmit = document.getElementById('authSubmit');
const authToggleMode = document.getElementById('authToggleMode');
const authTitle = document.getElementById('authTitle');
const logoutBtn = document.getElementById('logoutBtn');

let mode = 'signin';

function setMode(next) {
  mode = next;
  authTitle.textContent = mode === 'signin' ? 'Sign in' : 'Create your account';
  authSubmit.textContent = mode === 'signin' ? 'Sign in' : 'Sign up';
  authToggleMode.textContent = mode === 'signin' ? 'Need an account? Sign up' : 'Already have an account? Sign in';
  authError.textContent = '';
  authNotice.hidden = true;
}

function showAuth() {
  document.body.classList.add('auth-locked');
  authOverlay.hidden = false;
}

function hideAuth() {
  authOverlay.hidden = true;
  document.body.classList.remove('auth-locked');
}

async function apiFetch(url, options = {}) {
  const { data } = await supabaseClient.auth.getSession();
  const headers = new Headers(options.headers || {});
  if (data.session) headers.set('Authorization', `Bearer ${data.session.access_token}`);
  const res = await fetch(url, { ...options, headers });
  if (res.status === 401) showAuth();
  return res;
}
window.apiFetch = apiFetch;

function loadAppScript() {
  if (document.getElementById('appScript')) return;
  const script = document.createElement('script');
  script.id = 'appScript';
  script.src = '/app.js';
  document.body.appendChild(script);
}

authForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  authError.textContent = '';
  authNotice.hidden = true;
  authSubmit.disabled = true;
  try {
    const email = authEmail.value.trim();
    const password = authPassword.value;
    if (mode === 'signin') {
      const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } else {
      const { error } = await supabaseClient.auth.signUp({ email, password });
      if (error) throw error;
      authNotice.textContent = 'Account created — check your email to confirm it, then sign in.';
      authNotice.hidden = false;
      setMode('signin');
    }
  } catch (err) {
    authError.textContent = err.message;
  } finally {
    authSubmit.disabled = false;
  }
});

authToggleMode.addEventListener('click', () => setMode(mode === 'signin' ? 'signup' : 'signin'));

logoutBtn.addEventListener('click', async () => {
  await supabaseClient.auth.signOut();
  location.reload();
});

(async function boot() {
  let cfg;
  try {
    cfg = await fetch('/api/config').then((r) => r.json());
  } catch {
    cfg = {};
  }
  if (!cfg.url || !cfg.anonKey) {
    authError.textContent = 'Server is not configured (missing Supabase environment variables).';
    showAuth();
    return;
  }

  supabaseClient = window.supabase.createClient(cfg.url, cfg.anonKey);
  setMode('signin');

  const { data } = await supabaseClient.auth.getSession();
  if (data.session) {
    hideAuth();
    loadAppScript();
  } else {
    showAuth();
  }

  supabaseClient.auth.onAuthStateChange((event, session) => {
    if (session) {
      hideAuth();
      loadAppScript();
    } else if (event === 'SIGNED_OUT') {
      showAuth();
    }
  });
})();
