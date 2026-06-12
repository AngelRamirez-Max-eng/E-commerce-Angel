// js/sw-register.js - Service Worker registration

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
        .then(registration => {
            console.log('✅ Service Worker registrado exitosamente:', registration);
        })
        .catch(error => {
            console.error('❌ Error al registrar Service Worker:', error);
        });
}
