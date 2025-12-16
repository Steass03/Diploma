import { AnalyticsData, Offer, User } from "@/types";

// Mock Analytics Data - реалістичні дані для аналітики
export const mockAnalyticsData: AnalyticsData = {
  // Overview stats
  totalJobs: 1247,
  activeJobs: 892,
  totalUsers: 3421,
  totalEmployers: 456,
  totalJobseekers: 2965,
  activeJobseekers: 2134,
  newJobsThisMonth: 187,
  newUsersThisMonth: 234,

  // Breakdowns
  jobsBySource: [
    { source: "internal", count: 523, percentage: 41.9 },
    { source: "linkedin_api", count: 456, percentage: 36.5 },
    { source: "internships_api", count: 268, percentage: 21.5 },
  ],

  jobsByWorkMode: [
    { workMode: "remote", count: 456, percentage: 36.5 },
    { workMode: "hybrid", count: 389, percentage: 31.2 },
    { workMode: "in-office", count: 312, percentage: 25.0 },
    { workMode: "unspecified", count: 90, percentage: 7.2 },
  ],

  jobsByType: [
    { type: "fulltime", count: 823, percentage: 65.9 },
    { type: "part-time", count: 187, percentage: 15.0 },
    { type: "contract", count: 156, percentage: 12.5 },
    { type: "internship", count: 81, percentage: 6.5 },
  ],

  jobsByLocation: [
    { location: "Київ", count: 456 },
    { location: "Львів", count: 234 },
    { location: "Одеса", count: 187 },
    { location: "Харків", count: 156 },
    { location: "Дніпро", count: 134 },
    { location: "Запоріжжя", count: 45 },
    { location: "Вінниця", count: 35 },
  ],

  topCompanies: [
    { companyName: "EPAM Systems", count: 45 },
    { companyName: "Luxoft", count: 38 },
    { companyName: "SoftServe", count: 34 },
    { companyName: "GlobalLogic", count: 29 },
    { companyName: "Ciklum", count: 26 },
    { companyName: "N-iX", count: 23 },
    { companyName: "DataArt", count: 21 },
    { companyName: "Sigma Software", count: 19 },
    { companyName: "Infopulse", count: 17 },
    { companyName: "ELEKS", count: 15 },
  ],

  topSkills: [
    { skill: "JavaScript", count: 456, percentage: 18.2 },
    { skill: "TypeScript", count: 389, percentage: 15.5 },
    { skill: "React", count: 367, percentage: 14.6 },
    { skill: "Node.js", count: 312, percentage: 12.4 },
    { skill: "Python", count: 289, percentage: 11.5 },
    { skill: "Java", count: 234, percentage: 9.3 },
    { skill: "C#", count: 198, percentage: 7.9 },
    { skill: "Angular", count: 156, percentage: 6.2 },
    { skill: "Vue.js", count: 134, percentage: 5.3 },
    { skill: "Docker", count: 123, percentage: 4.9 },
    { skill: "Kubernetes", count: 98, percentage: 3.9 },
    { skill: "AWS", count: 87, percentage: 3.5 },
    { skill: "PostgreSQL", count: 76, percentage: 3.0 },
    { skill: "MongoDB", count: 65, percentage: 2.6 },
    { skill: "Redis", count: 54, percentage: 2.2 },
  ],

  // Time series - останні 6 місяців
  salaryTrends: [
    { date: "Сер 2024", averageSalary: 125000, minSalary: 80000, maxSalary: 180000, jobCount: 145 },
    { date: "Вер 2024", averageSalary: 128000, minSalary: 82000, maxSalary: 185000, jobCount: 156 },
    { date: "Жов 2024", averageSalary: 131000, minSalary: 85000, maxSalary: 190000, jobCount: 167 },
    { date: "Лис 2024", averageSalary: 134000, minSalary: 87000, maxSalary: 195000, jobCount: 178 },
    { date: "Гру 2024", averageSalary: 137000, minSalary: 90000, maxSalary: 200000, jobCount: 189 },
    { date: "Січ 2025", averageSalary: 140000, minSalary: 92000, maxSalary: 205000, jobCount: 201 },
  ],

  jobsOverTime: [
    { date: "Сер 2024", count: 187, activeCount: 145 },
    { date: "Вер 2024", count: 203, activeCount: 156 },
    { date: "Жов 2024", count: 219, activeCount: 167 },
    { date: "Лис 2024", count: 234, activeCount: 178 },
    { date: "Гру 2024", count: 245, activeCount: 189 },
    { date: "Січ 2025", count: 259, activeCount: 201 },
  ],

  usersOverTime: [
    { date: "Сер 2024", total: 2890, employers: 389, jobseekers: 2501 },
    { date: "Вер 2024", total: 3012, employers: 412, jobseekers: 2600 },
    { date: "Жов 2024", total: 3156, employers: 432, jobseekers: 2724 },
    { date: "Лис 2024", total: 3289, employers: 445, jobseekers: 2844 },
    { date: "Гру 2024", total: 3367, employers: 451, jobseekers: 2916 },
    { date: "Січ 2025", total: 3421, employers: 456, jobseekers: 2965 },
  ],

  // Engagement
  totalSavedOffers: 4567,
  totalSavedJobseekers: 1234,
  averageSavesPerJobseeker: 2.1,
};

// Mock Offers - приклади вакансій
export const mockOffers: Offer[] = [
  {
    _id: "mock-1",
    source: "internal",
    title: "Senior Frontend Developer (React/TypeScript)",
    descriptionText: "Шукаємо досвідченого Frontend розробника для роботи над сучасними веб-додатками. Потрібен досвід роботи з React, TypeScript, та сучасними інструментами розробки.",
    companyName: "EPAM Systems",
    companyWebsite: "https://www.epam.com",
    location: {
      city: "Київ",
      region: "Київська область",
      country: "Україна",
      formatted: "Київ, Україна",
    },
    workMode: "hybrid",
    employmentType: "fulltime",
    postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    salary: {
      currency: "UAH",
      min: 120000,
      max: 180000,
      unit: "monthly",
    },
    skills: ["React", "TypeScript", "JavaScript", "Redux", "CSS"],
    tags: ["frontend", "react", "typescript"],
    isActive: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "mock-2",
    source: "linkedin_api",
    title: "Full Stack Developer (Node.js + React)",
    descriptionText: "Компанія шукає Full Stack розробника для роботи над фінтех проєктом. Потрібен досвід з Node.js, React, PostgreSQL.",
    companyName: "SoftServe",
    companyWebsite: "https://www.softserveinc.com",
    location: {
      city: "Львів",
      region: "Львівська область",
      country: "Україна",
      formatted: "Львів, Україна",
    },
    workMode: "remote",
    employmentType: "fulltime",
    postedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    salary: {
      currency: "UAH",
      min: 100000,
      max: 150000,
      unit: "monthly",
    },
    skills: ["Node.js", "React", "PostgreSQL", "TypeScript", "Express"],
    tags: ["fullstack", "nodejs", "react"],
    isActive: true,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "mock-3",
    source: "internships_api",
    title: "Python Developer Intern",
    descriptionText: "Стажування для початківців Python розробників. Навчання та менторство від досвідчених розробників.",
    companyName: "GlobalLogic",
    companyWebsite: "https://www.globallogic.com",
    location: {
      city: "Київ",
      region: "Київська область",
      country: "Україна",
      formatted: "Київ, Україна",
    },
    workMode: "hybrid",
    employmentType: "internship",
    postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    salary: {
      currency: "UAH",
      min: 15000,
      max: 25000,
      unit: "monthly",
      rawText: "15,000 - 25,000 UAH",
    },
    skills: ["Python", "Django", "SQL", "Git"],
    tags: ["internship", "python", "junior"],
    isActive: true,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "mock-4",
    source: "internal",
    title: "DevOps Engineer",
    descriptionText: "Шукаємо DevOps інженера для налаштування CI/CD, роботи з Kubernetes, AWS, та автоматизації процесів розробки.",
    companyName: "Luxoft",
    companyWebsite: "https://www.luxoft.com",
    location: {
      city: "Одеса",
      region: "Одеська область",
      country: "Україна",
      formatted: "Одеса, Україна",
    },
    workMode: "remote",
    employmentType: "fulltime",
    postedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    salary: {
      currency: "UAH",
      min: 140000,
      max: 200000,
      unit: "monthly",
    },
    skills: ["Kubernetes", "Docker", "AWS", "CI/CD", "Terraform"],
    tags: ["devops", "kubernetes", "aws"],
    isActive: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "mock-5",
    source: "linkedin_api",
    title: "Java Backend Developer",
    descriptionText: "Розробка backend систем для фінансового сектору. Робота з Spring Boot, Microservices, PostgreSQL.",
    companyName: "Ciklum",
    companyWebsite: "https://www.ciklum.com",
    location: {
      city: "Харків",
      region: "Харківська область",
      country: "Україна",
      formatted: "Харків, Україна",
    },
    workMode: "in-office",
    employmentType: "fulltime",
    postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    salary: {
      currency: "UAH",
      min: 110000,
      max: 160000,
      unit: "monthly",
    },
    skills: ["Java", "Spring Boot", "PostgreSQL", "Microservices", "REST API"],
    tags: ["java", "backend", "spring"],
    isActive: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "mock-6",
    source: "internal",
    title: "QA Engineer (Manual + Automation)",
    descriptionText: "Шукаємо QA інженера з досвідом ручного та автоматизованого тестування. Робота з Selenium, Cypress, Postman.",
    companyName: "N-iX",
    companyWebsite: "https://www.n-ix.com",
    location: {
      city: "Львів",
      region: "Львівська область",
      country: "Україна",
      formatted: "Львів, Україна",
    },
    workMode: "hybrid",
    employmentType: "fulltime",
    postedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    salary: {
      currency: "UAH",
      min: 80000,
      max: 120000,
      unit: "monthly",
    },
    skills: ["QA", "Selenium", "Cypress", "Postman", "Test Automation"],
    tags: ["qa", "testing", "automation"],
    isActive: true,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "mock-7",
    source: "linkedin_api",
    title: "UI/UX Designer",
    descriptionText: "Створення дизайну інтерфейсів для мобільних та веб-додатків. Робота з Figma, Adobe XD, прототипування.",
    companyName: "DataArt",
    companyWebsite: "https://www.dataart.com",
    location: {
      city: "Київ",
      region: "Київська область",
      country: "Україна",
      formatted: "Київ, Україна",
    },
    workMode: "remote",
    employmentType: "fulltime",
    postedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    salary: {
      currency: "UAH",
      min: 90000,
      max: 140000,
      unit: "monthly",
    },
    skills: ["Figma", "Adobe XD", "UI/UX Design", "Prototyping", "User Research"],
    tags: ["design", "ui", "ux"],
    isActive: true,
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "mock-8",
    source: "internal",
    title: "Angular Developer",
    descriptionText: "Розробка клієнтської частини веб-додатків на Angular. Робота з TypeScript, RxJS, Angular Material.",
    companyName: "Sigma Software",
    companyWebsite: "https://www.sigmasoftware.com",
    location: {
      city: "Дніпро",
      region: "Дніпропетровська область",
      country: "Україна",
      formatted: "Дніпро, Україна",
    },
    workMode: "hybrid",
    employmentType: "fulltime",
    postedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    salary: {
      currency: "UAH",
      min: 95000,
      max: 145000,
      unit: "monthly",
    },
    skills: ["Angular", "TypeScript", "RxJS", "Angular Material", "JavaScript"],
    tags: ["angular", "frontend", "typescript"],
    isActive: true,
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "mock-9",
    source: "internships_api",
    title: "React Developer (Junior)",
    descriptionText: "Стажування для початківців React розробників. Навчання та менторство, можливість росту до Middle розробника.",
    companyName: "ELEKS",
    companyWebsite: "https://www.eleks.com",
    location: {
      city: "Львів",
      region: "Львівська область",
      country: "Україна",
      formatted: "Львів, Україна",
    },
    workMode: "remote",
    employmentType: "internship",
    postedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    salary: {
      currency: "UAH",
      min: 12000,
      max: 20000,
      unit: "monthly",
      rawText: "12,000 - 20,000 UAH",
    },
    skills: ["React", "JavaScript", "HTML", "CSS", "Git"],
    tags: ["internship", "react", "junior"],
    isActive: true,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "mock-10",
    source: "internal",
    title: "Product Manager",
    descriptionText: "Управління продуктом, робота з командою розробки, аналіз ринку, планування roadmap. Досвід роботи з IT продуктами.",
    companyName: "Infopulse",
    companyWebsite: "https://www.infopulse.com",
    location: {
      city: "Київ",
      region: "Київська область",
      country: "Україна",
      formatted: "Київ, Україна",
    },
    workMode: "hybrid",
    employmentType: "fulltime",
    postedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    salary: {
      currency: "UAH",
      min: 130000,
      max: 190000,
      unit: "monthly",
    },
    skills: ["Product Management", "Agile", "Scrum", "Analytics", "Roadmap"],
    tags: ["product", "management", "agile"],
    isActive: true,
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Mock Users - приклади користувачів
export const mockUsers: User[] = [
  {
    _id: "mock-user-1",
    email: "ivan.petrov@example.com",
    firstName: "Іван",
    lastName: "Петров",
    role: "jobseeker",
    description: "Досвідчений Frontend розробник з 5+ роками досвіду. Спеціалізуюся на React та TypeScript.",
    imageUrl: undefined,
    jobseekerProfile: {
      stack: ["React", "TypeScript", "JavaScript", "Redux", "CSS", "HTML"],
      openToWork: true,
      preferences: {
        employmentTypes: ["fulltime", "part-time"],
        workModes: ["remote", "hybrid"],
      },
      studies: [
        {
          title: "Комп'ютерні науки",
          organization: "КНУ ім. Тараса Шевченка",
          yearFrom: 2015,
          yearTo: 2019,
        },
      ],
    },
    createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "mock-user-2",
    email: "maria.kovalenko@example.com",
    firstName: "Марія",
    lastName: "Коваленко",
    role: "jobseeker",
    description: "Full Stack розробник з досвідом роботи з Node.js та React. Шукаю цікаві проєкти.",
    imageUrl: undefined,
    jobseekerProfile: {
      stack: ["Node.js", "React", "PostgreSQL", "TypeScript", "Express"],
      openToWork: true,
      preferences: {
        employmentTypes: ["fulltime"],
        workModes: ["remote"],
      },
      studies: [
        {
          title: "Програмна інженерія",
          organization: "ЛНУ ім. Івана Франка",
          yearFrom: 2016,
          yearTo: 2020,
        },
      ],
    },
    createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "mock-user-3",
    email: "oleksandr.shevchenko@example.com",
    firstName: "Олександр",
    lastName: "Шевченко",
    role: "employer",
    description: "HR Manager в IT компанії",
    imageUrl: undefined,
    employerProfile: {
      companyName: "Tech Solutions Ukraine",
      companyWebsite: "https://www.techsolutions.ua",
      companyDescription: "IT компанія, що спеціалізується на розробці веб-додатків",
    },
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "mock-user-4",
    email: "olena.melnyk@example.com",
    firstName: "Олена",
    lastName: "Мельник",
    role: "jobseeker",
    description: "QA Engineer з досвідом автоматизованого тестування. Працювала з Selenium, Cypress, Postman.",
    imageUrl: undefined,
    jobseekerProfile: {
      stack: ["QA", "Selenium", "Cypress", "Postman", "Test Automation", "JavaScript"],
      openToWork: true,
      preferences: {
        employmentTypes: ["fulltime"],
        workModes: ["remote", "hybrid"],
      },
      studies: [
        {
          title: "Комп'ютерна інженерія",
          organization: "НТУУ КПІ",
          yearFrom: 2014,
          yearTo: 2018,
        },
      ],
    },
    createdAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "mock-user-5",
    email: "dmitro.koval@example.com",
    firstName: "Дмитро",
    lastName: "Коваль",
    role: "jobseeker",
    description: "Backend розробник з досвідом роботи з Java та Spring Boot. Шукаю цікаві проєкти в фінтех сфері.",
    imageUrl: undefined,
    jobseekerProfile: {
      stack: ["Java", "Spring Boot", "PostgreSQL", "Microservices", "Docker", "Kubernetes"],
      openToWork: true,
      preferences: {
        employmentTypes: ["fulltime"],
        workModes: ["remote"],
      },
      studies: [
        {
          title: "Програмна інженерія",
          organization: "ХНУ ім. В.Н. Каразіна",
          yearFrom: 2013,
          yearTo: 2017,
        },
      ],
    },
    createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "mock-user-6",
    email: "natalia.sydorenko@example.com",
    firstName: "Наталія",
    lastName: "Сидоренко",
    role: "jobseeker",
    description: "UI/UX Designer з досвідом створення дизайну для мобільних та веб-додатків. Працюю з Figma, Adobe XD.",
    imageUrl: undefined,
    jobseekerProfile: {
      stack: ["Figma", "Adobe XD", "UI/UX Design", "Prototyping", "User Research"],
      openToWork: false,
      preferences: {
        employmentTypes: ["fulltime", "part-time"],
        workModes: ["remote", "hybrid"],
      },
      studies: [
        {
          title: "Графічний дизайн",
          organization: "КНУТД",
          yearFrom: 2015,
          yearTo: 2019,
        },
      ],
    },
    createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "mock-user-7",
    email: "andriy.bondarenko@example.com",
    firstName: "Андрій",
    lastName: "Бондаренко",
    role: "jobseeker",
    description: "DevOps інженер з досвідом налаштування CI/CD, роботи з Kubernetes, AWS. Автоматизація процесів розробки.",
    imageUrl: undefined,
    jobseekerProfile: {
      stack: ["Kubernetes", "Docker", "AWS", "CI/CD", "Terraform", "Jenkins"],
      openToWork: true,
      preferences: {
        employmentTypes: ["fulltime"],
        workModes: ["remote"],
      },
      studies: [
        {
          title: "Комп'ютерні науки",
          organization: "КНУ ім. Тараса Шевченка",
          yearFrom: 2012,
          yearTo: 2016,
        },
      ],
    },
    createdAt: new Date(Date.now() - 170 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Helper function to check if analytics data is empty
export function isAnalyticsEmpty(data: AnalyticsData | null): boolean {
  if (!data) return true;
  return (
    data.totalJobs === 0 &&
    data.totalUsers === 0 &&
    data.jobsBySource.length === 0 &&
    data.jobsOverTime.length === 0
  );
}

// Helper function to merge real data with mock data (fallback)
export function mergeAnalyticsData(realData: AnalyticsData | null): AnalyticsData {
  if (!realData || isAnalyticsEmpty(realData)) {
    return mockAnalyticsData;
  }
  
  // Merge real data with mock data where real data is missing
  return {
    ...mockAnalyticsData,
    ...realData,
    // Keep real data if it exists, otherwise use mock
    jobsBySource: realData.jobsBySource.length > 0 ? realData.jobsBySource : mockAnalyticsData.jobsBySource,
    jobsByWorkMode: realData.jobsByWorkMode.length > 0 ? realData.jobsByWorkMode : mockAnalyticsData.jobsByWorkMode,
    jobsByType: realData.jobsByType.length > 0 ? realData.jobsByType : mockAnalyticsData.jobsByType,
    jobsByLocation: realData.jobsByLocation.length > 0 ? realData.jobsByLocation : mockAnalyticsData.jobsByLocation,
    topCompanies: realData.topCompanies.length > 0 ? realData.topCompanies : mockAnalyticsData.topCompanies,
    topSkills: realData.topSkills.length > 0 ? realData.topSkills : mockAnalyticsData.topSkills,
    salaryTrends: realData.salaryTrends.length > 0 ? realData.salaryTrends : mockAnalyticsData.salaryTrends,
    jobsOverTime: realData.jobsOverTime.length > 0 ? realData.jobsOverTime : mockAnalyticsData.jobsOverTime,
    usersOverTime: realData.usersOverTime.length > 0 ? realData.usersOverTime : mockAnalyticsData.usersOverTime,
  };
}

