import { formatDate } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { MessageSeenSvg } from "@/lib/svgs";
import { ImageIcon, Users, VideoIcon, X } from "lucide-react";
import { useMutation, useQuery, useConvexAuth } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useConversationStore, type Conversation } from "@/store/chat-store";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Id } from "../../../convex/_generated/dataModel";

interface ConversationProps {
  conversation: Omit<Conversation, "lastMessage"> & {
    lastMessage?: {
      _id: string;
      content: string;
      _creationTime: number;
      messageType: "text" | "image" | "video";
      sender: Id<"users">;
    };
  };
}

const Conversation = ({ conversation }: ConversationProps) => {
  const conversationImage = conversation.groupImage || conversation.image;
  const conversationName =
    conversation.groupName || conversation.name || "New Chat";
  const lastMessage = conversation.lastMessage;

  const { isAuthenticated } = useConvexAuth();
  const me = useQuery(api.users.getMe, isAuthenticated ? undefined : "skip");

  const exitConversation = useMutation(api.conversations.exitConversation);

  const { setSelectedConversation, selectedConversation } =
    useConversationStore();
  const activeBgClass = selectedConversation?._id === conversation._id;

  const handleExitConversation = async () => {
    try {
      await exitConversation({ conversationId: conversation._id });
      if (selectedConversation?._id === conversation._id) {
        setSelectedConversation(null);
      }
    } catch (error) {
      console.error("Failed to exit conversation", error);
    }
  };

  const getDisplayDate = () => {
    if (lastMessage?._creationTime) {
      return formatDate(lastMessage._creationTime);
    }
    return formatDate(Date.now());
  };

  return (
    <>
      <div
        className={`flex gap-2 items-center p-3 hover:bg-chat-hover cursor-pointer
          ${activeBgClass ? "bg-gray-tertiary" : ""}`}
        onClick={() => setSelectedConversation(conversation as Conversation)}
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
          <Dialog>
            <DialogTrigger asChild>
              <X
                size={16}
                className="cursor-pointer rounded-full hover:bg-indigo-300"
                onClick={(e) => e.stopPropagation()}
              />
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Conversation</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this conversation?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button
                  className="hover:bg-indigo-200"
                  onClick={handleExitConversation}
                >
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="w-full">
          <div className="flex items-center">
            <h3 className="text-sm font-medium">{conversationName}</h3>
            <span className="text-xs text-gray-500 ml-auto">
              {getDisplayDate()}
            </span>
          </div>
          <p className="text-[12px] mt-1 text-gray-500 flex items-center gap-1 ">
            {lastMessage?.sender === me?._id ? <MessageSeenSvg /> : ""}
            {conversation.isGroup && <Users size={16} />}
            {!lastMessage && "Say Hi!"}
            {lastMessage?.messageType === "text" && (
              <span>
                {lastMessage.content.length > 30
                  ? `${lastMessage.content.slice(0, 30)}...`
                  : lastMessage.content}
              </span>
            )}
            {lastMessage?.messageType === "image" && <ImageIcon size={16} />}
            {lastMessage?.messageType === "video" && <VideoIcon size={16} />}
          </p>
        </div>
      </div>
      <hr className="h-[1px] mx-10 bg-gray-primary" />
    </>
  );
};

export default Conversation;
