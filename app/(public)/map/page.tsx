import CheeseMap from "@/components/map/CheeseMap";
import MapFilters from "@/components/map/MapFilters";

export default function MapPage() {
  return (
    <div className="h-screen pt-16">
      <div className="flex h-full">
        <aside className="w-80 bg-white border-r overflow-y-auto">
          <MapFilters />
        </aside>
        <main className="flex-1">
          <CheeseMap />
        </main>
      </div>
    </div>
  );
}
