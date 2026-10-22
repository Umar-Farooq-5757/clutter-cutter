#!/usr/bin/env node

import { program } from "commander";
import organize from "./commands/organize.js";
import undo from "./commands/undo.js";

program
  .name("clutter-cutter")
  .description("A CLI tool to organize your directories")
  .version("1.0.0");

program
  .command("just-testing")
  .action(() => console.log("Output: Yeah, working perfectly"));

program
  .command("organize")
  .description("Organize files in a target directory")
  .argument("[path]", "Directory to organize", ".")
  .option("-D, --dry-run", "Preview changes without actually moving files")
  .option("-w, --watch", "Watch directory in real-time for new files")
  .option("-i, --interactive", "Select each file individually to organize")
  .option("-s, --spooky", "Enable 3AM haunted mode vibes")
  .action((path, options) => {
    organize(path, options);
  });

program
  .command("undo")
  .argument("[path]", "Directory to undo", ".")
  .description("Put the files back to their original place")
  .action((path) => undo(path));

program.parse();
