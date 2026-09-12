"use client";

import { useState } from "react";

type Settings = {
  delivery_charge: number;
  platform_fee_enabled: boolean;
  platform_fee_amount: number;
};

export default function AdminSettingsBar({
  initialSettings,
}: {
  initialSettings: Settings;
}) {
  const [deliveryCharge, setDeliveryCharge] = useState(
    String(initialSettings.delivery_charge)
  );
  const [feeEnabled, setFeeEnabled] = useState(initialSettings.platform_fee_enabled);
  const [feeAmount, setFeeAmount] = useState(String(initialSettings.platform_fee_amount));
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          delivery_charge: Number(deliveryCharge),
          platform_fee_enabled: feeEnabled,
          platform_fee_amount: Number(feeAmount),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Could not save settings.");
        setSaving(false);
        return;
      }

      setSavedAt(Date.now());
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card p-4 mb-6 flex flex-wrap items-end gap-4">
      <div>
        <label className="label">Delivery charge (₹)</label>
        <input
          type="number"
          min="0"
          className="input w-32"
          value={deliveryCharge}
          onChange={(e) => setDeliveryCharge(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-2 pb-2.5">
        <button
          type="button"
          role="switch"
          aria-checked={feeEnabled}
          onClick={() => setFeeEnabled(!feeEnabled)}
          className={`relative h-6 w-11 rounded-full transition-colors ${
            feeEnabled ? "bg-thread" : "bg-line"
          }`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
              feeEnabled ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
        <span className="text-sm">Platform fee</span>
      </div>

      <div>
        <label className="label">Fee amount (₹)</label>
        <input
          type="number"
          min="0"
          className="input w-32"
          value={feeAmount}
          onChange={(e) => setFeeAmount(e.target.value)}
          disabled={!feeEnabled}
        />
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="btn-primary px-6"
      >
        {saving ? "Saving…" : "Save"}
      </button>

      {savedAt && !error && (
        <span className="text-sm text-green-700">Saved ✓</span>
      )}
      {error && <span className="text-sm text-red-600">{error}</span>}
    </div>
  );
}
