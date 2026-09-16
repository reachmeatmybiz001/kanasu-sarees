-- Kanasu Sarees dynamic website schema
-- 1) Create a Supabase project.
-- 2) Run this entire file in SQL Editor.
-- 3) Create your admin user under Authentication > Users.
-- 4) Set app_metadata.role = 'admin' for that user (recommended via SQL below).
-- 5) Put project URL + publishable/anon key into supabase-config.js.

create extension if not exists pgcrypto;

create table if not exists public.site_settings (
  key text primary key,
  value text not null default ''
);

create table if not exists public.hero_slides (
  id uuid primary key default gen_random_uuid(),
  eyebrow text not null default 'Kanasu Sarees',
  title text not null,
  description text default '',
  image_url text default '',
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text default '',
  image_url text default '',
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;
alter table public.hero_slides enable row level security;
alter table public.collections enable row level security;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path=public
as $$ select coalesce((auth.jwt()->'app_metadata'->>'role') = 'admin', false); $$;

drop policy if exists "Public can read settings" on public.site_settings;
create policy "Public can read settings" on public.site_settings for select using (true);
drop policy if exists "Admins manage settings" on public.site_settings;
create policy "Admins manage settings" on public.site_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Public can read published heroes" on public.hero_slides;
create policy "Public can read published heroes" on public.hero_slides for select using (published = true or public.is_admin());
drop policy if exists "Admins manage heroes" on public.hero_slides;
create policy "Admins manage heroes" on public.hero_slides for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Public can read published collections" on public.collections;
create policy "Public can read published collections" on public.collections for select using (published = true or public.is_admin());
drop policy if exists "Admins manage collections" on public.collections;
create policy "Admins manage collections" on public.collections for all to authenticated using (public.is_admin()) with check (public.is_admin());

insert into public.site_settings(key,value) values
('brand_name','KANASU SAREES'),
('tagline','Timeless Weaves. Rooted in Tradition. Woven for Generations.'),
('intro','Kanasu Sarees celebrates the beauty of Indian textiles through thoughtfully curated weaves, expressive colours and enduring craftsmanship. Every saree carries the quiet character of the hands, looms and traditions behind it.'),
('story_title','Woven with heritage. Chosen with heart.'),
('story_text','Kanasu is a celebration of Indian textile artistry—where heritage techniques meet contemporary elegance. We bring together graceful handloom traditions and timeless drapes for women who appreciate authenticity, detail and stories woven into every thread.'),
('email','kanasusarees@gmail.com')
on conflict(key) do update set value=excluded.value;

insert into public.hero_slides(eyebrow,title,description,image_url,sort_order,published)
select 'Kanasu Sarees','Timeless Weaves. Rooted in Tradition.','Discover sarees shaped by heritage, artisan skill and a love for beautiful drapes.','assets/hero-model.jpg',0,true
where not exists(select 1 from public.hero_slides);

insert into public.collections(name,description,image_url,sort_order,published)
select * from (values
('Mul Cotton','Light, airy and effortlessly graceful.','assets/mul-cotton.jpg',0,true),
('Dola Silks','Rich texture with a luminous drape.','assets/dola-silks.jpg',1,true),
('Maheshwari','A classic weave with refined character.','assets/maheshwari.jpg',2,true),
('Ajrakh Dola','Artful colour and traditional print language.','assets/ajrakh-dola.jpg',3,true),
('Modal Silks','Soft movement with an elegant finish.','assets/modal-silks.jpg',4,true),
('Linen','Natural texture for modern, timeless dressing.','assets/linen.jpg',5,true)
) v(name,description,image_url,sort_order,published)
where not exists(select 1 from public.collections);

-- Run this after replacing the email with your actual admin login email:
-- update auth.users set raw_app_meta_data = coalesce(raw_app_meta_data,'{}'::jsonb) || '{"role":"admin"}'::jsonb
-- where email = 'YOUR_ADMIN_EMAIL';
