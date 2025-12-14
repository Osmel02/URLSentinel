
# **📝 Proyecto: Extensión de Navegador con Detección de Phishing en Tiempo Real**

---

![Vista del escaneo de URLs](assets/flujo.png)

---

## **1️⃣ Objetivo General**

Desarrollar una extensión de navegador que capture URLs en tiempo real, las envíe a un backend en Python, las analice con un **modelo de Machine Learning** y fuentes de **Threat Intelligence**, y determine si deben ser bloqueadas o permitidas.  
Incluye página de bloqueo personalizada, dashboard de métricas y logs estructurados tipo SIEM.

---

## **2️⃣ Estructura Final de Carpetas**

```bash
project/
├── backend/
│   ├── app/
│   │   ├── main.py              # Servidor Flask
│   │   ├── ml/
│   │   │   ├── model.pkl        # Modelo ML entrenado
│   │   │   ├── preprocess.py    # Feature engineering
│   │   │   └── predict.py       # Predicción ML
│   │   ├── services/
│   │   │   ├── virustotal.py    # Integración VT
│   │   │   ├── urlscan.py       # Integración URLScan
│   │   │   └── openphish.py     # Integración OpenPhish
│   │   └── utils/
│   │       ├── correlator.py    # Correlación de resultados
│   │       └── validators.py    # Validación de URLs
│   ├── metrics.py               # Métricas en memoria
│   └── requirements.txt
│
├── extension/
│   ├── manifest.json
│   ├── background.js            # Captura URLs y llama backend
│   ├── popup/
│   │   ├── popup.html           # Dashboard
│   │   ├── popup.js
│   │   └── popup.css
│   └── block/
│       ├── block.html           # Página de bloqueo
│       ├── block.js
│       └── block.css
│
└── README.md
```

---

## **3️⃣ Flujo de Datos Completo**

1. Usuario navega → extensión captura URL (`background.js`)
    
2. Envía URL a `backend/app/main.py` vía POST `/analyze`
    
3. Backend procesa:
    
    - Extrae features → ML (`predict.py`)
        
    - Consulta fuentes externas (VT, OpenPhish, URLScan)
        
    - Correlación con pesos y umbral → Score final
        
4. Devuelve JSON:
    

```json
{
  "url": "http://malicious.com",
  "score": 1.9,
  "block": true,
  "details": { "ml": {...}, "virustotal": {...}, "openphish": {...} }
}
```

5. Extensión:
    
    - `block=true` → redirige a `block/block.html`
        
    - `block=false` → permite navegación
        
6. Popup muestra métricas `/metrics` en tiempo real
    
7. Backend guarda logs estructurados en `events.log`
    

---

## **4️⃣ Backend (FastAPI)**

- **Endpoints principales**:
    
    - `/analyze` → recibe URL y devuelve veredicto
        
    - `/metrics` → devuelve métricas del sistema
        
- **Seguridad recomendada**:
    
    - HTTPS + API Keys
        
    - Validación de URLs
        
    - Rate limiting
        
    - CORS solo para extensión
        
- **Optimización**:
    
    - Caché para URLs ya analizadas
        
    - Consultas asíncronas a servicios externos
        
    - Logs JSON para integración SIEM
        

# URLSentinel

Detecta y bloquea URLs maliciosas (phishing/malware) en tiempo real mediante una extensión de navegador integrada con un backend en Python y fuentes de Threat Intelligence.

## Descripción

URLSentinel combina Machine Learning y señales externas (VirusTotal, OpenPhish, URLScan) para evaluar y bloquear URLs sospechosas antes de que el usuario las visite. Incluye página de bloqueo, dashboard de métricas y logs en formato JSON listos para integración SIEM.

## Características

- Detección híbrida: modelo ML + Threat Intelligence.
- Bloqueo inmediato con página de rechazo personalizable.
- Dashboard simple para métricas en tiempo real.
- Logs estructurados y preparados para análisis y SIEM.

## Estructura del repositorio

- backend/ — API, ML y servicios externos.
- extension/ — código de la extensión (background, popup, página de bloqueo).
- assets/ — imágenes y recursos estáticos.

## Instalación (desarrollo)

1. Crear y activar un entorno virtual (PowerShell):

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r backend/requeriment.txt
```

2. Ejecutar el backend (ajusta según la implementación: Flask o Uvicorn):

```powershell
cd backend
python app.py
# o: uvicorn app:app --reload --port 8000
```

3. Cargar la extensión en modo desarrollador en el navegador apuntando a la carpeta `extension`.

## Uso

- La extensión captura la URL activa y hace POST a `/analyze` en el backend.
- El backend devuelve un JSON con `score` y `block`. Si `block:true`, la extensión redirige a la página de bloqueo.

Ejemplo de respuesta:

```json
{
  "url": "http://malicious.example",
  "score": 1.8,
  "block": true,
  "details": { "ml": {...}, "virustotal": {...} }
}
```

## Arquitectura y flujo

1. Extensión (`extension/background.js`) captura la URL.
2. POST `/analyze` al backend.
3. Backend: extracción de features (`backend/ml/preprocess.py`), predicción (`backend/ml/predict.py`), consultas a servicios externos y correlación.
4. Respuesta → decisión de la extensión (permitir / bloquear).

## Modelo ML y correlación

- El modelo (RandomForest / LightGBM / XGBoost) aporta una probabilidad; señales externas (VT, OpenPhish, URLScan) se ponderan y se suman en un score final. El umbral es configurable.

## Archivos clave

- [backend/requeriment.txt](backend/requeriment.txt)
- [backend/ml/predict.py](backend/ml/predict.py)
- [backend/services](backend/services)
- [extension/background.js](extension/background.js)
- [extension/block/block.html](extension/block/block.html)

## Desarrollo y buenas prácticas

- Mantener API keys fuera del repo (variables de entorno).
- Añadir pruebas unitarias para `preprocess.py` y `predict.py`.
- Implementar caching con TTL y consultas asíncronas a servicios externos.

## Producción (recomendaciones)

- Ejecutar el backend detrás de HTTPS y con autenticación (API keys) y rate limiting.
- Registración de logs en JSON y exportación de métricas a Prometheus/ELK.

## Contribuir

- Abrir issues para bugs o mejoras.
- Enviar pull requests con descripción y pruebas.

## Licencia

Consulta el archivo [LICENSE](LICENSE) en la raíz del repositorio.

---

Versión: 1.0 — README actualizado.
    

- Pruebas extensas con URLs reales benignas y maliciosas

