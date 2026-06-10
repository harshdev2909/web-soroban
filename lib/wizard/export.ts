// Download helpers for the wizard: a single contract file, or the whole bundle
// as a project .zip (mirrors the reference wizard's export options).

import JSZip from "jszip"
import type { WizardBundle, WizardBundleFile } from "./types"

/** The file a "download single file" action should produce. */
export function entrypointFile(bundle: WizardBundle): WizardBundleFile {
  return (
    bundle.files.find((f) => f.path.endsWith("contract.rs")) ??
    bundle.files.find((f) => f.path === "src/lib.rs") ??
    bundle.files.find((f) => f.path.endsWith(".rs")) ??
    bundle.files[0]
  )
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function slug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "contract"
}

export function downloadSingleFile(bundle: WizardBundle, name: string) {
  const file = entrypointFile(bundle)
  triggerDownload(new Blob([file.content], { type: "text/plain;charset=utf-8" }), file.path.split("/").pop() || `${slug(name)}.rs`)
}

export async function downloadBundleZip(bundle: WizardBundle, name: string) {
  const zip = new JSZip()
  for (const f of bundle.files) zip.file(f.path, f.content)
  const blob = await zip.generateAsync({ type: "blob" })
  triggerDownload(blob, `${slug(name)}.zip`)
}
