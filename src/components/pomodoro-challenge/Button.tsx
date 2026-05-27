import { ComponentProps } from "react";

export const Button = ({
  className = "",
  ...rest
}: ComponentProps<"button">) => {
  return (
    <button
      {...rest}
      className={`${className} bg-white/30 backdrop-blur-sm border border-white/20 rounded-xs p-2 text-slate-900 hover:bg-white/40 transition-colors`}
    ></button>
  );
};
