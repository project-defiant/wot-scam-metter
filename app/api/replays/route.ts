import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStorage } from "@/lib/storage";

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;
const ALLOWED_CONTENT_TYPES = new Set([
  "application/octet-stream",
  "application/x-wotreplay",
  "application/x-worldoftanks-replay",
]);

function isAllowedReplay(file: File): boolean {
  const extension = path.extname(file.name).toLowerCase();
  if (extension !== ".wotreplay") {
    return false;
  }

  if (!file.type) {
    return true;
  }

  return ALLOWED_CONTENT_TYPES.has(file.type.toLowerCase());
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const maybeFile = formData.get("replayFile");

  if (!(maybeFile instanceof File)) {
    return NextResponse.redirect(new URL("/?error=missing-file", request.url), 303);
  }

  if (!isAllowedReplay(maybeFile)) {
    return NextResponse.redirect(new URL("/?error=invalid-file", request.url), 303);
  }

  if (maybeFile.size <= 0 || maybeFile.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.redirect(new URL("/?error=file-size", request.url), 303);
  }

  const storage = getStorage();
  const stored = await storage.saveReplay(maybeFile);

  const replayCase = await prisma.replayCase.create({
    data: {
      originalFilename: maybeFile.name,
      storedPath: stored.storedPath,
      fileSize: maybeFile.size,
    },
  });

  return NextResponse.redirect(new URL(`/replays/${replayCase.id}`, request.url), 303);
}
