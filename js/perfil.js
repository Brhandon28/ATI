// Obtener el parámetro CI de la URL
const urlParams = new URLSearchParams(window.location.search);
const ciParam = urlParams.get('ci');
console.log('Cédula desde URL:', ciParam);

// Función principal que se ejecuta cuando la página carga
function iniciarPerfil() {
    if (!ciParam) {
        console.error('No se especificó cédula en la URL');
        return;
    }
    
    // console.log('Cargando perfil para CI:', ciParam);

    const script = document.createElement('script');
    script.src = `${ciParam}/perfil.json`;
    script.onload = function () {
        // console.log('Perfil Cargado:', perfil);
        document.title = perfil.nombre;
        document.getElementById('nombre-titulo').textContent = perfil.nombre;
        const imgElement = document.querySelector('.imagen');
        imgElement.src = `${ciParam}/${ciParam}.jpg`;
        imgElement.alt = perfil.nombre;
        document.querySelector('.parrafo-perfil-descripcion').textContent = perfil.descripcion
        document.getElementById('color').textContent = perfil.color;
        document.getElementById('libro').textContent = perfil.libro.join(', ');
        document.getElementById('musica').textContent = perfil.musica.join(', ');
        document.getElementById('juego').textContent = perfil.video_juego.join(', ');
        document.getElementById('lenguajes').textContent = perfil.lenguajes.join(', ');
        document.getElementById('direccion-email').textContent = perfil.email;
    }
    document.head.appendChild(script);
}


document.addEventListener('DOMContentLoaded', iniciarPerfil);