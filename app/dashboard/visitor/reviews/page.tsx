"use client";

import { Star, ThumbsUp, Edit, Trash2, MapPin, Calendar } from "lucide-react";
import Link from "next/link";

export default function ReviewsPage() {
  const reviews = [
    {
      id: 1,
      placeName: "Maison du Comté",
      placeType: "Cheese House & Museum",
      location: "Poligny, Bourgogne-Franche-Comté",
      rating: 5,
      date: "Jan 15, 2024",
      title: "Absolutely incredible cave tour!",
      content:
        "The aging caves were breathtaking and the guide was extremely knowledgeable about the Comté production process. The tasting at the end included 5 different ages of Comté, from 12 to 36 months. Each one had distinct flavors and the 24-month was my absolute favorite. Highly recommend booking the full tour experience!",
      images: ["🧀", "🏔️", "📸"],
      helpful: 24,
      verified: true,
    },
    {
      id: 2,
      placeName: "Ferme de la Brie",
      placeType: "Farm & Producer",
      location: "Meaux, Île-de-France",
      rating: 5,
      date: "Jan 10, 2024",
      title: "Perfect farm experience",
      content:
        "Got to see the entire Brie-making process from start to finish. The farmers were so passionate and explained every step in detail. We even got to try making our own small Brie which they packaged for us to take home. The farm setting is beautiful and peaceful. A must-visit for cheese lovers!",
      images: ["🚜", "🧀"],
      helpful: 18,
      verified: true,
    },
    {
      id: 3,
      placeName: "Fromagerie Laurent Dubois",
      placeType: "Cheese Shop",
      location: "Paris, Île-de-France",
      rating: 4,
      date: "Jan 5, 2024",
      title: "Excellent selection and service",
      content:
        "The staff here really knows their cheese! I asked for recommendations for a dinner party and they helped me put together a perfect selection of 6 cheeses representing different regions and milk types. Each came with detailed tasting notes. Prices are reasonable for Paris. Will definitely return.",
      images: [],
      helpful: 12,
      verified: true,
    },
    {
      id: 4,
      placeName: "Caves de Roquefort Société",
      placeType: "Cheese Caves & Tours",
      location: "Roquefort-sur-Soulzon, Occitanie",
      rating: 5,
      date: "Dec 28, 2023",
      title: "Underground wonderland",
      content:
        "The natural caves where Roquefort ages are stunning! The temperature and humidity are perfectly controlled by nature itself. Our guide explained the history dating back to the 11th century and the unique Penicillium roqueforti mold. The tasting included 3 different Roquefort varieties. Worth the drive!",
      images: ["🏔️", "🧀", "📸", "🎯"],
      helpful: 31,
      verified: true,
    },
    {
      id: 5,
      placeName: "Fromagerie Beillevaire",
      placeType: "Artisan Cheese Shop",
      location: "Nantes, Pays de la Loire",
      rating: 4,
      date: "Dec 20, 2023",
      title: "Raw milk cheese paradise",
      content:
        "Specializes in raw milk cheeses which you don't find everywhere. The selection changes with the seasons. Staff is knowledgeable and happy to let you taste before buying. Also sells butter, yogurt, and other dairy products. A bit pricey but worth it for the quality.",
      images: ["🥖"],
      helpful: 9,
      verified: true,
    },
  ];

  const stats = [
    { label: "Total Reviews", value: "5" },
    { label: "Average Rating", value: "4.8" },
    { label: "Helpful Votes", value: "94" },
    { label: "Verified Visits", value: "5" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Reviews</h1>
          <p className="text-gray-600 mt-1">Share your cheese experiences with the community</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <p className="text-3xl font-bold text-orange-600 mb-1">{stat.value}</p>
            <p className="text-sm text-gray-600">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Review Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <Link
                    href={`/businesses/${review.id}`}
                    className="text-xl font-bold text-gray-900 hover:text-orange-600 transition-colors"
                  >
                    {review.placeName}
                  </Link>
                  <p className="text-sm text-orange-600 font-semibold">{review.placeType}</p>
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{review.location}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-orange-600">
                    <Edit className="w-5 h-5" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-red-600">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Rating and Date */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < review.rating
                          ? "text-yellow-500 fill-yellow-500"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{review.date}</span>
                </div>
                {review.verified && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                    ✓ Verified Visit
                  </span>
                )}
              </div>
            </div>

            {/* Review Content */}
            <div className="p-6">
              <h3 className="font-bold text-gray-900 mb-2 text-lg">{review.title}</h3>
              <p className="text-gray-700 leading-relaxed mb-4">{review.content}</p>

              {/* Images */}
              {review.images.length > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  {review.images.map((image, index) => (
                    <div
                      key={index}
                      className="w-16 h-16 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-lg flex items-center justify-center text-2xl"
                    >
                      {image}
                    </div>
                  ))}
                </div>
              )}

              {/* Helpful Count */}
              <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                  <ThumbsUp className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-semibold text-gray-700">
                    {review.helpful} found this helpful
                  </span>
                </button>
                <span className="text-sm text-gray-500">
                  Was this review helpful to others?
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {reviews.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No reviews yet</h3>
          <p className="text-gray-600 mb-6">
            Share your experiences and help other cheese lovers discover great places
          </p>
          <Link
            href="/dashboard/visitor/bookings"
            className="inline-block px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold transition-colors"
          >
            View Your Bookings
          </Link>
        </div>
      )}

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-orange-600 to-yellow-500 rounded-xl shadow-lg p-8 text-center text-white">
        <Star className="w-16 h-16 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Keep Sharing Your Experiences</h2>
        <p className="mb-6 opacity-90">
          Your reviews help build France's most trusted cheese community
        </p>
        <Link
          href="/dashboard/visitor/bookings"
          className="inline-block px-6 py-3 bg-white text-orange-600 rounded-lg hover:bg-gray-100 font-semibold transition-colors"
        >
          Review Your Recent Visits
        </Link>
      </div>
    </div>
  );
}
