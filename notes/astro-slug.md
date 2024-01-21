# Astro slug

From `astro/packages/astro/src/content/utils.ts`:

```ts
import { slug as githubSlug } from 'github-slugger';
import path from 'node:path';

export function getContentEntryIdAndSlug({
  entry,
  contentDir,
  collection,
}: Pick<ContentPaths, "contentDir"> & { entry: URL; collection: string }): {
  id: string;
  slug: string;
} {
  const relativePath = getRelativeEntryPath(entry, collection, contentDir);
  const withoutFileExt = relativePath.replace(
    new RegExp(path.extname(relativePath) + "$"),
    ""
  );
  const rawSlugSegments = withoutFileExt.split(path.sep);

  const slug = rawSlugSegments
    // Slugify each route segment to handle capitalization and spaces.
    // Note: using `slug` instead of `new Slugger()` means no slug deduping.
    .map((segment) => githubSlug(segment))
    .join("/")
    .replace(/\/index$/, "");

  const res = {
    id: normalizePath(relativePath),
    slug,
  };
  return res;
}

function getRelativeEntryPath(entry: URL, collection: string, contentDir: URL) {
  const relativeToContent = path.relative(
    fileURLToPath(contentDir),
    fileURLToPath(entry)
  );
  const relativeToCollection = path.relative(collection, relativeToContent);
  return relativeToCollection;
}
```
