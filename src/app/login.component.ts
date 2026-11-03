import {Component,inject} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {Router,RouterLink} from '@angular/router';
import {AuthService,errorText} from './core';
@Component({standalone:true,imports:[FormsModule,RouterLink],styleUrls:['../../public/css/login.css'],template:`
 <main class="contenedor-login">
  <section class="zona-imagen"><a routerLink="/home" class="boton-regresar"><span class="circulo-flecha">←</span><span>Regresar</span></a><img src="/img/FONDO LOGIN.png" alt="Consultorio médico" class="imagen-consultorio"></section>
  <div class="separador-azul"></div>
  <section class="zona-formulario"><div class="contenido-formulario">
   <img src="/img/LOGO GRANDE.png" alt="Logo Karely's" class="logo-karelys">
   <h1>INICIAR SESIÓN</h1><p class="texto-ayuda">Ingrese sus credenciales para acceder al sistema</p>
   <form class="formulario-login" (ngSubmit)="login()">
    <input name="username" [(ngModel)]="username" placeholder="Ingrese su usuario" required autocomplete="username">
    <div class="caja-contrasena"><input [type]="mostrar?'text':'password'" name="password" [(ngModel)]="password" placeholder="Contraseña" required autocomplete="current-password"><button type="button" class="boton-ojo" (click)="mostrar=!mostrar">◉</button></div>
    @if(error){<p class="mensaje-error" role="alert">{{error}}</p>}
    <button class="boton-ingresar" type="submit" [disabled]="loading">{{loading?'Ingresando...':'Iniciar Sesión'}}</button>
   </form>
  </div></section>
 </main>`})
export class LoginComponent{
 auth=inject(AuthService); router=inject(Router);username='';password='';mostrar=false;error='';loading=false;
 async login(){this.error='';this.loading=true;try{const s=await this.auth.login(this.username,this.password);await this.router.navigateByUrl(s.rol==='DOCTOR'?'/doctor':'/home')}catch(e){this.error=errorText(e)}finally{this.loading=false}}
}
