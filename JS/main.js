document.addEventListener("DOMContentLoaded", () => {
    const slides = document.querySelectorAll(".evento-slide");
    const puntosContenedor = document.querySelector(".puntos-navegacion");
    let indexActual = 0;
    let intervalo;

    // 1. Crear los puntos dinámicamente según el número de imágenes
    slides.forEach((_, index) => {
        const punto = document.createElement("div");
        punto.classList.add("punto");
        if (index === 0) punto.classList.add("active");
        
        // Evento al hacer clic en un punto
        punto.addEventListener("click", () => {
            cambiarSlide(index);
            reiniciarTiempo();
        });
        
        puntosContenedor.appendChild(punto);
    });

    const puntos = document.querySelectorAll(".punto");

    // Enciende la primera imagen por defecto
    if(slides.length > 0) slides[0].classList.add("active");

    // 2. Función para cambiar de diapositiva
    function cambiarSlide(nuevoIndex) {
        slides[indexActual].classList.remove("active");
        puntos[indexActual].classList.remove("active");

        indexActual = (nuevoIndex + slides.length) % slides.length;

        slides[indexActual].classList.add("active");
        puntos[indexActual].classList.add("active");
    }

    // 3. Pasar a la siguiente automáticamente
    function siguienteSlide() {
        cambiarSlide(indexActual + 1);
    }

    // 4. Control del temporizador (5000ms = 5 segundos)
    function iniciarTiempo() {
        intervalo = setInterval(siguienteSlide, 5000);
    }

    function reiniciarTiempo() {
        clearInterval(intervalo);
        iniciarTiempo();
    }

    iniciarTiempo();
});