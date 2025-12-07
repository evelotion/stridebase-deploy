// File: client/src/pages/PartnerReportsPage.jsx

import React, { useState, useEffect, useCallback } from "react";
import { Fade } from "react-awesome-reveal";
import { getPartnerReports } from "../services/apiService";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import "./PartnerElevate.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const KpiGlassCard = ({ title, value, icon, color }) => (
  <div className="col-lg-4 col-md-6">
    <Fade triggerOnce>
      <div className="pe-card d-flex align-items-center justify-content-between h-100 group-hover-glow position-relative overflow-hidden">
        <div className="position-relative z-1">
          <p className="pe-subtitle mb-1 text-uppercase tracking-widest x-small">
            {title}
          </p>
          <h2 className="pe-title mb-0">{value}</h2>
        </div>
        <div className={`pe-stat-icon ${color} mb-0 position-relative z-1`}>
          <i className={`fas ${icon}`}></i>
        </div>
        {/* Background Decoration */}
        <i
          className={`fas ${icon} position-absolute bottom-0 end-0 opacity-10`}
          style={{ fontSize: "5rem", transform: "translate(20%, 20%)" }}
        ></i>
      </div>
    </Fade>
  </div>
);

const PartnerReportsPage = ({ showMessage }) => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
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
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Chart Configuration (Dummy Data visualization if real data not available in structure)
  const revenueChartData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        label: "Revenue",
        data: [1200000, 1900000, 3000000, 5000000], // Placeholder logic
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "rgba(255,255,255,0.5)" },
      },
      y: {
        grid: { color: "rgba(255,255,255,0.05)" },
        ticks: { color: "rgba(255,255,255,0.5)" },
      },
    },
  };

  if (loading)
    return (
      <div className="pe-dashboard-wrapper d-flex justify-content-center align-items-center">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  if (!reportData)
    return (
      <div className="pe-dashboard-wrapper p-5 text-center text-muted">
        No report data available.
      </div>
    );

  const { summary, topServices, recentReviews } = reportData;

  return (
    <div className="pe-dashboard-wrapper">
      <div className="pe-blob pe-blob-1"></div>

      <div className="container-fluid px-4 py-4 position-relative z-1">
        {/* HEADER & FILTER */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-5 gap-3">
          <div>
            <Fade direction="down" triggerOnce>
              <h6 className="pe-subtitle text-uppercase tracking-widest mb-1">
                Performance Analytics
              </h6>
              <h2 className="pe-title display-6 mb-0">Business Reports</h2>
            </Fade>
          </div>

          <div
            className="d-flex gap-2 bg-dark p-1 rounded-3 border border-secondary"
            style={{ borderColor: "var(--pe-card-border) !important" }}
          >
            <input
              type="date"
              className="form-control form-control-sm bg-transparent text-white border-0"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
            />
            <span className="text-secondary align-self-center">-</span>
            <input
              type="date"
              className="form-control form-control-sm bg-transparent text-white border-0"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
            />
            <button
              onClick={fetchReports}
              className="pe-btn-action bg-primary border-0 py-1 px-3 h-100"
            >
              <i className="fas fa-filter"></i>
            </button>
          </div>
        </div>

        {/* KPI CARDS */}
        <div className="row g-4 mb-4">
          <KpiGlassCard
            title="Total Revenue"
            value={`Rp ${summary.totalRevenue.toLocaleString("id-ID")}`}
            icon="fa-money-bill-wave"
            color="pe-icon-green"
          />
          <KpiGlassCard
            title="Total Orders"
            value={summary.totalOrders}
            icon="fa-receipt"
            color="pe-icon-blue"
          />
          <KpiGlassCard
            title="Avg. Rating"
            value={summary.averageRating.toFixed(1)}
            icon="fa-star"
            color="pe-icon-gold"
          />
        </div>

        {/* CHARTS & TABLES */}
        <div className="row g-4">
          {/* Main Chart */}
          <div className="col-lg-8">
            <Fade direction="up" delay={100} triggerOnce>
              <div className="pe-card mb-4" style={{ height: "400px" }}>
                <h5 className="pe-title mb-4">Revenue Trend</h5>
                <div className="h-100 pb-5">
                  <Line data={revenueChartData} options={chartOptions} />
                </div>
              </div>
            </Fade>

            {/* Top Services Table */}
            <Fade direction="up" delay={200} triggerOnce>
              <div className="pe-card">
                <h5 className="pe-title mb-4">Top Performing Services</h5>
                <div className="pe-table-wrapper">
                  <table className="pe-table">
                    <thead>
                      <tr>
                        <th>Service Name</th>
                        <th className="text-end">Orders</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topServices.map((service, i) => (
                        <tr key={i}>
                          <td className="text-white fw-bold">
                            {i + 1}. {service.name}
                            <div
                              className="progress mt-1"
                              style={{
                                height: "4px",
                                width: "100px",
                                background: "rgba(255,255,255,0.1)",
                              }}
                            >
                              <div
                                className="progress-bar bg-primary"
                                style={{
                                  width: `${Math.min(
                                    service.count * 10,
                                    100
                                  )}%`,
                                }}
                              ></div>
                            </div>
                          </td>
                          <td className="text-end text-primary fw-bold fs-5">
                            {service.count}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Fade>
          </div>

          {/* Right Sidebar: Recent Reviews & Insights */}
          <div className="col-lg-4">
            <Fade direction="right" delay={100} triggerOnce>
              <div className="pe-card h-100">
                <h5 className="pe-title mb-4">Recent Feedback</h5>
                <div className="d-flex flex-column gap-3">
                  {recentReviews.map((review) => (
                    <div
                      key={review.id}
                      className="p-3 rounded-3 border border-secondary bg-dark bg-opacity-50"
                    >
                      <div className="d-flex justify-content-between mb-2">
                        <span className="fw-bold text-white small">
                          {review.userName}
                        </span>
                        <div className="text-warning x-small">
                          {[...Array(5)].map((_, i) => (
                            <i
                              key={i}
                              className={`fas fa-star ${
                                i < review.rating ? "" : "opacity-25"
                              }`}
                            ></i>
                          ))}
                        </div>
                      </div>
                      <p className="text-muted x-small mb-0 fst-italic line-clamp-2">
                        "{review.comment}"
                      </p>
                    </div>
                  ))}
                  {recentReviews.length === 0 && (
                    <p className="text-muted text-center py-4">
                      No recent reviews.
                    </p>
                  )}
                </div>
              </div>
            </Fade>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerReportsPage;
