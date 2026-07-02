"use client";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, School } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="dark min-h-screen w-full bg-cover bg-center bg-no-repeat bg-fixed flex items-center justify-center p-4"
      style={{ backgroundImage: `url('/assets/register-bg.png')` }}>

      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-0"></div>

      <div className="max-w-5xl w-full z-10 relative">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 tracking-tight drop-shadow-lg">
            Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-purple-500">Path</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 drop-shadow">
            Select the registration phase that applies to you to begin.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* School Phase Card */}
          <Link href="/register/school">
            <Card
              className="bg-black/60 backdrop-blur-xl border-orange-500/40 hover:border-orange-500 transition-all duration-500 cursor-pointer group hover:-translate-y-3 hover:shadow-[0_0_40px_rgba(249,115,22,0.3)]"
            >
              <CardHeader className="text-center pb-4 pt-10">
                <div className="mx-auto bg-gradient-to-br from-orange-500/20 to-red-500/20 p-6 rounded-full mb-6 group-hover:scale-110 transition-transform duration-500 border border-orange-500/30">
                  <School className="w-16 h-16 text-orange-400" />
                </div>
                <CardTitle className="text-4xl text-white font-bold tracking-wide">School Phase</CardTitle>
                <CardDescription className="text-gray-300 text-lg mt-4 px-4 leading-relaxed">
                  For school students competing in teams of 3 to 5 members. Represent your school!
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center pt-6 pb-10">
                <Button className="bg-orange-600 hover:bg-orange-500 text-white w-3/4 text-lg py-6 shadow-lg shadow-orange-900/50 transition-all duration-300 group-hover:w-full">
                  Register as School
                </Button>
              </CardContent>
            </Card>
          </Link>

          {/* University Phase Card */}
          <Link href="/register/university">
            <Card
              className="bg-black/60 backdrop-blur-xl border-purple-500/40 hover:border-purple-500 transition-all duration-500 cursor-pointer group hover:-translate-y-3 hover:shadow-[0_0_40px_rgba(168,85,247,0.3)]"
            >
              <CardHeader className="text-center pb-4 pt-10">
                <div className="mx-auto bg-gradient-to-br from-purple-500/20 to-blue-500/20 p-6 rounded-full mb-6 group-hover:scale-110 transition-transform duration-500 border border-purple-500/30">
                  <GraduationCap className="w-16 h-16 text-purple-400" />
                </div>
                <CardTitle className="text-4xl text-white font-bold tracking-wide">University Phase</CardTitle>
                <CardDescription className="text-gray-300 text-lg mt-4 px-4 leading-relaxed">
                  For university undergrads registering individually or in teams of up to 5 members.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center pt-6 pb-10">
                <Button className="bg-purple-600 hover:bg-purple-500 text-white w-3/4 text-lg py-6 shadow-lg shadow-purple-900/50 transition-all duration-300 group-hover:w-full">
                  Register as University
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
