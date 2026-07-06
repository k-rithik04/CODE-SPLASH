"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function UniversityRegistrationPage() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleRadioChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMemberChange = (index: number, field: "name" | "gender" | "email" | "phone" | "year", value: string) => {
    const updatedMembers = [...formData.members];
    updatedMembers[index] = { ...updatedMembers[index], [field]: value };
    setFormData((prev) => ({ ...prev, members: updatedMembers }));
  };

  const handleCheckboxArrayChange = (field: "technologies" | "languages" | "interestedAreas", value: string, checked: boolean) => {
    setFormData((prev) => {
      const currentArray = prev[field];
      if (checked) {
        return { ...prev, [field]: [...currentArray, value] };
      } else {
        return { ...prev, [field]: currentArray.filter((item) => item !== value) };
      }
    });
  };

  const nextStep = () => {
    if (step === 1 && !formData.registrationType) {
      return;
    }
    setStep((prev) => (prev < totalSteps ? prev + 1 : prev));
  };
  
  const prevStep = () => setStep((prev) => (prev > 1 ? prev - 1 : prev));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.agreeRules || !formData.agreeAccurate) {
      return;
    }

    setIsSubmitting(true);

    const formParams = new URLSearchParams();

    formParams.append("registrationType", formData.registrationType);

    if (formData.registrationType === "Individual") {
      formParams.append("fullName", formData.fullName);
      formParams.append("gender", formData.gender);
      formParams.append("email", formData.email);
      formParams.append("phone", formData.phone);
      formParams.append("university", formData.university);
      formParams.append("yearOfStudy", formData.yearOfStudy);
    }

    if (formData.registrationType === "Team") {
      formParams.append("teamName", formData.teamName);
      formParams.append("teamSize", formData.teamSize);
      formParams.append("university", formData.university);
      formParams.append("leaderName", formData.leaderName);
      formParams.append("leaderGender", formData.leaderGender);
      formParams.append("leaderEmail", formData.leaderEmail);
      formParams.append("leaderPhone", formData.leaderPhone);
      formParams.append("leaderYear", formData.leaderYear);

      const visibleMembers = parseInt(formData.teamSize) - 1;
      for (let i = 0; i < visibleMembers; i++) {
        const member = formData.members[i];
        formParams.append(`member${i + 2}Name`, member.name);
        formParams.append(`member${i + 2}Gender`, member.gender);
        formParams.append(`member${i + 2}Email`, member.email);
        formParams.append(`member${i + 2}Phone`, member.phone);
        formParams.append(`member${i + 2}Year`, member.year);
      }
    }

    formData.technologies.forEach((tech) => formParams.append("technologies", tech));
    formData.languages.forEach((lang) => formParams.append("languages", lang));
    formParams.append("hackathonExp", formData.hackathonExp);
    formParams.append("hackathonDetails", formData.hackathonDetails);
    formParams.append("links", formData.links);

    formParams.append("projectWorkedOn", formData.projectWorkedOn);
    formParams.append("problemToSolve", formData.problemToSolve);
    formData.interestedAreas.forEach((area) => formParams.append("interestedAreas", area));
    formParams.append("hearAbout", formData.hearAbout);

    formParams.append("agreeRules", "true");
    formParams.append("agreeAccurate", "true");

    try {
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
      const res = await fetch(`${basePath}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formParams.toString(),
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = { success: res.ok };
      }

      if (!data.success) {
        throw new Error(data.error || "Submission failed");
      }

      localStorage.removeItem("university-form-data");
      localStorage.removeItem("university-form-step");
      alert("Registration submitted successfully!");
    } catch (err) {
      setIsSubmitting(false);
      alert(err instanceof Error ? err.message : "Submission failed. Please check your connection and try again.");
    }
  };

  const techOptions = ["Web Development", "Mobile App Development", "AI / Machine Learning", "Cybersecurity", "Cloud Computing", "UI/UX Design", "Data Science", "IoT", "Game Development", "Other"];
  const langOptions = ["Python", "Java", "C", "C++", "JavaScript", "PHP"];
  const areaOptions = ["AI / Machine Learning", "Web Development", "Mobile App Development", "Cybersecurity", "Data Science", "IoT", "Cloud Computing", "UI/UX"];
  const hearOptions = ["Social Media", "University", "Friends", "WhatsApp", "Other"];
  const yearOptions = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

  return (
    <div
      className="dark min-h-screen w-full bg-cover bg-center bg-no-repeat bg-fixed text-white"
      style={{ backgroundImage: `url('https://gcymcwaocowoczvvsaxw.supabase.co/storage/v1/object/public/cms-images/assets/register-bg.gif')` }}
    >
      <div className="container mx-auto max-w-3xl py-10 px-4">

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm font-medium text-gray-300 mb-4">
            <span className="text-primary font-bold">Step {step} of {totalSteps}</span>
            <span>
              {step === 1 && "Registration Type"}
              {formData.registrationType === "Individual" && step === 2 && "Participant Details"}
              {formData.registrationType === "Team" && step === 2 && "Team Information"}
              {formData.registrationType === "Team" && step === 3 && "Leader Details"}
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

        <Card className="bg-black/70 backdrop-blur-md border-neutral-800 shadow-2xl text-white">
          <form onSubmit={handleSubmit}>
            
            {/* --- STEP 1: REGISTRATION TYPE --- */}
            {step === 1 && (
              <>
                <CardHeader>
                  <CardTitle className="text-2xl text-white">Registration Type</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-white">Registration Type <span className="text-red-500">*</span></Label>
                    <RadioGroup
                      value={formData.registrationType}
                      onValueChange={(value) => handleRadioChange("registrationType", value)}
                      className="mt-2"
                    >
                      {["Individual", "Team"].map((type) => (
                        <div key={type} className="flex items-center space-x-2">
                          <RadioGroupItem value={type} id={`reg-${type}`} />
                          <Label htmlFor={`reg-${type}`} className="text-white font-normal cursor-pointer">{type}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </CardContent>
              </>
            )}

            {/* --- PATH A: INDIVIDUAL DETAILS (Step 2) --- */}
            {formData.registrationType === "Individual" && step === 2 && (
              <>
                <CardHeader>
                  <CardTitle className="text-2xl text-white">Participant Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-white">Full Name <span className="text-red-500">*</span></Label>
                    <Input name="fullName" placeholder="Your answer" value={formData.fullName} onChange={(e) => handleRadioChange("fullName", e.target.value)} required className="text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Gender <span className="text-red-500">*</span></Label>
                    <RadioGroup
                      value={formData.gender}
                      onValueChange={(value) => handleRadioChange("gender", value)}
                      className="mt-2"
                    >
                      {["Male", "Female"].map((gen) => (
                        <div key={gen} className="flex items-center space-x-2">
                          <RadioGroupItem value={gen} id={`gender-${gen}`} />
                          <Label htmlFor={`gender-${gen}`} className="text-white font-normal cursor-pointer">{gen}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Email Address <span className="text-red-500">*</span></Label>
                    <Input name="email" type="email" placeholder="Your answer" value={formData.email} onChange={(e) => handleRadioChange("email", e.target.value)} required className="text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Contact Number (WhatsApp) <span className="text-red-500">*</span></Label>
                    <Input name="phone" placeholder="E.g. 0771234567" value={formData.phone} onChange={(e) => handleRadioChange("phone", e.target.value)} required className="text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">University <span className="text-red-500">*</span></Label>
                    <Input name="university" placeholder="Your answer" value={formData.university} onChange={(e) => handleRadioChange("university", e.target.value)} required className="text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Year of Study <span className="text-red-500">*</span></Label>
                    <RadioGroup
                      value={formData.yearOfStudy}
                      onValueChange={(value) => handleRadioChange("yearOfStudy", value)}
                      className="mt-2"
                    >
                      {yearOptions.map((year) => (
                        <div key={year} className="flex items-center space-x-2">
                          <RadioGroupItem value={year} id={`year-${year}`} />
                          <Label htmlFor={`year-${year}`} className="text-white font-normal cursor-pointer">{year}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </CardContent>
              </>
            )}

            {/* --- PATH B: TEAM INFO (Step 2) --- */}
            {formData.registrationType === "Team" && step === 2 && (
              <>
                <CardHeader>
                  <CardTitle className="text-2xl text-white">Team Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-white">Team Name <span className="text-red-500">*</span></Label>
                    <Input name="teamName" value={formData.teamName} onChange={(e) => handleRadioChange("teamName", e.target.value)} required className="text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">University <span className="text-red-500">*</span></Label>
                    <Input name="university" value={formData.university} onChange={(e) => handleRadioChange("university", e.target.value)} required className="text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">How many members are in your team <span className="text-red-500">*</span></Label>
                    <RadioGroup
                      value={formData.teamSize}
                      onValueChange={(value) => handleRadioChange("teamSize", value)}
                      className="mt-2"
                    >
                      {["2", "3", "4", "5"].map((num) => (
                        <div key={num} className="flex items-center space-x-2">
                          <RadioGroupItem value={num} id={`teamsize-${num}`} />
                          <Label htmlFor={`teamsize-${num}`} className="text-white font-normal cursor-pointer">{num}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </CardContent>
              </>
            )}

            {/* --- PATH B: LEADER DETAILS (Step 3) --- */}
            {formData.registrationType === "Team" && step === 3 && (
              <>
                <CardHeader>
                  <CardTitle className="text-2xl text-white">Team Leader Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-white">Leader&apos;s Full Name <span className="text-red-500">*</span></Label>
                    <Input name="leaderName" value={formData.leaderName} onChange={(e) => handleRadioChange("leaderName", e.target.value)} required className="text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Gender <span className="text-red-500">*</span></Label>
                    <RadioGroup
                      value={formData.leaderGender}
                      onValueChange={(value) => handleRadioChange("leaderGender", value)}
                      className="mt-2"
                    >
                      {["Male", "Female"].map((gen) => (
                        <div key={gen} className="flex items-center space-x-2">
                          <RadioGroupItem value={gen} id={`leaderGender-${gen}`} />
                          <Label htmlFor={`leaderGender-${gen}`} className="text-white font-normal cursor-pointer">{gen}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Email <span className="text-red-500">*</span></Label>
                    <Input name="leaderEmail" type="email" value={formData.leaderEmail} onChange={(e) => handleRadioChange("leaderEmail", e.target.value)} required className="text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Contact Number (WhatsApp) <span className="text-red-500">*</span></Label>
                    <Input name="leaderPhone" value={formData.leaderPhone} onChange={(e) => handleRadioChange("leaderPhone", e.target.value)} required className="text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Year of Study</Label>
                    <RadioGroup
                      value={formData.leaderYear}
                      onValueChange={(value) => handleRadioChange("leaderYear", value)}
                      className="mt-2"
                    >
                      {yearOptions.map((year) => (
                        <div key={year} className="flex items-center space-x-2">
                          <RadioGroupItem value={year} id={`leaderYear-${year}`} />
                          <Label htmlFor={`leaderYear-${year}`} className="text-white font-normal cursor-pointer">{year}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </CardContent>
              </>
            )}

            {/* --- PATH B: MEMBER DETAILS (Step 4) --- */}
            {formData.registrationType === "Team" && step === 4 && (
              <>
                <CardHeader>
                  <CardTitle className="text-2xl text-white">Team Member Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                  {Array.from({ length: parseInt(formData.teamSize) - 1 }).map((_, index) => (
                    <div key={index} className="p-5 border border-white/10 rounded-2xl bg-white/5 space-y-4">
                      <h4 className="font-semibold text-lg border-b border-white/20 pb-2 text-white">Member {index + 2} Details</h4>
                      <div className="space-y-2">
                        <Label className="text-white">Full Name <span className="text-red-500">*</span></Label>
                        <Input name="name" value={formData.members[index].name} onChange={(e) => handleMemberChange(index, "name", e.target.value)} required className="text-white" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white">Gender <span className="text-red-500">*</span></Label>
                        <RadioGroup
                          value={formData.members[index].gender}
                          onValueChange={(value) => handleMemberChange(index, "gender", value)}
                          className="mt-2"
                        >
                          {["Male", "Female"].map((gen) => (
                            <div key={gen} className="flex items-center space-x-2">
                              <RadioGroupItem value={gen} id={`member${index}-gender-${gen}`} />
                              <Label htmlFor={`member${index}-gender-${gen}`} className="text-white font-normal cursor-pointer">{gen}</Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white">Email <span className="text-red-500">*</span></Label>
                        <Input name="email" type="email" value={formData.members[index].email} onChange={(e) => handleMemberChange(index, "email", e.target.value)} required className="text-white" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white">Contact Number (WhatsApp) <span className="text-red-500">*</span></Label>
                        <Input name="phone" value={formData.members[index].phone} onChange={(e) => handleMemberChange(index, "phone", e.target.value)} required className="text-white" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white">Year of Study</Label>
                        <RadioGroup
                          value={formData.members[index].year}
                          onValueChange={(value) => handleMemberChange(index, "year", value)}
                          className="mt-2"
                        >
                          {yearOptions.map((year) => (
                            <div key={year} className="flex items-center space-x-2">
                              <RadioGroupItem value={year} id={`member${index}-year-${year}`} />
                              <Label htmlFor={`member${index}-year-${year}`} className="text-white font-normal cursor-pointer">{year}</Label>
                            </div>
                          ))}
                        </RadioGroup>
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
                  <CardTitle className="text-2xl text-white">Technical Skills</CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                  
                  <div className="space-y-4">
                    <Label className="text-white">What technologies are {formData.registrationType === "Team" ? "your team" : "you"} familiar with?</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {techOptions.map((tech) => (
                        <div key={tech} className="flex items-center space-x-2">
                          <Checkbox
                            id={`tech-${tech}`}
                            checked={formData.technologies.includes(tech)}
                            onCheckedChange={(checked) => handleCheckboxArrayChange("technologies", tech, checked as boolean)}
                          />
                          <Label htmlFor={`tech-${tech}`} className="text-white font-normal cursor-pointer">{tech}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4 border-t border-white/20 pt-6">
                    <Label className="text-white">Programming Languages Known <span className="text-red-500">*</span></Label>
                    <div className="flex flex-col space-y-3">
                      {langOptions.map((lang) => (
                        <div key={lang} className="flex items-center space-x-2">
                          <Checkbox
                            id={`lang-${lang}`}
                            checked={formData.languages.includes(lang)}
                            onCheckedChange={(checked) => handleCheckboxArrayChange("languages", lang, checked as boolean)}
                          />
                          <Label htmlFor={`lang-${lang}`} className="text-white font-normal cursor-pointer">{lang}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4 border-t border-white/20 pt-6">
                    <Label className="text-white">Have {formData.registrationType === "Team" ? "your team members" : "you"} participated in hackathons before? <span className="text-red-500">*</span></Label>
                    <RadioGroup
                      value={formData.hackathonExp}
                      onValueChange={(value) => handleRadioChange("hackathonExp", value)}
                      className="mt-2"
                    >
                      {["Yes", "No"].map((opt) => (
                        <div key={opt} className="flex items-center space-x-2">
                          <RadioGroupItem value={opt} id={`hackathon-${opt}`} />
                          <Label htmlFor={`hackathon-${opt}`} className="text-white font-normal cursor-pointer">{opt}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  {formData.hackathonExp === "Yes" && (
                    <div className="space-y-2">
                      <Label className="text-white">If yes, mention previous hackathons or achievements</Label>
                      <Input name="hackathonDetails" value={formData.hackathonDetails} onChange={(e) => handleRadioChange("hackathonDetails", e.target.value)} placeholder="Your answer" className="text-white" />
                    </div>
                  )}

                  <div className="space-y-2 border-t border-white/20 pt-6">
                    <Label className="text-white">GitHub / LinkedIn Links (Optional)</Label>
                    <Input name="links" value={formData.links} onChange={(e) => handleRadioChange("links", e.target.value)} placeholder="Your answer" className="text-white" />
                  </div>
                </CardContent>
              </>
            )}

            {/* --- SHARED: INNOVATION & PROBLEM SOLVING --- */}
            {((formData.registrationType === "Individual" && step === 4) || (formData.registrationType === "Team" && step === 6)) && (
              <>
                <CardHeader>
                  <CardTitle className="text-2xl text-white">Innovation & Problem Solving</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-white">
                      {formData.registrationType === "Team" ? "Describe a project your team has worked on before " : "Describe a project you have worked on before "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input name="projectWorkedOn" placeholder="Your answer" value={formData.projectWorkedOn} onChange={(e) => handleRadioChange("projectWorkedOn", e.target.value)} required className="text-white" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-white">
                      {formData.registrationType === "Team" ? "What kind of problem does your team want to solve in this hackathon?" : "What kind of problem do you want to solve in this hackathon?"}
                    </Label>
                    <Input name="problemToSolve" placeholder="Your answer" value={formData.problemToSolve} onChange={(e) => handleRadioChange("problemToSolve", e.target.value)} className="text-white" />
                  </div>

                  <div className="space-y-4 border-t border-white/20 pt-6">
                    <Label className="text-white">
                      {formData.registrationType === "Team" ? "Which area is your team most interested in?" : "Which area are you most interested in?"}
                    </Label>
                    <div className="flex flex-col space-y-3">
                      {areaOptions.map((area) => (
                        <div key={area} className="flex items-center space-x-2">
                          <Checkbox
                            id={`area-${area}`}
                            checked={formData.interestedAreas.includes(area)}
                            onCheckedChange={(checked) => handleCheckboxArrayChange("interestedAreas", area, checked as boolean)}
                          />
                          <Label htmlFor={`area-${area}`} className="text-white font-normal cursor-pointer">{area}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-white/20 pt-6">
                    <Label className="text-white">How did you hear about CodeSplash 2026? <span className="text-red-500">*</span></Label>
                    <RadioGroup
                      value={formData.hearAbout}
                      onValueChange={(value) => handleRadioChange("hearAbout", value)}
                      className="mt-2"
                    >
                      {hearOptions.map((opt) => (
                        <div key={opt} className="flex items-center space-x-2">
                          <RadioGroupItem value={opt} id={`hear-${opt}`} />
                          <Label htmlFor={`hear-${opt}`} className="text-white font-normal cursor-pointer">{opt}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </CardContent>
              </>
            )}

            {/* --- SHARED: DECLARATION --- */}
            {((formData.registrationType === "Individual" && step === 5) || (formData.registrationType === "Team" && step === 7)) && (
              <>
                <CardHeader>
                  <CardTitle className="text-2xl text-white">Declaration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-white/5 p-6 rounded-2xl text-sm text-gray-200 space-y-4">
                    <p className="font-bold text-lg mb-4 text-white">The Promise We Make Together</p>
                    <p>By hitting Submit, you&apos;re agreeing to play fair, be respectful, and make this hackathon awesome.</p>
                    <div className="space-y-3 mt-4">
                      <p><strong>1. Code of Conduct:</strong> We promise to be respectful to teammates, mentors, and other participants.</p>
                      <p><strong>2. Originality & Work:</strong> All code, designs, and ideas submitted must be created during the hackathon by our team.</p>
                      <p><strong>3. Media & Data Consent:</strong> We&apos;re okay with photos, videos, and project screenshots being used by the organizers for event promotion.</p>
                      <p><strong>4. Health & Safety:</strong> We confirm that all team members are fit to participate and will follow event rules.</p>
                      <p><strong>5. Declaration:</strong> We confirm that all information provided in this form is true to the best of our knowledge.</p>
                      <p><strong>6. Judging & Decisions:</strong> We acknowledge that the decisions made by the judging panel are final and binding in all matters relating to the competition.</p>
                    </div>
                  </div>

                  <div className="p-4 border border-red-500/50 rounded-2xl bg-red-500/10 space-y-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="agreeRules"
                        checked={formData.agreeRules}
                        onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, agreeRules: checked as boolean }))}
                        className="mt-1"
                      />
                      <Label htmlFor="agreeRules" className="text-base font-medium text-white cursor-pointer">
                        I agree to follow the rules and regulations of CodeSplash 2026 <span className="text-red-500">*</span>
                      </Label>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="agreeAccurate"
                        checked={formData.agreeAccurate}
                        onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, agreeAccurate: checked as boolean }))}
                        className="mt-1"
                      />
                      <Label htmlFor="agreeAccurate" className="text-base font-medium text-white cursor-pointer">
                        I confirm that all information provided is accurate. <span className="text-red-500">*</span>
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </>
            )}

            {/* --- NAVIGATION FOOTER --- */}
            <CardFooter className="flex justify-between pt-6 border-t border-white/10 mt-2">
              {step === 1 ? (
                <Link href="/">
                  <Button type="button" variant="outline" className="text-white border-white/20 hover:bg-white/10">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                </Link>
              ) : (
                <Button type="button" variant="outline" onClick={prevStep} className="text-white border-white/20 hover:bg-white/10">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
              )}
              
              {step < totalSteps ? (
                <Button type="button" onClick={nextStep} className="bg-white text-black hover:bg-gray-200">
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white" disabled={!formData.agreeRules || !formData.agreeAccurate || isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Registration"} <CheckCircle2 className="ml-2 h-4 w-4" />
                </Button>
              )}
            </CardFooter>

          </form>
        </Card>
      </div>
    </div>
  );
}
