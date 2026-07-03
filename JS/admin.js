document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault(); 
    
    const correo = document.getElementById('correo').value.trim();
    const password = document.getElementById('password').value;
    const errorMessageDiv = document.getElementById('errorMessage');

    errorMessageDiv.style.display = 'none';
    errorMessageDiv.textContent = '';

    window.location.href = "../admin.html";

    if (correo === "admin@mail.com" && password === "12346") {
        alert("¡Inicio de sesión exitoso! Bienvenido.");
    } else {

        errorMessageDiv.textContent = "Usuario o contraseña incorrectos. Inténtalo de nuevo.";
        errorMessageDiv.style.display = 'block';
    }
});