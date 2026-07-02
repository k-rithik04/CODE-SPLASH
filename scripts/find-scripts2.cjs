const fs = require("fs");
const html = fs.readFileSync("C:/Users/Rithik/.local/share/opencode/tool-output/tool_f200f76c70014YvQWL1OaJSCUl", "utf8");

// Find all script src attributes
const regex = /src="([^"]+)"/g;
let m;
const scripts = new Set();
while ((m = regex.exec(html)) !== null) {
  scripts.add(m[1]);
}

console.log("All script src URLs found:");
for (const s of scripts) {
  console.log("  " + s);
}

// Check for jsmodel references
console.log("\njsmodel on form:", html.match(/jsmodel="([^"]+)"/)?.[1] || "not found");
