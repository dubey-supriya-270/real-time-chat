"use client";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import io from "socket.io-client";
import api from '@/lib/axios'
import VoiceRecorder from "@/components/VoiceRecorder";
import InviteUser from "@/components/InviteUser";

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL);

type Message = {
  sender: { username: string };
  text: string;
  createdAt: string;
};

export type User = {
  id: string
  username: string
  email: string
  passwordHash: string
  rekognitionFaceId: string
  createdAt: string // or `Date` if you're parsing it
}

export default function ChatRoomPage() {
  const { roomId } = useParams() as { roomId: string };
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const [user, setUser] = useState<User>();
  useEffect(() => {
    const storedUser = sessionStorage.getItem("user")
    if (storedUser) {
      try {
        const parsedUser: User = JSON.parse(storedUser)
        setUser(parsedUser)
      } catch (err) {
        console.error("Failed to parse user from sessionStorage", err)
      }
    }
  }, [])
  useEffect(() => {
    if (!roomId) return;

    socket.emit("joinRoom", { roomId });

    const token = sessionStorage?.getItem("token");
    api
      .get(`/api/messages/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setMessages(res.data))
      .catch((err) => console.error("Fetch messages failed", err));

    const handleReceive = (msg: Message) =>
      setMessages((prev) => [...prev, msg]);
    const handleTyping = ({ username }: {username:string}) => setTypingUser(username);
    const stopTyping = () => setTypingUser(null);

    socket.on("receiveMessage", handleReceive);
    socket.on("showTyping", handleTyping);
    socket.on("hideTyping", stopTyping);

    return () => {
      socket.off("receiveMessage", handleReceive);
      socket.off("showTyping", handleTyping);
      socket.off("hideTyping", stopTyping);
    };
  }, [roomId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim()) return;

    const message = {
      sender: user?.username,
      text,
      createdAt: new Date().toISOString(),
      roomId,
    };

    socket.emit("sendMessage", message);

    const token = sessionStorage.getItem("token");
    await api.post("/api/messages/send", message, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setText("");
  };

  const handleTranscript = (spokenText: string) => setText(spokenText);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="h-20 bg-[#f0f2f5] border-b px-6 flex justify-between items-center mb-6">
        <div className="text-lg font-semibold text-gray-700">
          Room: {roomId}
        </div>
        <InviteUser roomId={roomId} />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 bg-[url('/whatsapp-bg.png')] bg-cover space-y-3 mt-12">
        {messages.map((msg, idx) => {
          const isOwn = msg.sender.username === user?.username;
          return (
            <div
              key={idx}
              className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] px-4 py-2 rounded-xl shadow text-sm ${
                  isOwn ? "bg-[#d9fdd3] text-right" : "bg-white text-left"
                }`}
              >
                <div className="text-gray-800">
                  {msg.sender.username} :{msg.text}
                </div>
                <div className="text-[10px] text-gray-500 mt-1">
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </div>
              </div>
            </div>
          );
        })}

        <div ref={chatEndRef} />
      </div>

      {typingUser && (
        <div className="text-center text-sm italic text-gray-500 mb-2">
          {typingUser} is typing...
        </div>
      )}

      {/* Input */}
      <div className="bg-[#f0f2f5] px-4 py-3 border-t flex items-center gap-2">
        <input
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            socket.emit("typing", { roomId, username: user?.username });
            if (typingTimeoutRef.current)
              clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
              socket.emit("stopTyping", { roomId });
            }, 1000);
          }}
          placeholder="Type a message"
          className={`flex-1 px-4 py-2 rounded-full border outline-none text-sm ${
            text.trim()
              ? "text-black border-gray-400"
              : "text-gray-500 border-gray-300"
          }`}
        />
        <button
          onClick={handleSend}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full text-sm"
        >
          Send
        </button>
      </div>

      <div className="bg-[#f0f2f5] px-4 py-2 border-t">
        <VoiceRecorder onTranscript={handleTranscript} />
      </div>
    </div>
  );
}
