import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import "leaflet-geosearch/dist/geosearch.css";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const defaultMarkerIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const searchMarkerIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function SearchField({ setPosition }) {
  const map = useMap();

  useEffect(() => {
    const provider = new OpenStreetMapProvider();

    const searchControl = new GeoSearchControl({
      provider,
      style: "bar",
      autoClose: true,
      keepResult: true,
    });

    map.addControl(searchControl);

    map.on("geosearch/showlocation", (result) => {
      const { x, y } = result.location;
      console.log("Search result", result);
      setPosition({ latitude: y, longitude: x, label: result.location.label });
      map.setView([y, x], 13);
    });

    return () => {
      map.removeControl(searchControl);
    };
  }, [map, setPosition]);

  return null;
}

const Map = ({ itinerary, currentActivityId, onSetPosition }) => {
  const [searchPosition, setSearchPosition] = useState(null);
  console.log("searchPosition", searchPosition);

  const handleMarkerClick = () => {
    console.log("Marker clicked", searchPosition);
  };

  const defaultCenter = { latitude: 37.7749, longitude: -122.4194 };
  const centerPosition = itinerary.schedules[0].activities[0] || defaultCenter;

  return (
    <MapContainer
      center={[centerPosition.latitude, centerPosition.longitude]}
      zoom={10}
      style={{
        height: "100vh",
        width: "40%",
        position: "fixed",
        botton: 0,
        right: 0,
      }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <SearchField setPosition={setSearchPosition} />
      {itinerary.schedules.map(
        (schedule, index) =>
          schedule &&
          schedule.activities &&
          schedule.activities.map((activity, idx) => (
            <Marker
              key={`${index}-${idx}`}
              position={[activity.latitude, activity.longitude]}
              icon={defaultMarkerIcon}
              eventHandlers={{ click: () => handleMarkerClick(activity) }}
            >
              <Popup>
                <div>
                  <img
                    src={activity.place_image_url}
                    alt={activity.id}
                    style={{
                      width: "300px",
                      height: "auto",
                      aspectRatio: "4 / 3",
                    }}
                  />
                </div>
                <div>
                  {activity.place} ({schedule.day})
                </div>
              </Popup>
            </Marker>
          ))
      )}
      {/* Search position marker */}
      {searchPosition && (
        <Marker
          position={[searchPosition.latitude, searchPosition.longitude]}
          icon={searchMarkerIcon}
          eventHandlers={{ click: handleMarkerClick }}
        >
          <Popup>
            You are here: <br />
            Latitude: {searchPosition.latitude} <br />
            Longitude: {searchPosition.longitude} <br />
            Label: {searchPosition.label}
            <button
              type="button"
              onClick={() => {
                if (searchPosition) {
                  onSetPosition(searchPosition);
                }
              }}
            >
              Add to itinerary {currentActivityId}
            </button>
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
};

export default Map;