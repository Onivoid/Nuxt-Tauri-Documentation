# useTauriInvoke

Le composable `useTauriInvoke` vous permet d'exécuter des commandes Tauri avec une gestion d'état réactive, fournissant un pont transparent entre votre frontend Vue et votre backend Rust.

## Signature

```typescript
function useTauriInvoke<T = unknown>(
    command: string,
    args?: Record<string, unknown>,
    options?: { immediate?: boolean }
): TauriInvokeReturn<T>;
```

## Paramètres

### `command`

-   **Type** : `string`
-   **Requis** : Oui
-   **Description** : Le nom de la commande Tauri à invoquer

### `args`

-   **Type** : `Record<string, unknown>`
-   **Requis** : Non
-   **Défaut** : `undefined`
-   **Description** : Arguments à passer à la commande Tauri

### `options`

-   **Type** : `{ immediate?: boolean }`
-   **Requis** : Non
-   **Défaut** : `{ immediate: false }`
-   **Description** : Options de configuration pour le composable

#### `options.immediate`

-   **Type** : `boolean`
-   **Défaut** : `false`
-   **Description** : Détermine si la commande doit être exécutée immédiatement lors de la création du composable

## Valeur de Retour

Le composable retourne un objet avec les propriétés suivantes :

### `data`

-   **Type** : `Readonly<Ref<T | null>>`
-   **Description** : Référence réactive contenant le résultat de la commande

### `pending`

-   **Type** : `Readonly<Ref<boolean>>`
-   **Description** : Référence réactive indiquant si la commande est en cours d'exécution

### `error`

-   **Type** : `Readonly<Ref<Error | null>>`
-   **Description** : Référence réactive contenant toute erreur survenue pendant l'exécution

### `execute`

-   **Type** : `() => Promise<void>`
-   **Description** : Fonction pour exécuter manuellement la commande

### `refresh`

-   **Type** : `() => Promise<void>`
-   **Description** : Alias pour la fonction `execute`

## Exemples d'Usage

### Usage Basique

```vue
<template>
    <div>
        <button @click="execute" :disabled="pending">
            {{ pending ? "Chargement..." : "Récupérer les données" }}
        </button>

        <div v-if="error" class="error">Erreur : {{ error.message }}</div>

        <div v-if="data">Résultat : {{ data }}</div>
    </div>
</template>

<script setup>
const { data, pending, error, execute } = useTauriInvoke("get_app_version");
</script>
```

### Avec Arguments

```vue
<template>
    <div>
        <input v-model="userId" type="number" placeholder="ID Utilisateur" />
        <button @click="fetchUser" :disabled="pending">
            {{ pending ? "Chargement..." : "Récupérer l'utilisateur" }}
        </button>

        <div v-if="error" class="error">Erreur : {{ error.message }}</div>

        <div v-if="data">
            <h3>{{ data.name }}</h3>
            <p>{{ data.email }}</p>
        </div>
    </div>
</template>

<script setup>
const userId = ref(1);

const {
    data,
    pending,
    error,
    execute: fetchUser,
} = useTauriInvoke(
    "get_user",
    computed(() => ({ id: userId.value }))
);
</script>
```

### Avec TypeScript

```vue
<template>
    <div>
        <button @click="execute" :disabled="pending">
            Récupérer l'utilisateur
        </button>

        <!-- TypeScript assure que data est correctement typé -->
        <div v-if="data">
            <h3>{{ data.name }}</h3>
            <p>{{ data.email }}</p>
            <span>{{ data.isActive ? "Actif" : "Inactif" }}</span>
        </div>
    </div>
</template>

<script setup>
interface User {
  id: number
  name: string
  email: string
  isActive: boolean
}

const { data, pending, error, execute } = useTauriInvoke<User>('get_user', { id: 1 })
</script>
```

### Exécution Immédiate

```vue
<template>
    <div>
        <!-- Les données se chargent immédiatement au montage du composant -->
        <div v-if="pending">Chargement de la configuration...</div>

        <div v-if="error" class="error">
            Échec du chargement de la configuration : {{ error.message }}
        </div>

        <div v-if="data">
            <h3>Configuration de l'Application</h3>
            <pre>{{ JSON.stringify(data, null, 2) }}</pre>
        </div>
    </div>
</template>

<script setup>
interface AppConfig {
  theme: string
  language: string
  autoSave: boolean
}

const { data, pending, error } = useTauriInvoke<AppConfig>(
  'get_app_config',
  {},
  { immediate: true }
)
</script>
```

### Gestion d'Erreurs

```vue
<template>
    <div>
        <button @click="execute" :disabled="pending">Opération Risquée</button>

        <div v-if="error" class="error">
            <h4>Échec de l'Opération</h4>
            <p>{{ error.message }}</p>
            <button @click="execute">Réessayer</button>
        </div>

        <div v-if="data" class="success">Opération terminée avec succès !</div>
    </div>
</template>

<script setup>
const { data, pending, error, execute } = useTauriInvoke("risky_operation");

// Observer les erreurs et les gérer
watchEffect(() => {
    if (error.value) {
        console.error("Échec de l'opération:", error.value);

        // Vous pourriez aussi afficher une notification toast
        // showToast({ type: 'error', message: error.value.message })
    }
});
</script>
```

### Arguments Réactifs

```vue
<template>
    <div>
        <input v-model="searchQuery" placeholder="Rechercher..." />
        <button @click="search" :disabled="pending || !searchQuery">
            Rechercher
        </button>

        <div v-if="pending">Recherche en cours...</div>

        <div v-if="results">
            <h3>{{ results.length }} résultats trouvés</h3>
            <ul>
                <li v-for="result in results" :key="result.id">
                    {{ result.title }}
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup>
const searchQuery = ref("");

const {
    data: results,
    pending,
    error,
    execute: search,
} = useTauriInvoke(
    "search",
    computed(() => ({ query: searchQuery.value }))
);
</script>
```

## Gestion d'Erreurs

Le composable attrape et gère automatiquement les erreurs :

-   **API Tauri non disponible** : Lors de l'exécution dans un environnement navigateur
-   **Commande introuvable** : Quand la commande Rust n'existe pas
-   **Erreurs d'exécution de commande** : Toute erreur lancée par votre commande Rust

```typescript
// Exemple de gestion de types d'erreurs spécifiques
watchEffect(() => {
    if (error.value) {
        if (error.value.message.includes("Tauri API not available")) {
            console.log("Fonctionnement en mode navigateur");
        } else if (error.value.message.includes("command not found")) {
            console.error("Commande Rust non enregistrée");
        } else {
            console.error("Erreur d'exécution de commande:", error.value);
        }
    }
});
```

## Bonnes Pratiques

### 1. Utiliser TypeScript

Fournissez toujours des paramètres de type pour une meilleure expérience de développement :

```typescript
const { data } = useTauriInvoke<MonTypeDeData>("ma_commande");
```

### 2. Gérer les États de Chargement

Fournissez toujours un retour pendant l'exécution de la commande :

```vue
<button :disabled="pending">
  {{ pending ? 'Chargement...' : 'Exécuter' }}
</button>
```

### 3. Gérer les Erreurs avec Élégance

Fournissez des messages d'erreur significatifs aux utilisateurs :

```vue
<div v-if="error" class="error">
  Quelque chose s'est mal passé. Veuillez réessayer.
</div>
```

### 4. Utiliser des Arguments Computed

Pour des arguments réactifs, utilisez des propriétés computed :

```typescript
const args = computed(() => ({ id: userId.value }));
const { data } = useTauriInvoke("get_user", args);
```

## Articles Liés

-   [useTauriEvent](/fr/api/use-tauri-event) - Pour écouter les événements Tauri
-   [Exemples](/fr/examples/basic-usage) - Voir plus d'exemples d'usage
