import {
  Heart,
  Users,
  Globe,
  Shield,
  MessageCircle,
  Clock,
  CheckCircle,
  Headphones,
  Award,
  Sparkles,
  Phone,
  Video,
  Lock,
  UserCheck,
} from "lucide-react";

export const metadata = {
  title: "About Us - Listening Room | Global Peer Support Platform",
  description: "Learn about Listening Room, our mission to provide accessible mental health peer support worldwide, and the services we offer to connect people in need with compassionate volunteer listeners.",
};

export default function AboutPage() {
  const services = [
    {
      icon: Phone,
      title: "Voice Support Sessions",
      description: "Connect with trained volunteer listeners through secure voice calls for real-time emotional support and compassionate conversation.",
    },
    {
      icon: MessageCircle,
      title: "Text Chat Support",
      description: "Prefer typing? Our text-based chat sessions provide a comfortable space to express yourself and receive support at your own pace.",
    },
    {
      icon: Clock,
      title: "24/7 Availability",
      description: "Access support whenever you need it. Our global network of volunteers ensures someone is always available to listen, any time of day or night.",
    },
    {
      icon: Globe,
      title: "Global Reach",
      description: "Available in 40+ countries with volunteers speaking multiple languages, ensuring you can connect with someone who understands your cultural context.",
    },
    {
      icon: UserCheck,
      title: "Trained Volunteers",
      description: "All our volunteer listeners complete comprehensive training in active listening, empathy, crisis recognition, and maintaining safe boundaries.",
    },
    {
      icon: Lock,
      title: "Anonymous & Confidential",
      description: "Your privacy is paramount. All conversations are completely anonymous and confidential, allowing you to share freely without judgment.",
    },
  ];

  const values = [
    {
      icon: Heart,
      title: "Compassion First",
      description: "We believe in the power of human connection and lead with empathy in every interaction.",
    },
    {
      icon: Users,
      title: "Community-Driven",
      description: "Our platform is built on the strength of our volunteer community who generously give their time to support others.",
    },
    {
      icon: Shield,
      title: "Safety & Trust",
      description: "We maintain the highest standards of safety, privacy, and ethical practices to protect both seekers and volunteers.",
    },
    {
      icon: Globe,
      title: "Accessibility for All",
      description: "Mental health support should be accessible to everyone, regardless of location, income, or circumstances.",
    },
  ];

  const stats = [
    { number: "40+", label: "Countries Served" },
    { number: "500+", label: "Trained Volunteers" },
    { number: "10,000+", label: "Support Sessions" },
    { number: "24/7", label: "Always Available" },
  ];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-cyan-50 via-teal-50 to-sky-50 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-white/95 backdrop-blur-xl px-6 py-3 rounded-full shadow-lg border border-teal-100/60 mb-8">
            <Heart className="w-5 h-5 text-teal-600" />
            <span className="text-sm font-semibold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">Our Story</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent">
              About Listening Room
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            A global peer support platform connecting people who need to be heard 
            with compassionate volunteer listeners, making mental health support 
            accessible to everyone, everywhere.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-teal-100/60">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-2xl flex items-center justify-center mb-6">
                <Sparkles className="w-8 h-8 text-teal-600" />
              </div>
              <h2 className="text-3xl font-bold mb-4">
                <span className="bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">Our Mission</span>
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                To provide free, accessible peer support to anyone experiencing emotional distress, 
                loneliness, or mental health challenges by connecting them with trained volunteer 
                listeners who offer compassionate, non-judgmental support.
              </p>
            </div>

            <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-teal-100/60">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-2xl flex items-center justify-center mb-6">
                <Globe className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-3xl font-bold mb-4">
                <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">Our Vision</span>
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                A world where no one has to face their struggles alone, where emotional support 
                is readily available to all, and where the simple act of listening creates 
                meaningful change in people's lives.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-teal-50/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What We Do
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Listening Room is more than just a platform—it's a community dedicated to 
              providing immediate, compassionate support to those who need it most.
            </p>
          </div>

          <div className="prose prose-lg max-w-none text-gray-600">
            <p className="text-lg leading-relaxed mb-6">
              We connect individuals seeking emotional support with trained volunteer listeners 
              through secure, anonymous voice and text chat sessions. Our platform operates 24/7, 
              serving people across 40+ countries, ensuring that help is always available when it's needed.
            </p>
            
            <p className="text-lg leading-relaxed mb-6">
              Unlike professional therapy, we provide <strong>peer support</strong>—a human connection 
              based on empathy, active listening, and shared understanding. Our volunteers are not therapists 
              or counselors; they are compassionate individuals trained to listen without judgment, 
              validate feelings, and provide emotional support.
            </p>

            <div className="bg-teal-50 border-l-4 border-teal-500 p-6 my-8 rounded-r-lg">
              <p className="text-teal-900 font-semibold mb-2">
                Important: We are a peer support platform
              </p>
              <p className="text-teal-800">
                While our volunteers are trained in active listening and crisis recognition, 
                we do not provide professional mental health treatment, diagnosis, or therapy. 
                For serious mental health concerns, we encourage seeking professional help.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Services */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Services We Offer
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive peer support services designed to meet you where you are
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div key={index} className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-teal-100/60">
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-2xl flex items-center justify-center mb-4">
                  <service.icon className="w-7 h-7 text-teal-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                <p className="text-gray-600 leading-relaxed">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-teal-50/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Core Values
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="w-20 h-20 bg-white/95 backdrop-blur-xl rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg border border-teal-100/60">
                  <value.icon className="w-10 h-10 text-teal-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Getting support is simple and completely anonymous
            </p>
          </div>

          <div className="space-y-8">
            <div className="flex items-start space-x-6">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-cyan-500 to-teal-500 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg">
                1
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Create a Free Account</h3>
                <p className="text-gray-600">
                  Sign up in minutes with just an email. No personal information required—stay completely anonymous if you prefer.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-6">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg">
                2
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Browse Available Sessions</h3>
                <p className="text-gray-600">
                  View real-time available volunteer listeners in your country. Choose between voice or text chat based on your comfort level.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-6">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-500 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg">
                3
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Connect & Share</h3>
                <p className="text-gray-600">
                  Join a session and start talking. Share what's on your mind in a safe, confidential space with someone who truly listens.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-6">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg">
                4
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Get Support, Anytime</h3>
                <p className="text-gray-600">
                  Return whenever you need support. Our community is here for you 24/7, across the globe.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Impact</h2>
            <p className="text-xl text-teal-50">Making a difference, one conversation at a time</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-5xl font-bold mb-2">{stat.number}</div>
                <div className="text-teal-50 text-lg">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety & Privacy */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Shield className="w-16 h-16 text-teal-600 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Your Safety & Privacy Matter
            </h2>
          </div>

          <div className="space-y-6 text-gray-600">
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-teal-100/60">
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                Complete Anonymity
              </h3>
              <p>
                You're never required to share personal information. Use a username, 
                and your identity remains completely anonymous.
              </p>
            </div>

            <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-teal-100/60">
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                Confidential Conversations
              </h3>
              <p>
                All sessions are private and confidential. What you share stays between you 
                and your listener, unless there's an immediate safety concern.
              </p>
            </div>

            <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-teal-100/60">
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                Trained & Vetted Volunteers
              </h3>
              <p>
                Every volunteer completes comprehensive training and follows strict community 
                guidelines to ensure safe, supportive interactions.
              </p>
            </div>

            <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-teal-100/60">
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                Crisis Support Protocols
              </h3>
              <p>
                Our volunteers are trained in crisis recognition. If you're in immediate danger, 
                we'll connect you with professional emergency services.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-cyan-50 via-teal-50 to-sky-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of people who have found support through our community
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/account/signup"
              className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 inline-flex items-center justify-center"
            >
              <Users className="w-5 h-5 mr-2" />
              Get Support Now
            </a>
            <a
              href="/volunteer"
              className="bg-white/95 backdrop-blur-xl border-2 border-teal-500 text-teal-700 px-8 py-4 rounded-2xl font-bold hover:bg-teal-50 transition-all duration-300 shadow-lg inline-flex items-center justify-center"
            >
              <Heart className="w-5 h-5 mr-2" />
              Become a Volunteer
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
