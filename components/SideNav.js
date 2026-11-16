"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "@/components/Icon";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: "dashboard" },
  { href: "/incidents", label: "Incidents", icon: "local_fire_department" },
];

export default function SideNav() {
  const pathname = usePathname();

  function isActive(href) {
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  }

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-primary px-4 py-6 text-white">
      <div className="flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-primary-container text-secondary-fixed">
          <Icon name="satellite_alt" className="!text-2xl" />
        </div>
        <div>
          <div className="font-display text-lg font-bold leading-tight">GeoWatch Stubble</div>
          <div className="text-xs text-primary-fixed-dim">Punjab &amp; Haryana</div>
        </div>
      </div>
      <nav className="mt-8 space-y-1">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={
              isActive(item.href)
                ? "flex items-center gap-3 rounded-lg border-l-4 border-secondary-fixed bg-primary-container px-4 py-3 font-semibold text-white"
                : "flex items-center gap-3 rounded-lg px-4 py-3 text-primary-fixed-dim transition-colors hover:bg-primary-container/40 hover:text-white"
            }
          >
            <Icon name={item.icon} className={isActive(item.href) ? "text-secondary-fixed" : ""} />
            {item.label}
          </Link>
        ))}
      </nav>
      <p className="mt-auto px-2 text-xs leading-relaxed text-primary-fixed-dim/80">
        Satellite detections are suspected hotspots until verified by a person.
      </p>
    </aside>
  );
}
