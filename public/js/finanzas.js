function abrirModulo(rutaModulo) {
	window.location.href = rutaModulo;
}

document.addEventListener("DOMContentLoaded", function() {
	const opcionesMenu = document.querySelectorAll(".opcion-menu, .opcion-submenu");

	opcionesMenu.forEach(function(opcion) {
		opcion.addEventListener("click", function() {
			opcionesMenu.forEach(function(item) {
				item.classList.remove("activa");
			});

			opcion.classList.add("activa");
		});
	});

	const formulariosConfirmar = document.querySelectorAll(".form-confirmar");

	formulariosConfirmar.forEach(function(formulario) {
		formulario.addEventListener("submit", function(event) {
			const confirmar = confirm("¿Deseas registrar esta operación en el sistema?");

			if (!confirmar) {
				event.preventDefault();
			}
		});
	});

	const formulariosPago = document.querySelectorAll(".form-pago");

	formulariosPago.forEach(function(formulario) {
		formulario.addEventListener("submit", function(event) {
			const confirmar = confirm("¿Confirmas que deseas realizar el pago al doctor?");

			if (!confirmar) {
				event.preventDefault();
			}
		});
	});
});