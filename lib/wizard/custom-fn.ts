// Renders user-added function stubs into a self-contained `#[contractimpl]` block.
//
// Both engines append the block at the end of the contract source. To stay valid
// regardless of which `soroban_sdk` items the generated contract already imports,
// non-primitive argument/return types are written fully qualified (e.g.
// `soroban_sdk::Address`). The body is a compiling stub — never arbitrary logic.

import type { CustomArgType, CustomFunction, CustomReturnType } from "./types"

const PRIMITIVES = new Set(["u32", "u64", "i32", "i64", "u128", "i128", "bool"])

/** Map a friendly type to its Rust spelling (qualified for soroban_sdk items). */
export function rustType(t: CustomArgType | CustomReturnType): string {
  if (t === "") return ""
  if (PRIMITIVES.has(t)) return t
  return `soroban_sdk::${t}`
}

const IDENT_RE = /^[a-z][a-z0-9_]*$/

/**
 * Validate one custom function against the identifier rules and a set of names
 * already taken by the generated/standard contract. Returns an error or null.
 */
export function validateCustomFunction(fn: CustomFunction, reserved: Set<string>): string | null {
  const name = fn.name.trim()
  if (!name) return "Function name is required"
  if (!IDENT_RE.test(name)) return "Name must be snake_case: start with a letter, then letters/digits/underscores"
  if (RUST_KEYWORDS.has(name)) return `"${name}" is a Rust keyword`
  if (reserved.has(name)) return `"${name}" already exists in this contract`
  const seen = new Set<string>()
  for (const arg of fn.args) {
    const an = arg.name.trim()
    if (!an) return "Every argument needs a name"
    if (!IDENT_RE.test(an)) return `Argument "${an}" must be snake_case`
    if (an === "env") return `"env" is reserved — it is added automatically`
    if (RUST_KEYWORDS.has(an)) return `"${an}" is a Rust keyword`
    if (seen.has(an)) return `Duplicate argument "${an}"`
    seen.add(an)
  }
  return null
}

/** Validate all custom functions; returns the first error (keyed by fn id) or null. */
export function validateCustomFunctions(
  fns: CustomFunction[],
  reserved: Set<string>,
): { id: string; error: string } | null {
  const names = new Set(reserved)
  for (const fn of fns) {
    const err = validateCustomFunction(fn, names)
    if (err) return { id: fn.id, error: err }
    names.add(fn.name.trim())
  }
  return null
}

function renderOne(fn: CustomFunction): string {
  const args = ["env: soroban_sdk::Env", ...fn.args.map((a) => `${a.name.trim()}: ${rustType(a.type)}`)].join(", ")
  const ret = fn.returnType ? ` -> ${rustType(fn.returnType)}` : ""
  const doc = fn.doc?.trim() ? `    /// ${fn.doc.trim()}\n` : ""
  // A unit function can be a no-op; a value-returning stub uses unimplemented!()
  // so it compiles for any return type without inventing a default.
  const body = fn.returnType
    ? "        // TODO: implement this function\n        unimplemented!()"
    : "        // TODO: implement this function"
  return `${doc}    pub fn ${fn.name.trim()}(${args})${ret} {\n${body}\n    }`
}

/**
 * Render the extra impl block for the given struct, or "" when there are no
 * custom functions. Appended verbatim to the generated contract file.
 */
export function renderCustomFunctions(structName: string, fns: CustomFunction[]): string {
  if (!fns.length) return ""
  const body = fns.map(renderOne).join("\n\n")
  return `\n#[soroban_sdk::contractimpl]\nimpl ${structName} {\n${body}\n}\n`
}

// Minimal keyword set for identifier validation (Rust 2021 + common reserved).
const RUST_KEYWORDS = new Set([
  "as", "break", "const", "continue", "crate", "dyn", "else", "enum", "extern", "false",
  "fn", "for", "if", "impl", "in", "let", "loop", "match", "mod", "move", "mut", "pub",
  "ref", "return", "self", "Self", "static", "struct", "super", "trait", "true", "type",
  "unsafe", "use", "where", "while", "async", "await", "abstract", "become", "box", "do",
  "final", "macro", "override", "priv", "typeof", "unsized", "virtual", "yield", "try",
])
