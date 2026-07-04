import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp, sanitizeInput } from "@/lib/sanitize";

const REGISTER_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const REGISTER_MAX_ATTEMPTS = 10;
const MAX_FIELD_LENGTH = 500;

function validateRequired(value: string | null): boolean {
  return value !== null && value.trim().length > 0;
}

function validateEmail(value: string | null): boolean {
  if (!value) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function validateSriLankanPhone(value: string | null): boolean {
  if (!value) return false;
  const cleaned = value.replace(/[\s-]/g, "");
  return /^(?:(?:0|94|\+94)(?:7\d{8}|[1-9]\d{8}))$/.test(cleaned);
}

function validateSchoolParams(params: URLSearchParams): string | null {
  if (!validateRequired(params.get("teamName"))) return "teamName is required";
  if (!validateRequired(params.get("noOfMembers"))) return "noOfMembers is required";
  if (!validateRequired(params.get("school"))) return "school is required";
  if (!validateRequired(params.get("district"))) return "district is required";
  if (!validateEmail(params.get("teacherEmail"))) return "teacherEmail is invalid";
  if (!validateSriLankanPhone(params.get("teacherPhone"))) return "teacherPhone is invalid";
  if (!validateEmail(params.get("leaderEmail"))) return "leaderEmail is invalid";
  if (!validateSriLankanPhone(params.get("leaderPhone"))) return "leaderPhone is invalid";
  return null;
}

function validateUniversityParams(params: URLSearchParams): string | null {
  if (!validateRequired(params.get("university"))) return "university is required";

  const regType = params.get("registrationType");
  if (regType === "Individual") {
    if (!validateRequired(params.get("fullName"))) return "fullName is required";
    if (!validateEmail(params.get("email"))) return "email is invalid";
    if (!validateSriLankanPhone(params.get("phone"))) return "phone is invalid";
  } else {
    if (!validateEmail(params.get("leaderEmail"))) return "leaderEmail is invalid";
    if (!validateSriLankanPhone(params.get("leaderPhone"))) return "leaderPhone is invalid";
  }
  return null;
}

function getParam(params: URLSearchParams, key: string): string | null {
  const val = params.get(key);
  if (!val) return null;
  return sanitizeInput(val).slice(0, MAX_FIELD_LENGTH);
}

export async function POST(request: NextRequest) {
  try {
    // Rate limit by IP
    const ip = getClientIp(request);
    const rateLimitKey = `register:${ip}`;
    const { allowed, retryAfterMs } = checkRateLimit(
      rateLimitKey,
      REGISTER_MAX_ATTEMPTS,
      REGISTER_WINDOW_MS
    );

    if (!allowed) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        {
          status: 429,
          headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) },
        }
      );
    }

    // Validate content type
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("application/x-www-form-urlencoded")) {
      return NextResponse.json({ error: "Invalid request." }, { status: 415 });
    }

    // Limit body size (100KB max)
    const text = await request.text();
    if (text.length > 100_000) {
      return NextResponse.json({ error: "Request too large." }, { status: 413 });
    }

    const params = new URLSearchParams(text);
    const isUniversity = params.has("registrationType");
    const supabase = createServerClient();
    const webhookUrl = process.env.WEBHOOK_URL;

    if (isUniversity) {
      const validationError = validateUniversityParams(params);
      if (validationError) {
        return NextResponse.json({ success: false, error: validationError }, { status: 400 });
      }

      const regType = params.get("registrationType");
      const isIndiv = regType === "Individual";

      const row: Record<string, unknown> = {
        email: getParam(params, "email"),
        team_name: isIndiv ? null : getParam(params, "teamName"),
        university: getParam(params, "university"),
        faculty: getParam(params, "faculty"),
        team_size: isIndiv ? 1 : (params.get("teamSize") ? parseInt(params.get("teamSize")!, 10) : null),
        leader_name: isIndiv ? getParam(params, "fullName") : getParam(params, "leaderName"),
        leader_gender: isIndiv ? getParam(params, "gender") : getParam(params, "leaderGender"),
        leader_email: isIndiv ? getParam(params, "email") : getParam(params, "leaderEmail"),
        leader_phone: isIndiv ? getParam(params, "phone") : getParam(params, "leaderPhone"),
        leader_year: isIndiv ? getParam(params, "yearOfStudy") : getParam(params, "leaderYear"),
        technologies: getParam(params, "technologies"),
        languages: getParam(params, "languages"),
        hackathon_exp: getParam(params, "hackathonExp"),
        hackathon_details: getParam(params, "hackathonDetails"),
        github_link: getParam(params, "links"),
        project_worked_on: getParam(params, "projectWorkedOn"),
        problem_to_solve: getParam(params, "problemToSolve"),
        interested_area: getParam(params, "interestedAreas"),
        hear_about: getParam(params, "hearAbout"),
      };

      const memberFields = ["member2", "member3", "member4", "member5"];
      for (const m of memberFields) {
        const name = getParam(params, `${m}Name`);
        if (name) {
          row[`${m}_name`] = name;
          row[`${m}_gender`] = getParam(params, `${m}Gender`);
          row[`${m}_email`] = getParam(params, `${m}Email`);
          row[`${m}_phone`] = getParam(params, `${m}Phone`);
          row[`${m}_year`] = getParam(params, `${m}Year`);
        }
      }

      const [dbResult, webhookResult] = await Promise.allSettled([
        supabase.from("university_registrations").insert(row),
        webhookUrl
          ? fetch(webhookUrl, {
              method: "POST",
              headers: { "Content-Type": "application/x-www-form-urlencoded" },
              body: params.toString(),
            })
          : Promise.resolve(null),
      ]);

      const dbFailed =
        dbResult.status === "rejected" || (dbResult.status === "fulfilled" && dbResult.value.error);
      if (dbFailed) {
        console.error("[REG] University insert failed");
        return NextResponse.json(
          { success: false, error: "Registration failed. Please try again." },
          { status: 500 }
        );
      }

      if (webhookResult.status === "rejected") {
        console.error("[REG] Webhook failed — data saved to Supabase only");
      }

      return NextResponse.json({ success: true });
    }

    // School registration flow
    const validationError = validateSchoolParams(params);
    if (validationError) {
      return NextResponse.json({ success: false, error: validationError }, { status: 400 });
    }

    const [dbResult, webhookResult] = await Promise.allSettled([
      supabase.from("school_registrations").insert({
        team_name: getParam(params, "teamName") || "",
        no_of_team_members: parseInt(params.get("noOfMembers") || "3", 10),
        school: getParam(params, "school") || "",
        school_address: getParam(params, "schoolAddress") || "",
        district: getParam(params, "district") || "",
        teacher_name: getParam(params, "teacherName") || "",
        teacher_email: getParam(params, "teacherEmail") || "",
        teacher_phone: getParam(params, "teacherPhone") || "",
        leader_name: getParam(params, "leaderName") || "",
        leader_grade: getParam(params, "leaderGrade") || "",
        leader_email: getParam(params, "leaderEmail") || "",
        leader_phone: getParam(params, "leaderPhone") || "",
        member2_name: getParam(params, "member2Name"),
        member2_grade: getParam(params, "member2Grade"),
        member2_phone: getParam(params, "member2Phone"),
        member3_name: getParam(params, "member3Name"),
        member3_grade: getParam(params, "member3Grade"),
        member3_phone: getParam(params, "member3Phone"),
        member4_name: getParam(params, "member4Name"),
        member4_grade: getParam(params, "member4Grade"),
        member4_phone: getParam(params, "member4Phone"),
        member5_name: getParam(params, "member5Name"),
        member5_grade: getParam(params, "member5Grade"),
        member5_phone: getParam(params, "member5Phone"),
        declaration: getParam(params, "declaration") || "",
      }),
      webhookUrl
        ? fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: params.toString(),
          })
        : Promise.resolve(null),
    ]);

    const dbFailed =
      dbResult.status === "rejected" || (dbResult.status === "fulfilled" && dbResult.value.error);
    if (dbFailed) {
      console.error("[REG] School insert failed");
      return NextResponse.json(
        { success: false, error: "Registration failed. Please try again." },
        { status: 500 }
      );
    }

    if (webhookResult.status === "rejected") {
      console.error("[REG] Webhook failed — data saved to Supabase only");
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
