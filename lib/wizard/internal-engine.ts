// Internal composition engine for WebSoroban's own templates.
//
// Each feature declares a code FRAGMENT (imports, storage keys, methods, helpers,
// and any cross-cutting guards woven into base methods). The assembler turns the
// resolved wizard state into a single-crate bundle. Today it drives the Counter;
// adding a template means adding a manifest + assembler here. See TEMPLATE_WIZARD.md.

import type { WizardBundle, WizardState } from "./types"
import { renderCustomFunctions } from "./custom-fn"

// soroban-sdk 22.0.0 — matches WebSoroban's existing single-crate templates.
function singleCrateCargo(crate: string): string {
  return `[package]
name = "${crate}"
version = "0.1.0"
edition = "2021"

[dependencies]
soroban-sdk = "22.0.0"

[dev-dependencies]
soroban-sdk = { version = "22.0.0", features = ["testutils"] }

[lib]
crate-type = ["cdylib", "rlib"]

[profile.release]
opt-level = "z"
overflow-checks = true
`
}

const CARGO_CONFIG = `[target.wasm32v1-none]
rustflags = [
    "-C", "target-feature=-crt-static",
    "-C", "link-arg=--no-entry"
]
`

function toStructName(raw: string): string {
  const parts = String(raw).replace(/[^a-zA-Z0-9]+/g, " ").trim().split(/\s+/).filter(Boolean)
  const pascal = parts.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join("")
  const cleaned = pascal || "Counter"
  return /^[A-Za-z]/.test(cleaned) ? cleaned : `C${cleaned}`
}

function toCrateName(raw: string): string {
  return String(raw).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "counter"
}

function intParam(v: string | number | undefined, fallback: number): number {
  const n = Math.trunc(Number(v))
  return Number.isFinite(n) && n >= 0 ? n : fallback
}

/** Names the generated Counter occupies — used to reject colliding custom fns. */
export const COUNTER_RESERVED = new Set([
  "increment", "decrement", "get", "reset", "pause", "unpause", "paused", "owner",
  "__constructor", "require_owner", "ensure_not_paused", "current",
])

/** The struct name the internal engine will generate. */
export function internalStructName(state: WizardState): string {
  return toStructName(String(state.params.name || "Counter"))
}

/**
 * Assemble the Counter contract from the active feature fragments.
 */
export function generateInternalBundle(state: WizardState): WizardBundle {
  const f = state.features
  const struct = toStructName(String(state.params.name || "Counter"))
  const crate = toCrateName(String(state.params.name || "Counter"))
  const initial = intParam(state.params.initial, 0)
  const step = intParam(state.params.step, 1)

  const ownable = !!f.ownable
  const pausable = !!f.pausable // descriptor enforces pausable ⇒ ownable
  const decrementable = !!f.decrementable
  const resettable = !!f.resettable // descriptor enforces resettable ⇒ ownable

  // --- imports -----------------------------------------------------------
  const sdkItems = ["contract", "contractimpl", "symbol_short", "Env", "Symbol"]
  if (ownable) sdkItems.push("Address")
  const useLine = `use soroban_sdk::{${sdkItems.join(", ")}};`

  // --- storage keys ------------------------------------------------------
  const consts = [`const COUNT: Symbol = symbol_short!("COUNT");`]
  if (ownable) consts.push(`const OWNER: Symbol = symbol_short!("OWNER");`)
  if (pausable) consts.push(`const PAUSED: Symbol = symbol_short!("PAUSED");`)

  // --- guards woven into mutating base methods ---------------------------
  const guards: string[] = []
  if (pausable) guards.push("        Self::ensure_not_paused(&env);")
  if (ownable) guards.push("        Self::require_owner(&env);")
  const guardBlock = guards.length ? guards.join("\n") + "\n" : ""

  // --- public methods (order matters for readability) --------------------
  const methods: string[] = []

  if (ownable) {
    methods.push(`    /// Set the owner at deploy time.
    pub fn __constructor(env: Env, owner: Address) {
        env.storage().instance().set(&OWNER, &owner);
    }`)
  }

  methods.push(`    /// Increment the counter by the configured step.
    pub fn increment(env: Env) -> u32 {
${guardBlock}        let next = Self::current(&env).saturating_add(${step});
        env.storage().instance().set(&COUNT, &next);
        next
    }`)

  if (decrementable) {
    methods.push(`    /// Decrement the counter by the configured step (saturating at 0).
    pub fn decrement(env: Env) -> u32 {
${guardBlock}        let next = Self::current(&env).saturating_sub(${step});
        env.storage().instance().set(&COUNT, &next);
        next
    }`)
  }

  methods.push(`    /// Read the current counter value.
    pub fn get(env: Env) -> u32 {
        Self::current(&env)
    }`)

  if (resettable) {
    methods.push(`    /// Reset the counter to its initial value.
    pub fn reset(env: Env) {
        Self::require_owner(&env);
        env.storage().instance().set(&COUNT, &${initial}u32);
    }`)
  }

  if (pausable) {
    methods.push(`    /// Pause mutating calls.
    pub fn pause(env: Env) {
        Self::require_owner(&env);
        env.storage().instance().set(&PAUSED, &true);
    }`)
    methods.push(`    /// Resume mutating calls.
    pub fn unpause(env: Env) {
        Self::require_owner(&env);
        env.storage().instance().set(&PAUSED, &false);
    }`)
    methods.push(`    /// Whether mutating calls are currently paused.
    pub fn paused(env: Env) -> bool {
        env.storage().instance().get(&PAUSED).unwrap_or(false)
    }`)
  }

  if (ownable) {
    methods.push(`    /// The current owner.
    pub fn owner(env: Env) -> Address {
        env.storage().instance().get(&OWNER).unwrap()
    }`)
  }

  // --- private helpers (plain impl block; not exported) ------------------
  const helpers: string[] = [
    `    fn current(env: &Env) -> u32 {
        env.storage().instance().get(&COUNT).unwrap_or(${initial})
    }`,
  ]
  if (ownable) {
    helpers.push(`    fn require_owner(env: &Env) {
        let owner: Address = env.storage().instance().get(&OWNER).unwrap();
        owner.require_auth();
    }`)
  }
  if (pausable) {
    helpers.push(`    fn ensure_not_paused(env: &Env) {
        let paused: bool = env.storage().instance().get(&PAUSED).unwrap_or(false);
        if paused {
            panic!("contract is paused");
        }
    }`)
  }

  const custom = renderCustomFunctions(struct, state.customFunctions)

  const libRs = `#![no_std]
${useLine}

#[contract]
pub struct ${struct};

${consts.join("\n")}

#[contractimpl]
impl ${struct} {
${methods.join("\n\n")}
}

impl ${struct} {
${helpers.join("\n\n")}
}
${custom}`

  return {
    files: [
      { path: "src/lib.rs", content: libRs },
      { path: "Cargo.toml", content: singleCrateCargo(crate) },
      { path: ".cargo/config.toml", content: CARGO_CONFIG },
    ],
    manifestPath: "Cargo.toml",
    deployTarget: null,
  }
}
