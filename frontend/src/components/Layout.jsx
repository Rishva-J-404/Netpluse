import React, { useState } from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

export default function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19] text-slate-100 antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
      <Navbar onToggleSidebar={() => setIsSidebarOpen(prev => !prev)} />

      <div className="flex-1 flex relative">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <main className="flex-1 lg:pl-64 flex flex-col min-w-0">
          <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </div>

          <footer className="mt-auto border-t border-slate-900 bg-[#090d16] py-4 px-6 text-center text-xs text-slate-500 font-mono">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
              <span>NETPULSE · Course Code 25CS203 · Department of Computer Science & Engineering</span>
              <span className="text-slate-600">Probability & Statistics for CS Micro-Project</span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  )
}
