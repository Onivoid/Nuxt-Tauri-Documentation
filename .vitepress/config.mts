import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: "Nuxt Tauri Documentation",
    description: "Vue composables for Tauri API in Nuxt applications",
    appearance: "force-dark", // Désactive le sélecteur de thème dark/light

    // Configuration SEO
    head: [
        // Favicon
        ["link", { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" }],
        ["link", { rel: "icon", href: "/favicon.ico" }],
        [
            "link",
            {
                rel: "apple-touch-icon",
                sizes: "180x180",
                href: "/apple-touch-icon.png",
            },
        ],

        // Open Graph / Facebook
        ["meta", { property: "og:type", content: "website" }],
        [
            "meta",
            {
                property: "og:title",
                content: "Nuxt Tauri - Vue Composables for Tauri",
            },
        ],
        [
            "meta",
            {
                property: "og:description",
                content:
                    "Seamlessly integrate Tauri API into your Nuxt applications with reactive composables. Zero configuration, TypeScript ready.",
            },
        ],
        [
            "meta",
            {
                property: "og:image",
                content: "https://nuxt-tauri-docs.vercel.app/og-image.svg",
            },
        ],
        [
            "meta",
            {
                property: "og:url",
                content: "https://nuxt-tauri-docs.vercel.app",
            },
        ],
        [
            "meta",
            { property: "og:site_name", content: "Nuxt Tauri Documentation" },
        ],

        // Twitter Card
        ["meta", { name: "twitter:card", content: "summary_large_image" }],
        [
            "meta",
            {
                name: "twitter:title",
                content: "Nuxt Tauri - Vue Composables for Tauri",
            },
        ],
        [
            "meta",
            {
                name: "twitter:description",
                content:
                    "Seamlessly integrate Tauri API into your Nuxt applications with reactive composables.",
            },
        ],
        [
            "meta",
            {
                name: "twitter:image",
                content: "https://nuxt-tauri-docs.vercel.app/og-image.svg",
            },
        ],

        // SEO Meta tags
        [
            "meta",
            {
                name: "keywords",
                content:
                    "nuxt, tauri, vue, composables, desktop, app, rust, typescript, reactive, api, integration",
            },
        ],
        ["meta", { name: "author", content: "Onivoid" }],
        ["meta", { name: "robots", content: "index, follow" }],

        // Theme color
        ["meta", { name: "theme-color", content: "#646cff" }],

        // Canonical URL
        [
            "link",
            { rel: "canonical", href: "https://nuxt-tauri-docs.vercel.app" },
        ],

        // Schema.org structured data for SEO
        [
            "script",
            { type: "application/ld+json" },
            JSON.stringify({
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                name: "Nuxt Tauri",
                description:
                    "Vue composables for Tauri API in Nuxt applications",
                url: "https://nuxt-tauri-docs.vercel.app",
                applicationCategory: "DeveloperApplication",
                operatingSystem: "Cross-platform",
                programmingLanguage: ["TypeScript", "Vue", "Rust"],
                author: {
                    "@type": "Person",
                    name: "Onivoid",
                },
                offers: {
                    "@type": "Offer",
                    price: "0",
                    priceCurrency: "USD",
                },
            }),
        ],
    ],

    // Sitemap pour le SEO
    sitemap: {
        hostname: "https://nuxt-tauri-docs.vercel.app",
    },

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
