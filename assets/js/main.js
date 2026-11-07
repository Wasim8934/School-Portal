/**
 * AZAN PUBLIC SCHOOL - MAIN JAVASCRIPT
 * Handles interactivity, navigation, modal windows, forms, dynamic notices, events, and fees
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initCounters();
  initGalleryFilter();
  initAdmissionModals();
  initFeeCalculator();
  initContactForms();
  initPortalModal();
  renderDynamicNotices();
  renderDynamicEvents();
  applyDynamicSettings();
  renderMainFrontPicture();
  renderCampusSlider();
});

/* ================= 1. MOBILE NAVIGATION & SCROLL ================= */
function initNavigation() {
  const toggleBtn = document.querySelector('.mobile-nav-toggle');
  const mainNav = document.querySelector('.main-nav');
  const header = document.querySelector('.main-header');

  if (toggleBtn && mainNav) {
    toggleBtn.addEventListener('click', () => {
      mainNav.classList.toggle('active');
      const icon = toggleBtn.querySelector('i');
      if (icon) {
        if (mainNav.classList.contains('active')) {
          icon.classList.remove('fa-bars');
          icon.classList.add('fa-xmark');
        } else {
          icon.classList.remove('fa-xmark');
          icon.classList.add('fa-bars');
        }
      }
    });

    // Close mobile drawer when clicking outside
    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 992 && mainNav.classList.contains('active')) {
        if (!mainNav.contains(e.target) && !toggleBtn.contains(e.target)) {
          mainNav.classList.remove('active');
          const icon = toggleBtn.querySelector('i');
          if (icon) {
            icon.classList.remove('fa-xmark');
            icon.classList.add('fa-bars');
          }
        }
      }
    });
  }

  // Handle Mobile Accordion Dropdowns
  const dropdownToggles = document.querySelectorAll('.has-dropdown > .dropdown-toggle');
  dropdownToggles.forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      if (window.innerWidth <= 992) {
        e.preventDefault();
        const parent = toggle.closest('.has-dropdown');
        if (!parent) return;

        // Close other open accordion menus
        document.querySelectorAll('.has-dropdown.dropdown-active').forEach(item => {
          if (item !== parent) item.classList.remove('dropdown-active');
        });

        parent.classList.toggle('dropdown-active');
      }
    });
  });

  // Header scroll shadow
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  });
}

/* ================= 2. ANIMATED STAT COUNTERS ================= */
function initCounters() {
  const counters = document.querySelectorAll('.counter-val');
  if (!counters.length) return;

  let started = false;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !started) {
        started = true;
        counters.forEach(counter => {
          const target = +counter.getAttribute('data-target');
          let count = 0;
          const speed = target / 60; // 60 steps

          const updateCount = () => {
            count += speed;
            if (count < target) {
              counter.innerText = Math.ceil(count);
              requestAnimationFrame(updateCount);
            } else {
              counter.innerText = target;
            }
          };
          updateCount();
        });
      }
    });
  }, { threshold: 0.3 });

  const statsSection = document.querySelector('.stats-banner') || document.querySelector('.stats-grid');
  if (statsSection) {
    observer.observe(statsSection);
  }
}

/* ================= 3. GALLERY FILTER & LIGHTBOX ================= */
function initGalleryFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-card');

  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      galleryItems.forEach(item => {
        const itemCategory = item.getAttribute('data-category');
        if (filterValue === 'all' || itemCategory === filterValue) {
          item.style.display = 'block';
          item.style.animation = 'fadeIn 0.4s ease';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });

  // Lightbox click
  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const title = item.querySelector('h4')?.innerText || 'Azan Public School Event';
      const category = item.querySelector('span')?.innerText || 'Campus Photo';
      const imgSrc = item.querySelector('img')?.src;
      openLightbox(title, category, imgSrc);
    });
  });
}

function openLightbox(title, category, imgSrc) {
  let modal = document.getElementById('lightbox-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'lightbox-modal';
    modal.className = 'modal-backdrop';
    modal.innerHTML = `
      <div class="modal-container" style="max-width: 750px; background: #0b2545; color: #fff;">
        <div class="modal-header" style="background: transparent; border-bottom: 1px solid rgba(255,255,255,0.1);">
          <div>
            <h3 id="lightbox-title" style="color: #fff;"></h3>
            <span id="lightbox-cat" style="color: var(--accent-light); font-size: 0.8rem; text-transform: uppercase;"></span>
          </div>
          <button class="modal-close-btn" onclick="closeModal('lightbox-modal')">&times;</button>
        </div>
        <div class="modal-body" style="text-align: center; padding: 1.5rem;">
          <div id="lightbox-img-box" style="border-radius: var(--radius-md); overflow: hidden; background: #133a6f; min-height: 300px; display: flex; align-items: center; justify-content: center;">
            <i class="fa-solid fa-school" style="font-size: 5rem; color: rgba(255,255,255,0.3);"></i>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  document.getElementById('lightbox-title').innerText = title;
  document.getElementById('lightbox-cat').innerText = category;
  const box = document.getElementById('lightbox-img-box');
  if (imgSrc) {
    box.innerHTML = `<img src="${imgSrc}" alt="${title}" style="width: 100%; height: auto; max-height: 480px; object-fit: contain; border-radius: 8px;">`;
  } else {
    box.innerHTML = `
      <div style="padding: 3rem 1rem;">
        <i class="fa-solid fa-building-columns" style="font-size: 4rem; color: var(--accent-light); margin-bottom: 1rem;"></i>
        <h4 style="font-size: 1.25rem;">${title}</h4>
        <p style="color: #cbd5e1; font-size: 0.9rem; margin-top: 0.5rem;">Azan Public School Campus Activity & Learning Excellence</p>
      </div>
    `;
  }

  modal.classList.add('active');
}

/* ================= 4. ADMISSION FORMS & APPLICATION SLIP ================= */
function initAdmissionModals() {
  // Quick Inquiry Form (Home Hero)
  const quickForm = document.getElementById('quickInquiryForm');
  if (quickForm) {
    quickForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const parentName  = (quickForm.querySelector('[name="parentName"]')?.value  || '').trim();
      const studentName = (quickForm.querySelector('[name="studentName"]')?.value || '').trim();
      const grade       = (quickForm.querySelector('[name="grade"]')?.value       || '').trim();
      const phone       = (quickForm.querySelector('[name="phone"]')?.value       || '').trim();

      if (!studentName || !phone) {
        showToast('Please enter student name and phone number.', 'error');
        return;
      }

      // Save into DB
      const record = APS_DB.saveApplication({
        studentName: studentName,
        fatherName:  parentName,
        grade:       grade,
        phone:       phone,
        source:      'Homepage Quick Inquiry Form'
      });

      if (record) {
        showToast(`🎉 Inquiry received for ${studentName}! Saved in Admin Database with ID: ${record.id}`, 'success');
      } else {
        showToast('Inquiry submitted successfully.', 'success');
      }

      quickForm.reset();
    });
  }

  // Full Online Admission Form (admissions.html)
  const fullAdmissionForm = document.getElementById('onlineAdmissionForm');
  if (fullAdmissionForm) {
    fullAdmissionForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData    = new FormData(fullAdmissionForm);
      const studentName = (formData.get('studentName') || '').trim();
      const fatherName  = (formData.get('fatherName')  || '').trim();
      const grade       = (formData.get('grade')       || '').trim();
      const phone       = (formData.get('phone')       || '').trim();

      if (!studentName || !fatherName || !phone) {
        showToast('Please fill all required fields.', 'error');
        return;
      }

      // Save into DB
      const savedRecord = APS_DB.saveApplication({
        studentName: studentName,
        dob:         formData.get('dob')         || 'N/A',
        gender:      formData.get('gender')      || 'N/A',
        grade:       grade,
        bform:       formData.get('bform')       || 'N/A',
        prevSchool:  formData.get('prevSchool')  || 'N/A',
        fatherName:  fatherName,
        fatherCnic:  formData.get('fatherCnic')  || 'N/A',
        phone:       phone,
        email:       formData.get('email')       || 'N/A',
        occupation:  formData.get('occupation')  || 'N/A',
        transport:   formData.get('transport')   || 'No',
        address:     formData.get('address')     || 'N/A',
        source:      'Online Admission Form'
      });

      if (savedRecord) {
        const date = new Date().toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' });
        generateAdmissionSlip(savedRecord.id, studentName, fatherName, grade, phone, date);
        showToast(`🎉 Application saved! Reg ID: ${savedRecord.id} — Check Admin Dashboard.`, 'success');
      } else {
        const fallbackId = 'APS-2026-' + Math.floor(100000 + Math.random() * 900000);
        const date = new Date().toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' });
        generateAdmissionSlip(fallbackId, studentName, fatherName, grade, phone, date);
        showToast('⚠️ Form submitted but database save failed. Please re-submit.', 'error');
      }

      fullAdmissionForm.reset();
    });
  }
}

function generateAdmissionSlip(appNumber, studentName, fatherName, grade, phone, date) {
  let modal = document.getElementById('slip-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'slip-modal';
    modal.className = 'modal-backdrop';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-container" style="max-width: 620px;">
      <div class="modal-header" style="background: var(--secondary);">
        <h3><i class="fa-solid fa-circle-check"></i> Application Submitted Successfully!</h3>
        <button class="modal-close-btn" onclick="closeModal('slip-modal')">&times;</button>
      </div>
      <div class="modal-body" id="printable-slip">
        <div style="border: 2px dashed #0b2545; padding: 1.5rem; border-radius: var(--radius-md); background: #fdfdfd;">
          <div style="text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 1rem; margin-bottom: 1.25rem;">
            <div style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin-bottom: 0.25rem;">
              <span style="background: #0b2545; color: #fff; padding: 4px 8px; border-radius: 4px; font-weight: 800;">APS</span>
              <h2 style="font-size: 1.4rem; color: #0b2545; margin: 0;">AZAN PUBLIC SCHOOL</h2>
            </div>
            <p style="font-size: 0.8rem; color: #64748b; margin: 0;">Ladon, Peer Adil, Dera Ghazi Khan &bull; Contact: 0307-8208934</p>
            <p style="font-size: 0.75rem; color: #0f825e; font-weight: 600; margin-top: 2px;">Session 2026-2027 | Principal: Wasim Fida (BSCS)</p>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; background: #f1f5f9; padding: 0.6rem 1rem; border-radius: 6px;">
            <span style="font-weight: 600; font-size: 0.9rem;">Registration No: <strong style="color: #0b2545;">${appNumber}</strong></span>
            <span style="font-size: 0.85rem; color: #475569;">Date: <strong>${date}</strong></span>
          </div>

          <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem; margin-bottom: 1.25rem;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; width: 40%;">Candidate Name:</td>
              <td style="padding: 6px 0; font-weight: 700; color: #1e293b;">${studentName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Father's Name:</td>
              <td style="padding: 6px 0; font-weight: 700; color: #1e293b;">${fatherName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Class Applied For:</td>
              <td style="padding: 6px 0; font-weight: 700; color: #0f825e;">${grade}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Contact / WhatsApp:</td>
              <td style="padding: 6px 0; font-weight: 700; color: #1e293b;">${phone}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Admission Test & Interview:</td>
              <td style="padding: 6px 0; font-weight: 700; color: #d99a26;">Saturday, 10:00 AM (Campus Office, Peer Adil)</td>
            </tr>
          </table>

          <div style="background: #fffbeb; border: 1px solid #fef3c7; border-radius: 6px; padding: 0.75rem; font-size: 0.8rem; color: #92400e; margin-bottom: 1.25rem;">
            <strong>Instructions:</strong> Please bring 2 passport-size photographs, student's Birth Certificate / B-Form copy, and father's CNIC copy along with this slip to the school admission desk.
          </div>

          <div style="display: flex; justify-content: space-between; gap: 1rem; align-items: center;">
            <button class="btn btn-outline btn-sm" onclick="window.print()">
              <i class="fa-solid fa-print"></i> Print Slip
            </button>
            <button class="btn btn-secondary btn-sm" onclick="closeModal('slip-modal')">
              <i class="fa-solid fa-check"></i> Done
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  modal.classList.add('active');
}

/* ================= 5. DYNAMIC FEE CALCULATOR ================= */
function initFeeCalculator() {
  const calcGrade = document.getElementById('calcGrade');
  const calcTransport = document.getElementById('calcTransport');
  const calcDiscount = document.getElementById('calcDiscount');

  if (!calcGrade) return;

  function calculate() {
    const gradeVal = calcGrade.value;
    const feeConfig = window.APS_DB ? APS_DB.getFeeStructure() : null;

    let admissionFee = 5000;
    let tuitionFee = 4200;
    let labFee = 0;
    let discountPercent = 15;

    if (feeConfig && feeConfig.grades && feeConfig.grades[gradeVal]) {
      admissionFee    = feeConfig.grades[gradeVal].admissionFee;
      tuitionFee      = feeConfig.grades[gradeVal].tuitionFee;
      labFee          = feeConfig.grades[gradeVal].labFee;
      discountPercent = feeConfig.siblingDiscountPercent || 15;
    } else {
      switch(gradeVal) {
        case 'playgroup': case 'nursery': case 'prep':
          tuitionFee = 3200; admissionFee = 4000; break;
        case 'primary':
          tuitionFee = 4200; admissionFee = 5000; break;
        case 'middle':
          tuitionFee = 5500; admissionFee = 6000; labFee = 500; break;
        case 'matric':
          tuitionFee = 6800; admissionFee = 7000; labFee = 1000; break;
        case 'olevels':
          tuitionFee = 11000; admissionFee = 12000; labFee = 2000; break;
      }
    }

    let transportCost = 0;
    const transVal = calcTransport ? calcTransport.value : '0';
    if (transVal !== '0' && transVal !== 'none') {
      if (feeConfig && feeConfig.transport) {
        if (transVal === '1500') transportCost = feeConfig.transport.zone1 || 1500;
        else if (transVal === '2200') transportCost = feeConfig.transport.zone2 || 2200;
        else if (transVal === '3000') transportCost = feeConfig.transport.zone3 || 3000;
        else transportCost = parseInt(transVal, 10) || 0;
      } else {
        transportCost = parseInt(transVal, 10) || 0;
      }
    }

    let monthlyTotal = tuitionFee + labFee + transportCost;

    if (calcDiscount && calcDiscount.checked) {
      monthlyTotal = Math.round(monthlyTotal * ((100 - discountPercent) / 100));
    }

    const tFeeEl  = document.getElementById('calcTuitionFee');
    const aFeeEl  = document.getElementById('calcAdmFee');
    const lFeeEl  = document.getElementById('calcLabFee');
    const transEl = document.getElementById('calcTransFee');
    const totEl   = document.getElementById('calcTotalMonthly');

    if (tFeeEl)  tFeeEl.innerText  = `PKR ${tuitionFee.toLocaleString()}`;
    if (aFeeEl)  aFeeEl.innerText  = `PKR ${admissionFee.toLocaleString()} (One-Time)`;
    if (lFeeEl)  lFeeEl.innerText  = labFee ? `PKR ${labFee.toLocaleString()}` : 'Included';
    if (transEl) transEl.innerText = transportCost ? `PKR ${transportCost.toLocaleString()}` : 'None';
    if (totEl)   totEl.innerText   = `PKR ${monthlyTotal.toLocaleString()}`;
  }

  calcGrade.addEventListener('change', calculate);
  if (calcTransport) calcTransport.addEventListener('change', calculate);
  if (calcDiscount)  calcDiscount.addEventListener('change', calculate);

  calculate();
}

/* ================= 6. DYNAMIC NOTICES RENDERING ================= */
function renderDynamicNotices() {
  if (!window.APS_DB) return;
  const notices = APS_DB.getAllNotices();

  // 1. Homepage Notice List (top 3-4)
  const homeList = document.getElementById('homeNoticeList');
  if (homeList) {
    if (!notices.length) {
      homeList.innerHTML = `<p style="padding:1rem;color:#64748b;font-size:0.85rem;">No circulars at the moment.</p>`;
    } else {
      let html = '';
      notices.slice(0, 3).forEach(n => {
        html += `
          <div class="notice-item">
            <div class="notice-date">
              <span class="day">${n.day}</span>
              <span class="month">${n.month}</span>
            </div>
            <div class="notice-info">
              <h4>${n.title}</h4>
              <p>${n.desc}</p>
            </div>
          </div>
        `;
      });
      homeList.innerHTML = html;
    }
  }

  // 2. Full Notices Page List (notices.html)
  const fullList = document.getElementById('noticesFullList');
  if (fullList) {
    if (!notices.length) {
      fullList.innerHTML = `<p style="padding:2rem;text-align:center;color:#64748b;">No notices posted yet.</p>`;
    } else {
      let html = '';
      notices.forEach(n => {
        const catClass = (n.category || 'General').toLowerCase().includes('exam') ? '#d1fae5' : '#e0e7ff';
        const catText  = (n.category || 'General').toLowerCase().includes('exam') ? '#065f46' : '#3730a3';

        html += `
          <div style="background:var(--bg-surface);padding:1.5rem;border-radius:var(--radius-md);border-left:5px solid var(--secondary);display:flex;gap:1.5rem;align-items:flex-start;">
            <div class="notice-date" style="flex-shrink:0;">
              <span class="day">${n.day}</span>
              <span class="month">${n.month}</span>
            </div>
            <div>
              <div style="display:flex;gap:0.5rem;align-items:center;margin-bottom:0.3rem;">
                <span style="background:${catClass};color:${catText};font-size:0.72rem;font-weight:700;padding:2px 8px;border-radius:4px;text-transform:uppercase;">
                  ${n.category}
                </span>
                <span style="font-size:0.8rem;color:#64748b;">${n.ref || 'Ref # APS/NOT'}</span>
              </div>
              <h3 style="font-size:1.15rem;font-weight:700;color:var(--primary);margin-bottom:0.4rem;">
                ${n.title}
              </h3>
              <p style="font-size:0.88rem;color:var(--text-main);line-height:1.6;margin-bottom:0.75rem;">
                ${n.desc}
              </p>
              ${n.link ? `
                <a href="${n.link}" style="font-size:0.82rem;font-weight:700;color:var(--secondary);display:inline-flex;align-items:center;gap:0.3rem;">
                  <i class="fa-solid fa-file-pdf"></i> Download Document &darr;
                </a>` : ''}
            </div>
          </div>
        `;
      });
      fullList.innerHTML = html;
    }
  }
}

/* ================= 7. DYNAMIC EVENTS RENDERING ================= */
function renderDynamicEvents() {
  if (!window.APS_DB) return;
  const events = APS_DB.getAllEvents();

  // 1. Homepage Events Box
  const homeEvents = document.getElementById('homeEventsList');
  if (homeEvents) {
    if (!events.length) {
      homeEvents.innerHTML = `<p style="padding:1rem;color:#64748b;font-size:0.85rem;">No scheduled events at the moment.</p>`;
    } else {
      let html = '';
      events.slice(0, 2).forEach(evt => {
        html += `
          <div style="background:var(--bg-surface);padding:0.9rem 1rem;border-radius:var(--radius-md);border-left:4px solid var(--accent);display:flex;justify-content:space-between;align-items:center;">
            <div>
              <span style="font-size:0.72rem;font-weight:700;color:var(--secondary);text-transform:uppercase;letter-spacing:0.5px;">
                <i class="fa-solid fa-calendar-day"></i> ${evt.date} &bull; ${evt.category}
              </span>
              <h4 style="font-size:0.92rem;font-weight:700;color:var(--primary);margin:2px 0 0 0;">
                ${evt.title}
              </h4>
              <p style="font-size:0.75rem;color:#64748b;margin:2px 0 0 0;">
                <i class="fa-solid fa-location-dot"></i> ${evt.venue}
              </p>
            </div>
            <span style="background:#e0f2fe;color:#0284c7;font-size:0.72rem;font-weight:800;padding:2px 8px;border-radius:9999px;">
              ${evt.status}
            </span>
          </div>
        `;
      });
      homeEvents.innerHTML = html;
    }
  }

  // 2. Notices / Events Page Grid
  const eventsGrid = document.getElementById('noticesPageEventsList');
  if (eventsGrid) {
    if (!events.length) {
      eventsGrid.innerHTML = `<p style="padding:2rem;text-align:center;color:#64748b;grid-column:1/-1;">No events in the schedule.</p>`;
    } else {
      let html = '';
      events.forEach(evt => {
        html += `
          <div style="background:#fff;border-radius:var(--radius-lg);padding:1.5rem;border:1px solid var(--border-color);box-shadow:var(--shadow-sm);display:flex;flex-direction:column;justify-content:space-between;">
            <div>
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem;">
                <span style="background:rgba(15,130,94,0.1);color:var(--secondary);font-size:0.75rem;font-weight:700;padding:3px 8px;border-radius:4px;text-transform:uppercase;">
                  ${evt.category}
                </span>
                <span style="background:#e0f2fe;color:#0284c7;font-size:0.72rem;font-weight:700;padding:2px 8px;border-radius:9999px;">
                  ${evt.status}
                </span>
              </div>
              <h3 style="font-size:1.15rem;font-weight:800;color:var(--primary);margin-bottom:0.5rem;line-height:1.3;">
                ${evt.title}
              </h3>
              <p style="font-size:0.85rem;color:#64748b;margin-bottom:1rem;line-height:1.5;">
                ${evt.desc || ''}
              </p>
            </div>
            <div style="border-top:1px solid #f1f5f9;padding-top:0.75rem;font-size:0.82rem;color:#475569;">
              <div style="margin-bottom:3px;"><i class="fa-solid fa-calendar" style="color:var(--secondary);width:16px;"></i> <strong>${evt.date}</strong> (${evt.time || '09:00 AM'})</div>
              <div><i class="fa-solid fa-location-dot" style="color:var(--accent);width:16px;"></i> ${evt.venue}</div>
            </div>
          </div>
        `;
      });
      eventsGrid.innerHTML = html;
    }
  }
}

/* ================= 8. DYNAMIC SETTINGS & TICKER ================= */
function applyDynamicSettings() {
  if (!window.APS_DB) return;
  const s = APS_DB.getSettings();
  if (!s) return;

  // Check if any pinned notice exists to display on marquee
  const notices = APS_DB.getAllNotices();
  const pinnedNotice = notices.find(n => n.pinned);

  const tickerSpans = document.querySelectorAll('.top-announcement-ticker span:last-child');
  if (tickerSpans.length) {
    tickerSpans.forEach(span => {
      if (pinnedNotice) {
        span.innerText = `📢 ${pinnedNotice.title} (${pinnedNotice.date})`;
      } else if (s.announcementTicker) {
        span.innerText = s.announcementTicker;
      }
    });
  }
}

/* ================= 9. CONTACT FORMS ================= */
function initContactForms() {
  const contactForm = document.getElementById('schoolContactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast('Thank you! Your message has been sent to Azan Public School administration. We will reply promptly.', 'success');
      contactForm.reset();
    });
  }

  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast('Thank you for subscribing to Azan Public School newsletter!', 'success');
      newsletterForm.reset();
    });
  }
}

/* ================= 10. STUDENT / PARENT PORTAL MODAL ================= */
function initPortalModal() {
  const portalTriggers = document.querySelectorAll('.open-portal-modal');
  portalTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openPortalModal();
    });
  });
}

function openPortalModal() {
  let modal = document.getElementById('portal-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'portal-modal';
    modal.className = 'modal-backdrop';
    modal.innerHTML = `
      <div class="modal-container" style="max-width: 440px;">
        <div class="modal-header" style="background: var(--primary);">
          <h3><i class="fa-solid fa-user-graduate"></i> Student & Parent Portal</h3>
          <button class="modal-close-btn" onclick="closeModal('portal-modal')">&times;</button>
        </div>
        <div class="modal-body">
          <p style="font-size: 0.85rem; color: #64748b; margin-bottom: 1.25rem;">Log in to access student attendance, marks sheets, fee vouchers, and teacher notices.</p>
          <form id="portalLoginForm">
            <div style="margin-bottom: 1rem;">
              <label style="display: block; font-size: 0.82rem; font-weight: 700; margin-bottom: 0.3rem;">Student ID / Roll No</label>
              <input type="text" placeholder="e.g. APS-2026-1042" required style="width: 100%; padding: 0.7rem; border: 1px solid #cbd5e1; border-radius: 6px;">
            </div>
            <div style="margin-bottom: 1.25rem;">
              <label style="display: block; font-size: 0.82rem; font-weight: 700; margin-bottom: 0.3rem;">Password</label>
              <input type="password" placeholder="••••••••" required style="width: 100%; padding: 0.7rem; border: 1px solid #cbd5e1; border-radius: 6px;">
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%;">Sign In</button>
            <p style="font-size: 0.75rem; text-align: center; color: #94a3b8; margin-top: 1rem;">For demo, enter any Student ID and password to preview.</p>
          </form>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const form = modal.querySelector('#portalLoginForm');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      closeModal('portal-modal');
      showToast('Welcome back! Loading student dashboard...', 'success');
    });
  }

  modal.classList.add('active');
}

/* ================= UTILITY FUNCTIONS ================= */
function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.remove('active');
  }
}

// Global modal background click close
window.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-backdrop')) {
    e.target.classList.remove('active');
  }
});

function showToast(message, type = 'info') {
  let toastContainer = document.querySelector('.toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = `toast-msg ${type}`;
  toast.innerHTML = `
    <i class="fa-solid fa-circle-check" style="font-size: 1.1rem; color: #34d399;"></i>
    <span>${message}</span>
  `;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

/* ================= 11. FRONT MAIN CAMPUS PICTURE ================= */
function renderMainFrontPicture() {
  if (!window.APS_DB) return;
  const banner = APS_DB.getBannerData();
  if (!banner) return;

  const imgEl = document.getElementById('frontMainImage');
  const titleEl = document.getElementById('frontTitle');
  const subEl = document.getElementById('frontSubtitle');
  const badgeEl = document.getElementById('frontBadge');

  if (imgEl && banner.mainImageUrl) {
    imgEl.src = banner.mainImageUrl;
    imgEl.alt = banner.title || 'Azan Public School Main Campus';
  }
  if (titleEl && banner.title) {
    titleEl.textContent = banner.title;
  }
  if (subEl && banner.subtitle) {
    subEl.textContent = banner.subtitle;
  }
  if (badgeEl && banner.badge) {
    badgeEl.innerHTML = `<i class="fa-solid fa-award"></i> ${banner.badge}`;
  }
}

/* ================= 12. CAMPUS IMAGE SLIDER / CAROUSEL (RIGHT-TO-LEFT HORIZONTAL SLIDER) ================= */
let campusCurrentSlide = 0;
let campusProgressInterval = null;
let campusProgressVal = 0;
const CAMPUS_SLIDE_DURATION = 4000; // 4 seconds per slide
const CAMPUS_PROGRESS_STEP = 50;     // update progress every 50ms

function renderCampusSlider() {
  try {
    const track = document.getElementById('campusSliderTrack');
    const dotsBox = document.getElementById('sliderDotsBox');
    const sliderContainer = document.getElementById('campusSliderContainer');

    if (!track) return;

    let slides = [];
    if (window.APS_DB && typeof APS_DB.getSliderData === 'function') {
      slides = APS_DB.getSliderData();
    }

    if (slides && slides.length > 0) {
      let slidesHtml = '';
      let dotsHtml = '';

      slides.forEach((slide, idx) => {
        const isActive = idx === 0 ? 'active' : '';
        slidesHtml += `
          <div class="campus-slide-item ${isActive}" data-slide-index="${idx}">
            <img src="${slide.imageUrl}" alt="${slide.title}" class="campus-slide-img" loading="${idx === 0 ? 'eager' : 'lazy'}" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1200&q=80'">
            <div class="campus-slide-caption">
              <span class="slide-tag"><i class="fa-solid fa-camera-retro"></i> ${slide.tag || 'Campus Highlights'}</span>
              <h3 class="slide-title">${slide.title}</h3>
              <p class="slide-desc">${slide.caption}</p>
            </div>
          </div>
        `;
        dotsHtml += `
          <button class="slider-dot-btn ${isActive}" onclick="goToCampusSlide(${idx})" aria-label="Slide ${idx + 1}"></button>
        `;
      });

      track.innerHTML = slidesHtml;
      if (dotsBox) dotsBox.innerHTML = dotsHtml;
    } else {
      // If HTML already has static slides, build dots for them
      const staticSlides = track.querySelectorAll('.campus-slide-item');
      if (dotsBox && staticSlides.length) {
        let dotsHtml = '';
        staticSlides.forEach((_, idx) => {
          dotsHtml += `<button class="slider-dot-btn ${idx === 0 ? 'active' : ''}" onclick="goToCampusSlide(${idx})" aria-label="Slide ${idx + 1}"></button>`;
        });
        dotsBox.innerHTML = dotsHtml;
      }
    }

    campusCurrentSlide = 0;
    updateCampusSliderPosition();

    // Auto-rotation right to left
    startCampusSliderTimer();

    // Pause on hover
    if (sliderContainer) {
      sliderContainer.onmouseenter = () => pauseCampusSlider();
      sliderContainer.onmouseleave = () => resumeCampusSlider();

      // Mobile Touch Swipe support
      let touchStartX = 0;
      let touchEndX = 0;
      sliderContainer.ontouchstart = (e) => {
        touchStartX = e.changedTouches[0].screenX;
        pauseCampusSlider();
      };
      sliderContainer.ontouchend = (e) => {
        touchEndX = e.changedTouches[0].screenX;
        if (touchStartX - touchEndX > 50) {
          nextCampusSlide(); // swiped left -> next
        } else if (touchEndX - touchStartX > 50) {
          prevCampusSlide(); // swiped right -> prev
        }
        resumeCampusSlider();
      };
    }
  } catch (err) {
    console.warn('Campus slider init warning:', err);
  }
}

function updateCampusSliderPosition() {
  const track = document.getElementById('campusSliderTrack');
  const slides = document.querySelectorAll('.campus-slide-item');
  const dots = document.querySelectorAll('.slider-dot-btn');
  const progressBar = document.getElementById('sliderProgressBar');

  if (!track || !slides.length) return;

  if (campusCurrentSlide >= slides.length) campusCurrentSlide = 0;
  if (campusCurrentSlide < 0) campusCurrentSlide = slides.length - 1;

  // Move the entire track from Right to Left
  track.style.transform = `translateX(-${campusCurrentSlide * 100}%)`;

  slides.forEach((slide, idx) => {
    slide.classList.toggle('active', idx === campusCurrentSlide);
  });

  dots.forEach((dot, idx) => {
    dot.classList.toggle('active', idx === campusCurrentSlide);
  });

  if (progressBar) progressBar.style.width = '0%';
  campusProgressVal = 0;
}

function nextCampusSlide() {
  const slides = document.querySelectorAll('.campus-slide-item');
  if (!slides.length) return;
  campusCurrentSlide = (campusCurrentSlide + 1) % slides.length;
  updateCampusSliderPosition();
  resetCampusSliderTimer();
}

function prevCampusSlide() {
  const slides = document.querySelectorAll('.campus-slide-item');
  if (!slides.length) return;
  campusCurrentSlide = (campusCurrentSlide - 1 + slides.length) % slides.length;
  updateCampusSliderPosition();
  resetCampusSliderTimer();
}

function goToCampusSlide(idx) {
  campusCurrentSlide = idx;
  updateCampusSliderPosition();
  resetCampusSliderTimer();
}

function startCampusSliderTimer() {
  stopCampusSliderTimer();
  const progressBar = document.getElementById('sliderProgressBar');

  campusProgressInterval = setInterval(() => {
    campusProgressVal += (CAMPUS_PROGRESS_STEP / CAMPUS_SLIDE_DURATION) * 100;
    if (progressBar) progressBar.style.width = Math.min(campusProgressVal, 100) + '%';
    if (campusProgressVal >= 100) {
      nextCampusSlide();
    }
  }, CAMPUS_PROGRESS_STEP);
}

function stopCampusSliderTimer() {
  if (campusProgressInterval) {
    clearInterval(campusProgressInterval);
    campusProgressInterval = null;
  }
}

function pauseCampusSlider() {
  stopCampusSliderTimer();
}

function resumeCampusSlider() {
  startCampusSliderTimer();
}

function resetCampusSliderTimer() {
  campusProgressVal = 0;
  const progressBar = document.getElementById('sliderProgressBar');
  if (progressBar) progressBar.style.width = '0%';
  startCampusSliderTimer();
}

// Window bindings for inline HTML onclick calls
window.nextCampusSlide = nextCampusSlide;
window.prevCampusSlide = prevCampusSlide;
window.goToCampusSlide = goToCampusSlide;

// Realtime cross-tab storage sync
window.addEventListener('storage', (e) => {
  if (e.key === 'aps_home_banner_v1') renderMainFrontPicture();
  if (e.key === 'aps_home_slider_v1') renderCampusSlider();
});
