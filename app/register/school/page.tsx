"use client";
import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { validateRequired, validateSriLankanPhone, checkRateLimit, recordSubmissionTimestamp } from "@/lib/validator";
import { useSchoolFormStore } from "@/lib/store";
import { basePath } from "@/lib/utils";

export default function SchoolRegistrationPage() {
  const {
    step, isSubmitting, isSubmitted, visibleMemberCount, errorMsg, formData,
    nextStep: storeNextStep, prevStep, setIsSubmitting, setIsSubmitted,
    setVisibleMemberCount, setErrorMsg, updateField, updateMember,
  } = useSchoolFormStore();

  const totalSteps = 4;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    if (type === "checkbox" && name === "declaration") {
      updateField("declaration", (e.target as HTMLInputElement).checked);
    } else {
      updateField(name as keyof typeof formData, value);
    }
  };

  const handleMemberChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateMember(index, name as "name" | "grade" | "phone", value);
  };

  const validateStep = (): string | null => {
    if (step === 1) {
      if (!validateRequired(formData.teamName)) return "Team Name is required";
      if (!validateRequired(formData.school)) return "School is required";
      if (!validateRequired(formData.schoolAddress)) return "School Address is required";
      if (!validateRequired(formData.district)) return "District is required";
      if (!validateRequired(formData.teacherName)) return "Teacher Name is required";
      if (!validateRequired(formData.teacherEmail)) return "Teacher Email is required";
      if (!validateSriLankanPhone(formData.teacherPhone)) return "Please enter a valid Sri Lankan phone number for the teacher";
    }
    if (step === 2) {
      if (!validateRequired(formData.leaderName)) return "Leader Name is required";
      if (!validateRequired(formData.leaderGrade)) return "Leader Grade is required";
      if (!validateRequired(formData.leaderEmail)) return "Leader Email is required";
      if (!validateSriLankanPhone(formData.leaderPhone)) return "Please enter a valid Sri Lankan phone number for the leader";
    }
    if (step === 3) {
      const visibleCount = parseInt(formData.noOfMembers) - 1;
      for (let i = 0; i < visibleCount; i++) {
        if (!validateRequired(formData.members[i].name)) return `Member ${i + 2} Name is required`;
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
    if (step === 2) setVisibleMemberCount(parseInt(formData.noOfMembers) - 1);
    storeNextStep();
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
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formParams.toString(),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Submission failed");
      }

      recordSubmissionTimestamp();
      useSchoolFormStore.getState().reset();
      setIsSubmitted(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Submission failed. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="dark min-h-screen w-full bg-cover bg-center bg-no-repeat bg-fixed text-foreground"
      style={{ backgroundImage: `url('${basePath}/assets/register-bg.png')` }}
    >
      <div className="container mx-auto max-w-3xl py-10 px-4">

        {isSubmitted ? (
          <Card className="bg-black/70 backdrop-blur-md border-neutral-800 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl text-white-500 text-center">Registration Submitted!</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4 py-8">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
              <p className="text-lg text-gray-200">Your school team registration has been successfully submitted.</p>
              <p className="text-gray-400">We&apos;ll review your application and get back to you at the provided email address.</p>
            </CardContent>
            <CardFooter className="justify-center">
              <Link href="/register">
                <Button variant="outline" className="px-8">Back to Registration</Button>
              </Link>
            </CardFooter>
          </Card>
        ) : (
        <>
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm font-medium text-muted-foreground mb-4">
            <span className="text-primary font-bold">Step {step} of {totalSteps}</span>
            <span>
              {step === 1 && "Team Information"}
              {step === 2 && "Leader Details"}
              {step === 3 && "Member Details"}
              {step === 4 && "Consent & Declaration"}
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
                    <Label>School Address <span className="text-red-500">*</span></Label>
                    <Input name="schoolAddress" value={formData.schoolAddress} onChange={handleInputChange} required />
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
                        <option value="Hambanthota">Hambanthota</option>
                        <option value="Jaffna">Jaffna</option>
                        <option value="Kaluthara">Kaluthara</option>
                        <option value="Kandy">Kandy</option>
                        <option value="Kegalle">Kegalle</option>
                        <option value="Kilinochchi">Kilinochchi</option>
                        <option value="Kurunagala">Kurunagala</option>
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
                  {Array.from({ length: visibleMemberCount }).map((_, index) => (
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

            {/* --- SECTION 4: CONSENT --- */}
            {step === 4 && (
              <>
                <CardHeader>
                  <CardTitle className="text-2xl text-white-500">SECTION 4 | Consent & Declaration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-white/5 p-6 rounded-lg text-sm text-gray-200 space-y-4">
                    <p className="font-bold text-lg mb-4">The Promise We Make Together</p>
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

            {/* --- ERROR MESSAGE --- */}
            {errorMsg && (
              <div className="px-6 pb-2">
                <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-md text-red-200 text-sm flex items-center">
                  <svg className="w-4 h-4 mr-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
                  <span>{errorMsg}</span>
                </div>
              </div>
            )}

            {/* --- NAVIGATION FOOTER --- */}
            <CardFooter className="flex justify-between pt-6 border-t border-white/10 mt-2">
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
