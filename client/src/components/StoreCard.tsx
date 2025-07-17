import { Link } from "react-router-dom";

// Definisikan tipe untuk objek store
interface Store {
  id: string;
  name: string;
  location: string;
  rating: number;
  servicesAvailable: number;
  images: string[];
  distance?: number; // Tanda '?' berarti properti ini opsional
}

// Definisikan tipe untuk props yang diterima komponen
interface StoreCardProps {
  store: Store;
}

// Terapkan tipe props ke komponen menggunakan sintaks React.FC (Functional Component)
const StoreCard: React.FC<StoreCardProps> = ({ store }) => {
  // Destructuring properti dari objek store
  const { id, name, location, rating, servicesAvailable, images, distance } =
    store;

  return (
    <div className="store-grid__card">
      <div className="store-grid__image-wrapper">
        {/* Gunakan gambar pertama dari array images */}
        <img src={images[0]} className="store-grid__image" alt={name} />
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
          {/* Tampilkan Jarak Jika Ada */}
          {distance !== undefined && (
            <p className="store-grid__distance mb-0">
              <i className="fas fa-road"></i> {distance.toFixed(1)} km
            </p>
          )}
        </div>
        <Link to={`/store/${id}`} className="btn btn-gradient w-100 mt-auto">
          Lihat Detail
        </Link>
      </div>
    </div>
  );
};

export default StoreCard;
