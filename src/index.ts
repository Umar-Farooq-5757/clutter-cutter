#!/usr/bin/env node

import { program } from "commander";

program
  .name("clutter-cutter")
  .description("A CLI tool to organize your directories")
  .version("0.0.1");

program
  .command("just-testing")
  .action(() => console.log("Yeah, working perfectly"));

program.parse()
