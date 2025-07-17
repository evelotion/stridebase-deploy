import React from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function App() {
  return (
    <div>
      <Navbar />
      <main className="container py-5">
        <h1>Selamat Datang di StrideBase!</h1>
        <p>Konten halaman akan ditampilkan di sini.</p>
      </main>
      <Footer />
    </div>
  );
}

export default App;