import React, { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const API_URL = "http://127.0.0.1:8095";

const DATASETS = [
  {
    key: "co2",
    label: "CO2 [ppm]",
    filename: "T_perf_CO2_Change",
    column: "CO2factor",
    color: "#ef4444",
  },
  {
    key: "h2o",
    label: "H2O [%]",
    filename: "T_perf_HO2_Change",
    column: "H2Ofactor",
    color: "#3b82f6",
  },
  {
    key: "ch4",
    label: "CH4 [ppm]",
    filename: "T_perf_CH4_Change",
    column: "CH4factor",
    color: "#22c55e",
  },
  {
    key: "n2o",
    label: "N2O [ppm]",
    filename: "T_perf_N2O_Change",
    column: "N2Ofactor",
    color: "#eab308",
  },
  {
    key: "o3",
    label: "O3 [ppm]",
    filename: "T_perf_03_Change",
    column: "O3factor",
    color: "#a855f7",
  },
];

function App() {
  const [rangeValues, setRangeValues] = useState([]);

  const [sliderValues, setSliderValues] = useState({
    co2: 0,
    h2o: 0,
    ch4: 0,
    n2o: 0,
    o3: 0,
  });

  const [activeGas, setActiveGas] = useState("co2");
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showChart, setShowChart] = useState(false);

  async function fetchRanges() {
    const response = await fetch(`${API_URL}/get_range`);
    const data = await response.json();
    setRangeValues(data);
  }

  async function fetchData() {
    try {
      setLoading(true);

      const activeDataset = DATASETS.find(d => d.key === activeGas);

      const value =
        rangeValues[sliderValues[activeGas]];

      const url =
        `${API_URL}/?column_name=${activeDataset.column}` +
        `&filename=${activeDataset.filename}` +
        `&number=${value}`;

      const response = await fetch(url);
      const data = await response.json();

      const transformed = Object.entries(data).map(([key, value]) => ({
        layer: Number(key),
        temperature: Number(value),
      }));

      setChartData(transformed);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRanges();
  }, []);

  useEffect(() => {
    if (rangeValues.length > 0) {
      fetchData();
    }
  }, [rangeValues, sliderValues, activeGas]);

  const visibleLayers = chartData.slice(0, 5).reverse();

  const surfaceTemp = useMemo(() => {
    if (!chartData.length) return 0;
    return chartData[0].temperature.toFixed(1);
  }, [chartData]);

  const activeDataset = DATASETS.find(d => d.key === activeGas);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom, #08111f, #0f2742)",
        color: "white",
        fontFamily: "Arial",
        padding: 20,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 400px",
          gap: 20,
        }}
      >
        {/* LEFT */}
        <div
          style={{
            position: "relative",
            borderRadius: 24,
            overflow: "hidden",
            border: "2px solid rgba(255,255,255,0.15)",
            background: "linear-gradient(to bottom, #0a1b2f, #123b63, #2a6ca3)",
            minHeight: "90vh",
          }}
        >
          {/* SUN */}
          <div
            style={{
              position: "absolute",
              left: 30,
              top: 30,
              fontSize: 110,
              filter: "drop-shadow(0 0 30px orange)",
            }}
          >
            ☀️
          </div>

          {/* ATMOSPHERIC LAYERS */}
          <div
            style={{
              position: "absolute",
              left: 130,
              right: 40,
              top: 90,
              display: "flex",
              flexDirection: "column",
              gap: 50,
            }}
          >
            {visibleLayers.map((item, index) => (
              <div key={index} style={{ position: "relative" }}>
                <div
                  style={{
                    height: 52,
                    borderRadius: 10,
                    background:
                      index === 0
                        ? "#d5ecff"
                        : index === 1
                        ? "#8bc3f5"
                        : index === 2
                        ? "#4c95db"
                        : index === 3
                        ? "#2465a5"
                        : "#0c3e70",
                    border: "2px solid rgba(255,255,255,0.3)",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    right: 30,
                    top: -6,
                    background: "rgba(255,255,255,0.9)",
                    color: "#111",
                    borderRadius: 12,
                    padding: "10px 18px",
                    fontSize: 24,
                    fontWeight: "bold",
                    boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
                  }}
                >
                  T={item.temperature.toFixed(1)}°C
                </div>

                {/* ARROWS (kept exactly as yours) */}
                <div style={{ position: "absolute", left: 120, top: -45, fontSize: 42, color: "#8be9fd" }}>
                  ↑
                </div>
                <div style={{ position: "absolute", left: 260, top: -20, fontSize: 36, color: "#fca5a5" }}>
                  ↓
                </div>
                <div style={{ position: "absolute", left: 400, top: -35, fontSize: 38, color: "#86efac" }}>
                  ↑
                </div>
              </div>
            ))}
          </div>

          {/* TERRAIN */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 220,
              overflow: "hidden",
            }}
          >
            <svg viewBox="0 0 1200 300" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
              <path
                d="M0,180 C120,140 200,220 320,180 C460,120 580,230 720,170 C850,120 980,220 1200,160 L1200,300 L0,300"
                fill="#2d4b28"
              />
              <path
                d="M0,220 C180,180 260,260 420,200 C560,150 720,250 900,190 C1000,160 1100,220 1200,210 L1200,300 L0,300"
                fill="#3d5f35"
              />
            </svg>
          </div>

          {/* SURFACE TEMP */}
          <div
            style={{
              position: "absolute",
              bottom: 180,
              left: 30,
              background: "rgba(255,255,255,0.92)",
              color: "#111",
              padding: "14px 22px",
              borderRadius: 16,
              fontSize: 30,
              fontWeight: "bold",
              boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
            }}
          >
            Surface: {surfaceTemp}°C
          </div>

          {/* CHART BUTTON */}
          <div
            onClick={() => setShowChart(true)}
            style={{
              position: "absolute",
              bottom: 20,
              left: 20,
              right: 20,
              height: 70,
              borderRadius: 20,
              background: "rgba(0,0,0,0.35)",
              border: "1px solid rgba(255,255,255,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Open atmospheric chart
          </div>
        </div>

        {/* RIGHT */}
        <div
          style={{
            borderRadius: 24,
            background: "rgba(255,255,255,0.08)",
            backdropFilter: "blur(12px)",
            padding: 24,
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <h1>Climate Controls</h1>

          {DATASETS.map((dataset) => {
            const isActive = dataset.key === activeGas;

            return (
              <div
                key={dataset.key}
                onClick={() => setActiveGas(dataset.key)}
                style={{
                  cursor: "pointer",
                  background: isActive ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.06)",
                  borderRadius: 18,
                  padding: 20,
                  border: isActive ? `2px solid ${dataset.color}` : "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <b>{dataset.label}</b>
                  <span style={{ color: dataset.color }}>
                    {rangeValues[sliderValues[dataset.key]]}
                  </span>
                </div>

                <input
                  type="range"
                  min={0}
                  max={rangeValues.length - 1}
                  value={sliderValues[dataset.key]}
                  onChange={(e) =>
                    setSliderValues((prev) => ({
                      ...prev,
                      [dataset.key]: Number(e.target.value),
                    }))
                  }
                  style={{ width: "100%", accentColor: dataset.color }}
                />
              </div>
            );
          })}

          <div style={{ textAlign: "center", opacity: 0.8 }}>
            {loading ? "Running simulation..." : "Simulation ready"}
          </div>
        </div>
      </div>

      {/* MODAL CHART */}
      {showChart && (
        <div
          onClick={() => setShowChart(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "85%",
              height: "75%",
              background: "rgba(10,20,40,0.95)",
              borderRadius: 20,
              padding: 20,
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid stroke="#2f4f72" />
                <XAxis dataKey="layer" stroke="#fff" />
                <YAxis stroke="#fff" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="temperature"
                  stroke={activeDataset?.color}
                  strokeWidth={4}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;