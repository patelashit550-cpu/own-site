import { withBasePath } from "@/lib/base-path";

export const DEFAULT_SITE_URL = "https://example.com";

export const SiteIdentity = {
  name: "Own Site",
  shortName: "Own Site",
  description: "REPLACE_ME — one-sentence description of the site",
  url: process.env.NEXT_PUBLIC_SITE_URL?.trim() || DEFAULT_SITE_URL,
  icon: withBasePath("/visuals/icon.png"),
};

export const LayoutConfig = {
  contentShellMaxWidth: "max-w-6xl",
  mobileShellWidth: "w-full",
  textWrappingClasses: "break-words whitespace-normal overflow-wrap-anywhere",
};

export type BentoSeriesItem = {
  name: string;
  desc: string;
  dataPoint: string;
  href: string;
};

export type BentoSectionConfig = {
  title: string;
  label: string;
  nodeKicker: string;
  subtitle: string;
  status: string;
  requiresAuth: boolean;
  series: BentoSeriesItem[];
  titleVisualSrc?: string;
  titleVisualAlt?: string;
};

/**
 * Home bento + reading-header sibling map.
 * Point `href` at ontology-backed routes (`/topic/slug`).
 */
export const BentoRegistry: Record<"B1" | "B2" | "B3", BentoSectionConfig> = {
  B1: {
    title: "About",
    label: "About",
    nodeKicker: "01",
    subtitle: "Who you are and what this site covers",
    status: "01",
    requiresAuth: false,
    series: [
      { name: "About", desc: "Introduction to the site", dataPoint: "01", href: "/site/about" },
    ],
  },
  B2: {
    title: "Essays",
    label: "Essays",
    nodeKicker: "02",
    subtitle: "Long-form writing",
    status: "02",
    requiresAuth: false,
    series: [
      { name: "Essays", desc: "All published essays", dataPoint: "02", href: "/writing/essays" },
    ],
  },
  B3: {
    title: "Notes",
    label: "Notes",
    nodeKicker: "03",
    subtitle: "Short notes and updates",
    status: "03",
    requiresAuth: false,
    series: [
      { name: "Notes", desc: "Sample note", dataPoint: "03", href: "/notes/sample-note" },
    ],
  },
};
