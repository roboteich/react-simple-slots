# React Slot System

A performant React component library for template-based content composition, allowing dynamic content injection with render prop support.

## Installation

```bash
npm install react-simple-slots
```

## Usage

### Basic Template

```tsx
function DocPage({ children }: { children: ReactNode }) {
  return (
    <SlotProvider>
      <header>
        <TemplateSlot name="header">
          <h1>Default Title</h1>
        </TemplateSlot>
      </header>
      <main>
        <TemplateSlot name="main">
          <div>Default Content</div>
        </TemplateSlot>
      </main>
      {children}
    </SlotProvider>
  );
}
```

### Overriding Content

```tsx
function Page() {
  return (
    <DocPage>
      <Slot name="header">
        <h1>Custom Title</h1>
      </Slot>
      <Slot name="main">
        <div>Custom content here</div>
      </Slot>
    </DocPage>
  );
}
```

### Using Render Props

```tsx
function Page() {
  return (
    <DocPage>
      <Slot name="header">
        {(defaultContent) => (
          <div className="header-wrapper">
            <div>Pre-content</div>
            {defaultContent}
            <div>Post-content</div>
          </div>
        )}
      </Slot>
    </DocPage>
  );
}
```

## Components

### SlotProvider

The root context provider for the slot system. Must wrap any usage of `Slot` or `TemplateSlot` components.

```tsx
<SlotProvider>
  {/* Your template content here */}
</SlotProvider>
```

### TemplateSlot

Component that renders slot content or falls back to default children.

```tsx
interface TemplateSlotProps {
  /** Unique identifier for the slot */
  name: string;
  /** Default content to render if no slot content provided */
  children?: ReactNode;
}
```

### Slot

Component that sets content for a named slot. Content can be React nodes or a render prop function.

```tsx
interface SlotProps {
  /** Unique identifier for the slot */
  name: string;
  /** Content to place in the slot or a render prop function */
  children?: ReactNode | ((defaultContent: ReactNode) => ReactNode);
}
```

## Performance Considerations

1. Slot content is memoized to prevent unnecessary re-renders
2. Context updates only occur when slot content actually changes
3. Each TemplateSlot only re-renders when its specific slot content changes

## License

MIT
