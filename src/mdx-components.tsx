import type { MDXComponents } from "mdx/types";

// https://github.com/vercel/next.js/issues/47523#issuecomment-2162604373
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
  };
}
