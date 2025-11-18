document.addEventListener('DOMContentLoaded', function () {
    // console.log('Perfiles cargados:', perfiles);
    if (typeof perfiles !== 'undefined') {
        mostrarPerfiles(perfiles);
    }
});


function mostrarPerfiles(perfiles) {
    const elementosPerfil = document.querySelectorAll('.perfil');
    // console.log('Elementos encontrados:', elementosPerfil);

    for (let i = 0; i < elementosPerfil.length; i++) {
        let nombre = perfiles[i].nombre;
        let imagenDelPerfil = perfiles[i].imagen;
        let imgElement = elementosPerfil[i].querySelector('.img-perfil');
        elementosPerfil[i].querySelector('.perfil-nombre').textContent = nombre;
        imgElement.src = imagenDelPerfil;
        imgElement.alt = nombre;
    }
}