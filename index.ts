import fastq from "fastq";

import { unlinkSync } from "node:fs";
// import { writeFileSync } from "node:fs";
// import { toSvg } from "./src/graphVisualization";

import { db } from "./src/db";
import { generateFile } from "./src/generateFile";
import { resolveLinks } from "./src/resolveLinks";
import { scanFolder } from "./src/scanFolder";
import { watchFolder } from "./src/watchFolder";
import { Queue } from "./src/queue";

const pathToCrawl = "example";
const destination = "tmp";

// queue should be optional in case we don't generate files
const q: Queue = fastq((arg, cb) => {
  // const svgPath = `${destination}/graph.svg`;
  // writeFileSync(svgPath, toSvg(db), { encoding: "utf8" });

  if (arg.action === "add" || arg.action === "update") {
    generateFile(db, destination, pathToCrawl, arg.path);
  } else if (arg.action === "delete") {
    const basePathRegexp = RegExp(`^/${pathToCrawl}`);
    unlinkSync(destination + ("/" + arg.path).replace(basePathRegexp, ""));
  }
  cb(null);
}, 1);

// instead of pausing queue I can use tmp array,
// so that files without outgoing links can be generated faster
q.pause();
await scanFolder(db, q, pathToCrawl, false);
resolveLinks(db);
q.resume();

watchFolder(db, q, pathToCrawl, false);
