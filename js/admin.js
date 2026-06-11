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

    container.innerHTML = `
        <div class="max-w-7xl mx-auto px-4 py-8">
            <div class="mb-8">
                <h2 class="text-4xl font-bold text-gray-800 dark:text-white mb-4">📊 Panel de Administración</h2>
                <p class="text-gray-600 dark:text-gray-400">Gestiona tu tienda, productos y ventas</p>
            </div>

            <!-- Métricas principales -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                <div class="bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-lg shadow-md p-6">
                    <div class="text-3xl font-bold mb-2">$${totalIngresos}</div>
                    <div class="text-sm opacity-90">Total de Ingresos</div>
                </div>
                <div class="bg-gradient-to-br from-green-600 to-green-800 text-white rounded-lg shadow-md p-6">
                    <div class="text-3xl font-bold mb-2">${totalUsuarios}</div>
                    <div class="text-sm opacity-90">Usuarios Registrados</div>
                </div>
                <div class="bg-gradient-to-br from-purple-600 to-purple-800 text-white rounded-lg shadow-md p-6">
                    <div class="text-3xl font-bold mb-2">${compras.length}</div>
                    <div class="text-sm opacity-90">Órdenes Completadas</div>
                </div>
            </div>

            <!-- Tabs de navegación -->
            <div class="flex gap-4 mb-6 border-b border-gray-300 dark:border-gray-600">
                <button class="tab-btn active px-4 py-2 border-b-2 border-blue-600 text-blue-600 font-bold" data-tab="productos">
                    📦 Productos
                </button>
                <button class="tab-btn px-4 py-2 border-b-2 border-transparent text-gray-600 dark:text-gray-400 font-bold hover:text-blue-600" data-tab="pedidos">
                    🛍️ Pedidos
                </button>
                <button class="tab-btn px-4 py-2 border-b-2 border-transparent text-gray-600 dark:text-gray-400 font-bold hover:text-blue-600" data-tab="usuarios">
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
                b.classList.add('border-transparent', 'text-gray-600', 'dark:text-gray-400');
            });
            btn.classList.add('border-blue-600', 'text-blue-600');
            btn.classList.remove('border-transparent', 'text-gray-600', 'dark:text-gray-400');

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
            <button id="btn-agregar-producto" class="mb-6 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-bold">
                ➕ Agregar Nuevo Producto
            </button>

            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-gray-100 dark:bg-gray-700">
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
                            <tr class="border-t border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td class="px-6 py-3">
                                    <img src="${prod.image}" alt="${prod.title}" class="w-12 h-12 object-cover rounded">
                                </td>
                                <td class="px-6 py-3 text-gray-800 dark:text-white font-medium max-w-xs truncate">${prod.title}</td>
                                <td class="px-6 py-3 text-gray-600 dark:text-gray-400">${prod.category}</td>
                                <td class="px-6 py-3 font-bold text-blue-600">$${prod.price}</td>
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
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
                    <h3 class="text-2xl font-bold mb-4 text-gray-800 dark:text-white" id="modal-titulo">Agregar Producto</h3>
                    <form id="form-producto" class="space-y-4">
                        <input type="hidden" id="producto-id">
                        <input type="text" id="producto-titulo" placeholder="Título" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
                        <textarea id="producto-descripcion" placeholder="Descripción" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white h-24"></textarea>
                        <input type="number" id="producto-precio" placeholder="Precio" step="0.01" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
                        <input type="text" id="producto-categoria" placeholder="Categoría" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
                        <input type="url" id="producto-imagen" placeholder="URL de imagen" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
                        <div class="flex gap-2">
                            <button type="submit" class="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-bold">Guardar</button>
                            <button type="button" id="btn-cerrar-modal" class="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 font-bold">Cancelar</button>
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
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-x-auto">
            <table class="w-full">
                <thead class="bg-gray-100 dark:bg-gray-700">
                    <tr>
                        <th class="px-6 py-3 text-left font-bold text-gray-800 dark:text-white">ID Orden</th>
                        <th class="px-6 py-3 text-left font-bold text-gray-800 dark:text-white">Cliente</th>
                        <th class="px-6 py-3 text-left font-bold text-gray-800 dark:text-white">Total</th>
                        <th class="px-6 py-3 text-left font-bold text-gray-800 dark:text-white">Fecha</th>
                        <th class="px-6 py-3 text-left font-bold text-gray-800 dark:text-white">Estado</th>
                    </tr>
                </thead>
                <tbody>
                    ${compras.map(compra => `
                        <tr class="border-t border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td class="px-6 py-3 font-mono text-gray-800 dark:text-white">#${compra.id}</td>
                            <td class="px-6 py-3 text-gray-600 dark:text-gray-400">${compra.usuario}</td>
                            <td class="px-6 py-3 font-bold text-green-600">$${compra.total}</td>
                            <td class="px-6 py-3 text-gray-600 dark:text-gray-400">${new Date(compra.fecha).toLocaleDateString()}</td>
                            <td class="px-6 py-3"><span class="bg-green-200 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm font-bold">${compra.estado}</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function mostrarTabUsuarios() {
    const usuarios = obtenerUsuarios();
    const tabContent = document.getElementById('tab-content');

    tabContent.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-x-auto">
            <table class="w-full">
                <thead class="bg-gray-100 dark:bg-gray-700">
                    <tr>
                        <th class="px-6 py-3 text-left font-bold text-gray-800 dark:text-white">Nombre</th>
                        <th class="px-6 py-3 text-left font-bold text-gray-800 dark:text-white">Email</th>
                        <th class="px-6 py-3 text-left font-bold text-gray-800 dark:text-white">Rol</th>
                        <th class="px-6 py-3 text-left font-bold text-gray-800 dark:text-white">Fecha de Registro</th>
                    </tr>
                </thead>
                <tbody>
                    ${usuarios.map(usuario => `
                        <tr class="border-t border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td class="px-6 py-3 font-medium text-gray-800 dark:text-white">${usuario.nombre}</td>
                            <td class="px-6 py-3 text-gray-600 dark:text-gray-400">${usuario.email}</td>
                            <td class="px-6 py-3">
                                <span class="bg-${usuario.rol === 'admin' ? 'purple' : 'blue'}-200 text-${usuario.rol === 'admin' ? 'purple' : 'blue'}-800 px-3 py-1 rounded-full text-sm font-bold">
                                    ${usuario.rol === 'admin' ? '👨‍💼 Admin' : '👤 Cliente'}
                                </span>
                            </td>
                            <td class="px-6 py-3 text-gray-600 dark:text-gray-400">${new Date(usuario.fechaRegistro).toLocaleDateString()}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

document.addEventListener('DOMContentLoaded', () => {
    if (!estaAutenticado()) return;

    const urlParams = new URLSearchParams(window.location.search);
    const vista = urlParams.get('view');

    if (vista === 'admin') {
        mostrarPanelAdmin();
    }
});
