import { Globe, MessageCircle, Users, Clock, Sparkles, Languages, Award } from "lucide-react";

export default function GlobalFeatures() {
  const features = [
    {
      icon: Globe,
      stat: "40+",
      label: "Countries",
      description: "Volunteers across Africa, Europe, Americas, Asia, and Oceania",
      gradient: "from-cyan-500 to-teal-500",
      bgGradient: "from-cyan-50 to-teal-50"
    },
    {
      icon: Languages,
      stat: "25+",
      label: "Languages",
      description: "Native speakers providing support in your language",
      gradient: "from-teal-500 to-emerald-500",
      bgGradient: "from-teal-50 to-emerald-50"
    },
    {
      icon: Users,
      stat: "100+",
      label: "Specialists",
      description: "Life coaches, therapists, and experienced listeners",
      gradient: "from-emerald-500 to-green-500",
      bgGradient: "from-emerald-50 to-green-50"
    },
    {
      icon: Clock,
      stat: "24/7",
      label: "Availability",
      description: "Round-the-clock support across all time zones",
      gradient: "from-sky-500 to-cyan-500",
      bgGradient: "from-sky-50 to-cyan-50"
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-0 w-72 h-72 bg-gradient-to-br from-cyan-200 to-teal-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute top-1/2 right-0 w-72 h-72 bg-gradient-to-br from-teal-200 to-emerald-200 rounded-full opacity-20 blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-white/95 backdrop-blur-xl px-6 py-3 rounded-full shadow-lg border border-teal-100/60 mb-6">
            <Sparkles className="w-5 h-5 text-teal-500" />
            <span className="text-sm font-semibold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
              Truly Global Platform
            </span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent">
              Global Access
            </span>
            <br />
            <span className="text-gray-800">to Mental Health Support</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Connecting people across continents with culturally-aware, compassionate support
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="group">
              <div className={`bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-teal-100/60 hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300`}>
                <div className={`bg-gradient-to-br ${feature.bgGradient} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`w-8 h-8 bg-gradient-to-br ${feature.gradient} bg-clip-text text-transparent`} style={{WebkitTextFillColor: 'transparent', WebkitBackgroundClip: 'text'}} />
                </div>
                <div className={`text-4xl font-bold bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent mb-2`}>
                  {feature.stat}
                </div>
                <h3 className="font-bold text-gray-800 mb-3 text-lg">{feature.label}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
