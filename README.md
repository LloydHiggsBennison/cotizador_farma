# 💊 FarmaciaCompare - Cotizador de Farmacias

**FarmaciaCompare** es una aplicación web moderna que permite comparar precios de medicamentos en tiempo real de las principales farmacias de Chile. Encuentra el mejor precio para tus remedios de forma rápida y sencilla.

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-Proprietary-red.svg)
![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)

</div>

---

## 🚀 Características

- ✅ **Comparación en tiempo real** de precios de medicamentos
- 🏥 **Múltiples farmacias** incluidas (Cruz Verde, Salcobrand, Eco, Ahumada, Dr. Simi, Farmacias del Bosque)
- 🔍 **Búsqueda inteligente** con resultados instantáneos
- 📱 **Diseño responsivo** que funciona en cualquier dispositivo
- 🎨 **Interfaz moderna y limpia** con animaciones suaves
- ⚡ **Resultados rápidos** mediante web scraping optimizado
- 💰 **Ahorra dinero** encontrando la mejor oferta disponible

---

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** (versión 16 o superior)
- **npm** (incluido con Node.js)
- Navegador web moderno (Chrome, Firefox, Edge, Safari)

---

## 🛠️ Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/LloydHiggsBennison/cotizador_farma.git
cd cotizador-farma
```

### 2. Instalar dependencias del frontend

```bash
npm install
```

### 3. Instalar dependencias del backend

```bash
cd server
npm install
cd ..
```

---

## 🎯 Uso

### Modo Desarrollo

Para ejecutar la aplicación en modo desarrollo necesitas iniciar tanto el backend como el frontend:

**1. Iniciar el servidor backend (Terminal 1):**

```bash
cd server
node index.js
```

El servidor se ejecutará en `http://localhost:3001`

**2. Iniciar el servidor de desarrollo frontend (Terminal 2):**

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### Modo Producción

**1. Construir el frontend:**

```bash
npm run build
```

**2. Iniciar el servidor:**

```bash
cd server
node index.js
```

Los archivos estáticos se servirán desde la carpeta `dist`.

---

## 🏗️ Arquitectura del Proyecto

```
cotizador-farmacias/
├── src/                    # Código fuente del frontend
│   ├── components/        # Componentes React reutilizables
│   ├── services/          # Servicios para llamadas a API
│   ├── App.jsx           # Componente principal
│   ├── main.jsx          # Punto de entrada
│   └── index.css         # Estilos globales
├── server/                # Backend Node.js/Express
│   ├── scrapers/         # Módulos de scraping por farmacia
│   ├── index.js          # Servidor Express principal
│   └── package.json      # Dependencias del servidor
├── public/               # Archivos estáticos
├── dist/                 # Build de producción
├── package.json          # Dependencias del proyecto
└── vite.config.js        # Configuración de Vite
```

---

## 🧰 Tecnologías Utilizadas

### Frontend
- **React** 19.2.0 - Biblioteca de interfaz de usuario
- **Vite** - Build tool y servidor de desarrollo ultrarrápido
- **TailwindCSS** 4.1.17 - Framework de CSS utilitario
- **Lucide React** - Iconos modernos
- **Axios** - Cliente HTTP para peticiones

### Backend
- **Node.js** - Entorno de ejecución
- **Express** 5.2.1 - Framework web
- **Puppeteer** 24.32.0 - Automatización del navegador para scraping
- **Cheerio** - Parser HTML (jQuery para Node.js)
- **CORS** - Middleware para compartir recursos entre orígenes

### DevOps & Herramientas
- **ESLint** - Linter de código JavaScript
- **PostCSS** - Transformador de CSS
- **Autoprefixer** - Prefijos CSS automáticos

---

## 🔧 Configuración

### Variables de Entorno

Si necesitas configurar el puerto del servidor, puedes crear un archivo `.env` en la carpeta `server/`:

```env
PORT=3001
```

### Farmacias Soportadas

El sistema actualmente soporta scraping de las siguientes farmacias:

- 🏥 Cruz Verde
- 🏥 Salcobrand
- 🏥 Ahumada
- 🏥 Dr. Simi
- 🏥 Farmacias del Bosque

---

## 📝 API Reference

### Endpoint de Búsqueda

```http
POST http://localhost:3001/api/search
Content-Type: application/json

{
  "query": "paracetamol"
}
```

**Respuesta:**

```json
[
  {
    "pharmacy": "Cruz Verde",
    "name": "Paracetamol 500mg",
    "price": "2990",
    "oldPrice": "3500",
    "description": "Analgésico y antipirético...",
    "url": "https://www.cruzverde.cl/...",
    "image": "https://..."
  }
]
```

---

## ⚠️ Disclaimer

Los precios mostrados son obtenidos en tiempo real de las páginas web oficiales de las farmacias. Los precios pueden variar al momento de comprar presencialmente. Esta herramienta es solo informativa y no constituye una oferta comercial.

---

## 📄 Licencia

**Copyright © 2025 Lloyd Higgs Bennison. Todos los derechos reservados.**

Este software y su código fuente son propiedad exclusiva de Lloyd Higgs Bennison. 

### Restricciones:

- ❌ **Prohibida la redistribución** del código fuente o binarios
- ❌ **Prohibida la modificación** o creación de obras derivadas
- ❌ **Prohibido el uso comercial** sin autorización escrita
- ❌ **Prohibida la reproducción** total o parcial del código
- ❌ **Prohibida la publicación** en repositorios públicos o privados

### Permisos:

- ✅ **Uso personal** para fines de demostración y portafolio
- ✅ **Visualización del código** con fines educativos

### Disclaimer:

EL SOFTWARE SE PROPORCIONA "TAL CUAL", SIN GARANTÍA DE NINGÚN TIPO, EXPRESA O IMPLÍCITA. EL AUTOR NO SE HACE RESPONSABLE DE NINGÚN DAÑO, PÉRDIDA O RESPONSABILIDAD QUE SURJA DEL USO DE ESTE SOFTWARE.

Para solicitar permisos de uso, modificación o redistribución, contactar al autor.

---

## 👤 Autor

**Lloyd Higgs Bennison**

- GitHub: [@LloydHiggsBennison](https://github.com/LloydHiggsBennison)
- Email: lloyd.higgs.b@hotmail.com

---

## 🙏 Agradecimientos

- A todas las farmacias por proporcionar información pública de precios
- A la comunidad de código abierto por las increíbles herramientas y librerías

---

<div align="center">
  
**¿Te resultó útil este proyecto? ¡Dale una ⭐ al repositorio!**

</div>
