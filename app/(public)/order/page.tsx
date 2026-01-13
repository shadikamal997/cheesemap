export default function OrderPage() {
  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Order French Cheese</h1>
          <p className="text-lg text-gray-600">
            Premium French cheeses delivered to your door across Europe
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="font-semibold text-lg mb-4">🚚 France Delivery</h3>
            <p className="text-gray-600 mb-4">
              We deliver authentic French cheese throughout France with fast, reliable service.
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>✓ Cold-chain guaranteed</li>
              <li>✓ 2-5 day delivery</li>
              <li>✓ Direct from producers</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="font-semibold text-lg mb-4">🧀 Curated Selection</h3>
            <p className="text-gray-600 mb-4">
              Every cheese is sourced from verified French fromageries and farms.
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>✓ AOP/PDO certified</li>
              <li>✓ Artisan producers</li>
              <li>✓ Seasonal specialties</li>
            </ul>
          </div>
        </div>

        <div className="text-center">
          <button className="px-8 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition">
            Browse Cheese Selection
          </button>
        </div>
      </div>
    </div>
  );
}
