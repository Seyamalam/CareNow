import React, {
  cloneElement,
  isValidElement,
  type ComponentProps,
  type ReactNode,
} from "react";
import { Button as PanelButton } from "panelui-native";
import { usePalette } from "../lib/theme";
/** Panel UI supplies motion and interaction; Lucide needs explicit semantic icon color. */
export function Button({
  startContent,
  endContent,
  variant = "primary",
  ...props
}: ComponentProps<typeof PanelButton>) {
  const p = usePalette();
  const color =
    variant === "primary" || variant === "destructive" ? p.onPrimary : p.ink;
  const tint = (node: ReactNode) =>
    isValidElement<{ color?: string }>(node) && !node.props.color
      ? cloneElement(node, { color })
      : node;
  return (
    <PanelButton
      {...props}
      variant={variant}
      startContent={tint(startContent)}
      endContent={tint(endContent)}
    />
  );
}
