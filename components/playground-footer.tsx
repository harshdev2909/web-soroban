'use client'

import { Github, Twitter } from 'lucide-react'

export const socials = [
  { href: "https://github.com", icon: <Github className="w-5 h-5" />, name: "GitHub" },
  { href: "https://twitter.com", icon: <Twitter className="w-5 h-5" />, name: "Twitter" },
]

const PlaygroundFooter = () => {
  return (
    <footer className="relative flex min-h-[560px] flex-col justify-between gap-20 overflow-hidden px-4 py-14 md:p-14 bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900">
      <div className="relative z-20 grid grid-cols-1 items-start gap-20 md:grid-cols-2 md:gap-12">
        <div className="transform transition-all duration-700 hover:translate-y-[-4px]">
          <h5 className="mb-8">
            <a href="/" className="flex items-center gap-3 text-white group">
              <img
                src="/websoroban_logo.png"
                className="h-6 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12"
                alt="Logo"
              />
              <span className="text-lg font-medium text-white transition-all duration-300 group-hover:text-purple-300">Web Soroban</span>
            </a>
          </h5>
          <p className="text-[#99a1af] transition-colors duration-300 hover:text-gray-300 leading-relaxed">
            The first free end-to-end code editor for Soroban smart contracts, designed to make development accessible and efficient for everyone.
          </p>
          <a
            href="#"
            className="mt-4 inline-flex items-center gap-2 text-xs text-white hover:text-purple-300 transition-all duration-300 group"
          >
            More about us <span className="inline-block size-[10px] rounded-full bg-white transition-all duration-300 group-hover:bg-purple-400 group-hover:scale-125" />
          </a>
        </div>

        {/* Links Section */}
        <div className="flex flex-col gap-8 md:items-end">
          <div className="space-y-4">
            <h5 className="text-lg font-medium text-white mb-4">Legal</h5>
            <div className="flex flex-col gap-3">
              <a
                href="/privacy-policy"
                className="text-[#99a1af] hover:text-purple-300 transition-all duration-300 relative group inline-block w-fit"
              >
                Privacy Policy
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-purple-600 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a
                href="/terms-of-service"
                className="text-[#99a1af] hover:text-purple-300 transition-all duration-300 relative group inline-block w-fit"
              >
                Terms of Service
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-purple-600 transition-all duration-300 group-hover:w-full"></span>
              </a>
            </div>
          </div>
        </div>

      </div>

      {/* Social Icons and Copyright Section */}
      <div className="relative z-20 flex flex-col gap-8">
        {/* Social Icons */}
        <div className="flex justify-center md:justify-start">
          <div className="flex gap-6">
            {socials.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className="group relative p-3 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:bg-purple-500/20 hover:scale-110 hover:-translate-y-1"
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
                title={item.name}
              >
                <div className="text-white group-hover:text-purple-300 transition-colors duration-300">
                  {item.icon}
                </div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/0 to-purple-600/0 group-hover:from-purple-500/20 group-hover:to-purple-600/20 transition-all duration-300"></div>
              </a>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-[#99a1af] transition-colors duration-300 hover:text-gray-300">
              © 2025 WebSoroban. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-xs text-[#99a1af]">
              <span className="transition-colors duration-300 hover:text-purple-300 cursor-pointer">
                Made with ❤️ for developers
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Animated Background Circles */}
      <div className="absolute top-1/2 -right-[40%] z-0 h-[120dvw] w-[120dvw] -translate-y-1/2 rounded-full bg-gradient-to-br from-purple-500/5 to-white/4 p-14 md:top-0 md:-right-[255px] md:-bottom-[450px] md:size-[1030px] md:-translate-y-0 md:p-20 animate-pulse">
        <div
          className="size-full rounded-full bg-gradient-to-br from-purple-400/5 to-white/4 p-14 md:p-20 animate-pulse"
          style={{ animationDelay: "1s" }}
        >
          <div
            className="size-full rounded-full bg-gradient-to-br from-purple-300/5 to-white/5 animate-pulse"
            style={{ animationDelay: "2s" }}
          />
        </div>
      </div>

      {/* Additional floating elements */}
      <div
        className="absolute top-20 left-10 w-2 h-2 bg-purple-400/30 rounded-full animate-bounce"
        style={{ animationDelay: "0.5s" }}
      ></div>
      <div
        className="absolute bottom-32 left-1/4 w-1 h-1 bg-purple-300/40 rounded-full animate-bounce"
        style={{ animationDelay: "1.5s" }}
      ></div>
      <div
        className="absolute top-1/3 left-1/3 w-1.5 h-1.5 bg-purple-500/20 rounded-full animate-bounce"
        style={{ animationDelay: "2.5s" }}
      ></div>
    </footer>
  )
}

export default PlaygroundFooter