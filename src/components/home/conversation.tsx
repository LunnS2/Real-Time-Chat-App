// real-time-chat-app\src\components\home\conversation.tsx
import { formatDate } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { MessageSeenSvg } from "@/lib/svgs";
import { ImageIcon, Users, VideoIcon, X } from "lucide-react";
import { useMutation, useQuery, useConvexAuth } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useConversationStore } from "@/store/chat-store";
import { useState } from "react";

const Conversation = ({ conversation }: { conversation: any }) => {
  const conversationImage = conversation.groupImage || conversation.image;
  const conversationName = conversation.groupName || conversation.name;
  const lastMessage = conversation.lastMessage;
  const lastMessageType = lastMessage?.messageType;

  const { isAuthenticated } = useConvexAuth();
  const me = useQuery(api.users.getMe, isAuthenticated ? undefined : "skip");

  const exitConversation = useMutation(api.conversations.exitConversation);

  const { setSelectedConversation, selectedConversation } =
    useConversationStore();
  const activeBgClass = selectedConversation?._id === conversation._id;

  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleExitConversation = async () => {
    try {
      await exitConversation({ conversationId: conversation._id });

      if (selectedConversation?._id === conversation._id) {
        setSelectedConversation(null);
      }
      setShowConfirmation(false);
    } catch (error) {
      console.error("Failed to exit conversation", error);
    }
  };

  return (
    <>
      <div
        className={`flex gap-2 items-center p-3 hover:bg-chat-hover cursor-pointer
          ${activeBgClass ? "bg-gray-tertiary" : ""}
        `}
        onClick={() => setSelectedConversation(conversation)}
      >
        <Avatar className="border border-gray-900 overflow-visible relative">
          {conversation.isOnline && (
            <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-indigo-500 rounded-full border-2 border-foreground" />
          )}
          <AvatarImage
            src={conversationImage || "/placeholder.png"}
            className="object-cover rounded-full"
          />
          <AvatarFallback>
            <div className="animate-pulse bg-gray-tertiary w-full h-full rounded-full"></div>
          </AvatarFallback>
        </Avatar>
        <div className="flex text-left gap-7 mr-5">
          <X
            size={16}
            className="cursor-pointer rounded-full hover:bg-indigo-300"
            onClick={(e) => {
              e.stopPropagation();
              setShowConfirmation(true);
            }}
          />
        </div>
        <div className="w-full">
          <div className="flex items-center">
            <h3 className="text-sm font-medium">{conversationName}</h3>
            <span className="text-xs text-gray-500 ml-auto">
              {formatDate(
                lastMessage?._creationTime || conversation._creationTime
              )}
            </span>
          </div>
          <p className="text-[12px] mt-1 text-gray-500 flex items-center gap-1 ">
            {lastMessage?.sender === me?._id ? <MessageSeenSvg /> : ""}
            {conversation.isGroup && <Users size={16} />}
            {!lastMessage && "Say Hi!"}
            {lastMessageType === "text" ? (
              lastMessage?.content.length > 30 ? (
                <span>{lastMessage?.content.slice(0, 30)}...</span>
              ) : (
                <span>{lastMessage?.content}</span>
              )
            ) : null}
            {lastMessageType === "image" && <ImageIcon size={16} />}
            {lastMessageType === "video" && <VideoIcon size={16} />}
          </p>
        </div>
      </div>
      <hr className="h-[1px] mx-10 bg-gray-primary" />

      {/* Confirmation modal */}
      {showConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-secondary p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-4">
              Are you sure you want to exit this conversation?
            </h2>
            <div className="flex gap-4 justify-center">
              <button
                className="px-4 py-2 bg-indigo-primary rounded-md hover:bg-indigo-300"
                onClick={() => setShowConfirmation(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-indigo-primary rounded-md hover:bg-indigo-300"
                onClick={handleExitConversation}
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Conversation;
