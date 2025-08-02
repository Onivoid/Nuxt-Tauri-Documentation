---
layout: home

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
    - icon: 🚀
      title: Auto-imported Composables
      details: Ready-to-use Vue composables for Tauri API with zero configuration
    - icon: 💪
      title: Full TypeScript Support
      details: Complete type safety with generic typing for better development experience
    - icon: ⚡
      title: Reactive State Management
      details: Built-in reactive state with Vue refs for seamless data handling
    - icon: 🔄
      title: Error Handling
      details: Comprehensive error handling and loading states out of the box
    - icon: 🎯
      title: Zero Configuration
      details: Works out of the box with sensible defaults and minimal setup
    - icon: 📱
      title: Desktop-First
      details: Built specifically for Tauri desktop applications with Nuxt
---

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
