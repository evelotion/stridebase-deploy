// File: stridebase-app-render/client/src/components/Footer.jsx
import React from "react";
import { Link } from "react-router-dom"; // Gunakan Link

const Footer = () => {
  return (
    <footer className="py-4 bg-white text-center">
      <div className="copyright">
        <p>
          Hak cipta © 2025 StrideBase. Seluruh hak cipta dilindungi
          undang-undang.
        </p>
        <div className="links">
          <Link to="/privacy-policy">Kebijakan Privasi</Link> |
          <Link to="/terms-conditions">Syarat & Ketentuan</Link> |
          <Link to="/legal">Hukum</Link> |<Link to="/sitemap">Peta Situs</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
