import React, { useEffect, useState } from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../styles/animations.css';

const DanieleHomepage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  
  useEffect(() => {
    // Trigger animations after component mount
    setIsVisible(true);
    
    // Add scroll listener for section detection
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const sectionIndex = Math.floor(scrollPosition / windowHeight);
      setActiveSection(sectionIndex);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative bg-black text-white">
      <section className="relative w-full h-screen overflow-hidden">
        {/* Background gradients */}
        <div className="absolute top-0 left-0 w-full h-full z-0">
          <div className="absolute top-0 left-0 w-full h-full opacity-40 bg-gradient-radial from-orange-500/20 via-transparent to-transparent animate-pulse"></div>
          <div className="absolute top-0 left-0 w-full h-full opacity-30 bg-gradient-radial from-orange-600/15 via-transparent to-transparent animate-pulse-slow"></div>
        </div>
        
        {/* Company name in top right corner */}
        <div className="absolute top-6 right-6 z-20">
          <h3 className="text-xl md:text-2xl font-bold text-white">
            Daniele Pauli <span className="text-orange-500">Coaching</span>
          </h3>
        </div>
        
        {/* Single quote in bottom left corner */}
        <div className="absolute bottom-6 left-6 z-20 max-w-sm">
          <p className="text-white/80 text-lg italic shadow-glow">
            "Strength is never a weakness."
          </p>
        </div>

        {/* Fire particles */}
        <div className="absolute w-full h-full overflow-hidden opacity-40 z-20">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i}
              className="absolute rounded-full bg-orange-300 animate-rise"
              style={{
                width: `${4 + Math.random() * 4}px`,
                height: `${4 + Math.random() * 4}px`,
                left: `${Math.random() * 100}%`,
                bottom: '0',
                animationDelay: `${Math.random() * 10}s`
              }}
            ></div>
          ))}
        </div>

        {/* Pulsing rings */}
        <div className="absolute w-full h-full flex items-center justify-center z-5">
          <div className="absolute w-36 h-36 border border-orange-500/80 rounded-full opacity-0 animate-pulse-ring"></div>
          <div className="absolute w-36 h-36 border border-orange-500/80 rounded-full opacity-0 animate-pulse-ring-delay-1"></div>
          <div className="absolute w-36 h-36 border border-orange-500/80 rounded-full opacity-0 animate-pulse-ring-delay-2"></div>
        </div>

        {/* Content */}
        <div className={`flex flex-col justify-center items-center h-full w-full text-center z-30 relative transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="relative p-4 w-11/12 mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-400 tracking-wider animate-title-glow">
              RECLAIM YOUR STRENGTH
            </h1>
            <p className="text-2xl mt-5 text-white">
              Body, Mind, and Clarity
            </p>
            <p className="text-base mt-8 italic text-gray-300 max-w-3xl mx-auto">
              High-performance coaching for successful people 40+, ready to upgrade their health, muscle, and mindset
            </p>
            
            <div className="mt-12 flex flex-wrap justify-center gap-4">
              <Link to="/apply" className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-500 transition-colors flex items-center">
                Start Your Transformation <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link to="/book" className="px-6 py-3 bg-transparent border border-orange-600 text-orange-500 rounded-lg hover:bg-orange-800/20 transition-colors">
                Book Free Strategy Call
              </Link>
            </div>
          </div>
          
          {/* Scroll down indicator */}
          <div className="absolute bottom-8 left-0 right-0 flex justify-center animate-bounce">
            <ChevronDown className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </section>

      {/* Section 1 - Who This Is For */}
      <section className="min-h-screen bg-gradient-to-b from-black to-gray-900 flex flex-col justify-center items-center p-6 md:p-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative inline-block mb-8">
            <h2 className="text-4xl md:text-5xl font-bold text-white relative z-10">
              You've mastered business – <br className="hidden md:block" />
              <span className="text-orange-500">but not your body.</span>
            </h2>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-orange-500/10 rounded-full blur-xl"></div>
          </div>
          
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            You're a high achiever. Entrepreneur. Executive. Creative mind. 
            You make big decisions – but lately, your body feels like a burden.
          </p>
          
          <div className="bg-gray-800/50 p-8 rounded-xl border border-gray-700 shadow-lg mb-12">
            <p className="text-2xl text-white italic mb-4">You're not here for motivation.</p>
            <p className="text-2xl text-orange-400 font-bold">You're here for a system that works.</p>
          </div>
          
          <div className="relative">
            <div className="absolute -top-10 -left-10 w-20 h-20 bg-orange-500/20 rounded-full blur-lg"></div>
            <div className="absolute -bottom-10 -right-10 w-20 h-20 bg-orange-500/20 rounded-full blur-lg"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  label: "High-achievers",
                  desc: "Successful in career, seeking the same excellence in physical performance"
                },
                {
                  label: "Age 40+",
                  desc: "Facing unique physical challenges that require strategic, science-based solutions"
                },
                {
                  label: "Results-focused",
                  desc: "No patience for trial and error – need proven systems that deliver"
                }
              ].map((item, i) => (
                <div key={i} className="bg-gray-800/30 border border-gray-700 p-6 rounded-lg hover:border-orange-500/50 transition-colors">
                  <h3 className="text-xl font-bold text-orange-400 mb-3">{item.label}</h3>
                  <p className="text-gray-300">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 2 - What You Get */}
      <section className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex flex-col justify-center items-center p-6 md:p-12">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-white mb-16">
            Your personalized <span className="text-orange-500">performance protocol.</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                phase: "Assessment",
                icon: "📊",
                description: "Movement screening, Bar Path analysis, performance review",
                details: "We analyze your current movement patterns, strength levels, and limitations"
              },
              {
                phase: "Planning",
                icon: "📝",
                description: "Weekly updated online training plan – tailored to your schedule and recovery",
                details: "Perfectly structured training that adapts based on your progress and feedback"
              },
              {
                phase: "Coaching",
                icon: "👤",
                description: "Video feedback, progress review, and one-on-one sessions to keep you on track",
                details: "Regular adjustments and expert guidance to optimize results and prevent plateaus"
              }
            ].map((item, i) => (
              <div key={i} className="bg-gray-800/40 rounded-xl overflow-hidden transform transition-all hover:scale-105">
                <div className="bg-gradient-to-r from-orange-600 to-orange-500 p-4 flex items-center justify-between">
                  <span className="text-2xl font-bold text-white">{item.phase}</span>
                  <span className="text-3xl">{item.icon}</span>
                </div>
                <div className="p-6">
                  <p className="text-white mb-4">{item.description}</p>
                  <p className="text-gray-400 text-sm">{item.details}</p>
                </div>
                <div className="bg-gray-800/60 px-6 py-3">
                  <div className="h-1 bg-orange-500/30 rounded-full">
                    <div className="h-1 bg-orange-500 rounded-full" style={{width: `${(i+1)*33}%`}}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3 - Tools & Methods */}
      <section className="min-h-screen bg-gradient-to-b from-black to-gray-900 flex flex-col justify-center items-center p-6 md:p-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              <span className="text-orange-500">Smarter tools.</span> Real results.
            </h2>
            <p className="text-xl text-gray-300 mt-4">
              This isn't guesswork. I track your training data, movement quality, and progress – every week.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                icon: "📱",
                title: "Online Coaching Platform",
                description: "Secure, easy-to-use platform for your customized training plans and feedback"
              },
              {
                icon: "🎥",
                title: "Bar Path Analysis",
                description: "Advanced movement tracking to perfect your lifting technique and prevent injury"
              },
              {
                icon: "🧠",
                title: "Mindset & Habit Tracking",
                description: "Psychological tools to overcome mental barriers and build lasting habits"
              },
              {
                icon: "🔁",
                title: "Weekly Protocol Updates",
                description: "Continuous refinement based on your actual performance and recovery metrics"
              }
            ].map((item, i) => (
              <div key={i} className="bg-gray-800/40 border border-gray-700 rounded-xl p-6 hover:border-orange-500/50 transition-all">
                <div className="flex items-start mb-4">
                  <span className="text-3xl mr-4">{item.icon}</span>
                  <div>
                    <h3 className="text-xl font-bold text-white">{item.title}</h3>
                    <p className="text-gray-300 mt-2">{item.description}</p>
                  </div>
                </div>
                <div className="ml-12 mt-4 pl-2 border-l-2 border-orange-500">
                  <p className="text-gray-400 text-sm italic">Unlike conventional approaches that rely on generic templates, our technology-enhanced methodology adapts to your unique response patterns.</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4 - Real Results */}
      <section className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex flex-col justify-center items-center p-6 md:p-12">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-white mb-4">
            <span className="text-orange-500">"I feel like myself again."</span>
          </h2>
          <p className="text-xl text-center text-gray-300 mb-16 max-w-3xl mx-auto">
            Real results from real clients who decided to prioritize their physical performance
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                quote: "I scaled my company, but my body was in decline. Daniele helped me rebuild strength, focus, and energy.",
                name: "Tobias, 52",
                role: "CFO",
                results: ["Increased deadlift by 60kg", "Eliminated chronic back pain", "Improved energy throughout workday"]
              },
              {
                quote: "I used to just 'work out.' Now I train with purpose – stronger, leaner, no more pain.",
                name: "Sabine, 46",
                role: "Entrepreneur",
                results: ["Lost 8% body fat", "Doubled strength in key lifts", "Resolved shoulder impingement"]
              }
            ].map((testimonial, i) => (
              <div key={i} className="bg-gray-800/20 rounded-xl overflow-hidden">
                <div className="p-8 relative">
                  <div className="absolute top-4 left-4 text-6xl text-orange-500/20">"</div>
                  <p className="text-white text-xl italic relative z-10">{testimonial.quote}</p>
                  <div className="mt-6 flex justify-between items-end">
                    <div>
                      <p className="text-orange-400 font-bold">{testimonial.name}</p>
                      <p className="text-gray-400">{testimonial.role}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map(star => (
                          <div key={star} className="text-orange-500">★</div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-800/40 p-4">
                  <p className="text-gray-300 text-sm font-bold mb-2">Measurable results:</p>
                  <ul className="space-y-1">
                    {testimonial.results.map((result, idx) => (
                      <li key={idx} className="flex items-center text-sm">
                        <span className="text-orange-500 mr-2">•</span>
                        <span className="text-gray-300">{result}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5 - Ready to Start? */}
      <section className="min-h-screen bg-gradient-to-b from-black to-gray-900 flex flex-col justify-center items-center p-6 md:p-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            You don't need <span className="text-orange-500">another program.</span><br />
            You need <span className="text-orange-500">the right one.</span>
          </h2>
          
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
            I only work with a select number of private clients. If you're serious about taking your physical 
            performance to the same level as your career, we should talk.
          </p>
          
          <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 p-8 md:p-12 rounded-xl border border-gray-700 shadow-lg mb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              {[
                {
                  metric: "20+",
                  label: "Years Elite Coaching Experience"
                },
                {
                  metric: "14,000+",
                  label: "Training Sessions Conducted"
                },
                {
                  metric: "1",
                  label: "Personalized System For You"
                }
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <p className="text-3xl md:text-4xl font-bold text-orange-500 mb-2">{stat.metric}</p>
                  <p className="text-gray-300">{stat.label}</p>
                </div>
              ))}
            </div>
            
            <div className="flex flex-col md:flex-row justify-center gap-4 mt-8">
              <Link to="/apply" className="px-8 py-4 bg-orange-600 text-white text-lg rounded-lg hover:bg-orange-500 transition-colors flex items-center justify-center">
                Apply Now <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link to="/book" className="px-8 py-4 bg-transparent border border-orange-600 text-orange-500 text-lg rounded-lg hover:bg-orange-800/20 transition-colors flex items-center justify-center">
                Book a Free Call
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6 - About Daniele */}
      <section className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex flex-col justify-center items-center p-6 md:p-12">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                <span className="text-orange-500">20 years</span> of elite coaching.<br />
                <span className="text-orange-500">14,000+</span> sessions.<br />
                <span className="text-orange-500">1</span> mission: your transformation.
              </h2>
              
              <ul className="space-y-4 mt-8">
                {[
                  "Masters world champion in powerlifting, Vice World champ in Olympic weightlifting",
                  "Trusted coach for high performers, from CEOs to Ironman athletes",
                  "Expert in strength, strategy, and sustainable progress",
                  "Straight talk, no fluff – just results"
                ].map((point, i) => (
                  <li key={i} className="flex items-start">
                    <div className="text-orange-500 mr-3 mt-1">•</div>
                    <p className="text-gray-300">{point}</p>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-full h-full bg-orange-500/10 rounded-xl transform rotate-3"></div>
              <div className="relative bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
                <div className="h-64 bg-gray-700 flex items-center justify-center">
                  <p className="text-gray-500">[Coach Image]</p>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-white mb-2">Daniele Pauli</h3>
                  <p className="text-orange-400 mb-4">Master Strength Coach</p>
                  <p className="text-gray-300 text-sm">
                    "My approach combines decades of elite coaching experience with a deep understanding of 
                    how busy professionals can achieve optimal physical performance while balancing demanding careers."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-black">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 p-8 rounded-xl border border-gray-700">
            <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-2">
              Strength is a strategy. <span className="text-orange-500">Stay ahead.</span>
            </h2>
            <p className="text-center text-gray-300 mb-6">
              Monthly insights on training, longevity, and performance optimization – for smart people who don't do average.
            </p>
            
            <div className="flex flex-col md:flex-row gap-2">
              <input 
                type="email" 
                placeholder="Your email" 
                className="flex-1 px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
              />
              <button className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-500 transition-colors whitespace-nowrap">
                Subscribe Now
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DanieleHomepage;
