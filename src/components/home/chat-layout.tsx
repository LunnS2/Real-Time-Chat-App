"use client";

import { useState } from "react";
import LeftPanel from "./left-panel";
import RightPanel from "./right-panel";
import { Menu } from "lucide-react";

export default function ChatLayout() {
  const [isLeftOpen, setIsLeftOpen] = useState(false);

  return (
    <div className="flex flex-1 overflow-hidden z-50">
      {/* LEFT DRAWER */}
      <LeftPanel open={isLeftOpen} onClose={() => setIsLeftOpen(false)} />

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col">
        {/* Mobile header with hamburger */}
        <div className="md:hidden flex items-center bg-gray-primary p-2">
          <Menu
            size={24}
            className="cursor-pointer"
            onClick={() => setIsLeftOpen(true)}
          />
        </div>
        <RightPanel />
      </div>
    </div>
  );
}
