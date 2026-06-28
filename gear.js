// JustRoam - Airbnb-style booking calendar (roof box + bike carrier)
// Dropdown picks the item; calendar shows availability for that choice and
// lets the renter select a check-in/checkout range.
var GEAR_IS_NL = location.pathname.indexOf('/nl/') !== -1;
var GEAR_T = GEAR_IS_NL ? {
    addDate: 'Datum toevoegen',
    selectDates: 'Selecteer je data',
    requestToBook: 'Aanvraag versturen',
    sending: 'Verzenden…',
    success: 'Bedankt! We hebben je aanvraag ontvangen en nemen snel contact op om de beschikbaarheid en volgende stappen te bevestigen.',
    genericError: 'Sorry, er ging iets mis bij het versturen van je aanvraag. Probeer het opnieuw of mail ons op info@justroam.nl.'
} : {
    addDate: 'Add date',
    selectDates: 'Select your dates',
    requestToBook: 'Request to book',
    sending: 'Sending…',
    success: 'Thanks! We have received your request and will be in touch shortly to confirm availability and next steps.',
    genericError: 'Sorry, something went wrong sending your request. Please try again or email us directly at info@justroam.nl.'
};

(function () {
    'use strict';
    var WORKER = 'https://justroam-availability.edwinvandavenhorst.workers.dev';
    var CAL = {
        roofbox: WORKER + '/roofbox',
        carrier: WORKER + '/carrier'
    };
    var BUFFER_DAYS = 1;

    document.addEventListener('DOMContentLoaded', function () {
        var root = document.querySelector('[data-gcal]');
        if (!root) return;

        var itemSelect = document.getElementById('bk-item');
        var checkinValue = document.getElementById('bkCheckinValue');
        var checkoutValue = document.getElementById('bkCheckoutValue');
        var requestBtn = document.getElementById('bkRequestBtn');
        var monthLabel0 = root.querySelector('.gcal-month-0');
        var monthLabel1 = root.querySelector('.gcal-month-1');
        var days0 = root.querySelector('.gcal-days-0');
        var days1 = root.querySelector('.gcal-days-1');
        var prev = root.querySelector('.gcal-prev');
        var next = root.querySelector('.gcal-next');

        var locale = GEAR_IS_NL ? 'nl-NL' : 'en-GB';
        var view = new Date(); view.setDate(1);
        var box = {}, bike = {};
        var selStart = null, selEnd = null;

        if (prev) prev.addEventListener('click', function () { view.setMonth(view.getMonth() - 1); render(); });
        if (next) next.addEventListener('click', function () { view.setMonth(view.getMonth() + 1); render(); });
        if (itemSelect) itemSelect.addEventListener('change', function () { selStart = null; selEnd = null; render(); });
        if (requestBtn) requestBtn.addEventListener('click', onRequestClick);

        initCalendar();

        async function initCalendar() {
            var results = await Promise.all([
                loadICalData(CAL.roofbox),
                loadICalData(CAL.carrier)
            ]);
            box = results[0];
            bike = results[1];
            render();
        }

        async function loadICalData(url, attempt) {
            attempt = attempt || 1;
            try {
                var response = await fetch(url);
                if (!response.ok) {
                    throw new Error('worker returned ' + response.status);
                }
                var icalText = await response.text();
                var set = parseICal(icalText);
                console.log('✅ iCal loaded, found booked dates:', Object.keys(set).length);
                return set;
            } catch (error) {
                if (attempt < 3) {
                    console.log('⚠️ iCal fetch failed (attempt ' + attempt + '), retrying…', error);
                    await new Promise(function (resolve) { setTimeout(resolve, 1200); });
                    return loadICalData(url, attempt + 1);
                }
                console.error('❌ Could not load iCal after 3 attempts:', error);
                console.log('ℹ️ Calendar will show this item as available');
                return {};
            }
        }

        function parseICal(text) {
            var set = {};
            text.split('BEGIN:VEVENT').forEach(function (ev) {
                if (ev.indexOf('END:VEVENT') === -1) return;
                var s = ev.match(/DTSTART[;:][^\r\n]*?(\d{8})/);
                var e = ev.match(/DTEND[;:][^\r\n]*?(\d{8})/);
                if (!s) return;
                var start = fromYmd(s[1]);
                var end = e ? fromYmd(e[1]) : new Date(start);
                end.setDate(end.getDate() - 1);
                var cur = new Date(start), last = new Date(end);
                last.setDate(last.getDate() + BUFFER_DAYS);
                while (cur <= last) {
                    set[iso(cur)] = true;
                    cur.setDate(cur.getDate() + 1);
                }
            });
            return set;
        }

        function unavailableSet() {
            var choice = itemSelect ? itemSelect.value : 'roofbox';
            if (choice === 'roofbox') return box;
            if (choice === 'carrier') return bike;
            var merged = {};
            Object.keys(box).forEach(function (k) { merged[k] = true; });
            Object.keys(bike).forEach(function (k) { merged[k] = true; });
            return merged;
        }

        function isAvailable(date) {
            return !unavailableSet()[iso(date)];
        }

        function maxCheckoutDate(start) {
            var cur = new Date(start);
            var last = new Date(start);
            var maxIterations = 365;
            for (var i = 0; i < maxIterations && isAvailable(cur); i++) {
                last = new Date(cur);
                cur.setDate(cur.getDate() + 1);
            }
            return last;
        }

        function render() {
            renderMonth(view, monthLabel0, days0);
            var view2 = new Date(view.getFullYear(), view.getMonth() + 1, 1);
            renderMonth(view2, monthLabel1, days1);
            updateDisplays();
        }

        function renderMonth(monthDate, labelEl, daysEl) {
            if (labelEl) labelEl.textContent = monthDate.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
            daysEl.innerHTML = '';
            var y = monthDate.getFullYear(), m = monthDate.getMonth();
            var lastDay = new Date(y, m + 1, 0);
            var off = new Date(y, m, 1).getDay() - 1; if (off === -1) off = 6;
            var prevLast = new Date(y, m, 0).getDate();
            for (var i = off - 1; i >= 0; i--) daysEl.appendChild(cell(new Date(y, m - 1, prevLast - i), true));
            for (var d = 1; d <= lastDay.getDate(); d++) daysEl.appendChild(cell(new Date(y, m, d), false));
            var tot = daysEl.children.length, rem = tot % 7 === 0 ? 0 : 7 - (tot % 7);
            for (var n = 1; n <= rem; n++) daysEl.appendChild(cell(new Date(y, m + 1, n), true));
        }

        function cell(date, other) {
            var el = document.createElement('div');
            el.className = 'calendar-day';
            if (other) el.classList.add('other-month');
            var num = document.createElement('div');
            num.className = 'day-number';
            num.textContent = date.getDate();
            el.appendChild(num);

            if (isToday(date)) { el.classList.add('today'); return el; }
            if (isPast(date)) { el.classList.add('past'); return el; }

            if (selStart && !selEnd) {
                var maxOut = maxCheckoutDate(selStart);
                if (date < selStart || date > maxOut) {
                    el.classList.add('booked');
                    return el;
                }
                el.classList.add('available');
                el.classList.add(sameDay(date, selStart) ? 'gcal-range-start' : 'gcal-range-mid');
                el.addEventListener('click', function () { onDayClick(date); });
                return el;
            }

            if (selStart && selEnd && date >= selStart && date <= selEnd) {
                el.classList.add('available');
                if (sameDay(date, selStart)) el.classList.add('gcal-range-start');
                else if (sameDay(date, selEnd)) el.classList.add('gcal-range-end');
                else el.classList.add('gcal-range-mid');
                el.addEventListener('click', function () { onDayClick(date); });
                return el;
            }

            if (!isAvailable(date)) {
                el.classList.add('booked');
                return el;
            }

            el.classList.add('available');
            el.addEventListener('click', function () { onDayClick(date); });
            return el;
        }

        function onDayClick(date) {
            if (!selStart || (selStart && selEnd)) {
                selStart = date;
                selEnd = null;
            } else if (date < selStart) {
                selStart = date;
                selEnd = null;
            } else {
                var maxOut = maxCheckoutDate(selStart);
                if (date <= maxOut) {
                    selEnd = date;
                }
            }
            render();
        }

        function syncFormFields() {
            var formItem = document.getElementById('g-item');
            var formStart = document.getElementById('g-start');
            var formEnd = document.getElementById('g-end');
            var labelMap = { roofbox: 'Roof box', carrier: 'Bike carrier', bundle: 'Bundle' };
            if (formItem) formItem.value = labelMap[itemSelect.value] || 'Roof box';
            if (formStart) formStart.value = selStart ? iso(selStart) : '';
            if (formEnd) formEnd.value = selEnd ? iso(selEnd) : '';
        }

        function updateDisplays() {
            if (checkinValue) checkinValue.textContent = selStart ? fmt(selStart) : GEAR_T.addDate;
            if (checkoutValue) checkoutValue.textContent = selEnd ? fmt(selEnd) : GEAR_T.addDate;
            if (requestBtn) {
                if (selStart && selEnd) {
                    requestBtn.disabled = false;
                    requestBtn.textContent = GEAR_T.requestToBook;
                } else {
                    requestBtn.disabled = true;
                    requestBtn.textContent = GEAR_T.selectDates;
                }
            }
            syncFormFields();
        }

        function fmt(date) {
            return date.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
        }

        function onRequestClick() {
            if (!selStart || !selEnd) return;
            var requestSection = document.getElementById('request');
            if (requestSection) requestSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        function sameDay(a, b) { return a.toDateString() === b.toDateString(); }
        function fromYmd(s) { return new Date(+s.substring(0, 4), +s.substring(4, 6) - 1, +s.substring(6, 8)); }
        function iso(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
        function isToday(d) { return d.toDateString() === new Date().toDateString(); }
        function isPast(d) { var t = new Date(); t.setHours(0, 0, 0, 0); return d < t; }
    });
})();

// ---- Photo lightbox ----
(function () {
    'use strict';
    document.addEventListener('DOMContentLoaded', function () {
        var lb = document.getElementById('gearLightbox');
        if (!lb) return;
        var img = document.getElementById('gearLbImg');
        var count = document.getElementById('gearLbCount');
        var thumbs = Array.prototype.slice.call(document.querySelectorAll('.gear-thumb'));
        var group = [], idx = 0;

        thumbs.forEach(function (t) {
            t.addEventListener('click', function () {
                var g = t.getAttribute('data-group');
                group = thumbs.filter(function (x) { return x.getAttribute('data-group') === g; });
                idx = group.indexOf(t);
                open();
            });
        });

        function open() { show(); lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; }
        function close() { lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; }
        function show() {
            if (!group.length) return;
            img.src = group[idx].src;
            img.alt = group[idx].alt || '';
            count.textContent = (idx + 1) + ' / ' + group.length;
        }
        function step(d) { idx = (idx + d + group.length) % group.length; show(); }

        lb.querySelector('.gear-lb-next').addEventListener('click', function (e) { e.stopPropagation(); step(1); });
        lb.querySelector('.gear-lb-prev').addEventListener('click', function (e) { e.stopPropagation(); step(-1); });
        lb.querySelector('.gear-lb-close').addEventListener('click', close);
        lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
        document.addEventListener('keydown', function (e) {
            if (!lb.classList.contains('open')) return;
            if (e.key === 'Escape') close();
            else if (e.key === 'ArrowRight') step(1);
            else if (e.key === 'ArrowLeft') step(-1);
        });
    });
})();
// ---- Booking request (posts to the Worker instead of Formspree) ----
(function () {
    'use strict';
    var REQUEST_ENDPOINT = 'https://justroam-availability.edwinvandavenhorst.workers.dev/booking/request';
    var formLoadedAt = Date.now();

    document.addEventListener('DOMContentLoaded', function () {
        var form = document.querySelector('#request form');
        if (!form) return;

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            var errorEl = document.getElementById('g-date-error');
            var startVal = document.getElementById('g-start').value;
            var endVal = document.getElementById('g-end').value;

            if (!startVal || !endVal) {
                if (errorEl) errorEl.style.display = 'block';
                return;
            }
            if (errorEl) errorEl.style.display = 'none';

            var submitBtn = form.querySelector('button[type="submit"]');
            var originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = GEAR_T.sending;

            var payload = {
                item: document.getElementById('g-item').value,
                startDate: document.getElementById('g-start').value,
                endDate: document.getElementById('g-end').value,
                name: document.getElementById('g-name').value,
                email: document.getElementById('g-email').value,
                street: document.getElementById('g-street').value,
                houseNumber: document.getElementById('g-house-number').value,
                postcode: document.getElementById('g-postcode').value,
                city: document.getElementById('g-city').value,
                country: document.getElementById('g-country').value,
                phoneCountry: document.getElementById('g-phone-country').value,
                phone: document.getElementById('g-phone').value,
                message: document.getElementById('g-message').value,
                website: document.getElementById('g-website').value,
                formLoadedAt: formLoadedAt
            };

                        fetch(REQUEST_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
                .then(function (r) {
                    return r.json().then(function (data) {
                        if (!r.ok) throw new Error(data.message || data.error || 'Request failed');
                        return data;
                    });
                })
                .then(function () {
                    form.innerHTML = '<p class="gear-request-success">' + GEAR_T.success + '</p>';
                })
                .catch(function (err) {
                    console.error('Booking request failed:', err);
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                    alert(err.message || GEAR_T.genericError);
                });
        });
    });
})();