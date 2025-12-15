chrome.webNavigation.onCompleted.addListener((details) => {
    const url = details.url
    const backend_url = "http://localhost:5000/analyze"

    function esUrlLocal(url) {
        const patronesLocales = [
            /^chrome:\/\//,
            /^about:/,
            /^chrome-extension:\/\//,
            /^file:\/\//,
            /^http:\/\/localhost/,
            /^https:\/\/localhost/,
            /^http:\/\/127\.0\.0\.1/,
            /^https:\/\/127\.0\.0\.1/
        ];
        
        return patronesLocales.some(patron => patron.test(url));
    }

    function estaEnListaPermitida(url, callback) {
        chrome.storage.local.get('allowedUrls', function(result) {
            const allowedUrls = result.allowedUrls || [];
            const existe = allowedUrls.some(item => item.url === url);
            callback(existe);
        });
    }

    function estaEnListaBloqueada(url, callback) {
        chrome.storage.local.get('blockedUrls', function(result) {
            const blockedUrls = result.blockedUrls || [];
            const existe = blockedUrls.some(item => item.url === url);
            callback(existe);
        });
    }

    async function analizarUrl(urlToAnalyze) {
        try {
            const response = await fetch(backend_url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({"url": urlToAnalyze}),
                mode: "cors",
                credentials: "omit",
                cache: "no-cache"
            });
            const data = await response.json();
            console.log("Respuesta del backend: ", data);

            const existe = Object.values(data).includes(false);
            if (existe) {
                chrome.notifications.create({
                    type: "basic",
                    iconUrl: "icons/icon48.png",
                    title: "URL Sentinel",
                    message: "¡Advertencia! Se ha detectado contenido potencialmente malicioso en esta página.",
                    priority: 2
                });
                
                // Registrar URL maliciosa detectada
                chrome.storage.local.get('stats', function(result) {
                    const stats = result.stats || { visited: 0, malicious: 0, safe: 0 };
                    stats.visited += 1;
                    stats.malicious += 1;
                    chrome.storage.local.set({ stats: stats });
                });
                
                const blockPageUrl = chrome.runtime.getURL("block/block_page.html") + 
                    "?url=" + encodeURIComponent(urlToAnalyze) + 
                    "&data=" + encodeURIComponent(JSON.stringify(data));
                chrome.tabs.create({ url: blockPageUrl });
            } else {
                // Registrar URL segura
                chrome.storage.local.get('stats', function(result) {
                    const stats = result.stats || { visited: 0, malicious: 0, safe: 0 };
                    stats.visited += 1;
                    stats.safe += 1;
                    chrome.storage.local.set({ stats: stats });
                });
            }
        } catch (error) {
            console.error("Error al comunicarse con el backend: ", error);
        }
    }
    
    if (esUrlLocal(url)) {
        return;
    }

    // Verificar si está en lista de permitidas
    estaEnListaPermitida(url, function(estaPermitida) {
        if (estaPermitida) {
            console.log("URL permitida por el usuario, no se analiza: ", url);
            // Registrar como visitada (el usuario la permitió)
            chrome.storage.local.get('stats', function(result) {
                const stats = result.stats || { visited: 0, malicious: 0, safe: 0 };
                stats.visited += 1;
                chrome.storage.local.set({ stats: stats });
            });
            return;
        }

        // Verificar si está en lista de bloqueadas
        estaEnListaBloqueada(url, function(estaBloqueada) {
            if (estaBloqueada) {
                console.log("URL bloqueada por el usuario, no se analiza: ", url);
                // Ya está bloqueada, no hacer nada más
                return;
            }

            // Si no está en ninguna lista, proceder con el análisis
            analizarUrl(url);
        });
    });
});