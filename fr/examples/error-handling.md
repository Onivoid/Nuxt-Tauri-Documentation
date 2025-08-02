# Gestion d'Erreurs

La gestion d'erreurs complète est cruciale pour construire des applications Tauri robustes. Ce guide couvre diverses stratégies et patterns de gestion d'erreurs lors de l'utilisation des composables Nuxt Tauri.

## Comprendre les Types d'Erreurs

### Erreurs de l'API Tauri

En utilisant les composables Tauri, vous rencontrerez différents types d'erreurs :

1. **API Non Disponible** : Exécution dans l'environnement navigateur
2. **Commande Non Trouvée** : Commande Rust non enregistrée
3. **Erreurs d'Exécution de Commande** : Erreurs de votre code Rust
4. **Erreurs Réseau/IPC** : Échecs de communication
5. **Erreurs de Sérialisation** : Problèmes de format de données

## Gestion d'Erreurs de Base

### Affichage Simple d'Erreur

```vue
<template>
    <div class="error-example">
        <button @click="execute" :disabled="pending">
            {{ pending ? "Chargement..." : "Exécuter Commande" }}
        </button>

        <!-- Affichage d'erreur basique -->
        <div v-if="error" class="error-message">
            <h4>Erreur Survenue</h4>
            <p>{{ error.message }}</p>
            <button @click="execute" class="retry-btn">Réessayer</button>
        </div>

        <div v-if="data" class="success-message">
            Opération terminée avec succès !
        </div>
    </div>
</template>

<script setup>
const { data, pending, error, execute } = useTauriInvoke(
    "potentially_failing_command"
);
</script>

<style scoped>
.error-message {
    background: #fee;
    border: 1px solid #fcc;
    border-radius: 4px;
    padding: 1rem;
    margin: 1rem 0;
    color: #c33;
}

.success-message {
    background: #efe;
    border: 1px solid #cfc;
    border-radius: 4px;
    padding: 1rem;
    margin: 1rem 0;
    color: #3c3;
}

.retry-btn {
    background: #dc3545;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 0.5rem;
}
</style>
```

## Patterns Avancés de Gestion d'Erreurs

### Classification d'Erreurs et Messages Conviviaux

```vue
<template>
    <div class="advanced-error-handling">
        <button @click="execute" :disabled="pending">
            Charger les Données Utilisateur
        </button>

        <div v-if="pending" class="loading">
            Chargement des données utilisateur...
        </div>

        <div v-if="processedError" class="error-container">
            <div class="error-icon">
                {{ getErrorIcon(processedError.type) }}
            </div>
            <div class="error-content">
                <h4>{{ processedError.title }}</h4>
                <p>{{ processedError.message }}</p>
                <div v-if="processedError.actions" class="error-actions">
                    <button
                        v-for="action in processedError.actions"
                        :key="action.label"
                        @click="action.handler"
                        :class="action.style"
                    >
                        {{ action.label }}
                    </button>
                </div>
            </div>
        </div>

        <div v-if="data" class="user-data">
            <h3>{{ data.name }}</h3>
            <p>{{ data.email }}</p>
        </div>
    </div>
</template>

<script setup>
interface ProcessedError {
  type: 'network' | 'permission' | 'validation' | 'system' | 'unknown'
  title: string
  message: string
  actions?: Array<{
    label: string
    handler: () => void
    style: string
  }>
}

const { data, pending, error, execute } = useTauriInvoke<User>('get_user_data')

const processedError = computed<ProcessedError | null>(() => {
  if (!error.value) return null

  const errorMessage = error.value.message.toLowerCase()

  // Erreurs réseau/connectivité
  if (errorMessage.includes('connection') || errorMessage.includes('timeout')) {
    return {
      type: 'network',
      title: 'Problème de Connexion',
      message: 'Impossible de se connecter au serveur. Veuillez vérifier votre connexion internet.',
      actions: [
        {
          label: 'Réessayer',
          handler: execute,
          style: 'btn-primary'
        },
        {
          label: 'Travailler Hors Ligne',
          handler: () => navigateTo('/hors-ligne'),
          style: 'btn-secondary'
        }
      ]
    }
  }

  // Erreurs de permission
  if (errorMessage.includes('permission') || errorMessage.includes('unauthorized')) {
    return {
      type: 'permission',
      title: 'Accès Refusé',
      message: 'Vous n\'avez pas la permission d\'accéder à ces données. Veuillez contacter votre administrateur.',
      actions: [
        {
          label: 'Se Reconnecter',
          handler: () => navigateTo('/connexion'),
          style: 'btn-primary'
        }
      ]
    }
  }

  // Erreurs de validation
  if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
    return {
      type: 'validation',
      title: 'Données Invalides',
      message: 'Les données fournies ne sont pas valides. Veuillez vérifier votre saisie et réessayer.',
      actions: [
        {
          label: 'Retour',
          handler: () => window.history.back(),
          style: 'btn-secondary'
        }
      ]
    }
  }

  // API Tauri non disponible (environnement navigateur)
  if (errorMessage.includes('tauri api not available')) {
    return {
      type: 'system',
      title: 'Fonctionnalités Desktop Indisponibles',
      message: 'Cette fonctionnalité n\'est disponible que dans l\'application desktop.',
      actions: [
        {
          label: 'Télécharger l\'App Desktop',
          handler: () => window.open('/telecharger', '_blank'),
          style: 'btn-primary'
        },
        {
          label: 'Continuer dans le Navigateur',
          handler: () => navigateTo('/version-web'),
          style: 'btn-secondary'
        }
      ]
    }
  }

  // Erreur générique de fallback
  return {
    type: 'unknown',
    title: 'Quelque Chose s\'est Mal Passé',
    message: 'Une erreur inattendue s\'est produite. Notre équipe a été notifiée.',
    actions: [
      {
        label: 'Réessayer',
        handler: execute,
        style: 'btn-primary'
      },
      {
        label: 'Signaler le Problème',
        handler: () => navigateTo('/support'),
        style: 'btn-secondary'
      }
    ]
  }
})

const getErrorIcon = (type: string) => {
  const icons = {
    network: '🌐',
    permission: '🔒',
    validation: '⚠️',
    system: '💻',
    unknown: '❌'
  }
  return icons[type as keyof typeof icons] || '❌'
}
</script>

<style scoped>
.error-container {
    display: flex;
    gap: 1rem;
    background: #fef7f7;
    border: 1px solid #fecaca;
    border-radius: 8px;
    padding: 1.5rem;
    margin: 1rem 0;
}

.error-icon {
    font-size: 2rem;
    flex-shrink: 0;
}

.error-content {
    flex: 1;
}

.error-content h4 {
    margin: 0 0 0.5rem 0;
    color: #dc2626;
}

.error-content p {
    margin: 0 0 1rem 0;
    color: #7f1d1d;
}

.error-actions {
    display: flex;
    gap: 0.5rem;
}

.btn-primary {
    background: #dc2626;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
}

.btn-secondary {
    background: transparent;
    color: #dc2626;
    border: 1px solid #dc2626;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
}
</style>
```

### Gestionnaire d'Erreurs Global

```typescript
// composables/useGlobalErrorHandler.ts
interface ErrorReport {
    error: Error;
    context: string;
    timestamp: number;
    userId?: string;
    metadata?: Record<string, any>;
}

export function useGlobalErrorHandler() {
    const errorReports = ref<ErrorReport[]>([]);

    const reportError = async (
        error: Error,
        context: string,
        metadata?: Record<string, any>
    ) => {
        const report: ErrorReport = {
            error,
            context,
            timestamp: Date.now(),
            userId: getCurrentUserId(),
            metadata,
        };

        // Stocker localement
        errorReports.value.push(report);

        // Envoyer au backend pour logging
        try {
            await useTauriInvoke("report_error", {
                message: error.message,
                stack: error.stack,
                context,
                timestamp: report.timestamp,
                userId: report.userId,
                metadata,
            }).execute();
        } catch (reportingError) {
            console.error("Échec du rapport d'erreur:", reportingError);
        }

        // Afficher notification utilisateur si approprié
        if (shouldShowUserNotification(error, context)) {
            showErrorNotification(error, context);
        }
    };

    const shouldShowUserNotification = (
        error: Error,
        context: string
    ): boolean => {
        // Ne pas afficher de notifications pour les opérations en arrière-plan
        if (context.includes("background") || context.includes("sync")) {
            return false;
        }

        // Ne pas afficher pour les erreurs réseau si on affiche déjà le statut de connexion
        if (
            error.message.includes("connection") &&
            hasActiveConnectionWarning()
        ) {
            return false;
        }

        return true;
    };

    const showErrorNotification = (error: Error, context: string) => {
        // Ceci s'intégrerait avec votre système de notification
        console.error(`Erreur dans ${context}:`, error);
    };

    const clearErrorReports = () => {
        errorReports.value = [];
    };

    return {
        errorReports: readonly(errorReports),
        reportError,
        clearErrorReports,
    };
}
```

### Logique de Retry avec Backoff Exponentiel

```vue
<template>
    <div class="retry-example">
        <h3>Statut de Synchronisation</h3>

        <div class="sync-status">
            <span class="status-indicator" :class="syncStatus">
                {{ getSyncStatusText() }}
            </span>

            <div v-if="isRetrying" class="retry-info">
                Nouvelle tentative dans {{ remainingTime }}s (Tentative
                {{ currentAttempt }}/{{ maxRetries }})
                <button @click="cancelRetry" class="cancel-btn">Annuler</button>
            </div>
        </div>

        <button @click="startSync" :disabled="pending || isRetrying">
            {{ pending ? "Synchronisation..." : "Démarrer Sync" }}
        </button>

        <div v-if="error && !isRetrying" class="error-details">
            <h4>Échec de Synchronisation</h4>
            <p>{{ error.message }}</p>
            <button @click="startSync" class="retry-manual">
                Réessayer Maintenant
            </button>
        </div>

        <div v-if="data" class="sync-success">
            Dernière sync : {{ formatTime(data.timestamp) }} ({{
                data.itemsSynced
            }}
            éléments)
        </div>
    </div>
</template>

<script setup>
interface SyncResult {
  timestamp: number
  itemsSynced: number
}

const maxRetries = 5
const baseDelay = 1000 // 1 seconde

const { data, pending, error, execute } = useTauriInvoke<SyncResult>('sync_data')

const currentAttempt = ref(0)
const isRetrying = ref(false)
const remainingTime = ref(0)
const retryTimeoutId = ref<NodeJS.Timeout>()
const countdownIntervalId = ref<NodeJS.Timeout>()

const syncStatus = computed(() => {
  if (pending.value) return 'syncing'
  if (isRetrying.value) return 'retrying'
  if (error.value) return 'error'
  if (data.value) return 'success'
  return 'idle'
})

const getSyncStatusText = () => {
  const statusTexts = {
    idle: 'Prêt à synchroniser',
    syncing: 'Synchronisation...',
    retrying: 'Va réessayer',
    error: 'Échec de sync',
    success: 'Synchronisé avec succès'
  }
  return statusTexts[syncStatus.value]
}

const calculateDelay = (attempt: number): number => {
  // Backoff exponentiel avec jitter
  const exponentialDelay = baseDelay * Math.pow(2, attempt)
  const jitter = Math.random() * 1000 // Ajouter jusqu'à 1 seconde de jitter
  return Math.min(exponentialDelay + jitter, 30000) // Limiter à 30 secondes
}

const startRetry = async () => {
  if (currentAttempt.value >= maxRetries) {
    console.error('Nombre maximum de tentatives dépassé')
    return
  }

  currentAttempt.value++
  isRetrying.value = true

  const delay = calculateDelay(currentAttempt.value - 1)
  remainingTime.value = Math.ceil(delay / 1000)

  // Démarrer le compte à rebours
  countdownIntervalId.value = setInterval(() => {
    remainingTime.value--
    if (remainingTime.value <= 0) {
      clearInterval(countdownIntervalId.value)
    }
  }, 1000)

  // Planifier la nouvelle tentative
  retryTimeoutId.value = setTimeout(async () => {
    isRetrying.value = false
    await execute()
  }, delay)
}

const cancelRetry = () => {
  if (retryTimeoutId.value) {
    clearTimeout(retryTimeoutId.value)
  }
  if (countdownIntervalId.value) {
    clearInterval(countdownIntervalId.value)
  }
  isRetrying.value = false
  currentAttempt.value = 0
}

const startSync = async () => {
  currentAttempt.value = 0
  cancelRetry()
  await execute()
}

// Observer les erreurs et démarrer la logique de retry
watch(error, (newError) => {
  if (newError && !isRetrying.value && currentAttempt.value < maxRetries) {
    // Vérifier si l'erreur est récupérable
    const isRetryable = !newError.message.includes('permission') &&
                       !newError.message.includes('unauthorized')

    if (isRetryable) {
      startRetry()
    }
  }
})

// Observer le succès de sync pour réinitialiser le compteur de retry
watch(data, (newData) => {
  if (newData) {
    currentAttempt.value = 0
    cancelRetry()
  }
})

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleString('fr-FR')
}

// Nettoyage au démontage
onUnmounted(() => {
  cancelRetry()
})
</script>

<style scoped>
.sync-status {
    margin-bottom: 1rem;
}

.status-indicator {
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-weight: bold;
    text-transform: uppercase;
    font-size: 0.875rem;
}

.status-indicator.idle {
    background: #f3f4f6;
    color: #6b7280;
}

.status-indicator.syncing {
    background: #dbeafe;
    color: #1d4ed8;
}

.status-indicator.retrying {
    background: #fef3c7;
    color: #d97706;
}

.status-indicator.error {
    background: #fee2e2;
    color: #dc2626;
}

.status-indicator.success {
    background: #dcfce7;
    color: #16a34a;
}

.retry-info {
    margin-top: 0.5rem;
    padding: 0.5rem;
    background: #fffbeb;
    border-radius: 4px;
    font-size: 0.875rem;
}

.cancel-btn {
    margin-left: 0.5rem;
    padding: 0.25rem 0.5rem;
    background: #f59e0b;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.75rem;
}

.error-details {
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 4px;
    padding: 1rem;
    margin: 1rem 0;
}

.retry-manual {
    margin-top: 0.5rem;
    padding: 0.5rem 1rem;
    background: #dc2626;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.sync-success {
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-radius: 4px;
    padding: 1rem;
    margin: 1rem 0;
    color: #166534;
}
</style>
```

## Boundaries d'Erreurs et Récupération

### Composant Error Boundary

```vue
<!-- components/ErrorBoundary.vue -->
<template>
    <div v-if="hasError" class="error-boundary">
        <div class="error-boundary-content">
            <h2>{{ errorTitle }}</h2>
            <p>{{ errorMessage }}</p>

            <details v-if="showDetails" class="error-details">
                <summary>Détails Techniques</summary>
                <pre>{{ errorStack }}</pre>
            </details>

            <div class="error-actions">
                <button @click="retry" class="btn-primary">Réessayer</button>
                <button @click="goHome" class="btn-secondary">Accueil</button>
                <button @click="reportBug" class="btn-secondary">
                    Signaler Bug
                </button>
            </div>
        </div>
    </div>

    <div v-else>
        <slot />
    </div>
</template>

<script setup>
interface Props {
  fallbackTitle?: string
  fallbackMessage?: string
  showDetails?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  fallbackTitle: 'Quelque chose s\'est mal passé',
  fallbackMessage: 'Une erreur inattendue s\'est produite. Veuillez réessayer.',
  showDetails: true
})

const hasError = ref(false)
const currentError = ref<Error | null>(null)

const errorTitle = computed(() => props.fallbackTitle)
const errorMessage = computed(() => props.fallbackMessage)
const errorStack = computed(() => currentError.value?.stack || 'Aucune trace de pile disponible')

const handleError = (error: Error) => {
  console.error('Error boundary a attrapé:', error)
  currentError.value = error
  hasError.value = true

  // Signaler l'erreur au service de monitoring
  useGlobalErrorHandler().reportError(error, 'error-boundary')
}

const retry = () => {
  hasError.value = false
  currentError.value = null
  // Le composant va se re-rendre et réessayer
}

const goHome = () => {
  navigateTo('/')
}

const reportBug = () => {
  // Ouvrir le formulaire de rapport de bug avec les détails d'erreur
  const bugReport = {
    error: currentError.value?.message,
    stack: currentError.value?.stack,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString()
  }

  navigateTo('/support/rapport-bug', {
    query: {
      data: encodeURIComponent(JSON.stringify(bugReport))
    }
  })
}

// Exposer le gestionnaire d'erreur pour les composants parents
defineExpose({
  handleError
})

// Gestionnaire d'erreur global
onErrorCaptured((error) => {
  handleError(error)
  return false // Empêcher l'erreur de se propager
})
</script>

<style scoped>
.error-boundary {
    min-height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 8px;
    margin: 2rem 0;
}

.error-boundary-content {
    text-align: center;
    max-width: 500px;
    padding: 2rem;
}

.error-boundary-content h2 {
    color: #dc2626;
    margin-bottom: 1rem;
}

.error-boundary-content p {
    color: #7f1d1d;
    margin-bottom: 2rem;
}

.error-details {
    text-align: left;
    margin: 1rem 0;
    background: white;
    border-radius: 4px;
    padding: 1rem;
}

.error-details pre {
    font-size: 0.875rem;
    overflow-x: auto;
    white-space: pre-wrap;
    word-break: break-word;
}

.error-actions {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
    flex-wrap: wrap;
}

.btn-primary {
    background: #dc2626;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    cursor: pointer;
}

.btn-secondary {
    background: transparent;
    color: #dc2626;
    border: 1px solid #dc2626;
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    cursor: pointer;
}
</style>
```

## Pattern Circuit Breaker

```typescript
// composables/useCircuitBreaker.ts
interface CircuitBreakerState {
    state: "CLOSED" | "OPEN" | "HALF_OPEN";
    failureCount: number;
    lastFailureTime: number;
    nextAttemptTime: number;
}

export function useCircuitBreaker(
    command: string,
    args?: Record<string, unknown>,
    options: {
        failureThreshold?: number;
        timeout?: number;
        resetTimeout?: number;
    } = {}
) {
    const {
        failureThreshold = 5,
        timeout = 30000,
        resetTimeout = 60000,
    } = options;

    const circuitState = ref<CircuitBreakerState>({
        state: "CLOSED",
        failureCount: 0,
        lastFailureTime: 0,
        nextAttemptTime: 0,
    });

    const {
        data,
        pending,
        error: rawError,
        execute: rawExecute,
    } = useTauriInvoke(command, args);

    const error = ref<Error | null>(null);

    const canExecute = computed(() => {
        const now = Date.now();

        switch (circuitState.value.state) {
            case "CLOSED":
                return true;

            case "OPEN":
                if (now >= circuitState.value.nextAttemptTime) {
                    circuitState.value.state = "HALF_OPEN";
                    return true;
                }
                return false;

            case "HALF_OPEN":
                return true;

            default:
                return false;
        }
    });

    const execute = async () => {
        if (!canExecute.value) {
            error.value = new Error(
                "Circuit breaker est OUVERT. Service temporairement indisponible."
            );
            return;
        }

        try {
            await rawExecute();

            // Succès - réinitialiser le circuit breaker s'il était ouvert ou semi-ouvert
            if (circuitState.value.state !== "CLOSED") {
                circuitState.value = {
                    state: "CLOSED",
                    failureCount: 0,
                    lastFailureTime: 0,
                    nextAttemptTime: 0,
                };
            }

            error.value = null;
        } catch (err) {
            circuitState.value.failureCount++;
            circuitState.value.lastFailureTime = Date.now();

            // Ouvrir le circuit si le seuil d'échec est dépassé
            if (circuitState.value.failureCount >= failureThreshold) {
                circuitState.value.state = "OPEN";
                circuitState.value.nextAttemptTime = Date.now() + resetTimeout;
            }

            error.value = err as Error;
        }
    };

    return {
        data,
        pending,
        error: computed(() => error.value || rawError.value),
        execute,
        circuitState: readonly(circuitState),
        canExecute,
    };
}
```

## Tester les Scénarios d'Erreur

```typescript
// tests/errorHandling.test.ts
import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { mockUseTauriInvoke } from "./mocks/tauriMocks";

describe("Gestion d'Erreurs", () => {
    it("devrait afficher des messages d'erreur conviviaux", async () => {
        const mockError = new Error("Connection timeout");
        const { simulateError } = mockUseTauriInvoke(null, mockError);

        const wrapper = mount(YourComponent);

        simulateError();
        await wrapper.vm.$nextTick();

        expect(wrapper.find(".error-message").text()).toContain(
            "Problème de Connexion"
        );
        expect(wrapper.find(".retry-btn").exists()).toBe(true);
    });

    it("devrait réessayer les opérations échouées avec backoff exponentiel", async () => {
        const mockExecute = vi
            .fn()
            .mockRejectedValueOnce(new Error("Échec temporaire"))
            .mockRejectedValueOnce(new Error("Toujours en échec"))
            .mockResolvedValueOnce({ success: true });

        // Tester la logique de retry
        // ... implémentation
    });

    it("devrait ouvrir le circuit breaker après les échecs de seuil", async () => {
        const circuitBreaker = useCircuitBreaker(
            "failing_command",
            {},
            {
                failureThreshold: 3,
            }
        );

        // Simuler les échecs
        for (let i = 0; i < 3; i++) {
            await circuitBreaker.execute();
        }

        expect(circuitBreaker.circuitState.value.state).toBe("OPEN");
        expect(circuitBreaker.canExecute.value).toBe(false);
    });
});
```

Ce guide complet de gestion d'erreurs fournit des patterns robustes pour traiter divers scénarios d'erreur dans les applications Tauri, assurant une meilleure expérience utilisateur et un débogage plus facile.

## Prochaines Étapes

-   [Référence API](/fr/api/use-tauri-invoke) - Documentation API détaillée
-   [Patterns Avancés](/fr/examples/advanced-patterns) - Patterns d'utilisation plus complexes
