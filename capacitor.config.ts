import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.your.appid', // (whatever yours is)
  appName: 'solsapp',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  }
};

export default config;