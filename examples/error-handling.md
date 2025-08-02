# Error Handling

Comprehensive error handling is crucial for building robust Tauri applications. This guide covers various error handling strategies and patterns when using Nuxt Tauri composables.

## Understanding Error Types

### Tauri API Errors

When using Tauri composables, you'll encounter different types of errors:

1. **API Unavailable**: Running in browser environment
2. **Command Not Found**: Rust command not registered
3. **Command Execution Errors**: Errors from your Rust code
4. **Network/IPC Errors**: Communication failures
5. **Serialization Errors**: Data format issues

## Basic Error Handling

### Simple Error Display

```vue
<template>
    <div class="error-example">
        <button @click="execute" :disabled="pending">
            {{ pending ? "Loading..." : "Execute Command" }}
        </button>

        <!-- Basic error display -->
        <div v-if="error" class="error-message">
            <h4>Error Occurred</h4>
            <p>{{ error.message }}</p>
            <button @click="execute" class="retry-btn">Try Again</button>
        </div>

        <div v-if="data" class="success-message">
            Operation completed successfully!
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

## Advanced Error Handling Patterns

### Error Classification and User-Friendly Messages

```vue
<template>
    <div class="advanced-error-handling">
        <button @click="execute" :disabled="pending">Load User Data</button>

        <div v-if="pending" class="loading">Loading user data...</div>

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

  // Network/connectivity errors
  if (errorMessage.includes('connection') || errorMessage.includes('timeout')) {
    return {
      type: 'network',
      title: 'Connection Problem',
      message: 'Unable to connect to the server. Please check your internet connection.',
      actions: [
        {
          label: 'Retry',
          handler: execute,
          style: 'btn-primary'
        },
        {
          label: 'Work Offline',
          handler: () => navigateTo('/offline'),
          style: 'btn-secondary'
        }
      ]
    }
  }

  // Permission errors
  if (errorMessage.includes('permission') || errorMessage.includes('unauthorized')) {
    return {
      type: 'permission',
      title: 'Access Denied',
      message: 'You don\'t have permission to access this data. Please contact your administrator.',
      actions: [
        {
          label: 'Login Again',
          handler: () => navigateTo('/login'),
          style: 'btn-primary'
        }
      ]
    }
  }

  // Validation errors
  if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
    return {
      type: 'validation',
      title: 'Invalid Data',
      message: 'The data provided is not valid. Please check your input and try again.',
      actions: [
        {
          label: 'Go Back',
          handler: () => window.history.back(),
          style: 'btn-secondary'
        }
      ]
    }
  }

  // Tauri API not available (browser environment)
  if (errorMessage.includes('tauri api not available')) {
    return {
      type: 'system',
      title: 'Desktop Features Unavailable',
      message: 'This feature is only available in the desktop application.',
      actions: [
        {
          label: 'Download Desktop App',
          handler: () => window.open('/download', '_blank'),
          style: 'btn-primary'
        },
        {
          label: 'Continue in Browser',
          handler: () => navigateTo('/web-version'),
          style: 'btn-secondary'
        }
      ]
    }
  }

  // Generic error fallback
  return {
    type: 'unknown',
    title: 'Something Went Wrong',
    message: 'An unexpected error occurred. Our team has been notified.',
    actions: [
      {
        label: 'Try Again',
        handler: execute,
        style: 'btn-primary'
      },
      {
        label: 'Report Issue',
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

### Global Error Handler

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

        // Store locally
        errorReports.value.push(report);

        // Send to backend for logging
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
            console.error("Failed to report error:", reportingError);
        }

        // Show user notification if appropriate
        if (shouldShowUserNotification(error, context)) {
            showErrorNotification(error, context);
        }
    };

    const shouldShowUserNotification = (
        error: Error,
        context: string
    ): boolean => {
        // Don't show notifications for background operations
        if (context.includes("background") || context.includes("sync")) {
            return false;
        }

        // Don't show for network errors if we're already showing connection status
        if (
            error.message.includes("connection") &&
            hasActiveConnectionWarning()
        ) {
            return false;
        }

        return true;
    };

    const showErrorNotification = (error: Error, context: string) => {
        // This would integrate with your notification system
        console.error(`Error in ${context}:`, error);
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

### Retry Logic with Exponential Backoff

```vue
<template>
    <div class="retry-example">
        <h3>Data Sync Status</h3>

        <div class="sync-status">
            <span class="status-indicator" :class="syncStatus">
                {{ getSyncStatusText() }}
            </span>

            <div v-if="isRetrying" class="retry-info">
                Retrying in {{ remainingTime }}s (Attempt
                {{ currentAttempt }}/{{ maxRetries }})
                <button @click="cancelRetry" class="cancel-btn">Cancel</button>
            </div>
        </div>

        <button @click="startSync" :disabled="pending || isRetrying">
            {{ pending ? "Syncing..." : "Start Sync" }}
        </button>

        <div v-if="error && !isRetrying" class="error-details">
            <h4>Sync Failed</h4>
            <p>{{ error.message }}</p>
            <button @click="startSync" class="retry-manual">Retry Now</button>
        </div>

        <div v-if="data" class="sync-success">
            Last sync: {{ formatTime(data.timestamp) }} ({{
                data.itemsSynced
            }}
            items)
        </div>
    </div>
</template>

<script setup>
interface SyncResult {
  timestamp: number
  itemsSynced: number
}

const maxRetries = 5
const baseDelay = 1000 // 1 second

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
    idle: 'Ready to sync',
    syncing: 'Syncing...',
    retrying: 'Will retry',
    error: 'Sync failed',
    success: 'Synced successfully'
  }
  return statusTexts[syncStatus.value]
}

const calculateDelay = (attempt: number): number => {
  // Exponential backoff with jitter
  const exponentialDelay = baseDelay * Math.pow(2, attempt)
  const jitter = Math.random() * 1000 // Add up to 1 second of jitter
  return Math.min(exponentialDelay + jitter, 30000) // Cap at 30 seconds
}

const startRetry = async () => {
  if (currentAttempt.value >= maxRetries) {
    console.error('Max retries exceeded')
    return
  }

  currentAttempt.value++
  isRetrying.value = true

  const delay = calculateDelay(currentAttempt.value - 1)
  remainingTime.value = Math.ceil(delay / 1000)

  // Start countdown
  countdownIntervalId.value = setInterval(() => {
    remainingTime.value--
    if (remainingTime.value <= 0) {
      clearInterval(countdownIntervalId.value)
    }
  }, 1000)

  // Schedule retry
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

// Watch for errors and start retry logic
watch(error, (newError) => {
  if (newError && !isRetrying.value && currentAttempt.value < maxRetries) {
    // Check if error is retryable
    const isRetryable = !newError.message.includes('permission') &&
                       !newError.message.includes('unauthorized')

    if (isRetryable) {
      startRetry()
    }
  }
})

// Watch for successful sync to reset retry counter
watch(data, (newData) => {
  if (newData) {
    currentAttempt.value = 0
    cancelRetry()
  }
})

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleString()
}

// Cleanup on unmount
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

## Error Boundaries and Recovery

### Error Boundary Component

```vue
<!-- components/ErrorBoundary.vue -->
<template>
    <div v-if="hasError" class="error-boundary">
        <div class="error-boundary-content">
            <h2>{{ errorTitle }}</h2>
            <p>{{ errorMessage }}</p>

            <details v-if="showDetails" class="error-details">
                <summary>Technical Details</summary>
                <pre>{{ errorStack }}</pre>
            </details>

            <div class="error-actions">
                <button @click="retry" class="btn-primary">Try Again</button>
                <button @click="goHome" class="btn-secondary">Go Home</button>
                <button @click="reportBug" class="btn-secondary">
                    Report Bug
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
  fallbackTitle: 'Something went wrong',
  fallbackMessage: 'An unexpected error occurred. Please try again.',
  showDetails: true
})

const hasError = ref(false)
const currentError = ref<Error | null>(null)

const errorTitle = computed(() => props.fallbackTitle)
const errorMessage = computed(() => props.fallbackMessage)
const errorStack = computed(() => currentError.value?.stack || 'No stack trace available')

const handleError = (error: Error) => {
  console.error('Error boundary caught:', error)
  currentError.value = error
  hasError.value = true

  // Report error to monitoring service
  useGlobalErrorHandler().reportError(error, 'error-boundary')
}

const retry = () => {
  hasError.value = false
  currentError.value = null
  // The component will re-render and try again
}

const goHome = () => {
  navigateTo('/')
}

const reportBug = () => {
  // Open bug report form with error details
  const bugReport = {
    error: currentError.value?.message,
    stack: currentError.value?.stack,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString()
  }

  navigateTo('/support/bug-report', {
    query: {
      data: encodeURIComponent(JSON.stringify(bugReport))
    }
  })
}

// Expose error handler for parent components
defineExpose({
  handleError
})

// Global error handler
onErrorCaptured((error) => {
  handleError(error)
  return false // Prevent error from propagating
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

## Circuit Breaker Pattern

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
                "Circuit breaker is OPEN. Service is temporarily unavailable."
            );
            return;
        }

        try {
            await rawExecute();

            // Success - reset circuit breaker if it was open or half-open
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

            // Open circuit if failure threshold exceeded
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

## Testing Error Scenarios

```typescript
// tests/errorHandling.test.ts
import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { mockUseTauriInvoke } from "./mocks/tauriMocks";

describe("Error Handling", () => {
    it("should display user-friendly error messages", async () => {
        const mockError = new Error("Connection timeout");
        const { simulateError } = mockUseTauriInvoke(null, mockError);

        const wrapper = mount(YourComponent);

        simulateError();
        await wrapper.vm.$nextTick();

        expect(wrapper.find(".error-message").text()).toContain(
            "Connection Problem"
        );
        expect(wrapper.find(".retry-btn").exists()).toBe(true);
    });

    it("should retry failed operations with exponential backoff", async () => {
        const mockExecute = vi
            .fn()
            .mockRejectedValueOnce(new Error("Temporary failure"))
            .mockRejectedValueOnce(new Error("Still failing"))
            .mockResolvedValueOnce({ success: true });

        // Test retry logic
        // ... implementation
    });

    it("should open circuit breaker after threshold failures", async () => {
        const circuitBreaker = useCircuitBreaker(
            "failing_command",
            {},
            {
                failureThreshold: 3,
            }
        );

        // Simulate failures
        for (let i = 0; i < 3; i++) {
            await circuitBreaker.execute();
        }

        expect(circuitBreaker.circuitState.value.state).toBe("OPEN");
        expect(circuitBreaker.canExecute.value).toBe(false);
    });
});
```

This comprehensive error handling guide provides robust patterns for dealing with various error scenarios in Tauri applications, ensuring a better user experience and easier debugging.

## Next Steps

-   [API Reference](/api/use-tauri-invoke) - Detailed API documentation
-   [Advanced Patterns](/examples/advanced-patterns) - More complex usage patterns
