import fs from "fs";
import path from "path";
import { Feed } from "feed";
import { PostData, PureConfig } from "../types.js";

export function generateRSSFeed(
  posts: PostData[],
  config: PureConfig,
  outputDir: string,
): void {
  const baseUrl = config.rss?.baseUrl;
  if (!baseUrl) {
    console.log("RSS not configured, skipping");
    return;
  }

  const siteName = config.name || "Image Gallery";

  const feed = new Feed({
    title: siteName,
    description: "A ",
    id: baseUrl,
    link: baseUrl,
    language: "en",
    copyright: "",
    feedLinks: {
      rss: `${baseUrl}/feed.xml`,
    },
  });

  // Add each post as a feed item
  posts.forEach((post) => {
    let content = "";

    // Add images with captions
    post.images.forEach((image) => {
      const imageUrl = `${baseUrl}/${image.path}`;
      const title = post.title || "Post";
      content += `<img src="${imageUrl}" alt="${title}" /><br/>`;

      if (image.caption) {
        content += `<p>${image.caption}</p>`;
      }
    });

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
