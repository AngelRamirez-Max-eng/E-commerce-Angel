// js/app.js - Core application initialization and storage management

const API_URL = 'https://fakestoreapi.com/products';

// ===== INICIALIZACIÓN DE PRODUCTOS =====
async function inicializarProductos() {
    if (!localStorage.getItem('productos')) {
        console.log('Poblando el catálogo por primera vez desde la API...');
        try {
            const respuesta = await fetch(API_URL);
            const productosAPI = await respuesta.json();
            
            localStorage.setItem('productos', JSON.stringify(productosAPI));
            console.log('✅ Productos almacenados localmente con éxito.');
        } catch (error) {
            console.error('❌ Error al conectar con la API:', error);
            // Si no hay conexión, creamos un catálogo vacío
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
        // Aquí iría la lógica para enviar las compras al servidor
        // Por ahora, simplemente las marcamos como sincronizadas
        noSincronizados.forEach(compra => {
            compra.sincronizado = true;
        });
        localStorage.setItem('cola-compras', JSON.stringify(cola));
    }
}

// ===== INICIALIZACIÓN GENERAL =====
document.addEventListener('DOMContentLoaded', () => {
    inicializarProductos();
    actualizarIndicadorConexion();
    inicializarModoOscuro();
    
    // Lógica de logout
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            sessionStorage.clear();
            window.location.href = 'index.html?view=login';
        });
    }
});
