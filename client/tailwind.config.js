/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "rgb(var(--color-primary) / <alpha-value>)",
                "primary-dark": "rgb(var(--color-primary-dark) / <alpha-value>)",
                "primary-light": "rgb(var(--color-primary-light) / <alpha-value>)",
                background: "rgb(var(--color-background) / <alpha-value>)",
                surface: "rgb(var(--color-surface) / <alpha-value>)",
                "text-main": "rgb(var(--color-text-main) / <alpha-value>)",
                "text-muted": "rgb(var(--color-text-muted) / <alpha-value>)",
                border: "rgb(var(--color-border) / <alpha-value>)",
                success: "rgb(var(--color-success) / <alpha-value>)",
                danger: "rgb(var(--color-danger) / <alpha-value>)",
                warning: "rgb(var(--color-warning) / <alpha-value>)",
            },
            borderRadius: {
                sm: "var(--radius-sm)",
                md: "var(--radius-md)",
                lg: "var(--radius-lg)",
                xl: "var(--radius-xl)",
            },
        },
    },
    plugins: [],
}
