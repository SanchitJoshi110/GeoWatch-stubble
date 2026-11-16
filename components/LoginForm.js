"use client";

import { useActionState, useState } from "react";
import Icon from "@/components/Icon";
import { loginAction } from "@/lib/authActions";

const fieldClass =
  "h-11 w-full appearance-none rounded-lg border border-outline-variant bg-white pl-3.5 pr-10 text-sm focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20";
const labelClass = "mb-1.5 block text-sm font-semibold";

export default function LoginForm({ districtsByState }) {
  const states = Object.keys(districtsByState);
  const [selectedState, setSelectedState] = useState(states[0]);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [result, submitAction, isPending] = useActionState(loginAction, null);

  return (
    <form action={submitAction} className="space-y-5">
      {result?.message && (
        <div role="alert" className="flex items-start gap-3 rounded-lg border border-error/20 bg-[#ffdad6]/40 p-3.5">
          <Icon name="error_outline" className="text-error" />
          <div>
            <p className="text-sm font-semibold text-error">Sign in failed</p>
            <p className="text-xs text-on-surface-variant">{result.message}</p>
          </div>
        </div>
      )}

      <div>
        <label htmlFor="state" className={labelClass}>Select State</label>
        <div className="relative">
          <select id="state" name="state" value={selectedState} onChange={(event) => setSelectedState(event.target.value)} className={fieldClass}>
            {states.map((state) => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
          <Icon name="expand_more" className="pointer-events-none absolute right-3 top-3 text-outline" />
        </div>
      </div>

      <div>
        <label htmlFor="districtId" className={labelClass}>District Officer</label>
        <div className="relative">
          {/* key resets the choice to State Admin whenever the state changes */}
          <select key={selectedState} id="districtId" name="districtId" defaultValue="" className={fieldClass}>
            <option value="">State Admin (no district)</option>
            {districtsByState[selectedState].map((district) => (
              <option key={district.id} value={district.id}>{district.name}</option>
            ))}
          </select>
          <Icon name="expand_more" className="pointer-events-none absolute right-3 top-3 text-outline" />
        </div>
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-on-surface-variant">
          <Icon name="info" className="!text-sm text-outline" />
          Leave as State Admin to view all districts of the state
        </p>
      </div>

      <div>
        <label htmlFor="password" className={labelClass}>Password</label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={isPasswordVisible ? "text" : "password"}
            required
            autoComplete="current-password"
            placeholder="Enter password"
            className="h-11 w-full rounded-lg border border-outline-variant bg-white pl-3.5 pr-11 text-sm focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
          />
          <button
            type="button"
            aria-label={isPasswordVisible ? "Hide password" : "Show password"}
            onClick={() => setIsPasswordVisible((isVisible) => !isVisible)}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-outline hover:text-on-surface"
          >
            <Icon name={isPasswordVisible ? "visibility_off" : "visibility"} />
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary-container text-sm font-semibold text-white shadow-sm transition-colors hover:bg-secondary disabled:opacity-60"
      >
        {isPending ? "Signing in..." : "Sign in"}
        {!isPending && <Icon name="arrow_forward" className="!text-lg" />}
      </button>
    </form>
  );
}
