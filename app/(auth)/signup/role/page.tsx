"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Store, Tractor, User, ChevronRight, Award } from "lucide-react";
import Link from "next/link";

export default function SignupRolePage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  const roles = [
    {
      id: "shop",
      icon: Store,
      title: "I am a cheese shop / fromagerie",
      description: "Manage inventory, take orders, offer tastings",
      color: "blue",
      features: ["Inventory System", "Order Processing", "Map Visibility"],
    },
    {
      id: "farm",
      icon: Tractor,
      title: "I am a farm / producer",
      description: "Track production, aging, and sell direct",
      color: "green",
      features: ["Batch Tracking", "Production Tools", "Farm Tours"],
    },
    {
      id: "visitor",
      icon: User,
      title: "I am a visitor / tourist",
      description: "Discover cheese, book tours, build your passport",
      color: "purple",
      features: ["Cheese Map", "Tour Bookings", "Free Passport"],
    },
  ];

  const handleContinue = () => {
    if (selected) {
      router.push(`/signup/account?role=${selected}`);
    }
  };

  const getColorClasses = (color: string, isSelected: boolean) => {
    const colors = {
      blue: {
        border: isSelected ? "border-blue-600" : "border-gray-200",
        bg: isSelected ? "bg-blue-50" : "bg-white",
        icon: isSelected ? "text-blue-600" : "text-gray-400",
        badge: "bg-blue-100 text-blue-700",
      },
      green: {
        border: isSelected ? "border-green-600" : "border-gray-200",
        bg: isSelected ? "bg-green-50" : "bg-white",
        icon: isSelected ? "text-green-600" : "text-gray-400",
        badge: "bg-green-100 text-green-700",
      },
      purple: {
        border: isSelected ? "border-purple-600" : "border-gray-200",
        bg: isSelected ? "bg-purple-50" : "bg-white",
        icon: isSelected ? "text-purple-600" : "text-gray-400",
        badge: "bg-purple-100 text-purple-700",
      },
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-orange-600">🧀 CheeseMap</span>
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Already have an account?</span>
              <Link
                href="/login"
                className="px-4 py-2 text-orange-600 hover:text-orange-700 font-medium"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl w-full">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-6">
              <Award className="w-10 h-10 text-orange-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Welcome to CheeseMap
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join France's premier cheese discovery platform. Choose your account type to get started.
            </p>
          </div>

          {/* Role Cards */}
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            {roles.map((role) => {
              const Icon = role.icon;
              const isSelected = selected === role.id;
              const colors = getColorClasses(role.color, isSelected);

              return (
                <button
                  key={role.id}
                  onClick={() => setSelected(role.id)}
                  className={`group relative p-8 border-2 rounded-2xl text-left transition-all duration-200 transform hover:scale-105 hover:shadow-xl ${colors.border} ${colors.bg}`}
                >
                  {/* Selection Indicator */}
                  {isSelected && (
                    <div className="absolute top-4 right-4 w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}

                  {/* Icon */}
                  <div className="mb-4">
                    <Icon className={`w-12 h-12 transition-colors ${colors.icon}`} />
                  </div>

                  {/* Content */}
                  <h3 className="font-bold text-lg mb-2 text-gray-900 pr-8">{role.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{role.description}</p>

                  {/* Features */}
                  <div className="space-y-2">
                    {role.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${colors.badge}`} />
                        <span className="text-xs text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Continue Button */}
          <div className="text-center">
            <button
              onClick={handleContinue}
              disabled={!selected}
              className="group inline-flex items-center gap-2 px-10 py-4 bg-orange-600 text-white rounded-xl font-semibold text-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none"
            >
              Continue
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="mt-4 text-sm text-gray-500">
              You can always update your account settings later
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
