import SideNav from "@/components/SideNav";
import TopBar from "@/components/TopBar";
import { hasSampleData } from "@/lib/incidents";
import { requireSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }) {
  const session = await requireSession();
  const isSampleData = await hasSampleData();

  return (
    <>
      <SideNav />
      <div className="ml-64 min-h-screen">
        <TopBar userName={session.name} state={session.state} isSampleData={isSampleData} />
        <main className="mx-auto max-w-[1400px] space-y-6 p-8">{children}</main>
      </div>
    </>
  );
}
