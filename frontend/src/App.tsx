import { cosmetics } from "./data/cosmetics";

function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <h1 className="text-4xl font-bold text-center text-blue-400 mb-10">
        Fortnite Cosmetics Store
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {cosmetics.map((item) => (
          <div
            key={item.id}
            className="bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 p-4 flex flex-col items-center"
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-40 h-40 object-cover rounded-lg mb-4"
            />
            <h2 className="text-lg font-semibold text-white">{item.name}</h2>
            <p className="text-sm text-gray-400">{item.type}</p>
            <p
              className={`mt-1 text-sm font-medium ${
                item.rarity === "Legendary"
                  ? "text-yellow-400"
                  : item.rarity === "Epic"
                  ? "text-purple-400"
                  : "text-blue-400"
              }`}
            >
              {item.rarity}
            </p>
            <p className="mt-2 text-green-400 font-bold">{item.price} V-Bucks</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
