
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const jsonResponse = (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), {
        status,
        headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
        },
    });

Deno.serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    if (req.method !== "POST") {
        return jsonResponse(
            { success: false, message: "Method not allowed" },
            405,
        );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
        return jsonResponse(
            {
                success: false,
                message: "Server configuration is missing",
            },
            500,
        );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });

    let createdUserId: string | null = null;

    try {
        // 1. Verify logged-in Admin
        const authHeader = req.headers.get("Authorization");

        if (!authHeader?.startsWith("Bearer ")) {
            return jsonResponse(
                {
                    success: false,
                    message: "Authorization token is required",
                },
                401,
            );
        }

        const token = authHeader.slice("Bearer ".length);

        const { data: authData, error: authError } =
            await supabase.auth.getUser(token);

        if (authError || !authData.user) {
            return jsonResponse(
                {
                    success: false,
                    message: "Invalid or expired login session",
                },
                401,
            );
        }

        const callerId = authData.user.id;

        // 2. Verify Admin role
        const { data: callerRole, error: roleError } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", callerId)
            .maybeSingle();

        if (roleError) throw roleError;

        if (callerRole?.role !== "admin") {
            return jsonResponse(
                {
                    success: false,
                    message: "Only Admin users can create student accounts",
                },
                403,
            );
        }

        // 3. Read and validate input
        const body = await req.json();

        const username = String(body.username ?? "")
            .trim()
            .toLowerCase();

        const password = String(body.password ?? "");
        const fullName = String(body.full_name ?? "").trim();
        const phoneNumber = String(body.phone_number ?? "").trim();

        const college =
            typeof body.college === "string" && body.college.trim()
                ? body.college.trim()
                : null;

        const branch =
            typeof body.branch === "string" && body.branch.trim()
                ? body.branch.trim()
                : null;

        const yearOfStudy =
            typeof body.year_of_study === "string" &&
                body.year_of_study.trim()
                ? body.year_of_study.trim()
                : null;

        const courseIds: string[] = Array.isArray(body.course_ids)
            ? [
                ...new Set(
                    body.course_ids.filter(
                        (id: unknown) =>
                            typeof id === "string" && id.trim() !== "",
                    ),
                ),
            ]
            : [];

        if (!username || !password || !fullName) {
            return jsonResponse(
                {
                    success: false,
                    message: "Username, password and full name are required",
                },
                400,
            );
        }

        if (!/^[a-z0-9._-]{3,30}$/.test(username)) {
            return jsonResponse(
                {
                    success: false,
                    message:
                        "Username must be 3-30 characters and contain only letters, numbers, dots, underscores or hyphens",
                },
                400,
            );
        }

        if (password.length < 8) {
            return jsonResponse(
                {
                    success: false,
                    message: "Password must contain at least 8 characters",
                },
                400,
            );
        }

        // 4. Generate internal email for username login
        const email = `${username}@student.skillnova.edu`;

        // 5. Create Supabase Auth account
        // The on_auth_user_created trigger creates the profile automatically.
        const { data: newAuth, error: createAuthError } =
            await supabase.auth.admin.createUser({
                email,
                password,
                email_confirm: true,
                user_metadata: {
                    full_name: fullName,
                    username,
                    phone_number: phoneNumber || null,
                },
            });

        if (createAuthError) {
            return jsonResponse(
                {
                    success: false,
                    message: createAuthError.message,
                },
                400,
            );
        }

        if (!newAuth.user) {
            throw new Error("Unable to create authentication account");
        }

        createdUserId = newAuth.user.id;

        // 6. Update the profile created by the database trigger.
        // Do NOT insert another profile with the same ID.
        const { data: updatedProfile, error: profileError } =
            await supabase
                .from("profiles")
                .update({
                    email,
                    full_name: fullName,
                    username,
                    phone_number: phoneNumber || null,
                })
                .eq("id", createdUserId)
                .select("id")
                .maybeSingle();

        if (profileError) throw profileError;

        if (!updatedProfile) {
            throw new Error(
                "Profile was not created by the on_auth_user_created trigger",
            );
        }

        // 7. Assign Student role
        // 7. Update the role already created by the database trigger
        const { data: updatedRole, error: userRoleError } = await supabase
            .from("user_roles")
            .update({
                role: "student",
                assigned_by: callerId,
            })
            .eq("user_id", createdUserId)
            .select("user_id")
            .maybeSingle();

        if (userRoleError) throw userRoleError;

        if (!updatedRole) {
            throw new Error(
                "Student role was not created by the database trigger"
            );
        }

        // 8. Create student record
        const { error: studentError } = await supabase
            .from("students")
            .insert({
                user_id: createdUserId,
                college,
                branch,
                year_of_study: yearOfStudy,
                status: "active",
            });

        if (studentError) throw studentError;

        // 9. Enroll in selected courses
        if (courseIds.length > 0) {
            const enrollments = courseIds.map((courseId) => ({
                student_id: createdUserId,
                course_id: courseId,
                status: "active",
            }));

            const { error: enrollmentError } = await supabase
                .from("course_enrollments")
                .insert(enrollments);

            if (enrollmentError) throw enrollmentError;
        }

        // 10. Success
        return jsonResponse(
            {
                success: true,
                message: "Student account created successfully",
                user: {
                    id: createdUserId,
                    username,
                    email,
                    full_name: fullName,
                    phone_number: phoneNumber || null,
                    college,
                    branch,
                    year_of_study: yearOfStudy,
                },
            },
            201,
        );
    } catch (error) {
        console.error("Create student error:", error);

        // 11. Rollback partially created records
        if (createdUserId) {
            const cleanupResults = await Promise.all([
                supabase
                    .from("course_enrollments")
                    .delete()
                    .eq("student_id", createdUserId),

                supabase
                    .from("students")
                    .delete()
                    .eq("user_id", createdUserId),

                supabase
                    .from("user_roles")
                    .delete()
                    .eq("user_id", createdUserId),

                supabase
                    .from("profiles")
                    .delete()
                    .eq("id", createdUserId),
            ]);

            cleanupResults.forEach((result) => {
                if (result.error) {
                    console.error("Cleanup error:", result.error);
                }
            });

            const { error: deleteAuthError } =
                await supabase.auth.admin.deleteUser(createdUserId);

            if (deleteAuthError) {
                console.error("Auth cleanup error:", deleteAuthError);
            }
        }

        return jsonResponse(
            {
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : "Failed to create student",
            },
            500,
        );
    }
});
