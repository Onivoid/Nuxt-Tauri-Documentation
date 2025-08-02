# useTauriEvent

Le composable `useTauriEvent` fournit une interface réactive pour écouter et émettre des événements Tauri, permettant une communication en temps réel entre votre backend Rust et votre frontend Vue.

## Signature

```typescript
function useTauriEvent<T = unknown>(eventName: string): TauriEventReturn<T>;
```

## Paramètres

### `eventName`

-   **Type** : `string`
-   **Requis** : Oui
-   **Description** : Le nom de l'événement Tauri à écouter

## Valeur de Retour

Le composable retourne un objet avec les propriétés suivantes :

### `data`

-   **Type** : `Readonly<Ref<T | null>>`
-   **Description** : Référence réactive contenant le dernier payload d'événement reçu

### `error`

-   **Type** : `Readonly<Ref<Error | null>>`
-   **Description** : Référence réactive contenant toute erreur survenue

### `startListening`

-   **Type** : `() => Promise<void>`
-   **Description** : Fonction pour commencer à écouter les événements

### `stopListening`

-   **Type** : `() => void`
-   **Description** : Fonction pour arrêter d'écouter les événements

### `emit`

-   **Type** : `(payload: T) => Promise<void>`
-   **Description** : Fonction pour émettre un événement avec le payload donné

## Exemples d'Usage

### Écoute d'Événements de Base

```vue
<template>
    <div>
        <h3>Écouteur d'Événements</h3>

        <div>
            <button @click="startListening">Commencer l'écoute</button>
            <button @click="stopListening">Arrêter l'écoute</button>
        </div>

        <div v-if="error" class="error">Erreur : {{ error.message }}</div>

        <div v-if="data">
            <h4>Dernier Événement Reçu :</h4>
            <pre>{{ JSON.stringify(data, null, 2) }}</pre>
        </div>
    </div>
</template>

<script setup>
const { data, error, startListening, stopListening } =
    useTauriEvent("my-event");
</script>
```

### Émission d'Événements

```vue
<template>
    <div>
        <h3>Envoyer des Événements</h3>

        <input v-model="message" placeholder="Entrez un message" />
        <button @click="sendMessage" :disabled="!message">
            Envoyer l'événement
        </button>

        <div v-if="error" class="error">Erreur : {{ error.message }}</div>
    </div>
</template>

<script setup>
const message = ref("");

const { emit, error } = useTauriEvent("user-message");

const sendMessage = async () => {
    if (message.value.trim()) {
        await emit({
            message: message.value,
            timestamp: Date.now(),
        });
        message.value = "";
    }
};
</script>
```

### Événements Typés avec TypeScript

```vue
<template>
    <div>
        <h3>Application de Chat</h3>

        <div class="chat-controls">
            <button @click="startListening">Se connecter</button>
            <button @click="stopListening">Se déconnecter</button>
        </div>

        <div class="chat-messages">
            <div v-for="msg in messages" :key="msg.id" class="message">
                <strong>{{ msg.user }} :</strong> {{ msg.text }}
                <small>{{
                    new Date(msg.timestamp).toLocaleTimeString()
                }}</small>
            </div>
        </div>

        <div class="chat-input">
            <input
                v-model="newMessage"
                @keyup.enter="sendMessage"
                placeholder="Tapez un message..."
            />
            <button @click="sendMessage">Envoyer</button>
        </div>
    </div>
</template>

<script setup>
interface ChatMessage {
  id: string
  user: string
  text: string
  timestamp: number
}

const messages = ref<ChatMessage[]>([])
const newMessage = ref('')

const {
  data: receivedMessage,
  error,
  startListening,
  stopListening,
  emit
} = useTauriEvent<ChatMessage>('chat-message')

// Observer les nouveaux messages
watch(receivedMessage, (message) => {
  if (message) {
    messages.value.push(message)
  }
})

const sendMessage = async () => {
  if (newMessage.value.trim()) {
    const message: ChatMessage = {
      id: Date.now().toString(),
      user: 'Vous',
      text: newMessage.value,
      timestamp: Date.now()
    }

    await emit(message)
    newMessage.value = ''
  }
}

// Auto-connexion au montage du composant
onMounted(() => {
  startListening()
})
</script>
```

### Surveillance du Système de Fichiers

```vue
<template>
    <div>
        <h3>Surveillance du Système de Fichiers</h3>

        <div>
            <button @click="startWatching">Commencer la surveillance</button>
            <button @click="stopWatching">Arrêter la surveillance</button>
        </div>

        <div v-if="error" class="error">Erreur : {{ error.message }}</div>

        <div v-if="fileEvent">
            <h4>Événement du Système de Fichiers :</h4>
            <p><strong>Action :</strong> {{ fileEvent.action }}</p>
            <p><strong>Fichier :</strong> {{ fileEvent.path }}</p>
            <p>
                <strong>Heure :</strong>
                {{ new Date(fileEvent.timestamp).toLocaleString() }}
            </p>
        </div>

        <div class="recent-events">
            <h4>Événements Récents :</h4>
            <ul>
                <li v-for="event in recentEvents" :key="event.timestamp">
                    {{ event.action }} - {{ event.path }}
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup>
interface FileSystemEvent {
  action: 'created' | 'modified' | 'deleted'
  path: string
  timestamp: number
}

const recentEvents = ref<FileSystemEvent[]>([])

const {
  data: fileEvent,
  error,
  startListening: startWatching,
  stopListening: stopWatching
} = useTauriEvent<FileSystemEvent>('file-system-event')

// Suivre les événements récents
watch(fileEvent, (event) => {
  if (event) {
    recentEvents.value.unshift(event)
    // Garder seulement les 10 derniers événements
    if (recentEvents.value.length > 10) {
      recentEvents.value = recentEvents.value.slice(0, 10)
    }
  }
})
</script>
```

### Suivi de Progression

```vue
<template>
    <div>
        <h3>Progression du Téléchargement</h3>

        <button @click="startDownload" :disabled="isDownloading">
            Commencer le téléchargement
        </button>

        <div v-if="isDownloading" class="progress-container">
            <div class="progress-bar">
                <div
                    class="progress-fill"
                    :style="{ width: `${progress?.percentage || 0}%` }"
                ></div>
            </div>
            <p>{{ progress?.percentage || 0 }}% - {{ progress?.status }}</p>
            <p v-if="progress?.bytesDownloaded">
                {{ formatBytes(progress.bytesDownloaded) }} /
                {{ formatBytes(progress.totalBytes) }}
            </p>
        </div>

        <div v-if="error" class="error">
            Échec du téléchargement : {{ error.message }}
        </div>
    </div>
</template>

<script setup>
interface DownloadProgress {
  percentage: number
  status: string
  bytesDownloaded: number
  totalBytes: number
  finished: boolean
}

const isDownloading = ref(false)

const {
  data: progress,
  error,
  startListening,
  stopListening,
  emit
} = useTauriEvent<DownloadProgress>('download-progress')

const startDownload = async () => {
  isDownloading.value = true
  await startListening()

  // Émettre la commande de début de téléchargement
  await emit({ action: 'start', url: 'https://example.com/file.zip' })
}

// Observer la fin du téléchargement
watch(progress, (prog) => {
  if (prog?.finished) {
    isDownloading.value = false
    stopListening()
  }
})

const formatBytes = (bytes: number) => {
  return (bytes / 1024 / 1024).toFixed(2) + ' MB'
}
</script>

<style scoped>
.progress-container {
    margin: 1rem 0;
}

.progress-bar {
    width: 100%;
    height: 20px;
    background-color: #f0f0f0;
    border-radius: 10px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background-color: #4caf50;
    transition: width 0.3s ease;
}
</style>
```

## Gestion du Cycle de Vie

Le composable gère automatiquement le nettoyage :

```vue
<script setup>
const { startListening, stopListening } = useTauriEvent("my-event");

// Commencer l'écoute au montage du composant
onMounted(() => {
    startListening();
});

// Le nettoyage est automatique au démontage du composant
// Pas besoin d'appeler manuellement stopListening dans onUnmounted
</script>
```

## Gestion d'Erreurs

Gérer différents types d'erreurs :

```vue
<script setup>
const { error, startListening } = useTauriEvent("my-event");

watchEffect(() => {
    if (error.value) {
        if (error.value.message.includes("Tauri API not available")) {
            console.log(
                "Fonctionnement en mode navigateur - événements désactivés"
            );
        } else {
            console.error("Erreur d'événement:", error.value);
            // Peut-être afficher une notification utilisateur
        }
    }
});
</script>
```

## Bonnes Pratiques

### 1. Utiliser TypeScript pour les Payloads d'Événements

Définir des interfaces pour vos données d'événement :

```typescript
interface UserAction {
    type: "login" | "logout" | "register";
    userId: string;
    timestamp: number;
}

const { data, emit } = useTauriEvent<UserAction>("user-action");
```

### 2. Gérer les États de Connexion

Fournir un retour sur l'état d'écoute :

```vue
<template>
    <div>
        <span class="status" :class="{ listening: isListening }">
            {{ isListening ? "Connecté" : "Déconnecté" }}
        </span>
    </div>
</template>

<script setup>
const isListening = ref(false);
const { startListening, stopListening } = useTauriEvent("status");

const connect = async () => {
    await startListening();
    isListening.value = true;
};

const disconnect = () => {
    stopListening();
    isListening.value = false;
};
</script>
```

### 3. Débouncer les Événements Rapides

Pour les événements haute fréquence, considérez le debouncing :

```vue
<script setup>
import { debounce } from "lodash-es";

const { data } = useTauriEvent("mouse-position");

const debouncedHandler = debounce((position) => {
    // Gérer la mise à jour de position
    console.log("Position de la souris:", position);
}, 100);

watch(data, debouncedHandler);
</script>
```

### 4. Valider les Données d'Événement

Toujours valider les données d'événement entrantes :

```vue
<script setup>
const { data } = useTauriEvent("user-data");

watch(data, (userData) => {
    if (userData && typeof userData === "object" && "id" in userData) {
        // Les données sont valides
        handleUserData(userData);
    } else {
        console.warn("Données utilisateur invalides reçues:", userData);
    }
});
</script>
```

## Intégration Backend Rust

### Émettre des Événements depuis Rust

```rust
use tauri::{AppHandle, Manager};

#[tauri::command]
fn process_data(app: AppHandle) -> Result<(), String> {
    // Faire du traitement...

    // Émettre un événement vers le frontend
    app.emit_all("data-processed", ProcessedData {
        id: 123,
        result: "Succès".to_string(),
        timestamp: chrono::Utc::now().timestamp(),
    }).map_err(|e| e.to_string())?;

    Ok(())
}
```

### Écouter les Événements en Rust

```rust
use tauri::{Manager, Window};

fn setup_event_listeners(app: &mut tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    let window = app.get_window("main").unwrap();

    window.listen("user-action", |event| {
        println!("Action utilisateur reçue: {:?}", event.payload());
        // Gérer l'événement
    });

    Ok(())
}
```

## Articles Liés

-   [useTauriInvoke](/fr/api/use-tauri-invoke) - Pour exécuter des commandes Tauri
-   [Exemples](/fr/examples/basic-usage) - Voir plus d'exemples d'usage
