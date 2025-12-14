# ⚠️ CONFIGURACIÓN MANUAL EN RAILWAY - PASO A PASO

Railway cambió a **Railpack** (Nixpacks está deprecado). Sigue estos pasos exactos:

## 📍 Paso 1: Configurar Root Directory

1. Ve a tu proyecto en Railway
2. Haz clic en tu servicio (el que está fallando)
3. Ve a **Settings** (Configuración)
4. Busca la sección **"Source"** o **"Service Settings"**
5. Encuentra **"Root Directory"**
6. Cámbialo de `/` a: `/server`
7. Haz clic en **"Save"** o Enter

## 🎯 Paso 2: Asegurar Builder Correcto

1. En **Settings**, busca **"Builder"** 
2. Selecciona **"Railpack"** (Default)
3. **NO** uses Nixpacks (deprecated)

## 🚀 Paso 3: Configurar Start Command (opcional pero recomendado)

1. En **Settings**, busca **"Deploy"** o **"Start Command"**
2. Establece custom start command: `node index.js`
3. Guarda

## 🔄 Paso 4: Redeploy

1. Haz clic en **"Deploy"** en el menú
2. Clic en los 3 puntos (...) del último deployment
3. Selecciona **"Redeploy"**
4. O simplemente haz push de un nuevo commit (yo lo haré)

---

## ✅ Lo que Debería Pasar

Una vez configurado esto, Railway:
- ✅ Detectará el `package.json` en `/server`
- ✅ Instalará las dependencias automáticamente
- ✅ Ejecutará `node index.js` desde `/server`
- ✅ Todo funcionará correctamente

## 🎬 **IMPORTANTE: HAZ ESTO AHORA EN RAILWAY**

**ANTES** de que yo haga push del próximo commit, ve a Railway y configura:
1. ✅ Root Directory: `/server`
2. ✅ Builder: Railpack

Luego dime "listo" y yo haré push para que se redespliegue automáticamente.
