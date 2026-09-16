// Kanasu Sarees Admin - Supabase-backed content management
(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const msg = (id, text) => { const el = $(id); if (el) el.textContent = text || ''; };

  function getConfig() {
    const url = String(window.KANASU_SUPABASE_URL || '').trim();
    const key = String(window.KANASU_SUPABASE_ANON_KEY || '').trim();
    const configured = Boolean(
      url && key &&
      !url.includes('YOUR_') && !key.includes('YOUR_') &&
      /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(url) &&
      (key.startsWith('sb_publishable_') || key.startsWith('eyJ'))
    );
    return { url, key, configured };
  }

  const config = getConfig();
  let db = null;
  let collections = [];
  let slides = [];

  function showSetup(title, text) {
    const setup = $('setup');
    if (!setup) return;
    setup.classList.remove('hidden');
    setup.innerHTML = '<strong>' + title + '</strong><p>' + text + '</p>';
  }

  function hideSetup() {
    const setup = $('setup');
    if (setup) setup.classList.add('hidden');
  }

  function need() {
    if (!db) {
      msg('loginMsg', 'Supabase is not initialized. Refresh the page and try again.');
      return false;
    }
    return true;
  }

  function showLogin() {
    $('login').classList.remove('hidden');
    $('dashboard').classList.add('hidden');
    $('logout').classList.add('hidden');
  }

  async function showApp() {
    $('login').classList.add('hidden');
    $('dashboard').classList.remove('hidden');
    $('logout').classList.remove('hidden');
    await loadAll();
  }

  async function init() {
    if (!config.configured) {
      showSetup('Supabase configuration not loaded', 'Check supabase-config.js and refresh this page.');
      showLogin();
      return;
    }

    if (!window.supabase || typeof window.supabase.createClient !== 'function') {
      showSetup('Supabase library not loaded', 'The Supabase client library could not be loaded. Check your internet connection and refresh the page.');
      showLogin();
      return;
    }

    try {
      db = window.supabase.createClient(config.url, config.key, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
      });

      hideSetup();
      const { data, error } = await db.auth.getSession();
      if (error) {
        console.error('Supabase getSession error:', error);
        msg('loginMsg', error.message);
      }

      if (data && data.session) await showApp();
      else showLogin();

      db.auth.onAuthStateChange(async (_event, session) => {
        if (session) await showApp();
        else showLogin();
      });
    } catch (error) {
      console.error('Supabase initialization error:', error);
      showSetup('Supabase initialization failed', 'Open the browser console (F12) for the technical error details.');
      showLogin();
    }
  }

  $('loginForm').onsubmit = async (e) => {
    e.preventDefault();
    if (!need()) return;

    const email = $('email').value.trim();
    const password = $('password').value;
    msg('loginMsg', 'Signing in...');

    try {
      const { error } = await db.auth.signInWithPassword({ email, password });
      if (error) {
        console.error('Supabase login error:', error);
        msg('loginMsg', error.message);
      } else {
        msg('loginMsg', 'Signed in. Loading dashboard...');
      }
    } catch (error) {
      console.error('Login error:', error);
      msg('loginMsg', error.message || 'Unable to sign in.');
    }
  };

  $('logout').onclick = async () => { if (db) await db.auth.signOut(); };

  document.querySelectorAll('[data-tab]').forEach((button) => {
    button.onclick = () => {
      document.querySelectorAll('[data-tab]').forEach((x) => x.classList.remove('active'));
      button.classList.add('active');
      document.querySelectorAll('[id^="tab-"]').forEach((x) => x.classList.add('hidden'));
      $('tab-' + button.dataset.tab).classList.remove('hidden');
    };
  });

  async function loadAll() {
    if (!need()) return;
    const [settingsResult, collectionsResult, heroesResult] = await Promise.all([
      db.from('site_settings').select('*'),
      db.from('collections').select('*').order('sort_order'),
      db.from('hero_slides').select('*').order('sort_order')
    ]);

    if (settingsResult.error) { alert(settingsResult.error.message); return; }
    if (collectionsResult.error) console.error('Collections error:', collectionsResult.error);
    if (heroesResult.error) console.error('Hero slides error:', heroesResult.error);

    const settings = {};
    (settingsResult.data || []).forEach((item) => { settings[item.key] = item.value; });
    ['brand_name', 'tagline', 'intro', 'story_title', 'story_text'].forEach((key) => { if ($(key)) $(key).value = settings[key] || ''; });
    if ($('email_setting')) $('email_setting').value = settings.email || '';
    collections = collectionsResult.data || [];
    slides = heroesResult.data || [];
    renderCollections();
    renderSlides();
  }

  $('settingsForm').onsubmit = async (e) => {
    e.preventDefault();
    if (!need()) return;
    const rows = ['brand_name', 'tagline', 'intro', 'story_title', 'story_text', 'email'].map((key) => ({
      key,
      value: key === 'email' ? $('email_setting').value.trim() : $(key).value
    }));
    const { error } = await db.from('site_settings').upsert(rows);
    msg('settingsStatus', error ? error.message : 'Saved. Refresh the public site to see the changes.');
  };

  function renderCollections() {
    $('collectionList').innerHTML = collections.map((c) => `<div class="item"><img src="${c.image_url || 'assets/kanasu-logo.png'}" alt=""><div><strong>${esc(c.name)}</strong><p>${esc(c.description || '')}</p></div><div class="item-actions"><button onclick="editCollection('${c.id}')">Edit</button><button class="danger" onclick="deleteCollection('${c.id}')">Delete</button></div></div>`).join('') || '<p>No collections yet.</p>';
  }

  function renderSlides() {
    $('heroList').innerHTML = slides.map((h) => `<div class="item"><img src="${h.image_url || 'assets/hero-model.jpg'}" alt=""><div><strong>${esc(h.title)}</strong><p>${esc(h.description || '')}</p></div><div class="item-actions"><button onclick="editHero('${h.id}')">Edit</button><button class="danger" onclick="deleteHero('${h.id}')">Delete</button></div></div>`).join('') || '<p>No hero slides yet.</p>';
  }

  function esc(x) { return String(x ?? '').replace(/[&<>"']/g, m => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;' }[m])); }

  $('newCollection').onclick = () => editCollection();
  $('newHero').onclick = () => editHero();

  async function editCollection(id) {
    if (!need()) return;
    const c = collections.find(x => x.id === id) || { name:'', description:'', image_url:'', sort_order:collections.length, published:true };
    const name = prompt('Collection name:', c.name); if (name === null) return;
    const description = prompt('Description:', c.description || ''); if (description === null) return;
    const image_url = prompt('Image URL (or Supabase Storage public URL):', c.image_url || ''); if (image_url === null) return;
    const payload = { name, description, image_url, sort_order:Number(c.sort_order || 0), published:true };
    const result = id ? await db.from('collections').update(payload).eq('id', id) : await db.from('collections').insert(payload);
    if (result.error) alert(result.error.message); else loadAll();
  }

  async function deleteCollection(id) {
    if (!need() || !confirm('Delete this collection?')) return;
    const { error } = await db.from('collections').delete().eq('id', id);
    if (error) alert(error.message); else loadAll();
  }

  async function editHero(id) {
    if (!need()) return;
    const h = slides.find(x => x.id === id) || { eyebrow:'Kanasu Sarees', title:'Timeless Weaves. Rooted in Tradition.', description:'Discover sarees shaped by heritage, artisan skill and a love for beautiful drapes.', image_url:'assets/hero-model.jpg', sort_order:slides.length, published:true };
    const eyebrow = prompt('Eyebrow:', h.eyebrow || ''); if (eyebrow === null) return;
    const title = prompt('Hero title:', h.title); if (title === null) return;
    const description = prompt('Description:', h.description || ''); if (description === null) return;
    const image_url = prompt('Image URL:', h.image_url || ''); if (image_url === null) return;
    const payload = { eyebrow, title, description, image_url, sort_order:Number(h.sort_order || 0), published:true };
    const result = id ? await db.from('hero_slides').update(payload).eq('id', id) : await db.from('hero_slides').insert(payload);
    if (result.error) alert(result.error.message); else loadAll();
  }

  async function deleteHero(id) {
    if (!need() || !confirm('Delete this hero slide?')) return;
    const { error } = await db.from('hero_slides').delete().eq('id', id);
    if (error) alert(error.message); else loadAll();
  }

  window.editCollection = editCollection;
  window.deleteCollection = deleteCollection;
  window.editHero = editHero;
  window.deleteHero = deleteHero;

  init();
})();
