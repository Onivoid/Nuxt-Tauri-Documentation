# Getting Started

Nuxt Tauri is a module that brings Vue composables for Tauri API directly into your Nuxt applications. It provides a seamless integration between Nuxt's reactive system and Tauri's powerful desktop capabilities.

## What is Nuxt Tauri?

Nuxt Tauri bridges the gap between web and desktop development by providing:

-   **Auto-imported composables** for Tauri commands and events
-   **Full TypeScript support** with generic typing
-   **Reactive state management** using Vue's reactivity system
-   **Built-in error handling** and loading states
-   **Zero configuration** setup

## Prerequisites

Before getting started, make sure you have:

-   **Node.js** 18+ installed
-   **Tauri** setup in your project
-   **Nuxt 3** application

## Core Concepts

### Composables

The module provides two main composables:

-   **`useTauriInvoke`** - For executing Tauri commands
-   **`useTauriEvent`** - For listening to and emitting Tauri events

### Reactive State

All composables return reactive refs that automatically update your UI:

-   `data` - The result of the operation
-   `pending` - Loading state
-   `error` - Error state (if any)

### TypeScript Support

The module is built with TypeScript and provides full type safety:

```typescript
interface User {
    id: number;
    name: string;
    email: string;
}

const { data, pending, error } = useTauriInvoke<User>("get_user", { id: 1 });
// data is typed as Ref<User | null>
```

## Next Steps

-   [Install the module](/guide/installation)
-   [Configure your project](/guide/configuration)
-   [Check out examples](/examples/basic-usage)
