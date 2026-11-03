document.addEventListener("DOMContentLoaded", function () {
    activarMenuCitas();
    filtrarDoctoresPorEspecialidad();
    mostrarInfoDoctor();
    validarBusquedaDni();
    activarModalConfirmacion();
});

function activarMenuCitas() {
    const opcionesMenu = document.querySelectorAll(".opcion-menu, .opcion-submenu");

    opcionesMenu.forEach(function (opcion) {
        opcion.addEventListener("click", function () {
            opcionesMenu.forEach(function (item) {
                item.classList.remove("activa");
            });

            opcion.classList.add("activa");
        });
    });
}

function filtrarDoctoresPorEspecialidad() {
    const selectorEspecialidad = document.getElementById("selectorEspecialidad");
    const selectorDoctor = document.getElementById("selectorDoctor");

    if (!selectorEspecialidad || !selectorDoctor) {
        return;
    }

    selectorEspecialidad.addEventListener("change", function () {
        const idEspecialidad = selectorEspecialidad.value;
        const opcionesDoctor = selectorDoctor.querySelectorAll("option");

        selectorDoctor.value = "";

        opcionesDoctor.forEach(function (opcion) {
            if (opcion.value === "") {
                opcion.hidden = false;
                return;
            }

            const especialidadDoctor = opcion.getAttribute("data-especialidad");

            opcion.hidden = !(idEspecialidad === "" || especialidadDoctor === idEspecialidad);
        });

        actualizarInfoDoctor();
    });
}

function mostrarInfoDoctor() {
    const selectorDoctor = document.getElementById("selectorDoctor");

    if (!selectorDoctor) {
        return;
    }

    selectorDoctor.addEventListener("change", actualizarInfoDoctor);
}

function actualizarInfoDoctor() {
    const selectorDoctor = document.getElementById("selectorDoctor");
    const textoDoctor = document.getElementById("textoDoctorSeleccionado");

    if (!selectorDoctor || !textoDoctor) {
        return;
    }

    const opcion = selectorDoctor.options[selectorDoctor.selectedIndex];

    if (!opcion || opcion.value === "") {
        textoDoctor.textContent = "Aún no se ha seleccionado un doctor.";
        return;
    }

    const nombre = opcion.getAttribute("data-nombre") || "Doctor";
    const correo = opcion.getAttribute("data-correo") || "Sin correo";
    const precio = opcion.getAttribute("data-precio") || "0.00";

    textoDoctor.textContent = nombre + " | Correo: " + correo + " | Precio consulta: S/ " + precio;
}

function validarBusquedaDni() {
    const formulariosBusqueda = document.querySelectorAll(".form-busqueda-dni");

    formulariosBusqueda.forEach(function (formulario) {
        formulario.addEventListener("submit", function (event) {
            const input = formulario.querySelector('input[name="dni"]');

            if (!input) {
                return;
            }

            const valor = input.value.trim();

            if (!/^[0-9]{8}$/.test(valor)) {
                alert("Debe ingresar un DNI válido de 8 dígitos.");
                event.preventDefault();
            }
        });
    });
}

function activarModalConfirmacion() {
    const modal = document.getElementById("modalConfirmacion");
    const btnAceptar = document.getElementById("btnModalAceptar");
    const btnCancelar = document.getElementById("btnModalCancelar");
    const modalTitulo = document.getElementById("modalTitulo");
    const modalTexto = document.getElementById("modalTexto");

    if (!modal || !btnAceptar || !btnCancelar) {
        return;
    }

    let formularioPendiente = null;

    const configuraciones = [
        {
            selector: ".form-confirmar-reserva",
            titulo: "Confirmar cita",
            texto: "¿Deseas confirmar la reserva de esta cita médica?"
        },
        {
            selector: ".form-cancelar",
            titulo: "Cancelar cita",
            texto: "¿Seguro que deseas cancelar esta cita?"
        },
        {
            selector: ".form-atender",
            titulo: "Registrar asistencia",
            texto: "¿Confirmas que el paciente asistió a la cita?"
        },
        {
            selector: ".form-reprogramar",
            titulo: "Reprogramar cita",
            texto: "¿Deseas guardar la reprogramación de esta cita?"
        },
        {
            selector: ".form-avanzar",
            titulo: "Continuar reserva",
            texto: "¿Deseas continuar con los detalles de la cita?"
        }
    ];

    configuraciones.forEach(function (configuracion) {
        const formularios = document.querySelectorAll(configuracion.selector);

        formularios.forEach(function (formulario) {
            formulario.addEventListener("submit", function (event) {
                event.preventDefault();

                formularioPendiente = formulario;
                modalTitulo.textContent = configuracion.titulo;
                modalTexto.textContent = configuracion.texto;

                modal.classList.add("visible");
            });
        });
    });

    btnCancelar.addEventListener("click", function () {
        formularioPendiente = null;
        modal.classList.remove("visible");
    });

    btnAceptar.addEventListener("click", function () {
        if (formularioPendiente) {
            const formulario = formularioPendiente;
            formularioPendiente = null;
            modal.classList.remove("visible");
            formulario.submit();
        }
    });

    modal.addEventListener("click", function (event) {
        if (event.target === modal) {
            formularioPendiente = null;
            modal.classList.remove("visible");
        }
    });
}