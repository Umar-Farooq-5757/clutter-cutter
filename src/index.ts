#!/usr/bin/env npx tsx

import { program } from "commander";

program
  .name("clutter-cutter")
  .description("A CLI tool to organize your directories")
  .version("0.0.1");

program
  .command("just-testing")
  .action(() => console.log("Output: Yeah, working perfectly"));

program.parse()

