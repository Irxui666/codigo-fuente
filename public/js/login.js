function mostrarContrasena() {
	const campoContrasena = document.getElementById("contrasena");
	const iconoOjo = document.getElementById("iconoOjo");

	if (campoContrasena.type === "password") {
		campoContrasena.type = "text";
		iconoOjo.textContent = "○";
	} else {
		campoContrasena.type = "password";
		iconoOjo.textContent = "◉";
	}
}