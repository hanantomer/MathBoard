/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TURN_URL?: string;
  readonly VITE_TURN_USERNAME?: string;
  readonly VITE_TURN_CREDENTIAL?: string;
  readonly VITE_GA_MEASUREMENT_ID?: string;
  readonly VITE_AW_ID?: string;
  readonly VITE_AW_CONV_START_PRACTICE?: string;
  readonly VITE_AW_CONV_SUBSCRIBE?: string;
  readonly VITE_AW_CONV_TEACHER_SIGNUP?: string;
  readonly VITE_AW_CONV_STUDENT_SIGNUP?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  fbq?: (...args: unknown[]) => void;
  _fbq?: unknown;
  gtag?: (...args: unknown[]) => void;
  dataLayer?: unknown[];
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
