import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { use, type ReactNode } from "react";
import { baseOptions } from "@/app/layout.config";
import { getPageTree } from "@/lib/usePageTree";

export default function Layout({ children }: { children: ReactNode }) {
  // console.log(source.pageTree)
  const pageTree = use(getPageTree());
  return (
    <DocsLayout tree={pageTree} {...baseOptions}>
      {children}
    </DocsLayout>
  );
}
