# Image storage

Create a Supabase Storage bucket named `kanasu-media` and set it to Public if you want the admin to store image URLs for the public site.

For stronger security, keep the bucket private and serve signed URLs through an Edge Function. The included starter admin currently accepts image URLs so the first deployment stays simple and GitHub Pages compatible.

Recommended production workflow:
1. Supabase Dashboard → Storage → New bucket → `kanasu-media`.
2. Upload hero/collection images.
3. Copy each public URL into the admin form.
