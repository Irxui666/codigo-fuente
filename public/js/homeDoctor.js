document.addEventListener("DOMContentLoaded", function() {
	activarMenuDoctor();
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