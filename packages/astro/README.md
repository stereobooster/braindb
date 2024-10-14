# `@braindb/astro`

> [!WARNING]
> You need to add `@braindb/core` as direct dependency due to [vitejs/vite#14289](https://github.com/vitejs/vite/issues/14289)

This is an [Astro integration](https://docs.astro.build/en/guides/integrations-guide/) for [BrainDB](https://github.com/stereobooster/braindb).

## Usage

### Installation

Install the integration **automatically** using the Astro CLI:

```bash
pnpm add @braindb/core
pnpm astro add @braindb/astro
```

```bash
npm install @braindb/core
npx astro add @braindb/astro
```

```bash
yarn add @braindb/core
yarn astro add @braindb/astro
```

Or install it **manually**:

1. Install the required dependencies

```bash
pnpm add @braindb/astro @braindb/core
```

```bash
npm install @braindb/astro @braindb/core
```

```bash
yarn add @braindb/astro @braindb/core
```

2. Add the integration to your astro config

```diff
+import brainDbAstro from "@braindb/astro";

export default defineConfig({
  integrations: [
+    brainDbAstro(),
  ],
});
```

### if you need BrainDB instance

```js
import { brainDbAstro, getBrainDb } from "@braindb/astro";

const bdb = getBrainDb();
```

### Wiki links

By default plugin adds [`@braindb/remark-wiki-link`](https://github.com/stereobooster/braindb/tree/main/packages/remark-wiki-link) to support wiki links (`[[]]`)

You can disable it, like this:

```diff
export default defineConfig({
  integrations: [
+    brainDbAstro({ remarkWikiLink: false }),
  ],
});
```

## TODO

- [ ] add `@braindb/remark-dataview` when it will be stable
