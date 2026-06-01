import { ComponentPropsWithoutRef, ElementType, createElement } from "react";

const glassContainerClassName =
  "glass-container rounded-lg";

type GlassContainerOwnProps<TElement extends ElementType> = {
  as?: TElement;
  className?: string;
};

type GlassContainerProps<TElement extends ElementType> =
  GlassContainerOwnProps<TElement> &
  Omit<
    ComponentPropsWithoutRef<TElement>,
    keyof GlassContainerOwnProps<TElement>
  >;

export default function GlassContainer<TElement extends ElementType = "div">({
  as,
  className,
  ...props
}: GlassContainerProps<TElement>) {
  const Component = as ?? "div";
  const containerClassName = [glassContainerClassName, className]
    .filter(Boolean)
    .join(" ");

  return createElement(Component, {
    ...props,
    className: containerClassName,
  });
}
