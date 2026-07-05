async function submitForm(data, label) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(data)) {
    params.append(key, value);
  }

  try {
    const res = await fetch("http://localhost:3000/api/register", {
      method: "POST",
      body: params, // Pass URLSearchParams directly, it handles headers automatically
    });

    const result = await res.json();
    console.log(`\n--- Test: ${label} ---`);
    console.log("Status:", res.status);
    console.log("Response:", result);
  } catch (err) {
    console.error(`\n--- Test: ${label} --- (FAILED)`);
    console.error(err);
  }
}

async function runTests() {
  console.log("Starting API tests for /api/register (School Flow)...");

  // Test 1: Government Student
  await submitForm({
    studentType: "Government",
    teamName: "Gov Team Alpha",
    noOfMembers: "3",
    school: "Royal College",
    schoolAddress: "Colombo 07",
    district: "Colombo",
    teacherName: "Mr. Perera",
    teacherEmail: "perera@royal.edu.lk",
    teacherPhone: "0771234567",
    leaderName: "Kamal Silva",
    leaderGrade: "12",
    leaderEmail: "kamal@example.com",
    leaderPhone: "0777654321",
    declaration: "true"
  }, "Government Student (studentType = 0)");

  // Test 2: Private Student
  await submitForm({
    studentType: "Private",
    teamName: "Private Coders",
    noOfMembers: "3",
    district: "Kandy",
    leaderName: "Nimal Fernando",
    leaderGrade: "11",
    leaderEmail: "nimal.f@example.com",
    leaderPhone: "0711223344",
    declaration: "true"
  }, "Private Student (studentType = 1)");
}

runTests();
