// Types for Offer (matches back-end)
export interface Offer {
  _id: string;
  createdBy?: string | {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    employerProfile?: {
      companyName?: string;
      companyWebsite?: string;
    };
    imageUrl?: string;
  };
  source: "internal" | "linkedin_api" | "internships_api";
  sourceId?: string;
  sourceUrl?: string;
  applyUrl?: string;
  title: string;
  descriptionText?: string;
  descriptionHtml?: string;
  companyName?: string;
  companyWebsite?: string;
  companyIndustry?: string;
  companyLogo?: string;
  location?: {
    city?: string;
    region?: string;
    country?: string;
    formatted?: string;
    lat?: number;
    lng?: number;
    timezone?: string;
  };
  workMode: "remote" | "in-office" | "hybrid" | "unspecified";
  employmentType: "fulltime" | "part-time" | "contract" | "internship" | "unspecified";
  postedAt?: string;
  validThrough?: string;
  salary?: {
    currency?: string;
    min?: number;
    max?: number;
    unit?: string;
    rawText?: string;
  };
  skills?: string[];
  tags?: string[];
  isActive: boolean;
  isSaved?: boolean; // Added by API for authenticated users
  createdAt?: string;
  updatedAt?: string;
}

// Legacy type alias for compatibility
export interface JobVacancy extends Offer {
  id: string;
  company: string;
  location: string;
  category: string;
  description: string;
  requirements: string[];
  benefits: string[];
  experienceLevel: "junior" | "middle" | "senior" | "lead";
  remote: boolean;
  postedDate: string;
  expiryDate?: string;
  views: number;
  applications: number;
}

// Types for User (matches back-end)
export interface User {
  _id: string;
  id?: string; // Legacy compatibility
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  description?: string;
  role: "employer" | "jobseeker";
  imageUrl?: string;
  contacts?: {
    email?: string;
    phone?: string;
  };
  employerProfile?: {
    companyName?: string;
    companyWebsite?: string;
    companyDescription?: string;
  };
  jobseekerProfile?: {
    stack: string[];
    portfolioUrls?: string[];
    cvUrls?: string[];
    openToWork: boolean;
    preferences: {
      employmentTypes: string[];
      workModes: string[];
    };
    studies: Array<{
      title: string;
      organization: string;
      yearFrom?: number;
      yearTo?: number;
    }>;
  };
  isSaved?: boolean; // Added by API for employers viewing jobseekers
  createdAt?: string;
  updatedAt?: string;
  
  // Legacy compatibility fields
  name?: string;
  avatar?: string;
  phone?: string;
  location?: string;
  bio?: string;
  company?: string;
}

// Types for Job Category
export interface JobCategory {
  id: string;
  name: string;
  nameUk: string;
  icon?: string;
  jobCount: number;
  popularity: number;
}

// Types for Filters
export interface JobFilters {
  q?: string; // Search query
  source?: "internal" | "linkedin_api" | "internships_api";
  workMode?: "remote" | "in-office" | "hybrid" | "unspecified";
  employmentType?: "fulltime" | "part-time" | "contract" | "internship" | "unspecified";
  isActive?: boolean;
  // Location filters
  locationCity?: string;
  locationCountry?: string;
  // Salary filters
  salaryMin?: number;
  salaryMax?: number;
  // Skills filter
  skills?: string[];
  // Company filter
  companyName?: string;
  // Date range filters
  postedAfter?: string; // ISO date string
  postedBefore?: string; // ISO date string
  // Pagination
  page?: number;
  limit?: number;
  // Sorting
  sortBy?: "postedAt" | "scrapedAt" | "companyName" | "title" | "createdAt" | "salary";
  sortDir?: "asc" | "desc";
  
  // Legacy compatibility
  search?: string;
  category?: string;
  location?: string;
  experienceLevel?: string[];
  remote?: boolean;
  datePosted?: string;
}

export interface JobseekerFilters {
  q?: string;
  openToWork?: boolean;
  employmentTypes?: string[];
  workModes?: string[];
  skills?: string[];
  // Date range filters
  createdAfter?: string; // ISO date string
  createdBefore?: string; // ISO date string
  updatedAfter?: string; // ISO date string
  updatedBefore?: string; // ISO date string
  // Sorting
  sortBy?: "newest" | "oldest" | "firstName" | "lastName" | "dateOfBirth" | "createdAt" | "updatedAt";
  sortDir?: "asc" | "desc";
  // Pagination
  page?: number;
  limit?: number;
}

// Types for Analytics
export interface AnalyticsData {
  // Overview stats
  totalJobs: number;
  activeJobs: number;
  totalUsers: number;
  totalEmployers: number;
  totalJobseekers: number;
  activeJobseekers: number;
  newJobsThisMonth: number;
  newUsersThisMonth: number;

  // Breakdowns
  jobsBySource: {
    source: "internal" | "linkedin_api" | "internships_api";
    count: number;
    percentage: number;
  }[];

  jobsByWorkMode: {
    workMode: "remote" | "in-office" | "hybrid" | "unspecified";
    count: number;
    percentage: number;
  }[];

  jobsByType: {
    type: "fulltime" | "part-time" | "contract" | "internship" | "unspecified";
    count: number;
    percentage: number;
  }[];

  jobsByLocation: {
    location: string;
    count: number;
  }[];

  topCompanies: {
    companyName: string;
    count: number;
  }[];

  topSkills: {
    skill: string;
    count: number;
    percentage: number;
  }[];

  // Time series
  salaryTrends: {
    date: string;
    averageSalary: number;
    minSalary: number;
    maxSalary: number;
    jobCount: number;
  }[];

  jobsOverTime: {
    date: string;
    count: number;
    activeCount: number;
  }[];

  usersOverTime: {
    date: string;
    total: number;
    employers: number;
    jobseekers: number;
  }[];

  // Engagement
  totalSavedOffers: number;
  totalSavedJobseekers: number;
  averageSavesPerJobseeker: number;

  // Legacy fields for backward compatibility
  categories?: {
    category: string;
    count: number;
    percentage: number;
  }[];
  popularCategories?: {
    category: string;
    count: number;
    trend: "up" | "down" | "stable";
  }[];
  jobsByExperience?: {
    level: string;
    count: number;
  }[];
}

// Types for Saved/Viewed Jobs
export interface SavedJob {
  id: string;
  jobId: string;
  userId: string;
  savedAt: string;
}

export interface ViewedJob {
  id: string;
  jobId: string;
  userId: string;
  viewedAt: string;
}



