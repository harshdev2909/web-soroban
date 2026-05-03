'use client'

import { useEffect, useRef, useState } from 'react'
import PlaygroundNavbar from '@/components/playground-navbar'
import PlaygroundFooter from '@/components/playground-footer'
import PlaygroundSubscription from '@/components/playground-subscription'
import { LoginModal } from '@/components/login-modal'
import { useAuth } from '@/contexts/AuthContext'
import { Cloud, Bot, Rocket } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
  const stepsRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const router = useRouter()
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in')
        }
      })
    }, observerOptions)

    // Observe all animated elements
    const animatedElements = document.querySelectorAll('.animate-on-scroll')
    animatedElements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.playbackRate = 2.0
    const onLoaded = () => {
      v.playbackRate = 2.0
    }
    v.addEventListener('loadedmetadata', onLoaded)
    return () => v.removeEventListener('loadedmetadata', onLoaded)
  }, [])

  const handleLoginSuccess = () => {
    setIsLoginModalOpen(false)
    router.push('/ide')
  }

  return (
    <main className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Login Modal */}
      <LoginModal
        open={isLoginModalOpen}
        onOpenChange={setIsLoginModalOpen}
      />
      
      <div className="animate-fade-in">
        <PlaygroundNavbar onSignInClick={() => setIsLoginModalOpen(true)} />
      </div>

      {/* Hero Section */}
      <section className="relative px-4 py-16 md:py-24 overflow-hidden">
        <div className="container mx-auto max-w-6xl relative z-10" ref={heroRef}>
          <div className="flex flex-col items-center text-center space-y-8">
            <h1 className="text-4xl md:text-6xl lg:text-8xl font-bold animate-on-scroll opacity-0 translate-y-8 transition-all duration-1000 delay-200">
              <span className="text-[#F9F871] inline-block animate-bounce-subtle">Shipping Soroban</span>{' '}
              <span className="text-[#F9F871] inline-block animate-bounce-subtle animation-delay-200">Straight</span>{' '}
              <span className="text-[#FF4CF0] inline-block animate-bounce-subtle animation-delay-400">
                to your browser
              </span>
            </h1>

            <div className="relative animate-on-scroll opacity-0 translate-y-8 transition-all duration-1000 delay-500">
              <button
                onClick={() => {
                  if (isAuthenticated) {
                    router.push('/ide')
                  } else {
                    setIsLoginModalOpen(true)
                  }
                }}
                className="relative mx-auto bg-gradient-to-r from-[#A3FF12] to-[#8FE600] hover:from-[#8FE600] hover:to-[#7BD300] rounded-xl w-64 h-20 shadow-[8px_0_16px_rgba(160,32,240,0.8)] z-10 transform translate-y-6 hover:scale-105 hover:shadow-[12px_0_24px_rgba(160,32,240,1)] transition-all duration-300 animate-pulse-glow group active:scale-95 flex items-center justify-center"
              >
                <span className="text-black font-bold text-xl tracking-wide group-hover:scale-110 transition-transform duration-200">
                  Code Now
                </span>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
              <img
                src="/placeholder.svg?height=400&width=400"
                alt="Ellipse"
                className="absolute -mt-24 items-start -left-24 -top-72 -z-10 animate-float opacity-30"
              />
            </div>
          </div>
        </div>

        {/* Floating background elements */}
        <div className="absolute top-20 left-10 w-4 h-4 bg-[#A3FF12] rounded-full animate-float animation-delay-1000 opacity-60"></div>
        <div className="absolute top-40 right-20 w-6 h-6 bg-[#FF4CF0] rounded-full animate-float animation-delay-1500 opacity-40"></div>
        <div className="absolute bottom-20 left-1/4 w-3 h-3 bg-[#F9F871] rounded-full animate-float animation-delay-2000 opacity-50"></div>
      </section>

      <div className="border border-white rounded-3xl mx-auto max-w-5xl mt-4 mb-10 animate-on-scroll opacity-0 translate-y-8 transition-all duration-1000 delay-300 hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(160,32,240,0.3)]">
        {/* Playground Section */}
        <section className="relative">
          <img src="/ellipse2.png" alt="Ellipse 2" className="absolute top-0 -left-96 px-96 z-10" />
          <img src="/dot.png" alt="dot" className="absolute -top-4 -left-96 px-96 z-0" />
          <div className="relative mx-32 rounded-xl w-[729px] h-[470px] shadow-[8px_0_16px_rgba(160,32,240,0.8)] z-10 transform translate-y-16 hover:shadow-[12px_0_24px_rgba(160,32,240,1)] transition-all duration-500 hover:scale-[1.02] group">
            <img 
              src="/playground.png" 
              alt="Playground" 
              className="absolute -top-2 z-20 rounded-xl group-hover:brightness-110 transition-all duration-300" 
            />
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>
              </div>
        </section>

        {/* Why WebSoroban Section */}
        <section className="py-32 bg-black">
          <div className="container mx-auto flex">
            <div>
              <img src="/semi.png" alt="Semi Circle" className="top-0 left-28 w-full h-full z-0" />
            </div>
            <div className="animate-on-scroll opacity-0 translate-x-8 transition-all duration-1000">
              <h2 className="text-6xl font-bold mb-2 mt-12 px-24 text-white">
                Why{' '}
                <span className="bg-gradient-to-r from-[#A3FF12] via-[#FF4CF0] to-[#F9F871] bg-clip-text text-transparent animate-gradient-x">
                  WebSoroban
                </span>
                ?
              </h2>
              <p className="text-gray-400 mb-12 max-w-2xl px-24 animate-on-scroll opacity-0 translate-y-4 transition-all duration-1000 delay-200">
                WebSoroban simplifies Soroban smart contract development, making it accessible for both beginners and
                experts.
              </p>
            </div>
          </div>

          <div className="container mx-auto max-w-6xl text-center" ref={featuresRef}>
            <div className="flex flex-wrap justify-center gap-8">
              <div className="feature-card animate-on-scroll opacity-0 translate-y-8 transition-all duration-1000 delay-100 flex flex-col items-center justify-center bg-[#1C2126] rounded-xl w-64 h-72 shadow-[8px_0_16px_rgba(160,32,240,0.8)] z-10 transform translate-y-16 p-6 hover:scale-105 hover:shadow-[12px_0_24px_rgba(160,32,240,1)] hover:bg-[#252A30] group cursor-pointer">
                <Cloud className="w-12 h-12 text-[#A3FF12] mb-4 group-hover:scale-110 group-hover:animate-bounce transition-all duration-300" />
                <h3 className="text-xl font-bold mb-3 text-white group-hover:text-[#A3FF12] transition-colors duration-300">
                  Zero-setup IDE
                </h3>
                <p className="text-gray-400 text-sm text-center group-hover:text-gray-300 transition-colors duration-300">
                  Code, test, and deploy Soroban contracts instantly with our cloud-based IDE.
                </p>
              </div>

              <div className="feature-card animate-on-scroll opacity-0 translate-y-8 transition-all duration-1000 delay-300 flex flex-col items-center justify-center mt-20 bg-[#1C2126] rounded-xl w-64 h-72 shadow-[8px_0_16px_rgba(160,32,240,0.8)] z-10 transform translate-y-16 p-6 hover:scale-105 hover:shadow-[12px_0_24px_rgba(160,32,240,1)] hover:bg-[#252A30] group cursor-pointer">
                <Bot className="w-12 h-12 text-[#FF4CF0] mb-4 group-hover:scale-110 group-hover:animate-pulse transition-all duration-300" />
                <h3 className="text-xl font-bold mb-3 text-white group-hover:text-[#FF4CF0] transition-colors duration-300">
                  AI Copilot
                </h3>
                <p className="text-gray-400 text-sm text-center group-hover:text-gray-300 transition-colors duration-300">
                  Generate, debug, and optimize contracts with natural language prompts.
                </p>
              </div>

              <div className="feature-card animate-on-scroll opacity-0 translate-y-8 transition-all duration-1000 delay-500 flex flex-col items-center justify-center mt-56 bg-[#1C2126] rounded-xl w-64 h-72 shadow-[8px_0_16px_rgba(160,32,240,0.8)] z-10 transform translate-y-16 p-6 hover:scale-105 hover:shadow-[12px_0_24px_rgba(160,32,240,1)] hover:bg-[#252A30] group cursor-pointer">
                <Rocket className="w-12 h-12 text-[#F9F871] mb-4 group-hover:scale-110 group-hover:animate-bounce transition-all duration-300" />
                <h3 className="text-xl font-bold mb-3 text-white group-hover:text-[#F9F871] transition-colors duration-300">
                  One-click Deploy
                </h3>
                <p className="text-gray-400 text-sm text-center group-hover:text-gray-300 transition-colors duration-300">
                  Directly push to Stellar testnet/mainnet with a single click.
                </p>
            </div>
          </div>
        </div>
      </section>

        {/* How It Works — Video Section */}
        <section className="py-24 bg-black relative overflow-hidden">
          <div className="absolute top-1/3 -left-20 w-72 h-72 bg-[#A3FF12]/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-[#FF4CF0]/10 rounded-full blur-3xl animate-pulse-slow animation-delay-1000" />

          <div className="container mx-auto max-w-6xl px-6 relative z-10">
            <div className="text-center mb-14 animate-on-scroll opacity-0 translate-y-4 transition-all duration-1000">
              <span className="inline-block text-xs uppercase tracking-[0.3em] text-[#A3FF12] mb-4 font-mono">
                How It Works
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                See{' '}
                <span className="bg-gradient-to-r from-[#A3FF12] via-[#FF4CF0] to-[#F9F871] bg-clip-text text-transparent animate-gradient-x">
                  WebSoroban
                </span>{' '}
                in Action
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                From a blank editor to a live contract on Stellar — watch the entire workflow happen
                in your browser. No installs, no toolchain headaches, no context switches.
              </p>
            </div>

            <div className="grid lg:grid-cols-5 gap-8 items-center">
              <div className="lg:col-span-3 animate-on-scroll opacity-0 translate-y-8 transition-all duration-1000 delay-200">
                <div className="relative rounded-2xl overflow-hidden border border-purple-500/30 shadow-[0_0_40px_rgba(160,32,240,0.4)] hover:shadow-[0_0_60px_rgba(160,32,240,0.7)] transition-all duration-500 group bg-[#0a0a0a]">
                  <video
                    ref={videoRef}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="metadata"
                    className="w-full h-auto block"
                  >
                    <source src="/howitworks.mp4" type="video/mp4" />
                    <source src="/howitworks.mov" type="video/quicktime" />
                  </video>
                  <div className="absolute top-3 right-3 flex items-center gap-2 bg-black/70 backdrop-blur-sm text-[#A3FF12] text-xs font-mono px-3 py-1.5 rounded-md border border-[#A3FF12]/30">
                    <span className="w-2 h-2 rounded-full bg-[#A3FF12] animate-pulse" />
                    LIVE · 2× speed
                  </div>
                  <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm text-gray-300 text-xs font-mono px-3 py-1.5 rounded-md border border-white/10">
                    websoroban.dev/ide
                  </div>
                </div>
                <p className="text-gray-500 text-xs text-center mt-4 italic">
                  Real recording — no edits, no fake terminals. What you see is what you ship.
                </p>
              </div>

              <div className="lg:col-span-2 space-y-5 animate-on-scroll opacity-0 translate-x-8 transition-all duration-1000 delay-400">
                {[
                  {
                    color: '#A3FF12',
                    step: '01',
                    title: 'Spin Up Instantly',
                    desc: 'Open a fresh Soroban project in one click — no Rust toolchain, no cargo, no Docker.',
                  },
                  {
                    color: '#FF4CF0',
                    step: '02',
                    title: 'Compile in the Browser',
                    desc: 'WASM builds run client-side with sub-second feedback as you type.',
                  },
                  {
                    color: '#F9F871',
                    step: '03',
                    title: 'Simulate & Test',
                    desc: 'Mock invocations against a sandboxed VM with realistic gas estimates.',
                  },
                  {
                    color: '#A3FF12',
                    step: '04',
                    title: 'Deploy in One Click',
                    desc: 'Push directly to Stellar Testnet or Mainnet from the editor — keys never leave your browser.',
                  },
                ].map((item) => (
                  <div
                    key={item.step}
                    className="flex gap-4 group p-4 rounded-xl border border-white/5 hover:border-white/20 hover:bg-white/[0.02] transition-all duration-300 cursor-pointer"
                  >
                    <div
                      className="font-mono text-xs font-bold flex-shrink-0 mt-1 group-hover:scale-110 transition-transform duration-300"
                      style={{ color: item.color }}
                    >
                      {item.step}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-white mb-1">{item.title}</h4>
                      <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                    <div
                      className="w-1 self-stretch rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ backgroundColor: item.color, boxShadow: `0 0 12px ${item.color}` }}
                    />
                  </div>
                ))}

                <div className="flex items-center gap-6 pt-4 border-t border-white/10 text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#A3FF12]" />
                    Avg. first deploy in &lt; 90s
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF4CF0]" />
                    Zero local setup
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Steps Section */}
        <section className="py-20" ref={stepsRef}>
          <div className="container mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-12 animate-on-scroll opacity-0 translate-y-4 transition-all duration-1000">
              Get Started in{' '}
              <span className="bg-gradient-to-r from-[#A3FF12] to-[#FF4CF0] bg-clip-text text-transparent">
                Three Easy Steps
              </span>
          </h2>

            <div className="flex gap-10 px-24 animate-on-scroll opacity-0 translate-x-8 transition-all duration-1000 delay-200">
              <div className="step-card flex flex-col items-start justify-start bg-[#1C2126] rounded-xl w-96 h-64 shadow-[8px_0_16px_rgba(160,32,240,0.8)] border border-purple-500/20 z-10 p-8 hover:scale-105 hover:shadow-[12px_0_24px_rgba(160,32,240,1)] hover:border-[#A3FF12]/50 transition-all duration-500 group cursor-pointer">
                <div className="bg-[#A3FF12] rounded-full w-12 h-12 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:animate-pulse transition-all duration-300">
                  <span className="text-black font-bold text-xl">1</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-[#A3FF12] transition-colors duration-300">
                  Test
                </h3>
                <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-300">
                  Run contracts in-browser via WASM sandbox
                </p>
              </div>
              <img src="/Vector.png" alt="Vector" className="mt-28 z-10 animate-pulse-slow opacity-60" />
            </div>
            
            <div className="flex gap-10 mt-10 px-32 animate-on-scroll opacity-0 translate-x-8 transition-all duration-1000 delay-400">
              <img src="/turn.png" alt="Vector" className="mt-36 z-10 animate-pulse-slow opacity-60" />
              <div className="step-card flex flex-col items-start justify-start bg-[#1C2126] rounded-xl w-96 h-64 shadow-[8px_0_16px_rgba(160,32,240,0.8)] border border-purple-500/20 z-10 p-8 hover:scale-105 hover:shadow-[12px_0_24px_rgba(160,32,240,1)] hover:border-[#FF4CF0]/50 transition-all duration-500 group cursor-pointer">
                <div className="bg-[#FF4CF0] rounded-full w-12 h-12 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:animate-pulse transition-all duration-300">
                  <span className="text-white font-bold text-xl">2</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-[#FF4CF0] transition-colors duration-300">
                  Simulate
                </h3>
                <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-300">
                  Mock transactions with real gas fee estimates
                </p>
              </div>
            </div>

            <div className="flex gap-10 mt-10 px-10 animate-on-scroll opacity-0 translate-x-8 transition-all duration-1000 delay-600">
              <div className="step-card flex flex-col items-start justify-start bg-[#1C2126] rounded-xl w-96 h-64 shadow-[8px_0_16px_rgba(160,32,240,0.8)] border border-purple-500/20 z-10 p-8 hover:scale-105 hover:shadow-[12px_0_24px_rgba(160,32,240,1)] hover:border-[#F9F871]/50 transition-all duration-500 group cursor-pointer">
                <div className="bg-[#F9F871] rounded-full w-12 h-12 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:animate-pulse transition-all duration-300">
                  <span className="text-black font-bold text-xl">3</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-[#F9F871] transition-colors duration-300">
                  Deploy
                </h3>
                <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-300">
                  Push to Stellar Testnet/mainnet with one click
                </p>
              </div>
            </div>
          </div>
        </section>
        </div>
      <PlaygroundSubscription />
      <PlaygroundFooter />
    </main>
  )
}