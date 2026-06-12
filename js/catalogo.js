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
// ===== OBTENER RATINGS DE PRODUCTOS (INCLUYENDO REVISIONES LOCALES) =====
function obtenerRatingProducto(productoId) {
    const productos = JSON.parse(localStorage.getItem('productos') || '[]');
    const producto = productos.find(p => p.id === productoId);
    const reviews = JSON.parse(localStorage.getItem(`reviews-${productoId}`) || '[]');
    
    const baseRate = producto?.rating?.rate || 4.0;
    const baseCount = producto?.rating?.count || 1;

    if (reviews.length === 0) {
        return { rate: parseFloat(baseRate).toFixed(1), count: baseCount };
    }

    const totalStars = reviews.reduce((sum, r) => sum + r.stars, 0);
    // Simple weighted average to combine API base ratings and custom user reviews
    const combinedRate = ((baseRate * baseCount) + totalStars) / (baseCount + reviews.length);
    return { rate: parseFloat(combinedRate).toFixed(1), count: baseCount + reviews.length };
}

// ===== MOSTRAR DETALLES Y OPINIONES MODAL =====
function mostrarModalDetalles(productoId) {
    const productos = JSON.parse(localStorage.getItem('productos') || '[]');
    const producto = productos.find(p => p.id === productoId);
    if (!producto) return;

    const ratingInfo = obtenerRatingProducto(productoId);
    const reviews = JSON.parse(localStorage.getItem(`reviews-${productoId}`) || '[]');
    const usuarioActual = obtenerUsuarioActual();

    let modal = document.getElementById('modal-detalles-producto');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-detalles-producto';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 relative">
            <button id="btn-cerrar-detalles" class="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-white text-2xl font-bold transition">&times;</button>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <img src="${producto.image}" alt="${producto.title}" class="w-full h-64 object-cover rounded-xl shadow">
                <div class="flex flex-col justify-between">
                    <div>
                        <span class="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full dark:bg-blue-900 dark:text-blue-200 mb-2">${producto.category}</span>
                        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">${producto.title}</h3>
                        <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-4">${producto.description}</p>
                    </div>
                    <div class="mt-4">
                        <div class="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mb-2">$${producto.price}</div>
                        <div class="flex items-center gap-1">
                            <span class="text-yellow-500">★</span>
                            <span class="font-bold text-gray-800 dark:text-white ml-1">${ratingInfo.rate}</span>
                            <span class="text-xs text-gray-500 dark:text-gray-400">(${ratingInfo.count} opiniones)</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Reseñas -->
            <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h4 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Opiniones de Clientes</h4>
                
                <div class="space-y-4 max-h-48 overflow-y-auto mb-6 pr-2">
                    ${reviews.length === 0 ? `
                        <p class="text-gray-500 dark:text-gray-400 text-sm italic">Nadie ha calificado este producto aún. ¡Sé el primero!</p>
                    ` : reviews.map(rev => `
                        <div class="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 border border-gray-100 dark:border-gray-700">
                            <div class="flex justify-between items-center mb-1">
                                <span class="text-sm font-semibold text-gray-850 dark:text-white">${rev.usuario}</span>
                                <span class="text-xs text-gray-550 dark:text-gray-400">${new Date(rev.fecha).toLocaleDateString()}</span>
                            </div>
                            <div class="text-yellow-550 text-xs mb-1">${'★'.repeat(rev.stars)}</div>
                            <p class="text-sm text-gray-700 dark:text-gray-300">${rev.comentario}</p>
                        </div>
                    `).join('')}
                </div>

                <!-- Formulario de Reseña -->
                <form id="form-opinion" class="bg-gray-50 dark:bg-gray-750 rounded-xl p-4 border border-gray-250 dark:border-gray-700 space-y-4">
                    <h5 class="text-sm font-bold text-gray-800 dark:text-white">Deja tu opinión</h5>
                    <div class="flex items-center gap-2">
                        <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Calificación:</label>
                        <div class="flex gap-1" id="stars-selector">
                            <button type="button" class="star-btn text-2xl text-gray-300 dark:text-gray-600 hover:text-yellow-500" data-val="1">★</button>
                            <button type="button" class="star-btn text-2xl text-gray-300 dark:text-gray-600 hover:text-yellow-500" data-val="2">★</button>
                            <button type="button" class="star-btn text-2xl text-gray-300 dark:text-gray-600 hover:text-yellow-500" data-val="3">★</button>
                            <button type="button" class="star-btn text-2xl text-gray-300 dark:text-gray-600 hover:text-yellow-500" data-val="4">★</button>
                            <button type="button" class="star-btn text-2xl text-gray-300 dark:text-gray-600 hover:text-yellow-500" data-val="5">★</button>
                        </div>
                        <input type="hidden" id="opinion-stars-val" value="5" required>
                    </div>
                    <div>
                        <textarea id="opinion-comentario" required placeholder="Escribe tu comentario aquí..." class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white h-20 text-sm"></textarea>
                    </div>
                    <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg text-sm transition">
                        Enviar Comentario
                    </button>
                </form>
            </div>
        </div>
    `;

    modal.classList.remove('hidden');

    const starBtns = modal.querySelectorAll('.star-btn');
    const starsVal = modal.querySelector('#opinion-stars-val');
    
    function setStars(val) {
        starsVal.value = val;
        starBtns.forEach((btn, index) => {
            if (index < val) {
                btn.classList.add('text-yellow-500');
                btn.classList.remove('text-gray-300', 'dark:text-gray-600');
            } else {
                btn.classList.remove('text-yellow-500');
                btn.classList.add('text-gray-300', 'dark:text-gray-600');
            }
        });
    }
    setStars(5);

    starBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            setStars(parseInt(btn.dataset.val));
        });
    });

    modal.querySelector('#btn-cerrar-detalles').addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });

    modal.querySelector('#form-opinion').addEventListener('submit', (e) => {
        e.preventDefault();
        const stars = parseInt(starsVal.value);
        const comentario = modal.querySelector('#opinion-comentario').value.trim();

        const newReview = {
            id: Date.now(),
            usuario: usuarioActual ? usuarioActual.nombre : 'Anónimo',
            stars,
            comentario,
            fecha: new Date().toISOString()
        };

        const currentReviews = JSON.parse(localStorage.getItem(`reviews-${productoId}`) || '[]');
        currentReviews.push(newReview);
        localStorage.setItem(`reviews-${productoId}`, JSON.stringify(currentReviews));

        mostrarNotificacion('✅ ¡Gracias por tu reseña!', 'success');
        
        mostrarModalDetalles(productoId);
        
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('view') === 'catalogo') {
            mostrarCatalogo();
        }
    });
}

// ===== MOSTRAR LANDING PAGE =====
function mostrarLandingPage() {
    const container = document.getElementById('app-container');
    if (!container) return;

    const productos = JSON.parse(localStorage.getItem('productos') || '[]');
    const destacados = [...productos]
        .sort((a, b) => {
            const rA = parseFloat(obtenerRatingProducto(a.id).rate);
            const rB = parseFloat(obtenerRatingProducto(b.id).rate);
            return rB - rA;
        })
        .slice(0, 4);

    container.innerHTML = `
        <!-- Hero Banner Section -->
        <section class="relative bg-gradient-to-r from-blue-700 to-indigo-900 text-white py-24 px-4 overflow-hidden">
            <div class="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center"></div>
            <div class="max-w-7xl mx-auto relative z-10 text-center flex flex-col items-center">
                <span class="px-4 py-1.5 bg-blue-500/30 text-blue-300 text-xs font-bold uppercase tracking-widest rounded-full mb-4">Experiencia Premium</span>
                <h1 class="text-5xl md:text-6xl font-extrabold mb-6 max-w-3xl leading-tight">
                    Encuentra la Mejor Tecnología y Moda en <span class="bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">Mi Tienda UCAB</span>
                </h1>
                <p class="text-lg md:text-xl text-blue-100 max-w-2xl mb-8 font-light">
                    Explora productos exclusivos importados y nacionales con soporte completo, pagos protegidos y entregas rápidas directas a tu hogar.
                </p>
                <button id="btn-hero-cta" class="px-8 py-4 bg-white hover:bg-gray-100 text-blue-800 font-bold text-lg rounded-xl transition duration-300 shadow-xl shadow-indigo-950/20 transform hover:-translate-y-0.5">
                    🚀 Ver Catálogo de Productos
                </button>
            </div>
        </section>

        <!-- Beneficios Section -->
        <section class="py-16 bg-gray-50 dark:bg-gray-900/50">
            <div class="max-w-7xl mx-auto px-4">
                <div class="text-center mb-12">
                    <h2 class="text-3xl font-extrabold text-gray-800 dark:text-white">¿Por qué elegirnos?</h2>
                    <p class="text-gray-500 dark:text-gray-400 mt-2">Nuestros pilares fundamentales garantizan una compra perfecta</p>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center border border-gray-100 dark:border-gray-700 shadow-sm">
                        <div class="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-2xl rounded-xl mb-4">⚡</div>
                        <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-2">Envío Rápido</h3>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Entregamos tus pedidos en tiempo récord directamente a tu puerta.</p>
                    </div>
                    <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center border border-gray-100 dark:border-gray-700 shadow-sm">
                        <div class="inline-flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 text-2xl rounded-xl mb-4">🛡️</div>
                        <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-2">Pago Seguro</h3>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Tus transacciones están encriptadas y protegidas al 100%.</p>
                    </div>
                    <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center border border-gray-100 dark:border-gray-700 shadow-sm">
                        <div class="inline-flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 text-2xl rounded-xl mb-4">⭐</div>
                        <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-2">Calidad Garantizada</h3>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Solo ofrecemos productos originales con garantía de fábrica.</p>
                    </div>
                    <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center border border-gray-100 dark:border-gray-700 shadow-sm">
                        <div class="inline-flex items-center justify-center w-12 h-12 bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 text-2xl rounded-xl mb-4">📱</div>
                        <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-2">Modo Offline</h3>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Navega y realiza compras incluso si pierdes tu conexión a internet.</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Destacados Section -->
        <section class="py-16 bg-white dark:bg-gray-900">
            <div class="max-w-7xl mx-auto px-4">
                <div class="flex flex-col md:flex-row justify-between items-center mb-10">
                    <div>
                        <h2 class="text-3xl font-extrabold text-gray-800 dark:text-white">Productos Destacados</h2>
                        <p class="text-gray-500 dark:text-gray-400 mt-1">Los productos mejor valorados por nuestros clientes</p>
                    </div>
                    <button id="btn-destacados-mas" class="mt-4 md:mt-0 text-blue-600 hover:text-blue-700 dark:text-blue-400 font-semibold flex items-center gap-1 transition">
                        Ver todo el catálogo →
                    </button>
                </div>
                
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    ${destacados.length === 0 ? `
                        <p class="col-span-full text-center text-gray-500 italic py-8">Cargando destacados...</p>
                    ` : destacados.map(prod => {
                        const r = obtenerRatingProducto(prod.id);
                        return `
                            <div class="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition duration-300 flex flex-col justify-between">
                                <img src="${prod.image}" alt="${prod.title}" class="w-full h-48 object-cover">
                                <div class="p-5 flex-1 flex flex-col justify-between">
                                    <div>
                                        <div class="text-xs text-blue-500 font-semibold uppercase tracking-wider mb-1">${prod.category}</div>
                                        <h3 class="font-bold text-gray-850 dark:text-white text-base mb-2 line-clamp-2">${prod.title}</h3>
                                        <div class="flex items-center gap-1 mb-4">
                                            <span class="text-yellow-500">★</span>
                                            <span class="text-sm font-bold text-gray-800 dark:text-white">${r.rate}</span>
                                            <span class="text-xs text-gray-500 dark:text-gray-400">(${r.count} opiniones)</span>
                                        </div>
                                    </div>
                                    <div class="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-700">
                                        <span class="text-xl font-black text-blue-600 dark:text-blue-400">$${prod.price}</span>
                                        <button class="btn-destacado-ver px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg text-xs font-bold transition" data-id="${prod.id}">
                                            Detalles
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        </section>

        <!-- Testimonios Section -->
        <section class="py-16 bg-gray-50 dark:bg-gray-900/50">
            <div class="max-w-7xl mx-auto px-4">
                <div class="text-center mb-12">
                    <h2 class="text-3xl font-extrabold text-gray-800 dark:text-white">Lo que dicen nuestros clientes</h2>
                    <p class="text-gray-500 dark:text-gray-400 mt-2">La satisfacción de nuestros usuarios es lo primero</p>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-150 dark:border-gray-700 shadow-sm relative">
                        <div class="text-yellow-500 text-lg mb-3">★★★★★</div>
                        <p class="text-gray-600 dark:text-gray-300 text-sm italic mb-4">"Excelente tienda. Compré un reloj y llegó en menos de 24 horas a Caracas. El soporte técnico me atendió rápido. Muy recomendada."</p>
                        <div class="flex items-center gap-3">
                            <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80" alt="Cliente" class="w-10 h-10 rounded-full object-cover">
                            <div>
                                <h4 class="text-sm font-bold text-gray-800 dark:text-white">María González</h4>
                                <span class="text-xs text-gray-550">Cliente Verificado</span>
                            </div>
                        </div>
                    </div>
                    <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-155 dark:border-gray-700 shadow-sm relative">
                        <div class="text-yellow-500 text-lg mb-3">★★★★★</div>
                        <p class="text-gray-600 dark:text-gray-300 text-sm italic mb-4">"Lo mejor es la capacidad offline. Estaba en el metro sin señal, armé mi carrito y realicé la compra. Al salir y recuperar internet, todo se sincronizó."</p>
                        <div class="flex items-center gap-3">
                            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80" alt="Cliente" class="w-10 h-10 rounded-full object-cover">
                            <div>
                                <h4 class="text-sm font-bold text-gray-800 dark:text-white">Alejandro Silva</h4>
                                <span class="text-xs text-gray-550">Cliente Verificado</span>
                            </div>
                        </div>
                    </div>
                    <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-155 dark:border-gray-700 shadow-sm relative">
                        <div class="text-yellow-500 text-lg mb-3">★★★★☆</div>
                        <p class="text-gray-600 dark:text-gray-300 text-sm italic mb-4">"El catálogo tiene gran variedad y los filtros de precio funcionan excelente en tiempo real. Agregué reseñas a los productos que ya compré."</p>
                        <div class="flex items-center gap-3">
                            <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=80&q=80" alt="Cliente" class="w-10 h-10 rounded-full object-cover">
                            <div>
                                <h4 class="text-sm font-bold text-gray-800 dark:text-white">Gabriela Rivas</h4>
                                <span class="text-xs text-gray-550">Cliente Verificado</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Newsletter Section -->
        <section class="py-16 bg-gradient-to-br from-indigo-900 to-blue-900 text-white">
            <div class="max-w-4xl mx-auto px-4 text-center">
                <h2 class="text-3xl font-extrabold mb-3">Recibe nuestras ofertas exclusivas</h2>
                <p class="text-indigo-200 mb-8 max-w-lg mx-auto font-light text-sm">Suscríbete a nuestro boletín y obtén un 10% de descuento en tu primera compra.</p>
                <form id="form-newsletter" class="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                    <input type="email" id="email-newsletter" required placeholder="Tu correo electrónico" class="px-4 py-3 rounded-xl text-gray-950 text-sm font-medium w-full sm:w-72 focus:outline-none focus:ring-2 focus:ring-blue-400">
                    <button type="submit" class="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm rounded-xl transition duration-300 shadow-md">
                        Suscribirme
                    </button>
                </form>
            </div>
        </section>

        <!-- Footer -->
        <footer class="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
            <div class="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 text-center md:text-left">
                <div>
                    <h3 class="text-lg font-bold text-white mb-4">Mi Tienda UCAB</h3>
                    <p class="text-sm text-gray-500">El e-commerce oficial simulado para la materia de Programación Orientada a la Web.</p>
                </div>
                <div>
                    <h3 class="text-lg font-bold text-white mb-4">Políticas y Enlaces</h3>
                    <ul class="space-y-2 text-sm">
                        <li><a href="#" class="hover:text-white transition">Términos de Servicio</a></li>
                        <li><a href="#" class="hover:text-white transition">Políticas de Privacidad</a></li>
                        <li><a href="#" class="hover:text-white transition">Políticas de Envío y Devoluciones</a></li>
                    </ul>
                </div>
                <div>
                    <h3 class="text-lg font-bold text-white mb-4">Redes Sociales</h3>
                    <div class="flex justify-center md:justify-start gap-4">
                        <a href="#" class="hover:text-white transition" title="Facebook">📘 Facebook</a>
                        <a href="#" class="hover:text-white transition" title="Instagram">📸 Instagram</a>
                        <a href="#" class="hover:text-white transition" title="Twitter/X">🐦 Twitter</a>
                    </div>
                </div>
            </div>
            <div class="max-w-7xl mx-auto px-4 border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
                <div>&copy; 2026 Mi Tienda UCAB. Todos los derechos reservados.</div>
                <div>Desarrollado con HTML, CSS, Tailwind y Vanilla JS.</div>
            </div>
        </footer>
    `;

    document.getElementById('btn-hero-cta')?.addEventListener('click', () => {
        window.location.href = 'index.html?view=catalogo';
    });

    document.getElementById('btn-destacados-mas')?.addEventListener('click', () => {
        window.location.href = 'index.html?view=catalogo';
    });

    document.querySelectorAll('.btn-destacado-ver').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            mostrarModalDetalles(id);
        });
    });

    document.getElementById('form-newsletter')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email-newsletter').value;
        mostrarNotificacion(`✅ ¡Suscrito con éxito! Se envió un cupón de 10% a: ${email}`, 'success');
        document.getElementById('form-newsletter').reset();
    });
}

// ===== MOSTRAR CATÁLOGO =====
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
                <h2 class="text-4xl font-extrabold text-gray-800 dark:text-white mb-2">Bienvenido, ${usuario.nombre}</h2>
                <p class="text-gray-600 dark:text-gray-400">Descubre nuestros productos de alta calidad</p>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <aside class="lg:col-span-1">
                    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 sticky top-20 border border-gray-150 dark:border-gray-700">
                        <h3 class="text-xl font-bold mb-6 text-gray-800 dark:text-white">Filtros</h3>

                        <div class="mb-6">
                            <label class="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Buscar</label>
                            <input type="text" id="search-input" placeholder="Buscar productos..." 
                                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                        </div>

                        <div class="mb-6">
                            <label class="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Categoría</label>
                            <select id="category-filter" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                                <option value="todos">Todas</option>
                                ${categorias.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                            </select>
                        </div>

                        <div>
                            <label class="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Precio Máximo: $<span id="price-display">500</span></label>
                            <input type="range" id="price-filter" min="0" max="1000" value="500" 
                                class="w-full accent-blue-600">
                        </div>

                        <div class="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <button id="btn-carrito" class="w-full bg-blue-650 hover:bg-blue-700 text-white py-3 rounded-xl transition font-bold shadow-lg shadow-blue-500/10">
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
        grid.innerHTML = '<p class="col-span-full text-center text-gray-500 py-8 italic">No se encontraron productos</p>';
        return;
    }

    grid.innerHTML = productos.map(producto => {
        const r = obtenerRatingProducto(producto.id);
        return `
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl border border-gray-150 dark:border-gray-700 overflow-hidden flex flex-col justify-between transition duration-300">
                <img src="${producto.image}" alt="${producto.title}" class="w-full h-48 object-cover">
                <div class="p-5 flex-1 flex flex-col justify-between">
                    <div>
                        <h3 class="font-bold text-gray-850 dark:text-white mb-2 line-clamp-2 text-base">${producto.title}</h3>
                        <p class="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">${producto.description}</p>
                        <div class="flex items-center gap-1 mb-4">
                            <span class="text-yellow-500">★</span>
                            <span class="text-sm font-bold text-gray-800 dark:text-white">${r.rate}</span>
                            <span class="text-xs text-gray-500 dark:text-gray-400">(${r.count} opiniones)</span>
                        </div>
                    </div>
                    <div class="flex flex-col gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                        <div class="flex justify-between items-center">
                            <span class="text-2xl font-black text-blue-600 dark:text-blue-400">$${producto.price}</span>
                            <button class="btn-add-carrito bg-green-600 text-white p-2.5 rounded-xl hover:bg-green-700 transition" 
                                data-id="${producto.id}" data-title="${producto.title}" data-price="${producto.price}" data-image="${producto.image}">
                                ➕ Añadir
                            </button>
                        </div>
                        <button class="btn-ver-detalles w-full text-center py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition" data-id="${producto.id}">
                            Ver Detalles y Opiniones
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

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

    document.querySelectorAll('.btn-ver-detalles').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            mostrarModalDetalles(id);
        });
    });
}

function actualizarContadorCarrito() {
    const carrito = obtenerCarrito();
    const contador = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    const contadorEl = document.getElementById('cart-count');
    if (contadorEl) {
        contadorEl.textContent = contador;
    }
}

// ===== MOSTRAR CARRITO DE COMPRAS =====
function mostrarCarrito() {
    const carrito = obtenerCarrito();
    const container = document.getElementById('app-container');
    if (!container) return;

    const total = calcularTotalCarrito();

    container.innerHTML = `
        <div class="max-w-4xl mx-auto px-4 py-8">
            <button id="volver-catalogo" class="mb-6 px-4 py-2 bg-gray-650 hover:bg-gray-700 text-white rounded-lg transition text-sm">
                ← Volver al Catálogo
            </button>

            <h2 class="text-4xl font-extrabold mb-8 text-gray-800 dark:text-white">🛒 Tu Carrito</h2>

            ${carrito.length === 0 ? `
                <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-8 text-center border border-gray-150 dark:border-gray-700">
                    <p class="text-gray-650 dark:text-gray-400 text-lg mb-4">Tu carrito está vacío</p>
                    <button id="seguir-comprando" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg transition font-bold">
                        Continuar Comprando
                    </button>
                </div>
            ` : `
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div class="lg:col-span-2 space-y-4">
                        ${carrito.map(item => `
                            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-150 dark:border-gray-700 p-4 flex gap-4 items-center">
                                <img src="${item.image}" alt="${item.title}" class="w-20 h-20 object-cover rounded-lg">
                                <div class="flex-1">
                                    <h3 class="font-bold text-gray-800 dark:text-white text-sm sm:text-base">${item.title}</h3>
                                    <p class="text-blue-600 dark:text-blue-400 text-base font-extrabold mt-1">$${item.price}</p>
                                </div>
                                <div class="flex flex-col sm:flex-row items-center gap-2">
                                    <div class="flex items-center gap-2 border border-gray-200 dark:border-gray-650 rounded-lg p-1">
                                        <button class="btn-disminuir bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded" data-id="${item.id}">−</button>
                                        <span class="font-bold text-gray-800 dark:text-white px-1">${item.cantidad}</span>
                                        <button class="btn-aumentar bg-green-100 hover:bg-green-200 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded" data-id="${item.id}">+</button>
                                    </div>
                                    <button class="btn-clonar bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 px-3 py-1.5 rounded-lg text-xs font-bold transition" data-id="${item.id}" title="Duplicar cantidad">
                                        👥 Clonar
                                    </button>
                                    <button class="btn-eliminar text-red-600 hover:text-red-800 text-xs font-semibold px-2 py-1 transition" data-id="${item.id}">Eliminar</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    <div class="bg-blue-600 dark:bg-blue-800 text-white rounded-2xl shadow-md p-6 h-fit sticky top-20">
                        <h3 class="text-2xl font-bold mb-4">Resumen</h3>
                        <div class="space-y-2 mb-6 pb-6 border-b border-blue-400/50">
                            <div class="flex justify-between text-sm text-blue-100">
                                <span>Subtotal:</span>
                                <span>$${total}</span>
                            </div>
                            <div class="flex justify-between text-sm text-blue-100">
                                <span>Envío:</span>
                                <span>Gratis</span>
                            </div>
                        </div>
                        <div class="flex justify-between text-2xl font-black mb-6">
                            <span>Total:</span>
                            <span>$${total}</span>
                        </div>
                        <button id="btn-checkout" class="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl transition font-extrabold text-lg shadow-lg shadow-green-950/20">
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

    document.querySelectorAll('.btn-clonar').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            const item = carrito.find(i => i.id === id);
            if (item) {
                actualizarCantidadCarrito(id, item.cantidad * 2);
                mostrarNotificacion('✅ Cantidad clonada (duplicada)', 'success');
                mostrarCarrito();
            }
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

// ===== MOSTRAR CHECKOUT =====
function mostrarCheckout() {
    const usuario = obtenerUsuarioActual();

    if (!navigator.onLine) {
        const carrito = obtenerCarrito();
        if (carrito.length > 0) {
            const compra = {
                items: carrito,
                total: calcularTotalCarrito(),
                usuario: usuario.email
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
            <h2 class="text-3xl font-extrabold mb-8 text-gray-800 dark:text-white">✅ Pasarela de Pago</h2>

            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-150 dark:border-gray-700 p-6 mb-6">
                <h3 class="text-xl font-bold mb-4 text-gray-800 dark:text-white">Información de Envío</h3>
                <form id="form-checkout" class="space-y-4">
                    <input type="text" placeholder="Nombre Completo" required value="${usuario.nombre || ''}" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm">
                    <input type="email" placeholder="Email" required value="${usuario.email || ''}" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm">
                    <input id="checkout-address" type="text" placeholder="Dirección de Envío" required value="${usuario.direccion || ''}" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm">
                    <input type="text" placeholder="Teléfono" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm">
                    
                    <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h4 class="font-bold mb-4 text-gray-800 dark:text-white">Información de Pago</h4>
                        <input id="checkout-card" type="text" placeholder="Número de Tarjeta (16 dígitos)" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm mb-3">
                        <div class="grid grid-cols-2 gap-4">
                            <input id="checkout-exp" type="text" placeholder="Vencimiento (MM/YY)" required class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm">
                            <input id="checkout-cvv" type="text" placeholder="CVV (3 o 4 dígitos)" required class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm">
                        </div>
                    </div>

                    <button type="submit" class="w-full bg-green-600 hover:bg-green-700 text-white py-3.5 rounded-xl transition font-bold text-lg shadow-lg shadow-green-500/10 mt-6">
                        Completar Compra - $${total}
                    </button>
                </form>
            </div>
        </div>
    `;

    document.getElementById('form-checkout').addEventListener('submit', (e) => {
        e.preventDefault();

        // VALIDACIÓN
        const numeroTarjeta = document.getElementById('checkout-card').value.replace(/\s+/g, '');
        const vencimiento = document.getElementById('checkout-exp').value.trim();
        const cvv = document.getElementById('checkout-cvv').value.trim();

        const cardRegex = /^\d{16}$/;
        const expRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
        const cvvRegex = /^\d{3,4}$/;

        if (!cardRegex.test(numeroTarjeta)) {
            mostrarNotificacion('❌ El número de tarjeta debe tener exactamente 16 dígitos', 'error');
            return;
        }

        if (!expRegex.test(vencimiento)) {
            mostrarNotificacion('❌ Formato de expiración incorrecto (MM/YY)', 'error');
            return;
        }

        // Expiración futura
        const parts = vencimiento.split('/');
        const expMonth = parseInt(parts[0], 10);
        const expYear = parseInt('20' + parts[1], 10);
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();

        if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
            mostrarNotificacion('❌ La tarjeta ingresada está expirada', 'error');
            return;
        }

        if (!cvvRegex.test(cvv)) {
            mostrarNotificacion('❌ El código CVV debe tener 3 o 4 dígitos', 'error');
            return;
        }

        const compra = {
            id: Date.now(),
            items: carrito,
            total: calcularTotalCarrito(),
            usuario: usuario.email,
            fecha: new Date().toISOString(),
            estado: 'Pendiente'
        };

        let compras = JSON.parse(localStorage.getItem('compras') || '[]');
        compras.push(compra);
        localStorage.setItem('compras', JSON.stringify(compras));
        localStorage.setItem('carrito', JSON.stringify([]));

        mostrarNotificacion('✅ ¡Compra completada exitosamente!', 'success');
        setTimeout(() => mostrarCatalogo(), 2000);
    });
}
