import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllPosts, getPost, formatPostDate } from "@/lib/log";
import styles from "./page.module.css";

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

// Only prerendered slugs are valid; anything else 404s.
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.summary,
    alternates: { canonical: `/log/${slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.summary,
      url: `/log/${slug}`,
    },
  };
}

export default async function LogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const { default: Post } = await import(`@/content/log/${slug}.mdx`);

  return (
    <main id="main" className={styles.wrap}>
      <article>
        <header className={styles.header}>
          <p className={styles.meta}>
            <Link href="/log" className={styles.back}>
              Build log
            </Link>
            <span aria-hidden="true"> · </span>
            <time dateTime={post.date}>{formatPostDate(post.date)}</time>
          </p>
          <h1 className={styles.title}>{post.title}</h1>
          <p className={styles.summary}>{post.summary}</p>
        </header>
        <div className={styles.prose}>
          <Post />
        </div>
      </article>
    </main>
  );
}
