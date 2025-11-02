export interface ImageData {
  path: string;
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
  data: { name?: string; avatar?: string };
}

export interface PureConfig {
  // Site configuration
  name?: string;
  avatar?: string;
  prefixes?: string[];
  domain?: string;

  rss?: {
    baseUrl?: string;
  };

  images?: {
    stripMetadata?: boolean;
  };

  posts: Array<PostData>;
}
