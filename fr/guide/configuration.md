# Configuration

Nuxt Tauri fonctionne immédiatement sans configuration, mais vous pouvez personnaliser son comportement si nécessaire.

## Configuration par Défaut

Le module :

-   Enregistre automatiquement le plugin pour la disponibilité de l'API Tauri
-   Auto-importe les composables `useTauriInvoke` et `useTauriEvent`
-   Fournit le support TypeScript

## Options du Module

Actuellement, le module ne nécessite pas d'options de configuration spécifiques, mais vous pouvez ajouter le module à votre `nuxt.config.ts` :

```typescript
export default defineNuxtConfig({
    modules: ["nuxt-module-tauri"],
    // Optionnel : Configuration spécifique au module (versions futures)
    nuxtTauri: {
        // Des options de configuration seront ajoutées dans les versions futures
    },
});
```

## Détection d'Environnement

Les composables détectent automatiquement s'ils fonctionnent dans un environnement Tauri :

-   **Dans Tauri** : Fonctionnalité complète disponible
-   **Dans le Navigateur** : Gestion d'erreur élégante avec des messages d'erreur utiles

```vue
<script setup>
const { data, error, execute } = useTauriInvoke("my_command");

// Ceci montrera une erreur dans l'environnement navigateur
// "Tauri API not available"
</script>
```

## Configuration TypeScript

Pour un support TypeScript optimal, assurez-vous que votre `tsconfig.json` inclut :

```json
{
    "compilerOptions": {
        "moduleResolution": "node",
        "allowSyntheticDefaultImports": true,
        "esModuleInterop": true
    }
}
```

## Développement vs Production

### Développement

Pendant le développement, vous pouvez tester vos commandes Tauri :

```bash
# Démarrer le serveur de développement Nuxt
npm run dev

# Dans un autre terminal, démarrer Tauri
cargo tauri dev
```

### Production

Pour les builds de production, assurez-vous que Nuxt et Tauri sont tous deux construits :

```bash
# Construire Nuxt
npm run build

# Construire l'application Tauri
cargo tauri build
```

## Configuration des Commandes Tauri

Du côté Rust, assurez-vous que vos commandes sont correctement exposées :

```rust
use tauri::command;

#[command]
fn get_user(id: u32) -> Result<User, String> {
    // Votre implémentation
    Ok(User {
        id,
        name: "John Doe".to_string(),
        email: "john@example.com".to_string(),
    })
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_user])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

## Auto-imports

Les composables suivants sont automatiquement disponibles sans imports :

-   `useTauriInvoke`
-   `useTauriEvent`

Si vous devez les importer manuellement :

```typescript
import { useTauriInvoke, useTauriEvent } from "#imports";
```

## Bonnes Pratiques

### Gestion d'Erreurs

Gérez toujours les erreurs avec élégance :

```vue
<script setup>
const { data, error, pending, execute } = useTauriInvoke("risky_command");

watchEffect(() => {
    if (error.value) {
        console.error("Échec de la commande:", error.value);
        // Afficher un message d'erreur convivial
    }
});
</script>
```

### Sécurité de Type

Utilisez les interfaces TypeScript pour une meilleure expérience de développement :

```typescript
interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

interface User {
    id: number;
    name: string;
    email: string;
}

const { data } = useTauriInvoke<ApiResponse<User>>("get_user", { id: 1 });
```

## Dépannage

### Problèmes Courants

1. **Erreur "Tauri API not available"** : Vous fonctionnez probablement dans un environnement navigateur. C'est un comportement attendu.

2. **Commandes introuvables** : Assurez-vous que vos commandes Rust sont correctement enregistrées dans l'`invoke_handler`.

3. **Erreurs TypeScript** : Assurez-vous que `@tauri-apps/api` est installé et à jour.

## Prochaines Étapes

-   [Découvrir useTauriInvoke](/fr/api/use-tauri-invoke)
-   [Découvrir useTauriEvent](/fr/api/use-tauri-event)
-   [Consulter les exemples](/fr/examples/basic-usage)
