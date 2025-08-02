# Installation

Faire fonctionner Nuxt Tauri dans votre projet est simple. Suivez ces étapes pour installer et configurer le module.

## Prérequis

Assurez-vous d'avoir les éléments suivants installés :

-   **Node.js** 18 ou supérieur
-   Gestionnaire de paquets **pnpm**, **npm**, ou **yarn**
-   Projet **Nuxt 3**
-   **Tauri** configuré dans votre projet

## Installer le Module

Ajoutez le module Nuxt Tauri à votre projet :

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

## Installer l'API Tauri

Installez la dépendance pair de l'API Tauri :

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

## Installation Manuelle (Alternative)

Si vous préférez installer manuellement :

1. Installez le paquet :

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

2. Ajoutez le module à votre `nuxt.config.ts` :

```typescript
export default defineNuxtConfig({
    modules: ["nuxt-module-tauri"],
});
```

## Vérifier l'Installation

Créez un test simple pour vérifier l'installation :

```vue
<template>
    <div>
        <h1>Test Nuxt Tauri</h1>
        <button @click="execute">Tester la connexion Tauri</button>
        <p v-if="pending">Chargement...</p>
        <p v-if="error">Erreur : {{ error.message }}</p>
        <p v-if="data">Succès ! {{ data }}</p>
    </div>
</template>

<script setup>
// Ceci sera auto-importé
const { data, pending, error, execute } = useTauriInvoke("test_command");
</script>
```

## Prochaines Étapes

-   [Configurer le module](/fr/guide/configuration)
-   [Découvrir l'API](/fr/api/use-tauri-invoke)
-   [Consulter les exemples](/fr/examples/basic-usage)

## Dépannage

### Module introuvable

Si vous rencontrez des problèmes de résolution de module, essayez :

1. Redémarrez votre serveur de développement
2. Videz le cache Nuxt : `rm -rf .nuxt`
3. Réinstallez les dépendances

### Erreurs TypeScript

Assurez-vous d'avoir la dernière version de `@tauri-apps/api` installée et redémarrez votre serveur TypeScript.
