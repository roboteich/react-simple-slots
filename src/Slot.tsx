import { type ReactNode, useLayoutEffect, useMemo } from "react";
import {
  type SlotChildren,
  type SlotRenderPropFunction,
  useSlotContext,
} from "./SlotContext";

const isRenderProp = (value: unknown): value is SlotRenderPropFunction => {
  return typeof value === "function";
};

/**
 * Props for the Slot component
 */
export interface SlotProps {
  name: string;
  children?: SlotChildren;
}

export const Slot = ({ name, children }: SlotProps): JSX.Element => {
  const { setSlotValue, removeSlotValue } = useSlotContext();

  // Memoize content to prevent unnecessary context updates
  const memoizedContent = useMemo(() => {
    if (isRenderProp(children)) {
      return (defaultChildren: ReactNode) => children(defaultChildren);
    }
    return children;
  }, [children]);

  // Handle setting and cleaning up slot value
  useLayoutEffect(() => {
    setSlotValue(name, memoizedContent);
    return () => {
      if (removeSlotValue) {
        removeSlotValue(name);
      }
    };
  }, [name, memoizedContent]); // setSlotValue and removeSlotValue are stable context functions

  return <></>;
};

// For better debugging in React DevTools
Slot.displayName = "Slot";
