import { DataTexture, LinearFilter, RepeatWrapping, RGBAFormat, UnsignedByteType } from 'three';

/** A deterministic, tileable noise lookup. RG stores consecutive slices of a 3D field. */
export function createCloudNoise() {
  const size = 256;
  const values = new Uint8Array(size * size);
  let seed = 1376312589;
  for (let i = 0; i < values.length; i++) {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    values[i] = seed >>> 24;
  }
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      data[i] = values[y * size + x];
      data[i + 1] = values[((y + 239) % size) * size + (x + 37) % size];
      data[i + 2] = 0;
      data[i + 3] = 255;
    }
  }
  const texture = new DataTexture(data, size, size, RGBAFormat, UnsignedByteType);
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.minFilter = texture.magFilter = LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}
