import { Loader2, MessageSquareOff } from "lucide-react";

export default function ConversationList({ conversations, loading, activePartnerId, onSelect, onlineUserIds }) {
  return (
    <div className="h-full flex flex-col">
      <div className="p-5 border-b border-charcoal/10 dark:border-white/10">
        <h2 className="font-semibold text-charcoal dark:text-white">Messages</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex items-center gap-2 text-charcoal/40 dark:text-white/40 text-sm p-5">
            <Loader2 size={15} className="animate-spin" /> Loading...
          </div>
        )}

        {!loading && conversations.length === 0 && (
          <div className="flex flex-col items-center text-center p-8 text-charcoal/40 dark:text-white/40">
            <MessageSquareOff size={26} className="mb-2" />
            <p className="text-sm">No conversations yet.</p>
          </div>
        )}

        {conversations.map((c) => (
          <button
            key={c.partner.id}
            onClick={() => onSelect(c.partner)}
            className={`w-full flex items-center gap-3 px-5 py-3.5 text-left border-b border-charcoal/5 dark:border-white/5 transition-colors ${
              activePartnerId === c.partner.id
                ? "bg-forest/5 dark:bg-white/5"
                : "hover:bg-soft dark:hover:bg-white/5"
            }`}
          >
            <div className="relative shrink-0">
              <div className="w-11 h-11 rounded-full bg-forest text-white grid place-items-center font-semibold text-sm">
                {(c.partner.full_name || "?")
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </div>
              {onlineUserIds?.has(c.partner.id) && (
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-forest-light border-2 border-white dark:border-[#1c262b]" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-charcoal dark:text-white truncate">
                  {c.partner.full_name}
                </p>
                {c.unread_count > 0 && (
                  <span className="text-[10px] font-bold bg-forest text-white rounded-full w-5 h-5 grid place-items-center shrink-0">
                    {c.unread_count}
                  </span>
                )}
              </div>
              <p className="text-xs text-charcoal/50 dark:text-white/40 truncate">
                {c.last_message.content || (c.last_message.image_url ? "📷 Image" : "📍 Location")}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
