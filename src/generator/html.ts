import fs from "fs";
import path from "path";
import ejs from "ejs";
import esbuild from "esbuild";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { PostData, PureConfig, TemplateData } from "../types.js";

const SOURCE_DIR = dirname(fileURLToPath(import.meta.url));

export async function generateJS(outputDir: string): Promise<void> {
  try {
    await esbuild.build({
      entryPoints: [path.join(SOURCE_DIR, "../../templates/gallery.js")],
      bundle: true,
      minify: true,
      outfile: path.join(outputDir, "gallery.js"),
      format: "iife",
      loader: { ".css": "css" },
      logLevel: "info",
    });
  } catch (error) {
    console.error("Error building gallery.js:", error);
    process.exit(1);
  }
}

// Generate HTML using EJS
export function generateHTML(
  posts: PostData[],
  config: PureConfig,
  outputDir: string,
): void {
  const templatePath = path.join(SOURCE_DIR, "../../templates/index.ejs");

  const templateData: TemplateData = {
    posts,
    data: {
      name: config.name,
      avatar: config.avatar,
    },
  };

  // Validate avatar path if provided
  if (config.avatar) {
    const avatarPath = path.resolve(config.avatar);
    if (!fs.existsSync(avatarPath)) {
      console.log(`Warning: Avatar file not found: ${config.avatar}`);
      templateData.data.avatar = undefined;
    }
  }

  const html = ejs.render(fs.readFileSync(templatePath, "utf-8"), templateData);
  const outputPath = path.join(outputDir, "index.html");
  fs.writeFileSync(outputPath, html, "utf-8");

  console.log(`✓ Page generated at ${outputPath}`);
}
