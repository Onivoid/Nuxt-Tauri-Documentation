---
layout: home
title: Nuxt Tauri - Vue Composables for Tauri API
titleTemplate: false
description: Seamlessly integrate Tauri API into your Nuxt applications with reactive composables. Zero configuration, TypeScript ready, with auto-imports.

head:
    - - meta
      - name: keywords
        content: nuxt tauri vue composables desktop app rust typescript reactive api integration
    - - meta
      - property: og:title
        content: Nuxt Tauri - Vue Composables for Tauri API
    - - meta
      - property: og:description
        content: Seamlessly integrate Tauri API into your Nuxt applications with reactive composables. Zero configuration, TypeScript ready.
    - - meta
      - name: twitter:title
        content: Nuxt Tauri - Vue Composables for Tauri API
    - - meta
      - name: twitter:description
        content: Seamlessly integrate Tauri API into your Nuxt applications with reactive composables.

hero:
    name: "Nuxt Tauri"
    text: "Vue composables for Tauri API"
    tagline: "Seamlessly integrate Tauri's powerful desktop capabilities into your Nuxt applications"
    image:
        src: https://svgl.app/library/nuxt.svg
        alt: Nuxt Logo
    actions:
        - theme: brand
          text: Get Started
          link: /guide/getting-started
        - theme: alt
          text: View on GitHub
          link: https://github.com/Onivoid/nuxt-module-tauri

features:
    - icon: ⚡
      title: Zero Configuration
      details: Works out of the box with sensible defaults. No complex setup required for instant productivity.
    - icon: 🔄
      title: Reactive Composables
      details: Leverage Vue's reactivity system with useTauriInvoke and useTauriEvent for seamless state management.
    - icon: �
      title: TypeScript Ready
      details: Full TypeScript support with auto-completion, type checking, and IntelliSense for better DX.
    - icon: 🛡️
      title: Error Handling
      details: Built-in error handling and loading states for better user experience and debugging.
    - icon: 🎯
      title: Auto-imports
      details: Composables are automatically imported in your Nuxt application. No manual imports needed.
    - icon: 🌐
      title: Universal
      details: Works seamlessly in both Tauri desktop and browser environments with graceful fallbacks.
---

## 🚀 Quick Start

Install the module in your Nuxt project:

```bash
npm install nuxt-module-tauri
```

Add it to your `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
    modules: ["nuxt-module-tauri"],
});
```

Use the composables in your components:

```vue
<script setup>
const { data, pending, error } = useTauriInvoke("get_user", { id: 1 });
</script>

<template>
    <div v-if="pending">Loading...</div>
    <div v-else-if="error">Error: {{ error }}</div>
    <div v-else>Welcome {{ data.name }}!</div>
</template>
```

## 🎯 Why Choose Nuxt Tauri?

-   **🔥 Performance**: Leverages Rust's performance with Vue's reactivity
-   **🛠️ Developer Experience**: TypeScript support with auto-completion
-   **📦 Zero Config**: Works immediately after installation
-   **🌍 Universal**: Runs in both desktop and web environments
-   **🔒 Type Safe**: Full TypeScript integration with Tauri commands

## Quick Example

```vue
<template>
    <div>
        <button @click="execute" :disabled="pending">
            {{ pending ? "Loading..." : "Get User Data" }}
        </button>

        <div v-if="error" class="error">Error: {{ error.message }}</div>

        <div v-if="data">
            <h3>Welcome, {{ data.name }}!</h3>
            <p>Email: {{ data.email }}</p>
        </div>
    </div>
</template>

<script setup>
interface User {
  name: string
  email: string
}

const { data, pending, error, execute } = useTauriInvoke<User>('get_user')
</script>
```

## Installation

```bash
npx nuxi module add nuxt-module-tauri
```

```bash
pnpm add @tauri-apps/api
```

That's it! Start building amazing desktop applications with Nuxt and Tauri.
