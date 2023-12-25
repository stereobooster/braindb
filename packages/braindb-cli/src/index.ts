#!/usr/bin/env node

import { unlinkSync } from "node:fs";
import { mkdirp } from "mkdirp";
import { writeFileSync } from "node:fs";
import { dirname } from "node:path";

import { getConfig } from "./config.js";
export { Config } from "./config.js";
// import { version } from "./package.json";

import { BrainDB } from "@braindb/core";

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

getConfig().then((cfg) => {
  const { destination, transformPath, linkType, transformFrontmatter } = cfg;

  const dbPath = process.cwd() + "/.braindb";
  const bdb = new BrainDB({ ...cfg, dbPath });

  bdb
    .on("*", (action, option) => {
      if (destination) {
        if (action === "ready") {
          // const svgPath = `${destination}/graph.svg`;

          // const jsonPath =
          //   destination +
          //   (destinationPath ? destinationPath(`/graph.json`) : "/graph.json");
          // writeFileSync(jsonPath, JSON.stringify(bdb.toJson(), null, 2), {
          //   encoding: "utf8",
          // });
          bdb.stop();
          // console.log("Watching files");
        }

        if (action === "create" || action === "update") {
          const mdPath =
            destination +
            (transformPath ? transformPath(option?.path!) : option?.path!);
          mkdirp.sync(dirname(mdPath));
          writeFileSync(
            mdPath,
            bdb.getMarkdown(option?.path!, {
              transformPath,
              linkType,
              transformFrontmatter,
            }),
            {
              encoding: "utf8",
            }
          );
        } else if (action === "delete") {
          unlinkSync(destination + option?.path!);
        }
      }
    })
    .start();
});
