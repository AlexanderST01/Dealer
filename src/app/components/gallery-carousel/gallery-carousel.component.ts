import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  signal
} from '@angular/core';

interface GallerySlide {
  readonly label: string;
  readonly title: string;
  readonly description: string;
  readonly image: string;
  readonly imageAlt: string;
}

@Component({
  selector: 'app-gallery-carousel',
  standalone: true,
  templateUrl: './gallery-carousel.component.html',
  styleUrl: './gallery-carousel.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GalleryCarouselComponent implements AfterViewInit, OnDestroy {
  protected readonly activeIndex = signal(0);

  private readonly autoplayInterval = 6000;
  private autoplayTimer?: ReturnType<typeof setInterval>;
  private isFocused = false;
  private isHovered = false;

  protected readonly slides: readonly GallerySlide[] = [
    {
      label: 'Deportivos de Alto Rendimiento',
      title: 'Porsche 911 GT3 RS',
      description: 'Ingeniería pura diseñada para la pista y homologada para la calle.',
      image:
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1600&auto=format&fit=crop',
      imageAlt: 'Porsche 911 GT3 RS'
    },
    {
      label: 'Acabados de Lujo Superior',
      title: 'Interiores en Piel & Fibra de Carbono',
      description:
        'Confort ergonométrico, iluminación ambiental de 64 colores y sistemas de sonido High-End.',
      image:
        'https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=1600&auto=format&fit=crop',
      imageAlt: 'Interior de lujo de un vehículo'
    },
    {
      label: 'Línea SUV Premium',
      title: 'Dominio en Cualquier Terreno',
      description: 'Capacidad para toda la familia sin sacrificar dinamismo y elegancia.',
      image:
        'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?q=80&w=1600&auto=format&fit=crop',
      imageAlt: 'SUV de lujo'
    }
  ];

  ngAfterViewInit(): void {
    this.resumeAutoplay();
  }

  ngOnDestroy(): void {
    this.pauseAutoplay();
  }

  protected selectSlide(index: number): void {
    this.activeIndex.set(index);
    this.restartAutoplay();
  }

  protected previousSlide(): void {
    this.activeIndex.update((index) => (index - 1 + this.slides.length) % this.slides.length);
    this.restartAutoplay();
  }

  protected nextSlide(): void {
    this.activeIndex.update((index) => (index + 1) % this.slides.length);
    this.restartAutoplay();
  }

  protected handleMouseEnter(): void {
    this.isHovered = true;
    this.pauseAutoplay();
  }

  protected handleMouseLeave(): void {
    this.isHovered = false;
    this.syncAutoplay();
  }

  protected handleFocusIn(): void {
    this.isFocused = true;
    this.pauseAutoplay();
  }

  protected handleFocusOut(event: FocusEvent): void {
    const carousel = event.currentTarget;
    const focusRemainsInside =
      carousel instanceof HTMLElement &&
      event.relatedTarget instanceof Node &&
      carousel.contains(event.relatedTarget);

    if (!focusRemainsInside) {
      this.isFocused = false;
      this.syncAutoplay();
    }
  }

  private pauseAutoplay(): void {
    if (this.autoplayTimer !== undefined) {
      clearInterval(this.autoplayTimer);
      this.autoplayTimer = undefined;
    }
  }

  private resumeAutoplay(): void {
    if (this.autoplayTimer === undefined) {
      this.autoplayTimer = setInterval(() => {
        this.activeIndex.update((index) => (index + 1) % this.slides.length);
      }, this.autoplayInterval);
    }
  }

  protected handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.previousSlide();
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.nextSlide();
    }
  }

  private restartAutoplay(): void {
    this.pauseAutoplay();
    this.syncAutoplay();
  }

  private syncAutoplay(): void {
    if (this.isFocused || this.isHovered) {
      this.pauseAutoplay();
      return;
    }

    this.resumeAutoplay();
  }
}
