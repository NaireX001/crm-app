export function EmptyState({ text }: { text: string }) {
  return (
    <p className="rounded-md border border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-500">
      {text}
    </p>
  );
}
