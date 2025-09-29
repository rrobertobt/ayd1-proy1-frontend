import { Component, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs/operators';
import { AuthService, SessionUser } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login-page',
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, ButtonModule],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly loading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly twoFactorStep = signal(false);
  protected readonly twoFactorInfo = signal('');
  protected readonly twoFactorError = signal('');
  protected readonly verifyingTwoFactor = signal(false);
  protected readonly resendingCode = signal(false);
  protected readonly pendingEmail = signal('');

  protected readonly loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  protected readonly twoFactorForm = this.fb.nonNullable.group({
    verification_code: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]],
  });

  protected onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.errorMessage.set('');
    this.twoFactorError.set('');
    this.loading.set(true);

    const credentials = this.loginForm.getRawValue();
    this.authService.login(credentials).subscribe({
      next: (result) => {
        this.loading.set(false);
        if (result.status === 'success') {
          this.navigateToHome(result.user);
          this.resetTwoFactorState();
        } else {
          this.twoFactorStep.set(true);
          this.pendingEmail.set(result.email);
          this.twoFactorForm.reset({ verification_code: '' });
          this.twoFactorInfo.set(
            result.message ?? 'Ingresa el código enviado a tu correo para continuar.'
          );
        }
      },
      error: (error) => {
        this.loading.set(false);
        const message = error?.message ?? 'No se pudo iniciar sesión. Inténtalo nuevamente.';
        this.errorMessage.set(message);
      },
    });
  }

  protected hasError(control: 'email' | 'password', error: string): boolean {
    const ctrl = this.loginForm.get(control);
    return !!ctrl && ctrl.hasError(error) && (ctrl.dirty || ctrl.touched);
  }

  protected twoFactorHasError(error: string): boolean {
    const ctrl = this.twoFactorForm.get('verification_code');
    return !!ctrl && ctrl.hasError(error) && (ctrl.dirty || ctrl.touched);
  }

  protected submitTwoFactor(): void {
    if (this.twoFactorForm.invalid) {
      this.twoFactorForm.markAllAsTouched();
      return;
    }

    this.twoFactorError.set('');
    this.verifyingTwoFactor.set(true);

    const payload = {
      email: this.pendingEmail(),
      verification_code: this.twoFactorForm.getRawValue().verification_code,
    };

    this.authService
      .verifyTwoFactor(payload)
      .pipe(finalize(() => this.verifyingTwoFactor.set(false)))
      .subscribe({
        next: (user) => {
          this.navigateToHome(user);
          this.resetTwoFactorState();
        },
        error: (error) => {
          const message =
            error?.message ?? 'No pudimos verificar el código. Inténtalo nuevamente.';
          this.twoFactorError.set(message);
        },
      });
  }

  protected resendTwoFactorCode(): void {
    if (!this.pendingEmail()) {
      return;
    }

    this.twoFactorError.set('');
    this.twoFactorInfo.set('');
    this.resendingCode.set(true);

    this.authService
      .resendTwoFactorCode({ email: this.pendingEmail() })
      .pipe(finalize(() => this.resendingCode.set(false)))
      .subscribe({
        next: (response) => {
          this.twoFactorInfo.set(response?.message ?? 'Enviamos un nuevo código a tu correo.');
        },
        error: (error) => {
          const message =
            error?.message ?? 'No se pudo reenviar el código. Inténtalo nuevamente.';
          this.twoFactorError.set(message);
        },
      });
  }

  protected restartLogin(): void {
    this.resetTwoFactorState();
    this.loginForm.reset({ email: '', password: '' });
    this.errorMessage.set('');
  }

  private navigateToHome(user: SessionUser): void {
    const targetRoute = this.authService.getHomeRouteForRole(user?.role);
    this.router.navigateByUrl(targetRoute);
  }

  private resetTwoFactorState(): void {
    this.twoFactorStep.set(false);
    this.pendingEmail.set('');
    this.twoFactorForm.reset({ verification_code: '' });
    this.twoFactorInfo.set('');
    this.twoFactorError.set('');
    this.verifyingTwoFactor.set(false);
    this.resendingCode.set(false);
  }
}
