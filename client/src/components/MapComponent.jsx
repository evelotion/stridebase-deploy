

import React from "react";

/**
 * Komponen ini berfungsi untuk menampilkan peta lokasi toko.
 * PENTING: Untuk menampilkan peta Google Maps yang sesungguhnya, Anda perlu:
 * 1. Membuat API Key di Google Cloud Platform (aktifkan Maps Embed API).
 * 2. Mengganti 'YOUR_API_KEY' di dalam kode ini dengan API Key Anda.
 */
const MapComponent = ({ lat, lng, storeName }) => {
 
  if (!lat || !lng) {
    return (
      <div
        style={{
          height: "100%",
          backgroundColor: "#e9ecef",
          borderRadius: "0.75rem",
        }}
        className="d-flex align-items-center justify-content-center"
      >
        <p className="text-muted">Koordinat lokasi tidak tersedia.</p>
      </div>
    );
  }

 
 
  const apiKey = import.meta.env.VITE_Maps_API_KEY;

 
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  const embedUrl = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${lat},${lng}`;

  return (
    <div
      style={{
        height: "100%",
        position: "relative",
        borderRadius: "0.75rem",
        overflow: "hidden",
      }}
    >
      {}
      <iframe
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
        src={embedUrl}
        title={`Peta Lokasi ${storeName}`}
      ></iframe>

      {}
      <a
        href={googleMapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-sm btn-dark"
        style={{ position: "absolute", top: "10px", right: "10px", zIndex: 1 }}
      >
        Buka di Peta
      </a>
    </div>
  );
};

export default MapComponent;