import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Standard server client — respects RLS as the logged-in user.
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // called from a Server Component; middleware refreshes sessions
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // called from a Server Component; middleware refreshes sessions
          }
        },
      },
    }
  );
}

// Service-role client — bypasses RLS. NEVER import this in client components.
// Only use inside API routes / server actions for trusted server-side writes
// (e.g. sending the admin notification email, or admin-only mutations that
// have already been authorized by checking the caller's role).
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function createServiceRoleClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
