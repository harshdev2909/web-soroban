"use client"

import React from 'react';
import { Copy, Rocket, PanelRightClose } from 'lucide-react';
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

  const infoRows: { label: string; value: React.ReactNode }[] = [
    { label: 'Created', value: <span className="font-mono-tnum text-foreground">{formatDate(project.createdAt)}</span> },
    {
      label: 'Last deployed',
      value: deployedAt
        ? <span className="font-mono-tnum text-foreground">{formatDate(deployedAt)}</span>
        : <span className="font-mono text-muted-foreground/70">never on {net.label}</span>,
    },
    { label: 'RPC', value: <span className="font-mono text-muted-foreground">{net.isMainnet ? 'mainnet RPC' : 'soroban-testnet.stellar.org'}</span> },
  ];

  return (
    <div className={cn('relative flex h-full flex-col overflow-hidden bg-sidebar', !embedded && 'border-l border-border')}>
      {/* Header — omitted when embedded (the right-dock provides the title bar) */}
      {!embedded && (
        <div className="flex h-9 shrink-0 items-center justify-between border-b border-border px-3">
          <h2 className="eyebrow flex items-center gap-2 text-foreground">
            Contract
            <span className="text-muted-foreground">· invoke &amp; test</span>
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              className="grid h-7 w-7 place-items-center rounded-sm text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-foreground"
              title="Hide panel"
              aria-label="Hide panel"
            >
              <PanelRightClose className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 space-y-3 overflow-y-auto p-3">
        {/* Invoke — only meaningful once a contract is deployed */}
        {isDeployed ? (
          <InvokePanel key={`${network}:${contractId}`} contractId={contractId!} />
        ) : (
          <div className="flex flex-col items-center gap-2 rounded-md border border-dashed border-border px-4 py-10 text-center">
            <Rocket className="h-5 w-5 text-muted-foreground/60" />
            <p className="text-xs text-foreground">No contract on {net.label} yet</p>
            <p className="max-w-[15rem] text-[11px] leading-5 text-muted-foreground">
              Deploy to {net.label} to generate a type-aware invoke form from the contract&apos;s interface.
            </p>
          </div>
        )}

        {/* Consolidated info — Created · Last deployed · Network + RPC + IDs */}
        <section className="rounded-md border border-border bg-card/40">
          <div className="flex h-8 items-center justify-between border-b border-border px-3">
            <span className="eyebrow">Info</span>
            <span className={cn('inline-flex items-center gap-1.5 rounded-sm border px-1.5 py-0.5 font-mono text-[0.62rem] uppercase tracking-[0.14em]', net.badgeClass)}>
              <span className="relative flex h-1.5 w-1.5">
                <span className={cn('absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 motion-reduce:hidden', net.dotClass)} />
                <span className={cn('relative inline-flex h-1.5 w-1.5 rounded-full', net.dotClass)} />
              </span>
              {net.label}
            </span>
          </div>

          <dl className="px-3 text-[11px]">
            {infoRows.map((row, index) => (
              <div key={row.label} className={cn('flex items-center justify-between gap-3 py-2', index > 0 && 'border-t border-border')}>
                <dt className="font-mono uppercase tracking-[0.12em] text-muted-foreground">{row.label}</dt>
                <dd className="min-w-0 truncate text-right">{row.value}</dd>
              </div>
            ))}
            {walletAddress && (
              <div className="flex items-center justify-between gap-3 border-t border-border py-2">
                <dt className="font-mono uppercase tracking-[0.12em] text-muted-foreground">Deploy wallet</dt>
                <dd>
                  <button
                    onClick={() => copyValue(walletAddress, 'Wallet address')}
                    className="font-mono text-foreground transition-colors duration-150 hover:text-brand"
                    title={walletAddress}
                  >
                    {truncateMiddle(walletAddress)}
                  </button>
                </dd>
              </div>
            )}
          </dl>

          {/* Contract ID */}
          <div className="border-t border-border p-3">
            <div className="mb-1.5 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground">Contract ID</div>
            {isDeployed ? (
              <button
                onClick={() => copyValue(contractId!, 'Contract ID')}
                className="group flex w-full items-start gap-2 rounded-sm border border-border bg-background p-2 text-left transition-colors duration-150 hover:bg-accent"
                title="Copy contract ID"
              >
                <span className="min-w-0 flex-1 break-all font-mono text-[11px] text-foreground">{contractId}</span>
                <Copy className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground transition-colors duration-150 group-hover:text-brand" />
              </button>
            ) : (
              <div className="rounded-sm border border-dashed border-border px-2.5 py-3 text-center font-mono text-[11px] text-muted-foreground/70">
                No {net.label} deploy yet
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
