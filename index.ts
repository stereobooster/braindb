import { writeFileSync } from "node:fs";

import { db } from "./src/db";
import { toSvg } from "./src/graphVisualization";
import { generateFiles } from "./src/fileTransformation";
import { resolveLinks } from "./src/resolveLinks";
import { scanFolder } from "./src/scanFolder";
import { watchFolder } from "./src/watchFolder";

const pathToCrawl = "example";

await scanFolder(db, pathToCrawl, false);

resolveLinks(db);

const svgPath = new URL("tmp/graph.svg", import.meta.url);
writeFileSync(svgPath, toSvg(db), { encoding: "utf8" });

const destination = "tmp";
generateFiles(db, destination, pathToCrawl);

watchFolder(db, pathToCrawl, false);