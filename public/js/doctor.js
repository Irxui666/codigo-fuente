document.addEventListener("DOMContentLoaded", function() {
	activarMenuDoctor();
	activarModalConfirmacion();
});

function activarMenuDoctor() {
	const botonDoctor = document.getElementById("botonDoctorMenu");
	const subopciones = document.getElementById("subopcionesDoctor");

	if (!botonDoctor || !subopciones) {
		return;
	}

	botonDoctor.addEventListener("click", function() {
		subopciones.classList.toggle("oculto");

		const flecha = botonDoctor.querySelector(".flecha-menu");

		if (flecha) {
			flecha.textContent = subopciones.classList.contains("oculto") ? "›" : "⌄";
		}
	});
}

function activarModalConfirmacion() {
	const modal = document.getElementById("modalConfirmacion");
	const modalTitulo = document.getElementById("modalTitulo");
	const modalTexto = document.getElementById("modalTexto");
	const btnAceptar = document.getElementById("btnModalAceptar");
	const btnCancelar = document.getElementById("btnModalCancelar");

	if (!modal || !btnAceptar || !btnCancelar) {
		return;
	}

	let formularioPendiente = null;

	const formularios = document.querySelectorAll(".form-confirmar, .form-eliminar");

	formularios.forEach(function(formulario) {
		formulario.addEventListener("submit", function(event) {
			event.preventDefault();

			formularioPendiente = formulario;

			const titulo = formulario.getAttribute("data-titulo") || "Confirmar operación";
			const texto = formulario.getAttribute("data-texto") || "¿Deseas continuar con esta operación?";

			modalTitulo.textContent = titulo;
			modalTexto.textContent = texto;

			modal.classList.add("visible");
		});
	});

	btnCancelar.addEventListener("click", function() {
		formularioPendiente = null;
		modal.classList.remove("visible");
	});

	btnAceptar.addEventListener("click", function() {
		if (formularioPendiente) {
			const formulario = formularioPendiente;
			formularioPendiente = null;
			modal.classList.remove("visible");
			formulario.submit();
		}
	});

	modal.addEventListener("click", function(event) {
		if (event.target === modal) {
			formularioPendiente = null;
			modal.classList.remove("visible");
		}
	});
}