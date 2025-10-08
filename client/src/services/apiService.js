// File: client/src/services/apiService.js (Perbaikan Final)

import API_BASE_URL from "../apiConfig";

const apiRequest = async (
  endpoint,
  method = "GET",
  body = null,
  isFormData = false
) => {
  const headers = new Headers();
  const token = localStorage.getItem("token");
  if (token) {
    headers.append("Authorization", `Bearer ${token}`);
  }

  const config = {
    method,
    headers,
  };

  if (body) {
    if (isFormData) {
      config.body = body;
    } else {
      headers.append("Content-Type", "application/json");
      config.body = JSON.stringify(body);
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || "Terjadi kesalahan pada server");
    }
    return response.status === 204 ? null : await response.json();
  } catch (error) {
    console.error(`API Error on ${method} ${endpoint}:`, error);
    throw error;
  }
};

// --- Public & Store Endpoints ---
export const getStores = (params) =>
  apiRequest(`/api/stores?${params.toString()}`);
export const getStoreDetails = (storeId) =>
  apiRequest(`/api/stores/${storeId}`);
// --- BARIS YANG HILANG DITAMBAHKAN DI SINI ---
export const getStoreServices = (storeId) =>
  apiRequest(`/api/stores/${storeId}/services`);
// --- AKHIR PENAMBAHAN ---
export const getStoreReviews = (storeId) =>
  apiRequest(`/api/stores/${storeId}/reviews`);
export const getPublicBanners = () => apiRequest("/api/public/banners");

// --- Authentication Endpoints ---
export const loginUser = (credentials) =>
  apiRequest("/api/auth/login", "POST", credentials);
export const registerUser = (userData) =>
  apiRequest("/api/auth/register", "POST", userData);

// --- User Endpoints ---
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

// --- Booking & Review Endpoints ---
export const createBooking = (bookingData) =>
  apiRequest("/api/bookings", "POST", bookingData);
export const getBookingDetails = (bookingId) =>
  apiRequest(`/api/bookings/${bookingId}`);
export const createReview = (reviewData) =>
  apiRequest("/api/reviews", "POST", reviewData);

// --- Upload Endpoint ---
export const uploadImage = (formData) =>
  apiRequest("/api/upload/review", "POST", formData, true);

// --- Partner Endpoints ---
export const getPartnerDashboard = () => apiRequest("/api/partner/dashboard");
export const getOutstandingInvoices = () =>
  apiRequest("/api/partner/invoices/outstanding");
export const getPartnerSettings = () => apiRequest("/api/partner/settings");
export const updatePartnerSettings = (settingsData) =>
  apiRequest("/api/partner/settings", "PUT", settingsData);
export const uploadPartnerPhoto = (formData) =>
  apiRequest("/api/partner/upload-photo", "POST", formData, true);
export const getPartnerServices = () => apiRequest("/api/partner/services");
export const createPartnerService = (serviceData) =>
  apiRequest("/api/partner/services", "POST", serviceData);
export const updatePartnerService = (serviceId, serviceData) =>
  apiRequest(`/api/partner/services/${serviceId}`, "PUT", serviceData);
export const deletePartnerService = (serviceId) =>
  apiRequest(`/api/partner/services/${serviceId}`, "DELETE");
export const getPartnerOrders = () => apiRequest("/api/partner/orders");
export const updateWorkStatus = (bookingId, newWorkStatus) =>
  apiRequest(`/api/partner/orders/${bookingId}/work-status`, "PATCH", {
    newWorkStatus,
  });
export const getPartnerReviews = () => apiRequest("/api/partner/reviews");
export const replyToReview = (reviewId, reply) =>
  apiRequest(`/api/partner/reviews/${reviewId}/reply`, "POST", { reply });
export const getPartnerWalletData = () => apiRequest("/api/partner/wallet");
export const requestPartnerPayout = (amount) =>
  apiRequest("/api/partner/payout-requests", "POST", { amount });
export const getPartnerReports = (params) =>
  apiRequest(`/api/partner/reports?${params.toString()}`);

// --- Admin Endpoints ---
export const getAdminStats = () => apiRequest("/api/admin/stats");
export const getAllUsers = () => apiRequest("/api/admin/users");
export const createUserByAdmin = (userData) => apiRequest("/api/admin/users", "POST", userData);
export const changeUserRole = (userId, newRole) =>
  apiRequest(`/api/admin/users/${userId}/role`, "PATCH", { newRole });
export const changeUserStatus = (userId, newStatus) =>
  apiRequest(`/api/admin/users/${userId}/status`, "PATCH", { newStatus });
export const getAllStoresForAdmin = () => apiRequest("/api/admin/stores");
export const updateStoreStatus = (storeId, newStatus) =>
  apiRequest(`/api/admin/stores/${storeId}/status`, "PATCH", { newStatus });
export const getPayoutRequests = () => apiRequest("/api/admin/payout-requests");
export const resolvePayoutRequest = (requestId, newStatus) =>
  apiRequest(`/api/admin/payout-requests/${requestId}/resolve`, "PATCH", {
    newStatus,
  });
export const getAllBanners = () => apiRequest("/api/admin/banners");
export const createBanner = (bannerData) =>
  apiRequest("/api/admin/banners", "POST", bannerData);
export const updateBanner = (bannerId, bannerData) =>
  apiRequest(`/api/admin/banners/${bannerId}`, "PUT", bannerData);
export const deleteBanner = (bannerId) =>
  apiRequest(`/api/admin/banners/${bannerId}`, "DELETE");
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
export const getStoreSettingsForAdmin = (storeId) =>
  apiRequest(`/api/admin/stores/${storeId}/settings`);
export const updateStoreSettingsByAdmin = (storeId, settingsData) =>
  apiRequest(`/api/admin/stores/${storeId}/settings`, "PUT", settingsData);
export const uploadAdminPhoto = (formData) =>
  apiRequest("/api/admin/stores/upload-photo", "POST", formData, true);
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
export const requestStoreDeletion = (storeId) =>
  apiRequest(`/api/admin/stores/${storeId}/request-deletion`, "POST");
export const requestUserDeletion = (userId) =>
  apiRequest(`/api/admin/users/${userId}/request-deletion`, "POST");

// --- SuperUser Endpoints ---
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