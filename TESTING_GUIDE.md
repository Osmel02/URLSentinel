# GUÍA DE TESTING - URL Sentinel Extension

## 🧪 Tests Recomendados

### 1. Test: URL Permitida No Se Re-analiza

**Objetivo:** Verificar que URLs en lista de permitidas no se analizan nuevamente

**Pasos:**
1. Instalar extensión en Chrome
2. Navegar a una URL maliciosa (ej: `http://localhost:5000/analyze?url=test`)
3. Hacer clic en "🔓 Continuar bajo mi riesgo"
4. Navegar nuevamente a la misma URL
5. **Esperado:** No aparece notificación, se accede directamente ✅

**Cómo verificar:**
- Abrir DevTools (F12) → Consola
- Buscar logs: "URL permitida por el usuario, no se analiza"
- No debe haber llamada POST al backend

---

### 2. Test: URL Bloqueada Se Mantiene Bloqueada

**Objetivo:** Verificar que URLs en lista de bloqueadas se mantienen bloqueadas

**Pasos:**
1. Navegar a URL maliciosa
2. Hacer clic en "🚫 Mantener bloqueada"
3. Navegar a la pestaña anterior
4. Navegar nuevamente a la misma URL
5. **Esperado:** No aparece block_page nuevamente ✅

**Cómo verificar:**
- Abrir DevTools → Consola
- Buscar logs: "URL bloqueada por el usuario, no se analiza"

---

### 3. Test: Estadísticas Se Actualizan

**Objetivo:** Verificar que los contadores se actualizan correctamente

**Pasos:**
1. Abrir popup de extensión
2. Anotar números iniciales de estadísticas
3. Navegar a 3 URLs diferentes (mix de seguras y maliciosas)
4. Regresar al popup
5. **Esperado:** Los contadores reflejan las URLs analizadas ✅

**Cómo verificar:**
- Verificar que "Visitadas" aumenta
- Verificar que "Maliciosas" aumenta cuando se detectan amenazas
- Verificar que "Seguras" aumenta para URLs seguras

---

### 4. Test: Listas en Popup

**Objetivo:** Verificar que las listas de permitidas y bloqueadas se muestran correctamente

**Pasos:**
1. Abrir popup → Pestaña "Permitidas"
2. **Esperado:** Muestra URLs permitidas con timestamps ✅
3. Abrir popup → Pestaña "Bloqueadas"
4. **Esperado:** Muestra URLs bloqueadas con timestamps ✅

**Cómo verificar:**
- Copiar URL funciona (botón 📋)
- Eliminar URL funciona (botón 🗑️)
- Fechas y horas son correctas (formato es-ES)

---

### 5. Test: Estado del Backend

**Objetivo:** Verificar que la conexión al backend se detecta correctamente

**Pasos:**
1. Con backend corriendo: Abrir popup → Resumen
   - **Esperado:** "Backend: En línea" con punto verde ✅
2. Detener backend
3. Abrir popup → Resumen
   - **Esperado:** "Backend: Desconectado" con punto rojo ✅

---

### 6. Test: Resetear Estadísticas

**Objetivo:** Verificar que el botón de resetear funciona

**Pasos:**
1. Abrir popup → Resumen
2. Hacer clic en "Resetear Estadísticas"
3. Confirmar en el diálogo
4. **Esperado:** Todos los contadores vuelven a 0 ✅
5. **Esperado:** Listas permitidas y bloqueadas se vacían ✅

---

## 🔍 Verificaciones Manuales en DevTools

### Console (F12 → Console)

**Buscar estos logs para verificar funcionamiento:**

```javascript
// URL local no se analiza
// (sin logs para URLs locales)

// URL permitida no se analiza
"URL permitida por el usuario, no se analiza: https://example.com"

// URL bloqueada no se analiza
"URL bloqueada por el usuario, no se analiza: https://example.com"

// URL analizada
"Respuesta del backend: {google_safe: true, virustotal: true, ...}"

// Error de conexión
"Error al comunicarse con el backend: TypeError: fetch failed"
```

### Storage (F12 → Application → Storage)

**Verificar datos almacenados:**

```
chrome-extension://... → Local Storage:
- allowedUrls: [{url: "...", timestamp: "...", decision: "allowed"}, ...]
- blockedUrls: [{url: "...", timestamp: "...", decision: "blocked"}, ...]
- stats: {visited: 10, malicious: 2, safe: 8}
```

---

## 📋 Checklist de Testing

- [ ] URLs permitidas no se re-analizan
- [ ] URLs bloqueadas no disparan notificaciones
- [ ] Estadísticas se actualizan en tiempo real
- [ ] Popup muestra listas correctamente
- [ ] Estado del backend se detecta
- [ ] Botón de resetear funciona
- [ ] Timestamps tienen formato correcto (es-ES)
- [ ] Copiar URL funciona
- [ ] Eliminar URL funciona
- [ ] Auto-refresh cada 5 segundos funciona
- [ ] Notificaciones del sistema aparecen
- [ ] block_page.html se abre correctamente
- [ ] Botones en block_page funcionan
- [ ] Escapado de HTML funciona (sin XSS)

---

## 🐛 Debugging

### Si las URLs se siguen re-analizando:

1. Verificar en Console: Debe aparecer "URL permitida por el usuario"
2. Si no aparece, verificar Storage: ¿La URL está en `allowedUrls`?
3. Comparar URLs exactamente (incluyendo protocolo y parámetros)

### Si no funciona el almacenamiento:

1. Verificar en DevTools → Storage → Local Storage
2. Verificar que la extensión tiene permiso `storage` en manifest.json
3. Verificar sintaxis de `chrome.storage.local.get()` y `.set()`

### Si el backend no responde:

1. Verificar que está corriendo: `curl http://localhost:5000/analyze`
2. Verificar logs del backend
3. Verificar CORS está habilitado en el backend

---

## 📞 Contacto/Soporte

Para reportar problemas, verificar:
1. Consola del navegador (F12)
2. Storage de la extensión
3. Logs del backend
4. Comparar con este documento de testing

**Última actualización:** 15 de Diciembre de 2025
