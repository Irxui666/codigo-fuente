import {Component,inject,OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {ShellComponent} from './shell.component';
import {ApiService,Row,errorText} from './core';
@Component({standalone:true,imports:[ShellComponent,FormsModule],template:`
<app-shell><div class="k-module k-admin">
  <header class="k-module-header"><div><span class="k-eyebrow">CONFIGURACIÓN / ADMINISTRACIÓN</span><h1 class="k-title">Administración</h1><p class="k-subtitle">Gestiona usuarios, parámetros, catálogos, notificaciones y auditoría.</p></div><div class="k-header-actions"><button class="k-button k-button-secondary" (click)="cargar()">↻ Actualizar información</button></div></header>
  <nav class="k-tabs" aria-label="Opciones de administración">
    <button class="k-tab" [class.active]="tab==='usuarios'" (click)="tab='usuarios'">Usuarios</button>
    <button class="k-tab" [class.active]="tab==='nuevoUsuario'" (click)="tab='nuevoUsuario'">Nuevo usuario</button>
    <button class="k-tab" [class.active]="tab==='parametros'" (click)="tab='parametros'">Parámetros</button>
    <button class="k-tab" [class.active]="tab==='catalogos'" (click)="tab='catalogos'">Catálogos</button>
    <button class="k-tab" [class.active]="tab==='notificaciones'" (click)="tab='notificaciones'">Notificaciones</button>
    <button class="k-tab" [class.active]="tab==='auditoria'" (click)="tab='auditoria'">Auditoría</button>
  </nav>
  @if(error){<div class="k-error" role="alert">{{error}}</div>}@if(exito){<div class="k-success" role="status">{{exito}}</div>}
  @if(tab==='usuarios'){
    <section class="k-panel"><div class="k-section-heading"><div><h2>Usuarios registrados</h2><p>Consulta el estado de los usuarios y administra sus permisos.</p></div><button class="k-button" (click)="tab='nuevoUsuario'">+ Registrar usuario</button></div>
      <div class="k-table-wrap"><table class="k-table"><thead><tr><th>ID</th><th>Usuario</th><th>Correo</th><th>Rol</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>
        @for(u of usuarios;track u.ID_USUARIO){<tr><td>{{u.ID_USUARIO}}</td><td><strong>{{u.USERNAME}}</strong></td><td>{{u.CORREO}}</td><td>{{u.ROL}}</td><td><span class="k-status" [class.is-active]="u.ESTADO==='ACTIVO'">{{u.ESTADO}}</span></td><td><button class="k-button k-button-small k-button-secondary" (click)="elegirUsuario(u)">Administrar</button></td></tr>}
        @empty{<tr><td colspan="6" class="k-empty">No se encontraron usuarios.</td></tr>}
      </tbody></table></div>
    </section>
    @if(seleccionado){<section class="k-panel k-panel-highlight"><div class="k-section-heading"><div><h2>Administrar: {{seleccionado.USERNAME}}</h2><p>Modifica el rol y el estado del usuario seleccionado.</p></div><button class="k-button k-button-secondary k-button-small" (click)="seleccionado=null">Cerrar</button></div>
      <div class="k-form"><label class="k-field">Nuevo rol<select [(ngModel)]="cambioRol"><option [ngValue]="null">Selecciona un rol</option>@for(r of roles;track r.ID_ROL){<option [ngValue]="r.ID_ROL">{{r.NOMBRE}}</option>}</select></label><label class="k-field">Estado<select [(ngModel)]="cambioEstado"><option>ACTIVO</option><option>INACTIVO</option><option>BLOQUEADO</option></select></label></div><div class="k-actions"><button class="k-button" (click)="actualizarRol()" [disabled]="!cambioRol">Cambiar rol</button><button class="k-button k-button-secondary" (click)="actualizarEstado()">Cambiar estado</button></div>
    </section>}
  }
  @if(tab==='nuevoUsuario'){
    <section class="k-panel"><div class="k-section-heading"><div><h2>Crear cuenta de usuario</h2><p>Completa los datos de acceso y asigna el rol correspondiente.</p></div></div>
      <div class="k-form"><label class="k-field">Nombre de usuario<input [(ngModel)]="nuevo.username" placeholder="Ej. recepcionista1" autocomplete="off"></label>
      <label class="k-field">Correo electrónico<input type="email" [(ngModel)]="nuevo.correo" placeholder="usuario@ejemplo.com"></label>
      <label class="k-field">Rol<select [(ngModel)]="nuevo.idRol"><option [ngValue]="null">Selecciona un rol</option>@for(r of roles;track r.ID_ROL){<option [ngValue]="r.ID_ROL">{{r.NOMBRE}}</option>}</select></label>
      <label class="k-field">Contraseña inicial (mínimo 12 caracteres)<input type="password" [(ngModel)]="nuevo.password" autocomplete="new-password" placeholder="Contraseña segura"></label></div>
      <div class="k-actions"><button class="k-button" [disabled]="!nuevo.username || !nuevo.correo || !nuevo.idRol || !nuevo.password || nuevo.password.length<12" (click)="crearUsuario()">Registrar usuario</button><button class="k-button k-button-secondary" (click)="tab='usuarios'">Cancelar</button></div>
    </section>
  }
  @if(tab==='parametros'){
    <section class="k-panel"><div class="k-section-heading"><div><h2>Parámetros configurables</h2><p>Consulta los valores activos que utiliza el sistema.</p></div></div>
      <div class="k-table-wrap"><table class="k-table"><thead><tr><th>Parámetro</th><th>Valor</th><th>Descripción</th></tr></thead><tbody>@for(p of parametros;track p.ID_PARAMETRO){<tr><td><strong>{{p.NOMBRE}}</strong></td><td>{{p.VALOR}}</td><td>{{p.DESCRIPCION}}</td></tr>}@empty{<tr><td class="k-empty" colspan="3">No hay parámetros registrados.</td></tr>}</tbody></table></div>
    </section>
    <section class="k-panel"><div class="k-section-heading"><div><h2>Actualizar parámetro</h2><p>El cambio queda registrado en el historial del sistema.</p></div></div>
      <div class="k-form"><label class="k-field">Parámetro<select [(ngModel)]="config.nombre"><option value="">Selecciona un parámetro</option>@for(p of parametros;track p.ID_PARAMETRO){<option [value]="p.NOMBRE">{{p.NOMBRE}}</option>}</select></label><label class="k-field">Nuevo valor<input [(ngModel)]="config.valor" placeholder="Introduce el nuevo valor"></label></div>
      <div class="k-actions"><button class="k-button" [disabled]="!config.nombre || !config.valor" (click)="cambiarParametro()">Actualizar parámetro</button></div>
    </section>
  }
  @if(tab==='catalogos'){
    <div class="k-info">Configura los catálogos antes de registrar horarios o crear pre-reservas de citas.</div>
    <section class="k-panel"><div class="k-section-heading"><div><h2>Especialidades médicas</h2><p>Agrega una nueva especialidad y define su precio de consulta.</p></div></div>
      <div class="k-form"><label class="k-field">Nombre de especialidad<input [(ngModel)]="esp.nombre" placeholder="Ej. Medicina general"></label><label class="k-field">Precio de consulta (S/)<input type="number" min="0" [(ngModel)]="esp.precioConsulta"></label></div><div class="k-actions"><button class="k-button" [disabled]="!esp.nombre || esp.precioConsulta==null" (click)="ejecutar('especialidad-crear',esp)">Crear especialidad</button></div>
    </section>
    <section class="k-panel"><div class="k-section-heading"><div><h2>Consultorios</h2><p>Registra los espacios donde se realizan las consultas médicas.</p></div></div><div class="k-form"><label class="k-field">Nombre del consultorio<input [(ngModel)]="cons.nombre"></label><label class="k-field">Ubicación<input [(ngModel)]="cons.ubicacion"></label></div><div class="k-actions"><button class="k-button" [disabled]="!cons.nombre" (click)="ejecutar('consultorio-crear',cons)">Crear consultorio</button></div></section>
    <section class="k-panel"><div class="k-section-heading"><div><h2>Franjas horarias</h2><p>Define la hora de inicio y fin de un turno médico.</p></div></div><div class="k-form"><label class="k-field">Hora de inicio<input type="time" [(ngModel)]="franja.horaInicio"></label><label class="k-field">Hora de fin<input type="time" [(ngModel)]="franja.horaFin"></label></div><div class="k-actions"><button class="k-button" [disabled]="!franja.horaInicio || !franja.horaFin" (click)="ejecutar('franja-crear',franja)">Crear franja horaria</button></div></section>
  }
  @if(tab==='notificaciones'){
    <section class="k-panel"><div class="k-section-heading"><div><h2>Cola de notificaciones</h2><p>Seguimiento de avisos preparados, enviados o fallidos.</p></div></div><div class="k-info">El envío real requiere el servicio SMTP/API externo; esta tabla muestra el estado registrado en Oracle.</div>
      <div class="k-table-wrap"><table class="k-table"><thead><tr><th>ID</th><th>Tipo</th><th>Canal</th><th>Código de evento</th><th>Estado</th></tr></thead><tbody>@for(n of notificaciones;track $index){<tr><td>{{n.ID_NOTIFICACION}}</td><td>{{n.TIPO}}</td><td>{{n.CANAL}}</td><td>{{n.CODIGO_EVENTO}}</td><td><span class="k-status" [class.is-active]="n.ESTADO==='ENVIADA'">{{n.ESTADO}}</span></td></tr>}@empty{<tr><td class="k-empty" colspan="5">No hay notificaciones registradas.</td></tr>}</tbody></table></div>
    </section>
  }
  @if(tab==='auditoria'){
    <section class="k-panel"><div class="k-section-heading"><div><h2>Registro de auditoría</h2><p>Consulta el historial de acciones relevantes en el sistema.</p></div></div>
      <div class="k-table-wrap"><table class="k-table"><thead><tr><th>Fecha</th><th>Usuario</th><th>Tabla</th><th>Acción</th><th>Detalle</th></tr></thead><tbody>@for(a of auditoria;track a.ID_AUDITORIA){<tr><td>{{a.FECHA_OPERACION}}</td><td>{{a.ID_USUARIO}}</td><td>{{a.TABLA_AFECTADA}}</td><td>{{a.ACCION}}</td><td>{{a.DETALLE}}</td></tr>}@empty{<tr><td class="k-empty" colspan="5">No hay registros de auditoría para mostrar.</td></tr>}</tbody></table></div>
    </section>
  }
</div></app-shell>
`})
export class AdminComponent implements OnInit{
 api=inject(ApiService);tab='usuarios';error='';exito='';usuarios:Row[]=[];roles:Row[]=[];parametros:Row[]=[];auditoria:Row[]=[];notificaciones:Row[]=[];seleccionado:Row|null=null;cambioRol:number|null=null;cambioEstado='ACTIVO';nuevo:Row={};esp:Row={};cons:Row={};franja:Row={};config:Row={nombre:'',valor:''};
 ngOnInit(){this.cargar()}
 async cargar(){try{[this.usuarios,this.roles,this.parametros,this.auditoria,this.notificaciones]=await Promise.all(['usuarios','roles','parametros','auditoria','notificaciones'].map(x=>this.api.list(x)))}catch(e){this.error=errorText(e)}}
 async ejecutar(a:string,d:Row){this.error='';try{await this.api.op(a,d);this.exito='Actualización guardada';await this.cargar()}catch(e){this.error=errorText(e)}}
 async crearUsuario(){this.error='';try{await this.api.post('/admin/usuarios',this.nuevo);this.exito='Usuario creado';this.nuevo={};this.tab='usuarios';await this.cargar()}catch(e){this.error=errorText(e)}}
 elegirUsuario(u:Row){this.seleccionado=u;this.cambioEstado=u.ESTADO;this.cambioRol=this.roles.find(r=>r.NOMBRE===u.ROL)?.ID_ROL||null}
 actualizarRol(){if(this.seleccionado)this.ejecutar('usuario-rol',{idUsuario:this.seleccionado.ID_USUARIO,idRol:this.cambioRol})}
 actualizarEstado(){if(this.seleccionado)this.ejecutar('usuario-estado',{idUsuario:this.seleccionado.ID_USUARIO,estado:this.cambioEstado})}
 cambiarParametro(){this.ejecutar('parametro-cambiar',this.config)}
}
