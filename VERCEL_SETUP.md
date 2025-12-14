# 🚀 Configuración de Vercel - PASO A PASO

Tu URL de Railway: **https://cotizadorfarma-production.up.railway.app/**

---

## 📋 Instrucciones Exactas

### Paso 1: Importar el Proyecto en Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Inicia sesión con **GitHub**
3. Haz clic en **"Add New..."** → **"Project"**
4. Busca: **`cotizador_farma`**
5. Haz clic en **"Import"**

### Paso 2: Configurar el Proyecto

Verás una pantalla de configuración. **ANTES de hacer Deploy:**

#### 2.1 Framework Preset
- ✅ Debería detectar automáticamente: **"Vite"**
- Si no, selecciónalo manualmente

#### 2.2 Root Directory
- ✅ Déjalo en: **`./`** (raíz del proyecto)

#### 2.3 Build Command
- ✅ Debería ser: **`npm run build`**

#### 2.4 Output Directory
- ✅ Debería ser: **`dist`**

### Paso 3: Configurar Variable de Entorno ⚠️ IMPORTANTE

En la sección **"Environment Variables"**:

1. Haz clic en **"Add"** o en el campo de variables
2. Ingresa exactamente:

**Name:**
```
VITE_API_URL
```

**Value:**
```
https://cotizadorfarma-production.up.railway.app/api/search
```

3. Selecciona **TODOS** los ambientes:
   - ✅ Production
   - ✅ Preview  
   - ✅ Development

4. Haz clic en **"Add"**

### Paso 4: ¡Desplegar!

1. Verifica que todo esté configurado:
   - ✅ Framework: Vite
   - ✅ Build Command: npm run build
   - ✅ Output Directory: dist
   - ✅ Variable VITE_API_URL configurada

2. Haz clic en **"Deploy"**

3. **Espera 2-3 minutos** mientras Vercel:
   - Instala dependencias
   - Construye el proyecto
   - Despliega

---

## ✅ Verificación

Cuando termine el deployment:

1. Vercel te mostrará tu URL (ej: `https://cotizador-farma.vercel.app`)
2. Haz clic en **"Visit"** para abrir tu sitio
3. **Prueba la búsqueda:**
   - Escribe "paracetamol"
   - Haz clic en buscar
   - Deberían aparecer resultados de las farmacias en 10-15 segundos

---

## � Si hay problemas

**Error "Failed to fetch":**
- Verifica que la variable `VITE_API_URL` esté correctamente escrita
- Debe incluir `/api/search` al final
- Debe ser exactamente: `https://cotizadorfarma-production.up.railway.app/api/search`

**Para reconfigurar:**
1. Ve a Settings en Vercel
2. Environment Variables
3. Edita `VITE_API_URL`
4. Guarda
5. Ve a Deployments → Redeploy

---

## 📝 URLs de tu Proyecto

- 🔧 **Backend (Railway):** https://cotizadorfarma-production.up.railway.app/
- 🌐 **Frontend (Vercel):** (te lo dará Vercel al terminar)

---

**¡Sigue estos pasos exactamente y avísame cuando termine el deployment de Vercel!**
