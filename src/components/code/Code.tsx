import { PropsWithChildren } from "react";
import { Code as BrightCode, BrightProps } from "bright";
import theme from "./theme";

export type CodeProps = Partial<BrightProps> & PropsWithChildren;

const Code = ({ children, ...rest }: CodeProps) => {
  return (
    <BrightCode {...rest} theme={theme}>
      {children}
    </BrightCode>
  );
};

export default Code;
