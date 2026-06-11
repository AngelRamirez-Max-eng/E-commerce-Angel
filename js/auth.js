// js/auth.js - Authentication and role management

// ===== SIMULACIÓN DE USUARIOS (ALMACENADOS LOCALMENTE) =====
function obtenerUsuarios() {
    return JSON.parse(localStorage.getItem('usuarios') || '[]');
}

function guardarUsuarios(usuarios) {
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
}

// ===== REGISTRO DE NUEVO USUARIO =====
function registrarUsuario(email, password, nombre, rol = 'cliente') {
    const usuarios = obtenerUsuarios();
    
    if (usuarios.some(u => u.email === email)) {
        return { exito: false, mensaje: '❌ El email ya está registrado' };
    }

    const nuevoUsuario = {
        id: Date.now(),
        email,
        password, // En producción, esto estaría hasheado
        nombre,
        rol,
        fechaRegistro: new Date().toISOString()
    };

    usuarios.push(nuevoUsuario);
    guardarUsuarios(usuarios);

    return { exito: true, mensaje: '✅ Registro exitoso', usuario: nuevoUsuario };
}

// ===== LOGIN =====
function loginUsuario(email, password) {
    const usuarios = obtenerUsuarios();
    const usuario = usuarios.find(u => u.email === email && u.password === password);

    if (!usuario) {
        return { exito: false, mensaje: '❌ Email o contraseña incorrectos' };
    }

    // Guardar sesión
    sessionStorage.setItem('usuario-actual', JSON.stringify({
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rol
    }));

    return { exito: true, mensaje: '✅ Bienvenido', usuario };
}

// ===== OBTENER USUARIO ACTUAL =====
function obtenerUsuarioActual() {
    const usuario = sessionStorage.getItem('usuario-actual');
    return usuario ? JSON.parse(usuario) : null;
}

// ===== VERIFICAR SI ESTÁ AUTENTICADO =====
function estaAutenticado() {
    return obtenerUsuarioActual() !== null;
}

// ===== VERIFICAR ROL =====
function esAdmin() {
    const usuario = obtenerUsuarioActual();
    return usuario && usuario.rol === 'admin';
}

// ===== LOGOUT =====
function logout() {
    sessionStorage.removeItem('usuario-actual');
}

// ===== FORMULARIO DE LOGIN/REGISTRO =====
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const vista = urlParams.get('view') || 'login';

    if (vista === 'login' || !estaAutenticado()) {
        mostrarFormularioLogin();
    }
});

function mostrarFormularioLogin() {
    const container = document.getElementById('app-container');
    if (!container) return;

    container.innerHTML = `
        <div class="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full">
                <h2 class="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-white">Mi Tienda UCAB</h2>
                
                <div class="mb-6">
                    <button id="toggle-form" class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
                        Crear Cuenta
                    </button>
                </div>

                <!-- Formulario de Login -->
                <form id="form-login" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                        <input type="email" id="email-login" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contraseña</label>
                        <input type="password" id="password-login" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                    </div>
                    <button type="submit" class="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-semibold">
                        Iniciar Sesión
                    </button>
                </form>

                <!-- Formulario de Registro (oculto por defecto) -->
                <form id="form-registro" class="space-y-4 hidden">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nombre</label>
                        <input type="text" id="nombre-registro" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                        <input type="email" id="email-registro" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contraseña</label>
                        <input type="password" id="password-registro" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                    </div>
                    <button type="submit" class="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-semibold">
                        Crear Cuenta
                    </button>
                </form>

                <div id="mensaje-auth" class="mt-4 text-center text-sm font-medium"></div>
            </div>
        </div>
    `;

    // Event listeners
    const toggleBtn = document.getElementById('toggle-form');
    const formLogin = document.getElementById('form-login');
    const formRegistro = document.getElementById('form-registro');

    toggleBtn.addEventListener('click', () => {
        formLogin.classList.toggle('hidden');
        formRegistro.classList.toggle('hidden');
        toggleBtn.textContent = formLogin.classList.contains('hidden') ? 'Iniciar Sesión' : 'Crear Cuenta';
    });

    formLogin.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email-login').value;
        const password = document.getElementById('password-login').value;
        const resultado = loginUsuario(email, password);
        
        const mensaje = document.getElementById('mensaje-auth');
        mensaje.textContent = resultado.mensaje;
        mensaje.className = resultado.exito ? 'text-green-600 font-bold' : 'text-red-600 font-bold';

        if (resultado.exito) {
            setTimeout(() => {
                window.location.href = resultado.usuario.rol === 'admin' ? 'index.html?view=admin' : 'index.html?view=catalogo';
            }, 1000);
        }
    });

    formRegistro.addEventListener('submit', (e) => {
        e.preventDefault();
        const nombre = document.getElementById('nombre-registro').value;
        const email = document.getElementById('email-registro').value;
        const password = document.getElementById('password-registro').value;
        const resultado = registrarUsuario(email, password, nombre, 'cliente');

        const mensaje = document.getElementById('mensaje-auth');
        mensaje.textContent = resultado.mensaje;
        mensaje.className = resultado.exito ? 'text-green-600 font-bold' : 'text-red-600 font-bold';

        if (resultado.exito) {
            setTimeout(() => {
                window.location.href = 'index.html?view=login';
            }, 1500);
        }
    });

    // Crear usuario admin por defecto si no existe
    if (obtenerUsuarios().length === 0) {
        registrarUsuario('admin@ucab.edu.ve', 'admin123', 'Administrador', 'admin');
        console.log('👤 Usuario admin creado por defecto: admin@ucab.edu.ve / admin123');
    }
}
