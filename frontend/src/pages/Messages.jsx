import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  LayoutGrid, Compass, BookMarked, MessageCircle, ClipboardList, UserCircle2,
  Users, ClipboardCheck,
} from "lucide-react";
import DashboardShell from "../layouts/DashboardShell.jsx";
import ConversationList from "../components/chat/ConversationList.jsx";
import ChatThread from "../components/chat/ChatThread.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { getSocket } from "../services/socket.js";
import api from "../services/api.js";

const NAV_BY_ROLE = {
  tourist: [
    { path: "/tourist/dashboard", label: "Dashboard", icon: LayoutGrid },
    { path: "/guides", label: "Find guides", icon: Compass },
    { path: "/tourist/bookings", label: "My bookings", icon: BookMarked },
    { path: "/messages", label: "Messages", icon: MessageCircle },
  ],
  guide: [
    { path: "/guide/dashboard", label: "Dashboard", icon: LayoutGrid },
    { path: "/guide/dashboard#booking-requests", label: "Booking requests", icon: ClipboardList },
    { path: "/messages", label: "Messages", icon: MessageCircle },
    { path: "/guide/dashboard#guide-profile", label: "My profile", icon: UserCircle2 },
  ],
  admin: [
    { path: "/admin/dashboard", label: "Overview", icon: LayoutGrid },
    { path: "/admin/dashboard#user-management", label: "Users", icon: Users },
    { path: "/messages", label: "Messages", icon: MessageCircle },
    { path: "/admin/dashboard#booking-management", label: "Bookings", icon: ClipboardCheck },
  ],
};

export default function Messages() {
  const { partnerId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [activePartner, setActivePartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingThread, setLoadingThread] = useState(false);
  const [onlineUserIds, setOnlineUserIds] = useState(new Set());
  const [partnerTyping, setPartnerTyping] = useState(false);

  const partnerIdRef = useRef(partnerId);
  partnerIdRef.current = partnerId;
  const typingTimeoutRef = useRef(null);

  const fetchConversations = useCallback(() => {
    api
      .get("/messages/conversations")
      .then(({ data }) => {
        const convos = data.conversations || [];
        setConversations(convos);

        const socket = getSocket();
        const ids = convos.map((c) => c.partner.id);
        if (ids.length > 0) socket.emit("who_is_online", { user_ids: ids });
      })
      .catch(() => {})
      .finally(() => setLoadingConversations(false));
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Load thread history via REST when switching conversations (sockets only
  // handle live updates from here on, not historical fetch).
  useEffect(() => {
    setPartnerTyping(false);
    if (!partnerId) {
      setActivePartner(null);
      setMessages([]);
      return;
    }
    setLoadingThread(true);
    api
      .get(`/messages/thread/${partnerId}`)
      .then(({ data }) => {
        setActivePartner(data.partner);
        setMessages(data.messages || []);
      })
      .catch(() => navigate("/messages"))
      .finally(() => setLoadingThread(false));
  }, [partnerId, navigate]);

  // Wire up socket listeners once; use partnerIdRef inside so the same
  // listener instance always sees the *current* open thread without
  // needing to be torn down and re-attached on every navigation.
  useEffect(() => {
    const socket = getSocket();

    const handleNewMessage = (message) => {
      const isForOpenThread =
        message.sender_id === partnerIdRef.current || message.receiver_id === partnerIdRef.current;

      if (isForOpenThread) {
        setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
        if (message.sender_id === partnerIdRef.current) {
          socket.emit("mark_read", { other_user_id: partnerIdRef.current });
        }
      }
      fetchConversations();
    };

    const handleTyping = (data) => {
      if (data.sender_id === partnerIdRef.current) {
        setPartnerTyping(data.is_typing);
        clearTimeout(typingTimeoutRef.current);
        if (data.is_typing) {
          typingTimeoutRef.current = setTimeout(() => setPartnerTyping(false), 4000);
        }
      }
    };

    const handlePresence = (data) => {
      setOnlineUserIds((prev) => {
        const next = new Set(prev);
        if (data.online) next.add(data.user_id);
        else next.delete(data.user_id);
        return next;
      });
    };

    const handleOnlineList = (data) => {
      setOnlineUserIds((prev) => new Set([...prev, ...(data.user_ids || [])]));
    };

    const handleReadReceipt = (data) => {
      if (data.reader_id === partnerIdRef.current) {
        setMessages((prev) => prev.map((m) => (m.sender_id === user.id ? { ...m, is_read: true } : m)));
      }
    };

    socket.on("new_message", handleNewMessage);
    socket.on("typing", handleTyping);
    socket.on("presence", handlePresence);
    socket.on("online_list", handleOnlineList);
    socket.on("read_receipt", handleReadReceipt);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("typing", handleTyping);
      socket.off("presence", handlePresence);
      socket.off("online_list", handleOnlineList);
      socket.off("read_receipt", handleReadReceipt);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchConversations, user?.id]);

  const handleSelect = (partner) => navigate(`/messages/${partner.id}`);

  const navItems = NAV_BY_ROLE[user?.role] || NAV_BY_ROLE.tourist;

  return (
    <DashboardShell navItems={navItems} title="Messages">
      <div className="bg-white dark:bg-[#1c262b] rounded-2xl shadow-card overflow-hidden h-full grid grid-cols-1 md:grid-cols-[300px_1fr]">
        <div className={`border-r border-charcoal/10 dark:border-white/10 ${partnerId ? "hidden md:block" : "block"}`}>
          <ConversationList
            conversations={conversations}
            loading={loadingConversations}
            activePartnerId={partnerId}
            onSelect={handleSelect}
            onlineUserIds={onlineUserIds}
          />
        </div>
        <div className={partnerId ? "block" : "hidden md:block"}>
          <ChatThread
            partner={activePartner}
            messages={messages}
            loading={loadingThread}
            isOnline={activePartner && onlineUserIds.has(activePartner.id)}
            isTyping={partnerTyping}
          />
        </div>
      </div>
    </DashboardShell>
  );
}
