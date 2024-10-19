---
title: Astro integration
draft: true
---

> [!WARNING]
> This is outdated article.

## Options

### Option 1: (`@braindb/cli`)

In this case `BrainDB` acts as [obsidian-export](https://nick.groenen.me/projects/obsidian-export/).

```vizdom
digraph { 
  rankdir=LR
  node[shape=rect]
  a[label="some/folder"]
  c[label="src/content"]
  a -> BrainDB -> c
  subgraph cluster_0 {
    label=Astro
    d[label=Astro]
    e[label=dist]
    c -> d -> e
  }
}
```

### Option 2: augment though Astro components

In this case `Astro` is repsonsible for rendering and `BrainDB` used to add features on top, for example, backlinks. Basically BrainDB and Astro Content Collections run in parallel and fully independent.

```vizdom
digraph { 
  rankdir=LR
  node[shape=rect]
  c[label="src/content"]
  e[label=dist]
  f[label="Astro components"]

  c -> Astro -> e
  c -> BrainDB -> f
  f -> Astro
}
```

### Option 3: augment though Remark plugins

In this case `Astro` is repsonsible for rendering and `BrainDB` hooked in through remark plugins. BrainDB in this case responsible, for example, for wikilinks, datview.

```vizdom
digraph { 
  rankdir=LR
  node[shape=rect]
  c[label="src/content"]
  e[label=dist]
  f[label="remark plugins"]

  c -> Astro -> e
  c -> BrainDB -> f
  f -> Astro
}
```

## Old links

Ideas from discussions:

- https://github.com/withastro/roadmap/discussions/424
- https://github.com/withastro/roadmap/discussions/688
- https://github.com/withastro/roadmap/discussions/769
- https://github.com/withastro/roadmap/discussions/434
- https://github.com/withastro/roadmap/discussions/759
- https://github.com/withastro/roadmap/discussions/736
- https://github.com/withastro/roadmap/discussions/739
- https://github.com/withastro/roadmap/discussions/704
- https://github.com/withastro/roadmap/discussions/696
- https://github.com/withastro/roadmap/discussions/686
- https://github.com/withastro/roadmap/discussions/687
- https://github.com/withastro/roadmap/discussions/551
- https://github.com/withastro/roadmap/discussions/423
- https://github.com/withastro/roadmap/discussions/505
- https://github.com/withastro/roadmap/discussions/487
- https://github.com/withastro/roadmap/discussions/470
- https://github.com/withastro/roadmap/discussions/457
- https://github.com/withastro/roadmap/discussions/334
- https://github.com/withastro/roadmap/discussions/76
