import { MapPin, Check, CheckCheck } from "lucide-react";

export default function MessageBubble({ message, isMine }) {
  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
          isMine
            ? "bg-forest text-white rounded-br-md"
            : "bg-soft dark:bg-white/10 text-charcoal dark:text-white rounded-bl-md"
        }`}
      >
        {message.content && (
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        )}

        {message.image_url && (
          <img
            src={message.image_url}
            alt="Shared"
            className="rounded-xl mt-1.5 max-w-full max-h-56 object-cover"
          />
        )}

        {message.shared_lat != null && message.shared_lng != null && (
          <div
            className={`flex items-center gap-2 mt-1.5 text-xs rounded-lg px-2.5 py-2 ${
              isMine ? "bg-white/15" : "bg-white dark:bg-white/10"
            }`}
          >
            <MapPin size={13} className="shrink-0" />
            Shared location · {message.shared_lat.toFixed(3)}, {message.shared_lng.toFixed(3)}
          </div>
        )}

        <div
          className={`flex items-center gap-1 mt-1 text-[10px] ${
            isMine ? "text-white/60 justify-end" : "text-charcoal/40 dark:text-white/40"
          }`}
        >
          {new Date(message.created_at).toLocaleTimeString("en-KE", {
            hour: "2-digit",
            minute: "2-digit",
          })}
          {isMine && (message.is_read ? <CheckCheck size={12} /> : <Check size={12} />)}
        </div>
      </div>
    </div>
  );
}
