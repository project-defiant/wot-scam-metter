import { createHash } from "node:crypto";
import { AssessmentCategory } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const DUPLICATE_WINDOW_MS = 60_000;

const assessmentSchema = z.object({
  category: z.nativeEnum(AssessmentCategory),
  comment: z
    .string()
    .trim()
    .max(800, "Comment is too long")
    .optional()
    .transform((value) => (value ? value : undefined)),
});

function getClientFingerprint(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for") ?? "";
  const ip = forwardedFor.split(",")[0]?.trim() || "unknown-ip";
  const userAgent = request.headers.get("user-agent") ?? "unknown-ua";

  return createHash("sha256")
    .update(`${ip}:${userAgent}`)
    .digest("hex")
    .slice(0, 32);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const formData = await request.formData();

  const parsed = assessmentSchema.safeParse({
    category: formData.get("category"),
    comment: formData.get("comment"),
  });

  if (!parsed.success) {
    return NextResponse.redirect(
      new URL(`/replays/${id}?status=invalid-input`, request.url),
      303,
    );
  }

  const replayCase = await prisma.replayCase.findUnique({ where: { id } });
  if (!replayCase) {
    return NextResponse.redirect(new URL("/?error=missing-replay", request.url), 303);
  }

  const clientFingerprint = getClientFingerprint(request);
  const since = new Date(Date.now() - DUPLICATE_WINDOW_MS);

  const duplicate = await prisma.assessment.findFirst({
    where: {
      replayCaseId: id,
      category: parsed.data.category,
      clientFingerprint,
      createdAt: { gte: since },
    },
    select: { id: true },
  });

  if (duplicate) {
    return NextResponse.redirect(
      new URL(`/replays/${id}?status=duplicate`, request.url),
      303,
    );
  }

  await prisma.assessment.create({
    data: {
      replayCaseId: id,
      category: parsed.data.category,
      comment: parsed.data.comment,
      clientFingerprint,
    },
  });

  return NextResponse.redirect(new URL(`/replays/${id}?status=submitted`, request.url), 303);
}
