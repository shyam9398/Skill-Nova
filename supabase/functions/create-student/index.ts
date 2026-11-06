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

    const supabaseUrl =
        Deno.env.get("SUPABASE_URL") ??
        Deno.env.get("SUPABASE_PROJECT_URL");

    const serviceRoleKey =
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ??
        Deno.env.get("SERVICE_ROLE_KEY");

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

        // 2. Verify Admin role (support multiple role rows safely without maybeSingle error)
        const { data: callerRoles, error: roleError } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", callerId);

        if (roleError) {
            console.error("Role lookup error:", roleError);
            throw roleError;
        }

        const isAdmin = callerRoles?.some((r) => r.role === "admin");
        if (!isAdmin) {
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

        // Preserve exact username casing (case-sensitive)
        const username = String(body.username ?? "").trim();
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

        // Case-sensitive validation: 3-50 letters, numbers, dots, underscores or hyphens
        if (!/^[a-zA-Z0-9._-]{3,50}$/.test(username)) {
            return jsonResponse(
                {
                    success: false,
                    message:
                        "Username must be 3-50 characters and contain only letters (case-sensitive), numbers, dots, underscores or hyphens",
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

        // Check if exact username is already registered in profiles
        const { data: existingProfile } = await supabase
            .from("profiles")
            .select("id, username")
            .eq("username", username)
            .maybeSingle();

        if (existingProfile) {
            return jsonResponse(
                {
                    success: false,
                    message: `Username "${username}" is already taken.`,
                },
                400,
            );
        }

        // 4. Generate internal auth email (lowercased for Supabase Auth identity)
        const email = `${username.toLowerCase()}@student.skillnova.edu`;

        // 5. Create Supabase Auth account
        const { data: newAuth, error: createAuthError } =
            await supabase.auth.admin.createUser({
                email,
                password,
                email_confirm: true,
                user_metadata: {
                    full_name: fullName,
                    username: username, // EXACT CASE PRESERVED
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

        // 6. Upsert profile with exact case username
        const { error: profileError } = await supabase
            .from("profiles")
            .upsert(
                {
                    id: createdUserId,
                    email,
                    full_name: fullName,
                    username: username, // EXACT CASE PRESERVED
                    phone_number: phoneNumber || null,
                },
                { onConflict: "id" }
            );

        if (profileError) {
            console.error("Profile upsert error:", profileError);
            throw profileError;
        }

        // 7. Assign Student role
        await supabase
            .from("user_roles")
            .delete()
            .eq("user_id", createdUserId);

        const { error: userRoleError } = await supabase
            .from("user_roles")
            .insert({
                user_id: createdUserId,
                role: "student",
                assigned_by: callerId,
            });

        if (userRoleError) {
            console.error("User role assignment error:", userRoleError);
            throw userRoleError;
        }

        // 8. Create or update student record
        const { error: studentError } = await supabase
            .from("students")
            .upsert(
                {
                    user_id: createdUserId,
                    college: college || "SkillNova Institute",
                    branch: branch || "Computer Science",
                    year_of_study: yearOfStudy || "Year 1",
                    status: "active",
                },
                { onConflict: "user_id" }
            );

        if (studentError) {
            console.error("Student record error:", studentError);
            throw studentError;
        }

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

            if (enrollmentError) {
                console.warn("Enrollment warning:", enrollmentError);
            }
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
            await Promise.allSettled([
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
                supabase.auth.admin.deleteUser(createdUserId),
            ]);
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
