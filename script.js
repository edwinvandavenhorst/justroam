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
                <li><a href="build.html" class="nav-link ${currentPage === 'build.html' ? 'active' : ''}">Build your truck</a></li>
                <li><a href="stories.html" class="nav-link ${currentPage === 'stories.html' ? 'active' : ''}">Our stories</a></li>
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
                                <img src="images/phone.png" alt="phone">
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

    // Only run on build.html
    if (!timelineEl) return;

    // --- Configure your timeline here ---
    // Assumes images are named IMG_1.jpeg ... IMG_49.jpeg inside /images
    const BUILD_PHASES = [
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


    // --- Render jump nav ---
    if (jumpEl) {
        // Add heading for desktop
        const heading = document.createElement('h3');
        heading.textContent = 'Timeline steps';
        
        // Add mobile toggle button
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'build-jump-toggle';
        toggleBtn.innerHTML = '📋 Build Steps <span class="toggle-icon">▼</span>';
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
        src: `images/build/IMG_${n}.jpeg`,
        caption: `${p.title} — IMG_${n}`,
        phaseId: p.id
    })));

    // --- Render phases ---
    timelineEl.innerHTML = BUILD_PHASES.map(phase => {
        const thumbs = phase.images.map(n => {
            const src = `images/build/IMG_${n}.jpeg`;
            return `
                <div class="build-thumb" data-src="${src}" data-caption="${escapeHtml(phase.title)} — IMG_${n}">
                    <img src="${src}" alt="${escapeHtml(phase.title)} photo IMG_${n}" loading="lazy">
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

        // Hide prev/next at ends
        lbPrev.style.display = currentIndex <= 0 ? 'none' : 'grid';
        lbNext.style.display = currentIndex >= allImages.length - 1 ? 'none' : 'grid';
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
            currentIndex--;
            renderLightbox();
        }
    });
    lbNext.addEventListener('click', function () {
        if (currentIndex < allImages.length - 1) {
            currentIndex++;
            renderLightbox();
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
