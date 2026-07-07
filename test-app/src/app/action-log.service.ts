import { Injectable, signal } from '@angular/core';

/**
 * Shared activity log for the zoneless demo so every use-case component
 * can report what a shortcut did without coupling to the root template.
 */
@Injectable({ providedIn: 'root' })
export class ActionLogService {
  readonly lastAction = signal<string>('(none yet — try a shortcut below)');
  readonly toast = signal<string | null>(null);

  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  log(message: string): void {
    this.lastAction.set(message);
    this.toast.set(message);
    console.log('[hotkeys demo]', message);
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }
    this.toastTimer = setTimeout(() => this.toast.set(null), 1800);
  }
}
