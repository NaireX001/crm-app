import { MessagesSquare, Send, Mail } from "lucide-react";

/**
 * Visual-only placeholder for a future messaging integration (SMS/email
 * conversation thread). No backend — needs a provider like Twilio and/or
 * Resend/SendGrid before this can send or receive anything real.
 */
export function ConversationsPlaceholder() {
  return (
    <div className="flex h-full min-h-[420px] flex-col rounded-md border border-gray-200 bg-white">
      <div className="border-b border-gray-100 px-4 py-3">
        <h2 className="font-semibold text-gray-900">Conversations</h2>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        <MessagesSquare size={40} className="text-gray-200" />
        <p className="font-medium text-gray-600">Start a new conversation</p>
        <p className="max-w-xs text-sm text-gray-400">
          Coming soon — connect an email or SMS provider to message this
          contact directly from the CRM.
        </p>
      </div>
      <div className="flex items-center gap-2 border-t border-gray-100 p-3">
        <button
          type="button"
          disabled
          className="rounded-md border border-gray-200 p-2 text-gray-300"
          title="Choose channel — coming soon"
        >
          <Mail size={16} />
        </button>
        <input
          type="text"
          disabled
          placeholder="Type a message…"
          title="Messaging — coming soon"
          className="flex-1 cursor-not-allowed rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-400"
        />
        <button
          type="button"
          disabled
          className="rounded-md bg-gray-100 p-2 text-gray-300"
          title="Messaging — coming soon"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
