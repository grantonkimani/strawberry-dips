-- Banners table for rotating hero
create table if not exists public.banners (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  alt text default ''::text,
  headline text default ''::text,
  subtext text default ''::text,
  cta_label text default ''::text,
  cta_href text default ''::text,
  overlay numeric default 0.45,
  display_order int default 0,
  active boolean default true,
  start_at timestamptz,
  end_at timestamptz,
  created_at timestamptz not null default now()
);

-- Helpful index for ordering/queries
create index if not exists banners_active_order_idx on public.banners (active, display_order);


