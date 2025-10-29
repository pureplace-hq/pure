import fs from "fs";
import path from "path";
import { PostData, PureConfig } from "./types.js";
import { generateRSSFeed } from "./generator/rss.js";
import { copyImagesToOutput } from "./generator/image.js";
import { generateHTML, generateJS } from "./generator/html.js";
import { loadPureConfig } from "./config.js";

const DEFAULT_OUTPUT_DIR = "public";

export async function build(options: { output?: string }): Promise<void> {
  console.log("Generating from pure.yml...");

  const { config, posts } = loadPureConfig();
  console.log(`Found ${posts.length} post${posts.length !== 1 ? "s" : ""}`);

  const baseOutputDir = options.output || DEFAULT_OUTPUT_DIR;

  // Default to empty string prefix if not specified
  const prefixes =
    Array.isArray(config.prefixes) && config.prefixes.length > 0
      ? config.prefixes
      : [""];

  // Generate for each prefix
  for (const prefix of prefixes) {
    const outputDir = path.join(baseOutputDir, prefix);
    await generateOutput(posts, config, outputDir);
  }

  console.log(
    `\n✓ Generated ${prefixes.length} prefix${prefixes.length !== 1 ? "es" : ""}`,
  );
  console.log(`✓ Total: ${posts.length} post${posts.length !== 1 ? "s" : ""}`);
}

export async function generateOutput(
  posts: PostData[],
  config: PureConfig,
  outputDir: string,
): Promise<void> {
  console.log(`\nGenerating to ${outputDir}...`);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  await generateJS(outputDir);
  generateHTML(posts, config, outputDir);

  await copyImagesToOutput(posts, outputDir, config);

  generateRSSFeed(posts, config, outputDir);
}
