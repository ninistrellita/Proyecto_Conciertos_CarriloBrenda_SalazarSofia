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

document.addEventListener("DOMContentLoaded", () => {
    const menuItems = document.querySelectorAll(".menu-item");
    const tabContents = document.querySelectorAll(".tab-content");
    const pageTitle = document.getElementById("page-title");

    menuItems.forEach(item => {
        item.addEventListener("click", () => {
            
            // 1. Remover la clase 'active' de todos los botones del menú
            menuItems.forEach(menu => menu.classList.remove("active"));
            
            // 2. Añadir la clase 'active' al botón que se presionó
            item.classList.add("active");

            // 3. Ocultar todas las secciones de contenido
            tabContents.forEach(content => content.classList.remove("active"));

            // 4. Obtener el ID del objetivo (inicio, eventos, etc.) y mostrarlo
            const targetId = item.getAttribute("data-target");
            const targetContent = document.getElementById(targetId);
            
            if (targetContent) {
                targetContent.classList.add("active");
            }

            // 5. Opcional: Cambiar dinámicamente el título del Header superior
            const textString = item.textContent.trim();
            pageTitle.textContent = textString;
        });
    });
});