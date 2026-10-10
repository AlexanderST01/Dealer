import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';

import {
  CAR_CATEGORIES,
  CarInventoryService,
  DEFAULT_CAR_IMAGE,
  formatMileage,
  formatPrice,
  type InventoryCar
} from '../../core/services/car-inventory.service';
import { SweetAlertService } from '../../core/services/sweet-alert.service';

interface CarDraft {
  readonly name: string;
  readonly brand: string;
  readonly category: string;
  readonly year: string;
  readonly mileage: string;
  readonly price: string;
  readonly transmission: string;
  readonly engine: string;
  readonly tag: string;
  readonly imageUrl: string;
}

type CarField = keyof CarDraft;

@Component({
  selector: 'app-car-manager',
  standalone: true,
  templateUrl: './car-manager.component.html',
  styleUrl: './car-manager.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CarManagerComponent {
  readonly userEmail = input<string | null>(null);
  readonly logoutRequested = output<void>();

  private readonly carInventory = inject(CarInventoryService);
  private readonly sweetAlert = inject(SweetAlertService);

  protected readonly categories = CAR_CATEGORIES;
  protected readonly defaultImage = DEFAULT_CAR_IMAGE;
  protected readonly formatPrice = formatPrice;
  protected readonly formatMileage = formatMileage;

  protected readonly draft = signal<CarDraft>(this.emptyDraft());
  protected readonly formError = signal<string | null>(null);
  protected readonly cars = this.carInventory.cars;
  protected readonly searchQuery = signal('');
  protected readonly formOpen = signal(false);
  protected readonly editingCarId = signal<string | null>(null);
  protected readonly selectedCar = signal<InventoryCar | null>(null);

  protected updateField(field: CarField, value: string): void {
    this.draft.update((draft) => ({ ...draft, [field]: value }));
    this.formError.set(null);
  }

  protected updateSearch(value: string): void {
    this.searchQuery.set(value);
  }

  protected filteredCars(): readonly InventoryCar[] {
    const query = this.searchQuery().trim().toLocaleLowerCase('es');
    if (!query) {
      return this.cars();
    }

    return this.cars().filter((car) =>
      [car.name, car.brand, car.category, car.year]
        .some((value) => String(value ?? '').toLocaleLowerCase('es').includes(query))
    );
  }

  protected openAddForm(): void {
    this.editingCarId.set(null);
    this.draft.set(this.emptyDraft());
    this.formError.set(null);
    this.formOpen.set(true);
  }

  protected openEditForm(car: InventoryCar): void {
    this.editingCarId.set(car.id);
    this.draft.set({
      name: car.name,
      brand: car.brand,
      category: car.category,
      year: String(car.year ?? ''),
      mileage: String(car.mileage),
      price: String(car.price),
      transmission: car.transmission,
      engine: car.engine,
      tag: car.tag,
      imageUrl: car.imageUrl
    });
    this.formError.set(null);
    this.formOpen.set(true);
  }

  protected closeForm(): void {
    this.formOpen.set(false);
  }

  protected showDetails(car: InventoryCar): void {
    this.selectedCar.set(car);
  }

  protected closeDetails(): void {
    this.selectedCar.set(null);
  }

  protected async addCar(event: SubmitEvent): Promise<void> {
    event.preventDefault();

    const draft = this.draft();
    const year = Number(draft.year);
    const mileage = Number(draft.mileage);
    const price = Number(draft.price);
    if (
      !draft.name.trim() ||
      !draft.brand.trim() ||
      !draft.category.trim() ||
      !draft.transmission.trim() ||
      !draft.engine.trim() ||
      !draft.year.trim() ||
      !draft.mileage.trim() ||
      !draft.price.trim() ||
      !Number.isInteger(year) ||
      year < 1990 ||
      year > 2100 ||
      !Number.isInteger(mileage) ||
      mileage < 0 ||
      !Number.isFinite(price) ||
      price <= 0
    ) {
      this.formError.set('Completa todos los campos con información válida.');
      return;
    }

    const carId = this.editingCarId();
    const car: InventoryCar = {
      id: carId ?? this.createCarId(),
      name: draft.name.trim(),
      brand: draft.brand.trim(),
      category: draft.category.trim(),
      transmission: draft.transmission.trim(),
      engine: draft.engine.trim(),
      tag: draft.tag.trim() || 'Disponible',
      imageUrl: draft.imageUrl.trim(),
      mileage,
      price,
      year
    };
    const nextCars: readonly InventoryCar[] = carId
      ? this.cars().map((savedCar) => savedCar.id === carId ? car : savedCar)
      : [car, ...this.cars()];

    if (!this.persistCars(nextCars)) {
      return;
    }

    this.formOpen.set(false);
    await this.sweetAlert.aceptar(carId ? 'Vehículo actualizado' : 'Vehículo agregado', car.name);
  }

  protected async removeCar(carId: string): Promise<void> {
    const car = this.cars().find((savedCar) => savedCar.id === carId);
    if (!car) {
      return;
    }

    const result = await this.sweetAlert.question(
      '¿Eliminar vehículo?',
      `Se eliminará ${car.name} del inventario.`,
      { confirmButtonText: 'Eliminar' }
    );

    if (!result.isConfirmed) {
      return;
    }

    if (!this.persistCars(this.cars().filter((savedCar) => savedCar.id !== carId))) {
      return;
    }

    await this.sweetAlert.aceptar('Vehículo eliminado', car.name);
  }

  private persistCars(cars: readonly InventoryCar[]): boolean {
    if (this.carInventory.saveAll(cars)) {
      return true;
    }

    void this.sweetAlert.error(
      'No se guardaron los cambios',
      'Revisa el almacenamiento local del navegador e inténtalo de nuevo.'
    );
    return false;
  }

  private createCarId(): string {
    return window.crypto?.randomUUID?.() ?? `car-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  private emptyDraft(): CarDraft {
    return {
      name: '',
      brand: '',
      category: '',
      year: '',
      mileage: '',
      price: '',
      transmission: '',
      engine: '',
      tag: '',
      imageUrl: ''
    };
  }
}
