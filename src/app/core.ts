import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, firstValueFrom, throwError } from 'rxjs';
export interface Session {token:string; usuario:string;rol:string;idUsuario:number}
export type Row = Record<string,any>;
export const API_URL = '/api/v1';
@Injectable({providedIn:'root'})
export class AuthService {
 session=signal<Session|null>(this.read());
 private http=inject(HttpClient);private router=inject(Router);
 private read():Session|null {try{return JSON.parse(sessionStorage.getItem('karely_session')||'null')}catch{return null}}
 async login(username:string,password:string):Promise<Session>{
  const r=await firstValueFrom(this.http.post<Session>(API_URL+'/auth/login',{username,password}));
  sessionStorage.setItem('karely_session',JSON.stringify(r));this.session.set(r);return r;
 }
 async logout(){try{await firstValueFrom(this.http.post(API_URL+'/auth/logout',{}))}catch{}finally{this.clear()}}
 clear(){sessionStorage.removeItem('karely_session');this.session.set(null);this.router.navigateByUrl('/login')}
}
export const authInterceptor:HttpInterceptorFn = (req,next)=>{
 const auth=inject(AuthService);const sess=auth.session();
 const request=sess?req.clone({setHeaders:{Authorization:'Bearer '+sess.token}}):req;
 return next(request).pipe(catchError((e:HttpErrorResponse)=>{if(e.status===401 && !req.url.endsWith('/auth/login'))auth.clear();return throwError(()=>e)}));
};
@Injectable({providedIn:'root'})
export class ApiService {
 private http=inject(HttpClient);
 async list(recurso:string):Promise<Row[]>{return firstValueFrom(this.http.get<Row[]>(API_URL+'/datos/'+recurso))}
 async op(accion:string,body:Row):Promise<Row>{return firstValueFrom(this.http.post<Row>(API_URL+'/operaciones/'+accion,body))}
 async post(url:string,body:Row):Promise<Row>{return firstValueFrom(this.http.post<Row>(API_URL+url,body))}
 async upload(idDoctor:number,tipo:string,file:File):Promise<Row>{const f=new FormData();f.append('idDoctor',String(idDoctor));f.append('tipo',tipo);f.append('archivo',file);return firstValueFrom(this.http.post<Row>(API_URL+'/documentos',f))}
 async docs(idDoctor:number):Promise<Row[]>{return firstValueFrom(this.http.get<Row[]>(API_URL+'/documentos/doctor/'+idDoctor))}
}
export function errorText(e:any):string{return e?.error?.error || e?.error?.detail || e?.message || 'No se pudo completar la operación.'}
