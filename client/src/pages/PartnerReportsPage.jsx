// File: client/src/pages/PartnerReportsPage.jsx (BARU)

import React, { useState, useEffect, useCallback } from "react";
import { getPartnerReports } from "../services/apiService";

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

const PartnerReportsPage = ({ showMessage }) => {
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filters, setFilters] = useState(() => {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 29);
        return {
            startDate: startDate.toISOString().split("T")[0],
            endDate: endDate.toISOString().split("T")[0],
        };
    });

    const fetchReports = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams(filters);
            const data = await getPartnerReports(params);
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
    
    if (loading) return <div className="p-4">Memuat data laporan toko...</div>;
    if (error) return <div className="p-4 text-danger">Error: {error}</div>;
    if (!reportData) return <div className="p-4">Tidak ada data laporan yang tersedia.</div>;

    const { summary, topServices, recentReviews } = reportData;

    return (
        <div className="container-fluid p-4">
            <h2 className="fs-2 mb-4">Laporan & Analitik Toko</h2>

            <div className="card card-account p-3 mb-4">
                <form onSubmit={handleFilterSubmit} className="row g-2 align-items-center">
                    <div className="col-md-5"><input type="date" className="form-control" name="startDate" value={filters.startDate} onChange={handleFilterChange} /></div>
                    <div className="col-md-5"><input type="date" className="form-control" name="endDate" value={filters.endDate} onChange={handleFilterChange} /></div>
                    <div className="col-md-2"><button type="submit" className="btn btn-dark w-100">Filter</button></div>
                </form>
            </div>

            <div className="row">
                <KpiCard title="Total Pendapatan" value={`Rp ${summary.totalRevenue.toLocaleString("id-ID")}`} icon="fa-money-bill-wave" colorClass="text-success" />
                <KpiCard title="Total Pesanan" value={summary.totalOrders} icon="fa-receipt" colorClass="text-info" />
                <KpiCard title="Rata-rata Rating" value={summary.averageRating.toFixed(1)} icon="fa-star" colorClass="text-warning" />
            </div>

            <div className="row mt-2 g-4">
                <div className="col-lg-7">
                    <div className="table-card p-3 shadow-sm h-100">
                        <h5 className="mb-3">Layanan Terlaris</h5>
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead className="table-light"><tr><th>Nama Layanan</th><th className="text-end">Jumlah Dipesan</th></tr></thead>
                                <tbody>
                                    {topServices.map(service => (
                                        <tr key={service.name}>
                                            <td className="fw-bold">{service.name}</td>
                                            <td className="text-end">{service.count}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div className="col-lg-5">
                    <div className="table-card p-3 shadow-sm h-100">
                        <h5 className="mb-3">Ulasan Terbaru</h5>
                         <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <tbody>
                                    {recentReviews.map(review => (
                                        <tr key={review.id}>
                                            <td>
                                                <span className="fw-bold">{review.userName}</span>
                                                <small className="d-block text-muted text-truncate" style={{maxWidth: '200px'}}>{review.comment}</small>
                                            </td>
                                            <td className="text-end text-warning">
                                                {review.rating} <i className="fas fa-star"></i>
                                            </td>
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

export default PartnerReportsPage;