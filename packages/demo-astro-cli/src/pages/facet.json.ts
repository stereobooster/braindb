import { bdb } from "../lib/braindb";

export async function GET() {
  return new Response(
    JSON.stringify(
      (await bdb.documents()).map((document) => {
        const pathParts = document.url().split("/");
        pathParts.shift(); // ''
        pathParts.pop(); // ''
        pathParts.shift(); // 'notes'

        return {
          // id: document.id(),
          url: document.url(),
          title: document.frontmatter().title as string,
          content: document.text(),
          tags: document.frontmatter().tags || [],
          path: {
            lvl0: pathParts[0],
            lvl1: pathParts[1],
            lvl2: pathParts[2],
          },
        };
      }),
      null,
      2
    )
  );
}
