document.addEventListener("DOMContentLoaded", () => {
    const slides = document.querySelectorAll(".evento-slide");
    const puntosContenedor = document.querySelector(".puntos-navegacion");
    let indexActual = 0;
    let intervalo;

    slides.forEach((_, index) => {
        const punto = document.createElement("div");
        punto.classList.add("punto");
        if (index === 0) punto.classList.add("active");

        punto.addEventListener("click", () => {
            cambiarSlide(index);
            reiniciarTiempo();
        });
        
        puntosContenedor.appendChild(punto);
    });

    const puntos = document.querySelectorAll(".punto");


    if(slides.length > 0) slides[0].classList.add("active");


    function cambiarSlide(nuevoIndex) {
        slides[indexActual].classList.remove("active");
        puntos[indexActual].classList.remove("active");

        indexActual = (nuevoIndex + slides.length) % slides.length;

        slides[indexActual].classList.add("active");
        puntos[indexActual].classList.add("active");
    }

    function siguienteSlide() {
        cambiarSlide(indexActual + 1);
    }

    function iniciarTiempo() {
        intervalo = setInterval(siguienteSlide, 5000);
    }

    function reiniciarTiempo() {
        clearInterval(intervalo);
        iniciarTiempo();
    }

    iniciarTiempo();
});