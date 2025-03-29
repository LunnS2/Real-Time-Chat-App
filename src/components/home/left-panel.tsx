"use client";
import { Loader, Search } from "lucide-react";
import { Input } from "../ui/input";
import ThemeSwitch from "./theme-switch";
import Conversation from "./conversation";
import { UserButton } from "@clerk/nextjs";
import UserListDialog from "./user-list-dialog";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useEffect, useMemo, useState } from "react";
import { useConversationStore } from "@/store/chat-store";

const LeftPanel = () => {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const conversations = useQuery(api.conversations.getMyConversations, isAuthenticated ? undefined : "skip");

  const { selectedConversation, setSelectedConversation } = useConversationStore();

  const [searchTerm, setSearchTerm] = useState("");

  // Reset selected conversation if it's not in the list of conversations
  useEffect(() => {
    if (conversations) {
      const conversationIds = conversations.map((conversation) => conversation._id);
      if (selectedConversation && !conversationIds.includes(selectedConversation._id)) {
        setSelectedConversation(null);
      }
    }
  }, [conversations, selectedConversation, setSelectedConversation]);

  // Memoize filtered conversations based on search term
  const filteredConversations = useMemo(() => {
    return conversations?.filter((conversation) => {
      const conversationName = conversation.groupName || conversation.name || "";
      return conversationName.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [conversations, searchTerm]);

  // Display loading state or no conversations state
  if (isLoading) return <div className="p-3 text-center">Loading...</div>;
  if (!conversations || conversations.length === 0) return <div className="p-3 text-center">No conversations available.</div>;

  return (
    <div className="w-1/4 border-gray-600 border-r">
      <div className="sticky top-0 bg-left-panel z-10">
        {/* Header */}
        <div className="flex justify-between bg-gray-primary p-3 items-center">
          <UserButton />

          <div className="flex items-center gap-3">
            {isAuthenticated && <UserListDialog />}
            <ThemeSwitch />
          </div>
        </div>

        {/* Search */}
        <div className="p-3 flex items-center">
          <div className="relative h-10 mx-3 flex-1">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10"
              size={18}
            />
            <Input
              type="text"
              placeholder="Search or start a new chat"
              className="pl-10 py-2 text-sm w-full rounded shadow-sm bg-gray-primary focus-visible:ring-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Chat List */}
      <div className="my-3 flex flex-col gap-0 max-h-[80%] overflow-auto">
        {/* Filtered Conversations */}
        {filteredConversations?.map((conversation) => (
          <Conversation key={conversation._id} conversation={conversation} />
        ))}

        {/* Display message if no conversations found */}
        {filteredConversations?.length === 0 && (
          <p className="text-center text-gray-500 text-sm mt-3">No conversations found</p>
        )}
      </div>
    </div>
  );
};

export default LeftPanel;
