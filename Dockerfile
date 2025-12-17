# 1. IMAGEN BASE
FROM ubuntu:22.04

# 2. VARIABLE DE ENTORNO
ENV DEBIAN_FRONTEND=noninteractive

# 3. INSTALAR TODAS LAS DEPENDENCIAS
RUN apt-get update && \
    apt-get install -y \
    apache2 \
    python3 \
    python3-pip \
    libapache2-mod-wsgi-py3 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# 4. CONFIGURAR APACHE
RUN echo "ServerName localhost" >> /etc/apache2/apache2.conf

# 5. HABILITAR MÓDULOS NECESARIOS
RUN a2enmod wsgi

# 6. COPIAR EL PROYECTO
COPY . /var/www/html/

# 7. CONFIGURAR SITIO SPA
COPY spa.conf /etc/apache2/sites-available/spa.conf
RUN a2ensite spa.conf
RUN a2dissite 000-default.conf

# 8. CONFIGURAR PERMISOS
RUN chown -R www-data:www-data /var/www/html && \
    chmod -R 755 /var/www/html

# 9. EXPONER PUERTO
EXPOSE 80

# 10. COMANDO DE INICIO
CMD ["apache2ctl", "-D", "FOREGROUND"]