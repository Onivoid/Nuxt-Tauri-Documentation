# Advanced Patterns

This page covers advanced usage patterns and techniques for building sophisticated applications with Nuxt Tauri composables.

## Composable Composition

### Creating Custom Composables

Build higher-level composables by combining the base ones:

```typescript
// composables/useFileManager.ts
export function useFileManager() {
    const {
        data: files,
        pending,
        error,
        execute: refreshFiles,
    } = useTauriInvoke<FileItem[]>("list_files", {}, { immediate: true });
    const { emit: emitFileEvent } =
        useTauriEvent<FileSystemEvent>("file-event");

    const selectedFiles = ref<string[]>([]);

    const selectFile = (path: string) => {
        if (!selectedFiles.value.includes(path)) {
            selectedFiles.value.push(path);
        }
    };

    const deselectFile = (path: string) => {
        selectedFiles.value = selectedFiles.value.filter((f) => f !== path);
    };

    const deleteSelected = async () => {
        for (const file of selectedFiles.value) {
            await useTauriInvoke("delete_file", { path: file }).execute();
        }
        selectedFiles.value = [];
        await refreshFiles();
    };

    const createFolder = async (name: string, parentPath?: string) => {
        await useTauriInvoke("create_folder", { name, parentPath }).execute();
        await refreshFiles();
        await emitFileEvent({
            type: "folder_created",
            path: `${parentPath}/${name}`,
        });
    };

    return {
        files: readonly(files),
        pending: readonly(pending),
        error: readonly(error),
        selectedFiles: readonly(selectedFiles),
        selectFile,
        deselectFile,
        deleteSelected,
        createFolder,
        refreshFiles,
    };
}
```

### State Management Pattern

```typescript
// composables/useAppState.ts
interface AppState {
    user: User | null;
    settings: AppSettings;
    notifications: Notification[];
}

export function useAppState() {
    const state = ref<AppState>({
        user: null,
        settings: defaultSettings,
        notifications: [],
    });

    // User management
    const { execute: login } = useTauriInvoke("user_login");
    const { execute: logout } = useTauriInvoke("user_logout");
    const { data: userData, startListening: startUserEvents } =
        useTauriEvent<UserEvent>("user-event");

    // Settings management
    const { execute: saveSettings } = useTauriInvoke("save_settings");
    const { data: settingsData, startListening: startSettingsEvents } =
        useTauriEvent<SettingsEvent>("settings-event");

    // Notification management
    const { data: notificationData, startListening: startNotificationEvents } =
        useTauriEvent<Notification>("notification");

    // Watchers
    watch(userData, (event) => {
        if (event?.type === "login") {
            state.value.user = event.user;
        } else if (event?.type === "logout") {
            state.value.user = null;
        }
    });

    watch(settingsData, (event) => {
        if (event?.type === "updated") {
            state.value.settings = {
                ...state.value.settings,
                ...event.settings,
            };
        }
    });

    watch(notificationData, (notification) => {
        if (notification) {
            state.value.notifications.unshift(notification);
            // Keep last 100 notifications
            if (state.value.notifications.length > 100) {
                state.value.notifications = state.value.notifications.slice(
                    0,
                    100
                );
            }
        }
    });

    // Actions
    const loginUser = async (credentials: LoginCredentials) => {
        await login(credentials);
    };

    const logoutUser = async () => {
        await logout();
    };

    const updateSettings = async (newSettings: Partial<AppSettings>) => {
        await saveSettings(newSettings);
    };

    const dismissNotification = (id: string) => {
        state.value.notifications = state.value.notifications.filter(
            (n) => n.id !== id
        );
    };

    // Initialize
    const initialize = async () => {
        await Promise.all([
            startUserEvents(),
            startSettingsEvents(),
            startNotificationEvents(),
        ]);
    };

    return {
        state: readonly(state),
        loginUser,
        logoutUser,
        updateSettings,
        dismissNotification,
        initialize,
    };
}
```

## Advanced Data Patterns

### Pagination with Infinite Loading

```vue
<template>
    <div class="infinite-list">
        <div class="search-bar">
            <input
                v-model="searchQuery"
                placeholder="Search items..."
                @input="debouncedSearch"
            />
        </div>

        <div class="items-container" @scroll="handleScroll" ref="container">
            <div v-for="item in allItems" :key="item.id" class="item-card">
                <h3>{{ item.title }}</h3>
                <p>{{ item.description }}</p>
                <span class="timestamp">{{ formatDate(item.createdAt) }}</span>
            </div>

            <div v-if="loadingMore" class="loading-more">
                Loading more items...
            </div>

            <div v-if="hasError" class="error">
                Failed to load more items
                <button @click="loadMore">Retry</button>
            </div>

            <div v-if="hasReachedEnd" class="end-message">
                No more items to load
            </div>
        </div>
    </div>
</template>

<script setup>
import { debounce } from 'lodash-es'

interface ListItem {
  id: string
  title: string
  description: string
  createdAt: number
}

interface PaginatedResponse {
  items: ListItem[]
  hasMore: boolean
  nextCursor?: string
}

const searchQuery = ref('')
const allItems = ref<ListItem[]>([])
const currentCursor = ref<string>()
const hasReachedEnd = ref(false)
const loadingMore = ref(false)
const hasError = ref(false)
const container = ref<HTMLElement>()

// Search with debouncing
const {
  data: searchResults,
  pending: searchPending,
  execute: executeSearch
} = useTauriInvoke<PaginatedResponse>('search_items')

// Load more items
const {
  data: moreItems,
  pending: loadMorePending,
  error: loadMoreError,
  execute: executeLoadMore
} = useTauriInvoke<PaginatedResponse>('load_more_items')

const debouncedSearch = debounce(async () => {
  // Reset state for new search
  allItems.value = []
  currentCursor.value = undefined
  hasReachedEnd.value = false
  hasError.value = false

  await executeSearch({
    query: searchQuery.value,
    limit: 20
  })
}, 300)

// Handle search results
watch(searchResults, (response) => {
  if (response) {
    allItems.value = response.items
    currentCursor.value = response.nextCursor
    hasReachedEnd.value = !response.hasMore
  }
})

// Handle load more results
watch(moreItems, (response) => {
  if (response) {
    allItems.value.push(...response.items)
    currentCursor.value = response.nextCursor
    hasReachedEnd.value = !response.hasMore
    loadingMore.value = false
  }
})

// Handle load more errors
watch(loadMoreError, (error) => {
  if (error) {
    hasError.value = true
    loadingMore.value = false
  }
})

const loadMore = async () => {
  if (loadingMore.value || hasReachedEnd.value) return

  loadingMore.value = true
  hasError.value = false

  await executeLoadMore({
    query: searchQuery.value,
    cursor: currentCursor.value,
    limit: 20
  })
}

const handleScroll = () => {
  if (!container.value) return

  const { scrollTop, scrollHeight, clientHeight } = container.value
  const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100

  if (isNearBottom && !loadingMore.value && !hasReachedEnd.value && !hasError.value) {
    loadMore()
  }
}

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString()
}

// Initial load
onMounted(() => {
  debouncedSearch()
})
</script>

<style scoped>
.infinite-list {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
}

.search-bar {
    margin-bottom: 2rem;
}

.search-bar input {
    width: 100%;
    padding: 1rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 1rem;
}

.items-container {
    max-height: 600px;
    overflow-y: auto;
    border: 1px solid #eee;
    border-radius: 8px;
}

.item-card {
    padding: 1.5rem;
    border-bottom: 1px solid #f0f0f0;
}

.item-card:last-child {
    border-bottom: none;
}

.item-card h3 {
    margin: 0 0 0.5rem 0;
    color: #2c3e50;
}

.item-card p {
    margin: 0 0 1rem 0;
    color: #666;
}

.timestamp {
    font-size: 0.875rem;
    color: #999;
}

.loading-more,
.end-message {
    text-align: center;
    padding: 2rem;
    color: #666;
}

.error {
    text-align: center;
    padding: 2rem;
    color: #e74c3c;
}

.error button {
    margin-top: 1rem;
    padding: 0.5rem 1rem;
    background: #e74c3c;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}
</style>
```

### Real-time Collaboration

```vue
<template>
    <div class="collaborative-editor">
        <div class="editor-header">
            <h2>Collaborative Document Editor</h2>
            <div class="connection-status" :class="{ connected: isConnected }">
                {{ isConnected ? "Connected" : "Disconnected" }}
            </div>
        </div>

        <div class="users-online">
            <h4>Online Users ({{ onlineUsers.length }})</h4>
            <div class="user-list">
                <div
                    v-for="user in onlineUsers"
                    :key="user.id"
                    class="user-badge"
                    :style="{ backgroundColor: user.color }"
                >
                    {{ user.name }}
                </div>
            </div>
        </div>

        <div class="editor-container">
            <textarea
                v-model="documentContent"
                @input="handleContentChange"
                @selectionchange="handleSelectionChange"
                class="editor"
                placeholder="Start typing..."
            />

            <div class="cursors-overlay">
                <div
                    v-for="cursor in otherUserCursors"
                    :key="cursor.userId"
                    class="remote-cursor"
                    :style="{
                        top: cursor.line * 20 + 'px',
                        left: cursor.column * 8 + 'px',
                        borderColor: cursor.color,
                    }"
                >
                    <span
                        class="cursor-label"
                        :style="{ backgroundColor: cursor.color }"
                    >
                        {{ cursor.userName }}
                    </span>
                </div>
            </div>
        </div>

        <div class="status-bar">
            <span>Lines: {{ lineCount }}</span>
            <span>Characters: {{ characterCount }}</span>
            <span
                >Last saved:
                {{ lastSaved ? formatTime(lastSaved) : "Never" }}</span
            >
        </div>
    </div>
</template>

<script setup>
import { debounce } from 'lodash-es'

interface User {
  id: string
  name: string
  color: string
}

interface CursorPosition {
  userId: string
  userName: string
  color: string
  line: number
  column: number
}

interface DocumentOperation {
  type: 'insert' | 'delete' | 'replace'
  position: number
  content?: string
  length?: number
  userId: string
  timestamp: number
}

interface CollaborationEvent {
  type: 'user_joined' | 'user_left' | 'document_operation' | 'cursor_moved' | 'document_saved'
  data: any
}

const documentContent = ref('')
const onlineUsers = ref<User[]>([])
const otherUserCursors = ref<CursorPosition[]>([])
const isConnected = ref(false)
const lastSaved = ref<number>()

// Document operations
const { execute: sendOperation } = useTauriInvoke('send_document_operation')
const { execute: saveDocument } = useTauriInvoke('save_document')

// Real-time collaboration events
const {
  data: collaborationEvent,
  startListening,
  stopListening,
  emit: emitEvent
} = useTauriEvent<CollaborationEvent>('collaboration')

// Load initial document
const {
  data: initialDocument,
  execute: loadDocument
} = useTauriInvoke<{ content: string, users: User[] }>('load_document', { documentId: 'doc1' }, { immediate: true })

// Watch for document load
watch(initialDocument, (doc) => {
  if (doc) {
    documentContent.value = doc.content
    onlineUsers.value = doc.users
    isConnected.value = true
  }
})

// Handle collaboration events
watch(collaborationEvent, (event) => {
  if (!event) return

  switch (event.type) {
    case 'user_joined':
      if (!onlineUsers.value.find(u => u.id === event.data.id)) {
        onlineUsers.value.push(event.data)
      }
      break

    case 'user_left':
      onlineUsers.value = onlineUsers.value.filter(u => u.id !== event.data.userId)
      otherUserCursors.value = otherUserCursors.value.filter(c => c.userId !== event.data.userId)
      break

    case 'document_operation':
      applyOperation(event.data)
      break

    case 'cursor_moved':
      updateUserCursor(event.data)
      break

    case 'document_saved':
      lastSaved.value = event.data.timestamp
      break
  }
})

const applyOperation = (operation: DocumentOperation) => {
  // Don't apply our own operations
  if (operation.userId === getCurrentUserId()) return

  const content = documentContent.value

  switch (operation.type) {
    case 'insert':
      documentContent.value =
        content.slice(0, operation.position) +
        operation.content +
        content.slice(operation.position)
      break

    case 'delete':
      documentContent.value =
        content.slice(0, operation.position) +
        content.slice(operation.position + (operation.length || 0))
      break

    case 'replace':
      documentContent.value =
        content.slice(0, operation.position) +
        operation.content +
        content.slice(operation.position + (operation.length || 0))
      break
  }
}

const updateUserCursor = (cursorData: CursorPosition) => {
  const existingIndex = otherUserCursors.value.findIndex(c => c.userId === cursorData.userId)

  if (existingIndex !== -1) {
    otherUserCursors.value[existingIndex] = cursorData
  } else {
    otherUserCursors.value.push(cursorData)
  }
}

const debouncedContentChange = debounce(async (newContent: string, oldContent: string) => {
  // Calculate the operation
  const operation = calculateOperation(oldContent, newContent)
  if (operation) {
    await sendOperation(operation)
  }
}, 200)

const handleContentChange = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  const oldContent = documentContent.value
  const newContent = target.value

  documentContent.value = newContent
  debouncedContentChange(newContent, oldContent)
}

const handleSelectionChange = debounce(async (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  const { selectionStart } = target
  const content = target.value

  // Calculate line and column
  const beforeCursor = content.slice(0, selectionStart)
  const line = beforeCursor.split('\n').length - 1
  const column = beforeCursor.split('\n').pop()?.length || 0

  await emitEvent({
    type: 'cursor_moved',
    data: {
      userId: getCurrentUserId(),
      userName: getCurrentUserName(),
      color: getCurrentUserColor(),
      line,
      column
    }
  })
}, 100)

const calculateOperation = (oldContent: string, newContent: string): DocumentOperation | null => {
  // Simple diff algorithm - in production, use a proper diff library
  if (newContent.length > oldContent.length) {
    // Content was inserted
    for (let i = 0; i < Math.min(oldContent.length, newContent.length); i++) {
      if (oldContent[i] !== newContent[i]) {
        return {
          type: 'insert',
          position: i,
          content: newContent.slice(i, i + (newContent.length - oldContent.length)),
          userId: getCurrentUserId(),
          timestamp: Date.now()
        }
      }
    }
    // Insertion at the end
    return {
      type: 'insert',
      position: oldContent.length,
      content: newContent.slice(oldContent.length),
      userId: getCurrentUserId(),
      timestamp: Date.now()
    }
  } else if (newContent.length < oldContent.length) {
    // Content was deleted
    for (let i = 0; i < Math.min(oldContent.length, newContent.length); i++) {
      if (oldContent[i] !== newContent[i]) {
        return {
          type: 'delete',
          position: i,
          length: oldContent.length - newContent.length,
          userId: getCurrentUserId(),
          timestamp: Date.now()
        }
      }
    }
    // Deletion at the end
    return {
      type: 'delete',
      position: newContent.length,
      length: oldContent.length - newContent.length,
      userId: getCurrentUserId(),
      timestamp: Date.now()
    }
  }

  return null
}

const lineCount = computed(() => documentContent.value.split('\n').length)
const characterCount = computed(() => documentContent.value.length)

// Auto-save
const debouncedSave = debounce(async () => {
  await saveDocument({ content: documentContent.value })
}, 2000)

watch(documentContent, debouncedSave)

// Helper functions (these would come from your auth system)
const getCurrentUserId = () => 'current-user-id'
const getCurrentUserName = () => 'Current User'
const getCurrentUserColor = () => '#3498db'

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString()
}

// Lifecycle
onMounted(async () => {
  await startListening()
})

onUnmounted(() => {
  stopListening()
})
</script>

<style scoped>
.collaborative-editor {
    max-width: 1000px;
    margin: 0 auto;
    padding: 2rem;
}

.editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.connection-status {
    padding: 0.5rem 1rem;
    border-radius: 20px;
    background: #e74c3c;
    color: white;
    font-size: 0.875rem;
}

.connection-status.connected {
    background: #27ae60;
}

.users-online {
    margin-bottom: 1rem;
}

.user-list {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
}

.user-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 15px;
    color: white;
    font-size: 0.875rem;
    font-weight: bold;
}

.editor-container {
    position: relative;
    margin-bottom: 1rem;
}

.editor {
    width: 100%;
    height: 400px;
    padding: 1rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-family: "Courier New", monospace;
    font-size: 14px;
    line-height: 20px;
    resize: vertical;
}

.cursors-overlay {
    position: absolute;
    top: 1rem;
    left: 1rem;
    pointer-events: none;
    z-index: 10;
}

.remote-cursor {
    position: absolute;
    width: 2px;
    height: 20px;
    border-left: 2px solid;
    animation: blink 1s infinite;
}

.cursor-label {
    position: absolute;
    top: -20px;
    left: -5px;
    padding: 2px 6px;
    font-size: 10px;
    color: white;
    border-radius: 3px;
    white-space: nowrap;
}

@keyframes blink {
    0%,
    50% {
        opacity: 1;
    }
    51%,
    100% {
        opacity: 0;
    }
}

.status-bar {
    display: flex;
    gap: 2rem;
    padding: 0.5rem;
    background: #f8f9fa;
    border-radius: 4px;
    font-size: 0.875rem;
    color: #666;
}
</style>
```

## Performance Optimization

### Command Caching

```typescript
// composables/useCachedInvoke.ts
interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number;
}

const cache = new Map<string, CacheEntry<any>>();

export function useCachedInvoke<T>(
    command: string,
    args?: Record<string, unknown>,
    options: { immediate?: boolean; ttl?: number } = {}
) {
    const { ttl = 300000 } = options; // Default 5 minutes
    const cacheKey = `${command}:${JSON.stringify(args)}`;

    const getCachedData = (): T | null => {
        const entry = cache.get(cacheKey);
        if (entry && Date.now() - entry.timestamp < entry.ttl) {
            return entry.data;
        }
        return null;
    };

    const setCachedData = (data: T) => {
        cache.set(cacheKey, {
            data,
            timestamp: Date.now(),
            ttl,
        });
    };

    const cachedData = getCachedData();
    const initialData = ref<T | null>(cachedData);

    const {
        data: fetchedData,
        pending,
        error,
        execute,
    } = useTauriInvoke<T>(command, args, {
        immediate: options.immediate && !cachedData,
    });

    // Update cache when new data is fetched
    watch(fetchedData, (newData) => {
        if (newData !== null) {
            setCachedData(newData);
            initialData.value = newData;
        }
    });

    const refresh = async () => {
        cache.delete(cacheKey);
        await execute();
    };

    return {
        data: computed(() => fetchedData.value ?? initialData.value),
        pending,
        error,
        execute,
        refresh,
    };
}
```

### Batch Operations

```typescript
// composables/useBatchOperations.ts
export function useBatchOperations() {
    const pendingOperations = ref<
        Array<{
            command: string;
            args: any;
            resolve: Function;
            reject: Function;
        }>
    >([]);
    const isProcessing = ref(false);

    const { execute: executeBatch } = useTauriInvoke(
        "execute_batch_operations"
    );

    const addOperation = <T>(command: string, args?: any): Promise<T> => {
        return new Promise((resolve, reject) => {
            pendingOperations.value.push({ command, args, resolve, reject });
            processBatch();
        });
    };

    const processBatch = debounce(async () => {
        if (isProcessing.value || pendingOperations.value.length === 0) return;

        isProcessing.value = true;
        const operations = [...pendingOperations.value];
        pendingOperations.value = [];

        try {
            const results = await executeBatch({
                operations: operations.map((op) => ({
                    command: op.command,
                    args: op.args,
                })),
            });

            operations.forEach((op, index) => {
                op.resolve(results[index]);
            });
        } catch (error) {
            operations.forEach((op) => {
                op.reject(error);
            });
        } finally {
            isProcessing.value = false;
        }
    }, 50);

    return {
        addOperation,
        isProcessing: readonly(isProcessing),
    };
}
```

## Testing Patterns

### Mocking for Unit Tests

```typescript
// tests/mocks/tauriMocks.ts
export const mockUseTauriInvoke = <T>(mockData: T, mockError?: Error) => {
    const data = ref<T | null>(mockData);
    const pending = ref(false);
    const error = ref<Error | null>(mockError || null);

    const execute = vi.fn().mockImplementation(async () => {
        pending.value = true;
        await new Promise((resolve) => setTimeout(resolve, 100));
        pending.value = false;

        if (mockError) {
            error.value = mockError;
        } else {
            data.value = mockData;
        }
    });

    return {
        data: readonly(data),
        pending: readonly(pending),
        error: readonly(error),
        execute,
        refresh: execute,
    };
};

export const mockUseTauriEvent = <T>() => {
    const data = ref<T | null>(null);
    const error = ref<Error | null>(null);

    const startListening = vi.fn();
    const stopListening = vi.fn();
    const emit = vi.fn();

    // Simulate receiving an event
    const simulateEvent = (eventData: T) => {
        data.value = eventData;
    };

    return {
        data: readonly(data),
        error: readonly(error),
        startListening,
        stopListening,
        emit,
        simulateEvent,
    };
};
```

These advanced patterns demonstrate how to build sophisticated, production-ready applications using Nuxt Tauri composables. They cover state management, real-time collaboration, performance optimization, and testing strategies.

## Next Steps

-   [Error Handling](/examples/error-handling) - Comprehensive error handling strategies
-   [API Reference](/api/use-tauri-invoke) - Detailed API documentation
