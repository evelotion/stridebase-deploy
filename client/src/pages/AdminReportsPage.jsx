import React from "react";
import { useLoaderData, useSearchParams } from "react-router-dom";
import API_BASE_URL from "../apiConfig";

export const loader = async ({ request }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return redirect("/login");
  }

  const url = new URL(request.url);
  const params = new URLSearchParams(url.search);

  // Default date range to last 30 days if not provided
  if (!params.has("startDate")) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);
    params.set("startDate", startDate.toISOString().split("T")[0]);
    params.set("endDate", endDate.toISOString().split("T")[0]);
  }

  try {
    const [transactionsRes, earningsRes] = await Promise.all([
      fetch(`${API_BASE_URL}/api/admin/transactions?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${API_BASE_URL}/api/admin/platform-earnings?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    if (!transactionsRes.ok || !earningsRes.ok) {
      throw new Error("Failed to fetch reports data");
    }

    const transactionsData = await transactionsRes.json();
    const earningsData = await earningsRes.json();

    return { transactionsData, earningsData, queryParams: Object.fromEntries(params) };
  } catch (error) {
    console.error("Error fetching admin reports:", error);
    // Return empty state or error message
    return { 
      transactionsData: { transactions: [], total: 0, totalPages: 1 }, 
      earningsData: { earnings: [], total: 0, totalPages: 1, totalAmount: 0 },
      queryParams: Object.fromEntries(params),
      error: "Gagal memuat data laporan." 
    };
  }
};


const AdminReportsPage = () => {
  const { transactionsData, earningsData, queryParams, error } = useLoaderData();
  const [searchParams, setSearchParams] = useSearchParams(queryParams);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => {
        prev.set(name, value);
        return prev;
    })
  };

  const handlePageChange = (type, newPage) => {
    setSearchParams(prev => {
        prev.set(`${type}Page`, newPage);
        return prev;
    });
  }

  if (error) {
    return <div className="admin-container"><p className="error-message">{error}</p></div>;
  }
  
  return (
    <div className="admin-container">
      <h2>Laporan Platform</h2>
      <div className="filters">
        <label>
          Dari Tanggal:
          <input
            type="date"
            name="startDate"
            value={searchParams.get('startDate') || ''}
            onChange={handleFilterChange}
          />
        </label>
        <label>
          Sampai Tanggal:
          <input
            type="date"
            name="endDate"
            value={searchParams.get('endDate') || ''}
            onChange={handleFilterChange}
          />
        </label>
      </div>

      <div className="report-section">
        <h3>Pendapatan Platform</h3>
        <p>Total Pendapatan: <strong>Rp {earningsData.totalAmount.toLocaleString()}</strong></p>
        <table>
          <thead>
            <tr>
              <th>ID Booking</th>
              <th>Nama Toko</th>
              <th>Jumlah</th>
              <th>Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {earningsData.earnings.map((earning) => (
              <tr key={earning.id}>
                <td>{earning.bookingId.substring(0, 8)}</td>
                <td>{earning.store.name}</td>
                <td>Rp {earning.earnedAmount.toLocaleString()}</td>
                <td>{new Date(earning.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Pagination for earnings can be added here if needed */}
      </div>

      <div className="report-section">
        <h3>Seluruh Transaksi</h3>
        <table>
          <thead>
            <tr>
              <th>ID Booking</th>
              <th>Pengguna</th>
              <th>Toko</th>
              <th>Jumlah</th>
              <th>Status</th>
              <th>Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {transactionsData.transactions.map((payment) => (
              <tr key={payment.id}>
                <td>{payment.bookingId.substring(0, 8)}</td>
                <td>{payment.booking.user.name}</td>
                <td>{payment.booking.store.name}</td>
                <td>Rp {payment.amount.toLocaleString()}</td>
                <td>{payment.status}</td>
                <td>{new Date(payment.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Pagination for transactions */}
        <div className="pagination">
            <button 
                onClick={() => handlePageChange('tx', Math.max(1, parseInt(searchParams.get('txPage') || '1') - 1))}
                disabled={parseInt(searchParams.get('txPage') || '1') === 1}>
                Previous
            </button>
            <span>Halaman {searchParams.get('txPage') || '1'} dari {transactionsData.totalPages}</span>
            <button 
                onClick={() => handlePageChange('tx', Math.min(transactionsData.totalPages, parseInt(searchParams.get('txPage') || '1') + 1))}
                disabled={parseInt(searchParams.get('txPage') || '1') >= transactionsData.totalPages}>
                Next
            </button>
        </div>
      </div>
    </div>
  );
};

export default AdminReportsPage;