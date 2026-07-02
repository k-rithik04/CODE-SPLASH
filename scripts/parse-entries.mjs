import fs from "fs";
const html = fs.readFileSync("C:/Users/Rithik/.local/share/opencode/tool-output/tool_f200f76c70014YvQWL1OaJSCUl", "utf8");

const fbIdx = html.indexOf("FB_PUBLIC_LOAD_DATA_");
const dataStart = html.indexOf("[", fbIdx);
let depth = 0, dataEnd = dataStart;
for (let i = dataStart; i < html.length; i++) {
  if (html[i] === "[") depth++;
  if (html[i] === "]") depth--;
  if (depth === 0) { dataEnd = i + 1; break; }
}
const raw = html.substring(dataStart, dataEnd);

// Clean up: the string has some unquoted values, let's try to make it valid JSON
// Replace single-quoted strings, undefined, etc.
// Actually, let's just use the raw array

// The structure is: [null, [formData], ...]
// formData = [description, [questions], ...]
// Each question = [groupId, title, desc, type, [[entryId, options], ...], ...]

// Let's look at the 2nd element (index 1) which contains the questions
const formDataMatch = raw.match(/^\[null,\[(.*)\]/);
if (!formDataMatch) {
  console.log("Couldn't find formData structure");
  process.exit(1);
}

// Walk the array properly
function parseArray(str, start) {
  const items = [];
  let i = start;
  let depth = 0;
  let current = "";
  let inString = false;
  let stringChar = null;
  
  for (; i < str.length; i++) {
    const ch = str[i];
    
    if (inString) {
      if (ch === "\\") { current += ch + str[++i]; continue; }
      if (ch === stringChar) { inString = false; }
      current += ch;
      continue;
    }
    
    if (ch === '"' || ch === "'") {
      inString = true;
      stringChar = ch;
      current += ch;
      continue;
    }
    
    if (ch === "[" || ch === "(") { depth++; current += ch; continue; }
    if (ch === "]" || ch === ")") { 
      depth--; 
      current += ch;
      if (depth === 0) { 
        // End of our array
        break; 
      }
      continue;
    }
    
    if (depth > 0) { current += ch; continue; }
    
    if (ch === ",") {
      items.push(current.trim());
      current = "";
      continue;
    }
    
    current += ch;
  }
  
  if (current.trim()) items.push(current.trim());
  return { items, endIndex: i };
}

// Try to extract just the entry IDs by matching patterns in the raw string
// Pattern: [[entryId,...]] for each question
const allEntries = [];
const questionStartRegex = /\[(\d{9,12}),"((?:[^"\\]|\\.)*)"/g;
let m;
while ((m = questionStartRegex.exec(raw)) !== null) {
  const groupId = m[1];
  const title = m[2];
  // Skip section headers
  if (title.startsWith("SECTION") || title.includes("\\u003cb\\u003eSECTION")) continue;
  if (title === "Declaration ") continue;
  
  // Get context
  const contextStart = m.index;
  const context = raw.substring(contextStart, contextStart + 800);
  
  // The inner entry IDs are in patterns like: [NNNNNNNNN,null,1] or [NNNNNNNNN,[[options]]]
  const innerMatch = context.match(/\[(\d{9,12}),(null|\[)/);
  if (innerMatch && innerMatch[1] !== groupId) {
    allEntries.push({ groupId, entryId: innerMatch[1], title });
  } else {
    // Try other patterns
    const innerMatch2 = context.match(/\[(\d{9,12}),\[\[/); 
    if (innerMatch2) {
      allEntries.push({ groupId, entryId: innerMatch2[1], title: title.substring(0, 40) });
    }
  }
}

console.log("Entry IDs found:", allEntries.length);
allEntries.forEach(e => {
  console.log(`  entry.${e.entryId}  (groupId: ${e.groupId})  ← ${e.title}`);
});
