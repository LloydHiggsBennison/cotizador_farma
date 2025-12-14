# 🚀 Guía Completa de Deployment - FarmaciaCompare

Esta guía te llevará paso a paso para desplegar tu aplicación con **Frontend en Vercel** y **Backend en Railway**.

---

## 📋 Requisitos Previos

- [ ] Cuenta de GitHub (ya tienes ✅)
- [ ] Cuenta de Vercel (crear en [vercel.com](https://vercel.com))
- [ ] Cuenta de Railway (crear en [railway.app](https://railway.app))
- [ ] Código subido a GitHub (ya hecho ✅)

---

## 🎯 Parte 1: Desplegar Backend en Railway

### Paso 1: Crear cuenta en Railway

1. Ve a [railway.app](https://railway.app)
2. Haz clic en **"Start a New Project"**
3. Conecta tu cuenta de GitHub

### Paso 2: Crear el proyecto del Backend

1. En Railway, haz clic en **"New Project"**
2. Selecciona **"Deploy from GitHub repo"**
3. Busca y selecciona tu repositorio: `LloydHiggsBennison/cotizador_farma`
4. Railway detectará automáticamente que es un proyecto Node.js

### Paso 3: Configurar el Backend

1. Una vez creado el proyecto, haz clic en el servicio
2. Ve a la pestaña **"Settings"**
3. En **"Root Directory"**, NO cambies nada (déjalo en `/`)
4. Railway usará automáticamente el `Procfile` que creamos

### Paso 4: Obtener la URL del Backend

1. Ve a la pestaña **"Settings"** en tu servicio de Railway
2. Busca la sección **"Domains"**
3. Haz clic en **"Generate Domain"**
4. **Copia esta URL** (será algo como: `https://tu-proyecto.up.railway.app`)
5. **IMPORTANTE**: Guarda esta URL, la necesitarás para Vercel

**Ejemplo de URL:** 
```
https://cotizador-farma-production.up.railway.app
```

### Paso 5: Verificar que el Backend funciona

1. Espera a que el deployment termine (verás un ✅ verde)
2. Abre en tu navegador: `https://TU-URL-RAILWAY.up.railway.app/health`
3. Deberías ver algo como:
   ```json
   {
     "status": "OK",
     "scrapers": ["cruzverde", "salcobrand", ...]
   }
   ```

✅ **Backend desplegado correctamente!**

---

## 🌐 Parte 2: Desplegar Frontend en Vercel

### Paso 1: Crear cuenta en Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Haz clic en **"Sign Up"**
3. Selecciona **"Continue with GitHub"**
4. Autoriza a Vercel

### Paso 2: Importar el proyecto

1. En el dashboard de Vercel, haz clic en **"Add New..."** → **"Project"**
2. Busca tu repositorio: `cotizador_farma`
3. Haz clic en **"Import"**

### Paso 3: Configurar el proyecto

1. **Framework Preset**: Vercel detectará automáticamente "Vite" ✅
2. **Root Directory**: Déjalo en `./` (raíz)
3. **Build Command**: `npm run build` (ya detectado)
4. **Output Directory**: `dist` (ya detectado)

### Paso 4: Configurar Variables de Entorno

**¡CRÍTICO!** Antes de desplegar, debes configurar la variable de entorno:

1. En la sección **"Environment Variables"**, agrega:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://TU-URL-RAILWAY.up.railway.app/api/search`
   
   **⚠️ Reemplaza `TU-URL-RAILWAY` con la URL real que obtuviste en Railway**
   
   Ejemplo completo:
   ```
   VITE_API_URL=https://cotizador-farma-production.up.railway.app/api/search
   ```

2. Selecciona todos los ambientes: **Production**, **Preview**, **Development**
3. Haz clic en **"Add"**

### Paso 5: Desplegar

1. Haz clic en **"Deploy"**
2. Espera a que termine el build (2-3 minutos)
3. Verás un mensaje de **"Congratulations!"** cuando termine

### Paso 6: Obtener la URL de Vercel

1. Vercel te mostrará la URL de tu sitio
2. Será algo como: `https://cotizador-farma.vercel.app`
3. Haz clic en **"Visit"** para abrir tu aplicación

✅ **Frontend desplegado correctamente!**

---

## 🧪 Parte 3: Verificar que Todo Funciona

### Test 1: Verificar Backend (Railway)

Abre en el navegador:
```
https://TU-URL-RAILWAY/health
```

Deberías ver el JSON con status "OK" ✅

### Test 2: Verificar Frontend (Vercel)

1. Abre tu URL de Vercel: `https://tu-proyecto.vercel.app`
2. Deberías ver la página principal de FarmaciaCompare ✅

### Test 3: Verificar Búsqueda Completa

1. En tu sitio de Vercel, escribe "paracetamol" en el buscador
2. Haz clic en buscar
3. Deberías ver resultados de múltiples farmacias en 10-15 segundos ✅

---

## 🔄 Actualizaciones Futuras

### Cuando hagas cambios en el código:

**Para actualizar TODO (Frontend + Backend):**
```bash
git add .
git commit -m "descripción de cambios"
git push origin master
```

- ✅ **Railway** se actualizará automáticamente (tarda ~2 minutos)
- ✅ **Vercel** se actualizará automáticamente (tarda ~1 minuto)

**Solo Backend:**
- Haz push a GitHub y Railway se actualiza solo

**Solo Frontend:**
- Haz push a GitHub y Vercel se actualiza solo

---

## 🐛 Troubleshooting

### Problema: "Failed to fetch" en la búsqueda

**Solución:**
1. Verifica que pusiste bien la variable `VITE_API_URL` en Vercel
2. La URL debe terminar en `/api/search`
3. Debe incluir `https://`
4. No debe tener espacios

**Cómo verificar:**
- Ve a Vercel → Tu Proyecto → Settings → Environment Variables
- Verifica que `VITE_API_URL` esté configurada correctamente

**Si necesitas cambiarla:**
1. Edita la variable en Vercel
2. Ve a Deployments
3. Haz clic en los 3 puntos del último deployment → "Redeploy"

### Problema: Backend no responde

**Solución:**
1. Ve a Railway → Tu proyecto
2. Verifica que esté en estado "Active"
3. Revisa los logs para ver errores
4. Verifica que la URL del dominio esté generada

### Problema: Algunos scrapers no funcionan

**Solución:**
- Es normal, algunos sitios pueden bloquear el scraping
- Al menos 3-4 farmacias deberían funcionar
- Revisa los logs de Railway para ver cuáles están fallando

---

## 📊 Monitoreo

### Ver logs del Backend (Railway):
1. Ve a tu proyecto en Railway
2. Haz clic en tu servicio
3. Ve a la pestaña **"Logs"**
4. Aquí verás todas las búsquedas en tiempo real

### Ver logs del Frontend (Vercel):
1. Ve a tu proyecto en Vercel
2. Haz clic en la pestaña **"Logs"**
3. Selecciona tu deployment

---

## 💰 Costos

### Railway (Backend):
- **Plan gratuito**: $5 USD de crédito mensual
- Suficiente para ~2000-3000 búsquedas/mes
- Si se acaba, el servicio se pausa hasta el próximo mes

### Vercel (Frontend):
- **Plan gratuito**: 100% gratis
- 100GB de ancho de banda
- Suficiente para proyectos personales y portafolio

---

## ✅ Checklist Final

Marca cuando completes cada paso:

**Backend (Railway):**
- [ ] Cuenta de Railway creada
- [ ] Proyecto desplegado desde GitHub
- [ ] URL del backend obtenida
- [ ] Endpoint `/health` responde correctamente

**Frontend (Vercel):**
- [ ] Cuenta de Vercel creada
- [ ] Proyecto importado
- [ ] Variable `VITE_API_URL` configurada
- [ ] Deployment exitoso
- [ ] Sitio web accesible

**Pruebas:**
- [ ] Búsqueda funciona desde el sitio en Vercel
- [ ] Se muestran resultados de al menos 3 farmacias
- [ ] Imágenes de productos cargan correctamente
- [ ] Enlaces a farmacias funcionan

---

## 🎉 ¡Listo!

Tu aplicación está completamente desplegada y funcionando al 100%.

**URLs de tu proyecto:**
- 🌐 **Frontend**: `https://tu-proyecto.vercel.app`
- ⚙️ **Backend**: `https://tu-proyecto.up.railway.app`

Guarda estas URLs para compartirlas en tu portafolio! 🚀
