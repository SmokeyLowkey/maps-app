import React, { useEffect, useRef, useState } from "react";
import { BrowserRouter as Router, Route, Routes, useParams } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import NavBar from "./components/NavBar";
import "./App.css";
import { GetLocalTimeForTimeZone } from "./utils/localtime";
import Sidebar from "./components/Sidebar";
import SearchAddress from "./components/Search";
import StyleSwitcher from "./components/StyleSwitcher";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useThree } from "@react-three/fiber";
import VirtualStore from "./store/VirtualStore.jsx";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_KEY;
const baseUrl = import.meta.env.VITE_BASE_URL;

const MapComponent = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-95.23243);
  const [lat, setLat] = useState(49.76869);
  const [zoom, setZoom] = useState(3);
  const [markers, setMarkers] = useState([]);
  const [filteredMarkers, setFilteredMarkers] = useState([]);
  const [activeCodes, setActiveCodes] = useState([]);
  const [mapMarkers, setMapMarkers] = useState([]);
  const [popupIntervals, setPopupIntervals] = useState({});
  const [selectedBranchData, setSelectedBranchData] = useState(null);
  const [searchMarker, setSearchMarker] = useState(null);
  const [styleUrl, setStyleUrl] = useState("mapbox://styles/mapbox/dark-v11"); // Default style

  function notifyError(message) {
    toast.error(message);
  }

  useEffect(() => {
    fetch(`${baseUrl}/branchdata/`, {
      method: "GET",
      headers: {
        Authorization: import.meta.env.VITE_API_TOKEN,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setMarkers(data);
        setFilteredMarkers(data);
      })
      .catch((error) => console.error("Error fetching marker data:", error));
  }, []);

  useEffect(() => {
    fetch("/api/mapbox-proxy/?endpoint=styles&query=mapbox/streets-v11")
      .then((response) => response.json())
      .then((data) => {
        console.log("Received data from Django:", data); // Log the data to the console
        initializeMap("mapbox://styles/mapbox/streets-v11"); // Assuming this is correct
      })
      .catch((error) => console.error("Error fetching Mapbox data:", error));
  }, []);

  useEffect(() => {
    if (!mapboxgl.accessToken) {
      console.error("Mapbox token is not set.");
      return;
    }
    if (map.current) return;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: styleUrl,
      projection: "globe",
      center: [lng, lat],
      zoom: zoom,
    });
    map.current.addControl(new mapboxgl.NavigationControl());
    map.current.addControl(new mapboxgl.FullscreenControl());
    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
      })
    );

    map.current.on("load", () => {
      if (filteredMarkers.length > 0) {
        updateMarkers();
      }
      add3DBuildings(map.current);
    });
    return () => Object.values(popupIntervals).forEach(clearInterval);
  }, []);

  useEffect(() => {
    if (map.current) {
      map.current.setStyle(styleUrl);
    }
  }, [styleUrl]);

  function add3DBuildings(mapInstance) {
    try {
      if (
        !mapInstance.getLayer("3d-buildings") &&
        mapInstance.getSource("composite")
      ) {
        mapInstance.addLayer({
          id: "3d-buildings",
          source: "composite",
          "source-layer": "building",
          filter: ["==", "extrude", "true"],
          type: "fill-extrusion",
          paint: {
            "fill-extrusion-color": "#aaa",
            "fill-extrusion-height": ["get", "height"],
            "fill-extrusion-base": ["get", "min_height"],
            "fill-extrusion-opacity": 0.6,
          },
        });
      }
    } catch (error) {
      console.error("Failed to add 3D buildings layer:", error);
      toast.error("This style does not support 3D buildings.");
    }
  }
  function handleStyleChange(newStyleUrl) {
    setStyleUrl(newStyleUrl);
    // Wait for the style to load before re-adding the 3D buildings layer
    if (map.current) {
      map.current.once("style.load", () => {
        add3DBuildings(map.current);
      });
    }
  }

  useEffect(() => {
    if (map.current && map.current.isStyleLoaded()) {
      updateMarkers();
    }
  }, [filteredMarkers]);

  const clearMarkers = () => {
    mapMarkers.forEach((marker) => marker.remove());
    setMapMarkers([]);
  };

  const updateMarkers = () => {
    clearMarkers();
    let intervals = {};
    const newMarkers = filteredMarkers.map((marker, index) => {
      const coordinates = marker.coordinates.split(",").map(parseFloat);
      const el = document.createElement("div");
      el.className = "marker";
      el.style.backgroundColor = getColor(marker.code);
      el.style.width = "15px";
      el.style.height = "15px";
      el.style.borderRadius = "100%";

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
        `<h3>${marker.code}</h3><p>${
          marker.branchCity
        }</p><p>Local Time: ${GetLocalTimeForTimeZone(marker.timeZone)}</p>`
      );

      const newMarker = new mapboxgl.Marker(el)
        .setLngLat([coordinates[1], coordinates[0]])
        .setPopup(popup)
        .addTo(map.current);

      newMarker.getElement().addEventListener("click", () => {
        if (intervals[index]) clearInterval(intervals[index]);
        intervals[index] = setInterval(() => {
          popup.setHTML(
            `<h3>${marker.code}</h3><p>${
              marker.branchCity
            }</p><p>Local Time: ${GetLocalTimeForTimeZone(marker.timeZone)}</p>`
          );
        }, 1000);
        popup.on("close", () => {
          clearInterval(intervals[index]);
          intervals[index] = null;
        });
        setSelectedBranchData(marker);
      });
      setPopupIntervals((prev) => ({ ...prev, [index]: intervals[index] }));
      return newMarker;
    });
    setMapMarkers(newMarkers);
  };

  function handleFilterChange(code) {
    setActiveCodes((prevCodes) => {
      let newCodes = prevCodes.includes(code)
        ? prevCodes.filter((c) => c !== code)
        : [...prevCodes, code];
      // Change here: Use an empty array when no codes are active.
      setFilteredMarkers(
        newCodes.length === 0
          ? []
          : markers.filter((marker) =>
              newCodes.some((activeCode) => marker.code.startsWith(activeCode))
            )
      );
      return newCodes;
    });
  }

  function getColor(code) {
    return code.startsWith("C")
      ? "#ffcc00"
      : code.startsWith("T")
      ? "#bf0000"
      : code.startsWith("A")
      ? "#55915f"
      : "#1b213e";
  }
  const onSearch = async (address) => {
    const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      address
    )}.json?access_token=${mapboxgl.accessToken}&limit=1`;
    try {
      const response = await fetch(geocodeUrl);
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const coordinates = data.features[0].geometry.coordinates;

        // Remove existing marker and circle
        if (searchMarker) {
          searchMarker.remove();
          setSearchMarker(null);
        }

        // Add new search location marker
        const marker = new mapboxgl.Marker()
          .setLngLat(coordinates)
          .addTo(map.current);

        setSearchMarker(marker);

        map.current.flyTo({ center: coordinates, zoom: 4 });
      } else {
        console.error("No locations found.");
      }
    } catch (error) {
      console.error("Failed to fetch geocode data:", error);
    }
  };
  const flyToBranch = (selectedCode) => {
    const branch = filteredMarkers.find((m) => m.code === selectedCode);
    if (branch) {
      const coordinates = branch.coordinates
        .split(",")
        .map((coord) => parseFloat(coord.trim()));
      map.current.flyTo({
        center: [coordinates[1], coordinates[0]],
        zoom: 19,
        essential: true,
      });
    }
  };

  return (
    <div className="App">
      <div className="navContainer">
        <NavBar
          activeCodes={activeCodes}
          onFilterChange={handleFilterChange}
          filteredMarkers={filteredMarkers}
          onBranchSelect={flyToBranch}
        />
        <StyleSwitcher onChange={handleStyleChange} />
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
      <SearchAddress onSearch={onSearch} />
      <Sidebar selectedBranch={selectedBranchData} />
      <div
        ref={mapContainer}
        className="map-container"
        style={{ height: "100vh" }}
      />
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MapComponent />} />
        <Route path="/scene/:branchCode" element={<VirtualStore />} />
      </Routes>
    </Router>
  );
}

export default App;
