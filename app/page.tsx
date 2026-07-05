import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const replayCases = await prisma.replayCase.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          assessments: true,
        },
      },
    },
  });

  return (
    <main className="container">
      <h1>WOT Scam Meter</h1>
      <p className="subtitle">
        Upload a <code>.wotreplay</code> file and crowd-assess if it looks like lag,
        disappearing shells, or cheating.
      </p>

      <section className="card">
        <h2>Upload replay</h2>
        {error ? <p className="error">Upload failed: {error}</p> : null}
        <form action="/api/replays" method="post" encType="multipart/form-data">
          <label htmlFor="replayFile">Replay file</label>
          <input id="replayFile" name="replayFile" type="file" accept=".wotreplay" required />
          <button type="submit">Upload replay</button>
        </form>
      </section>

      <section className="card">
        <h2>Replay cases</h2>
        {replayCases.length === 0 ? (
          <p>No replay cases uploaded yet.</p>
        ) : (
          <ul className="case-list">
            {replayCases.map((replay) => (
              <li key={replay.id}>
                <Link href={`/replays/${replay.id}`}>{replay.originalFilename}</Link>
                <div className="muted">
                  Uploaded {new Date(replay.createdAt).toLocaleString()} · {formatBytes(replay.fileSize)} ·
                  {replay._count.assessments} assessments
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
