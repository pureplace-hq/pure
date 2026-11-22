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
      const result =
        image.type === "video"
          ? await copyVideo(image.path, image.poster, sourceDir, outputDir)
          : await copyImage(image.path, sourceDir, outputDir, config);
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
  sourceDir: string,
  outputDir: string,
  config: PureConfig,
): Promise<{ hashedPath: string; thumbnailPath: string } | null> {
  const stripMetadata = config.images?.stripMetadata || false;

  const sourcePath = path.resolve(sourceDir, imagePath);

  // Copy image file if it exists
  if (!fs.existsSync(sourcePath)) {
    console.log(`Warning: Image not found: ${imagePath}`);
    return null;
  }

  // Calculate content hash
  const fileBuffer = fs.readFileSync(sourcePath);
  const hash = crypto
    .createHash("md5")
    .update(fileBuffer)
    .digest("hex")
    .slice(0, 8);
  const parsedPath = path.parse(imagePath);
  const hashedFilename = `${hash}${parsedPath.ext}`;
  const relativePath = path.join(parsedPath.dir, hashedFilename);
  const thumbnailPath = path.join(
    parsedPath.dir,
    `${hash}-thumb${parsedPath.ext}`,
  );

  const destPath = path.join(outputDir, relativePath);
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
      fit: "inside",
    });

    // Process both images in parallel
    await Promise.all([
      fullPipeline.toFile(destPath),
      thumbPipeline.toFile(destThumbPath),
    ]);

    return { hashedPath: relativePath, thumbnailPath };
  } catch (error) {
    console.log(
      `Warning: Failed to process ${imagePath}: ${(error as Error).message}`,
    );
    return null;
  }
}

// Videos are copied as-is (no transcoding). The grid tile is the video itself
// unless a poster image is given, in which case it becomes the thumbnail.
async function copyVideo(
  videoPath: string,
  posterPath: string | undefined,
  sourceDir: string,
  outputDir: string,
): Promise<{ hashedPath: string; thumbnailPath?: string } | null> {
  const sourcePath = path.resolve(sourceDir, videoPath);
  if (!fs.existsSync(sourcePath)) {
    console.log(`Warning: Video not found: ${videoPath}`);
    return null;
  }

  const hash = crypto
    .createHash("md5")
    .update(fs.readFileSync(sourcePath))
    .digest("hex")
    .slice(0, 8);
  const parsedPath = path.parse(videoPath);
  const hashedPath = path.join(parsedPath.dir, `${hash}${parsedPath.ext}`);
  const destPath = path.join(outputDir, hashedPath);
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.copyFileSync(sourcePath, destPath);

  if (!posterPath) {
    return { hashedPath };
  }

  const posterSource = path.resolve(sourceDir, posterPath);
  if (!fs.existsSync(posterSource)) {
    console.log(`Warning: Poster not found: ${posterPath}`);
    return { hashedPath };
  }

  const thumbnailPath = path.join(
    parsedPath.dir,
    `${hash}-thumb${path.extname(posterPath)}`,
  );
  try {
    await sharp(posterSource)
      .rotate()
      .resize(400, null, { withoutEnlargement: true, fit: "inside" })
      .toFile(path.join(outputDir, thumbnailPath));
    return { hashedPath, thumbnailPath };
  } catch (error) {
    console.log(
      `Warning: Failed to process poster ${posterPath}: ${(error as Error).message}`,
    );
    return { hashedPath };
  }
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
