import Link from "next/link";
import { notFound } from "next/navigation";
import { CATEGORIES, CATEGORY_LABELS } from "@/lib/categories";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function ReplayDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { id } = await params;
  const { status } = await searchParams;

  const replayCase = await prisma.replayCase.findUnique({
    where: { id },
    include: {
      assessments: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!replayCase) {
    notFound();
  }

  const counts = replayCase.assessments.reduce(
    (accumulator, assessment) => {
      accumulator[assessment.category] += 1;
      return accumulator;
    },
    {
      WG_SERVER_LAG: 0,
      SHELL_DISAPPEARED: 0,
      PLAYER_CHEATING: 0,
    },
  );

  return (
    <main className="container">
      <p>
        <Link href="/">← Back to all replay cases</Link>
      </p>
      <h1>{replayCase.originalFilename}</h1>

      <section className="card">
        <h2>Replay metadata</h2>
        <ul className="meta-list">
          <li>
            <strong>File size:</strong> {formatBytes(replayCase.fileSize)}
          </li>
          <li>
            <strong>Uploaded:</strong> {new Date(replayCase.createdAt).toLocaleString()}
          </li>
          <li>
            <strong>Stored path:</strong> {replayCase.storedPath}
          </li>
        </ul>
      </section>

      <section className="card">
        <h2>Assessment totals</h2>
        <ul className="meta-list">
          {CATEGORIES.map((category) => (
            <li key={category}>
              <strong>{CATEGORY_LABELS[category]}:</strong> {counts[category]}
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h2>Submit assessment</h2>
        {status === "submitted" ? <p className="success">Assessment submitted.</p> : null}
        {status === "duplicate" ? (
          <p className="error">Duplicate rapid submission blocked. Please wait a minute.</p>
        ) : null}
        {status === "invalid-input" ? <p className="error">Please check your input.</p> : null}

        <form action={`/api/replays/${replayCase.id}/assessments`} method="post">
          <label htmlFor="category">Category</label>
          <select id="category" name="category" required>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {CATEGORY_LABELS[category]}
              </option>
            ))}
          </select>

          <label htmlFor="comment">Comment (optional)</label>
          <textarea id="comment" name="comment" rows={4} maxLength={800} />

          <button type="submit">Submit assessment</button>
        </form>
      </section>

      <section className="card">
        <h2>Recent comments</h2>
        {replayCase.assessments.filter((assessment) => assessment.comment).length === 0 ? (
          <p>No comments yet.</p>
        ) : (
          <ul className="case-list">
            {replayCase.assessments
              .filter((assessment) => assessment.comment)
              .map((assessment) => (
                <li key={assessment.id}>
                  <div>
                    <strong>{CATEGORY_LABELS[assessment.category]}</strong> ·{" "}
                    <span className="muted">{new Date(assessment.createdAt).toLocaleString()}</span>
                  </div>
                  <p>{assessment.comment}</p>
                </li>
              ))}
          </ul>
        )}
      </section>
    </main>
  );
}
