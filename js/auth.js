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
        avatar: '',
        direccion: '',
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
        rol: usuario.rol,
        avatar: usuario.avatar || '',
        direccion: usuario.direccion || ''
    }));

    // Registrar usuario en activos
    let activos = JSON.parse(localStorage.getItem('usuarios-activos') || '[]');
    if (!activos.includes(usuario.email)) {
        activos.push(usuario.email);
        localStorage.setItem('usuarios-activos', JSON.stringify(activos));
    }

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
function mostrarFormularioLogin() {
    const container = document.getElementById('app-container');
    if (!container) return;

    container.innerHTML = `
        <div class="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full border border-gray-100 dark:border-gray-700">
                <h2 class="text-3xl font-extrabold text-center mb-8 text-gray-800 dark:text-white">Mi Tienda UCAB</h2>

                <!-- Formulario de Login -->
                <form id="form-login" class="space-y-4">
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email</label>
                        <input type="email" id="email-login" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Contraseña</label>
                        <input type="password" id="password-login" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                    </div>
                    <div class="text-right">
                        <button type="button" id="btn-olvido" class="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium">¿Olvidó su contraseña?</button>
                    </div>
                    <button type="submit" class="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg transition font-bold shadow-md shadow-green-500/10">
                        Iniciar Sesión
                    </button>
                    <div class="mt-6 text-center border-t border-gray-100 dark:border-gray-700 pt-4">
                        <p class="text-sm text-gray-650 dark:text-gray-400 mb-3">¿No tienes cuenta?</p>
                        <button type="button" id="go-to-register" class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition font-bold text-sm">
                            Crear Cuenta
                        </button>
                    </div>
                </form>

                <!-- Formulario de Registro (oculto por defecto) -->
                <form id="form-registro" class="space-y-4 hidden">
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Nombre</label>
                        <input type="text" id="nombre-registro" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email</label>
                        <input type="email" id="email-registro" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Contraseña</label>
                        <input type="password" id="password-registro" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                    </div>
                    <button type="submit" class="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg transition font-bold shadow-md shadow-green-500/10">
                        Crear Cuenta
                    </button>
                    <div class="mt-6 text-center border-t border-gray-100 dark:border-gray-700 pt-4">
                        <p class="text-sm text-gray-650 dark:text-gray-400 mb-3">¿Ya te registraste?</p>
                        <button type="button" id="go-to-login" class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition font-bold text-sm">
                            Iniciar Sesión
                        </button>
                    </div>
                </form>

                <!-- Formulario de Recuperación (oculto por defecto) -->
                <form id="form-recuperar" class="space-y-4 hidden">
                    <h3 class="text-lg font-bold text-gray-850 dark:text-white mb-1">Recuperar Contraseña</h3>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mb-4">Ingresa tu email registrado para simular la recuperación.</p>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email</label>
                        <input type="email" id="email-recuperar" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                    </div>
                    <div class="flex gap-2 pt-2">
                        <button type="submit" class="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition font-bold">
                            Recuperar
                        </button>
                        <button type="button" id="btn-cancelar-recuperar" class="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg transition font-bold">
                            Volver
                        </button>
                    </div>
                </form>

                <div id="mensaje-auth" class="mt-4 text-center text-sm font-medium"></div>
            </div>
        </div>
    `;

    // Event listeners
    const formLogin = document.getElementById('form-login');
    const formRegistro = document.getElementById('form-registro');
    const formRecuperar = document.getElementById('form-recuperar');
    const goToRegisterBtn = document.getElementById('go-to-register');
    const goToLoginBtn = document.getElementById('go-to-login');
    const btnOlvido = document.getElementById('btn-olvido');
    const btnCancelarRecuperar = document.getElementById('btn-cancelar-recuperar');
    const mensajeAuth = document.getElementById('mensaje-auth');

    goToRegisterBtn.addEventListener('click', () => {
        formLogin.classList.add('hidden');
        formRegistro.classList.remove('hidden');
        formRecuperar.classList.add('hidden');
        mensajeAuth.textContent = '';
    });

    goToLoginBtn.addEventListener('click', () => {
        formRegistro.classList.add('hidden');
        formLogin.classList.remove('hidden');
        formRecuperar.classList.add('hidden');
        mensajeAuth.textContent = '';
    });

    btnOlvido.addEventListener('click', () => {
        formLogin.classList.add('hidden');
        formRegistro.classList.add('hidden');
        formRecuperar.classList.remove('hidden');
        mensajeAuth.textContent = '';
    });

    btnCancelarRecuperar.addEventListener('click', () => {
        formRecuperar.classList.add('hidden');
        formLogin.classList.remove('hidden');
        formRegistro.classList.add('hidden');
        mensajeAuth.textContent = '';
    });

    formLogin.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email-login').value;
        const password = document.getElementById('password-login').value;
        const resultado = loginUsuario(email, password);
        
        mensajeAuth.textContent = resultado.mensaje;
        mensajeAuth.className = resultado.exito ? 'text-green-600 font-bold' : 'text-red-650 font-bold';

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

        mensajeAuth.textContent = resultado.mensaje;
        mensajeAuth.className = resultado.exito ? 'text-green-600 font-bold' : 'text-red-650 font-bold';

        if (resultado.exito) {
            setTimeout(() => {
                formRegistro.classList.add('hidden');
                formLogin.classList.remove('hidden');
                mensajeAuth.textContent = '✅ Cuenta creada. Inicia sesión ahora.';
            }, 1500);
        }
    });

    formRecuperar.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email-recuperar').value;
        const usuarios = obtenerUsuarios();
        const usuario = usuarios.find(u => u.email === email);

        if (usuario) {
            mensajeAuth.innerHTML = `<span class="text-green-600 font-bold">🔑 Su contraseña es: </span><code class="px-2 py-1 bg-gray-100 dark:bg-gray-700 dark:text-yellow-450 rounded text-red-600 font-mono font-bold">${usuario.password}</code>`;
        } else {
            mensajeAuth.textContent = '❌ Email no registrado';
            mensajeAuth.className = 'text-red-650 font-bold';
        }
    });

    // Crear usuario admin por defecto si no existe
    if (obtenerUsuarios().length === 0) {
        registrarUsuario('admin@ucab.edu.ve', 'admin123', 'Administrador', 'admin');
        console.log('👤 Usuario admin creado por defecto: admin@ucab.edu.ve / admin123');
    }
}

// ===== GESTIÓN DE PERFIL =====
function mostrarPerfil() {
    if (!estaAutenticado() || esAdmin()) {
        window.location.href = 'index.html?view=login';
        return;
    }

    const container = document.getElementById('app-container');
    if (!container) return;

    const usuario = obtenerUsuarioActual();

    container.innerHTML = `
        <div class="max-w-2xl mx-auto px-4 py-12">
            <h2 class="text-3xl font-extrabold text-gray-800 dark:text-white mb-6">👤 Mi Perfil de Usuario</h2>
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-150 dark:border-gray-750">
                <form id="form-perfil" class="space-y-6">
                    <div class="flex flex-col items-center mb-6">
                        <img id="perfil-avatar-preview" src="${usuario.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}" alt="Avatar Preview" class="w-28 h-28 rounded-full border-4 border-blue-500 object-cover mb-3 shadow-md">
                        <span class="text-xs text-gray-500 dark:text-gray-400">Vista previa del Avatar</span>
                    </div>

                    <div>
                        <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Nombre Completo</label>
                        <input type="text" id="perfil-nombre" value="${usuario.nombre || ''}" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                    </div>

                    <div>
                        <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">URL del Avatar (Imagen)</label>
                        <input type="url" id="perfil-avatar" value="${usuario.avatar || ''}" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" placeholder="https://example.com/mi-avatar.jpg">
                    </div>

                    <div>
                        <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Dirección de Envío</label>
                        <textarea id="perfil-direccion" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white h-24 placeholder-gray-450" placeholder="Calle, Avenida, Edificio, Apartamento, Ciudad...">${usuario.direccion || ''}</textarea>
                    </div>

                    <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-blue-500/20">
                        Guardar Cambios
                    </button>
                </form>
            </div>
        </div>
    `;

    // Vista previa de avatar en tiempo real
    const avatarInput = document.getElementById('perfil-avatar');
    const avatarPreview = document.getElementById('perfil-avatar-preview');
    avatarInput.addEventListener('input', () => {
        if (avatarInput.value) {
            avatarPreview.src = avatarInput.value;
        } else {
            avatarPreview.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';
        }
    });

    const formPerfil = document.getElementById('form-perfil');
    formPerfil.addEventListener('submit', (e) => {
        e.preventDefault();

        const nombre = document.getElementById('perfil-nombre').value;
        const avatar = document.getElementById('perfil-avatar').value;
        const direccion = document.getElementById('perfil-direccion').value;

        // Actualizar en localStorage (usuarios)
        const usuarios = obtenerUsuarios();
        const idx = usuarios.findIndex(u => u.email === usuario.email);
        if (idx !== -1) {
            usuarios[idx].nombre = nombre;
            usuarios[idx].avatar = avatar;
            usuarios[idx].direccion = direccion;
            guardarUsuarios(usuarios);
        }

        // Actualizar en sessionStorage (usuario-actual)
        const usuarioActualizado = {
            ...usuario,
            nombre,
            avatar,
            direccion
        };
        sessionStorage.setItem('usuario-actual', JSON.stringify(usuarioActualizado));

        // Actualizar la navbar
        if (typeof actualizarNavbar === 'function') {
            actualizarNavbar();
        }

        if (typeof mostrarNotificacion === 'function') {
            mostrarNotificacion('✅ Perfil guardado correctamente', 'success');
        }
    });
}
