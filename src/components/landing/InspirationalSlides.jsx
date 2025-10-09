"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

const slides = [
  {
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1400&h=600&fit=crop&auto=format",
    message: "Sometimes, all you need is someone to listen",
    subtitle: "Connect with trained volunteer listeners who understand and care",
  },
  {
    image: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=1400&h=600&fit=crop&auto=format",
    message: "You don't have to face it alone",
    subtitle: "A global community of compassionate volunteers ready to support you",
  },
  {
    image: "https://images.unsplash.com/photo-1516302752625-fcc3c50ae61f?w=1400&h=600&fit=crop&auto=format",
    message: "Your feelings are valid, your voice matters",
    subtitle: "Share your story in a safe, anonymous space with peer supporters",
  },
  {
    image: "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=1400&h=600&fit=crop&auto=format",
    message: "Peer support that crosses borders",
    subtitle: "Real people, real conversations, making a real difference worldwide",
  },
];

export default function InspirationalSlides() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-teal-50/30 to-cyan-50/30"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Carousel */}
          <div className="relative">
            <div className="relative h-96 rounded-3xl overflow-hidden shadow-2xl">
              {slides.map((slide, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-1000 ${
                    index === currentSlide ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${slide.image})`,
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/80 via-teal-600/80 to-emerald-600/70" />
                </div>
              ))}

              {/* Navigation Buttons */}
              <button
                onClick={() =>
                  setCurrentSlide((prev) =>
                    prev === 0 ? slides.length - 1 : prev - 1,
                  )
                }
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/95 backdrop-blur-xl hover:bg-white text-teal-600 p-3 rounded-2xl transition-all duration-300 shadow-xl hover:scale-110"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/95 backdrop-blur-xl hover:bg-white text-teal-600 p-3 rounded-2xl transition-all duration-300 shadow-xl hover:scale-110"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Dots */}
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentSlide ? "bg-white w-8" : "bg-white/50 hover:bg-white/75"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-8">
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-teal-100/60">
              <Quote className="w-12 h-12 text-teal-400 mb-6" />
              
              <h3 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 leading-tight">
                {slides[currentSlide].message}
              </h3>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                {slides[currentSlide].subtitle}
              </p>

              {/* Feature highlights */}
              <div className="space-y-3 pt-6 border-t border-teal-100">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-lg flex items-center justify-center">
                    <span className="text-teal-600 font-bold text-sm">✓</span>
                  </div>
                  <span className="text-gray-700">Volunteer peer supporters, not therapists</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-lg flex items-center justify-center">
                    <span className="text-emerald-600 font-bold text-sm">✓</span>
                  </div>
                  <span className="text-gray-700">Trained in active listening and empathy</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-100 to-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 font-bold text-sm">✓</span>
                  </div>
                  <span className="text-gray-700">Anonymous, safe space to be heard</span>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center">
              <a
                href="/account/signup"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
              >
                <span>Start Your Journey Today</span>
                <ChevronRight className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
