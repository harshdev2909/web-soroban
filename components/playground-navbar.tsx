'use client'

import { useState } from 'react'
import { Menu, X } from 'lucide-react'

export default function PlaygroundNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="mx-auto max-w-4xl mt-3 md:mt-6 mb-3 md:mb-6 px-4">
      <div className="backdrop-blur-xl bg-black/20 border border-white/10 rounded-xl px-3 md:px-5 py-2.5 shadow-2xl shadow-black/50 transition-all duration-300 hover:shadow-purple-500/20 hover:border-purple-500/30">
        <div className="flex justify-between items-center">
          <a
            href="/"
            className="font-bold text-base md:text-lg text-white transition-all duration-300 hover:text-purple-300 hover:scale-105 transform"
          >
            WebSoroban
          </a>

          <div className="hidden md:flex items-center space-x-6">
            <a
              href="/"
              className="text-xs text-gray-300 hover:text-purple-300 transition-all duration-300 relative group"
            >
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-purple-600 transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a
              href="/contract"
              className="text-xs text-gray-300 hover:text-purple-300 transition-all duration-300 relative group"
            >
              Playground
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-purple-600 transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a
              href="/docs"
              className="text-xs text-gray-300 hover:text-purple-300 transition-all duration-300 relative group"
            >
              Learn
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-purple-600 transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a
              href="/examples"
              className="text-xs text-gray-300 hover:text-purple-300 transition-all duration-300 relative group"
            >
              Examples
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-purple-600 transition-all duration-300 group-hover:w-full"></span>
            </a>
            <button className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-xs font-medium transition-all duration-300 h-8 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 border border-purple-400/30 shadow-lg hover:shadow-purple-500/50 backdrop-blur-sm transform hover:scale-105 hover:-translate-y-0.5">
              Connect Wallet
            </button>
          </div>

          <button
            className="md:hidden text-white p-1.5 hover:bg-purple-500/20 rounded-lg transition-all duration-300 transform hover:scale-110 active:scale-95"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <div className="relative w-[18px] h-[18px]">
              <Menu
                size={18}
                className={`absolute inset-0 transition-all duration-300 ${
                  isMenuOpen ? "rotate-90 opacity-0 scale-0" : "rotate-0 opacity-100 scale-100"
                }`}
              />
              <X
                size={18}
                className={`absolute inset-0 transition-all duration-300 ${
                  isMenuOpen ? "rotate-0 opacity-100 scale-100" : "-rotate-90 opacity-0 scale-0"
                }`}
              />
            </div>
          </button>
        </div>

        <div
          className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${
            isMenuOpen ? "max-h-96 opacity-100 mt-3 pt-3 border-t border-purple-500/30" : "max-h-0 opacity-0 mt-0 pt-0"
          }`}
        >
          <div className="flex flex-col space-y-3">
            <a
              href="/"
              className="text-sm text-gray-300 hover:text-purple-300 transition-all duration-300 py-1.5 hover:bg-purple-500/10 rounded-md px-2 transform hover:translate-x-2 relative group"
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="relative z-10">Home</span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 to-purple-500/20 rounded-md transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
            </a>
            <a
              href="/contract"
              className="text-sm text-gray-300 hover:text-purple-300 transition-all duration-300 py-1.5 hover:bg-purple-500/10 rounded-md px-2 transform hover:translate-x-2 relative group"
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="relative z-10">Playground</span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 to-purple-500/20 rounded-md transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
            </a>
            <a
              href="/docs"
              className="text-sm text-gray-300 hover:text-purple-300 transition-all duration-300 py-1.5 hover:bg-purple-500/10 rounded-md px-2 transform hover:translate-x-2 relative group"
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="relative z-10">Learn</span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 to-purple-500/20 rounded-md transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
            </a>
            <a
              href="/examples"
              className="text-sm text-gray-300 hover:text-purple-300 transition-all duration-300 py-1.5 hover:bg-purple-500/10 rounded-md px-2 transform hover:translate-x-2 relative group"
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="relative z-10">Examples</span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 to-purple-500/20 rounded-md transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
            </a>
            <button
              className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all duration-300 h-8 px-3 py-1.5 bg-gradient-to-r from-purple-500/20 to-purple-600/20 text-purple-300 hover:from-purple-500/30 hover:to-purple-600/30 hover:text-white border border-purple-400/30 rounded-lg w-fit mt-2 backdrop-blur-sm transform hover:scale-105 hover:-translate-y-0.5"
              onClick={() => setIsMenuOpen(false)}
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}