import fs from "fs";

const html = fs.readFileSync(
  "C:/Users/Rithik/.local/share/opencode/tool-output/tool_f200f76c70014YvQWL1OaJSCUl",
  "utf8"
);

// Find formResponse URL
const frIdx = html.indexOf("formResponse");
if (frIdx > -1) {
  // Look for the nearest URL before this
  const context = html.substring(Math.max(0, frIdx - 300), frIdx + 50);
  console.log("Context around formResponse:");
  console.log(context);
}

// Find all URL-like patterns
const urlPattern = /https:\/\/docs\.google\.com\/forms[^\s"']*/g;
let m;
const urls = new Set();
while ((m = urlPattern.exec(html)) !== null) {
  urls.add(m[0]);
}
console.log("\nAll Google Forms URLs found:");
for (const u of urls) {
  console.log(" ", u);
}

// Check if there's a JS-based submission handler
const jsIdx = html.indexOf("submit");
let jsMatches = [];
let searchIdx = 0;
let count = 0;
while ((searchIdx = html.indexOf("submit", searchIdx)) > -1 && count < 20) {
  jsMatches.push(html.substring(Math.max(0, searchIdx - 80), searchIdx + 80));
  searchIdx += 6;
  count++;
}
console.log("\nSubmit-related context snippets:");
jsMatches.forEach((s) => console.log(s.replace(/</g, "<"), "\n---"));

// Check for the actual JS that handles form submission
const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
let scriptMatch;
let scriptCount = 0;
while ((scriptMatch = scriptRegex.exec(html)) !== null && scriptCount < 5) {
  const script = scriptMatch[1];
  if (script.includes("formResponse") || script.includes("FB_PUBLIC")) {
    console.log("\nScript snippet containing formResponse/FB_PUBLIC:");
    console.log(script.substring(0, 500));
    scriptCount++;
  }
}
