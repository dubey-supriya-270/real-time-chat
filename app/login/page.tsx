"use client";
import { useRef, useState } from "react";
import Webcam from "react-webcam";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const webcamRef = useRef<Webcam>(null);
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const capture = () => {
    const image = webcamRef.current?.getScreenshot();
    if (image) setImageSrc(image);
  };

  const handleLogin = async () => {
    if (!username || !password || !imageSrc) {
      alert("Username, password, and selfie are required.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("/api/auth/login", {
        username,
        password,
        image: imageSrc,
      });

      const { token, user } = res.data;
      sessionStorage.setItem("token", token);
      sessionStorage.setItem("user", JSON.stringify(user));
      router.push("/dashboard");
    } catch (err: any) {
      alert(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">🔐 Login with Face Match</h2>

        <div className="space-y-4">
        <input
          type="text"
          placeholder="Username"
          className="w-full px-4 py-2 border rounded-lg bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full px-4 py-2 border rounded-lg bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

          <div className="rounded-md overflow-hidden border border-gray-300">
            <Webcam
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              width="100%"
              className="rounded"
            />
          </div>

          <button
            onClick={capture}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition"
          >
            📸 Take Selfie
          </button>

          {imageSrc && (
            <img src={imageSrc} alt="Captured Selfie" className="w-32 h-32 object-cover rounded-full mx-auto mt-2 border shadow" />
          )}

          <button
            onClick={handleLogin}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition"
          >
            {loading ? "🔒 Logging in..." : "✅ Log In"}
          </button>
        </div>
      </div>
    </div>
  );
}
