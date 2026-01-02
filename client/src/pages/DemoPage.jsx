import React, { useState, useEffect } from 'react';
import { Fade, Slide } from "react-awesome-reveal";
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const DemoPage = () => {
  const [activeRole, setActiveRole] = useState('customer'); // 'customer' or 'partner'
  const [demoStep, setDemoStep] = useState(0);
  const [notification, setNotification] = useState(null);

  // Reset step ketika ganti role
  useEffect(() => {
    setDemoStep(0);
    setNotification(null);
  }, [activeRole]);

  // Simulasi Flow Customer
  const handleCustomerAction = () => {
    if (demoStep === 0) {
      setDemoStep(1); // Processing
      setTimeout(() => {
        setDemoStep(2); // Found Store
        showNotif("Yeay! Mitra 'CleanKicks' menerima pesananmu.");
      }, 1500);
    } else if (demoStep === 2) {
      setDemoStep(3); // Completed
      showNotif("Sepatu sudah selesai dicuci! Siap diantar.");
    } else {
      setDemoStep(0); // Reset
    }
  };

  // Simulasi Flow Partner
  const handlePartnerAction = () => {
    if (demoStep === 0) {
      setDemoStep(1); // Accept Order
      showNotif("Order diterima. Segera jemput sepatu pelanggan.");
    } else if (demoStep === 1) {
      setDemoStep(2); // In Progress
      showNotif("Status diupdate: Sedang Dicuci.");
    } else if (demoStep === 2) {
      setDemoStep(3); // Money In
      showNotif("Saldo Dompet bertambah Rp 50.000!");
    } else {
      setDemoStep(0); // Reset
    }
  };

  const showNotif = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="demo-page-wrapper bg-light min-vh-100 d-flex flex-column">
      <Navbar />

      {/* Hero Section */}
      <section className="py-5 text-center bg-primary text-white">
        <div className="container">
          <Slide direction="down">
            <h1 className="display-4 fw-bold">StrideBase Interactive Demo</h1>
            <p className="lead">Rasakan pengalaman menjadi Pelanggan atau Mitra Toko dalam hitungan detik.</p>
          </Slide>
        </div>
      </section>

      {/* Toggle Role Switcher */}
      <div className="container my-5">
        <div className="d-flex justify-content-center mb-5">
          <div className="btn-group shadow-sm" role="group">
            <button
              type="button"
              className={`btn px-4 py-2 ${activeRole === 'customer' ? 'btn-dark' : 'btn-outline-dark'}`}
              onClick={() => setActiveRole('customer')}
            >
              👤 Mode Pelanggan
            </button>
            <button
              type="button"
              className={`btn px-4 py-2 ${activeRole === 'partner' ? 'btn-success' : 'btn-outline-success'}`}
              onClick={() => setActiveRole('partner')}
            >
              🏪 Mode Mitra Toko
            </button>
          </div>
        </div>

        {/* Interactive Phone Screen */}
        <div className="row justify-content-center align-items-center">
          <div className="col-md-5 mb-4">
             <Fade triggerOnce>
              <div className="text-start">
                <h2 className="fw-bold mb-3">
                  {activeRole === 'customer' ? 'Booking Semudah Satu Klik' : 'Kelola Bisnis Laundry-mu'}
                </h2>
                <p className="text-muted">
                  {activeRole === 'customer' 
                    ? 'Pilih layanan, lihat estimasi harga, dan pantau proses pengerjaan sepatu kesayanganmu secara real-time.' 
                    : 'Terima order masuk, update status pengerjaan, dan pantau pendapatan harianmu langsung dari dashboard.'}
                </p>
                <ul className="list-unstyled mt-4">
                  <li className="mb-2">✅ {activeRole === 'customer' ? 'Real-time Tracking' : 'Manajemen Order Instan'}</li>
                  <li className="mb-2">✅ {activeRole === 'customer' ? 'Pembayaran Cashless (QRIS/E-Wallet)' : 'Withdraw Saldo Kapan Saja'}</li>
                  <li className="mb-2">✅ {activeRole === 'customer' ? 'Garansi Cuci Ulang' : 'Laporan Keuangan Otomatis'}</li>
                </ul>
                <div className="mt-4">
                    <p className="small text-muted fst-italic">👇 Coba klik tombol di layar simulasi di samping/bawah ini.</p>
                </div>
              </div>
             </Fade>
          </div>

          {/* The Phone Simulator */}
          <div className="col-md-4">
            <div className="phone-mockup shadow-lg mx-auto" style={{
              maxWidth: '320px', 
              borderRadius: '30px', 
              border: '8px solid #333', 
              height: '600px', 
              background: '#fff', 
              position: 'relative', 
              overflow: 'hidden'
            }}>
              
              {/* Notif Popup */}
              {notification && (
                <div className="position-absolute top-0 start-0 w-100 p-2" style={{zIndex: 10}}>
                   <div className="alert alert-success shadow-sm py-2 px-3 m-0 small rounded-pill fade show">
                      🔔 {notification}
                   </div>
                </div>
              )}

              {/* SCREEN CONTENT */}
              <div className="d-flex flex-column h-100">
                {/* Screen Header */}
                <div className="p-3 text-white d-flex justify-content-between align-items-center" 
                     style={{backgroundColor: activeRole === 'customer' ? '#2563eb' : '#166534'}}>
                  <span className="small fw-bold">9:41</span>
                  <span className="small fw-bold">{activeRole === 'customer' ? 'StrideBase App' : 'Partner Dashboard'}</span>
                  <span className="small">🔋 100%</span>
                </div>

                {/* Screen Body - Dynamic */}
                <div className="flex-grow-1 p-3 bg-light d-flex flex-column justify-content-center align-items-center text-center">
                  
                  {/* --- CUSTOMER VIEW --- */}
                  {activeRole === 'customer' && (
                    <>
                      {demoStep === 0 && (
                        <Fade>
                          <div className="card w-100 mb-3 border-0 shadow-sm">
                            <div className="card-body p-2">
                              <img src="https://via.placeholder.com/100x60?text=Sneakers" alt="Shoe" className="img-fluid rounded mb-2"/>
                              <h6 className="mb-1">Deep Clean</h6>
                              <p className="small text-muted mb-0">Rp 35.000 • 2 Hari</p>
                            </div>
                          </div>
                          <button onClick={handleCustomerAction} className="btn btn-primary w-100 rounded-pill shadow-sm">
                            Booking Sekarang
                          </button>
                        </Fade>
                      )}

                      {demoStep === 1 && (
                        <div className="spinner-border text-primary mb-3" role="status"></div>
                      )}

                      {demoStep === 2 && (
                         <Fade>
                           <div className="bg-white p-3 rounded shadow-sm w-100">
                             <h6 className="fw-bold text-success">Order Dikonfirmasi!</h6>
                             <div className="progress my-3" style={{height: '8px'}}>
                               <div className="progress-bar bg-success" style={{width: '30%'}}></div>
                             </div>
                             <p className="small text-muted">Sepatumu sedang dijemput kurir.</p>
                             <button onClick={handleCustomerAction} className="btn btn-sm btn-outline-primary mt-2">
                               Cek Status Selesai
                             </button>
                           </div>
                         </Fade>
                      )}

                      {demoStep === 3 && (
                        <Fade>
                          <div className="text-center">
                            <div className="display-1 mb-2">✨</div>
                            <h5 className="fw-bold">Sepatu Kinclong!</h5>
                            <p className="small text-muted">Terima kasih telah menggunakan StrideBase.</p>
                            <button onClick={handleCustomerAction} className="btn btn-sm btn-link text-decoration-none">Order Lagi</button>
                          </div>
                        </Fade>
                      )}
                    </>
                  )}

                  {/* --- PARTNER VIEW --- */}
                  {activeRole === 'partner' && (
                    <>
                       {demoStep === 0 && (
                        <Fade>
                          <div className="card w-100 border-warning border-2 shadow-sm">
                            <div className="card-body">
                              <h6 className="fw-bold text-warning mb-1">⚡ Order Baru Masuk</h6>
                              <p className="small mb-2">Air Jordan 1 • Deep Clean</p>
                              <div className="d-grid gap-2">
                                <button onClick={handlePartnerAction} className="btn btn-success btn-sm">Terima Order</button>
                                <button className="btn btn-outline-danger btn-sm">Tolak</button>
                              </div>
                            </div>
                          </div>
                        </Fade>
                       )}

                       {demoStep === 1 && (
                         <Fade>
                           <div className="w-100">
                             <div className="card p-3 mb-2 shadow-sm">
                               <div className="d-flex justify-content-between">
                                  <span className="small fw-bold">#ORD-2025</span>
                                  <span className="badge bg-primary">Dijemput</span>
                               </div>
                             </div>
                             <button onClick={handlePartnerAction} className="btn btn-dark w-100 btn-sm">
                               Update Status: Sedang Dicuci
                             </button>
                           </div>
                         </Fade>
                       )}

                       {demoStep === 2 && (
                         <Fade>
                            <div className="spinner-grow text-success mb-3" role="status"></div>
                            <p className="small text-muted">Sedang mencuci sepatu...</p>
                            <button onClick={handlePartnerAction} className="btn btn-success w-100 btn-sm mt-3">
                               Selesaikan Pekerjaan
                            </button>
                         </Fade>
                       )}

                        {demoStep === 3 && (
                         <Fade>
                            <div className="bg-success text-white p-4 rounded-3 shadow w-100">
                               <h6 className="mb-0">Total Pendapatan</h6>
                               <h2 className="fw-bold my-2">Rp 50.000</h2>
                               <p className="small mb-0 text-white-50">+ dari order #ORD-2025</p>
                            </div>
                            <button onClick={handlePartnerAction} className="btn btn-link text-muted mt-3 btn-sm">Reset Demo</button>
                         </Fade>
                       )}
                    </>
                  )}

                </div>

                {/* Screen Bottom Nav */}
                <div className="bg-white border-top p-2 d-flex justify-content-around">
                  <div className="text-muted"><small>🏠</small></div>
                  <div className="text-muted"><small>🔍</small></div>
                  <div className="text-primary"><small>👤</small></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <section className="bg-dark text-white py-5 mt-auto">
        <div className="container text-center">
          <h2 className="mb-4">Tertarik bergabung dengan ekosistem StrideBase?</h2>
          <div className="d-flex justify-content-center gap-3">
             <Link to="/register" className="btn btn-primary btn-lg">Daftar Sekarang</Link>
             <Link to="/contact" className="btn btn-outline-light btn-lg">Hubungi Sales</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default DemoPage;