import {Component,inject,OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {ShellComponent} from './shell.component';
import {ApiService,Row,errorText} from './core';
@Component({standalone:true,imports:[ShellComponent,FormsModule],template:`
<app-shell><div class="k-module k-finanzas">
  <header class="k-module-header"><div><span class="k-eyebrow">GESTIÓN ECONÓMICA / FINANZAS</span><h1 class="k-title">Área financiera</h1><p class="k-subtitle">Controla liquidaciones, pagos a médicos e ingresos registrados de la gestora.</p></div><div class="k-header-actions"><button class="k-button k-button-secondary" (click)="cargar()">↻ Actualizar registros</button></div></header>
  <nav class="k-tabs" aria-label="Operaciones financieras"><button class="k-tab" [class.active]="tab==='resumen'" (click)="tab='resumen'">Resumen</button><button class="k-tab" [class.active]="tab==='sumar'" (click)="tab='sumar'">Nueva liquidación</button><button class="k-tab" [class.active]="tab==='pagar'" (click)="tab='pagar'">Pago a médicos</button><button class="k-tab" [class.active]="tab==='ingresos'" (click)="tab='ingresos'">Ingresos de gestora</button></nav>
  @if(error){<div class="k-error" role="alert">{{error}}</div>}@if(exito){<div class="k-success" role="status">{{exito}}</div>}
  @if(tab==='resumen'){
    <div class="k-overview"><div class="k-overview-card"><span>Liquidaciones registradas</span><strong>{{liquidaciones.length}}</strong><small>Liquidaciones de médicos</small></div><div class="k-overview-card"><span>Movimientos de gestora</span><strong>{{ingresos.length}}</strong><small>Ingresos contables registrados</small></div></div>
    <section class="k-panel"><div class="k-section-heading"><div><h2>Liquidaciones y saldos</h2><p>Revisa los importes calculados y los pagos pendientes.</p></div><button class="k-button" (click)="tab='sumar'">+ Nueva liquidación</button></div>
      <div class="k-table-wrap"><table class="k-table"><thead><tr><th>Liquidación</th><th>Doctor</th><th>Citas atendidas</th><th>Monto médico</th><th>Saldo pendiente</th><th>Estado</th></tr></thead><tbody>
        @for(l of liquidaciones;track l.ID_LIQUIDACION){<tr><td>#{{l.ID_LIQUIDACION}}</td><td><strong>{{l.NOMBRE_DOCTOR}}</strong></td><td>{{l.TOTAL_ATENDIDO}}</td><td>S/ {{l.MONTO_DOCTOR}}</td><td><strong>S/ {{l.SALDO_PENDIENTE}}</strong></td><td><span class="k-status" [class.is-active]="l.ESTADO_LIQUIDACION==='PAGADA'">{{l.ESTADO_LIQUIDACION}}</span></td></tr>}
        @empty{<tr><td class="k-empty" colspan="6">Todavía no hay liquidaciones registradas.</td></tr>}
      </tbody></table></div>
    </section>
  }
  @if(tab==='sumar'){
    <section class="k-panel"><div class="k-section-heading"><div><h2>Generar liquidación por médico</h2><p>Define al médico y el período que debe liquidarse.</p></div></div>
      <div class="k-info">Solo se incluyen citas <strong>ATENDIDAS</strong>, con atención cerrada y recibo entregado, según las reglas de Oracle.</div>
      <div class="k-form"><label class="k-field">Doctor<select [(ngModel)]="liq.idDoctor"><option [ngValue]="null">Selecciona un médico</option>@for(d of doctores;track d.ID_DOCTOR){<option [ngValue]="d.ID_DOCTOR">{{d.NOMBRES}} {{d.APELLIDOS}}</option>}</select></label><label class="k-field">Fecha de inicio<input type="date" [(ngModel)]="liq.fechaInicio"></label><label class="k-field">Fecha de fin<input type="date" [(ngModel)]="liq.fechaFin"></label></div>
      <div class="k-actions"><button class="k-button" [disabled]="!liq.idDoctor || !liq.fechaInicio || !liq.fechaFin" (click)="generarLiquidacion()">Generar liquidación</button><button class="k-button k-button-secondary" (click)="tab='resumen'">Volver al resumen</button></div>
    </section>
  }
  @if(tab==='pagar'){
    <section class="k-panel"><div class="k-section-heading"><div><h2>Registrar pago a médico</h2><p>Registra la operación y la boleta emitida para una liquidación.</p></div></div>
      <div class="k-form"><label class="k-field k-field-wide">Liquidación<select [(ngModel)]="pago.idLiquidacion"><option [ngValue]="null">Selecciona una liquidación</option>@for(l of liquidaciones;track l.ID_LIQUIDACION){<option [ngValue]="l.ID_LIQUIDACION">#{{l.ID_LIQUIDACION}} — {{l.NOMBRE_DOCTOR}} — Saldo S/ {{l.SALDO_PENDIENTE}}</option>}</select></label>
      <label class="k-field">Monto a pagar (S/)<input type="number" min="0.01" step="0.01" [(ngModel)]="pago.monto"></label>
      <label class="k-field">Método de pago<select [(ngModel)]="pago.metodoPago"><option>TRANSFERENCIA</option><option>EFECTIVO</option></select></label>
      <label class="k-field">Número de operación<input [(ngModel)]="pago.numeroOperacion"></label>
      <label class="k-field">Número de boleta<input [(ngModel)]="pago.numeroBoleta"></label></div>
      <div class="k-actions"><button class="k-button" [disabled]="!pago.idLiquidacion || !pago.monto || !pago.numeroOperacion || !pago.numeroBoleta" (click)="registrarPago()">Registrar pago</button></div>
    </section>
    <section class="k-panel"><div class="k-section-heading"><div><h2>Control de saldos</h2><p>Liquidaciones disponibles y su estado de pago.</p></div></div>
      <div class="k-table-wrap"><table class="k-table"><thead><tr><th>Liquidación</th><th>Doctor</th><th>Monto médico</th><th>Saldo</th><th>Estado</th></tr></thead><tbody>@for(l of liquidaciones;track l.ID_LIQUIDACION){<tr><td>#{{l.ID_LIQUIDACION}}</td><td>{{l.NOMBRE_DOCTOR}}</td><td>S/ {{l.MONTO_DOCTOR}}</td><td>S/ {{l.SALDO_PENDIENTE}}</td><td><span class="k-status">{{l.ESTADO_LIQUIDACION}}</span></td></tr>}@empty{<tr><td colspan="5" class="k-empty">No hay liquidaciones disponibles.</td></tr>}</tbody></table></div>
    </section>
  }
  @if(tab==='ingresos'){
    <section class="k-panel"><div class="k-section-heading"><div><h2>Ingresos de la gestora</h2><p>Comisiones y movimientos registrados conforme a las reglas de negocio.</p></div></div>
      <div class="k-info">Los importes mostrados son registros contables del sistema; no sustituyen una conciliación bancaria.</div>
      <div class="k-table-wrap"><table class="k-table"><thead><tr><th>Fecha</th><th>Concepto</th><th>Monto (S/)</th><th>Liquidación</th></tr></thead><tbody>@for(r of ingresos;track $index){<tr><td>{{r.FECHA_REGISTRO}}</td><td>{{r.CONCEPTO}}</td><td><strong>S/ {{r.MONTO_INGRESO}}</strong></td><td>{{r.ID_LIQUIDACION || '—'}}</td></tr>}@empty{<tr><td class="k-empty" colspan="4">No hay ingresos registrados.</td></tr>}</tbody></table></div>
    </section>
  }
</div></app-shell>
`})
export class FinanzasComponent implements OnInit{
 api=inject(ApiService);tab='resumen';error='';exito='';doctores:Row[]=[];liquidaciones:Row[]=[];ingresos:Row[]=[];liq:Row={};pago:Row={metodoPago:'TRANSFERENCIA'};
 ngOnInit(){this.cargar()}
 async cargar(){try{[this.doctores,this.liquidaciones,this.ingresos]=await Promise.all(['doctores','liquidaciones','ingresos'].map(x=>this.api.list(x)))}catch(e){this.error=errorText(e)}}
 async generarLiquidacion(){this.error='';try{const r=await this.api.op('liquidacion-generar',this.liq);this.exito='Liquidación creada: '+r.id;await this.cargar();this.tab='pagar'}catch(e){this.error=errorText(e)}}
 async registrarPago(){this.error='';try{const r=await this.api.op('doctor-pagar',this.pago);this.exito='Pago registrado: '+r.id;await this.cargar()}catch(e){this.error=errorText(e)}}
}
