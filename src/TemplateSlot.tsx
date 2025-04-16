import { type ReactNode } from "react";
import { type SlotRenderPropFunction, useSlotContext } from "./SlotContext";

export interface TemplateSlotProps {
  /** Unique identifier for the slot */
  name: string;
  /** Default content to render if no slot content is provided */
  children?: ReactNode;
}

const isRenderProp = (value: unknown): value is SlotRenderPropFunction => {
  return typeof value === "function";
};

/**
 * A component that renders either provided slot content or default children.
 * - If a slot exists with matching name, renders that content
 * - If the slot content is a function (render prop), calls it with children
 * - Otherwise renders the default children
 */
export const TemplateSlot = ({
  name,
  children,
}: TemplateSlotProps): JSX.Element => {
  const { slotValues, hasSlot } = useSlotContext();
  const slotContent = slotValues[name];

  // If no slot content, render default children
  if (!hasSlot(name)) {
    return <>{children}</>;
  }

  // If slot content is a render prop, call it with children
  if (isRenderProp(slotContent)) {
    return <>{slotContent(children)}</>;
  }

  // Otherwise render the slot content directly
  return <>{slotContent}</>;
};
