// js/catalogo.js - Client catalog and shopping cart management

function obtenerCarrito() {
    return JSON.parse(localStorage.getItem('carrito') || '[]');
}

function guardarCarrito(carrito) {
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

function agregarAlCarrito(producto) {
    const carrito = obtenerCarrito();
    const itemExistente = carrito.find(item => item.id === producto.id);

    if (itemExistente) {
        itemExistente.cantidad++;
    } else {
        carrito.push({
            id: producto.id,
            title: producto.title,
            price: producto.price,
            image: producto.image,
            cantidad: 1
        });
    }

    guardarCarrito(carrito);
    mostrarNotificacion(`✅ ${producto.title} agregado al carrito`);
}

function eliminarDelCarrito(productoId) {
    let carrito = obtenerCarrito();
    carrito = carrito.filter(item => item.id !== productoId);
    guardarCarrito(carrito);
}

function actualizarCantidadCarrito(productoId, nueva_cantidad) {
    const carrito = obtenerCarrito();
    const item = carrito.find(i => i.id === productoId);
    
    if (item) {
        if (nueva_cantidad <= 0) {
            eliminarDelCarrito(productoId);
        } else {
            item.cantidad = nueva_cantidad;
            guardarCarrito(carrito);
        }
    }
}

function calcularTotalCarrito() {
    const carrito = obtenerCarrito();
    return carrito.reduce((total, item) => total + (item.price * item.cantidad), 0).toFixed(2);
}

function buscarProductos(termino) {
    const productos = JSON.parse(localStorage.getItem('productos') || '[]');
    return productos.filter(p => 
        p.title.toLowerCase().includes(termino.toLowerCase()) ||
        p.description.toLowerCase().includes(termino.toLowerCase())
    );
}

function filtrarPorCategoria(categoria) {
    const productos = JSON.parse(localStorage.getItem('productos') || '[]');
    return categoria === 'todos' ? productos : productos.filter(p => p.category === categoria);
}

function filtrarPorPrecio(min, max) {
    const productos = JSON.parse(localStorage.getItem('productos') || '[]');
    return productos.filter(p => p.price >= min && p.price <= max);
}

function obtenerCategorias() {
    const productos = JSON.parse(localStorage.getItem('productos') || '[]');
    const categorias = [...new Set(productos.map(p => p.category))];
    return categorias;
}

function mostrarNotificacion(mensaje, tipo = 'success') {
    const notif = document.createElement('div');
    notif.className = `fixed top-20 right-4 px-6 py-3 rounded-lg text-white font-semibold z-50 ${
        tipo === 'success' ? 'bg-green-600' : 'bg-red-600'
    }`;
    notif.textContent = mensaje;
    document.body.appendChild(notif);

    setTimeout(() => notif.remove(), 3000);
}

function mostrarCatalogo() {
    if (!estaAutenticado()) {
        window.location.href = 'index.html?view=login';
        return;
    }

    const container = document.getElementById('app-container');
    if (!container) return;

    const productos = JSON.parse(localStorage.getItem('productos') || '[]');
    const categorias = obtenerCategorias();
    const usuario = obtenerUsuarioActual();

    container.innerHTML = `
        <div class="max-w-7xl mx-auto px-4 py-8">
            <div class="mb-8">
                <h2 class="text-4xl font-bold text-gray-800 dark:text-white mb-4">Bienvenido, ${usuario.nombre}</h2>
                <p class="text-gray-600 dark:text-gray-400">Descubre nuestros productos disponibles</p>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <aside class="lg:col-span-1">
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-20">
                        <h3 class="text-xl font-bold mb-6 text-gray-800 dark:text-white">Filtros</h3>

                        <div class="mb-6">
                            <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Buscar</label>
                            <input type="text" id="search-input" placeholder="Buscar productos..." 
                                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                        </div>

                        <div class="mb-6">
                            <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Categoría</label>
                            <select id="category-filter" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                                <option value="todos">Todas</option>
                                ${categorias.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                            </select>
                        </div>

                        <div>
                            <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Precio: $<span id="price-display">500</span></label>
                            <input type="range" id="price-filter" min="0" max="1000" value="500" 
                                class="w-full">
                        </div>

                        <div class="mt-8 pt-6 border-t border-gray-300 dark:border-gray-600">
                            <button id="btn-carrito" class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-semibold">
                                🛒 Ver Carrito (<span id="cart-count">0</span>)
                            </button>
                        </div>
                    </div>
                </aside>

                <main class="lg:col-span-3">
                    <div id="productos-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <!-- Productos aquí -->
                    </div>
                </main>
            </div>
        </div>
    `;

    renderizarProductos(productos);

    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    const priceFilter = document.getElementById('price-filter');
    const btnCarrito = document.getElementById('btn-carrito');
    const priceDisplay = document.getElementById('price-display');

    searchInput.addEventListener('input', () => {
        const termino = searchInput.value;
        const resultados = buscarProductos(termino);
        renderizarProductos(resultados);
    });

    categoryFilter.addEventListener('change', () => {
        const categoria = categoryFilter.value;
        const resultados = filtrarPorCategoria(categoria);
        renderizarProductos(resultados);
    });

    priceFilter.addEventListener('input', () => {
        priceDisplay.textContent = priceFilter.value;
        const max = parseInt(priceFilter.value);
        const resultados = filtrarPorPrecio(0, max);
        renderizarProductos(resultados);
    });

    btnCarrito.addEventListener('click', mostrarCarrito);

    actualizarContadorCarrito();
}

function renderizarProductos(productos) {
    const grid = document.getElementById('productos-grid');
    if (!grid) return;

    if (productos.length === 0) {
        grid.innerHTML = '<p class="col-span-full text-center text-gray-500 py-8">No se encontraron productos</p>';
        return;
    }

    grid.innerHTML = productos.map(producto => `
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
            <img src="${producto.image}" alt="${producto.title}" class="w-full h-48 object-cover">
            <div class="p-4">
                <h3 class="font-semibold text-gray-800 dark:text-white mb-2 line-clamp-2">${producto.title}</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">${producto.description}</p>
                <div class="flex justify-between items-center">
                    <span class="text-2xl font-bold text-blue-600 dark:text-blue-400">$${producto.price}</span>
                    <button class="btn-add-carrito bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition font-semibold" 
                        data-id="${producto.id}" data-title="${producto.title}" data-price="${producto.price}" data-image="${producto.image}">
                        ➕
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    document.querySelectorAll('.btn-add-carrito').forEach(btn => {
        btn.addEventListener('click', () => {
            const producto = {
                id: parseInt(btn.dataset.id),
                title: btn.dataset.title,
                price: parseFloat(btn.dataset.price),
                image: btn.dataset.image
            };
            agregarAlCarrito(producto);
            actualizarContadorCarrito();
        });
    });
}

function actualizarContadorCarrito() {
    const carrito = obtenerCarrito();
    const contador = carrito.length;
    const contadorEl = document.getElementById('cart-count');
    if (contadorEl) {
        contadorEl.textContent = contador;
    }
}

function mostrarCarrito() {
    const carrito = obtenerCarrito();
    const container = document.getElementById('app-container');
    if (!container) return;

    const total = calcularTotalCarrito();

    container.innerHTML = `
        <div class="max-w-4xl mx-auto px-4 py-8">
            <button id="volver-catalogo" class="mb-6 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                ← Volver al Catálogo
            </button>

            <h2 class="text-4xl font-bold mb-8 text-gray-800 dark:text-white">🛒 Tu Carrito</h2>

            ${carrito.length === 0 ? `
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
                    <p class="text-gray-600 dark:text-gray-400 text-lg mb-4">Tu carrito está vacío</p>
                    <button id="seguir-comprando" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                        Continuar Comprando
                    </button>
                </div>
            ` : `
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div class="lg:col-span-2 space-y-4">
                        ${carrito.map(item => `
                            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex gap-4">
                                <img src="${item.image}" alt="${item.title}" class="w-24 h-24 object-cover rounded">
                                <div class="flex-1">
                                    <h3 class="font-semibold text-gray-800 dark:text-white">${item.title}</h3>
                                    <p class="text-blue-600 dark:text-blue-400 text-lg font-bold">$${item.price}</p>
                                </div>
                                <div class="flex flex-col items-center gap-2">
                                    <button class="btn-disminuir bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700" data-id="${item.id}">−</button>
                                    <span class="font-bold text-gray-800 dark:text-white">${item.cantidad}</span>
                                    <button class="btn-aumentar bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700" data-id="${item.id}">+</button>
                                    <button class="btn-eliminar bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 text-xs mt-2" data-id="${item.id}">Eliminar</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    <div class="bg-blue-600 dark:bg-blue-800 text-white rounded-lg shadow-md p-6 h-fit sticky top-20">
                        <h3 class="text-2xl font-bold mb-4">Resumen</h3>
                        <div class="space-y-2 mb-6 pb-6 border-b border-blue-400">
                            <div class="flex justify-between">
                                <span>Subtotal:</span>
                                <span>$${total}</span>
                            </div>
                            <div class="flex justify-between">
                                <span>Envío:</span>
                                <span>$0.00 (Gratis)</span>
                            </div>
                        </div>
                        <div class="flex justify-between text-2xl font-bold mb-6">
                            <span>Total:</span>
                            <span>$${total}</span>
                        </div>
                        <button id="btn-checkout" class="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition font-bold text-lg">
                            Proceder al Checkout
                        </button>
                    </div>
                </div>
            `}
        </div>
    `;

    document.getElementById('volver-catalogo')?.addEventListener('click', () => {
        mostrarCatalogo();
    });

    document.getElementById('seguir-comprando')?.addEventListener('click', () => {
        mostrarCatalogo();
    });

    document.querySelectorAll('.btn-disminuir').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            const item = carrito.find(i => i.id === id);
            actualizarCantidadCarrito(id, item.cantidad - 1);
            mostrarCarrito();
        });
    });

    document.querySelectorAll('.btn-aumentar').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            const item = carrito.find(i => i.id === id);
            actualizarCantidadCarrito(id, item.cantidad + 1);
            mostrarCarrito();
        });
    });

    document.querySelectorAll('.btn-eliminar').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            eliminarDelCarrito(id);
            mostrarCarrito();
        });
    });

    document.getElementById('btn-checkout')?.addEventListener('click', mostrarCheckout);
}

function mostrarCheckout() {
    if (!navigator.onLine) {
        const carrito = obtenerCarrito();
        if (carrito.length > 0) {
            const compra = {
                items: carrito,
                total: calcularTotalCarrito(),
                usuario: obtenerUsuarioActual().email
            };
            agregarAColaDeSincronizacion(compra);
            localStorage.setItem('carrito', JSON.stringify([]));
            mostrarNotificacion('📱 Compra guardada. Se sincronizará cuando recuperes conexión', 'success');
            setTimeout(() => mostrarCatalogo(), 2000);
            return;
        }
    }

    const container = document.getElementById('app-container');
    const carrito = obtenerCarrito();
    const total = calcularTotalCarrito();

    container.innerHTML = `
        <div class="max-w-2xl mx-auto px-4 py-8">
            <h2 class="text-3xl font-bold mb-8 text-gray-800 dark:text-white">✅ Checkout</h2>

            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                <h3 class="text-xl font-bold mb-4 text-gray-800 dark:text-white">Información de Envío</h3>
                <form id="form-checkout" class="space-y-4">
                    <input type="text" placeholder="Nombre Completo" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
                    <input type="email" placeholder="Email" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
                    <input type="text" placeholder="Dirección" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
                    <input type="text" placeholder="Teléfono" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
                    
                    <div class="pt-4 border-t border-gray-300 dark:border-gray-600">
                        <h4 class="font-bold mb-4 text-gray-800 dark:text-white">Información de Pago</h4>
                        <input type="text" placeholder="Número de Tarjeta" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white mb-3">
                        <div class="grid grid-cols-2 gap-4">
                            <input type="text" placeholder="MM/YY" required class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
                            <input type="text" placeholder="CVV" required class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
                        </div>
                    </div>

                    <button type="submit" class="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-bold text-lg">
                        Completar Compra - $${total}
                    </button>
                </form>
            </div>
        </div>
    `;

    document.getElementById('form-checkout').addEventListener('submit', (e) => {
        e.preventDefault();

        const compra = {
            id: Date.now(),
            items: carrito,
            total: calcularTotalCarrito(),
            usuario: obtenerUsuarioActual().email,
            fecha: new Date().toISOString(),
            estado: 'completada'
        };

        let compras = JSON.parse(localStorage.getItem('compras') || '[]');
        compras.push(compra);
        localStorage.setItem('compras', JSON.stringify(compras));
        localStorage.setItem('carrito', JSON.stringify([]));

        mostrarNotificacion('✅ ¡Compra completada exitosamente!', 'success');
        setTimeout(() => mostrarCatalogo(), 2000);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    if (!estaAutenticado()) return;

    const urlParams = new URLSearchParams(window.location.search);
    const vista = urlParams.get('view');

    if (vista === 'catalogo') {
        mostrarCatalogo();
    }
});
