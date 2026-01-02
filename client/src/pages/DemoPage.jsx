import React, { useState, useEffect } from 'react';
import { Fade, Slide } from "react-awesome-reveal";
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const DemoPage = () => {
  // State untuk peran aktif: 'customer' (biru tema) atau 'partner' (hijau sukses)
  const [activeRole, setActiveRole] = useState('customer'); 
  // State tahapan demo (0-3)
  const [demoStep, setDemoStep] = useState(0);
  // State notifikasi dalam HP
  const [notification, setNotification] = useState(null);

  // Reset tahapan setiap kali ganti peran
  useEffect(() => {
    setDemoStep(0);
    setNotification(null);
  }, [activeRole]);

  // --- LOGIKA SIMULASI CUSTOMER ---
  const handleCustomerAction = () => {
    if (demoStep === 0) {
      setDemoStep(1); // Loading state
      setTimeout(() => {
        setDemoStep(2); // Order Found
        showNotif("Yeay! Mitra 'CleanKicks' menerima pesananmu.");
      }, 1500);
    } else if (demoStep === 2) {
      setDemoStep(3); // Completed state
      showNotif("Sepatu sudah selesai dicuci! Siap diantar.");
    } else {
      setDemoStep(0); // Reset
    }
  };

  // --- LOGIKA SIMULASI PARTNER ---
  const handlePartnerAction = () => {
    if (demoStep === 0) {
      setDemoStep(1); // Order Accepted
      showNotif("Order diterima. Segera jemput sepatu pelanggan.");
    } else if (demoStep === 1) {
      setDemoStep(2); // In Progress
      showNotif("Status diupdate: Sedang Dicuci.");
    } else if (demoStep === 2) {
      setDemoStep(3); // Earnings update
      showNotif("Saldo Dompet bertambah Rp 50.000!");
    } else {
      setDemoStep(0); // Reset
    }
  };

  // Helper untuk menampilkan notifikasi sementara
  const showNotif = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Menentukan warna tema berdasarkan peran aktif
  const themeColor = activeRole === 'customer' ? 'primary' : 'success';

  return (
    // Wrapper utama menggunakan bg-body dan text-body agar adaptif dark/light mode
    <div className="demo-page-wrapper bg-body text-body min-vh-100 d-flex flex-column">
      <Navbar />

      {/* Hero Section - Menggunakan bg-body-tertiary untuk kontras halus */}
      <section className="py-5 text-center bg-body-tertiary border-bottom border-subtle">
        <div className="container py-3">
          <Slide direction="down" triggerOnce>
            <h1 className="display-5 fw-bold mb-3">Interactive Demo</h1>
            <p className="lead text-muted col-lg-8 mx-auto">
              Rasakan pengalaman StrideBase dari dua sisi: kemudahan sebagai Pelanggan atau kontrol penuh sebagai Mitra Toko.
            </p>
          </Slide>
        </div>
      </section>

      <div className="container my-5 flex-grow-1">
        {/* Role Switcher - Desain Tabs Modern */}
        <div className="d-flex justify-content-center mb-5">
          <div className="p-1 bg-body-tertiary rounded-pill border border-subtle shadow-sm d-inline-flex align-items-center">
            <button
              type="button"
              className={`btn rounded-pill px-4 fw-medium transition-all ${activeRole === 'customer' ? 'btn-primary shadow' : 'text-muted hover-bg-subtle'}`}
              onClick={() => setActiveRole('customer')}
              style={{ minWidth: '160px' }}
            >
              👤 Pelanggan
            </button>
            <button
              type="button"
              className={`btn rounded-pill px-4 fw-medium transition-all ms-1 ${activeRole === 'partner' ? 'btn-success shadow' : 'text-muted hover-bg-subtle'}`}
              onClick={() => setActiveRole('partner')}
              style={{ minWidth: '160px' }}
            >
              🏪 Mitra Toko
            </button>
          </div>
        </div>

        <div className="row justify-content-center align-items-center g-5">
          {/* Teks Penjelasan (Kiri) */}
          <div className="col-lg-5 order-2 order-lg-1 text-center text-lg-start">
             <Fade triggerOnce>
                <span className={`badge bg-${themeColor}-subtle text-${themeColor} mb-3 px-3 py-2 rounded-pill`}>
                    Mode {activeRole === 'customer' ? 'Pelanggan' : 'Mitra Bisnis'}
                </span>
                <h2 className="fw-bold mb-3 display-6">
                  {activeRole === 'customer' ? 'Booking & Tracking Mudah' : 'Kelola Operasional Toko'}
                </h2>
                <p className="text-muted lead fs-6">
                  {activeRole === 'customer' 
                    ? 'Simulasi alur pemesanan: Pilih layanan, pantau status real-time, hingga sepatu kembali bersih di tanganmu.' 
                    : 'Simulasi alur mitra: Terima pesanan masuk, update progress pengerjaan, dan pantau pendapatan secara instan.'}
                </p>
                
                <hr className="my-4 border-subtle mx-auto mx-lg-0" style={{maxWidth: '100px'}} />

                <ul className="list-unstyled mt-4 d-inline-block text-start">
                  <li className="mb-3 d-flex align-items-center">
                    <span className={`badge bg-${themeColor} me-3 p-1 rounded-circle`}><i className="bi bi-check"></i></span> 
                    {activeRole === 'customer' ? 'Antarmuka yang bersih & intuitif' : 'Notifikasi order real-time'}
                  </li>
                  <li className="mb-3 d-flex align-items-center">
                    <span className={`badge bg-${themeColor} me-3 p-1 rounded-circle`}><i className="bi bi-check"></i></span> 
                    {activeRole === 'customer' ? 'Transparansi status pengerjaan' : 'Manajemen status satu klik'}
                  </li>
                  <li className="mb-3 d-flex align-items-center">
                    <span className={`badge bg-${themeColor} me-3 p-1 rounded-circle`}><i className="bi bi-check"></i></span> 
                    {activeRole === 'customer' ? 'Jaminan kepuasan layanan' : 'Tracking pendapatan otomatis'}
                  </li>
                </ul>
                <div className="mt-4 p-3 bg-body-tertiary rounded-3 border border-subtle fst-italic text-muted small">
                    <i className="bi bi-info-circle me-2"></i> Silakan berinteraksi dengan tombol di layar simulasi HP.
                </div>
             </Fade>
          </div>

          {/* Phone Simulator (Kanan) */}
          <div className="col-lg-4 order-1 order-lg-2 mb-4 mb-lg-0">
            {/* Mockup Frame */}
            <div className="phone-mockup shadow-lg mx-auto bg-black" style={{
              maxWidth: '340px', 
              borderRadius: '45px', 
              padding: '10px', // Bezel
              height: '650px', 
            }}>
              {/* Layar Dalam */}
              <div className="bg-body h-100 w-100 overflow-hidden position-relative d-flex flex-column" style={{borderRadius: '35px'}}>
                
                {/* Dynamic Notification Popup */}
                {notification && (
                  <div className="position-absolute top-0 start-50 translate-middle-x w-75 p-2" style={{zIndex: 20, marginTop: '40px'}}>
                     <div className={`alert alert-${themeColor} shadow py-2 px-3 m-0 small rounded-3 text-center fade show border-0 fw-medium`}>
                        {notification}
                     </div>
                  </div>
                )}

                {/* Status Bar (Palsu) */}
                <div className={`px-4 py-2 text-white d-flex justify-content-between align-items-center bg-${themeColor}`} style={{paddingTop: '15px'}}>
                  <span className="small fw-medium">9:41</span>
                  <div style={{width: '100px', height:'18px', background:'rgba(0,0,0,0.2)', borderRadius:'10px'}}></div> {/* Notch placeholder */}
                  <span className="small"><i className="bi bi-wifi me-1"></i> 100%</span>
                </div>

                {/* App Header */}
                <div className={`p-3 text-white text-center bg-${themeColor} shadow-sm`}>
                   <h6 className="m-0 fw-bold">{activeRole === 'customer' ? 'StrideBase' : 'Dashboard Mitra'}</h6>
                </div>

                {/* App Body Content */}
                <div className="flex-grow-1 p-3 d-flex flex-column justify-content-center align-items-center text-center bg-body-tertiary">
                  
                  {/* --- TAMPILAN CUSTOMER --- */}
                  {activeRole === 'customer' && (
                    <>
                      {demoStep === 0 && (
                        <Fade key="cust-step-0">
                          <div className="text-start w-100 mb-3">
                            <h6 className="fw-bold mb-2">Pilih Layanan</h6>
                            {/* Meniru ServiceCard Stridebase */}
                            <div className="card border-0 shadow-sm bg-body rounded-3 overflow-hidden">
                              <div className="row g-0">
                                <div className="col-4 bg-secondary-subtle d-flex align-items-center justify-content-center">
                                  <span style={{fontSize: '2.5rem'}}>👟</span>
                                </div>
                                <div className="col-8">
                                  <div className="card-body p-2">
                                    <h6 className="card-title mb-1 fw-bold">Deep Clean</h6>
                                    <p className="card-text small text-muted mb-1">Perawatan menyeluruh untuk sepatu kotor.</p>
                                    <p className="card-text fw-bold text-primary mb-0">Rp 35.000</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <button onClick={handleCustomerAction} className="btn btn-primary w-100 rounded-pill py-2 fw-bold shadow-sm mt-auto">
                            Booking Sekarang <i className="bi bi-arrow-right ms-2"></i>
                          </button>
                        </Fade>
                      )}

                      {demoStep === 1 && (
                        <div className="text-primary" role="status">
                            <div className="spinner-border mb-2" style={{width: '3rem', height: '3rem'}}></div>
                            <p className="fw-medium">Mencari mitra terdekat...</p>
                        </div>
                      )}

                      {demoStep === 2 && (
                         <Fade key="cust-step-2" className="w-100">
                           <div className="card bg-body border-0 shadow-sm p-3 rounded-3 text-start">
                             <div className="d-flex align-items-center mb-3">
                                <div className="bg-success-subtle text-success rounded-circle p-2 me-3">
                                    <i className="bi bi-shop fs-4"></i>
                                </div>
                                <div>
                                    <h6 className="fw-bold mb-0 text-success">Order Dikonfirmasi!</h6>
                                    <small className="text-muted">Dilayani oleh: <strong>CleanKicks JKT</strong></small>
                                </div>
                             </div>
                             
                             <div className="vstack gap-3 mt-2">
                                <div>
                                    <div className="d-flex justify-content-between small mb-1">
                                        <span className="fw-medium">Status:</span>
                                        <span className="badge bg-warning text-dark">Dijemput Kurir</span>
                                    </div>
                                    <div className="progress" style={{height: '8px'}}>
                                        <div className="progress-bar progress-bar-striped progress-bar-animated bg-warning" style={{width: '30%'}}></div>
                                    </div>
                                </div>
                             </div>

                             <button onClick={handleCustomerAction} className="btn btn-outline-primary w-100 rounded-pill mt-4">
                               Simulasi Selesai
                             </button>
                           </div>
                         </Fade>
                      )}

                      {demoStep === 3 && (
                        <Fade key="cust-step-3">
                          <div className="text-center">
                            <div className="mb-3 text-primary" style={{fontSize: '4rem'}}>✨</div>
                            <h5 className="fw-bold">Sepatu Kinclong!</h5>
                            <p className="text-muted mb-4">Pesanan #ORD-123 telah selesai dan sedang diantar kembali.</p>
                            <button onClick={handleCustomerAction} className="btn btn-primary rounded-pill px-4">Order Lagi</button>
                          </div>
                        </Fade>
                      )}
                    </>
                  )}

                  {/* --- TAMPILAN PARTNER --- */}
                  {activeRole === 'partner' && (
                    <>
                       {demoStep === 0 && (
                        <Fade key="part-step-0" className="w-100">
                          {/* Meniru Widget Dashboard */}
                          <div className="card border-0 shadow-sm bg-body rounded-3 text-start mb-3">
                             <div className="card-body p-3">
                                <h6 className="text-muted small mb-2 text-uppercase fw-bold">Ringkasan Hari Ini</h6>
                                <h3 className="fw-bold mb-0">Rp 150.000</h3>
                                <small className="text-success"><i className="bi bi-graph-up-arrow"></i> 3 Order Selesai</small>
                             </div>
                          </div>

                          <div className="card border-warning-subtle shadow-sm bg-warning-subtle rounded-3 text-start">
                            <div className="card-body p-3">
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <h6 className="fw-bold text-dark mb-0">⚡ Order Baru Masuk</h6>
                                <span className="badge bg-warning text-dark">Pending</span>
                              </div>
                              <p className="small mb-1 fw-medium">Air Jordan 1 High • Deep Clean</p>
                              <p className="small text-muted mb-3"><i className="bi bi-geo-alt"></i> 1.2 km dari toko</p>
                              <div className="d-grid gap-2 d-flex">
                                <button className="btn btn-outline-danger btn-sm flex-fill rounded-pill">Tolak</button>
                                <button onClick={handlePartnerAction} className="btn btn-success btn-sm flex-fill fw-bold rounded-pill">Terima</button>
                              </div>
                            </div>
                          </div>
                        </Fade>
                       )}

                       {demoStep === 1 && (
                         <Fade key="part-step-1" className="w-100">
                           <div className="card border-0 shadow-sm bg-body rounded-3 text-start p-3">
                             <div className="d-flex justify-content-between mb-3">
                                  <span className="small fw-bold text-muted">#ORD-2025</span>
                                  <span className="badge bg-info text-dark">Dijemput</span>
                             </div>
                             <h6 className="fw-bold">Proses Pesanan</h6>
                             <p className="small text-muted">Sepatu sedang dalam perjalanan ke tokomu.</p>
                             <hr className="border-subtle"/>
                             <button onClick={handlePartnerAction} className="btn btn-primary w-100 btn-sm rounded-pill">
                               Update Status: Sedang Dicuci <i className="bi bi-arrow-right"></i>
                             </button>
                           </div>
                         </Fade>
                       )}

                       {demoStep === 2 && (
                         <Fade key="part-step-2">
                            <div className="text-success mb-3" role="status">
                                <div className="spinner-grow" style={{width: '2rem', height: '2rem'}}></div>
                            </div>
                            <h6 className="fw-bold">Sedang Dicuci...</h6>
                            <p className="small text-muted mb-4">Simulasi pengerjaan sepatu.</p>
                            <button onClick={handlePartnerAction} className="btn btn-success w-100 rounded-pill shadow-sm">
                               Selesaikan Order & Terima Uang
                            </button>
                         </Fade>
                       )}

                        {demoStep === 3 && (
                         <Fade key="part-step-3" className="w-100">
                            <div className="card bg-success text-white p-4 rounded-3 shadow w-100 border-0 mb-3 text-start">
                               <div className="d-flex align-items-center mb-3">
                                  <div className="bg-white bg-opacity-25 p-2 rounded-circle me-3">
                                    <i className="bi bi-wallet2 fs-4"></i>
                                  </div>
                                  <h6 className="mb-0 fw-medium">Pembayaran Diterima</h6>
                               </div>
                               <h2 className="fw-bold my-2">Rp 35.000</h2>
                               <p className="small mb-0 text-white-50 fw-medium">Komisi dari order #ORD-2025 telah masuk ke dompet.</p>
                            </div>
                            <button onClick={handlePartnerAction} className="btn btn-outline-success rounded-pill mt-auto">Reset Demo</button>
                         </Fade>
                       )}
                    </>
                  )}

                </div>

                {/* App Bottom Nav (Palsu) */}
                <div className="bg-body border-top border-subtle p-2 d-flex justify-content-around align-items-center" style={{height: '60px'}}>
                  <div className={`text-${themeColor} fs-4`}><i className="bi bi-house-door-fill"></i></div>
                  <div className="text-muted fs-4 opacity-50"><i className="bi bi-search"></i></div>
                  <div className="text-muted fs-4 opacity-50"><i className="bi bi-person"></i></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DemoPage;