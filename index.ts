import fastq from "fastq";

import { unlinkSync } from "node:fs";
// import { writeFileSync } from "node:fs";
// import { toSvg } from "./src/graphVisualization";

import { db } from "./src/db";
import { generateFile } from "./src/generateFile";
import { resolveLinks } from "./src/resolveLinks";
import { scanFolder } from "./src/scanFolder";
import { watchFolder } from "./src/watchFolder";

const pathToCrawl = "example";
const destination = "tmp";

const q = fastq((arg, cb) => {
  // const svgPath = `${destination}/graph.svg`;
  // writeFileSync(svgPath, toSvg(db), { encoding: "utf8" });

  if (arg.action === "add") {
    generateFile(db, destination, pathToCrawl, arg.path);
  } else if (arg.action === "delete") {
    const basePathRegexp = RegExp(`^/${pathToCrawl}`);
    unlinkSync(destination + arg.path.replace(basePathRegexp, ""));
  }
  cb(null);
}, 1);

q.pause();
await scanFolder(db, q, pathToCrawl, false);
resolveLinks(db);
q.resume();

watchFolder(db, q, pathToCrawl, false);
