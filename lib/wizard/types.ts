// Shared types for the contract customisation wizard.
//
// Both generation engines (OpenZeppelin `oz` and the internal composition engine
// `internal`) emit the SAME multi-file bundle the scaffolder already consumes.

export interface WizardBundleFile {
  path: string
  content: string
}

export interface WizardBundle {
  files: WizardBundleFile[]
  /** Project-relative path of the driving Cargo manifest (almost always the root). */
  manifestPath: string
  /** For [workspace] manifests: the member crate whose wasm is deployed. Null for single-crate. */
  deployTarget: string | null
}

export type EngineId = "oz" | "internal"

// --- Custom function builder ----------------------------------------------
// A lightweight, ScType-aware stub the user appends to the generated contract.
// It produces a compiling function, not arbitrary logic.

export const CUSTOM_ARG_TYPES = [
  "u32",
  "u64",
  "i32",
  "i64",
  "u128",
  "i128",
  "bool",
  "Address",
  "String",
  "Symbol",
  "Bytes",
] as const

export type CustomArgType = (typeof CUSTOM_ARG_TYPES)[number]

/** "" means the function returns unit (no return value). */
export type CustomReturnType = "" | CustomArgType

export interface CustomArg {
  name: string
  type: CustomArgType
}

export interface CustomFunction {
  id: string
  name: string
  args: CustomArg[]
  returnType: CustomReturnType
  doc?: string
}

// --- Wizard state ----------------------------------------------------------
// The serialisable state we persist as UserTemplate.config and restore on open.

export interface WizardState {
  /** Contract type id, e.g. "Fungible", "NonFungible", "Stablecoin", "counter". */
  type: string
  /** Free-form param values keyed by ParamSpec.id (strings/numbers from the form). */
  params: Record<string, string | number>
  /** Feature toggle states keyed by FeatureSpec.id. */
  features: Record<string, boolean>
  /** User-added function stubs. */
  customFunctions: CustomFunction[]
}
