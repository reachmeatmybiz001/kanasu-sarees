/* Kanasu Sarees public site - Supabase powered */
const sbUrl = window.KANASU_SUPABASE_URL;
const sbKey = window.KANASU_SUPABASE_ANON_KEY;
const hasSupabase = Boolean(sbUrl && sbKey && !sbUrl.includes('YOUR_') && !sbKey.includes('YOUR_') && /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(sbUrl) && (sbKey.startsWith('sb_publishable_') || sbKey.startsWith('eyJ')));
const db = hasSupabase ? window.supabase.createClient(sbUrl, sbKey) : null;
const fallback = {
  settings:{brand_name:'KANASU SAREES',tagline:'Timeless Weaves. Rooted in Tradition. Woven for Generations.',intro:'Kanasu Sarees celebrates the beauty of Indian textiles through thoughtfully curated weaves, expressive colours and enduring craftsmanship. Every saree carries the quiet character of the hands, looms and traditions behind it.',story_title:'Woven with heritage. Chosen with heart.',story_text:'Kanasu is a celebration of Indian textile artistry—where heritage techniques meet contemporary elegance. We bring together graceful handloom traditions and timeless drapes for women who appreciate authenticity, detail and stories woven into every thread.',email:'kanasusarees@gmail.com'},
  slides:[{eyebrow:'Kanasu Sarees',title:'Timeless Weaves. Rooted in Tradition.',description:'Discover sarees shaped by heritage, artisan skill and a love for beautiful drapes.',image_url:'assets/hero-model.jpg'}],
  collections:[
    {name:'Mul Cotton',description:'Light, airy and effortlessly graceful.',image_url:'assets/mul-cotton.jpg'},
    {name:'Dola Silks',description:'Rich texture with a luminous drape.',image_url:'assets/dola-silks.jpg'},
    {name:'Maheshwari',description:'A classic weave with refined character.',image_url:'assets/maheshwari.jpg'},
    {name:'Ajrakh Dola',description:'Artful colour and traditional print language.',image_url:'assets/ajrakh-dola.jpg'},
    {name:'Modal Silks',description:'Soft movement with an elegant finish.',image_url:'assets/modal-silks.jpg'},
    {name:'Linen',description:'Natural texture for modern, timeless dressing.',image_url:'assets/linen.jpg'}
  ]
};
function text(id,value){const el=document.getElementById(id);if(el)el.textContent=value||'';}
function assetUrl(value){if(!value)return '';try{return new URL(String(value),document.baseURI).href;}catch{return String(value);}}
function setImage(id,value){const el=document.getElementById(id);if(el&&value){el.src=assetUrl(value);el.onerror=()=>{el.style.display='none';};}}
function escapeHtml(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));}
function render(data){
  const s=data.settings||fallback.settings; const slide=(data.slides||fallback.slides)[0]||fallback.slides[0];
  document.title=s.brand_name||'Kanasu Sarees'; text('hero-eyebrow',slide.eyebrow); text('hero-title',slide.title); text('hero-description',slide.description); setImage('hero-image',slide.image_url||slide.image);
  text('home-intro',s.intro); text('story-title',s.story_title); text('story-text',s.story_text);
  document.querySelectorAll('[data-email]').forEach(a=>{const email=s.email||fallback.settings.email;a.textContent=email;a.href='mailto:'+email;});
  const grid=document.getElementById('collections-grid'); if(!grid)return;
  grid.innerHTML=(data.collections||[]).map(c=>{const image=assetUrl(c.image_url||c.image);return `<article class="card"><img src="${escapeHtml(image)}" alt="${escapeHtml(c.name)}" loading="lazy"><span>Kanasu Collection</span><div><h3>${escapeHtml(c.name)}</h3><p>${escapeHtml(c.description||'')}</p></div></article>`;}).join('');
}
async function load(){
  if(!db){render(fallback);document.body.classList.add('demo-mode');return;}
  try{const [settings,slides,collections]=await Promise.all([db.from('site_settings').select('*').order('key'),db.from('hero_slides').select('*').eq('published',true).order('sort_order'),db.from('collections').select('*').eq('published',true).order('sort_order')]);if(settings.error)throw settings.error;const map={};(settings.data||[]).forEach(r=>map[r.key]=r.value);render({settings:{...fallback.settings,...map},slides:slides.data?.length?slides.data:fallback.slides,collections:collections.data?.length?collections.data:fallback.collections});}catch(e){console.warn('Supabase unavailable; showing built-in content.',e);render(fallback);}}
document.addEventListener('DOMContentLoaded',load);
