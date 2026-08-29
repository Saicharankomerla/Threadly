"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  gender: string | null;
  date_of_birth: string | null;
};

export default function ProfileForm({ profile }: { profile: Profile }) {
  const supabase = createClient();
  const router = useRouter();

  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [gender, setGender] = useState(profile.gender ?? "");
  const [dateOfBirth, setDateOfBirth] = useState(profile.date_of_birth ?? "");
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
      .update({
        full_name: fullName || null,
        phone: phone || null,
        gender: gender || null,
        date_of_birth: dateOfBirth || null,
      })
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
        <label className="label">Gender</label>
        <select
          className="input"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
        >
          <option value="">Prefer not to say</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label className="label">Date of birth</label>
        <input
          type="date"
          className="input"
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
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