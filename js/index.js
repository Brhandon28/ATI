document.addEventListener('DOMContentLoaded', function () {
    // console.log('Perfiles cargados:', perfiles);
    const urlParams = new URLSearchParams(window.location.search);
    const langParam = urlParams.get('lang') || 'ES';

    if (typeof perfiles !== 'undefined') {
        mostrarPerfiles(perfiles, langParam);
    }
});


function mostrarPerfiles(perfiles, langParam) {
    const elementosPerfil = document.querySelectorAll('.perfil');
    // console.log('Elementos encontrados:', elementosPerfil);

    const configScript = document.createElement('script');
    configScript.src = `conf/config${langParam}.json`;

    configScript.onload = function () {

        document.title = `${config.sitio[0]} ${config.sitio[1]} ${config.sitio[2]}`;

        // Actualizar elementos con las traducciones
        document.querySelector('.cabecera-opciones-titulo').innerHTML = `${config.sitio[0]} <span class="ucv-text">${config.sitio[1]}</span> ${config.sitio[2]}`;
        // document.querySelector('.ucv-text').textContent = config.sitio[1];
        document.querySelector('.cabecera-opciones-saludo').textContent = `${config.saludo}, ${perfiles[0].nombre}`;
        document.querySelector('.busqueda').placeholder = `${config.buscar}...`;
        document.querySelector('.parrafo-footer').textContent = `${config.copyRight}`;

        for (let i = 0; i < elementosPerfil.length; i++) {
            let nombre = perfiles[i].nombre;
            let imagenDelPerfil = perfiles[i].imagen;
            let imgElement = elementosPerfil[i].querySelector('.img-perfil');
            elementosPerfil[i].querySelector('.perfil-nombre').textContent = nombre;
            imgElement.src = imagenDelPerfil;
            imgElement.alt = nombre;
        }
    };
    document.head.appendChild(configScript);
}