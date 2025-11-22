#!/usr/bin/env node

import { Command } from "commander";
import { build } from "./build.js";
import { serve } from "./serve.js";

const DEFAULT_OUTPUT_DIR = "public";
const DEFAULT_SOURCE_DIR = process.cwd();

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
  .option("-s, --source <dir>", "Source directory", DEFAULT_SOURCE_DIR)
  .option("-o, --output <dir>", "Output directory", DEFAULT_OUTPUT_DIR)
  .action(build);

program
  .command("serve")
  .description("Build and serve the site locally")
  .option("-s, --source <dir>", "Source directory", DEFAULT_SOURCE_DIR)
  .option("-o, --output <dir>", "Output directory", DEFAULT_OUTPUT_DIR)
  .option("-p, --port <number>", "Port number", "3000")
  .action(serve);

program.parse();
