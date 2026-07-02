const https = require("https");
const FORM_ID = "1FAIpQLSdDPajTF-UsQieALRZbrIpqjyL0wPReSATrBeXMG_QkNF7gBQ";
const ts = Date.now();

const endpoints = [
  "/forms/d/e/" + FORM_ID + "/formsapi/formResponse",
  "/forms/d/e/" + FORM_ID + "/appsForm",
  "/forms/d/e/" + FORM_ID + "/api/response",
  "/forms/d/e/" + FORM_ID + "/formResponse?fvv=1&pageHistory=0&fbzx=-1&submissionTimestamp=-1",
  "/forms/d/e/" + FORM_ID + "/formResponse?fvv=1&pageHistory=0&fbzx=test&submissionTimestamp=-1",
  "/forms/d/" + FORM_ID + "/formResponse",
];

function tryEndpoint(idx) {
  if (idx >= endpoints.length) { console.log("\nAll tried"); return; }
  const ep = endpoints[idx];
  const body = "entry.513388183=E" + ts + "_" + idx + "&entry.1524738553=3&entry.1957467435=I have read and agree to the Code of Conduct, Originality and Consent terms above.";
  
  console.log("\n[" + idx + "] Trying: " + ep.substring(0, 80));
  
  const opts = {
    hostname: "docs.google.com",
    path: ep,
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": Buffer.byteLength(body),
      "User-Agent": "Mozilla/5.0"
    }
  };
  
  const req = https.request(opts, (res) => {
    let d = "";
    res.on("data", c => d += c);
    res.on("end", () => {
      console.log("  Status:", res.statusCode);
      console.log("  Location:", res.headers.location || "(none)");
      const isForm = d.includes("FB_PUBLIC_LOAD_DATA_");
      const t = d.match(/<title>([^<]*)<\/title>/);
      console.log("  Form page:", isForm, "| Title:", t ? t[1] : "?");
      tryEndpoint(idx + 1);
    });
  });
  
  req.on("error", e => { console.log("  Error:", e.message); tryEndpoint(idx + 1); });
  req.write(body);
  req.end();
}

tryEndpoint(0);
