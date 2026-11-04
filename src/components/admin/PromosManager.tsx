"use client";

import { useState } from "react";
import { apiError } from "@/store/apiError";
import {
  useCreatePromoMutation,
  useDeletePromoMutation,
  useGetPromosQuery,
  useUpdatePromoMutation,
  type AdminPromo,
} from "@/store/adminApi";

const emptyForm = {
  code: "",
  owner: "",
  type: "percent" as "percent" | "fixed",
  value: "",
  minOrder: "",
  maxUses: "",
  oncePerCustomer: false,
  expiresAt: "",
  active: true,
};

function formatPrice(value: number) {
  return `Rs. ${Math.round(value).toLocaleString("en-PK")}`;
}

// Expiry is saved as the end of that day in Pakistan (UTC+5); show that same day back.
function expiryDay(expiresAt: string | null) {
  if (!expiresAt) return "";
  return new Date(new Date(expiresAt).getTime() + 5 * 3600 * 1000).toISOString().slice(0, 10);
}

function status(promo: AdminPromo) {
  if (!promo.active) return { label: "Off", tone: "bg-gray-100 text-gray-600" };
  if (promo.expiresAt && new Date(promo.expiresAt).getTime() < Date.now()) return { label: "Expired", tone: "bg-red-100 text-red-700" };
  if (promo.maxUses && promo.uses >= promo.maxUses) return { label: "Used up", tone: "bg-amber-100 text-amber-800" };
  return { label: "Active", tone: "bg-green-100 text-green-800" };
}

function offText(promo: Pick<AdminPromo, "type" | "value">) {
  return promo.type === "percent" ? `${promo.value}% off` : `${formatPrice(promo.value)} off`;
}

export function PromosManager() {
  const { data: promos = [], isLoading, error } = useGetPromosQuery();
  const [createPromo, { isLoading: creating }] = useCreatePromoMutation();
  const [updatePromo, { isLoading: updating }] = useUpdatePromoMutation();
  const [deletePromo] = useDeletePromoMutation();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminPromo | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [copied, setCopied] = useState("");

  function startCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormError("");
    setOpen(true);
  }

  function startEdit(promo: AdminPromo) {
    setEditing(promo);
    setForm({
      code: promo.code,
      owner: promo.owner,
      type: promo.type,
      value: String(promo.value),
      minOrder: promo.minOrder ? String(promo.minOrder) : "",
      maxUses: promo.maxUses ? String(promo.maxUses) : "",
      oncePerCustomer: promo.oncePerCustomer,
      expiresAt: expiryDay(promo.expiresAt),
      active: promo.active,
    });
    setFormError("");
    setOpen(true);
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setFormError("");
    const body = {
      owner: form.owner,
      type: form.type,
      value: Number(form.value),
      minOrder: Number(form.minOrder) || 0,
      maxUses: Number(form.maxUses) || null,
      oncePerCustomer: form.oncePerCustomer,
      expiresAt: form.expiresAt,
      active: form.active,
    };
    try {
      if (editing) {
        await updatePromo({ code: editing.code, body }).unwrap();
      } else {
        await createPromo({ ...body, code: form.code }).unwrap();
      }
      setOpen(false);
    } catch (err) {
      setFormError(apiError(err, "Could not save the promo code."));
    }
  }

  async function copy(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      // Clipboard can be blocked; the code is on screen anyway.
    }
  }

  const totals = promos.reduce(
    (sum, promo) => ({
      active: sum.active + (status(promo).label === "Active" ? 1 : 0),
      uses: sum.uses + promo.uses,
      sales: sum.sales + promo.sales,
      discount: sum.discount + promo.discountGiven,
    }),
    { active: 0, uses: 0, sales: 0, discount: 0 }
  );

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Promo Codes</h1>
          <p className="mt-1 text-sm text-gray-500">Make a code for a person, share it, and see how many orders it brings.</p>
        </div>
        <button type="button" onClick={startCreate} className="shrink-0 px-4 py-2.5 rounded-lg bg-[var(--accent)] text-white text-sm font-semibold hover:bg-[var(--accent-hover)]">
          Add promo code
        </button>
      </div>

      {error ? <p className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{apiError(error, "Could not load promo codes.")}</p> : null}

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Active codes" value={String(totals.active)} />
        <Stat label="Orders with a code" value={String(totals.uses)} />
        <Stat label="Sales from codes" value={formatPrice(totals.sales)} />
        <Stat label="Discount given" value={formatPrice(totals.discount)} />
      </div>

      <div className="space-y-3">
        {isLoading ? <p className="text-sm text-gray-500">Loading promo codes…</p> : null}
        {!isLoading && !error && promos.length === 0 ? (
          <p className="rounded-2xl border border-gray-200 bg-white p-8 text-sm text-gray-500">No promo codes yet. Add one for an influencer or a customer.</p>
        ) : null}
        {promos.map((promo) => {
          const state = status(promo);
          const rules = [
            promo.minOrder ? `Orders over ${formatPrice(promo.minOrder)}` : "",
            promo.maxUses ? `${promo.uses} / ${promo.maxUses} uses` : "No use limit",
            promo.oncePerCustomer ? "Once per customer" : "",
            promo.expiresAt ? `Until ${new Date(promo.expiresAt).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}` : "No expiry",
          ].filter(Boolean);
          return (
            <article key={promo.code} className="rounded-2xl border border-gray-200 bg-white p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => copy(promo.code)}
                      title="Copy code"
                      className="rounded-lg border border-dashed border-[var(--accent)]/40 bg-[var(--sage-tint)] px-3 py-1 font-mono text-sm font-bold tracking-wider text-[var(--accent)]"
                    >
                      {copied === promo.code ? "Copied" : promo.code}
                    </button>
                    <span className="text-sm font-semibold text-gray-900">{offText(promo)}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${state.tone}`}>{state.label}</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-700">{promo.owner ? <>For <span className="font-medium">{promo.owner}</span></> : <span className="text-gray-400">No name added</span>}</p>
                  <p className="mt-1 text-xs text-gray-500">{rules.join(" · ")}</p>
                </div>
                <div className="grid grid-cols-3 gap-4 text-right sm:w-80">
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-gray-400">Orders</p>
                    <p className="text-sm font-semibold text-gray-900">{promo.uses}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-gray-400">Sales</p>
                    <p className="text-sm font-semibold text-gray-900">{formatPrice(promo.sales)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-gray-400">Discount</p>
                    <p className="text-sm font-semibold text-gray-900">{formatPrice(promo.discountGiven)}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => updatePromo({ code: promo.code, body: { active: !promo.active } })}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium"
                >
                  {promo.active ? "Turn off" : "Turn on"}
                </button>
                <button type="button" onClick={() => startEdit(promo)} className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium">
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Delete ${promo.code}? Past orders keep the code.`)) deletePromo(promo.code);
                  }}
                  className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-700"
                >
                  Delete
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {open ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={save} className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900">{editing ? `Edit ${editing.code}` : "Add promo code"}</h2>

            {!editing ? (
              <label className="mt-4 block text-sm font-medium text-gray-700">
                Code
                <input
                  value={form.code}
                  onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, "") })}
                  maxLength={20}
                  required
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2.5 font-mono text-sm uppercase tracking-wider"
                />
                <span className="mt-1 block text-xs font-normal text-gray-500">Letters and numbers, e.g. ALI10. Customers type this at checkout.</span>
              </label>
            ) : null}

            <label className="mt-4 block text-sm font-medium text-gray-700">
              For (name)
              <input
                value={form.owner}
                onChange={(event) => setForm({ ...form, owner: event.target.value })}
                maxLength={80}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm"
              />
              <span className="mt-1 block text-xs font-normal text-gray-500">Who this code belongs to, e.g. an influencer or a customer.</span>
            </label>

            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700">Discount</p>
              <div className="mt-1 flex gap-2">
                <div className="inline-flex shrink-0 rounded-lg border border-gray-200 p-1">
                  {(["percent", "fixed"] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setForm({ ...form, type })}
                      className={`rounded-md px-3 py-1.5 text-sm font-medium ${form.type === type ? "bg-[var(--accent)] text-white" : "text-gray-600"}`}
                    >
                      {type === "percent" ? "%" : "Rs."}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min={1}
                  max={form.type === "percent" ? 90 : undefined}
                  required
                  value={form.value}
                  onChange={(event) => setForm({ ...form, value: event.target.value })}
                  className="min-w-0 flex-1 rounded-lg border border-gray-200 px-3 py-2.5 text-sm"
                />
              </div>
              <span className="mt-1 block text-xs text-gray-500">
                {form.type === "percent" ? "Percent off the products, e.g. 10 for 10% off." : "Rupees off the products, e.g. 500."} Delivery charges are not discounted.
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <label className="block text-sm font-medium text-gray-700">
                Minimum order (Rs.)
                <input
                  type="number"
                  min={0}
                  value={form.minOrder}
                  onChange={(event) => setForm({ ...form, minOrder: event.target.value })}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm"
                />
                <span className="mt-1 block text-xs font-normal text-gray-500">Empty = any order</span>
              </label>
              <label className="block text-sm font-medium text-gray-700">
                Total uses
                <input
                  type="number"
                  min={0}
                  value={form.maxUses}
                  onChange={(event) => setForm({ ...form, maxUses: event.target.value })}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm"
                />
                <span className="mt-1 block text-xs font-normal text-gray-500">Empty = no limit</span>
              </label>
            </div>

            <label className="mt-4 block text-sm font-medium text-gray-700">
              Expiry date
              <input
                type="date"
                value={form.expiresAt}
                onChange={(event) => setForm({ ...form, expiresAt: event.target.value })}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm"
              />
              <span className="mt-1 block text-xs font-normal text-gray-500">Works until the end of this day. Empty = never expires.</span>
            </label>

            <label className="mt-4 flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={form.oncePerCustomer} onChange={(event) => setForm({ ...form, oncePerCustomer: event.target.checked })} />
              One use per customer (same email or phone)
            </label>
            <label className="mt-2 flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={form.active} onChange={(event) => setForm({ ...form, active: event.target.checked })} />
              Code is on
            </label>

            {formError ? <p className="mt-3 text-sm text-red-700">{formError}</p> : null}
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium">
                Cancel
              </button>
              <button type="submit" disabled={creating || updating} className="rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
                {creating || updating ? "Saving…" : "Save code"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}
