"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [roomName, setRoomName] = useState("");
  const [joinId, setJoinId] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  const handleCreateRoom = async () => {
    if (!roomName) return alert("Enter a room name");

    const token = sessionStorage.getItem("token");
    if (!token) return alert("Please login first");

    const res = await axios.post(
      "/api/rooms/create",
      { name: roomName },
      {
        headers: {
          Authorization: `Bearer ${token}`, // ✅ add this line
        },
      }
    );
    const roomId = res.data.roomId;
    router.push(`/chat/${roomId}`);
  };

  const handleJoinRoom = async () => {
    if (!joinId) return alert("Enter a room ID");
    const token = sessionStorage.getItem("token");
    if (!token) return alert("Please login first");

    const res = await axios.post(
      "/api/rooms/join",
      { roomId: joinId },
      {
        headers: {
          Authorization: `Bearer ${token}`, // ✅ add this line
        },
      }
    );
    console.log("res",res.data)
    router.push(`/chat/${joinId}`);
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-6">
      <h2 className="text-xl font-bold">Chat Dashboard</h2>

      <div className="space-y-2">
        <input
          className="border p-2 w-full"
          placeholder="New Room Name"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
        />
        <button
          onClick={handleCreateRoom}
          className="bg-blue-600 text-white px-4 py-2 rounded w-full"
        >
          Create Room
        </button>
      </div>

      <hr />

      <div className="space-y-2">
        <input
          className="border p-2 w-full"
          placeholder="Enter Room ID to Join"
          value={joinId}
          onChange={(e) => setJoinId(e.target.value)}
        />
        <button
          onClick={handleJoinRoom}
          className="bg-green-600 text-white px-4 py-2 rounded w-full"
        >
          Join Room
        </button>
      </div>

      <button
        onClick={() => {
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("user");
          window.location.href = "/login";
        }}
        className="bg-red-500 text-white px-4 py-2 rounded"
      >
        Logout
      </button>
    </div>
  );
}
