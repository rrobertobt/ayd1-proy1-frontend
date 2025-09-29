import { Component, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';
import { InputTextModule } from 'primeng/inputtext';
import { IftaLabelModule } from 'primeng/iftalabel';
import { MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs/operators';
import { NgIf } from '@angular/common';

const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const newPassword = control.get('new_password')?.value;
  const confirmPassword = control.get('confirm_password')?.value;

  if (!newPassword || !confirmPassword) {
    return null;
  }

  return newPassword === confirmPassword ? null : { passwordMismatch: true };
};

@Component({
  selector: 'app-admin-profile-page',
  imports: [ReactiveFormsModule, InputTextModule, IftaLabelModule, Toast, ButtonModule, NgIf],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.css',
  providers: [MessageService],
})
export class AdminProfilePage implements OnInit {
  private readonly fb = inject(FormBuilder);
  protected readonly submitting = signal(false);
  protected readonly enablingTwoFactor = signal(false);
  protected readonly requestingDisableTwoFactor = signal(false);
  protected readonly confirmingDisableTwoFactor = signal(false);
  protected readonly disableCodeSent = signal(false);
  protected readonly changePasswordForm = this.fb.nonNullable.group(
    {
      current_password: ['', [Validators.required]],
      new_password: ['', [Validators.required, Validators.minLength(8)]],
      confirm_password: ['', [Validators.required]],
    },
    { validators: passwordMatchValidator }
  );
  protected readonly enableTwoFactorForm = this.fb.nonNullable.group({
    password: ['', [Validators.required]],
  });
  protected readonly disableTwoFactorRequestForm = this.fb.nonNullable.group({
    password: ['', [Validators.required]],
  });
  protected readonly disableTwoFactorConfirmForm = this.fb.nonNullable.group({
    verification_code: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]],
  });

  constructor(readonly authService: AuthService, private readonly messageService: MessageService) {}

  ngOnInit(): void {
    this.authService.restoreSession();
  }

  protected submitChangePassword(): void {
    if (this.changePasswordForm.invalid) {
      this.changePasswordForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    const payload = this.changePasswordForm.getRawValue();

    this.authService
      .changePassword(payload)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => {
          this.changePasswordForm.reset({
            current_password: '',
            new_password: '',
            confirm_password: '',
          });
          this.messageService.add({
            severity: 'success',
            summary: 'Contraseña actualizada',
            detail: 'Tu contraseña se actualizó correctamente.',
          });
        },
        error: (error) => {
          const detail =
            error?.message ?? 'No se pudo actualizar la contraseña. Inténtalo nuevamente.';
          this.messageService.add({ severity: 'error', summary: 'Error', detail });
        },
      });
  }
  protected controlHasError(
    controlName: 'current_password' | 'new_password' | 'confirm_password',
    error: string
  ): boolean {
    const control = this.changePasswordForm.get(controlName);
    return !!control && control.hasError(error) && (control.dirty || control.touched);
  }

  protected enableTwoFactorControlHasError(error: string): boolean {
    const control = this.enableTwoFactorForm.get('password');
    return !!control && control.hasError(error) && (control.dirty || control.touched);
  }

  protected disableTwoFactorRequestControlHasError(error: string): boolean {
    const control = this.disableTwoFactorRequestForm.get('password');
    return !!control && control.hasError(error) && (control.dirty || control.touched);
  }

  protected disableTwoFactorConfirmControlHasError(error: string): boolean {
    const control = this.disableTwoFactorConfirmForm.get('verification_code');
    return !!control && control.hasError(error) && (control.dirty || control.touched);
  }

  protected shouldShowPasswordMismatch(): boolean {
    const confirmControl = this.changePasswordForm.get('confirm_password');
    if (!confirmControl) return false;

    return (
      (confirmControl.dirty || confirmControl.touched) &&
      this.changePasswordForm.hasError('passwordMismatch')
    );
  }

  protected get isTwoFactorEnabled(): boolean {
    return !!this.authService.user()?.two_factor_enabled;
  }

  protected submitEnableTwoFactor(): void {
    if (this.enableTwoFactorForm.invalid) {
      this.enableTwoFactorForm.markAllAsTouched();
      return;
    }

    if (this.isTwoFactorEnabled) {
      this.messageService.add({
        severity: 'info',
        summary: 'Ya activado',
        detail: 'La autenticación de dos factores ya está activa en tu cuenta.',
      });
      return;
    }

    this.enablingTwoFactor.set(true);
    const payload = this.enableTwoFactorForm.getRawValue();

    this.authService
      .enableTwoFactor(payload)
      .pipe(finalize(() => this.enablingTwoFactor.set(false)))
      .subscribe({
        next: () => {
          this.enableTwoFactorForm.reset({ password: '' });
          this.disableTwoFactorRequestForm.reset({ password: '' });
          this.disableTwoFactorConfirmForm.reset({ verification_code: '' });
          this.disableCodeSent.set(false);
          this.messageService.add({
            severity: 'success',
            summary: '2FA activada',
            detail: 'La autenticación de dos factores se activó correctamente.',
          });
        },
        error: (error) => {
          const detail =
            error?.message ?? 'No se pudo activar la autenticación de dos factores.';
          this.messageService.add({ severity: 'error', summary: 'Error', detail });
        },
      });
  }

  protected submitDisableTwoFactorRequest(): void {
    if (this.disableTwoFactorRequestForm.invalid) {
      this.disableTwoFactorRequestForm.markAllAsTouched();
      return;
    }

    if (!this.isTwoFactorEnabled) {
      this.messageService.add({
        severity: 'info',
        summary: '2FA no activa',
        detail: 'La autenticación de dos factores no está activa.',
      });
      return;
    }

    this.requestingDisableTwoFactor.set(true);
    const payload = this.disableTwoFactorRequestForm.getRawValue();

    this.authService
      .requestDisableTwoFactor(payload)
      .pipe(finalize(() => this.requestingDisableTwoFactor.set(false)))
      .subscribe({
        next: (response) => {
          this.disableCodeSent.set(response.code_sent ?? false);
          if (response.code_sent) {
            this.messageService.add({
              severity: 'success',
              summary: 'Código enviado',
              detail: response.message || 'Revisa tu correo e ingresa el código recibido.',
            });
          } else {
            this.messageService.add({
              severity: 'warn',
              summary: 'No se envió código',
              detail: response.message || 'No fue posible enviar el código. Intenta nuevamente.',
            });
          }
        },
        error: (error) => {
          const detail =
            error?.message ?? 'No se pudo solicitar la desactivación de dos factores.';
          this.messageService.add({ severity: 'error', summary: 'Error', detail });
        },
      });
  }

  protected submitDisableTwoFactorConfirm(): void {
    if (!this.disableCodeSent()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Solicita el código primero',
        detail: 'Debes solicitar el código de verificación antes de confirmarlo.',
      });
      return;
    }

    if (this.disableTwoFactorConfirmForm.invalid) {
      this.disableTwoFactorConfirmForm.markAllAsTouched();
      return;
    }

    this.confirmingDisableTwoFactor.set(true);
    const payload = this.disableTwoFactorConfirmForm.getRawValue();

    this.authService
      .confirmDisableTwoFactor(payload)
      .pipe(finalize(() => this.confirmingDisableTwoFactor.set(false)))
      .subscribe({
        next: () => {
          this.disableTwoFactorRequestForm.reset({ password: '' });
          this.disableTwoFactorConfirmForm.reset({ verification_code: '' });
          this.disableCodeSent.set(false);
          this.messageService.add({
            severity: 'success',
            summary: '2FA desactivada',
            detail: 'La autenticación de dos factores se desactivó correctamente.',
          });
        },
        error: (error) => {
          const detail =
            error?.message ?? 'No se pudo desactivar la autenticación de dos factores.';
          this.messageService.add({ severity: 'error', summary: 'Error', detail });
        },
      });
  }
}
