"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const supabase = createClient();
  const router = useRouter();

  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Clicking the emailed link signs the user into a temporary "recovery"
    // session. Supabase fires this event once that session is ready, which
    // is when it's actually safe to show the form.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });

    // In case the event already fired before this component mounted.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setDone(true);
    setTimeout(() => router.push("/login"), 2000);
  }

  if (done) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <h1 className="font-display text-2xl mb-3">Password updated</h1>
        <p className="text-ink/60">Redirecting you to log in…</p>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <p className="text-ink/60">
          Checking your reset link… If this doesn't load, the link may have
          expired — request a new one from the forgot password page.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="font-display text-2xl mb-6">Set a new password</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">New password</label>
          <input
            type="password"
            required
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div>
          <label className="label">Confirm new password</label>
          <input
            type="password"
            required
            className="input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Saving…" : "Update password"}
        </button>
      </form>
    </div>
  );
}
