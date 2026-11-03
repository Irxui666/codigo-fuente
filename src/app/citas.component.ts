import {Component,inject,OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {ShellComponent} from './shell.component';
import {ApiService,AuthService,Row,errorText} from './core';
@Component({standalone:true,imports:[ShellComponent,FormsModule],template:`
<app-shell><div class="k-module k-citas">
  <header class="k-module-header"><div><span class="k-eyebrow">GESTIÓN CLÍNICA / AGENDA</span><h1 class="k-title">Citas médicas</h1><p class="k-subtitle">Consulta la agenda, reserva turnos y gestiona pagos y reprogramaciones.</p></div><div class="k-header-actions"><button class="k-button k-button-secondary" (click)="cargar()">↻ Actualizar agenda</button></div></header>
  <nav class="k-tabs" aria-label="Operaciones de citas médicas">
    <button class="k-tab" [class.active]="tab==='gestionar'" (click)="tab='gestionar'">Agenda de citas</button>
    @if(auth.session()?.rol!=='CAJERA'){<button class="k-tab" [class.active]="tab==='reservar'" (click)="tab='reservar'">Nueva reserva</button>}
    <button class="k-tab" [class.active]="tab==='confirmar'" (click)="tab='confirmar'">Confirmar pago</button>
    @if(auth.session()?.rol!=='CAJERA'){<button class="k-tab" [class.active]="tab==='reprogramar'" (click)="tab='reprogramar'">Reprogramar cita</button>}
  </nav>
  @if(error){<div class="k-error" role="alert">{{error}}</div>}@if(exito){<div class="k-success" role="status">{{exito}}</div>}
  @if(tab==='gestionar'){
    <section class="k-panel"><div class="k-section-heading"><div><h2>Agenda de citas médicas</h2><p>Consulta los turnos confirmados, estados e importes.</p></div><span class="k-count">{{citasFiltradas().length}} citas</span></div>
      <div class="k-toolbar"><label class="k-search"><span>Buscar una cita</span><input [(ngModel)]="buscar" placeholder="Paciente, doctor o estado" aria-label="Buscar en agenda"></label>
      @if(auth.session()?.rol!=='CAJERA'){<button class="k-button" (click)="tab='reservar'">+ Reservar cita</button>}</div>
      <div class="k-table-wrap"><table class="k-table"><thead><tr><th>Cita</th><th>Fecha</th><th>Inicio</th><th>Paciente</th><th>Doctor</th><th>Consultorio</th><th>Estado</th><th>Importe</th><th>Acción</th></tr></thead><tbody>
        @for(c of citasFiltradas();track c.ID_CITA){<tr><td>#{{c.ID_CITA}}</td><td>{{c.FECHA_CITA}}</td><td>{{c.HORA_INICIO}}</td><td><strong>{{c.NOMBRE_PACIENTE}}</strong></td><td>{{c.NOMBRE_DOCTOR}}</td><td>{{c.CONSULTORIO}}</td><td><span class="k-status" [class.is-active]="c.ESTADO_CITA==='ATENDIDA'">{{c.ESTADO_CITA}}</span></td><td>S/ {{c.MONTO_TOTAL}}</td><td>@if(auth.session()?.rol!=='CAJERA' && c.ESTADO_CITA==='PROGRAMADA'){<button class="k-button k-button-small k-button-secondary" (click)="seleccionarReprogramar(c)">Reprogramar</button>}@else{<span class="k-muted">—</span>}</td></tr>}
        @empty{<tr><td colspan="9" class="k-empty">No se encontraron citas con los filtros actuales.</td></tr>}
      </tbody></table></div>
    </section>
  }
  @if(tab==='reservar'){
    <section class="k-panel"><div class="k-section-heading"><div><h2>1. Solicitar una pre-reserva</h2><p>Selecciona el paciente, la atención médica y el horario.</p></div><span class="k-count">Duración: 10 min</span></div>
      <div class="k-form"><label class="k-field">Paciente<select [(ngModel)]="reserva.idPaciente"><option [ngValue]="null">Selecciona un paciente</option>@for(p of pacientes;track p.ID_PACIENTE){<option [ngValue]="p.ID_PACIENTE">{{p.NOMBRES}} {{p.APELLIDOS}} — {{p.NUMERO_DOCUMENTO}}</option>}</select></label>
      <label class="k-field">Especialidad<select [(ngModel)]="reserva.idEspecialidad"><option [ngValue]="null">Selecciona una especialidad</option>@for(e of especialidades;track e.ID_ESPECIALIDAD){<option [ngValue]="e.ID_ESPECIALIDAD">{{e.NOMBRE}} — S/ {{e.PRECIO_CONSULTA}}</option>}</select></label>
      <label class="k-field">Doctor<select [(ngModel)]="reserva.idDoctor"><option [ngValue]="null">Selecciona un doctor</option>@for(d of doctores;track d.ID_DOCTOR){@if(d.ESTADO_DOCUMENTACION==='COMPLETO'){<option [ngValue]="d.ID_DOCTOR">{{d.NOMBRES}} {{d.APELLIDOS}}</option>}}</select></label>
      <label class="k-field">Consultorio<select [(ngModel)]="reserva.idConsultorio"><option [ngValue]="null">Selecciona un consultorio</option>@for(c of consultorios;track c.ID_CONSULTORIO){<option [ngValue]="c.ID_CONSULTORIO">{{c.NOMBRE}}</option>}</select></label>
      <label class="k-field">Fecha de la cita<input type="date" [(ngModel)]="reserva.fecha"></label>
      <label class="k-field">Turno<select [(ngModel)]="reserva.idFranja"><option [ngValue]="null">Selecciona un horario</option>@for(f of franjas;track f.ID_FRANJA){<option [ngValue]="f.ID_FRANJA">{{f.HORA_INICIO}} – {{f.HORA_FIN}}</option>}</select></label></div>
      <div class="k-info">La disponibilidad y los cruces de horario serán verificados en Oracle.</div>
      <div class="k-actions"><button class="k-button" [disabled]="!reserva.idPaciente || !reserva.idDoctor || !reserva.idEspecialidad || !reserva.idConsultorio || !reserva.idFranja || !reserva.fecha" (click)="preReservar()">Bloquear turno por 10 minutos</button><button class="k-button k-button-secondary" (click)="tab='gestionar'">Cancelar</button></div>
    </section>
  }
  @if(tab==='confirmar'){
    <section class="k-panel"><div class="k-section-heading"><div><h2>2. Confirmar pago y cita</h2><p>Utiliza el número de pre-reserva vigente y el comprobante del cobro verificado.</p></div></div>
      <div class="k-info">Este formulario <strong>no realiza cobros bancarios</strong>. Registra el pago únicamente tras verificarlo externamente.</div>
      <div class="k-form"><label class="k-field">Pre-reserva vigente<select [(ngModel)]="pago.idPreReserva"><option [ngValue]="null">Selecciona una pre-reserva</option>@for(r of reservas;track r.ID_PRE_RESERVA){<option [ngValue]="r.ID_PRE_RESERVA">#{{r.ID_PRE_RESERVA}} · S/ {{r.MONTO}} · vence {{r.FECHA_EXPIRACION}}</option>}</select></label>
      <label class="k-field">Método de pago<select [(ngModel)]="pago.metodoPago"><option>EFECTIVO</option><option>TARJETA</option><option>YAPE</option><option>PLIN</option><option>TRANSFERENCIA</option></select></label>
      <label class="k-field k-field-wide">Referencia del cobro<input [(ngModel)]="pago.referenciaPago" placeholder="Código de operación o recibo verificado"></label></div>
      <div class="k-actions"><button class="k-button" [disabled]="!pago.idPreReserva || !pago.referenciaPago" (click)="confirmarPago()">Registrar pago y confirmar cita</button></div>
    </section>
  }
  @if(tab==='reprogramar'){
    <section class="k-panel"><div class="k-section-heading"><div><h2>Reprogramar una cita</h2><p>El paciente debe aceptar el nuevo turno antes de que comience su cita original.</p></div></div>
      <div class="k-info">Solo se permite una reprogramación por cita y no se registra un segundo cobro.</div>
      <div class="k-form"><label class="k-field k-field-wide">Cita original<select [(ngModel)]="repro.idCita"><option [ngValue]="null">Selecciona una cita programada</option>@for(c of citas;track c.ID_CITA){@if(c.ESTADO_CITA==='PROGRAMADA'){<option [ngValue]="c.ID_CITA">#{{c.ID_CITA}} — {{c.NOMBRE_PACIENTE}} — {{c.FECHA_CITA}}</option>}}</select></label>
      <label class="k-field">Nueva fecha<input type="date" [(ngModel)]="repro.fechaNueva"></label>
      <label class="k-field">Nuevo turno<select [(ngModel)]="repro.idFranjaNueva"><option [ngValue]="null">Selecciona un horario</option>@for(f of franjas;track f.ID_FRANJA){<option [ngValue]="f.ID_FRANJA">{{f.HORA_INICIO}} – {{f.HORA_FIN}}</option>}</select></label>
      <label class="k-field">Nuevo consultorio<select [(ngModel)]="repro.idConsultorioNuevo"><option [ngValue]="null">Selecciona un consultorio</option>@for(c of consultorios;track c.ID_CONSULTORIO){<option [ngValue]="c.ID_CONSULTORIO">{{c.NOMBRE}}</option>}</select></label>
      <label class="k-field">Motivo de reprogramación<input [(ngModel)]="repro.motivo" placeholder="Motivo informado por el paciente"></label>
      <label class="k-field">Aceptación del paciente<select [(ngModel)]="repro.aceptacionPaciente"><option value="N">Pendiente</option><option value="S">Sí, aceptada</option></select></label></div>
      <div class="k-actions"><button class="k-button" [disabled]="repro.aceptacionPaciente!=='S' || !repro.idCita || !repro.fechaNueva || !repro.idFranjaNueva || !repro.idConsultorioNuevo || !repro.motivo" (click)="reprogramar()">Guardar reprogramación</button></div>
    </section>
  }
</div></app-shell>
`})
export class CitasComponent implements OnInit{
 api=inject(ApiService);auth=inject(AuthService);tab='gestionar';error='';exito='';buscar='';pacientes:Row[]=[];doctores:Row[]=[];especialidades:Row[]=[];consultorios:Row[]=[];franjas:Row[]=[];reservas:Row[]=[];citas:Row[]=[];
 reserva:Row={};pago:Row={metodoPago:'EFECTIVO'};repro:Row={aceptacionPaciente:'N'};ngOnInit(){if(this.auth.session()?.rol==='CAJERA')this.tab='confirmar';this.cargar()}
 async cargar(){try{const res=['reservas','citas'];const all=['pacientes','doctores','especialidades','consultorios','franjas',...res];const keys=this.auth.session()?.rol==='CAJERA'?res:all;const rows=await Promise.all(keys.map(k=>this.api.list(k)));for(let j=0;j<keys.length;j++)(this as any)[keys[j]]=rows[j];this.error=''}catch(e){this.error=errorText(e)}}
 citasFiltradas(){const q=this.buscar.toLowerCase();return this.citas.filter(c=>(c.NOMBRE_PACIENTE+' '+c.NOMBRE_DOCTOR+' '+c.ESTADO_CITA).toLowerCase().includes(q))}
 async preReservar(){this.error='';try{const r=await this.api.op('prereserva-crear',this.reserva);this.exito='Pre-reserva #'+r.id+' creada. Debe confirmarse en menos de 10 minutos.';await this.cargar();this.pago.idPreReserva=r.id;this.tab='confirmar'}catch(e){this.error=errorText(e)}}
 async confirmarPago(){this.error='';try{const r=await this.api.op('cita-confirmar',this.pago);this.exito='Cita #'+r.id+' confirmada.';await this.cargar();this.tab='gestionar'}catch(e){this.error=errorText(e)}}
 seleccionarReprogramar(c:Row){this.repro={idCita:c.ID_CITA,aceptacionPaciente:'N',motivo:''};this.tab='reprogramar'}
 async reprogramar(){this.error='';try{await this.api.op('cita-reprogramar',this.repro);this.exito='Cita reprogramada sin nuevo cobro';await this.cargar();this.tab='gestionar'}catch(e){this.error=errorText(e)}}
}
