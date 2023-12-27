# Usecases

## Obvious cases

|                  | Output    | convert wiki-links | find broken links | build backlinks | build graph |
| ---------------- | --------- | ------------------ | ----------------- | --------------- | ----------- |
| Hugo → Hugo      | PML       | -                  | +                 | +               | +           |
| Obsidian → Hugo  | PML       | +                  | +                 | +               | +           |
| Astro → Astro    | web-links | -                  | +                 | +               | +           |
| Obsidian → Astro | web-links | +                  | +                 | +               | +           |

- PML is the easiest option, because Hugo can figure out links itself
- Web-links is the only supported option by Astro
- Astro doesn't allow `slug` in frontmatter, but it has an algorithm to generate one
- `X → X`, I assume `source` and `output` directories are **the same**, so no need to write `md` (`mdx`) files. Need to write auxilary files only, for example:
  - `filename-backlinks.json`
  - `filename-graph.json`, `filename-graph.svg` - local graph with distance 1 with outgoing and incoming links
  - `backlinks.json`, where `{ [slug]: [...backlinks] }`
  - `graph.json`, `graph.svg`
- `X → Y`, I assume `source` and `output` directories are **different**.
  - Auxilary data, like backlinks can be placed in frontmatter
  - Or can be kept in separate files as in `X → X` scenario
- additionaly BrainDb can be used to typecheck frontmatter (like in Astro)
  - adding scheme support would also allow to do faceted search

## Out of scope (for now)

- conversion from one web-links to another web-links
  - as a workaround one can convert from one web-link to PML, and then PML to another web-links
- images
  - `![](/path)`
  - `<img src="path">`

## Other

- From `Foam`
  - specifics: wikilinks with long slugs, reference links
