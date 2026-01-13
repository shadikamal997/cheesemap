import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CTA() {
  return (
    <section className="py-20 bg-gradient-to-br from-orange-600 to-orange-700">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Ready to Start Your Cheese Journey?
        </h2>
        <p className="text-xl text-orange-100 mb-8">
          Create your free account and discover the finest French cheeses
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/signup/role"
            className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white text-orange-600 rounded-lg font-semibold hover:bg-gray-50 transition"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/map"
            className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-transparent text-white rounded-lg font-semibold border-2 border-white hover:bg-white/10 transition"
          >
            Explore the Map
          </Link>
        </div>
      </div>
    </section>
  );
}
