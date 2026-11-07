/**
 * AZAN PUBLIC SCHOOL - ADMIN CONTROL PANEL CONTROLLER
 * Full management of Admissions, Notices, Events, Fees & School Settings
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Auth check
  const user = APS_DB.requireAuth();
  if (user) {
    const nameEl = document.getElementById('adminUserName');
    if (nameEl) nameEl.innerText = user.user;
  }

  // 2. Initialize all modules
  loadApplicationsTable();
  updateNewSubmissionsBadge();

  loadNoticesTable();
  loadEventsTable();
  loadFeeStructureIntoForm();
  loadSettingsIntoForm();
  loadBannerSliderIntoAdmin();
  loadResultsTable();
  updateResultsMetrics();
  runFeePreview();

  // 3. Admissions Search & filter listeners
  document.getElementById('searchInput')?.addEventListener('input', loadApplicationsTable);
  document.getElementById('filterGrade')?.addEventListener('change', loadApplicationsTable);
  document.getElementById('filterStatus')?.addEventListener('change', loadApplicationsTable);

  // 4. Manual Admission form submit
  const manualForm = document.getElementById('manualAddForm');
  if (manualForm) {
    manualForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(manualForm);
      APS_DB.saveApplication({
        studentName : fd.get('studentName') || '',
        grade       : fd.get('grade')       || '',
        fatherName  : fd.get('fatherName')  || '',
        phone       : fd.get('phone')       || '',
        gender      : fd.get('gender')      || '',
        transport   : fd.get('transport')   || 'No',
        address     : fd.get('address')     || '',
        source      : 'Admin Manual Entry'
      });
      manualForm.reset();
      closeModal('addManualModal');
      loadApplicationsTable();
      showAdminToast('Application manually recorded in database!', 'success');
    });
  }

  // 5. Notice Form Submit
  const noticeForm = document.getElementById('noticeForm');
  if (noticeForm) {
    noticeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      saveNoticeFromAdmin();
    });
  }

  // 6. Event Form Submit
  const eventForm = document.getElementById('eventForm');
  if (eventForm) {
    eventForm.addEventListener('submit', (e) => {
      e.preventDefault();
      saveEventFromAdmin();
    });
  }

  // 7. Settings Form Submit
  const settingsForm = document.getElementById('schoolSettingsForm');
  if (settingsForm) {
    settingsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      saveSettingsFromAdmin();
    });
  }

  // 8. Main Banner Form Submit
  const bannerForm = document.getElementById('homeBannerForm');
  if (bannerForm) {
    bannerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      saveMainBannerFromAdmin();
    });
  }

  // 9. Slider Form Submit
  const slideForm = document.getElementById('slideForm');
  if (slideForm) {
    slideForm.addEventListener('submit', (e) => {
      e.preventDefault();
      saveSlideFromAdmin();
    });
  }

  // 10. Result Form Submit & Filters
  const resultForm = document.getElementById('resultForm');
  if (resultForm) {
    resultForm.addEventListener('submit', (e) => {
      e.preventDefault();
      saveResultFromAdmin();
    });
  }

  document.getElementById('resSearchInput')?.addEventListener('input', loadResultsTable);
  document.getElementById('resFilterGrade')?.addEventListener('change', loadResultsTable);
  document.getElementById('resFilterTerm')?.addEventListener('change', loadResultsTable);
  document.getElementById('resFilterStatus')?.addEventListener('change', loadResultsTable);

  // 11. Storage synchronization listener
  window.addEventListener('storage', (event) => {
    if (event.key === APS_DB.STORAGE_KEY) {
      loadApplicationsTable();
      updateNewSubmissionsBadge();
    }
    if (event.key === APS_DB.NOTICES_KEY) loadNoticesTable();
    if (event.key === APS_DB.EVENTS_KEY) loadEventsTable();
    if (event.key === APS_DB.FEE_KEY) {
      loadFeeStructureIntoForm();
      runFeePreview();
    }
    if (event.key === APS_DB.BANNER_KEY || event.key === APS_DB.SLIDER_KEY) {
      loadBannerSliderIntoAdmin();
    }
    if (event.key === APS_DB.RESULTS_KEY) {
      loadResultsTable();
      updateResultsMetrics();
    }
  });

  // 9. Periodic refresh for live changes
  let lastAppCount = APS_DB.getAllApplications().length;
  setInterval(() => {
    const currentCount = APS_DB.getAllApplications().length;
    if (currentCount !== lastAppCount) {
      lastAppCount = currentCount;
      loadApplicationsTable();
      updateNewSubmissionsBadge();
    }
  }, 5000);

  APS_DB.clearNewCount();
  updateNewSubmissionsBadge();
});


/* ══════════════════════════════════════════════════════════════
   TAB SWITCHING
══════════════════════════════════════════════════════════════ */
function switchAdminTab(tabId) {
  // Update Buttons
  document.querySelectorAll('.admin-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
  });

  // Update Panes
  document.querySelectorAll('.admin-tab-pane').forEach(pane => {
    pane.classList.toggle('active', pane.id === tabId);
  });
}


/* ══════════════════════════════════════════════════════════════
   1. ADMISSIONS CONTROLLER
══════════════════════════════════════════════════════════════ */
function loadApplicationsTable() {
  const tableBody = document.getElementById('applicationsTableBody');
  if (!tableBody) return;

  const applications = APS_DB.getAllApplications();
  updateMetrics(applications);

  // Update Tab Count
  const tabBadge = document.getElementById('tabApplicantsCount');
  if (tabBadge) tabBadge.innerText = applications.length;

  const searchVal = (document.getElementById('searchInput')?.value || '').toLowerCase().trim();
  const gradeVal  = (document.getElementById('filterGrade')?.value  || 'all');
  const statusVal = (document.getElementById('filterStatus')?.value || 'all');

  const filtered = applications.filter(item => {
    const matchSearch = !searchVal ||
      (item.studentName || '').toLowerCase().includes(searchVal) ||
      (item.fatherName  || '').toLowerCase().includes(searchVal) ||
      (item.id          || '').toLowerCase().includes(searchVal) ||
      (item.phone       || '').toLowerCase().includes(searchVal);

    const matchGrade  = gradeVal  === 'all' || (item.grade  || '').includes(gradeVal);
    const matchStatus = statusVal === 'all' || item.status === statusVal;

    return matchSearch && matchGrade && matchStatus;
  });

  if (!filtered.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center;padding:2.5rem;color:#64748b;">
          <i class="fa-solid fa-folder-open" style="font-size:2.5rem;color:#cbd5e1;display:block;margin-bottom:0.75rem;"></i>
          <p style="font-size:1rem;font-weight:600;">No admission applications found.</p>
          <span style="font-size:0.82rem;">Adjust search / filter, or add an application manually.</span>
        </td>
      </tr>`;
    return;
  }

  let html = '';
  filtered.forEach(item => {
    const cleanPhone = (item.phone || '').replace(/[^0-9]/g, '');
    const waLink = `https://wa.me/92${cleanPhone.startsWith('0') ? cleanPhone.slice(1) : cleanPhone}`;

    const genderIcon = item.gender === 'Female'
      ? '<i class="fa-solid fa-venus" style="color:#ec4899;"></i>'
      : '<i class="fa-solid fa-mars"  style="color:#3b82f6;"></i>';

    const isNew = (item.source || '').includes('Form') && item.status === 'Pending';
    const newBadge = isNew
      ? '<span style="background:#dcfce7;color:#15803d;font-size:0.65rem;font-weight:800;padding:1px 6px;border-radius:9999px;margin-left:4px;">NEW</span>'
      : '';

    html += `
      <tr style="${isNew ? 'background:#f0fdf4;' : ''}">
        <td>
          <strong style="color:var(--primary);font-family:monospace;font-size:0.92rem;">${item.id}</strong>${newBadge}
          <div style="font-size:0.7rem;color:#94a3b8;margin-top:2px;">${item.source || 'Form'}</div>
        </td>
        <td>
          <div style="font-weight:700;color:#0f172a;display:flex;align-items:center;gap:0.4rem;">
            ${genderIcon} ${item.studentName}
          </div>
          <div style="font-size:0.75rem;color:#64748b;">DOB: ${item.dob || 'N/A'}</div>
        </td>
        <td>
          <span style="background:#f1f5f9;padding:3px 8px;border-radius:4px;font-weight:600;color:var(--primary);font-size:0.82rem;">
            ${item.grade}
          </span>
        </td>
        <td>
          <div style="font-weight:600;color:#1e293b;">${item.fatherName}</div>
          <div style="font-size:0.8rem;color:#475569;display:flex;align-items:center;gap:0.4rem;">
            <i class="fa-solid fa-phone" style="font-size:0.75rem;"></i> ${item.phone}
            <a href="${waLink}" target="_blank" title="WhatsApp Message" style="color:#25d366;font-size:0.9rem;">
              <i class="fa-brands fa-whatsapp"></i>
            </a>
          </div>
        </td>
        <td style="font-size:0.82rem;color:#64748b;">
          ${item.submissionDate}
        </td>
        <td>
          <select onchange="changeStatus('${item.id}', this.value)" style="padding:0.25rem 0.5rem;border-radius:4px;font-size:0.8rem;font-weight:700;border:1px solid #cbd5e1;background:#fff;cursor:pointer;">
            <option value="Pending"      ${item.status === 'Pending'      ? 'selected' : ''}>⏳ Pending</option>
            <option value="Under Review" ${item.status === 'Under Review' ? 'selected' : ''}>🔍 Under Review</option>
            <option value="Approved"     ${item.status === 'Approved'     ? 'selected' : ''}>✅ Approved</option>
            <option value="Rejected"     ${item.status === 'Rejected'     ? 'selected' : ''}>❌ Rejected</option>
          </select>
        </td>
        <td style="text-align:right;">
          <div class="action-btn-group" style="justify-content:flex-end;">
            <button class="action-icon-btn" title="View Full Details" onclick="viewDetails('${item.id}')">
              <i class="fa-solid fa-eye"></i>
            </button>
            <a href="${waLink}" target="_blank" class="action-icon-btn btn-wa" title="WhatsApp Direct">
              <i class="fa-brands fa-whatsapp"></i>
            </a>
            <button class="action-icon-btn" title="Print Admission Slip" onclick="printApplication('${item.id}')">
              <i class="fa-solid fa-print"></i>
            </button>
            <button class="action-icon-btn btn-delete" title="Delete Record" onclick="deleteRecord('${item.id}')">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>`;
  });

  tableBody.innerHTML = html;
}

function updateMetrics(list) {
  const total     = list.length;
  const pending   = list.filter(i => i.status === 'Pending').length;
  const approved  = list.filter(i => i.status === 'Approved').length;
  const transport = list.filter(i => i.transport === 'Yes').length;

  const elTotal = document.getElementById('metricTotal');
  const elPend  = document.getElementById('metricPending');
  const elApp   = document.getElementById('metricApproved');
  const elTrans = document.getElementById('metricTransport');

  if (elTotal) elTotal.innerText = total;
  if (elPend)  elPend.innerText  = pending;
  if (elApp)   elApp.innerText   = approved;
  if (elTrans) elTrans.innerText = transport;
}

function updateNewSubmissionsBadge() {
  const badge = document.getElementById('newSubmissionsBadge');
  if (!badge) return;
  const count = APS_DB.getNewCount();
  if (count > 0) {
    badge.innerText = `+${count} NEW`;
    badge.style.display = 'inline-block';
  } else {
    badge.style.display = 'none';
  }
}

function changeStatus(id, newStatus) {
  APS_DB.updateStatus(id, newStatus);
  loadApplicationsTable();
  showAdminToast(`Application ${id} status changed to ${newStatus}.`, 'success');
}

function deleteRecord(id) {
  if (confirm(`Are you sure you want to delete application ${id}?`)) {
    APS_DB.deleteApplication(id);
    loadApplicationsTable();
    showAdminToast('Application deleted.', 'info');
  }
}

function viewDetails(id) {
  const list = APS_DB.getAllApplications();
  const item = list.find(i => i.id === id);
  if (!item) return;

  const modal = document.getElementById('detailsModal');
  const title = document.getElementById('modalStudentName');
  const content = document.getElementById('modalDetailsContent');

  title.innerHTML = `<i class="fa-solid fa-user-graduate"></i> Application: ${item.studentName} (${item.id})`;

  const cleanPhone = (item.phone || '').replace(/[^0-9]/g, '');
  const waLink = `https://wa.me/92${cleanPhone.startsWith('0') ? cleanPhone.slice(1) : cleanPhone}`;

  content.innerHTML = `
    <div style="background:#f8fafc;padding:1.25rem;border-radius:8px;border:1px solid #e2e8f0;margin-bottom:1.25rem;">
      <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #e2e8f0;padding-bottom:0.75rem;margin-bottom:0.75rem;">
        <div>
          <span style="font-size:0.8rem;color:#64748b;">Registration ID</span>
          <h3 style="color:var(--primary);font-size:1.3rem;margin:0;">${item.id}</h3>
        </div>
        <div style="text-align:right;">
          <span style="font-size:0.8rem;color:#64748b;">Status</span>
          <div><span class="status-badge status-${(item.status||'').replace(/\s+/g,'-')}">${item.status}</span></div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.85rem;font-size:0.9rem;">
        <div><strong>Student Name:</strong> ${item.studentName}</div>
        <div><strong>Gender:</strong> ${item.gender || 'N/A'}</div>
        <div><strong>Date of Birth:</strong> ${item.dob || 'N/A'}</div>
        <div><strong>Class Applied For:</strong> <span style="color:var(--secondary);font-weight:700;">${item.grade}</span></div>
        <div><strong>B-Form Number:</strong> ${item.bform || 'N/A'}</div>
        <div><strong>Previous School:</strong> ${item.prevSchool || 'N/A'}</div>
        <div><strong>Father's Name:</strong> ${item.fatherName}</div>
        <div><strong>Father's CNIC:</strong> ${item.fatherCnic || 'N/A'}</div>
        <div><strong>Father's Profession:</strong> ${item.occupation || 'N/A'}</div>
        <div><strong>Mobile Contact:</strong> ${item.phone}</div>
        <div><strong>Email:</strong> ${item.email || 'N/A'}</div>
        <div><strong>School Transport:</strong> <strong style="color:${item.transport === 'Yes' ? '#16a34a' : '#64748b'};">${item.transport}</strong></div>
      </div>

      <div style="margin-top:0.85rem;padding-top:0.75rem;border-top:1px solid #e2e8f0;font-size:0.88rem;">
        <strong>Address:</strong><br>
        <span style="color:#475569;">${item.address || 'Ladon, Peer Adil, Dera Ghazi Khan'}</span>
      </div>

      <div style="margin-top:0.5rem;font-size:0.78rem;color:#94a3b8;">
        Submitted on: ${item.submissionDate} | Source: ${item.source || 'Online Form'}
      </div>
    </div>

    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.75rem;">
      <div style="display:flex;gap:0.5rem;">
        <button class="btn btn-secondary btn-sm" onclick="changeStatus('${item.id}', 'Approved'); closeModal('detailsModal');">
          <i class="fa-solid fa-check"></i> Approve
        </button>
        <button class="btn btn-outline btn-sm" style="color:#dc2626;border-color:#fca5a5;" onclick="changeStatus('${item.id}', 'Rejected'); closeModal('detailsModal');">
          <i class="fa-solid fa-xmark"></i> Reject
        </button>
      </div>

      <div style="display:flex;gap:0.5rem;">
        <a href="${waLink}" target="_blank" class="btn btn-sm" style="background:#25d366;color:#fff;">
          <i class="fa-brands fa-whatsapp"></i> Chat WhatsApp
        </a>
        <button class="btn btn-primary btn-sm" onclick="printApplication('${item.id}')">
          <i class="fa-solid fa-print"></i> Print Slip
        </button>
      </div>
    </div>`;

  modal.classList.add('active');
}

function printApplication(id) {
  const list = APS_DB.getAllApplications();
  const item = list.find(i => i.id === id);
  if (!item) return;

  const printWindow = window.open('', '_blank', 'width=750,height=800');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Admission Slip - ${item.id}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 30px; color: #1e293b; }
        .slip-box { border: 2px solid #0b2545; padding: 25px; border-radius: 10px; }
        .header { text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 20px; }
        .logo-title { font-size: 24px; font-weight: bold; color: #0b2545; }
        .sub { font-size: 13px; color: #64748b; margin-top: 4px; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        td { padding: 8px 10px; font-size: 14px; border-bottom: 1px solid #f1f5f9; }
        .label { color: #64748b; width: 35%; }
        .val { font-weight: bold; color: #0f172a; }
        .instructions { background: #fef3c7; border: 1px solid #fde68a; padding: 12px; border-radius: 6px; font-size: 12px; color: #92400e; margin-top: 20px; }
        .footer-sig { display: flex; justify-content: space-between; margin-top: 40px; }
        .sig-line { width: 220px; border-top: 1px solid #94a3b8; text-align: center; padding-top: 5px; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="slip-box">
        <div class="header">
          <div class="logo-title">AZAN PUBLIC SCHOOL</div>
          <div class="sub">Ladon, Peer Adil, Dera Ghazi Khan &bull; Contact: 0307-8208934</div>
          <div class="sub" style="font-weight: bold; color: #0f825e; margin-top: 6px;">OFFICIAL ADMISSION REGISTRATION SLIP (SESSION 2026-2027)</div>
        </div>

        <div style="display: flex; justify-content: space-between; margin-bottom: 15px; background: #f8fafc; padding: 8px 12px; border-radius: 6px;">
          <span>Registration ID: <strong>${item.id}</strong></span>
          <span>Date: <strong>${item.submissionDate}</strong></span>
          <span>Status: <strong>${item.status}</strong></span>
        </div>

        <table>
          <tr><td class="label">Candidate Full Name:</td><td class="val">${item.studentName}</td></tr>
          <tr><td class="label">Father's Name:</td><td class="val">${item.fatherName}</td></tr>
          <tr><td class="label">Father's CNIC:</td><td class="val">${item.fatherCnic || 'N/A'}</td></tr>
          <tr><td class="label">Gender / DOB:</td><td class="val">${item.gender || 'N/A'} (${item.dob || 'N/A'})</td></tr>
          <tr><td class="label">Class Applied For:</td><td class="val" style="color: #0f825e;">${item.grade}</td></tr>
          <tr><td class="label">Contact / WhatsApp:</td><td class="val">${item.phone}</td></tr>
          <tr><td class="label">School Transport:</td><td class="val">${item.transport}</td></tr>
          <tr><td class="label">Address:</td><td class="val">${item.address || 'Ladon, Peer Adil, Dera Ghazi Khan'}</td></tr>
        </table>

        <div class="instructions">
          <strong>Instructions:</strong> Bring 2 passport-size photographs, student's Birth Certificate / B-Form copy, and father's CNIC copy along with this slip to the school admission desk (Peer Adil, Dera Ghazi Khan).
        </div>

        <div class="footer-sig">
          <div class="sig-line">Parent / Guardian Signature</div>
          <div class="sig-line">Principal Signature (Wasim Fida, BSCS)</div>
        </div>
      </div>
      <script>window.onload = function() { window.print(); };</script>
    </body>
    </html>
  `);
  printWindow.document.close();
}

function openAddModal() {
  const modal = document.getElementById('addManualModal');
  if (modal) modal.classList.add('active');
}


/* ══════════════════════════════════════════════════════════════
   2. NOTICES CONTROLLER
══════════════════════════════════════════════════════════════ */
function loadNoticesTable() {
  const tableBody = document.getElementById('noticesTableBody');
  if (!tableBody) return;

  const notices = APS_DB.getAllNotices();

  // Update counts
  const tabBadge = document.getElementById('tabNoticesCount');
  if (tabBadge) tabBadge.innerText = notices.length;

  const statTotal  = document.getElementById('statTotalNotices');
  const statPinned = document.getElementById('statPinnedNotices');
  const statExam   = document.getElementById('statExamNotices');

  if (statTotal)  statTotal.innerText  = notices.length;
  if (statPinned) statPinned.innerText = notices.filter(n => n.pinned).length;
  if (statExam)   statExam.innerText   = notices.filter(n => n.category === 'Examinations').length;

  if (!notices.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center;padding:2.5rem;color:#64748b;">
          <i class="fa-solid fa-bullhorn" style="font-size:2.5rem;color:#cbd5e1;display:block;margin-bottom:0.75rem;"></i>
          <p style="font-size:1rem;font-weight:600;">No notices published yet.</p>
          <span style="font-size:0.82rem;">Click "+ Post New Notice" to make an announcement.</span>
        </td>
      </tr>`;
    return;
  }

  let html = '';
  notices.forEach(item => {
    const catClass = `tag-${(item.category || 'General').replace(/\s+/g, '-')}`;

    html += `
      <tr>
        <td>
          <div style="background:var(--primary);color:#fff;width:55px;height:55px;border-radius:6px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;">
            <span style="font-size:1.15rem;font-weight:800;line-height:1;">${item.day}</span>
            <span style="font-size:0.7rem;text-transform:uppercase;">${item.month}</span>
          </div>
        </td>
        <td>
          <span class="category-tag ${catClass}">${item.category}</span>
          <div style="font-size:0.78rem;color:#64748b;margin-top:4px;">${item.ref || 'Ref # APS/NOT'}</div>
        </td>
        <td>
          <strong style="color:var(--primary);font-size:0.95rem;display:block;margin-bottom:3px;">${item.title}</strong>
          <p style="font-size:0.83rem;color:#475569;margin:0;line-height:1.4;">${item.desc}</p>
        </td>
        <td>
          <button onclick="togglePinNotice('${item.id}')" style="background:${item.pinned ? '#dcfce7' : '#f1f5f9'};color:${item.pinned ? '#15803d' : '#64748b'};border:1px solid ${item.pinned ? '#86efac' : '#cbd5e1'};padding:4px 9px;border-radius:9999px;font-size:0.75rem;font-weight:700;cursor:pointer;">
            ${item.pinned ? '📌 Pinned' : 'Normal'}
          </button>
        </td>
        <td style="text-align:right;">
          <div class="action-btn-group" style="justify-content:flex-end;">
            <button class="action-icon-btn btn-edit" title="Edit Notice" onclick="openNoticeModal('${item.id}')">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="action-icon-btn btn-delete" title="Delete Notice" onclick="deleteNoticeFromAdmin('${item.id}')">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>`;
  });

  tableBody.innerHTML = html;
}

function openNoticeModal(noticeId = null) {
  const modal = document.getElementById('noticeModal');
  const titleEl = document.getElementById('noticeModalTitle');
  const form = document.getElementById('noticeForm');

  form.reset();
  document.getElementById('noticeFormId').value = '';

  if (noticeId) {
    const list = APS_DB.getAllNotices();
    const notice = list.find(n => n.id === noticeId);
    if (notice) {
      titleEl.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Edit Notice (${notice.id})`;
      document.getElementById('noticeFormId').value = notice.id;
      document.getElementById('noticeTitle').value = notice.title;
      document.getElementById('noticeCategory').value = notice.category;
      document.getElementById('noticeRef').value = notice.ref;
      document.getElementById('noticeDesc').value = notice.desc;
      document.getElementById('noticePinned').checked = !!notice.pinned;

      // Set date input
      const dateParts = notice.date.split(' ');
      if (dateParts.length >= 3) {
        document.getElementById('noticeDate').value = new Date(notice.date).toISOString().slice(0, 10);
      }
    }
  } else {
    titleEl.innerHTML = `<i class="fa-solid fa-bullhorn"></i> Post New Notice`;
    document.getElementById('noticeDate').value = new Date().toISOString().slice(0, 10);
    document.getElementById('noticeRef').value = `Ref # APS/NOT/2026/${Math.floor(100 + Math.random() * 900)}`;
  }

  modal.classList.add('active');
}

function saveNoticeFromAdmin() {
  const id       = document.getElementById('noticeFormId').value;
  const title    = document.getElementById('noticeTitle').value;
  const category = document.getElementById('noticeCategory').value;
  const date     = document.getElementById('noticeDate').value;
  const ref      = document.getElementById('noticeRef').value;
  const desc     = document.getElementById('noticeDesc').value;
  const pinned   = document.getElementById('noticePinned').checked;

  const data = { title, category, date, ref, desc, pinned };

  if (id) {
    APS_DB.updateNotice(id, data);
    showAdminToast('Notice updated successfully!', 'success');
  } else {
    APS_DB.saveNotice(data);
    showAdminToast('New notice published across website!', 'success');
  }

  closeModal('noticeModal');
  loadNoticesTable();
}

function deleteNoticeFromAdmin(id) {
  if (confirm('Are you sure you want to delete this notice?')) {
    APS_DB.deleteNotice(id);
    loadNoticesTable();
    showAdminToast('Notice deleted.', 'info');
  }
}

function togglePinNotice(id) {
  const list = APS_DB.getAllNotices();
  const notice = list.find(n => n.id === id);
  if (notice) {
    APS_DB.updateNotice(id, { pinned: !notice.pinned });
    loadNoticesTable();
    showAdminToast(`Notice ${notice.pinned ? 'unpinned' : 'pinned to marquee banner'}.`, 'success');
  }
}


/* ══════════════════════════════════════════════════════════════
   3. EVENTS CONTROLLER
══════════════════════════════════════════════════════════════ */
function loadEventsTable() {
  const tableBody = document.getElementById('eventsTableBody');
  if (!tableBody) return;

  const events = APS_DB.getAllEvents();

  // Tab Badge
  const tabBadge = document.getElementById('tabEventsCount');
  if (tabBadge) tabBadge.innerText = events.length;

  const statTotal  = document.getElementById('statTotalEvents');
  const statSports = document.getElementById('statSportsEvents');
  const statUp     = document.getElementById('statUpcomingEvents');

  if (statTotal)  statTotal.innerText  = events.length;
  if (statSports) statSports.innerText = events.filter(e => e.category === 'Sports').length;
  if (statUp)     statUp.innerText     = events.filter(e => e.status === 'Upcoming').length;

  if (!events.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center;padding:2.5rem;color:#64748b;">
          <i class="fa-solid fa-calendar-xmark" style="font-size:2.5rem;color:#cbd5e1;display:block;margin-bottom:0.75rem;"></i>
          <p style="font-size:1rem;font-weight:600;">No events in calendar.</p>
          <span style="font-size:0.82rem;">Click "+ Add New Event" to schedule sports or academic galas.</span>
        </td>
      </tr>`;
    return;
  }

  let html = '';
  events.forEach(item => {
    const catClass = `tag-${(item.category || 'General').replace(/\s+/g, '-')}`;
    const statusClass = `status-${(item.status || 'Upcoming')}`;

    html += `
      <tr>
        <td>
          <div style="font-weight:700;color:var(--primary);">${item.date}</div>
          <div style="font-size:0.75rem;color:#64748b;"><i class="fa-solid fa-clock"></i> ${item.time || '09:00 AM'}</div>
        </td>
        <td>
          <strong style="color:#0f172a;display:block;font-size:0.95rem;">${item.title}</strong>
          <span style="font-size:0.8rem;color:#64748b;">${item.desc || ''}</span>
        </td>
        <td>
          <span class="category-tag ${catClass}">${item.category}</span>
        </td>
        <td style="font-size:0.85rem;color:#475569;">
          <i class="fa-solid fa-location-dot" style="color:var(--secondary);font-size:0.8rem;"></i> ${item.venue}
        </td>
        <td>
          <select onchange="changeEventStatus('${item.id}', this.value)" style="padding:0.25rem 0.5rem;border-radius:4px;font-size:0.8rem;font-weight:700;border:1px solid #cbd5e1;background:#fff;cursor:pointer;">
            <option value="Upcoming"  ${item.status === 'Upcoming'  ? 'selected' : ''}>⏳ Upcoming</option>
            <option value="Ongoing"   ${item.status === 'Ongoing'   ? 'selected' : ''}>🔥 Ongoing</option>
            <option value="Completed" ${item.status === 'Completed' ? 'selected' : ''}>✔️ Completed</option>
          </select>
        </td>
        <td style="text-align:right;">
          <div class="action-btn-group" style="justify-content:flex-end;">
            <button class="action-icon-btn btn-edit" title="Edit Event" onclick="openEventModal('${item.id}')">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="action-icon-btn btn-delete" title="Delete Event" onclick="deleteEventFromAdmin('${item.id}')">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>`;
  });

  tableBody.innerHTML = html;
}

function openEventModal(eventId = null) {
  const modal   = document.getElementById('eventModal');
  const titleEl = document.getElementById('eventModalTitle');
  const form    = document.getElementById('eventForm');

  form.reset();
  document.getElementById('eventFormId').value = '';

  if (eventId) {
    const list = APS_DB.getAllEvents();
    const event = list.find(e => e.id === eventId);
    if (event) {
      titleEl.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Edit Event (${event.id})`;
      document.getElementById('eventFormId').value = event.id;
      document.getElementById('eventTitle').value = event.title;
      document.getElementById('eventCategory').value = event.category;
      document.getElementById('eventTime').value = event.time;
      document.getElementById('eventStatus').value = event.status;
      document.getElementById('eventVenue').value = event.venue;
      document.getElementById('eventDesc').value = event.desc;
      document.getElementById('eventDate').value = new Date(event.date).toISOString().slice(0, 10);
    }
  } else {
    titleEl.innerHTML = `<i class="fa-solid fa-calendar-plus"></i> Add School Event`;
    document.getElementById('eventDate').value = new Date().toISOString().slice(0, 10);
    document.getElementById('eventVenue').value = 'Azan Public School Main Sports Ground, Peer Adil';
    document.getElementById('eventTime').value = '09:00 AM - 02:00 PM';
  }

  modal.classList.add('active');
}

function saveEventFromAdmin() {
  const id       = document.getElementById('eventFormId').value;
  const title    = document.getElementById('eventTitle').value;
  const category = document.getElementById('eventCategory').value;
  const date     = document.getElementById('eventDate').value;
  const time     = document.getElementById('eventTime').value;
  const status   = document.getElementById('eventStatus').value;
  const venue    = document.getElementById('eventVenue').value;
  const desc     = document.getElementById('eventDesc').value;

  const data = { title, category, date, time, status, venue, desc };

  if (id) {
    APS_DB.updateEvent(id, data);
    showAdminToast('Event updated successfully!', 'success');
  } else {
    APS_DB.saveEvent(data);
    showAdminToast('New event scheduled on calendar!', 'success');
  }

  closeModal('eventModal');
  loadEventsTable();
}

function deleteEventFromAdmin(id) {
  if (confirm('Are you sure you want to delete this event?')) {
    APS_DB.deleteEvent(id);
    loadEventsTable();
    showAdminToast('Event deleted.', 'info');
  }
}

function changeEventStatus(id, newStatus) {
  APS_DB.updateEvent(id, { status: newStatus });
  loadEventsTable();
  showAdminToast(`Event status updated to ${newStatus}.`, 'success');
}


/* ══════════════════════════════════════════════════════════════
   4. FEE STRUCTURE CONTROLLER
══════════════════════════════════════════════════════════════ */
function loadFeeStructureIntoForm() {
  const fees = APS_DB.getFeeStructure();
  if (!fees || !fees.grades) return;

  const g = fees.grades;
  // Montessori
  if (g.playgroup) {
    document.getElementById('fee_pg_tuition').value   = g.playgroup.tuitionFee;
    document.getElementById('fee_pg_admission').value = g.playgroup.admissionFee;
    document.getElementById('fee_pg_lab').value       = g.playgroup.labFee;
  }
  // Primary
  if (g.primary) {
    document.getElementById('fee_primary_tuition').value   = g.primary.tuitionFee;
    document.getElementById('fee_primary_admission').value = g.primary.admissionFee;
    document.getElementById('fee_primary_lab').value       = g.primary.labFee;
  }
  // Middle
  if (g.middle) {
    document.getElementById('fee_middle_tuition').value   = g.middle.tuitionFee;
    document.getElementById('fee_middle_admission').value = g.middle.admissionFee;
    document.getElementById('fee_middle_lab').value       = g.middle.labFee;
  }
  // Matric
  if (g.matric) {
    document.getElementById('fee_matric_tuition').value   = g.matric.tuitionFee;
    document.getElementById('fee_matric_admission').value = g.matric.admissionFee;
    document.getElementById('fee_matric_lab').value       = g.matric.labFee;
  }
  // O-Levels
  if (g.olevels) {
    document.getElementById('fee_olevels_tuition').value   = g.olevels.tuitionFee;
    document.getElementById('fee_olevels_admission').value = g.olevels.admissionFee;
    document.getElementById('fee_olevels_lab').value       = g.olevels.labFee;
  }

  // Transport & Sibling
  if (fees.transport) {
    document.getElementById('fee_zone1').value = fees.transport.zone1 || 1500;
    document.getElementById('fee_zone2').value = fees.transport.zone2 || 2200;
    document.getElementById('fee_zone3').value = fees.transport.zone3 || 3000;
  }
  document.getElementById('fee_sibling_discount').value = fees.siblingDiscountPercent || 15;
}

function saveFeeStructureFromAdmin() {
  const newFees = {
    grades: {
      playgroup: {
        name: 'Montessori (Playgroup, Nursery, Prep)',
        tuitionFee:   parseInt(document.getElementById('fee_pg_tuition').value, 10) || 3200,
        admissionFee: parseInt(document.getElementById('fee_pg_admission').value, 10) || 4000,
        labFee:       parseInt(document.getElementById('fee_pg_lab').value, 10) || 0
      },
      primary: {
        name: 'Primary Wing (Class 1 to 5)',
        tuitionFee:   parseInt(document.getElementById('fee_primary_tuition').value, 10) || 4200,
        admissionFee: parseInt(document.getElementById('fee_primary_admission').value, 10) || 5000,
        labFee:       parseInt(document.getElementById('fee_primary_lab').value, 10) || 0
      },
      middle: {
        name: 'Middle School (Class 6 to 8)',
        tuitionFee:   parseInt(document.getElementById('fee_middle_tuition').value, 10) || 5500,
        admissionFee: parseInt(document.getElementById('fee_middle_admission').value, 10) || 6000,
        labFee:       parseInt(document.getElementById('fee_middle_lab').value, 10) || 500
      },
      matric: {
        name: 'Secondary / Matriculation (Class 9-10)',
        tuitionFee:   parseInt(document.getElementById('fee_matric_tuition').value, 10) || 6800,
        admissionFee: parseInt(document.getElementById('fee_matric_admission').value, 10) || 7000,
        labFee:       parseInt(document.getElementById('fee_matric_lab').value, 10) || 1000
      },
      olevels: {
        name: 'Cambridge O-Levels',
        tuitionFee:   parseInt(document.getElementById('fee_olevels_tuition').value, 10) || 11000,
        admissionFee: parseInt(document.getElementById('fee_olevels_admission').value, 10) || 12000,
        labFee:       parseInt(document.getElementById('fee_olevels_lab').value, 10) || 2000
      }
    },
    transport: {
      zone1: parseInt(document.getElementById('fee_zone1').value, 10) || 1500,
      zone2: parseInt(document.getElementById('fee_zone2').value, 10) || 2200,
      zone3: parseInt(document.getElementById('fee_zone3').value, 10) || 3000
    },
    siblingDiscountPercent: parseInt(document.getElementById('fee_sibling_discount').value, 10) || 15
  };

  APS_DB.saveFeeStructure(newFees);
  runFeePreview();
  showAdminToast('Fee Structure saved! Public website calculator updated.', 'success');
}

function runFeePreview() {
  const fees = APS_DB.getFeeStructure();
  if (!fees || !fees.grades) return;

  const gradeKey = document.getElementById('previewGrade')?.value || 'primary';
  const transKey = document.getElementById('previewTransport')?.value || 'none';
  const hasDisc  = document.getElementById('previewSibling')?.checked || false;

  const wing = fees.grades[gradeKey] || fees.grades.primary;

  let admission = wing.admissionFee;
  let tuition   = wing.tuitionFee;
  let lab       = wing.labFee;
  let transport = 0;

  if (transKey === 'zone1') transport = fees.transport.zone1;
  else if (transKey === 'zone2') transport = fees.transport.zone2;
  else if (transKey === 'zone3') transport = fees.transport.zone3;

  let monthlyTotal = tuition + lab + transport;
  if (hasDisc) {
    const discountFactor = (100 - (fees.siblingDiscountPercent || 15)) / 100;
    monthlyTotal = Math.round(monthlyTotal * discountFactor);
  }

  const elAdm     = document.getElementById('previewOutAdm');
  const elTuition = document.getElementById('previewOutTuition');
  const elLab     = document.getElementById('previewOutLab');
  const elTrans   = document.getElementById('previewOutTrans');
  const elTotal   = document.getElementById('previewOutTotal');

  if (elAdm)     elAdm.innerText     = `PKR ${admission.toLocaleString()} (One-Time)`;
  if (elTuition) elTuition.innerText = `PKR ${tuition.toLocaleString()}`;
  if (elLab)     elLab.innerText     = lab ? `PKR ${lab.toLocaleString()}` : 'Included';
  if (elTrans)   elTrans.innerText   = transport ? `PKR ${transport.toLocaleString()}` : 'None';
  if (elTotal)   elTotal.innerText   = `PKR ${monthlyTotal.toLocaleString()}`;
}


/* ══════════════════════════════════════════════════════════════
   5. SCHOOL SETTINGS CONTROLLER
══════════════════════════════════════════════════════════════ */
function loadSettingsIntoForm() {
  const s = APS_DB.getSettings();
  if (!s) return;

  if (document.getElementById('set_schoolName')) document.getElementById('set_schoolName').value = s.schoolName || '';
  if (document.getElementById('set_tagline')) document.getElementById('set_tagline').value = s.tagline || '';
  if (document.getElementById('set_principalName')) document.getElementById('set_principalName').value = s.principalName || '';
  if (document.getElementById('set_principalEdu')) document.getElementById('set_principalEdu').value = s.principalEdu || '';
  if (document.getElementById('set_phone')) document.getElementById('set_phone').value = s.phone || '';
  if (document.getElementById('set_whatsapp')) document.getElementById('set_whatsapp').value = s.whatsapp || '';
  if (document.getElementById('set_email')) document.getElementById('set_email').value = s.email || '';
  if (document.getElementById('set_address')) document.getElementById('set_address').value = s.address || '';
  if (document.getElementById('set_timingsRegular')) document.getElementById('set_timingsRegular').value = s.timingsRegular || '';
  if (document.getElementById('set_timingsFriday')) document.getElementById('set_timingsFriday').value = s.timingsFriday || '';
  if (document.getElementById('set_announcementTicker')) document.getElementById('set_announcementTicker').value = s.announcementTicker || '';
}

function saveSettingsFromAdmin() {
  const newSettings = {
    schoolName:         document.getElementById('set_schoolName').value.trim(),
    tagline:            document.getElementById('set_tagline').value.trim(),
    principalName:      document.getElementById('set_principalName').value.trim(),
    principalEdu:       document.getElementById('set_principalEdu').value.trim(),
    phone:              document.getElementById('set_phone').value.trim(),
    whatsapp:           document.getElementById('set_whatsapp').value.trim(),
    email:              document.getElementById('set_email').value.trim(),
    address:            document.getElementById('set_address').value.trim(),
    timingsRegular:     document.getElementById('set_timingsRegular').value.trim(),
    timingsFriday:      document.getElementById('set_timingsFriday').value.trim(),
    announcementTicker: document.getElementById('set_announcementTicker').value.trim()
  };

  APS_DB.saveSettings(newSettings);
  showAdminToast('School settings updated! Changes apply across all pages.', 'success');
}


/* ══════════════════════════════════════════════════════════════
   TOAST HELPER
══════════════════════════════════════════════════════════════ */
function showAdminToast(message, type = 'info') {
  let toastContainer = document.querySelector('.toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = `toast-msg ${type}`;
  toast.style.animation = 'slideInRight 0.3s ease-out';
  toast.innerHTML = `
    <i class="fa-solid fa-circle-check" style="font-size:1.1rem;color:#34d399;"></i>
    <span>${message}</span>
  `;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}


/* ══════════════════════════════════════════════════════════════
   6. HOME MAIN PICTURE & SLIDER CONTROLLER
══════════════════════════════════════════════════════════════ */
function loadBannerSliderIntoAdmin() {
  const banner = APS_DB.getBannerData();
  if (banner) {
    const urlInput = document.getElementById('bannerImageUrl');
    const titleInput = document.getElementById('bannerTitle');
    const subInput = document.getElementById('bannerSubtitle');
    const badgeInput = document.getElementById('bannerBadge');

    if (urlInput) urlInput.value = banner.mainImageUrl || '';
    if (titleInput) titleInput.value = banner.title || '';
    if (subInput) subInput.value = banner.subtitle || '';
    if (badgeInput) badgeInput.value = banner.badge || '';

    updateBannerLivePreview();
  }

  loadSliderTable();
}

function updateBannerLivePreview() {
  const urlVal = document.getElementById('bannerImageUrl')?.value || 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1400&q=80';
  const titleVal = document.getElementById('bannerTitle')?.value || 'Azan Public School Main Campus';
  const subVal = document.getElementById('bannerSubtitle')?.value || 'Ladon, Peer Adil, Dera Ghazi Khan';
  const badgeVal = document.getElementById('bannerBadge')?.value || 'Campus Showcase • Peer Adil';

  const previewImg = document.getElementById('bannerPreviewImg');
  const previewTitle = document.getElementById('bannerPreviewTitle');
  const previewSub = document.getElementById('bannerPreviewSub');
  const previewBadge = document.getElementById('bannerPreviewBadge');

  if (previewImg) previewImg.src = urlVal;
  if (previewTitle) previewTitle.innerText = titleVal;
  if (previewSub) previewSub.innerText = subVal;
  if (previewBadge) previewBadge.innerText = badgeVal;
}

function applyBannerPreset(url) {
  const urlInput = document.getElementById('bannerImageUrl');
  if (urlInput) {
    urlInput.value = url;
    updateBannerLivePreview();
    showAdminToast('Campus preset selected! Click "Save Main Picture Changes" to apply.', 'info');
  }
}

function saveMainBannerFromAdmin() {
  const url = document.getElementById('bannerImageUrl')?.value.trim();
  const title = document.getElementById('bannerTitle')?.value.trim();
  const subtitle = document.getElementById('bannerSubtitle')?.value.trim();
  const badge = document.getElementById('bannerBadge')?.value.trim();

  if (!url) {
    alert('Please provide a valid Main Image URL.');
    return;
  }

  APS_DB.saveBannerData({
    mainImageUrl: url,
    title: title || 'Azan Public School Main Campus',
    subtitle: subtitle || '',
    badge: badge || 'Campus Showcase • Peer Adil'
  });

  updateBannerLivePreview();
  showAdminToast('Main Front Picture successfully updated! Live website refreshed.', 'success');
}

function loadSliderTable() {
  const tbody = document.getElementById('sliderTableBody');
  const badgeCount = document.getElementById('tabSlidesCount');
  if (!tbody) return;

  const slides = APS_DB.getSliderData();
  if (badgeCount) badgeCount.innerText = slides.length;

  if (!slides || !slides.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align:center; padding:2rem; color:#64748b;">
          <i class="fa-solid fa-images" style="font-size:2rem; color:#cbd5e1; display:block; margin-bottom:0.5rem;"></i>
          No slides found in the Campus Highlights slider. Click "+ Add New Slide" to add one!
        </td>
      </tr>
    `;
    return;
  }

  let html = '';
  slides.forEach((slide) => {
    html += `
      <tr>
        <td style="padding: 0.75rem;">
          <div style="width: 100px; height: 60px; border-radius: 6px; overflow: hidden; background: #0f172a; border: 1px solid #cbd5e1;">
            <img src="${slide.imageUrl}" alt="${slide.title}" style="width: 100%; height: 100%; object-fit: cover; display: block;">
          </div>
        </td>
        <td style="padding: 0.75rem;">
          <span class="category-tag tag-Sports-Gala" style="margin-bottom: 4px;">${slide.tag || 'Campus'}</span>
          <div style="font-weight: 700; color: var(--primary); font-size: 0.92rem;">${slide.title}</div>
        </td>
        <td style="padding: 0.75rem; color: #475569; font-size: 0.85rem; max-width: 320px; line-height: 1.4;">
          ${slide.caption}
        </td>
        <td style="padding: 0.75rem; text-align: center;">
          <button class="btn btn-outline btn-sm" onclick="deleteSlideFromAdmin('${slide.id}')" title="Delete Slide" style="color: #ef4444; border-color: #fecaca; padding: 4px 10px; cursor: pointer;">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

function openSlideModal() {
  const form = document.getElementById('slideForm');
  if (form) form.reset();

  const preview = document.getElementById('slideModalPreviewImg');
  if (preview) preview.src = 'https://images.unsplash.com/photo-1526676037777-05a232554f77?auto=format&fit=crop&w=1200&q=80';

  const modal = document.getElementById('slideModal');
  if (modal) modal.classList.add('active');
}

function applySlideModalPreset(url) {
  if (!url) return;
  const input = document.getElementById('slideImageUrl');
  const preview = document.getElementById('slideModalPreviewImg');
  if (input) input.value = url;
  if (preview) preview.src = url;
}

function updateSlideModalPreview() {
  const input = document.getElementById('slideImageUrl');
  const preview = document.getElementById('slideModalPreviewImg');
  if (input && preview) {
    preview.src = input.value.trim() || 'https://images.unsplash.com/photo-1526676037777-05a232554f77?auto=format&fit=crop&w=1200&q=80';
  }
}

function saveSlideFromAdmin() {
  const title = document.getElementById('slideTitle')?.value.trim();
  const tag = document.getElementById('slideTag')?.value.trim();
  const url = document.getElementById('slideImageUrl')?.value.trim();
  const caption = document.getElementById('slideCaption')?.value.trim();

  if (!title || !url || !caption) {
    alert('Please fill in all required slide details.');
    return;
  }

  APS_DB.addSlideItem({
    title: title,
    tag: tag || 'Campus Life',
    imageUrl: url,
    caption: caption
  });

  closeModal('slideModal');
  loadSliderTable();
  showAdminToast('New slide added to Campus Highlights slider!', 'success');
}

function deleteSlideFromAdmin(id) {
  if (confirm('Are you sure you want to delete this slide from the homepage slider?')) {
    APS_DB.deleteSlideItem(id);
    loadSliderTable();
    showAdminToast('Slide removed from slider.', 'info');
  }
}

// Window attachments for inline HTML event handlers
window.applyBannerPreset = applyBannerPreset;
window.updateBannerLivePreview = updateBannerLivePreview;
window.saveMainBannerFromAdmin = saveMainBannerFromAdmin;
window.openSlideModal = openSlideModal;
window.applySlideModalPreset = applySlideModalPreset;
window.updateSlideModalPreview = updateSlideModalPreview;
window.saveSlideFromAdmin = saveSlideFromAdmin;
window.deleteSlideFromAdmin = deleteSlideFromAdmin;


/* ══════════════════════════════════════════════════════════════
   7. EXAMINATION RESULTS & SUPPLY MANAGEMENT CONTROLLER
══════════════════════════════════════════════════════════════ */
function loadResultsTable() {
  const tbody = document.getElementById('resultsTableBody');
  const badgeCount = document.getElementById('tabResultsCount');
  if (!tbody) return;

  const results = APS_DB.getAllResults();
  if (badgeCount) badgeCount.innerText = results.length;
  updateResultsMetrics();

  const searchVal = (document.getElementById('resSearchInput')?.value || '').toLowerCase().trim();
  const gradeVal  = (document.getElementById('resFilterGrade')?.value  || 'all');
  const termVal   = (document.getElementById('resFilterTerm')?.value   || 'all');
  const statusVal = (document.getElementById('resFilterStatus')?.value || 'all');

  const filtered = results.filter(item => {
    const matchSearch = !searchVal ||
      (item.rollNo || '').toLowerCase().includes(searchVal) ||
      (item.studentName || '').toLowerCase().includes(searchVal) ||
      (item.fatherName || '').toLowerCase().includes(searchVal) ||
      (item.grade || '').toLowerCase().includes(searchVal);

    const matchGrade = gradeVal === 'all' || (item.grade || '').includes(gradeVal);
    const matchTerm = termVal === 'all' || (item.examTerm || '').includes(termVal);

    let matchStatus = true;
    if (statusVal === 'Passed') matchStatus = !item.hasSupply;
    else if (statusVal === 'Supply') matchStatus = item.hasSupply;
    else if (statusVal === 'Cleared') matchStatus = (item.overallStatus || '').includes('Cleared');

    return matchSearch && matchGrade && matchTerm && matchStatus;
  });

  if (!filtered.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center; padding:2.5rem; color:#64748b;">
          <i class="fa-solid fa-graduation-cap" style="font-size:2.2rem; color:#cbd5e1; display:block; margin-bottom:0.75rem;"></i>
          No student results match your filter. Click "+ Upload / Add New Result" to publish results.
        </td>
      </tr>
    `;
    return;
  }

  let html = '';
  filtered.forEach(r => {
    // Status & Grade Badge
    let statusBadge = '';
    if (r.hasSupply) {
      statusBadge = `
        <span class="status-badge status-Supply">
          <i class="fa-solid fa-triangle-exclamation"></i> SUPPLY (${r.supplyCount})
        </span>
        <div style="font-size:0.75rem; color:#b91c1c; font-weight:700; margin-top:3px;">
          ${(r.supplySubjects || []).join(', ')}
        </div>
      `;
    } else if ((r.overallStatus || '').includes('Cleared')) {
      statusBadge = `
        <span class="status-badge status-Cleared">
          <i class="fa-solid fa-check-double"></i> Cleared Supply
        </span>
        <div style="font-size:0.75rem; color:#0f766e; font-weight:700; margin-top:3px;">
          Grade: ${r.gradeEarned}
        </div>
      `;
    } else {
      statusBadge = `
        <span class="status-badge status-Passed">
          <i class="fa-solid fa-circle-check"></i> PASSED
        </span>
        <div style="font-size:0.75rem; color:#15803d; font-weight:700; margin-top:3px;">
          Grade: ${r.gradeEarned}
        </div>
      `;
    }

    // Supply Info Column
    let supplyInfo = '';
    if (r.hasSupply) {
      supplyInfo = `
        <div style="font-size:0.82rem; font-weight:700; color:#b91c1c;">
          <i class="fa-solid fa-calendar-days"></i> Re-Exam: ${r.supplyDetails?.reExamDate || 'TBA'}
        </div>
        <div style="font-size:0.75rem; color:#475569;">
          Status: <strong>${r.supplyDetails?.clearanceStatus || 'Pending'}</strong>
        </div>
        <div style="font-size:0.72rem; color:#64748b;">
          Fee: ${r.supplyDetails?.feeStatus || 'Unpaid'}
        </div>
      `;
    } else if ((r.overallStatus || '').includes('Cleared')) {
      supplyInfo = `
        <div style="font-size:0.8rem; color:#0f766e; font-weight:700;">
          <i class="fa-solid fa-certificate"></i> Supplementary Cleared
        </div>
        <div style="font-size:0.74rem; color:#64748b;">
          ${r.supplyDetails?.remarks || 'Result verified and revised.'}
        </div>
      `;
    } else {
      supplyInfo = `
        <span style="font-size:0.8rem; color:#94a3b8;">
          <i class="fa-solid fa-check"></i> Regular Pass (No Supply)
        </span>
      `;
    }

    html += `
      <tr>
        <td style="padding:0.85rem;">
          <div style="font-weight:800; color:var(--primary); font-size:0.95rem;">${r.rollNo}</div>
          <div style="font-size:0.72rem; color:#64748b;">ID: ${r.id}</div>
        </td>
        <td style="padding:0.85rem;">
          <div style="font-weight:700; color:#1e293b;">${r.studentName}</div>
          <div style="font-size:0.78rem; color:#64748b;">S/D/o ${r.fatherName}</div>
        </td>
        <td style="padding:0.85rem;">
          <span class="category-tag tag-Academic" style="margin-bottom:3px;">${r.grade}</span>
          <div style="font-size:0.78rem; color:#475569;">${r.examTerm}</div>
        </td>
        <td style="padding:0.85rem;">
          <div style="font-weight:800; color:var(--primary); font-size:0.92rem;">
            ${r.obtainedMarks} <span style="font-size:0.78rem; color:#64748b;">/ ${r.totalMarks}</span>
          </div>
          <div style="font-size:0.78rem; color:#0f825e; font-weight:700;">
            ${r.percentage}%
          </div>
        </td>
        <td style="padding:0.85rem;">
          ${statusBadge}
        </td>
        <td style="padding:0.85rem; max-width:220px;">
          ${supplyInfo}
        </td>
        <td style="padding:0.85rem; text-align:center;">
          <div style="display:flex; justify-content:center; gap:5px;">
            <button class="btn btn-outline btn-sm" onclick="openMarksheetModal('${r.id}')" title="View / Print Marksheet" style="padding:5px 9px; font-size:0.82rem;">
              <i class="fa-solid fa-print"></i>
            </button>
            <button class="btn btn-outline btn-sm" onclick="openEditResultModal('${r.id}')" title="Edit Result & Manage Supply" style="padding:5px 9px; font-size:0.82rem; color:var(--secondary); border-color:#a7f3d0;">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="btn btn-outline btn-sm" onclick="deleteResultFromAdmin('${r.id}')" title="Delete Result" style="padding:5px 9px; font-size:0.82rem; color:#ef4444; border-color:#fecaca;">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

function updateResultsMetrics() {
  const results = APS_DB.getAllResults();
  const total = results.length;
  const passed = results.filter(r => !r.hasSupply).length;
  const supply = results.filter(r => r.hasSupply).length;
  const cleared = results.filter(r => (r.overallStatus || '').includes('Cleared')).length;

  const totalEl = document.getElementById('resTotalCount');
  const passEl = document.getElementById('resPassCount');
  const supplyEl = document.getElementById('resSupplyCount');
  const clearedEl = document.getElementById('resClearedCount');

  if (totalEl) totalEl.innerText = total;
  if (passEl) passEl.innerText = passed;
  if (supplyEl) supplyEl.innerText = supply;
  if (clearedEl) clearedEl.innerText = cleared;
}

// Subject row generator for modal
function addSubjectRow(name = '', total = 100, passing = 33, obtained = 0) {
  const container = document.getElementById('subjectRowsContainer');
  if (!container) return;

  const tr = document.createElement('tr');
  tr.className = 'subject-row';
  tr.style.borderBottom = '1px solid #e2e8f0';

  tr.innerHTML = `
    <td style="padding:4px 6px;">
      <input type="text" class="sub-name" value="${name}" required placeholder="Subject name" style="width:100%; padding:4px 6px; font-size:0.82rem; border:1px solid #cbd5e1; border-radius:4px;">
    </td>
    <td style="padding:4px 6px;">
      <input type="number" class="sub-total" value="${total}" min="1" required style="width:100%; padding:4px 6px; font-size:0.82rem; border:1px solid #cbd5e1; border-radius:4px;" oninput="calculateModalScores()">
    </td>
    <td style="padding:4px 6px;">
      <input type="number" class="sub-pass" value="${passing}" min="1" required style="width:100%; padding:4px 6px; font-size:0.82rem; border:1px solid #cbd5e1; border-radius:4px;" oninput="calculateModalScores()">
    </td>
    <td style="padding:4px 6px;">
      <input type="number" class="sub-obtained" value="${obtained}" min="0" required style="width:100%; padding:4px 6px; font-size:0.82rem; border:1px solid #cbd5e1; border-radius:4px; font-weight:700;" oninput="calculateModalScores()">
    </td>
    <td style="padding:4px 6px; text-align:center;">
      <span class="sub-status-badge" style="font-size:0.7rem; font-weight:700; padding:2px 6px; border-radius:4px;">Pass</span>
    </td>
    <td style="padding:4px 6px; text-align:center;">
      <button type="button" onclick="this.closest('tr').remove(); calculateModalScores();" style="background:none; border:none; color:#ef4444; cursor:pointer; font-size:0.9rem;" title="Remove Subject">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </td>
  `;

  container.appendChild(tr);
  calculateModalScores();
}

function applySubjectPreset(presetType) {
  const container = document.getElementById('subjectRowsContainer');
  if (!container) return;
  container.innerHTML = '';

  let list = [];
  if (presetType === 'matric_sci') {
    list = [
      { name: 'English', total: 100, passing: 33, obtained: 75 },
      { name: 'Urdu', total: 100, passing: 33, obtained: 80 },
      { name: 'Mathematics', total: 100, passing: 33, obtained: 75 },
      { name: 'Physics', total: 75, passing: 25, obtained: 55 },
      { name: 'Chemistry', total: 75, passing: 25, obtained: 50 },
      { name: 'Islamiat', total: 50, passing: 17, obtained: 42 },
      { name: 'Computer Science', total: 75, passing: 25, obtained: 60 }
    ];
  } else if (presetType === 'middle') {
    list = [
      { name: 'English', total: 100, passing: 33, obtained: 80 },
      { name: 'Urdu', total: 100, passing: 33, obtained: 82 },
      { name: 'Mathematics', total: 100, passing: 33, obtained: 78 },
      { name: 'General Science', total: 100, passing: 33, obtained: 85 },
      { name: 'Islamiat', total: 50, passing: 17, obtained: 44 },
      { name: 'Social Studies', total: 100, passing: 33, obtained: 76 },
      { name: 'Computer Studies', total: 100, passing: 33, obtained: 80 }
    ];
  } else if (presetType === 'primary') {
    list = [
      { name: 'English', total: 100, passing: 33, obtained: 85 },
      { name: 'Urdu', total: 100, passing: 33, obtained: 88 },
      { name: 'Mathematics', total: 100, passing: 33, obtained: 90 },
      { name: 'General Science', total: 100, passing: 33, obtained: 84 },
      { name: 'Islamiat', total: 50, passing: 17, obtained: 46 },
      { name: 'Nazra Quran', total: 50, passing: 17, obtained: 48 }
    ];
  }

  list.forEach(s => addSubjectRow(s.name, s.total, s.passing, s.obtained));
}

function calculateModalScores() {
  const rows = document.querySelectorAll('#subjectRowsContainer .subject-row');
  let totalMarks = 0;
  let obtainedMarks = 0;
  const supplySubjects = [];

  rows.forEach(row => {
    const name = row.querySelector('.sub-name')?.value || 'Subject';
    const total = parseFloat(row.querySelector('.sub-total')?.value) || 0;
    const pass = parseFloat(row.querySelector('.sub-pass')?.value) || 0;
    const obt = parseFloat(row.querySelector('.sub-obtained')?.value) || 0;
    const badge = row.querySelector('.sub-status-badge');

    totalMarks += total;
    obtainedMarks += obt;

    const isSupply = obt < pass;
    if (isSupply) {
      supplySubjects.push(name);
      if (badge) {
        badge.innerText = 'SUPPLY';
        badge.style.background = '#fee2e2';
        badge.style.color = '#b91c1c';
      }
    } else {
      if (badge) {
        badge.innerText = 'Pass';
        badge.style.background = '#dcfce7';
        badge.style.color = '#15803d';
      }
    }
  });

  const percentage = totalMarks > 0 ? ((obtainedMarks / totalMarks) * 100).toFixed(2) : '0';
  const hasSupply = supplySubjects.length > 0;

  // Update preview boxes
  const scoreEl = document.getElementById('previewTotalScore');
  const percEl = document.getElementById('previewPercentage');
  const gradeEl = document.getElementById('previewGrade');
  const statusBadge = document.getElementById('previewStatusBadge');
  const supplyDetectedLabel = document.getElementById('supplyDetectedLabel');

  if (scoreEl) scoreEl.innerText = `${obtainedMarks} / ${totalMarks}`;
  if (percEl) percEl.innerText = `${percentage}%`;

  let grade = 'F';
  if (hasSupply) {
    grade = 'Supply';
  } else if (percentage >= 90) grade = 'A+';
  else if (percentage >= 80) grade = 'A';
  else if (percentage >= 70) grade = 'B';
  else if (percentage >= 60) grade = 'C';
  else if (percentage >= 50) grade = 'D';
  else grade = 'E';

  if (gradeEl) gradeEl.innerText = grade;

  if (statusBadge) {
    if (hasSupply) {
      statusBadge.className = 'status-badge status-Supply';
      statusBadge.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> SUPPLY IN ${supplySubjects.length} SUBJECT(S)`;
    } else {
      statusBadge.className = 'status-badge status-Passed';
      statusBadge.innerHTML = `<i class="fa-solid fa-circle-check"></i> PASSED`;
    }
  }

  if (supplyDetectedLabel) {
    if (hasSupply) {
      supplyDetectedLabel.innerText = `⚠️ Supply in: ${supplySubjects.join(', ')}`;
      supplyDetectedLabel.style.background = '#fee2e2';
      supplyDetectedLabel.style.color = '#b91c1c';
    } else {
      supplyDetectedLabel.innerText = '✅ All Subjects Clear (No Supply)';
      supplyDetectedLabel.style.background = '#dcfce7';
      supplyDetectedLabel.style.color = '#15803d';
    }
  }
}

function openAddResultModal() {
  const form = document.getElementById('resultForm');
  if (form) form.reset();

  document.getElementById('resFormId').value = '';
  document.getElementById('resultModalTitle').innerHTML = '<i class="fa-solid fa-graduation-cap"></i> Upload Student Result &amp; Marksheet';
  document.getElementById('resDateIssued').value = new Date().toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });

  // Load default preset
  applySubjectPreset('matric_sci');

  const modal = document.getElementById('resultModal');
  if (modal) modal.classList.add('active');
}

function openEditResultModal(id) {
  const r = APS_DB.getResultById(id);
  if (!r) return;

  document.getElementById('resFormId').value = r.id;
  document.getElementById('resultModalTitle').innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Edit Result &amp; Manage Supply: ${r.studentName} (${r.rollNo})`;

  document.getElementById('resRollNo').value = r.rollNo || '';
  document.getElementById('resStudentName').value = r.studentName || '';
  document.getElementById('resFatherName').value = r.fatherName || '';
  document.getElementById('resGrade').value = r.grade || 'Class 9 (Matric Science)';
  document.getElementById('resExamTerm').value = r.examTerm || 'Mid-Term Examination 2026';
  document.getElementById('resDateIssued').value = r.dateIssued || '';

  // Supply fields
  document.getElementById('supplyExamDate').value = r.supplyDetails?.reExamDate || '';
  document.getElementById('supplyClearanceStatus').value = r.supplyDetails?.clearanceStatus || 'Pending Re-Exam';
  document.getElementById('supplyFeeStatus').value = r.supplyDetails?.feeStatus || 'Unpaid';
  document.getElementById('supplyRemarks').value = r.supplyDetails?.remarks || '';

  // Populate subjects
  const container = document.getElementById('subjectRowsContainer');
  if (container) {
    container.innerHTML = '';
    (r.subjects || []).forEach(s => {
      addSubjectRow(s.name, s.total, s.passing, s.obtained);
    });
  }

  calculateModalScores();

  const modal = document.getElementById('resultModal');
  if (modal) modal.classList.add('active');
}

function saveResultFromAdmin() {
  const id = document.getElementById('resFormId')?.value;
  const rollNo = document.getElementById('resRollNo')?.value.trim();
  const studentName = document.getElementById('resStudentName')?.value.trim();
  const fatherName = document.getElementById('resFatherName')?.value.trim();
  const grade = document.getElementById('resGrade')?.value;
  const examTerm = document.getElementById('resExamTerm')?.value;
  const dateIssued = document.getElementById('resDateIssued')?.value.trim();

  // Supply fields
  const supplyExamDate = document.getElementById('supplyExamDate')?.value.trim();
  const supplyClearanceStatus = document.getElementById('supplyClearanceStatus')?.value;
  const supplyFeeStatus = document.getElementById('supplyFeeStatus')?.value;
  const supplyClearedSub = document.getElementById('supplyClearedSubject')?.value.trim();
  const supplyRemarks = document.getElementById('supplyRemarks')?.value.trim();

  const subjectRows = document.querySelectorAll('#subjectRowsContainer .subject-row');
  const subjects = [];

  subjectRows.forEach(row => {
    const name = row.querySelector('.sub-name')?.value.trim();
    const total = parseFloat(row.querySelector('.sub-total')?.value) || 100;
    const passing = parseFloat(row.querySelector('.sub-pass')?.value) || 33;
    const obtained = parseFloat(row.querySelector('.sub-obtained')?.value) || 0;

    if (name) {
      subjects.push({ name, total, passing, obtained });
    }
  });

  if (!rollNo || !studentName || !subjects.length) {
    alert('Please enter Roll Number, Student Name, and at least 1 subject.');
    return;
  }

  const payload = {
    id: id || undefined,
    rollNo,
    studentName,
    fatherName,
    grade,
    examTerm,
    dateIssued,
    subjects,
    reExamDate: supplyExamDate,
    clearanceStatus: supplyClearanceStatus,
    feeStatus: supplyFeeStatus,
    remarks: supplyRemarks
  };

  const saved = APS_DB.saveResult(payload);

  // If clearing supply
  if (supplyClearanceStatus === 'Cleared / Passed in Supply Exam') {
    APS_DB.updateSupplyStatus(saved.id, {
      clearanceStatus: supplyClearanceStatus,
      clearedSubject: supplyClearedSub,
      remarks: supplyRemarks || 'Supplementary examination cleared. Marksheet revised.'
    });
  }

  closeModal('resultModal');
  loadResultsTable();
  updateResultsMetrics();
  showAdminToast(`Result for ${studentName} (${rollNo}) saved & published to portal!`, 'success');
}

function deleteResultFromAdmin(id) {
  if (confirm('Are you sure you want to delete this student result from the database and portal?')) {
    APS_DB.deleteResult(id);
    loadResultsTable();
    updateResultsMetrics();
    showAdminToast('Student result deleted.', 'info');
  }
}

// Marksheet Generator & Printing Modal
function openMarksheetModal(id) {
  const r = APS_DB.getResultById(id);
  if (!r) return;

  const content = document.getElementById('marksheetModalContent');
  if (!content) return;

  const s = APS_DB.getSettings() || {
    schoolName: 'Azan Public School',
    principalName: 'Wasim Fida',
    principalEdu: 'BSCS',
    phone: '0307-8208934',
    address: 'Ladon, Peer Adil, Dera Ghazi Khan'
  };

  let subjectsHtml = '';
  (r.subjects || []).forEach((sub, idx) => {
    const isSupply = sub.status === 'Supply';
    subjectsHtml += `
      <tr style="border-bottom:1px solid #e2e8f0; ${isSupply ? 'background:#fff1f2;' : (idx % 2 === 0 ? 'background:#f8fafc;' : 'background:#fff;')}">
        <td style="padding:8px 12px; font-weight:600; color:#1e293b;">${sub.name}</td>
        <td style="padding:8px 12px; text-align:center;">${sub.total}</td>
        <td style="padding:8px 12px; text-align:center; color:#64748b;">${sub.passing}</td>
        <td style="padding:8px 12px; text-align:center; font-weight:800; ${isSupply ? 'color:#b91c1c;' : 'color:#15803d;'}">${sub.obtained}</td>
        <td style="padding:8px 12px; text-align:center;">
          ${isSupply 
            ? '<span style="background:#fee2e2; color:#b91c1c; font-weight:800; font-size:0.75rem; padding:2px 8px; border-radius:4px; border:1px solid #fecaca;">SUPPLY</span>' 
            : '<span style="background:#dcfce7; color:#15803d; font-weight:700; font-size:0.75rem; padding:2px 8px; border-radius:4px;">PASS</span>'}
        </td>
      </tr>
    `;
  });

  // Supply Notification Card
  let supplyNoticeHtml = '';
  if (r.hasSupply) {
    supplyNoticeHtml = `
      <div style="background:#fff1f2; border:2px dashed #fca5a5; border-radius:8px; padding:1.25rem; margin-top:1.5rem;">
        <div style="display:flex; align-items:center; gap:0.5rem; color:#b91c1c; font-weight:800; font-size:1.05rem; margin-bottom:0.4rem;">
          <i class="fa-solid fa-triangle-exclamation" style="font-size:1.3rem;"></i>
          SUPPLEMENTARY / COMPARTMENT EXAMINATION NOTIFICATION
        </div>
        <p style="font-size:0.88rem; color:#475569; margin:0 0 0.6rem 0; line-height:1.5;">
          This student has appeared in ${r.examTerm} and failed to achieve minimum passing marks in <strong>${r.supplySubjects.join(', ')}</strong>.
        </p>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem; font-size:0.85rem; background:#fff; padding:0.75rem 1rem; border-radius:6px; border:1px solid #fecaca;">
          <div><strong style="color:#991b1b;">Re-Examination Date:</strong> ${r.supplyDetails?.reExamDate || 'To be announced by school office'}</div>
          <div><strong style="color:#991b1b;">Clearance Status:</strong> ${r.supplyDetails?.clearanceStatus || 'Pending Re-Exam'}</div>
          <div><strong style="color:#991b1b;">Examination Fee:</strong> ${r.supplyDetails?.feeStatus || 'Unpaid'}</div>
          <div><strong style="color:#991b1b;">Office Instructions:</strong> Contact office at Ladon, Peer Adil (${s.phone})</div>
        </div>
      </div>
    `;
  } else if ((r.overallStatus || '').includes('Cleared')) {
    supplyNoticeHtml = `
      <div style="background:#f0fdf4; border:1.5px solid #86efac; border-radius:8px; padding:1rem; margin-top:1.25rem;">
        <div style="color:#15803d; font-weight:800; font-size:0.95rem; display:flex; align-items:center; gap:0.5rem;">
          <i class="fa-solid fa-circle-check"></i> SUPPLEMENTARY EXAMINATION CLEARED
        </div>
        <p style="font-size:0.85rem; color:#166534; margin:4px 0 0 0;">
          ${r.supplyDetails?.remarks || 'The candidate has passed the supplementary re-examination successfully.'}
        </p>
      </div>
    `;
  }

  content.innerHTML = `
    <div id="printableResultCard" style="background:#ffffff; border:3px double #0b2545; border-radius:10px; padding:2rem; font-family:inherit; color:#1e293b;">
      <!-- DMC HEADER -->
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #0b2545; padding-bottom:1rem; margin-bottom:1.25rem;">
        <div style="display:flex; align-items:center; gap:1rem;">
          <div style="width:64px; height:64px; background:#0b2545; color:#fff; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:2rem;">
            <i class="fa-solid fa-graduation-cap"></i>
          </div>
          <div>
            <h2 style="font-size:1.5rem; font-weight:900; color:#0b2545; margin:0; line-height:1.2; letter-spacing:0.5px;">AZAN PUBLIC SCHOOL</h2>
            <div style="font-size:0.85rem; color:#0f825e; font-weight:700;">Knowledge &bull; Integrity &bull; Excellence</div>
            <div style="font-size:0.78rem; color:#64748b;"><i class="fa-solid fa-location-dot"></i> ${s.address} | <i class="fa-solid fa-phone"></i> ${s.phone}</div>
          </div>
        </div>
        <div style="text-align:right;">
          <span style="display:inline-block; background:#0b2545; color:#fff; font-size:0.75rem; font-weight:800; text-transform:uppercase; padding:4px 12px; border-radius:4px; letter-spacing:0.5px; margin-bottom:4px;">
            Official Marksheet
          </span>
          <div style="font-size:0.75rem; color:#64748b;">Issue Date: <strong>${r.dateIssued}</strong></div>
          <div style="font-size:0.75rem; color:#64748b;">DMC Reg #: <strong>${r.id}</strong></div>
        </div>
      </div>

      <div style="text-align:center; margin-bottom:1.25rem;">
        <h3 style="font-size:1.15rem; font-weight:800; text-transform:uppercase; color:#0b2545; letter-spacing:1px; margin:0;">
          Detailed Marks Certificate (DMC)
        </h3>
        <div style="font-size:0.85rem; color:#475569; font-weight:600;">${r.examTerm}</div>
      </div>

      <!-- STUDENT PARTICULAR BOX -->
      <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px; padding:1rem; margin-bottom:1.5rem; display:grid; grid-template-columns:1fr 1fr; gap:0.75rem; font-size:0.88rem;">
        <div><strong style="color:#0b2545;">Student Name:</strong> <span style="font-weight:700; color:#1e293b;">${r.studentName}</span></div>
        <div><strong style="color:#0b2545;">Roll Number:</strong> <span style="font-weight:800; color:#0f825e; font-size:1rem;">${r.rollNo}</span></div>
        <div><strong style="color:#0b2545;">Father's Name:</strong> ${r.fatherName}</div>
        <div><strong style="color:#0b2545;">Class / Grade:</strong> ${r.grade}</div>
      </div>

      <!-- SUBJECT MARKS TABLE -->
      <table style="width:100%; border-collapse:collapse; font-size:0.88rem; margin-bottom:1.5rem; border:1px solid #cbd5e1;">
        <thead>
          <tr style="background:#0b2545; color:#ffffff; text-align:left;">
            <th style="padding:8px 12px;">Subject Title</th>
            <th style="padding:8px 12px; width:90px; text-align:center;">Max Marks</th>
            <th style="padding:8px 12px; width:90px; text-align:center;">Min Pass</th>
            <th style="padding:8px 12px; width:100px; text-align:center;">Marks Obtained</th>
            <th style="padding:8px 12px; width:90px; text-align:center;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${subjectsHtml}
        </tbody>
      </table>

      <!-- RESULT SUMMARY BAR -->
      <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:1rem; background:#f1f5f9; border:1px solid #cbd5e1; border-radius:8px; padding:1rem; text-align:center;">
        <div>
          <div style="font-size:0.75rem; color:#64748b; font-weight:700; text-transform:uppercase;">Grand Total</div>
          <div style="font-size:1.2rem; font-weight:800; color:#0b2545;">${r.obtainedMarks} / ${r.totalMarks}</div>
        </div>
        <div>
          <div style="font-size:0.75rem; color:#64748b; font-weight:700; text-transform:uppercase;">Percentage</div>
          <div style="font-size:1.2rem; font-weight:800; color:#0f825e;">${r.percentage}%</div>
        </div>
        <div>
          <div style="font-size:0.75rem; color:#64748b; font-weight:700; text-transform:uppercase;">Overall Grade</div>
          <div style="font-size:1.2rem; font-weight:800; color:#d97706;">${r.gradeEarned}</div>
        </div>
        <div>
          <div style="font-size:0.75rem; color:#64748b; font-weight:700; text-transform:uppercase;">Final Result</div>
          <div style="font-size:1.1rem; font-weight:800; ${r.hasSupply ? 'color:#b91c1c;' : 'color:#15803d;'}">
            ${r.hasSupply ? 'SUPPLY' : 'PASSED'}
          </div>
        </div>
      </div>

      <!-- SUPPLY NOTIFICATION -->
      ${supplyNoticeHtml}

      <!-- SIGNATURE & STAMP FOOTER -->
      <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-top:2.5rem; padding-top:1.5rem; border-top:1px dashed #cbd5e1;">
        <div style="text-align:center;">
          <div style="height:35px;"></div>
          <div style="width:170px; border-top:1.5px solid #475569; padding-top:4px; font-size:0.78rem; font-weight:700; color:#475569;">
            Class Teacher In-Charge
          </div>
        </div>

        <div style="text-align:center;">
          <div style="border:2px dashed #0f825e; padding:6px 14px; border-radius:6px; color:#0f825e; font-size:0.72rem; font-weight:800; display:inline-block; margin-bottom:4px;">
            AZAN PUBLIC SCHOOL &bull; VERIFIED
          </div>
          <div style="font-size:0.7rem; color:#64748b;">Peer Adil Campus &bull; Wasim Fida (BSCS)</div>
        </div>

        <div style="text-align:center;">
          <div style="font-family:'Brush Script MT', cursive; font-size:1.4rem; color:#0b2545; height:35px; line-height:35px;">Wasim Fida</div>
          <div style="width:170px; border-top:1.5px solid #475569; padding-top:4px; font-size:0.78rem; font-weight:700; color:#475569;">
            Principal (Wasim Fida, BSCS)
          </div>
        </div>
      </div>
    </div>
  `;

  const modal = document.getElementById('marksheetModal');
  if (modal) modal.classList.add('active');
}

function printMarksheetFromModal() {
  const printable = document.getElementById('printableResultCard');
  if (!printable) return;

  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Azan Public School - Detailed Marks Certificate</title>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 20px; background: #fff; }
        @media print {
          body { margin: 0; padding: 10px; }
          @page { size: A4 portrait; margin: 10mm; }
        }
      </style>
    </head>
    <body>
      \${printable.outerHTML}
      <script>
        window.onload = function() {
          window.print();
        };
      <\/script>
    </body>
    </html>
  `);
  printWindow.document.close();
}

// Window bindings
window.openAddResultModal = openAddResultModal;
window.openEditResultModal = openEditResultModal;
window.addSubjectRow = addSubjectRow;
window.applySubjectPreset = applySubjectPreset;
window.calculateModalScores = calculateModalScores;
window.saveResultFromAdmin = saveResultFromAdmin;
window.deleteResultFromAdmin = deleteResultFromAdmin;
window.openMarksheetModal = openMarksheetModal;
window.printMarksheetFromModal = printMarksheetFromModal;
