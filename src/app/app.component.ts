import { DOCUMENT } from '@angular/common';
import { Component, inject, signal } from '@angular/core';

import { BookingModalComponent } from './components/booking-modal/booking-modal.component';
import { CarManagerComponent } from './components/car-manager/car-manager.component';
import { GalleryCarouselComponent } from './components/gallery-carousel/gallery-carousel.component';
import {
  CAR_CATEGORIES,
  CarInventoryService,
  DEFAULT_CAR_IMAGE,
  formatMileage,
  formatPrice,
  type InventoryCar
} from './core/services/car-inventory.service';
import { SweetAlertService } from './core/services/sweet-alert.service';

const ALL_CATEGORIES = 'Todos';
const MAX_BUDGET = 200000;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [BookingModalComponent, CarManagerComponent, GalleryCarouselComponent],
  templateUrl: './app.component.html'
})
export class AppComponent {
  protected readonly carManagerOpen = signal(false);
  protected readonly navigationOpen = signal(false);
  protected readonly currentUser = signal<string | null>(null);
  protected readonly catalogSearch = signal('');
  protected readonly catalogCategory = signal(ALL_CATEGORIES);
  protected readonly maxBudget = signal(MAX_BUDGET);
  protected readonly searchBrand = signal('');
  protected readonly searchType = signal(ALL_CATEGORIES);
  protected readonly searchBudget = signal(150000);
  protected readonly bookingOpen = signal(false);
  protected readonly bookingCar = signal<InventoryCar | null>(null);

  protected readonly allCategories = ALL_CATEGORIES;
  protected readonly maxBudgetLimit = MAX_BUDGET;
  protected readonly categories = CAR_CATEGORIES;
  protected readonly defaultImage = DEFAULT_CAR_IMAGE;
  protected readonly formatPrice = formatPrice;
  protected readonly formatMileage = formatMileage;

  protected readonly carInventory = inject(CarInventoryService);
  private readonly document = inject(DOCUMENT);
  private readonly sweetAlert = inject(SweetAlertService);

  protected showAcceptAlert(): void {
    void this.sweetAlert.aceptar(
      '¡Cita confirmada!',
      'Tu prueba de manejo quedó agendada. Te esperamos en AutoElite.'
    );
  }

  protected showErrorAlert(): void {
    void this.sweetAlert.error(
      'Pago rechazado',
      'No fue posible procesar el depósito de reserva del vehículo.'
    );
  }

  protected showWarningAlert(): void {
    void this.sweetAlert.warning(
      'Últimas unidades',
      'Este modelo tiene alta demanda y pocas unidades disponibles.'
    );
  }

  protected showQuestionAlert(): void {
    void this.sweetAlert.question(
      '¿Solicitar financiamiento?',
      'Confirma para comenzar tu pre-aprobación en menos de 24 horas.'
    );
  }

  protected async showLoginAlert(): Promise<void> {
    const email = await this.sweetAlert.login();

    if (email) {
      this.navigationOpen.set(false);
      this.currentUser.set(email);
      this.carManagerOpen.set(true);
      this.scrollToTop();
    }
  }

  protected async logout(): Promise<void> {
    const email = this.currentUser();
    const result = await this.sweetAlert.question(
      '¿Cerrar sesión?',
      `Se cerrará la sesión de ${email ?? 'tu cuenta'}.`,
      { confirmButtonText: 'Cerrar sesión' }
    );

    if (!result.isConfirmed) {
      return;
    }

    this.currentUser.set(null);
    this.carManagerOpen.set(false);
    this.scrollToTop();
    await this.sweetAlert.aceptar('Sesión cerrada', 'Volverás al inicio de AutoElite.');
  }

  protected toggleNavigation(): void {
    this.navigationOpen.update((isOpen) => !isOpen);
  }

  protected updateCatalogSearch(value: string): void {
    this.catalogSearch.set(value);
  }

  protected selectCategory(category: string): void {
    this.catalogCategory.set(category);
  }

  protected filteredCatalogCars(): readonly InventoryCar[] {
    const query = this.catalogSearch().trim().toLocaleLowerCase('es');
    const category = this.catalogCategory();
    const budget = this.maxBudget();

    return this.carInventory.cars().filter((car) =>
      (category === ALL_CATEGORIES || car.category === category) &&
      car.price <= budget &&
      (!query || [car.name, car.brand, car.category, car.year]
        .some((value) => String(value ?? '').toLocaleLowerCase('es').includes(query)))
    );
  }

  protected availableBrands(): readonly string[] {
    return [...new Set(this.carInventory.cars().map((car) => car.brand))].sort();
  }

  protected hasActiveFilters(): boolean {
    return (
      this.catalogSearch().trim() !== '' ||
      this.catalogCategory() !== ALL_CATEGORIES ||
      this.maxBudget() < MAX_BUDGET
    );
  }

  protected clearCatalogFilters(): void {
    this.catalogSearch.set('');
    this.catalogCategory.set(ALL_CATEGORIES);
    this.maxBudget.set(MAX_BUDGET);
  }

  protected updateSearchBrand(value: string): void {
    this.searchBrand.set(value);
  }

  protected updateSearchType(value: string): void {
    this.searchType.set(value);
  }

  protected updateSearchBudget(value: string): void {
    this.searchBudget.set(Number(value));
  }

  protected formatMonthlyPayment(price: number): string {
    return `$${Math.round(price * 0.0132)}/mes`;
  }

  protected openBooking(car: InventoryCar | null = null): void {
    this.navigationOpen.set(false);
    this.bookingCar.set(car);
    this.bookingOpen.set(true);
  }

  protected closeBooking(): void {
    this.bookingOpen.set(false);
    this.bookingCar.set(null);
  }

  protected scrollToSection(event: Event, sectionId: string): void {
    event.preventDefault();
    this.navigationOpen.set(false);
    this.scrollTo(sectionId);
  }

  protected async confirmQuickSearch(event: Event): Promise<void> {
    event.preventDefault();

    const result = await this.sweetAlert.question(
      '¿Ver autos disponibles?',
      'Aplicaremos tus filtros y te llevaremos al catálogo de vehículos.'
    );

    if (result.isConfirmed) {
      this.catalogSearch.set(this.searchBrand());
      this.catalogCategory.set(this.searchType());
      this.maxBudget.set(this.searchBudget());
      this.scrollTo('catalogo');
    }
  }

  protected showComingSoon(event: Event, title: string): void {
    event.preventDefault();
    void this.sweetAlert.warning(title, 'Esta sección estará disponible muy pronto.');
  }

  private scrollToTop(): void {
    this.document.defaultView?.scrollTo({ top: 0, behavior: 'instant' });
  }

  private scrollTo(sectionId: string): void {
    this.document.getElementById(sectionId)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }
}
