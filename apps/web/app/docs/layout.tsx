import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { source } from "@/lib/source";
import type { CSSProperties, ReactNode } from "react";

function ZuroMark() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 text-xs font-bold text-white">
        Z
      </span>
      <span className="font-semibold tracking-tight">Zuro Docs</span>
    </div>
  );
}

function SidebarFooter() {
  return (
    <div className="mt-4 border-t border-fd-border pt-4">
      <p className="text-xs text-fd-muted-foreground">Opinionated backend scaffolding for students and hackathons.</p>
      <span className="mt-2 inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-[11px] font-medium text-blue-700">
        v0.1 beta
      </span>
    </div>
  );
}

export default function Layout({ children }: { children: ReactNode }) {
  const docsContainerStyle = {
    "--fd-sidebar-width": "228px",
    "--fd-layout-width": "90rem",
    gridTemplate: `"sidebar header toc"
      "sidebar toc-popover toc"
      "sidebar main toc" 1fr / var(--fd-sidebar-col) minmax(0, calc(var(--fd-layout-width,97rem) - var(--fd-sidebar-width) - var(--fd-toc-width))) minmax(0, 1fr)`,
  } as CSSProperties;

  return (
    <DocsLayout
      tree={source.pageTree}
      nav={{
        title: <ZuroMark />,
      }}
      links={[
        {
          text: "Website",
          url: "/",
        },
      ]}
      sidebar={{
        defaultOpenLevel: 1,
        footer: <SidebarFooter />,
      }}
      containerProps={{ style: docsContainerStyle }}
    >
      {children}
    </DocsLayout>
  );
}
