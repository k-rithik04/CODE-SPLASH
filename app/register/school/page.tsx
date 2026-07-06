"use client";
import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { validateRequired, validateEmail, validateName, validateSriLankanPhone, validateLength, checkRateLimit, recordSubmissionTimestamp } from "@/lib/validate";
import { useSchoolFormStore } from "@/lib/store";

const districts = [
  "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle",
  "Gampaha", "Hambantota", "Jaffna", "Kalutara", "Kandy", "Kegalle",
  "Kilinochchi", "Kurunegala", "Mannar", "Matale", "Matara", "Monaragala",
  "Mullaitivu", "Nuwara Eliya", "Polonnaruwa", "Puttalam", "Ratnapura",
  "Trincomalee", "Vavuniya",
];

export default function SchoolRegistrationPage() {
  const {
    step, isSubmitting, isSubmitted, visibleMemberCount, errorMsg, formData,
    nextStep: storeNextStep, prevStep: storePrevStep, setIsSubmitting, setIsSubmitted,
    setVisibleMemberCount, setErrorMsg, updateField, updateMember, setStep,
  } = useSchoolFormStore();

  const hasAdditionalMembers = parseInt(formData.noOfMembers) > 1;
  const totalSteps = hasAdditionalMembers ? 4 : 3;

  const handleRadioChange = (name: string, value: string) => {
    updateField(name as keyof typeof formData, value);
  };

  const handleSelectChange = (name: string, value: string) => {
    updateField(name as keyof typeof formData, value);
  };

  const handleMemberChange = (index: number, field: "name" | "grade" | "phone", value: string) => {
    updateMember(index, field, value);
  };

  const validateStep = (): string | null => {
    if (step === 1) {
      if (!validateLength(formData.teamName, 2, 50)) return "Team Name is required (2-50 characters)";
      if (!validateRequired(formData.noOfMembers)) return "Please enter the number of team members";
      const memberCount = parseInt(formData.noOfMembers);
      if (!memberCount || memberCount < 1 || memberCount > 5) return "Number of team members must be between 1 and 5";
      if (!validateRequired(formData.studentType)) return "Please select a registration type";
      if (formData.studentType === "Government") {
        if (!validateRequired(formData.school)) return "School is required";
        if (!validateRequired(formData.schoolAddress)) return "School Address is required";
      }
      if (!validateRequired(formData.district)) return "District is required";
      if (formData.studentType === "Government") {
        if (!validateName(formData.teacherName)) return "Teacher Name must contain only letters and spaces";
        if (!validateEmail(formData.teacherEmail)) return "Please enter a valid email address for the teacher";
        if (!validateSriLankanPhone(formData.teacherPhone)) return "Please enter a valid Sri Lankan phone number for the teacher";
      }
    }
    if (step === 2) {
      if (!validateName(formData.leaderName)) return "Leader Name must contain only letters and spaces";
      if (!validateRequired(formData.leaderGrade)) return "Leader Grade is required";
      if (!validateEmail(formData.leaderEmail)) return "Please enter a valid email address for the leader";
      if (!validateSriLankanPhone(formData.leaderPhone)) return "Please enter a valid Sri Lankan phone number for the leader";
    }
    if (step === 3) {
      const visibleCount = parseInt(formData.noOfMembers) - 1;
      for (let i = 0; i < visibleCount; i++) {
        if (!validateName(formData.members[i].name)) return `Member ${i + 2} Name must contain only letters and spaces`;
        if (!validateRequired(formData.members[i].grade)) return `Member ${i + 2} Grade is required`;
        if (!validateSriLankanPhone(formData.members[i].phone)) return `Please enter a valid Sri Lankan phone number for Member ${i + 2}`;
      }
    }
    return null;
  };

  const nextStep = () => {
    const error = validateStep();
    if (error) {
      setErrorMsg(error);
      return;
    }
    setErrorMsg(null);
    if (step === 2) {
      const count = parseInt(formData.noOfMembers);
      setVisibleMemberCount(count - 1);
      if (count <= 1) {
        setStep(4);
        return;
      }
    }
    storeNextStep();
  };

  const prevStep = () => {
    if (step === 4 && !hasAdditionalMembers) {
      setStep(2);
      return;
    }
    storePrevStep();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const rateLimit = checkRateLimit();
    if (!rateLimit.allowed) {
      setErrorMsg(rateLimit.message || "Too many submissions. Please wait.");
      return;
    }

    if (!formData.declaration) {
      setErrorMsg("You must agree to the declaration to submit.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const formParams = new URLSearchParams();

    formParams.append("studentType", formData.studentType === "Private" ? "1" : "0");
    formParams.append("teamName", formData.teamName);
    formParams.append("noOfMembers", formData.noOfMembers);
    formParams.append("school", formData.school);
    formParams.append("schoolAddress", formData.schoolAddress);
    formParams.append("district", formData.district);
    formParams.append("teacherName", formData.teacherName);
    formParams.append("teacherEmail", formData.teacherEmail);
    formParams.append("teacherPhone", formData.teacherPhone);

    formParams.append("leaderName", formData.leaderName);
    formParams.append("leaderGrade", formData.leaderGrade);
    formParams.append("leaderEmail", formData.leaderEmail);
    formParams.append("leaderPhone", formData.leaderPhone);

    const visibleMembersCount = parseInt(formData.noOfMembers) - 1;
    for (let i = 0; i < visibleMembersCount; i++) {
      const member = formData.members[i];
      formParams.append(`member${i + 2}Name`, member.name);
      formParams.append(`member${i + 2}Grade`, member.grade);
      formParams.append(`member${i + 2}Phone`, member.phone);
    }

    if (formData.declaration) {
      formParams.append("declaration", "I have read and agree to the Code of Conduct, Originality and Consent terms above.");
    }

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

      recordSubmissionTimestamp();
      useSchoolFormStore.getState().reset();
      setIsSubmitted(true);
    } catch (err) {
      setIsSubmitting(false);
      alert(err instanceof Error ? err.message : "Submission failed. Please check your connection and try again.");
    }
  };

  const stepLabels: Record<number, string> = {
    1: "Team Information",
    2: "Leader Details",
    3: "Member Details",
    4: "Consent & Declaration",
  };

  return (
    <div
      className="dark min-h-screen w-full bg-cover bg-center bg-no-repeat bg-fixed text-white"
      style={{ backgroundImage: `url('https://gcymcwaocowoczvvsaxw.supabase.co/storage/v1/object/public/cms-images/assets/register-bg.gif')` }}
    >
      <div className="container mx-auto max-w-3xl py-10 px-4">

        {isSubmitted ? (
          <Card className="bg-black/70 backdrop-blur-md border-neutral-800 shadow-2xl text-white">
            <CardHeader>
              <CardTitle className="text-2xl text-white text-center">Registration Submitted!</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4 py-8">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
              <p className="text-lg text-gray-200">Your school team registration has been successfully submitted.</p>
              <p className="text-gray-400">We&apos;ll review your application and get back to you at the provided email address.</p>
            </CardContent>
            <CardFooter className="justify-center">
              <Link href="/">
                <Button variant="outline" className="px-8 text-white border-white/20 hover:bg-white/10">Back to Home</Button>
              </Link>
            </CardFooter>
          </Card>
        ) : (
        <>
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm font-medium text-gray-300 mb-4">
            <span className="text-primary font-bold">Step {step} of {totalSteps}</span>
            <span>{stepLabels[step]}</span>
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

            {/* --- SECTION 1: TEAM INFORMATION --- */}
            {step === 1 && (
              <>
                <CardHeader>
                  <CardTitle className="text-2xl text-white">SECTION 1 | Team Information</CardTitle>
                  <CardDescription className="text-gray-300">
                    Every team member must be from the same school. A team can have 1 to 5 members.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-white">Team Name <span className="text-red-500">*</span></Label>
                    <Input name="teamName" value={formData.teamName} onChange={(e) => updateField("teamName", e.target.value)} required className="text-white" />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">No of Team Members <span className="text-red-500">*</span></Label>
                    <Input
                      type="number"
                      min={1}
                      max={5}
                      step={1}
                      value={formData.noOfMembers}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v === "" || /^\d*$/.test(v)) updateField("noOfMembers", v);
                      }}
                      onBlur={(e) => {
                        const n = parseInt(e.target.value);
                        if (!n || n < 1) updateField("noOfMembers", "1");
                        else if (n > 5) updateField("noOfMembers", "5");
                        else updateField("noOfMembers", String(n));
                      }}
                      placeholder="1 - 5"
                      required
                      className="text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Registration Type <span className="text-red-500">*</span></Label>
                    <RadioGroup
                      value={formData.studentType}
                      onValueChange={(value) => handleRadioChange("studentType", value)}
                      className="flex flex-row gap-6 mt-2"
                    >
                      {["Government", "Private"].map((type) => (
                        <div key={type} className="flex items-center space-x-2">
                          <RadioGroupItem value={type} id={`type-${type}`} className="border-white/50 data-checked:border-white" />
                          <Label htmlFor={`type-${type}`} className="text-white font-normal cursor-pointer">{type}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  {formData.studentType === "Government" && (
                    <>
                      <div className="space-y-2">
                        <Label className="text-white">School <span className="text-red-500">*</span></Label>
                        <Input name="school" value={formData.school} onChange={(e) => updateField("school", e.target.value)} required className="text-white" />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-white">School Address <span className="text-red-500">*</span></Label>
                        <Input name="schoolAddress" value={formData.schoolAddress} onChange={(e) => updateField("schoolAddress", e.target.value)} required className="text-white" />
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <Label className="text-white">District <span className="text-red-500">*</span></Label>
                    <Select value={formData.district} onValueChange={(value) => handleSelectChange("district", value)} required>
                      <SelectTrigger className="w-full text-white">
                        <SelectValue placeholder="Select District" />
                      </SelectTrigger>
                      <SelectContent>
                        {districts.map((d) => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.studentType === "Government" && (
                    <>
                      <div className="space-y-2">
                        <Label className="text-white">Teacher in charge Name <span className="text-red-500">*</span></Label>
                        <Input name="teacherName" value={formData.teacherName} onChange={(e) => updateField("teacherName", e.target.value)} required className="text-white" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white">Teacher in charge Email Address <span className="text-red-500">*</span></Label>
                        <Input name="teacherEmail" type="email" value={formData.teacherEmail} onChange={(e) => updateField("teacherEmail", e.target.value)} required className="text-white" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white">Teacher in charge Contact Number (Whatsapp) <span className="text-red-500">*</span></Label>
                        <Input name="teacherPhone" placeholder="E.g. 0771234567" value={formData.teacherPhone} onChange={(e) => updateField("teacherPhone", e.target.value)} required className="text-white" />
                      </div>
                    </>
                  )}
                </CardContent>
              </>
            )}

            {/* --- SECTION 2: LEADER INFO --- */}
            {step === 2 && (
              <>
                <CardHeader>
                  <CardTitle className="text-2xl text-white">SECTION 2 | Team Leader Details</CardTitle>
                  <CardDescription className="text-gray-300">Each team should have a proper team leader. The team leader is considered as Member 1.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-white">Team Leader Full Name <span className="text-red-500">*</span></Label>
                    <Input name="leaderName" placeholder="E.g. K C M Jayathilaka" value={formData.leaderName} onChange={(e) => updateField("leaderName", e.target.value)} required className="text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Team Leader Grade/Class <span className="text-red-500">*</span></Label>
                    <Input name="leaderGrade" placeholder="E.g. 12 B" value={formData.leaderGrade} onChange={(e) => updateField("leaderGrade", e.target.value)} required className="text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Team Leader Email Address <span className="text-red-500">*</span></Label>
                    <Input name="leaderEmail" type="email" value={formData.leaderEmail} onChange={(e) => updateField("leaderEmail", e.target.value)} required className="text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Team Leader Contact Number (Whatsapp) <span className="text-red-500">*</span></Label>
                    <Input name="leaderPhone" value={formData.leaderPhone} onChange={(e) => updateField("leaderPhone", e.target.value)} required className="text-white" />
                  </div>
                </CardContent>
              </>
            )}

            {/* --- SECTION 3: MEMBERS INFO --- */}
            {step === 3 && (
              <>
                <CardHeader>
                  <CardTitle className="text-2xl text-white">SECTION 3 | Team Member Details</CardTitle>
                  <CardDescription className="text-gray-300">It is mandatory to include the details of all members.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  {Array.from({ length: visibleMemberCount }).map((_, index) => (
                    <div key={index} className="p-5 border border-white/10 rounded-2xl bg-white/5 space-y-4">
                      <h4 className="font-semibold text-lg border-b border-white/20 pb-2 text-white">Member {index + 2} Details</h4>
                      <div className="space-y-2">
                        <Label className="text-white">Member {index + 2} Full Name <span className="text-red-500">*</span></Label>
                        <Input name="name" value={formData.members[index].name} onChange={(e) => handleMemberChange(index, "name", e.target.value)} required className="text-white" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white">Member {index + 2} Grade/Class <span className="text-red-500">*</span></Label>
                        <Input name="grade" value={formData.members[index].grade} onChange={(e) => handleMemberChange(index, "grade", e.target.value)} required className="text-white" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white">Member {index + 2} Contact Number (Whatsapp) <span className="text-red-500">*</span></Label>
                        <Input name="phone" value={formData.members[index].phone} onChange={(e) => handleMemberChange(index, "phone", e.target.value)} required className="text-white" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </>
            )}

            {/* --- SECTION 4: CONSENT --- */}
            {step === 4 && (
              <>
                <CardHeader>
                  <CardTitle className="text-2xl text-white">SECTION 4 | Consent & Declaration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-white/5 p-6 rounded-2xl text-sm text-gray-200 space-y-4">
                    <p className="font-bold text-lg mb-4 text-white">The Promise We Make Together</p>
                    <p>By hitting Submit, you&apos;re agreeing to play fair, be respectful, and make this hackathon awesome.</p>
                    <div className="space-y-3 mt-4">
                      <p><strong>1. Code of Conduct:</strong> We promise to be respectful to teammates, mentors, and other participants.</p>
                      <p><strong>2. Originality & Work:</strong> All code, designs, and ideas submitted must be created during the hackathon by our team.</p>
                      <p><strong>3. Media &amp; Data Consent:</strong> We&apos;re okay with photos, videos, and project screenshots being used by the organizers for event promotion.</p>
                      <p><strong>4. Health & Safety:</strong> We confirm that all team members are fit to participate and will follow event rules.</p>
                      <p><strong>5. Declaration:</strong> We confirm that all information provided in this form is true to the best of our knowledge.</p>
                      <p><strong>6. Judging & Decisions:</strong> We acknowledge that the decisions made by the judging panel are final and binding in all matters relating to the competition.</p>
                    </div>
                  </div>

                  <div className="p-4 border border-red-500/50 rounded-2xl bg-red-500/10">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="declaration"
                        checked={formData.declaration}
                        onCheckedChange={(checked) => updateField("declaration", checked as boolean)}
                        className="mt-1"
                      />
                      <Label htmlFor="declaration" className="text-base font-medium text-white cursor-pointer">
                        I have read and agree to the Code of Conduct, Originality, and Consent terms above. <span className="text-red-500">*</span>
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </>
            )}

            {/* --- ERROR MESSAGE --- */}
            {errorMsg && (
              <div className="px-6 pb-2">
                <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm flex items-center">
                  <svg className="w-4 h-4 mr-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
                  <span>{errorMsg}</span>
                </div>
              </div>
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
                <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white" disabled={!formData.declaration || isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Registration"} <CheckCircle2 className="ml-2 h-4 w-4" />
                </Button>
              )}
            </CardFooter>

          </form>
        </Card>
      </>
      )}
      </div>
    </div>
  );
}
