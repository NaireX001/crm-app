export default function Home() {
  const supabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-3xl font-bold">CRM Platform</h1>
      <p className="text-gray-600">Project scaffold is running.</p>
      <p
        className={`rounded-full px-4 py-1 text-sm font-medium ${
          supabaseConfigured
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
        }`}
      >
        Supabase env vars: {supabaseConfigured ? "detected" : "missing"}
      </p>
    </main>
  );
}
