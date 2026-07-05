/**
 * components.js
 * Web Components reutilizables construidos con Shadow DOM.
 *  - <app-modal>   : modal genérico con slot, usado para formularios y detalles.
 *  - <evento-card> : tarjeta de evento para la vista pública de clientes.
 */

class AppModal extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        shadow.innerHTML = `
            <style>
                :host { all: initial; }
                .overlay {
                    display: none;
                    position: fixed;
                    inset: 0;
                    background: rgba(15, 15, 20, 0.55);
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }
                .overlay.visible { display: flex; }
                .box {
                    background: #ffffff;
                    border-radius: 12px;
                    width: min(92vw, 480px);
                    max-height: 88vh;
                    overflow-y: auto;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.25);
                    animation: aparecer 0.18s ease-out;
                }
                @keyframes aparecer {
                    from { transform: translateY(-12px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .head {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1.1rem 1.4rem;
                    border-bottom: 1px solid #e2e8f0;
                }
                .head h3 { margin: 0; font-size: 1.05rem; color: #6f0000; }
                .close-btn {
                    border: none;
                    background: transparent;
                    font-size: 1.3rem;
                    cursor: pointer;
                    color: #777;
                    line-height: 1;
                }
                .body { padding: 1.4rem; }
            </style>
            <div class="overlay">
                <div class="box">
                    <div class="head">
                        <h3></h3>
                        <button class="close-btn" aria-label="Cerrar">&times;</button>
                    </div>
                    <div class="body">
                        <slot></slot>
                    </div>
                </div>
            </div>
        `;
        this._overlay = shadow.querySelector('.overlay');
        this._titulo = shadow.querySelector('.head h3');
        shadow.querySelector('.close-btn').addEventListener('click', () => this.cerrar());
        this._overlay.addEventListener('click', (e) => {
            if (e.target === this._overlay) this.cerrar();
        });
    }

    static get observedAttributes() { return ['titulo']; }

    attributeChangedCallback(name, _old, val) {
        if (name === 'titulo' && this._titulo) this._titulo.textContent = val;
    }

    connectedCallback() {
        if (this.hasAttribute('titulo')) this._titulo.textContent = this.getAttribute('titulo');
    }

    abrir() {
        this._overlay.classList.add('visible');
        this.dispatchEvent(new CustomEvent('modal-abierto'));
    }

    cerrar() {
        this._overlay.classList.remove('visible');
        this.dispatchEvent(new CustomEvent('modal-cerrado'));
    }
}
customElements.define('app-modal', AppModal);


class EventoCard extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        shadow.innerHTML = `
            <style>
                :host {
                    all: initial;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }
                .card {
                    background: #fff;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.07);
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    transition: transform 0.15s ease;
                }
                .card:hover { transform: translateY(-4px); }
                img { width: 100%; height: 160px; object-fit: cover; display: block; }
                .info { padding: 1rem; display: flex; flex-direction: column; gap: 0.4rem; flex: 1; }
                .badge {
                    align-self: flex-start;
                    background: #ffe5e5;
                    color: #b90000;
                    font-size: 0.7rem;
                    padding: 3px 10px;
                    border-radius: 12px;
                    font-weight: 600;
                }
                h4 { margin: 0.2rem 0 0; font-size: 1rem; color: #222; }
                .meta { font-size: 0.8rem; color: #777; }
                .precio { font-size: 1.1rem; font-weight: 700; color: #6f0000; margin-top: auto; }
                .actions { display: flex; gap: 0.5rem; padding: 0 1rem 1rem; }
                button {
                    flex: 1;
                    padding: 0.55rem;
                    border-radius: 6px;
                    border: none;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 0.82rem;
                }
                .btn-detalle { background: #eef2f5; color: #333; }
                .btn-carrito { background: #b90000; color: #fff; }
                .btn-detalle:hover { background: #dfe6ea; }
                .btn-carrito:hover { background: #8a0000; }
            </style>
            <div class="card">
                <img>
                <div class="info">
                    <span class="badge"></span>
                    <h4></h4>
                    <span class="meta ciudad"></span>
                    <span class="meta fecha"></span>
                    <span class="precio"></span>
                </div>
                <div class="actions">
                    <button class="btn-detalle">Ver detalle</button>
                    <button class="btn-carrito">Agregar</button>
                </div>
            </div>
        `;
        shadow.querySelector('.btn-detalle').addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('ver-detalle', { detail: this._evento, bubbles: true, composed: true }));
        });
        shadow.querySelector('.btn-carrito').addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('agregar-carrito', { detail: this._evento, bubbles: true, composed: true }));
        });
        this._shadow = shadow;
    }

    set evento(data) {
        this._evento = data;
        const s = this._shadow;
        s.querySelector('img').src = data.imagen;
        s.querySelector('img').onerror = function () { this.src = 'https://picsum.photos/500/300'; };
        s.querySelector('.badge').textContent = data.categoria;
        s.querySelector('h4').textContent = data.nombre;
        s.querySelector('.ciudad').textContent = `📍 ${data.ciudad}`;
        s.querySelector('.fecha').textContent = `🗓️ ${data.fecha}  •  ${data.hora}`;
        s.querySelector('.precio').textContent = `$${Number(data.precio).toLocaleString('es-CO')}`;
    }

    get evento() { return this._evento; }
}
customElements.define('evento-card', EventoCard);
