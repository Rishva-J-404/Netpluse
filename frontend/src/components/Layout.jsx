import React, { useState } from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

export default function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col bg-[#111827] text-[#f3f4f6] antialiased selection:bg-[#4f7cff]/20 selection:text-[#4f7cff] font-sans">
      <Navbar onToggleSidebar={() => setIsSidebarOpen(prev => !prev)} />

      <div className="flex-1 flex relative">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <main className="flex-1 lg:pl-64 flex flex-col min-w-0">
          <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </div>

          <footer className="mt-auto border-t border-[#2b3545] bg-[#111827] py-4 px-6 text-center text-xs text-[#9ca8b8] font-sans">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
              <span>NETPULSE — Network Load Analysis Using Normal Distribution</span>
              <span className="text-[#9ca8b8]/75">Interactive Telemetry Simulation & Statistical Modeling</span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  )
}
