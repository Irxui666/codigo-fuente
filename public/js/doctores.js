document.addEventListener("DOMContentLoaded", function () {
    activarMenuDoctores();
    confirmarEliminaciones();
    confirmarValidaciones();
    validarDniBusqueda();
});

function activarMenuDoctores() {
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

function confirmarEliminaciones() {
    const formularios = document.querySelectorAll(".form-eliminar");

    formularios.forEach(function (formulario) {
        formulario.addEventListener("submit", function (event) {
            const confirmar = confirm("¿Seguro que deseas eliminar este registro?");

            if (!confirmar) {
                event.preventDefault();
            }
        });
    });
}

function confirmarValidaciones() {
    const formulariosAprobar = document.querySelectorAll(".form-aprobar");
    const formulariosRechazar = document.querySelectorAll(".form-rechazar");

    formulariosAprobar.forEach(function (formulario) {
        formulario.addEventListener("submit", function (event) {
            const confirmar = confirm("¿Confirmas que la documentación es correcta?");

            if (!confirmar) {
                event.preventDefault();
            }
        });
    });

    formulariosRechazar.forEach(function (formulario) {
        formulario.addEventListener("submit", function (event) {
            const confirmar = confirm("¿Confirmas que deseas rechazar la documentación?");

            if (!confirmar) {
                event.preventDefault();
            }
        });
    });
}

function validarDniBusqueda() {
    const formulariosBusqueda = document.querySelectorAll(".barra-busqueda");

    formulariosBusqueda.forEach(function (formulario) {
        formulario.addEventListener("submit", function (event) {
            const input = formulario.querySelector('input[name="buscar"]');

            if (!input) {
                return;
            }

            const valor = input.value.trim();

            if (valor !== "" && /^[0-9]+$/.test(valor) && valor.length !== 8) {
                alert("Si busca por DNI, debe ingresar exactamente 8 dígitos.");
                event.preventDefault();
            }
        });
    });
}