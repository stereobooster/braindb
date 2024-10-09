# `@braindb/astro`

This is an [Astro integration](https://docs.astro.build/en/guides/integrations-guide/) for BrainDB

## Usage

### Installation

Install the integration **automatically** using the Astro CLI:

```bash
pnpm astro add @braindb/astro
```

```bash
npx astro add @braindb/astro
```

```bash
yarn astro add @braindb/astro
```

Or install it **manually**:

1. Install the required dependencies

```bash
pnpm add @braindb/astro
```

```bash
npm install @braindb/astro
```

```bash
yarn add @braindb/astro
```

2. Add the integration to your astro config

```diff
+import integration from "@braindb/astro";

export default defineConfig({
  integrations: [
+    integration(),
  ],
});
```
