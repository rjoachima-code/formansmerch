import html from "eslint-plugin-html";

export default [
    {
        files: ["**/*.html", "**/*.js"],
        plugins: { html },
        languageOptions: {
            globals: {
                window: "readonly", document: "readonly", localStorage: "readonly", alert: "readonly", confirm: "readonly", console: "readonly", Date: "readonly", Object: "readonly", setInterval: "readonly", clearInterval: "readonly", Math: "readonly", parseInt: "readonly", setTimeout: "readonly", URL: "readonly", Blob: "readonly", tailwind: "writable",
                switchTab: "readonly", populateSubAreas: "readonly", submitAudit: "readonly", logSOP: "readonly", exportCSV: "readonly", showOfflineModal: "readonly", downloadApp: "readonly", resetAppData: "readonly"
            }
        },
        rules: {
            "no-undef": "error",
            "no-unused-vars": ["error", { "varsIgnorePattern": "^(switchTab|populateSubAreas|submitAudit|logSOP|exportCSV|showOfflineModal|downloadApp|resetAppData)$" }]
        }
    }
];