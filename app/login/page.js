import { redirect } from "next/navigation";
import Icon from "@/components/Icon";
import LoginForm from "@/components/LoginForm";
import { listDistrictNamesByState } from "@/lib/districts";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sign in - GeoWatch Stubble" };

const HIGHLIGHTS = [
  {
    icon: "sensors",
    title: "Satellite detections",
    text: "Near-real-time VIIRS thermal detections from NASA FIRMS, matched to their district.",
  },
  {
    icon: "alt_route",
    title: "Automatic assignment",
    text: "Every detection is assigned to the officer of the district it falls in.",
  },
];

export default async function LoginPage() {
  if (await getSession()) redirect("/");
  const districtsByState = await listDistrictNamesByState();

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="flex w-full shrink-0 flex-col justify-between bg-primary p-8 text-white md:w-[46%] lg:p-12">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-primary-container text-secondary-fixed">
            <Icon name="satellite_alt" className="!text-2xl" />
          </div>
          <div>
            <div className="font-display text-lg font-bold">GeoWatch Stubble</div>
            <div className="text-xs text-primary-fixed-dim">Punjab &amp; Haryana</div>
          </div>
        </div>

        <div className="my-10">
          <h1 className="font-display text-4xl font-extrabold tracking-tight">GeoWatch Stubble</h1>
          <p className="mb-8 mt-4 max-w-lg text-primary-fixed-dim">
            Satellite-based stubble burning detection for Punjab and Haryana
          </p>
          <div className="max-w-md space-y-3.5">
            {HIGHLIGHTS.map((highlight) => (
              <div key={highlight.title} className="flex items-start gap-3 rounded-xl border border-white/10 bg-primary-container/40 p-3.5">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-primary-container text-secondary-fixed">
                  <Icon name={highlight.icon} className="!text-lg" />
                </div>
                <div>
                  <div className="text-sm font-semibold">{highlight.title}</div>
                  <div className="text-xs text-primary-fixed-dim">{highlight.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="flex items-center gap-2 border-t border-white/10 pt-6 text-xs text-primary-fixed-dim">
          <Icon name="shield" className="!text-base text-secondary-fixed" />
          Suspected detections are verified by district officers.
        </p>
      </aside>

      <main className="flex flex-1 flex-col items-center justify-center bg-surface px-6 py-12">
        <div className="w-full max-w-md rounded-xl border border-outline-variant/60 bg-surface-lowest p-8 shadow-sm lg:p-10">
          <h2 className="font-display text-2xl font-bold tracking-tight">Sign in</h2>
          <p className="mb-7 mt-1 text-sm text-on-surface-variant">Access the district surveillance console</p>
          <LoginForm districtsByState={districtsByState} />
          <div className="mt-8 border-t border-outline-variant/40 pt-6 text-center text-xs font-medium uppercase tracking-wider text-outline">
            College project demo
          </div>
        </div>
      </main>
    </div>
  );
}
