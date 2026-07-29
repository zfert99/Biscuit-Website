import type { MDXComponents } from "mdx/types";

// Required by @next/mdx in the App Router. Element styling is handled by the
// `.prose` wrapper in the post route, so this stays a passthrough for now.
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return { ...components };
}
