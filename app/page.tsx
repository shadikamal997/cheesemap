import Navbar from "@/components/nav/Navbar";
import Link from "next/link";
import { MapPin, Search, Calendar, Award, Users, ChevronRight, Star } from "lucide-react";

export default function HomePage() {
  const regions = [
    { name: "Île-de-France", image: "🏛️", count: "120+ Fromageries" },
    { name: "Auvergne-Rhône-Alpes", image: "⛰️", count: "95+ Producers" },
    { name: "Normandie", image: "🐄", count: "80+ Farms" },
    { name: "Provence", image: "🌻", count: "65+ Artisans" },
    { name: "Bourgogne", image: "🍇", count: "50+ Cheesemakers" },
  ];

  const featuredPlaces = [
    {
      name: "Fromagerie Laurent Dubois",
      location: "Paris, Île-de-France",
      type: "Cheese Shop",
      rating: "4.9",
      specialties: "AOP Cheeses, Artisan Selection",
    },
    {
      name: "Ferme de la Brie",
      location: "Meaux, Île-de-France",
      type: "Farm & Producer",
      rating: "4.8",
      specialties: "Brie de Meaux, Farm Tours",
    },
    {
      name: "Maison du Comté",
      location: "Poligny, Bourgogne-Franche-Comté",
      type: "Cheese House",
      rating: "5.0",
      specialties: "Comté Aging Caves, Tastings",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section with Search */}
      <section className="relative bg-gradient-to-br from-orange-600 via-orange-500 to-yellow-500 text-white">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=1920')] opacity-20 bg-cover bg-center mix-blend-overlay"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 drop-shadow-lg">
              Find Your Local Fromageries And Cheese Farms!
            </h1>
            <p className="text-xl md:text-2xl mb-12 text-orange-50 font-medium">
              Discover, learn & interact with cheese shops, farms & tours across France!
            </p>
            
            {/* Search Bar */}
            <div className="bg-white rounded-2xl shadow-2xl p-4 max-w-3xl mx-auto">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search fromageries and farms..."
                    className="w-full pl-12 pr-4 py-4 text-gray-900 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <div className="flex-1 relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Region or city in France..."
                    className="w-full pl-12 pr-4 py-4 text-gray-900 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <Link
                  href="/map"
                  className="px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <Search className="w-5 h-5" />
                  Search
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Locations */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
              Featured Cheese Destinations
            </h2>
            <p className="text-xl text-gray-600">
              Explore authentic fromageries, farms, and artisan producers
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {featuredPlaces.map((place, idx) => (
              <div key={idx} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 group">
                <div className="h-48 bg-gradient-to-br from-orange-400 to-yellow-300 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1452195100486-9cc805987862?w=800')] opacity-40 bg-cover bg-center group-hover:scale-110 transition-transform duration-500"></div>
                  <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1 flex items-center gap-1 shadow-lg">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-bold text-gray-900">{place.rating}</span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="text-sm text-orange-600 font-semibold mb-2">{place.type}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{place.name}</h3>
                  <div className="flex items-center gap-2 text-gray-600 mb-4">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{place.location}</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-4">{place.specialties}</p>
                  <Link
                    href="/businesses"
                    className="text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-1 group/link"
                  >
                    View Details
                    <ChevronRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/businesses"
              className="inline-block px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              LOAD MORE
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Your journey to cheese discovery in three simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="w-20 h-20 mx-auto mb-6 bg-orange-100 rounded-full flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                <Search className="w-10 h-10 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Find Unique Places</h3>
              <p className="text-gray-600 leading-relaxed">
                Search for fromageries near and far with our interactive maps and listing views. Explore our featured maps of cheese locations to tailor your experience.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 mx-auto mb-6 bg-orange-100 rounded-full flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                <Award className="w-10 h-10 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Choose a Feature</h3>
              <p className="text-gray-600 leading-relaxed">
                Filter for AOP cheeses, farm tours, tastings, pet-friendly locations, family-friendly, organic, biodynamic, historic cellars and more...
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 mx-auto mb-6 bg-orange-100 rounded-full flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                <MapPin className="w-10 h-10 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Tour with us!</h3>
              <p className="text-gray-600 leading-relaxed">
                Choose a cheese route that fits your trip! Save and share your favorite spots and invite others to your cheese discovery tour.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* French Regions */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold mb-4">Explore France's Cheese Regions</h2>
            <p className="text-xl text-gray-300">From alpine valleys to coastal plains</p>
          </div>

          <div className="grid md:grid-cols-5 gap-6 mb-12">
            {regions.map((region, idx) => (
              <Link
                key={idx}
                href="/map"
                className="group bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/20 transition-all duration-300 text-center border border-white/20 hover:border-orange-400"
              >
                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">{region.image}</div>
                <h3 className="text-lg font-bold mb-2">{region.name}</h3>
                <p className="text-sm text-gray-300">{region.count}</p>
              </Link>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/map"
              className="inline-block px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              View All Regions
            </Link>
          </div>
        </div>
      </section>

      {/* Upcoming Tours */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Upcoming Cheese Tours</h2>
            <p className="text-xl text-gray-600">Join guided experiences at authentic French fromageries</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow">
                <div className="h-48 bg-gradient-to-br from-green-400 to-blue-500"></div>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-orange-600 font-semibold mb-2">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Coming Soon</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Comté Aging Cave Tour</h3>
                  <p className="text-gray-600 text-sm mb-4">Discover the secrets of Comté aging in traditional caves</p>
                  <Link href="/tours" className="text-orange-600 hover:text-orange-700 font-semibold">
                    Learn More →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Business CTA */}
      <section className="py-20 bg-gradient-to-br from-orange-600 to-orange-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Users className="w-16 h-16 mx-auto mb-6" />
          <h2 className="text-4xl font-extrabold mb-6">Looking for business solutions?</h2>
          <p className="text-xl mb-8 text-orange-50 leading-relaxed">
            Use CheeseMap to influence, promote and sell your fromagerie location, tastings, tours, and hospitality to our community of cheese lovers.
          </p>
          <Link
            href="/login"
            className="inline-block px-10 py-5 bg-white text-orange-600 font-bold rounded-xl hover:bg-gray-100 transition-all duration-200 shadow-xl hover:shadow-2xl text-lg"
          >
            Get Started
          </Link>
        </div>
      </section>
    </div>
  );
}
