# Threadly

A clothing order-fulfillment web app for a single retailer/mediator (you). You
maintain a catalog, customers place orders, you buy and hand-deliver the items,
and you get notified the instant an order comes in — live on an admin dashboard
and by email.

**Stack:** Next.js 14 (App Router, TypeScript) · Supabase (Postgres + Auth +
Realtime + Storage) · Tailwind CSS · Resend (email) · Vercel (hosting)

---

## 1. Prerequisites

- [Node.js 18+](https://nodejs.org) installed
- A free [Supabase](https://supabase.com) account
- A free [Resend](https://resend.com) account (for order emails)
- A [GitHub](https://github.com) account
- A [Vercel](https://vercel.com) account (for deployment)

---

## 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) → **New project**. Pick any
   name/region, set a database password, and wait for it to finish
   provisioning (~2 minutes).
2. In the left sidebar, open **SQL Editor** → **New query**.
3. Open `supabase/schema.sql` from this project, copy its entire contents,
   paste into the SQL editor, and click **Run**.
   This creates all tables, Row Level Security policies, triggers, the
   realtime publication, and a public `product-images` storage bucket.
4. Go to **Authentication → Providers** and confirm **Email** is enabled
   (it is by default).
   - Optional for local testing: **Authentication → Settings** → turn off
     "Confirm email" so you can sign up and log in immediately without
     clicking an email link.
5. Go to **Settings → API** and copy three values, you'll need them next:
   - **Project URL**
   - **anon public** key
   - **service_role** key (keep this secret — never put it in client code)

---

## 3. Set up Resend (order notification emails)

1. Sign up at [resend.com](https://resend.com).
2. Go to **API Keys** → create a new key → copy it.
3. For quick testing you can send from Resend's shared test domain
   (`onboarding@resend.dev`, already set as the default `from:` address in
   `app/api/orders/route.ts`) to your own verified email address.
4. For production, go to **Domains** → add and verify your own sending
   domain, then update the `from:` address in
   `app/api/orders/route.ts` to use it.

---

## 4. Run the project locally

```bash
# Install dependencies
npm install

# Copy the env template and fill in your real values
cp .env.local.example .env.local
```

Edit `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
RESEND_API_KEY=your-resend-key
ADMIN_EMAIL=your-email@example.com
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Then start the dev server:

```bash
npm run dev
```

Visit **http://localhost:3000**.

---

## 5. Make yourself an admin

1. On the running site, sign up for an account normally
   (this auto-creates a `profiles` row via a database trigger, with
   `role = 'customer'`).
2. In Supabase → **SQL Editor**, run:

   ```sql
   update profiles set role = 'admin' where email = 'you@example.com';
   ```

3. Log out and back in (or just refresh) — you'll now see an **Admin** link
   in the nav, and `/admin` will be accessible.

---

## 6. Add products

Simplest option — **Supabase Table Editor**:

1. Go to **Table Editor → products** → **Insert row**.
2. Fill in `name`, `description`, `price`, `stock`, `category`.
3. For `sizes`, use a Postgres array literal, e.g. `{S,M,L,XL}`.
4. For `image_url`, paste any hosted image URL, or upload an image to
   **Storage → product-images** (it's a public bucket) and paste its public
   URL.
5. Leave `is_active` as `true`.

Or use the built-in admin UI at **`/admin/products`** once you're an admin —
it supports add, edit, and deactivate, including pasting an image URL.

---

## 7. Test the full order loop

1. Open an incognito window (or a different browser) and sign up as a second,
   non-admin account.
2. Browse the catalog, open a product, pick a size/quantity, enter a delivery
   address and phone, and place the order.
3. Back in your admin window at `/admin`, the order should appear **instantly**
   with no refresh (Supabase Realtime).
4. Check your `ADMIN_EMAIL` inbox — you should have a "New order" email with
   the full order details.
5. On `/admin`, change the order's status via the dropdown. Switch to the
   customer's `/orders` page and confirm the new status shows up.

---

## 8. Push to GitHub

From the project root:

```bash
git init
git add .
git commit -m "Initial commit: Threadly app"
```

Create a new empty repository on GitHub (no README/license, so it stays
empty): go to **github.com → New repository**, name it `threadly`, keep it
empty, and click **Create repository**. Then:

```bash
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/threadly.git
git push -u origin main
```

`.env.local` is already in `.gitignore`, so your real secrets never get
committed — only `.env.local.example` (with placeholder values) is pushed.

---

## 9. Deploy to Vercel

**Option A — Vercel dashboard (easiest):**

1. Go to [vercel.com/new](https://vercel.com/new) and import the GitHub repo
   you just pushed.
2. In **Environment Variables**, add all six values from your `.env.local`
   (same names, real values).
3. Set `NEXT_PUBLIC_SITE_URL` to your upcoming Vercel URL, e.g.
   `https://threadly-yourname.vercel.app` (you can update this after the
   first deploy once you know the exact URL, then redeploy).
4. Click **Deploy**.

**Option B — Vercel CLI:**

```bash
npm install -g vercel
vercel login
vercel
# follow the prompts, then add env vars:
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add RESEND_API_KEY
vercel env add ADMIN_EMAIL
vercel env add NEXT_PUBLIC_SITE_URL
vercel --prod
```

After the first deploy, copy your live URL, update `NEXT_PUBLIC_SITE_URL` in
Vercel's project settings to match it exactly, and redeploy
(`vercel --prod` again, or click **Redeploy** in the dashboard) so links in
order emails point to the right place.

---

## Project structure

```
app/
  page.tsx                    # Catalog (product grid)
  products/[id]/page.tsx      # Product detail + order form
  products/[id]/OrderForm.tsx
  login/page.tsx
  signup/page.tsx
  orders/page.tsx             # Customer "My Orders"
  orders/[id]/page.tsx        # Order confirmation / detail
  admin/page.tsx              # Admin dashboard (realtime orders)
  admin/AdminOrdersBoard.tsx
  admin/products/page.tsx     # Admin product management
  admin/products/ProductsBoard.tsx
  api/orders/route.ts         # Order creation API (server-side email + stock)
lib/
  supabase/client.ts          # Browser Supabase client
  supabase/server.ts          # Server + service-role Supabase clients
  status.ts                   # Order status constants/labels
components/
  Nav.tsx, ProductCard.tsx, StatusBadge.tsx, SignOutButton.tsx
middleware.ts                 # Session refresh + /admin and /orders route guards
supabase/schema.sql           # Full DB schema, RLS policies, triggers, realtime
```

## Security notes

- Row Level Security is enabled on every table. Customers can only read their
  own `profiles`/`orders`/`order_items`; only `role = 'admin'` can write
  `products` or update order status.
- Order inserts are scoped to `customer_id = auth.uid()` at the database
  level — this can't be bypassed from the client even if the request is
  tampered with.
- The Supabase **service role key** (which bypasses RLS) is only ever used in
  `app/api/orders/route.ts`, server-side, to decrement stock after a
  validated order — it is never sent to the browser.
- The admin notification email is sent from inside the same server-side API
  route that creates the order, so it always fires and can't be skipped or
  spoofed from client code.

## v2 ideas (not built)

- Drag-and-drop image upload from the admin dashboard straight to Supabase
  Storage (currently: paste an image URL)
- SMS notifications via Twilio alongside email
- A customer-facing order cancellation window
