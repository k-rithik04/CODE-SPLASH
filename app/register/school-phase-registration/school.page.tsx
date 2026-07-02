"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function HackathonRegistration() {
  const [step, setStep] = useState(1);
  const totalSteps = 6;

  // Initialize comprehensive form state mapping to the screenshots
  const [formData, setFormData] = useState({
    // SECTION 1
    teamName: "",
    noOfMembers: "3",
    school: "",
    district: "",
    teacherName: "",
    teacherEmail: "",
    teacherPhone: "",
    // SECTION 2
    leaderName: "",
    leaderGrade: "",
    leaderEmail: "",
    leaderPhone: "",
    // SECTION 3 (Members 2 to 5 max)
    members: [
      { name: "", grade: "", phone: "" },
      { name: "", grade: "", phone: "" },
      { name: "", grade: "", phone: "" },
      { name: "", grade: "", phone: "" },
    ],
    // SECTION 4
    technologies: [] as string[],
    languages: [] as string[],
    hackathonExp: "",
    hackathonDetails: "",
    // SECTION 5
    problemSolved: "",
    problemsToSolve: "",
    analyticalSkills: [] as string[],
    hearAbout: "",
    // SECTION 6
    declaration: false,
  });

  // Handle standard text/radio inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    if (type === "checkbox" && name === "declaration") {
      setFormData((prev) => ({ ...prev, declaration: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle Checkbox Arrays (for Multiple Choice Questions)
  const handleArrayChange = (field: "technologies" | "languages" | "analyticalSkills", value: string, checked: boolean) => {
    setFormData((prev) => {
      const currentArray = prev[field];
      if (checked) {
        return { ...prev, [field]: [...currentArray, value] };
      } else {
        return { ...prev, [field]: currentArray.filter((item) => item !== value) };
      }
    });
  };

  // Handle dynamic member inputs
  const handleMemberChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedMembers = [...formData.members];
    updatedMembers[index] = { ...updatedMembers[index], [name]: value };
    setFormData((prev) => ({ ...prev, members: updatedMembers }));
  };

  const nextStep = () => setStep((prev) => (prev < totalSteps ? prev + 1 : prev));
  const prevStep = () => setStep((prev) => (prev > 1 ? prev - 1 : prev));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Payload ready for submission:", formData);

    const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdE6R9rQ3pIJHBoxNhrdM12mjUL66sHaGCSohT4SIRUhN2xkw/formResponse";

    const formParams = new URLSearchParams();

    // MAPPED FIELDS (from your current Google Form)
    formParams.append("entry.1832195380", formData.teamName);
    formParams.append("entry.22626685", formData.noOfMembers);
    formParams.append("entry.1339584474", formData.school);
    formParams.append("entry.1373233628", formData.leaderName);
    formParams.append("entry.255878988", formData.leaderEmail);


    formParams.append("entry.DUMMY_DISTRICT", formData.district);
    formParams.append("entry.DUMMY_TEACHER", formData.teacherName);
    formParams.append("entry.DUMMY_TEACHER_EMAIL", formData.teacherEmail);
    formParams.append("entry.DUMMY_TEACHER_PHONE", formData.teacherPhone);
    formParams.append("entry.DUMMY_LEADER_GRADE", formData.leaderGrade);
    formParams.append("entry.DUMMY_LEADER_PHONE", formData.leaderPhone);

    const visibleMembersCount = parseInt(formData.noOfMembers) - 1;
    for (let i = 0; i < visibleMembersCount; i++) {
      const member = formData.members[i];
      formParams.append(`entry.DUMMY_MEMBER_${i}_NAME`, member.name);
      formParams.append(`entry.DUMMY_MEMBER_${i}_GRADE`, member.grade);
      formParams.append(`entry.DUMMY_MEMBER_${i}_PHONE`, member.phone);
    }

    formData.technologies.forEach((tech) => {
      formParams.append("entry.DUMMY_TECH", tech);
    });
    formData.languages.forEach((lang) => {
      formParams.append("entry.DUMMY_LANG", lang);
    });
    formParams.append("entry.DUMMY_HACK_EXP", formData.hackathonExp);
    formParams.append("entry.DUMMY_HACK_DET", formData.hackathonDetails);

    formParams.append("entry.DUMMY_PROB_SOLVED", formData.problemSolved);
    formParams.append("entry.DUMMY_PROB_TOSOLVE", formData.problemsToSolve);
    formData.analyticalSkills.forEach((skill) => {
      formParams.append("entry.DUMMY_SKILLS", skill);
    });
    formParams.append("entry.DUMMY_HEARABOUT", formData.hearAbout);

    window.open(`${GOOGLE_FORM_URL}?${formParams.toString()}`, "_blank");
    alert("Redirecting to Google Forms — please complete your submission there.");
  };

  return (
    <div
      className="dark min-h-screen w-full bg-cover bg-center bg-no-repeat bg-fixed text-foreground"
      style={{ backgroundImage: `url('/assets/register-bg.png')` }}
    >
      <div className="container mx-auto max-w-3xl py-10 px-4">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm font-medium text-muted-foreground mb-4">
            <span className="text-primary font-bold">Step {step} of {totalSteps}</span>
            <span>
              {step === 1 && "Team Information"}
              {step === 2 && "Leader Details"}
              {step === 3 && "Member Details"}
              {step === 4 && "Technical Skills"}
              {step === 5 && "Problem Solving"}
              {step === 6 && "Consent & Declaration"}
            </span>
          </div>
          <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
            <div
              className="bg-primary h-2 transition-all duration-300 ease-in-out"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        <Card className="bg-black/70 backdrop-blur-md border-neutral-800 shadow-2xl">
          <form onSubmit={handleSubmit}>

            {/* --- SECTION 1: TEAM INFORMATION --- */}
            {step === 1 && (
              <>
                <CardHeader>
                  <CardTitle className="text-2xl text-white-500">SECTION 1 | Team Information</CardTitle>
                  <CardDescription className="text-gray-300">
                    Every team member must be from the same school. A team must have a minimum of 3 members and max 5.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Team Name <span className="text-red-500">*</span></Label>
                    <Input name="teamName" value={formData.teamName} onChange={handleInputChange} required />
                  </div>

                  <div className="space-y-2">
                    <Label>No of Team Members <span className="text-red-500">*</span></Label>
                    <div className="flex flex-col space-y-2 mt-2">
                      {["3", "4", "5"].map((num) => (
                        <label key={num} className="flex items-center space-x-2 cursor-pointer">
                          <input type="radio" name="noOfMembers" value={num} checked={formData.noOfMembers === num} onChange={handleInputChange} className="h-4 w-4 text-primary bg-background border-input" required />
                          <span>{num}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>School <span className="text-red-500">*</span></Label>
                    <Input name="school" value={formData.school} onChange={handleInputChange} required />
                  </div>

                  <div className="space-y-2">
                    <Label>District <span className="text-red-500">*</span></Label>
                    <select name="district" value={formData.district} onChange={handleInputChange} required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      <option value="">Select District</option>
                      <option value="Ampara">Ampara</option>
                      <option value="Anuradhapura">Anuradhapura</option>
                      <option value="Badulla">Badulla</option>
                      <option value="Batticaloa">Batticaloa</option>
                      <option value="Colombo">Colombo</option>
                      <option value="Galle">Galle</option>
                      <option value="Gampaha">Gampaha</option>
                      <option value="Hambantota">Hambantota</option>
                      <option value="Jaffna">Jaffna</option>
                      <option value="Kalutara">Kalutara</option>
                      <option value="Kandy">Kandy</option>
                      <option value="Kegalle">Kegalle</option>
                      <option value="Kilinochchi">Kilinochchi</option>
                      <option value="Kurunegala">Kurunegala</option>
                      <option value="Mannar">Mannar</option>
                      <option value="Matale">Matale</option>
                      <option value="Matara">Matara</option>
                      <option value="Monaragala">Monaragala</option>
                      <option value="Mullaitivu">Mullaitivu</option>
                      <option value="Nuwara Eliya">Nuwara Eliya</option>
                      <option value="Polonnaruwa">Polonnaruwa</option>
                      <option value="Puttalam">Puttalam</option>
                      <option value="Ratnapura">Ratnapura</option>
                      <option value="Trincomalee">Trincomalee</option>
                      <option value="Vavuniya">Vavuniya</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Teacher in charge Name <span className="text-red-500">*</span></Label>
                    <Input name="teacherName" value={formData.teacherName} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Teacher in charge Email Address <span className="text-red-500">*</span></Label>
                    <Input name="teacherEmail" type="email" value={formData.teacherEmail} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Teacher in charge Contact Number (Whatsapp) <span className="text-red-500">*</span></Label>
                    <Input name="teacherPhone" placeholder="E.g. 0771234567" value={formData.teacherPhone} onChange={handleInputChange} required />
                  </div>
                </CardContent>
              </>
            )}

            {/* --- SECTION 2: LEADER INFO --- */}
            {step === 2 && (
              <>
                <CardHeader>
                  <CardTitle className="text-2xl text-white-500">SECTION 2 | Team Leader Details</CardTitle>
                  <CardDescription className="text-gray-300">Each team should have a proper team leader. The team leader is considered as Member 1.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Team Leader Full Name <span className="text-red-500">*</span></Label>
                    <Input name="leaderName" placeholder="E.g. K C M Jayathilaka" value={formData.leaderName} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Team Leader Grade/Class <span className="text-red-500">*</span></Label>
                    <Input name="leaderGrade" placeholder="E.g. 12 B" value={formData.leaderGrade} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Team Leader Email Address <span className="text-red-500">*</span></Label>
                    <Input name="leaderEmail" type="email" value={formData.leaderEmail} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Team Leader Contact Number (Whatsapp) <span className="text-red-500">*</span></Label>
                    <Input name="leaderPhone" value={formData.leaderPhone} onChange={handleInputChange} required />
                  </div>
                </CardContent>
              </>
            )}

            {/* --- SECTION 3: MEMBERS INFO --- */}
            {step === 3 && (
              <>
                <CardHeader>
                  <CardTitle className="text-2xl text-white-500">SECTION 3 | Team Member Details</CardTitle>
                  <CardDescription className="text-gray-300">It is mandatory to include the details of all members.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Loop exactly the number of members selected in Step 1, minus the leader (Member 1) */}
                  {Array.from({ length: parseInt(formData.noOfMembers) - 1 }).map((_, index) => (
                    <div key={index} className="p-5 border rounded-lg bg-white/5 space-y-4">
                      <h4 className="font-semibold text-lg border-b border-white/20 pb-2">Member {index + 2} Details</h4>
                      <div className="space-y-2">
                        <Label>Member {index + 2} Full Name <span className="text-red-500">*</span></Label>
                        <Input name="name" value={formData.members[index].name} onChange={(e) => handleMemberChange(index, e)} required />
                      </div>
                      <div className="space-y-2">
                        <Label>Member {index + 2} Grade/Class <span className="text-red-500">*</span></Label>
                        <Input name="grade" value={formData.members[index].grade} onChange={(e) => handleMemberChange(index, e)} required />
                      </div>
                      <div className="space-y-2">
                        <Label>Member {index + 2} Contact Number (Whatsapp) <span className="text-red-500">*</span></Label>
                        <Input name="phone" value={formData.members[index].phone} onChange={(e) => handleMemberChange(index, e)} required />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </>
            )}

            {/* --- SECTION 4: TECHNICAL SKILLS --- */}
            {step === 4 && (
              <>
                <CardHeader>
                  <CardTitle className="text-2xl text-white-500">SECTION 4 | Technical Skills</CardTitle>
                  <CardDescription className="text-gray-300">Let us know your team&apos;s current technical background.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">

                  <div className="space-y-4">
                    <Label className="text-base">Which technologies are you familiar with? <span className="text-red-500">*</span></Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {["Web Development", "AI/ML", "UI/UX Design", "Blockchain", "IoT", "Mobile App Development", "Game Development", "Robotics"].map((tech) => (
                        <label key={tech} className="flex items-center space-x-2 cursor-pointer">
                          <input type="checkbox" checked={formData.technologies.includes(tech)} onChange={(e) => handleArrayChange("technologies", tech, e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary bg-background" />
                          <span>{tech}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4 border-t border-white/20 pt-6">
                    <Label className="text-base">What Programming languages have you learned? <span className="text-red-500">*</span></Label>
                    <div className="flex flex-col space-y-3">
                      {["Python", "JavaScript", "C++", "Java", "Other"].map((lang) => (
                        <label key={lang} className="flex items-center space-x-2 cursor-pointer">
                          <input type="checkbox" checked={formData.languages.includes(lang)} onChange={(e) => handleArrayChange("languages", lang, e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary bg-background" />
                          <span>{lang}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4 border-t border-white/20 pt-6">
                    <Label className="text-base">Have your team members participated in hackathons before? <span className="text-red-500">*</span></Label>
                    <div className="flex flex-col space-y-2">
                      {["Yes", "No"].map((opt) => (
                        <label key={opt} className="flex items-center space-x-2 cursor-pointer">
                          <input type="radio" name="hackathonExp" value={opt} checked={formData.hackathonExp === opt} onChange={handleInputChange} className="h-4 w-4 text-primary bg-background border-input" required />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {formData.hackathonExp === "Yes" && (
                    <div className="space-y-2">
                      <Label>If yes, please mention here</Label>
                      <Input name="hackathonDetails" value={formData.hackathonDetails} onChange={handleInputChange} placeholder="Your answer" />
                    </div>
                  )}
                </CardContent>
              </>
            )}

            {/* --- SECTION 5: PROBLEM SOLVING --- */}
            {step === 5 && (
              <>
                <CardHeader>
                  <CardTitle className="text-2xl text-white-500">SECTION 5 | Problem Solving Skills</CardTitle>
                  <CardDescription className="text-gray-300">Tell us how your team approaches challenges.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Describe a problem that your team (or a member) has solved using technology</Label>
                    <textarea
                      name="problemSolved"
                      value={formData.problemSolved}
                      onChange={handleInputChange}
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      placeholder="Your answer"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>What kind of problems do you like to solve? <span className="text-red-500">*</span></Label>
                    <Input name="problemsToSolve" placeholder="E.g. Learning & Education Tools" value={formData.problemsToSolve} onChange={handleInputChange} required />
                  </div>

                  <div className="space-y-4 border-t border-white/20 pt-6">
                    <Label className="text-base">Which of these analytical skills does your team feel most confident in? <span className="text-red-500">*</span></Label>
                    <div className="flex flex-col space-y-3">
                      {["Designing user friendly interfaces", "Pitching and explaining technical ideas", "Designing algorithms and logical flows", "Researching", "Debugging"].map((skill) => (
                        <label key={skill} className="flex items-center space-x-2 cursor-pointer">
                          <input type="checkbox" checked={formData.analyticalSkills.includes(skill)} onChange={(e) => handleArrayChange("analyticalSkills", skill, e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary bg-background" />
                          <span>{skill}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-white/20 pt-6">
                    <Label>How did you hear about CodeSplash 2026? <span className="text-red-500">*</span></Label>
                    <Input name="hearAbout" placeholder="Your answer" value={formData.hearAbout} onChange={handleInputChange} required />
                  </div>
                </CardContent>
              </>
            )}

            {/* --- SECTION 6: CONSENT --- */}
            {step === 6 && (
              <>
                <CardHeader>
                  <CardTitle className="text-2xl text-white-500">SECTION 6 | Consent & Declaration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-white/5 p-6 rounded-lg text-sm text-gray-200 space-y-4">
                    <p className="font-bold text-lg mb-4">The Promise We Make Together 🤝</p>
                    <p>By hitting Submit, you&apos;re agreeing to play fair, be respectful, and make this hackathon awesome.</p>
                    <div className="space-y-3 mt-4">
                      <p><strong>1. Code of Conduct:</strong> We promise to be respectful to teammates, mentors, and other participants.</p>
                      <p><strong>2. Originality & Work:</strong> All code, designs, and ideas submitted will be created during the hackathon by our team.</p>
                      <p><strong>3. Media &amp; Data Consent:</strong> We&apos;re okay with photos, videos, and project screenshots being used by the organizers for event promotion.</p>
                      <p><strong>4. Health & Safety:</strong> We confirm that all team members are fit to participate and will follow event rules.</p>
                      <p><strong>5. Declaration:</strong> We confirm that all information provided in this form is true to the best of our knowledge.</p>
                    </div>
                  </div>

                  <div className="p-4 border border-red-500/50 rounded-lg bg-red-500/10">
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="declaration"
                        checked={formData.declaration}
                        onChange={handleInputChange}
                        className="mt-1 h-5 w-5 rounded border-gray-300 text-red-500 bg-background"
                        required
                      />
                      <span className="text-base font-medium">I have read and agree to the Code of Conduct, Originality and Consent terms above. <span className="text-red-500">*</span></span>
                    </label>
                  </div>
                </CardContent>
              </>
            )}

            {/* --- NAVIGATION FOOTER --- */}
            <CardFooter className="flex justify-between pt-6 border-t border-white/10 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={step === 1}
                className={step === 1 ? "invisible" : ""}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>

              {step < totalSteps ? (
                <Button type="button" onClick={nextStep} className="bg-white text-black hover:bg-gray-200">
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white" disabled={!formData.declaration}>
                  Submit Registration <CheckCircle2 className="ml-2 h-4 w-4" />
                </Button>
              )}
            </CardFooter>

          </form>
        </Card>
      </div>
    </div>
  );
}

