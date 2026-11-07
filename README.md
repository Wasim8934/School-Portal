# Azan Public School - Official Website & Comprehensive Admin Control CMS

A modern, responsive, and complete educational institution website built for **Azan Public School** (Knowledge • Integrity • Excellence), featuring a **Full-Featured Admin Control Panel & CMS** to manage admissions, notices, school events, fee structure, and site settings.

---

## 🏫 School Profile
- **School Name**: Azan Public School
- **Principal**: Wasim Fida (BSCS)
- **Campus Address**: Ladon, Peer Adil, Dera Ghazi Khan, Punjab, Pakistan
- **Contact & WhatsApp**: 0307-8208934
- **School Timings**:
  - Monday to Thursday & Saturday: 8:00 AM – 2:00 PM
  - Friday: 8:00 AM – 12:00 PM
  - Sunday: Closed

---

## 🔐 Admin Control Panel & Live Database
- **Admin Login URL**: [`admin-login.html`](admin-login.html)
- **Dashboard URL**: [`admin-dashboard.html`](admin-dashboard.html)
- **Default Username**: `admin`
- **Default Password**: `admin123`

### 🎛️ Admin Modules & Capabilities:

1. 📋 **Admissions & Online Inquiries Manager (Tab 1)**:
   - **Real-time Live Sync**: Online form submissions from `admissions.html` and the homepage appear instantly at the top of the applications table.
   - **Status Changer**: 1-click status update (`Pending`, `Under Review`, `Approved`, `Rejected`).
   - **Direct WhatsApp Messaging**: Click the green WhatsApp button next to any parent's phone number to open a pre-filled direct WhatsApp chat window.
   - **Applicant Dossier & Print Slip**: View full student particulars (DOB, B-Form, previous school, father CNIC, address) and generate/print official registration slips with one click.
   - **Export to Excel / CSV**: Download the complete list of candidate records in CSV format.
   - **Manual Registration**: Add walk-in / office registrations directly into the database.

2. 📢 **Notices & Circulars Manager (Tab 2)**:
   - **Post New Notice**: Publish school circulars with Title, Category (`Examinations`, `Parent Meeting`, `Sports Gala`, `Exhibition`, `Holiday`, `Urgent`, `General`), Date, Reference Number, and Description.
   - **Pin to Marquee Ticker**: Toggle a notice to appear as the prominent marquee banner across all website header bars.
   - **Edit & Delete**: Full CRUD controls with instant synchronization across `notices.html` and the homepage notice board.

3. 🏆 **Events & Sports Gala Calendar (Tab 3)**:
   - **Schedule Events**: Add sports galas, athletics competitions, academic conferences, exhibitions, and ceremonies.
   - **Track Status**: Update event status (`Upcoming`, `Ongoing`, `Completed`).
   - **Instant Display**: Scheduled events automatically appear on the homepage and the `notices.html#events` calendar grid.

4. 💰 **Fee Structure & Calculator Manager (Tab 4)**:
   - **Class-wise Fee Rates**: Edit Monthly Tuition, One-Time Admission Fee, and Science/Computer Lab Charges for Montessori, Primary (1-5), Middle (6-8), Matric (9-10), and O-Levels.
   - **Transport Zones & Concessions**: Configure Zone 1, 2, and 3 transit charges and sibling discount percentages.
   - **Interactive Live Preview**: Test the fee calculation directly in the admin panel before saving.
   - **Live Website Sync**: Changes saved in the admin panel immediately power the public fee calculator on `admissions.html`.

5. ⚙️ **School Info & Operational Settings (Tab 5)**:
   - Update School Name, Tagline, Principal Name & Degree (Wasim Fida, BSCS).
   - Change Contact Phone, WhatsApp number, and Official Email.
   - Adjust Campus Timings (Regular days & Friday).
   - Set the default Top Announcement Bar ticker text.

6. 🖼️ **Home Main Picture & Highlights Slider Manager (Tab 6)**:
   - **Front Showcase Main Picture**: Change the main front campus picture displayed at the very top of `index.html`. Choose from 1-click campus presets or paste any custom high-resolution image URL. Edit Title, Subtitle, and Badge text with live real-time preview card.
   - **Interactive Highlights Slider**: Add, manage, and delete slides for sports galas, science labs, prize distribution ceremonies, computer labs, and Montessori activities. Instant live synchronization with the home page rotating carousel.

---

## 🌟 Public Website Features

1. **Multi-Page Architecture**:
   - `index.html`: **Front Main Campus Picture Showcase** with location & principal credentials, **Interactive Campus Highlights Carousel / Slider** (with auto-play, arrow controls, and pause-on-hover), Hero banner, quick admission inquiry, principal's message, core pillars, academic wing cards, dynamic real-time notice board, upcoming events widget, testimonials, and footer.
   - `about.html`: School history, vision & mission, core values, leadership by Wasim Fida (BSCS), and campus facilities.
   - `academics.html`: Detailed wings (Montessori, Primary, Middle, Secondary Matric & O-Levels), curriculum subjects, and co-curricular societies.
   - `admissions.html`: Step-by-step admission procedure, required documents checklist, **interactive online admission form** with printable registration slip generation, and **dynamic fee calculator** powered by the admin database.
   - `gallery.html`: Filterable campus photo gallery (Campus, Labs, Sports Gala, Ceremonies, Classroom) with interactive modal lightbox.
   - `notices.html`: Dynamic official school circulars list, upcoming events calendar grid, and official download center for Date Sheets, Academic Calendars, Prospectus, and Booklists.
   - `contact.html`: Contact info, direct messaging form with instant toast alerts, visiting hours, and Google Map directions.

2. **Interactive Elements**:
   - Fully responsive navigation with desktop megamenu dropdowns and mobile drawer navigation.
   - Floating WhatsApp Quick Chat button (`0307-8208934`) on every page.
   - Real-time animated student counters.
   - Zero external backend dependencies — powered by modern JavaScript and persistent browser storage!

---

## 🚀 How to Open and View

1. Navigate to:
   ```
   C:\Users\LAB_TWO\.gemini\antigravity\scratch\azan-public-school\
   ```
2. Double-click on `index.html` to open the public school website in Google Chrome, Microsoft Edge, or any browser.
3. Open `admin-login.html` and sign in with `admin` / `admin123` to access the Admin Control Panel.

---

## 📁 File Structure

```
azan-public-school/
├── index.html              # Homepage with dynamic notices & events
├── about.html              # About the School & Leadership
├── academics.html          # Academic Programs & Curriculum
├── admissions.html         # Online Admission Form & Dynamic Fee Calculator
├── gallery.html            # Campus Life & Photo Lightbox
├── notices.html            # Notice Board, Events Calendar & Downloads
├── contact.html            # Contact Us & Campus Location
├── admin-login.html        # Secure Admin Portal Login
├── admin-dashboard.html    # Full Admin Control Panel (Admissions, Notices, Events, Fees, Settings)
├── README.md               # Complete Documentation
└── assets/
    ├── css/
    │   └── style.css       # Main stylesheet (Responsive & Modern)
    ├── js/
    │   ├── db.js           # Persistent Central Database System (Admissions, Notices, Events, Fees, Settings)
    │   ├── admin.js        # Admin Control Panel Controller (Tabs, Tables, Modals, Forms)
    │   └── main.js         # Public Website Interactivity, Dynamic Loaders & Calculations
    └── images/             # Campus photos and assets
```
