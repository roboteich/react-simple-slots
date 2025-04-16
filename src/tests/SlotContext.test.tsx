import { act, renderHook } from "@testing-library/react";
import { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { SlotProvider, SlotRenderPropFunction, useSlotContext } from "..";

describe("SlotContext", () => {
  describe("useSlotContext", () => {
    it("should throw error when used outside SlotProvider", () => {
      expect(() => {
        renderHook(() => useSlotContext());
      }).toThrow("useSlotContext must be used within a SlotProvider");
    });
  });

  describe("SlotProvider", () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <SlotProvider>{children}</SlotProvider>
    );

    it("should provide slots context to children", () => {
      const { result } = renderHook(() => useSlotContext(), { wrapper });

      expect(result.current).toBeDefined();
      expect(result.current.slotValues).toEqual({});
    });

    it("should add and remove slots", () => {
      const { result } = renderHook(() => useSlotContext(), { wrapper });

      act(() => {
        result.current.setSlotValue("header", <div>Header Content</div>);
      });

      expect("header" in result.current.slotValues).toBe(true);
      expect(result.current.slotValues.header).toEqual(
        <div>Header Content</div>,
      );

      act(() => {
        result.current.removeSlotValue("header");
      });

      expect("header" in result.current.slotValues).toBe(false);
    });

    it("should support SlotRenderPropFunction for slots", () => {
      const { result } = renderHook(() => useSlotContext(), { wrapper });
      const renderProp = (defaultChildren: ReactNode) => (
        <div className="wrapped">{defaultChildren}</div>
      );

      act(() => {
        result.current.setSlotValue("content", renderProp);
      });

      expect("content" in result.current.slotValues).toBe(true);
      expect(typeof result.current.slotValues.content).toBe("function");
    });

    it("should support multiple slots simultaneously", () => {
      const { result } = renderHook(() => useSlotContext(), { wrapper });

      act(() => {
        result.current.setSlotValue("header", <header>Header</header>);
        result.current.setSlotValue("footer", <footer>Footer</footer>);
      });

      expect(Object.keys(result.current.slotValues).length).toBe(2);
      expect("header" in result.current.slotValues).toBe(true);
      expect("footer" in result.current.slotValues).toBe(true);
    });

    describe("hasSlot", () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <SlotProvider>{children}</SlotProvider>
      );

      it("should correctly identify existing slots", () => {
        const { result } = renderHook(() => useSlotContext(), { wrapper });

        act(() => {
          result.current.setSlotValue("header", <div>Header Content</div>);
        });

        expect(result.current.hasSlot("header")).toBe(true);
        expect(result.current.hasSlot("footer")).toBe(false);
      });

      it("should return false for nonexistent slots", () => {
        const { result } = renderHook(() => useSlotContext(), { wrapper });
        expect(result.current.hasSlot("nonexistent")).toBe(false);
      });

      it("should correctly update after adding and removing slots", () => {
        const { result } = renderHook(() => useSlotContext(), { wrapper });

        // Initially slot doesn't exist
        expect(result.current.hasSlot("dynamic")).toBe(false);

        // Add the slot
        act(() => {
          result.current.setSlotValue("dynamic", <span>Dynamic content</span>);
        });
        expect(result.current.hasSlot("dynamic")).toBe(true);

        // Remove the slot
        act(() => {
          result.current.removeSlotValue("dynamic");
        });
        expect(result.current.hasSlot("dynamic")).toBe(false);
      });

      it("should handle null and undefined slot values", () => {
        const { result } = renderHook(() => useSlotContext(), { wrapper });

        act(() => {
          result.current.setSlotValue("nullSlot", null);
          result.current.setSlotValue("undefinedSlot", undefined);
        });

        expect(result.current.hasSlot("nullSlot")).toBe(true);
        expect(result.current.hasSlot("undefinedSlot")).toBe(true);
      });

      it("should be consistent with slotValues object keys", () => {
        const { result } = renderHook(() => useSlotContext(), { wrapper });

        act(() => {
          result.current.setSlotValue("test1", "value1");
          result.current.setSlotValue("test2", "value2");
        });

        // Check that hasSlot matches what's in slotValues
        const slotValues = Object.keys(result.current.slotValues);
        for (const key of slotValues) {
          expect(result.current.hasSlot(key)).toBe(true);
        }

        expect(result.current.hasSlot("nonexistentKey")).toBe(false);
      });
    });

    describe("state optimizations", () => {
      it("should reuse state object when setting same content", () => {
        const { result } = renderHook(() => useSlotContext(), { wrapper });
        const content = <div>Test Content</div>;

        act(() => {
          result.current.setSlotValue("test", content);
        });
        const firstState = result.current.slotValues;

        act(() => {
          result.current.setSlotValue("test", content);
        });
        const secondState = result.current.slotValues;

        expect(secondState).toBe(firstState);
      });

      it("should reuse state object when removing non-existent slot", () => {
        const { result } = renderHook(() => useSlotContext(), { wrapper });
        const initialState = result.current.slotValues;

        act(() => {
          result.current.removeSlotValue("nonexistent");
        });

        expect(result.current.slotValues).toBe(initialState);
      });
    });

    describe("edge cases", () => {
      it("should handle updating existing slot content", () => {
        const { result } = renderHook(() => useSlotContext(), { wrapper });
        const initialContent = <div>Initial Content</div>;
        const updatedContent = <div>Updated Content</div>;

        act(() => {
          result.current.setSlotValue("test", initialContent);
        });
        expect(result.current.slotValues.test).toEqual(initialContent);

        act(() => {
          result.current.setSlotValue("test", updatedContent);
        });
        expect(result.current.slotValues.test).toEqual(updatedContent);
      });

      it("should handle null/undefined slot content", () => {
        const { result } = renderHook(() => useSlotContext(), { wrapper });

        act(() => {
          result.current.setSlotValue("nullSlot", null);
          result.current.setSlotValue("undefinedSlot", undefined);
        });

        expect(result.current.slotValues.nullSlot).toBeNull();
        expect(result.current.slotValues.undefinedSlot).toBeUndefined();
      });
    });

    describe("render prop function handling", () => {
      it("should execute render prop with provided children", () => {
        const { result } = renderHook(() => useSlotContext(), { wrapper });
        const defaultContent = <span>Default</span>;
        const renderProp = (children: ReactNode) => (
          <div className="wrapped">{children}</div>
        );

        act(() => {
          result.current.setSlotValue("test", renderProp);
        });

        const slotValue = result.current.slotValues.test;
        expect(typeof slotValue).toBe("function");

        // Execute the render prop
        const rendered = (slotValue as SlotRenderPropFunction)(defaultContent);
        expect(rendered).toEqual(
          <div className="wrapped">
            <span>Default</span>
          </div>,
        );
      });

      it("should support chained render props", () => {
        const { result } = renderHook(() => useSlotContext(), { wrapper });
        const defaultContent = <span>Default</span>;
        const wrapper1 = (children: ReactNode) => (
          <div className="outer">{children}</div>
        );
        const wrapper2 = (children: ReactNode) => (
          <div className="inner">{children}</div>
        );

        act(() => {
          result.current.setSlotValue("wrapper1", wrapper1);
          result.current.setSlotValue("wrapper2", wrapper2);
        });

        const outer = result.current.slotValues.wrapper1;
        const inner = result.current.slotValues.wrapper2;

        // Chain the render props
        const rendered = (outer as SlotRenderPropFunction)(
          (inner as SlotRenderPropFunction)(defaultContent),
        );
        expect(rendered).toEqual(
          <div className="outer">
            <div className="inner">
              <span>Default</span>
            </div>
          </div>,
        );
      });
    });

    describe("concurrent updates and cleanup", () => {
      it("should handle multiple slot updates correctly", () => {
        const { result } = renderHook(() => useSlotContext(), { wrapper });

        act(() => {
          result.current.setSlotValue("slot1", "content1");
          result.current.setSlotValue("slot2", "content2");
          result.current.setSlotValue("slot3", "content3");
          result.current.setSlotValue("slot1", "updated1");
        });

        expect(result.current.slotValues).toEqual({
          slot1: "updated1",
          slot2: "content2",
          slot3: "content3",
        });
      });

      it("should maintain other slots when removing one slot", () => {
        const { result } = renderHook(() => useSlotContext(), { wrapper });

        act(() => {
          result.current.setSlotValue("keep1", "content1");
          result.current.setSlotValue("remove", "content2");
          result.current.setSlotValue("keep2", "content3");
        });

        act(() => {
          result.current.removeSlotValue("remove");
        });

        expect(result.current.slotValues).toEqual({
          keep1: "content1",
          keep2: "content3",
        });
        expect("remove" in result.current.slotValues).toBe(false);
      });

      it("should handle clearing all slots", () => {
        const { result } = renderHook(() => useSlotContext(), { wrapper });

        act(() => {
          result.current.setSlotValue("slot1", "content1");
          result.current.setSlotValue("slot2", "content2");
        });

        act(() => {
          result.current.removeSlotValue("slot1");
          result.current.removeSlotValue("slot2");
        });

        expect(result.current.slotValues).toEqual({});
      });

      it("should handle unmounting without errors", () => {
        const { unmount } = renderHook(() => useSlotContext(), { wrapper });
        expect(() => unmount()).not.toThrow();
      });
    });
  });
});
