import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import { imageSize } from "image-size";
import { PostData, PureConfig, ImageData } from "./types.js";

// Load configuration and posts from pure.yml file
export function loadPureConfig(
  configFile: string = "pure.yml",
  sourceDir: string,
): {
  config: PureConfig;
  posts: PostData[];
} {
  const configPath = path.join(sourceDir, configFile);

  if (!fs.existsSync(configPath)) {
    console.error(`Error: ${configFile} not found in current directory`);
    console.log("Please create a pure.yml file. Example:");
    console.log(`
name: My Photos
avatar: avatar.jpg
rss:
  baseUrl: https://example.com
images:
  stripMetadata: true

posts:
  - timestamp: 2025-01-15T10:30:00
    title: Trip to the beach
    images:
      - path: images/beach1.jpg
        caption: Sunset view
      - path: images/beach2.jpg
`);
    process.exit(1);
  }

  try {
    const fileContents = fs.readFileSync(configPath, "utf8");
    const config = yaml.load(fileContents) as PureConfig;

    if (!config.posts || !Array.isArray(config.posts)) {
      throw new Error('Invalid pure.yml: "posts" field must be an array');
    }

    console.log(`✓ Loaded configuration from ${configFile}`);
    console.log(
      `✓ Found ${config.posts.length} post${config.posts.length !== 1 ? "s" : ""}`,
    );

    // Process posts and add image dimensions
    const posts: PostData[] = config.posts.map((post) => {
      if (!post.timestamp) {
        throw new Error('Post missing required "timestamp" field');
      }
      if (!post.images || !Array.isArray(post.images)) {
        throw new Error(`Post at ${post.timestamp} missing "images" field`);
      }

      const images: ImageData[] = post.images.map((img) => {
        if (!img.path) {
          throw new Error(
            `Image missing "path" field in post at ${post.timestamp}`,
          );
        }

        const dimensions = getImageDimensions(img.path, sourceDir);
        return {
          path: img.path,
          caption: img.caption,
          width: dimensions.width,
          height: dimensions.height,
        };
      });

      return {
        timestamp: post.timestamp,
        title: post.title,
        images,
      };
    });

    // Sort by timestamp (newest first)
    posts.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    const numImages = posts.reduce((sum, post) => sum + post.images.length, 0);
    console.log(
      `✓ Total: ${numImages} image${numImages !== 1 ? "s" : ""} across all posts`,
    );

    return { config, posts };
  } catch (error) {
    console.error(`Error loading ${configFile}:`, (error as Error).message);
    process.exit(1);
  }
}

function getImageDimensions(
  imagePath: string,
  sourceDir: string,
): {
  width: number;
  height: number;
} {
  const defaultDimensions = { width: 800, height: 800 };

  try {
    const resolvedPath = path.resolve(sourceDir, imagePath);
    if (!fs.existsSync(resolvedPath)) {
      console.log(`Warning: Image not found: ${imagePath}`);
      return defaultDimensions;
    }

    const buffer = fs.readFileSync(resolvedPath);
    const dimensions = imageSize(buffer);
    return {
      width: dimensions.width || defaultDimensions.width,
      height: dimensions.height || defaultDimensions.height,
    };
  } catch (error) {
    console.log(`Error reading image dimensions for ${imagePath}:`, error);
    return defaultDimensions;
  }
}
