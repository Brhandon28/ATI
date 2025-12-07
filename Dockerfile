# 1. IMAGEN BASE
FROM ubuntu:22.04

# 2. VARIABLE DE ENTORNO
ENV DEBIAN_FRONTEND=noninteractive

# 3. INSTALAR APACHE
RUN apt-get update && \
    apt-get install -y apache2 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# 4. CONFIGURAR APACHE
RUN echo "ServerName localhost" >> /etc/apache2/apache2.conf

# 5. COPIAR EL PROYECTO
COPY . /var/www/html/

# 6. CONFIGURAR PERMISOS
RUN chown -R www-data:www-data /var/www/html && \
    chmod -R 755 /var/www/html

# 7. EXPONER PUERTO
EXPOSE 80

# 8. COMANDO DE INICIO
CMD ["apache2ctl", "-D", "FOREGROUND"]