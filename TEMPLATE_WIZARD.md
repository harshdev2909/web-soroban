# Contract customisation wizard

The wizard lets a user pick a contract type, toggle features, set parameters, add
custom function stubs, watch the code update live, then scaffold the result into a
real multi-file project they can compile, deploy, and invoke on testnet.

It is reached from **Projects → Customise a contract** (and re-opened from
**My Templates**). Everything runs client-side for instant preview; only saving a
project or a template touches the backend.

- UI: `components/wizard/` (`contract-wizard.tsx`, `wizard-preview.tsx`, `custom-function-editor.tsx`)
- Engines + model: `lib/wizard/`
- Persistence: `UserTemplate` (Prisma) + `routes/userTemplates.ts` (`/api/user-templates`)

## Two engines, one bundle

Both engines emit the **same** bundle the scaffolder already consumes:

```ts
interface WizardBundle {
  files: { path: string; content: string }[]
  manifestPath: string          // the driving Cargo manifest
  deployTarget: string | null   // member crate to deploy (workspaces only)
}
```

| Engine | Types | Output | Cargo |
| --- | --- | --- | --- |
| `oz` (`lib/wizard/oz-engine.ts`) | Fungible, NonFungible, Stablecoin | OpenZeppelin **workspace** (`contracts/<kind>/…`) | soroban-sdk 22.0.8, stellar-* `=0.4.1` |
| `internal` (`lib/wizard/internal-engine.ts`) | Counter | single crate (`src/lib.rs`) | soroban-sdk 22.0.0 |

`generate(state)` in `lib/wizard/index.ts` dispatches by the type's `engine` and
never throws — it returns `{ bundle }` or `{ error }`.

### OpenZeppelin engine

Pinned to `@openzeppelin/wizard-stellar@0.4.5` (OZ Stellar contracts 0.4.1,
soroban-sdk 22.0.8). This is the soroban 22.x line our build pipeline compiles
(Rust 1.89, stellar-cli 25.2.0); the newer 0.6.0 package targets soroban-sdk 25.3.0,
whose dependency tree needs a rustc newer than 1.89 and fails to build. We map
wizard state to the package's option object and reproduce the exact workspace its
own `zipRustProject` produces — using its **exported helpers** (`buildGeneric`,
`printContract`, `removeCreateLevelAttributes`, `workspaceCargo`, `printContractCargo`,
`printRustNameTest`, `getRequiredLibDependencies`). This is synchronous and
browser-safe (no jszip), and was verified byte-for-byte against the zip output.

Crate versions come straight from the package's generated manifests — never
hardcoded — so the pin is the single source of truth. If the build toolchain moves
to a rustc that supports soroban-sdk 25.3.0, bump the package to 0.6.0 (its
`workspaceCargo`/`printContractCargo` take a `requiredLibDeps` argument; pass
`getRequiredLibDependencies(c)`). We add a workspace `.cargo/config.toml` with the
`wasm32v1-none` flags our build pipeline expects (OZ's own download omits it).

`deployTarget` is the member crate name, e.g. `fungible-contract`,
`non-fungible-contract`, `stablecoin-contract`.

### Internal composition engine — the option→fragment model

Each feature declares a **fragment**: the imports, storage keys, methods, helpers,
and cross-cutting guards it contributes. The assembler turns the resolved state
into one `lib.rs`:

- **imports** — `use soroban_sdk::{…}`; features push items (e.g. `Address` when ownable).
- **storage keys** — `symbol_short!` consts (`COUNT`, plus `OWNER`/`PAUSED`).
- **methods** — public `#[contractimpl]` functions a feature adds (`decrement`, `reset`, `pause`/`unpause`/`paused`, `owner`).
- **helpers** — private `impl` functions (`require_owner`, `ensure_not_paused`).
- **guards** — lines woven into the mutating base methods (`increment`/`decrement`)
  from active features: pausable adds `Self::ensure_not_paused(&env);`, ownable adds
  `Self::require_owner(&env);`.

Parameters feed the assembled code directly: `initial` is the `unwrap_or` default,
`step` is the increment/decrement amount, `name` becomes the struct + crate name.

## Dependency & conflict rules

Rules are declared per type in `lib/wizard/descriptors.ts` and enforced by
`resolveFeatures(spec, state)`:

- `FeatureSpec.requires: string[]` — listed features are **auto-enabled and locked
  on** (to a fixpoint, so deps-of-deps resolve). The Counter's `pausable` and
  `resettable` both `requires: ["ownable"]`.
- `FeatureSpec.conflicts: string[]` — surfaced as a warning (none today).
- `FeatureSpec.requiresAccess: true` (OZ only) — enabling the feature forces the
  `access` param. If access is `None`, `resolveFeatures` warns and the OZ engine
  promotes it to `ownable` (matching the package's `isAccessControlRequired`).
  Fungible/NFT/Stablecoin `mintable`, `pausable`, and `upgradeable` set this.

The controls render straight from the resolved state: locked toggles are disabled
with a "Required by …" note, and warnings show under the feature list. An invalid
combination can never reach generation.

## Custom functions

`components/wizard/custom-function-editor.tsx` builds a list of typed stubs;
`lib/wizard/custom-fn.ts` renders them and validates names.

- Each stub is `pub fn name(env, args…) [-> Ret]` with a `// TODO` body (or
  `unimplemented!()` when it returns a value) — a **compiling** stub, not logic.
- Non-primitive arg/return types are written fully qualified (`soroban_sdk::Address`)
  so the appended `#[contractimpl]` block compiles regardless of the contract's
  existing imports. `env: soroban_sdk::Env` is injected automatically.
- `validateCustomFunctions` rejects bad identifiers, Rust keywords, duplicate args,
  and names that collide with the generated/standard surface (`reservedNames(state)`).

## Saving, scaffolding, exporting

- **Create project** → `projectApi.createProject(name, files, undefined, false, { manifestPath, deployTarget })`.
  The project POST (`routes/projects.ts`) honors `manifestPath`/`deployTarget` for
  raw wizard files; the existing multi-file validation (`validateProject` via
  `/build-info`) runs before any deploy.
- **Save as my template** → `userTemplateApi.create({ name, type, engine, config, bundle })`.
  `config` is the full `WizardState` (so re-opening restores the controls); `bundle`
  is the resolved tree (so "Use" scaffolds without re-running the generator).
- **Export** → single contract file or the whole project as a `.zip` (`lib/wizard/export.ts`).

`UserTemplate` is per-user, cascade-deleted with the user, capped at 100 rows and
512 KB per bundle.

## Adding a new feature toggle

1. Add a `FeatureSpec` to the type in `lib/wizard/descriptors.ts` with a one-line
   `tooltip` stating exactly which functions/behaviour it adds, plus any
   `requires` / `conflicts` / `requiresAccess`.
2. Teach the engine to honor it:
   - **oz** — set the matching option in `toOzOptions` (it must exist on the
     package's `FungibleOptions`/`NonFungibleOptions`/`StablecoinOptions`).
   - **internal** — add its fragment (imports/consts/methods/helpers/guards) in
     `generateInternalBundle`, and extend `COUNTER_RESERVED` with any new names.
3. That's it — the controls, dependency resolution, and live preview pick it up
   from the descriptor.

## Adding a new contract type

Add a `ContractTypeSpec` (with `engine`) to `CONTRACT_TYPES`. For an OZ type, add a
`case` in `toOzOptions`. For an internal type, write its assembler and call it from
`generate` (today `generate` routes all `internal` types to the Counter assembler;
split on `state.type` when a second internal template lands). Update `reservedNames`.

## Verify generated contracts

The generated source is structurally correct (verified by unit smoke tests and the
byte-for-byte match against OZ's own output), but a full **compile + deploy on
testnet** must be confirmed against the live build pipeline (Rust 1.89,
stellar-cli 25.2.0, target `wasm32v1-none`). Test at minimum:

- Fungible with `mintable + pausable` (premint set, access Ownable).
- An NFT config (`mintable + enumerable`).
- The Counter with all features + a custom function.
