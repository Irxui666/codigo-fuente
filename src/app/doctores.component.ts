import {Component,inject,OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {ShellComponent} from './shell.component';
import {ApiService,AuthService,Row,errorText} from './core';
@Component({standalone:true,imports:[ShellComponent,FormsModule],template:`
<app-shell><div class="k-module k-doctores">
  <header class="k-module-header"><div><span class="k-eyebrow">GESTIÓN CLÍNICA / PERSONAL MÉDICO</span><h1 class="k-title">Doctores</h1><p class="k-subtitle">Administra médicos, especialidades, documentos y disponibilidad de atención.</p></div><div class="k-header-actions"><button class="k-button k-button-secondary" (click)="cargar()">↻ Actualizar datos</button></div></header>
  <nav class="k-tabs" aria-label="Opciones del módulo Doctores">
    <button class="k-tab" [class.active]="vista==='lista'" (click)="vista='lista'">Listado de doctores</button>
    <button class="k-tab" [class.active]="vista==='form'" (click)="nuevo()">Registrar doctor</button>
    <button class="k-tab" [class.active]="vista==='especialidades'" (click)="vista='especialidades'">Especialidades</button>
    <button class="k-tab" [class.active]="vista==='horarios'" (click)="vista='horarios'">Horarios</button>
    <button class="k-tab" [class.active]="vista==='documentos'" (click)="vista='documentos'">Documentación</button>
  </nav>
  @if(error){<div class="k-error" role="alert">{{error}}</div>}@if(exito){<div class="k-success" role="status">{{exito}}</div>}
  @if(vista==='lista'){
    <section class="k-panel"><div class="k-section-heading"><div><h2>Directorio de doctores</h2><p>Busca y gestiona los datos del personal médico.</p></div><span class="k-count">{{filtrados().length}} resultados</span></div>
      <div class="k-toolbar"><label class="k-search"><span>Buscar doctor</span><input [(ngModel)]="buscar" placeholder="DNI, nombres o apellidos" aria-label="Buscar doctor"></label><button class="k-button" (click)="nuevo()">+ Nuevo doctor</button></div>
      <div class="k-table-wrap"><table class="k-table"><thead><tr><th>ID</th><th>Documento</th><th>Doctor</th><th>Documentación</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>
        @for(d of filtrados();track d.ID_DOCTOR){<tr><td>{{d.ID_DOCTOR}}</td><td>{{d.NUMERO_DOCUMENTO}}</td><td><strong>{{d.NOMBRES}} {{d.APELLIDOS}}</strong></td><td><span class="k-status" [class.is-active]="d.ESTADO_DOCUMENTACION==='COMPLETO'">{{d.ESTADO_DOCUMENTACION}}</span></td><td><span class="k-status" [class.is-active]="d.ESTADO==='ACTIVO'">{{d.ESTADO}}</span></td><td class="k-row-actions"><button class="k-button k-button-small k-button-secondary" (click)="editar(d)">Editar</button><button class="k-button k-button-small k-button-secondary" (click)="verDocumentos(d)">Documentos</button></td></tr>}
        @empty {<tr><td class="k-empty" colspan="6">Todavía no hay doctores registrados o no coinciden con la búsqueda.</td></tr>}
      </tbody></table></div>
    </section>
  }
  @if(vista==='form'){
    <section class="k-panel"><div class="k-section-heading"><div><h2>{{doctorForm.idDoctor?'Editar médico':'Registrar nuevo médico'}}</h2><p>Datos de identificación y contacto profesional.</p></div></div><div class="k-form">
      <label class="k-field">Tipo de documento<select [(ngModel)]="doctorForm.tipoDocumento" [disabled]="!!doctorForm.idDoctor"><option>DNI</option><option>CE</option></select></label><label class="k-field">Número de documento<input [(ngModel)]="doctorForm.numeroDocumento" [disabled]="!!doctorForm.idDoctor"></label>
      <label class="k-field">Nombres<input [(ngModel)]="doctorForm.nombres"></label><label class="k-field">Apellidos<input [(ngModel)]="doctorForm.apellidos"></label>
      <label class="k-field">Teléfono<input [(ngModel)]="doctorForm.telefono"></label><label class="k-field">Correo electrónico<input type="email" [(ngModel)]="doctorForm.correo"></label>
      <label class="k-field">ID del usuario médico (opcional)<input type="number" [(ngModel)]="doctorForm.idUsuario"></label>
      @if(doctorForm.idDoctor){<label class="k-field">Estado<select [(ngModel)]="doctorForm.estado"><option>ACTIVO</option><option>INACTIVO</option></select></label>}
    </div><div class="k-actions"><button class="k-button" (click)="guardarDoctor()">Guardar doctor</button>@if(doctorForm.idDoctor && doctorForm.idUsuario){<button class="k-button k-button-secondary" (click)="vincularUsuario()">Vincular usuario médico</button>}<button class="k-button k-button-secondary" (click)="vista='lista'">Volver al listado</button></div></section>
  }
  @if(vista==='especialidades'){
    <section class="k-panel"><div class="k-section-heading"><div><h2>Asignación de especialidades</h2><p>Relaciona a cada médico con las especialidades que tiene habilitadas.</p></div></div>
      <div class="k-form"><label class="k-field">Doctor<select [(ngModel)]="especialidadForm.idDoctor"><option [ngValue]="null">Selecciona un doctor</option>@for(d of doctores;track d.ID_DOCTOR){<option [ngValue]="d.ID_DOCTOR">{{d.NOMBRES}} {{d.APELLIDOS}}</option>}</select></label>
      <label class="k-field">Especialidad<select [(ngModel)]="especialidadForm.idEspecialidad"><option [ngValue]="null">Selecciona una especialidad</option>@for(e of especialidades;track e.ID_ESPECIALIDAD){<option [ngValue]="e.ID_ESPECIALIDAD">{{e.NOMBRE}}</option>}</select></label></div>
      <div class="k-actions"><button class="k-button" [disabled]="!especialidadForm.idDoctor || !especialidadForm.idEspecialidad" (click)="asignarEspecialidad()">Asignar especialidad</button></div>
    </section>
  }
  @if(vista==='horarios'){
    <section class="k-panel"><div class="k-section-heading"><div><h2>Disponibilidad médica</h2><p>Configura las fechas y turnos de atención para cada médico.</p></div></div>
      <div class="k-form"><label class="k-field">Doctor<select [(ngModel)]="horario.idDoctor"><option [ngValue]="null">Selecciona un doctor</option>@for(d of doctores;track d.ID_DOCTOR){<option [ngValue]="d.ID_DOCTOR">{{d.NOMBRES}} {{d.APELLIDOS}}</option>}</select></label>
      <label class="k-field">Fecha de atención<input type="date" [(ngModel)]="horario.fecha"></label>
      <label class="k-field">Franja horaria<select [(ngModel)]="horario.idFranja"><option [ngValue]="null">Selecciona un turno</option>@for(f of franjas;track f.ID_FRANJA){<option [ngValue]="f.ID_FRANJA">{{f.HORA_INICIO}} – {{f.HORA_FIN}}</option>}</select></label></div>
      <div class="k-actions"><button class="k-button" [disabled]="!horario.idDoctor || !horario.fecha || !horario.idFranja" (click)="registrarHorario()">Registrar disponibilidad</button></div>
    </section>
    <section class="k-panel"><div class="k-section-heading"><div><h2>Horarios registrados</h2><p>Disponibilidades activas e históricas registradas.</p></div></div><div class="k-table-wrap"><table class="k-table"><thead><tr><th>Doctor</th><th>Fecha</th><th>Inicio</th><th>Fin</th><th>Estado</th></tr></thead><tbody>@for(h of disponibilidades;track h.ID_DISPONIBILIDAD){<tr><td>{{h.NOMBRE_DOCTOR}}</td><td>{{h.FECHA_TURNO}}</td><td>{{h.HORA_INICIO}}</td><td>{{h.HORA_FIN}}</td><td><span class="k-status">{{h.ESTADO}}</span></td></tr>}@empty{<tr><td colspan="5" class="k-empty">Todavía no se registraron horarios.</td></tr>}</tbody></table></div></section>
  }
  @if(vista==='documentos'){
    <section class="k-panel"><div class="k-section-heading"><div><h2>Documentación de doctores</h2><p>Adjunta y valida los documentos requeridos para habilitar atención.</p></div></div>
      <div class="k-form"><label class="k-field">Doctor<select [(ngModel)]="selectedDoctor" (ngModelChange)="cargarDocumentos()"><option [ngValue]="0">Selecciona un doctor</option>@for(d of doctores;track d.ID_DOCTOR){<option [ngValue]="d.ID_DOCTOR">{{d.NOMBRES}} {{d.APELLIDOS}} — {{d.ESTADO_DOCUMENTACION}}</option>}</select></label>
      <label class="k-field">Tipo de documento<select [(ngModel)]="tipoDocumento"><option>DNI</option><option value="TITULO">Título profesional</option><option>OTRO</option></select></label>
      <label class="k-field">Archivo (PDF / imagen)<input type="file" accept="application/pdf,image/png,image/jpeg" (change)="cambiarArchivo($event)"></label></div>
      <div class="k-actions"><button class="k-button" [disabled]="!selectedDoctor || !archivo" (click)="subirDocumento()">Adjuntar documento</button><button class="k-button k-button-secondary" [disabled]="!selectedDoctor" (click)="aprobarDoctor()">Validar DNI y título</button></div>
    </section>
    <section class="k-panel"><div class="k-section-heading"><div><h2>Documentos del médico seleccionado</h2><p>Estado de los archivos recibidos y validados.</p></div></div>
      <div class="k-table-wrap"><table class="k-table"><thead><tr><th>Tipo</th><th>Nombre del archivo</th><th>Estado</th></tr></thead><tbody>@for(d of documentos;track d.ID_DOCUMENTO){<tr><td>{{d.TIPO_DOCUMENTO}}</td><td>{{d.NOMBRE_ARCHIVO}}</td><td><span class="k-status" [class.is-active]="d.ESTADO==='VALIDADO'">{{d.ESTADO}}</span></td></tr>}@empty{<tr><td class="k-empty" colspan="3">Selecciona un médico para consultar sus documentos.</td></tr>}</tbody></table></div>
    </section>
  }
</div></app-shell>
`})
export class DoctoresComponent implements OnInit{
 api=inject(ApiService);auth=inject(AuthService);vista='lista';buscar='';doctores:Row[]=[];especialidades:Row[]=[];franjas:Row[]=[];disponibilidades:Row[]=[];documentos:Row[]=[];error='';exito='';selectedDoctor=0;tipoDocumento='DNI';archivo:File|null=null;
 doctorForm:Row={};horario:Row={};especialidadForm:Row={};ngOnInit(){this.cargar()}
 async cargar(){try{[this.doctores,this.especialidades,this.franjas,this.disponibilidades]=await Promise.all([this.api.list('doctores'),this.api.list('especialidades'),this.api.list('franjas'),this.api.list('disponibilidades')])}catch(e){this.error=errorText(e)}}
 filtrados(){const q=this.buscar.toLowerCase();return this.doctores.filter(d=>(d.NOMBRES+' '+d.APELLIDOS+' '+d.NUMERO_DOCUMENTO).toLowerCase().includes(q))}
 nuevo(){this.doctorForm={tipoDocumento:'DNI',numeroDocumento:'',nombres:'',apellidos:'',telefono:'',correo:'',estado:'ACTIVO'};this.vista='form'}
 editar(d:Row){this.doctorForm={idDoctor:d.ID_DOCTOR,tipoDocumento:d.TIPO_DOCUMENTO,numeroDocumento:d.NUMERO_DOCUMENTO,nombres:d.NOMBRES,apellidos:d.APELLIDOS,telefono:d.TELEFONO,correo:d.CORREO,idUsuario:d.ID_USUARIO,estado:d.ESTADO};this.vista='form'}
 async run(action:string,data:Row,msg='Operación realizada'){this.error='';try{await this.api.op(action,data);this.exito=msg;await this.cargar()}catch(e){this.error=errorText(e)}}
 async guardarDoctor(){await this.run(this.doctorForm.idDoctor?'doctor-editar':'doctor-crear',this.doctorForm,'Doctor registrado');if(!this.error)this.vista='lista'}
 async vincularUsuario(){await this.run('doctor-vincular-usuario',{idDoctor:this.doctorForm.idDoctor,idUsuario:this.doctorForm.idUsuario},'Usuario médico vinculado')}
 async registrarHorario(){await this.run('disponibilidad-registrar',this.horario,'Horario registrado')}
 async asignarEspecialidad(){await this.run('doctor-especialidad',this.especialidadForm,'Especialidad asignada')}
 async verDocumentos(d:Row){this.selectedDoctor=d.ID_DOCTOR;this.vista='documentos';await this.cargarDocumentos()}
 async cargarDocumentos(){if(!this.selectedDoctor)return;try{this.documentos=await this.api.docs(this.selectedDoctor)}catch(e){this.error=errorText(e)}}
 cambiarArchivo(e:Event){this.archivo=(e.target as HTMLInputElement).files?.item(0)||null}
 async subirDocumento(){if(!this.archivo)return;try{await this.api.upload(this.selectedDoctor,this.tipoDocumento,this.archivo);this.exito='Documento recibido';this.archivo=null;await this.cargarDocumentos();await this.cargar()}catch(e){this.error=errorText(e)}}
 async aprobarDoctor(){await this.run('doctor-validar',{idDoctor:this.selectedDoctor},'Documentación validada');await this.cargarDocumentos()}
}
