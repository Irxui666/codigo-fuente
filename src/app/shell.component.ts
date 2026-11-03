import {Component,inject,Input} from '@angular/core';
import {RouterLink,RouterLinkActive} from '@angular/router';
import {AuthService} from './core';
@Component({selector:'app-shell',standalone:true,imports:[RouterLink,RouterLinkActive],template:`
 <div class="pagina-home">
  <aside class="barra-lateral">
   <div class="zona-logo"><img src="/img/LOGO GRANDE.png" alt="Karely's" class="logo-empresa"></div>
   <div class="titulo-panel">PANEL DE ADMINISTRACIÓN</div>
   <nav class="menu-lateral">
    <a routerLink="/home" routerLinkActive="activa" class="opcion-menu"><img src="/img/ICON_MENU.png" alt=""><span>Inicio</span></a>
    @if(['ADMINISTRADORA','RECEPCIONISTA'].includes(auth.session()?.rol||'')) {
      <a routerLink="/pacientes" routerLinkActive="activa" class="opcion-menu"><img src="/img/ICON_PACIENTES.png" alt=""><span>Pacientes</span></a>
      <a routerLink="/doctores" routerLinkActive="activa" class="opcion-menu"><img src="/img/ICON_DOCTORES.png" alt=""><span>Doctores</span></a>
    }
    @if(['ADMINISTRADORA','RECEPCIONISTA','CAJERA'].includes(auth.session()?.rol||'')) {
      <a routerLink="/citas" routerLinkActive="activa" class="opcion-menu"><img src="/img/ICON_CITAS.png" alt=""><span>Citas Médicas</span></a>
    }
    @if(['ADMINISTRADORA','TESORERA'].includes(auth.session()?.rol||'')) {
      <a routerLink="/finanzas" routerLinkActive="activa" class="opcion-menu"><img src="/img/ICON_FINANZAS.png" alt=""><span>Finanzas</span></a>
    }
    @if(auth.session()?.rol==='DOCTOR') {
      <a routerLink="/doctor" routerLinkActive="activa" class="opcion-menu"><img src="/img/ICON_DOCTORES.png" alt=""><span>Doctor / Consultas</span></a>
    }
    @if(auth.session()?.rol==='ADMINISTRADORA') {
      <a routerLink="/admin" routerLinkActive="activa" class="opcion-menu"><img src="/img/ICON_GESTIONAR_DOCTORES.png" alt=""><span>Administración</span></a>
    }
   </nav>
  </aside>
  <main class="contenido-principal">
   <header class="cabecera-superior"><div></div><div class="datos-usuario"><div class="texto-usuario"><strong>{{auth.session()?.usuario}}</strong><span>{{auth.session()?.rol}}</span></div><img src="/img/ICON_USER.png" alt="Usuario" class="icono-usuario"><button type="button" class="btn-logout" (click)="auth.logout()">Cerrar sesión</button></div></header>
   <div class="karely-page"><ng-content/></div>
  </main>
 </div>`})
export class ShellComponent{auth=inject(AuthService)}
