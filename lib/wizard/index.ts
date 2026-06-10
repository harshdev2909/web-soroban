// Public facade for the contract customisation wizard.
//
// - resolveFeatures: applies dependency/conflict rules to raw toggle state.
// - generate: dispatches to the right engine and returns a bundle or an error.
// - reservedNames: names a custom function must not collide with.

import type { WizardBundle, WizardState } from "./types"
import { CONTRACT_TYPES, defaultFeatures, defaultParams, getContractType, type ContractTypeSpec } from "./descriptors"
import { generateOzBundle, ozStructName } from "./oz-engine"
import { generateInternalBundle, internalStructName, COUNTER_RESERVED } from "./internal-engine"

export * from "./types"
export { CONTRACT_TYPES, getContractType } from "./descriptors"
export type { ContractTypeSpec, FeatureSpec, ParamSpec } from "./descriptors"

export interface ResolvedFeatures {
  /** Effective toggle states after applying requires/conflicts. */
  features: Record<string, boolean>
  /** Toggles the user can't freely change, with a reason (e.g. auto-enabled). */
  locked: Record<string, { on: boolean; reason: string }>
  /** Human-readable notes to show under the controls. */
  warnings: string[]
}

/** Apply dependency + conflict rules and access-control auto-promotion. */
export function resolveFeatures(spec: ContractTypeSpec, state: WizardState): ResolvedFeatures {
  const features: Record<string, boolean> = {}
  for (const f of spec.features) features[f.id] = !!state.features[f.id]

  const locked: Record<string, { on: boolean; reason: string }> = {}
  const warnings: string[] = []
  const byId = new Map(spec.features.map((f) => [f.id, f]))

  // Auto-enable required dependencies to a fixpoint, locking them on.
  let changed = true
  while (changed) {
    changed = false
    for (const f of spec.features) {
      if (!features[f.id] || !f.requires) continue
      for (const dep of f.requires) {
        if (!features[dep]) {
          features[dep] = true
          changed = true
        }
        locked[dep] = { on: true, reason: `Required by ${f.label}` }
      }
    }
  }

  // Conflicts: report (the controls prevent enabling both).
  for (const f of spec.features) {
    if (!features[f.id] || !f.conflicts) continue
    for (const other of f.conflicts) {
      if (features[other]) {
        const otherSpec = byId.get(other)
        warnings.push(`${f.label} and ${otherSpec?.label ?? other} can't be combined.`)
      }
    }
  }

  // Access-control auto-promotion (OZ types use the `access` param).
  const accessParam = spec.params.find((p) => p.id === "access")
  if (accessParam) {
    const access = String(state.params.access ?? accessParam.default)
    const requiring = spec.features.filter((f) => f.requiresAccess && features[f.id])
    if (access === "false" && requiring.length) {
      warnings.push(`${requiring.map((f) => f.label).join(", ")} require access control — defaulting to Ownable.`)
    }
  }

  return { features, locked, warnings }
}

/** Build a fresh wizard state for a contract type. */
export function newStateFor(typeId: string): WizardState {
  const spec = getContractType(typeId) ?? CONTRACT_TYPES[0]
  return {
    type: spec.id,
    params: defaultParams(spec),
    features: defaultFeatures(spec),
    customFunctions: [],
  }
}

export interface GenerateResult {
  bundle?: WizardBundle
  error?: string
}

/** Generate a bundle for the resolved wizard state. Never throws. */
export function generate(state: WizardState): GenerateResult {
  const spec = getContractType(state.type)
  if (!spec) return { error: `Unknown contract type: ${state.type}` }

  // Generate against the resolved feature set so the preview matches the rules.
  const resolved = resolveFeatures(spec, state)
  const effective: WizardState = { ...state, features: resolved.features }

  try {
    const bundle = spec.engine === "oz" ? generateOzBundle(effective) : generateInternalBundle(effective)
    return { bundle }
  } catch (e: any) {
    return { error: e?.message || "Failed to generate contract" }
  }
}

/** The struct name the active engine will generate for this state. */
export function structNameFor(state: WizardState): string {
  const spec = getContractType(state.type)
  return spec?.engine === "internal" ? internalStructName(state) : ozStructName(state)
}

// Names a custom function must not collide with. Conservative per-type sets that
// cover the standard surface of each generated contract.
const OZ_TOKEN_NAMES = [
  "name", "symbol", "decimals", "total_supply", "balance", "allowance", "transfer",
  "transfer_from", "approve", "burn", "burn_from", "mint", "mint_with_caller",
  "pause", "unpause", "paused", "upgrade", "owner", "transfer_ownership",
  "renounce_ownership", "set_owner", "__constructor",
]
const OZ_NFT_NAMES = [
  "name", "symbol", "token_uri", "balance", "owner_of", "transfer", "transfer_from",
  "approve", "approve_for_all", "get_approved", "is_approved_for_all", "mint", "burn",
  "burn_from", "pause", "unpause", "paused", "upgrade", "owner", "total_supply",
  "get_token_id", "get_owner_token_id", "__constructor",
]

export function reservedNames(state: WizardState): Set<string> {
  switch (state.type) {
    case "NonFungible":
      return new Set(OZ_NFT_NAMES)
    case "Fungible":
    case "Stablecoin":
      return new Set(OZ_TOKEN_NAMES)
    case "counter":
      return new Set(COUNTER_RESERVED)
    default:
      return new Set()
  }
}
