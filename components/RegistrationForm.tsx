"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  studentId: string;
  email: string;
  phone: string;
  faculty: string;
  year: string;
}

interface FormData {
  teamName: string;
  category: string;
  university: string;
  numMembers: number;
  leaderName: string;
  leaderId: string;
  leaderEmail: string;
  leaderPhone: string;
  leaderFaculty: string;
  leaderYear: string;
  members: TeamMember[];
}

function createEmptyMember(): TeamMember {
  return {
    id: crypto.randomUUID(),
    name: "",
    studentId: "",
    email: "",
    phone: "",
    faculty: "",
    year: "",
  };
}

export default function RegistrationForm() {
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const stepHeaderRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<FormData>({
    teamName: "",
    category: "",
    university: "",
    numMembers: 1,
    leaderName: "",
    leaderId: "",
    leaderEmail: "",
    leaderPhone: "",
    leaderFaculty: "",
    leaderYear: "",
    members: [],
  });

  useEffect(() => {
    stepHeaderRef.current?.focus();
  }, [step]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "numMembers" ? Math.min(Math.max(Number(value) || 1, 1), 5) : value,
    }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  const handleMemberChange = useCallback((memberId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      members: prev.members.map((m) =>
        m.id === memberId ? { ...m, [name]: value } : m
      ),
    }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[`member_${memberId}_${name}`];
      return next;
    });
  }, []);

  const addMember = useCallback(() => {
    setFormData((prev) => {
      if (prev.members.length >= 4) return prev;
      return { ...prev, members: [...prev.members, createEmptyMember()] };
    });
  }, []);

  const removeMember = useCallback((memberId: string) => {
    setFormData((prev) => ({
      ...prev,
      members: prev.members.filter((m) => m.id !== memberId),
    }));
  }, []);

  const validateStep = useCallback((stepNum: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (stepNum === 1) {
      if (!formData.teamName.trim()) newErrors.teamName = "Team name is required";
    } else if (stepNum === 2) {
      if (!formData.leaderName.trim()) newErrors.leaderName = "Leader name is required";
      if (!formData.leaderEmail.trim()) newErrors.leaderEmail = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.leaderEmail)) newErrors.leaderEmail = "Invalid email format";
      if (!formData.leaderPhone.trim()) newErrors.leaderPhone = "Phone number is required";
    } else if (stepNum === 3) {
      formData.members.forEach((member, idx) => {
        if (!member.name.trim()) newErrors[`member_${member.id}_name`] = `Member ${idx + 1} name is required`;
        if (!member.email.trim()) newErrors[`member_${member.id}_email`] = `Member ${idx + 1} email is required`;
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(member.email)) newErrors[`member_${member.id}_email`] = "Invalid email format";
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const nextStep = useCallback(() => {
    if (validateStep(step)) {
      setStep((prev) => prev + 1);
    }
  }, [step, validateStep]);

  const prevStep = useCallback(() => setStep((prev) => prev - 1), []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(3)) return;
    console.log("Registration payload:", formData);
    alert("Registration submitted! Check console for payload.");
  }, [formData, validateStep]);

  const handleFormKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.target instanceof HTMLInputElement) {
      e.preventDefault();
      if (step < 3) {
        nextStep();
      }
    }
  }, [step, nextStep]);

  return (
    <div className="dark bg-background text-foreground min-h-screen container mx-auto max-w-3xl py-10 px-4">
      <div ref={stepHeaderRef} tabIndex={-1} className="mb-8 outline-none">
        <div className="flex items-center justify-between text-sm font-medium text-muted-foreground mb-4">
          <span className={step >= 1 ? "text-primary font-bold" : ""}>1. Team Info</span>
          <span className={step >= 2 ? "text-primary font-bold" : ""}>2. Leader Info</span>
          <span className={step >= 3 ? "text-primary font-bold" : ""}>3. Team Members</span>
        </div>
        <div
          className="w-full bg-secondary h-2 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={step}
          aria-valuemin={1}
          aria-valuemax={3}
          aria-label={`Step ${step} of 3`}
        >
          <div
            className="bg-primary h-2 transition-all duration-300 ease-in-out"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit} onKeyDown={handleFormKeyDown} noValidate>
          {step === 1 && (
            <>
              <CardHeader>
                <CardTitle>Team Information</CardTitle>
                <CardDescription>Tell us about your team and organization.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="teamName">Team Name <span className="text-red-500" aria-hidden="true">*</span></Label>
                  <Input
                    id="teamName"
                    name="teamName"
                    value={formData.teamName}
                    onChange={handleInputChange}
                    aria-required="true"
                    aria-invalid={!!errors.teamName}
                    aria-describedby={errors.teamName ? "teamName-error" : undefined}
                  />
                  {errors.teamName && <p id="teamName-error" className="text-red-500 text-sm">{errors.teamName}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Hackathon Category/Track</Label>
                  <Input id="category" name="category" value={formData.category} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="university">University / School / Organization</Label>
                  <Input id="university" name="university" value={formData.university} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numMembers">Number of Team Members</Label>
                  <Input
                    id="numMembers"
                    name="numMembers"
                    type="number"
                    min="1"
                    max="5"
                    step="1"
                    value={formData.numMembers}
                    onChange={handleInputChange}
                  />
                </div>
              </CardContent>
            </>
          )}

          {step === 2 && (
            <>
              <CardHeader>
                <CardTitle>Team Leader Information</CardTitle>
                <CardDescription>Primary contact for the team.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="leaderName">Full Name <span className="text-red-500" aria-hidden="true">*</span></Label>
                    <Input
                      id="leaderName"
                      name="leaderName"
                      value={formData.leaderName}
                      onChange={handleInputChange}
                      aria-required="true"
                      aria-invalid={!!errors.leaderName}
                      aria-describedby={errors.leaderName ? "leaderName-error" : undefined}
                    />
                    {errors.leaderName && <p id="leaderName-error" className="text-red-500 text-sm">{errors.leaderName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="leaderId">Student/Employee ID</Label>
                    <Input id="leaderId" name="leaderId" value={formData.leaderId} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="leaderEmail">Email Address <span className="text-red-500" aria-hidden="true">*</span></Label>
                    <Input
                      id="leaderEmail"
                      name="leaderEmail"
                      type="email"
                      value={formData.leaderEmail}
                      onChange={handleInputChange}
                      aria-required="true"
                      aria-invalid={!!errors.leaderEmail}
                      aria-describedby={errors.leaderEmail ? "leaderEmail-error" : undefined}
                    />
                    {errors.leaderEmail && <p id="leaderEmail-error" className="text-red-500 text-sm">{errors.leaderEmail}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="leaderPhone">Phone Number <span className="text-red-500" aria-hidden="true">*</span></Label>
                    <Input
                      id="leaderPhone"
                      name="leaderPhone"
                      type="tel"
                      value={formData.leaderPhone}
                      onChange={handleInputChange}
                      aria-required="true"
                      aria-invalid={!!errors.leaderPhone}
                      aria-describedby={errors.leaderPhone ? "leaderPhone-error" : undefined}
                    />
                    {errors.leaderPhone && <p id="leaderPhone-error" className="text-red-500 text-sm">{errors.leaderPhone}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="leaderFaculty">Faculty / Department</Label>
                    <Input id="leaderFaculty" name="leaderFaculty" value={formData.leaderFaculty} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="leaderYear">Year of Study</Label>
                    <Input id="leaderYear" name="leaderYear" value={formData.leaderYear} onChange={handleInputChange} />
                  </div>
                </div>
              </CardContent>
            </>
          )}

          {step === 3 && (
            <>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>Add between 1 and 4 additional members to your team.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {formData.members.map((member, index) => (
                  <div key={member.id} className="p-4 border rounded-lg relative bg-muted/50">
                    <div className="absolute top-4 right-4">
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => removeMember(member.id)}
                        aria-label={`Remove member ${index + 1}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <h4 className="font-semibold mb-4">Member {index + 1}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`member-name-${member.id}`}>Full Name <span className="text-red-500" aria-hidden="true">*</span></Label>
                        <Input
                          id={`member-name-${member.id}`}
                          name="name"
                          value={member.name}
                          onChange={(e) => handleMemberChange(member.id, e)}
                          aria-required="true"
                          aria-invalid={!!errors[`member_${member.id}_name`]}
                          aria-describedby={errors[`member_${member.id}_name`] ? `member-name-${member.id}-error` : undefined}
                        />
                        {errors[`member_${member.id}_name`] && (
                          <p id={`member-name-${member.id}-error`} className="text-red-500 text-sm">{errors[`member_${member.id}_name`]}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`member-id-${member.id}`}>Student ID</Label>
                        <Input
                          id={`member-id-${member.id}`}
                          name="studentId"
                          value={member.studentId}
                          onChange={(e) => handleMemberChange(member.id, e)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`member-email-${member.id}`}>Email Address <span className="text-red-500" aria-hidden="true">*</span></Label>
                        <Input
                          id={`member-email-${member.id}`}
                          name="email"
                          type="email"
                          value={member.email}
                          onChange={(e) => handleMemberChange(member.id, e)}
                          aria-required="true"
                          aria-invalid={!!errors[`member_${member.id}_email`]}
                          aria-describedby={errors[`member_${member.id}_email`] ? `member-email-${member.id}-error` : undefined}
                        />
                        {errors[`member_${member.id}_email`] && (
                          <p id={`member-email-${member.id}-error`} className="text-red-500 text-sm">{errors[`member_${member.id}_email`]}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`member-phone-${member.id}`}>Phone Number</Label>
                        <Input
                          id={`member-phone-${member.id}`}
                          name="phone"
                          type="tel"
                          value={member.phone}
                          onChange={(e) => handleMemberChange(member.id, e)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`member-faculty-${member.id}`}>Faculty / Department</Label>
                        <Input
                          id={`member-faculty-${member.id}`}
                          name="faculty"
                          value={member.faculty}
                          onChange={(e) => handleMemberChange(member.id, e)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`member-year-${member.id}`}>Year of Study</Label>
                        <Input
                          id={`member-year-${member.id}`}
                          name="year"
                          value={member.year}
                          onChange={(e) => handleMemberChange(member.id, e)}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {formData.members.length < 4 && (
                  <Button type="button" variant="outline" className="w-full border-dashed" onClick={addMember}>
                    <Plus className="mr-2 h-4 w-4" /> Add Team Member
                  </Button>
                )}
              </CardContent>
            </>
          )}

          <CardFooter className="flex justify-between pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={step === 1}
              className={step === 1 ? "invisible" : ""}
              aria-hidden={step === 1}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>

            {step < 3 ? (
              <Button type="button" onClick={nextStep}>
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit">
                Submit Registration <CheckCircle2 className="ml-2 h-4 w-4" />
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
