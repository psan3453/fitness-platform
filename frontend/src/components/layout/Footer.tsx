import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="text-2xl font-bold tracking-tight text-white mb-4 block">
              Fitness<span className="text-blue-500">Platform</span>
            </Link>
            <p className="mt-2 text-sm text-gray-400 max-w-md">
              Train, move, and transform with expert-led live classes, personalized diet plans, and a community dedicated to your fitness journey.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Navigation</h3>
            <ul className="space-y-3">
              <li><Link href="/" className="text-sm hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/classes" className="text-sm hover:text-white transition-colors">Live Classes</Link></li>
              <li><Link href="/diet-plans" className="text-sm hover:text-white transition-colors">Diet Plans</Link></li>
              <li><Link href="/trainers" className="text-sm hover:text-white transition-colors">Become a Trainer</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Categories</h3>
            <ul className="space-y-3">
              <li><Link href="/classes?category=YOGA" className="text-sm hover:text-white transition-colors">Yoga</Link></li>
              <li><Link href="/classes?category=ZUMBA" className="text-sm hover:text-white transition-colors">Zumba</Link></li>
              <li><Link href="/classes?category=HIIT" className="text-sm hover:text-white transition-colors">HIIT</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Fitness Platform. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
