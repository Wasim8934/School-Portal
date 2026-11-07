/**
 * AZAN PUBLIC SCHOOL - PERSISTENT DATABASE SYSTEM (LocalStorage Database)
 * Manages:
 * 1. Online Admission Applications
 * 2. School Notices & Circulars
 * 3. School Events & Sports Calendar
 * 4. Fee Structure & Concessions
 * 5. General School Information & Settings
 */

const APS_DB = {
  // Storage Keys
  STORAGE_KEY: 'aps_admissions_db_v2',
  AUTH_KEY: 'aps_admin_auth_session',
  NEW_SUBMISSIONS_KEY: 'aps_new_submissions_count',
  NOTICES_KEY: 'aps_notices_db_v1',
  EVENTS_KEY: 'aps_events_db_v1',
  FEE_KEY: 'aps_fee_structure_v1',
  SETTINGS_KEY: 'aps_school_settings_v1',
  BANNER_KEY: 'aps_home_banner_v1',
  SLIDER_KEY: 'aps_home_slider_v1',
  RESULTS_KEY: 'aps_results_db_v1',

  // ══════════════════════════════════════════════════════════════
  // 1. ADMISSIONS SYSTEM
  // ══════════════════════════════════════════════════════════════
  initDefaultData: function () {
    const existing = localStorage.getItem(this.STORAGE_KEY);
    if (!existing) {
      const initialRecords = [
        {
          id: 'APS-2026-104921',
          studentName: 'Muhammad Hamza',
          dob: '2014-04-12',
          gender: 'Male',
          grade: 'Class 6',
          fatherName: 'Tariq Mehmood',
          fatherCnic: '32102-1234567-1',
          phone: '0307-8208934',
          email: 'tariq.m@gmail.com',
          occupation: 'Businessman',
          transport: 'Yes',
          bform: 'N/A',
          prevSchool: 'N/A',
          address: 'Ladon, Near Peer Adil Canal Road, Dera Ghazi Khan',
          submissionDate: '10 Oct 2026, 10:30 AM',
          status: 'Approved',
          source: 'Demo Record'
        },
        {
          id: 'APS-2026-218402',
          studentName: 'Ayesha Bibi',
          dob: '2017-09-20',
          gender: 'Female',
          grade: 'Class 3',
          fatherName: 'Abdul Rasheed',
          fatherCnic: '32102-9876543-3',
          phone: '0301-7654321',
          email: 'rasheed.dgk@gmail.com',
          occupation: 'Govt Teacher',
          transport: 'No',
          bform: 'N/A',
          prevSchool: 'N/A',
          address: 'Basti Malana, Peer Adil, Dera Ghazi Khan',
          submissionDate: '10 Oct 2026, 02:15 PM',
          status: 'Pending',
          source: 'Demo Record'
        },
        {
          id: 'APS-2026-340918',
          studentName: 'Zain Ul Abideen',
          dob: '2011-02-15',
          gender: 'Male',
          grade: 'Class 9 (Matric Science)',
          fatherName: 'Ghulam Farid',
          fatherCnic: '32102-4567890-5',
          phone: '0333-8765432',
          email: 'farid.zain@yahoo.com',
          occupation: 'Agriculture',
          transport: 'Yes',
          bform: 'N/A',
          prevSchool: 'N/A',
          address: 'Chah Ladon Wala, Peer Adil, Dera Ghazi Khan',
          submissionDate: '11 Oct 2026, 08:45 AM',
          status: 'Under Review',
          source: 'Demo Record'
        }
      ];
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(initialRecords));
      return initialRecords;
    }
    try {
      return JSON.parse(existing) || [];
    } catch (e) {
      console.error('APS_DB: parse error', e);
      return [];
    }
  },

  getAllApplications: function () {
    return this.initDefaultData();
  },

  saveApplication: function (application) {
    try {
      const list = this.getAllApplications();
      const now = new Date();
      const formatted = now.toLocaleString('en-PK', {
        year: 'numeric', month: 'short',
        day: 'numeric', hour: '2-digit', minute: '2-digit'
      });

      const newRecord = {
        id: 'APS-2026-' + Math.floor(100000 + Math.random() * 900000),
        studentName: (application.studentName || 'Unnamed Student').trim(),
        dob:         (application.dob         || 'N/A').trim(),
        gender:      (application.gender       || 'N/A').trim(),
        grade:       (application.grade        || 'N/A').trim(),
        fatherName:  (application.fatherName   || 'N/A').trim(),
        fatherCnic:  (application.fatherCnic   || 'N/A').trim(),
        phone:       (application.phone        || 'N/A').trim(),
        email:       (application.email        || 'N/A').trim(),
        occupation:  (application.occupation   || 'N/A').trim(),
        transport:   (application.transport    || 'No').trim(),
        address:     (application.address      || 'N/A').trim(),
        bform:       (application.bform        || 'N/A').trim(),
        prevSchool:  (application.prevSchool   || 'N/A').trim(),
        submissionDate: formatted,
        status: 'Pending',
        source: application.source || 'Online Admission Form'
      };

      list.unshift(newRecord);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));

      const prev = parseInt(localStorage.getItem(this.NEW_SUBMISSIONS_KEY) || '0', 10);
      localStorage.setItem(this.NEW_SUBMISSIONS_KEY, String(prev + 1));

      return newRecord;
    } catch (err) {
      console.error('APS_DB.saveApplication error:', err);
      return null;
    }
  },

  updateStatus: function (id, newStatus) {
    const list = this.getAllApplications();
    const index = list.findIndex(item => item.id === id);
    if (index !== -1) {
      list[index].status = newStatus;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
      return true;
    }
    return false;
  },

  deleteApplication: function (id) {
    let list = this.getAllApplications();
    list = list.filter(item => item.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
    return true;
  },

  getNewCount: function () {
    return parseInt(localStorage.getItem(this.NEW_SUBMISSIONS_KEY) || '0', 10);
  },
  clearNewCount: function () {
    localStorage.setItem(this.NEW_SUBMISSIONS_KEY, '0');
  },

  exportToCSV: function () {
    const list = this.getAllApplications();
    if (!list.length) { alert('No data to export.'); return; }

    const headers = [
      'Registration ID','Student Name','Date of Birth','Gender','Grade Applied',
      'Father Name','Father CNIC','Phone','Email','B-Form','Previous School',
      'Transport','Address','Source','Date Submitted','Status'
    ];

    let csv = 'data:text/csv;charset=utf-8,' + headers.join(',') + '\n';
    list.forEach(item => {
      const row = [
        `"${item.id}"`,
        `"${(item.studentName||'').replace(/"/g,'""')}"`,
        `"${item.dob||''}"`,
        `"${item.gender||''}"`,
        `"${(item.grade||'').replace(/"/g,'""')}"`,
        `"${(item.fatherName||'').replace(/"/g,'""')}"`,
        `"${item.fatherCnic||''}"`,
        `"${item.phone||''}"`,
        `"${item.email||''}"`,
        `"${item.bform||''}"`,
        `"${(item.prevSchool||'').replace(/"/g,'""')}"`,
        `"${item.transport||''}"`,
        `"${(item.address||'').replace(/"/g,'""')}"`,
        `"${item.source||''}"`,
        `"${item.submissionDate||''}"`,
        `"${item.status||''}"`
      ];
      csv += row.join(',') + '\n';
    });

    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csv));
    link.setAttribute('download', `APS_Admissions_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  // ══════════════════════════════════════════════════════════════
  // 2. NOTICES & CIRCULARS MANAGEMENT
  // ══════════════════════════════════════════════════════════════
  initNoticesData: function () {
    const existing = localStorage.getItem(this.NOTICES_KEY);
    if (!existing) {
      const defaultNotices = [
        {
          id: 'NOT-2026-001',
          title: 'Mid-Term Examination Schedule Announced (Class 1 to 10)',
          day: '15',
          month: 'Oct',
          date: '15 Oct 2026',
          category: 'Examinations',
          ref: 'Ref # APS/NOT/2026/089',
          desc: 'The Mid-Term examinations for all classes will commence from October 28, 2026. Parents are requested to ensure timely fee clearance and regular study revision at home.',
          link: 'notices.html#downloads',
          pinned: true
        },
        {
          id: 'NOT-2026-002',
          title: 'Parent-Teacher Meeting (PTM) & Progress Review',
          day: '22',
          month: 'Oct',
          date: '22 Oct 2026',
          category: 'Parent Meeting',
          ref: 'Ref # APS/PTM/2026/012',
          desc: 'PTM is scheduled for Saturday between 8:30 AM and 1:00 PM. Parents will be able to review their children’s monthly assessment copies and discuss academic focus areas.',
          link: '',
          pinned: false
        },
        {
          id: 'NOT-2026-003',
          title: 'Registration for Annual Sports Gala 2026',
          day: '01',
          month: 'Nov',
          date: '01 Nov 2026',
          category: 'Sports Gala',
          ref: 'Ref # APS/SPT/2026/005',
          desc: 'House captains and class sports representatives should submit player rosters for Cricket, Football, Badminton, and Athletics to the Physical Education department.',
          link: '',
          pinned: true
        },
        {
          id: 'NOT-2026-004',
          title: 'Annual Science & Arts Exhibition Registration',
          day: '10',
          month: 'Nov',
          date: '10 Nov 2026',
          category: 'Exhibition',
          ref: 'Ref # APS/SCI/2026/018',
          desc: 'Students from Grade 4 to 10 are invited to submit experimental science project abstracts, working models, and artwork to their science and art teachers.',
          link: '',
          pinned: false
        }
      ];
      localStorage.setItem(this.NOTICES_KEY, JSON.stringify(defaultNotices));
      return defaultNotices;
    }
    try {
      return JSON.parse(existing) || [];
    } catch (e) {
      return [];
    }
  },

  getAllNotices: function () {
    return this.initNoticesData();
  },

  saveNotice: function (noticeData) {
    const list = this.getAllNotices();
    const dateObj = noticeData.date ? new Date(noticeData.date) : new Date();
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = dateObj.toLocaleString('en-US', { month: 'short' });
    const formattedDate = `${day} ${month} ${dateObj.getFullYear()}`;

    const newNotice = {
      id: noticeData.id || ('NOT-2026-' + String(Math.floor(100 + Math.random() * 900))),
      title: noticeData.title.trim(),
      day: day,
      month: month,
      date: formattedDate,
      category: noticeData.category || 'General',
      ref: noticeData.ref || `Ref # APS/NOT/2026/${Math.floor(100 + Math.random() * 900)}`,
      desc: noticeData.desc.trim(),
      link: noticeData.link || '',
      pinned: noticeData.pinned || false
    };

    list.unshift(newNotice);
    localStorage.setItem(this.NOTICES_KEY, JSON.stringify(list));
    return newNotice;
  },

  updateNotice: function (id, updatedData) {
    const list = this.getAllNotices();
    const idx = list.findIndex(item => item.id === id);
    if (idx !== -1) {
      if (updatedData.date) {
        const dateObj = new Date(updatedData.date);
        updatedData.day = String(dateObj.getDate()).padStart(2, '0');
        updatedData.month = dateObj.toLocaleString('en-US', { month: 'short' });
        updatedData.date = `${updatedData.day} ${updatedData.month} ${dateObj.getFullYear()}`;
      }
      list[idx] = { ...list[idx], ...updatedData };
      localStorage.setItem(this.NOTICES_KEY, JSON.stringify(list));
      return true;
    }
    return false;
  },

  deleteNotice: function (id) {
    let list = this.getAllNotices();
    list = list.filter(item => item.id !== id);
    localStorage.setItem(this.NOTICES_KEY, JSON.stringify(list));
    return true;
  },

  // ══════════════════════════════════════════════════════════════
  // 3. EVENTS & SPORTS CALENDAR MANAGEMENT
  // ══════════════════════════════════════════════════════════════
  initEventsData: function () {
    const existing = localStorage.getItem(this.EVENTS_KEY);
    if (!existing) {
      const defaultEvents = [
        {
          id: 'EVT-2026-01',
          title: 'Annual Inter-School Sports Gala 2026',
          date: '05 Nov 2026',
          day: '05',
          month: 'Nov',
          time: '09:00 AM - 02:00 PM',
          venue: 'Azan Public School Main Sports Ground, Peer Adil',
          category: 'Sports',
          status: 'Upcoming',
          desc: 'Cricket tournament finals, 100m sprint races, badminton doubles, and tug-of-war competitions between school houses.'
        },
        {
          id: 'EVT-2026-02',
          title: 'Parent-Teacher Progress Conference (PTM)',
          date: '22 Oct 2026',
          day: '22',
          month: 'Oct',
          time: '08:30 AM - 01:00 PM',
          venue: 'School Auditorium & Senior Classrooms',
          category: 'Academic',
          status: 'Upcoming',
          desc: 'Mid-term evaluation review, attendance analysis, and one-on-one academic counseling for parents with teachers.'
        },
        {
          id: 'EVT-2026-03',
          title: 'Annual Science & Robotics Tech Exhibition',
          date: '18 Nov 2026',
          day: '18',
          month: 'Nov',
          time: '10:00 AM - 01:30 PM',
          venue: 'Science Laboratories Complex, Peer Adil',
          category: 'Exhibition',
          status: 'Upcoming',
          desc: 'Working STEM models, physics simulations, solar energy projects, and software coding showcases made by students.'
        },
        {
          id: 'EVT-2026-04',
          title: 'High Achievers & Position Holders Award Ceremony',
          date: '15 Dec 2026',
          day: '15',
          month: 'Dec',
          time: '10:30 AM - 01:00 PM',
          venue: 'Main Campus Assembly Ground',
          category: 'Ceremony',
          status: 'Upcoming',
          desc: 'Distribution of merit shields, medals, and scholarship certificates to BISE Matriculation high scorers.'
        }
      ];
      localStorage.setItem(this.EVENTS_KEY, JSON.stringify(defaultEvents));
      return defaultEvents;
    }
    try {
      return JSON.parse(existing) || [];
    } catch (e) {
      return [];
    }
  },

  getAllEvents: function () {
    return this.initEventsData();
  },

  saveEvent: function (eventData) {
    const list = this.getAllEvents();
    const dateObj = eventData.date ? new Date(eventData.date) : new Date();
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = dateObj.toLocaleString('en-US', { month: 'short' });
    const formattedDate = `${day} ${month} ${dateObj.getFullYear()}`;

    const newEvent = {
      id: eventData.id || ('EVT-2026-' + String(Math.floor(10 + Math.random() * 90))),
      title: eventData.title.trim(),
      day: day,
      month: month,
      date: formattedDate,
      time: eventData.time || '09:00 AM - 02:00 PM',
      venue: eventData.venue || 'Azan Public School Campus, Peer Adil',
      category: eventData.category || 'Sports',
      status: eventData.status || 'Upcoming',
      desc: eventData.desc.trim()
    };

    list.unshift(newEvent);
    localStorage.setItem(this.EVENTS_KEY, JSON.stringify(list));
    return newEvent;
  },

  updateEvent: function (id, updatedData) {
    const list = this.getAllEvents();
    const idx = list.findIndex(item => item.id === id);
    if (idx !== -1) {
      if (updatedData.date) {
        const dateObj = new Date(updatedData.date);
        updatedData.day = String(dateObj.getDate()).padStart(2, '0');
        updatedData.month = dateObj.toLocaleString('en-US', { month: 'short' });
        updatedData.date = `${updatedData.day} ${updatedData.month} ${dateObj.getFullYear()}`;
      }
      list[idx] = { ...list[idx], ...updatedData };
      localStorage.setItem(this.EVENTS_KEY, JSON.stringify(list));
      return true;
    }
    return false;
  },

  deleteEvent: function (id) {
    let list = this.getAllEvents();
    list = list.filter(item => item.id !== id);
    localStorage.setItem(this.EVENTS_KEY, JSON.stringify(list));
    return true;
  },

  // ══════════════════════════════════════════════════════════════
  // 4. FEE STRUCTURE & CALCULATOR MANAGEMENT
  // ══════════════════════════════════════════════════════════════
  initFeeData: function () {
    const existing = localStorage.getItem(this.FEE_KEY);
    if (!existing) {
      const defaultFees = {
        grades: {
          playgroup: { name: 'Montessori (Playgroup, Nursery, Prep)', admissionFee: 4000, tuitionFee: 3200, labFee: 0 },
          primary:   { name: 'Primary Wing (Class 1 to 5)',            admissionFee: 5000, tuitionFee: 4200, labFee: 0 },
          middle:    { name: 'Middle School (Class 6 to 8)',           admissionFee: 6000, tuitionFee: 5500, labFee: 500 },
          matric:    { name: 'Secondary / Matriculation (Class 9-10)', admissionFee: 7000, tuitionFee: 6800, labFee: 1000 },
          olevels:   { name: 'Cambridge O-Levels',                     admissionFee: 12000, tuitionFee: 11000, labFee: 2000 }
        },
        transport: {
          zone1: 1500, // Within 3 km
          zone2: 2200, // 3 to 7 km
          zone3: 3000  // 7 to 12 km
        },
        siblingDiscountPercent: 15
      };
      localStorage.setItem(this.FEE_KEY, JSON.stringify(defaultFees));
      return defaultFees;
    }
    try {
      return JSON.parse(existing);
    } catch (e) {
      return null;
    }
  },

  getFeeStructure: function () {
    return this.initFeeData();
  },

  saveFeeStructure: function (newFees) {
    localStorage.setItem(this.FEE_KEY, JSON.stringify(newFees));
    return true;
  },

  // ══════════════════════════════════════════════════════════════
  // 5. GENERAL SCHOOL SETTINGS & TIMINGS
  // ══════════════════════════════════════════════════════════════
  initSettingsData: function () {
    const existing = localStorage.getItem(this.SETTINGS_KEY);
    if (!existing) {
      const defaultSettings = {
        schoolName: 'Azan Public School',
        tagline: 'Knowledge • Integrity • Excellence',
        principalName: 'Wasim Fida',
        principalEdu: 'BSCS',
        principalRole: 'Principal, Azan Public School',
        phone: '0307-8208934',
        whatsapp: '0307-8208934',
        email: 'info@azanpublicschool.edu.pk',
        address: 'Ladon, Peer Adil, Dera Ghazi Khan, Punjab, Pakistan',
        timingsRegular: 'Mon-Thu & Sat: 8:00 AM – 2:00 PM',
        timingsFriday: 'Friday: 8:00 AM – 12:00 PM',
        announcementTicker: 'Admissions open from Playgroup to Grade 10! Merit scholarships available for session 2026-2027.'
      };
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(defaultSettings));
      return defaultSettings;
    }
    try {
      return JSON.parse(existing);
    } catch (e) {
      return null;
    }
  },

  getSettings: function () {
    return this.initSettingsData();
  },

  saveSettings: function (newSettings) {
    const current = this.getSettings() || {};
    const merged = { ...current, ...newSettings };
    localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(merged));
    return merged;
  },

  // ══════════════════════════════════════════════════════════════
  // 6. HOME MAIN PICTURE & SLIDER MANAGEMENT
  // ══════════════════════════════════════════════════════════════
  initBannerData: function () {
    const existing = localStorage.getItem(this.BANNER_KEY);
    if (!existing) {
      const defaultBanner = {
        mainImageUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1400&q=80',
        title: 'Azan Public School Main Campus',
        subtitle: 'Ladon, Peer Adil, Dera Ghazi Khan — Inspiring Academic Brilliance, Islamic Values & Modern STEM Learning',
        badge: 'Campus Showcase • Peer Adil',
        established: 'Est. 2008',
        principalTag: 'Principal: Wasim Fida (BSCS)'
      };
      localStorage.setItem(this.BANNER_KEY, JSON.stringify(defaultBanner));
      return defaultBanner;
    }
    try {
      return JSON.parse(existing) || {};
    } catch (e) {
      return {};
    }
  },

  getBannerData: function () {
    return this.initBannerData();
  },

  saveBannerData: function (data) {
    const current = this.getBannerData();
    const updated = { ...current, ...data };
    localStorage.setItem(this.BANNER_KEY, JSON.stringify(updated));
    return updated;
  },

  initSliderData: function () {
    let slides = null;
    try {
      const existing = localStorage.getItem(this.SLIDER_KEY);
      if (existing) {
        slides = JSON.parse(existing);
      }
    } catch (e) {
      slides = null;
    }

    if (!Array.isArray(slides) || slides.length === 0) {
      const defaultSlides = [
        {
          id: 'SLD-01',
          imageUrl: 'https://images.unsplash.com/photo-1526676037777-05a232554f77?auto=format&fit=crop&w=1200&q=80',
          title: 'Annual Sports Gala & Athletics Championship',
          caption: 'Inter-house cricket tournaments, sprint races, and athletics competitions on campus grounds.',
          tag: 'Sports Gala'
        },
        {
          id: 'SLD-02',
          imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80',
          title: 'Modern Science & Practical Experiment Labs',
          caption: 'Hands-on practical experiments in Physics, Chemistry, and Biology laboratories.',
          tag: 'Science Labs'
        },
        {
          id: 'SLD-03',
          imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80',
          title: 'High Achievers & Position Holders Award Ceremony',
          caption: 'Celebrating academic brilliance and merit scholarship certificates for BISE board toppers.',
          tag: 'Prize Distribution'
        },
        {
          id: 'SLD-04',
          imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
          title: 'Computer Science, Coding & AI Education',
          caption: 'Modern ICT laboratory empowering students with programming, digital literacy, and logic.',
          tag: 'Computer Lab'
        },
        {
          id: 'SLD-05',
          imageUrl: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1200&q=80',
          title: 'Interactive Conceptual Classroom Learning',
          caption: 'Engaging classroom discussions, smart visual aids, and individual student attention from certified educators.',
          tag: 'Classrooms'
        },
        {
          id: 'SLD-06',
          imageUrl: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=1200&q=80',
          title: 'Montessori Early Childhood Activity Zone',
          caption: 'Child-safe colorful classrooms, sensory apparatus, and foundational phonics development.',
          tag: 'Montessori Wing'
        },
        {
          id: 'SLD-07',
          imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80',
          title: 'Central Campus Library & Knowledge Corner',
          caption: 'Extensive collection of reference books, encyclopedia volumes, Islamic studies, and peaceful study desks.',
          tag: 'Library Wing'
        }
      ];
      try {
        localStorage.setItem(this.SLIDER_KEY, JSON.stringify(defaultSlides));
      } catch (err) {}
      return defaultSlides;
    }
    return slides;
  },

  getSliderData: function () {
    return this.initSliderData();
  },

  saveSliderData: function (data) {
    localStorage.setItem(this.SLIDER_KEY, JSON.stringify(data));
    return true;
  },

  addSlideItem: function (slide) {
    const list = this.getSliderData();
    const newSlide = {
      id: 'SLD-' + Math.floor(10 + Math.random() * 90),
      imageUrl: slide.imageUrl,
      title: slide.title,
      caption: slide.caption,
      tag: slide.tag || 'Campus Life'
    };
    list.push(newSlide);
    localStorage.setItem(this.SLIDER_KEY, JSON.stringify(list));
    return newSlide;
  },

  deleteSlideItem: function (id) {
    let list = this.getSliderData();
    list = list.filter(item => item.id !== id);
    localStorage.setItem(this.SLIDER_KEY, JSON.stringify(list));
    return true;
  },

  // ══════════════════════════════════════════════════════════════
  // 8. STUDENT RESULTS & EXAMINATION SYSTEM (PORTAL & SUPPLY MANAGEMENT)
  // ══════════════════════════════════════════════════════════════
  initResultsData: function () {
    let results = null;
    try {
      const existing = localStorage.getItem(this.RESULTS_KEY);
      if (existing) {
        results = JSON.parse(existing);
      }
    } catch (e) {
      results = null;
    }

    if (!Array.isArray(results) || results.length === 0) {
      const defaultResults = [
        {
          id: 'RES-101',
          rollNo: 'APS-2026-101',
          studentName: 'Muhammad Hamza',
          fatherName: 'Tariq Mehmood',
          grade: 'Class 9 (Matric Science)',
          examTerm: 'Mid-Term Examination 2026',
          examYear: '2026',
          dateIssued: '02 Nov 2026',
          subjects: [
            { name: 'English', total: 100, passing: 33, obtained: 82, status: 'Pass' },
            { name: 'Urdu', total: 100, passing: 33, obtained: 88, status: 'Pass' },
            { name: 'Mathematics', total: 100, passing: 33, obtained: 91, status: 'Pass' },
            { name: 'Physics', total: 75, passing: 25, obtained: 64, status: 'Pass' },
            { name: 'Chemistry', total: 75, passing: 25, obtained: 60, status: 'Pass' },
            { name: 'Islamiat', total: 50, passing: 17, obtained: 46, status: 'Pass' },
            { name: 'Computer Science', total: 75, passing: 25, obtained: 68, status: 'Pass' }
          ],
          totalMarks: 575,
          obtainedMarks: 499,
          percentage: 86.78,
          gradeEarned: 'A+',
          overallStatus: 'Passed',
          hasSupply: false,
          supplyCount: 0,
          supplySubjects: [],
          supplyDetails: {
            reExamDate: '',
            clearanceStatus: 'N/A',
            feeStatus: 'N/A',
            remarks: 'Passed with Academic Distinction! Excellent performance in Mathematics and Science.'
          }
        },
        {
          id: 'RES-102',
          rollNo: 'APS-2026-102',
          studentName: 'Zain Ul Abideen',
          fatherName: 'Ghulam Farid',
          grade: 'Class 9 (Matric Science)',
          examTerm: 'Mid-Term Examination 2026',
          examYear: '2026',
          dateIssued: '02 Nov 2026',
          subjects: [
            { name: 'English', total: 100, passing: 33, obtained: 71, status: 'Pass' },
            { name: 'Urdu', total: 100, passing: 33, obtained: 74, status: 'Pass' },
            { name: 'Mathematics', total: 100, passing: 33, obtained: 24, status: 'Supply' },
            { name: 'Physics', total: 75, passing: 25, obtained: 48, status: 'Pass' },
            { name: 'Chemistry', total: 75, passing: 25, obtained: 52, status: 'Pass' },
            { name: 'Islamiat', total: 50, passing: 17, obtained: 40, status: 'Pass' },
            { name: 'Computer Science', total: 75, passing: 25, obtained: 55, status: 'Pass' }
          ],
          totalMarks: 575,
          obtainedMarks: 364,
          percentage: 63.3,
          gradeEarned: 'Supply',
          overallStatus: 'Supply',
          hasSupply: true,
          supplyCount: 1,
          supplySubjects: ['Mathematics'],
          supplyDetails: {
            reExamDate: '15 Dec 2026',
            clearanceStatus: 'Pending Re-Exam',
            feeStatus: 'Paid',
            remarks: '1 Supply in Mathematics (Obtained 24, Passing 33). Supplementary re-exam scheduled on 15 Dec 2026.'
          }
        },
        {
          id: 'RES-103',
          rollNo: 'APS-2026-103',
          studentName: 'Ayesha Bibi',
          fatherName: 'Abdul Rasheed',
          grade: 'Class 8 (Middle Wing)',
          examTerm: 'Mid-Term Examination 2026',
          examYear: '2026',
          dateIssued: '02 Nov 2026',
          subjects: [
            { name: 'English', total: 100, passing: 33, obtained: 92, status: 'Pass' },
            { name: 'Urdu', total: 100, passing: 33, obtained: 89, status: 'Pass' },
            { name: 'Mathematics', total: 100, passing: 33, obtained: 96, status: 'Pass' },
            { name: 'General Science', total: 100, passing: 33, obtained: 94, status: 'Pass' },
            { name: 'Islamiat', total: 50, passing: 17, obtained: 48, status: 'Pass' },
            { name: 'Social Studies', total: 100, passing: 33, obtained: 88, status: 'Pass' },
            { name: 'Computer Studies', total: 100, passing: 33, obtained: 90, status: 'Pass' }
          ],
          totalMarks: 650,
          obtainedMarks: 597,
          percentage: 91.85,
          gradeEarned: 'A+',
          overallStatus: 'Passed',
          hasSupply: false,
          supplyCount: 0,
          supplySubjects: [],
          supplyDetails: {
            reExamDate: '',
            clearanceStatus: 'N/A',
            feeStatus: 'N/A',
            remarks: 'Class Position Holder (1st Position)! Eligible for Merit Scholarship.'
          }
        },
        {
          id: 'RES-104',
          rollNo: 'APS-2026-104',
          studentName: 'Bilal Tariq',
          fatherName: 'Tariq Hussain',
          grade: 'Class 10 (Matriculation)',
          examTerm: 'Mid-Term Examination 2026',
          examYear: '2026',
          dateIssued: '02 Nov 2026',
          subjects: [
            { name: 'English', total: 100, passing: 33, obtained: 58, status: 'Pass' },
            { name: 'Urdu', total: 100, passing: 33, obtained: 62, status: 'Pass' },
            { name: 'Mathematics', total: 100, passing: 33, obtained: 68, status: 'Pass' },
            { name: 'Physics', total: 75, passing: 25, obtained: 21, status: 'Supply' },
            { name: 'Chemistry', total: 75, passing: 25, obtained: 19, status: 'Supply' },
            { name: 'Pakistan Studies', total: 50, passing: 17, obtained: 38, status: 'Pass' },
            { name: 'Biology', total: 75, passing: 25, obtained: 50, status: 'Pass' }
          ],
          totalMarks: 575,
          obtainedMarks: 316,
          percentage: 54.96,
          gradeEarned: 'Supply',
          overallStatus: 'Supply',
          hasSupply: true,
          supplyCount: 2,
          supplySubjects: ['Physics', 'Chemistry'],
          supplyDetails: {
            reExamDate: '20 Dec 2026',
            clearanceStatus: 'Re-Exam Scheduled',
            feeStatus: 'Unpaid',
            remarks: '2 Supplies (Physics & Chemistry). Clearance fee challan must be deposited at school office before 10 Dec 2026.'
          }
        },
        {
          id: 'RES-105',
          rollNo: 'APS-2026-105',
          studentName: 'Fatima Noor',
          fatherName: 'Noor Muhammad',
          grade: 'Class 10 (Matriculation)',
          examTerm: 'Mid-Term Examination 2026',
          examYear: '2026',
          dateIssued: '02 Nov 2026',
          subjects: [
            { name: 'English', total: 100, passing: 33, obtained: 75, status: 'Pass' },
            { name: 'Urdu', total: 100, passing: 33, obtained: 80, status: 'Pass' },
            { name: 'Mathematics', total: 100, passing: 33, obtained: 54, status: 'Pass (Cleared)' },
            { name: 'Physics', total: 75, passing: 25, obtained: 58, status: 'Pass' },
            { name: 'Chemistry', total: 75, passing: 25, obtained: 62, status: 'Pass' },
            { name: 'Pakistan Studies', total: 50, passing: 17, obtained: 42, status: 'Pass' },
            { name: 'Biology', total: 75, passing: 25, obtained: 64, status: 'Pass' }
          ],
          totalMarks: 575,
          obtainedMarks: 435,
          percentage: 75.65,
          gradeEarned: 'B',
          overallStatus: 'Passed (Supply Cleared)',
          hasSupply: false,
          supplyCount: 0,
          supplySubjects: [],
          supplyDetails: {
            reExamDate: '15 Oct 2026',
            clearanceStatus: 'Cleared / Passed in Supply Exam',
            feeStatus: 'Paid',
            remarks: 'Appeared in supplementary exam on 15 Oct 2026. Successfully cleared Mathematics with 54 marks. Marksheet revised.'
          }
        },
        {
          id: 'RES-106',
          rollNo: 'APS-2026-106',
          studentName: 'Usman Ghani',
          fatherName: 'Muhammad Sharif',
          grade: 'Class 7 (Middle Wing)',
          examTerm: 'Mid-Term Examination 2026',
          examYear: '2026',
          dateIssued: '02 Nov 2026',
          subjects: [
            { name: 'English', total: 100, passing: 33, obtained: 72, status: 'Pass' },
            { name: 'Urdu', total: 100, passing: 33, obtained: 78, status: 'Pass' },
            { name: 'Mathematics', total: 100, passing: 33, obtained: 65, status: 'Pass' },
            { name: 'General Science', total: 100, passing: 33, obtained: 70, status: 'Pass' },
            { name: 'Islamiat', total: 50, passing: 17, obtained: 42, status: 'Pass' },
            { name: 'Social Studies', total: 100, passing: 33, obtained: 68, status: 'Pass' },
            { name: 'Computer', total: 100, passing: 33, obtained: 74, status: 'Pass' }
          ],
          totalMarks: 650,
          obtainedMarks: 469,
          percentage: 72.15,
          gradeEarned: 'B',
          overallStatus: 'Passed',
          hasSupply: false,
          supplyCount: 0,
          supplySubjects: [],
          supplyDetails: {
            reExamDate: '',
            clearanceStatus: 'N/A',
            feeStatus: 'N/A',
            remarks: 'Satisfactory academic progress. Keep it up.'
          }
        }
      ];

      try {
        localStorage.setItem(this.RESULTS_KEY, JSON.stringify(defaultResults));
      } catch (err) {}
      return defaultResults;
    }
    return results;
  },

  getAllResults: function () {
    return this.initResultsData();
  },

  getResultById: function (id) {
    const list = this.getAllResults();
    return list.find(item => item.id === id) || null;
  },

  findResultByRollNo: function (query) {
    if (!query) return null;
    const list = this.getAllResults();
    const cleanQuery = query.toString().trim().toLowerCase();
    const strippedQuery = cleanQuery.replace(/[^a-z0-9]/g, '');

    return list.find(item => {
      const itemRoll = (item.rollNo || '').toString().toLowerCase();
      const strippedRoll = itemRoll.replace(/[^a-z0-9]/g, '');
      const itemName = (item.studentName || '').toLowerCase();

      return itemRoll === cleanQuery ||
             strippedRoll === strippedQuery ||
             itemRoll.includes(cleanQuery) ||
             (strippedQuery.length >= 3 && strippedRoll.includes(strippedQuery)) ||
             itemName === cleanQuery;
    }) || null;
  },

  calculateResultMetrics: function (subjects) {
    let totalMarks = 0;
    let obtainedMarks = 0;
    const supplySubjects = [];

    const computedSubjects = (subjects || []).map(s => {
      const t = parseFloat(s.total) || 100;
      const p = parseFloat(s.passing) || Math.round(t * 0.33);
      const o = parseFloat(s.obtained) || 0;
      totalMarks += t;
      obtainedMarks += o;

      const isSupply = o < p;
      if (isSupply) {
        supplySubjects.push(s.name || 'Subject');
      }

      return {
        name: s.name || 'Subject',
        total: t,
        passing: p,
        obtained: o,
        status: isSupply ? 'Supply' : 'Pass'
      };
    });

    const percentage = totalMarks > 0 ? parseFloat(((obtainedMarks / totalMarks) * 100).toFixed(2)) : 0;
    const hasSupply = supplySubjects.length > 0;

    let gradeEarned = 'F';
    if (hasSupply) {
      gradeEarned = 'Supply';
    } else if (percentage >= 90) {
      gradeEarned = 'A+';
    } else if (percentage >= 80) {
      gradeEarned = 'A';
    } else if (percentage >= 70) {
      gradeEarned = 'B';
    } else if (percentage >= 60) {
      gradeEarned = 'C';
    } else if (percentage >= 50) {
      gradeEarned = 'D';
    } else {
      gradeEarned = 'E';
    }

    return {
      subjects: computedSubjects,
      totalMarks,
      obtainedMarks,
      percentage,
      gradeEarned,
      hasSupply,
      supplyCount: supplySubjects.length,
      supplySubjects,
      overallStatus: hasSupply ? 'Supply' : 'Passed'
    };
  },

  saveResult: function (data) {
    const list = this.getAllResults();
    const metrics = this.calculateResultMetrics(data.subjects || []);

    const newResult = {
      id: data.id || ('RES-' + Math.floor(100 + Math.random() * 900)),
      rollNo: (data.rollNo || '').trim().toUpperCase(),
      studentName: (data.studentName || '').trim(),
      fatherName: (data.fatherName || '').trim(),
      grade: (data.grade || '').trim(),
      examTerm: (data.examTerm || 'Mid-Term Examination 2026').trim(),
      examYear: (data.examYear || '2026').trim(),
      dateIssued: data.dateIssued || new Date().toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' }),
      subjects: metrics.subjects,
      totalMarks: metrics.totalMarks,
      obtainedMarks: metrics.obtainedMarks,
      percentage: metrics.percentage,
      gradeEarned: metrics.gradeEarned,
      overallStatus: data.overallStatus || metrics.overallStatus,
      hasSupply: metrics.hasSupply,
      supplyCount: metrics.supplyCount,
      supplySubjects: metrics.supplySubjects,
      supplyDetails: {
        reExamDate: data.reExamDate || (data.supplyDetails ? data.supplyDetails.reExamDate : ''),
        clearanceStatus: data.clearanceStatus || (data.supplyDetails ? data.supplyDetails.clearanceStatus : (metrics.hasSupply ? 'Pending Re-Exam' : 'N/A')),
        feeStatus: data.feeStatus || (data.supplyDetails ? data.supplyDetails.feeStatus : (metrics.hasSupply ? 'Unpaid' : 'N/A')),
        remarks: data.remarks || (data.supplyDetails ? data.supplyDetails.remarks : (metrics.hasSupply ? `Supply in ${metrics.supplySubjects.join(', ')}` : 'Passed successfully.'))
      }
    };

    const existingIdx = list.findIndex(item => item.id === newResult.id || item.rollNo === newResult.rollNo);
    if (existingIdx > -1) {
      list[existingIdx] = newResult;
    } else {
      list.unshift(newResult);
    }

    localStorage.setItem(this.RESULTS_KEY, JSON.stringify(list));
    return newResult;
  },

  updateSupplyStatus: function (id, updates) {
    const list = this.getAllResults();
    const idx = list.findIndex(item => item.id === id);
    if (idx === -1) return null;

    const res = list[idx];
    res.supplyDetails = {
      ...res.supplyDetails,
      ...updates
    };

    if (updates.clearanceStatus === 'Cleared / Passed in Supply Exam') {
      res.overallStatus = 'Passed (Supply Cleared)';
      res.hasSupply = false;
      res.supplyCount = 0;
      if (updates.clearedSubject && updates.newMarks) {
        const sub = res.subjects.find(s => s.name.toLowerCase() === updates.clearedSubject.toLowerCase());
        if (sub) {
          sub.obtained = parseFloat(updates.newMarks);
          sub.status = 'Pass (Cleared)';
        }
        const m = this.calculateResultMetrics(res.subjects);
        res.totalMarks = m.totalMarks;
        res.obtainedMarks = m.obtainedMarks;
        res.percentage = m.percentage;
        res.gradeEarned = m.gradeEarned;
      }
    } else if (updates.clearanceStatus === 'Pending Re-Exam' || updates.clearanceStatus === 'Re-Exam Scheduled') {
      res.overallStatus = 'Supply';
      res.hasSupply = true;
    }

    list[idx] = res;
    localStorage.setItem(this.RESULTS_KEY, JSON.stringify(list));
    return res;
  },

  deleteResult: function (id) {
    let list = this.getAllResults();
    list = list.filter(item => item.id !== id);
    localStorage.setItem(this.RESULTS_KEY, JSON.stringify(list));
    return true;
  },

  // ══════════════════════════════════════════════════════════════
  // 7. AUTHENTICATION HELPERS
  // ══════════════════════════════════════════════════════════════
  login: function (username, password) {
    if ((username === 'admin' || username === 'wasim') && password === 'admin123') {
      const session = {
        user: username === 'wasim' ? 'Principal Wasim Fida' : 'School Administrator',
        role: 'Admin',
        time: new Date().toISOString()
      };
      sessionStorage.setItem(this.AUTH_KEY, JSON.stringify(session));
      return true;
    }
    return false;
  },
  logout: function () {
    sessionStorage.removeItem(this.AUTH_KEY);
    window.location.href = 'admin-login.html';
  },
  getCurrentUser: function () {
    try { return JSON.parse(sessionStorage.getItem(this.AUTH_KEY)); }
    catch (e) { return null; }
  },
  requireAuth: function () {
    const user = this.getCurrentUser();
    if (!user) window.location.href = 'admin-login.html';
    return user;
  }
};

// Initialise all database stores on script load
APS_DB.initDefaultData();
APS_DB.initNoticesData();
APS_DB.initEventsData();
APS_DB.initFeeData();
APS_DB.initSettingsData();
APS_DB.initBannerData();
APS_DB.initSliderData();
APS_DB.initResultsData();
