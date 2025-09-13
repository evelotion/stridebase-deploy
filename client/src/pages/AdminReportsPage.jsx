// File: client/src/pages/AdminReportsPage.jsx (Versi Lengkap & Fungsional)

import React, { useState, useEffect, useCallback } from "react";
import { getAdminReports } from "../services/apiService";

const KpiCard = ({ title, value, icon, colorClass }) => (
    <div className="col-lg-4 col-md-6 mb-4">
        <div className="kpi-card p-3 shadow-sm h-100">
            <div className="kpi-card-content">
                <div className="kpi-card-text">
                    <h3 className="fs-2">{value}</h3>
                    <p className="fs-5 text-muted mb-0">{title}</p>
                </div>
                <i className={`fas ${icon} fs-1 ${colorClass} border rounded-full p-3`}></i>
            </div>
        </div>
    </div>
);

const AdminReportsPage = ({ showMessage }) => {
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filters, setFilters] = useState(() => {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 29); // 30 hari terakhir
        return {
            startDate: startDate.toISOString().split("T")[0],
            endDate: endDate.toISOString().split("T")[0],
        };
    });

    const fetchReports = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams(filters);
            const data = await getAdminReports(params);
            setReportData(data);
        } catch (err) {
            setError(err.message);
            if (showMessage) showMessage(err.message, "Error");
        } finally {
            setLoading(false);
        }
    }, [filters, showMessage]);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        fetchReports();
    };

    if (loading) return <div className="p-4">Memuat data laporan...</div>;
    if (error) return <div className="p-4 text-danger">Error: {error}</div>;
    if (!reportData) return <div className="p-4">Tidak ada data laporan yang tersedia.</div>;

    const { summary, latestTransactions, topStores } = reportData;

    return (
        <div className="container-fluid p-4">
            <h2 className="fs-2 mb-4">Laporan Platform</h2>

            <div className="card card-account p-3 mb-4">
                <form onSubmit={handleFilterSubmit} className="row g-2 align-items-center">
                    <div className="col-md-5">
                        <label htmlFor="startDate" className="form-label visually-hidden">Tanggal Mulai</label>
                        <input type="date" className="form-control" id="startDate" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
                    </div>
                    <div className="col-md-5">
                        <label htmlFor="endDate" className="form-label visually-hidden">Tanggal Akhir</label>
                        <input type="date" className="form-control" id="endDate" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
                    </div>
                    <div className="col-md-2">
                        <button type="submit" className="btn btn-dark w-100">Filter</button>
                    </div>
                </form>
            </div>

            <div className="row">
                <KpiCard title="Total Pendapatan" value={`Rp ${summary.totalRevenue.toLocaleString("id-ID")}`} icon="fa-money-bill-wave" colorClass="text-success" />
                <KpiCard title="Total Pesanan" value={summary.totalBookings} icon="fa-receipt" colorClass="text-info" />
                <KpiCard title="Pendapatan Platform" value={`Rp ${summary.totalPlatformEarnings.toLocaleString("id-ID")}`} icon="fa-landmark" colorClass="text-primary" />
            </div>

            <div className="row mt-2 g-4">
                <div className="col-lg-7">
                    <div className="table-card p-3 shadow-sm h-100">
                        <h5 className="mb-3">Transaksi Terakhir</h5>
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>Pelanggan</th>
                                        <th>Toko</th>
                                        <th className="text-end">Jumlah</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {latestTransactions.map(tx => (
                                        <tr key={tx.id}>
                                            <td>{tx.booking.user.name}</td>
                                            <td>{tx.booking.store.name}</td>
                                            <td className="text-end fw-bold">Rp {tx.amount.toLocaleString("id-ID")}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div className="col-lg-5">
                    <div className="table-card p-3 shadow-sm h-100">
                        <h5 className="mb-3">Toko Terpopuler</h5>
                         <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>Nama Toko</th>
                                        <th className="text-end">Jumlah Pesanan</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topStores.map(store => (
                                        <tr key={store.storeId}>
                                            <td className="fw-bold">{store.storeName}</td>
                                            <td className="text-end">{store._count.id}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminReportsPage;