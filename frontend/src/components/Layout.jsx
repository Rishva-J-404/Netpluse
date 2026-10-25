import React, { useState } from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

export default function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col bg-[#0b1426] text-[#f4f7fc] antialiased selection:bg-[#8cc8ff]/20 selection:text-[#8cc8ff] font-sans">
      <Navbar onToggleSidebar={() => setIsSidebarOpen(prev => !prev)} />

      <div className="flex-1 flex relative">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <main className="flex-1 lg:pl-64 flex flex-col min-w-0">
          <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </div>

          <footer className="mt-auto border-t border-[#2c3d58] bg-[#0b1426] py-4 px-6 text-center text-xs text-[#a6b4c9] font-sans">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
              <span>NETPULSE · Course Code 25CS203 · Department of Computer Science & Engineering</span>
              <span className="text-[#a6b4c9]">Probability & Statistics for CS Project</span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  )
}
