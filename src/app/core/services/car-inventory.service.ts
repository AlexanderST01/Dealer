import { Injectable, signal } from '@angular/core';

export interface InventoryCar {
  readonly id: string;
  readonly name: string;
  readonly brand: string;
  readonly category: string;
  readonly transmission: string;
  readonly engine: string;
  readonly tag: string;
  readonly imageUrl: string;
  readonly mileage: number;
  readonly price: number;
  readonly year?: number;
}

export const CAR_CATEGORIES = ['SUV', 'Deportivo', 'Sedán', 'Híbrido/Eléctrico'] as const;
export const DEFAULT_CAR_IMAGE =
  'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=800&auto=format&fit=crop';

const CARS_STORAGE_KEY = 'autoElite.cars';

export function formatPrice(price: number): string {
  return `$${price.toLocaleString('en-US')}`;
}

export function formatMileage(mileage: number): string {
  return mileage === 0 ? '0 km (Nuevo)' : `${mileage.toLocaleString('en-US')} km`;
}

@Injectable({ providedIn: 'root' })
export class CarInventoryService {
  readonly cars = signal<readonly InventoryCar[]>(this.loadCars());

  saveAll(cars: readonly InventoryCar[]): boolean {
    try {
      window.localStorage.setItem(CARS_STORAGE_KEY, JSON.stringify(cars));
      this.cars.set(cars);
      return true;
    } catch {
      return false;
    }
  }

  private loadCars(): readonly InventoryCar[] {
    const defaultCars: readonly InventoryCar[] = [
      {
        id: 'sample-porsche-911-gts',
        name: 'Porsche 911 Carrera GTS',
        brand: 'Porsche',
        category: 'Deportivo',
        transmission: 'PDK 8 Velocidades',
        engine: '3.0L Twin-Turbo 480 CV',
        tag: 'Destacado',
        imageUrl: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=800&auto=format&fit=crop',
        mileage: 0,
        price: 148500,
        year: 2024
      },
      {
        id: 'sample-bmw-x5-m',
        name: 'BMW X5 M Competition',
        brand: 'BMW',
        category: 'SUV',
        transmission: 'Automática M Steptronic',
        engine: '4.4L V8 TwinPower 625 CV',
        tag: 'Certificado',
        imageUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=800&auto=format&fit=crop',
        mileage: 14200,
        price: 112000,
        year: 2023
      },
      {
        id: 'sample-tesla-model-s',
        name: 'Tesla Model S Plaid',
        brand: 'Tesla',
        category: 'Híbrido/Eléctrico',
        transmission: 'Direct Drive Tri-Motor',
        engine: '1,020 CV 100% Eléctrico',
        tag: 'Eléctrico',
        imageUrl: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=800&auto=format&fit=crop',
        mileage: 0,
        price: 108900,
        year: 2024
      },
      {
        id: 'sample-audi-rs6',
        name: 'Audi RS6 Avant',
        brand: 'Audi',
        category: 'Sedán',
        transmission: 'Tiptronic 8 Vel. Quattro',
        engine: '4.0L V8 TFSI 600 CV',
        tag: 'Exclusivo',
        imageUrl: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=800&auto=format&fit=crop',
        mileage: 8500,
        price: 125000,
        year: 2023
      },
      {
        id: 'sample-mercedes-gle-53',
        name: 'Mercedes-Benz GLE 53 AMG',
        brand: 'Mercedes-Benz',
        category: 'SUV',
        transmission: 'AMG SPEEDSHIFT TCT 9G',
        engine: '3.0L Turbo Mild-Hybrid 435 CV',
        tag: 'Oportunidad',
        imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=800&auto=format&fit=crop',
        mileage: 2100,
        price: 98500,
        year: 2024
      },
      {
        id: 'sample-mercedes-amg-gt',
        name: 'Mercedes-AMG GT Coupe',
        brand: 'Mercedes-Benz',
        category: 'Deportivo',
        transmission: 'AMG SPEEDSHIFT DCT 7G',
        engine: '4.0L V8 Biturbo 530 CV',
        tag: 'Deportivo',
        imageUrl: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=800&auto=format&fit=crop',
        mileage: 18900,
        price: 132000,
        year: 2022
      }
    ];

    try {
      const storedCars = window.localStorage.getItem(CARS_STORAGE_KEY);
      if (storedCars === null) {
        window.localStorage.setItem(CARS_STORAGE_KEY, JSON.stringify(defaultCars));
        return defaultCars;
      }

      const parsedCars: unknown = JSON.parse(storedCars);
      if (!Array.isArray(parsedCars)) {
        return defaultCars;
      }

      return parsedCars
        .filter((car): car is Record<string, unknown> => typeof car === 'object' && car !== null)
        .filter((car) =>
          (typeof car['id'] === 'string' || typeof car['id'] === 'number') &&
          typeof car['name'] === 'string' &&
          typeof car['brand'] === 'string' &&
          typeof car['category'] === 'string' &&
          typeof car['price'] === 'number'
        )
        .map((car) => ({
          id: String(car['id']),
          name: car['name'] as string,
          brand: car['brand'] as string,
          category: car['category'] as string,
          transmission: typeof car['transmission'] === 'string' ? car['transmission'] : '',
          engine: typeof car['engine'] === 'string' ? car['engine'] : '',
          tag: typeof car['tag'] === 'string' ? car['tag'] : 'Disponible',
          imageUrl: typeof car['imageUrl'] === 'string' ? car['imageUrl'] : '',
          mileage: typeof car['mileage'] === 'number' ? car['mileage'] : 0,
          price: car['price'] as number,
          ...(typeof car['year'] === 'number' ? { year: car['year'] } : {})
        }));
    } catch {
      return defaultCars;
    }
  }
}
