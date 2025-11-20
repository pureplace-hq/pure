export interface ImageData {
  path: string;
  hashedPath?: string;
  caption?: string;
  width?: number;
  height?: number;
}

export interface PostData {
  timestamp: string; // ISO 8601 format
  title?: string;
  images: ImageData[];
}

export interface TemplateData {
  posts: PostData[];
  data: { name?: string; avatar?: string; hasRss?: boolean };
}

export interface PureConfig {
  // Site configuration
  name?: string;
  avatar?: string;
  prefixes?: string[];
  baseUrl?: string;

  rss?: {
    limit?: number;
    description?: string;
  };

  images?: {
    stripMetadata?: boolean;
  };

  posts: Array<PostData>;
}

export interface BuildOptions {
  output?: string;
  source: string;
}
