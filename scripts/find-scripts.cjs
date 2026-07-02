const fs = require("fs");
const html = fs.readFileSync("C:/Users/Rithik/.local/share/opencode/tool-output/tool_f200f76c70014YvQWL1OaJSCUl", "utf8");

// Find all external script tags
const scriptRegex = /<script[^>]*src="([^"]+)"[^>]*>/gi;
let m;
let found = false;
while ((m = scriptRegex.exec(html)) !== null) {
  console.log("External script:", m[1]);
  found = true;
}

if (!found) {
  console.log("NO EXTERNAL SCRIPTS FOUND");
  console.log("This form is rendered entirely via inline HTML/JS.");
}

// Count scripts
const allScripts = html.match(/<script/gi);
console.log("\nTotal script tags:", allScripts ? allScripts.length : 0);

// Check for Google Forms API references
["apis.google.com", "gstatic.com/forms", "google.forms", "gapi"].forEach(ref => {
  const idx = html.indexOf(ref);
  if (idx > -1) {
    console.log("Found", ref, "at", idx);
    console.log("  Context:", html.substring(Math.max(0, idx - 50), idx + 100).substring(0, 150));
  }
});
