import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.productService.getProducts().subscribe({
      next: (data: Product[]) => {
        console.log('Fetched products:', data); // Debug the fetched data
        this.products = data || []; // Ensure it's an array
        this.filteredProducts = [...this.products];
        this.totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
        console.log('filteredProducts after assignment:', this.filteredProducts);
      },
      error: (err) => console.error('Error fetching products:', err) // Catch errors
    });
  }

  onSearch(event: Event) {
    const query = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredProducts = query
      ? this.products.filter(p => p.name.toLowerCase().includes(query))
      : [...this.products]; // Reset to all products if query is empty

      this.currentPage = 1;
      this.totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
    console.log('Filtered products after search:', this.filteredProducts);
  }

  currentPage = 1;
  itemsPerPage = 25;
  totalPages = 0;

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