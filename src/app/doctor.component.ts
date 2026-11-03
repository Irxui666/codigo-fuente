import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ShellComponent } from './shell.component';
import { ApiService, AuthService, Row, errorText } from './core';

type PestanaMedica = 'citas' | 'horarios' | 'consultas';

@Component({
  standalone: true,
  imports: [ShellComponent, FormsModule],
  styleUrls: ['./doctor-panel.component.css'],
  template: `
    <app-shell>
      <div class="k-module k-doctor">
        <header class="k-module-header">
          <div>
            <span class="k-eyebrow">KARELY / PORTAL DEL MÉDICO</span>
            <h1 class="k-title">Panel Médico</h1>
            <p class="k-subtitle">Consulta tus citas, administra tu disponibilidad y registra atenciones médicas.</p>
            <p class="doctor-identidad">Médico: <strong>{{ nombreDoctor }}</strong></p>
          </div>
          <div class="k-header-actions">
            <span class="k-count">{{ citas.length }} citas asignadas</span>
            <button type="button" class="k-button k-button-secondary" (click)="cargar()" [disabled]="cargando || procesando">
              {{ cargando ? 'Actualizando…' : '↻ Actualizar datos' }}
            </button>
          </div>
        </header>

        <nav class="k-tabs doctor-tabs" aria-label="Secciones del panel médico">
          <button type="button" class="k-tab" [class.active]="tab === 'citas'" [attr.aria-current]="tab === 'citas' ? 'page' : null" (click)="cambiarTab('citas')">Mis citas</button>
          <button type="button" class="k-tab" [class.active]="tab === 'horarios'" [attr.aria-current]="tab === 'horarios' ? 'page' : null" (click)="cambiarTab('horarios')">Gestión de disponibilidad</button>
          <button type="button" class="k-tab" [class.active]="tab === 'consultas'" [attr.aria-current]="tab === 'consultas' ? 'page' : null" (click)="cambiarTab('consultas')">Mis consultas</button>
        </nav>

        @if (error) { <div class="k-error" role="alert">{{ error }}</div> }
        @if (exito) { <div class="k-success" role="status">{{ exito }}</div> }
        @if (!doctor) {
          <div class="k-info" role="status">
            Esta cuenta todavía no está vinculada con un registro médico. Solicita a Administración que vincule el usuario con su ID_DOCTOR.
          </div>
        }

        @if (tab === 'citas') {
          <section class="k-panel" aria-labelledby="titulo-mis-citas">
            <div class="k-section-heading">
              <div>
                <h2 id="titulo-mis-citas">Mis citas asignadas</h2>
                <p>Consulta el horario, el paciente y el estado de cada cita.</p>
              </div>
              <span class="k-count">{{ citasFiltradas.length }} registros</span>
            </div>

            <div class="k-toolbar">
              <label class="k-search">
                <span>Buscar en mis citas</span>
                <input type="search" [(ngModel)]="busqueda" placeholder="Paciente, fecha, estado o ID" />
              </label>
              <button type="button" class="k-button k-button-secondary" (click)="cargar()" [disabled]="cargando">Actualizar listado</button>
            </div>

            <div class="k-table-wrap">
              <table class="k-table">
                <thead><tr>
                  <th scope="col">Cita</th><th scope="col">Fecha</th><th scope="col">Hora</th>
                  <th scope="col">Paciente</th><th scope="col">Estado</th><th scope="col">Acción</th>
                </tr></thead>
                <tbody>
                  @for (c of citasFiltradas; track c.ID_CITA) {
                    <tr>
                      <td><strong>#{{ c.ID_CITA }}</strong></td>
                      <td>{{ fechaLegible(c.FECHA_CITA) }}</td>
                      <td>{{ c.HORA_INICIO || '—' }}</td>
                      <td>{{ c.NOMBRE_PACIENTE || '—' }}</td>
                      <td><span class="k-status" [class.is-active]="c.ESTADO_CITA === 'ATENDIDA'">{{ estadoLegible(c.ESTADO_CITA) }}</span></td>
                      <td class="k-row-actions">
                        @if (c.ESTADO_CITA === 'EN_ATENCION') {
                          <button type="button" class="k-button k-button-small" (click)="seleccionar(c)">Ir a consulta</button>
                        } @else {
                          <span class="k-muted">Sin acción disponible</span>
                        }
                      </td>
                    </tr>
                  } @empty {
                    <tr><td colspan="6" class="k-empty">Aún no hay citas asignadas o la búsqueda no encontró resultados.</td></tr>
                  }
                </tbody>
              </table>
            </div>
            <p class="doctor-help">Una cita pasa a «En atención» cuando recepción registra la asistencia del paciente. Solo entonces puede iniciarse la consulta.</p>
          </section>
        }

        @if (tab === 'horarios') {
          <section class="k-panel k-panel-highlight" aria-labelledby="titulo-nuevo-horario">
            <div class="k-section-heading">
              <div>
                <h2 id="titulo-nuevo-horario">Registrar disponibilidad</h2>
                <p>Selecciona una fecha y una franja horaria sin cruces.</p>
              </div>
              <span class="k-status" [class.is-active]="doctor?.ESTADO_DOCUMENTACION === 'COMPLETO'">
                Documentación: {{ doctor?.ESTADO_DOCUMENTACION || 'No vinculada' }}
              </span>
            </div>

            @if (doctor && doctor.ESTADO_DOCUMENTACION !== 'COMPLETO') {
              <div class="k-info">Para registrar horarios debes tener DNI y título validados por Administración.</div>
            }

            <div class="k-form">
              <label class="k-field">Médico asociado
                <input [value]="nombreDoctor" disabled />
              </label>
              <label class="k-field">Fecha del turno
                <input type="date" [(ngModel)]="horario.fecha" [disabled]="!puedeRegistrarHorario || procesando" />
              </label>
              <label class="k-field">Franja horaria
                <select [(ngModel)]="horario.idFranja" [disabled]="!puedeRegistrarHorario || procesando">
                  <option [ngValue]="null">Selecciona un horario</option>
                  @for (f of franjas; track f.ID_FRANJA) {
                    <option [ngValue]="f.ID_FRANJA">{{ f.HORA_INICIO }} – {{ f.HORA_FIN }}</option>
                  }
                </select>
              </label>
            </div>
            <div class="k-actions">
              <button type="button" class="k-button" (click)="guardarHorario()" [disabled]="!puedeRegistrarHorario || !horario.fecha || !horario.idFranja || procesando">
                {{ procesando ? 'Guardando…' : '+ Guardar disponibilidad' }}
              </button>
            </div>
          </section>

          <section class="k-panel" aria-labelledby="titulo-horarios-registrados">
            <div class="k-section-heading">
              <div><h2 id="titulo-horarios-registrados">Horarios registrados</h2><p>Disponibilidad asociada a tu cuenta médica.</p></div>
              <span class="k-count">{{ disponibles.length }} horarios</span>
            </div>
            <div class="k-table-wrap">
              <table class="k-table">
                <thead><tr><th scope="col">Fecha</th><th scope="col">Desde</th><th scope="col">Hasta</th><th scope="col">Estado</th></tr></thead>
                <tbody>
                  @for (h of disponibles; track h.ID_DISPONIBILIDAD) {
                    <tr><td>{{ fechaLegible(h.FECHA_TURNO) }}</td><td>{{ h.HORA_INICIO }}</td><td>{{ h.HORA_FIN }}</td><td><span class="k-status" [class.is-active]="h.ESTADO === 'ACTIVO'">{{ h.ESTADO }}</span></td></tr>
                  } @empty {
                    <tr><td colspan="4" class="k-empty">Todavía no tienes horarios registrados para el período consultado.</td></tr>
                  }
                </tbody>
              </table>
            </div>
          </section>
        }

        @if (tab === 'consultas') {
          <section class="k-panel k-panel-highlight" aria-labelledby="titulo-seleccionar-cita">
            <div class="k-section-heading">
              <div><h2 id="titulo-seleccionar-cita">1. Seleccionar una consulta</h2><p>Solo se puede atender una cita con asistencia registrada por recepción.</p></div>
              <span class="k-count">{{ citasEnAtencion.length }} por atender</span>
            </div>
            <div class="k-form doctor-consulta-select">
              <label class="k-field">Cita habilitada
                <select [(ngModel)]="medico.idCita" (ngModelChange)="limpiarDetalleConsulta()" [disabled]="procesando">
                  <option [ngValue]="null">Selecciona una cita en atención</option>
                  @for (c of citasEnAtencion; track c.ID_CITA) {
                    <option [ngValue]="c.ID_CITA">#{{ c.ID_CITA }} — {{ c.NOMBRE_PACIENTE }} ({{ fechaLegible(c.FECHA_CITA) }})</option>
                  }
                </select>
              </label>
              <div class="doctor-estado-consulta">
                <span class="doctor-label">Estado de la atención</span>
                <strong>{{ estadoAtencionActual }}</strong>
              </div>
            </div>
            <div class="k-actions">
              <button type="button" class="k-button" (click)="accion('atencion-iniciar')" [disabled]="!citaListaParaAtender || !!atencionActual || procesando">
                Iniciar atención médica
              </button>
            </div>
          </section>

          @if (!medico.idCita) {
            <div class="k-info">Selecciona una cita en atención para habilitar diagnóstico, receta y recibo de honorarios.</div>
          }

          <section class="k-panel" aria-labelledby="titulo-diagnostico">
            <div class="k-section-heading"><div><h2 id="titulo-diagnostico">2. Información clínica</h2><p>Registra diagnóstico y observaciones del paciente.</p></div></div>
            <div class="k-form doctor-clinica-form">
              <label class="k-field">Diagnóstico
                <textarea rows="5" [(ngModel)]="medico.diagnostico" [disabled]="!atencionAbierta || procesando" placeholder="Escribe el diagnóstico..."></textarea>
              </label>
              <label class="k-field">Observaciones
                <textarea rows="5" [(ngModel)]="medico.observaciones" [disabled]="!atencionAbierta || procesando" placeholder="Observaciones complementarias..."></textarea>
              </label>
            </div>
            <div class="k-actions"><button type="button" class="k-button" (click)="accion('diagnostico-registrar')" [disabled]="!atencionAbierta || !medico.diagnostico?.trim() || procesando">Guardar diagnóstico</button></div>
          </section>

          <section class="k-panel" aria-labelledby="titulo-receta">
            <div class="k-section-heading"><div><h2 id="titulo-receta">3. Receta médica</h2><p>Primero crea la receta y luego añade los medicamentos indicados.</p></div></div>
            <div class="k-form doctor-receta-form">
              <label class="k-field k-field-wide">Indicaciones generales
                <textarea rows="3" [(ngModel)]="medico.indicaciones" [disabled]="!atencionAbierta || procesando" placeholder="Indicaciones para el paciente..."></textarea>
              </label>
              <label class="k-field">ID de receta
                <input type="number" min="1" [(ngModel)]="medico.idReceta" [disabled]="!atencionAbierta || procesando" placeholder="Se completa al crearla" />
              </label>
            </div>
            <p class="doctor-help">Si retomaste una consulta en otra sesión, introduce el ID de la receta que ya habías creado; el sistema no genera otra automáticamente.</p>
            <div class="k-actions"><button type="button" class="k-button" (click)="accion('receta-crear')" [disabled]="!atencionAbierta || !medico.indicaciones?.trim() || !!medico.idReceta || procesando">Crear receta</button></div>
            <h3 class="doctor-subtitulo">Agregar medicamento</h3>
            <div class="k-form doctor-medicamento-form">
              <label class="k-field">Medicamento<input [(ngModel)]="medico.medicamento" [disabled]="!atencionAbierta || procesando" /></label>
              <label class="k-field">Dosis<input [(ngModel)]="medico.dosis" [disabled]="!atencionAbierta || procesando" /></label>
              <label class="k-field">Frecuencia<input [(ngModel)]="medico.frecuencia" [disabled]="!atencionAbierta || procesando" /></label>
              <label class="k-field">Duración<input [(ngModel)]="medico.duracion" [disabled]="!atencionAbierta || procesando" /></label>
              <label class="k-field">Observaciones del medicamento (opcional)<input [(ngModel)]="medico.observacionesMedicamento" [disabled]="!atencionAbierta || procesando" /></label>
            </div>
            <div class="k-actions">
              <button type="button" class="k-button k-button-secondary" (click)="accion('medicamento-agregar')"
                [disabled]="!atencionAbierta || !medico.idReceta || !medico.medicamento?.trim() || !medico.dosis?.trim() || !medico.frecuencia?.trim() || !medico.duracion?.trim() || procesando">
                + Agregar medicamento a la receta
              </button>
            </div>
          </section>

          <section class="k-panel" aria-labelledby="titulo-recibo">
            <div class="k-section-heading"><div><h2 id="titulo-recibo">4. Recibo y cierre</h2><p>Emite y registra la entrega del recibo antes de cerrar la consulta.</p></div></div>
            <div class="k-form">
              <label class="k-field">Número de recibo
                <input [(ngModel)]="medico.numeroRecibo" [disabled]="!atencionAbierta || procesando" placeholder="Número del comprobante" />
              </label>
              <label class="k-field">Medio de entrega
                <select [(ngModel)]="medico.medioEntrega" [disabled]="!atencionAbierta || procesando">
                  <option value="EMAIL">Correo electrónico</option>
                  <option value="PRESENCIAL">Presencial</option>
                </select>
              </label>
            </div>
            <div class="k-actions">
              <button type="button" class="k-button k-button-secondary" (click)="accion('recibo-emitir')" [disabled]="!atencionAbierta || !medico.numeroRecibo?.trim() || procesando">Emitir recibo</button>
              <button type="button" class="k-button k-button-secondary" (click)="accion('recibo-entregar')" [disabled]="!atencionAbierta || procesando">Registrar entrega</button>
              <button type="button" class="k-button doctor-cerrar" (click)="accion('atencion-cerrar')" [disabled]="!atencionAbierta || procesando">Cerrar atención</button>
            </div>
            <div class="k-info doctor-advertencia">Oracle comprobará que exista un diagnóstico, una receta con medicamentos y un recibo entregado antes de permitir el cierre.</div>
          </section>
        }
      </div>
    </app-shell>
  `
})
export class DoctorComponent implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);

  tab: PestanaMedica = 'citas';
  busqueda = '';
  error = '';
  exito = '';
  cargando = false;
  procesando = false;
  citas: Row[] = [];
  doctor: Row | undefined;
  franjas: Row[] = [];
  disponibles: Row[] = [];
  atenciones: Row[] = [];
  horario: Row = { fecha: '', idFranja: null };
  medico: Row = { idCita: null, medioEntrega: 'EMAIL' };

  get nombreDoctor(): string {
    return this.doctor ? `${this.doctor.NOMBRES} ${this.doctor.APELLIDOS}` : 'Sin médico asociado';
  }
  get citasFiltradas(): Row[] {
    const q = this.busqueda.trim().toLowerCase();
    return !q ? this.citas : this.citas.filter(c =>
      [c.ID_CITA, c.FECHA_CITA, c.NOMBRE_PACIENTE, c.ESTADO_CITA]
        .some(v => String(v ?? '').toLowerCase().includes(q)));
  }
  get citasEnAtencion(): Row[] {
    return this.citas.filter(c => c.ESTADO_CITA === 'EN_ATENCION');
  }
  get citaSeleccionada(): Row | undefined {
    return this.citasEnAtencion.find(c => Number(c.ID_CITA) === Number(this.medico.idCita));
  }
  get citaListaParaAtender(): boolean {
    return !!this.doctor && !!this.citaSeleccionada;
  }
  get atencionActual(): Row | undefined {
    return this.atenciones.find(a => Number(a.ID_CITA) === Number(this.medico.idCita));
  }
  get atencionAbierta(): boolean {
    return this.citaListaParaAtender && this.atencionActual?.ESTADO === 'ABIERTA';
  }
  get estadoAtencionActual(): string {
    if (!this.medico.idCita) return 'Sin cita seleccionada';
    if (!this.citaSeleccionada) return 'La cita no está habilitada';
    if (this.atencionActual?.ESTADO === 'ABIERTA') return 'Atención abierta';
    if (this.atencionActual?.ESTADO === 'CERRADA') return 'Atención cerrada';
    return 'Pendiente de inicio';
  }
  get puedeRegistrarHorario(): boolean {
    return !!this.doctor && this.doctor.ESTADO === 'ACTIVO' &&
      this.doctor.ESTADO_DOCUMENTACION === 'COMPLETO';
  }

  ngOnInit(): void { void this.cargar(); }

  cambiarTab(tab: PestanaMedica): void {
    this.tab = tab;
    this.error = '';
    this.exito = '';
  }

  fechaLegible(valor: unknown): string {
    if (valor == null) return '—';
    const txt = String(valor).slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(txt)) {
      const [anio, mes, dia] = txt.split('-');
      return `${dia}/${mes}/${anio}`;
    }
    return String(valor);
  }
  estadoLegible(valor: unknown): string {
    return String(valor ?? '—').replace(/_/g, ' ');
  }

  async cargar(): Promise<void> {
    if (this.cargando) return;
    this.cargando = true;
    this.error = '';
    try {
      const [citas, doctores, franjas, disp, atenciones] = await Promise.all([
        this.api.list('citas'), this.api.list('doctores'), this.api.list('franjas'),
        this.api.list('disponibilidades'), this.api.list('atenciones')
      ]);
      this.citas = citas;
      this.doctor = doctores.find(d => Number(d.ID_USUARIO) === Number(this.auth.session()?.idUsuario));
      this.franjas = franjas;
      this.disponibles = disp.filter(d => Number(d.ID_DOCTOR) === Number(this.doctor?.ID_DOCTOR));
      this.atenciones = atenciones;
      this.horario.idDoctor = this.doctor?.ID_DOCTOR ?? null;
    } catch (e) {
      this.error = errorText(e);
    } finally {
      this.cargando = false;
    }
  }

  seleccionar(cita: Row): void {
    this.medico = { idCita: cita.ID_CITA, medioEntrega: 'EMAIL' };
    this.cambiarTab('consultas');
  }

  limpiarDetalleConsulta(): void {
    const id = this.medico.idCita;
    this.medico = { idCita: id, medioEntrega: 'EMAIL' };
    this.error = '';
    this.exito = '';
  }

  async guardarHorario(): Promise<void> {
    this.error = '';
    this.exito = '';
    if (!this.puedeRegistrarHorario || !this.horario.fecha || !this.horario.idFranja) {
      this.error = 'Selecciona una fecha y una franja. El médico debe estar activo y validado.';
      return;
    }
    this.procesando = true;
    try {
      await this.api.op('disponibilidad-registrar', {
        idDoctor: this.doctor?.ID_DOCTOR,
        fecha: this.horario.fecha,
        idFranja: this.horario.idFranja
      });
      this.exito = 'Disponibilidad registrada correctamente.';
      this.horario.idFranja = null;
      await this.cargar();
    } catch (e) {
      this.error = errorText(e);
    } finally {
      this.procesando = false;
    }
  }

  async accion(accion: string): Promise<void> {
    this.error = '';
    this.exito = '';
    if (!this.citaListaParaAtender) {
      this.error = 'Debes seleccionar una cita habilitada para atención.';
      return;
    }
    this.procesando = true;
    try {
      const datos: Row = { ...this.medico };
      // No confundir observaciones clínicas con observaciones del medicamento.
      if (accion === 'medicamento-agregar') {
        datos.observaciones = this.medico.observacionesMedicamento ?? null;
      }
      const respuesta = await this.api.op(accion, datos);
      if (accion === 'receta-crear' && respuesta.id != null) {
        this.medico.idReceta = respuesta.id;
      }
      if (accion === 'medicamento-agregar') {
        this.medico.medicamento = '';
        this.medico.dosis = '';
        this.medico.frecuencia = '';
        this.medico.duracion = '';
        this.medico.observacionesMedicamento = '';
      }
      const mensajes: Record<string, string> = {
        'atencion-iniciar': 'Atención iniciada correctamente.',
        'diagnostico-registrar': 'Diagnóstico registrado correctamente.',
        'receta-crear': 'Receta creada. Ahora agrega los medicamentos.',
        'medicamento-agregar': 'Medicamento añadido a la receta.',
        'recibo-emitir': 'Recibo emitido y registrado.',
        'recibo-entregar': 'Entrega del recibo registrada.',
        'atencion-cerrar': 'Atención cerrada correctamente.'
      };
      this.exito = mensajes[accion] ?? 'Operación realizada.';
      await this.cargar();
      if (accion === 'atencion-cerrar') {
        this.medico = { idCita: null, medioEntrega: 'EMAIL' };
        this.tab = 'citas';
      }
    } catch (e) {
      this.error = errorText(e);
    } finally {
      this.procesando = false;
    }
  }
}
