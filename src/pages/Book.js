import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';

const Book = () => {
  // Sample available time slots
  const availableTimeSlots = [
    { date: 'Monday, May 10', times: ['9:00 AM', '11:30 AM', '2:00 PM'] },
    { date: 'Tuesday, May 11', times: ['10:00 AM', '1:30 PM', '4:00 PM'] },
    { date: 'Wednesday, May 12', times: ['9:30 AM', '12:00 PM', '3:30 PM'] },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto pt-8">
        <Link to="/" className="inline-flex items-center text-orange-500 hover:text-orange-400 mb-8">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </Link>
        
        <div className="bg-gray-800/40 rounded-xl p-8 border border-gray-700">
          <h1 className="text-4xl font-bold mb-6">
            Book Your <span className="text-orange-500">Strategy Call</span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-8">
            Schedule a free 30-minute strategy call to discuss your goals and see if we're a good fit.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <Calendar className="mr-2 text-orange-500" />
                Select a Date & Time
              </h2>
              
              <div className="space-y-6">
                {availableTimeSlots.map((slot, index) => (
                  <div key={index} className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                    <h3 className="font-medium text-lg mb-3">{slot.date}</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {slot.times.map((time, idx) => (
                        <button 
                          key={idx} 
                          className="px-3 py-2 border border-orange-500/50 rounded-lg hover:bg-orange-500/20 transition-colors flex items-center justify-center"
                        >
                          <Clock className="w-4 h-4 mr-2 text-orange-500" />
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold mb-4">Your Information</h2>
              
              <form className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-gray-300 font-medium">Full Name</label>
                  <input 
                    type="text"
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
                    placeholder="Your full name"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-gray-300 font-medium">Email</label>
                  <input 
                    type="email"
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
                    placeholder="Your email address"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-gray-300 font-medium">Phone</label>
                  <input 
                    type="tel"
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
                    placeholder="Your phone number"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-gray-300 font-medium">What do you want to discuss?</label>
                  <textarea 
                    rows="4"
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
                    placeholder="Briefly describe what you'd like to talk about during our call"
                  ></textarea>
                </div>
                
                <button 
                  type="submit" 
                  className="w-full px-6 py-4 bg-orange-600 text-white text-lg font-medium rounded-lg hover:bg-orange-500 transition-colors mt-4"
                >
                  Confirm Booking
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Book;
