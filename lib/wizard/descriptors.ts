// Declarative descriptors for every contract type the wizard offers.
//
// A descriptor lists the type's parameters and feature toggles. The controls UI
// renders straight from this, and the engines read the resolved state back. To
// add a new toggle: add a FeatureSpec here, then teach the matching engine how to
// turn it into options (oz) or code fragments (internal). See TEMPLATE_WIZARD.md.

import type { EngineId } from "./types"

export interface ParamSpec {
  id: string
  label: string
  help?: string
  kind: "text" | "number" | "select"
  default: string | number
  options?: { value: string; label: string }[]
  placeholder?: string
  min?: number
  required?: boolean
}

export interface FeatureSpec {
  id: string
  label: string
  /** One line stating EXACTLY which functions/behaviour the toggle adds. */
  tooltip: string
  default?: boolean
  /** Feature ids that must be enabled for this one (auto-enabled in the UI). */
  requires?: string[]
  /** Feature ids that cannot be enabled alongside this one. */
  conflicts?: string[]
  /** Enabling this forces access control (the `access` param) to be set. */
  requiresAccess?: boolean
}

export interface ContractTypeSpec {
  id: string
  engine: EngineId
  label: string
  description: string
  params: ParamSpec[]
  features: FeatureSpec[]
}

const LICENSE_OPTIONS = [
  { value: "MIT", label: "MIT" },
  { value: "Apache-2.0", label: "Apache-2.0" },
  { value: "GPL-3.0", label: "GPL-3.0" },
  { value: "BUSL-1.1", label: "BUSL-1.1" },
  { value: "Unlicense", label: "Unlicense" },
]

const ACCESS_PARAM: ParamSpec = {
  id: "access",
  label: "Access control",
  help: "Who may call privileged functions like mint or pause.",
  kind: "select",
  default: "ownable",
  options: [
    { value: "false", label: "None" },
    { value: "ownable", label: "Ownable (single owner)" },
    { value: "roles", label: "Roles (role-based)" },
  ],
}

const LICENSE_PARAM: ParamSpec = {
  id: "license",
  label: "License",
  kind: "select",
  default: "MIT",
  options: LICENSE_OPTIONS,
}

// --- OpenZeppelin types ----------------------------------------------------

const FUNGIBLE: ContractTypeSpec = {
  id: "Fungible",
  engine: "oz",
  label: "Fungible Token",
  description: "An SEP-41 fungible token backed by OpenZeppelin Stellar contracts.",
  params: [
    { id: "name", label: "Name", kind: "text", default: "MyToken", placeholder: "MyToken", required: true },
    { id: "symbol", label: "Symbol", kind: "text", default: "MTK", placeholder: "MTK", required: true },
    {
      id: "premint",
      label: "Premint",
      help: "Tokens minted to the deployer at construction. 0 mints nothing.",
      kind: "text",
      default: "0",
      placeholder: "1000000",
    },
    ACCESS_PARAM,
    LICENSE_PARAM,
  ],
  features: [
    { id: "mintable", label: "Mintable", tooltip: "Adds mint(account, amount), restricted to the owner/minter.", requiresAccess: true },
    { id: "burnable", label: "Burnable", tooltip: "Adds burn(amount) and burn_from(spender, from, amount)." },
    { id: "pausable", label: "Pausable", tooltip: "Adds pause()/unpause(); transfers revert while paused.", requiresAccess: true },
    { id: "upgradeable", label: "Upgradeable", tooltip: "Adds upgrade(new_wasm_hash) so the owner can swap the contract code.", requiresAccess: true },
  ],
}

const NON_FUNGIBLE: ContractTypeSpec = {
  id: "NonFungible",
  engine: "oz",
  label: "Non-Fungible Token (NFT)",
  description: "An NFT collection backed by OpenZeppelin Stellar contracts.",
  params: [
    { id: "name", label: "Name", kind: "text", default: "MyNFT", placeholder: "MyNFT", required: true },
    { id: "symbol", label: "Symbol", kind: "text", default: "MNFT", placeholder: "MNFT", required: true },
    ACCESS_PARAM,
    LICENSE_PARAM,
  ],
  features: [
    { id: "mintable", label: "Mintable", tooltip: "Adds mint(to) issuing the next sequential token id, owner-restricted.", requiresAccess: true },
    { id: "burnable", label: "Burnable", tooltip: "Adds burn(token_id) and burn_from(spender, token_id)." },
    { id: "enumerable", label: "Enumerable", tooltip: "Tracks all token ids and per-owner tokens for on-chain enumeration." },
    { id: "pausable", label: "Pausable", tooltip: "Adds pause()/unpause(); transfers and mints revert while paused.", requiresAccess: true },
    { id: "upgradeable", label: "Upgradeable", tooltip: "Adds upgrade(new_wasm_hash) so the owner can swap the contract code.", requiresAccess: true },
  ],
}

const STABLECOIN: ContractTypeSpec = {
  id: "Stablecoin",
  engine: "oz",
  label: "Stablecoin",
  description: "A fungible token with optional allowlist/blocklist transfer controls.",
  params: [
    { id: "name", label: "Name", kind: "text", default: "MyStablecoin", placeholder: "MyStablecoin", required: true },
    { id: "symbol", label: "Symbol", kind: "text", default: "USDX", placeholder: "USDX", required: true },
    { id: "premint", label: "Premint", kind: "text", default: "0", placeholder: "1000000" },
    {
      id: "limitations",
      label: "Transfer limits",
      help: "Restrict who may hold/transfer the token.",
      kind: "select",
      default: "false",
      options: [
        { value: "false", label: "None" },
        { value: "allowlist", label: "Allowlist (only listed accounts)" },
        { value: "blocklist", label: "Blocklist (everyone except listed)" },
      ],
    },
    ACCESS_PARAM,
    LICENSE_PARAM,
  ],
  features: [
    { id: "mintable", label: "Mintable", tooltip: "Adds mint(account, amount), restricted to the owner/minter.", requiresAccess: true },
    { id: "burnable", label: "Burnable", tooltip: "Adds burn(amount) and burn_from(spender, from, amount)." },
    { id: "pausable", label: "Pausable", tooltip: "Adds pause()/unpause(); transfers revert while paused.", requiresAccess: true },
    { id: "upgradeable", label: "Upgradeable", tooltip: "Adds upgrade(new_wasm_hash) so the owner can swap the contract code.", requiresAccess: true },
  ],
}

// --- Internal composition engine -------------------------------------------

const COUNTER: ContractTypeSpec = {
  id: "counter",
  engine: "internal",
  label: "Counter",
  description: "A minimal stateful counter assembled from WebSoroban's own fragments.",
  params: [
    { id: "name", label: "Contract name", kind: "text", default: "Counter", placeholder: "Counter", required: true },
    { id: "initial", label: "Initial value", help: "Starting count before any increment.", kind: "number", default: 0, min: 0 },
    { id: "step", label: "Step", help: "How much increment/decrement changes the count.", kind: "number", default: 1, min: 1 },
  ],
  features: [
    { id: "decrementable", label: "Decrementable", tooltip: "Adds decrement() that subtracts the step (saturating at 0)." },
    { id: "ownable", label: "Ownable", tooltip: "Stores an owner set at construction; mutations require the owner's auth." },
    { id: "resettable", label: "Resettable", tooltip: "Adds reset() that sets the count back to the initial value.", requires: ["ownable"] },
    { id: "pausable", label: "Pausable", tooltip: "Adds pause()/unpause(); increment/decrement revert while paused.", requires: ["ownable"] },
  ],
}

export const CONTRACT_TYPES: ContractTypeSpec[] = [FUNGIBLE, NON_FUNGIBLE, STABLECOIN, COUNTER]

export function getContractType(id: string): ContractTypeSpec | undefined {
  return CONTRACT_TYPES.find((t) => t.id === id)
}

/** Default wizard params for a type (param id -> default value). */
export function defaultParams(spec: ContractTypeSpec): Record<string, string | number> {
  const out: Record<string, string | number> = {}
  for (const p of spec.params) out[p.id] = p.default
  return out
}

/** Default feature toggle states for a type. */
export function defaultFeatures(spec: ContractTypeSpec): Record<string, boolean> {
  const out: Record<string, boolean> = {}
  for (const f of spec.features) out[f.id] = f.default ?? false
  return out
}
