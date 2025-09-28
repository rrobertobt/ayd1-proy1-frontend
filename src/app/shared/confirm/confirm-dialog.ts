import { Component } from '@angular/core';
import { NgIf, AsyncPipe } from '@angular/common';
import { ConfirmService } from './confirm.service';

@Component({
  standalone: true,
  selector: 'app-confirm-dialog',
  imports: [NgIf, AsyncPipe],
  template: `
  <div *ngIf="svc.visible$ | async" class="fixed inset-0 z-[100]">
    <div class="absolute inset-0 bg-black/40" (click)="svc.confirm(false)"></div>
    <div class="absolute inset-0 flex items-center justify-center p-4">
      <div class="w-full max-w-md rounded-2xl bg-white shadow-xl border">
        <div class="px-5 py-4">
          <h3 class="text-lg font-semibold">
            {{ (svc.options$ | async)?.title }}
          </h3>
          <p class="mt-2 text-sm text-slate-600">
            {{ (svc.options$ | async)?.message }}
          </p>
        </div>
        <div class="px-5 py-3 flex justify-end gap-3 border-t">
          <button class="px-4 py-2 rounded-md border hover:bg-slate-50 cursor-pointer"
                  (click)="svc.confirm(false)">
            {{ (svc.options$ | async)?.cancelText || 'Cancel' }}
          </button>
          <button class="px-4 py-2 rounded-md text-white cursor-pointer"
                  [class.bg-red-600]="(svc.options$ | async)?.danger"
                  [class.hover\:bg-red-700]="(svc.options$ | async)?.danger"
                  [class.bg-indigo-600]="!(svc.options$ | async)?.danger"
                  [class.hover\:bg-indigo-700]="!(svc.options$ | async)?.danger"
                  (click)="svc.confirm(true)">
            {{ (svc.options$ | async)?.confirmText || 'Confirm' }}
          </button>
        </div>
      </div>
    </div>
  </div>
  `,
})
export class ConfirmDialog {
  constructor(public svc: ConfirmService) {}
}
