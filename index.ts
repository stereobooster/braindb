import { writeFileSync } from "node:fs";

import { db } from "./src/db";
import { toSvg } from "./src/graphVisualization";
import { generateFiles } from "./src/fileTransformation";
import { resolveLinks } from "./src/resolveLinks";
import { scanFolder } from "./src/scanFolder";
import { watchFolder } from "./src/watchFolder";

const pathToCrawl = "example";
const destination = "tmp";

await scanFolder(db, pathToCrawl, false);
resolveLinks(db);

watchFolder(db, pathToCrawl, false);

const svgPath = `${destination}/graph.svg`;
writeFileSync(svgPath, toSvg(db), { encoding: "utf8" });

generateFiles(db, destination, pathToCrawl);
