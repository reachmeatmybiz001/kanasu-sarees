const toggle=document.querySelector('.menu-toggle');const nav=document.querySelector('.nav-links');toggle?.addEventListener('click',()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',open?'true':'false')});document.querySelectorAll('.nav-links a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));
const sections=[...document.querySelectorAll('main section[id]')];const links=[...document.querySelectorAll('.nav-links a')];const setActive=()=>{let current='home';sections.forEach(s=>{if(scrollY>=s.offsetTop-180)current=s.id});links.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+current))};addEventListener('scroll',setActive,{passive:true});setActive();

// Data-driven content and lightweight dynamic interactions.
(() => {
  const c = window.KANASU_CONTENT;
  if (!c) return;

  const hero = document.querySelector('#hero-content');
  if (hero) {
    const h1 = hero.querySelector('h1');
    const h2 = hero.querySelector('h2');
    const p = hero.querySelector('p');
    const eyebrow = hero.querySelector('.eyebrow');
    const action = hero.querySelector('.text-link');
    if (eyebrow) eyebrow.textContent = c.hero.eyebrow;
    if (h1) h1.innerHTML = `${c.hero.title}<br><span>${c.hero.titleAccent}</span>`;
    if (h2) h2.textContent = c.hero.subtitle;
    if (p) p.textContent = c.hero.description;
    if (action) action.textContent = `${c.hero.action} →`;
  }

  const promise = document.querySelector('#promise-content');
  if (promise) {
    promise.innerHTML = c.promise.map(item => `<div><span>${item.icon}</span><strong>${item.title}</strong><p>${item.text}</p></div>`).join('');
  }

  const story = document.querySelector('#story-intro-content');
  if (story) {
    story.innerHTML = `<h2>${c.story.title}<br><em>${c.story.accent}</em></h2><p>${c.story.text}</p>`;
  }

  const enquiry = document.querySelector('#enquiry-content');
  if (enquiry) {
    enquiry.innerHTML = `<div class="section-kicker">${c.enquiry.kicker}</div><h2>${c.enquiry.title}<br><em>${c.enquiry.accent}</em></h2><p>${c.enquiry.text}</p><a class="button primary" href="mailto:${c.brand.email}?subject=Kanasu%20Sarees%20Enquiry">Send an Enquiry <span>↗</span></a>`;
  }

  const contact = document.querySelector('#contact-content');
  if (contact) {
    contact.innerHTML = `<div><small>Email</small><a href="mailto:${c.brand.email}">${c.brand.email}</a></div><div><small>Enquiries</small><p>${c.contact.enquiryLabel}</p></div><div><small>Location</small><p>${c.brand.location}</p></div><a class="button outline" href="mailto:${c.brand.email}?subject=Kanasu%20Sarees%20Enquiry">Contact Kanasu <span>↗</span></a>`;
  }

  document.querySelectorAll('.footer-brand').forEach(el => {
    const p = el.querySelector('p');
    if (p) p.innerHTML = c.brand.tagline.replace('. ', '.<br>');
  });

  // Dynamic year.
  document.querySelectorAll('.copyright').forEach(el => {
    el.textContent = `© ${new Date().getFullYear()} Developed & Maintained by AltekNetworks. All rights reserved.`;
  });

  // Rotating hero accent line.
  const rotating = c.hero.rotatingLines || [];
  const h2 = document.querySelector('#hero-content h2');
  if (rotating.length > 1 && h2) {
    let i = 0;
    setInterval(() => {
      i = (i + 1) % rotating.length;
      h2.classList.add('changing');
      setTimeout(() => { h2.textContent = rotating[i]; h2.classList.remove('changing'); }, 180);
    }, 4200);
  }

  // Dynamic collections modal, keeping the homepage uncluttered.
  const collections = [
    ['Mul Cotton', 'assets/mul-cotton.jpg'],
    ['Dola Silks', 'assets/dola-silks.jpg'],
    ['Maheshwari', 'assets/maheshwari.jpg'],
    ['Ajrakh Dola', 'assets/ajrakh-dola.jpg'],
    ['Modal Silks', 'assets/modal-silks.jpg'],
    ['Linen', 'assets/linen.jpg']
  ];
  const grid = document.querySelector('#collection-grid');
  if (grid) grid.innerHTML = collections.map(([name, img]) => `<article class="collection-card"><img src="${img}" alt="${name} saree"><span>${name}</span></article>`).join('');

  const modal = document.querySelector('#collections-modal');
  const openModal = () => { if (!modal) return; modal.classList.add('open'); modal.setAttribute('aria-hidden','false'); document.body.classList.add('modal-open'); };
  const closeModal = () => { if (!modal) return; modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); document.body.classList.remove('modal-open'); };
  document.querySelectorAll('a[href="#collections"]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); openModal(); }));
  document.querySelectorAll('[data-close-collections]').forEach(el => el.addEventListener('click', closeModal));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  // Reveal sections as they enter the viewport.
  const reveal = document.querySelectorAll('main section, footer');
  reveal.forEach(el => el.classList.add('reveal'));
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    }), { threshold: .08 });
    reveal.forEach(el => observer.observe(el));
  } else reveal.forEach(el => el.classList.add('visible'));
})();
