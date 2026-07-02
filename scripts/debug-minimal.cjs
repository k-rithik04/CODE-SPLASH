// Absolute minimal test - just send entry IDs to formResponse
// Mimicking what a browser would send for a traditional form POST

const https = require("https");

const FORM_ID = "1FAIpQLSdDPajTF-UsQieALRZbrIpqjyL0wPReSATrBeXMG_QkNF7gBQ";
const ts = Date.now();
const body = `entry.513388183=M${ts}&entry.1524738553=3&entry.808824461=MSchool${ts}&entry.633673339=MAddr${ts}&entry.926788461=Colombo&entry.180762254=MTeacher${ts}&entry.671533921=m${ts}@t.com&entry.1133042947=0771234567&entry.592646243=MLeader${ts}&entry.66150412=12+A&entry.1568628242=ml${ts}@t.com&entry.1662204579=0771111111&entry.1857094506=MM2${ts}&entry.257314000=12+B&entry.645021358=0772222222&entry.2027445754=MM3${ts}&entry.1136034145=12+C&entry.740297592=0773333333&entry.1957467435=I+have+read+and+agree+to+the+Code+of+Conduct%2C+Originality+and+Consent+terms+above.`;

console.log("Body:", body.substring(0, 100) + "...");
console.log("Body length:", body.length);

const opts = {
  hostname: "docs.google.com",
  path: `/forms/d/e/${FORM_ID}/formResponse`,
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
    "Content-Length": Buffer.byteLength(body),
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
  }
};

const req = https.request(opts, (res) => {
  console.log("Status:", res.statusCode, res.statusMessage);
  console.log("Location:", res.headers.location || "(none)");
  
  let data = "";
  res.on("data", chunk => data += chunk);
  res.on("end", () => {
    const isForm = data.includes("FB_PUBLIC_LOAD_DATA_");
    const title = data.match(/<title>([^<]*)<\/title>/)?.[1] || "?";
    console.log("Content length:", data.length);
    console.log("Is form page:", isForm);
    console.log("Title:", title);
    
    if (data.includes("Thank you") && !isForm) {
      console.log("SUCCESS! Real Thank You page!");
    } else if (isForm) {
      console.log("FAILED: Got form page back");
    }
  });
});

req.on("error", e => console.error("Error:", e.message));
req.write(body);
req.end();
