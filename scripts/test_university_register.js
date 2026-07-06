async function submitForm(data, label) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value)) {
      value.forEach(v => params.append(key, v));
    } else {
      params.append(key, value);
    }
  }

  try {
    const res = await fetch("http://localhost:3000/api/register", {
      method: "POST",
      body: params,
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
  console.log("Starting API tests for /api/register (University Flow)...\n");

  // Test 1: Team registration
  await submitForm({
    registrationType: "Team",
    teamName: "CodeSplash Warriors",
    teamSize: "3",
    university: "University of Kelaniya",
    leaderName: "Dinesh Kumar",
    leaderGender: "Male",
    leaderEmail: "dinesh@example.com",
    leaderPhone: "0771112233",
    leaderYear: "3rd Year",
    member2Name: "Sara Fernando",
    member2Gender: "Female",
    member2Email: "sara@example.com",
    member2Phone: "0772223344",
    member2Year: "2nd Year",
    member3Name: "Amal Perera",
    member3Gender: "Male",
    member3Email: "amal@example.com",
    member3Phone: "0773334455",
    member3Year: "3rd Year",
    technologies: ["Web Development", "AI / Machine Learning"],
    languages: ["Python", "JavaScript"],
    hackathonExp: "Yes",
    hackathonDetails: "Participated in hackX 2025",
    links: "https://github.com/team",
    projectWorkedOn: "AI-powered waste management",
    problemToSolve: "Waste management in urban areas",
    interestedAreas: ["Sustainability", "Smart Cities"],
    hearAbout: "University notice board",
    agreeRules: "true",
    agreeAccurate: "true",
  }, "Team Registration (3 members)");

  // Test 2: Individual registration
  await submitForm({
    registrationType: "Individual",
    fullName: "Kavindu Silva",
    gender: "Male",
    email: "kavindu@example.com",
    phone: "0774445566",
    university: "University of Kelaniya",
    yearOfStudy: "2nd Year",
    technologies: ["Mobile App Development"],
    languages: ["Dart", "Flutter"],
    hackathonExp: "No",
    hackathonDetails: "",
    links: "",
    projectWorkedOn: "",
    problemToSolve: "Education accessibility",
    interestedAreas: ["EdTech"],
    hearAbout: "Social media",
    agreeRules: "true",
    agreeAccurate: "true",
  }, "Individual Registration");
}

runTests();
