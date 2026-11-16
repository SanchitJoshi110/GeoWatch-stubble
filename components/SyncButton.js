"use client";

import { useActionState } from "react";
import Icon from "@/components/Icon";

export default function SyncButton({ action }) {
  const [result, submitAction, isPending] = useActionState(action, null);

  return (
    <form action={submitAction} className="flex items-center gap-3">
      {result && !result.ok && <span className="text-sm font-medium text-error">{result.message}</span>}
      {result?.ok && (
        <span className="text-sm font-medium text-secondary">
          {result.addedCount === 0 ? "Already up to date." : `${result.addedCount} new detections added.`}
        </span>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="flex h-10 items-center gap-1.5 rounded-md border border-outline-variant bg-white px-4 text-sm font-semibold text-primary shadow-sm hover:bg-surface disabled:opacity-50"
      >
        <Icon name="sync" className={`!text-base ${isPending ? "animate-spin" : ""}`} />
        {isPending ? "Fetching..." : "Sync satellite data"}
      </button>
    </form>
  );
}
