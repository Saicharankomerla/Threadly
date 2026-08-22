import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProfileForm from "./ProfileForm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/profile");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, phone")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl mb-6">Profile</h1>
      <ProfileForm profile={profile} />

      <div className="mt-10 border-t border-line pt-6">
        <Link
          href="/orders"
          className="text-xs uppercase tracking-widest text-ink/60 hover:text-ink"
        >
          View my orders →
        </Link>
      </div>
    </div>
  );
}