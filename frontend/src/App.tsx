import { useState, useEffect } from "react";

function App() {
  const [backendStatus, setBackendStatus] = useState<string>(
    "Checking backend...",
  );

  useEffect(() => {
    fetch("http://localhost:8000/api/health")
      .then((res) => res.json())
      .then((data) => setBackendStatus(data.message))
      .catch(() =>
        setBackendStatus("❌ Cannot reach backend (is it running?)"),
      );
  }, []);

  return (
    <div
      style={{ padding: "40px", fontFamily: "system-ui", textAlign: "center" }}
    >
      <h1 style={{ fontSize: "3rem", color: "#22c55e" }}>🌍 LinguaEvo</h1>
      <p style={{ fontSize: "1.5rem", margin: "20px 0" }}>
        The Evolutionary Language Simulator
      </p>
      <div
        style={{
          margin: "30px auto",
          padding: "20px",
          background: "#1f2937",
          color: "#fff",
          borderRadius: "12px",
          maxWidth: "600px",
        }}
      >
        <strong>Backend status:</strong>
        <br />
        {backendStatus}
      </div>
      <p style={{ color: "#64748b" }}>
        Backend running on port 8000
        <br />
        Frontend running on port 5173
      </p>
      <p style={{ marginTop: "40px", fontSize: "1.1rem" }}>
        🎉 Project skeleton is ready!
        <br />
        Next step: Proto-Language Creator
      </p>
    </div>
  );
}

export default App;
