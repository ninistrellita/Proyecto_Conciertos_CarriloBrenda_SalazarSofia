document.addEventListener('DOMContentLoaded', async () => {
 
    const menuItems = document.querySelectorAll('.sidebar-menu .menu-item');
    const sections = document.querySelectorAll('.dashboard-section');
    const pageTitle = document.getElementById('page-title');

    const btnSugerencias = document.getElementById('btn-sugerencias');
    const modalSugerencias = document.getElementById('modal-sugerencias');
    const formSugerencias = document.getElementById('form-sugerencias');

    let appData = await Store.cargar();
    if (!appData) {
        appData = {};
    }

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

            if (pageTitle) pageTitle.textContent = target === 'inicio' ? 'Dashboard General' : target.charAt(0).toUpperCase() + target.slice(1);
            //ENRUTADOR BUZON DE SUGERENCIAS - EXAMEN//
            if (target === 'sugerencias') {
                renderSugerenciasRecibidas();
            }
        });
    });

    function renderSugerenciasRecibidas () {
        const tbody = document.getElementById("tbody-sugerencias");
        if (!tbody) return;
    
        tbody.innerHTML = "";
    
        if (!appData.sugerencias || appData.sugerencias.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:var(--text-muted); padding:1rem;">No hay sugerencias registradas en este momento.</td></tr>';
        return; 
        }

        const sugerenciasOrdenadas = [...appData.sugerencias].sort((a, b) => b.id - a.id);

        sugerenciasOrdenadas.forEach(sug => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                    <td>${new Date(sug.fecha).toLocaleDateString("es-CO")}${new Date(sug.fecha).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</td>
                    <td><strong>${sug.nombre}</strong></td>
                    <td><a href="mailto:${sug.email}" style="color:var(--accent-blue); text-decoration:none;">${sug.email}</a></td>
                    <td style="max-width: 400px; white-space: normal; word-break: break-word;">${sug.mensaje}></td>
            `;
            tbody.appendChild(tr);
        });
    }

    if (btnSugerencias && modalSugerencias) {
        btnSugerencias.addEventListener('click', () => {
            modalSugerencias.abrir()
        });
    }

    if (formSugerencias) {
        formSugerencias.addEventListener('submit', async (e) => {
            e.preventDefault();

            const idSugerencia = Date.now()

            const nuevaSugerencia = {
                id: idSugerencia,
                nombre: document.getElementById('sug-nombre').value.trim(),
                email: document.getElementById('sug-email').value.trim(),
                mensaje: document.getElementById('sug-mensaje').value.trim(),
                fecha: Date.now(),
            };

        if (!nuevaSugerencia.mensaje) {
            alert('Por favor, ingresa un mensaje de sugerencia antes de enviar.');
            return;
        }

        try {

            const datosActualizados = await Store.cargar() || {};
            if (!datosActualizados.sugerencias) {
                datosActualizados.sugerencias = [];
            }

            datosActualizados.sugerencias.push(nuevaSugerencia);

            await Store.guardar(datosActualizados);

            appData = datosActualizados;

            alert('¡Gracias por tu sugerencia! Se ha enviado correctamente.');
            formSugerencias.reset();

            if (modalSugerencias && typeof modalSugerencias.cerrar === 'function') {
                modalSugerencias.cerrar();
            }
        } catch (error) {
            console.error('Error al guardar la sugerencia:', error);
            alert('Ocurrió un error al enviar la sugerencia. Por favor, intenta nuevamente.');
        }
    });
}

});


