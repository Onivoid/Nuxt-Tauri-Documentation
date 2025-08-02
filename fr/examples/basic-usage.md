# Utilisation de Base

Cette page présente les modèles d'utilisation fondamentaux des composables Nuxt Tauri avec des exemples pratiques.

## Démarrage

Avant de plonger dans les exemples, assurez-vous d'avoir :

1. Installé le module : `npx nuxi module add nuxt-module-tauri`
2. Ajouté la dépendance API Tauri : `pnpm add @tauri-apps/api`
3. Configuré votre backend Rust avec les commandes appropriées

## Exécution de Commande Simple

### Récupération de Données de Base

```vue
<template>
    <div class="app-info">
        <h2>Informations de l'Application</h2>

        <button @click="fetchAppInfo" :disabled="pending">
            {{ pending ? "Chargement..." : "Obtenir les infos de l'app" }}
        </button>

        <div v-if="error" class="error">
            Échec du chargement des infos de l'app : {{ error.message }}
        </div>

        <div v-if="data" class="info-card">
            <p><strong>Nom :</strong> {{ data.name }}</p>
            <p><strong>Version :</strong> {{ data.version }}</p>
            <p><strong>Auteur :</strong> {{ data.author }}</p>
        </div>
    </div>
</template>

<script setup>
// Interface TypeScript pour la structure de données attendue
interface AppInfo {
  name: string
  version: string
  author: string
}

// Utiliser le composable
const { data, pending, error, execute: fetchAppInfo } = useTauriInvoke<AppInfo>('get_app_info')
</script>

<style scoped>
.app-info {
    max-width: 400px;
    margin: 0 auto;
    padding: 2rem;
}

.info-card {
    background: #f5f5f5;
    padding: 1rem;
    border-radius: 8px;
    margin-top: 1rem;
}

.error {
    color: #e74c3c;
    padding: 1rem;
    background: #fdf2f2;
    border-radius: 4px;
    margin-top: 1rem;
}
</style>
```

### Commande avec Paramètres

```vue
<template>
    <div class="user-lookup">
        <h2>Recherche d'Utilisateur</h2>

        <div class="form-group">
            <label for="userId">ID Utilisateur :</label>
            <input
                id="userId"
                v-model.number="userId"
                type="number"
                min="1"
                placeholder="Entrez l'ID utilisateur"
            />
        </div>

        <button
            @click="lookupUser"
            :disabled="pending || !userId"
            class="lookup-btn"
        >
            {{ pending ? "Recherche..." : "Rechercher Utilisateur" }}
        </button>

        <div v-if="error" class="error">
            {{ error.message }}
        </div>

        <div v-if="user" class="user-card">
            <img
                :src="user.avatar"
                :alt="`Avatar de ${user.name}`"
                class="avatar"
            />
            <div class="user-info">
                <h3>{{ user.name }}</h3>
                <p class="email">{{ user.email }}</p>
                <p class="role">{{ user.role }}</p>
                <span
                    class="status"
                    :class="user.isActive ? 'active' : 'inactive'"
                >
                    {{ user.isActive ? "Actif" : "Inactif" }}
                </span>
            </div>
        </div>
    </div>
</template>

<script setup>
interface User {
  id: number
  name: string
  email: string
  role: string
  avatar: string
  isActive: boolean
}

const userId = ref<number>()

// Arguments réactifs - la commande utilisera la valeur actuelle de userId
const {
  data: user,
  pending,
  error,
  execute: lookupUser
} = useTauriInvoke<User>('get_user_by_id',
  computed(() => ({ id: userId.value }))
)
</script>

<style scoped>
.user-lookup {
    max-width: 500px;
    margin: 0 auto;
    padding: 2rem;
}

.form-group {
    margin-bottom: 1rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: bold;
}

.form-group input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
}

.lookup-btn {
    background: #3498db;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
}

.lookup-btn:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
}

.user-card {
    display: flex;
    gap: 1rem;
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    margin-top: 1rem;
}

.avatar {
    width: 64px;
    height: 64px;
    border-radius: 50%;
}

.user-info h3 {
    margin: 0 0 0.5rem 0;
}

.email {
    color: #666;
    margin: 0.25rem 0;
}

.role {
    color: #2c3e50;
    font-weight: bold;
    margin: 0.25rem 0;
}

.status {
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
    font-size: 0.875rem;
    font-weight: bold;
}

.status.active {
    background: #d4edda;
    color: #155724;
}

.status.inactive {
    background: #f8d7da;
    color: #721c24;
}
</style>
```

## Gestion d'Événements

### Écouteur d'Événements Simple

```vue
<template>
    <div class="event-listener">
        <h2>Notifications Système</h2>

        <div class="controls">
            <button @click="startListening" :disabled="isListening">
                Commencer l'écoute
            </button>
            <button @click="stopListening" :disabled="!isListening">
                Arrêter l'écoute
            </button>
            <button @click="clearNotifications">Tout effacer</button>
        </div>

        <div class="status">
            Statut : {{ isListening ? "En écoute" : "Pas en écoute" }}
        </div>

        <div v-if="error" class="error">
            {{ error.message }}
        </div>

        <div class="notifications">
            <h3>Notifications ({{ notifications.length }})</h3>
            <div v-if="notifications.length === 0" class="empty">
                Aucune notification pour le moment
            </div>
            <div
                v-for="notification in notifications"
                :key="notification.id"
                class="notification"
                :class="notification.type"
            >
                <div class="notification-header">
                    <strong>{{ notification.title }}</strong>
                    <span class="timestamp">
                        {{ formatTime(notification.timestamp) }}
                    </span>
                </div>
                <p>{{ notification.message }}</p>
            </div>
        </div>
    </div>
</template>

<script setup>
interface SystemNotification {
  id: string
  type: 'info' | 'warning' | 'error' | 'success'
  title: string
  message: string
  timestamp: number
}

const notifications = ref<SystemNotification[]>([])
const isListening = ref(false)

const {
  data: latestNotification,
  error,
  startListening: startEventListening,
  stopListening: stopEventListening
} = useTauriEvent<SystemNotification>('system-notification')

// Observer les nouvelles notifications
watch(latestNotification, (notification) => {
  if (notification) {
    notifications.value.unshift(notification)
    // Garder seulement les 50 dernières notifications
    if (notifications.value.length > 50) {
      notifications.value = notifications.value.slice(0, 50)
    }
  }
})

const startListening = async () => {
  await startEventListening()
  isListening.value = true
}

const stopListening = () => {
  stopEventListening()
  isListening.value = false
}

const clearNotifications = () => {
  notifications.value = []
}

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString()
}

// Nettoyage au démontage
onUnmounted(() => {
  if (isListening.value) {
    stopListening()
  }
})
</script>

<style scoped>
.event-listener {
    max-width: 600px;
    margin: 0 auto;
    padding: 2rem;
}

.controls {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
}

.controls button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    background: #3498db;
    color: white;
}

.controls button:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
}

.status {
    padding: 0.5rem;
    background: #ecf0f1;
    border-radius: 4px;
    margin-bottom: 1rem;
    font-weight: bold;
}

.notifications {
    max-height: 400px;
    overflow-y: auto;
}

.empty {
    text-align: center;
    color: #666;
    padding: 2rem;
}

.notification {
    border-left: 4px solid #3498db;
    padding: 1rem;
    margin-bottom: 0.5rem;
    background: white;
    border-radius: 0 4px 4px 0;
}

.notification.info {
    border-left-color: #3498db;
}

.notification.success {
    border-left-color: #27ae60;
}

.notification.warning {
    border-left-color: #f39c12;
}

.notification.error {
    border-left-color: #e74c3c;
}

.notification-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
}

.timestamp {
    font-size: 0.875rem;
    color: #666;
}

.notification p {
    margin: 0;
    color: #2c3e50;
}
</style>
```

## Exécution Immédiate

### Chargement de Configuration au Montage

```vue
<template>
    <div class="app-config">
        <h2>Configuration de l'Application</h2>

        <div v-if="pending" class="loading">
            <div class="spinner"></div>
            Chargement de la configuration...
        </div>

        <div v-if="error" class="error">
            <h3>Échec du Chargement de la Configuration</h3>
            <p>{{ error.message }}</p>
            <button @click="retryLoad">Réessayer</button>
        </div>

        <div v-if="config" class="config-display">
            <div class="config-section">
                <h3>Paramètres Généraux</h3>
                <div class="setting">
                    <label>Thème :</label>
                    <span>{{ config.theme }}</span>
                </div>
                <div class="setting">
                    <label>Langue :</label>
                    <span>{{ config.language }}</span>
                </div>
                <div class="setting">
                    <label>Sauvegarde Auto :</label>
                    <span>{{
                        config.autoSave ? "Activée" : "Désactivée"
                    }}</span>
                </div>
            </div>

            <div class="config-section">
                <h3>Paramètres de Fenêtre</h3>
                <div class="setting">
                    <label>Largeur :</label>
                    <span>{{ config.window.width }}px</span>
                </div>
                <div class="setting">
                    <label>Hauteur :</label>
                    <span>{{ config.window.height }}px</span>
                </div>
                <div class="setting">
                    <label>Redimensionnable :</label>
                    <span>{{ config.window.resizable ? "Oui" : "Non" }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
interface AppConfig {
  theme: 'light' | 'dark'
  language: string
  autoSave: boolean
  window: {
    width: number
    height: number
    resizable: boolean
  }
}

// Charger la configuration immédiatement au montage du composant
const {
  data: config,
  pending,
  error,
  execute: retryLoad
} = useTauriInvoke<AppConfig>('get_app_config', {}, { immediate: true })
</script>

<style scoped>
.app-config {
    max-width: 500px;
    margin: 0 auto;
    padding: 2rem;
}

.loading {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 2rem;
    text-align: center;
}

.spinner {
    width: 20px;
    height: 20px;
    border: 2px solid #f3f3f3;
    border-top: 2px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}

.config-display {
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.config-section {
    padding: 1.5rem;
    border-bottom: 1px solid #eee;
}

.config-section:last-child {
    border-bottom: none;
}

.config-section h3 {
    margin: 0 0 1rem 0;
    color: #2c3e50;
}

.setting {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
    border-bottom: 1px solid #f8f9fa;
}

.setting:last-child {
    border-bottom: none;
}

.setting label {
    font-weight: bold;
    color: #34495e;
}

.setting span {
    color: #2c3e50;
}
</style>
```

## Combinaison des Deux Composables

### Gestionnaire de Tâches avec Mises à Jour Temps Réel

```vue
<template>
    <div class="task-manager">
        <h2>Gestionnaire de Tâches</h2>

        <!-- Créer une nouvelle tâche -->
        <div class="task-form">
            <input
                v-model="newTaskTitle"
                placeholder="Entrez le titre de la tâche..."
                @keyup.enter="createTask"
            />
            <button
                @click="createTask"
                :disabled="createPending || !newTaskTitle"
            >
                {{ createPending ? "Création..." : "Ajouter Tâche" }}
            </button>
        </div>

        <!-- Liste des tâches -->
        <div class="task-list">
            <div v-if="loadPending" class="loading">
                Chargement des tâches...
            </div>

            <div v-if="loadError" class="error">
                Échec du chargement des tâches : {{ loadError.message }}
                <button @click="loadTasks">Réessayer</button>
            </div>

            <div v-if="tasks.length === 0 && !loadPending" class="empty">
                Aucune tâche pour le moment. Créez votre première tâche
                ci-dessus !
            </div>

            <div
                v-for="task in tasks"
                :key="task.id"
                class="task-item"
                :class="{ completed: task.completed }"
            >
                <div class="task-content">
                    <input
                        type="checkbox"
                        :checked="task.completed"
                        @change="toggleTask(task.id)"
                    />
                    <span class="task-title">{{ task.title }}</span>
                    <span class="task-date">{{
                        formatDate(task.createdAt)
                    }}</span>
                </div>
                <button @click="deleteTask(task.id)" class="delete-btn">
                    Supprimer
                </button>
            </div>
        </div>

        <!-- Statut temps réel -->
        <div class="status-bar">
            <span>Total : {{ tasks.length }}</span>
            <span>Terminées : {{ completedCount }}</span>
            <span>En écoute : {{ isListening ? "✅" : "❌" }}</span>
        </div>
    </div>
</template>

<script setup>
interface Task {
  id: string
  title: string
  completed: boolean
  createdAt: number
}

interface TaskEvent {
  type: 'created' | 'updated' | 'deleted'
  task: Task
}

const tasks = ref<Task[]>([])
const newTaskTitle = ref('')
const isListening = ref(false)

// Charger les tâches
const {
  data: loadedTasks,
  pending: loadPending,
  error: loadError,
  execute: loadTasks
} = useTauriInvoke<Task[]>('get_all_tasks', {}, { immediate: true })

// Créer une tâche
const {
  pending: createPending,
  execute: executeCreateTask
} = useTauriInvoke('create_task')

// Écouter les mises à jour de tâches en temps réel
const {
  data: taskEvent,
  startListening,
  stopListening
} = useTauriEvent<TaskEvent>('task-update')

// Observer les tâches chargées
watch(loadedTasks, (newTasks) => {
  if (newTasks) {
    tasks.value = [...newTasks]
  }
})

// Observer les événements de tâches en temps réel
watch(taskEvent, (event) => {
  if (!event) return

  switch (event.type) {
    case 'created':
      tasks.value.push(event.task)
      break
    case 'updated':
      const updateIndex = tasks.value.findIndex(t => t.id === event.task.id)
      if (updateIndex !== -1) {
        tasks.value[updateIndex] = event.task
      }
      break
    case 'deleted':
      tasks.value = tasks.value.filter(t => t.id !== event.task.id)
      break
  }
})

const completedCount = computed(() =>
  tasks.value.filter(task => task.completed).length
)

const createTask = async () => {
  if (!newTaskTitle.value.trim()) return

  await executeCreateTask({ title: newTaskTitle.value })
  newTaskTitle.value = ''
}

const toggleTask = async (taskId: string) => {
  await useTauriInvoke('toggle_task', { id: taskId }).execute()
}

const deleteTask = async (taskId: string) => {
  await useTauriInvoke('delete_task', { id: taskId }).execute()
}

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString()
}

// Commencer l'écoute des événements au montage
onMounted(async () => {
  await startListening()
  isListening.value = true
})

// Arrêter l'écoute au démontage
onUnmounted(() => {
  if (isListening.value) {
    stopListening()
    isListening.value = false
  }
})
</script>

<style scoped>
.task-manager {
    max-width: 600px;
    margin: 0 auto;
    padding: 2rem;
}

.task-form {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 2rem;
}

.task-form input {
    flex: 1;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
}

.task-form button {
    padding: 0.75rem 1.5rem;
    background: #27ae60;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.task-form button:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
}

.task-list {
    margin-bottom: 2rem;
}

.task-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border: 1px solid #eee;
    border-radius: 4px;
    margin-bottom: 0.5rem;
    background: white;
}

.task-item.completed {
    opacity: 0.6;
}

.task-content {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex: 1;
}

.task-title {
    flex: 1;
}

.task-item.completed .task-title {
    text-decoration: line-through;
}

.task-date {
    font-size: 0.875rem;
    color: #666;
}

.delete-btn {
    background: #e74c3c;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
}

.status-bar {
    display: flex;
    justify-content: space-between;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 4px;
    font-size: 0.875rem;
}

.loading,
.empty {
    text-align: center;
    padding: 2rem;
    color: #666;
}
</style>
```

## Bonnes Pratiques Démontrées

Les exemples ci-dessus démontrent plusieurs bonnes pratiques :

1. **Sécurité de Type** : Utilisation d'interfaces TypeScript pour toutes les structures de données
2. **Gestion d'Erreurs** : Affichage d'erreur approprié et mécanismes de retry
3. **États de Chargement** : Retour visuel pendant les opérations
4. **Données Réactives** : Utilisation efficace des propriétés computed et watchers
5. **Gestion du Cycle de Vie** : Nettoyage approprié des écouteurs d'événements
6. **Expérience Utilisateur** : États désactivés, indicateurs de chargement et retour clair

## Prochaines Étapes

-   [Modèles Avancés](/fr/examples/advanced-patterns) - Modèles d'utilisation plus complexes
-   [Gestion d'Erreurs](/fr/examples/error-handling) - Stratégies complètes de gestion d'erreurs
