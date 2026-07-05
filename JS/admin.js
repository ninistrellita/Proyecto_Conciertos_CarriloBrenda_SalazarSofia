document.addEventListener('DOMContentLoaded', async () => {

    // --- GUARDA DE ACCESO ---
    if (sessionStorage.getItem('admin_autenticado') !== 'true') {
        window.location.href = 'login.html';
        return;
    }

    document.getElementById('btn-logout').addEventListener('click', () => {
        sessionStorage.removeItem('admin_autenticado');
        window.location.href = 'login.html';
    });

    let appData = await Store.cargar();

    // --- ENRUTADOR DE PANTALLAS ---
    const menuItems = document.querySelectorAll('.sidebar-menu .menu-item');
    const sections = document.querySelectorAll('.dashboard-section');
    const pageTitle = document.getElementById('page-title');

    menuItems.forEach(item => {
        item.addEventListener('click', function (e) {
            e.preventDefault();
            const target = this.getAttribute('data-target');
            if (!target) return;

            menuItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');

            sections.forEach(sec => {
                if (sec.id === `section-${target}`) {
                    sec.classList.remove('visual-hidden');
                    sec.classList.add('active-section');
                } else {
                    sec.classList.add('visual-hidden');
                    sec.classList.remove('active-section');
                }
            });

            if (pageTitle) pageTitle.textContent = target === 'inicio' ? 'Dashboard General' : this.textContent.trim();
            document.querySelector('.dashboard-container')?.classList.remove('sidebar-open');
        });
    });

    document.getElementById('menu-toggle')?.addEventListener('click', () => {
        document.querySelector('.dashboard-container').classList.toggle('sidebar-open');
    });

    document.getElementById('btn-reiniciar-datos').addEventListener('click', async () => {
        if (!confirm('Esto borrará los datos guardados y volverá a cargar data/inicial.json. ¿Continuar?')) return;
        appData = await Store.reiniciar();
        renderizarTodo();
        alert('Datos reiniciados desde data/inicial.json.');
    });

    window.addEventListener('datosActualizados', (e) => {
        appData = e.detail;
        renderizarTodo();
    });

    // ============================================================
    // RENDER GENERAL
    // ============================================================
    function renderizarTodo() {
        renderInicio();
        renderCategorias();
        renderEventos();
        renderVentas();
    }

    function renderInicio() {
        const totalVentas = appData.ventas.reduce((sum, v) => sum + v.total, 0);
        document.getElementById('metric-categorias').textContent = appData.categorias.length;
        document.getElementById('metric-eventos').textContent = appData.eventos.length;
        document.getElementById('metric-ventas').textContent = Store.formatoMoneda(totalVentas);

        const porcentaje = appData.metaVentas > 0 ? Math.min(Math.round((totalVentas / appData.metaVentas) * 100), 100) : 0;
        document.getElementById('progress-text').textContent = `${porcentaje}%`;
        document.getElementById('summary-recaudado').textContent = Store.formatoMoneda(totalVentas);
        document.getElementById('summary-meta').textContent = Store.formatoMoneda(appData.metaVentas);
        const bar = document.getElementById('progress-circle-bar');
        if (bar) bar.style.background = `conic-gradient(var(--accent-orange) ${porcentaje}%, var(--bg-main) ${porcentaje}%)`;

        const ventasOrdenadas = [...appData.ventas].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        const tbody = document.querySelector('#table-recientes tbody');
        tbody.innerHTML = '';
        ventasOrdenadas.slice(0, 4).forEach(v => {
            tbody.innerHTML += `
                <tr>
                    <td><strong style="color:var(--accent-blue)">${v.id}</strong></td>
                    <td>${v.cliente?.nombre ?? '-'}</td>
                    <td><span class="badge-cat">${v.ciudad}</span></td>
                    <td><strong>${Store.formatoMoneda(v.total)}</strong></td>
                    <td>${new Date(v.fecha).toLocaleString('es-CO')}</td>
                </tr>`;
        });

        const tbodyEventos = document.querySelector('#table-eventos-recientes tbody');
        tbodyEventos.innerHTML = '';
        [...appData.eventos].reverse().slice(0, 4).forEach(ev => {
            tbodyEventos.innerHTML += `
                <tr>
                    <td><strong>${ev.nombre}</strong></td>
                    <td><span class="badge-cat">${ev.categoria}</span></td>
                    <td>${ev.ciudad}</td>
                    <td>${ev.fecha}</td>
                    <td>${Store.formatoMoneda(ev.precio)}</td>
                </tr>`;
        });

        const contCatInicio = document.getElementById('container-categorias-inicio');
        contCatInicio.innerHTML = appData.categorias.length
            ? appData.categorias.map(c => `<span class="badge-cat badge-cat-inicio"><i class="fa-solid fa-folder"></i> ${c.nombre}</span>`).join('')
            : '<p style="color:var(--text-muted)">Aún no hay categorías registradas.</p>';
    }

    // ============================================================
    // CATEGORÍAS
    // ============================================================
    const modalCategoria = document.getElementById('modal-categoria');
    const formCategoria = document.getElementById('form-categoria');

    function renderCategorias() {
        const cont = document.getElementById('container-categorias');
        cont.innerHTML = '';
        if (appData.categorias.length === 0) {
            cont.innerHTML = '<p style="color:var(--text-muted)">No hay categorías registradas todavía.</p>';
        }
        appData.categorias.forEach((c) => {
            cont.innerHTML += `
                <div class="card card-categoria-dinamica">
                    <div>
                        <span><i class="fa-solid fa-folder"></i> <strong>${c.nombre}</strong></span>
                        <p class="categoria-descripcion">${c.descripcion ?? ''}</p>
                    </div>
                    <div class="categoria-acciones">
                        <button data-id="${c.id}" class="btn-icon btn-edit-cat" title="Editar"><i class="fa-solid fa-pen"></i></button>
                        <button data-id="${c.id}" class="btn-icon btn-delete-cat" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>`;
        });

        cont.querySelectorAll('.btn-delete-cat').forEach(btn => {
            btn.addEventListener('click', () => eliminarCategoria(btn.dataset.id));
        });
        cont.querySelectorAll('.btn-edit-cat').forEach(btn => {
            btn.addEventListener('click', () => abrirModalCategoria(btn.dataset.id));
        });

        // Actualiza el <select> del formulario de eventos
        const selectCat = document.getElementById('ev-categoria');
        const seleccionActual = selectCat.value;
        selectCat.innerHTML = '<option value="" disabled selected>Seleccione categoría</option>';
        appData.categorias.forEach(c => {
            selectCat.innerHTML += `<option value="${c.nombre}">${c.nombre}</option>`;
        });
        if (seleccionActual) selectCat.value = seleccionActual;
    }

    function abrirModalCategoria(id = null) {
        formCategoria.reset();
        document.getElementById('cat-id').value = '';
        if (id) {
            const cat = appData.categorias.find(c => c.id === id);
            if (!cat) return;
            modalCategoria.setAttribute('titulo', 'Editar Categoría');
            document.getElementById('cat-id').value = cat.id;
            document.getElementById('cat-nombre').value = cat.nombre;
            document.getElementById('cat-descripcion').value = cat.descripcion ?? '';
        } else {
            modalCategoria.setAttribute('titulo', 'Agregar Categoría');
        }
        modalCategoria.abrir();
    }

    document.getElementById('btn-add-categoria').addEventListener('click', () => abrirModalCategoria());

    formCategoria.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('cat-id').value;
        const nombre = document.getElementById('cat-nombre').value.trim();
        const descripcion = document.getElementById('cat-descripcion').value.trim();
        if (!nombre) return;

        if (id) {
            const cat = appData.categorias.find(c => c.id === id);
            cat.nombre = nombre;
            cat.descripcion = descripcion;
            alert('Categoría actualizada exitosamente.');
        } else {
            appData.categorias.push({ id: Store.generarId('cat'), nombre, descripcion });
            alert('Categoría añadida exitosamente.');
        }
        Store.guardar();
        modalCategoria.cerrar();
    });

    function eliminarCategoria(id) {
        if (!confirm('¿Eliminar esta categoría?')) return;
        appData.categorias = appData.categorias.filter(c => c.id !== id);
        Store.guardar();
        alert('Categoría eliminada.');
    }

    // ============================================================
    // EVENTOS
    // ============================================================
    const formEventos = document.getElementById('form-eventos');
    const btnCancelarEdicion = document.getElementById('btn-cancelar-edicion-evento');

    function renderEventos() {
        const cont = document.getElementById('container-eventos-lista');
        cont.innerHTML = '';
        if (appData.eventos.length === 0) {
            cont.innerHTML = '<p style="color:var(--text-muted)">No hay eventos registrados todavía.</p>';
        }
        appData.eventos.forEach(ev => {
            cont.innerHTML += `
                <div class="evento-fila-dinamica">
                    <img src="${ev.imagen}" onerror="this.src='https://picsum.photos/300/200'">
                    <div class="evento-info-texto">
                        <h4>${ev.nombre} <span class="badge-cat">${ev.codigo}</span></h4>
                        <p>${ev.categoria} · ${ev.ciudad} · ${ev.fecha} ${ev.hora}</p>
                        <strong>${Store.formatoMoneda(ev.precio)}</strong>
                    </div>
                    <div class="categoria-acciones">
                        <button data-id="${ev.id}" class="btn-icon btn-edit-ev" title="Editar"><i class="fa-solid fa-pen"></i></button>
                        <button data-id="${ev.id}" class="btn-icon btn-delete-ev" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>`;
        });

        cont.querySelectorAll('.btn-delete-ev').forEach(btn => btn.addEventListener('click', () => eliminarEvento(btn.dataset.id)));
        cont.querySelectorAll('.btn-edit-ev').forEach(btn => btn.addEventListener('click', () => cargarEventoParaEditar(btn.dataset.id)));
    }

    function cargarEventoParaEditar(id) {
        const ev = appData.eventos.find(e => e.id === id);
        if (!ev) return;
        document.getElementById('ev-id').value = ev.id;
        document.getElementById('ev-codigo').value = ev.codigo;
        document.getElementById('ev-nombre').value = ev.nombre;
        document.getElementById('ev-categoria').value = ev.categoria;
        document.getElementById('ev-precio').value = ev.precio;
        document.getElementById('ev-fecha').value = ev.fecha;
        document.getElementById('ev-hora').value = ev.hora;
        document.getElementById('ev-ciudad').value = ev.ciudad;
        document.getElementById('ev-imagen').value = ev.imagen;
        document.getElementById('ev-descripcion').value = ev.descripcion;

        document.getElementById('form-eventos-titulo').innerHTML = '<i class="fa-solid fa-pen"></i> Editar Evento';
        document.getElementById('btn-guardar-evento').textContent = 'Actualizar Evento';
        btnCancelarEdicion.style.display = 'block';
        document.querySelector('[data-target="eventos"]').click();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function resetFormEventos() {
        formEventos.reset();
        document.getElementById('ev-id').value = '';
        document.getElementById('form-eventos-titulo').innerHTML = '<i class="fa-solid fa-calendar-plus"></i> Registrar Nuevo Evento';
        document.getElementById('btn-guardar-evento').textContent = 'Guardar Evento';
        btnCancelarEdicion.style.display = 'none';
    }

    btnCancelarEdicion.addEventListener('click', resetFormEventos);

    formEventos.addEventListener('submit', function (e) {
        e.preventDefault();
        const id = document.getElementById('ev-id').value;
        const datos = {
            codigo: document.getElementById('ev-codigo').value.trim(),
            nombre: document.getElementById('ev-nombre').value.trim(),
            categoria: document.getElementById('ev-categoria').value,
            precio: parseFloat(document.getElementById('ev-precio').value),
            fecha: document.getElementById('ev-fecha').value,
            hora: document.getElementById('ev-hora').value,
            ciudad: document.getElementById('ev-ciudad').value,
            imagen: document.getElementById('ev-imagen').value.trim(),
            descripcion: document.getElementById('ev-descripcion').value.trim()
        };

        if (id) {
            const ev = appData.eventos.find(e => e.id === id);
            Object.assign(ev, datos);
            alert('Evento actualizado correctamente.');
        } else {
            appData.eventos.push({ id: Store.generarId('ev'), ...datos });
            alert('Evento guardado correctamente.');
        }
        Store.guardar();
        resetFormEventos();
    });

    function eliminarEvento(id) {
        if (!confirm('¿Eliminar este evento?')) return;
        appData.eventos = appData.eventos.filter(e => e.id !== id);
        Store.guardar();
        alert('Evento eliminado.');
    }

    // ============================================================
    // VENTAS
    // ============================================================
    const modalDetalleVenta = document.getElementById('modal-detalle-venta');

    function renderVentas() {
        const tbody = document.querySelector('#table-ventas-completa tbody');
        tbody.innerHTML = '';
        const ventasOrdenadas = [...appData.ventas].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        if (ventasOrdenadas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:var(--text-muted)">Aún no hay ventas registradas.</td></tr>';
            return;
        }

        ventasOrdenadas.forEach(v => {
            tbody.innerHTML += `
                <tr>
                    <td><strong style="color:var(--accent-blue)">${v.id}</strong></td>
                    <td>${new Date(v.fecha).toLocaleString('es-CO')}</td>
                    <td><span class="badge-cat">${v.ciudad}</span></td>
                    <td>${v.cliente?.nombre ?? '-'}</td>
                    <td><strong>${Store.formatoMoneda(v.total)}</strong></td>
                    <td><button class="btn-icon btn-ver-venta" data-id="${v.id}" title="Ver detalle"><i class="fa-solid fa-eye"></i></button></td>
                </tr>`;
        });

        tbody.querySelectorAll('.btn-ver-venta').forEach(btn => {
            btn.addEventListener('click', () => mostrarDetalleVenta(btn.dataset.id));
        });
    }

    function mostrarDetalleVenta(id) {
        const venta = appData.ventas.find(v => v.id === id);
        if (!venta) return;
        const itemsHtml = venta.items.map(it => `
            <tr>
                <td>${it.nombre}</td>
                <td>${it.cantidad}</td>
                <td>${Store.formatoMoneda(it.precioUnit)}</td>
                <td>${Store.formatoMoneda(it.subtotal)}</td>
            </tr>`).join('');

        document.getElementById('detalle-venta-contenido').innerHTML = `
            <p><strong>ID Venta:</strong> ${venta.id}</p>
            <p><strong>Fecha:</strong> ${new Date(venta.fecha).toLocaleString('es-CO')}</p>
            <p><strong>Ciudad:</strong> ${venta.ciudad}</p>
            <hr>
            <h4>Datos del Cliente</h4>
            <p><strong>Nombre:</strong> ${venta.cliente?.nombre ?? '-'}</p>
            <p><strong>Identificación:</strong> ${venta.cliente?.identificacion ?? '-'}</p>
            <p><strong>Dirección:</strong> ${venta.cliente?.direccion ?? '-'}</p>
            <p><strong>Teléfono:</strong> ${venta.cliente?.telefono ?? '-'}</p>
            <p><strong>Email:</strong> ${venta.cliente?.email ?? '-'}</p>
            <hr>
            <h4>Entradas Compradas</h4>
            <table class="tabla-detalle-venta">
                <thead><tr><th>Evento</th><th>Cant.</th><th>Precio</th><th>Subtotal</th></tr></thead>
                <tbody>${itemsHtml}</tbody>
            </table>
            <p style="text-align:right; margin-top:0.8rem;"><strong>Total: ${Store.formatoMoneda(venta.total)}</strong></p>
        `;
        modalDetalleVenta.abrir();
    }

    renderizarTodo();
});
