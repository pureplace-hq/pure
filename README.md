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
- **rss.baseUrl**: Base URL for RSS feed generation (required for RSS)
  ```yaml
  rss:
    baseUrl: https://example.com
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
  - **path**: Path to image file
  - **caption**: Optional caption for individual image

### Complete Example

```yaml
name: My Pictures
avatar: profile.jpg
rss:
  baseUrl: https://photos.example.com
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
```

## Features

- RSS feed generation
- Private pages and feeds

## License

AGPL-3.0
