document.addEventListener("DOMContentLoaded", function() {
	activarVistaPacientes();
	activarMenuPacientes();
	activarModalExito();
});

function activarVistaPacientes() {
	const ruta = window.location.pathname.toLowerCase();

	let vistaActual = "lista";

	if (ruta.includes("/nuevo")) {
		vistaActual = "nuevo";
	} else if (ruta.includes("/editar")) {
		vistaActual = "editar";
	} else if (ruta.includes("/detalle")) {
		vistaActual = "detalle";
	} else if (ruta.includes("/admitir")) {
		vistaActual = "admitir";
	}

	const vistas = document.querySelectorAll(".vista-paciente");

	vistas.forEach(function(vista) {
		vista.classList.remove("activa");
	});

	const vistaSeleccionada = document.querySelector('.vista-paciente[data-vista="' + vistaActual + '"]');

	if (vistaSeleccionada) {
		vistaSeleccionada.classList.add("activa");
		return;
	}

	const primeraVistaDisponible = document.querySelector(".vista-paciente");

	if (primeraVistaDisponible) {
		primeraVistaDisponible.classList.add("activa");
	}
}

function activarMenuPacientes() {
	const opcionesMenu = document.querySelectorAll(".opcion-menu, .opcion-submenu");

	opcionesMenu.forEach(function(opcion) {
		opcion.addEventListener("click", function() {
			opcionesMenu.forEach(function(item) {
				item.classList.remove("activa");
			});

			opcion.classList.add("activa");
		});
	});
}

function activarModalExito() {
	const modalExito = document.getElementById("modalExito");

	if (modalExito) {
		modalExito.classList.add("visible");
	}
}