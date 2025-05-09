import React, { useState } from "react";

import "./AnalysisDisplay.css";


interface EngineDetail {
  method: string;
  engine_name: string;
  engine_version: string;
  engine_update: string;
  category: string;
  result: string | null;
}

interface AnalysisData {
  data: {
    attributes: {
      stats: {
        malicious: number;
        suspicious: number;
        undetected: number;
        harmless: number;
        timeout: number;
        "confirmed-timeout": number;
        failure: number;
        "type-unsupported": number;
      };
      results: Record<string, EngineDetail>;
    };
  };
}

interface AnalysisProps {
  analysis?: Partial<AnalysisData>;
}

const labelColors: Record<string, string> = {
  malicious: "#e53935",
  suspicious: "#fb8c00",
  undetected: "#1e88e5",
  harmless: "#43a047",
  timeout: "#8e24aa",
  "confirmed-timeout": "#6d4c41",
  failure: "#757575",
  "type-unsupported": "#fdd835",
};

const allLabels = [
  "malicious",
  "suspicious",
  "undetected",
  "harmless",
  "timeout",
  "confirmed-timeout",
  "failure",
  "type-unsupported",
];

const AnalysisDisplay: React.FC<AnalysisProps> = ({ analysis }) => {
  const [showDetails, setShowDetails] = useState(false);

  const results = (analysis?.data?.attributes?.results ?? {}) as Record<string, EngineDetail>;
  const stats = analysis.data?.attributes?.stats ?? {};

  return (
    <div className="analysis-card">
      <h2>Analysis Results</h2>
      <div className="analysis-grid">
        {allLabels.map((label) => (
          <div className="analysis-item" key={label}>
            <span
              className="color-dot"
              style={{ backgroundColor: labelColors[label] || "#999" }}
            />
            <span className="label">{label}</span>
            <span className="value">{stats[label] ?? 0}</span>
          </div>
        ))}

      </div>

      {Object.keys(results).length > 0 && (
        <>
          <button className="toggle-button" onClick={() => setShowDetails((prev) => !prev)}>
            {showDetails ? "Hide Engine Details" : "Show Engine Details"}
          </button>

          {showDetails && (
            <div className="engine-details">
              <h3>Engine Scan Results</h3>
              {Object.entries(results).map(([engine, detail]) => (
                <div className="engine-item" key={engine}>
                  <strong>{engine}</strong> —{" "}
                  <span className={`category ${detail.category}`}>
                    {detail.category}
                  </span>
                  <div className="engine-meta">
                    Version: {detail.engine_version || "N/A"} | Updated: {detail.engine_update || "N/A"}
                  </div>
                  <div className="engine-result">
                    Result: {detail.result ?? "None"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AnalysisDisplay;
