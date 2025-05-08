import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DanieleHomepage from './components/DanieleHomepage';
import Apply from './pages/Apply';
import Book from './pages/Book';
import './index.css';

function App() {
  // Get the base URL from the package.json homepage
  const baseUrl = process.env.PUBLIC_URL || '';
  
  return (
    <BrowserRouter basename={baseUrl}>
      <Routes>
        <Route path="/" element={<DanieleHomepage />} />
        <Route path="/apply" element={<Apply />} />
        <Route path="/book" element={<Book />} />
        {/* Redirect any unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
