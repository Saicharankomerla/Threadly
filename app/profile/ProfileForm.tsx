"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
};

export default function ProfileForm({ profile }: { profile: Profile }) {
  const supabase = createClient();
  const router = useRouter();

  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName || null, phone: phone || null })
      .eq("id", profile.id);

    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <label className="label">Full name</label>
        <input
          type="text"
          className="input"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Your name"
        />
      </div>

      <div>
        <label className="label">Phone number</label>
        <input
          type="tel"
          className="input"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="For delivery contact"
        />
      </div>

      <div>
        <label className="label">Email</label>
        <input
          type="email"
          className="input bg-line/30 text-ink/60"
          value={profile.email}
          disabled
        />
        <p className="mt-1 text-xs text-ink/50">
          Email can't be changed here.
        </p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {saved && <p className="text-sm text-thread">Saved.</p>}

      <button type="submit" disabled={saving} className="btn-primary">
        {saving ? "Saving…" : "Update"}
      </button>
    </form>
  );
}