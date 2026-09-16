# Kanasu Sarees — Dynamic Website + Admin Panel

A GitHub Pages-compatible Kanasu Sarees website backed by Supabase.

## What is dynamic?

The public site reads Home/Story content, hero slides and collections from Supabase at runtime. The `/admin.html` page provides an authenticated content dashboard to update them.

GitHub Pages remains the static frontend host; Supabase provides authentication and PostgreSQL data. GitHub Pages itself does not run server-side PHP/Python/etc. citeturn0search6turn0search11

## Setup

1. Create a Supabase project.
2. Open Supabase SQL Editor and run `supabase/schema.sql`.
3. Create an admin user in Supabase Authentication → Users.
4. Give that user `app_metadata.role = admin` using the SQL comment at the bottom of `schema.sql`.
5. Open `supabase-config.js` and replace:
   - `YOUR_SUPABASE_PROJECT_URL`
   - `YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY`
6. This package already contains the configured Supabase project URL and publishable key for the Kanasu project. Do not replace it with a secret/service-role key.
7. Push the complete folder to GitHub.
8. Enable GitHub Pages for the repository.
9. Visit `/admin.html` and sign in.

Supabase's browser client supports Auth and database operations, and the publishable/anon key is intended for client-side initialization; do not expose a service-role key in this repository. citeturn0search0turn0search1

## Important security

The included SQL enables Row Level Security and uses an `app_metadata.role = admin` check for write operations. Public visitors can read only published content.

Never put a Supabase `service_role` key in GitHub Pages.

## Current brand settings

- Email: kanasusarees@gmail.com
- No WhatsApp
- No ecommerce/cart/payment
- English-only
- Kanasu logo + watermark retained
- Footer: © 2026 Developed & Maintained by AltekNetworks. All rights reserved.

## Admin capabilities

- Edit home introduction
- Edit Our Story
- Edit contact email
- Add/edit/delete collections
- Add/edit/delete hero slides
- Publish/unpublish content

For image uploads, create the `kanasu-media` Storage bucket as described in `supabase/STORAGE.md`, then use its public URLs in the admin forms.


## Admin login fix included

This build includes a hardened Supabase initialization flow, support for `sb_publishable_...` browser keys, persistent sessions, clearer login errors, and cache-busting query strings for GitHub Pages so an older cached `supabase-config.js` or `admin.js` is less likely to be used.
