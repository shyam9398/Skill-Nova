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

        // 2. Verify caller has admin privileges
        const { data: callerRoles, error: roleError } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", callerId);

        if (roleError) throw roleError;

        const isAdmin = callerRoles?.some((r) => r.role === "admin");
        if (!isAdmin) {
            return jsonResponse(
                {
                    success: false,
                    message: "Only Admin users can delete student accounts",
                },
                403,
            );
        }

        // 3. Read student user ID to delete
        const body = await req.json();
        const studentUserId = String(body.student_user_id ?? "").trim();

        if (!studentUserId) {
            return jsonResponse(
                {
                    success: false,
                    message: "student_user_id is required",
                },
                400,
            );
        }

        // Prevent admin from deleting themselves
        if (studentUserId === callerId) {
            return jsonResponse(
                {
                    success: false,
                    message: "Cannot delete your own administrative account",
                },
                400,
            );
        }

        // 4. Delete dependent records across all student tables
        await Promise.allSettled([
            supabase
                .from("course_enrollments")
                .delete()
                .eq("student_id", studentUserId),
            supabase
                .from("quiz_attempts")
                .delete()
                .eq("student_id", studentUserId),
            supabase
                .from("student_progress")
                .delete()
                .eq("student_id", studentUserId),
            supabase
                .from("students")
                .delete()
                .eq("user_id", studentUserId),
            supabase
                .from("user_roles")
                .delete()
                .eq("user_id", studentUserId),
            supabase
                .from("profiles")
                .delete()
                .eq("id", studentUserId),
        ]);

        // 5. Permanently delete the user from Supabase Auth (auth.users)
        const { error: authDeleteError } =
            await supabase.auth.admin.deleteUser(studentUserId);

        if (authDeleteError) {
            console.error("Auth deleteUser warning:", authDeleteError);
            // If the user was already deleted from auth, we continue gracefully
        }

        return jsonResponse({
            success: true,
            message: "Student account and authentication user permanently deleted",
            deleted_user_id: studentUserId,
        });
    } catch (error) {
        console.error("Delete student error:", error);
        return jsonResponse(
            {
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : "Failed to delete student",
            },
            500,
        );
    }
});

