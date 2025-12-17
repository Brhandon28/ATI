#!/usr/bin/env python3
import json
import os
import urllib.parse


# DEFINIR DIRECTORIO BASE (ruta absoluta donde está app.py)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def application(environ, start_response):
    """Punto de entrada WSGI - VERSIÓN CORREGIDA"""
    path = environ.get('PATH_INFO', '/')
    
    print(f"[DEBUG] Ruta solicitada: {path}")
    
    # 1. Si es la raíz -> servir index.html como SPA
    if path == '/' or path == '':
        return servir_html('index.html', start_response)
    
    # 2. Si es para archivos estáticos (CSS, JS, imágenes)
    elif path.startswith('/static/'):
        return servir_archivo_estatico(path, start_response)
    
    # 3. APIs JSON
    elif path == '/api/perfiles':
        return api_lista_perfiles(start_response)
    
    elif path.startswith('/api/perfil/'):
        partes = path.split('/')
        if len(partes) >= 4:
            ci = partes[3]
            return api_datos_perfil(ci, environ, start_response)
    
    elif path.startswith('/api/config/'):
        partes = path.split('/')
        if len(partes) >= 4:
            idioma = partes[3]
            return api_config_idioma(idioma, start_response)
    
    # 4. Redirección para perfil.html antiguo
    elif path == '/perfil.html':
        query = environ.get('QUERY_STRING', '')
        headers = [('Location', f'/?{query}')]
        start_response('302 Found', headers)
        return [b'Redirecting to SPA...']
    
    # 5. Cualquier otra ruta -> 404
    else:
        return error_404(start_response)

def servir_html(nombre_archivo, start_response):
    """Sirve un archivo HTML"""
    try:
        file_path = os.path.join(BASE_DIR, nombre_archivo)
        with open(file_path, 'r', encoding='utf-8') as f:
            html = f.read()
        
        headers = [
            ('Content-Type', 'text/html; charset=utf-8'),
            ('Content-Length', str(len(html)))
        ]
        start_response('200 OK', headers)
        return [html.encode('utf-8')]
        
    except FileNotFoundError:
        return error_html(f'{nombre_archivo} no encontrado', start_response)

def servir_index_spa(environ, start_response):
    """Sirve el index.html modificado como SPA"""
    print("[WSGI] Sirviendo SPA principal")
    
    # Leer index.html actual y convertirlo a SPA
    try:
        file_path = os.path.join(BASE_DIR, 'index.html')
        with open(file_path, 'r', encoding='utf-8') as f:
            html = f.read()
        
        # MODIFICACIÓN CRÍTICA: Convertir a SPA
        # 1. Cambiar los enlaces a perfil.html por eventos JavaScript
        html = html.replace(
            'window.location.href = `perfil.html?ci=${perfil.ci}`;',
            'cargarPerfilSPA(perfil.ci);'
        )
        
        # 2. Añadir contenedor para contenido dinámico
        if '<main>' in html:
            html = html.replace(
                '<main>',
                '''<main>
                    <div id="spa-contenido">
                        <!-- Aquí se cargará dinámicamente la lista o el perfil -->
                    </div>
                '''
            )
        
        # 3. Añadir JavaScript SPA al final del body
        if '</body>' in html:
            spa_js = '''
            <script>
            // SPA JavaScript
            function cargarPerfilSPA(ci) {
                console.log('Cargando perfil:', ci);
                // Usaremos fetch() aquí
                document.getElementById('spa-contenido').innerHTML = 
                    '<p>Cargando perfil ' + ci + '...</p>';
                
                // TODO: Implementar fetch en el próximo paso
            }
            
            // Cargar lista inicial
            window.addEventListener('DOMContentLoaded', function() {
                document.getElementById('spa-contenido').innerHTML = 
                    '<p>SPA cargada. Usa la búsqueda o haz clic en un perfil.</p>';
            });
            </script>
            '''
            html = html.replace('</body>', spa_js + '\n</body>')
        
        headers = [
            ('Content-Type', 'text/html; charset=utf-8'),
            ('Content-Length', str(len(html)))
        ]
        start_response('200 OK', headers)
        return [html.encode('utf-8')]
        
    except FileNotFoundError:
        return error_html('index.html no encontrado', start_response)

def api_lista_perfiles(start_response):
    """API: Devuelve la lista de perfiles (datos/index.json)"""
    print("[WSGI] API: Lista de perfiles")
    
    try:
        # Leer archivo datos/index.json
        file_path = os.path.join(BASE_DIR, 'datos', 'index.json')
        with open(file_path, 'r', encoding='utf-8') as f:
            contenido = f.read()
        
        # El archivo tiene "const perfiles = [...]" - extraemos el JSON
        # Buscar el array JSON dentro del archivo JavaScript
        inicio = contenido.find('[')
        fin = contenido.rfind(']') + 1
        
        if inicio != -1 and fin != -1:
            json_str = contenido[inicio:fin]
            perfiles = json.loads(json_str)
        else:
            perfiles = []
        
        # Preparar respuesta
        response_data = {
            'success': True,
            'count': len(perfiles),
            'perfiles': perfiles
        }
        
        headers = [
            ('Content-Type', 'application/json; charset=utf-8'),
            ('Access-Control-Allow-Origin', '*')
        ]
        start_response('200 OK', headers)
        return [json.dumps(response_data, ensure_ascii=False).encode('utf-8')]
        
    except Exception as e:
        return error_json(f'Error: {str(e)}', 500, start_response)

def api_datos_perfil(ci, environ, start_response):
    """API: Devuelve datos de un perfil específico"""
    print(f"[WSGI] API: Perfil {ci}")
    
    try:
        # Leer el perfil.json del usuario
        # ruta_json = f"data_user/{ci}/perfil.json"
        ruta_json = os.path.join(BASE_DIR, 'data_user', ci, 'perfil.json')
        with open(ruta_json, 'r', encoding='utf-8') as f:
            contenido = f.read()
        
        # Extraer JSON (similar a datos/index.json)
        inicio = contenido.find('{')
        fin = contenido.rfind('}') + 1
        
        if inicio != -1 and fin != -1:
            json_str = contenido[inicio:fin]
            perfil = json.loads(json_str)
        else:
            perfil = {}
        
        # Obtener idioma de la cookie o parámetro
        idioma = obtener_idioma(environ)
        
        # Obtener configuración de idioma
        config = cargar_config_idioma(idioma)
        
        # Preparar respuesta con datos traducidos
        response_data = {
            'success': True,
            'ci': ci,
            'idioma': idioma,
            'perfil': perfil,
            'config': config,
            'imagenes': {
                'original': f"/static/data_user/{ci}/{ci}.jpg",
                '200': f"/static/data_user/{ci}/{ci}-200.jpg",
                '400': f"/static/data_user/{ci}/{ci}-400.jpg",
                '800': f"/static/data_user/{ci}/{ci}-800.jpg"
            }
        }
        
        headers = [
            ('Content-Type', 'application/json; charset=utf-8'),
            ('Access-Control-Allow-Origin', '*')
        ]
        start_response('200 OK', headers)
        return [json.dumps(response_data, ensure_ascii=False, indent=2).encode('utf-8')]
        
    except FileNotFoundError:
        return error_json(f'Perfil {ci} no encontrado', 404, start_response)
    except Exception as e:
        return error_json(f'Error: {str(e)}', 500, start_response)

def api_config_idioma(idioma, start_response):
    """API: Devuelve configuración de idioma"""
    print(f"[WSGI] API: Config idioma {idioma}")
    
    try:
        config = cargar_config_idioma(idioma)
        
        response_data = {
            'success': True,
            'idioma': idioma,
            'config': config
        }
        
        headers = [
            ('Content-Type', 'application/json; charset=utf-8'),
            ('Access-Control-Allow-Origin', '*')
        ]
        start_response('200 OK', headers)
        return [json.dumps(response_data, ensure_ascii=False).encode('utf-8')]
        
    except FileNotFoundError:
        return error_json(f'Idioma {idioma} no soportado', 404, start_response)

def cargar_config_idioma(idioma):
    """Carga la configuración de idioma desde conf/config[IDIOMA].json"""
    # Mapear código de idioma a archivo
    mapeo = {
        'ES': 'configES.json',
        'EN': 'configEN.json',
        'PT': 'configPT.json'
    }
    
    # archivo = mapeo.get(idioma.upper(), 'configES.json')
    # ruta = f"conf/{archivo}"
    archivo = mapeo.get(idioma.upper(), 'configES.json')
    ruta = os.path.join(BASE_DIR, 'conf', archivo)
    
    with open(ruta, 'r', encoding='utf-8') as f:
        contenido = f.read()
    
    # Extraer objeto JSON del archivo JavaScript
    inicio = contenido.find('{')
    fin = contenido.rfind('}') + 1
    
    if inicio != -1 and fin != -1:
        json_str = contenido[inicio:fin]
        return json.loads(json_str)
    
    return {}

def obtener_idioma(environ):
    """Obtiene el idioma de cookie o parámetro"""
    # 1. Verificar parámetro de URL
    query_string = environ.get('QUERY_STRING', '')
    if query_string:
        params = urllib.parse.parse_qs(query_string)
        if 'lang' in params:
            return params['lang'][0].upper()
    
    # 2. Verificar cookie
    cookie_header = environ.get('HTTP_COOKIE', '')
    if 'idioma=' in cookie_header:
        for cookie in cookie_header.split(';'):
            if 'idioma=' in cookie:
                return cookie.split('=')[1].strip().upper()
    
    # 3. Por defecto español
    return 'ES'

def servir_archivo_estatico(path, start_response):
    """Sirve archivos estáticos (CSS, JS, imágenes)"""
    # Quitar '/static/' del inicio
    ruta_relativa = path[8:]  # '/static/'.length = 8
    
    # Si la ruta está vacía, servir index.html
    if not ruta_relativa or ruta_relativa == '':
        ruta_relativa = 'index.html'
    
    print(f"[DEBUG] Sirviendo estático: {ruta_relativa}")
    
    # Mapeo de extensiones a tipos MIME
    mime_types = {
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.html': 'text/html',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.ico': 'image/x-icon',
        '.json': 'application/json'
    }
    
    try:
        # Determinar tipo MIME
        ext = os.path.splitext(ruta_relativa)[1].lower()
        content_type = mime_types.get(ext, 'application/octet-stream')
        
        # Leer archivo
        # Asegurar que ruta_relativa no tenga '..' para evitar path traversal
        clean_path = ruta_relativa.lstrip('/')
        file_path = os.path.join(BASE_DIR, clean_path)
        
        with open(file_path, 'rb') as f:
            contenido = f.read()
        
        headers = [
            ('Content-Type', content_type),
            ('Content-Length', str(len(contenido)))
        ]
        start_response('200 OK', headers)
        return [contenido]
        
    except FileNotFoundError:
        print(f"[ERROR] Archivo no encontrado: {ruta_relativa}")
        return error_404(start_response)
    except Exception as e:
        print(f"[ERROR] Error leyendo archivo: {str(e)}")
        return error_html(f'Error interno: {str(e)}', start_response)

def error_json(mensaje, codigo=400, start_response=None):
    """Devuelve error en JSON"""
    if start_response:
        headers = [
            ('Content-Type', 'application/json; charset=utf-8'),
            ('Access-Control-Allow-Origin', '*')
        ]
        start_response(f'{codigo} ERROR', headers)
    
    error_data = {
        'success': False,
        'error': mensaje,
        'code': codigo
    }
    return [json.dumps(error_data).encode('utf-8')]

def error_html(mensaje, start_response):
    """Devuelve error en HTML"""
    html = f"""
    <!DOCTYPE html>
    <html>
    <head><title>Error</title></head>
    <body>
        <h1>Error</h1>
        <p>{mensaje}</p>
    </body>
    </html>
    """
    
    headers = [
        ('Content-Type', 'text/html; charset=utf-8'),
        ('Content-Length', str(len(html)))
    ]
    start_response('500 Internal Server Error', headers)
    return [html.encode('utf-8')]

def error_404(start_response):
    """Error 404"""
    headers = [
        ('Content-Type', 'text/html; charset=utf-8'),
        ('Content-Length', '0')
    ]
    start_response('404 NOT FOUND', headers)
    return [b'<h1>404 - Ruta no encontrada</h1>']

# Para pruebas
if __name__ == '__main__':
    from wsgiref.simple_server import make_server
    
    print("✅ Servidor WSGI de prueba")
    print("📌 Endpoints disponibles:")
    print("  http://localhost:8000/                    - SPA principal")
    print("  http://localhost:8000/api/perfiles        - Lista de perfiles")
    print("  http://localhost:8000/api/perfil/30291267 - Datos de un perfil")
    print("  http://localhost:8000/api/config/ES       - Configuración ES")
    
    server = make_server('localhost', 8000, application)
    server.serve_forever()
