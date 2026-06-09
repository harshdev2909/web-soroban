import type { ComponentPropsWithoutRef } from "react"
import { Pre } from "./code-block"
import { Callout } from "./callout"
import { Steps, Step } from "./steps"
import { Tabs, Tab } from "./tabs"
import { CodeGroup } from "./code-group"
import { Card, CardGrid } from "./card"
import { Accordion, FaqItem } from "./faq"
import { ParamField, ResponseField, FieldGroup } from "./fields"
import { Frame } from "./frame"
import { Badge } from "./badge"

// Heading with a keyboard-reachable anchor. Fumadocs' remark pipeline assigns
// each heading an `id` (slug); we render the "#" link from it.
function heading(Tag: "h1" | "h2" | "h3" | "h4") {
  return function Heading({ id, children, ...props }: ComponentPropsWithoutRef<typeof Tag>) {
    return (
      <Tag id={id} {...props}>
        {children}
        {id && Tag !== "h1" && (
          <a href={`#${id}`} className="heading-anchor" aria-label="Link to this section">
            #
          </a>
        )}
      </Tag>
    )
  }
}

/** Components available to every MDX page. Merge with any per-page overrides. */
export function getMDXComponents(overrides?: Record<string, unknown>) {
  return {
    pre: Pre,
    h1: heading("h1"),
    h2: heading("h2"),
    h3: heading("h3"),
    h4: heading("h4"),
    Callout,
    Steps,
    Step,
    Tabs,
    Tab,
    CodeGroup,
    Card,
    CardGrid,
    Accordion,
    FaqItem,
    ParamField,
    ResponseField,
    FieldGroup,
    Frame,
    Badge,
    ...overrides,
  }
}
