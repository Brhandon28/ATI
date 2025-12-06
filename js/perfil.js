document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(this.location.search);
    const ciParam = urlParams.get('ci');
    const langParam = urlParams.get('lang') || 'ES';
    if (ciParam) {
        iniciarPerfil.call(this, ciParam, langParam);
    }
});

function iniciarPerfil(ciParam, langParam) {
    if (!ciParam) {
        console.error('No se especificó cédula en la URL');
        return;
    }

    const configScript = this.createElement('script');
    configScript.src = `conf/config${langParam}.json`;

    configScript.onload = function () {
        // console.log('Configuración cargada:', config);
        console.log('Configuración cargada desde:', this.src);

        const script = document.createElement('script');
        script.src = `${ciParam}/perfil.json`;
        script.onload = function () {
            this.remove(); // Limpiar el script del DOM

            document.title = perfil.nombre;
            document.getElementById('nombre-titulo').textContent = perfil.nombre;

            // ACTUALIZACIÓN: Preload y carga optimizada de imagen
            const imageBasePath = `${ciParam}/${ciParam}`;

            // Actualizar el preload con la imagen responsive
            const preloadLink = document.getElementById('lcp-image-preload');
            preloadLink.href = `${imageBasePath}-400.jpg`;

            const imgElement = document.querySelector('.imagen');
            imgElement.src = `${imageBasePath}-400.jpg`;
            imgElement.srcset = `${imageBasePath}-200.jpg 200w,
                        ${imageBasePath}-400.jpg 400w,
                        ${imageBasePath}-800.jpg 800w`;
            imgElement.sizes = '(max-width: 480px) 90vw, (max-width: 768px) 200px, 200px';
            imgElement.alt = perfil.nombre;
            imgElement.fetchPriority = 'high'; // ← NUEVO: Prioridad alta

            document.querySelector('.parrafo-perfil-descripcion').textContent = perfil.descripcion;

            // USAR LAS TRADUCCIONES DE CONFIG
            document.getElementById('color').textContent = config.color + ': ' + perfil.color;
            document.getElementById('libro').textContent = config.libro + ': ' + perfil.libro.join(', ');
            document.getElementById('musica').textContent = config.musica + ': ' + perfil.musica.join(', ');
            document.getElementById('juego').textContent = config.video_juego + ': ' + perfil.video_juego.join(', ');
            document.getElementById('lenguajes').textContent = config.lenguajes + ': ' + perfil.lenguajes.join(', ');

            // Reemplazar [email] con el email real
            const emailText = config.email.replace('[email]', perfil.email);
            document.getElementById('direccion-email').textContent = emailText;
        };
        document.head.appendChild(script);
    };
    this.head.appendChild(configScript);
}