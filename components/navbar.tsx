"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import {
  Wallet,
  LogOut,
  Code2,
  Zap,
  Star,
  Settings,
  HelpCircle,
  Github,
  ExternalLink,
  Globe,
  Activity,
  Bell,
  Search,
  Menu,
  X,
  Mail,
  Wrench,
  FileCode,
  PlayCircle,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { WalletData } from './wallet-data';
import { useAuth } from '@/contexts/AuthContext';
import { useWalletKit } from '@/contexts/WalletKitContext';
import { User } from '@/lib/api';
import { Crown, LogIn } from 'lucide-react';

interface NavbarProps {
  walletAddress: string | null;
  onConnectWallet: () => void;
  projectSelector?: React.ReactNode;
  onInviteClick?: () => void;
  user?: User | null;
  onLoginClick?: () => void;
  onSubscriptionClick?: () => void;
  onHowItWorksClick?: () => void;
}

export function Navbar({ walletAddress, onConnectWallet, projectSelector, onInviteClick, user, onLoginClick, onSubscriptionClick, onHowItWorksClick }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { logout } = useAuth();
  const { address, disconnect } = useWalletKit();

  return (
    <div className="relative h-16 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/70 flex items-center justify-between px-6 backdrop-blur-md shadow-xl">
      {/* Subtle brand-color top accent line */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#A3FF12]/40 to-transparent" />

      {/* Left Section - Logo and Project Selector */}
      <div className="flex items-center space-x-6">
        {/* Logo */}
        <Link href="/" className="group flex items-center space-x-3">
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 rounded-xl bg-[#A3FF12]/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <img
              src="/websoroban_logo.png"
              alt="WebSoroban"
              className="relative w-10 h-10 object-contain drop-shadow-[0_0_10px_rgba(163,255,18,0.35)] transition-transform duration-300 group-hover:scale-110"
            />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-lg font-bold bg-gradient-to-r from-[#A3FF12] via-blue-300 to-[#FF4CF0] bg-clip-text text-transparent tracking-tight">
              WebSoroban
            </span>
            <div className="flex items-center space-x-1.5">
              <Star className="w-3 h-3 text-[#F9F871] fill-[#F9F871]" />
              <span className="text-[10px] uppercase tracking-[0.18em] text-slate-400 font-semibold">
                Stellar · Soroban IDE
              </span>
            </div>
          </div>
        </Link>

        {/* Divider */}
        <div className="w-px h-8 bg-gradient-to-b from-transparent via-slate-600/70 to-transparent"></div>

        {/* Project Selector */}
        {projectSelector && (
          <div className="flex items-center space-x-2 px-2 py-1 bg-slate-800/50 rounded-lg border border-slate-600/50 hover:border-[#A3FF12]/40 transition-colors duration-300">
            <Zap className="w-4 h-4 text-[#F9F871]" />
            {projectSelector}
          </div>
        )}
      </div>

      {/* Center Section - Search (Optional) */}
      <div className="hidden lg:flex items-center space-x-4 flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-400" />
          <input
            type="text"
            placeholder="Search files, functions, or documentation..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800/70 border-2 border-slate-600/50 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 shadow-lg shadow-blue-500/10"
          />
        </div>
      </div>

      {/* Right Section - Actions and Wallet */}
      <div className="flex items-center space-x-3">
        {/* Network Status */}
        <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-green-500/15 rounded-lg border border-green-400/40 shadow-lg shadow-green-500/10">
          <div className="relative">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 w-2 h-2 bg-green-400 rounded-full animate-ping opacity-75"></div>
          </div>
          <span className="text-sm text-green-300 font-semibold">Testnet</span>
        </div>

        {/* How It Works */}
        {onHowItWorksClick && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onHowItWorksClick}
            className="group relative text-slate-300 hover:text-[#A3FF12] hover:bg-[#A3FF12]/10 border border-[#A3FF12]/30 hover:border-[#A3FF12]/60 rounded-lg px-2 md:px-3 transition-all duration-300"
            title="Watch how WebSoroban works"
          >
            <PlayCircle className="h-4 w-4 md:mr-1.5 group-hover:scale-110 transition-transform duration-300" />
            <span className="hidden md:inline text-sm font-medium">How it works</span>
            <span className="absolute -top-1 -right-1 hidden md:flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#A3FF12] opacity-60"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#A3FF12]"></span>
            </span>
          </Button>
        )}

        {/* Templates */}
        <Link href="/marketplace">
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-300 hover:text-white hover:bg-slate-700/70 border border-slate-600/30 hover:border-[#FF4CF0]/40 rounded-lg px-2 md:px-3 transition-all duration-300"
            title="Template Library"
          >
            <FileCode className="h-4 w-4 md:mr-1.5" />
            <span className="hidden md:inline text-sm font-medium">Templates</span>
          </Button>
        </Link>

        {/* Developer Tools */}
        <Link href="/dashboard/api-keys">
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-300 hover:text-white hover:bg-slate-700/70 border border-slate-600/30 rounded-lg px-2"
            title="Developer Tools"
          >
            <Wrench className="h-4 w-4" />
          </Button>
        </Link>

        {/* User Info / Login */}
        {user ? (
          <>
            {/* Subscription Plan Badge */}
            <Badge 
              variant="outline" 
              className={`
                px-3 py-1.5 font-semibold text-sm border-2 shadow-lg
                ${user.subscription.plan === 'free' 
                  ? 'border-slate-500 text-slate-300 bg-slate-800/80' 
                  : user.subscription.plan === 'plan2'
                  ? 'border-blue-500 text-blue-300 bg-blue-500/20 shadow-blue-500/20'
                  : 'border-yellow-500 text-yellow-300 bg-yellow-500/20 shadow-yellow-500/20'
                }
              `}
            >
              {user.subscription.plan === 'free' && 'Free'}
              {user.subscription.plan === 'plan2' && 'Pro'}
              {user.subscription.plan === 'plan3' && (
                <span className="flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5" />
                  Premium
                </span>
              )}
            </Badge>
            
            {/* Subscription Button */}
            {onSubscriptionClick && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onSubscriptionClick}
                className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-2"
                title="Manage Subscription"
              >
                <Crown className="w-4 h-4" />
              </Button>
            )}
            
            {/* User Email */}
            <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-slate-800/70 rounded-lg border border-slate-600/50">
              <Mail className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-sm text-slate-200 font-medium">
                {user.email}
              </span>
            </div>
          </>
        ) : (
          onLoginClick && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onLoginClick}
              className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 border border-blue-500/30 rounded-lg px-3"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Sign In
            </Button>
          )
        )}

        {/* Notifications */}
        <Button
          variant="ghost"
          size="sm"
          className="text-slate-300 hover:text-white hover:bg-slate-700/70 border border-slate-600/30 rounded-lg px-2"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
        </Button>

        {/* Help & Documentation */}


        {/* Settings */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-300 hover:text-white hover:bg-slate-700/70 border border-slate-600/30 rounded-lg px-2"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48 bg-slate-800 border-slate-700">
            <DropdownMenuItem className="text-slate-200 hover:bg-slate-700">
              <Activity className="w-4 h-4 mr-2" />
              Performance
            </DropdownMenuItem>
            <DropdownMenuItem className="text-slate-200 hover:bg-slate-700">
              <Code2 className="w-4 h-4 mr-2" />
              Editor Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-600" />
            {onSubscriptionClick && (
              <DropdownMenuItem 
                className="text-slate-200 hover:bg-slate-700"
                onClick={onSubscriptionClick}
              >
                <Crown className="w-4 h-4 mr-2" />
                Subscription
              </DropdownMenuItem>
            )}
            {address && (
              <>
                <DropdownMenuSeparator className="bg-slate-600" />
                <DropdownMenuItem 
                  className="text-slate-200 hover:bg-slate-700"
                  onClick={() => {
                    disconnect();
                    toast.success('Wallet disconnected');
                  }}
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  Disconnect Wallet
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator className="bg-slate-600" />
            <DropdownMenuItem 
              className="text-slate-200 hover:bg-slate-700"
              onClick={async () => {
                await logout();
                toast.success('Logged out successfully');
              }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Wallet Data */}
        <WalletData />

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden text-slate-300 hover:text-white hover:bg-slate-700/70 border border-slate-600/30 rounded-lg px-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-slate-900/95 border-b border-slate-700 backdrop-blur-md lg:hidden">
          <div className="p-4 space-y-4">
            {/* Mobile Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Mobile Network Status */}
            <div className="flex items-center space-x-2 px-3 py-2 bg-slate-800/50 rounded-lg border border-slate-600/30">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-slate-300 font-medium">Testnet Connected</span>
            </div>

            {/* Mobile Menu Items */}
            <div className="space-y-2">
              {onHowItWorksClick && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onHowItWorksClick();
                  }}
                  className="w-full justify-start text-[#A3FF12] hover:bg-[#A3FF12]/10 border border-[#A3FF12]/30"
                >
                  <PlayCircle className="w-4 h-4 mr-2" />
                  How it works
                </Button>
              )}
              <Link href="/marketplace" onClick={() => setIsMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start text-slate-200 hover:bg-slate-700">
                  <FileCode className="w-4 h-4 mr-2" />
                  Templates
                </Button>
              </Link>
              <Button variant="ghost" className="w-full justify-start text-slate-200 hover:bg-slate-700">
                <HelpCircle className="w-4 h-4 mr-2" />
                Documentation
              </Button>
              <Button variant="ghost" className="w-full justify-start text-slate-200 hover:bg-slate-700">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button variant="ghost" className="w-full justify-start text-slate-200 hover:bg-slate-700">
                <Github className="w-4 h-4 mr-2" />
                GitHub
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
