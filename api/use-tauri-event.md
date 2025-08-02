# useTauriEvent

The `useTauriEvent` composable provides a reactive interface for listening to and emitting Tauri events, enabling real-time communication between your Rust backend and Vue frontend.

## Signature

```typescript
function useTauriEvent<T = unknown>(eventName: string): TauriEventReturn<T>;
```

## Parameters

### `eventName`

-   **Type**: `string`
-   **Required**: Yes
-   **Description**: The name of the Tauri event to listen for

## Return Value

The composable returns an object with the following properties:

### `data`

-   **Type**: `Readonly<Ref<T | null>>`
-   **Description**: Reactive reference containing the last received event payload

### `error`

-   **Type**: `Readonly<Ref<Error | null>>`
-   **Description**: Reactive reference containing any error that occurred

### `startListening`

-   **Type**: `() => Promise<void>`
-   **Description**: Function to start listening for events

### `stopListening`

-   **Type**: `() => void`
-   **Description**: Function to stop listening for events

### `emit`

-   **Type**: `(payload: T) => Promise<void>`
-   **Description**: Function to emit an event with the given payload

## Usage Examples

### Basic Event Listening

```vue
<template>
    <div>
        <h3>Event Listener</h3>

        <div>
            <button @click="startListening">Start Listening</button>
            <button @click="stopListening">Stop Listening</button>
        </div>

        <div v-if="error" class="error">Error: {{ error.message }}</div>

        <div v-if="data">
            <h4>Last Event Received:</h4>
            <pre>{{ JSON.stringify(data, null, 2) }}</pre>
        </div>
    </div>
</template>

<script setup>
const { data, error, startListening, stopListening } =
    useTauriEvent("my-event");
</script>
```

### Event Emission

```vue
<template>
    <div>
        <h3>Send Events</h3>

        <input v-model="message" placeholder="Enter message" />
        <button @click="sendMessage" :disabled="!message">Send Event</button>

        <div v-if="error" class="error">Error: {{ error.message }}</div>
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

### Typed Events with TypeScript

```vue
<template>
    <div>
        <h3>Chat Application</h3>

        <div class="chat-controls">
            <button @click="startListening">Connect</button>
            <button @click="stopListening">Disconnect</button>
        </div>

        <div class="chat-messages">
            <div v-for="msg in messages" :key="msg.id" class="message">
                <strong>{{ msg.user }}:</strong> {{ msg.text }}
                <small>{{
                    new Date(msg.timestamp).toLocaleTimeString()
                }}</small>
            </div>
        </div>

        <div class="chat-input">
            <input
                v-model="newMessage"
                @keyup.enter="sendMessage"
                placeholder="Type a message..."
            />
            <button @click="sendMessage">Send</button>
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

// Watch for new messages
watch(receivedMessage, (message) => {
  if (message) {
    messages.value.push(message)
  }
})

const sendMessage = async () => {
  if (newMessage.value.trim()) {
    const message: ChatMessage = {
      id: Date.now().toString(),
      user: 'You',
      text: newMessage.value,
      timestamp: Date.now()
    }

    await emit(message)
    newMessage.value = ''
  }
}

// Auto-connect when component mounts
onMounted(() => {
  startListening()
})
</script>
```

### File System Watcher

```vue
<template>
    <div>
        <h3>File System Watcher</h3>

        <div>
            <button @click="startWatching">Start Watching</button>
            <button @click="stopWatching">Stop Watching</button>
        </div>

        <div v-if="error" class="error">Error: {{ error.message }}</div>

        <div v-if="fileEvent">
            <h4>File System Event:</h4>
            <p><strong>Action:</strong> {{ fileEvent.action }}</p>
            <p><strong>File:</strong> {{ fileEvent.path }}</p>
            <p>
                <strong>Time:</strong>
                {{ new Date(fileEvent.timestamp).toLocaleString() }}
            </p>
        </div>

        <div class="recent-events">
            <h4>Recent Events:</h4>
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

// Track recent events
watch(fileEvent, (event) => {
  if (event) {
    recentEvents.value.unshift(event)
    // Keep only last 10 events
    if (recentEvents.value.length > 10) {
      recentEvents.value = recentEvents.value.slice(0, 10)
    }
  }
})
</script>
```

### Progress Tracking

```vue
<template>
    <div>
        <h3>Download Progress</h3>

        <button @click="startDownload" :disabled="isDownloading">
            Start Download
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
            Download failed: {{ error.message }}
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

  // Emit download start command
  await emit({ action: 'start', url: 'https://example.com/file.zip' })
}

// Watch for download completion
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

## Lifecycle Management

The composable automatically handles cleanup:

```vue
<script setup>
const { startListening, stopListening } = useTauriEvent("my-event");

// Start listening when component mounts
onMounted(() => {
    startListening();
});

// Cleanup is automatic when component unmounts
// No need to manually call stopListening in onUnmounted
</script>
```

## Error Handling

Handle different types of errors:

```vue
<script setup>
const { error, startListening } = useTauriEvent("my-event");

watchEffect(() => {
    if (error.value) {
        if (error.value.message.includes("Tauri API not available")) {
            console.log("Running in browser mode - events disabled");
        } else {
            console.error("Event error:", error.value);
            // Maybe show a user notification
        }
    }
});
</script>
```

## Best Practices

### 1. Use TypeScript for Event Payloads

Define interfaces for your event data:

```typescript
interface UserAction {
    type: "login" | "logout" | "register";
    userId: string;
    timestamp: number;
}

const { data, emit } = useTauriEvent<UserAction>("user-action");
```

### 2. Handle Connection States

Provide feedback about listening state:

```vue
<template>
    <div>
        <span class="status" :class="{ listening: isListening }">
            {{ isListening ? "Connected" : "Disconnected" }}
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

### 3. Debounce Rapid Events

For high-frequency events, consider debouncing:

```vue
<script setup>
import { debounce } from "lodash-es";

const { data } = useTauriEvent("mouse-position");

const debouncedHandler = debounce((position) => {
    // Handle position update
    console.log("Mouse position:", position);
}, 100);

watch(data, debouncedHandler);
</script>
```

### 4. Validate Event Data

Always validate incoming event data:

```vue
<script setup>
const { data } = useTauriEvent("user-data");

watch(data, (userData) => {
    if (userData && typeof userData === "object" && "id" in userData) {
        // Data is valid
        handleUserData(userData);
    } else {
        console.warn("Invalid user data received:", userData);
    }
});
</script>
```

## Rust Backend Integration

### Emitting Events from Rust

```rust
use tauri::{AppHandle, Manager};

#[tauri::command]
fn process_data(app: AppHandle) -> Result<(), String> {
    // Do some processing...

    // Emit event to frontend
    app.emit_all("data-processed", ProcessedData {
        id: 123,
        result: "Success".to_string(),
        timestamp: chrono::Utc::now().timestamp(),
    }).map_err(|e| e.to_string())?;

    Ok(())
}
```

### Listening to Events in Rust

```rust
use tauri::{Manager, Window};

fn setup_event_listeners(app: &mut tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    let window = app.get_window("main").unwrap();

    window.listen("user-action", |event| {
        println!("Received user action: {:?}", event.payload());
        // Handle the event
    });

    Ok(())
}
```

## Related

-   [useTauriInvoke](/api/use-tauri-invoke) - For executing Tauri commands
-   [Examples](/examples/basic-usage) - See more usage examples
