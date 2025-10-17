
import React, { useState, useRef, useEffect } from "react";

const defaultMap = "/asu-campus-map.jpg";

export default function App() {
  const [mapSrc, setMapSrc] = useState(defaultMap);
  const [pois, setPois] = useState(() => {
    return [
      { id: 1, x: 20, y: 30, title: "Main Cafeteria", type: "Cafeteria", details: "Open 8:00-17:00" },
      { id: 2, x: 60, y: 25, title: "Gym / Play Room", type: "Playroom", details: "Indoor courts" },
      { id: 3, x: 45, y: 65, title: "Building B - Lecture 201", type: "Lecture", details: "4th floor" },
    ];
  });
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [isAdmin, setIsAdmin] = useState(true);
  const mapRef = useRef(null);

  useEffect(() => {
    const raw = localStorage.getItem("asu_pois");
    if (raw) setPois(JSON.parse(raw));
  }, []);
  useEffect(() => {
    localStorage.setItem("asu_pois", JSON.stringify(pois));
  }, [pois]);

  function handleMapUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setMapSrc(url);
  }

  function addPoiAtPosition(evt) {
    if (!isAdmin) return;
    const rect = mapRef.current.getBoundingClientRect();
    const x = Math.round(((evt.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((evt.clientY - rect.top) / rect.height) * 100);
    const id = Date.now();
    const title = prompt("Name of the location (e.g. Cafeteria A)");
    if (!title) return;
    const type = prompt("Type (Cafeteria, Playroom, Lecture, Other)", "Cafeteria") || "Other";
    const details = prompt("Details (hours, floor, notes)") || "";
    setPois((p) => [...p, { id, x, y, title, type, details }]);
  }

  function removePoi(id) {
    if (!confirm("Remove this point?")) return;
    setPois((p) => p.filter((s) => s.id !== id));
    setSelected(null);
  }

  function updatePoi(updated) {
    setPois((p) => p.map((s) => (s.id === updated.id ? updated : s)));
    setSelected(updated);
  }

  function exportData() {
    const data = { mapSrc, pois };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "asu-wayfinder-data.json";
    a.click();
  }

  function importData(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const obj = JSON.parse(ev.target.result);
        if (obj.pois) setPois(obj.pois);
        if (obj.mapSrc) setMapSrc(obj.mapSrc);
        alert("Imported successfully. If the map is a local file, re-upload it manually.");
      } catch (err) {
        alert("Invalid file");
      }
    };
    reader.readAsText(file);
  }

  const filtered = pois.filter((p) => (filter === "All" ? true : p.type === filter));
  const searched = filtered.filter(
    (p) => p.title.toLowerCase().includes(query.toLowerCase()) || p.details.toLowerCase().includes(query.toLowerCase())
  );

  function findByRoom(room) {
    const found = pois.find((p) => p.title.toLowerCase().includes(room.toLowerCase()));
    if (found) {
      setSelected(found);
      // optionally, scroll or flash marker
    } else {
      alert("No location found for: " + room);
    }
  }

  return (
    <div className="app-root">
      <header className="topbar">
        <div className="brand">
          <img src="/asu-logo.png" alt="ASU logo" className="logo" />
          <div>
            <h1>ASU — Campus Wayfinder</h1>
            <div className="tag">Applied Science University</div>
          </div>
        </div>
        <div className="controls">
          <label className="admin-toggle">Admin
            <input type="checkbox" checked={isAdmin} onChange={(e)=> setIsAdmin(e.target.checked)} />
          </label>
        </div>
      </header>

      <main className="container">
        <section className="map-panel">
          <div className="map-wrapper" onClick={addPoiAtPosition}>
            <img ref={mapRef} src={mapSrc} alt="Campus map" className="map-image" />
            {pois.map((p)=> (
              <button key={p.id} onClick={()=> setSelected(p)} className={"marker" + (selected?.id===p.id ? " selected": "")} style={{ left: p.x + "%", top: p.y + "%" }} title={`${p.title} — ${p.type}`}>
                {p.type[0]}
              </button>
            ))}
          </div>

          <div className="map-actions">
            <input type="file" accept="image/*" onChange={handleMapUpload} title="Upload map image (replace)" />
            <input type="file" accept="application/json" onChange={importData} title="Import points (JSON)" />
            <button onClick={exportData} className="btn primary">Export Data</button>
          </div>
        </section>

        <aside className="side-panel">
          <input value={query} onChange={(e)=> setQuery(e.target.value)} placeholder="Search by name or detail..." className="search" />
          <div className="filters">
            {["All","Cafeteria","Playroom","Lecture","Other"].map((c)=> (
              <button key={c} onClick={()=> setFilter(c)} className={"filter-btn" + (filter===c ? " active": "")}>{c}</button>
            ))}
          </div>

          <div className="list">
            {searched.map((p)=> (
              <div key={p.id} className="list-item">
                <div>
                  <div className="title">{p.title}</div>
                  <div className="meta">{p.type} — {p.details}</div>
                </div>
                <div className="item-actions">
                  <button onClick={()=> setSelected(p)} className="btn">View</button>
                  {isAdmin && <button onClick={()=> removePoi(p.id)} className="btn danger">Delete</button>}
                </div>
              </div>
            ))}
            {searched.length === 0 && <div className="empty">No matches</div>}
          </div>

          <hr />

          <div className="lookup">
            <div className="label">Class / Room lookup</div>
            <div className="lookup-row">
              <input id="roomLookup" placeholder="e.g. Lecture 201" />
              <button onClick={()=> { const v = document.getElementById("roomLookup").value; if (v) findByRoom(v); }} className="btn primary">Find</button>
            </div>
            <div className="note">Tip: keep lecture room names consistent (e.g. "Lecture 201").</div>
          </div>
        </aside>

        {selected && (
          <div className="detail-panel">
            <div className="detail-card">
              <div>
                <h3>{selected.title}</h3>
                <div className="meta">{selected.type} — {selected.details}</div>
                <div className="coords">Coordinates: {selected.x}% , {selected.y}%</div>
              </div>
              <div className="detail-actions">
                <button onClick={()=> setSelected(null)} className="btn">Close</button>
                {isAdmin && <button onClick={()=>{
                  const newTitle = prompt("Edit title:", selected.title) || selected.title;
                  const newType = prompt("Edit type:", selected.type) || selected.type;
                  const newDetails = prompt("Edit details:", selected.details) || selected.details;
                  updatePoi({ ...selected, title: newTitle, type: newType, details: newDetails });
                }} className="btn">Edit</button>}
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="footer">
        Replace the placeholder campus map in /public/asu-campus-map.jpg with your official floorplan image.
      </footer>
    </div>
  );
}
