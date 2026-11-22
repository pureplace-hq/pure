import path from "path";

const VIDEO_EXTENSIONS = new Set([".mp4", ".m4v", ".mov"]);

export function isVideo(filePath: string): boolean {
  return VIDEO_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

interface Box {
  type: string;
  start: number; // offset of box payload
  end: number; // offset just past the box
}

// Iterate over ISO BMFF / QuickTime boxes in buffer[start, end)
function* boxes(buffer: Buffer, start: number, end: number): Generator<Box> {
  let offset = start;
  while (offset + 8 <= end) {
    let size = buffer.readUInt32BE(offset);
    const type = buffer.toString("latin1", offset + 4, offset + 8);
    let headerSize = 8;

    if (size === 1) {
      // 64-bit "largesize" follows the type
      if (offset + 16 > end) return;
      size = Number(buffer.readBigUInt64BE(offset + 8));
      headerSize = 16;
    } else if (size === 0) {
      // box extends to end of enclosing container
      size = end - offset;
    }

    if (size < headerSize || offset + size > end) return;

    yield { type, start: offset + headerSize, end: offset + size };
    offset += size;
  }
}

function findBox(
  buffer: Buffer,
  start: number,
  end: number,
  type: string,
): Box | undefined {
  for (const box of boxes(buffer, start, end)) {
    if (box.type === type) return box;
  }
  return undefined;
}

// Reads display dimensions from the first video track's tkhd box,
// applying 90°/270° rotation from the track matrix (common in phone videos).
export function getVideoDimensions(
  buffer: Buffer,
): { width: number; height: number } | null {
  const moov = findBox(buffer, 0, buffer.length, "moov");
  if (!moov) return null;

  for (const trak of boxes(buffer, moov.start, moov.end)) {
    if (trak.type !== "trak") continue;
    const tkhd = findBox(buffer, trak.start, trak.end, "tkhd");
    if (!tkhd) continue;

    const version = buffer.readUInt8(tkhd.start);
    // version(1) + flags(3) + times/track id/duration (v0: 20, v1: 32) + reserved(8)
    // + layer(2) + alternate group(2) + volume(2) + reserved(2)
    const matrixOffset = tkhd.start + 4 + (version === 1 ? 32 : 20) + 16;
    const widthOffset = matrixOffset + 36;
    if (widthOffset + 8 > tkhd.end) continue;

    // 16.16 fixed point
    const width = Math.round(buffer.readUInt32BE(widthOffset) / 65536);
    const height = Math.round(buffer.readUInt32BE(widthOffset + 4) / 65536);
    if (!width || !height) continue; // audio tracks have zero dimensions

    // Matrix is [a b u; c d v; x y w]; b != 0 means rotated by 90° or 270°
    const b = buffer.readInt32BE(matrixOffset + 4);
    return b !== 0 ? { width: height, height: width } : { width, height };
  }

  return null;
}
