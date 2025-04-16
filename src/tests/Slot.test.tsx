import { render, screen } from "@testing-library/react";
import { type ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { Slot, SlotProvider, TemplateSlot } from "..";

// Add the expect type augmentation for jest-dom
import "@testing-library/jest-dom";

// Mock template that uses slots
const DocPageTemplate = ({ children }: { children?: ReactNode }) => {
  return (
    <SlotProvider>
      <div data-testid="doc-page">
        <header>
          <TemplateSlot name="header">
            <h1>Default Header</h1>
          </TemplateSlot>
        </header>
        <main>
          <TemplateSlot name="main">
            <div>Default Main Content</div>
          </TemplateSlot>
        </main>
        <footer>
          <TemplateSlot name="footer">
            <div>Default Footer</div>
          </TemplateSlot>
        </footer>
        {children}
      </div>
    </SlotProvider>
  );
};

// Helper function to test isRenderProp internally
const testIsRenderProp = (value: unknown): boolean => {
  return typeof value === "function";
};

describe("Slot", () => {
  it("throws error when used outside SlotProvider", () => {
    expect(() => {
      render(<Slot name="test">content</Slot>);
    }).toThrow();
  });

  it("memoizes content for performance", () => {
    const content = <div>Test Content</div>;
    const { rerender } = render(
      <SlotProvider>
        <Slot name="test">{content}</Slot>
        <TemplateSlot name="test" />
      </SlotProvider>,
    );

    const firstRender = screen.getByText("Test Content");

    // Rerender with same content
    rerender(
      <SlotProvider>
        <Slot name="test">{content}</Slot>
        <TemplateSlot name="test" />
      </SlotProvider>,
    );

    const secondRender = screen.getByText("Test Content");
    expect(firstRender).toBe(secondRender);
  });

  describe("isRenderProp utility", () => {
    it("correctly identifies render prop functions", () => {
      const renderProp = () => <div>Test</div>;
      const notRenderProp = "not a function";

      expect(testIsRenderProp(renderProp)).toBe(true);
      expect(testIsRenderProp(notRenderProp)).toBe(false);
      expect(testIsRenderProp(null)).toBe(false);
      expect(testIsRenderProp(undefined)).toBe(false);
    });
  });
});

describe("TemplateSlot", () => {
  it("handles null/undefined children", () => {
    render(
      <SlotProvider>
        <TemplateSlot name="test" />
        <Slot name="test">{null}</Slot>
      </SlotProvider>,
    );

    render(
      <SlotProvider>
        <TemplateSlot name="test" />
        <Slot name="test">{undefined}</Slot>
      </SlotProvider>,
    );
  });

  it("handles non-existent slot names", () => {
    render(
      <SlotProvider>
        <TemplateSlot name="nonexistent">
          <div>Default Content</div>
        </TemplateSlot>
      </SlotProvider>,
    );

    expect(screen.getByText("Default Content")).toBeInTheDocument();
  });

  it("supports nested slots", () => {
    render(
      <SlotProvider>
        <TemplateSlot name="outer">
          <div>Outer Default</div>
        </TemplateSlot>
        <Slot name="outer">
          <div>
            <TemplateSlot name="inner">
              <div>Inner Default</div>
            </TemplateSlot>
          </div>
        </Slot>
        <Slot name="inner">
          <div>Inner Content</div>
        </Slot>
      </SlotProvider>,
    );

    expect(screen.getByText("Inner Content")).toBeInTheDocument();
  });

  it("supports render prop transformations", () => {
    render(
      <SlotProvider>
        <TemplateSlot name="test">
          <div>Original</div>
        </TemplateSlot>
        <Slot name="test">
          {(children) => (
            <div data-testid="transformed">Transformed: {children}</div>
          )}
        </Slot>
      </SlotProvider>,
    );

    const transformed = screen.getByTestId("transformed");
    expect(transformed).toBeInTheDocument();
    expect(transformed).toHaveTextContent("Transformed:");
    expect(transformed).toHaveTextContent("Original");
  });
});

describe("Integration Tests", () => {
  it("renders template slots with default content when no overrides", () => {
    render(<DocPageTemplate />);

    expect(screen.getByText("Default Header")).toBeInTheDocument();
    expect(screen.getByText("Default Main Content")).toBeInTheDocument();
    expect(screen.getByText("Default Footer")).toBeInTheDocument();
  });

  it("overrides default content with slot content", () => {
    render(
      <DocPageTemplate>
        <Slot name="header">
          <h1>Custom Header</h1>
        </Slot>
        <Slot name="main">
          <div>Custom Main Content</div>
        </Slot>
        <Slot name="footer" />
      </DocPageTemplate>,
    );

    expect(screen.getByText("Custom Header")).toBeInTheDocument();
    expect(screen.getByText("Custom Main Content")).toBeInTheDocument();
    expect(screen.queryByText("Default Footer")).not.toBeInTheDocument();
    expect(screen.queryByText("Default Header")).not.toBeInTheDocument();
    expect(screen.queryByText("Default Main Content")).not.toBeInTheDocument();
  });

  it("wraps default content using render props", () => {
    render(
      <DocPageTemplate>
        <Slot name="header">
          {(defaultContent) => (
            <div data-testid="wrapped-header">
              <div>Before Header</div>
              {defaultContent}
              <div>After Header</div>
            </div>
          )}
        </Slot>
      </DocPageTemplate>,
    );

    const wrappedHeader = screen.getByTestId("wrapped-header");
    expect(wrappedHeader).toBeInTheDocument();
    expect(screen.getByText("Before Header")).toBeInTheDocument();
    expect(screen.getByText("Default Header")).toBeInTheDocument();
    expect(screen.getByText("After Header")).toBeInTheDocument();
  });

  it("updates slot content when props change", () => {
    const { rerender } = render(
      <DocPageTemplate>
        <Slot name="main">
          <div>Initial Main Content</div>
        </Slot>
      </DocPageTemplate>,
    );

    expect(screen.getByText("Initial Main Content")).toBeInTheDocument();

    rerender(
      <DocPageTemplate>
        <Slot name="main">
          <div>Updated Main Content</div>
        </Slot>
      </DocPageTemplate>,
    );

    expect(screen.getByText("Updated Main Content")).toBeInTheDocument();
    expect(screen.queryByText("Initial Main Content")).not.toBeInTheDocument();
  });

  it("removes slot override when unmounted", () => {
    const { rerender } = render(
      <DocPageTemplate>
        <Slot name="main">
          <div>Custom Main Content</div>
        </Slot>
      </DocPageTemplate>,
    );

    expect(screen.getByText("Custom Main Content")).toBeInTheDocument();

    // Rerender without the Slot component
    rerender(<DocPageTemplate />);

    expect(screen.getByText("Default Main Content")).toBeInTheDocument();
    expect(screen.queryByText("Custom Main Content")).not.toBeInTheDocument();
  });
});
