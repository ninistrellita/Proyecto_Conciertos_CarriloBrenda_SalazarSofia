document.addEventListener('DOMContentLoaded', async () => {
    const appData = await Store.cargar();
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const contenedor = document.getElementById('detalle-evento');

    const evento = appData.eventos.find(ev => ev.id === id);

    if (!evento) {
        contenedor.innerHTML = `
            <p>No se encontró el evento solicitado.</p>
            <a href="index.html" class="btn-volver"><i class="fa-solid fa-arrow-left"></i> Volver a eventos</a>`;
        return;
    }

    document.title = `${evento.nombre} - Conciertos Conectados`;

    contenedor.innerHTML = `
        <img src="${evento.imagen}" onerror="this.src='https://picsum.photos/800/450'" class="detalle-imagen">
        <div class="detalle-info">
            <span class="badge-cat">${evento.categoria}</span>
            <h1>${evento.nombre}</h1>
            <p class="detalle-descripcion">${evento.descripcion}</p>
            <ul class="detalle-meta-lista">
                <li><i class="fa-solid fa-calendar-days"></i> ${evento.fecha}</li>
                <li><i class="fa-solid fa-clock"></i> ${evento.hora}</li>
                <li><i class="fa-solid fa-location-dot"></i> ${evento.ciudad}</li>
            </ul>
            <div class="detalle-precio">${Store.formatoMoneda(evento.precio)}</div>
            <button id="btn-agregar-detalle" class="btn-comprar btn-full">
                <i class="fa-solid fa-cart-plus"></i> Agregar al carrito
            </button>
        </div>`;

    document.getElementById('btn-agregar-detalle').addEventListener('click', () => {
        Store.agregarAlCarrito(evento);
        alert(`"${evento.nombre}" fue agregado al carrito.`);
    });
});
