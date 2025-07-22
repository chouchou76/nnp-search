import { Injectable } from '@angular/core';
import { Firestore, collectionData, collection } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'; // Add this import

export interface Product {
  name: string;
  price_vnd: string;
  image_urls: string[];
  url?: string;
  description?: string;
  embedding: number[];
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  constructor(private firestore: Firestore) {}

  getProducts(): Observable<Product[]> {
    const productsRef = collection(this.firestore, 'products');
    return collectionData(productsRef, { idField: 'id' }).pipe(
      map(data => {
        console.log('Raw data from Firestore:', data); // Debug raw data
        return data.map(item => ({
          name: item['name'] || item['productName'] || 'No name', // Handle variations
          price_vnd: item['price_vnd']?.toString() || '0', // Ensure string
          image_urls: item['image_urls'] || [''], // Default to empty array
          url: item['url'],
          description: item['description']
        })) as Product[];
      })
    );
  }
}