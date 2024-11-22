import { ComponentProps } from "react";

export const Button = ({
  className = "",
  ...rest
}: ComponentProps<"button">) => {
  return (
    <button
      {...rest}
      className={`${className} border border-white p-2`}
    ></button>
  );
};
