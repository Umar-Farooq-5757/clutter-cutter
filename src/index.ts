#!/usr/bin/env node

import { program } from "commander";
import organize from "./commands/organize.js";

program
  .name("clutter-cutter")
  .description("A CLI tool to organize your directories")
  .version("0.1.0");

program
  .command("just-testing")
  .action(() => console.log("Output: Yeah, working perfectly"));

program
  .command("organize")
  .description("Organize files in a target directory")
  .argument("[path]", "Directory to organize", ".")
  .option("-D, --dry-run", "Preview changes without actually moving files")
  .option("-b, --by-date", "Organize files into year/month or date folders")
  .action((path, options) => {
    organize(path, options);
  });

program.parse();
