// "use server";

// import prisma from "@/lib/core/prisma";
// import { redirect } from "next/navigation";
// import { AuthError } from "next-auth"; 
// import { hash } from "@node-rs/bcrypt";
// import { z } from "zod";

// const RegisterSchema = z
//   .object({
//     // Add username field
//     username: z
//       .string()
//       .min(3, "Username must be at least 3 characters")
//       .max(20, "Username must be at most 20 characters")
//       .regex(
//         /^[a-zA-Z0-9_]+$/,
//         "Username can only contain letters, numbers, and underscores"
//       ),
//     // Removed name field if not needed for Account model
//     // name: z.string().min(1, "Full Name is required"),
//     // Removed email field if username is the primary identifier
//     // email: z.string().email("Invalid email address"),
//     password: z.string().min(8, "Password must be at least 8 characters"),
//     confirmPassword: z.string(),
//   })
//   .refine((data) => data.password === data.confirmPassword, {
//     message: "Passwords do not match",
//     path: ["confirmPassword"], // Point error to the confirmation field
//   });

// export type RegisterState =
//   | {
//       errors?: {
//         username?: string[];
//         // name?: string[];
//         // email?: string[];
//         password?: string[];
//         confirmPassword?: string[];
//         server?: string[]; // For general server errors
//       };
//       message?: string | null;
//     }
//   | undefined;

// export async function registerUser(
//   prevState: RegisterState,
//   formData: FormData
// ): Promise<RegisterState> {
//   // 1. Validate form data
//   const validatedFields = RegisterSchema.safeParse(
//     Object.fromEntries(formData.entries())
//   );

//   if (!validatedFields.success) {
//     console.log(
//       "Validation Errors:",
//       validatedFields.error.flatten().fieldErrors
//     );
//     return {
//       errors: validatedFields.error.flatten().fieldErrors,
//       message: "Invalid registration data.",
//     };
//   }

//   const { username, password } = validatedFields.data;

//   try {
//     // 2. Check if username already exists
//     const existingUser = await prisma.account.findUnique({
//       where: { username },
//     });

//     if (existingUser) {
//       return {
//         errors: { server: ["Username already taken."] },
//         message: "Registration failed.",
//       };
//     }

//     // 3. Hash the password
//     const hashedPassword = await hash(password, 12); // Use appropriate salt rounds

//     // 4. Create the user in the database
//     await prisma.account.create({
//       data: {
//         username,
//         password: hashedPassword,
//         // Add default role if needed, e.g., role: 'USER'
//         // Your prisma schema already defaults role to USER
//       },
//     });

//     console.log(`User ${username} registered successfully.`);
//     // Optionally log the user in immediately after registration
//     // try {
//     //   await signIn('credentials', { username, password, redirect: false });
//     // } catch (error) {
//     //    // Handle potential sign-in error after successful registration
//     //    console.error("Auto sign-in failed:", error);
//     //    // Don't block redirect, let them log in manually
//     // }
//   } catch (error) {
//     console.error("Registration Error:", error);
//     if (error instanceof AuthError) {
//       // Handle specific NextAuth errors if you were auto-signing in
//       return {
//         errors: { server: ["Something went wrong during auto sign-in."] },
//         message: "Registration successful, but auto sign-in failed.",
//       };
//     }
//     return {
//       errors: { server: ["Database Error: Failed to create user."] },
//       message: "Registration failed.",
//     };
//   }

//   // 5. Redirect to login page on success
//   redirect("/auth/login?registered=true"); // Add a query param for feedback
// }
