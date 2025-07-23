import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef } from '@angular/core';
import { ProductService, Product } from '../services/product.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  products: Product[] = [];
  searchResults: Product[] = [];
  filteredProducts: Product[] = [];

  currentPage = 1;
  itemsPerPage = 25;
  totalPages = 0;

  minPrice: number | null = null;
  maxPrice: number | null = null;
  sortOrder: 'asc' | 'desc' | null = null;

  constructor(
    private productService: ProductService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.productService.getProducts().subscribe({
      next: (data: Product[]) => {
        this.products = data || [];
        this.searchResults = [...this.products];
        this.applyFilters();
      },
      error: (err) => console.error('Error fetching products:', err)
    });
  }

  onSearch(event: Event) {
    const query = (event.target as HTMLInputElement).value.trim();

    if (!query) {
      this.searchResults = [...this.products];
      this.applyFilters();
      return;
    }

    this.http.post<Product[]>('http://localhost:5000/search', {
      query: query,
      top_k: 50
    }).subscribe({
      next: (results: Product[]) => {
        this.searchResults = results;
        this.applyFilters();
      },
      error: (err) => {
        console.error("Search error:", err);
      }
    });
  }

  parsePrice(price: string | number): number {
    if (typeof price === 'number') return price;
    return parseFloat(price.replace(/[^\d]/g, '')) || 0;
  }

  applyFilters() {
    let temp = [...this.searchResults];

    if (this.minPrice !== null) {
      temp = temp.filter(p => this.parsePrice(p.price_vnd) >= this.minPrice!);
    }

    if (this.maxPrice !== null) {
      temp = temp.filter(p => this.parsePrice(p.price_vnd) <= this.maxPrice!);
    }

    if (this.sortOrder === 'asc') {
      temp.sort((a, b) => this.parsePrice(a.price_vnd) - this.parsePrice(b.price_vnd));
    } else if (this.sortOrder === 'desc') {
      temp.sort((a, b) => this.parsePrice(b.price_vnd) - this.parsePrice(a.price_vnd));
    }

    this.filteredProducts = temp;
    this.totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
    this.currentPage = 1;
    this.cdr.detectChanges();
  }

  get paginatedProducts(): Product[] {
    if (!this.filteredProducts || this.filteredProducts.length === 0) return [];
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredProducts.slice(start, start + this.itemsPerPage);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.cdr.detectChanges();
    }
  }
}