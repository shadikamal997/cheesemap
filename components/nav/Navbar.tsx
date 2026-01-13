"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-orange-600">🧀 CheeseMap</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/map" className="text-gray-700 hover:text-orange-600 transition">
              Discover
            </Link>
            <Link href="/tours" className="text-gray-700 hover:text-orange-600 transition">
              Tours
            </Link>
            <Link href="/stories" className="text-gray-700 hover:text-orange-600 transition">
              Stories
            </Link>
            <Link href="/order" className="text-gray-700 hover:text-orange-600 transition">
              Order Cheese
            </Link>
            <Link href="/businesses" className="text-gray-700 hover:text-orange-600 transition">
              For Businesses
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/login"
              className="text-gray-700 hover:text-orange-600 transition"
            >
              Sign in
            </Link>
            <Link
              href="/signup/role"
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
            >
              Sign up
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-white">
          <div className="px-4 py-4 space-y-4">
            <Link
              href="/map"
              className="block text-gray-700 hover:text-orange-600 transition"
            >
              Discover
            </Link>
            <Link
              href="/tours"
              className="block text-gray-700 hover:text-orange-600 transition"
            >
              Tours
            </Link>
            <Link
              href="/stories"
              className="block text-gray-700 hover:text-orange-600 transition"
            >
              Stories
            </Link>
            <Link
              href="/order"
              className="block text-gray-700 hover:text-orange-600 transition"
            >
              Order Cheese
            </Link>
            <Link
              href="/businesses"
              className="block text-gray-700 hover:text-orange-600 transition"
            >
              For Businesses
            </Link>
            <div className="pt-4 border-t">
              <Link
                href="/login"
                className="block mb-2 text-gray-700 hover:text-orange-600 transition"
              >
                Sign in
              </Link>
              <Link
                href="/signup/role"
                className="block px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition text-center"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
