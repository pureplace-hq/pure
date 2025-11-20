import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { PostData, PureConfig } from "../types.js";

export async function copyImagesToOutput(
  posts: PostData[],
  sourceDir: string,
  outputDir: string,
  config: PureConfig,
): Promise<void> {
  await copyPostImagesToOutput(posts, sourceDir, outputDir, config);
  copyAvatar(config, sourceDir, outputDir);
}

async function copyPostImagesToOutput(
  posts: PostData[],
  sourceDir: string,
  outputDir: string,
  config: PureConfig,
): Promise<number> {
  let totalImagesCopied = 0;

  for (const post of posts) {
    for (const image of post.images) {
      const hashedPath = await copyImage(image.path, sourceDir, outputDir, config);
      if (hashedPath) {
        image.hashedPath = hashedPath;
        totalImagesCopied++;
      }
    }
  }

  return totalImagesCopied;
}

async function copyImage(
  imagePath: string,
  sourceDir: string,
  outputDir: string,
  config: PureConfig,
): Promise<string | null> {
  const stripMetadata = config.images?.stripMetadata || false;

  const sourcePath = path.resolve(sourceDir, imagePath);
  const destPath = path.join(outputDir, imagePath);

  // Copy image file if it exists
  if (!fs.existsSync(sourcePath)) {
    console.log(`Warning: Image not found: ${imagePath}`);
    return null;
  }

  // Calculate content hash
  const fileBuffer = fs.readFileSync(sourcePath);
  const hash = crypto.createHash('md5').update(fileBuffer).digest('hex').slice(0, 8);
  const parsedPath = path.parse(imagePath);
  const finalPath = path.join(parsedPath.dir, `${hash}${parsedPath.ext}`);

  // Create directory structure if needed
  const destDir = path.dirname(destPath);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  if (stripMetadata) {
    try {
      // Auto-rotate based on EXIF orientation, then strip it
      await sharp(sourcePath)
        .rotate()
        .withMetadata({
          exif: {},
          icc: undefined, // Keep color profile for quality
        })
        .toFile(destPath);
      return finalPath;
    } catch (error) {
      console.log(
        `Warning: Failed to process ${imagePath}: ${(error as Error).message}`,
      );
      return null;
    }
  }

  fs.copyFileSync(sourcePath, destPath);
  return finalPath;
}

function copyAvatar(
  config: PureConfig,
  sourceDir: string,
  outputDir: string,
): void {
  if (!config.avatar) {
    return;
  }

  const avatarPath = path.resolve(sourceDir, config.avatar);
  if (!fs.existsSync(avatarPath)) {
    console.log(`Warning: Avatar file not found: ${config.avatar}`);
    return;
  }

  const destPath = path.join(outputDir, config.avatar);
  const destDir = path.dirname(destPath);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  fs.copyFileSync(avatarPath, destPath);
  console.log(`✓ Copied avatar`);
}
