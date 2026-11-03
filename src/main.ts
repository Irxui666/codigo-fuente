import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app/routes';
import { AppComponent } from './app/app.component';
import { authInterceptor } from './app/core';
bootstrapApplication(AppComponent,{providers:[provideRouter(routes,withComponentInputBinding()),provideHttpClient(withInterceptors([authInterceptor]))]}).catch(console.error);
