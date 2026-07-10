import type { MDXComponents } from "mdx/types";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    h1: (props) => <h1 className="text-2xl font-bold text-[var(--text-primary)]" {...props} />,
    h2: (props) => <h2 className="text-xl font-bold text-[var(--text-primary)]" {...props} />,
    h3: (props) => <h3 className="text-lg font-bold text-[var(--text-primary)]" {...props} />,
    p: (props) => <p className="leading-relaxed text-[var(--text-secondary)]" {...props} />,
    a: (props) => <a className="win98-link" {...props} />,
    li: (props) => <li className="text-[var(--text-secondary)]" {...props} />,
  };
}
