import { z } from "zod";

const roleEnum = z.enum(["employer", "jobseeker"]);

const commaList = z.string().transform((s) =>
  s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean)
);

export const registerSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    dateOfBirth: z.coerce.date(),
    description: z.string().max(4000).optional(),
    role: roleEnum,

    // employer
    companyName: z.string().optional(),
    companyWebsite: z.string().url().optional(),
    companyDescription: z.string().optional(),

    // jobseeker
    stack: z.union([commaList, z.array(z.string())]).optional(),
    portfolioUrls: z.union([commaList, z.array(z.string().url())]).optional(),
  })
  .superRefine((val, ctx) => {
    if (val.role === "employer" && !val.companyName) {
      ctx.addIssue({
        code: "custom",
        path: ["companyName"],
        message: "companyName is required for employer",
      });
    }
  });

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const requestResetSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});