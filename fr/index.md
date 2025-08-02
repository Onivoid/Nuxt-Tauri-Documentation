---
layout: home
title: Nuxt Tauri - Composables Vue pour l'API Tauri
titleTemplate: false
description: Intégrez l'API Tauri dans vos applications Nuxt avec des composables réactifs. Zéro configuration, prêt pour TypeScript, avec auto-imports.

head:
    - - meta
      - name: keywords
        content: nuxt tauri vue composables application desktop rust typescript réactif api intégration
    - - meta
      - property: og:title
        content: Nuxt Tauri - Composables Vue pour l'API Tauri
    - - meta
      - property: og:description
        content: Intégrez l'API Tauri dans vos applications Nuxt avec des composables réactifs. Zéro configuration, prêt pour TypeScript.
    - - meta
      - name: twitter:title
        content: Nuxt Tauri - Composables Vue pour l'API Tauri
    - - meta
      - name: twitter:description
        content: Intégrez l'API Tauri dans vos applications Nuxt avec des composables réactifs.

hero:
    name: "Nuxt Tauri"
    text: "Composables Vue pour l'API Tauri"
    tagline: "Intégrez de manière transparente les puissantes capacités desktop de Tauri dans vos applications Nuxt"
    image:
        src: https://svgl.app/library/nuxt.svg
        alt: Logo Nuxt
    actions:
        - theme: brand
          text: Commencer
          link: /fr/guide/getting-started
        - theme: alt
          text: Voir sur GitHub
          link: https://github.com/Onivoid/nuxt-module-tauri

features:
    - icon: 🚀
      title: Composables Auto-importés
      details: Composables Vue prêts à l'emploi pour l'API Tauri sans configuration
    - icon: 💪
      title: Support TypeScript Complet
      details: Sécurité de type complète avec typage générique pour une meilleure expérience de développement
    - icon: ⚡
      title: Gestion d'État Réactive
      details: État réactif intégré avec les refs Vue pour une gestion de données fluide
    - icon: 🔄
      title: Gestion d'Erreurs
      details: Gestion d'erreurs complète et états de chargement prêts à l'emploi
    - icon: 🎯
      title: Configuration Zéro
      details: Fonctionne immédiatement avec des valeurs par défaut sensées et une configuration minimale
    - icon: 📱
      title: Desktop-First
      details: Conçu spécifiquement pour les applications desktop Tauri avec Nuxt
---

## Exemple Rapide

```vue
<template>
    <div>
        <button @click="execute" :disabled="pending">
            {{
                pending ? "Chargement..." : "Récupérer les données utilisateur"
            }}
        </button>

        <div v-if="error" class="error">Erreur : {{ error.message }}</div>

        <div v-if="data">
            <h3>Bienvenue, {{ data.name }} !</h3>
            <p>Email : {{ data.email }}</p>
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

C'est tout ! Commencez à créer d'incroyables applications desktop avec Nuxt et Tauri.
