
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ShellComponent } from './shell.component';
import { AuthService } from './core';

@Component({
  standalone: true,
  imports: [RouterLink, ShellComponent],
  template: `
    <app-shell>
      <section class="zona-modulos" aria-labelledby="titulo-inicio">

        <h1 id="titulo-inicio">SISTEMA KARELY'S</h1>
        <p class="subtitulo">
          Seleccione el módulo al que desee acceder:
        </p>

        <div class="lista-modulos">

          <!-- MODULO DE CITAS MEDICAS -->
          @if (['ADMINISTRADORA', 'RECEPCIONISTA', 'CAJERA'].includes(auth.session()?.rol || '')) {

            <article class="tarjeta-modulo">

              <img
                class="imagen-modulo"
                src="/img/CITAS.png"
                alt=""
              />

              <div class="capa-modulo" aria-hidden="true"></div>

              <div class="contenido-modulo">

                <h2>Gestión de Citas Médicas</h2>

                <p>
                  Permite reservar, reprogramar, consultar
                  y actualizar el estado de las citas médicas.
                </p>

                <a
                  class="boton-modulo"
                  routerLink="/citas"
                  aria-label="Ingresar al módulo de citas médicas"
                >
                  Ingresar al módulo
                  <span aria-hidden="true">→</span>
                </a>

              </div>
            </article>
          }

          <!-- MODULO DE PACIENTES -->
          @if (['ADMINISTRADORA', 'RECEPCIONISTA'].includes(auth.session()?.rol || '')) {

            <article class="tarjeta-modulo">

              <img
                class="imagen-modulo"
                src="/img/PACIENTES.png"
                alt=""
              />

              <div class="capa-modulo" aria-hidden="true"></div>

              <div class="contenido-modulo">

                <h2>Módulo de Pacientes</h2>

                <p>
                  Permite registrar, buscar y actualizar
                  la información de los pacientes.
                </p>

                <a
                  class="boton-modulo"
                  routerLink="/pacientes"
                  aria-label="Ingresar al módulo de pacientes"
                >
                  Ingresar al módulo
                  <span aria-hidden="true">→</span>
                </a>

              </div>
            </article>

            <!-- MODULO DE DOCTORES -->
            <article class="tarjeta-modulo">

              <img
                class="imagen-modulo"
                src="/img/DOCTORES.png"
                alt=""
              />

              <div class="capa-modulo" aria-hidden="true"></div>

              <div class="contenido-modulo">

                <h2>Administrar Doctores</h2>

                <p>
                  Permite registrar, editar, validar y
                  administrar la información de los doctores.
                </p>

                <a
                  class="boton-modulo"
                  routerLink="/doctores"
                  aria-label="Ingresar al módulo de doctores"
                >
                  Ingresar al módulo
                  <span aria-hidden="true">→</span>
                </a>

              </div>
            </article>
          }

          <!-- MODULO DE FINANZAS -->
          @if (['ADMINISTRADORA', 'TESORERA'].includes(auth.session()?.rol || '')) {

            <article class="tarjeta-modulo">

              <img
                class="imagen-modulo"
                src="/img/FINANZAS.png"
                alt=""
              />

              <div class="capa-modulo" aria-hidden="true"></div>

              <div class="contenido-modulo">

                <h2>Área Financiera</h2>

                <p>
                  Permite gestionar ingresos, ganancias,
                  comisiones y comprobantes de pago.
                </p>

                <a
                  class="boton-modulo"
                  routerLink="/finanzas"
                  aria-label="Ingresar al módulo de finanzas"
                >
                  Ingresar al módulo
                  <span aria-hidden="true">→</span>
                </a>

              </div>
            </article>
          }

          <!-- PANEL MEDICO -->
          @if (auth.session()?.rol === 'DOCTOR') {

            <article class="tarjeta-modulo">

              <img
                class="imagen-modulo"
                src="/img/DOCTORES.png"
                alt=""
              />

              <div class="capa-modulo" aria-hidden="true"></div>

              <div class="contenido-modulo">

                <h2>Panel Médico</h2>

                <p>
                  Consulte sus horarios y citas asignadas,
                  registre diagnósticos y gestione recetas médicas.
                </p>

                <a
                  class="boton-modulo"
                  routerLink="/doctor"
                  aria-label="Ingresar al panel médico"
                >
                  Ingresar al módulo
                  <span aria-hidden="true">→</span>
                </a>

              </div>
            </article>
          }

        </div>
      </section>
    </app-shell>
  `
})
export class HomeComponent {
  auth = inject(AuthService);
}
