document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const ciParam = urlParams.get('ci');
    const langParam = urlParams.get('lang') || 'ES';
    if (ciParam) {
        iniciarPerfil(ciParam, langParam);
    }
});

function iniciarPerfil(ciParam, langParam) {
    if (!ciParam) {
        console.error('No se especificó cédula en la URL');
        return;
    }

    const configScript = document.createElement('script');
    configScript.src = `conf/config${langParam}.json`;

    configScript.onload = function () {
        console.log('Configuración cargada:', config);

        const script = document.createElement('script');
        script.src = `${ciParam}/perfil.json`;
        script.onload = function () {
            document.title = perfil.nombre;
            document.getElementById('nombre-titulo').textContent = perfil.nombre;
            const imgElement = document.querySelector('.imagen');
            imgElement.src = `${ciParam}/${ciParam}.jpg`;
            imgElement.alt = perfil.nombre;
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
    document.head.appendChild(configScript);
}