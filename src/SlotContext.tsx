import { type ReactNode, createContext, useContext, useState } from "react";

/**
 * A function that takes the default children and returns modified ReactNode content.
 * Used for render prop pattern in slots to dynamically transform content.
 * @param defaultChildren - The default content to be transformed
 * @returns The transformed React content
 */
export type SlotRenderPropFunction = (defaultChildren: ReactNode) => ReactNode;

/**
 * Represents the possible types of content that can be placed in a slot.
 * Can be either direct React content or a render prop function.
 */
export type SlotChildren = ReactNode | SlotRenderPropFunction;

/**
 * The shape of the context object provided by SlotContext.
 * Contains all slot-related state and methods for managing slots.
 */
export type SlotContextType = {
  /** Object mapping slot names to their content */
  slotValues: Record<string, SlotChildren>;
  /** Sets the content for a named slot */
  setSlotValue: (name: string, children: SlotChildren) => void;
  /** Removes a named slot and its content */
  removeSlotValue: (name: string) => void;
};

/**
 * React Context for managing slots throughout the application.
 * Must be accessed through the useSlotContext hook.
 */
const SlotContext = createContext<SlotContextType | undefined>(undefined);

/**
 * Provider component that makes slot functionality available to its children.
 * Manages the state of slots.
 * @param children - React components that will have access to slot functionality
 * @returns A provider component wrapping the children
 */
export const SlotProvider = ({
  children,
}: { children: ReactNode }): JSX.Element => {
  const [slotValues, setSlotValues] = useState<Record<string, SlotChildren>>(
    {},
  );

  /** Updates or creates a slot with the given name and content */
  const setSlotValue = (name: string, children: SlotChildren) => {
    setSlotValues((prev) => {
      // If content hasn't changed, return same object to prevent re-renders
      if (prev[name] === children) return prev;

      return {
        ...prev,
        [name]: children,
      };
    });
  };

  /** Removes a slot with the given name if it exists */
  const removeSlotValue = (name: string) => {
    setSlotValues((prev) => {
      // If slot doesn't exist, return same object
      if (!(name in prev)) return prev;

      const { [name]: _, ...rest } = prev;
      return rest;
    });
  };

  return (
    <SlotContext.Provider
      value={{
        slotValues,
        setSlotValue,
        removeSlotValue,
      }}
    >
      {children}
    </SlotContext.Provider>
  );
};

/**
 * Hook to access the slot context within components.
 * Provides access to slot state and management functions.
 * @throws Error when used outside of a SlotProvider
 * @returns The slot context object containing all slot-related state and functions
 */
export const useSlotContext = (): SlotContextType => {
  const context = useContext(SlotContext);
  if (!context) {
    throw new Error("useSlotContext must be used within a SlotProvider");
  }
  return context;
};
