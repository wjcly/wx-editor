import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: `com.markdown.editor`,
  appName: `Markdown Editor`,
  webDir: `dist`,
  server: {
    androidScheme: `https`,
  },
  android: {
    buildOptions: {
      keystorePath: `release-key.keystore`,
      keystoreAlias: `key0`,
    },
  },
}

export default config
