import { ComponentProps } from "react";

export const Button = ({
  className = "",
  ...rest
}: ComponentProps<"button">) => {
  return (
    <button
      {...rest}
      className={`${className} win98-button p-2 text-[var(--text-primary)]`}
    />
  );
};
