import { unlinkSync } from "node:fs";
import { writeFileSync } from "node:fs";
import { toSvg } from "./src/graphVisualization";

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
      if (action === "ready") {
        // const svgPath = `${destination}/graph.svg`;
        // writeFileSync(svgPath, toSvg(bdb.toDot()), { encoding: "utf8" });
        const jsonPath = `${destination}/graph.json`;
        writeFileSync(jsonPath, JSON.stringify(bdb.toJson(), null, 2), {
          encoding: "utf8",
        });
        bdb.stop();
        // console.log("Watching files");
      }

      if (action === "create" || action === "update") {
        bdb.writeFile(option?.path!, destination);
      } else if (action === "delete") {
        unlinkSync(destination + option?.path);
      }
    }
  })
  .start();
