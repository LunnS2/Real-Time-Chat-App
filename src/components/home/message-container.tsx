import ChatBubble from "./chat-bubble";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useConversationStore } from "@/store/chat-store";
import { useRef, useEffect } from "react";
import { Id } from "../../../convex/_generated/dataModel";
import { User } from "@/types/user";

const MessageContainer = () => {
  const { selectedConversation } = useConversationStore();
  const messages = useQuery(api.messages.getMessages, {
    conversation: selectedConversation?._id as Id<"conversations">,
  });
  const me = useQuery(api.users.getMe);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  if (!me || !selectedConversation) {
    return <div className="p-3 text-center">Loading chat...</div>;
  }

  const safeUser: User = {
    _id: me._id,
    email: me.email,
    image: me.image,
    tokenIdentifier: me.tokenIdentifier,
    isOnline: me.isOnline,
    _creationTime: me._creationTime,
    name: me.name || "",
  };

  return (
    <div
      ref={chatContainerRef}
      className="relative p-3 flex-1 overflow-auto h-full bg-chat-tile-light dark:bg-chat-tile-dark"
    >
      <div className="mx-12 flex flex-col gap-3">
        {messages?.map((msg, idx) => (
          <div key={msg._id}>
            <ChatBubble
              message={msg}
              me={safeUser}
              previousMessage={idx > 0 ? messages[idx - 1] : undefined}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MessageContainer;
