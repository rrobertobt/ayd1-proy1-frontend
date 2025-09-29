import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ConfirmOptions = {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
};

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private resolver?: (ok: boolean) => void;

  visible$ = new BehaviorSubject<boolean>(false);
  options$ = new BehaviorSubject<ConfirmOptions>({
    title: 'Confirm',
    message: 'Are you sure?',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    danger: false,
  });

  open(opts?: ConfirmOptions): Promise<boolean> {
    this.options$.next({ ...this.options$.value, ...(opts || {}) });
    this.visible$.next(true);
    return new Promise<boolean>((resolve) => {
      this.resolver = resolve;
    });
  }

  confirm(ok: boolean) {
    this.visible$.next(false);
    this.resolver?.(ok);
    this.resolver = undefined;
  }
}
