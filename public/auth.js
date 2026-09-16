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
const authForgot = document.getElementById('authForgot');
const authBack = document.getElementById('authBack');
const authTitle = document.getElementById('authTitle');
const logoutBtn = document.getElementById('logoutBtn');

// signin/signup: normal auth. forgot: request a reset email. reset: landed
// here via the emailed recovery link, setting a new password.
let mode = 'signin';

function setMode(next) {
  mode = next;
  authError.textContent = '';
  authNotice.hidden = true;
  authEmail.hidden = mode === 'reset';
  authEmail.required = mode !== 'reset';
  authPassword.hidden = mode === 'forgot';
  authPassword.required = mode !== 'forgot';
  authPassword.autocomplete = mode === 'reset' ? 'new-password' : 'current-password';
  authPassword.placeholder = mode === 'reset' ? 'New password' : 'Password';
  authForgot.hidden = mode !== 'signin';
  authToggleMode.hidden = mode === 'reset';
  authBack.hidden = mode !== 'forgot';

  if (mode === 'signin') {
    authTitle.textContent = 'Sign in';
    authSubmit.textContent = 'Sign in';
    authToggleMode.textContent = 'Need an account? Sign up';
  } else if (mode === 'signup') {
    authTitle.textContent = 'Create your account';
    authSubmit.textContent = 'Sign up';
    authToggleMode.textContent = 'Already have an account? Sign in';
  } else if (mode === 'forgot') {
    authTitle.textContent = 'Reset your password';
    authSubmit.textContent = 'Send reset link';
  } else if (mode === 'reset') {
    authTitle.textContent = 'Set a new password';
    authSubmit.textContent = 'Update password';
  }
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
    } else if (mode === 'signup') {
      const { error } = await supabaseClient.auth.signUp({ email, password });
      if (error) throw error;
      authNotice.textContent = 'Account created — check your email to confirm it, then sign in.';
      authNotice.hidden = false;
      setMode('signin');
    } else if (mode === 'forgot') {
      const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: `${location.origin}/app`,
      });
      if (error) throw error;
      authNotice.textContent = 'Check your email for a link to reset your password.';
      authNotice.hidden = false;
      setMode('signin');
    } else if (mode === 'reset') {
      const { error } = await supabaseClient.auth.updateUser({ password });
      if (error) throw error;
      isRecovery = false;
      authNotice.textContent = 'Password updated — signing you in…';
      authNotice.hidden = false;
      setTimeout(() => {
        hideAuth();
        loadAppScript();
      }, 800);
    }
  } catch (err) {
    authError.textContent = err.message;
  } finally {
    authSubmit.disabled = false;
  }
});

authToggleMode.addEventListener('click', () => setMode(mode === 'signin' ? 'signup' : 'signin'));
authForgot.addEventListener('click', () => setMode('forgot'));
authBack.addEventListener('click', () => setMode('signin'));

logoutBtn.addEventListener('click', async () => {
  await supabaseClient.auth.signOut();
  location.reload();
});

// A password-recovery link lands back here with the session already
// established (Supabase signs the visitor in via the emailed token) — so
// without this check, boot() below would treat it as a normal login and
// skip straight into the app instead of asking for a new password. Both an
// upfront URL check (reliable, synchronous) and the PASSWORD_RECOVERY event
// (belt and suspenders for however the SDK reports it) set this flag.
let isRecovery = /type=recovery/.test(location.hash) || new URLSearchParams(location.search).get('type') === 'recovery';

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
  window.supabaseClient = supabaseClient;
  // Landing page's "Sign up" vs "Log in" buttons link to /app?mode=signup
  // vs plain /app, so each opens straight to the right form instead of
  // both dropping onto sign-in and making "Sign up" clickers hunt for the
  // toggle.
  const startInSignup = new URLSearchParams(location.search).get('mode') === 'signup';
  setMode(isRecovery ? 'reset' : startInSignup ? 'signup' : 'signin');

  supabaseClient.auth.onAuthStateChange((event, session) => {
    if (event === 'PASSWORD_RECOVERY') {
      isRecovery = true;
      setMode('reset');
      showAuth();
      return;
    }
    if (isRecovery) return; // stay on the "set a new password" screen until it's submitted
    if (session) {
      hideAuth();
      loadAppScript();
    } else if (event === 'SIGNED_OUT') {
      showAuth();
    }
  });

  const { data } = await supabaseClient.auth.getSession();
  if (isRecovery) {
    showAuth();
  } else if (data.session) {
    hideAuth();
    loadAppScript();
  } else {
    showAuth();
  }
})();
