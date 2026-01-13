"use client";

import Link from "next/link";
import { Heart, MapPin, Star, ChevronRight, Phone, Globe, Clock } from "lucide-react";

export default function SavedPlacesPage() {
  const savedPlaces = [
    {
      id: 1,
      name: "Fromagerie Laurent Dubois",
      type: "Cheese Shop",
      location: "Paris, Île-de-France",
      address: "47 Boulevard Saint-Germain, 75005 Paris",
      rating: 4.9,
      reviews: 342,
      image: "🧀",
      specialties: "AOP Cheeses, Artisan Selection, Expert Advice",
      hours: "Mon-Sat: 9:00 AM - 7:00 PM",
      phone: "+33 1 45 48 54 75",
      website: "fromagerie-dubois.fr",
      distance: "2.3 km",
      savedDate: "Jan 10, 2024",
    },
    {
      id: 2,
      name: "Ferme de la Brie",
      type: "Farm & Producer",
      location: "Meaux, Île-de-France",
      address: "Route de Coulommiers, 77100 Meaux",
      rating: 4.8,
      reviews: 156,
      image: "🚜",
      specialties: "Brie de Meaux AOP, Farm Tours, Tastings",
      hours: "Tue-Sun: 10:00 AM - 6:00 PM",
      phone: "+33 1 64 33 21 45",
      website: "fermedelabrie.fr",
      distance: "45 km",
      savedDate: "Jan 8, 2024",
    },
    {
      id: 3,
      name: "Maison du Comté",
      type: "Cheese House & Museum",
      location: "Poligny, Bourgogne-Franche-Comté",
      address: "Avenue de la Résistance, 39800 Poligny",
      rating: 5.0,
      reviews: 523,
      image: "🏛️",
      specialties: "Comté Aging Caves, Museum, Educational Tours",
      hours: "Daily: 9:30 AM - 6:00 PM",
      phone: "+33 3 84 37 23 51",
      website: "maison-du-comte.com",
      distance: "320 km",
      savedDate: "Jan 5, 2024",
    },
    {
      id: 4,
      name: "Fromagerie Beillevaire",
      type: "Artisan Cheese Shop",
      location: "Nantes, Pays de la Loire",
      address: "8 Rue Saint-Léonard, 44000 Nantes",
      rating: 4.7,
      reviews: 287,
      image: "🥖",
      specialties: "Raw Milk Cheeses, Regional Specialties",
      hours: "Mon-Sat: 8:30 AM - 7:30 PM",
      phone: "+33 2 40 47 36 08",
      website: "beillevaire.com",
      distance: "385 km",
      savedDate: "Dec 28, 2023",
    },
    {
      id: 5,
      name: "Caves de Roquefort Société",
      type: "Cheese Caves & Tours",
      location: "Roquefort-sur-Soulzon, Occitanie",
      address: "Avenue François Galtier, 12250 Roquefort-sur-Soulzon",
      rating: 4.9,
      reviews: 1243,
      image: "🏔️",
      specialties: "Roquefort AOP, Cave Tours, Tasting Sessions",
      hours: "Daily: 10:00 AM - 5:00 PM",
      phone: "+33 5 65 58 58 58",
      website: "roquefort-societe.com",
      distance: "610 km",
      savedDate: "Dec 20, 2023",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Saved Places</h1>
          <p className="text-gray-600 mt-1">{savedPlaces.length} fromageries, farms, and experiences</p>
        </div>
        <Link
          href="/map"
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold transition-colors"
        >
          Explore Map
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button className="px-4 py-2 bg-orange-600 text-white rounded-lg font-semibold whitespace-nowrap">
          All Places ({savedPlaces.length})
        </button>
        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors whitespace-nowrap">
          Shops (2)
        </button>
        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors whitespace-nowrap">
          Farms (1)
        </button>
        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors whitespace-nowrap">
          Experiences (2)
        </button>
      </div>

      {/* Saved Places Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {savedPlaces.map((place) => (
          <div key={place.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-xl flex items-center justify-center text-3xl">
                    {place.image}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{place.name}</h3>
                        <p className="text-sm text-orange-600 font-semibold">{place.type}</p>
                      </div>
                      <button className="text-red-500 hover:text-red-600 transition-colors">
                        <Heart className="w-6 h-6 fill-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className="font-bold text-gray-900">{place.rating}</span>
                  <span className="text-sm text-gray-600">({place.reviews} reviews)</span>
                </div>
                <span className="text-sm text-gray-500">Saved {place.savedDate}</span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Location */}
              <div className="flex items-start gap-2 mb-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">{place.location}</p>
                  <p className="text-sm text-gray-600">{place.address}</p>
                  <p className="text-xs text-orange-600 font-semibold mt-1">{place.distance} away</p>
                </div>
              </div>

              {/* Specialties */}
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-1">Specialties:</p>
                <p className="text-sm text-gray-600">{place.specialties}</p>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{place.hours}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <a href={`tel:${place.phone}`} className="text-orange-600 hover:text-orange-700">
                    Call
                  </a>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Link
                  href={`/businesses/${place.id}`}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold transition-colors text-center"
                >
                  View Details
                </Link>
                <a
                  href={`https://${place.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Globe className="w-5 h-5" />
                </a>
                <Link
                  href={`/map?location=${place.id}`}
                  className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <MapPin className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State (if no saved places) */}
      {savedPlaces.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No saved places yet</h3>
          <p className="text-gray-600 mb-6">Start exploring and save your favorite cheese destinations</p>
          <Link
            href="/map"
            className="inline-block px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold transition-colors"
          >
            Explore Cheese Map
          </Link>
        </div>
      )}
    </div>
  );
}
