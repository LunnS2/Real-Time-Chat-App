"use client";

import { Search, X } from "lucide-react";
import { Input } from "../ui/input";
import ThemeSwitch from "./theme-switch";
import ConversationCard from "./conversation";
import { UserButton } from "@clerk/nextjs";
import UserListDialog from "./user-list-dialog";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useEffect, useMemo, useState, useRef } from "react";
import { useConversationStore, type Conversation } from "@/store/chat-store";
import { Id } from "../../../convex/_generated/dataModel";

interface LeftPanelProps {
  open?: boolean;
  onClose?: () => void;
}

const LeftPanel: React.FC<LeftPanelProps> = ({ open = true, onClose }) => {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const conversations = useQuery(
    api.conversations.getMyConversations,
    isAuthenticated ? undefined : "skip"
  );

  const { selectedConversation, setSelectedConversation } =
    useConversationStore();

  const [searchTerm, setSearchTerm] = useState("");

  const prevSelectedRef = useRef<Conversation | null>(null);
  useEffect(() => {
    if (
      selectedConversation &&
      prevSelectedRef.current?._id !== selectedConversation._id &&
      onClose
    ) {
      onClose();
    }
    prevSelectedRef.current = selectedConversation ?? null;
  }, [selectedConversation, onClose]);

  useEffect(() => {
    if (conversations) {
      const ids = conversations.map((c) => c._id);
      if (selectedConversation && !ids.includes(selectedConversation._id)) {
        setSelectedConversation(null);
      }
    }
  }, [conversations, selectedConversation, setSelectedConversation]);

  const filtered = useMemo(
    () =>
      conversations?.filter((c) =>
        (c.groupName || c.name || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      ),
    [conversations, searchTerm]
  );

  if (isLoading) return null;

  return (
    <>
      {/* Backdrop on mobile */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-30 z-40 md:hidden transition-opacity ${
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      <div
        className={`
          fixed top-0 left-0 z-40 h-full w-3/4 max-w-xs bg-left-panel border-r border-gray-600
          transform transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:static md:translate-x-0 md:w-1/4
        `}
      >
        {/* Header */}
        <div className="sticky top-0 z-30 bg-gray-primary flex items-center justify-between p-3">
          <div className="flex items-center gap-3">
            <UserButton />
            {isAuthenticated && <UserListDialog />}
          </div>
          <div className="flex items-center gap-2">
            <ThemeSwitch />
            {onClose && (
              <X size={16} className="md:hidden cursor-pointer" onClick={onClose} />
            )}
          </div>
        </div>

        {/* Search */}
        <div className="p-3 flex items-center">
          <div className="relative flex-1 h-10 mx-3">
            <Search
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10"
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

        {/* Conversations */}
        <div className="overflow-auto flex flex-col gap-0 px-1">
          {filtered?.map((c) => (
            <ConversationCard
              key={c._id}
              conversation={{
                ...c,
                lastMessage: c.lastMessage
                  ? {
                      ...c.lastMessage,
                      sender: c.lastMessage.sender as Id<"users">,
                    }
                  : undefined,
              }}
            />
          ))}
          {filtered?.length === 0 && (
            <p className="text-center text-gray-500 text-sm mt-3">
              No conversations found
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default LeftPanel;
