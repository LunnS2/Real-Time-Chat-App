"use client";

import ChatLayout from "@/components/home/chat-layout";

export default function Home() {
  return (
    <main className="m-0 md:m-5">
      <div
        className={`
          flex overflow-y-hidden
          w-screen h-screen
          bg-left-panel
          md:mx-auto
          md:w-full
          md:max-w-[1700px]
          md:h-[calc(100vh-50px)]
        `}
      >
        <ChatLayout />
      </div>
    </main>
  );
}
