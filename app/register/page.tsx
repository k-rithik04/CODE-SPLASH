import type { Metadata } from "next";
import RegistrationForm from "@/components/RegistrationForm";

export const metadata: Metadata = {
  title: "Register | CodeSplash 2026",
  description: "Register your team for CodeSplash 2026, the national-level university hackathon.",
};

export default function RegisterPage() {
  return <RegistrationForm />;
}
