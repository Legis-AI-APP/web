import { Card, CardContent } from "@/components/ui/card";
import React from "react";
import ReactMarkdown from "react-markdown";

type MessageBubbleProps = {
  content: string;
  role: "user" | "assistant";
};

export default function MessageBubble({ content, role }: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div className={`w-full flex ${isUser ? "justify-end" : "justify-start"}`}>
      <Card
        className={`${
          isUser
            ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white py-1 px-0"
            : "bg-transparent shadow-none border-none text-muted-foreground"
        } ${isUser ? "max-w-[60%]" : "w-full"} rounded-xl`}
      >
        <CardContent
          className={`text-sm whitespace-pre-wrap px-3 ${
            isUser ? "text-right" : ""
          }`}
        >
          <ReactMarkdown>{content}</ReactMarkdown>
        </CardContent>
      </Card>
    </div>
  );
}
