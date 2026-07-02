const GOOGLE_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSdDPajTF-UsQieALRZbrIpqjyL0wPReSATrBeXMG_QkNF7gBQ/formResponse";

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

function validateParams(params: URLSearchParams): string | null {
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

export async function POST(request: Request) {
  try {
    const text = await request.text();
    const params = new URLSearchParams(text);

    const validationError = validateParams(params);
    if (validationError) {
      return Response.json({ success: false, error: validationError }, { status: 400 });
    }

    const webhookUrl = process.env.WEBHOOK_URL;

    if (webhookUrl) {
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      });

      if (!res.ok) {
        const body = await res.text();
        return Response.json({ success: false, error: `Webhook returned ${res.status}: ${body}` }, { status: 502 });
      }

      return Response.json({ success: true });
    }

    const fbzx = "-" + Math.floor(Math.random() * 9e15);
    const googleParams = new URLSearchParams();
    googleParams.append("fvv", "1");
    googleParams.append("partialResponse", `[null,null,"${fbzx}"]`);
    googleParams.append("pageHistory", "0");
    googleParams.append("fbzx", fbzx);
    googleParams.append("submissionTimestamp", "-1");
    googleParams.append("entry.513388183", params.get("teamName") || "");
    googleParams.append("entry.1524738553", params.get("noOfMembers") || "");
    googleParams.append("entry.808824461", params.get("school") || "");
    googleParams.append("entry.633673339", params.get("schoolAddress") || "");
    googleParams.append("entry.926788461", params.get("district") || "");
    googleParams.append("entry.180762254", params.get("teacherName") || "");
    googleParams.append("entry.671533921", params.get("teacherEmail") || "");
    googleParams.append("entry.1133042947", params.get("teacherPhone") || "");
    googleParams.append("entry.592646243", params.get("leaderName") || "");
    googleParams.append("entry.66150412", params.get("leaderGrade") || "");
    googleParams.append("entry.1568628242", params.get("leaderEmail") || "");
    googleParams.append("entry.1662204579", params.get("leaderPhone") || "");
    googleParams.append("entry.1857094506", params.get("member2Name") || "");
    googleParams.append("entry.257314000", params.get("member2Grade") || "");
    googleParams.append("entry.645021358", params.get("member2Phone") || "");
    googleParams.append("entry.2027445754", params.get("member3Name") || "");
    googleParams.append("entry.1136034145", params.get("member3Grade") || "");
    googleParams.append("entry.740297592", params.get("member3Phone") || "");
    googleParams.append("entry.342321623", params.get("member4Name") || "");
    googleParams.append("entry.1722537157", params.get("member4Grade") || "");
    googleParams.append("entry.845613086", params.get("member4Phone") || "");
    googleParams.append("entry.209868013", params.get("member5Name") || "");
    googleParams.append("entry.284807289", params.get("member5Grade") || "");
    googleParams.append("entry.1146723309", params.get("member5Phone") || "");
    googleParams.append("entry.1957467435", params.get("declaration") || "");

    const res = await fetch(GOOGLE_FORM_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: googleParams.toString(),
    });

    if (!res.ok && res.status !== 200) {
      return Response.json({ success: false, error: `Google Forms returned ${res.status}` }, { status: 502 });
    }

    return Response.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}
