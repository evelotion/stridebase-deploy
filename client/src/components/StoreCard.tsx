import { Link } from "react-router-dom";
import API_BASE_URL from "../apiConfig";

// Interface diperbarui untuk menyertakan headerImage
interface Store {
  id: string;
  name: string;
  location: string;
  rating: number;
  servicesAvailable: number;
  images: string[];
  headerImage?: string; // <-- PERUBAHAN DI SINI
  distance?: number;
  tier: "PRO" | "BASIC";
}

interface StoreCardProps {
  store: Store;
}

const StoreCard: React.FC<StoreCardProps> = ({ store }) => {
  const {
    id,
    name,
    location,
    rating,
    servicesAvailable,
    images,
    headerImage, // <-- PERUBAHAN DI SINI
    distance,
    tier,
  } = store;

  // --- LOGIKA GAMBAR DIPERBAIKI DI SINI ---
  // Prioritaskan headerImage. Jika tidak ada, baru gunakan gambar pertama dari galeri.
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
            src={imageUrl} // Variabel imageUrl yang baru sekarang digunakan di sini
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
              <i className="fas fa-star"></i> {rating} | {servicesAvailable}{" "}
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
