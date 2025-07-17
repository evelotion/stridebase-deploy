import React from 'react';

const ContactPage = () => {
  return (
    <div className="container py-5 mt-5">
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold">Hubungi Kami</h1>
        <p className="lead text-muted">Punya pertanyaan atau masukan? Kami siap membantu.</p>
      </div>

      <div className="row g-5">
        <div className="col-lg-6">
          <h4 className="fw-semibold mb-4">Kirim Pesan</h4>
          <form>
            <div className="form-floating mb-3">
              <input type="text" className="form-control" id="name" placeholder="Nama Anda" required />
              <label htmlFor="name">Nama Anda</label>
            </div>
            <div className="form-floating mb-3">
              <input type="email" className="form-control" id="email" placeholder="Alamat Email" required />
              <label htmlFor="email">Alamat Email</label>
            </div>
            <div className="form-floating mb-3">
              <textarea className="form-control" id="message" placeholder="Pesan Anda" style={{ height: '150px' }} required></textarea>
              <label htmlFor="message">Pesan Anda</label>
            </div>
            <button className="btn btn-primary btn-lg" type="submit">Kirim Pesan</button>
          </form>
        </div>
        <div className="col-lg-6">
          <h4 className="fw-semibold mb-4">Informasi Kontak</h4>
          <div className="d-flex mb-3">
            <i className="fas fa-map-marker-alt fa-2x text-primary mt-1"></i>
            <div className="ms-3">
              <h5 className="fw-semibold">Alamat</h5>
              <p className="text-muted">Jl. Jend. Sudirman Kav. 52-53, Jakarta Selatan, DKI Jakarta 12190, Indonesia</p>
            </div>
          </div>
          <div className="d-flex mb-3">
            <i className="fas fa-phone-alt fa-2x text-primary mt-1"></i>
            <div className="ms-3">
              <h5 className="fw-semibold">Telepon</h5>
              <p className="text-muted">(021) 123-4567</p>
            </div>
          </div>
          <div className="d-flex">
            <i className="fas fa-envelope fa-2x text-primary mt-1"></i>
            <div className="ms-3">
              <h5 className="fw-semibold">Email</h5>
              <p className="text-muted">support@stridebase.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;