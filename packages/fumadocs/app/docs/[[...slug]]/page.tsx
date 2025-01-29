// import { source } from "@/lib/source";
// import defaultMdxComponents from "fumadocs-ui/mdx";
import { bdbInstance } from "@/lib/source2";
import { generateParams, getPage } from "@/lib/usePageTree";
import {
  DocsPage,
  DocsBody,
  DocsDescription,
  DocsTitle,
} from "fumadocs-ui/page";
import { notFound } from "next/navigation";

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  // const page = source.getPage(params.slug);
  const page = await getPage(params.slug);
  if (!page) notFound();

  // const MDX = page.data.body;
  // TODO: page.data.toc
  return (
    <DocsPage toc={[]} full={page.data.full as boolean}>
      <DocsTitle>{page.data.title as string}</DocsTitle>
      <DocsDescription>{page.data.description as string}</DocsDescription>
      <DocsBody>
        {/* <MDX components={{ ...defaultMdxComponents }} /> */}
        <div
          dangerouslySetInnerHTML={{ __html: await bdbInstance.html(page.ast) }}
        />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  // source.generateParams();
  return generateParams();
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  // const page = source.getPage(params.slug);
  const page = await getPage(params.slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
  };
}
