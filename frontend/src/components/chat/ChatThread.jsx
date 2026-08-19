import { useState, useRef, useEffect } from "react";
import { Send, MapPin, Loader2, MessageCircle } from "lucide-react";
import MessageBubble from "./MessageBubble.jsx";
import ImageUploadButton from "../common/ImageUploadButton.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { getSocket } from "../../services/socket.js";

const TYPING_STOP_DELAY_MS = 2000;

export default function ChatThread({ partner, messages, loading, isOnline, isTyping }) {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [sharingLocation, setSharingLocation] = useState(false);
  const [sendError, setSendError] = useState("");
  const [uploadError, setUploadError] = useState("");
  const bottomRef = useRef(null);
  const typingStopTimerRef = useRef(null);
  const wasTypingRef = useRef(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Listen for send errors from the backend validation (e.g. malformed payload)
  useEffect(() => {
    const socket = getSocket();
    const handleError = (data) => setSendError(data?.error || "Couldn't send that message.");
    socket.on("error", handleError);
    return () => socket.off("error", handleError);
  }, []);

  if (!partner) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 text-charcoal/40 dark:text-white/40">
        <MessageCircle size={32} className="mb-3" />
        <p className="text-sm">Pick a conversation, or message a guide from their profile.</p>
      </div>
    );
  }

  const send = (payload) => {
    setSendError("");
    const socket = getSocket();
    socket.emit("send_message", { receiver_id: partner.id, ...payload });
    stopTyping();
    // No optimistic local append here on purpose: the backend echoes the
    // saved message back to the sender's own room via the same
    // "new_message" event the receiver gets (see Messages.jsx), so relying
    // on that single path avoids ending up with two bubbles for one
    // message - one with a client-side placeholder id and one with the
    // real DB id, which don't match on the dedupe check.
  };

  const stopTyping = () => {
    clearTimeout(typingStopTimerRef.current);
    if (wasTypingRef.current) {
      getSocket().emit("typing", { receiver_id: partner.id, is_typing: false });
      wasTypingRef.current = false;
    }
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
    const socket = getSocket();
    if (!wasTypingRef.current) {
      socket.emit("typing", { receiver_id: partner.id, is_typing: true });
      wasTypingRef.current = true;
    }
    clearTimeout(typingStopTimerRef.current);
    typingStopTimerRef.current = setTimeout(stopTyping, TYPING_STOP_DELAY_MS);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const content = text.trim();
    setText("");
    send({ content });
  };

  const shareLocation = () => {
    if (!navigator.geolocation) return;
    setSharingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        send({ shared_lat: pos.coords.latitude, shared_lng: pos.coords.longitude });
        setSharingLocation(false);
      },
      () => setSharingLocation(false),
      { timeout: 8000 }
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-charcoal/10 dark:border-white/10">
        <div className="relative shrink-0">
          <div className="w-9 h-9 rounded-full bg-forest text-white grid place-items-center font-semibold text-xs">
            {(partner.full_name || "?")
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()}
          </div>
          {isOnline && (
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-forest-light border-2 border-white dark:border-[#1c262b]" />
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-charcoal dark:text-white">{partner.full_name}</p>
          <p className="text-xs text-charcoal/45 dark:text-white/40">
            {isTyping ? (
              <span className="text-forest font-medium">typing...</span>
            ) : isOnline ? (
              "Online"
            ) : (
              <span className="capitalize">{partner.role}</span>
            )}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {loading && (
          <div className="flex items-center gap-2 text-charcoal/40 dark:text-white/40 text-sm">
            <Loader2 size={15} className="animate-spin" /> Loading messages...
          </div>
        )}
        {!loading && messages.length === 0 && (
          <p className="text-sm text-charcoal/40 dark:text-white/40 text-center py-10">
            Say hello to {partner.full_name.split(" ")[0]} 👋
          </p>
        )}
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} isMine={m.sender_id === user.id} />
        ))}
        <div ref={bottomRef} />
      </div>

      {(sendError || uploadError) && (
        <p className="px-4 pt-2 text-xs text-red-500">{sendError || uploadError}</p>
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-2 p-4 border-t border-charcoal/10 dark:border-white/10">
        <ImageUploadButton
          kind="image"
          size={16}
          className="w-10 h-10 shrink-0 bg-soft dark:bg-white/10 text-charcoal/50 dark:text-white/50 hover:bg-forest/10 hover:text-forest"
          onUploaded={(url) => {
            setUploadError("");
            send({ image_url: url });
          }}
          onError={setUploadError}
        />
        <button
          type="button"
          onClick={shareLocation}
          disabled={sharingLocation}
          className="w-10 h-10 shrink-0 grid place-items-center rounded-full bg-soft dark:bg-white/10 text-charcoal/50 dark:text-white/50 hover:bg-forest/10 hover:text-forest transition-colors disabled:opacity-50"
          title="Share your location"
        >
          {sharingLocation ? <Loader2 size={16} className="animate-spin" /> : <MapPin size={16} />}
        </button>
        <input
          value={text}
          onChange={handleTextChange}
          placeholder="Type a message..."
          className="flex-1 text-sm bg-soft dark:bg-white/5 text-charcoal dark:text-white rounded-full px-4 py-2.5 outline-none"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="w-10 h-10 shrink-0 grid place-items-center rounded-full bg-forest text-white hover:bg-forest-light transition-colors disabled:opacity-50"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
