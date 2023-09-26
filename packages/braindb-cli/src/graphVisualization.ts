import { Graphviz } from "@hpcc-js/wasm/graphviz";

const graphviz = await Graphviz.load();

export function toSvg(dot: string) {
  // https://graphviz.org/docs/layouts/
  return graphviz.layout(dot, "svg", "fdp");
}
