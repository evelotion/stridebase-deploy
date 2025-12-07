// File: client/src/services/apiService.js

import API_BASE_URL from "../apiConfig";

const apiRequest = async (
  endpoint,
  method = "GET",
  body = null,
  isFormData = false
) => {
  const headers = {};
  const token = localStorage.getItem("token");

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Hanya set Content-Type jika bukan FormData (karena FormData set boundary otomatis)
  if (!isFormData && body) {
    headers["Content-Type"] = "application/json";
  }

  const config = {
    method,
    headers,
  };

  if (body) {
    config.body = isFormData ? body : JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // Handle error HTTP (4xx, 5xx)
    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || "Terjadi kesalahan pada server");
    }

    // Handle respons kosong (misal: status 204 No Content)
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  } catch (error) {
    console.error(`API Error on ${method} ${endpoint}:`, error);
    throw error;
  }
};

// =================================================================
// PUBLIC & STORE ENDPOINTS
// =================================================================
export const getStores = (params) =>
  apiRequest(`/api/stores?${params.toString()}`);
export const getStoreDetails = (storeId) =>
  apiRequest(`/api/stores/${storeId}`);
export const getStoreServices = (storeId) =>
  apiRequest(`/api/stores/${storeId}/services`);
export const getStoreReviews = (storeId) =>
  apiRequest(`/api/stores/${storeId}/reviews`);
export const getPublicBanners = () => apiRequest("/api/public/banners");

// =================================================================
// AUTHENTICATION ENDPOINTS
// =================================================================
export const loginUser = (credentials) =>
  apiRequest("/api/auth/login", "POST", credentials);
export const registerUser = (userData) =>
  apiRequest("/api/auth/register", "POST", userData);
export const forgotPasswordUser = (data) =>
  apiRequest("/api/auth/forgot-password", "POST", data);
export const resetPasswordUser = (data) =>
  apiRequest("/api/auth/reset-password", "POST", data);

// =================================================================
// USER ENDPOINTS
// =================================================================
export const getUserBookings = () => apiRequest("/api/user/bookings");
export const getUserAddresses = () => apiRequest("/api/user/addresses");
export const addUserAddress = (addressData) =>
  apiRequest("/api/user/addresses", "POST", addressData);
export const deleteUserAddress = (addressId) =>
  apiRequest(`/api/user/addresses/${addressId}`, "DELETE");
export const updateUserProfile = (profileData) =>
  apiRequest("/api/user/profile", "PUT", profileData);
export const getLoyaltyData = () => apiRequest("/api/user/loyalty");
export const getRedeemedPromos = () => apiRequest("/api/user/redeemed-promos");
export const redeemLoyaltyPoints = (pointsToRedeem) =>
  apiRequest("/api/user/loyalty/redeem", "POST", { pointsToRedeem });

// =================================================================
// BOOKING & REVIEW ENDPOINTS
// =================================================================
export const createBooking = (bookingData) =>
  apiRequest("/api/bookings", "POST", bookingData);
export const getBookingDetails = (bookingId) =>
  apiRequest(`/api/bookings/${bookingId}`);
export const createReview = (reviewData) =>
  apiRequest("/api/reviews", "POST", reviewData);
export const uploadImage = (formData) =>
  apiRequest("/api/upload/review", "POST", formData, true);

// =================================================================
// PARTNER ENDPOINTS (DIPERBAIKI)
// =================================================================
// --- Dashboard & Stats ---
export const getPartnerDashboard = () => apiRequest("/api/partner/dashboard");
export const getPartnerStats = () => apiRequest("/api/partner/stats");

// --- Store Status ---
export const updatePartnerStoreStatus = (status) =>
  apiRequest("/api/partner/store-status", "PATCH", { status });

// --- Services ---
export const getPartnerServices = () => apiRequest("/api/partner/services");
export const createPartnerService = (serviceData) =>
  apiRequest("/api/partner/services", "POST", serviceData);
export const updatePartnerService = (serviceId, serviceData) =>
  apiRequest(`/api/partner/services/${serviceId}`, "PUT", serviceData);
export const deletePartnerService = (serviceId) =>
  apiRequest(`/api/partner/services/${serviceId}`, "DELETE");

// --- Orders ---
export const getPartnerOrders = () => apiRequest("/api/partner/orders");

// [PERBAIKAN] Menambahkan fungsi updateOrderStatus yang hilang
// Fungsi ini digunakan untuk mengubah status pesanan (Pending -> Confirmed -> Cancelled)
export const updateOrderStatus = (bookingId, status) =>
  apiRequest(`/api/partner/orders/${bookingId}/status`, "PATCH", { status });

export const updateWorkStatus = (bookingId, newWorkStatus) =>
  apiRequest(`/api/partner/orders/${bookingId}/work-status`, "PATCH", {
    newWorkStatus,
  });

// --- Settings & Profile ---
export const getPartnerSettings = () => apiRequest("/api/partner/settings");
export const updatePartnerSettings = (settingsData) =>
  apiRequest("/api/partner/settings", "PUT", settingsData);
export const uploadPartnerPhoto = (formData) =>
  apiRequest("/api/partner/upload-photo", "POST", formData, true);

// --- Finance & Invoices ---
export const getOutstandingInvoices = () =>
  apiRequest("/api/partner/invoices/outstanding");
export const getPartnerWalletData = () => apiRequest("/api/partner/wallet");
export const requestPartnerPayout = (amount) =>
  apiRequest("/api/partner/payout-requests", "POST", { amount });
export const getPartnerReports = (params) =>
  apiRequest(`/api/partner/reports?${params.toString()}`);

// --- Reviews & Promos ---
export const getPartnerReviews = () => apiRequest("/api/partner/reviews");
export const replyToReview = (reviewId, reply) =>
  apiRequest(`/api/partner/reviews/${reviewId}/reply`, "POST", { reply });
export const getPartnerPromos = () => apiRequest("/api/partner/promos");
export const createPartnerPromo = (promoData) =>
  apiRequest("/api/partner/promos", "POST", promoData);
export const updatePartnerPromo = (promoId, promoData) =>
  apiRequest(`/api/partner/promos/${promoId}`, "PUT", promoData);
export const deletePartnerPromo = (promoId) =>
  apiRequest(`/api/partner/promos/${promoId}`, "DELETE");

// =================================================================
// ADMIN ENDPOINTS
// =================================================================
export const getAdminStats = () => apiRequest("/api/admin/stats");
export const getAllUsers = () => apiRequest("/api/admin/users");
export const createUserByAdmin = (userData) =>
  apiRequest("/api/admin/users", "POST", userData);
export const changeUserRole = (userId, data) =>
  apiRequest(`/api/admin/users/${userId}/role`, "PATCH", data);
export const changeUserStatus = (userId, data) =>
  apiRequest(`/api/admin/users/${userId}/status`, "PATCH", data);

// --- Stores (Admin View) ---
export const getAllStoresForAdmin = () => apiRequest("/api/admin/stores");
export const updateStoreStatus = (storeId, newStatus) =>
  apiRequest(`/api/admin/stores/${storeId}/status`, "PATCH", { newStatus });
export const softDeleteStore = (storeId) =>
  apiRequest(`/api/admin/stores/${storeId}`, "DELETE");
export const requestStoreDeletion = (storeId) =>
  apiRequest(`/api/admin/stores/${storeId}/request-deletion`, "POST");
export const updateStoreDetails = (storeId, data) =>
  apiRequest(`/api/admin/stores/${storeId}/details`, "PATCH", data);
export const getStoreSettingsForAdmin = (storeId) =>
  apiRequest(`/api/admin/stores/${storeId}/settings`);
export const updateStoreSettingsByAdmin = (storeId, settingsData) =>
  apiRequest(`/api/admin/stores/${storeId}/settings`, "PUT", settingsData);
export const uploadAdminPhoto = (formData) =>
  apiRequest("/api/admin/stores/upload-photo", "POST", formData, true);

// --- Invoices & Payouts ---
export const getPayoutRequests = () => apiRequest("/api/admin/payout-requests");
export const resolvePayoutRequest = (requestId, newStatus) =>
  apiRequest(`/api/admin/payout-requests/${requestId}/resolve`, "PATCH", {
    newStatus,
  });
export const createStoreInvoiceByAdmin = (storeId, invoiceData) =>
  apiRequest(`/api/admin/stores/${storeId}/invoices`, "POST", invoiceData);
export const previewStoreInvoiceByAdmin = (storeId, periodData) =>
  apiRequest(
    `/api/admin/stores/${storeId}/invoices/preview`,
    "POST",
    periodData
  );
export const getStoreInvoicesByAdmin = (storeId) =>
  apiRequest(`/api/admin/stores/${storeId}/invoices`);
export const checkExistingInvoiceByAdmin = (storeId, periodData) =>
  apiRequest(`/api/admin/stores/${storeId}/invoices/check`, "POST", periodData);
export const getInvoiceByIdForAdmin = (invoiceId) =>
  apiRequest(`/api/admin/invoices/${invoiceId}`);

// --- Content Management ---
export const getAllBanners = () => apiRequest("/api/admin/banners");
export const createBanner = (bannerData) =>
  apiRequest("/api/admin/banners", "POST", bannerData);
export const updateBanner = (bannerId, bannerData) =>
  apiRequest(`/api/admin/banners/${bannerId}`, "PUT", bannerData);
export const deleteBanner = (bannerId) =>
  apiRequest(`/api/admin/banners/${bannerId}`, "DELETE");

export const getAllPromos = () => apiRequest("/api/admin/promos");
export const createPromo = (promoData) =>
  apiRequest("/api/admin/promos", "POST", promoData);
export const updatePromo = (id, promoData) =>
  apiRequest(`/api/admin/promos/${id}`, "PUT", promoData);
export const deletePromo = (id) =>
  apiRequest(`/api/admin/promos/${id}`, "DELETE");
export const validatePromoCode = (code) =>
  apiRequest("/api/admin/promos/validate", "POST", { code });

// --- Bookings & Reviews (Admin) ---
export const getAllBookingsForAdmin = () => apiRequest("/api/admin/bookings");
export const updateBookingStatusByAdmin = (bookingId, newStatus) =>
  apiRequest(`/api/admin/bookings/${bookingId}/status`, "PATCH", { newStatus });
export const getAllReviewsForAdmin = () => apiRequest("/api/admin/reviews");
export const deleteReviewByAdmin = (reviewId) =>
  apiRequest(`/api/admin/reviews/${reviewId}`, "DELETE");
export const getAdminReports = (params) =>
  apiRequest(`/api/admin/reports?${params.toString()}`);
export const getAdminSettings = () => apiRequest("/api/admin/settings");
export const updateAdminSettings = (configData) =>
  apiRequest("/api/admin/settings", "POST", configData);
export const requestUserDeletion = (userId) =>
  apiRequest(`/api/admin/users/${userId}/request-deletion`, "POST");

// =================================================================
// SUPERUSER ENDPOINTS
// =================================================================
export const getSuperUserConfig = () => apiRequest("/api/superuser/config");
export const updateSuperUserConfig = (configData) =>
  apiRequest("/api/superuser/config", "POST", configData);
export const getApprovalRequests = () =>
  apiRequest("/api/superuser/approval-requests");
export const resolveApprovalRequest = (requestId, resolution) =>
  apiRequest(`/api/superuser/approval-requests/${requestId}/resolve`, "POST", {
    resolution,
  });
export const reseedDatabase = () =>
  apiRequest("/api/superuser/maintenance/reseed-database", "POST");
export const getSecurityLogs = () => apiRequest("/api/superuser/security-logs");
export const uploadDeveloperAsset = (formData) =>
  apiRequest("/api/superuser/upload-asset", "POST", formData, true);
