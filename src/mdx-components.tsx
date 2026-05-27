import type { MDXComponents } from "mdx/types";

// https://github.com/vercel/next.js/issues/47523#issuecomment-2162604373
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    h1: (props) => <h1 className="text-2xl font-bold text-slate-900" {...props} />,
    h2: (props) => <h2 className="text-xl font-bold text-slate-900" {...props} />,
    h3: (props) => <h3 className="text-lg font-bold text-slate-900" {...props} />,
    p: (props) => <p className="text-slate-700" {...props} />,
    a: (props) => <a className="text-blue-700 hover:text-blue-900 underline transition-colors" {...props} />,
    li: (props) => <li className="text-slate-700" {...props} />,
  };
}
