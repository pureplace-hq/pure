import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { PostData, PureConfig } from "../types.js";

export async function copyImagesToOutput(
  posts: PostData[],
  outputDir: string,
  config: PureConfig,
): Promise<void> {
  await copyPostImagesToOutput(posts, outputDir, config);
  copyAvatar(config, outputDir);
}

async function copyPostImagesToOutput(
  posts: PostData[],
  outputDir: string,
  config: PureConfig,
): Promise<number> {
  let totalImagesCopied = 0;

  for (const post of posts) {
    for (const image of post.images) {
      const result = await copyImage(image.path, outputDir, config);
      if (result) {
        image.hashedPath = result.hashedPath;
        image.thumbnailPath = result.thumbnailPath;
        totalImagesCopied++;
      }
    }
  }

  return totalImagesCopied;
}

async function copyImage(
  imagePath: string,
  outputDir: string,
  config: PureConfig,
): Promise<{ hashedPath: string; thumbnailPath: string } | null> {
  const stripMetadata = config.images?.stripMetadata || false;

  const sourcePath = path.resolve(imagePath);

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
  const thumbnailPath = path.join(parsedPath.dir, `${hash}-thumb${parsedPath.ext}`);

  const destPath = path.join(outputDir, finalPath);
  const destThumbPath = path.join(outputDir, thumbnailPath);

  // Create directory structure if needed
  const destDir = path.dirname(destPath);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  try {
    // Always use sharp to generate both full-size and thumbnail
    let fullPipeline = sharp(sourcePath).rotate();
    let thumbPipeline = sharp(sourcePath).rotate();

    // Apply metadata stripping if enabled
    if (stripMetadata) {
      fullPipeline = fullPipeline.withMetadata({
        exif: {},
        icc: undefined,
      });
      thumbPipeline = thumbPipeline.withMetadata({
        exif: {},
        icc: undefined,
      });
    }

    // Generate thumbnail (400px width, preserving aspect ratio)
    thumbPipeline = thumbPipeline.resize(400, null, {
      withoutEnlargement: true,
      fit: 'inside',
    });

    // Process both images
    await Promise.all([
      fullPipeline.toFile(destPath),
      thumbPipeline.toFile(destThumbPath),
    ]);

    return { hashedPath: finalPath, thumbnailPath };
  } catch (error) {
    console.log(
      `Warning: Failed to process ${imagePath}: ${(error as Error).message}`,
    );
    return null;
  }
}

function copyAvatar(config: PureConfig, outputDir: string): void {
  if (!config.avatar) {
    return;
  }

  const avatarPath = path.resolve(config.avatar);
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
