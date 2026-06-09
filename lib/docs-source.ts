import { docs } from '@/.source';
import { loader } from 'fumadocs-core/source';
import { createElement } from 'react';
import {
  Rocket,
  BookOpen,
  Terminal,
  Layers,
  Hammer,
  FlaskConical,
  Wallet,
  UploadCloud,
  Gauge,
  LifeBuoy,
  List,
  Play,
  type LucideIcon,
} from 'lucide-react';

// Icons referenced by `icon:` in meta.json / frontmatter.
const ICONS: Record<string, LucideIcon> = {
  rocket: Rocket,
  book: BookOpen,
  terminal: Terminal,
  layers: Layers,
  hammer: Hammer,
  flask: FlaskConical,
  wallet: Wallet,
  upload: UploadCloud,
  gauge: Gauge,
  help: LifeBuoy,
  list: List,
  play: Play,
};

// The Fumadocs source: file-based routing over content/docs, mounted at /docs.
export const source = loader({
  baseUrl: '/docs',
  icon(icon) {
    if (icon && icon in ICONS) return createElement(ICONS[icon]);
  },
  source: docs.toFumadocsSource(),
});
