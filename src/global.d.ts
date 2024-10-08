declare module "*.mdx" {
  import { Element, MDXProps } from "mdx/types";

  /**
   * An function component which renders the MDX content using JSX.
   *
   * @param props This value is be available as the named variable `props` inside the MDX component.
   * @returns A JSX element. The meaning of this may depend on the project configuration. I.e. it
   * could be a React, Preact, or Vuex element.
   */
  export default function MDXContent(props: MDXProps): Element;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const frontmatter: Record<string, any>;
}
