import fastq from "fastq";
import { unlinkSync } from "node:fs";
import { writeFileSync } from "node:fs";
import { toSvg } from "./src/graphVisualization";

import { db } from "./src/db";
import { generateFile } from "./src/generateFile";
import { watchFolder } from "./src/watchFolder";
import { Queue } from "./src/types";
import { getConfig } from "./src/config";

const cfg = await getConfig();

// queue should be optional in case we don't generate files
const q: Queue = fastq((arg, cb) => {
  const destination = cfg.destination;
  if (destination) {
    const svgPath = `${destination}/graph.svg`;
    writeFileSync(svgPath, toSvg(db), { encoding: "utf8" });

    if (arg.action === "add" || arg.action === "update") {
      generateFile(db, destination, cfg.source, arg.path);
    } else if (arg.action === "delete") {
      const basePathRegexp = RegExp(`^/${cfg.source}`);
      unlinkSync(destination + arg.path.replace(basePathRegexp, ""));
    }
  }
  cb(null);
}, 1);

watchFolder(db, q, cfg);
