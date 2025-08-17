import React from "react";

// Kita akan menyederhanakan komponen ini habis-habisan untuk tes

const DeveloperLayout = () => {
  // Pesan debug untuk memastikan komponen ini dijalankan
  console.log("DEBUG: DeveloperLayout component is rendering!");

  return (
    <div style={{ padding: '50px', backgroundColor: 'lightcoral', color: 'white' }}>
      <h1>HALO DARI DEVELOPER LAYOUT</h1>
      <p>Jika Anda bisa melihat teks ini, berarti masalahnya bukan pada file ini, melainkan pada komponen yang seharusnya muncul di dalamnya (Outlet/DeveloperDashboardPage).</p>
    </div>
  );
};

export default DeveloperLayout;