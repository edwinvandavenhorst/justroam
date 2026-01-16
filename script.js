// ============================================
// CENTRALIZED LINK MANAGEMENT
// ============================================
// Update all your links in ONE place - right here!

// ===== YOUR LINKS - UPDATE THESE =====
const LINKS = {
    goboony: 'https://www.goboony.nl/campers/nederland/zuid-holland/voorburg/92756',
    instagram: 'https://instagram.com/_justroam_',
    linktree: 'https://linktr.ee/_justroam_',
    email: 'info@justroam.nl',
    phone: '+31611334832',
    phoneLink: 'tel:+31611334832'  // Same as phone but formatted for tel: links
};

document.addEventListener('DOMContentLoaded', function() {
    
    // ===== GOBOONY LINKS =====
    // Updates all "Book on Goboony" buttons across the site
    document.querySelectorAll('.btn-goboony').forEach(link => {
        link.href = LINKS.goboony;
        console.log('Updated Goboony button:', link.href);
    });
    
    // Also update any text that says "Book on Goboony" or similar
    document.querySelectorAll('a').forEach(link => {
        const text = link.textContent.toLowerCase();
        if (text.includes('book on goboony') || text.includes('goboony')) {
            if (link.getAttribute('href') === '#' || link.href.endsWith('#')) {
                link.href = LINKS.goboony;
                console.log('Updated Goboony text link:', link.href);
            }
        }
    });
    
    // ===== INSTAGRAM LINKS =====
    // Updates all Instagram links
    document.querySelectorAll('a').forEach(link => {
        const text = link.textContent.toLowerCase();
        // Check if it's an Instagram link by text content
        if (text.includes('instagram') || (text.includes('@') && text.includes('justroam'))) {
            // Update if href is # or ends with # (works with local files too)
            if (link.getAttribute('href') === '#' || link.href.endsWith('#')) {
                link.href = LINKS.instagram;
            }
        }
    });
    
    // ===== LINKTREE LINKS =====
    // Updates all Linktree links
    document.querySelectorAll('a').forEach(link => {
        const text = link.textContent.toLowerCase();
        if (text.includes('linktree')) {
            if (link.getAttribute('href') === '#' || link.href.endsWith('#')) {
                link.href = LINKS.linktree;
            }
        }
    });
    
    // ===== EMAIL LINKS =====
    // Updates all email addresses and mailto links
    document.querySelectorAll('a[href*="mailto"]').forEach(link => {
        link.href = 'mailto:' + LINKS.email;
        if (link.textContent.includes('example.com')) {
            link.textContent = LINKS.email;
        }
    });
    
    // ===== PHONE LINKS =====
    // Updates all phone number links
    document.querySelectorAll('a[href*="tel"]').forEach(link => {
        link.href = LINKS.phoneLink;
        if (link.textContent.includes('1234 5678')) {
            link.textContent = LINKS.phone;
        }
    });
    
    console.log('✅ All links updated successfully!');
    console.log('Goboony:', LINKS.goboony);
    console.log('Instagram:', LINKS.instagram);
    console.log('Linktree:', LINKS.linktree);
});

function getActiveLang() {
    const stored = localStorage.getItem('lang');
    if (stored === 'en' || stored === 'nl') {
        return stored;
    }

    return navigator.language &&
           navigator.language.toLowerCase().startsWith('nl')
           ? 'nl'
           : 'en';
}


// ============================================
// NAVIGATION - TRANSLATIONS
// ============================================

function isNlPage() {
  return window.location.pathname.includes('/nl/');
}

function getCurrentPageFilename() {
  return window.location.pathname.split('/').pop() || 'index.html';
}

function getActiveLang() {
  // If you're switching pages (/nl/ vs root), path is the source of truth
  return isNlPage() ? 'nl' : 'en';
}

const NAV_TEXT = {
  en: {
    home: 'Home',
    rent: 'Rent a truck',
    build: 'Build your truck',
    stories: 'Our stories',
    faq: 'FAQs',
    contact: 'Get in touch'
  },
  nl: {
    home: 'Home',              // or "Start" if you prefer
    rent: 'Huur een truck',
    build: 'Bouw je truck',    // or "Truck ombouwen"
    stories: 'Onze verhalen',
    faq: 'Veelgestelde vragen',
    contact: 'Neem contact op'
  }
};


// ============================================
// NAVIGATION - CENTRALIZED
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const currentPage = getCurrentPageFilename();
    const lang = getActiveLang();        // 'en' or 'nl'
    const t = NAV_TEXT[lang];
    
    const onNl = window.location.pathname.includes('/nl/');
    const pagePrefix = onNl ? './' : '';
    const imgPrefix = onNl ? '../' : '';


    // Navigation structure
    const navHTML = `
    <div class="nav-container">
      <a href="${pagePrefix}index.html" class="nav-logo">
        <img src="${imgPrefix}images/Logo_JustRoam.svg" alt="JustRoam Logo" class="logo-img">
      </a>

      <ul class="nav-menu">
        <li><a href="${pagePrefix}index.html" class="nav-link ${currentPage === 'index.html' ? 'active' : ''}">${t.home}</a></li>
        <li><a href="${pagePrefix}rent.html" class="nav-link ${currentPage === 'rent.html' ? 'active' : ''}">${t.rent}</a></li>
        <li><a href="${pagePrefix}build.html" class="nav-link ${currentPage === 'build.html' ? 'active' : ''}">${t.build}</a></li>
        <li><a href="${pagePrefix}stories.html" class="nav-link ${currentPage === 'stories.html' ? 'active' : ''}">${t.stories}</a></li>
        <li><a href="${pagePrefix}faq.html" class="nav-link ${currentPage === 'faq.html' ? 'active' : ''}">${t.faq}</a></li>
        <li><a href="${pagePrefix}contact.html" class="nav-link ${currentPage === 'contact.html' ? 'active' : ''}">${t.contact}</a></li>

        <li class="nav-lang-item">
            <div class="lang-switch lang-switch--mobile" aria-label="Language selector">
                <a href="#" class="lang-link" data-lang="en" aria-label="Switch to English">EN</a>
                <span class="lang-separator">|</span>
                <a href="#" class="lang-link" data-lang="nl" aria-label="Switch to Dutch">NL</a>
            </div>
            </li>
      </ul>
            
            <div class="nav-social">
                <a href="https://www.instagram.com/_justroam_/" class="nav-instagram" target="_blank" title="Follow us on Instagram">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" fill="currentColor"/>
                </svg>
                </a>
                
                <div class="lang-switch lang-switch--desktop">
                    <a href="#" class="lang-link" data-lang="en" aria-label="Switch to English">EN</a>
                    <span class="lang-separator">|</span>
                    <a href="#" class="lang-link" data-lang="nl" aria-label="Switch to Dutch">NL</a>
                </div>
            </div>
            
                <div class="hamburger">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
        </div>
    `;
    
    // Insert navigation into the page
    const navElement = document.getElementById('main-nav');
    if (navElement) {
    navElement.innerHTML = navHTML;
    initLanguageSwitch(); // <-- IMPORTANT: after injection
}

});

// ============================================
// LANGUAGE SWITCH (DESKTOP)
// ============================================

function initLanguageSwitch() {
    const langLinks = document.querySelectorAll('.lang-link');
    if (!langLinks.length) {
        console.warn('No .lang-link elements found (nav not injected yet?)');
        return;
    }

 /*   const savedLang = localStorage.getItem('lang');
    const browserLang = (navigator.language || '').toLowerCase().startsWith('nl') ? 'nl' : 'en';
    const activeLang = (savedLang === 'nl' || savedLang === 'en') ? savedLang : browserLang;
*/
    const onNlSite = window.location.pathname.includes('/nl/');
    const activeLang = onNlSite ? 'nl' : 'en';

    // Highlight active language
    langLinks.forEach(link => {
        link.classList.toggle('active', link.dataset.lang === activeLang);
    });

    // Handle manual switch
    langLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const lang = this.dataset.lang;
            localStorage.setItem('lang', lang);

            const file = window.location.pathname.split('/').pop() || 'index.html';
            const currentlyNl = window.location.pathname.includes('/nl/');

            // Use relative navigation (safe for GitHub Pages + custom domains)
            if (lang === 'nl') {
                window.location.href = currentlyNl ? file : `nl/${file}`;
            } else {
                window.location.href = currentlyNl ? `../${file}` : file;
            }
        });
    });
}

// ============================================
// FOOTER - CENTRALIZED 
// ============================================

function isNlPage() {
  return window.location.pathname.includes('/nl/');
}

function getFooterText() {
  return isNlPage()
    ? {
        contactTitle: 'Contactgegevens',
        instagram: 'Volg ons op Instagram',
        rights: 'Alle rechten voorbehouden.'
      }
    : {
        contactTitle: 'Contact details',
        instagram: 'Follow us on Instagram',
        rights: 'All rights reserved.'
      };
}

document.addEventListener('DOMContentLoaded', function () {
  const t = getFooterText();

  // On /nl/* pages we must go up one level for assets and page links
  const prefix = isNlPage() ? '../' : '';

  const footerHTML = `
    <div class="container">
      <div class="footer-content">
        <a href="${prefix}index.html" class="footer-logo">
          <img src="${prefix}images/Logo_JustRoam_notext.svg" alt="JustRoam Logo" class="footer-img">
        </a>

        <div class="footer-section">
          <h3>${t.contactTitle}</h3>
          <ul class="footer-links">
            <li>
              <div class="footer-nolink">
                <img src="${prefix}images/building.png" alt="Building icon">
                <span>KVK: 71621865</span>
              </div>
            </li>

            <li>
              <a href="mailto:info@justroam.nl" class="footer-link" title="Contact us">
                <img src="${prefix}images/mail.png" alt="Email icon">
                <span>info@justroam.nl</span>
              </a>
            </li>

            <li>
              <a href="tel:+31611334832" class="footer-link">
                <img src="${prefix}images/phone.png" alt="Phone icon">
                <span>+31 6 1133 4832</span>
              </a>
            </li>

            <li>
              <a href="https://www.instagram.com/_justroam_/" class="footer-link" target="_blank" rel="noopener" title="Follow us on Instagram">
                <img src="${prefix}images/instagram.png" alt="Instagram icon">
                <span>${t.instagram}</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div class="footer-bottom">
        <p>&copy; JustRoam. ${t.rights}</p>
      </div>
    </div>
  `;

  const footerElement = document.getElementById('main-footer');
  if (footerElement) {
    footerElement.innerHTML = footerHTML;
  } else {
    console.warn('⚠️ Footer placeholder not found. Add: <footer id="main-footer"></footer>');
  }
});


// ============================================
// MOBILE NAVIGATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            
            // Animate hamburger
            hamburger.classList.toggle('active');
        });
        
        // Close menu when clicking a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            });
        });
    }
});

// ============================================
// IMAGE GALLERY (Rent Page)
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const thumbnails = document.querySelectorAll('.thumbnail');
    const mainImage = document.getElementById('mainImage');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    let currentIndex = 0;
    
    // Show/hide arrows based on position (defined early so we can call it on init)
    function updateArrowVisibility() {
        if (prevBtn) {
            prevBtn.style.display = currentIndex === 0 ? 'none' : 'block';
        }
        if (nextBtn) {
            nextBtn.style.display = currentIndex === thumbnails.length - 1 ? 'none' : 'block';
        }
    }
    
    if (thumbnails.length > 0 && mainImage) {
        // Initial state - hide left arrow on first image
        updateArrowVisibility();
        
        // Thumbnail clicks
        thumbnails.forEach((thumbnail, index) => {
            thumbnail.addEventListener('click', function(e) {
                e.preventDefault(); // Prevent any default anchor behavior
                currentIndex = index;
                updateGallery();
                
                // Scroll main image into view smoothly
                if (mainImage) {
                    mainImage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            });
        });
        
        // Previous button
        if (prevBtn) {
            prevBtn.addEventListener('click', function(e) {
                e.preventDefault();
                if (currentIndex > 0) {
                    currentIndex--;
                    updateGallery();
                }
            });
        }
        
        // Next button
        if (nextBtn) {
            nextBtn.addEventListener('click', function(e) {
                e.preventDefault();
                if (currentIndex < thumbnails.length - 1) {
                    currentIndex++;
                    updateGallery();
                }
            });
        }
        
        // Update gallery function
        function updateGallery() {
            // Remove active class from all thumbnails
            thumbnails.forEach(thumb => thumb.classList.remove('active'));
        
            // Add active class to current thumbnail
            thumbnails[currentIndex].classList.add('active');
        
            // Get image attributes
            const newImageSrc = thumbnails[currentIndex].getAttribute('data-image');
            const newPosition = thumbnails[currentIndex].getAttribute('data-position');
            const newZoom = thumbnails[currentIndex].getAttribute('data-zoom');
            const orientation = thumbnails[currentIndex].getAttribute('data-orientation');
        
            // Update image source
            if (newImageSrc) {
                mainImage.src = newImageSrc;
            }
        
            // Update image zoom if specified
            if (newZoom) {
                mainImage.style.transform = `scale(${newZoom})`;
            } else {
                mainImage.style.transform = 'scale(1)';
            }

            // Handle portrait vs landscape orientation
            if (orientation === 'portrait') {
                mainImage.style.objectFit = 'contain';
                mainImage.style.objectPosition = 'center';
                mainImage.style.backgroundColor = '#f8f8f8';
            } else {
                mainImage.style.objectFit = 'cover';
                mainImage.style.backgroundColor = '';
                
                // Update position ONLY for landscape images
                if (newPosition) {
                    mainImage.style.objectPosition = newPosition;
                } else {
                    mainImage.style.objectPosition = 'center';
                }
            }

            // Update arrow visibility
            updateArrowVisibility();
        }
        
        // Keyboard navigation
        document.addEventListener('keydown', function(e) {
            if (e.key === 'ArrowLeft' && currentIndex > 0) {
                prevBtn?.click();
            } else if (e.key === 'ArrowRight' && currentIndex < thumbnails.length - 1) {
                nextBtn?.click();
            }
        });
    }
});

// ============================================
// AVAILABILITY CALENDAR WITH ICAL & PRICING
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const calendarDays = document.getElementById('calendarDays');
    const currentMonthElement = document.getElementById('currentMonth');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    
    
    if (!calendarDays) return; // Only run on rent page
   
    // Locale based on site (English root vs /nl/)
    const locale = window.location.pathname.includes('/nl/') ? 'nl-NL' : 'en-GB';
    
    let currentDate = new Date();
    let displayMonth = currentDate.getMonth();
    let displayYear = currentDate.getFullYear();
    
    // Data storage
    let pricingData = null;
    let bookedDates = [];
    
    // iCal URL
    const icalUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent('https://calendar.justroam.nl/ranger');
    
    // Initialize calendar
    async function initCalendar() {
        await loadPricingData();
        await loadICalData();
        renderCalendar();
    }
    
    // Load pricing from JSON
    // Load pricing from JSON
    async function loadPricingData() {
        try {
            // Detect if we're in a subdirectory (like /nl/)
            const isSubdirectory = window.location.pathname.includes('/nl/');
            const pricingPath = isSubdirectory ? '../pricing.json' : 'pricing.json';
            
            const response = await fetch(pricingPath);
            pricingData = await response.json();
            console.log('✅ Pricing loaded from:', pricingPath, pricingData);
        } catch (error) {
            console.error('❌ Could not load pricing.json:', error);
            // Fallback pricing
            pricingData = {
                seasons: [
                    { name: 'Default', startDate: '2020-01-01', endDate: '2030-12-31', dailyRate: 125 }
                ]
            };
        }
    }
    
    // Load iCal data
    async function loadICalData() {
        try {
            // Note: Direct iCal fetching might have CORS issues
            // You may need a proxy or server-side solution
            const response = await fetch(icalUrl);
            const icalText = await response.text();
            bookedDates = parseICalData(icalText);
            console.log('✅ iCal loaded, found booked dates:', bookedDates.length);
        } catch (error) {
            console.error('❌ Could not load iCal (might be CORS):', error);
            console.log('ℹ️ Calendar will show all dates as available');
            bookedDates = [];
        }
    }
    
    // Simple iCal parser - extracts booked date ranges
    function parseICalData(icalText) {
        const booked = [];
        const events = icalText.split('BEGIN:VEVENT');
        
        events.forEach(event => {
            if (!event.includes('END:VEVENT')) return;
            
            // Extract DTSTART and DTEND
            const dtStartMatch = event.match(/DTSTART[;:].*?(\d{8})/);
            const dtEndMatch = event.match(/DTEND[;:].*?(\d{8})/);
            
            if (dtStartMatch && dtEndMatch) {
                const startDate = parseICalDate(dtStartMatch[1]);
                const endDate = parseICalDate(dtEndMatch[1]);
                
                // Add all dates in range
                const current = new Date(startDate);
                while (current <= endDate) {
                    booked.push(current.toISOString().split('T')[0]);
                    current.setDate(current.getDate() + 1);
                }
            }
        });
        
        return booked;
    }
    
    // Parse iCal date format (YYYYMMDD) to Date object
    function parseICalDate(dateStr) {
        const year = parseInt(dateStr.substring(0, 4));
        const month = parseInt(dateStr.substring(4, 6)) - 1;
        const day = parseInt(dateStr.substring(6, 8));
        return new Date(year, month, day);
    }
    
    // Get price for a specific date from pricing.json
    function getPrice(date) {
        if (!pricingData || !pricingData.seasons) return 125;
        
        const dateStr = date.toISOString().split('T')[0];
        
        // Check each season
        for (const season of pricingData.seasons) {
            if (dateStr >= season.startDate && dateStr <= season.endDate) {
                return season.dailyRate;
            }
        }
        
        // Default to first season's rate if no match
        return pricingData.seasons[0]?.dailyRate || 125;
    }
    
    // Check if date is booked (from iCal)
    function isBooked(date) {
        const dateStr = date.toISOString().split('T')[0];
        return bookedDates.includes(dateStr);
    }
    
    // Check if date is today
    function isToday(date) {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }
    
    // Check if date is in the past
    function isPast(date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
    }
    
    // Render the calendar
    function renderCalendar() {
        // Clear calendar
        calendarDays.innerHTML = '';
        
/*        // Set month/year header
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        currentMonthElement.textContent = `${monthNames[displayMonth]} ${displayYear}`;
*/

        // Set month/year header (localized)
        const monthDate = new Date(displayYear, displayMonth, 1);
        let label = monthDate.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
        currentMonthElement.textContent = label;

        // Get first and last day of month
        const firstDay = new Date(displayYear, displayMonth, 1);
        const lastDay = new Date(displayYear, displayMonth + 1, 0);
        
        // Get day of week (0 = Sunday, adjust to Monday = 0)
        let startDay = firstDay.getDay() - 1;
        if (startDay === -1) startDay = 6; // Sunday becomes 6
        
        // Get last day of previous month
        const prevMonthLastDay = new Date(displayYear, displayMonth, 0).getDate();
        
        // Add days from previous month
        for (let i = startDay - 1; i >= 0; i--) {
            const prevDate = new Date(displayYear, displayMonth - 1, prevMonthLastDay - i);
            const dayElement = createDayElement(prevDate, true);
            calendarDays.appendChild(dayElement);
        }
        
        // Add days of current month
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const date = new Date(displayYear, displayMonth, day);
            const dayElement = createDayElement(date, false);
            calendarDays.appendChild(dayElement);
        }
        
        // Add days from next month only to complete the last week
        const totalCells = calendarDays.children.length;
        const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
        
        for (let day = 1; day <= remainingCells; day++) {
            const nextDate = new Date(displayYear, displayMonth + 1, day);
            const dayElement = createDayElement(nextDate, true);
            calendarDays.appendChild(dayElement);
        }
    }

    // Helper function to create a day element
    function createDayElement(date, isOtherMonth) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        
        // Add other-month class if needed
        if (isOtherMonth) {
            dayElement.classList.add('other-month');
        }
        
        // Check status
        const past = isPast(date);
        const booked = isBooked(date);
        const today = isToday(date);
        
        if (today) {
            dayElement.classList.add('today');
        } else if (past) {
            dayElement.classList.add('past');
        } else if (booked) {
            dayElement.classList.add('booked');
        } else if (!isOtherMonth) {
            dayElement.classList.add('available');
        }
        
        // Add day number
        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = date.getDate();
        dayElement.appendChild(dayNumber);
        
        // Add price (only for available future dates in current month)
        if (!booked && !past && !isOtherMonth) {
            const price = document.createElement('div');
            price.className = 'day-price';
            price.textContent = `€${getPrice(date)}`;
            dayElement.appendChild(price);
        }
        
        return dayElement;
    }
    
    // Navigation buttons
    if (prevMonthBtn) {
        prevMonthBtn.addEventListener('click', function() {
            displayMonth--;
            if (displayMonth < 0) {
                displayMonth = 11;
                displayYear--;
            }
            renderCalendar();
        });
    }
    
    if (nextMonthBtn) {
        nextMonthBtn.addEventListener('click', function() {
            displayMonth++;
            if (displayMonth > 11) {
                displayMonth = 0;
                displayYear++;
            }
            renderCalendar();
        });
    }
    
    // Initialize
    initCalendar();
});


// ============================================
// CONTACT FORM HANDLING
// ============================================

// Populate contact information dynamically
function populateContactInfo() {
    // Email
    const emailElement = document.getElementById('contact-email');
    if (emailElement) {
        emailElement.href = `mailto:${LINKS.email}`;
        emailElement.textContent = LINKS.email;
    }
    
    // Phone
    const phoneElement = document.getElementById('contact-phone');
    if (phoneElement) {
        phoneElement.href = LINKS.phoneLink;
        phoneElement.textContent = LINKS.phone;
    }
}

// Run on page load
document.addEventListener('DOMContentLoaded', populateContactInfo);


// ============================================
// SMOOTH SCROLLING
// ============================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    // Skip external link buttons
    if (anchor.classList.contains('btn-goboony') || 
        anchor.classList.contains('social-link-card')) {
        return;
    }
    
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        // Only apply smooth scrolling to actual anchor links (starting with #)
        // Skip if it's been updated to an external URL
        if (href && href.startsWith('#') && href.length > 1) {
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// ============================================
// CALENDAR PLACEHOLDER (Rent Page)
// ============================================

// This is a placeholder for calendar integration
// You can integrate with services like:
// - FullCalendar.js
// - flatpickr
// - Your Goboony calendar API
// - Custom calendar solution

document.addEventListener('DOMContentLoaded', function() {
    const calendarContainer = document.getElementById('calendar');
    
    if (calendarContainer) {
        // Initialize your calendar here
        // Example with a simple message:
        console.log('Calendar container ready for integration');
        
        // Example integration with FullCalendar:
        /*
        const calendar = new FullCalendar.Calendar(calendarContainer, {
            initialView: 'dayGridMonth',
            events: [
                // Your booked dates
            ],
            dateClick: function(info) {
                // Handle date click
            }
        });
        calendar.render();
        */
    }
});

// ============================================
// SCROLL ANIMATIONS (Optional Enhancement)
// ============================================

// Add smooth reveal animations when scrolling
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', function() {
    const animatedElements = document.querySelectorAll(
        '.feature-card, .product-card, .blog-card, .faq-item, .info-card'
    );
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});



// ============================================
// POPULATE CONTACT INFO
// ============================================
function populateContactInfo() {
    // Email
    const emailElement = document.getElementById('contact-email');
    if (emailElement) {
        emailElement.href = `mailto:${LINKS.email}`;
        emailElement.textContent = LINKS.email;
    }
    
    // Phone
    const phoneElement = document.getElementById('contact-phone');
    if (phoneElement) {
        phoneElement.href = LINKS.phoneLink;
        phoneElement.textContent = LINKS.phone;
    }
}

// ============================================
// FAQ ACCORDION
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // Handle category title clicks
    const categoryTitles = document.querySelectorAll('.faq-category-title');
    
    categoryTitles.forEach(title => {
        title.addEventListener('click', function() {
            const category = this.parentElement;
            const icon = this.querySelector('.category-icon');
            
            // Toggle collapsed state
            category.classList.toggle('collapsed');
            
            // Change icon text
            if (category.classList.contains('collapsed')) {
                icon.textContent = '+';
            } else {
                icon.textContent = '−';
            }
        });
    });
});

// ============================================
// BUILD PAGE - TIMELINE GALLERY
// ============================================

document.addEventListener('DOMContentLoaded', function () {
    const timelineEl = document.getElementById('buildTimeline');
    const jumpEl = document.getElementById('buildJump');
    const lang = getSiteLang();
    const assetPrefix = getAssetPrefix();

    // Only run on build.html
    if (!timelineEl) return;

    function getSiteLang() {
        const path = window.location.pathname;
        if (path.includes('/nl/')) return 'nl';
        if (path.includes('/de/')) return 'de'; // future
        return 'en';
        }

    // If you're in /nl/ or /de/, your images folder is one level up
    function getAssetPrefix() {
        const path = window.location.pathname;
        return (path.includes('/nl/') || path.includes('/de/')) ? '../' : '';
    }

    // --- Configure your timeline here ---
    // Assumes images are named IMG_1.jpeg ... IMG_49.jpeg inside /images
/*    const BUILD_PHASES = [
  {
    id: 'stock',
    title: 'Start of the journey: buying the truck',
    note: '',
    images: [1, 2, 3, 4],
    richContent: `
        <div class="build-rich-content">
            <h4>💡 Decision point</h4>
            <p>We needed a double-cab pickup (4 seats) to make sure we could use the truck for our family trips. Finding a truck that met these requirements was hard as most Dutch pickups have deleted backseats due to tax incentives. Add our budget and we could select from just a few trucks, ultimately landing on our Ford Ranger.</p>
            <h4>🌲 The bigger mission</h4>
            <p>Beyond family travel, this truck enables nature disconnect retreats—small group experiences where we leave phones, notifications, and daily distractions behind. The 4-person capacity allows us to guide intimate groups into remote places for genuine rest and reconnection with nature.</p>
        </div>
    `
  },
  {
    id: 'step-1-remove-tonneau',
    title: 'Step 1: Remove tonneau cover & add canopy',
    note: '',
    images: [5,6,7],
    richContent: `
        <div class="build-rich-content">
            <h4>The first step was simple</h4>
            <p>Dipping my toe into this truck conversion was luckily the easiest part. A couple of bolts and the tonneau cover and roll-bar were gone. Off to the next assignment.</p>
            <H4>💡 Decision point</h4>
            <p>Sourcing the aluminum canopy was straightforward. We chose the Bushtech based on availability. The dealer was incredibly supportive: Installation at their shop was possible, I got help from the dealer in putting it on the car using their forklift. From there, with a final check up from the dealer, I mounted the canopy. </p>
        </div>
    `
  },
  
  {
    id: 'step-2-upgrade-lights',
    title: 'Step 2: Upgrade lights and install winch',
    note: '',
    images: [8, 9, 15, 16, 17, 18, 54, 19],
    richContent: `
        <div class="build-rich-content">
            <h4>💡 Decision point</h4>
            <p><strong>✓ LED headlights: </strong>Upgrading from halogen to LED was straightforward and offered significantly more light and visibility at night.</p>
            <p><strong>✓ Auxiliary lights in grill: </strong>We wanted to keep the stock bumper and grill, so integrating auxiliary lights into the grill mesh was the cleanest option. The result really completed the front-end look.</p>
            <p><strong>✓ Winch installation: </strong> We wanted to make sure that the truck was able for self-recovery in remote areas. Essential safety equipment for off-road travel and getting unstuck when there's no one around to help.<p>
            <h4>📚 Learnings</h4>
            <p><b>Sequence matters: </b>I installed the lights first, then had to remove the bumper again weeks later to fit the winch. Next time, I'd do both upgrades in one session. This would have saved hours of work</p>
        </div> 
    `
  },
    {
    id: 'step-3-install-snorkel',
    title: 'Step 3: Install snorkel',
    note: '',
    images: [10, 11],
    richContent: `
        <div class="build-rich-content">
            <h4>💡 Decision point</h4>
            <p>The snorkel provides security for water crossings—essential for remote travel. We went with a quality brand because it's constantly exposed to UV rays. Cheaping out might save a bit, but a cracked snorkel leading to water ingestion could cost thousands in engine damage.</p>
        </div> 
    `
    },

  {
    id: 'step-4-install-water-tank',
    title: 'Step 4: Install water tank',
    note: '',
    images: [12, 13],
    richContent: `
        <div class="build-rich-content">
            <h4>💡 Decision point</h4>
            <p>✓ We initially wanted an 80l tank positioned above the wheel arch. When it arrived, it was way too large and would've dominated the interior space. After searching alternatives, we found a 50l flat tank that fits perfectly. It fits the space well and is not intrusive for the rest of the interior.</p>
            <p>✓ We decided to not install any water level gauge to keep it simple. We just fill up when we can and so far we haven't ran out of water.</p>
            <p>✓ We installed a heating pad to prevent freezing in winter conditions. Essential for protecting both the tank and pump when camping in sub-zero temperatures.</p>
        </div>
    `
  },
  {
    id: 'step-5-install-electrical',
    title: 'Step 5: Install electrical system',
    note: '',
    images: [51, 14, 20, 53, 49, 52],
    richContent: `
        <div class="build-rich-content">
            <h4>📚 Learnings</h4>
            <p><b>✓ Map out all power needs before buying components.</b> Taking time to plan upfront saved me from buying and rebuying connectors and switches.</p>
            <p><b>✓ Double-check every crimp: </b>A loose connection can cause failures that are hard to diagnose later. Use proper crimping tools and test each connection before closing everything up.</p>
            <p><b>✓ Pull all wires at once: </b>Run cables from battery to front in one session to avoid missing connections or having to disassemble panels multiple times.</p>
        </div>
    `
  },
  {
    id: 'step-6-build-interior',
    title: 'Step 6: Build interior',
    note: '',
    images: [21, 31, 32, 38, 39, 40, 55, 56, 57],
    richContent: `
        <div class="build-rich-content">    
            <h4>📚 Learnings</h4>
                <p><b>✓ Decide what wood to use: </b>the type of wood used is essential in how strong the construction is and if it can withstand the weather.</p>
                <p><b>✓ Measure everything twice (or three times): </b> I didn't have exact dimensions for the fridge, cooker, and drawer sliders before building. This meant rebuilding sections multiple times to get everything to fit—wasted wood and hours of work.</p>
                <p><b>✓ Get the right sliders: </b>I bought too light of sliders which resulted in broken sliders after the first offroad trip. After that trip, I had to make upgrades and modifications plus spend more money</p>
                <p><b>✓ Test ergonomics before finalizing: </b>Solar panels under the kitchen seemed smart until the suspension lift made everything too high to reach comfortably. Learned this on the first trip and had to rebuild the entire layout. Lesson: mock up the full setup with actual heights before committing.</p>
        </div>
    `
  },
  
  {
    id: 'step-7-place-roof-tents',
    title: 'Step 7: Place roof tents',
    note: '',
    images: [23, 24, 25, 26, 27, 28, 29, 30],
    richContent: `
        <div class="build-rich-content">    
            <h4>💡 Decision points</h4>
                <p><b>✓ 1 versus 2 tents: </b>We chose 2 tents to give some more space to each individual. Sleeping four in one tent would mean cramped quarters and poor sleep quality.</p>
                <p><b>✓ Awning: </b>We wanted the full 270 degree awning with optional tent to create a large shaded cover. With that, we can cook in the rain or escape the sun without retreating into the tents.</p>
            <h4>📚 Learnings</h4>
                <p><b>✓ Installation: </b>Having a roof tent specialist install them was essential. They knew exactly how to position and secure the tents for proper weight distribution and aerodynamics. Not something to DIY.</p>
                <p><b>✓ Roof rack installation: </b>I initially planned to use standard roof bars for the front tent. The specialist strongly advised against this—the bars aren't designed for the weight and vibration of off-road driving and would likely fail or detach. Sold them and installed a proper fixed roof rack instead. Safety first.</p>
        </div>
    `
  },
  
  {
    id: 'step-8-upgrade-suspension',
    title: 'Step 8: Upgrade suspension and clutch',
    note: '',
    images: [35, 36],
    richContent: `
        <div class="build-rich-content">    
            <h4>💡 Decision points</h4>
                <p><strong>✓ Upgraded suspension: </strong>No difficult decision at all. Once the roof tents were installed, I immediately noticed the impact of the weight and overall stability of the truck. The upgrade to heavy duty suspension enables us to safely travel on- and offroad with the full equipment and four people. </p>
                <p><strong>✓ Upgraded clutch: </strong>On our first trip, we realized the stock clutch couldn't handle the increased weight and off-road driving. Frequent clutch slipping on steep terrain burned it up quickly. After returning home, we upgraded to a heavy-duty clutch—now the truck handles technical terrain without issue.</p>
            <h4>📚 Learnings</h4>
                <p><b>✓ Clutch: </b>Heavy-duty clutches cost €3500+. We tested the stock clutch first and it failed after one trip. Learned our lesson and upgraded. But this approach saved us from spending on upgrades we might not have needed—test first, then upgrade based on real-world performance.</p>
        </div>
    `
  },
  {
    id: 'step-9-make-offroad-ready',
    title: 'Step 9: Make offroad ready',
    note: '',
    images: [22, 34, 58],
    richContent: `
        <div class="build-rich-content">    
            <h4>💡 Decision points</h4>
                <p><strong>✓ Rock sliders: </strong>We decided to remove the stock running boards which were made of plastic and replace them with rock sliders. These sliders protect the car better against big rocks while still offering the ability to step up on them and reach the tent covers.</p>
                <p><strong>✓ Recovery boards: </strong>After getting stuck in our back yard and being winched out by another 4x4 it became clear that we needed these boards. They are a precaution for when it's slippery and you need to get out of that situation.</p>
        </div>
    `
    
  },
  
  {
    id: 'step-10-finished-interior',
    title: 'Step 10: Finished interior',
    note: '',
    images: [41, 42, 43, 44, 45, 46, 47, 48, 49],
    richContent: `
        <div class="build-rich-content">    
            <h4>🐾 Walk-through</h4>
                <p>Welcome to the fully built interior. The interior has the following features:</p>
                <p>✓ Water tap and bassin for cooking and cleaning</p>
                <p>✓ Shower connection for quick water access or showering</p>
                <p>✓ Large drawer with gas stove, water bassin, storage</p>
                <p>✓ Large drawer with fridge (45l) and storage</p>
                <p>✓ Drawer for cuttlery, condiments, winch and tent equipment</p>
                <p>✓ Side cabinet with access to water pump and storage</p>
                <p>✓ Side cubby for plates and cups</p>
                <p>✓ Side cabinet for storing the camping seats (4 + bench)</p>
                <p>✓ Side cabinet for compressor and access to the second battery</p>
                <p>✓ Camping table mounted on the ceiling for easy access</p>
                <p>✓ Solar panels mounted under the camping table for easy access</p>
                <p>✓ Water tank and access to the fill cap</p>
                <p>✓ Small items we always carry are a foldable shovel to help recover the car or just dig a hole. A small axe to chop wood for making a fire</p>
                <p>✓ Fire extinguisher just in case</p>
        </div>
       
    `
  }
];
*/

const BUILD_PHASES_BASE = [
  { id: 'stock', images: [1, 2, 3, 4] },
  { id: 'step-1-remove-tonneau', images: [5, 6, 7] },
  { id: 'step-2-upgrade-lights', images: [8, 9, 15, 16, 17, 18, 54, 19] },
  { id: 'step-3-install-snorkel', images: [10, 11] },
  { id: 'step-4-install-water-tank', images: [12, 13] },
  { id: 'step-5-install-electrical', images: [51, 14, 20, 53, 49, 52] },
  { id: 'step-6-build-interior', images: [21, 31, 32, 38, 39, 40, 55, 56, 57] },
  { id: 'step-7-place-roof-tents', images: [23, 24, 25, 26, 27, 28, 29, 30] },
  { id: 'step-8-upgrade-suspension', images: [35, 36] },
  { id: 'step-9-make-offroad-ready', images: [22, 34, 58] },
  { id: 'step-10-finished-interior', images: [41, 42, 43, 44, 45, 46, 47, 48, 49] }
];

const BUILD_I18N = {
  en: {
    ui: {
      jumpHeading: 'Timeline steps',
      toggleLabel: '📋 Build Steps'
    },
    phases: {
      'stock': {
        title: 'Start of the journey: buying the truck',
        note: '',
        richContent: `
          <div class="build-rich-content">
            <h4>💡 Decision point</h4>
            <p>We needed a double-cab pickup (4 seats) to make sure we could use the truck for our family trips. Finding a truck that met these requirements was hard as most Dutch pickups have deleted backseats due to tax incentives. Add our budget and we could select from just a few trucks, ultimately landing on our Ford Ranger.</p>
            <h4>🌲 The bigger mission</h4>
            <p>Beyond family travel, this truck enables nature disconnect retreats for small groups where we leave phones, notifications, and daily distractions behind. The 4-person capacity allows us to guide intimate groups into remote places for genuine rest and reconnection with nature.</p>
          </div>`
      },

      'step-1-remove-tonneau': {
        title: 'Step 1: Remove tonneau cover & add canopy',
        note: '',
        richContent: `
          <div class="build-rich-content">
            <h4>The first step was simple</h4>
            <p>Dipping my toe into this truck conversion was luckily the easiest part. A couple of bolts and the tonneau cover and roll-bar were gone. Off to the next assignment.</p>
            <h4>💡 Decision point</h4>
            <p>Sourcing the aluminum canopy was straightforward. We chose the Bushtech based on availability. The dealer was incredibly supportive: Installation at their shop was possible, I got help from the dealer in putting it on the car using their forklift. From there, with a final check up from the dealer, I mounted the canopy.</p>
          </div>`
      },

    
    'step-2-upgrade-lights': {
        title: 'Step 2: Upgrade lights and install winch',
        note: '',
        images: [8, 9, 15, 16, 17, 18, 54, 19],
        richContent: `
            <div class="build-rich-content">
                <h4>💡 Decision point</h4>
                <p><strong>✓ LED headlights: </strong>Upgrading from halogen to LED was straightforward and offered significantly more light and visibility at night.</p>
                <p><strong>✓ Auxiliary lights in grill: </strong>We wanted to keep the stock bumper and grill, so integrating auxiliary lights into the grill mesh was the cleanest option. The result really completed the front-end look.</p>
                <p><strong>✓ Winch installation: </strong> We wanted to make sure that the truck was able for self-recovery in remote areas. Essential safety equipment for off-road travel and getting unstuck when there's no one around to help.</p>
                <h4>📚 Learnings</h4>
                <p><b>Sequence matters: </b>I installed the lights first, then had to remove the bumper again weeks later to fit the winch. Next time, I'd do both upgrades in one session. This would have saved hours of work</p>
            </div> 
        `
        },
    
    'step-3-install-snorkel': {
        title: 'Step 3: Install snorkel',
        note: '',
        images: [10, 11],
        richContent: `
            <div class="build-rich-content">
                <h4>💡 Decision point</h4>
                <p>The snorkel provides security for water crossings and is an essential security during remote travel. We went with a quality brand because it's constantly exposed to UV rays. Cheaping out might save a bit, but a cracked snorkel leading to water ingestion could cost thousands in engine damage.</p>
            </div>`
        },

  
    'step-4-install-water-tank': {
        title: 'Step 4: Install water tank',
        note: '',
        images: [12, 13],
        richContent: `
            <div class="build-rich-content">
                <h4>💡 Decision point</h4>
                <p>✓ We initially wanted an 80l tank positioned above the wheel arch. When it arrived, it was way too large and would've dominated the interior space. After searching alternatives, we found a 50l flat tank that fits perfectly. It fits the space well and is not intrusive for the rest of the interior.</p>
                <p>✓ We decided to not install any water level gauge to keep it simple. We just fill up when we can and so far we haven't ran out of water.</p>
                <p>✓ We installed a heating pad to prevent freezing in winter conditions. Essential for protecting both the tank and pump when camping in sub-zero temperatures.</p>
            </div> `
    },
  
    'step-5-install-electrical': {
        title: 'Step 5: Install electrical system',
        note: '',
        images: [51, 14, 20, 53, 49, 52],
        richContent: `
            <div class="build-rich-content">
                <h4>📚 Learnings</h4>
                <p><b>✓ Map out all power needs before buying components.</b> Taking time to plan upfront saved me from buying and rebuying connectors and switches.</p>
                <p><b>✓ Double-check every crimp: </b>A loose connection can cause failures that are hard to diagnose later. Use proper crimping tools and test each connection before closing everything up.</p>
                <p><b>✓ Pull all wires at once: </b>Run cables from battery to front in one session to avoid missing connections or having to disassemble panels multiple times.</p>
            </div> `
    },
 
    'step-6-build-interior': {
        title: 'Step 6: Build interior',
        note: '',
        images: [21, 31, 32, 38, 39, 40, 55, 56, 57],
        richContent: `
            <div class="build-rich-content">    
                <h4>📚 Learnings</h4>
                    <p><b>✓ Decide what wood to use: </b>the type of wood used is essential in how strong the construction is and if it can withstand the weather.</p>
                    <p><b>✓ Measure everything twice (or three times): </b> I didn't have exact dimensions for the fridge, cooker, and drawer sliders before building. This meant rebuilding sections multiple times to get everything to fit—wasted wood and hours of work.</p>
                    <p><b>✓ Get the right sliders: </b>I bought too light of sliders which resulted in broken sliders after the first offroad trip. After that trip, I had to make upgrades and modifications plus spend more money</p>
                    <p><b>✓ Test ergonomics before finalizing: </b>Solar panels under the kitchen seemed smart until the suspension lift made everything too high to reach comfortably. Learned this on the first trip and had to rebuild the entire layout. Lesson: mock up the full setup with actual heights before committing.</p>
            </div>`
    },
  
    'step-7-place-roof-tents': {
        title: 'Step 7: Place roof tents',
        note: '',
        images: [23, 24, 25, 26, 27, 28, 29, 30],
        richContent: `
            <div class="build-rich-content">    
                <h4>💡 Decision points</h4>
                    <p><b>✓ 1 versus 2 tents: </b>We chose 2 tents to give some more space to each individual. Sleeping four in one tent would mean cramped quarters and poor sleep quality.</p>
                    <p><b>✓ Awning: </b>We wanted the full 270 degree awning with optional tent to create a large shaded cover. With that, we can cook in the rain or escape the sun without retreating into the tents.</p>
                <h4>📚 Learnings</h4>
                    <p><b>✓ Installation: </b>Having a roof tent specialist install them was essential. They knew exactly how to position and secure the tents for proper weight distribution and aerodynamics. Not something to DIY.</p>
                    <p><b>✓ Roof rack installation: </b>I initially planned to use standard roof bars for the front tent. The specialist strongly advised against this as these bars aren't designed for the weight and vibration of off-road driving and would likely fail or detach. Sold them and installed a proper fixed roof rack instead. Safety first.</p>
            </div> `
    },
  
    'step-8-upgrade-suspension': {
        title: 'Step 8: Upgrade suspension and clutch',
        note: '',
        images: [35, 36],
        richContent: `
            <div class="build-rich-content">    
                <h4>💡 Decision points</h4>
                    <p><strong>✓ Upgraded suspension: </strong>No difficult decision at all. Once the roof tents were installed, I immediately noticed the impact of the weight and overall stability of the truck. The upgrade to heavy duty suspension enables us to safely travel on- and offroad with the full equipment and four people. </p>
                    <p><strong>✓ Upgraded clutch: </strong>On our first trip, we realized the stock clutch couldn't handle the increased weight and off-road driving. Frequent clutch slipping on steep terrain burned it up quickly. After returning home, we upgraded to a heavy-duty clutch. Now the truck handles technical terrain without issue.</p>
                <h4>📚 Learnings</h4>
                    <p><b>✓ Clutch: </b>Heavy-duty clutches cost €3500+. We tested the stock clutch first and it failed after one trip. Learned our lesson and upgraded. But this approach saved us from spending on upgrades we might not have needed. Our advice is often to test first, then upgrade based on real-world experiences.</p>
            </div> `
    },

    'step-9-make-offroad-ready': {
        title: 'Step 9: Make offroad ready',
        note: '',
        images: [22, 34, 58],
        richContent: `
            <div class="build-rich-content">    
                <h4>💡 Decision points</h4>
                    <p><strong>✓ Rock sliders: </strong>We decided to remove the stock running boards which were made of plastic and replace them with rock sliders. These sliders protect the car better against big rocks while still offering the ability to step up on them and reach the tent covers.</p>
                    <p><strong>✓ Recovery boards: </strong>After getting stuck in our back yard and being winched out by another 4x4 it became clear that we needed these boards. They are a precaution for when it's slippery and you need to get out of that situation.</p>
            </div> `
    },
  
    'step-10-finished-interior':{
    title: 'Step 10: Finished interior',
    note: '',
    images: [41, 42, 43, 44, 45, 46, 47, 48, 49],
    richContent: `
        <div class="build-rich-content">    
            <h4>🐾 Walk-through</h4>
                <p>Welcome to the fully built interior. The interior has the following features:</p>
                <p>✓ Water tap and bassin for cooking and cleaning</p>
                <p>✓ Shower connection for quick water access or showering</p>
                <p>✓ Large drawer with gas stove, water bassin, storage</p>
                <p>✓ Large drawer with fridge (45l) and storage</p>
                <p>✓ Drawer for cuttlery, condiments, winch and tent equipment</p>
                <p>✓ Side cabinet with access to water pump and storage</p>
                <p>✓ Side cubby for plates and cups</p>
                <p>✓ Side cabinet for storing the camping seats (4 + bench)</p>
                <p>✓ Side cabinet for compressor and access to the second battery</p>
                <p>✓ Camping table mounted on the ceiling for easy access</p>
                <p>✓ Solar panels mounted under the camping table for easy access</p>
                <p>✓ Water tank and access to the fill cap</p>
                <p>✓ Small items we always carry are a foldable shovel to help recover the car or just dig a hole. A small axe to chop wood for making a fire</p>
                <p>✓ Fire extinguisher just in case</p>
        </div> `
        }
    }
  },  // Close 'en' object

  nl: {
    ui: {
      jumpHeading: 'Timeline stappen',
      toggleLabel: '📋 Build stappen'
    },
    phases: {
      'stock': {
        title: 'Start van de reis: de koop',
        note: '',
        richContent: `
          <div class="build-rich-content">
            <h4>💡 Keuzemoment</h4>
            <p>We wilden een double cab pick-up (4 zitplaatsen), zodat we de wagen echt voor gezinsreizen konden gebruiken. Een geschikte pick-up vinden was lastig, omdat veel wagens in Nederland geen achterbank hebben ivm de bijtellingsregels voor bedrijfswagens. Tesamen met ons vastgestelde budget bleef er maar een kleine selectie over en uiteindelijk kozen we voor onze Ford Ranger.</p>
            <h4>🌲 De grotere missie</h4>
            <p>Naast gezinsreizen maakt deze truck ‘disconnect’-retraites in de natuur mogelijk: kleine groepen, weg van telefoons, meldingen en dagelijkse drukte. Dankzij 4 slaapplaatsen kunnen we groepen meenemen naar afgelegen plekken voor echte rust en hernieuwde verbinding met de natuur.</p>
          </div>`
      },

      'step-1-remove-tonneau': {
        title: 'Stap 1: Tonneau cover verwijderen & aluminium opbouw plaatsen',
        note: '',
        richContent: `
          <div class="build-rich-content">
            <h4>De eerste stap was simpel</h4>
            <p>Gelukkig was het begin van onze ombouw het makkelijkst: een paar bouten los en de tonneau cover en roll-bar waren weg. Op naar de volgende klus.</p>
            <h4>💡 Keuzemoment</h4>
            <p>De aluminium opbouw regelen was vrij rechttoe rechtaan. We kozen voor Bushtech op basis van beschikbaarheid. De dealer was super behulpzaam: montage in de werkplaats was mogelijk, en met hun heftruck hielpen ze om alles op de auto te zetten. Daarna heb ik, na een laatste check, de opbouw definitief gemonteerd.</p>
          </div>`
      },

      'step-2-upgrade-lights': {
        title: 'Stap 2: Verlichting upgraden en lier installeren',
        note: '',
        richContent: `
          <div class="build-rich-content">
            <h4>💡 Keuzemomenten</h4>
            <p><strong>✓ LED-koplampen:</strong> Van halogeen naar LED was eenvoudig en gaf ’s nachts veel meer licht en zicht.</p>
            <p><strong>✓ Extra lampen in de grille:</strong> We wilden de originele bumper en grille behouden. Lampen in de grill integreren gaf het strakste resultaat en maakte de voorkant echt “af”.</p>
            <p><strong>✓ Lier:</strong> Zelfredzaamheid in afgelegen gebieden was een must. Een lier is essentieel veiligheidsmateriaal voor off-road reizen, zeker als er niemand in de buurt is om te helpen.</p>
            <h4>📚 Leerpunten</h4>
            <p><b>Volgorde is belangrijk:</b> ik begon met het vervangen van de lampen in de koplampen om vervolgens weken later de bumper opnieuw te moeten demonteren voor de lier. Volgende keer doe ik dit in één sessie, dat scheelt uren werk.</p>
          </div>`
      },

      'step-3-install-snorkel': {
        title: 'Stap 3: Snorkel installeren',
        note: '',
        richContent: `
          <div class="build-rich-content">
            <h4>💡 Keuzemoment</h4>
            <p>Een snorkel geeft zekerheid bij waterdoorsteken iets wat belangrijk is voor reizen waarbij we door water waden. We kozen voor een kwaliteitsmerk omdat het continu aan UV wordt blootgesteld. Besparen lijkt aantrekkelijk, maar een gescheurde snorkel en water in de motor kan je duizenden euro’s aan motorschade kosten.</p>
          </div>`
      },

      'step-4-install-water-tank': {
        title: 'Stap 4: Watertank installeren',
        note: '',
        richContent: `
          <div class="build-rich-content">
            <h4>💡 Keuzemomenten</h4>
            <p>✓ We wilden eerst een tank van 80 L boven de wielkast. Toen hij binnenkwam bleek hij véél te groot en zou hij de hele ruimte domineren. Uiteindelijk vonden we een platte tank van 50 L die perfect past en nauwelijks in de weg zit.</p>
            <p>✓ We hebben geen meter geplaatst om het simpel te houden. We vullen bij wanneer het kan en tot nu toe nog nooit zonder water gezeten.</p>
            <p>✓ We plaatsten een verwarmingsmat om bevriezen in de winter te voorkomen. Belangrijk om zowel de tank als de pomp te beschermen bij temperaturen rond of onder het vriespunt.</p>
          </div>`
      },

      'step-5-install-electrical': {
        title: 'Stap 5: Elektrisch systeem installeren',
        note: '',
        richContent: `
          <div class="build-rich-content">
            <h4>📚 Leerpunten</h4>
            <p><b>✓ Breng alle stroombehoeften eerst in kaart.</b> Goed plannen voorkwam onnodige vertraging door het extra moeten kopen van connectoren en schakelaars.</p>
            <p><b>✓ Check elke krimpverbinding:</b> een losse verbinding kan later storingen geven die lastig te vinden zijn. Belangrijk is dat elke verbinding goed wordt getest vóór je het dichtbouwt.</p>
            <p><b>✓ Trek alle kabels in één keer:</b> van accu naar voren in één sessie voorkomt gemiste aansluitingen en opnieuw panelen demonteren.</p>
          </div>`
      },

      'step-6-build-interior': {
        title: 'Stap 6: Interieur bouwen',
        note: '',
        richContent: `
          <div class="build-rich-content">
            <h4>📚 Leerpunten</h4>
            <p><b>✓ Kies het juiste hout:</b> de gekozen houtsoort bepaalt sterkte en weerbestendigheid.</p>
            <p><b>✓ Meet alles twee (of drie) keer:</b> ik had niet alle exacte maten van koelkast, kookstel en ladegeleiders. Daardoor moest ik delen opnieuw bouwen met helaas een behoorlijke verspilling van hout en uren.</p>
            <p><b>✓ Koop de juiste ladegeleiders:</b> ik kocht te lichte geleiders; tijdens de eerste off-road reis gingen ze kapot. Daarna moest ik de geleiders upgraden en de lades modificeren (en extra geld uitgeven).</p>
            <p><b>✓ Test ergonomie vóór je definitief bouwt:</b> zonnepanelen onder de keuken leek slim, tot de verhoging door de nieuwe veren en schokbrekers alles te hoog maakte om alles comfortabel te bereiken. Na onze eerste reis hebben we helaas het hele interieur opnieuw ingericht en gebouwd. Les: zorg dat zware lades met de koelkast en het kookstel zo laag mogelijk zitten in de opbouw.</p>
          </div>`
      },

      'step-7-place-roof-tents': {
        title: 'Stap 7: Daktenten plaatsen',
        note: '',
        richContent: `
          <div class="build-rich-content">
            <h4>💡 Keuzemomenten</h4>
            <p><b>✓ 1 versus 2 tenten:</b> we kozen voor 2 tenten zodat iedereen meer ruimte heeft. Met vier personen in één tent betekent krap slapen en minder slaapkwaliteit.</p>
            <p><b>✓ Luifel:</b> we wilden een 270° luifel met optionele tent voor veel schaduw. Zo kunnen we koken in de regen of uit de zon blijven zonder ons terug te moeten trekken in onze daktenten.</p>
            <h4>📚 Leerpunten</h4>
            <p><b>✓ Montage:</b> een specialist laten installeren was essentieel. Zij weten exact hoe je tenten positioneert en vastzet voor gewichtsverdeling en aerodynamica niet iets om zelf te proberen.</p>
            <p><b>✓ Dakdrager:</b> ik wilde eerst standaard dakdragers gebruiken voor de voorste tent. De specialist raadde dit sterk af: te veel gewicht en vibratie tijdens off-road rijden. Snel de dragers verkocht en een vaste drager gemonteerd. Veiligheid eerst.</p>
          </div>`
      },

      'step-8-upgrade-suspension': {
        title: 'Stap 8: Vering en koppeling upgraden',
        note: '',
        richContent: `
          <div class="build-rich-content">
            <h4>💡 Keuzemomenten</h4>
            <p><strong>✓ Zwaardere vering:</strong> geen moeilijke keuze. Met de daktenten op de wagen merkte ik direct het effect op gewicht en stabiliteit. Heavy duty veren en schokbrekers maakt het mogelijk om veilig te reizen met volle bepakking en vier persoen zowel op asfalt als in het terrein.</p>
            <p><strong>✓ Zwaardere koppeling:</strong> op de eerste reis bleek dat de standaard koppeling het extra gewicht en off-road rijden niet goed aankon. Wegrijden met een slippende koppeling op steile stukken zorgde dat de koppeling snel op brandde. Na thuiskomst hebben we om deze reden direct een heavy-duty koppeling geplaatst en zijn er geen problemen meer tijdens het wegrijden.</p>
            <h4>📚 Leerpunten</h4>
            <p><b>✓ Koppeling:</b> heavy-duty koppelingen kosten €3500+. We hebben eerst de standaard koppeling getest; die faalde op onze eerste reis. Les geleerd en upgrade gedaan. Maar: eerst testen kan geld besparen als een upgrade misschien niet nodig blijkt.</p>
          </div>`
      },

      'step-9-make-offroad-ready': {
        title: 'Stap 9: Off-road ready maken',
        note: '',
        richContent: `
          <div class="build-rich-content">
            <h4>💡 Keuzemomenten</h4>
            <p><strong>✓ Rock sliders:</strong> we haalden de standaard (plastic) side steps weg en vervingen ze door rock sliders. Beter beschermd tegen rotsen én nog steeds handig om op te stappen om bij het dak te komen of de tenthoezen te verwijderen.</p>
            <p><strong>✓ Recovery boards:</strong> nadat we vast kwamen te zitten in onze achtertuin en we door een andere 4x4 uit deze benarde situatie zijn getrokken, was het duidelijk: deze boards moesten er komen. Dit geeft ons de nodige grip op modder/sneeuw/zand voor als je ergens vast zit.</p>
          </div>`
      },

      'step-10-finished-interior': {
        title: 'Stap 10: Interieur afgerond',
        note: '',
        richContent: `
          <div class="build-rich-content">
            <h4>🐾 Rondleiding</h4>
            <p>Welkom in het volledig gebouwde interieur. Dit zit erin:</p>
            <p>✓ Kraan en wasbak voor koken en schoonmaken</p>
            <p>✓ Douche-aansluiting voor snel toegang tot water of douchen</p>
            <p>✓ Grote lade met gasfornuis, wasbak en opslag</p>
            <p>✓ Grote lade met koelkast (45 L) en opslag</p>
            <p>✓ Lade voor bestek, kruiden, lier- en tentspullen</p>
            <p>✓ Opslag met toegang tot waterpomp + opslag</p>
            <p>✓ Kast voor borden en bekers</p>
            <p>✓ Opslag voor campingstoelen (4 + bank)</p>
            <p>✓ Opslag voor compressor + toegang tot tweede accu</p>
            <p>✓ Camping tafel aan het plafond gemonteerd</p>
            <p>✓ Zonnepanelen onder de tafel gemonteerd</p>
            <p>✓ Watertank + toegang tot vuldop</p>
            <p>✓ Altijd mee: opvouwbare schep (recoveren / kuil graven) en een kleine bijl om hout te hakken</p>
            <p>✓ Brandblusser voor de zekerheid</p>
          </div>`
      }
    }
  },

  // Future: add BUILD_I18N.de = { ui: {...}, phases: {...} }
};

const i18n = BUILD_I18N[lang] || BUILD_I18N.en;

const BUILD_PHASES = BUILD_PHASES_BASE.map(p => {
  const txt = i18n.phases[p.id] || BUILD_I18N.en.phases[p.id];
  return {
    ...p,
    title: txt?.title || p.id,
    note: txt?.note || '',
    richContent: txt?.richContent || ''
  };
});

    // --- Render jump nav ---
    if (jumpEl) {
        // Add heading for desktop
        const heading = document.createElement('h3');
/*        heading.textContent = 'Timeline steps';*/
        heading.textContent = i18n.ui.jumpHeading;
        
        // Add mobile toggle button
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'build-jump-toggle';
/*        toggleBtn.innerHTML = '📋 Build Steps <span class="toggle-icon">▼</span>';*/
        toggleBtn.innerHTML = `${i18n.ui.toggleLabel} <span class="toggle-icon">▼</span>`;
        toggleBtn.setAttribute('aria-expanded', 'false');
        
        // Create wrapper for links
        const linksWrapper = document.createElement('div');
        linksWrapper.className = 'build-jump-links';
        linksWrapper.innerHTML = BUILD_PHASES.map(p =>
            `<a href="#${p.id}" class="build-jump-link">${escapeHtml(p.title)}</a>`
        ).join('');
        
        // Clear and rebuild jumpEl
        jumpEl.innerHTML = '';
        jumpEl.appendChild(heading);
        jumpEl.appendChild(toggleBtn);
        jumpEl.appendChild(linksWrapper);
        
        // Mobile toggle functionality
        toggleBtn.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !isExpanded);
            linksWrapper.classList.toggle('expanded');
            this.querySelector('.toggle-icon').textContent = isExpanded ? '▼' : '▲';
        });
        
        // Add smooth scroll with offset and close mobile menu
        const jumpLinks = linksWrapper.querySelectorAll('a[href^="#"]');
        jumpLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    const navbarHeight = 100;
                    const offsetPosition = targetElement.offsetTop - navbarHeight;
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Close mobile menu after selection
                    if (window.innerWidth <= 768) {
                        linksWrapper.classList.remove('expanded');
                        toggleBtn.setAttribute('aria-expanded', 'false');
                        toggleBtn.querySelector('.toggle-icon').textContent = '▼';
                    }
                    
                    // Update active state
                    jumpLinks.forEach(l => l.classList.remove('active'));
                    this.classList.add('active');
                }
            });
        });
        
        // Highlight current step on scroll
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    jumpLinks.forEach(link => {
                        if (link.getAttribute('href') === `#${id}`) {
                            jumpLinks.forEach(l => l.classList.remove('active'));
                            link.classList.add('active');
                        }
                    });
                }
            });
        }, { threshold: 0.5 });
        
        // Observe all build phases
        BUILD_PHASES.forEach(phase => {
            const element = document.getElementById(phase.id);
            if (element) observer.observe(element);
        });
    }

    // Flatten list of all images (for lightbox navigation)
    const allImages = BUILD_PHASES.flatMap(p => p.images.map(n => ({
/*        src: `images/build/IMG_${n}.jpeg`,*/
        src: `${assetPrefix}images/build/IMG_${n}.jpeg`,
        caption: `${p.title}`,  // Removed — IMG_${n}
        phaseId: p.id
    })));

    // --- Render phases ---
    timelineEl.innerHTML = BUILD_PHASES.map(phase => {
        const thumbs = phase.images.map(n => {
/*            const src = `images/build/IMG_${n}.jpeg`;*/
            const src = `${assetPrefix}images/build/IMG_${n}.jpeg`;
            return `
                <div class="build-thumb" data-src="${src}" data-caption="${escapeHtml(phase.title)}">
                    <img src="${src}" alt="${escapeHtml(phase.title)} photo" loading="lazy">
                </div>
            `;
        }).join('');

        return `
            <article class="build-phase" id="${phase.id}">
                <div class="build-phase-header">
                    <h3 class="build-phase-title">${escapeHtml(phase.title)}</h3>
                    <p class="build-phase-note">${escapeHtml(phase.note || '')}</p>
                </div>
                <div class="build-grid">
                    ${thumbs}
                </div>
                ${phase.richContent || ''}
            </article>
        `;
    }).join('');

    // --- Lightbox wiring ---
    const lb = document.getElementById('buildLightbox');
    const lbImg = document.getElementById('buildLightboxImg');
    const lbCaption = document.getElementById('buildLightboxCaption');
    const lbClose = document.getElementById('buildLightboxClose');
    const lbPrev = document.getElementById('buildLightboxPrev');
    const lbNext = document.getElementById('buildLightboxNext');

    let currentIndex = -1;

    function openLightboxBySrc(src) {
        const idx = allImages.findIndex(i => i.src === src);
        if (idx === -1) return;
        currentIndex = idx;
        renderLightbox();
        lb.classList.add('open');
        lb.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lb.classList.remove('open');
        lb.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        currentIndex = -1;
    }

    function renderLightbox() {
        const item = allImages[currentIndex];
        if (!item) return;
        lbImg.src = item.src;
        lbCaption.textContent = item.caption;

        // Hide prev/next at phase boundaries (not just start/end of all images)
        const currentPhase = item.phaseId;
        const prevItem = allImages[currentIndex - 1];
        const nextItem = allImages[currentIndex + 1];
        
        // Hide prev arrow if at first image OR if previous image is from different phase
        lbPrev.style.display = (currentIndex <= 0 || prevItem?.phaseId !== currentPhase) ? 'none' : 'grid';
        
        // Hide next arrow if at last image OR if next image is from different phase
        lbNext.style.display = (currentIndex >= allImages.length - 1 || nextItem?.phaseId !== currentPhase) ? 'none' : 'grid';
    }

    // Click thumbs
    timelineEl.addEventListener('click', function (e) {
        const thumb = e.target.closest('.build-thumb');
        if (!thumb) return;
        openLightboxBySrc(thumb.getAttribute('data-src'));
    });

    // Close actions
    lbClose.addEventListener('click', closeLightbox);
    lb.addEventListener('click', function (e) {
        if (e.target === lb) closeLightbox();
    });

    // Prev/Next
    lbPrev.addEventListener('click', function () {
        if (currentIndex > 0) {
            const currentPhase = allImages[currentIndex].phaseId;
            const prevItem = allImages[currentIndex - 1];
            
            // Only go prev if previous image is in same phase
            if (prevItem && prevItem.phaseId === currentPhase) {
                currentIndex--;
                renderLightbox();
            }
        }
    });
    lbNext.addEventListener('click', function () {
        if (currentIndex < allImages.length - 1) {
            const currentPhase = allImages[currentIndex].phaseId;
            const nextItem = allImages[currentIndex + 1];
            
            // Only go next if next image is in same phase
            if (nextItem && nextItem.phaseId === currentPhase) {
                currentIndex++;
                renderLightbox();
            }
        }
    });

    // Keyboard
    document.addEventListener('keydown', function (e) {
        if (!lb.classList.contains('open')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft' && currentIndex > 0) { currentIndex--; renderLightbox(); }
        if (e.key === 'ArrowRight' && currentIndex < allImages.length - 1) { currentIndex++; renderLightbox(); }
    });

    // Helpers
    function range(from, to) {
        const out = [];
        for (let i = from; i <= to; i++) out.push(i);
        return out;
    }

    function escapeHtml(str) {
        return String(str)
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }
});

// ============================================
// PACKAGE PREFILL ON CONTACT PAGE (ADDED)
// ============================================

document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const params = new URLSearchParams(window.location.search);
  const pkg = (params.get('package') || '').toLowerCase();
  if (!pkg) return;

  const allowed = new Set(['basic', 'advanced', 'full']);
  if (!allowed.has(pkg)) return;

  // Add hidden field for Formspree
  let hidden = form.querySelector('input[name="package"]');
  if (!hidden) {
    hidden = document.createElement('input');
    hidden.type = 'hidden';
    hidden.name = 'package';
    form.appendChild(hidden);
  }
  hidden.value = pkg;

  // Prepend a helpful first line in the message (without overwriting user text)
  const message = document.getElementById('message');
  if (message && !message.value.trim()) {
    const label = pkg === 'full' ? 'Full overland-ready' : pkg.charAt(0).toUpperCase() + pkg.slice(1);
    message.value =
      `Interested in package: ${label}\n` +
      `Vehicle: (make/model/year)\n` +
      `Country: (NL/DE/BE)\n` +
      `Target timing: \n\n` +
      `Message: `;
    message.focus();
  }
});
