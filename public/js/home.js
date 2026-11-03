function abrirModulo(rutaModulo) {
    window.location.href = rutaModulo;
}

document.addEventListener("DOMContentLoaded", function () {
    const opcionesMenu = document.querySelectorAll(".opcion-menu");

    opcionesMenu.forEach(function (opcion) {
        opcion.addEventListener("click", function () {
            opcionesMenu.forEach(function (item) {
                item.classList.remove("activa");
            });

            opcion.classList.add("activa");
        });
    });
});