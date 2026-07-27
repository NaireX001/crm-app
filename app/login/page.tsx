import Link from "next/link";
import { signIn } from "@/lib/auth/actions";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/layout/Container";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; message?: string };
}) {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <Container className="max-w-sm">
        <h1 className="mb-6 text-2xl font-bold">Log in</h1>

        {searchParams.message && (
          <p className="mb-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
            {searchParams.message}
          </p>
        )}
        {searchParams.error && (
          <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {searchParams.error}
          </p>
        )}

        <form action={signIn} className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
            />
          </div>
          <Button type="submit">Log in</Button>
        </form>

        <p className="mt-4 text-sm text-gray-600">
          No account?{" "}
          <Link href="/signup" className="font-medium text-gray-900 underline">
            Sign up
          </Link>
        </p>
      </Container>
    </main>
  );
}
