"use client"

import React from 'react';
import { Calendar, Clock, Globe, Activity, Copy, Wallet, Rocket, PanelRightClose } from 'lucide-react';
import { Project } from '@/lib/api';
import { InvokePanel } from '@/components/invoke-panel';
import { cn, copyToClipboard as copyText } from '@/lib/utils';
import { useNetwork } from '@/contexts/NetworkContext';
import { getNetwork } from '@/lib/networks';
import { toast } from 'sonner';

interface RightPanelProps {
  project: Project;
  onClose?: () => void;
  walletAddress?: string;
  /** rendered inside the shared right-dock (the dock owns the title bar) */
  embedded?: boolean;
}

export function RightPanel({ project, onClose, walletAddress, embedded }: RightPanelProps) {
  const { network } = useNetwork();
  const net = getNetwork(network);

  // Resolve the contract for the ACTIVE network. A testnet contract is distinct
  // from a mainnet one, so never show another network's id. Prefer the latest
  // successful deployment on this network; fall back to the project's current
  // pointer only when it was deployed to the active network.
  const deployedOnNet = (project.deploymentHistory || []).find(
    (d) => (d.network || 'testnet') === network && d.status === 'success' && d.contractAddress,
  );
  const contractId =
    deployedOnNet?.contractAddress ||
    ((project.network || 'testnet') === network ? project.contractAddress : undefined);
  const deployedAt =
    deployedOnNet?.timestamp ||
    ((project.network || 'testnet') === network ? project.lastDeployed : undefined);
  const isDeployed = Boolean(contractId);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });

  const truncateMiddle = (s: string, head = 6, tail = 6) =>
    s.length > head + tail + 1 ? `${s.slice(0, head)}…${s.slice(-tail)}` : s;

  const copyValue = async (value: string, label: string) => {
    if (await copyText(value)) toast.success(`${label} copied`);
  };

  return (
    <div className={cn('relative flex h-full flex-col overflow-hidden bg-sidebar', !embedded && 'border-l border-border')}>
      {/* Header — omitted when embedded (the right-dock provides the title bar) */}
      {!embedded && (
        <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-brand/12 text-brand">
              <Activity className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-foreground">Contract</h2>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Invoke &amp; test</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              title="Hide panel"
              aria-label="Hide panel"
            >
              <PanelRightClose className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 space-y-4 overflow-y-auto p-3">
        {/* Invoke — only meaningful once a contract is deployed */}
        {isDeployed ? (
          <InvokePanel key={`${network}:${contractId}`} contractId={contractId!} />
        ) : (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border/70 px-4 py-10 text-center">
            <Rocket className="h-6 w-6 text-muted-foreground/50" />
            <p className="text-xs text-foreground">No contract on {net.label} yet</p>
            <p className="max-w-[15rem] text-[11px] text-muted-foreground/70">
              Deploy to {net.label} to generate a type-aware invoke form from the contract&apos;s interface.
            </p>
          </div>
        )}

        {/* Consolidated info — Created · Last deployed · Network + RPC + IDs */}
        <section className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              <Globe className="h-3.5 w-3.5 text-brand" /> Info
            </div>
            <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10px]', net.badgeClass)}>
              <span className="relative flex h-1.5 w-1.5">
                <span className={cn('absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 motion-reduce:hidden', net.dotClass)} />
                <span className={cn('relative inline-flex h-1.5 w-1.5 rounded-full', net.dotClass)} />
              </span>
              {net.label}
            </span>
          </div>

          <dl className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between gap-3">
              <dt className="flex items-center gap-1.5 text-muted-foreground"><Calendar className="h-3.5 w-3.5" /> Created</dt>
              <dd className="truncate font-mono-tnum text-foreground/90">{formatDate(project.createdAt)}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="flex items-center gap-1.5 text-muted-foreground"><Clock className="h-3.5 w-3.5" /> Last deployed</dt>
              <dd className={cn('truncate font-mono-tnum', deployedAt ? 'text-foreground/90' : 'italic text-muted-foreground/60')}>
                {deployedAt ? formatDate(deployedAt) : `Never on ${net.label}`}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="flex items-center gap-1.5 text-muted-foreground"><Globe className="h-3.5 w-3.5" /> RPC</dt>
              <dd className="truncate font-mono text-[11px] text-muted-foreground">{net.isMainnet ? 'mainnet RPC' : 'soroban-testnet.stellar.org'}</dd>
            </div>
            {walletAddress && (
              <div className="flex items-center justify-between gap-3">
                <dt className="flex items-center gap-1.5 text-muted-foreground"><Wallet className="h-3.5 w-3.5" /> Deploy wallet</dt>
                <dd>
                  <button
                    onClick={() => copyValue(walletAddress, 'Wallet address')}
                    className="font-mono text-[11px] text-foreground/90 transition-colors hover:text-brand"
                    title={walletAddress}
                  >
                    {truncateMiddle(walletAddress)}
                  </button>
                </dd>
              </div>
            )}
          </dl>

          {/* Contract ID */}
          <div className="mt-3 border-t border-border/60 pt-3">
            <div className="mb-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Contract ID</div>
            {isDeployed ? (
              <button
                onClick={() => copyValue(contractId!, 'Contract ID')}
                className="group flex w-full items-start gap-2 rounded-md bg-background/60 p-2 text-left transition-colors hover:bg-accent"
                title="Copy contract ID"
              >
                <span className="min-w-0 flex-1 break-all font-mono text-[11px] text-foreground/90">{contractId}</span>
                <Copy className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-brand" />
              </button>
            ) : (
              <div className="rounded-md border border-dashed border-border/70 px-2.5 py-3 text-center font-mono text-[11px] text-muted-foreground/60">
                No {net.label} deploy yet
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
