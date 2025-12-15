document.addEventListener('DOMContentLoaded', function() {
    const proceedBtn = document.getElementById('proceedBtn');
    const blockBtn = document.getElementById('blockBtn');
    const goBackBtn = document.getElementById('goBackBtn');
    const analysisResults = document.getElementById('analysisResults');
    const blockedUrl = document.getElementById('blockedUrl');

    // Obtener URL de los parámetros
    const params = new URLSearchParams(window.location.search);
    const urlToBlock = params.get('url') || 'URL desconocida';
    const analysisData = params.get('data') ? JSON.parse(decodeURIComponent(params.get('data'))) : null;

    // Mostrar URL bloqueada
    blockedUrl.textContent = urlToBlock;

    // Mostrar resultados del análisis
    if (analysisData) {
        displayAnalysisResults(analysisData);
    } else {
        analysisResults.innerHTML = '<p class="loading">No hay datos de análisis disponibles</p>';
    }

    // Botón: Continuar bajo su riesgo
    proceedBtn.addEventListener('click', function() {
        proceedBtn.disabled = true;
        proceedBtn.innerHTML = '<span class="icon">⏳</span> Redirigiendo...';
        
        // Guardar en lista de URLs permitidas
        chrome.storage.local.get('allowedUrls', function(result) {
            const allowedUrls = result.allowedUrls || [];
            if (!allowedUrls.includes(urlToBlock)) {
                allowedUrls.push({
                    url: urlToBlock,
                    timestamp: new Date().toISOString(),
                    decision: 'allowed'
                });
                chrome.storage.local.set({ allowedUrls: allowedUrls });
            }
        });
        
        setTimeout(() => {
            window.location.href = urlToBlock;
        }, 500);
    });

    // Botón: Mantener bloqueada
    blockBtn.addEventListener('click', function() {
        blockBtn.disabled = true;
        blockBtn.innerHTML = '<span class="icon">✓</span> Página bloqueada';
        
        // Guardar en lista de URLs bloqueadas
        chrome.storage.local.get('blockedUrls', function(result) {
            const blockedUrls = result.blockedUrls || [];
            if (!blockedUrls.find(item => item.url === urlToBlock)) {
                blockedUrls.push({
                    url: urlToBlock,
                    timestamp: new Date().toISOString(),
                    decision: 'blocked'
                });
                chrome.storage.local.set({ blockedUrls: blockedUrls });
            }
        });
        
        setTimeout(() => {
            // Cerrar la pestaña después de un breve retraso
            window.close();
        }, 1500);
    });

    // Botón: Volver
    goBackBtn.addEventListener('click', function() {
        goBackBtn.disabled = true;
        goBackBtn.innerHTML = '<span class="icon">✓</span> Volviendo...';
        
        setTimeout(() => {
            window.history.back();
        }, 300);
    });

    // Función para mostrar resultados del análisis
    function displayAnalysisResults(data) {
        const resultsHtml = generateResultsHtml(data);
        analysisResults.innerHTML = resultsHtml;
    }

    // Generar HTML con los resultados
    function generateResultsHtml(data) {
        let html = '<ul>';
        let hasThreats = false;

        // Mapeo de servicios a nombres amigables
        const serviceNames = {
            'google_safe': 'Google Safe Browsing',
            'virustotal': 'VirusTotal',
            'urlscan': 'URLScan.io',
            'openphish': 'OpenPhish'
        };

        for (const [service, isSafe] of Object.entries(data)) {
            const serviceName = serviceNames[service] || service;
            const statusClass = isSafe ? '' : 'unsafe';
            const statusText = isSafe ? 'Seguro' : 'Potencialmente peligroso';
            const statusIcon = isSafe ? '✓' : '✗';

            html += `<li class="${statusClass}">
                <strong>${serviceName}:</strong> ${statusText}
            </li>`;

            if (!isSafe) {
                hasThreats = true;
            }
        }

        html += '</ul>';

        if (hasThreats) {
            html = '<p style="color: #c33; margin-bottom: 12px; font-weight: 600;">⚠️ Se han detectado amenazas potenciales:</p>' + html;
        } else {
            html = '<p style="color: #28a745; margin-bottom: 12px; font-weight: 600;">✓ Todos los servicios indican que la página es segura:</p>' + html;
        }

        return html;
    }
});
