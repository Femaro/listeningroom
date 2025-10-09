import { Shield, Users, MessageCircle, Heart, Lock, CheckCircle } from "lucide-react";

export default function WhyChooseUs() {
  const reasons = [
    {
      icon: Shield,
      title: "100% Anonymous & Private",
      description: "No real names required. Your conversations are completely private, never stored or recorded.",
      gradient: "from-cyan-500 to-teal-500",
      image: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=400&h=300&fit=crop"
    },
    {
      icon: Users,
      title: "Trained Mental Health Volunteers",
      description: "Our volunteers are trained in active listening, crisis recognition, and compassionate support.",
      gradient: "from-teal-500 to-emerald-500",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=300&fit=crop"
    },
    {
      icon: MessageCircle,
      title: "24/7 Crisis Support Available",
      description: "Someone is always here for depression, anxiety, or when you just need someone to listen.",
      gradient: "from-emerald-500 to-green-500",
      image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&h=300&fit=crop"
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            <span className="text-gray-800">Why Choose</span>
            <br />
            <span className="bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent">
              Listening Room?
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Professional mental health support that's accessible, anonymous, and always available
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {reasons.map((reason, index) => (
            <div key={index} className="group">
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-teal-100/60 overflow-hidden hover:shadow-3xl transform hover:-translate-y-2 transition-all duration-300">
                {/* Image Header */}
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={reason.image} 
                    alt={reason.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-br ${reason.gradient} opacity-60`}></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl">
                      <reason.icon className="w-10 h-10 text-teal-600" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-3">
                    {reason.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {reason.description}
                  </p>
                  <div className="mt-4 flex items-center space-x-2 text-teal-600 text-sm font-semibold">
                    <CheckCircle className="w-4 h-4" />
                    <span>Verified & Trusted</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
