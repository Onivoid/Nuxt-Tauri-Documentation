# Installation

Getting Nuxt Tauri up and running in your project is straightforward. Follow these steps to install and configure the module.

## Prerequisites

Ensure you have the following installed:

-   **Node.js** 18 or higher
-   **pnpm**, **npm**, or **yarn** package manager
-   **Nuxt 3** project
-   **Tauri** setup in your project

## Install the Module

Add the Nuxt Tauri module to your project:

::: code-group

```bash [pnpm]
npx nuxi module add nuxt-module-tauri
```

```bash [npm]
npx nuxi module add nuxt-module-tauri
```

```bash [yarn]
npx nuxi module add nuxt-module-tauri
```

:::

## Install Tauri API

Install the Tauri API peer dependency:

::: code-group

```bash [pnpm]
pnpm add @tauri-apps/api
```

```bash [npm]
npm install @tauri-apps/api
```

```bash [yarn]
yarn add @tauri-apps/api
```

:::

## Manual Installation (Alternative)

If you prefer to install manually:

1. Install the package:

::: code-group

```bash [pnpm]
pnpm add nuxt-module-tauri
```

```bash [npm]
npm install nuxt-module-tauri
```

```bash [yarn]
yarn add nuxt-module-tauri
```

:::

2. Add the module to your `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
    modules: ["nuxt-module-tauri"],
});
```

## Verify Installation

Create a simple test to verify the installation:

```vue
<template>
    <div>
        <h1>Nuxt Tauri Test</h1>
        <button @click="execute">Test Tauri Connection</button>
        <p v-if="pending">Loading...</p>
        <p v-if="error">Error: {{ error.message }}</p>
        <p v-if="data">Success! {{ data }}</p>
    </div>
</template>

<script setup>
// This will be auto-imported
const { data, pending, error, execute } = useTauriInvoke("test_command");
</script>
```

## Next Steps

-   [Configure the module](/guide/configuration)
-   [Learn about the API](/api/use-tauri-invoke)
-   [Check out examples](/examples/basic-usage)

## Troubleshooting

### Module not found

If you encounter module resolution issues, try:

1. Restart your development server
2. Clear Nuxt cache: `rm -rf .nuxt`
3. Reinstall dependencies

### TypeScript errors

Make sure you have the latest version of `@tauri-apps/api` installed and restart your TypeScript server.
