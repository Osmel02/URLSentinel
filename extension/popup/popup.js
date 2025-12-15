document.addEventListener('DOMContentLoaded', function() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const resetStatsBtn = document.getElementById('resetStatsBtn');
    const backendStatus = document.getElementById('backendStatus');
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');

    // Load initial data
    loadStatistics();
    checkBackendStatus();
    loadAllowedUrls();
    loadBlockedUrls();
    updateLastCheck();

    // Tab switching
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            // Remove active class from all
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            document.getElementById(tabName).classList.add('active');
        });
    });

    // Reset statistics
    resetStatsBtn.addEventListener('click', function() {
        if (confirm('¿Estás seguro de que deseas resetear todas las estadísticas?')) {
            chrome.storage.local.set({ 
                stats: { visited: 0, malicious: 0, safe: 0 },
                allowedUrls: [],
                blockedUrls: []
            });
            
            resetStatsBtn.textContent = '✓ Reseteado';
            resetStatsBtn.disabled = true;
            
            setTimeout(() => {
                loadStatistics();
                loadAllowedUrls();
                loadBlockedUrls();
                resetStatsBtn.textContent = 'Resetear Estadísticas';
                resetStatsBtn.disabled = false;
            }, 1500);
        }
    });

    // Load and display statistics
    function loadStatistics() {
        chrome.storage.local.get('stats', function(result) {
            const stats = result.stats || { visited: 0, malicious: 0, safe: 0 };
            
            document.getElementById('visitedCount').textContent = stats.visited;
            document.getElementById('maliciousCount').textContent = stats.malicious;
            document.getElementById('safeCount').textContent = stats.safe;
        });
    }

    // Check backend connection
    function checkBackendStatus() {
        const backend_url = "http://localhost:5000/analyze";
        
        // Simple health check by trying to reach the backend
        fetch(backend_url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url: 'http://example.com' }),
            mode: 'cors',
            credentials: 'omit',
            cache: 'no-cache'
        })
        .then(response => {
            if (response.ok || response.status === 200) {
                setBackendStatus(true);
            } else {
                setBackendStatus(false);
            }
        })
        .catch(error => {
            setBackendStatus(false);
        });
    }

    function setBackendStatus(isOnline) {
        if (isOnline) {
            backendStatus.textContent = 'En línea';
            backendStatus.classList.remove('offline');
            statusDot.style.background = '#4ade80';
            statusText.textContent = 'Activo';
        } else {
            backendStatus.textContent = 'Desconectado';
            backendStatus.classList.add('offline');
            statusDot.style.background = '#f87171';
            statusText.textContent = 'Desconectado';
        }
    }

    // Load allowed URLs
    function loadAllowedUrls() {
        chrome.storage.local.get('allowedUrls', function(result) {
            const allowedUrls = result.allowedUrls || [];
            const allowedList = document.getElementById('allowedList');
            
            if (allowedUrls.length === 0) {
                allowedList.innerHTML = '<div class="empty-state"><p>📭 No hay URLs permitidas</p></div>';
                return;
            }
            
            allowedList.innerHTML = '';
            allowedUrls.forEach((item, index) => {
                const urlItem = createUrlItem(item, 'allowed', index, 'allowed');
                allowedList.appendChild(urlItem);
            });
        });
    }

    // Load blocked URLs
    function loadBlockedUrls() {
        chrome.storage.local.get('blockedUrls', function(result) {
            const blockedUrls = result.blockedUrls || [];
            const blockedList = document.getElementById('blockedList');
            
            if (blockedUrls.length === 0) {
                blockedList.innerHTML = '<div class="empty-state"><p>✓ Todas las URLs maliciosas están bloqueadas</p></div>';
                return;
            }
            
            blockedList.innerHTML = '';
            blockedUrls.forEach((item, index) => {
                const urlItem = createUrlItem(item, 'blocked', index, 'blocked');
                blockedList.appendChild(urlItem);
            });
        });
    }

    // Create URL item element
    function createUrlItem(item, type, index, listType) {
        const div = document.createElement('div');
        div.className = 'url-item';
        
        const url = typeof item === 'string' ? item : item.url;
        const timestamp = item.timestamp || new Date().toISOString();
        const date = new Date(timestamp);
        const dateStr = date.toLocaleDateString('es-ES') + ' ' + date.toLocaleTimeString('es-ES');
        
        const badgeText = listType === 'allowed' ? 'Permitida' : 'Bloqueada';
        
        div.innerHTML = `
            <div class="url-item-header">
                <span class="url-badge ${listType}">${badgeText}</span>
                <span class="url-date">${dateStr}</span>
            </div>
            <div class="url-text">${escapeHtml(url)}</div>
            <div class="url-actions">
                <button class="url-btn" data-action="copy" data-url="${escapeHtml(url)}">📋 Copiar</button>
                <button class="url-btn" data-action="remove" data-index="${index}" data-type="${listType}">🗑️ Eliminar</button>
            </div>
        `;
        
        // Copy button
        div.querySelector('[data-action="copy"]').addEventListener('click', function(e) {
            e.preventDefault();
            const url = this.getAttribute('data-url');
            navigator.clipboard.writeText(url).then(() => {
                this.textContent = '✓ Copiado';
                setTimeout(() => {
                    this.textContent = '📋 Copiar';
                }, 1500);
            });
        });
        
        // Remove button
        div.querySelector('[data-action="remove"]').addEventListener('click', function(e) {
            e.preventDefault();
            const idx = this.getAttribute('data-index');
            const listType = this.getAttribute('data-type');
            
            if (listType === 'allowed') {
                chrome.storage.local.get('allowedUrls', function(result) {
                    const allowedUrls = result.allowedUrls || [];
                    allowedUrls.splice(idx, 1);
                    chrome.storage.local.set({ allowedUrls: allowedUrls });
                    loadAllowedUrls();
                });
            } else {
                chrome.storage.local.get('blockedUrls', function(result) {
                    const blockedUrls = result.blockedUrls || [];
                    blockedUrls.splice(idx, 1);
                    chrome.storage.local.set({ blockedUrls: blockedUrls });
                    loadBlockedUrls();
                });
            }
        });
        
        return div;
    }

    // Utility: Escape HTML
    function escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    // Update last check time
    function updateLastCheck() {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('es-ES');
        document.getElementById('lastCheck').textContent = timeStr;
    }

    // Auto-refresh statistics every 5 seconds
    setInterval(() => {
        loadStatistics();
        checkBackendStatus();
    }, 5000);
});
