# Démarrage

Nuxt Tauri est un module qui apporte les composables Vue pour l'API Tauri directement dans vos applications Nuxt. Il fournit une intégration transparente entre le système réactif de Nuxt et les puissantes capacités desktop de Tauri.

## Qu'est-ce que Nuxt Tauri ?

Nuxt Tauri fait le pont entre le développement web et desktop en fournissant :

-   **Composables auto-importés** pour les commandes et événements Tauri
-   **Support TypeScript complet** avec typage générique
-   **Gestion d'état réactive** utilisant le système de réactivité de Vue
-   **Gestion d'erreurs intégrée** et états de chargement
-   **Configuration zéro** prête à l'emploi

## Prérequis

Avant de commencer, assurez-vous d'avoir :

-   **Node.js** 18+ installé
-   **Tauri** configuré dans votre projet
-   Une application **Nuxt 3**

## Concepts Fondamentaux

### Composables

Le module fournit deux composables principaux :

-   **`useTauriInvoke`** - Pour exécuter des commandes Tauri
-   **`useTauriEvent`** - Pour écouter et émettre des événements Tauri

### État Réactif

Tous les composables retournent des refs réactives qui mettent automatiquement à jour votre interface :

-   `data` - Le résultat de l'opération
-   `pending` - État de chargement
-   `error` - État d'erreur (le cas échéant)

### Support TypeScript

Le module est construit avec TypeScript et fournit une sécurité de type complète :

```typescript
interface User {
    id: number;
    name: string;
    email: string;
}

const { data, pending, error } = useTauriInvoke<User>("get_user", { id: 1 });
// data est typé comme Ref<User | null>
```

## Prochaines Étapes

-   [Installer le module](/fr/guide/installation)
-   [Configurer votre projet](/fr/guide/configuration)
-   [Consulter les exemples](/fr/examples/basic-usage)
