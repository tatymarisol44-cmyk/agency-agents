# 🧾 Integración con Invoka API (1.0.0) — Facturación Electrónica Ecuador

Ventana adicional de prueba y cliente Node.js para la **API de procesamiento de documentos electrónicos de Invoka** (SRI Ecuador).

## 📁 Estructura del proyecto

```
agency-agents/
├── package.json              # Dependencias del proyecto
├── .env.example              # Ejemplo de variables de entorno
├── invoka-client.js          # Cliente API de Node.js (todos los endpoints)
├── server.js                 # Servidor Express + proxy para evitar CORS
├── public/
│   ├── index.html            # Interfaz de prueba (ventana web)
│   └── app.js                # Lógica del frontend
└── README-INVOKA.md          # Este archivo
```

## 🚀 Instalación y inicio rápido

### 1. Instalar dependencias
```bash
cd "c:\Users\momoy\Desktop\VS CODE\AGENTES\agency-agents"
npm install
```

### 2. Configurar variables de entorno
```bash
copy .env.example .env
```

Edita `.env` y agrega tu clave:
```
INVOKA_API_KEY=tu-api-key-aqui
PORT=3000
DEFAULT_AMBIENTE=1
```

> ⚠️ Obtén tu API key en el panel de Invoka → Perfil. Límite: 300 peticiones por minuto.

### 3. Iniciar el servidor
```bash
npm start
# o
node server.js
```

### 4. Abrir la ventana de prueba
Navega a: **http://localhost:3000/**