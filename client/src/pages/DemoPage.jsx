import React, { useState, useEffect } from 'react';
import { Fade, Slide, Zoom } from "react-awesome-reveal";
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

  // --- LOGIKA SIMULASI CUSTOMER ---
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

  // --- LOGIKA SIMULASI PARTNER ---
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

  // Variabel Warna Dinamis (Sesuai Role)
  const roleColor = activeRole === 'customer' ? '#3b82f6' : '#10b981'; // Biru vs Hijau
  const roleLightColor = activeRole === 'customer' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)';

  return (
    <div 
      className="demo-page-wrapper"
      style={{ 
        backgroundColor: 'var(--sb-bg-primary)', 
        color: 'var(--sb-text-main)',
        minHeight: '100vh',
        paddingTop: '120px', // FIX: Padding agar tidak ketutup Navbar Fixed
        paddingBottom: '80px',
        transition: 'background-color 0.3s, color 0.3s'
      }}
    >
      <Navbar />

      <div className="container">
        
        {/* 1. Header Section */}
        <div className="text-center mb-5">
          <Slide direction="down" triggerOnce>
            <span 
              className="badge px-3 py-2 rounded-pill mb-3"
              style={{ backgroundColor: roleLightColor, color: roleColor, border: `1px solid ${roleColor}` }}
            >
              Interactive Showcase
            </span>
            <h1 className="fw-bold display-4 mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Coba Sebelum Daftar
            </h1>
            <p className="lead mx-auto" style={{ maxWidth: '600px', color: 'var(--sb-text-muted)' }}>
              Simulasi interaktif bagaimana <span style={{color: 'var(--sb-accent)'}}>StrideBase</span> bekerja untuk Pelanggan dan Mitra Toko.
            </p>
          </Slide>
        </div>

        {/* 2. Role Switcher (Toggle) */}
        <div className="d-flex justify-content-center mb-5">
          <div 
            className="p-1 rounded-pill d-inline-flex position-relative"
            style={{ 
              backgroundColor: 'var(--sb-card-bg)', 
              border: '1px solid var(--sb-card-border)',
              boxShadow: 'var(--sb-card-shadow)'
            }}
          >
            <button
              onClick={() => setActiveRole('customer')}
              className="btn rounded-pill px-4 py-2 fw-bold position-relative z-1"
              style={{ 
                color: activeRole === 'customer' ? '#fff' : 'var(--sb-text-muted)',
                backgroundColor: activeRole === 'customer' ? '#3b82f6' : 'transparent',
                transition: 'all 0.3s'
              }}
            >
              👤 Mode Pelanggan
            </button>
            <button
              onClick={() => setActiveRole('partner')}
              className="btn rounded-pill px-4 py-2 fw-bold position-relative z-1"
              style={{ 
                color: activeRole === 'partner' ? '#fff' : 'var(--sb-text-muted)',
                backgroundColor: activeRole === 'partner' ? '#10b981' : 'transparent',
                transition: 'all 0.3s'
              }}
            >
              🏪 Mode Mitra
            </button>
          </div>
        </div>

        {/* 3. Main Interactive Area */}
        <div className="row align-items-center g-5">
          
          {/* KIRI: Deskripsi Langkah */}
          <div className="col-lg-6 order-2 order-lg-1">
            <Fade key={activeRole} triggerOnce>
              <div 
                className="p-4 rounded-4"
                style={{ 
                  backgroundColor: 'var(--sb-card-bg)', 
                  border: '1px solid var(--sb-card-border)',
                  boxShadow: 'var(--sb-card-shadow)'
                }}
              >
                <h3 className="fw-bold mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {activeRole === 'customer' ? 'Pengalaman Booking Mulus' : 'Manajemen Order Cerdas'}
                </h3>
                
                <ul className="list-unstyled">
                  {[
                    activeRole === 'customer' ? 'Pilih layanan & metode bayar' : 'Terima notifikasi order masuk',
                    activeRole === 'customer' ? 'Pantau status pengerjaan real-time' : 'Update progres dengan satu klik',
                    activeRole === 'customer' ? 'Terima sepatu bersih & beri rating' : 'Terima pembayaran otomatis ke dompet'
                  ].map((text, idx) => (
                    <li key={idx} className="d-flex align-items-center mb-3">
                      <div 
                        className="rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0"
                        style={{ 
                          width: '32px', height: '32px', 
                          backgroundColor: demoStep >= idx ? roleColor : 'var(--sb-card-border)',
                          color: '#fff',
                          transition: 'all 0.3s'
                        }}
                      >
                        {idx + 1}
                      </div>
                      <span style={{ 
                        color: demoStep >= idx ? 'var(--sb-text-main)' : 'var(--sb-text-muted)',
                        textDecoration: demoStep > idx ? 'line-through' : 'none'
                      }}>
                        {text}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 p-3 rounded-3" style={{ backgroundColor: roleLightColor, borderLeft: `4px solid ${roleColor}` }}>
                  <small style={{ color: 'var(--sb-text-main)' }}>
                    <i className="fas fa-info-circle me-2"></i>
                    Silakan klik tombol pada <strong>Layar HP</strong> di samping untuk menjalankan simulasi.
                  </small>
                </div>
              </div>
            </Fade>
          </div>

          {/* KANAN: Phone Simulator */}
          <div className="col-lg-6 order-1 order-lg-2 d-flex justify-content-center">
            <div 
              className="phone-mockup shadow-lg position-relative"
              style={{
                width: '320px',
                height: '640px',
                borderRadius: '40px',
                border: '8px solid #1f2937',
                backgroundColor: '#fff', // Layar HP biasanya putih/terang atau bisa dibuat dark juga
                overflow: 'hidden',
                background: activeRole === 'customer' ? '#f0f9ff' : '#f0fdf4' // Sedikit tint warna
              }}
            >
              {/* Notch */}
              <div className="position-absolute top-0 start-50 translate-middle-x bg-dark rounded-bottom-4" style={{ width: '120px', height: '25px', zIndex: 20 }}></div>

              {/* Status Bar */}
              <div className="d-flex justify-content-between px-4 pt-2 pb-3" style={{ fontSize: '0.75rem', color: '#333' }}>
                <span className="fw-bold">9:41</span>
                <span>📶 🔋</span>
              </div>

              {/* Dynamic Notification */}
              {notification && (
                <div 
                  className="position-absolute start-50 translate-middle-x px-3 py-2 rounded-3 shadow-sm"
                  style={{ 
                    top: '40px', 
                    width: '90%', 
                    backgroundColor: '#fff', 
                    borderLeft: `4px solid ${roleColor}`,
                    fontSize: '0.8rem',
                    zIndex: 30,
                    animation: 'slideDown 0.3s ease-out'
                  }}
                >
                  <strong>StrideBase</strong><br/>
                  {notification}
                </div>
              )}

              {/* --- SCREEN CONTENT --- */}
              <div className="h-100 d-flex flex-column">
                
                {/* App Header */}
                <div className="px-3 py-2 mb-2 d-flex align-items-center bg-white shadow-sm">
                  <div className="fw-bold" style={{ color: roleColor }}>
                    {activeRole === 'customer' ? 'StrideBase' : 'Partner Dash'}
                  </div>
                  <div className="ms-auto rounded-circle bg-secondary" style={{ width: '24px', height: '24px' }}></div>
                </div>

                {/* App Body */}
                <div className="flex-grow-1 p-3 overflow-hidden d-flex flex-column justify-content-center">
                  
                  {/* --- CUSTOMER FLOW --- */}
                  {activeRole === 'customer' && (
                    <>
                      {demoStep === 0 && (
                        <Zoom>
                          <div className="card border-0 shadow-sm mb-3">
                            <div className="card-body p-2 d-flex align-items-center">
                              <div className="bg-light rounded p-2 me-3" style={{fontSize: '1.5rem'}}>👟</div>
                              <div>
                                <h6 className="m-0 fw-bold">Deep Clean</h6>
                                <small className="text-muted">Rp 35.000 • 2 Hari</small>
                              </div>
                            </div>
                          </div>
                          <button 
                            onClick={handleCustomerAction} 
                            className="btn w-100 text-white fw-bold shadow-sm"
                            style={{ backgroundColor: roleColor, borderRadius: '12px' }}
                          >
                            Booking Sekarang
                          </button>
                        </Zoom>
                      )}

                      {demoStep === 1 && (
                        <div className="text-center text-primary">
                          <div className="spinner-border mb-3" role="status"></div>
                          <p className="fw-bold">Mencari Mitra Terdekat...</p>
                        </div>
                      )}

                      {demoStep === 2 && (
                        <Fade>
                          <div className="card border-0 shadow p-3 text-center">
                            <div className="text-success mb-2" style={{ fontSize: '2rem' }}>🎉</div>
                            <h6 className="fw-bold text-dark">Order Dikonfirmasi!</h6>
                            <p className="small text-muted mb-3">Mitra <b>CleanKicks</b> sedang menuju lokasimu.</p>
                            
                            <div className="progress mb-3" style={{height: '6px'}}>
                              <div className="progress-bar bg-success" style={{width: '30%'}}></div>
                            </div>

                            <button onClick={handleCustomerAction} className="btn btn-outline-primary btn-sm w-100 rounded-pill">
                              Cek Status Selesai
                            </button>
                          </div>
                        </Fade>
                      )}

                      {demoStep === 3 && (
                        <Zoom>
                          <div className="text-center">
                            <div className="mb-2" style={{fontSize: '3rem'}}>✨</div>
                            <h5 className="fw-bold text-dark">Sepatu Kinclong!</h5>
                            <p className="small text-muted px-2">Pesanan #ORD-8821 selesai. Terima kasih telah mempercayai kami.</p>
                            <button onClick={handleCustomerAction} className="btn btn-primary btn-sm rounded-pill px-4">
                              Order Lagi
                            </button>
                          </div>
                        </Zoom>
                      )}
                    </>
                  )}

                  {/* --- PARTNER FLOW --- */}
                  {activeRole === 'partner' && (
                    <>
                      {demoStep === 0 && (
                        <Zoom>
                          <div className="card border-warning border-2 shadow-sm">
                            <div className="card-body p-3">
                              <div className="d-flex justify-content-between mb-2">
                                <span className="badge bg-warning text-dark">Baru</span>
                                <small className="text-muted">1 min lalu</small>
                              </div>
                              <h6 className="fw-bold text-dark">Order #ORD-8821</h6>
                              <p className="small text-muted mb-3">Air Jordan 1 • Deep Clean</p>
                              
                              <div className="d-grid gap-2">
                                <button onClick={handlePartnerAction} className="btn btn-success btn-sm fw-bold">Terima Order</button>
                                <button className="btn btn-outline-danger btn-sm">Tolak</button>
                              </div>
                            </div>
                          </div>
                        </Zoom>
                      )}

                      {demoStep === 1 && (
                        <Fade>
                          <div className="card border-0 shadow-sm p-3">
                            <h6 className="fw-bold text-dark">#ORD-8821</h6>
                            <div className="alert alert-info py-1 px-2 small mb-3">Status: Dijemput</div>
                            <p className="small text-muted">Sepatu sudah di toko. Mulai pengerjaan?</p>
                            <button onClick={handlePartnerAction} className="btn btn-primary btn-sm w-100">
                              Update: Sedang Dicuci
                            </button>
                          </div>
                        </Fade>
                      )}

                      {demoStep === 2 && (
                        <div className="text-center">
                          <div className="spinner-grow text-primary mb-3"></div>
                          <h6 className="fw-bold text-dark">Sedang Dicuci...</h6>
                          <button onClick={handlePartnerAction} className="btn btn-success btn-sm w-100 mt-3 rounded-pill">
                            Selesaikan Order
                          </button>
                        </div>
                      )}

                      {demoStep === 3 && (
                        <Zoom>
                          <div className="bg-success text-white p-4 rounded-3 text-center shadow">
                            <h6 className="mb-1">Total Pendapatan</h6>
                            <h2 className="fw-bold mb-3">Rp 50.000</h2>
                            <small className="d-block text-white-50 mb-3">+ Komisi Order #ORD-8821</small>
                            <button onClick={handlePartnerAction} className="btn btn-light btn-sm text-success fw-bold rounded-pill px-4">
                              Reset Demo
                            </button>
                          </div>
                        </Zoom>
                      )}
                    </>
                  )}

                </div>

                {/* App Bottom Nav */}
                <div className="bg-white border-top p-2 d-flex justify-content-around">
                  <div className="text-primary"><small>🏠</small></div>
                  <div className="text-muted"><small>💬</small></div>
                  <div className="text-muted"><small>👤</small></div>
                </div>

              </div>
            </div>
          </div>

        </div>

        {/* 4. CTA Final */}
        <div className="text-center mt-5 pt-5 border-top border-secondary border-opacity-25">
          <h3 className="fw-bold mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>Siap Bergabung?</h3>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/register" className="btn btn-primary btn-lg rounded-pill px-5 shadow-lg">
              Daftar Sekarang
            </Link>
            <Link to="/contact" className="btn btn-outline-secondary btn-lg rounded-pill px-5">
              Hubungi Kami
            </Link>
          </div>
        </div>

      </div>
      <Footer />
    </div>
  );
};

export default DemoPage;