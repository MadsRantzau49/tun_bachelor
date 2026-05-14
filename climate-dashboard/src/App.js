import React, { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";

const API_URL = "http://127.0.0.1:8095";

const DATASETS = [
  { key: "co2", label: "CO2 [ppm]", filename: "T_perf_CO2_Change", column: "CO2factor", color: "#ef4444" },
  { key: "h2o", label: "H2O [%]", filename: "T_perf_HO2_Change", column: "H2Ofactor", color: "#3b82f6" },
  { key: "ch4", label: "CH4 [ppm]", filename: "T_perf_CH4_Change", column: "CH4factor", color: "#22c55e" },
  { key: "n2o", label: "N2O [ppm]", filename: "T_perf_N2O_Change", column: "N2Ofactor", color: "#eab308" },
  { key: "o3", label: "O3 [ppm]", filename: "T_perf_03_Change", column: "O3factor", color: "#a855f7" },
];

// 1. Sharp Block Arrow (Pointy Tip)
const BlockArrow = ({ x, top, height = 35, color = "#1a4b6e", }) => (
  <div style={{ position: "absolute", left: x, top: top, zIndex: 10 }}>
    <svg width="24" height={height} viewBox="0 0 30 40" preserveAspectRatio="none">
      <path d="M 12 40 L 12 12 L 0 12 L 15 0 L 30 12 L 18 12 L 18 40 Z" fill={color} stroke="#000" strokeWidth="1.2" />
    </svg>
  </div>
);

// 2. Sharp Jagged Photon Wave (No smooth curves)
const JaggedWave = ({ x, top, height = 55, color, direction = "up" }) => (
  <div style={{ position: "absolute", left: x, top: top, zIndex: 10 }}>
    <svg width="18" height={height} viewBox="0 0 20 60" preserveAspectRatio="none">
      <polyline
        points={direction === "up" 
          ? "10,60 2,50 18,40 2,30 18,20 2,10 10,0" 
          : "10,0 18,10 2,20 18,30 2,40 18,50 10,60"}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
      />
      <path 
        d={direction === "up" ? "M2,10 L10,0 L18,10" : "M2,50 L10,60 L18,50"} 
        fill="none" stroke={color} strokeWidth="2.5" 
      />
    </svg>
  </div>
);

function App() {
  const [rangeValues, setRangeValues] = useState([]);
  const [sliderValues, setSliderValues] = useState({ co2: 0, h2o: 0, ch4: 0, n2o: 0, o3: 0 });
  const [activeGas, setActiveGas] = useState("co2");
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showChart, setShowChart] = useState(false);

  const activeDataset = DATASETS.find(d => d.key === activeGas) || DATASETS[0];

  // Mathematical Planck Function implementation based on your code
  const generatePlanckPath = () => {
    const T = 288.2;
    const h = 6.62607015e-34;
    const c = 2.99792458e8;
    const kB = 1.380649e-23;
    
    let points = "";
    for (let i = 0; i <= 100; i++) {
      const lam_um = 4 + (i / 100) * 36; // Range 4 to 40 um
      const lam_m = lam_um * 1e-6;
      
      const B_lam = (2 * h * Math.pow(c, 2)) / Math.pow(lam_m, 5) * (1 / (Math.exp((h * c) / (lam_m * kB * T)) - 1));
      const Earth_spectrum = (B_lam * Math.PI) * 1e-6; // W/m^2/um
      
      // Scale for SVG (Width 1000, Height 100)
      const x = i * 10;
      const y = 100 - (Earth_spectrum / 35) * 100; // Normalized peak ~32-35
      points += `${x},${y} `;
    }
    return `M 0,100 ${points} L 1000,100 Z`;
  };

  useEffect(() => {
    fetch(`${API_URL}/get_range`).then(res => res.json()).then(data => setRangeValues(data)).catch(console.error);
  }, []);

  useEffect(() => {
    if (rangeValues.length === 0) return;
    setLoading(true);
    const value = rangeValues[sliderValues[activeGas]];
    fetch(`${API_URL}/?column_name=${activeDataset.column}&filename=${activeDataset.filename}&number=${value}`)
      .then(res => res.json())
      .then(data => {
        setChartData(Object.entries(data).map(([k, v]) => ({ layer: Number(k), temperature: Number(v) })));
      })
      .finally(() => setLoading(false));
  }, [rangeValues, sliderValues, activeGas]);

  const visibleLayers = chartData.slice(0, 4).reverse();
  const surfaceTemp = chartData.length ? chartData[0].temperature.toFixed(1) : "0.0";

  return (
    <div style={{ height: "100vh", background: "white", padding: 10, display: "grid", gridTemplateColumns: "1fr 350px", gap: 10 }}>
      <div style={{ position: "relative", border: "2.5px solid black", overflow: "hidden", background: "#fff" }}>
        
        {/* SUN & SOLAR BEAM */}
        <div style={{ position: "absolute", left: 10, top: 10, zIndex: 15 }}>
          <span style={{ fontSize: 85 }}>☀️</span>
          <svg width="100" height="850" style={{ position: "absolute", top: 90, left: 35 }}>
            <path d="M 5 0 L 40 580 L 55 580 L 20 0 Z" fill="#fff176" stroke="black" strokeWidth="1" />
            <path d="M 48 580 L 85 80" fill="none" stroke="#fff176" strokeWidth="5" />
            <path d="M 78 95 L 85 80 L 92 95" fill="none" stroke="#fff176" strokeWidth="3" />
          </svg>
        </div>

        {/* ATMOSPHERE LAYERS - Large margin from ground */}
        <div style={{ position: "absolute", left: 150, right: 40, bottom: 200, display: "flex", flexDirection: "column" }}>
          {visibleLayers.map((item, index) => (
            <div key={index} style={{ position: "relative", height: 115, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
              <div style={{ position: "absolute", right: -45, top: 75, fontSize: 13, fontWeight: "bold" }}>{[20, 10, 4, 1][index]} km</div>
              <div style={{ height: 40, border: "2px solid black", background: ["#e1f5fe", "#81d4fa", "#29b6f6", "#0288d1"][index], zIndex: 5 }} />
              <div style={{ position: "absolute", right: 10, bottom: 4, border: "2px solid black", background: "white", padding: "2px 8px", fontSize: 26, fontWeight: "bold", zIndex: 20 }}>
                T={item.temperature.toFixed(1)} C°
              </div>
              <BlockArrow x={160} top={30} />
              <JaggedWave x={40} top={10} color="#47158D" />
              <JaggedWave x={240} top={40} color="#1976d2" direction="down" />
              <JaggedWave x={480} top={0} color="#2e7d32" />
              <JaggedWave x={620} top={50} color="#ef6c00" direction="down" />
            </div>
          ))}
        </div>

        {/* PHYSICALLY ACCURATE PLANCK SPECTRUM */}
        <div style={{ position: "absolute", bottom: 25, left: 150, right: 40, height: 130 }}>
          <svg width="100%" height="100%" viewBox="0 0 1000 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="nipy_spectral" x1="0" x2="1">
                <stop offset="0%" stopColor="#4a148c" /><stop offset="20%" stopColor="#311b92" />
                <stop offset="40%" stopColor="#00bcd4" /><stop offset="60%" stopColor="#4caf50" />
                <stop offset="80%" stopColor="#ffeb3b" /><stop offset="100%" stopColor="#b71c1c" />
              </linearGradient>
            </defs>
            <path d={generatePlanckPath()} fill="url(#nipy_spectral)" stroke="black" strokeWidth="2" />
          </svg>
          <div style={{ display: "flex", justifyContent: "space-between", background: "#000", color: "#fff", fontSize: 11, padding: "3px 12px" }}>
            <span>4μm</span><span>10μm</span><span>15μm</span><span>20μm</span><span>25μm</span><span>30μm</span><span>35μm</span><span>40μm</span>
          </div>
          <div style={{ textAlign: "center", fontWeight: "bold", fontSize: 14, marginTop: 5 }}>Wavelength λ [μm]</div>
        </div>

        <div style={{ position: "absolute", bottom: 10, left: 10, border: "2px solid black", background: "#f5f5f5", padding: "6px 15px", fontSize: 24, fontWeight: "bold", zIndex: 25 }}>
          T={surfaceTemp} C°
        </div>
        <button onClick={() => setShowChart(true)} style={{ position: "absolute", bottom: 15, right: 15, zIndex: 30, padding: "5px 12px", fontWeight: "bold", cursor: "pointer" }}>Chart</button>
      </div>

      {/* CONTROLS */}
      <div style={{ border: "2.5px solid black", padding: 20, background: "#fafafa" }}>
        <h2 style={{ marginTop: 0, borderBottom: "2px solid black", paddingBottom: 10 }}>Concentration</h2>
        {DATASETS.map(d => (
          <div key={d.key} style={{ marginBottom: 18, padding: 10, border: activeGas === d.key ? `2.5px solid ${d.color}` : "1.2px solid #ccc", borderRadius: 4, cursor: "pointer", background: "white" }} onClick={() => setActiveGas(d.key)}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: "bold", marginBottom: 8 }}>
              <span>{d.label}</span>
              <span style={{ color: d.color }}>{rangeValues[sliderValues[d.key]] || 0}</span>
            </div>
            <input type="range" min={0} max={(rangeValues.length || 1) - 1} value={sliderValues[d.key]} 
              onChange={e => setSliderValues(v => ({ ...v, [d.key]: Number(e.target.value) }))} style={{ width: "100%", accentColor: d.color }} />
          </div>
        ))}
      </div>

      {/* CHART MODAL */}
      {showChart && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }} onClick={() => setShowChart(false)}>
          <div style={{ background: "white", width: "85%", height: "75%", padding: 25, borderRadius: 12 }} onClick={e => e.stopPropagation()}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="layer" label={{ value: "Altitude Layer", position: "bottom" }} />
                <YAxis label={{ value: "Temp (°C)", angle: -90, position: "insideLeft" }} />
                <Tooltip />
                <Line type="monotone" dataKey="temperature" stroke={activeDataset.color} strokeWidth={4} dot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;