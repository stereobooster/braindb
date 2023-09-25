// import { unlinkSync } from "node:fs";
// import { writeFileSync } from "node:fs";
// import { toSvg } from "./src/graphVisualization";
// import { generateFile } from "./src/generateFile";
import { getConfig } from "./src/config";
// import { version } from "./package.json";

import { BrainDB } from "braindb-core";

import { Command } from "commander";
const program = new Command();

program
  .name("BrainDB")
  // .version(version)
  // .command("start", "start", { isDefault: true, })
  .description("Treat your markdown files as database")
  .option("--source <path>", "where are markdown files")
  .option("--destination <path>", "where to output markdown files")
  .option("--cache", "use cache");

program.parse();

const cfg = await getConfig();

const bdb = new BrainDB(cfg);

bdb
  .on("*", (action, option) => {
    const destination = cfg.destination;
    if (destination) {
      // const svgPath = `${destination}/graph.svg`;
      // writeFileSync(svgPath, toSvg(db), { encoding: "utf8" });

      if (action === "create" || action === "update") {
        console.log(action, option);
        // generateFile(db, destination, cfg.source, arg.path);
      } else if (action === "delete") {
        console.log(action, option);
        // const basePathRegexp = RegExp(`^/${cfg.source}`);
        // unlinkSync(destination + arg.path.replace(basePathRegexp, ""));
      }
    }
  })
  .start();
