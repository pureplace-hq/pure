import fs from "fs";
import path from "path";
import { PostData, PureConfig, BuildOptions } from "./types.js";
import { generateRSSFeed } from "./generator/rss.js";
import { copyImagesToOutput } from "./generator/image.js";
import { generateHTML, generateJS } from "./generator/html.js";
import { generateCNAME } from "./generator/file.js";
import { loadPureConfig } from "./config.js";

const DEFAULT_OUTPUT_DIR = "public";

export async function build(options: BuildOptions): Promise<void> {
  console.log("Generating from pure.yml...");

  const { config, posts } = loadPureConfig();
  console.log(`Found ${posts.length} post${posts.length !== 1 ? "s" : ""}`);

  // Default to empty string prefix if not specified
  const prefixes =
    Array.isArray(config.prefixes) && config.prefixes.length > 0
      ? config.prefixes
      : [""];

  // Generate for each prefix
  for (const prefix of prefixes) {
    await generateOutput(posts, config, prefix, options);
  }

  console.log(
    `\n✓ Generated ${prefixes.length} prefix${prefixes.length !== 1 ? "es" : ""}`,
  );
  console.log(`✓ Total: ${posts.length} post${posts.length !== 1 ? "s" : ""}`);
}

export async function generateOutput(
  posts: PostData[],
  config: PureConfig,
  prefix: string,
  options: BuildOptions,
): Promise<void> {
  const baseOutputDir = options.output || DEFAULT_OUTPUT_DIR;
  const outputDir = path.join(baseOutputDir, prefix);

  console.log(`\nGenerating to ${outputDir}...`);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  await generateJS(outputDir);
  await copyImagesToOutput(posts, outputDir, config);

  generateHTML(posts, config, outputDir);
  generateRSSFeed(posts, config, prefix, outputDir);
  generateCNAME(config, outputDir);
}
