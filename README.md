# Por automatizar un poco el uso del Dockerfile

## Construir la imagen
docker build -t brhandon-img:1.0 .

## Crear contenedor (Con puertos)
docker run -d -p 8080:80 --name sitio-brhandon brhandon-img:1.0

Ya puedes acceder a la pagina desde **http://localhost:8080/**
