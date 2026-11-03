import { Routes, CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './core';
import { LoginComponent } from './login.component';
import { HomeComponent } from './home.component';
import { PacientesComponent } from './pacientes.component';
import { DoctoresComponent } from './doctores.component';
import { CitasComponent } from './citas.component';
import { FinanzasComponent } from './finanzas.component';
import { DoctorComponent } from './doctor.component';
import { AdminComponent } from './admin.component';
const guard:CanActivateFn=()=>inject(AuthService).session()?true:inject(Router).parseUrl('/login');
const roles=(allowed:string[]):CanActivateFn=>()=>{const a=inject(AuthService).session();return a&&allowed.includes(a.rol)?true:inject(Router).parseUrl(a?'/home':'/login')};
export const routes:Routes=[
 {path:'login',component:LoginComponent},{path:'home',component:HomeComponent,canActivate:[guard]},
 {path:'pacientes',component:PacientesComponent,canActivate:[guard,roles(['ADMINISTRADORA','RECEPCIONISTA'])]},
 {path:'doctores',component:DoctoresComponent,canActivate:[guard,roles(['ADMINISTRADORA','RECEPCIONISTA'])]},
 {path:'citas',component:CitasComponent,canActivate:[guard,roles(['ADMINISTRADORA','RECEPCIONISTA','CAJERA'])]},
 {path:'finanzas',component:FinanzasComponent,canActivate:[guard,roles(['ADMINISTRADORA','TESORERA'])]},
 {path:'doctor',component:DoctorComponent,canActivate:[guard,roles(['DOCTOR'])]},
 {path:'admin',component:AdminComponent,canActivate:[guard,roles(['ADMINISTRADORA'])]},
 {path:'',pathMatch:'full',redirectTo:'home'},{path:'**',redirectTo:'home'}
];
