import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: "Nuxt Tauri Documentation",
    description: "Vue composables for Tauri API in Nuxt applications",
    locales: {
        root: {
            label: "🇬🇧 English",
            lang: "en",
            title: "Nuxt Tauri",
            description: "Vue composables for Tauri API in Nuxt applications",
            themeConfig: {
                nav: [
                    { text: "Guide", link: "/guide/getting-started" },
                    { text: "API Reference", link: "/api/use-tauri-invoke" },
                    { text: "Examples", link: "/examples/basic-usage" },
                ],
                sidebar: {
                    "/guide/": [
                        {
                            text: "Guide",
                            items: [
                                {
                                    text: "Getting Started",
                                    link: "/guide/getting-started",
                                },
                                {
                                    text: "Installation",
                                    link: "/guide/installation",
                                },
                                {
                                    text: "Configuration",
                                    link: "/guide/configuration",
                                },
                            ],
                        },
                    ],
                    "/api/": [
                        {
                            text: "API Reference",
                            items: [
                                {
                                    text: "useTauriInvoke",
                                    link: "/api/use-tauri-invoke",
                                },
                                {
                                    text: "useTauriEvent",
                                    link: "/api/use-tauri-event",
                                },
                            ],
                        },
                    ],
                    "/examples/": [
                        {
                            text: "Examples",
                            items: [
                                {
                                    text: "Basic Usage",
                                    link: "/examples/basic-usage",
                                },
                                {
                                    text: "Advanced Patterns",
                                    link: "/examples/advanced-patterns",
                                },
                                {
                                    text: "Error Handling",
                                    link: "/examples/error-handling",
                                },
                            ],
                        },
                    ],
                },
            },
        },
        fr: {
            label: "🇫🇷 Français",
            lang: "fr",
            title: "Nuxt Tauri",
            description:
                "Composables Vue pour l'API Tauri dans les applications Nuxt",
            themeConfig: {
                nav: [
                    { text: "Guide", link: "/fr/guide/getting-started" },
                    { text: "Référence API", link: "/fr/api/use-tauri-invoke" },
                    { text: "Exemples", link: "/fr/examples/basic-usage" },
                ],
                sidebar: {
                    "/fr/guide/": [
                        {
                            text: "Guide",
                            items: [
                                {
                                    text: "Démarrage",
                                    link: "/fr/guide/getting-started",
                                },
                                {
                                    text: "Installation",
                                    link: "/fr/guide/installation",
                                },
                                {
                                    text: "Configuration",
                                    link: "/fr/guide/configuration",
                                },
                            ],
                        },
                    ],
                    "/fr/api/": [
                        {
                            text: "Référence API",
                            items: [
                                {
                                    text: "useTauriInvoke",
                                    link: "/fr/api/use-tauri-invoke",
                                },
                                {
                                    text: "useTauriEvent",
                                    link: "/fr/api/use-tauri-event",
                                },
                            ],
                        },
                    ],
                    "/fr/examples/": [
                        {
                            text: "Exemples",
                            items: [
                                {
                                    text: "Utilisation de base",
                                    link: "/fr/examples/basic-usage",
                                },
                                {
                                    text: "Modèles avancés",
                                    link: "/fr/examples/advanced-patterns",
                                },
                                {
                                    text: "Gestion d'erreurs",
                                    link: "/fr/examples/error-handling",
                                },
                            ],
                        },
                    ],
                },
            },
        },
    },
    markdown: {
        theme: "catppuccin-mocha", // Thème sombre par défaut
    },
    themeConfig: {
        logo: "https://svgl.app/library/nuxt.svg",
        socialLinks: [
            {
                icon: "github",
                link: "https://github.com/Onivoid/nuxt-module-tauri",
            },
        ],
    },
});
