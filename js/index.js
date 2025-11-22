document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const langParam = urlParams.get('lang') || 'ES';

    if (typeof perfiles !== 'undefined') {
        mostrarPerfiles(perfiles, langParam);
    }
});


function mostrarPerfiles(perfiles, langParam) {
    const listaPerfiles = document.querySelector('.lista-perfiles');
    listaPerfiles.innerHTML = ''; // Limpiar lista existente

    const configScript = document.createElement('script');
    configScript.src = `conf/config${langParam}.json`;

    configScript.onload = function () {

        document.title = `${config.sitio[0]} ${config.sitio[1]} ${config.sitio[2]}`;

        // Actualizar elementos con las traducciones
        document.querySelector('.cabecera-opciones-titulo').innerHTML = `${config.sitio[0]} <span class="ucv-text">${config.sitio[1]}</span> ${config.sitio[2]}`;

        if (perfiles.length > 0) {
            document.querySelector('.cabecera-opciones-saludo').textContent = `${config.saludo}, ${perfiles[0].nombre}`;
        }

        document.querySelector('.busqueda').placeholder = `${config.buscar}...`;
        document.querySelector('.parrafo-footer').textContent = `${config.copyRight}`;

        perfiles.forEach((perfil, index) => {
            const li = document.createElement('li');
            li.className = 'perfil';
            li.setAttribute('tabindex', '0'); // Hacer focusable
            li.setAttribute('role', 'button'); // Semántica de botón
            li.setAttribute('aria-label', `Ver perfil de ${perfil.nombre}`);

            // Añadir evento de clic para navegar
            li.addEventListener('click', () => {
                window.location.href = `perfil.html?ci=${perfil.ci}`;
            });

            // Añadir evento de teclado (Enter)
            li.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    li.click();
                }
            });

            const img = document.createElement('img');
            img.className = 'img-perfil';
            if (index === 0) img.classList.add('mi-perfil');
            img.src = perfil.imagen;
            img.alt = perfil.nombre;

            const divNombre = document.createElement('div');
            divNombre.className = 'perfil-nombre';
            divNombre.textContent = perfil.nombre;

            li.appendChild(img);
            li.appendChild(divNombre);
            listaPerfiles.appendChild(li);
        });
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
            elementosPerfil[i].style.display = 'flex';
            coincidencias++;
        } else {
            elementosPerfil[i].style.display = 'none';
        }
    }

    if (coincidencias === 0 && textoBusqueda !== '') {
        mensajeElement.textContent = config.noResultados.replace('[query]', textoBusqueda);
        mensajeElement.style.display = 'block';
    } else {
        mensajeElement.style.display = 'none';
    }
}