import { PropsWithChildren } from "react";
import { Code as BrightCode } from "bright";
import theme from "./theme";

const Code = ({ children }: PropsWithChildren) => {
  return <BrightCode theme={theme}>{children}</BrightCode>;
};

export default Code;
