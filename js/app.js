// js/app.js - Core application initialization, routing, navbar, and storage management

const API_URL = 'https://fakestoreapi.com/products';

// Helper local para obtener usuario actual antes de que cargue auth.js
function obtenerUsuarioActualLocal() {
    const usuario = sessionStorage.getItem('usuario-actual');
    return usuario ? JSON.parse(usuario) : null;
}

// ===== INICIALIZACIÓN DE PRODUCTOS =====
async function inicializarProductos() {
    if (!localStorage.getItem('productos')) {
        console.log('Poblando el catálogo por primera vez desde la API...');
        try {
            const respuesta = await fetch(API_URL);
            const productosAPI = await respuesta.json();
            
            localStorage.setItem('productos', JSON.stringify(productosAPI));
            console.log('✅ Productos almacenados localmente con éxito.');
            // Si estamos en la landing, recargar para mostrar destacados
            const urlParams = new URLSearchParams(window.location.search);
            if ((urlParams.get('view') || 'landing') === 'landing' && typeof mostrarLandingPage === 'function') {
                mostrarLandingPage();
            }
        } catch (error) {
            console.error('❌ Error al conectar con la API:', error);
            localStorage.setItem('productos', JSON.stringify([]));
        }
    } else {
        console.log('📦 Cargando inventario desde el almacenamiento local.');
    }
}

// ===== INDICADOR DE CONEXIÓN =====
function actualizarIndicadorConexion() {
    const indicador = document.getElementById('status-conexion');
    if (!indicador) return;

    if (navigator.onLine) {
        indicador.textContent = '🟢 Online';
        indicador.className = 'text-green-500 font-bold';
        procesarColaDeSincronizacion();
    } else {
        indicador.textContent = '🔴 Offline';
        indicador.className = 'text-red-500 font-bold';
    }
}

window.addEventListener('online', actualizarIndicadorConexion);
window.addEventListener('offline', actualizarIndicadorConexion);

// ===== MODO OSCURO =====
function inicializarModoOscuro() {
    const toggleBtn = document.getElementById('toggle-dark-mode');
    if (!toggleBtn) return;

    const modoOscuro = localStorage.getItem('dark-mode') === 'true';
    if (modoOscuro) {
        document.documentElement.classList.add('dark');
    }

    toggleBtn.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
        const estaActivo = document.documentElement.classList.contains('dark');
        localStorage.setItem('dark-mode', estaActivo);
    });
}

// ===== COLA DE SINCRONIZACIÓN (PARA COMPRAS OFFLINE) =====
function agregarAColaDeSincronizacion(compra) {
    const cola = JSON.parse(localStorage.getItem('cola-compras') || '[]');
    cola.push({
        ...compra,
        timestamp: new Date().toISOString(),
        sincronizado: false
    });
    localStorage.setItem('cola-compras', JSON.stringify(cola));
    console.log('💾 Compra guardada en cola de sincronización');
}

function procesarColaDeSincronizacion() {
    const cola = JSON.parse(localStorage.getItem('cola-compras') || '[]');
    const noSincronizados = cola.filter(c => !c.sincronizado);

    if (noSincronizados.length > 0 && navigator.onLine) {
        console.log(`📤 Sincronizando ${noSincronizados.length} compra(s) pendiente(s)...`);
        
        let compras = JSON.parse(localStorage.getItem('compras') || '[]');
        
        noSincronizados.forEach(compra => {
            compra.sincronizado = true;
            compras.push({
                id: compra.id || Date.now(),
                items: compra.items,
                total: compra.total,
                usuario: compra.usuario,
                fecha: compra.timestamp || new Date().toISOString(),
                estado: 'Pendiente'
            });
        });
        
        localStorage.setItem('compras', JSON.stringify(compras));
        localStorage.setItem('cola-compras', JSON.stringify(cola));
        
        if (typeof mostrarNotificacion === 'function') {
            mostrarNotificacion('✅ Se han sincronizado tus compras offline', 'success');
        }
    }
}

// ===== RENDERIZAR NAVBAR DINÁMICO =====
function actualizarNavbar() {
    const navLinks = document.getElementById('nav-links');
    const navLinksMobile = document.getElementById('nav-links-mobile');
    const navAuthButtons = document.getElementById('nav-auth-buttons');
    if (!navLinks || !navAuthButtons) return;

    const usuario = obtenerUsuarioActualLocal();
    const autenticado = usuario !== null;
    const esAdministrador = autenticado && usuario.rol === 'admin';

    let linksHTML = '';
    let authHTML = '';

    if (autenticado) {
        if (esAdministrador) {
            linksHTML = `
                <a href="index.html?view=admin" class="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 font-semibold transition px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-750">📊 Panel Admin</a>
            `;
        } else {
            linksHTML = `
                <a href="index.html?view=landing" class="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 font-semibold transition px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-750">🛍️ Inicio</a>
                <a href="index.html?view=catalogo" class="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 font-semibold transition px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-750">🛒 Catálogo</a>
                <a href="index.html?view=perfil" class="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 font-semibold transition px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-750">👤 Mi Perfil</a>
            `;
        }

        const avatarUrl = usuario.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';
        const profileDisplay = esAdministrador ? '' : `
            <a href="index.html?view=perfil" class="flex items-center gap-2 mr-2 group" title="Ver Perfil">
                <img src="${avatarUrl}" alt="Avatar" class="w-8 h-8 rounded-full border-2 border-blue-500 object-cover group-hover:scale-105 transition duration-200">
                <span class="hidden sm:inline text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition">${usuario.nombre}</span>
            </a>
        `;

        authHTML = `
            <div class="flex items-center gap-2">
                ${profileDisplay}
                <button id="btn-logout" class="px-4 py-2 bg-red-650 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition">
                    Cerrar Sesión
                </button>
            </div>
        `;
    } else {
        linksHTML = `
            <a href="index.html?view=landing" class="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 font-semibold transition px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-750">🛍️ Inicio</a>
        `;
        authHTML = `
            <a href="index.html?view=login" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition">
                Iniciar Sesión
            </a>
        `;
    }

    navLinks.innerHTML = linksHTML;
    if (navLinksMobile) {
        navLinksMobile.innerHTML = linksHTML;
        if (linksHTML) {
            navLinksMobile.classList.remove('hidden');
        } else {
            navLinksMobile.classList.add('hidden');
        }
    }
    navAuthButtons.innerHTML = authHTML;

    // Listener de logout
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            sessionStorage.removeItem('usuario-actual');
            // Si el usuario era activo, remover de la lista activa
            const usuarioObj = obtenerUsuarioActualLocal();
            if (usuarioObj) {
                let activos = JSON.parse(localStorage.getItem('usuarios-activos') || '[]');
                activos = activos.filter(email => email !== usuarioObj.email);
                localStorage.setItem('usuarios-activos', JSON.stringify(activos));
            }
            window.location.href = 'index.html?view=landing';
        });
    }
}

// ===== ENRUTADOR CENTRALIZADO =====
document.addEventListener('DOMContentLoaded', () => {
    inicializarProductos();
    actualizarIndicadorConexion();
    inicializarModoOscuro();

    const urlParams = new URLSearchParams(window.location.search);
    const vista = urlParams.get('view') || 'landing';

    actualizarNavbar();

    const usuario = obtenerUsuarioActualLocal();
    const autenticado = usuario !== null;
    const esAdministrador = autenticado && usuario.rol === 'admin';

    if (vista === 'landing') {
        if (typeof mostrarLandingPage === 'function') {
            mostrarLandingPage();
        } else {
            // Intentar re-renderizar después de que carguen otros scripts
            setTimeout(() => {
                if (typeof mostrarLandingPage === 'function') mostrarLandingPage();
            }, 100);
        }
    } else if (vista === 'login') {
        if (autenticado) {
            window.location.href = esAdministrador ? 'index.html?view=admin' : 'index.html?view=catalogo';
        } else {
            if (typeof mostrarFormularioLogin === 'function') {
                mostrarFormularioLogin();
            } else {
                setTimeout(() => {
                    if (typeof mostrarFormularioLogin === 'function') mostrarFormularioLogin();
                }, 100);
            }
        }
    } else if (vista === 'catalogo') {
        if (!autenticado) {
            window.location.href = 'index.html?view=login';
        } else if (esAdministrador) {
            window.location.href = 'index.html?view=admin';
        } else {
            if (typeof mostrarCatalogo === 'function') {
                mostrarCatalogo();
            } else {
                setTimeout(() => {
                    if (typeof mostrarCatalogo === 'function') mostrarCatalogo();
                }, 100);
            }
        }
    } else if (vista === 'admin') {
        if (!autenticado || !esAdministrador) {
            window.location.href = 'index.html?view=login';
        } else {
            if (typeof mostrarPanelAdmin === 'function') {
                mostrarPanelAdmin();
            } else {
                setTimeout(() => {
                    if (typeof mostrarPanelAdmin === 'function') mostrarPanelAdmin();
                }, 100);
            }
        }
    } else if (vista === 'perfil') {
        if (!autenticado || esAdministrador) {
            window.location.href = 'index.html?view=login';
        } else {
            if (typeof mostrarPerfil === 'function') {
                mostrarPerfil();
            } else {
                setTimeout(() => {
                    if (typeof mostrarPerfil === 'function') mostrarPerfil();
                }, 100);
            }
        }
    }
});
