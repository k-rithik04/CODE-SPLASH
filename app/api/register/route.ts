import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { validateOrigin } from "@/lib/csrf";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[\d\s\-()]{7,20}$/;
const MAX_TEXT = 255;

function sanitize(value: string | null): string | null {
  if (!value) return null;
  return value.trim().slice(0, MAX_TEXT);
}

function validateEmail(email: string | null): boolean {
  if (!email) return true;
  return EMAIL_RE.test(email);
}

function validatePhone(phone: string | null): boolean {
  if (!phone) return true;
  return PHONE_RE.test(phone);
}

export async function POST(request: Request) {
  try {
    const csrfError = validateOrigin(request);
    if (csrfError) return csrfError;

    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const rateKey = `register:${ip}`;
    const { allowed, retryAfterMs } = checkRateLimit(rateKey, 5, 15 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: `Too many registrations. Try again in ${Math.ceil(retryAfterMs / 60000)} minutes.` },
        { status: 429 }
      );
    }

    const body = await request.text();
    const params = new URLSearchParams(body);

    const supabase = createServerClient();

    // Detect registration type by checking for school-specific fields
    const hasSchoolFields = params.has("school") || params.has("teacherName") || params.has("district");

    if (hasSchoolFields) {
      const teacherEmail = params.get("teacherEmail");
      const leaderEmail = params.get("leaderEmail");
      const leaderPhone = params.get("leaderPhone");
      const teacherPhone = params.get("teacherPhone");

      if (teacherEmail && !validateEmail(teacherEmail)) {
        return NextResponse.json({ success: false, error: "Invalid teacher email format" }, { status: 400 });
      }
      if (leaderEmail && !validateEmail(leaderEmail)) {
        return NextResponse.json({ success: false, error: "Invalid leader email format" }, { status: 400 });
      }
      if (leaderPhone && !validatePhone(leaderPhone)) {
        return NextResponse.json({ success: false, error: "Invalid leader phone format" }, { status: 400 });
      }
      if (teacherPhone && !validatePhone(teacherPhone)) {
        return NextResponse.json({ success: false, error: "Invalid teacher phone format" }, { status: 400 });
      }

      const noOfMembers = parseInt(params.get("noOfMembers") || "2");

      const record = {
        student_type: parseInt(params.get("studentType") || "0"),
        team_name: sanitize(params.get("teamName")) || "",
        no_of_team_members: noOfMembers,
        school: sanitize(params.get("school")) || "",
        school_address: sanitize(params.get("schoolAddress")) || "",
        district: sanitize(params.get("district")) || "",
        teacher_name: sanitize(params.get("teacherName")) || "",
        teacher_email: sanitize(params.get("teacherEmail")) || "",
        teacher_phone: sanitize(params.get("teacherPhone")) || "",
        leader_name: sanitize(params.get("leaderName")) || "",
        leader_grade: sanitize(params.get("leaderGrade")) || "",
        leader_email: sanitize(params.get("leaderEmail")) || "",
        leader_phone: sanitize(params.get("leaderPhone")) || "",
        member2_name: params.get("member2Name") || null,
        member2_grade: params.get("member2Grade") || null,
        member2_phone: params.get("member2Phone") || null,
        member3_name: params.get("member3Name") || null,
        member3_grade: params.get("member3Grade") || null,
        member3_phone: params.get("member3Phone") || null,
        member4_name: params.get("member4Name") || null,
        member4_grade: params.get("member4Grade") || null,
        member4_phone: params.get("member4Phone") || null,
        member5_name: params.get("member5Name") || null,
        member5_grade: params.get("member5Grade") || null,
        member5_phone: params.get("member5Phone") || null,
        declaration: params.get("declaration") || null,
      };

      const { error } = await supabase.from("school_registrations").insert(record);

      if (error) {
        console.error("[REGISTER] School insert error:", error.message);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, type: "school" });
    }

    // University registration
    const uniEmail = params.get("email");
    const leaderEmail = params.get("leaderEmail");
    const leaderPhone = params.get("leaderPhone");

    if (uniEmail && !validateEmail(uniEmail)) {
      return NextResponse.json({ success: false, error: "Invalid email format" }, { status: 400 });
    }
    if (leaderEmail && !validateEmail(leaderEmail)) {
      return NextResponse.json({ success: false, error: "Invalid leader email format" }, { status: 400 });
    }
    if (leaderPhone && !validatePhone(leaderPhone)) {
      return NextResponse.json({ success: false, error: "Invalid leader phone format" }, { status: 400 });
    }

    const teamSize = parseInt(params.get("teamSize") || "1");

    const record = {
      email: sanitize(params.get("email")) || null,
      team_name: sanitize(params.get("teamName")) || null,
      university: sanitize(params.get("university")) || null,
      team_size: teamSize,
      leader_name: sanitize(params.get("leaderName")) || null,
      leader_gender: sanitize(params.get("leaderGender")) || null,
      leader_email: sanitize(params.get("leaderEmail")) || null,
      leader_phone: sanitize(params.get("leaderPhone")) || null,
      leader_year: sanitize(params.get("leaderYear")) || null,
      member2_name: params.get("member2Name") || null,
      member2_gender: params.get("member2Gender") || null,
      member2_email: params.get("member2Email") || null,
      member2_phone: params.get("member2Phone") || null,
      member2_year: params.get("member2Year") || null,
      member3_name: params.get("member3Name") || null,
      member3_gender: params.get("member3Gender") || null,
      member3_email: params.get("member3Email") || null,
      member3_phone: params.get("member3Phone") || null,
      member3_year: params.get("member3Year") || null,
      member4_name: params.get("member4Name") || null,
      member4_gender: params.get("member4Gender") || null,
      member4_email: params.get("member4Email") || null,
      member4_phone: params.get("member4Phone") || null,
      member4_year: params.get("member4Year") || null,
      member5_name: params.get("member5Name") || null,
      member5_gender: params.get("member5Gender") || null,
      member5_email: params.get("member5Email") || null,
      member5_phone: params.get("member5Phone") || null,
      member5_year: params.get("member5Year") || null,
      technologies: params.getAll("technologies").join(", "),
      languages: params.getAll("languages").join(", "),
      hackathon_exp: params.get("hackathonExp") || null,
      hackathon_details: params.get("hackathonDetails") || null,
      github_link: params.get("links") || null,
      project_worked_on: params.get("projectWorkedOn") || null,
      problem_to_solve: params.get("problemToSolve") || null,
      interested_area: params.getAll("interestedAreas").join(", "),
      hear_about: params.get("hearAbout") || null,
    };

    const { error } = await supabase.from("university_registrations").insert(record);

    if (error) {
      console.error("[REGISTER] University insert error:", error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, type: "university" });
  } catch (err) {
    console.error("[REGISTER] Unexpected error:", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
