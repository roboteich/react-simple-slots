import { Slot, type SlotProps } from "./Slot";
import {
  type SlotChildren,
  type SlotContextType,
  SlotProvider,
  type SlotRenderPropFunction,
  useSlotContext,
} from "./SlotContext";
import { TemplateSlot, type TemplateSlotProps } from "./TemplateSlot";

export type {
  SlotProps,
  TemplateSlotProps,
  SlotRenderPropFunction,
  SlotChildren,
  SlotContextType,
};

export { Slot, TemplateSlot, SlotProvider, useSlotContext };
