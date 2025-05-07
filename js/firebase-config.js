// Firebase configuration for Daniele Pauli Coaching website
// Connects the website to Firebase services for form submissions and notifications

// Initialize Firebase with your project configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get a reference to Firestore
const db = firebase.firestore();

/**
 * Submit an application form to Firebase
 * @param {Object} formData - The application form data
 * @returns {Promise} - Promise that resolves with the document reference
 */
function submitApplication(formData) {
  return db.collection('applications').add({
    ...formData,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  })
  .then((docRef) => {
    console.log("Application submitted with ID: ", docRef.id);
    return docRef;
  })
  .catch((error) => {
    console.error("Error submitting application: ", error);
    throw error;
  });
}

/**
 * Create a booking in Firebase
 * @param {Object} bookingData - The booking data
 * @returns {Promise} - Promise that resolves with the document reference
 */
function createBooking(bookingData) {
  return db.collection('bookings').add({
    ...bookingData,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  })
  .then((docRef) => {
    console.log("Booking created with ID: ", docRef.id);
    return docRef;
  })
  .catch((error) => {
    console.error("Error creating booking: ", error);
    throw error;
  });
}

/**
 * Submit a contact form to Firebase
 * @param {Object} contactData - The contact form data
 * @returns {Promise} - Promise that resolves with the document reference
 */
function submitContactForm(contactData) {
  return db.collection('contactForms').add({
    ...contactData,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  })
  .then((docRef) => {
    console.log("Contact form submitted with ID: ", docRef.id);
    return docRef;
  })
  .catch((error) => {
    console.error("Error submitting contact form: ", error);
    throw error;
  });
}

// Export functions for use in other scripts
window.submitApplication = submitApplication;
window.createBooking = createBooking;
window.submitContactForm = submitContactForm;
