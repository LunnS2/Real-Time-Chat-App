"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader, X } from "lucide-react";
import MessageInput from "./message-input";
import MessageContainer from "./message-container";
import ChatPlaceHolder from "@/components/home/chat-placeholder";
import GroupMembersDialog from "./group-members-dialog";
import { useConversationStore } from "@/store/chat-store";
import { useConvexAuth } from "convex/react";

const RightPanel = () => {
  const { selectedConversation, setSelectedConversation } =
    useConversationStore();
  const { isLoading } = useConvexAuth();

  if (isLoading) return <Loader className="animate-spin" />;
  if (!selectedConversation) return <ChatPlaceHolder />;

  const name = selectedConversation.groupName || selectedConversation.name;
  const img = selectedConversation.groupImage || selectedConversation.image;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center bg-gray-primary p-3 sticky top-0 z-10">
        <div className="flex gap-3 items-center">
          <Avatar>
            <AvatarImage src={img || "/placeholder.png"} />
            <AvatarFallback>
              <div className="animate-pulse bg-gray-tertiary w-full h-full rounded-full" />
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <p>{name}</p>
            {selectedConversation.isGroup && (
              <GroupMembersDialog selectedConversation={selectedConversation} />
            )}
          </div>
        </div>
        <X
          size={16}
          className="cursor-pointer"
          onClick={() => setSelectedConversation(null)}
        />
      </div>

      {/* Messages */}
      <MessageContainer />

      {/* Input */}
      <MessageInput />
    </div>
  );
};

export default RightPanel;
