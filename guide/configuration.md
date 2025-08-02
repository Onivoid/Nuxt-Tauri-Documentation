# Configuration

Nuxt Tauri works out of the box with zero configuration, but you can customize its behavior if needed.

## Default Configuration

The module automatically:

-   Registers the plugin for Tauri API availability
-   Auto-imports `useTauriInvoke` and `useTauriEvent` composables
-   Provides TypeScript support

## Module Options

Currently, the module doesn't require specific configuration options, but you can add the module to your `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
    modules: ["nuxt-module-tauri"],
    // Optional: Module-specific configuration (future versions)
    nuxtTauri: {
        // Configuration options will be added in future versions
    },
});
```

## Environment Detection

The composables automatically detect if they're running in a Tauri environment:

-   **In Tauri**: Full functionality available
-   **In Browser**: Graceful error handling with helpful error messages

```vue
<script setup>
const { data, error, execute } = useTauriInvoke("my_command");

// This will show an error in browser environment
// "Tauri API not available"
</script>
```

## TypeScript Configuration

For optimal TypeScript support, ensure your `tsconfig.json` includes:

```json
{
    "compilerOptions": {
        "moduleResolution": "node",
        "allowSyntheticDefaultImports": true,
        "esModuleInterop": true
    }
}
```

## Development vs Production

### Development

During development, you can test your Tauri commands:

```bash
# Start Nuxt development server
npm run dev

# In another terminal, start Tauri
cargo tauri dev
```

### Production

For production builds, ensure both Nuxt and Tauri are built:

```bash
# Build Nuxt
npm run build

# Build Tauri app
cargo tauri build
```

## Tauri Commands Setup

On the Rust side, ensure your commands are properly exposed:

```rust
use tauri::command;

#[command]
fn get_user(id: u32) -> Result<User, String> {
    // Your implementation
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

The following composables are automatically available without imports:

-   `useTauriInvoke`
-   `useTauriEvent`

If you need to import them manually:

```typescript
import { useTauriInvoke, useTauriEvent } from "#imports";
```

## Best Practices

### Error Handling

Always handle errors gracefully:

```vue
<script setup>
const { data, error, pending, execute } = useTauriInvoke("risky_command");

watchEffect(() => {
    if (error.value) {
        console.error("Command failed:", error.value);
        // Show user-friendly error message
    }
});
</script>
```

### Type Safety

Use TypeScript interfaces for better development experience:

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

## Troubleshooting

### Common Issues

1. **"Tauri API not available" error**: You're likely running in a browser environment. This is expected behavior.

2. **Commands not found**: Ensure your Rust commands are properly registered in the `invoke_handler`.

3. **TypeScript errors**: Make sure `@tauri-apps/api` is installed and up to date.

## Next Steps

-   [Learn about useTauriInvoke](/api/use-tauri-invoke)
-   [Learn about useTauriEvent](/api/use-tauri-event)
-   [Check out examples](/examples/basic-usage)
