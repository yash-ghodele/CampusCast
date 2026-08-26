# CampusCast (Rebuild) — Storage Rules

This is the Supabase equivalent of a Firestore `security.rules` file: Postgres **Row-Level Security (RLS)** policies for every table, plus bucket policies for media in Supabase Storage. Every rule here should be applied via a migration file, not clicked together in the dashboard, so it's reviewable and reproducible.

## 1. Principles
- **RLS is enabled on every table, no exceptions.** A table with RLS off is a table the `anon` key can read/write freely — never acceptable here.
- **Only two roles ever touch these tables directly: `anon` (public, used by display clients) and `service_role` (used only inside Edge Functions, never shipped to any client).** The admin web app authenticates via Supabase Auth and gets its own `authenticated` role, scoped separately below.
- **`service_role` bypasses RLS by design** — it's Supabase's server-side key. It must never appear in any client bundle, browser, or public repo. It lives only in the Edge Function's environment secrets.
- **Deny by default.** Every policy below is additive; anything not explicitly granted is denied.

## 2. Enable RLS on everything

```sql
alter table public.departments enable row level security;
alter table public.users       enable row level security;
alter table public.screens     enable row level security;
alter table public.notices     enable row level security;
alter table public.audit_log   enable row level security;
```

## 3. `notices` — the table the public display clients touch

```sql
-- Anyone (anon key, i.e. the display client) can read ACTIVE notices only.
-- This is intentionally public — it's what's meant to be shown on a hallway screen.
create policy "public read active notices"
on public.notices
for select
to anon, authenticated
using (status = 'active');

-- No insert/update/delete for anon or authenticated. Writes only via service_role,
-- which bypasses RLS entirely — no policy needed to grant it, only to NOT grant
-- these operations to anyone else.
```

**Deliberately not exposed:** `scheduled`, `expired`, and `deleted` notices are invisible to the `anon`/`authenticated` roles. A display or admin-app bug can't leak a not-yet-published or deleted notice.

## 4. `departments` and `screens` — read-only reference data

```sql
create policy "public read departments"
on public.departments
for select
to anon, authenticated
using (true);

create policy "public read screens"
on public.screens
for select
to anon, authenticated
using (true);
```

These are non-sensitive (department names/codes, screen labels) — safe to read publicly, useful for the display client to resolve its own department context on load.

## 5. `users` — the sensitive one

```sql
-- No anon access at all. Not even a select policy — anon gets nothing.

-- Authenticated admins can read the roster, but ONLY if their own auth identity
-- is itself a registered active super_admin or hod. This requires linking
-- Supabase Auth users to the `users` table via an `auth_user_id` column
-- (add this column when wiring up the admin app in Phase 2).
create policy "admins read roster"
on public.users
for select
to authenticated
using (
  exists (
    select 1 from public.users u
    where u.auth_user_id = auth.uid()
      and u.role in ('super_admin','hod')
      and u.status = 'active'
  )
);

-- No insert/update/delete for authenticated either — roster changes go through
-- an Edge Function (using service_role) that can enforce additional checks
-- (e.g. only super_admin can create another super_admin) that RLS alone can't
-- express cleanly.
```

## 6. `screens` heartbeat — read is public, writes are function-only

Screens report `last_seen_at` via a small authenticated Edge Function endpoint (not a direct table write from the browser), so no `update` policy is granted to `anon` — the heartbeat function uses `service_role` internally.

## 7. `audit_log` — admins only, nobody writes directly

```sql
create policy "admins read audit log"
on public.audit_log
for select
to authenticated
using (
  exists (
    select 1 from public.users u
    where u.auth_user_id = auth.uid()
      and u.role in ('super_admin','hod')
      and u.status = 'active'
  )
);

-- No write policy for anyone but service_role. Every audit entry is written
-- by the Edge Function that performed the action being logged — never by
-- a client, or the log itself becomes untrustworthy.
```

## 8. Storage bucket — `notice-media`

```sql
-- Create the bucket (via SQL or dashboard), then:

-- Public read — signage needs to display images/PDFs without an auth dance.
create policy "public read notice media"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'notice-media');

-- No insert/update/delete policy for anon or authenticated.
-- Uploads happen only inside the ingestion Edge Function using service_role,
-- after the file has already been validated (size, MIME type) server-side.
```

**Validation happens before storage, not as a storage rule.** Postgres/Storage policies can't meaningfully inspect file *content* — MIME-type and size checks belong in the Edge Function (reject oversized or wrong-type uploads before they ever reach `notice-media`), not in RLS.

## 9. What this buys us, in one sentence
A faculty member's phone number can get a notice onto a screen — but nothing with only the `anon` key (which is public, ships in every client bundle by design) can ever write a notice, alter the roster, read another user's data, or tamper with the audit trail; only the server-side ingestion function, holding a secret never exposed to any client, can do those things.

## 10. Testing these rules
Before Phase 2 ships, write a short RLS test suite (Supabase supports `pgTAP` or simple scripted assertions): attempt each denied operation as `anon` and confirm it fails, attempt each granted operation and confirm it succeeds. RLS bugs are invisible until someone finds them the hard way — test them like any other security boundary, not by manual spot-checking in the dashboard.
