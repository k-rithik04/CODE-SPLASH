"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { basePath } from "@/lib/utils";

export default function UniversityRegistrationPage() {
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    registrationType: "",
    
    fullName: "",
    gender: "",
    email: "",
    phone: "",
    university: "",
    yearOfStudy: "",
    
    teamName: "",
    teamSize: "2",
    leaderName: "",
    leaderGender: "",
    leaderEmail: "",
    leaderPhone: "",
    leaderYear: "",
    members: [
      { name: "", gender: "", email: "", phone: "", year: "" },
      { name: "", gender: "", email: "", phone: "", year: "" },
      { name: "", gender: "", email: "", phone: "", year: "" },
      { name: "", gender: "", email: "", phone: "", year: "" },
    ],
    
    technologies: [] as string[],
    languages: [] as string[],
    hackathonExp: "",
    hackathonDetails: "",
    links: "",
    
    projectWorkedOn: "",
    problemToSolve: "",
    interestedAreas: [] as string[],
    hearAbout: "",
    
    agreeRules: false,
    agreeAccurate: false,
  });

  const totalSteps = formData.registrationType === "Team" ? 7 : 5;

  useEffect(() => {
    try {
      const saved = localStorage.getItem("university-form-data");
      const savedStep = localStorage.getItem("university-form-step");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved) setFormData(JSON.parse(saved));
      if (savedStep) setStep(Number(savedStep));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("university-form-data", JSON.stringify(formData));
      localStorage.setItem("university-form-step", String(step));
    } catch {}
  }, [formData, step]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    if (type === "checkbox" && (name === "agreeRules" || name === "agreeAccurate")) {
      setFormData((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleArrayChange = (field: "technologies" | "languages" | "interestedAreas", value: string, checked: boolean) => {
    setFormData((prev) => {
      const currentArray = prev[field];
      if (checked) {
        return { ...prev, [field]: [...currentArray, value] };
      } else {
        return { ...prev, [field]: currentArray.filter((item) => item !== value) };
      }
    });
  };

  const handleMemberChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedMembers = [...formData.members];
    updatedMembers[index] = { ...updatedMembers[index], [name]: value };
    setFormData((prev) => ({ ...prev, members: updatedMembers }));
  };

  const nextStep = () => {
    if (step === 1 && !formData.registrationType) {
      alert("Please select a registration type.");
      return;
    }
    setStep((prev) => (prev < totalSteps ? prev + 1 : prev));
  };
  
  const prevStep = () => setStep((prev) => (prev > 1 ? prev - 1 : prev));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.removeItem("university-form-data");
    localStorage.removeItem("university-form-step");
    console.log("Payload ready for Google Forms:", formData);
    alert("Registration payload logged to console!");
  };

  const techOptions = ["Web Development", "Mobile App Development", "AI / Machine Learning", "Cybersecurity", "Cloud Computing", "UI/UX Design", "Data Science", "IoT", "Game Development", "Other"];
  const langOptions = ["Python", "Java", "C", "C++", "JavaScript", "PHP"];
  const areaOptions = ["AI / Machine Learning", "Web Development", "Mobile App Development", "Cybersecurity", "Data Science", "IoT", "Cloud Computing", "UI/UX"];
  const hearOptions = ["Social Media", "University", "Friends", "WhatsApp", "Other"];
  const yearOptions = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

  return (
    <div 
      className="dark min-h-screen w-full bg-cover bg-center bg-no-repeat bg-fixed text-foreground"
      style={{ backgroundImage: `url('${basePath}/assets/register-bg.png')` }}
    >
      <div className="container mx-auto max-w-3xl py-10 px-4">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm font-medium text-muted-foreground mb-4">
            <span className="text-primary font-bold">Step {step} of {totalSteps}</span>
            <span>
              {step === 1 && "Registration Type"}
              {formData.registrationType === "Individual" && step === 2 && "Participant Details"}
              {formData.registrationType === "Team" && step === 2 && "Team Information"}
              {formData.registrationType === "Team" && step === 3 && "Leader's Details"}
              {formData.registrationType === "Team" && step === 4 && "Member Details"}
              {((formData.registrationType === "Individual" && step === 3) || (formData.registrationType === "Team" && step === 5)) && "Technical Skills"}
              {((formData.registrationType === "Individual" && step === 4) || (formData.registrationType === "Team" && step === 6)) && "Innovation & Problem Solving"}
              {((formData.registrationType === "Individual" && step === 5) || (formData.registrationType === "Team" && step === 7)) && "Declaration"}
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
            
            {/* --- STEP 1: REGISTRATION TYPE --- */}
            {step === 1 && (
              <>
                <CardHeader>
                  <CardTitle className="text-2xl text-white-400">Registration Type</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <Label className="text-base">Registration Type : <span className="text-red-500">*</span></Label>
                    <div className="flex flex-col space-y-3 mt-2">
                      {["Individual", "Team"].map((type) => (
                        <label key={type} className="flex items-center space-x-3 cursor-pointer">
                          <input type="radio" name="registrationType" value={type} checked={formData.registrationType === type} onChange={handleInputChange} className="h-4 w-4 text-purple-600 bg-background border-input" required />
                          <span className="text-lg">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </>
            )}

            {/* --- PATH A: INDIVIDUAL DETAILS (Step 2) --- */}
            {formData.registrationType === "Individual" && step === 2 && (
              <>
                <CardHeader>
                  <CardTitle className="text-2xl text-white-400">Participant Details (For individual) :</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Full name : <span className="text-red-500">*</span></Label>
                    <Input name="fullName" placeholder="Your answer" value={formData.fullName} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Gender : <span className="text-red-500">*</span></Label>
                    <div className="flex flex-col space-y-2">
                      {["Male", "Female"].map((gen) => (
                        <label key={gen} className="flex items-center space-x-2 cursor-pointer">
                          <input type="radio" name="gender" value={gen} checked={formData.gender === gen} onChange={handleInputChange} className="h-4 w-4 text-purple-600 bg-background border-input" required />
                          <span>{gen}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>E-mail address : <span className="text-red-500">*</span></Label>
                    <Input name="email" type="email" placeholder="Your answer" value={formData.email} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Contact Number (Whatsapp) : <span className="text-red-500">*</span></Label>
                    <Input name="phone" placeholder="Your answer" value={formData.phone} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label>University : <span className="text-red-500">*</span></Label>
                    <Input name="university" placeholder="Your answer" value={formData.university} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Year of Study : <span className="text-red-500">*</span></Label>
                    <div className="flex flex-col space-y-2">
                      {yearOptions.map((year) => (
                        <label key={year} className="flex items-center space-x-2 cursor-pointer">
                          <input type="radio" name="yearOfStudy" value={year} checked={formData.yearOfStudy === year} onChange={handleInputChange} className="h-4 w-4 text-purple-600 bg-background border-input" required />
                          <span>{year}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </>
            )}

            {/* --- PATH B: TEAM INFO (Step 2) --- */}
            {formData.registrationType === "Team" && step === 2 && (
              <>
                <CardHeader>
                  <CardTitle className="text-2xl text-white-400">Team Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Team Name : <span className="text-red-500">*</span></Label>
                    <Input name="teamName" value={formData.teamName} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label>University : <span className="text-red-500">*</span></Label>
                    <Input name="university" value={formData.university} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label>How many members are in your team <span className="text-red-500">*</span></Label>
                    <div className="flex flex-col space-y-2 mt-2">
                      {["2", "3", "4", "5"].map((num) => (
                        <label key={num} className="flex items-center space-x-2 cursor-pointer">
                          <input type="radio" name="teamSize" value={num} checked={formData.teamSize === num} onChange={handleInputChange} className="h-4 w-4 text-purple-600 bg-background border-input" required />
                          <span>{num}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </>
            )}

            {/* --- PATH B: LEADER DETAILS (Step 3) --- */}
            {formData.registrationType === "Team" && step === 3 && (
              <>
                <CardHeader>
                  <CardTitle className="text-2xl text-white-400">Team Leader&apos;s details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Leader&apos;s Full Name : <span className="text-red-500">*</span></Label>
                    <Input name="leaderName" value={formData.leaderName} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Gender : <span className="text-red-500">*</span></Label>
                    <div className="flex flex-col space-y-2">
                      {["Male", "Female"].map((gen) => (
                        <label key={gen} className="flex items-center space-x-2 cursor-pointer">
                          <input type="radio" name="leaderGender" value={gen} checked={formData.leaderGender === gen} onChange={handleInputChange} className="h-4 w-4 text-purple-600 bg-background border-input" required />
                          <span>{gen}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>E-mail : <span className="text-red-500">*</span></Label>
                    <Input name="leaderEmail" type="email" value={formData.leaderEmail} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Contact Number : (Whatsapp) <span className="text-red-500">*</span></Label>
                    <Input name="leaderPhone" value={formData.leaderPhone} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Year of Study :</Label>
                    <div className="flex flex-col space-y-2">
                      {yearOptions.map((year) => (
                        <label key={year} className="flex items-center space-x-2 cursor-pointer">
                          <input type="radio" name="leaderYear" value={year} checked={formData.leaderYear === year} onChange={handleInputChange} className="h-4 w-4 text-purple-600 bg-background border-input" />
                          <span>{year}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </>
            )}

            {/* --- PATH B: MEMBER DETAILS (Step 4) --- */}
            {formData.registrationType === "Team" && step === 4 && (
              <>
                <CardHeader>
                  <CardTitle className="text-2xl text-white-400">Team Member Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                  {Array.from({ length: parseInt(formData.teamSize) - 1 }).map((_, index) => (
                    <div key={index} className="p-5 border rounded-lg bg-white/5 space-y-4">
                      <h4 className="font-semibold text-lg border-b border-white/20 pb-2 text-white-300">Member#{index + 1} details</h4>
                      <div className="space-y-2">
                        <Label>Full name : <span className="text-red-500">*</span></Label>
                        <Input name="name" value={formData.members[index].name} onChange={(e) => handleMemberChange(index, e)} required />
                      </div>
                      <div className="space-y-2">
                        <Label>Gender : <span className="text-red-500">*</span></Label>
                        <div className="flex flex-col space-y-2">
                          {["Male", "Female"].map((gen) => (
                            <label key={gen} className="flex items-center space-x-2 cursor-pointer">
                              <input type="radio" name="gender" value={gen} checked={formData.members[index].gender === gen} onChange={(e) => handleMemberChange(index, e)} className="h-4 w-4 text-purple-600 bg-background border-input" required />
                              <span>{gen}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>E-mail : <span className="text-red-500">*</span></Label>
                        <Input name="email" type="email" value={formData.members[index].email} onChange={(e) => handleMemberChange(index, e)} required />
                      </div>
                      <div className="space-y-2">
                        <Label>Contact Number : (Whatsapp) <span className="text-red-500">*</span></Label>
                        <Input name="phone" value={formData.members[index].phone} onChange={(e) => handleMemberChange(index, e)} required />
                      </div>
                      <div className="space-y-2">
                        <Label>Year of Study :</Label>
                        <div className="flex flex-col space-y-2">
                          {yearOptions.map((year) => (
                            <label key={year} className="flex items-center space-x-2 cursor-pointer">
                              <input type="radio" name="year" value={year} checked={formData.members[index].year === year} onChange={(e) => handleMemberChange(index, e)} className="h-4 w-4 text-purple-600 bg-background border-input" />
                              <span>{year}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </>
            )}

            {/* --- SHARED: TECHNICAL SKILLS --- */}
            {((formData.registrationType === "Individual" && step === 3) || (formData.registrationType === "Team" && step === 5)) && (
              <>
                <CardHeader>
                  <CardTitle className="text-2xl text-white-400">Technical skills {formData.registrationType === "Team" ? "(For Team)" : "(For individual)"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                  
                  <div className="space-y-4">
                    <Label className="text-base">What technologies are {formData.registrationType === "Team" ? "your team" : "you"} familiar with?</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {techOptions.map((tech) => (
                        <label key={tech} className="flex items-center space-x-2 cursor-pointer">
                          <input type="checkbox" checked={formData.technologies.includes(tech)} onChange={(e) => handleArrayChange("technologies", tech, e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-purple-600 bg-background" />
                          <span>{tech}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4 border-t border-white/20 pt-6">
                    <Label className="text-base">Programming Languages known <span className="text-red-500">*</span></Label>
                    <div className="flex flex-col space-y-3">
                      {langOptions.map((lang) => (
                        <label key={lang} className="flex items-center space-x-2 cursor-pointer">
                          <input type="checkbox" checked={formData.languages.includes(lang)} onChange={(e) => handleArrayChange("languages", lang, e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-purple-600 bg-background" />
                          <span>{lang}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4 border-t border-white/20 pt-6">
                    <Label className="text-base">Have {formData.registrationType === "Team" ? "your team members" : "you"} participated in hackathons before? <span className="text-red-500">*</span></Label>
                    <div className="flex flex-col space-y-2">
                      {["Yes", "No"].map((opt) => (
                        <label key={opt} className="flex items-center space-x-2 cursor-pointer">
                          <input type="radio" name="hackathonExp" value={opt} checked={formData.hackathonExp === opt} onChange={handleInputChange} className="h-4 w-4 text-purple-600 bg-background border-input" required />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {formData.hackathonExp === "Yes" && (
                    <div className="space-y-2">
                      <Label>If yes, mention previous hackathons or achievements</Label>
                      <Input name="hackathonDetails" value={formData.hackathonDetails} onChange={handleInputChange} placeholder="Your answer" />
                    </div>
                  )}

                  <div className="space-y-2 border-t border-white/20 pt-6">
                    <Label>GitHub / LinkedIn Links (Optional)</Label>
                    <Input name="links" value={formData.links} onChange={handleInputChange} placeholder="Your answer" />
                  </div>
                </CardContent>
              </>
            )}

            {/* --- SHARED: INNOVATION & PROBLEM SOLVING --- */}
            {((formData.registrationType === "Individual" && step === 4) || (formData.registrationType === "Team" && step === 6)) && (
              <>
                <CardHeader>
                  <CardTitle className="text-2xl text-white-400">Innovation & Problem Solving {formData.registrationType === "Team" ? "(For Team)" : "(For individual)"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>
                      {formData.registrationType === "Team" ? "Describe a project your team has worked on before " : "Describe a project you have worked on before "} 
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input name="projectWorkedOn" placeholder="" value={formData.projectWorkedOn} onChange={handleInputChange} required />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>
                      {formData.registrationType === "Team" ? "What kind of problem does your team want to solve in this hackathon?" : "What kind of problem do you want to solve in this hackathon?"}
                    </Label>
                    <Input name="problemToSolve" placeholder="" value={formData.problemToSolve} onChange={handleInputChange} />
                  </div>

                  <div className="space-y-4 border-t border-white/20 pt-6">
                    <Label className="text-base">
                      {formData.registrationType === "Team" ? "Which area is your team most interested in?" : "Which area is you most interested in?"}
                    </Label>
                    <div className="flex flex-col space-y-3">
                      {areaOptions.map((area) => (
                        <label key={area} className="flex items-center space-x-2 cursor-pointer">
                          <input type="checkbox" checked={formData.interestedAreas.includes(area)} onChange={(e) => handleArrayChange("interestedAreas", area, e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-purple-600 bg-background" />
                          <span>{area}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-white/20 pt-6">
                    <Label>How did you hear about CodeSplash 2026? <span className="text-red-500">*</span></Label>
                    <div className="flex flex-col space-y-2 mt-2">
                      {hearOptions.map((opt) => (
                        <label key={opt} className="flex items-center space-x-2 cursor-pointer">
                          <input type="radio" name="hearAbout" value={opt} checked={formData.hearAbout === opt} onChange={handleInputChange} className="h-4 w-4 text-purple-600 bg-background border-input" required />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </>
            )}

            {/* --- SHARED: DECLARATION --- */}
            {((formData.registrationType === "Individual" && step === 5) || (formData.registrationType === "Team" && step === 7)) && (
              <>
                <CardHeader>
                  <CardTitle className="text-2xl text-white-400">Declaration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-6 border border-red-500/50 rounded-lg bg-red-500/10 space-y-4">
                    <p className="text-red-500 font-bold">*</p>
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        name="agreeRules" 
                        checked={formData.agreeRules} 
                        onChange={handleInputChange} 
                        className="mt-1 h-5 w-5 rounded border-gray-300 text-purple-600 bg-background" 
                        required 
                      />
                      <span className="text-base font-medium">I agree follow rules and regulations of CodeSplash 2026</span>
                    </label>
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        name="agreeAccurate" 
                        checked={formData.agreeAccurate} 
                        onChange={handleInputChange} 
                        className="mt-1 h-5 w-5 rounded border-gray-300 text-purple-600 bg-background" 
                        required 
                      />
                      <span className="text-base font-medium">I confirm that all information provided is accurate.</span>
                    </label>
                  </div>
                </CardContent>
              </>
            )}

            {/* --- NAVIGATION FOOTER --- */}
            <CardFooter className="flex justify-between pt-6 border-t border-white/10 mt-6">
              {step === 1 ? (
                <Link href="/register">
                  <Button type="button" variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                </Link>
              ) : (
                <Button type="button" variant="outline" onClick={prevStep}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
              )}
              
              {step < totalSteps ? (
                <Button type="button" onClick={nextStep} >
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white" disabled={!formData.agreeRules || !formData.agreeAccurate}>
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
