import { Injectable } from '@angular/core';
import Swal from 'sweetalert2/dist/sweetalert2.esm.js';
import type { SweetAlertOptions, SweetAlertResult } from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class SweetAlertService {
  private readonly baseOptions: SweetAlertOptions = {
    background: '#161F30',
    color: '#E2E8F0',
    buttonsStyling: false,
    heightAuto: false,
    customClass: {
      popup: 'ae-alert-popup',
      title: 'ae-alert-title',
      htmlContainer: 'ae-alert-message',
      actions: 'ae-alert-actions',
      confirmButton: 'ae-alert-confirm',
      cancelButton: 'ae-alert-cancel'
    }
  };

  aceptar(
    title = '¡Acción completada!',
    text = 'La operación se realizó correctamente.'
  ): Promise<SweetAlertResult> {
    return this.fire({
      icon: 'success',
      iconColor: '#D4AF37',
      title,
      text,
      confirmButtonText: 'Aceptar'
    });
  }

  error(
    title = 'Ocurrió un error',
    text = 'No pudimos completar la operación. Inténtalo de nuevo.'
  ): Promise<SweetAlertResult> {
    return this.fire({
      icon: 'error',
      iconColor: '#FF5722',
      title,
      text,
      confirmButtonText: 'Entendido'
    });
  }

  warning(
    title = 'Atención',
    text = 'Revisa la información antes de continuar.'
  ): Promise<SweetAlertResult> {
    return this.fire({
      icon: 'warning',
      iconColor: '#FF8C00',
      title,
      text,
      confirmButtonText: 'Continuar'
    });
  }

  question(
    title = '¿Deseas continuar?',
    text = 'Confirma la acción para continuar.',
    options: SweetAlertOptions = {}
  ): Promise<SweetAlertResult> {
    return this.fire({
      ...options,
      icon: 'question',
      title,
      text,
      showCancelButton: true,
      confirmButtonText: 'Continuar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    });
  }

  async login(): Promise<string | null> {
    const result = await Swal.fire({
      ...this.baseOptions,
      title: 'Iniciar sesión',
      html: `
        <div class="ae-login-form">
          <label for="ae-login-email">Correo electrónico</label>
          <input id="ae-login-email" class="ae-login-input" type="email" autocomplete="email">
          <label for="ae-login-password">Contraseña</label>
          <input id="ae-login-password" class="ae-login-input" type="password" autocomplete="current-password">
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Entrar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      focusConfirm: false,
      preConfirm: () => {
        const emailInput = document.querySelector<HTMLInputElement>('#ae-login-email');
        const passwordInput = document.querySelector<HTMLInputElement>('#ae-login-password');
        const email = emailInput?.value.trim().toLowerCase() ?? '';
        const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

        if (!validEmail || !passwordInput?.value) {
          Swal.showValidationMessage('Ingresa un correo válido y una contraseña.');
          return false;
        }

        return email;
      }
    });

    if (result.isConfirmed && typeof result.value === 'string') {
      const email = result.value;
      const name = email
        .split('@')[0]
        .replace(/[._-]+/g, ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase());

      await this.aceptar(
        'Sesión local iniciada',
        `Hola, ${name}. Este acceso de demostración no verifica credenciales con un servidor.`
      );

      return email;
    }

    return null;
  }

  private fire(options: SweetAlertOptions): Promise<SweetAlertResult> {
    const mergedOptions = {
      ...this.baseOptions,
      ...options,
      customClass: {
        ...this.baseOptions.customClass,
        ...options.customClass
      }
    } as SweetAlertOptions;

    return Swal.fire(mergedOptions);
  }
}
