"use client";

import { useActionState } from "react";

// Wraps a server action so failures are shown and double submits are blocked.
export default function IncidentActionForm({ action, incidentId, submitLabel, confirmMessage, children }) {
  const [result, submitAction, isPending] = useActionState(action, null);

  function confirmBeforeSubmit(event) {
    if (!window.confirm(confirmMessage)) event.preventDefault();
  }

  return (
    <form action={submitAction} onSubmit={confirmBeforeSubmit} className="space-y-3">
      <input type="hidden" name="incidentId" value={incidentId} />
      {children}
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-primary-container px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-secondary disabled:opacity-50"
      >
        {isPending ? "Saving..." : submitLabel}
      </button>
      {result && !result.ok && <p className="text-sm font-medium text-error">{result.message}</p>}
      {result?.ok && <p className="text-sm font-medium text-secondary">Saved.</p>}
    </form>
  );
}
