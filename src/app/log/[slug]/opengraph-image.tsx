import { ImageResponse } from "next/og";
import { getAllPosts, getPost } from "@/lib/log";

// getPost reads the filesystem, so this must run on the Node runtime.
export const runtime = "nodejs";

// Prerender one image per known post (matches the page's static params).
export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export const alt = "Biscuit Lab build log";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  const title = post?.title ?? "Build log";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#FBF3E3",
          color: "#2B1B12",
          padding: "80px",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 32,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#5A3E96",
          }}
        >
          Biscuit Lab · Build log
        </div>
        <div style={{ display: "flex", fontSize: 76, fontWeight: 700, lineHeight: 1.1 }}>
          {title}
        </div>
      </div>
    ),
    { ...size },
  );
}
