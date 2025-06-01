import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";


delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});


const createCustomIcon = (trafficLevel) => {
  const colors = {
    high: "#ef4444",
    medium: "#f97316",
    low: "#22c55e", 
  };

  return L.divIcon({
    html: `<div style="
      background-color: ${colors[trafficLevel] || "#6b7280"};
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>`,
    className: "custom-marker",
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

function App() {
  const [billboards, setBillboards] = useState([]);
  const [filteredBillboards, setFilteredBillboards] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBillboard, setSelectedBillboard] = useState(null);
  const [predictionData, setPredictionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  const API_BASE_URL = "http://localhost:5000";


  useEffect(() => {
    fetchBillboards();
  }, []);


  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredBillboards(billboards);
    } else {
      const filtered = billboards.filter(
        (billboard) =>
          billboard.billboard_id
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          billboard.id.toString().includes(searchTerm) ||
          billboard.region.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredBillboards(filtered);
    }
  }, [searchTerm, billboards]);

  const fetchBillboards = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/api/billboards`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success && Array.isArray(data.data)) {
        setBillboards(data.data);
        setFilteredBillboards(data.data);
      } else {
        throw new Error(
          data.message || "Invalid data format received from server"
        );
      }
    } catch (err) {
      setError(
        `Failed to load billboards: ${err.message}. Please ensure backend server is running on ${API_BASE_URL}`
      );
      console.error("Error fetching billboards:", err);
      setBillboards([]);
      setFilteredBillboards([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrediction = async (billboard) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${API_BASE_URL}/api/predict/${billboard.billboard_id}`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setPredictionData(data);
      } else {
        throw new Error(data.message || "Failed to get prediction data");
      }
    } catch (err) {
      setError(`Failed to load prediction: ${err.message}. Please try again.`);
      console.error("Error fetching prediction:", err);
      setPredictionData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkerClick = (billboard) => {
    setSelectedBillboard(billboard);
    fetchPrediction(billboard);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 0,
    }).format(amount);
  };


  const getBillboardImage = (billboardId) => {
    return `https://picsum.photos/seed/${billboardId}/400/250?random=${billboardId}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            OOH Billboard Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Real-time billboard data with 7-day impression predictions
          </p>
        </div>
      </header>

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto px-4 pb-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by Billboard ID (e.g., B001) or Region..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div className="text-sm text-gray-600">
              Showing {filteredBillboards.length} of {billboards.length}{" "}
              billboards
            </div>
            <button
              onClick={fetchBillboards}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm transition-colors"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 mb-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
            <button
              onClick={() => {
                setError(null);
                fetchBillboards();
              }}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div className="max-w-7xl mx-auto px-4 pb-4">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="h-96 relative">
            {loading && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading...</p>
                </div>
              </div>
            )}

            <MapContainer
              center={[6.9271, 79.8612]} 
              zoom={11}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {filteredBillboards.map((billboard) => (
                <Marker
                  key={billboard.id}
                  position={[billboard.latitude, billboard.longitude]}
                  icon={createCustomIcon(billboard.traffic_level)}
                  eventHandlers={{
                    click: () => handleMarkerClick(billboard),
                  }}
                >
                  <Popup>
                    <div className="p-2 min-w-64">
                      <h3 className="font-semibold text-lg mb-2">
                        {billboard.billboard_id}
                      </h3>
                      <div className="space-y-1 text-sm mb-3">
                        <p>
                          <span className="font-medium">Region:</span>{" "}
                          {billboard.region}
                        </p>
                        <p>
                          <span className="font-medium">Coordinates:</span>{" "}
                          {billboard.latitude.toFixed(4)},{" "}
                          {billboard.longitude.toFixed(4)}
                        </p>
                        <p>
                          <span className="font-medium">Traffic Level:</span>
                          <span
                            className={`ml-1 px-2 py-1 rounded text-xs font-medium capitalize ${
                              billboard.traffic_level === "high"
                                ? "bg-red-100 text-red-800"
                                : billboard.traffic_level === "medium"
                                ? "bg-orange-100 text-orange-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {billboard.traffic_level}
                          </span>
                        </p>
                        <p>
                          <span className="font-medium">Size:</span>{" "}
                          {billboard.size}
                        </p>
                        <p>
                          <span className="font-medium">Type:</span>{" "}
                          {billboard.type}
                        </p>
                        <p>
                          <span className="font-medium">Monthly Rate:</span>{" "}
                          {formatCurrency(billboard.monthly_rate)}
                        </p>
                      </div>

                      {/* Billboard Image */}
                      <div className="mb-3">
                        <img
                          src={getBillboardImage(billboard.id)}
                          alt={`Billboard ${billboard.billboard_id}`}
                          className="w-full h-24 object-cover rounded"
                          onError={(e) => {
                            e.target.src =
                              "https://via.placeholder.com/300x200/6b7280/ffffff?text=Billboard+Image";
                          }}
                        />
                      </div>

                      <button
                        onClick={() => handleMarkerClick(billboard)}
                        className="w-full bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
                      >
                        View 7-Day Predictions
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
      </div>

      {/* Traffic Level Legend */}
      <div className="max-w-7xl mx-auto px-4 pb-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="font-semibold mb-2">Traffic Level Legend:</h3>
          <div className="flex space-x-6">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
              <span className="text-sm">High Traffic</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-orange-500 rounded-full mr-2"></div>
              <span className="text-sm">Medium Traffic</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm">Low Traffic</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Prediction Display */}
      {selectedBillboard && predictionData && (
        <div className="max-w-7xl mx-auto px-4 pb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold mb-2">
                  Prediction Results for {predictionData.billboard_id} -{" "}
                  {selectedBillboard.region}
                </h2>
                <p className="text-gray-600 mb-2">
                  Coordinates: {selectedBillboard.latitude.toFixed(4)},{" "}
                  {selectedBillboard.longitude.toFixed(4)}
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>Size: {selectedBillboard.size}</span>
                  <span>Type: {selectedBillboard.type}</span>
                  <span>
                    Monthly Rate:{" "}
                    {formatCurrency(selectedBillboard.monthly_rate)}
                  </span>
                </div>
              </div>
              <img
                src={getBillboardImage(selectedBillboard.id)}
                alt={`Billboard ${predictionData.billboard_id}`}
                className="w-32 h-20 object-cover rounded shadow-sm"
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/128x80/6b7280/ffffff?text=Billboard";
                }}
              />
            </div>

            {/* API Data Format Display */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">
                Backend API Response Format:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2 text-blue-800">
                    Past 60 Days Data (sample):
                  </h4>
                  <div className="bg-white p-3 rounded border font-mono text-xs overflow-x-auto">
                    <div className="text-gray-600 mb-1">
                      Array of {predictionData.past_60_days.length} values:
                    </div>
                    <div>
                      [{predictionData.past_60_days.slice(0, 3).join(", ")},
                      ..., {predictionData.past_60_days.slice(-3).join(", ")}]
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2 text-green-800">
                    Predicted 7 Days:
                  </h4>
                  <div className="bg-white p-3 rounded border font-mono text-xs">
                    <div className="text-gray-600 mb-1">
                      Next 7 days predictions:
                    </div>
                    <div>[{predictionData.predicted_7_days.join(", ")}]</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900">
                  Historical Avg Daily
                </h3>
                <p className="text-2xl font-bold text-blue-600">
                  {predictionData.detailed_data.historical_data.summary.average_daily.toLocaleString()}
                </p>
                <p className="text-xs text-blue-700">Based on 60 days</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium text-green-900">
                  7-Day Total Predicted
                </h3>
                <p className="text-2xl font-bold text-green-600">
                  {predictionData.detailed_data.prediction.total_predicted.toLocaleString()}
                </p>
                <p className="text-xs text-green-700">Next week total</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-medium text-purple-900">Avg Confidence</h3>
                <p className="text-2xl font-bold text-purple-600">
                  {(
                    predictionData.detailed_data.prediction.average_confidence *
                    100
                  ).toFixed(0)}
                  %
                </p>
                <p className="text-xs text-purple-700">Model confidence</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="font-medium text-orange-900">
                  Predicted Daily Avg
                </h3>
                <p className="text-2xl font-bold text-orange-600">
                  {Math.round(
                    predictionData.detailed_data.prediction.total_predicted / 7
                  ).toLocaleString()}
                </p>
                <p className="text-xs text-orange-700">Next week daily</p>
              </div>
            </div>

            {/* Chart Visualization */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">
                7-Day Prediction Visualization
              </h3>
              <div className="bg-white border rounded-lg p-6">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={predictionData.detailed_data.prediction.forecast.map(
                        (day, index) => ({
                          day: `Day ${index + 1}`,
                          date: new Date(day.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          }),
                          predicted: day.predicted_impressions,
                          confidence: day.confidence * 100,
                        })
                      )}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) =>
                          `${(value / 1000).toFixed(1)}k`
                        }
                      />
                      <Tooltip
                        formatter={(value, name) => [
                          name === "predicted"
                            ? `${value.toLocaleString()} impressions`
                            : `${value.toFixed(1)}%`,
                          name === "predicted"
                            ? "Predicted Impressions"
                            : "Confidence",
                        ]}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Line
                        type="monotone"
                        dataKey="predicted"
                        stroke="#2563eb"
                        strokeWidth={3}
                        dot={{ fill: "#2563eb", strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Alternative Bar Chart */}
                <div className="mt-8 h-64">
                  <h4 className="text-md font-medium mb-3 text-gray-700">
                    Daily Predictions (Bar View)
                  </h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={predictionData.detailed_data.prediction.forecast.map(
                        (day, index) => ({
                          day: `Day ${index + 1}`,
                          date: new Date(day.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          }),
                          predicted: day.predicted_impressions,
                          confidence: day.confidence,
                        })
                      )}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) =>
                          `${(value / 1000).toFixed(1)}k`
                        }
                      />
                      <Tooltip
                        formatter={(value) => [
                          `${value.toLocaleString()} impressions`,
                          "Predicted Impressions",
                        ]}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Bar
                        dataKey="predicted"
                        fill="#3b82f6"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* 7-Day Prediction Table */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">
                Next 7 Days Detailed Forecast
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Day
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Predicted Impressions
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Confidence Level
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Day Trend
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {predictionData.detailed_data.prediction.forecast.map(
                      (day, index) => {
                        const date = new Date(day.date);
                        const formattedDate = date.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          weekday: "short",
                        });

                        // Calculate trend compared to previous day
                        let trend = "";
                        let trendColor = "";
                        if (index > 0) {
                          const prevViews =
                            predictionData.detailed_data.prediction.forecast[
                              index - 1
                            ].predicted_impressions;
                          const currentViews = day.predicted_impressions;
                          const change =
                            ((currentViews - prevViews) / prevViews) * 100;

                          if (change > 2) {
                            trend = `↗ +${change.toFixed(1)}%`;
                            trendColor = "text-green-600 bg-green-50";
                          } else if (change < -2) {
                            trend = `↘ ${change.toFixed(1)}%`;
                            trendColor = "text-red-600 bg-red-50";
                          } else {
                            trend = "➡ Stable";
                            trendColor = "text-gray-600 bg-gray-50";
                          }
                        } else {
                          trend = "🎯 Baseline";
                          trendColor = "text-blue-600 bg-blue-50";
                        }

                        return (
                          <tr
                            key={index}
                            className={
                              index % 2 === 0 ? "bg-white" : "bg-gray-50"
                            }
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              Day {index + 1}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div>
                                <div className="font-medium">
                                  {formattedDate}
                                </div>
                                <div className="text-xs text-gray-400">
                                  {day.day_of_week}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                              {day.predicted_impressions.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex items-center">
                                <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{
                                      width: `${day.confidence * 100}%`,
                                    }}
                                  ></div>
                                </div>
                                {(day.confidence * 100).toFixed(0)}%
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${trendColor}`}
                              >
                                {trend}
                              </span>
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Model Information */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-3">
                Prediction Model Analytics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Model Algorithm</p>
                  <p className="font-semibold">
                    Moving Average with Trend Analysis
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Training Period</p>
                  <p className="font-semibold">
                    {
                      predictionData.detailed_data.historical_data.summary
                        .days_recorded
                    }{" "}
                    Days Historical Data
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Peak Daily Impressions</p>
                  <p className="font-semibold text-green-600">
                    {Math.max(...predictionData.past_60_days).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Lowest Daily Impressions</p>
                  <p className="font-semibold text-red-600">
                    {Math.min(...predictionData.past_60_days).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No Data State */}
      {!loading && billboards.length === 0 && !error && (
        <div className="max-w-7xl mx-auto px-4 pb-6">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Billboard Data
            </h3>
            <p className="text-gray-500 mb-4">
              Make sure your Flask backend is running on {API_BASE_URL}
            </p>
            <button
              onClick={fetchBillboards}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Loading Data
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
