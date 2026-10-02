/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL for the DevPath API, e.g. http://localhost:5000/api */
  readonly VITE_API_URL?: string;
  /** Enables the client-side safe sandbox used by the coding playground. */
  readonly VITE_ENABLE_MOCK_SANDBOX?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
