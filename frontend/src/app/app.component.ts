import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, HostListener, computed, inject, signal } from '@angular/core';

interface FeatureItem {
  title: string;
  text: string;
}

interface StatItem {
  value: string;
  label: string;
}

interface BrandPayload {
  name: string;
  tagline: string;
  heroTitle: string;
  heroDescription: string;
  logo: string;
  palette: {
    wine: string;
    gold: string;
    cream: string;
    charcoal: string;
  };
  highlights: FeatureItem[];
  stats: StatItem[];
}

const FALLBACK_BRAND: BrandPayload = {
  name: 'LUSAN',
  tagline: 'Tradicionalmente rico',
  heroTitle: 'Tradición gourmet con presencia digital',
  heroDescription:
    'Una experiencia sobria, tradicional, elegante y contemporánea, LUSAN: una composición de lo actual con lo tradicional y artesanal.',
  logo: '/brand/logo-lusan-premium.jpg',
  palette: {
    wine: '#6d0f14',
    gold: '#9a772a',
    cream: '#f6f0e6',
    charcoal: '#1b1212'
  },
  highlights: [
    {
      title: 'Identidad sólida',
      text: 'Dirección visual basada en contrastes premium, tipografía de alto impacto y lectura impecable.'
    },
    {
      title: 'Sensación 3D',
      text: 'Capas, profundidad, iluminación y microinteracciones para transmitir valor sin volver todo un casino digital.'
    },
    {
      title: 'Listo para vender',
      text: 'Bloques pensados para marca gastronómica, catálogo, campañas estacionales y llamados claros a la acción.'
    }
  ],
  stats: [
    { value: '1950', label: 'Trayectoria' },
    { value: '50', label: 'Menu' },
    { value: '70', label: 'Experiencia' }
  ]
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  private readonly http = inject(HttpClient);

  readonly brand = signal<BrandPayload>(FALLBACK_BRAND);
  readonly rotationX = signal(-8);
  readonly rotationY = signal(10);
  readonly glowX = signal(50);
  readonly glowY = signal(35);
  readonly hasMotion = signal(true);

  readonly heroTransform = computed(
    () => `perspective(1600px) rotateX(${this.rotationX()}deg) rotateY(${this.rotationY()}deg)`
  );

  readonly glowStyle = computed(
    () => `${this.glowX()}% ${this.glowY()}%`
  );

  constructor() {
    this.hasMotion.set(typeof window !== 'undefined' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    this.loadBrand();
  }

  trackByTitle(index: number, item: FeatureItem | StatItem): string {
    return `${index}-${'title' in item ? item.title : item.label}`;
  }

  onHeroMove(event: MouseEvent): void {
    if (!this.hasMotion()) {
      return;
    }

    const target = event.currentTarget as HTMLElement | null;
    if (!target) {
      return;
    }

    const rect = target.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((event.clientY - rect.top) / rect.height) * 2 - 1;

    this.rotationX.set(Number((-y * 10).toFixed(2)));
    this.rotationY.set(Number((x * 14).toFixed(2)));
    this.glowX.set(Number((((event.clientX - rect.left) / rect.width) * 100).toFixed(2)));
    this.glowY.set(Number((((event.clientY - rect.top) / rect.height) * 100).toFixed(2)));
  }

  resetHero(): void {
    this.rotationX.set(-8);
    this.rotationY.set(10);
    this.glowX.set(50);
    this.glowY.set(35);
  }

  @HostListener('window:keydown.escape')
  handleEscape(): void {
    this.resetHero();
  }

  private loadBrand(): void {
    this.http.get<BrandPayload>('/api/brand').subscribe({
      next: (payload) => this.brand.set(payload),
      error: () => this.brand.set(FALLBACK_BRAND)
    });
  }
}
