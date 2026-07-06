import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const params = new URLSearchParams(body);

    const supabase = createServerClient();

    // Detect registration type by checking for school-specific fields
    const hasSchoolFields = params.has("school") || params.has("teacherName") || params.has("district");

    if (hasSchoolFields) {
      // School registration
      const noOfMembers = parseInt(params.get("noOfMembers") || "2");

      const record = {
        student_type: parseInt(params.get("studentType") || "0"),
        team_name: params.get("teamName") || "",
        no_of_team_members: noOfMembers,
        school: params.get("school") || "",
        school_address: params.get("schoolAddress") || "",
        district: params.get("district") || "",
        teacher_name: params.get("teacherName") || "",
        teacher_email: params.get("teacherEmail") || "",
        teacher_phone: params.get("teacherPhone") || "",
        leader_name: params.get("leaderName") || "",
        leader_grade: params.get("leaderGrade") || "",
        leader_email: params.get("leaderEmail") || "",
        leader_phone: params.get("leaderPhone") || "",
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
    const teamSize = parseInt(params.get("teamSize") || "1");

    const record = {
      email: params.get("email") || null,
      team_name: params.get("teamName") || null,
      university: params.get("university") || null,
      team_size: teamSize,
      leader_name: params.get("leaderName") || null,
      leader_gender: params.get("leaderGender") || null,
      leader_email: params.get("leaderEmail") || null,
      leader_phone: params.get("leaderPhone") || null,
      leader_year: params.get("leaderYear") || null,
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
