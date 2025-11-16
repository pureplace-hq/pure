import fs from "fs";
import path from "path";
import ejs from "ejs";
import { Feed } from "feed";
import { PostData, PureConfig } from "../types.js";
import { fileURLToPath } from "url";
import { dirname } from "path";

const TEMPLATE_DIR = dirname(fileURLToPath(import.meta.url));

export function generateRSSFeed(
  posts: PostData[],
  config: PureConfig,
  prefix: string,
  outputDir: string,
): void {
  const baseUrl = config.baseUrl;
  if (!baseUrl) {
    console.log("RSS not configured (baseUrl required), skipping");
    return;
  }

  const siteName = config.name || "Image Gallery";
  const limit = config.rss?.limit;
  const description = config.rss?.description || siteName;

  const feed = new Feed({
    title: siteName,
    description: description,
    id: baseUrl,
    link: baseUrl,
    language: "en",
    copyright: "",
    feedLinks: {
      rss: `${baseUrl}/feed.xml`,
    },
  });

  const postsToInclude = limit ? posts.slice(0, limit) : posts;
  const templatePath = path.join(TEMPLATE_DIR, "../../templates/rss-item.ejs");
  const template = fs.readFileSync(templatePath, "utf-8");

  postsToInclude.forEach((post) => {
    const images = post.images.map((image) => {
      const imagePath = image.hashedPath || image.path;
      const imageUrl = prefix
        ? `${baseUrl}/${prefix}/${imagePath}`
        : `${baseUrl}/${imagePath}`;
      const alt = image.caption || post.title || "Post";

      return {
        url: imageUrl,
        alt: alt,
        caption: image.caption,
      };
    });

    const content = ejs.render(template, { images });

    feed.addItem({
      title: post.title || new Date(post.timestamp).toLocaleString(),
      id: `${baseUrl}/post/${new Date(post.timestamp).getTime()}`,
      link: baseUrl,
      content: content,
      date: new Date(post.timestamp),
    });
  });

  const rss = feed.rss2();
  const feedPath = path.join(outputDir, "feed.xml");
  fs.writeFileSync(feedPath, rss, "utf-8");

  console.log(`✓ RSS feed generated at ${feedPath}`);
}
