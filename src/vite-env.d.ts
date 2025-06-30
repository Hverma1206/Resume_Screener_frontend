/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LAMBDA_URL: string;
  readonly VITE_NODEMAILER_URL: string;
  // add more env variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
