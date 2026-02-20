import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xEDB88320 & (-(c & 1)));
  }
  return (~c) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  const crcVal = crc32(Buffer.concat([t, data]));
  crc.writeUInt32BE(crcVal, 0);
  return Buffer.concat([len, t, data, crc]);
}

function pngSolid(width, height, rgba) {
  const sig = Buffer.from([0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    const rowStart = y * (stride + 1);
    raw[rowStart] = 0;
    for (let x = 0; x < width; x++) {
      const p = rowStart + 1 + x * 4;
      raw[p] = rgba[0];
      raw[p+1] = rgba[1];
      raw[p+2] = rgba[2];
      raw[p+3] = rgba[3];
    }
  }

  function adler32(b) {
    let a = 1, c = 0;
    for (let i = 0; i < b.length; i++) {
      a = (a + b[i]) % 65521;
      c = (c + a) % 65521;
    }
    return (c << 16) | a;
  }

  const blocks = [];
  let offset = 0;
  while (offset < raw.length) {
    const remaining = raw.length - offset;
    const chunkLen = Math.min(remaining, 0xFFFF);
    const bfinal = offset + chunkLen >= raw.length ? 1 : 0;
    const header = Buffer.alloc(5);
    header[0] = bfinal; // BFINAL + BTYPE(00)
    header.writeUInt16LE(chunkLen, 1);
    header.writeUInt16LE((~chunkLen) & 0xFFFF, 3);
    const data = raw.subarray(offset, offset + chunkLen);
    blocks.push(header, data);
    offset += chunkLen;
  }

  const zlibHeader = Buffer.from([0x78, 0x01]);
  const ad = Buffer.alloc(4);
  ad.writeUInt32BE(adler32(raw) >>> 0, 0);
  const idatData = Buffer.concat([zlibHeader, ...blocks, ad]);

  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idatData),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

mkdirSync('public/icons', { recursive: true });
const bg = [0x0b, 0x12, 0x20, 0xff];
writeFileSync(join('public/icons','icon-192.png'), pngSolid(192, 192, bg));
writeFileSync(join('public/icons','icon-512.png'), pngSolid(512, 512, bg));
writeFileSync(join('public/icons','icon-512-maskable.png'), pngSolid(512, 512, bg));
console.log('generated icons');
