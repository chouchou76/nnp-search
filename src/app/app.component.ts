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

  searchQuery = '';
  suggestedProducts: Product[] = [];
  showDropdown = false;

  minPrice: number | null = null;
  maxPrice: number | null = null;
  sortOrder: 'asc' | 'desc' | null = null;

  searchHistory: string[] = [];
  topKeywords: { keyword: string; count: number }[] = [];

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
    this.loadTopKeywords();
    this.loadSearchHistory();
  }

  loadTopKeywords() {
    this.http.get<any[]>("http://localhost:5000/search/top_keywords").subscribe({
      next: (res) => {
        this.topKeywords = res.slice(0, 6);
      },
      error: (err) => {
        console.error("Không tải được top từ khóa:", err);
      }
    });
  }
  
  loadSearchHistory() {
    const history = localStorage.getItem("searchHistory");
    this.searchHistory = history ? JSON.parse(history) : [];
  }

  saveSearchToHistory(query: string) {
    if (!this.searchHistory.includes(query)) {
      this.searchHistory.unshift(query);
      this.searchHistory = this.searchHistory.slice(0, 10);
      localStorage.setItem("searchHistory", JSON.stringify(this.searchHistory));
    }
  }

  onInputChange(event: Event) {
    this.searchQuery = (event.target as HTMLInputElement).value.trim();

    if (!this.searchQuery) {
      this.suggestedProducts = [];
      this.showDropdown = false; // hiển thị từ khóa phổ biến + lịch sử
      return;
    }

    this.http.post<Product[]>('http://localhost:5000/search', {
      query: this.searchQuery,
      top_k: 10,
      log: false
    }).subscribe({
      next: (results) => {
        this.suggestedProducts = results;
        this.showDropdown = results.length > 0;
      },
      error: (err) => {
        console.error('Error loading suggestions:', err);
        this.showDropdown = false;
      }
    });
  }

  onSearch(event: Event) {
    this.showDropdown = false;
    const query = this.searchQuery.trim();

    if (!query) {
      this.searchResults = [...this.products];
      this.applyFilters();
      return;
    }

    this.saveSearchToHistory(query);

    this.http.post<Product[]>('http://localhost:5000/search', {
      query: query,
      top_k: 30,
      log: true
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

  onSearchFromDropdown() {
    if (!this.searchQuery.trim()) return;
    this.saveSearchToHistory(this.searchQuery.trim());

    this.http.post<Product[]>('http://localhost:5000/search', {
      query: this.searchQuery.trim(),
      top_k: 30,
      log: true
    }).subscribe({
      next: (results: Product[]) => {
        this.searchResults = results;
        this.applyFilters();
        this.showDropdown = false;
      },
      error: (err) => {
        console.error("Search error:", err);
        this.showDropdown = false;
      }
    });
  }

  onFocusSearch() {
    this.showDropdown = true;
    if (!this.searchQuery.trim()) {
      this.loadTopKeywords();
      this.loadSearchHistory();
    }
  }

  onBlurSearch() {
    // giữ dropdown nếu click vào trong đó
    setTimeout(() => {
      const focused = document.activeElement as HTMLElement;
      if (!focused || !focused.closest('.search-dropdown')) {
        this.showDropdown = false;
      }
    }, 200);
  }

  clearSearchHistory() {
    this.searchHistory = [];
    localStorage.removeItem("searchHistory");
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
