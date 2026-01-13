import { MapPin, Calendar, Truck, Award } from "lucide-react";

export default function FeatureGrid() {
  const features = [
    {
      icon: MapPin,
      title: "Interactive Cheese Map",
      description: "Explore France's cheese heritage with our interactive map. Find shops, farms, and experiences by region.",
      color: "text-orange-600",
      bg: "bg-orange-100",
    },
    {
      icon: Calendar,
      title: "Book Cheese Tours",
      description: "Reserve farm visits, tastings, and cheese-making workshops. Experience French cheese culture firsthand.",
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      icon: Truck,
      title: "France Delivery",
      description: "French cheese delivered to your door throughout France. Fresh, cold-chain guaranteed, from verified producers.",
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      icon: Award,
      title: "Cheese Passport",
      description: "Collect stamps from regions you visit. Track your cheese journey and discover new favorites.",
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Explore French Cheese
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            From discovery to delivery, CheeseMap connects you with authentic French cheese culture
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="text-center p-6 rounded-lg hover:shadow-lg transition"
              >
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 ${feature.bg} rounded-full mb-4`}
                >
                  <Icon className={`w-8 h-8 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
