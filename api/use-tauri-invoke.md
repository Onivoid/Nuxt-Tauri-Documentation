# useTauriInvoke

The `useTauriInvoke` composable allows you to execute Tauri commands with reactive state management, providing a seamless bridge between your Vue frontend and Rust backend.

## Signature

```typescript
function useTauriInvoke<T = unknown>(
    command: string,
    args?: Record<string, unknown>,
    options?: { immediate?: boolean }
): TauriInvokeReturn<T>;
```

## Parameters

### `command`

-   **Type**: `string`
-   **Required**: Yes
-   **Description**: The name of the Tauri command to invoke

### `args`

-   **Type**: `Record<string, unknown>`
-   **Required**: No
-   **Default**: `undefined`
-   **Description**: Arguments to pass to the Tauri command

### `options`

-   **Type**: `{ immediate?: boolean }`
-   **Required**: No
-   **Default**: `{ immediate: false }`
-   **Description**: Configuration options for the composable

#### `options.immediate`

-   **Type**: `boolean`
-   **Default**: `false`
-   **Description**: Whether to execute the command immediately when the composable is created

## Return Value

The composable returns an object with the following properties:

### `data`

-   **Type**: `Readonly<Ref<T | null>>`
-   **Description**: Reactive reference containing the command result

### `pending`

-   **Type**: `Readonly<Ref<boolean>>`
-   **Description**: Reactive reference indicating if the command is currently executing

### `error`

-   **Type**: `Readonly<Ref<Error | null>>`
-   **Description**: Reactive reference containing any error that occurred during execution

### `execute`

-   **Type**: `() => Promise<void>`
-   **Description**: Function to manually execute the command

### `refresh`

-   **Type**: `() => Promise<void>`
-   **Description**: Alias for the `execute` function

## Usage Examples

### Basic Usage

```vue
<template>
    <div>
        <button @click="execute" :disabled="pending">
            {{ pending ? "Loading..." : "Get Data" }}
        </button>

        <div v-if="error" class="error">Error: {{ error.message }}</div>

        <div v-if="data">Result: {{ data }}</div>
    </div>
</template>

<script setup>
const { data, pending, error, execute } = useTauriInvoke("get_app_version");
</script>
```

### With Arguments

```vue
<template>
    <div>
        <input v-model="userId" type="number" placeholder="User ID" />
        <button @click="fetchUser" :disabled="pending">
            {{ pending ? "Loading..." : "Fetch User" }}
        </button>

        <div v-if="error" class="error">Error: {{ error.message }}</div>

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

### With TypeScript

```vue
<template>
    <div>
        <button @click="execute" :disabled="pending">Get User</button>

        <!-- TypeScript ensures data is properly typed -->
        <div v-if="data">
            <h3>{{ data.name }}</h3>
            <p>{{ data.email }}</p>
            <span>{{ data.isActive ? "Active" : "Inactive" }}</span>
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

### Immediate Execution

```vue
<template>
    <div>
        <!-- Data loads immediately when component mounts -->
        <div v-if="pending">Loading configuration...</div>

        <div v-if="error" class="error">
            Failed to load configuration: {{ error.message }}
        </div>

        <div v-if="data">
            <h3>App Configuration</h3>
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

### Error Handling

```vue
<template>
    <div>
        <button @click="execute" :disabled="pending">Risky Operation</button>

        <div v-if="error" class="error">
            <h4>Operation Failed</h4>
            <p>{{ error.message }}</p>
            <button @click="execute">Retry</button>
        </div>

        <div v-if="data" class="success">Operation completed successfully!</div>
    </div>
</template>

<script setup>
const { data, pending, error, execute } = useTauriInvoke("risky_operation");

// Watch for errors and handle them
watchEffect(() => {
    if (error.value) {
        console.error("Operation failed:", error.value);

        // You could also show a toast notification
        // showToast({ type: 'error', message: error.value.message })
    }
});
</script>
```

### Reactive Arguments

```vue
<template>
    <div>
        <input v-model="searchQuery" placeholder="Search..." />
        <button @click="search" :disabled="pending || !searchQuery">
            Search
        </button>

        <div v-if="pending">Searching...</div>

        <div v-if="results">
            <h3>{{ results.length }} results found</h3>
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

## Error Handling

The composable automatically catches and handles errors:

-   **Tauri API not available**: When running in a browser environment
-   **Command not found**: When the Rust command doesn't exist
-   **Command execution errors**: Any errors thrown by your Rust command

```typescript
// Example of handling specific error types
watchEffect(() => {
    if (error.value) {
        if (error.value.message.includes("Tauri API not available")) {
            console.log("Running in browser mode");
        } else if (error.value.message.includes("command not found")) {
            console.error("Rust command not registered");
        } else {
            console.error("Command execution error:", error.value);
        }
    }
});
```

## Best Practices

### 1. Use TypeScript

Always provide type parameters for better development experience:

```typescript
const { data } = useTauriInvoke<MyDataType>("my_command");
```

### 2. Handle Loading States

Always provide feedback during command execution:

```vue
<button :disabled="pending">
  {{ pending ? 'Loading...' : 'Execute' }}
</button>
```

### 3. Handle Errors Gracefully

Provide meaningful error messages to users:

```vue
<div v-if="error" class="error">
  Something went wrong. Please try again.
</div>
```

### 4. Use Computed Arguments

For reactive arguments, use computed properties:

```typescript
const args = computed(() => ({ id: userId.value }));
const { data } = useTauriInvoke("get_user", args);
```

## Related

-   [useTauriEvent](/api/use-tauri-event) - For listening to Tauri events
-   [Examples](/examples/basic-usage) - See more usage examples
