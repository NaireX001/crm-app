import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/Button";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-3xl font-bold">CRM Platform</h1>

      {user ? (
        <>
          <p className="text-gray-600">Signed in as {user.email}</p>
          <Link href="/dashboard">
            <Button>Go to dashboard</Button>
          </Link>
        </>
      ) : (
        <>
          <p className="text-gray-600">Sign in to get started.</p>
          <div className="flex gap-3">
            <Link href="/login">
              <Button>Log in</Button>
            </Link>
            <Link href="/signup">
              <Button variant="secondary">Sign up</Button>
            </Link>
          </div>
        </>
      )}
    </main>
  );
}
