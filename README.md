# Daniele Pauli Coaching Website

This repository contains the code for Daniele Pauli's high-performance coaching website, featuring an animated hero section inspired by the Prometheus pitch deck style.

## Structure

The website consists of the following main components:

1. **Main Homepage** (`src/pages/index.js` or `src/App.js`)
   - Animated hero section with floating quotes
   - Overview of coaching services
   - Client testimonials
   - Call-to-action sections

2. **Application Form** (`src/pages/apply.js` or `src/components/ApplicationForm.js`)
   - Multi-step application process
   - Personal information collection
   - Fitness background assessment
   - Package selection

3. **Booking System** (`src/pages/book.js` or `src/components/BookingPage.js`)
   - Calendar integration
   - Time slot selection
   - Booking confirmation

## Setup Instructions

### 1. Create a New React Project

```bash
# Using Create React App
npx create-react-app daniele-pauli-coaching
cd daniele-pauli-coaching

# OR using Next.js
npx create-next-app daniele-pauli-coaching
cd daniele-pauli-coaching
```

### 2. Install Dependencies

```bash
# Install required packages
npm install lucide-react tailwindcss postcss autoprefixer
```

### 3. Configure Tailwind CSS

Create the configuration files:

```bash
npx tailwindcss init -p
```

Update the `tailwind.config.js` file:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Add Tailwind to your CSS:

```css
/* src/index.css or styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 4. File Organization

Create the following structure:

```
src/
├── components/
│   ├── DanieleHomepage.js   # Main animated homepage
│   ├── ApplicationForm.js    # Application form component
│   └── BookingPage.js        # Booking system component
├── pages/                    # If using Next.js
│   ├── index.js              # Main page wrapper
│   ├── apply.js              # Application page wrapper
│   └── book.js               # Booking page wrapper
└── App.js                    # Main app component if using CRA
```

### 5. Implement Routing

Using React Router (for Create React App):

```bash
npm install react-router-dom
```

In your `App.js`:

```javascript
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DanieleHomepage from './components/DanieleHomepage';
import ApplicationForm from './components/ApplicationForm';
import BookingPage from './components/BookingPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DanieleHomepage />} />
        <Route path="/apply" element={<ApplicationForm />} />
        <Route path="/book" element={<BookingPage />} />
      </Routes>
    </Router>
  );
}

export default App;
```

### 6. Link the Components

Update the button links in the homepage component:

```javascript
// In DanieleHomepage.js
<div className="mt-12 flex flex-wrap justify-center gap-4">
  <a 
    href="/apply" 
    className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-500 transition-colors flex items-center"
  >
    Start Your Transformation <ArrowRight className="ml-2 h-5 w-5" />
  </a>
  <a 
    href="/book" 
    className="px-6 py-3 bg-transparent border border-orange-600 text-orange-500 rounded-lg hover:bg-orange-800/20 transition-colors"
  >
    Book Free Strategy Call
  </a>
</div>
```

### 7. Deployment Options

#### Deploy to GitHub Pages

1. Install gh-pages:
```bash
npm install --save-dev gh-pages
```

2. Add to package.json:
```json
"homepage": "https://yourusername.github.io/daniele-pauli-coaching",
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d build",
  ...
}
```

3. Deploy:
```bash
npm run deploy
```

#### Other Deployment Options:

- Vercel: Great for Next.js projects
- Netlify: Simple deployment from GitHub
- Firebase Hosting: Good for React apps

## Form Data Handling

For the application and booking forms, you'll need to implement backend functionality to process submissions. Options include:

1. **Email Service**:
   - Use services like EmailJS, Formspree, or SendGrid to forward form submissions to your email

2. **Firebase**:
   - Set up Firebase Firestore to store application and booking data
   - Implement authentication if needed
   
3. **Custom API**:
   - Build a simple backend with Node.js/Express
   - Connect to a database like MongoDB

## Calendar Booking Integration

For the booking system, consider these integration options:

1. **Calendly Embed**:
   - Create a Calendly account
   - Replace the booking form with Calendly embed code

2. **Google Calendar API**:
   - Use Google Calendar API to show available slots
   - Create events when bookings are made

3. **Third-party services**:
   - Cal.com (open source)
   - Acuity Scheduling
   - SimplyBook.me

## Customization

- **Colors**: Update the orange accent color in the Tailwind classes to match your brand
- **Content**: Replace placeholder text with your actual coaching information
- **Images**: Add real testimonial images and your coach profile picture
- **Animations**: Adjust timing and effects to suit your preference

## Next Steps

1. Add real content and testimonials
2. Implement form submission functionality
3. Set up calendar integration for bookings
4. Test thoroughly on different devices
5. Deploy to your preferred hosting platform

---

For questions or support, please open an issue in this repository or contact danielepauli(at)gmail.com
