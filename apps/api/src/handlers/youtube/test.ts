import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import ffmpeg from 'fluent-ffmpeg';
import { Jimp, JimpMime, ResizeStrategy } from 'jimp';
import { Readable } from 'stream';

const ENABLE_ENCRYPTION = false;
const KEY = (process.env.ENCRYPTION_KEY || 'DefaultEncryptionKey').slice(0, 16);

function quotientRemainder(dividend: number, divisor: number): [number, number] {
  return [Math.floor(dividend / divisor), dividend % divisor];
}

function colorValue(x: number): number {
  return x * 255;
}

function normal(x: number): number {
  return x / 255;
}

async function encode(
  infilePath: string,
  outVideoPath: string,
  encrypt = ENABLE_ENCRYPTION,
  key = KEY,
  fps = 20,
  numColsPerFrame = 64,
  numRowsPerFrame = 36
): Promise<void> {
  const rawData = fs.readFileSync(infilePath);
  let dataBytes = encrypt ? encryptDataAES(rawData, key) : rawData;

  const lenOfData = dataBytes.length;
  const numBytesPerRow = Math.floor((numColsPerFrame * 3) / 8);
  const numBytesPerFrame = numBytesPerRow * numRowsPerFrame;

  const lenBytes = Buffer.alloc(4);
  lenBytes.writeUInt32BE(lenOfData, 0);
  dataBytes = Buffer.concat([lenBytes, dataBytes]);

  const [numFrames, numLeftoverBytes] = quotientRemainder(dataBytes.length, numBytesPerFrame);
  if (numLeftoverBytes > 0) {
    const paddingBytes = Buffer.alloc(numBytesPerFrame - numLeftoverBytes, 0);
    dataBytes = Buffer.concat([dataBytes, paddingBytes]);
  }

  const size = { width: numColsPerFrame * 20, height: numRowsPerFrame * 20 };
  const frames: Readable[] = [];

  for (let i = 0; i <= numFrames; i++) {
    const frameBytes = dataBytes.subarray(i * numBytesPerFrame, (i + 1) * numBytesPerFrame);
    const frameBits = [...frameBytes].flatMap(byte => {
      return Array.from({ length: 8 }, (_, bit) => (byte >> (7 - bit)) & 1);
    });

    const frameData = frameBits.map(bit => colorValue(bit));
    // numColsPerFrame, numRowsPerFrame
    const frameImage = new Jimp({
        width: numColsPerFrame,
        height: numRowsPerFrame,
    });
    frameImage.scan(0, 0, numColsPerFrame, numRowsPerFrame,  (x, y, idx) => {
      const pixelIdx = (y * numColsPerFrame + x) * 3;
      frameImage.bitmap.data[idx] = frameData[pixelIdx];
      frameImage.bitmap.data[idx + 1] = frameData[pixelIdx + 1];
      frameImage.bitmap.data[idx + 2] = frameData[pixelIdx + 2];
      frameImage.bitmap.data[idx + 3] = 255;
    });
    // size.width, size.height, ResizeStrategy.BICUBIC
    const resized = await frameImage.resize({
        w: size.width,
        h: size.height,
        mode: ResizeStrategy.BICUBIC,
    }).getBuffer(JimpMime.png);
  

    const resizedStream = bufferToStream(resized);
    frames.push(resizedStream);
  }
  await new Promise<void>((resolve, reject) => {
    const command = ffmpeg();
    frames.forEach(frame => command.input(frame));
    command
      .output(outVideoPath)
      .fps(fps)
      .on('end', () => {
        resolve();
      })
      .on('error', reject)
      .run();
  });
}

function bufferToStream(buffer: Buffer): Readable {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
}

async function decode(
  inVideoPath: string,
  outFilePath: string,
  decrypt = ENABLE_ENCRYPTION,
  key = KEY
): Promise<void> {
  const dataBitsList: number[] = [];
  // @ts-ignore
  const step = 20;

  await new Promise<void>((resolve, reject) => {
    ffmpeg(inVideoPath)
      .outputOptions('-vf', `fps=1`)
      .on('end', () => {
        resolve();
      })
      .on('error', reject)
      .saveToFile('frames/%d.png');
  });

  const frameFiles = fs.readdirSync('frames').sort();
  for (const file of frameFiles) {
    const frame = await Jimp.read(path.join('frames', file));
    frame.scan(0, 0, frame.bitmap.width, frame.bitmap.height, function (x, y, idx) {
      const round = normal(frame.bitmap.data[idx]) > 0.5 ? 1 : 0;
      dataBitsList.push(round);
    });
  }

  const dataBits = Uint8Array.from(dataBitsList);
  const dataBytes = Buffer.from(dataBits.buffer);
  const lenOfData = dataBytes.readUInt32BE(0);
  let dataBytesRetrieved = dataBytes.subarray(4, lenOfData + 4);

  if (decrypt) {
    dataBytesRetrieved = decryptDataAES(dataBytesRetrieved, key);
  }

  fs.writeFileSync(outFilePath, dataBytesRetrieved);
}

export { encode, decode };

encode('input.txt', 'output.mp4');