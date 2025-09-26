// File: client/src/components/StoreCard.tsx (Versi Perbaikan Final)

import { Link } from "react-router-dom";

interface Store {
  id: string;
  name: string;
  location: string;
  rating: number;
  services?: { name: string }[]; // Diubah menjadi opsional dengan '?'
  images: string[];
  headerImage?: string;
  distance?: number;
  tier: "PRO" | "BASIC";
}

interface StoreCardProps {
  store: Store;
}

const StoreCard: React.FC<StoreCardProps> = ({ store }) => {
  // --- PERBAIKAN UTAMA DI SINI ---
  // Kita pastikan 'services' adalah array, jika tidak ada, kita anggap sebagai array kosong.
  const {
    id,
    name,
    location,
    rating,
    services = [], // Default ke array kosong jika tidak ada
    images,
    headerImage,
    distance,
    tier,
  } = store;

  const imageUrl =
    headerImage ||
    (images && images.length > 0
      ? images[0]
      : "https://via.placeholder.com/300x180.png?text=No+Image");

  return (
    <Link to={`/store/${id}`} className="text-decoration-none text-dark">
      <div className="store-grid__card h-100">
        {tier === "PRO" && (
          <span
            className="badge bg-warning text-dark position-absolute top-0 end-0 m-2"
            style={{ zIndex: 2 }}
          >
            <i className="fas fa-crown me-1"></i> PRO
          </span>
        )}

        <div className="store-grid__image-wrapper">
          <img
            src={imageUrl}
            className="store-grid__image"
            alt={name}
            loading="lazy"
          />
        </div>
        <div className="store-grid__content">
          <h5 className="store-grid__title">{name}</h5>
          <p className="store-grid__location">
            <i className="fas fa-map-marker-alt"></i> {location}
          </p>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <p className="store-grid__rating mb-0">
              {/* Kode ini sekarang aman karena 'services' dijamin adalah array */}
              <i className="fas fa-star"></i> {rating} | {services.length}{" "}
              layanan
            </p>
            {distance !== undefined && (
              <p className="store-grid__distance mb-0">
                <i className="fas fa-road"></i> {distance.toFixed(1)} km
              </p>
            )}
          </div>
          <div className="btn btn-gradient w-100 mt-auto">Lihat Detail</div>
        </div>
      </div>
    </Link>
  );
};

export default StoreCard;