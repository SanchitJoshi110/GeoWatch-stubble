import Icon from "@/components/Icon";
import { logoutAction } from "@/lib/authActions";

export default function TopBar({ userName, state, isSampleData }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-outline-variant bg-surface-lowest px-8 shadow-sm">
      <span className="font-display text-base font-bold tracking-tight text-primary">Stubble Burning Monitor</span>
      <div className="flex items-center gap-4">
        {isSampleData && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#FCD34D] bg-[#FFFBEB] px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#B45309]">
            <Icon name="science" className="!text-sm" />
            Sample data
          </span>
        )}
        <div className="flex items-center gap-3 border-l border-outline-variant pl-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-container text-xs font-bold text-white">
            {userName[0]}
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold">{userName}</div>
            <div className="text-xs text-outline">{state}</div>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex h-9 items-center gap-1.5 rounded-md border border-outline-variant px-3 text-sm font-medium text-primary hover:bg-surface"
            >
              <Icon name="logout" className="!text-base" />
              Log out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
