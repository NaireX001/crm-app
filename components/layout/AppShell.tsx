import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/auth/actions";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/layout/Container";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/contacts", label: "Contacts" },
  { href: "/companies", label: "Companies" },
  { href: "/deals", label: "Deals" },
  { href: "/tasks", label: "Tasks" },
];

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
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <Container className="flex flex-wrap items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-6">
            <span className="font-semibold">CRM</span>
            <nav className="flex items-center gap-4 text-sm">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-gray-600 hover:text-gray-900",
                    active === item.href && "font-semibold text-gray-900"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-600">
              {user?.email}
              {profile?.role ? ` · ${profile.role}` : ""}
            </span>
            <form action={signOut}>
              <Button type="submit" variant="secondary">
                Sign out
              </Button>
            </form>
          </div>
        </Container>
      </header>
      <Container className="py-8">{children}</Container>
    </div>
  );
}
