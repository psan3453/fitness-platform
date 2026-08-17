import Link from "next/link";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col min-h-screen">
        {/* Hero Section */}
        <section className="relative bg-white py-20 sm:py-32 overflow-hidden flex-1 flex flex-col justify-center border-b border-gray-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-6">
              Train. Move. <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Transform.</span>
            </h1>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto mb-10">
              Access live expert-led Yoga, Zumba, and HIIT classes from anywhere. Combine your workouts with Indian-focused diet plans to reach your goals faster.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link href="/classes" className="w-full sm:w-auto rounded-full bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow-lg hover:bg-blue-700 transition-all hover:scale-105">
                Explore Classes
              </Link>
              <Link href="/register" className="w-full sm:w-auto rounded-full bg-white px-8 py-4 text-base font-semibold text-gray-900 shadow-md ring-1 ring-gray-200 hover:bg-gray-50 transition-all hover:scale-105">
                Get Started
              </Link>
            </div>
          </div>

          {/* Decorative background elements */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-5xl overflow-hidden -z-10 opacity-30 pointer-events-none">
            <div className="absolute top-[20%] left-[10%] w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
            <div className="absolute top-[20%] right-[10%] w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
            <div className="absolute bottom-[20%] left-[30%] w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-24 bg-gray-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Find Your Perfect Workout</h2>
              <p className="mt-4 text-lg text-gray-600">Choose from our live interactive classes tailored to your fitness level and goals.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Yoga Card */}
              <div className="group rounded-2xl bg-white overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full">
                <div className="h-48 bg-teal-50 flex items-center justify-center relative overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-br from-teal-100 to-teal-200 opacity-50"></div>
                   <span className="text-6xl relative z-10">🧘‍♀️</span>
                </div>
                <div className="p-8 flex flex-col flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Yoga</h3>
                  <p className="text-gray-600 mb-6 flex-1">Build strength, flexibility, and mindfulness with our expert-led live yoga sessions. Perfect for all levels.</p>
                  <Link href="/classes?category=YOGA" className="inline-flex items-center text-teal-600 font-semibold hover:text-teal-700">
                    View Yoga Classes <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                </div>
              </div>

              {/* Zumba Card */}
              <div className="group rounded-2xl bg-white overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full">
                <div className="h-48 bg-rose-50 flex items-center justify-center relative overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-br from-rose-100 to-rose-200 opacity-50"></div>
                   <span className="text-6xl relative z-10">💃</span>
                </div>
                <div className="p-8 flex flex-col flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Zumba</h3>
                  <p className="text-gray-600 mb-6 flex-1">Dance your way to fitness with high-energy, fun-filled Zumba routines that burn calories and boost your mood.</p>
                  <Link href="/classes?category=ZUMBA" className="inline-flex items-center text-rose-600 font-semibold hover:text-rose-700">
                    View Zumba Classes <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                </div>
              </div>

              {/* HIIT Card */}
              <div className="group rounded-2xl bg-white overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full">
                <div className="h-48 bg-orange-50 flex items-center justify-center relative overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-br from-orange-100 to-orange-200 opacity-50"></div>
                   <span className="text-6xl relative z-10">⚡</span>
                </div>
                <div className="p-8 flex flex-col flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">HIIT</h3>
                  <p className="text-gray-600 mb-6 flex-1">Push your limits with High-Intensity Interval Training designed for maximum fat burn and cardiovascular endurance.</p>
                  <Link href="/classes?category=HIIT" className="inline-flex items-center text-orange-600 font-semibold hover:text-orange-700">
                    View HIIT Classes <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-24 bg-white border-t border-gray-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Why Choose Fitness Platform?</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-gray-50 p-6 rounded-xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-5 text-2xl">
                  🎥
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Live Classes</h3>
                <p className="text-gray-600 text-sm">Real-time interaction and form correction from expert trainers.</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-5 text-2xl">
                  🥇
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Expert Trainers</h3>
                <p className="text-gray-600 text-sm">Learn from experienced trainers who guide you every step of the way.</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-5 text-2xl">
                  🥗
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Indian-Focused Diets</h3>
                <p className="text-gray-600 text-sm">Personalized meal plans tailored to local cuisines and dietary preferences.</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-5 text-2xl">
                  📅
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Flexible Plans</h3>
                <p className="text-gray-600 text-sm">Book classes that fit your schedule. No rigid timetables.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-blue-600 py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-6">Ready to Start Your Journey?</h2>
            <p className="text-blue-100 text-lg mb-10">Start transforming your life with expert-led live classes and structured diet plans.</p>
            <Link href="/register" className="inline-block rounded-full bg-white px-10 py-4 text-lg font-bold text-blue-600 shadow-lg hover:bg-gray-50 transition-all hover:scale-105">
              Get Started Today
            </Link>
          </div>
        </section>
      </main>
  );
}
