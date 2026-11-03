import {Component,inject,OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {ShellComponent} from './shell.component';
import {ApiService,Row,errorText} from './core';
@Component({standalone:true,imports:[ShellComponent,FormsModule],template:`
<app-shell>
  <div class="k-module k-pacientes">
    <header class="k-module-header">
      <div><span class="k-eyebrow">GESTIÓN CLÍNICA / PACIENTES</span><h1 class="k-title">Pacientes</h1>
      <p class="k-subtitle">Registra pacientes, consulta sus datos y confirma su llegada a las citas.</p></div>
      <div class="k-header-actions"><button type="button" class="k-button k-button-secondary" (click)="cargar()">↻ Actualizar datos</button></div>
    </header>
    <nav class="k-tabs" aria-label="Opciones del módulo Pacientes">
      <button type="button" class="k-tab" [class.active]="vista==='lista'" (click)="vista='lista'">Listado de pacientes</button>
      <button type="button" class="k-tab" [class.active]="vista==='form'" (click)="nuevo()">Registrar paciente</button>
      <button type="button" class="k-tab" [class.active]="vista==='admitir'" (click)="vista='admitir'">Admisión a citas</button>
    </nav>
    @if(error){<div class="k-error" role="alert">{{error}}</div>}
    @if(exito){<div class="k-success" role="status">{{exito}}</div>}

    @if(vista==='lista'){
      <section class="k-panel">
        <div class="k-section-heading"><div><h2>Pacientes registrados</h2><p>Consulta y actualiza la información de los pacientes del centro.</p></div><span class="k-count">{{filtrados().length}} resultados</span></div>
        <div class="k-toolbar"><label class="k-search"><span>Buscar paciente</span><input [(ngModel)]="buscar" placeholder="DNI, nombres o apellidos" aria-label="Buscar paciente por nombre o DNI"></label>
        <button type="button" class="k-button" (click)="nuevo()">+ Nuevo paciente</button></div>
        <div class="k-table-wrap"><table class="k-table"><thead><tr><th>ID</th><th>Documento</th><th>Paciente</th><th>Teléfono</th><th>Correo</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>
          @for(p of filtrados();track p.ID_PACIENTE){<tr><td>{{p.ID_PACIENTE}}</td><td>{{p.NUMERO_DOCUMENTO}}</td><td><strong>{{p.NOMBRES}} {{p.APELLIDOS}}</strong></td><td>{{p.TELEFONO || '—'}}</td><td>{{p.CORREO || '—'}}</td><td><span class="k-status" [class.is-active]="p.ESTADO==='ACTIVO'">{{p.ESTADO}}</span></td><td><button type="button" class="k-button k-button-small k-button-secondary" (click)="editar(p)">Editar</button></td></tr>}
          @empty {<tr><td class="k-empty" colspan="7">No hay pacientes que coincidan con la búsqueda.</td></tr>}
        </tbody></table></div>
      </section>
    }
    @if(vista==='form'){
      <section class="k-panel"><div class="k-section-heading"><div><h2>{{form.idPaciente?'Editar paciente':'Registrar nuevo paciente'}}</h2><p>Completa los datos de identificación y contacto.</p></div></div>
        <h3 class="k-form-title">Datos personales</h3><div class="k-form">
          <label class="k-field">Tipo de documento<select [(ngModel)]="form.tipoDocumento" [disabled]="!!form.idPaciente"><option>DNI</option><option>CE</option><option>PASAPORTE</option></select></label>
          <label class="k-field">Número de documento<input [(ngModel)]="form.numeroDocumento" [disabled]="!!form.idPaciente" placeholder="Número de identificación"></label>
          <label class="k-field">Nombres<input [(ngModel)]="form.nombres" placeholder="Nombres del paciente"></label>
          <label class="k-field">Apellidos<input [(ngModel)]="form.apellidos" placeholder="Apellidos del paciente"></label>
          <label class="k-field">Fecha de nacimiento<input type="date" [(ngModel)]="form.fechaNacimiento" [disabled]="!!form.idPaciente"></label>
          @if(form.idPaciente){<label class="k-field">Estado<select [(ngModel)]="form.estado"><option>ACTIVO</option><option>INACTIVO</option></select></label>}
        </div><h3 class="k-form-title">Información de contacto</h3><div class="k-form">
          <label class="k-field">Teléfono<input [(ngModel)]="form.telefono" placeholder="Teléfono"></label>
          <label class="k-field">Correo electrónico<input type="email" [(ngModel)]="form.correo" placeholder="correo@ejemplo.com"></label>
          <label class="k-field k-field-wide">Dirección<input [(ngModel)]="form.direccion" placeholder="Dirección del paciente"></label>
        </div><div class="k-actions"><button type="button" class="k-button" (click)="guardar()" [disabled]="cargando">{{cargando?'Guardando...':'Guardar paciente'}}</button><button type="button" class="k-button k-button-secondary" (click)="vista='lista'">Cancelar</button></div>
      </section>
    }
    @if(vista==='admitir'){
      <section class="k-panel"><div class="k-section-heading"><div><h2>Admisión de pacientes</h2><p>Confirma la llegada de pacientes con citas programadas o reprogramadas.</p></div></div>
        <div class="k-info">La asistencia se registra durante los 30 minutos previos al inicio del turno. El servidor comprueba ese límite.</div>
        <div class="k-table-wrap"><table class="k-table"><thead><tr><th>Cita</th><th>Fecha</th><th>Hora</th><th>Paciente</th><th>Doctor</th><th>Estado</th><th>Acción</th></tr></thead><tbody>
          @for(c of citas;track c.ID_CITA){@if(c.ESTADO_CITA==='PROGRAMADA'||c.ESTADO_CITA==='REPROGRAMADA'){<tr><td>#{{c.ID_CITA}}</td><td>{{c.FECHA_CITA}}</td><td>{{c.HORA_INICIO}}</td><td>{{c.NOMBRE_PACIENTE}}</td><td>{{c.NOMBRE_DOCTOR}}</td><td><span class="k-status">{{c.ESTADO_CITA}}</span></td><td><button type="button" class="k-button k-button-small" (click)="admitir(c)">Registrar llegada</button></td></tr>}}
          @empty {<tr><td class="k-empty" colspan="7">No hay citas para mostrar.</td></tr>}
        </tbody></table></div>
      </section>
    }
  </div>
</app-shell>
`})
export class PacientesComponent implements OnInit{
 api=inject(ApiService);vista='lista';buscar='';pacientes:Row[]=[];citas:Row[]=[];error='';exito='';cargando=false;
 form:Row={};ngOnInit(){this.cargar()}
 async cargar(){try{[this.pacientes,this.citas]=await Promise.all([this.api.list('pacientes'),this.api.list('citas')]);this.error=''}catch(e){this.error=errorText(e)}}
 filtrados(){const q=this.buscar.toLowerCase();return this.pacientes.filter(x=>(x.NUMERO_DOCUMENTO+' '+x.NOMBRES+' '+x.APELLIDOS).toLowerCase().includes(q))}
 nuevo(){this.form={tipoDocumento:'DNI',numeroDocumento:'',nombres:'',apellidos:'',fechaNacimiento:'',telefono:'',correo:'',direccion:'',estado:'ACTIVO'};this.vista='form';this.error='';this.exito=''}
 editar(p:Row){this.form={idPaciente:p.ID_PACIENTE,tipoDocumento:p.TIPO_DOCUMENTO,numeroDocumento:p.NUMERO_DOCUMENTO,nombres:p.NOMBRES,apellidos:p.APELLIDOS,telefono:p.TELEFONO,correo:p.CORREO,direccion:p.DIRECCION,estado:p.ESTADO};this.vista='form'}
 async guardar(){this.error='';this.cargando=true;try{await this.api.op(this.form.idPaciente?'paciente-editar':'paciente-crear',this.form);this.exito='Paciente guardado correctamente.';this.vista='lista';await this.cargar()}catch(e){this.error=errorText(e)}finally{this.cargando=false}}
 async admitir(c:Row){try{await this.api.op('asistencia-registrar',{idCita:c.ID_CITA});this.exito='Asistencia registrada.';await this.cargar()}catch(e){this.error=errorText(e)}}
}
