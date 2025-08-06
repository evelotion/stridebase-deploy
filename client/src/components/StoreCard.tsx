import { Link } from "react-router-dom";

interface Store {
  id: string;
  name: string;
  location: string;
  rating: number;
  servicesAvailable: number;
  images: string[];
  distance?: number;
  tier: "PRO" | "BASIC";
}

interface StoreCardProps {
  store: Store;
}

const StoreCard: React.FC<StoreCardProps> = ({ store }) => {
  const { id, name, location, rating, images, tier } = store;

  const imageUrl =
    images && images.length > 0
      ? `${images[0]}`
      : "https://via.placeholder.com/300x180.png?text=No+Image";

  return (
    <Link to={`/store/${id}`} className="store-card-v3 text-decoration-none">
      <div className="store-card-v3__image-wrapper">
        <img
          src={imageUrl}
          className="store-card-v3__image"
          alt={name}
          loading="lazy"
        />
        <div className="store-card-v3__badges">
          {tier === "PRO" && (
            <span className="badge-pro">
              <i className="fas fa-crown"></i> PRO
            </span>
          )}
          <span className="badge-rating">
            <i className="fas fa-star"></i> {rating}
          </span>
        </div>
      </div>
      <div className="store-card-v3__content">
        <h6 className="store-card-v3__title text-truncate">{name}</h6>
        <p className="store-card-v3__location text-truncate">{location}</p>
      </div>
    </Link>
  );
};

export default StoreCard;
