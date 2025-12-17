"use client"

import React, { useState, useEffect } from 'react';
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
  Mail
} from 'lucide-react';
import { toast } from 'sonner';
import { WalletData } from './wallet-data';

interface NavbarProps {
  walletAddress: string | null;
  onConnectWallet: () => void;
  projectSelector?: React.ReactNode;
  onInviteClick?: () => void;
}

export function Navbar({ walletAddress, onConnectWallet, projectSelector, onInviteClick }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div className="h-16 bg-gradient-to-r from-slate-900 via-blue-900/20 to-slate-900 border-b border-slate-700/50 flex items-center justify-between px-6 backdrop-blur-md shadow-lg">
      {/* Left Section - Logo and Project Selector */}
      <div className="flex items-center space-x-8">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          {/* <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-slate-700 rounded-xl flex items-center justify-center shadow-lg">
            <Code2 className="w-6 h-6 text-white" />
          </div> */}
          <div className="flex flex-col">
            <span className="text-xl font-display bg-gradient-to-r from-blue-400 to-slate-200 bg-clip-text text-transparent tracking-tight">
              Web Soroban
            </span>
            <div className="flex items-center space-x-1">
              <Star className="w-3 h-3 text-yellow-400" />
              <span className="text-xs text-slate-400 font-medium">Stellar IDE</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-slate-600/50"></div>

        {/* Project Selector */}
        {projectSelector && (
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-blue-400" />
            {projectSelector}
          </div>
        )}
      </div>

      {/* Center Section - Search (Optional) */}
      <div className="hidden lg:flex items-center space-x-4 flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search files, functions, or documentation..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Right Section - Actions and Wallet */}
      <div className="flex items-center space-x-4">
        {/* Network Status */}
        <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-slate-800/50 rounded-lg border border-slate-600/30">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-slate-300 font-medium">Testnet</span>
        </div>

        {/* Invite Code Button */}
        {onInviteClick && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onInviteClick}
            className="text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
            title="Enter Invite Code"
          >
            <Mail className="w-4 h-4" />
          </Button>
        )}

        {/* Notifications */}
        <Button
          variant="ghost"
          size="sm"
          className="text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
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
              className="text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
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
            <DropdownMenuItem className="text-slate-200 hover:bg-slate-700">
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
          className="lg:hidden text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
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
