import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";

export async function AppShell({
  children,
  active,
}: {
  children: React.ReactNode;
  active: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profile = user
    ? (
        await supabase.from("profiles").select("*").eq("id", user.id).single()
      ).data
    : null;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar active={active} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar email={user?.email ?? ""} role={profile?.role ?? null} />
        <main className="flex-1 overflow-y-auto px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
