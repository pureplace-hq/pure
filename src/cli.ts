#!/usr/bin/env node

import { Command } from "commander";
import { build } from "./build.js";

const DEFAULT_OUTPUT_DIR = "public";

const program = new Command();

program
  .name("pure")
  .description(
    "A static site generator for photo sharing, focused on pure simplicity.",
  )
  .version("0.0.1");

program
  .command("build")
  .description("Build the static site")
  .option("-o, --output <dir>", "Output directory", DEFAULT_OUTPUT_DIR)
  .action(build);

program.parse();
