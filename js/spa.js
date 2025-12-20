document.addEventListener('DOMContentLoaded', function () {
    console.log('SPA cargada');

    // Elementos del DOM
    const btnCargarPerfiles = document.getElementById('btn-cargar-perfiles');
    const selectorIdioma = document.getElementById('selector-idioma');
    const busquedaInput = document.getElementById('busqueda-input');
    const btnBuscar = document.getElementById('btn-buscar');
    const contenidoSpa = document.getElementById('spa-contenido');

    // Cargar Perfiles
    cargarPerfiles();

    // Configurar selector de idioma
    if (selectorIdioma) {
        const idiomaActual = getCookie('idioma') || 'ES';
        selectorIdioma.value = idiomaActual;

        selectorIdioma.addEventListener('change', function () {
            const nuevoIdioma = this.value;
            setCookie('idioma', nuevoIdioma, 7);
            // Solo actualizar configuración, no recargar perfiles
            cargarConfigIdioma(nuevoIdioma);
        });
    }
});

// Función para cargar lista de perfiles
async function cargarPerfiles() {
    try {
        const contenidoSpa = document.getElementById('spa-contenido');
        if (!contenidoSpa) {
            console.error('No se encontró el elemento spa-contenido');
            return;
        }

        contenidoSpa.innerHTML = '<div class="mensaje-carga">Cargando perfiles...</div>';

        const response = await fetch('/api/perfiles');
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        console.log('Perfiles cargados:', data);

        if (data.success) {
            mostrarListaPerfiles(data.perfiles);
        } else {
            mostrarError('Error al cargar perfiles: ' + data.error);
        }
    } catch (error) {
        console.error('Error en cargarPerfiles:', error);
        mostrarError('Error de conexión: ' + error.message);
    }
}

// Mostrar lista de perfiles
function mostrarListaPerfiles(perfiles) {
    const contenidoSpa = document.getElementById('spa-contenido');

    if (!perfiles || perfiles.length === 0) {
        contenidoSpa.innerHTML = '<div class="mensaje-carga">No se encontraron perfiles.</div>';
        return;
    }

    let html = `
        <div class="controles-lista">
        </div>
        <ul class="lista-perfiles-spa">
    `;

    perfiles.forEach(perfil => {
        const imgUrl = `/static/data_user/${perfil.ci}/${perfil.ci}-200.jpg`;
        html += `
            <li class="perfil-spa" onclick="cargarDetallePerfil('${perfil.ci}')">
                <img src="${imgUrl}" alt="${perfil.nombre}" loading="lazy">
                <h3>${perfil.nombre}</h3>
            </li>
        `;
    });

    html += '</ul>';
    contenidoSpa.innerHTML = html;
}

// Cargar detalles de un perfil
async function cargarDetallePerfil(ci) {
    try {
        const contenidoSpa = document.getElementById('spa-contenido');
        contenidoSpa.innerHTML = '<div class="mensaje-carga">Cargando perfil...</div>';

        const selector = document.getElementById('selector-idioma');
        const idioma = selector ? selector.value : 'ES';

        const response = await fetch(`/api/perfil/${ci}?lang=${idioma}`);
        const data = await response.json();

        if (data.success) {
            mostrarDetallePerfil(data);
        } else {
            mostrarError('Error al cargar perfil: ' + data.error);
        }
    } catch (error) {
        mostrarError('Error de conexión: ' + error.message);
    }
}

// Mostrar detalles del perfil
function mostrarDetallePerfil(data) {
    const perfil = data.perfil;
    const config = data.config;
    const contenidoSpa = document.getElementById('spa-contenido');

    let html = `
        <button onclick="cargarPerfiles()" class="btn-volver" style="margin: 20px;">← Volver</button>
        <div class="contenedor">
            <div class="imagen-perfil">
                <img src="${data.imagenes['400']}" alt="${perfil.nombre}" class="imagen" 
                     srcset="${data.imagenes['200']} 200w, ${data.imagenes['400']} 400w, ${data.imagenes['800']} 800w"
                     sizes="(max-width: 480px) 90vw, (max-width: 768px) 200px, 200px">
            </div>
            <div class="info-perfil">
                <h1 id="nombre-titulo">${perfil.nombre}</h1>
                <div class="parrafo-perfil">
                    <p class="parrafo-perfil-descripcion">${perfil.descripcion}</p>
                </div>
                <div class="tabla-perfil">
                    <table>
                        <tr>
                            <td id="color">${config.color}:</td>
                            <td>${perfil.color}</td>
                        </tr>
                        <tr>
                            <td id="libro">${config.libro}:</td>
                            <td>${Array.isArray(perfil.libro) ? perfil.libro.join(', ') : perfil.libro}</td>
                        </tr>
                        <tr>
                            <td id="musica">${config.musica}:</td>
                            <td>${Array.isArray(perfil.musica) ? perfil.musica.join(', ') : perfil.musica}</td>
                        </tr>
                        <tr>
                            <td id="juego">${config.video_juego}:</td>
                            <td>${Array.isArray(perfil.video_juego) ? perfil.video_juego.join(', ') : perfil.video_juego}</td>
                        </tr>
                        <tr class="tabla-perfil-negrita">
                            <td id="lenguajes">${config.lenguajes}:</td>
                            <td>${Array.isArray(perfil.lenguajes) ? perfil.lenguajes.join(', ') : perfil.lenguajes}</td>
                        </tr>
                    </table>
                </div>
                <div class="mail-perfil">
                    <p id="email">
                        <a id="direccion-email" href="mailto:${perfil.email}">
                            ${config.email ? config.email.replace('[email]', perfil.email) : perfil.email}
                        </a>
                    </p>
                </div>
            </div>
        </div>
    `;

    contenidoSpa.innerHTML = html;
}

// Funciones auxiliares
async function cargarConfigIdioma(idioma) {
    try {
        const response = await fetch(`/api/config/${idioma}`);
        const data = await response.json();

        if (data.success && data.config) {
            const config = data.config;

            const busquedaInput = document.getElementById('busqueda-input');
            if (busquedaInput && config.buscar) {
                busquedaInput.placeholder = config.buscar + '...';
            }

            const textoFooter = document.getElementById('texto-footer');
            if (textoFooter && config.copyRight) {
                textoFooter.textContent = config.copyRight;
            }

            const tituloSitio = document.getElementById('titulo-sitio');
            if (tituloSitio && config.sitio) {
                tituloSitio.textContent = config.sitio.join(' ');
            }
        }
    } catch (error) {
        console.error('Error cargando configuración de idioma:', error);
    }
}

function buscarPerfiles(texto) {
    console.log('Buscando:', texto);
    cargarPerfiles();
}

function mostrarError(mensaje) {
    const contenidoSpa = document.getElementById('spa-contenido');
    contenidoSpa.innerHTML = `<div class="mensaje-error">${mensaje}</div>`;
}

// Funciones para cookies
function setCookie(nombre, valor, dias) {
    const fecha = new Date();
    fecha.setTime(fecha.getTime() + (dias * 24 * 60 * 60 * 1000));
    const expira = "expires=" + fecha.toUTCString();
    document.cookie = nombre + "=" + valor + ";" + expira + ";path=/";
}

function getCookie(nombre) {
    const nombreEQ = nombre + "=";
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i];
        while (cookie.charAt(0) === ' ') {
            cookie = cookie.substring(1);
        }
        if (cookie.indexOf(nombreEQ) === 0) {
            return cookie.substring(nombreEQ.length, cookie.length);
        }
    }
    return null;
}

// Solo tres funciones globales necesarias
window.cargarPerfiles = cargarPerfiles;
window.cargarDetallePerfil = cargarDetallePerfil;
window.mostrarListaPerfiles = mostrarListaPerfiles;
