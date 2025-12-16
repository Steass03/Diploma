const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public errors?: any
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Global handler for 401 errors (token expiration)
let onUnauthorized: ((message?: string) => void) | null = null;

export function setUnauthorizedHandler(handler: (message?: string) => void) {
  onUnauthorized = handler;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  // Only set Content-Type for non-FormData requests
  // FormData requests should let the browser set the Content-Type with boundary
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    // Handle 401 Unauthorized (token expired)
    if (response.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      const message = "Ваш сеанс закінчився. Будь ласка, увійдіть знову.";
      if (onUnauthorized) {
        onUnauthorized(message);
      } else {
        // Fallback: redirect to login if handler not set
        window.location.href = "/auth/login";
      }
    }

    throw new ApiError(
      response.status,
      data.message || "An error occurred",
      data.errors
    );
  }

  return data;
}

export const api = {
  // Auth
  auth: {
    register: (data: any) =>
      request("/auth/register", { method: "POST", body: JSON.stringify(data) }),
    login: (data: { email: string; password: string }) =>
      request<{ token: string; user: any }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    logout: () => request("/auth/logout", { method: "POST" }),
    me: () => request<any>("/auth/me"),
    changePassword: (data: { currentPassword: string; newPassword: string }) =>
      request("/auth/change-password", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    requestPasswordReset: (email: string) =>
      request("/auth/request-password-reset", {
        method: "POST",
        body: JSON.stringify({ email }),
      }),
  },

  // Users
  users: {
    getById: (id: string) => request<any>(`/users/${id}`),
    updateProfile: (id: string, data: FormData) =>
      request<any>(`/users/${id}`, {
        method: "PATCH",
        body: data,
      }),
  },

  // Jobseekers
  jobseekers: {
    list: (params?: Record<string, any>) => {
      const query = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            if (Array.isArray(value)) {
              value.forEach((v) => query.append(key, v));
            } else {
              query.append(key, String(value));
            }
          }
        });
      }
      const queryString = query.toString();
      return request<{
        items: any[];
        total: number;
        page: number;
        pages: number;
      }>(`/jobseekers${queryString ? `?${queryString}` : ""}`);
    },
    getById: (id: string) => request<any>(`/jobseekers/${id}`),
    saveOffer: (offerId: string) =>
      request(`/jobseekers/saved/${offerId}`, { method: "POST" }),
    unsaveOffer: (offerId: string) =>
      request(`/jobseekers/saved/${offerId}`, { method: "DELETE" }),
    listSavedOffers: () => request<{ items: any[] }>("/jobseekers/saved/list"),
  },

  // Employers
  employers: {
    listSavedJobseekers: () => request<{ items: any[] }>("/employers/saved"),
    saveJobseeker: (jobseekerId: string) =>
      request(`/employers/saved/${jobseekerId}`, { method: "POST" }),
    unsaveJobseeker: (jobseekerId: string) =>
      request(`/employers/saved/${jobseekerId}`, { method: "DELETE" }),
    listMyOffers: (params?: { page?: number; limit?: number }) => {
      const query = new URLSearchParams();
      if (params?.page) query.append("page", String(params.page));
      if (params?.limit) query.append("limit", String(params.limit));
      const queryString = query.toString();
      return request<{
        items: any[];
        total: number;
        page: number;
        pages: number;
      }>(`/employers/me/offers${queryString ? `?${queryString}` : ""}`);
    },
  },

  // Offers
  offers: {
    list: (params?: Record<string, any>) => {
      const query = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            if (Array.isArray(value)) {
              value.forEach((v) => query.append(key, v));
            } else {
              query.append(key, String(value));
            }
          }
        });
      }
      const queryString = query.toString();
      return request<{
        items: any[];
        total: number;
        page: number;
        pages: number;
      }>(`/offers${queryString ? `?${queryString}` : ""}`);
    },
    getById: (id: string, includeOwner?: boolean) => {
      const query = includeOwner ? "?includeOwner=true" : "";
      return request<any>(`/offers/${id}${query}`);
    },
    create: (data: any) =>
      request<any>("/offers", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      request<any>(`/offers/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    delete: (id: string) => request(`/offers/${id}`, { method: "DELETE" }),
  },

  // Analytics
  analytics: {
    get: (params?: { timeRange?: string; groupBy?: string }) => {
      const query = new URLSearchParams();
      if (params?.timeRange) query.append("timeRange", params.timeRange);
      if (params?.groupBy) query.append("groupBy", params.groupBy);
      const queryString = query.toString();
      return request<any>(`/analytics${queryString ? `?${queryString}` : ""}`);
    },
  },
};
