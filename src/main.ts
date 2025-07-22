import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { importProvidersFrom } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import 'zone.js';

import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';


// Firebase
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAa7J-Ukvvzj4vbxHTR1hIHm4dStrAUdBQ",
  authDomain: "nongnghieppho-f12fb.firebaseapp.com",
  projectId: "nongnghieppho-f12fb",
  storageBucket: "nongnghieppho-f12fb.appspot.com",
  messagingSenderId: "1089681642366",
  appId: "1:1089681642366:web:c6d83ed62b3c0fcfbd592f",
  measurementId: "G-18E2EX5WHB"
};

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideFirestore(() => getFirestore())
  ]
}).catch(err => console.error(err));
