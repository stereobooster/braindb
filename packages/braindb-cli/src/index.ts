#!/usr/bin/env node

import { unlinkSync } from "node:fs";
import { writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { mkdirp } from "mkdirp";

import { getConfig } from "./config.js";
export { Config } from "./config.js";
// import { version } from "./package.json";

import { BrainDB } from "@braindb/core";

import process from "node:process";
import { Command } from "commander";
const program = new Command();

program
  .name("BrainDB")
  // .version(version)
  // .command("start", "start", { isDefault: true, })
  .description("Treat your markdown files as database")
  .option("--watch", "watch mode");

const cmd = program.parse();
const opts = cmd.opts();

getConfig().then((cfg) => {
  const { destination, transformPath, linkType, transformFrontmatter, transformUnresolvedLink } = cfg;

  const dbPath = process.cwd();
  const bdb = new BrainDB({ ...cfg, dbPath });

  bdb
    .on("*", (action, option) => {
      if (destination) {
        if (action === "ready") {
          // const jsonPath =
          //   destination +
          //   (transformPath ? transformPath(`/graph.json`) : "/graph.json");
          // writeFileSync(jsonPath, JSON.stringify(bdb.toJson(), null, 2), {
          //   encoding: "utf8",
          // });

          if (opts.watch) {
            console.log("Watching files");
            process.on("SIGINT", () => {
              bdb.stop();
            });
          } else {
            bdb.stop();
          }
        }

        if (action === "create" || action === "update") {
          const document = option?.document!;
          const path = option?.document?.path()!;
          const mdPath =
            destination + (transformPath ? transformPath(path) : path);
          mkdirp.sync(dirname(mdPath));
          writeFileSync(
            mdPath,
            document.markdown({
              transformPath,
              linkType,
              transformFrontmatter,
              transformUnresolvedLink
            }),
            {
              encoding: "utf8",
            }
          );
        } else if (action === "delete") {
          const path = option?.document?.path()!;
          unlinkSync(destination + path);
        }
      }
    })
    .start();
});
