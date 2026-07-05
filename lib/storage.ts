import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

export interface StoredFileResult {
  storedPath: string;
}

export interface FileStorage {
  saveReplay(file: File): Promise<StoredFileResult>;
}

export class LocalFileStorage implements FileStorage {
  constructor(private readonly baseDir: string) {}

  async saveReplay(file: File): Promise<StoredFileResult> {
    await mkdir(this.baseDir, { recursive: true });

    const extension = path.extname(file.name) || ".wotreplay";
    const filename = `${randomUUID()}${extension.toLowerCase()}`;
    const absolutePath = path.join(this.baseDir, filename);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(absolutePath, buffer);

    return {
      storedPath: path.join("uploads", filename),
    };
  }
}

export function getStorage(): FileStorage {
  const baseDir = process.env.UPLOAD_DIR
    ? path.resolve(process.env.UPLOAD_DIR)
    : path.join(process.cwd(), "uploads");

  return new LocalFileStorage(baseDir);
}
