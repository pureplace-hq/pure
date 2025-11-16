import fs from "fs";
import path from "path";
import { Feed } from "feed";
import { PostData, PureConfig } from "../types.js";

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

  const feed = new Feed({
    title: siteName,
    description: "description",
    id: baseUrl,
    link: baseUrl,
    language: "en",
    copyright: "",
    feedLinks: {
      rss: `${baseUrl}/feed.xml`,
    },
  });

  const postsToInclude = limit ? posts.slice(0, limit) : posts;

  postsToInclude.forEach((post) => {
    let content = "";

    post.images.forEach((image) => {
      const imagePath = image.hashedPath || image.path;
      const imageUrl = prefix
        ? `${baseUrl}/${prefix}/${imagePath}`
        : `${baseUrl}/${imagePath}`;
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
