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

// Obtener el input de búsqueda
const inputBusqueda = document.querySelector('.busqueda');

inputBusqueda.addEventListener('input', function (e) {
    const textoBusqueda = e.target.value.toLowerCase();
    console.log('Buscando:', textoBusqueda);

    // Aquí llamaremos a la función de filtrado
    filtrarPerfiles(textoBusqueda);
});

function filtrarPerfiles(textoBusqueda) {
    const elementosPerfil = document.querySelectorAll('.perfil');
    let coincidencias = 0;

    let mensajeElement = document.getElementById('mensaje-no-resultados');
    if (!mensajeElement) {
        mensajeElement = document.createElement('div');
        mensajeElement.id = 'mensaje-no-resultados';
        document.querySelector('.lista-perfiles').parentNode.appendChild(mensajeElement);
    }

    for (let i = 0; i < elementosPerfil.length; i++) {
        const nombre = elementosPerfil[i].querySelector('.perfil-nombre').textContent.toLowerCase();
        const coincide = nombre.includes(textoBusqueda);

        if (coincide) {
            elementosPerfil[i].style.display = 'flex'; // o 'flex' según tu CSS
            coincidencias++;
        } else {
            elementosPerfil[i].style.display = 'none';
        }
    }

    if (coincidencias === 0 && textoBusqueda !== '') {
        mensajeElement.textContent = config.noResultados.replace('[query]', textoBusqueda);
        mensajeElement.style.display = 'block';
        // mensajeElement.style.textAlign = 'center';
        // mensajeElement.style.color = '#FFB8AD';
        // mensajeElement.style.fontSize = '18px';
    } else {
        mensajeElement.style.display = 'none';
    }
}