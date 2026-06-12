// js/admin.js - Administration dashboard and product CRUD

function mostrarPanelAdmin() {
    if (!estaAutenticado() || !esAdmin()) {
        window.location.href = 'index.html?view=login';
        return;
    }

    const container = document.getElementById('app-container');
    if (!container) return;

    const usuarios = obtenerUsuarios();
    const compras = JSON.parse(localStorage.getItem('compras') || '[]');
    const productos = JSON.parse(localStorage.getItem('productos') || '[]');

    const totalIngresos = compras.reduce((sum, c) => sum + parseFloat(c.total), 0).toFixed(2);
    const totalUsuarios = usuarios.length;

    // Calcular usuarios activos
    const activosList = JSON.parse(localStorage.getItem('usuarios-activos') || '[]');
    const totalActivos = activosList.filter(email => usuarios.some(u => u.email === email)).length;

    // Calcular Top 3 productos más vendidos
    const ventasPorProducto = {}; // { id: { title, qty } }
    compras.forEach(compra => {
        compra.items.forEach(item => {
            if (!ventasPorProducto[item.id]) {
                ventasPorProducto[item.id] = {
                    title: item.title,
                    qty: 0
                };
            }
            ventasPorProducto[item.id].qty += item.cantidad;
        });
    });

    const topProductos = Object.values(ventasPorProducto)
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 3);

    container.innerHTML = `
        <div class="max-w-7xl mx-auto px-4 py-8">
            <div class="mb-8">
                <h2 class="text-4xl font-extrabold text-gray-800 dark:text-white mb-2">📊 Panel de Administración</h2>
                <p class="text-gray-650 dark:text-gray-400">Gestiona tu tienda, productos, usuarios y ventas</p>
            </div>

            <!-- Métricas principales -->
            <div class="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8">
                <div class="bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-2xl shadow-md p-6">
                    <div class="text-3xl font-black mb-2">$${totalIngresos}</div>
                    <div class="text-xs uppercase tracking-wider opacity-90 font-semibold">Total de Ingresos</div>
                </div>
                <div class="bg-gradient-to-br from-purple-650 to-purple-800 text-white rounded-2xl shadow-md p-6">
                    <div class="text-3xl font-black mb-2">${totalUsuarios}</div>
                    <div class="text-xs uppercase tracking-wider opacity-90 font-semibold">Usuarios Registrados</div>
                </div>
                <div class="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white rounded-2xl shadow-md p-6">
                    <div class="text-3xl font-black mb-2">${totalActivos}</div>
                    <div class="text-xs uppercase tracking-wider opacity-90 font-semibold">Usuarios Activos</div>
                </div>
                <div class="bg-gradient-to-br from-green-600 to-green-800 text-white rounded-2xl shadow-md p-6">
                    <div class="text-3xl font-black mb-2">${compras.length}</div>
                    <div class="text-xs uppercase tracking-wider opacity-90 font-semibold">Órdenes Completadas</div>
                </div>
            </div>

            <!-- Top 3 productos más vendidos -->
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 mb-8 border border-gray-150 dark:border-gray-700">
                <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">🏆 Top 3 Productos Más Vendidos</h3>
                ${topProductos.length === 0 ? `
                    <p class="text-gray-500 dark:text-gray-400 text-sm italic">No hay suficientes datos de ventas para mostrar métricas de productos.</p>
                ` : `
                    <div class="space-y-4">
                        ${topProductos.map((prod, idx) => {
                            const maxQty = topProductos[0].qty || 1;
                            const pct = Math.round((prod.qty / maxQty) * 100);
                            return `
                                <div class="flex items-center gap-4">
                                    <div class="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center font-black text-blue-600 dark:text-blue-400">
                                        #${idx + 1}
                                    </div>
                                    <div class="flex-1">
                                        <div class="flex justify-between text-sm font-semibold text-gray-800 dark:text-white mb-1">
                                            <span class="truncate max-w-xs sm:max-w-md">${prod.title}</span>
                                            <span>${prod.qty} unidades</span>
                                        </div>
                                        <div class="w-full bg-gray-200 dark:bg-gray-700 h-3 rounded-full overflow-hidden">
                                            <div class="bg-gradient-to-r from-blue-500 to-indigo-650 h-full rounded-full transition-all duration-550" style="width: ${pct}%"></div>
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `}
            </div>

            <!-- Tabs de navegación -->
            <div class="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
                <button class="tab-btn active px-4 py-2 border-b-2 border-blue-600 text-blue-600 font-bold" data-tab="productos">
                    📦 Productos
                </button>
                <button class="tab-btn px-4 py-2 border-b-2 border-transparent text-gray-650 dark:text-gray-400 font-bold hover:text-blue-600" data-tab="pedidos">
                    🛍️ Pedidos
                </button>
                <button class="tab-btn px-4 py-2 border-b-2 border-transparent text-gray-650 dark:text-gray-400 font-bold hover:text-blue-600" data-tab="usuarios">
                    👥 Usuarios
                </button>
            </div>

            <!-- Contenido de tabs -->
            <div id="tab-content"></div>
        </div>
    `;

    mostrarTabProductos();

    // Event listeners para tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => {
                b.classList.remove('border-blue-600', 'text-blue-600');
                b.classList.add('border-transparent', 'text-gray-605', 'dark:text-gray-400');
            });
            btn.classList.add('border-blue-600', 'text-blue-600');
            btn.classList.remove('border-transparent', 'text-gray-605', 'dark:text-gray-400');

            const tab = btn.dataset.tab;
            if (tab === 'productos') mostrarTabProductos();
            else if (tab === 'pedidos') mostrarTabPedidos();
            else if (tab === 'usuarios') mostrarTabUsuarios();
        });
    });
}

function mostrarTabProductos() {
    const productos = JSON.parse(localStorage.getItem('productos') || '[]');
    const tabContent = document.getElementById('tab-content');

    tabContent.innerHTML = `
        <div>
            <button id="btn-agregar-producto" class="mb-6 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl transition font-bold shadow-md shadow-green-500/10">
                ➕ Agregar Nuevo Producto
            </button>

            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-x-auto border border-gray-150 dark:border-gray-700">
                <table class="w-full">
                    <thead class="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th class="px-6 py-3 text-left font-bold text-gray-800 dark:text-white">Imagen</th>
                            <th class="px-6 py-3 text-left font-bold text-gray-800 dark:text-white">Título</th>
                            <th class="px-6 py-3 text-left font-bold text-gray-800 dark:text-white">Categoría</th>
                            <th class="px-6 py-3 text-left font-bold text-gray-800 dark:text-white">Precio</th>
                            <th class="px-6 py-3 text-left font-bold text-gray-800 dark:text-white">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${productos.map((prod, idx) => `
                            <tr class="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50/50 dark:hover:bg-gray-700/50">
                                <td class="px-6 py-3">
                                    <img src="${prod.image}" alt="${prod.title}" class="w-10 h-10 object-cover rounded-lg shadow-sm">
                                </td>
                                <td class="px-6 py-3 text-gray-800 dark:text-white font-medium max-w-xs truncate">${prod.title}</td>
                                <td class="px-6 py-3 text-gray-600 dark:text-gray-400 text-sm">${prod.category}</td>
                                <td class="px-6 py-3 font-bold text-blue-600 dark:text-blue-400">$${prod.price}</td>
                                <td class="px-6 py-3 flex gap-2">
                                    <button class="btn-editar bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700" data-id="${prod.id}">✏️</button>
                                    <button class="btn-eliminar-prod bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700" data-id="${prod.id}">🗑️</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <div id="modal-producto" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
                    <h3 class="text-2xl font-bold mb-4 text-gray-800 dark:text-white" id="modal-titulo">Agregar Producto</h3>
                    <form id="form-producto" class="space-y-4">
                        <input type="hidden" id="producto-id">
                        <input type="text" id="producto-titulo" placeholder="Título" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
                        <textarea id="producto-descripcion" placeholder="Descripción" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white h-24"></textarea>
                        <input type="number" id="producto-precio" placeholder="Precio" step="0.01" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
                        <input type="text" id="producto-categoria" placeholder="Categoría" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
                        <input type="url" id="producto-imagen" placeholder="URL de imagen" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
                        <div class="flex gap-2 pt-2">
                            <button type="submit" class="flex-1 bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 font-bold transition">Guardar</button>
                            <button type="button" id="btn-cerrar-modal" class="flex-1 bg-gray-600 text-white py-2.5 rounded-lg hover:bg-gray-700 font-bold transition">Cancelar</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;

    const modal = document.getElementById('modal-producto');
    const btnAgregar = document.getElementById('btn-agregar-producto');
    const btnCerrar = document.getElementById('btn-cerrar-modal');
    const formProducto = document.getElementById('form-producto');

    btnAgregar.addEventListener('click', () => {
        document.getElementById('producto-id').value = '';
        document.getElementById('modal-titulo').textContent = 'Agregar Producto';
        formProducto.reset();
        modal.classList.remove('hidden');
    });

    btnCerrar.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    document.querySelectorAll('.btn-editar').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            const producto = productos.find(p => p.id === id);
            document.getElementById('producto-id').value = id;
            document.getElementById('producto-titulo').value = producto.title;
            document.getElementById('producto-descripcion').value = producto.description;
            document.getElementById('producto-precio').value = producto.price;
            document.getElementById('producto-categoria').value = producto.category;
            document.getElementById('producto-imagen').value = producto.image;
            document.getElementById('modal-titulo').textContent = 'Editar Producto';
            modal.classList.remove('hidden');
        });
    });

    document.querySelectorAll('.btn-eliminar-prod').forEach(btn => {
        btn.addEventListener('click', () => {
            if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
                const id = parseInt(btn.dataset.id);
                const productosActualizados = productos.filter(p => p.id !== id);
                localStorage.setItem('productos', JSON.stringify(productosActualizados));
                mostrarTabProductos();
                mostrarNotificacion('✅ Producto eliminado', 'success');
            }
        });
    });

    formProducto.addEventListener('submit', (e) => {
        e.preventDefault();

        const id = document.getElementById('producto-id').value;
        const nuevoProducto = {
            id: id ? parseInt(id) : Date.now(),
            title: document.getElementById('producto-titulo').value,
            description: document.getElementById('producto-descripcion').value,
            price: parseFloat(document.getElementById('producto-precio').value),
            category: document.getElementById('producto-categoria').value,
            image: document.getElementById('producto-imagen').value,
            rating: { rate: 4, count: 0 }
        };

        let productosActualizados = JSON.parse(localStorage.getItem('productos') || '[]');

        if (id) {
            const idx = productosActualizados.findIndex(p => p.id === parseInt(id));
            productosActualizados[idx] = nuevoProducto;
        } else {
            productosActualizados.push(nuevoProducto);
        }

        localStorage.setItem('productos', JSON.stringify(productosActualizados));
        modal.classList.add('hidden');
        mostrarTabProductos();
        mostrarNotificacion(id ? '✅ Producto actualizado' : '✅ Producto agregado', 'success');
    });
}

function mostrarTabPedidos() {
    const compras = JSON.parse(localStorage.getItem('compras') || '[]');
    const tabContent = document.getElementById('tab-content');

    if (compras.length === 0) {
        tabContent.innerHTML = '<p class="text-center text-gray-500 py-8">No hay pedidos aún</p>';
        return;
    }

    tabContent.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-x-auto border border-gray-150 dark:border-gray-700">
            <table class="w-full">
                <thead class="bg-gray-50 dark:bg-gray-700">
                    <tr>
                        <th class="px-6 py-3 text-left font-bold text-gray-800 dark:text-white">ID Orden</th>
                        <th class="px-6 py-3 text-left font-bold text-gray-800 dark:text-white">Cliente</th>
                        <th class="px-6 py-3 text-left font-bold text-gray-800 dark:text-white">Total</th>
                        <th class="px-6 py-3 text-left font-bold text-gray-800 dark:text-white">Fecha</th>
                        <th class="px-6 py-3 text-left font-bold text-gray-800 dark:text-white">Estado de Envío</th>
                    </tr>
                </thead>
                <tbody>
                    ${compras.map(compra => {
                        const estado = compra.estado || 'Pendiente';
                        return `
                            <tr class="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50/50 dark:hover:bg-gray-700/50">
                                <td class="px-6 py-3 font-mono text-gray-805 dark:text-white">#${compra.id}</td>
                                <td class="px-6 py-3 text-gray-600 dark:text-gray-400 text-sm">${compra.usuario}</td>
                                <td class="px-6 py-3 font-bold text-green-600">$${compra.total}</td>
                                <td class="px-6 py-3 text-gray-600 dark:text-gray-400 text-sm">${new Date(compra.fecha).toLocaleDateString()}</td>
                                <td class="px-6 py-3">
                                    <select class="select-estado-pedido border border-gray-300 dark:border-gray-600 rounded-lg px-2.5 py-1.5 bg-white dark:bg-gray-700 text-gray-800 dark:text-white font-semibold text-sm transition" data-id="${compra.id}">
                                        <option value="Pendiente" ${estado === 'Pendiente' ? 'selected' : ''}>⏳ Pendiente</option>
                                        <option value="Enviado" ${estado === 'Enviado' ? 'selected' : ''}>🚚 Enviado</option>
                                        <option value="Entregado" ${estado === 'Entregado' ? 'selected' : ''}>✅ Entregado</option>
                                    </select>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;

    // Add change listeners to status selectors
    document.querySelectorAll('.select-estado-pedido').forEach(select => {
        select.addEventListener('change', (e) => {
            const id = parseInt(select.dataset.id);
            const nuevoEstado = e.target.value;

            let currentCompras = JSON.parse(localStorage.getItem('compras') || '[]');
            const idx = currentCompras.findIndex(c => c.id === id);
            if (idx !== -1) {
                currentCompras[idx].estado = nuevoEstado;
                localStorage.setItem('compras', JSON.stringify(currentCompras));
                if (typeof mostrarNotificacion === 'function') {
                    mostrarNotificacion(`✅ Pedido #${id} actualizado a "${nuevoEstado}"`, 'success');
                }
            }
        });
    });
}

function mostrarTabUsuarios() {
    const usuarios = obtenerUsuarios();
    const tabContent = document.getElementById('tab-content');

    tabContent.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-x-auto border border-gray-150 dark:border-gray-700">
            <table class="w-full">
                <thead class="bg-gray-50 dark:bg-gray-700">
                    <tr>
                        <th class="px-6 py-3 text-left font-bold text-gray-800 dark:text-white">Nombre</th>
                        <th class="px-6 py-3 text-left font-bold text-gray-800 dark:text-white">Email</th>
                        <th class="px-6 py-3 text-left font-bold text-gray-800 dark:text-white">Rol</th>
                        <th class="px-6 py-3 text-left font-bold text-gray-800 dark:text-white">Fecha de Registro</th>
                    </tr>
                </thead>
                <tbody>
                    ${usuarios.map(usuario => `
                        <tr class="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50/50 dark:hover:bg-gray-700/50">
                            <td class="px-6 py-3 font-medium text-gray-850 dark:text-white flex items-center gap-2">
                                <img src="${usuario.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}" alt="Avatar" class="w-8 h-8 rounded-full border border-gray-200 object-cover shadow-sm">
                                <span>${usuario.nombre}</span>
                            </td>
                            <td class="px-6 py-3 text-gray-600 dark:text-gray-400 text-sm">${usuario.email}</td>
                            <td class="px-6 py-3">
                                <span class="bg-${usuario.rol === 'admin' ? 'purple' : 'blue'}-100 dark:bg-${usuario.rol === 'admin' ? 'purple' : 'blue'}-900/30 text-${usuario.rol === 'admin' ? 'purple' : 'blue'}-700 dark:text-${usuario.rol === 'admin' ? 'purple' : 'blue'}-300 px-3 py-1 rounded-full text-xs font-bold">
                                    ${usuario.rol === 'admin' ? '👨‍💼 Admin' : '👤 Cliente'}
                                </span>
                            </td>
                            <td class="px-6 py-3 text-gray-650 dark:text-gray-400 text-sm">${new Date(usuario.fechaRegistro).toLocaleDateString()}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}
