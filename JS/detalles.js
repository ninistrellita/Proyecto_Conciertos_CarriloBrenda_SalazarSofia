/**
 * detalle-controlador.js
 * Capta dinámicamente los parámetros Query de la URL e inyecta la información.
 */
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Cargamos los datos compartidos desde el Store
    const appData = await Store.cargar();
    
    // 2. Extraemos el 'id' enviado desde la URL (?id=ev-xxx)
    const urlParams = new URLSearchParams(window.location.search);
    const eventoId = urlParams.get('id');

    // 3. Buscamos el concierto correspondiente en tu localStorage compartido
    const evento = appData.eventos.find(ev => ev.id === eventoId);
    const contenedor = document.getElementById('vista-detalle');

    if (!contenedor) return;

    // Si el ID es inválido o se alteró manualmente la URL
    if (!evento) {
        contenedor.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 4rem 0;">
                <h2 style="font-size: 2rem; color: #1e293b; margin-bottom: 1rem;">🎟️ Evento no encontrado</h2>
                <p style="color: #64748b; margin-bottom: 2rem;">El espectáculo seleccionado no existe en el catálogo actual.</p>
                <a href="Index.html" class="btn-regresar-catalogo"><i class="fa-solid fa-arrow-left"></i> Volver a la Tienda</a>
            </div>`;
        return;
    }

    // 4. Pintamos la estructura con los datos exactos e imágenes subidas (Ruta local o Base64)
    contenedor.innerHTML = `
        <div class="detalle-imagen">
            <img src="${evento.imagen ? evento.imagen : Store.IMAGE_PLACEHOLDER}" alt="${evento.nombre}" id="img-target">
        </div>
        <div class="detalle-info">
            <span class="detalle-categoria">${evento.categoria}</span>
            <h1>${evento.nombre}</h1>
            <div class="detalle-meta"><strong>📍 Ubicación:</strong> ${evento.ciudad}</div>
            <div class="detalle-meta"><strong>🗓️ Fecha del Evento:</strong> ${evento.fecha}</div>
            <div class="detalle-meta"><strong>⏰ Apertura de Puertas:</strong> ${evento.hora}</div>
            <p class="detalle-descripcion">${evento.descripcion || 'No hay descripción adicional disponible para este evento.'}</p>
            <div class="detalle-precio">${Store.formatoMoneda(evento.precio)}</div>
            
            <button id="btn-agregar-detalle" class="btn-comprar btn-full" style="margin-top: 0.5rem;">
                <i class="fa-solid fa-cart-plus"></i> Agregar al Carrito
            </button>
            <a href="Index.html" class="btn-regresar-catalogo"><i class="fa-solid fa-arrow-left"></i> Regresar al Catálogo</a>
        </div>
    `;

    // Respaldo seguro si la imagen falla en renderizar
    const imgTarget = document.getElementById('img-target');
    if (imgTarget) {
        imgTarget.onerror = function () {
            this.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'><rect width='100%' height='100%' fill='%23cccccc'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' fill='%23666666'>Imagen no encontrada</text></svg>";
        };
    }

    // 5. Conectamos el botón con las operaciones compartidas de tu archivo carrito-compartido.js
    const btnAgregar = document.getElementById('btn-agregar-detalle');
    if (btnAgregar) {
        btnAgregar.addEventListener('click', () => {
            Store.agregarAlCarrito(evento);
            // Disparar evento para actualizar instantáneamente el contador numérico del header
            window.dispatchEvent(new CustomEvent('carritoActualizado'));
            alert(`"${evento.nombre}" se agregó con éxito al carrito.`);
        });
    }
});