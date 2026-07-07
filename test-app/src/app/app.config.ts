import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideHotkeys } from 'angular2-hotkeys';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHotkeys({
      cheatSheetCloseEsc: true,
      cheatSheetDescription: 'Show / hide this help menu',
    }),
  ],
};
