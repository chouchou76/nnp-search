import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
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
  filteredProducts: Product[] = [];
  currentPage = 1;
  itemsPerPage = 25;
  totalPages = 0;

  constructor(
    private productService: ProductService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.productService.getProducts().subscribe({
      next: (data: Product[]) => {
        this.products = data || [];
        this.filteredProducts = [...this.products];
        this.totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
      },
      error: (err) => console.error('Error fetching products:', err)
    });
  }

  onSearch(event: Event) {
    const query = (event.target as HTMLInputElement).value.trim();
    if (!query) {
      this.filteredProducts = [...this.products];
      this.currentPage = 1;
      this.totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
      return;
    }

    this.http.post<Product[]>('http://localhost:5000/search', {
      query: query,
      top_k: 999
    }).subscribe({
      next: (results: Product[]) => {
        this.filteredProducts = results;
        this.currentPage = 1;
        this.totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
      },
      error: (err: any) => {
        console.error('Semantic search failed:', err);
      }
    });
  }

  get paginatedProducts(): Product[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredProducts.slice(start, start + this.itemsPerPage);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
}
