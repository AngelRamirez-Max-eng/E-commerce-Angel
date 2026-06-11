# 🛍️ Mi Tienda UCAB - E-commerce Vanilla

Un e-commerce completamente funcional desarrollado con **JavaScript puro**, sin frameworks. Incluye autenticación, catálogo interactivo, carrito de compras, panel de administración y **capacidad offline** con Service Workers.

## ✨ Características

### 👤 Autenticación y Roles
- ✅ Registro e inicio de sesión de usuarios
- ✅ Dos roles: **Cliente** y **Administrador**
- ✅ Sesiones persistentes con sessionStorage
- ✅ Usuario admin por defecto: `admin@ucab.edu.ve` / `admin123`

### 🛒 Vista de Cliente
- ✅ **Catálogo interactivo** con buscador
- ✅ **Filtros dinámicos** por categoría y rango de precio
- ✅ **Carrito de compras** con funcionalidades completas:
  - Agregar, modificar cantidad, eliminar productos
  - Cálculo automático de totales
- ✅ **Checkout** con formulario de envío y pago
- ✅ **Historial de compras** guardado localmente

### 📊 Panel de Administración
- ✅ **Dashboard** con métricas principales:
  - Total de ingresos
  - Cantidad de usuarios registrados
  - Órdenes completadas
- ✅ **CRUD de Productos**:
  - Crear nuevos productos
  - Editar productos existentes
  - Eliminar productos
- ✅ **Gestión de Pedidos**: visualizar todas las órdenes
- ✅ **Gestión de Usuarios**: listar usuarios registrados

### 🌐 Funcionalidades Offline
- ✅ **Service Worker** para cachear recursos
- ✅ **Indicador de conexión** (Online/Offline)
- ✅ **Compras offline**: se guardan en localStorage y se sincronizan al recuperar conexión
- ✅ **Estrategia de caché**: Cache First para GET, Network First para POST

### 🎨 Diseño y UX
- ✅ **Tailwind CSS** para estilos responsive
- ✅ **Modo Oscuro/Día** con preferencia guardada
- ✅ **Interfaz moderna** y fácil de usar
- ✅ **Notificaciones** en tiempo real
- ✅ **Diseño Mobile First**

## 🏗️ Estructura del Proyecto

```
mi-tienda-ucab/
├── index.html              # Página principal
├── manifest.json           # PWA Manifest
├── sw.js                   # Service Worker
├── js/
│   ├── app.js             # Core: inicialización y almacenamiento
│   ├── auth.js            # Autenticación y login
│   ├── catalogo.js        # Catálogo, carrito y checkout
│   ├── admin.js           # Panel de administración
│   └── sw-register.js     # Registro del Service Worker
└── README.md              # Este archivo
```

## 🚀 Cómo Usar

### 1. **Clonar el Repositorio**
```bash
git clone https://github.com/AngelRamirez-Max-eng/E-commerce-Angel.git
cd E-commerce-Angel
```

### 2. **Abrir en el Navegador**
Simplemente abre `index.html` en tu navegador (o usa un servidor local como Live Server).

### 3. **Credenciales por Defecto**
- **Admin**: `admin@ucab.edu.ve` / `admin123`
- **Prueba de Cliente**: Crea una cuenta nueva

## 📱 Características de PWA

La aplicación es una **Progressive Web App** (PWA) que puede:
- Instalarse como app en dispositivos
- Funcionar completamente offline
- Sincronizar datos cuando recupera conexión
- Usar notificaciones y caché

## 💾 Almacenamiento Local

Todo se guarda en el navegador del usuario:
- **localStorage**: Productos, carrito, compras, usuarios, modo oscuro
- **sessionStorage**: Sesión del usuario actual
- **Service Worker Cache**: Recursos estáticos para offline

## 🔧 Tecnologías Utilizadas

- **HTML5**: Estructura semántica
- **CSS3 + Tailwind CSS**: Estilos y diseño responsive
- **JavaScript Vanilla**: Lógica pura sin frameworks
- **Service Workers**: Funcionalidad offline
- **IndexedDB/localStorage**: Persistencia de datos
- **Fetch API**: Comunicación con APIs

## 📝 Próximas Mejoras

- [ ] Integración con backend real
- [ ] Sistema de pagos (Stripe/PayPal)
- [ ] Notificaciones push
- [ ] Geolocalización para envíos
- [ ] Sistema de reseñas
- [ ] Wishlist/Favoritos
- [ ] Multi-idioma

## 📄 Licencia

Este proyecto está bajo licencia MIT. Siéntete libre de usarlo como base para tus propios proyectos.

## 👨‍💻 Autor

Desarrollado por **Angel Ramírez** para UCAB como proyecto de e-commerce con tecnologías web modernas.

---

**¿Dudas o sugerencias?** Abre un issue en el repositorio. 🚀
