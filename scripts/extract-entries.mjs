import fs from "fs";

const html = fs.readFileSync(
  "C:/Users/Rithik/.local/share/opencode/tool-output/tool_f200f76c70014YvQWL1OaJSCUl",
  "utf8"
);

// Google Forms requires hidden fields for submission
// Look for: fvv, pageHistory, draftResponse, fbzx, etc.
const hiddenFields = ["fvv", "pageHistory", "draftResponse", "fbzx", "partialResponse", "usi", "hx", "dfcf", "cookie", "usp"];

console.log("=== Hidden form fields ===\n");

hiddenFields.forEach(field => {
  // Search for the field in input elements
  const regex = new RegExp(`name="${field}"[^>]*value="([^"]*)"`, "g");
  let m;
  while ((m = regex.exec(html)) !== null) {
    console.log(`${field} = "${m[1]}"`);
  }
  // Also check value before name
  const regex2 = new RegExp(`value="([^"]*)"[^>]*name="${field}"`, "g");
  while ((m = regex2.exec(html)) !== null) {
    console.log(`${field} = "${m[1]}" (reversed)`);
  }
});

// Also look for all hidden inputs
console.log("\n=== All hidden input fields ===\n");
const hiddenInputRegex = /<input[^>]*type="hidden"[^>]*>/gi;
let m;
while ((m = hiddenInputRegex.exec(html)) !== null) {
  const input = m[0];
  const nameMatch = input.match(/name="([^"]*)"/);
  const valueMatch = input.match(/value="([^"]*)"/);
  if (nameMatch) {
    console.log(`name="${nameMatch[1]}" value="${valueMatch ? valueMatch[1] : ""}"`);
  }
}

// Check for the form action URL
console.log("\n=== Form action ===\n");
const actionMatch = html.match(/action="([^"]*formResponse[^"]*)"/);
if (actionMatch) {
  console.log("Action:", actionMatch[1]);
} else {
  const actionMatch2 = html.match(/action="([^"]*)"/);
  if (actionMatch2) {
    console.log("Action:", actionMatch2[1]);
  }
}

// Check for fvv, pageHistory in any context
console.log("\n=== Searching for fvv/pageHistory in full HTML ===\n");
["fvv", "pageHistory", "fbzx", "draftResponse", "partialResponse"].forEach(term => {
  const idx = html.indexOf(term);
  if (idx !== -1) {
    console.log(`Found "${term}" at index ${idx}:`);
    console.log(html.substring(Math.max(0, idx - 50), idx + 100));
    console.log("---");
  }
});
