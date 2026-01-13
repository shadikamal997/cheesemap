export default function InventoryTable() {
  const products = [
    {
      id: 1,
      name: "Camembert de Normandie AOP",
      sku: "CAM-001",
      quantity: 45,
      unit: "piece",
      price: "€8.50",
      status: "in-stock",
    },
    {
      id: 2,
      name: "Comté 12 months",
      sku: "COM-001",
      quantity: 30,
      unit: "piece",
      price: "€14.50",
      status: "in-stock",
    },
    {
      id: 3,
      name: "Saint-Nectaire Fermier",
      sku: "STN-001",
      quantity: 8,
      unit: "piece",
      price: "€12.00",
      status: "low-stock",
    },
    {
      id: 4,
      name: "Roquefort AOP",
      sku: "ROQ-001",
      quantity: 0,
      unit: "kg",
      price: "€22.00",
      status: "out-of-stock",
    },
  ];

  const getStatusBadge = (status: string) => {
    const styles = {
      "in-stock": "bg-green-100 text-green-800",
      "low-stock": "bg-yellow-100 text-yellow-800",
      "out-of-stock": "bg-red-100 text-red-800",
    };
    const labels = {
      "in-stock": "In Stock",
      "low-stock": "Low Stock",
      "out-of-stock": "Out of Stock",
    };
    return (
      <span
        className={`px-2 py-1 text-xs font-semibold rounded-full ${
          styles[status as keyof typeof styles]
        }`}
      >
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Product
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              SKU
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Quantity
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Price
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="font-medium text-gray-900">{product.name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {product.sku}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {product.quantity} {product.unit}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {product.price}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getStatusBadge(product.status)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                <button className="text-orange-600 hover:text-orange-900 font-medium mr-4">
                  Edit
                </button>
                <button className="text-gray-600 hover:text-gray-900 font-medium">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
