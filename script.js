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

// ============================================
// NAVIGATION - CENTRALIZED
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Get current page filename
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Navigation structure
    const navHTML = `
        <div class="nav-container">
            <a href="index.html" class="nav-logo">
                <img src="images/Logo_JustRoam_ClearBackground.png" alt="JustRoam Logo" class="logo-img">
            </a>
            <ul class="nav-menu">
                <li><a href="index.html" class="nav-link ${currentPage === 'index.html' ? 'active' : ''}">Home</a></li>
                <li><a href="rent.html" class="nav-link ${currentPage === 'rent.html' ? 'active' : ''}">Rent a truck</a></li>
                <li><a href="build.html" class="nav-link ${currentPage === 'build.html' ? 'active' : ''}">Build a truck</a></li>
                <li><a href="faq.html" class="nav-link ${currentPage === 'faq.html' ? 'active' : ''}">FAQs</a></li>
                <li><a href="contact.html" class="nav-link ${currentPage === 'contact.html' ? 'active' : ''}">Get in touch</a></li>
            </ul>
            <a href="https://www.instagram.com/_justroam_/" class="nav-instagram" target="_blank" title="Follow us on Instagram">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" fill="currentColor"/>
            </svg>
            </a>
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
    }
});

// ============================================
// FOOTER - CENTRALIZED
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const footerHTML = `
        <div class="container">
            <div class="footer-content">
                <a href="index.html" class="footer-logo">
                <img src="images/Logo_JustRoam_ClearBackground.png" alt="JustRoam Logo" class="footer-img">
                </a>

                <div class="footer-section">
                    <h3>Contact details</h3>
                    <ul class="footer-links">
                        <li>
                            <div class="footer-nolink">
                                <img src="images/building.png" alt="Building icon">
                                <span>KVK: 71621865</span>
                            </div>
                        </li>
                        <li>
                            <a href="mailto:info@justroam.nl" class="footer-links" target="_blank" title="Contact us">
                                <img src="images/mail.png" alt="Email icon">
                                <span>info@justroam.nl</span>
                            </a>
                        </li>
                        <li>
                            <a href="tel:+31611334832" class="footer-links">
                                <img src="images/Phone.png" alt="Phone">
                                <span>+31 6 1133 4832</span>
                            </a>
                        </li>
                        <li>
                            <a href="https://www.instagram.com/_justroam_/" class="footer-links" target="_blank" title="Follow us on Instagram">
                                <img src="images/instagram.png" alt="Instagram icon">
                                <span>Follow us on Instagram</span>
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; JustRoam. All rights reserved.</p>
            </div>
        </div>
    `;
    
    // Insert footer into the page
    const footerElement = document.getElementById('main-footer');
    if (footerElement) {
        footerElement.innerHTML = footerHTML;
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
    
    if (thumbnails.length > 0 && mainImage) {
        // Initial state - hide left arrow on first image
        updateArrowVisibility();
        
        // Thumbnail clicks
        thumbnails.forEach((thumbnail, index) => {
            thumbnail.addEventListener('click', function() {
                currentIndex = index;
                updateGallery();
            });
        });
        
        // Previous button
        if (prevBtn) {
            prevBtn.addEventListener('click', function() {
                if (currentIndex > 0) {
                    currentIndex--;
                    updateGallery();
                }
            });
        }
        
        // Next button
        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
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
        
        // Show/hide arrows based on position
        function updateArrowVisibility() {
            if (prevBtn) {
                prevBtn.style.display = currentIndex === 0 ? 'none' : 'block';
            }
            if (nextBtn) {
                nextBtn.style.display = currentIndex === thumbnails.length - 1 ? 'none' : 'block';
            }
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
    
    let currentDate = new Date();
    let displayMonth = currentDate.getMonth();
    let displayYear = currentDate.getFullYear();
    
    // Data storage
    let pricingData = null;
    let bookedDates = [];
    
    // iCal URL
    const icalUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent('http://calendar.justroam.nl/ranger');
    
    // Initialize calendar
    async function initCalendar() {
        await loadPricingData();
        await loadICalData();
        renderCalendar();
    }
    
    // Load pricing from JSON
    async function loadPricingData() {
        try {
            const response = await fetch('pricing.json');
            pricingData = await response.json();
            console.log('✅ Pricing loaded:', pricingData);
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
        
        // Set month/year header
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        currentMonthElement.textContent = `${monthNames[displayMonth]} ${displayYear}`;
        
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
// VIDEO PLACEHOLDER SETUP (Build Page)
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const buildVideo = document.getElementById('buildVideo');
    
    if (buildVideo) {
        // When you have your video URL, set it like this:
        // buildVideo.src = 'https://www.youtube.com/embed/YOUR_VIDEO_ID';
        
        // Or for Vimeo:
        // buildVideo.src = 'https://player.vimeo.com/video/YOUR_VIDEO_ID';
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
