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
                    message: "Only Super Admin users can create sub-admin accounts",
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
        const fullName = String(body.full_name ?? "").trim() || `Sub-Admin ${username.toUpperCase()}`;

        const courseIds: string[] = Array.isArray(body.assigned_courses)
            ? [
                ...new Set(
                    body.assigned_courses.filter(
                        (id: unknown) =>
                            typeof id === "string" && id.trim() !== "",
                    ),
                ),
            ]
            : [];

        if (!username || !password) {
            return jsonResponse(
                {
                    success: false,
                    message: "Username and password are required",
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

        if (password.length < 6) {
            return jsonResponse(
                {
                    success: false,
                    message: "Password must contain at least 6 characters",
                },
                400,
            );
        }

        // 4. Generate internal email for username login (NO email sent, confirmed automatically)
        const email = `${username}@skillnova.edu`;

        // 5. Create Supabase Auth account via Admin API with email_confirm: true (NEVER hits email rate limits!)
        const { data: newAuth, error: createAuthError } =
            await supabase.auth.admin.createUser({
                email,
                password,
                email_confirm: true,
                user_metadata: {
                    full_name: fullName,
                    username,
                    role: "sub_admin",
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

        // 6. Update or insert the profile
        const { error: profileError } = await supabase
            .from("profiles")
            .upsert({
                id: createdUserId,
                email,
                full_name: fullName,
                avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
                theme_preference: "dark",
            });

        if (profileError) {
            console.warn("Profile upsert note:", profileError.message);
        }

        // 7. Assign sub_admin role
        const { error: roleUpsertError } = await supabase
            .from("user_roles")
            .upsert({
                user_id: createdUserId,
                role: "sub_admin",
                assigned_by: callerId,
            }, { onConflict: "user_id" });

        if (roleUpsertError) {
            console.warn("User role upsert note:", roleUpsertError.message);
        }

        // 8. Create or update sub_admins record
        const { error: subAdminError } = await supabase
            .from("sub_admins")
            .upsert({
                user_id: createdUserId,
                assigned_courses: courseIds,
                can_manage_courses: true,
                can_upload_resources: true,
                can_generate_ai: true,
                can_publish_opportunities: true,
            }, { onConflict: "user_id" });

        if (subAdminError) throw subAdminError;

        // 9. Return success
        return jsonResponse(
            {
                success: true,
                message: "Sub-admin account created successfully without email dependency",
                user: {
                    id: createdUserId,
                    username,
                    email,
                    full_name: fullName,
                    role: "sub_admin",
                    assigned_courses: courseIds,
                },
            },
            201,
        );
    } catch (error) {
        console.error("Create sub-admin error:", error);

        // 10. Rollback partially created records if needed
        if (createdUserId) {
            await Promise.allSettled([
                supabase.from("sub_admins").delete().eq("user_id", createdUserId),
                supabase.from("user_roles").delete().eq("user_id", createdUserId),
                supabase.from("profiles").delete().eq("id", createdUserId),
                supabase.auth.admin.deleteUser(createdUserId),
            ]);
        }

        return jsonResponse(
            {
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : "Failed to create sub-admin account",
            },
            500,
        );
    }
});

