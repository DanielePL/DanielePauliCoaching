import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Apply = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto pt-8">
        <Link to="/" className="inline-flex items-center text-orange-500 hover:text-orange-400 mb-8">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </Link>
        
        <div className="bg-gray-800/40 rounded-xl p-8 border border-gray-700">
          <h1 className="text-4xl font-bold mb-6">
            <span className="text-orange-500">Apply</span> for Coaching
          </h1>
          
          <p className="text-xl text-gray-300 mb-8">
            Complete the application below to start your strength transformation journey.
          </p>
          
          <form className="space-y-6">
            <div className="space-y-3">
              <label className="block text-gray-300 font-medium">Full Name</label>
              <input 
                type="text"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
                placeholder="Your full name"
              />
            </div>
            
            <div className="space-y-3">
              <label className="block text-gray-300 font-medium">Email</label>
              <input 
                type="email"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
                placeholder="Your email address"
              />
            </div>
            
            <div className="space-y-3">
              <label className="block text-gray-300 font-medium">Phone</label>
              <input 
                type="tel"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
                placeholder="Your phone number"
              />
            </div>
            
            <div className="space-y-3">
              <label className="block text-gray-300 font-medium">Current Fitness Level</label>
              <select className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500">
                <option>Beginner - New to consistent training</option>
                <option>Intermediate - Training for 1-3 years</option>
                <option>Advanced - Training for 3+ years</option>
                <option>Experienced - Have worked with coaches before</option>
              </select>
            </div>
            
            <div className="space-y-3">
              <label className="block text-gray-300 font-medium">Your Goals</label>
              <textarea 
                rows="4"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
                placeholder="Describe your primary fitness goals and what you hope to achieve through coaching"
              ></textarea>
            </div>
            
            <div className="space-y-3">
              <label className="block text-gray-300 font-medium">Biggest Challenges</label>
              <textarea 
                rows="4"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
                placeholder="What obstacles have prevented you from achieving your fitness goals so far?"
              ></textarea>
            </div>
            
            <button 
              type="submit" 
              className="w-full px-6 py-4 bg-orange-600 text-white text-lg font-medium rounded-lg hover:bg-orange-500 transition-colors"
            >
              Submit Application
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Apply;
