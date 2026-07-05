/**
 * Store.js
 * Capa de acceso a datos compartida por admin.js y cliente.js
 * Guarda todo bajo una sola clave de localStorage para que
 * el panel de administración y la tienda de clientes vean
 * siempre la misma información.
 */
window.Store = (function () {
    const STORAGE_KEY = 'app_dashboard_data';
    const CIUDADES = ['Barranquilla', 'Bogotá', 'Bucaramanga', 'Medellín'];

    let appData = {
        categorias: [],
        eventos: [],
        ventas: [],
        metaVentas: 0
    };

    function generarId(prefijo) {
        return `${prefijo}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }

    function formatoMoneda(valor) {
        return `$${Number(valor || 0).toLocaleString('es-CO')}`;
    }

    async function cargarDesdeJSON() {
        try {
            const respuesta = await fetch('data/inicial.json');
            if (!respuesta.ok) throw new Error('Archivo JSON no disponible.');
            appData = await respuesta.json();
        } catch (error) {
            console.warn('No se pudo cargar data/inicial.json, usando datos mínimos por defecto.', error);
            appData = { categorias: [], eventos: [], ventas: [], metaVentas: 0 };
        }
        guardar();
    }

    async function cargar() {
        const localData = localStorage.getItem(STORAGE_KEY);
        if (localData) {
            try {
                appData = JSON.parse(localData);
                return appData;
            } catch (e) {
                console.warn('LocalStorage corrupto, recargando desde JSON.');
            }
        }
        await cargarDesdeJSON();
        return appData;
    }

    function guardar() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
        window.dispatchEvent(new CustomEvent('datosActualizados', { detail: appData }));
    }

    function obtenerDatos() {
        return appData;
    }

    async function reiniciar() {
        localStorage.removeItem(STORAGE_KEY);
        await cargarDesdeJSON();
        return appData;
    }

    // Escucha cambios hechos desde otra pestaña (por ejemplo admin abierto aparte)
    window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY && e.newValue) {
            try {
                appData = JSON.parse(e.newValue);
                window.dispatchEvent(new CustomEvent('datosActualizados', { detail: appData }));
            } catch (err) { /* ignore */ }
        }
    });

    // ------------------ CARRITO DE COMPRAS ------------------
    const CART_KEY = 'carrito_actual';

    function obtenerCarrito() {
        try {
            return JSON.parse(localStorage.getItem(CART_KEY)) || [];
        } catch (e) {
            return [];
        }
    }

    function guardarCarrito(carrito) {
        localStorage.setItem(CART_KEY, JSON.stringify(carrito));
        window.dispatchEvent(new CustomEvent('carritoActualizado', { detail: carrito }));
    }

    function agregarAlCarrito(evento) {
        const carrito = obtenerCarrito();
        const existente = carrito.find(item => item.eventoId === evento.id);
        if (existente) {
            existente.cantidad += 1;
        } else {
            carrito.push({
                eventoId: evento.id,
                nombre: evento.nombre,
                imagen: evento.imagen,
                precioUnit: evento.precio,
                ciudad: evento.ciudad,
                cantidad: 1
            });
        }
        guardarCarrito(carrito);
        return carrito;
    }

    function quitarDelCarrito(eventoId) {
        const carrito = obtenerCarrito().filter(item => item.eventoId !== eventoId);
        guardarCarrito(carrito);
        return carrito;
    }

    function cambiarCantidad(eventoId, cantidad) {
        const carrito = obtenerCarrito();
        const item = carrito.find(i => i.eventoId === eventoId);
        if (item) {
            item.cantidad = Math.max(1, cantidad);
        }
        guardarCarrito(carrito);
        return carrito;
    }

    function vaciarCarrito() {
        guardarCarrito([]);
    }

    function totalCarrito() {
        return obtenerCarrito().reduce((sum, item) => sum + (item.precioUnit * item.cantidad), 0);
    }

    return {
        STORAGE_KEY,
        CIUDADES,
        cargar,
        guardar,
        obtenerDatos,
        reiniciar,
        generarId,
        formatoMoneda,
        obtenerCarrito,
        guardarCarrito,
        agregarAlCarrito,
        quitarDelCarrito,
        cambiarCantidad,
        vaciarCarrito,
        totalCarrito
    };
})();
