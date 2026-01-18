import { MapPin, Users, Award, Truck } from "lucide-react";
import Link from "next/link";

export default function BusinessesPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-orange-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Grow Your Cheese Business Online
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Join France's premier cheese discovery platform. Connect with tourists, manage inventory, 
              offer tours, and deliver across Europe.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/signup"
                className="px-8 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition"
              >
                Start Free Trial
              </Link>
              <Link
                href="/login"
                className="px-8 py-3 bg-white text-gray-900 rounded-lg font-semibold border-2 border-gray-300 hover:border-gray-400 transition"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                <MapPin className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Map Visibility</h3>
              <p className="text-gray-600">
                Appear on France's interactive cheese map, discovered by thousands
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                <Users className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Tour Management</h3>
              <p className="text-gray-600">
                Offer tastings, farm visits, and workshops with online booking
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                <Award className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Inventory Control</h3>
              <p className="text-gray-600">
                Track stock, batches, and aging for shops and farms
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                <Truck className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">EU Delivery</h3>
              <p className="text-gray-600">
                Ship your French cheeses across Europe with partner logistics
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4">Simple, Transparent Pricing</h2>
          <p className="text-center text-gray-600 mb-6 max-w-2xl mx-auto">
            Everything you need to grow your cheese business, with no hidden fees.
          </p>
          
          {/* Trial Messaging */}
          <div className="max-w-2xl mx-auto mb-12 bg-green-50 border border-green-200 rounded-lg px-6 py-4 text-center">
            <p className="text-green-900 font-semibold text-lg">
              🎁 <strong>Premier mois offert</strong> — Essai gratuit de 30 jours
            </p>
            <p className="text-green-700 text-sm mt-2">
              Aucun paiement pendant les 30 premiers jours • Carte bancaire requise • Annulation à tout moment
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { 
                name: "Essential", 
                price: "€25", 
                description: "Perfect for getting started",
                features: ["Up to 10 products", "30 orders/month", "Customer support", "Map visibility", "SKU tracking"] 
              },
              { 
                name: "Growth", 
                price: "€55", 
                description: "For growing businesses",
                highlight: true,
                features: ["Up to 50 products", "Unlimited orders", "Tour management (5 active)", "Analytics dashboard", "Priority support"] 
              },
              { 
                name: "Professional", 
                price: "€95", 
                description: "For established businesses",
                features: ["Unlimited products", "Unlimited orders", "Unlimited tours", "Advanced analytics", "Promotional tools", "Dedicated support"] 
              },
            ].map((plan) => (
              <div 
                key={plan.name} 
                className={`rounded-lg p-6 shadow-sm border transition-all ${
                  plan.highlight 
                    ? "bg-orange-600 text-white border-orange-600 scale-105" 
                    : "bg-white border-gray-200 hover:shadow-md"
                }`}
              >
                {plan.highlight && (
                  <div className="inline-block px-3 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full mb-3">
                    Most Popular
                  </div>
                )}
                <h3 className={`font-semibold text-lg mb-1 ${plan.highlight ? "text-white" : "text-gray-900"}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm mb-4 ${plan.highlight ? "text-orange-100" : "text-gray-600"}`}>
                  {plan.description}
                </p>
                <p className="text-3xl font-bold mb-4">
                  {plan.price}<span className={`text-sm ${plan.highlight ? "text-orange-100" : "text-gray-600"}`}>/mo</span>
                </p>
                <ul className={`space-y-2 text-sm mb-6 ${plan.highlight ? "text-orange-50" : "text-gray-700"}`}>
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <span className={`mr-2 ${plan.highlight ? "text-orange-200" : "text-orange-600"}`}>✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`block text-center py-2 px-4 rounded-lg font-semibold transition ${
                    plan.highlight
                      ? "bg-white text-orange-600 hover:bg-gray-100"
                      : "bg-orange-600 text-white hover:bg-orange-700"
                  }`}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-gray-600 mt-12">
            All plans include 30-day billing cycle, email support, and full access to map visibility.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-gray-600 mb-8">
            Join hundreds of French cheese shops and farms already on CheeseMap
          </p>
          <Link
            href="/signup"
            className="inline-block px-8 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition"
          >
            Create Your Free Account
          </Link>
        </div>
      </section>
    </div>
  );
}
