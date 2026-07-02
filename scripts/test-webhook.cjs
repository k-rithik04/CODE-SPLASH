const WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbxQ-wsaAdryZL47bWgGNPtEh0K-EgZdf1UpS_MMHbYTfdpNUJtCo36vlzPCzylgdjhA/exec";

async function main() {
  const params = new URLSearchParams();

  params.append("teamName", "Test Team Alpha");
  params.append("noOfMembers", "3");
  params.append("school", "Test School");
  params.append("schoolAddress", "123 Test Road, Colombo");
  params.append("district", "Colombo");
  params.append("teacherName", "Mr. Test Teacher");
  params.append("teacherEmail", "teacher@test.com");
  params.append("teacherPhone", "0771234567");

  params.append("leaderName", "John Leader");
  params.append("leaderGrade", "12 A");
  params.append("leaderEmail", "leader@test.com");
  params.append("leaderPhone", "0777654321");

  params.append("member2Name", "Jane Member");
  params.append("member2Grade", "12 B");
  params.append("member2Phone", "0761122334");

  params.append("member3Name", "Bob Member");
  params.append("member3Grade", "11 C");
  params.append("member3Phone", "0755544332");

  params.append("declaration", "I have read and agree to the Code of Conduct, Originality and Consent terms above.");

  console.log("Sending test submission to webhook...");
  console.log("Fields:", params.toString().replace(/&/g, "\n  "));

  try {
    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const text = await res.text();
    console.log("\nResponse status:", res.status);
    console.log("Response body:", text);

    try {
      const json = JSON.parse(text);
      if (json.success) {
        console.log("\n✓ SUCCESS — Data should be in the spreadsheet!");
      } else {
        console.log("\n✗ FAILED:", json.error);
      }
    } catch {
      console.log("\nResponse is not JSON (might be HTML). Check the webhook deployment.");
    }
  } catch (err) {
    console.error("\n✗ Network error:", err.message);
  }
}

main();
