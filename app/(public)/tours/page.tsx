export default function ToursPage() {
  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-8">Cheese Tours & Experiences</h1>
        <p className="text-lg text-gray-600 mb-8">
          Discover authentic French cheese-making through farm visits, tastings, and workshops.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm">
              <div className="aspect-video bg-gradient-to-br from-orange-100 to-orange-200"></div>
              <div className="p-6">
                <h3 className="font-semibold text-lg mb-2">Cheese Making Experience</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Learn traditional Comté production methods with hands-on experience.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-orange-600 font-semibold">€25</span>
                  <button className="px-4 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700">
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
