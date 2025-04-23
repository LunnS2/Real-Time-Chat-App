"use client";

import ChatLayout from "@/components/home/chat-layout";

export default function Home() {
  return (
    <main className="m-5">
      <div className="flex overflow-y-hidden h-[calc(100vh-50px)] max-w-[1700px] mx-auto bg-left-panel">
        <ChatLayout />
      </div>
    </main>
  );
}
