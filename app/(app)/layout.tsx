import { requireSession } from "@/lib/auth/get-current-org";
import { SidebarNav } from "./_components/app-nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  const userLabel = session.fullName ?? session.email;

  return (
    <div className="flex min-h-dvh">
      <SidebarNav orgName={session.organizationName || "Organisation"} userLabel={userLabel} />
      <div className="min-w-0 flex-1">
        <main className="mx-auto max-w-5xl px-5 py-8 sm:px-8 lg:py-12">{children}</main>
      </div>
    </div>
  );
}
