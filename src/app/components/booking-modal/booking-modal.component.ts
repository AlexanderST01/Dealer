import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';

import { type InventoryCar } from '../../core/services/car-inventory.service';
import { SweetAlertService } from '../../core/services/sweet-alert.service';

interface BookingDraft {
  readonly fullName: string;
  readonly phone: string;
  readonly email: string;
  readonly comment: string;
}

type BookingField = keyof BookingDraft;

@Component({
  selector: 'app-booking-modal',
  standalone: true,
  templateUrl: './booking-modal.component.html',
  styleUrl: './booking-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookingModalComponent {
  readonly selectedCar = input<InventoryCar | null>(null);
  readonly closed = output<void>();

  private readonly sweetAlert = inject(SweetAlertService);

  protected readonly draft = signal<BookingDraft>(this.emptyDraft());
  protected readonly formError = signal<string | null>(null);

  protected updateField(field: BookingField, value: string): void {
    this.draft.update((draft) => ({ ...draft, [field]: value }));
    this.formError.set(null);
  }

  protected closeModal(): void {
    this.closed.emit();
  }

  protected async sendRequest(event: SubmitEvent): Promise<void> {
    event.preventDefault();

    const draft = this.draft();
    const email = draft.email.trim().toLowerCase();
    const phoneDigits = draft.phone.replace(/\D/g, '');
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!draft.fullName.trim() || phoneDigits.length < 7 || !validEmail) {
      this.formError.set('Ingresa tu nombre, un teléfono y un correo válidos.');
      return;
    }

    const car = this.selectedCar();
    const firstName = draft.fullName.trim().split(/\s+/)[0];

    this.closed.emit();
    await this.sweetAlert.aceptar(
      'Solicitud enviada',
      car
        ? `Gracias, ${firstName}. Un asesor te contactará con la cotización del ${car.name}.`
        : `Gracias, ${firstName}. Un asesor te contactará para agendar tu prueba de manejo.`
    );
  }

  private emptyDraft(): BookingDraft {
    return {
      fullName: '',
      phone: '',
      email: '',
      comment: ''
    };
  }
}
