// ============================================
// MULTILINGUAL COOKIE CONSENT MANAGER
// ============================================

(function() {
    'use strict';
    
    const COOKIE_NAME = 'justroam_cookie_consent';
    const COOKIE_EXPIRY_DAYS = 365;
    
    // Translations
    const translations = {
        en: {
            title: 'We value your privacy',
            description: 'We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.',
            cookiePolicy: 'Cookie Policy',
            customize: 'Customize',
            rejectAll: 'Reject All',
            acceptAll: 'Accept All',
            
            // Customize modal
            customizeTitle: 'Customize cookie preferences',
            savePreferences: 'Save preferences',
            acceptSelected: 'Accept selected',
            
            // Categories
            necessary: 'Necessary cookies',
            necessaryDesc: 'These cookies are essential for the website to function properly. They cannot be disabled.',
            analytics: 'Analytics cookies',
            analyticsDesc: 'These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.',
            marketing: 'Marketing cookies',
            marketingDesc: 'These cookies are used to track visitors across websites to display relevant advertisements.',
            
            alwaysActive: 'Always active'
        },
        
        nl: {
            title: 'Wij waarderen uw privacy',
            description: 'We gebruiken cookies om uw browse-ervaring te verbeteren, gepersonaliseerde advertenties of inhoud te tonen en ons verkeer te analyseren. Door op "Alles accepteren" te klikken, stemt u in met ons gebruik van cookies.',
            cookiePolicy: 'Cookiebeleid',
            customize: 'Aanpassen',
            rejectAll: 'Alles weigeren',
            acceptAll: 'Alles accepteren',
            
            // Customize modal
            customizeTitle: 'Cookie voorkeuren aanpassen',
            savePreferences: 'Voorkeuren opslaan',
            acceptSelected: 'Geselecteerde accepteren',
            
            // Categories
            necessary: 'Noodzakelijke cookies',
            necessaryDesc: 'Deze cookies zijn essentieel voor de goede werking van de website. Ze kunnen niet worden uitgeschakeld.',
            analytics: 'Analytische cookies',
            analyticsDesc: 'Deze cookies helpen ons te begrijpen hoe bezoekers omgaan met onze website door anoniem informatie te verzamelen en te rapporteren.',
            marketing: 'Marketing cookies',
            marketingDesc: 'Deze cookies worden gebruikt om bezoekers op verschillende websites te volgen om relevante advertenties weer te geven.',
            
            alwaysActive: 'Altijd actief'
        },
        
        de: {
            title: 'Wir schätzen Ihre Privatsphäre',
            description: 'Wir verwenden Cookies, um Ihr Surferlebnis zu verbessern, personalisierte Anzeigen oder Inhalte bereitzustellen und unseren Datenverkehr zu analysieren. Indem Sie auf "Alle akzeptieren" klicken, stimmen Sie unserer Verwendung von Cookies zu.',
            cookiePolicy: 'Cookie-Richtlinie',
            customize: 'Anpassen',
            rejectAll: 'Alle ablehnen',
            acceptAll: 'Alle akzeptieren',
            
            // Customize modal
            customizeTitle: 'Cookie-Einstellungen anpassen',
            savePreferences: 'Einstellungen speichern',
            acceptSelected: 'Ausgewählte akzeptieren',
            
            // Categories
            necessary: 'Notwendige Cookies',
            necessaryDesc: 'Diese Cookies sind für die ordnungsgemäße Funktion der Website unerlässlich. Sie können nicht deaktiviert werden.',
            analytics: 'Analyse-Cookies',
            analyticsDesc: 'Diese Cookies helfen uns zu verstehen, wie Besucher mit unserer Website interagieren, indem sie anonym Informationen sammeln und berichten.',
            marketing: 'Marketing-Cookies',
            marketingDesc: 'Diese Cookies werden verwendet, um Besucher über Websites hinweg zu verfolgen und relevante Werbung anzuzeigen.',
            
            alwaysActive: 'Immer aktiv'
        }
    };
    
    // Detect language from URL or default to English
    function detectLanguage() {
        const path = window.location.pathname;
        if (path.includes('/nl/')) return 'nl';
        if (path.includes('/de/')) return 'de';
        return 'en';
    }
    
    const currentLang = detectLanguage();
    const t = translations[currentLang];
    
    // Cookie categories
    const cookiePreferences = {
        necessary: true,  // Always true, can't be disabled
        analytics: true,
        marketing: true
    };
    
    // Get cookie value
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }
    
    // Set cookie
    function setCookie(name, value, days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = `expires=${date.toUTCString()}`;
        document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`;
    }
    
    // Save preferences
    function savePreferences() {
        const prefsString = JSON.stringify(cookiePreferences);
        setCookie(COOKIE_NAME, prefsString, COOKIE_EXPIRY_DAYS);
        console.log('✅ Cookie preferences saved:', cookiePreferences);
    }
    
    // Load preferences
    function loadPreferences() {
        const saved = getCookie(COOKIE_NAME);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                Object.assign(cookiePreferences, parsed);
                cookiePreferences.necessary = true; // Always true
                return true;
            } catch (e) {
                console.error('Error parsing cookie preferences:', e);
            }
        }
        return false;
    }
    
    // Initialize Google Analytics if consented
    function initializeGoogleAnalytics() {
        if (!cookiePreferences.analytics) {
            console.log('ℹ️ Google Analytics not initialized (no consent)');
            return;
        }
        
        // Replace with your Google Analytics ID
        const GA_ID = 'G-PTRDSRVR21'; // TODO: Add your Google Analytics ID here
        
        // Check if already loaded
        if (window.gtag) {
            console.log('ℹ️ Google Analytics already loaded');
            return;
        }
        
        // Load Google Analytics
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
        document.head.appendChild(script);
        
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        window.gtag = gtag;
        
        gtag('js', new Date());
        gtag('config', GA_ID, {
            'anonymize_ip': true,  // GDPR compliance
            'cookie_flags': 'SameSite=Lax;Secure'
        });
        
        console.log('✅ Google Analytics initialized');
    }
    
    // Apply preferences (load tracking scripts)
    function applyPreferences() {
        if (cookiePreferences.analytics) {
            initializeGoogleAnalytics();
        }
        
        // Add more tracking scripts here as needed
        // if (cookiePreferences.marketing) {
        //     initializeFacebookPixel();
        // }
    }
    
    // Create banner HTML
    function createBanner() {
        const banner = document.createElement('div');
        banner.className = 'cookie-consent-banner';
        banner.setAttribute('role', 'dialog');
        banner.setAttribute('aria-label', 'Cookie consent');
        banner.setAttribute('aria-live', 'polite');
        
        banner.innerHTML = `
            <div class="cookie-consent-content">
                <div class="cookie-consent-header">
                    <h2 class="cookie-consent-title">${t.title}</h2>
                </div>
                <p class="cookie-consent-text">
                    ${t.description}
                </p>
                <div class="cookie-consent-buttons">
                    <button class="cookie-btn cookie-btn-primary" id="cookie-accept-all">
                        ${t.acceptAll}
                    </button>
                    <button class="cookie-btn cookie-btn-secondary" id="cookie-customize">
                        ${t.customize}
                    </button>
                    <button class="cookie-btn cookie-btn-tertiary" id="cookie-reject-all">
                        ${t.rejectAll}
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(banner);
        return banner;
    }
    
    // Create customize modal HTML
    function createCustomizeModal() {
        const modal = document.createElement('div');
        modal.className = 'cookie-customize-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-labelledby', 'cookie-customize-title');
        modal.setAttribute('aria-modal', 'true');
        
        modal.innerHTML = `
            <div class="cookie-customize-content">
                <div class="cookie-customize-header">
                    <h2 class="cookie-customize-title" id="cookie-customize-title">${t.customizeTitle}</h2>
                    <button class="cookie-close" id="cookie-customize-close" aria-label="Close">×</button>
                </div>
                
                <div class="cookie-category">
                    <div class="cookie-category-header">
                        <h3 class="cookie-category-title">${t.necessary}</h3>
                        <span style="font-size: 0.9rem; color: var(--gray, #666);">${t.alwaysActive}</span>
                    </div>
                    <p class="cookie-category-description">${t.necessaryDesc}</p>
                </div>
                
                <div class="cookie-category">
                    <div class="cookie-category-header">
                        <h3 class="cookie-category-title">${t.analytics}</h3>
                        <label class="cookie-toggle">
                            <input type="checkbox" id="cookie-analytics" ${cookiePreferences.analytics ? 'checked' : ''}>
                            <span class="cookie-toggle-slider"></span>
                        </label>
                    </div>
                    <p class="cookie-category-description">${t.analyticsDesc}</p>
                </div>
                
                <div class="cookie-category">
                    <div class="cookie-category-header">
                        <h3 class="cookie-category-title">${t.marketing}</h3>
                        <label class="cookie-toggle">
                            <input type="checkbox" id="cookie-marketing" ${cookiePreferences.marketing ? 'checked' : ''}>
                            <span class="cookie-toggle-slider"></span>
                        </label>
                    </div>
                    <p class="cookie-category-description">${t.marketingDesc}</p>
                </div>
                
                <div class="cookie-customize-buttons">
                    <button class="cookie-btn cookie-btn-primary" id="cookie-save-preferences">
                        ${t.acceptSelected}
                    </button>
                    <button class="cookie-btn cookie-btn-secondary" id="cookie-customize-cancel">
                        ${t.rejectAll}
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        return modal;
    }
    
    // Show banner
    function showBanner(banner) {
        banner.classList.add('show');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }
    
    // Hide banner
    function hideBanner(banner) {
        banner.classList.remove('show');
        document.body.style.overflow = ''; // Restore scrolling
    }
    
    // Show customize modal
    function showCustomizeModal(modal) {
        modal.classList.add('show');
        
        // Update toggle states
        document.getElementById('cookie-analytics').checked = cookiePreferences.analytics;
        document.getElementById('cookie-marketing').checked = cookiePreferences.marketing;
    }
    
    // Hide customize modal
    function hideCustomizeModal(modal) {
        modal.classList.remove('show');
    }
    
    // Accept all cookies
    function acceptAll(banner) {
        cookiePreferences.analytics = true;
        cookiePreferences.marketing = true;
        savePreferences();
        applyPreferences();
        hideBanner(banner);
    }
    
    // Reject all cookies (except necessary)
    function rejectAll(banner, modal) {
        cookiePreferences.analytics = false;
        cookiePreferences.marketing = false;
        savePreferences();
        hideBanner(banner);
        if (modal) hideCustomizeModal(modal);
    }
    
    // Save custom preferences
    function saveCustomPreferences(banner, modal) {
        cookiePreferences.analytics = document.getElementById('cookie-analytics').checked;
        cookiePreferences.marketing = document.getElementById('cookie-marketing').checked;
        savePreferences();
        applyPreferences();
        hideCustomizeModal(modal);
        hideBanner(banner);
    }
    
    // Initialize cookie consent
    function init() {
        // Check if user has already made a choice
        const hasConsent = loadPreferences();
        
        if (hasConsent) {
            // User already made a choice, apply preferences
            applyPreferences();
            console.log('✅ Cookie preferences loaded:', cookiePreferences);
            return;
        }
        
        // Show banner if no consent yet
        const banner = createBanner();
        const modal = createCustomizeModal();
        
        // Show banner after a short delay
        setTimeout(() => showBanner(banner), 500);
        
        // Event listeners
        document.getElementById('cookie-accept-all').addEventListener('click', () => {
            acceptAll(banner);
        });
        
        document.getElementById('cookie-reject-all').addEventListener('click', () => {
            rejectAll(banner, null);
        });
        
        document.getElementById('cookie-customize').addEventListener('click', () => {
            showCustomizeModal(modal);
        });
        
        document.getElementById('cookie-customize-close').addEventListener('click', () => {
            hideCustomizeModal(modal);
        });
        
        document.getElementById('cookie-save-preferences').addEventListener('click', () => {
            saveCustomPreferences(banner, modal);
        });
        
        document.getElementById('cookie-customize-cancel').addEventListener('click', () => {
            rejectAll(banner, modal);
        });
        
        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideCustomizeModal(modal);
            }
        });
        
        // Keyboard accessibility - ESC to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('show')) {
                hideCustomizeModal(modal);
            }
        });
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();
