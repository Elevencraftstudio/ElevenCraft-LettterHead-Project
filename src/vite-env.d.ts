/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMeta {
  readonly env: {
    readonly VITE_GEMINI_API_KEY?: string;
    readonly VITE_OPENAI_API_KEY?: string;
    readonly GEMINI_API_KEY?: string;
    readonly MODE: string;
    readonly BASE_URL: string;
    readonly PROD: boolean;
    readonly DEV: boolean;
    [key: string]: string | boolean | undefined;
  };
}
