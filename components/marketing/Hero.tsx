"use client";

import Link from "next/link";
import { ArrowRight, Map } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-b from-orange-50 to-white pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Copy */}
          <div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Discover French Cheese,{" "}
              <span className="text-orange-600">Where It's Made</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Explore fromageries, farms, and cheese experiences across France — with
              delivery throughout France.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/map"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition"
              >
                <Map className="w-5 h-5" />
                Explore the Cheese Map
              </Link>
              <Link
                href="/tours"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white text-gray-900 rounded-lg font-semibold border-2 border-gray-300 hover:border-gray-400 transition"
              >
                Book a Cheese Tour
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 flex items-center gap-8">
              <div>
                <p className="text-3xl font-bold text-gray-900">500+</p>
                <p className="text-sm text-gray-600">Cheese Shops</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">150+</p>
                <p className="text-sm text-gray-600">Farms & Producers</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">1,200+</p>
                <p className="text-sm text-gray-600">Cheese Varieties</p>
              </div>
            </div>
          </div>

          {/* Right: Map Preview */}
          <div className="relative">
            <div className="aspect-square bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl shadow-2xl flex items-center justify-center">
              <div className="text-center">
                <Map className="w-24 h-24 mx-auto text-orange-600 mb-4" />
                <p className="text-gray-600 font-medium">Interactive Map Preview</p>
                <p className="text-sm text-gray-500 mt-2">
                  France • All Regions • Verified Businesses
                </p>
              </div>
            </div>

            {/* Floating Cards */}
            <div className="absolute -top-4 -left-4 bg-white rounded-lg shadow-lg p-4 max-w-xs">
              <p className="text-sm font-semibold text-gray-900">📍 Normandie</p>
              <p className="text-xs text-gray-600">Home of Camembert</p>
            </div>
            <div className="absolute -bottom-4 -right-4 bg-white rounded-lg shadow-lg p-4 max-w-xs">
              <p className="text-sm font-semibold text-gray-900">🧀 250+ AOC Cheeses</p>
              <p className="text-xs text-gray-600">Protected designation of origin</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
