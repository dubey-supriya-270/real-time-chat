// app/chat/layout.tsx
import SidebarRooms from '@/components/SidebarRooms'

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#eae6df]">
      {/* Left Sidebar */}
      <div className="w-[25%] bg-black border-r overflow-y-auto">
        <SidebarRooms />
      </div>

      {/* Right Chat Area */}
      <div className="flex-1 flex flex-col bg-[#f0f2f5]">
        {children}
      </div>
    </div>
  )
}
