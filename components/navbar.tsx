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
  FileCode
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
}

export function Navbar({ walletAddress, onConnectWallet, projectSelector, onInviteClick, user, onLoginClick, onSubscriptionClick }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { logout } = useAuth();
  const { address, disconnect } = useWalletKit();

  return (
    <div className="h-16 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b-2 border-slate-700/70 flex items-center justify-between px-6 backdrop-blur-md shadow-xl">
      {/* Left Section - Logo and Project Selector */}
      <div className="flex items-center space-x-8">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Code2 className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 via-blue-300 to-slate-200 bg-clip-text text-transparent tracking-tight drop-shadow-sm">
              Web Soroban
            </span>
            <div className="flex items-center space-x-1">
              <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
              <span className="text-xs text-slate-300 font-semibold">Stellar IDE</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-slate-600/70"></div>

        {/* Project Selector */}
        {projectSelector && (
          <div className="flex items-center space-x-2 px-2 py-1 bg-slate-800/50 rounded-lg border border-slate-600/50">
            <Zap className="w-4 h-4 text-yellow-400" />
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
        <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-green-500/20 rounded-lg border border-green-400/50 shadow-lg shadow-green-500/10">
          <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse shadow-sm shadow-green-400"></div>
          <span className="text-sm text-green-300 font-semibold">Testnet</span>
        </div>

        {/* Templates */}
        <Link href="/marketplace">
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-300 hover:text-white hover:bg-slate-700/70 border border-slate-600/30 rounded-lg px-2 md:px-3"
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
