import { Globe, MessageCircle, Users, Star, TrendingUp, Heart, Award, Sparkles } from "lucide-react";

export default function ImpactStats() {
  const stats = [
    {
      icon: Globe,
      number: "40+",
      label: "Countries Served",
      gradient: "from-cyan-500 to-teal-500",
      bgGradient: "from-cyan-50 to-teal-50"
    },
    {
      icon: MessageCircle,
      number: "10K+",
      label: "Support Conversations",
      gradient: "from-teal-500 to-emerald-500",
      bgGradient: "from-teal-50 to-emerald-50"
    },
    {
      icon: Users,
      number: "500+",
      label: "Volunteer Listeners",
      gradient: "from-emerald-500 to-green-500",
      bgGradient: "from-emerald-50 to-green-50"
    },
    {
      icon: Star,
      number: "4.9",
      label: "Community Rating",
      gradient: "from-amber-500 to-orange-500",
      bgGradient: "from-amber-50 to-orange-50"
    }
  ];

  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-teal-500 to-sky-500 opacity-5"></div>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-br from-cyan-300 to-teal-300 rounded-full opacity-10 blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-white/95 backdrop-blur-xl px-6 py-3 rounded-full shadow-lg border border-teal-100/60 mb-6">
            <TrendingUp className="w-5 h-5 text-teal-500" />
            <span className="text-sm font-semibold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
              Our Global Impact
            </span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="text-gray-800">Making a</span>{" "}
            <span className="bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent">
              Global Impact
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Together, we're creating a world where everyone has access to compassionate support
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="group">
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-teal-100/60 hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 text-center">
                <div className={`bg-gradient-to-br ${stat.bgGradient} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <stat.icon className="w-8 h-8 text-teal-600" />
                </div>
                <div className={`text-5xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-3`}>
                  {stat.number}
                </div>
                <div className="text-gray-700 font-semibold">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to action */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-6">Join our growing community of supporters making a difference</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/volunteer"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
            >
              <Heart className="w-5 h-5" />
              <span>Become a Volunteer</span>
            </a>
            <a
              href="/donate"
              className="inline-flex items-center space-x-2 bg-white/95 backdrop-blur-xl border-2 border-teal-200 text-teal-700 px-8 py-4 rounded-2xl font-bold hover:border-teal-300 hover:bg-teal-50 transition-all duration-300 shadow-lg"
            >
              <Sparkles className="w-5 h-5" />
              <span>Support Our Mission</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
