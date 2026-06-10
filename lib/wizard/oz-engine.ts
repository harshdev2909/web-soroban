// OpenZeppelin generation engine.
//
// Maps wizard state to @openzeppelin/wizard-stellar options and reproduces the
// exact workspace the package's own `zipRustProject` produces — using its
// exported helpers so generation is synchronous and browser-safe (no jszip).
// Verified byte-for-byte against the zip output at integration time.
//
// Pinned to @openzeppelin/wizard-stellar@0.4.5 (OZ Stellar contracts 0.4.1,
// soroban-sdk 22.0.8) — the soroban 22.x line our build pipeline (Rust 1.89,
// stellar-cli 25.2.0) compiles, matching the repo's other templates. The crate
// versions come straight from the package's generated Cargo manifests.

import { buildGeneric, printContract } from "@openzeppelin/wizard-stellar"
import type { GenericOptions } from "@openzeppelin/wizard-stellar/dist/build-generic"
import type { Contract } from "@openzeppelin/wizard-stellar/dist/contract"
import type { Access } from "@openzeppelin/wizard-stellar/dist/set-access-control"
import { removeCreateLevelAttributes } from "@openzeppelin/wizard-stellar/dist/print"
import {
  contractOptionsToContractName,
  printContractCargo,
  workspaceCargo,
  printRustNameTest,
  createRustLibFile,
} from "@openzeppelin/wizard-stellar/dist/zip-shared"

import type { WizardBundle, WizardState } from "./types"
import { renderCustomFunctions } from "./custom-fn"
import { getContractType } from "./descriptors"

// The wasm32v1-none flags the WebSoroban build pipeline expects, applied to the
// whole workspace. OZ's download omits this; our `stellar contract build` path
// keeps it on every template.
const CARGO_CONFIG = `[target.wasm32v1-none]
rustflags = [
    "-C", "target-feature=-crt-static",
    "-C", "link-arg=--no-entry"
]
`

/** Resolve the access-control value, auto-promoting when a feature requires it. */
function resolveAccess(state: WizardState): Access {
  const spec = getContractType(state.type)
  const raw = String(state.params.access ?? "false")
  const needsAccess = !!spec?.features.some((f) => f.requiresAccess && state.features[f.id])
  if (raw === "false") return needsAccess ? "ownable" : false
  if (raw === "ownable" || raw === "roles") return raw
  return false
}

/** Map wizard state to the package's kind-tagged options object. */
export function toOzOptions(state: WizardState): GenericOptions {
  const p = state.params
  const f = state.features
  const access = resolveAccess(state)
  const info = { license: String(p.license || "MIT") }
  const name = String(p.name || "Contract").trim() || "Contract"
  const symbol = String(p.symbol || "TKN").trim() || "TKN"

  switch (state.type) {
    case "Fungible":
      return {
        kind: "Fungible",
        name,
        symbol,
        premint: String(p.premint || "0"),
        access,
        info,
        mintable: !!f.mintable,
        burnable: !!f.burnable,
        pausable: !!f.pausable,
        upgradeable: !!f.upgradeable,
      }
    case "NonFungible":
      return {
        kind: "NonFungible",
        name,
        symbol,
        access,
        info,
        mintable: !!f.mintable,
        burnable: !!f.burnable,
        enumerable: !!f.enumerable,
        pausable: !!f.pausable,
        upgradeable: !!f.upgradeable,
      }
    case "Stablecoin":
      return {
        kind: "Stablecoin",
        name,
        symbol,
        premint: String(p.premint || "0"),
        limitations: (String(p.limitations || "false") === "false" ? false : String(p.limitations)) as any,
        access,
        info,
        mintable: !!f.mintable,
        burnable: !!f.burnable,
        pausable: !!f.pausable,
        upgradeable: !!f.upgradeable,
      }
    default:
      throw new Error(`Unknown OpenZeppelin contract type: ${state.type}`)
  }
}

/**
 * Generate the full workspace bundle for an OZ contract type. Throws on invalid
 * option combinations (e.g. a malformed premint) — surfaced as a wizard error.
 */
export function generateOzBundle(state: WizardState): WizardBundle {
  const opts = toOzOptions(state)
  const c = buildGeneric(opts) as Contract
  const dir = contractOptionsToContractName(opts.kind)

  let contractRs = removeCreateLevelAttributes(printContract(c))
  const custom = renderCustomFunctions(c.name, state.customFunctions)
  if (custom) contractRs = contractRs.replace(/\s+$/, "\n") + custom

  const pkgName = `${dir.replace(/_/, "-")}-contract`

  return {
    files: [
      { path: "Cargo.toml", content: workspaceCargo },
      { path: `contracts/${dir}/Cargo.toml`, content: printContractCargo(dir) },
      { path: `contracts/${dir}/src/lib.rs`, content: createRustLibFile },
      { path: `contracts/${dir}/src/contract.rs`, content: contractRs },
      { path: `contracts/${dir}/src/test.rs`, content: printRustNameTest(c) },
      { path: ".cargo/config.toml", content: CARGO_CONFIG },
    ],
    manifestPath: "Cargo.toml",
    deployTarget: pkgName,
  }
}

/** The struct name OZ will generate (used to validate custom-fn collisions). */
export function ozStructName(state: WizardState): string {
  return String(state.params.name || "Contract").trim() || "Contract"
}
