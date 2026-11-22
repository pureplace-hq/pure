# Pure

A static site generator for photo sharing, focused on pure simplicity.

## Usage

```bash
pure build
```

This will generate the site inside the `public/` folder.

## Configuration

All configuration is done in a single `pure.yml` file.

### Site Configuration (Optional)

- **name**: Display name for the site (default: "username")
- **avatar**: Path to profile picture
- **baseUrl**: Base URL with protocol
  ```yaml
  baseUrl: https://example.com
  ```
- **rss.limit**: Maximum number of posts to include in RSS feed (default: all posts)
  ```yaml
  rss:
    limit: 50
  ```
- **prefixes**: Array of site prefixes. Can be used to generate unguessable "private" versions of the site.
  ```yaml
  prefixes:
    - abcd1234xyz # Generates to public/abcd1234xyz
  ```

### Posts Configuration (Required)

Each post requires:

- **timestamp**: Date/time in ISO 8601 format
  - Full: `2025-01-15T10:30:00`
  - Date only: `2025-01-15`
- **title**: Optional title for the post
- **images**: Array of image objects
  - **path**: Path to image or video file
  - **caption**: Optional caption for individual image
  - **poster**: Optional thumbnail image for a video

### Videos

Files ending in `.mp4`, `.m4v` or `.mov` are treated as videos and play in the
lightbox alongside photos. Videos are copied as-is (no transcoding), so use a
format browsers can play, such as H.264 or HEVC MP4. No ffmpeg is required.

Without a `poster`, the grid shows a frame from the video itself. With a
`poster`, that image is resized into the grid thumbnail instead, which is
lighter for the browser to load.

```yaml
images:
  - path: img/waves.mp4
    poster: img/waves.jpg
```

### Complete Example

```yaml
name: My Pictures
avatar: profile.jpg
baseUrl: https://example.com
rss:
  limit: 50
prefixes:
  - abcd1234xyz

posts:
  # Post with captions
  - timestamp: 2025-01-15T14:30:00
    title: Afternoon at the park
    images:
      - path: img/park1.jpg
        caption: Cherry blossoms in full bloom
      - path: img/park2.jpg
        caption: The old bridge

  # Post without title
  - timestamp: 2025-01-10T00:00:00
    images:
      - path: img/sunset.jpg

  # Multi-image post
  - timestamp: 2025-01-05T18:00:00
    title: Urban exploration
    images:
      - path: img/city1.jpg
      - path: img/city2.jpg
      - path: img/city3.jpg

  # Post with a video
  - timestamp: 2025-01-01T12:00:00
    title: Fireworks
    images:
      - path: img/fireworks.mp4
        caption: Midnight
```

## Features

- RSS feed generation
- Private pages and feeds

## License

AGPL-3.0
