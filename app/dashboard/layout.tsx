"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Code2, Key, Webhook, Terminal, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard/api-keys", label: "API Keys", icon: Key },
  { href: "/dashboard/webhooks", label: "Webhooks", icon: Webhook },
  { href: "/dashboard/rpc", label: "RPC Tester", icon: Terminal },
  { href: "/explorer", label: "Explorer", icon: Search },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container flex h-14 items-center px-4">
          <Link href="/ide" className="flex items-center gap-2 font-semibold mr-8">
            <Code2 className="h-5 w-5" />
            Web Soroban
          </Link>
          <nav className="flex items-center gap-1">
            {nav.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    pathname === item.href || (item.href !== "/explorer" && pathname.startsWith(item.href))
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="container py-6 px-4">{children}</main>
    </div>
  );
}
