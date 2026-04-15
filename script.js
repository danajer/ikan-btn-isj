// Konfigurasi WhatsApp - Mengambil dari environment variable Netlify
// Nomor WA disembunyikan di environment variable: VITE_WHATSAPP_NUMBER
// Default fallback jika environment variable tidak tersedia
const CONFIG = {
    // WA_NUMBER akan diisi oleh Netlify build process
    WA_NUMBER: '%VITE_WHATSAPP_NUMBER%', // Akan diganti Netlify saat build
    DEFAULT_MESSAGE: 'Halo%20saya%20membutuhkan%20bantuan%20Bank%20BTN',
    SERVICE_HOURS: {
        start: 7,
        end: 22,
        timezone: 'Asia/Jakarta'
    }
};

// Fungsi untuk mendapatkan nomor WhatsApp dari environment variable
function getWhatsAppNumber() {
    // Cek apakah masih ada placeholder atau sudah diganti
    if (CONFIG.WA_NUMBER && CONFIG.WA_NUMBER !== '%VITE_WHATSAPP_NUMBER%') {
        return CONFIG.WA_NUMBER;
    }
    
    // Fallback: coba dari window.ENV (jika ada)
    if (typeof window !== 'undefined' && window.ENV && window.ENV.WHATSAPP_NUMBER) {
        return window.ENV.WHATSAPP_NUMBER;
    }
    
    // Fallback: coba dari process.env (untuk development)
    if (typeof process !== 'undefined' && process.env && process.env.VITE_WHATSAPP_NUMBER) {
        return process.env.VITE_WHATSAPP_NUMBER;
    }
    
    // Jika tidak ada, throw error atau return null
    console.error('WhatsApp number not configured! Please set VITE_WHATSAPP_NUMBER environment variable.');
    return null;
}

// Data layanan yang sering ditanyakan
const COMMON_ISSUES = [
    { issue: 'Akun Terblokir', message: 'Halo%20saya%20membutuhkan%20bantuan%20terkait%20akun%20saya%20yang%20terblokir%20di%20Bank%20BTN.%20Mohon%20bantuannya.' },
    { issue: 'Lupa PIN', message: 'Halo%20saya%20lupa%20PIN%20akun%20Bank%20BTN.%20Mohon%20bantuan%20untuk%20reset%20PIN.' },
    { issue: 'Kendala Transaksi', message: 'Halo%20saya%20mengalami%20kendala%20dalam%20melakukan%20transaksi%20di%20Bank%20BTN.%20Mohon%20bantuannya.' },
    { issue: 'Informasi KPR', message: 'Halo%20saya%20ingin%20menanyakan%20informasi%20mengenai%20KPR%20Bank%20BTN.' }
];

// Fungsi untuk membuat link WhatsApp
function createWhatsAppLink(message = CONFIG.DEFAULT_MESSAGE) {
    const waNumber = getWhatsAppNumber();
    if (!waNumber) {
        alert('Maaf, layanan WhatsApp sedang tidak tersedia. Silakan hubungi call center 1500 286.');
        return null;
    }
    return `https://wa.me/${waNumber}?text=${message}`;
}

// Fungsi untuk membuka WhatsApp
function openWhatsApp(message = CONFIG.DEFAULT_MESSAGE, source = 'main') {
    const link = createWhatsAppLink(message);
    if (link) {
        window.open(link, '_blank');
        trackWhatsAppClick(source);
    }
}

// Fungsi untuk mengecek jam operasional
function checkOperationalHours() {
    try {
        const now = new Date();
        const hours = now.getHours();
        const isOperational = hours >= CONFIG.SERVICE_HOURS.start && hours < CONFIG.SERVICE_HOURS.end;
        
        const statusElement = document.getElementById('operationalStatus');
        if (statusElement) {
            if (isOperational) {
                statusElement.innerHTML = '✅ Layanan sedang aktif | Respon cepat dalam 5-10 menit';
                statusElement.style.color = '#25D366';
            } else {
                statusElement.innerHTML = '⏰ Di luar jam operasional (07.00-22.00 WIB), pesan akan direspon besok pagi';
                statusElement.style.color = '#ff9800';
            }
        }
        
        return isOperational;
    } catch (error) {
        console.error('Error checking operational hours:', error);
        return true;
    }
}

// Fungsi untuk menambahkan tombol issue cepat
function addQuickIssueButtons() {
    const container = document.getElementById('quickIssuesContainer');
    if (!container) return;
    
    container.innerHTML = '<div class="quick-issues-title">🔍 Pilih masalah yang dialami untuk respon lebih cepat:</div>';
    
    COMMON_ISSUES.forEach(issue => {
        const button = document.createElement('button');
        button.className = 'quick-issue-btn';
        button.textContent = issue.issue;
        button.setAttribute('aria-label', `Bantuan untuk masalah ${issue.issue}`);
        button.onclick = () => {
            openWhatsApp(issue.message, `quick_issue_${issue.issue.toLowerCase().replace(/\s/g, '_')}`);
        };
        container.appendChild(button);
    });
}

// Fungsi untuk tracking WhatsApp click
function trackWhatsAppClick(source = 'main') {
    const timestamp = new Date().toISOString();
    const eventData = {
        event: 'whatsapp_click',
        source: source,
        timestamp: timestamp,
        url: window.location.href,
        user_agent: navigator.userAgent
    };
    
    console.log('Tracking event:', eventData);
    
    // Google Analytics 4 (if available)
    if (typeof gtag !== 'undefined') {
        gtag('event', 'whatsapp_click', {
            'event_category': 'engagement',
            'event_label': source,
            'value': 1
        });
    }
    
    // Facebook Pixel (if available)
    if (typeof fbq !== 'undefined') {
        fbq('track', 'Contact', {
            contact_method: 'WhatsApp',
            source: source
        });
    }
    
    // Simpan ke localStorage
    try {
        let clicks = localStorage.getItem('wa_clicks') || '[]';
        let clicksArray = JSON.parse(clicks);
        clicksArray.push(eventData);
        if (clicksArray.length > 100) clicksArray = clicksArray.slice(-100);
        localStorage.setItem('wa_clicks', JSON.stringify(clicksArray));
    } catch (e) {
        console.warn('Could not save to localStorage:', e);
    }
}

// Fungsi untuk inisialisasi event listeners (semua link WA disembunyikan)
function initializeEventListeners() {
    const waButton = document.getElementById('waButton');
    if (waButton) {
        waButton.addEventListener('click', (e) => {
            e.preventDefault();
            openWhatsApp(CONFIG.DEFAULT_MESSAGE, 'button');
        });
    }
    
    const topWaBanner = document.getElementById('topWaBanner');
    if (topWaBanner) {
        topWaBanner.addEventListener('click', (e) => {
            e.preventDefault();
            openWhatsApp(CONFIG.DEFAULT_MESSAGE, 'top_banner');
        });
    }
    
    const hiddenLink = document.getElementById('hiddenWhatsAppLink');
    if (hiddenLink) {
        hiddenLink.addEventListener('click', (e) => {
            e.preventDefault();
            openWhatsApp(CONFIG.DEFAULT_MESSAGE, 'hidden_link');
        });
    }
}

// Lazy loading images
function lazyLoadImages() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        });
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// Performance monitoring
function reportPerformance() {
    if ('performance' in window && 'getEntriesByType' in performance) {
        const paintMetrics = performance.getEntriesByType('paint');
        paintMetrics.forEach(metric => {
            console.log(`${metric.name}: ${metric.startTime}ms`);
        });
        
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
            console.log(`DOM Content Loaded: ${navigation.domContentLoadedEventEnd}ms`);
            console.log(`Load Complete: ${navigation.loadEventEnd}ms`);
        }
    }
}

// Keyboard shortcut: Ctrl + Shift + C
function addKeyboardShortcut() {
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'C') {
            e.preventDefault();
            const waNumber = getWhatsAppNumber();
            if (waNumber) {
                navigator.clipboard.writeText(waNumber).then(() => {
                    const notification = document.createElement('div');
                    notification.textContent = '✅ Nomor WhatsApp tersalin!';
                    notification.style.cssText = `
                        position: fixed;
                        bottom: 20px;
                        right: 20px;
                        background: #25D366;
                        color: white;
                        padding: 12px 20px;
                        border-radius: 40px;
                        font-size: 14px;
                        z-index: 1000;
                        animation: fadeInOut 2s ease;
                    `;
                    document.body.appendChild(notification);
                    setTimeout(() => notification.remove(), 2000);
                });
            }
        }
    });
}

// Register service worker for PWA (optional)
function registerServiceWorker() {
    if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
        navigator.serviceWorker.register('/sw.js').catch(err => {
            console.log('ServiceWorker registration failed: ', err);
        });
    }
}

// Smooth scroll untuk anchor links
function addSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId && targetId !== '#') {
                e.preventDefault();
                const target = document.querySelector(targetId);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    });
}

// Inisialisasi halaman
function init() {
    const waNumber = getWhatsAppNumber();
    if (waNumber) {
        console.log('Bank BTN CS Page initialized - WhatsApp service ready');
    } else {
        console.warn('Bank BTN CS Page initialized - WhatsApp number not configured!');
    }
    
    // Report performance
    reportPerformance();
    
    // Inisialisasi event
    initializeEventListeners();
    
    // Cek jam operasional
    checkOperationalHours();
    
    // Add quick issues container
    const infoText = document.querySelector('.info-text');
    if (infoText && !document.getElementById('quickIssuesContainer')) {
        const quickContainer = document.createElement('div');
        quickContainer.id = 'quickIssuesContainer';
        quickContainer.className = 'quick-issues-container';
        infoText.insertAdjacentElement('afterend', quickContainer);
        
        const statusContainer = document.createElement('div');
        statusContainer.id = 'operationalStatus';
        statusContainer.className = 'operational-status';
        quickContainer.insertAdjacentElement('afterend', statusContainer);
        
        addQuickIssueButtons();
        checkOperationalHours();
    }
    
    // Smooth scroll
    addSmoothScroll();
    
    // Keyboard shortcut
    addKeyboardShortcut();
    
    // Lazy load images
    lazyLoadImages();
    
    // Register service worker
    registerServiceWorker();
}

// Run on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Export untuk testing (jika diperlukan)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, createWhatsAppLink, checkOperationalHours, getWhatsAppNumber };
      }
