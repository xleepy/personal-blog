import { ComponentProps } from "react";
import GlassContainer from "../GlassContainer";

export const Button = ({
  className = "",
  ...rest
}: ComponentProps<"button">) => {
  return (
    <GlassContainer
      as="button"
      {...rest}
      className={`${className} glass-control glass-interactive p-2 text-[var(--text-primary)]`}
    />
  );
};
