import type { Request, Response } from "express";
import { Offer } from "../models/Offer.js";
import { User } from "../models/User.js";

// Helper function to get date range based on time period
function getDateRange(timeRange: string): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();

  switch (timeRange) {
    case "7d":
      start.setDate(end.getDate() - 7);
      break;
    case "30d":
      start.setDate(end.getDate() - 30);
      break;
    case "90d":
      start.setDate(end.getDate() - 90);
      break;
    case "1y":
      start.setFullYear(end.getFullYear() - 1);
      break;
    case "all":
    default:
      start.setFullYear(2000); // Very old date to get all data
      break;
  }

  return { start, end };
}

// Helper function to format date for grouping
function formatDateForGrouping(date: Date, groupBy: string): string {
  const d = new Date(date);
  switch (groupBy) {
    case "day":
      return d.toISOString().split("T")[0]; // YYYY-MM-DD
    case "week":
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      return weekStart.toISOString().split("T")[0];
    case "month":
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; // YYYY-MM
    case "year":
      return String(d.getFullYear());
    default:
      return d.toISOString().split("T")[0];
  }
}

// GET /api/analytics
export const getAnalytics = async (req: Request, res: Response) => {
  try {
    const timeRange = (req.query.timeRange as string) || "30d";
    const groupBy = (req.query.groupBy as string) || "month"; // day, week, month, year

    const { start, end } = getDateRange(timeRange);

    // Overview Statistics
    const [
      totalJobs,
      activeJobs,
      totalUsers,
      totalEmployers,
      totalJobseekers,
      activeJobseekers,
      newJobsThisMonth,
      newUsersThisMonth,
    ] = await Promise.all([
      Offer.countDocuments(),
      Offer.countDocuments({ isActive: true }),
      User.countDocuments(),
      User.countDocuments({ role: "employer" }),
      User.countDocuments({ role: "jobseeker" }),
      User.countDocuments({
        role: "jobseeker",
        "jobseekerProfile.openToWork": true,
      }),
      Offer.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      }),
      User.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      }),
    ]);

    // Jobs by Source
    const jobsBySource = await Offer.aggregate([
      {
        $group: {
          _id: "$source",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          source: "$_id",
          count: 1,
          _id: 0,
        },
      },
    ]);

    const totalBySource = jobsBySource.reduce((sum, item) => sum + item.count, 0);
    const jobsBySourceWithPercentage = jobsBySource.map((item) => ({
      ...item,
      percentage: totalBySource > 0 ? (item.count / totalBySource) * 100 : 0,
    }));

    // Jobs by Work Mode
    const jobsByWorkMode = await Offer.aggregate([
      {
        $group: {
          _id: "$workMode",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          workMode: "$_id",
          count: 1,
          _id: 0,
        },
      },
    ]);

    const totalByWorkMode = jobsByWorkMode.reduce(
      (sum, item) => sum + item.count,
      0
    );
    const jobsByWorkModeWithPercentage = jobsByWorkMode.map((item) => ({
      ...item,
      percentage:
        totalByWorkMode > 0 ? (item.count / totalByWorkMode) * 100 : 0,
    }));

    // Jobs by Employment Type
    const jobsByType = await Offer.aggregate([
      {
        $group: {
          _id: "$employmentType",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          type: "$_id",
          count: 1,
          _id: 0,
        },
      },
    ]);

    const totalByType = jobsByType.reduce((sum, item) => sum + item.count, 0);
    const jobsByTypeWithPercentage = jobsByType.map((item) => ({
      ...item,
      percentage: totalByType > 0 ? (item.count / totalByType) * 100 : 0,
    }));

    // Top Skills
    const topSkills = await Offer.aggregate([
      { $unwind: { path: "$skills", preserveNullAndEmptyArrays: false } },
      {
        $group: {
          _id: "$skills",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 20 },
      {
        $project: {
          skill: "$_id",
          count: 1,
          _id: 0,
        },
      },
    ]);

    const totalSkills = topSkills.reduce((sum, item) => sum + item.count, 0);
    const topSkillsWithPercentage = topSkills.map((item) => ({
      ...item,
      percentage: totalSkills > 0 ? (item.count / totalSkills) * 100 : 0,
    }));

    // Top Companies
    const topCompanies = await Offer.aggregate([
      {
        $match: {
          companyName: { $exists: true, $ne: null, $ne: "" },
        },
      },
      {
        $group: {
          _id: "$companyName",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 15 },
      {
        $project: {
          companyName: "$_id",
          count: 1,
          _id: 0,
        },
      },
    ]);

    // Jobs by Location (Top Cities)
    const jobsByLocation = await Offer.aggregate([
      {
        $match: {
          "location.city": { $exists: true, $ne: null, $ne: "" },
        },
      },
      {
        $group: {
          _id: "$location.city",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $project: {
          location: "$_id",
          count: 1,
          _id: 0,
        },
      },
    ]);

    // Salary Trends Over Time
    const salaryTrends = await Offer.aggregate([
      {
        $match: {
          postedAt: { $gte: start, $lte: end },
          "salary.min": { $exists: true, $ne: null },
          "salary.max": { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format:
                groupBy === "day"
                  ? "%Y-%m-%d"
                  : groupBy === "week"
                  ? "%Y-W%V"
                  : groupBy === "month"
                  ? "%Y-%m"
                  : "%Y",
              date: "$postedAt",
            },
          },
          averageSalary: {
            $avg: {
              $divide: [
                { $add: ["$salary.min", "$salary.max"] },
                2,
              ],
            },
          },
          minSalary: { $avg: "$salary.min" },
          maxSalary: { $avg: "$salary.max" },
          jobCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          date: "$_id",
          averageSalary: { $round: ["$averageSalary", 0] },
          minSalary: { $round: ["$minSalary", 0] },
          maxSalary: { $round: ["$maxSalary", 0] },
          jobCount: 1,
          _id: 0,
        },
      },
    ]);

    // Jobs Posted Over Time
    const jobsOverTime = await Offer.aggregate([
      {
        $match: {
          postedAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format:
                groupBy === "day"
                  ? "%Y-%m-%d"
                  : groupBy === "week"
                  ? "%Y-W%V"
                  : groupBy === "month"
                  ? "%Y-%m"
                  : "%Y",
              date: "$postedAt",
            },
          },
          count: { $sum: 1 },
          activeCount: {
            $sum: { $cond: ["$isActive", 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          date: "$_id",
          count: 1,
          activeCount: 1,
          _id: 0,
        },
      },
    ]);

    // Users Over Time
    const usersOverTime = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: {
                format:
                  groupBy === "day"
                    ? "%Y-%m-%d"
                    : groupBy === "week"
                    ? "%Y-W%V"
                    : groupBy === "month"
                    ? "%Y-%m"
                    : "%Y",
                date: "$createdAt",
              },
            },
            role: "$role",
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.date",
          employers: {
            $sum: { $cond: [{ $eq: ["$_id.role", "employer"] }, "$count", 0] },
          },
          jobseekers: {
            $sum: {
              $cond: [{ $eq: ["$_id.role", "jobseeker"] }, "$count", 0],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          date: "$_id",
          employers: 1,
          jobseekers: 1,
          total: { $add: ["$employers", "$jobseekers"] },
          _id: 0,
        },
      },
    ]);

    // Engagement Metrics
    const engagementMetrics = await User.aggregate([
      {
        $project: {
          role: 1,
          savedOffersCount: {
            $cond: [
              { $isArray: "$savedOffers" },
              { $size: "$savedOffers" },
              0,
            ],
          },
          savedJobseekersCount: {
            $cond: [
              { $isArray: "$savedJobseekers" },
              { $size: "$savedJobseekers" },
              0,
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          totalSavedOffers: { $sum: "$savedOffersCount" },
          totalSavedJobseekers: { $sum: "$savedJobseekersCount" },
          jobseekersWithSaves: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$role", "jobseeker"] },
                    { $gt: ["$savedOffersCount", 0] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    const engagement = engagementMetrics[0] || {
      totalSavedOffers: 0,
      totalSavedJobseekers: 0,
      jobseekersWithSaves: 0,
    };

    const averageSavesPerJobseeker =
      engagement.jobseekersWithSaves > 0
        ? engagement.totalSavedOffers / engagement.jobseekersWithSaves
        : 0;

    // Format Ukrainian month names for display
    const monthNames: Record<string, string> = {
      "01": "Січ",
      "02": "Лют",
      "03": "Бер",
      "04": "Кві",
      "05": "Тра",
      "06": "Чер",
      "07": "Лип",
      "08": "Сер",
      "09": "Вер",
      "10": "Жов",
      "11": "Лис",
      "12": "Гру",
    };

    const formatDateForDisplay = (dateStr: string): string => {
      if (groupBy === "month" && dateStr.match(/^\d{4}-\d{2}$/)) {
        const [, month] = dateStr.split("-");
        const year = dateStr.split("-")[0];
        return `${monthNames[month] || month} ${year}`;
      }
      if (groupBy === "day" && dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateStr.split("-");
        return `${day}.${month}.${year}`;
      }
      return dateStr;
    };

    res.json({
      // Overview
      totalJobs,
      activeJobs,
      totalUsers,
      totalEmployers,
      totalJobseekers,
      activeJobseekers,
      newJobsThisMonth,
      newUsersThisMonth,

      // Breakdowns
      jobsBySource: jobsBySourceWithPercentage,
      jobsByWorkMode: jobsByWorkModeWithPercentage,
      jobsByType: jobsByTypeWithPercentage,
      jobsByLocation,
      topCompanies,
      topSkills: topSkillsWithPercentage,

      // Time series
      salaryTrends: salaryTrends.map((item) => ({
        ...item,
        date: formatDateForDisplay(item.date),
      })),
      jobsOverTime: jobsOverTime.map((item) => ({
        ...item,
        date: formatDateForDisplay(item.date),
      })),
      usersOverTime: usersOverTime.map((item) => ({
        ...item,
        date: formatDateForDisplay(item.date),
      })),

      // Engagement
      totalSavedOffers: engagement.totalSavedOffers,
      totalSavedJobseekers: engagement.totalSavedJobseekers,
      averageSavesPerJobseeker: Math.round(averageSavesPerJobseeker * 10) / 10,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({ message: "Error fetching analytics data" });
  }
};

