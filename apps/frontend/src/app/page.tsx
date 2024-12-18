'use client';

import Image from 'next/image';
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HeroSection } from '@/components/sections/hero-section';
import { motion } from "framer-motion";
import {
  DocumentIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  CloudIcon,
  LockClosedIcon,
  ChartBarIcon,
  CommandLineIcon,
  AcademicCapIcon,
  CalendarIcon,
  BookOpenIcon,
  PresentationChartLineIcon,
  ClockIcon,
  SparklesIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

const FeatureCard = motion(Card);
const MotionDiv = motion.div;

const features = [
  {
    title: "Smart Study Notes",
    description: "Create AI-enhanced study notes with automatic summaries, flashcards, and practice questions.",
    icon: AcademicCapIcon,
    color: "bg-blue-500",
    tag: "Student"
  },
  {
    title: "Assignment Planner",
    description: "Track deadlines, set milestones, and get smart reminders for your assignments and projects.",
    icon: CalendarIcon,
    color: "bg-emerald-500",
    tag: "Student"
  },
  {
    title: "Study Groups",
    description: "Create and join study groups with real-time collaboration and shared resources.",
    icon: UserGroupIcon,
    color: "bg-purple-500",
    tag: "Student"
  },
  {
    title: "Research Assistant",
    description: "AI-powered research helper with citation management and bibliography generation.",
    icon: BookOpenIcon,
    color: "bg-amber-500",
    tag: "Student"
  },
  {
    title: "Presentation Builder",
    description: "Create stunning presentations with smart templates and AI-generated content suggestions.",
    icon: PresentationChartLineIcon,
    color: "bg-pink-500",
    tag: "Student"
  },
  {
    title: "Focus Timer",
    description: "Stay productive with Pomodoro timer and study analytics to track your learning progress.",
    icon: ClockIcon,
    color: "bg-indigo-500",
    tag: "Student"
  },
  {
    title: "Smart Documents",
    description: "Create beautiful and functional documents with AI assistance and real-time collaboration.",
    icon: DocumentIcon,
    color: "bg-cyan-500"
  },
  {
    title: "Task Management",
    description: "Keep track of everything with powerful task management and custom workflows.",
    icon: CheckCircleIcon,
    color: "bg-violet-500"
  },
  {
    title: "Cloud Sync",
    description: "Access your workspace from anywhere with real-time cloud synchronization and offline support.",
    icon: CloudIcon,
    color: "bg-teal-500"
  },
  {
    title: "Enterprise Security",
    description: "Bank-grade encryption and security features to keep your academic work safe.",
    icon: LockClosedIcon,
    color: "bg-red-500"
  },
  {
    title: "AI Learning Assistant",
    description: "Get instant help with concepts, problem-solving, and learning strategies.",
    icon: SparklesIcon,
    color: "bg-yellow-500",
    tag: "Student"
  },
  {
    title: "Progress Analytics",
    description: "Track your academic performance and study habits with detailed insights.",
    icon: ChartBarIcon,
    color: "bg-lime-500",
    tag: "Student"
  }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col min-h-screen">
        <HeroSection />
        
        {/* Feature Grid */}
        <section id="features" className="py-24 relative">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <MotionDiv
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <Badge className="mb-4 bg-blue-50 text-blue-700">Features</Badge>
                <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                  Supercharge your academic success
                </h2>
                <p className="text-xl text-gray-600">
                  Tools and features designed for modern learning and collaboration
                </p>
              </MotionDiv>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <FeatureCard
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
                >
                  <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-10 ${feature.color}`} />
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    {feature.tag && (
                      <Badge variant="secondary" className="mb-2">
                        {feature.tag}
                      </Badge>
                    )}
                    <CardTitle className="text-2xl font-bold">{feature.title}</CardTitle>
                    <CardDescription className="text-gray-600 text-lg">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </FeatureCard>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 bg-white relative">
          <div className="absolute inset-0 bg-grid-gray-200/50 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]" />
          
          <div className="max-w-7xl mx-auto px-4 relative">
            <div className="text-center mb-16">
              <MotionDiv
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <Badge className="mb-4 bg-blue-50 text-blue-700">Pricing</Badge>
                <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                  Simple, affordable pricing
                </h2>
                <p className="text-xl text-gray-600">
                  One plan, everything included
                </p>
              </MotionDiv>
            </div>

            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="max-w-lg mx-auto"
            >
              <Card className="relative overflow-hidden border-0 shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50" />
                <CardHeader className="relative text-center pb-8 pt-8">
                  <CardTitle className="text-3xl font-bold mb-2">Pro Plan</CardTitle>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-bold">$4.99</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="space-y-4 pb-8">
                    {[
                      "All features included",
                      "Unlimited documents and notes",
                      "AI-powered assistance",
                      "Real-time collaboration",
                      "Cloud storage & sync",
                      "Priority support",
                      "No hidden fees"
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                        <span className="text-gray-600">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-4 border-t">
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg"
                      onClick={() => window.location.href = '/auth'}
                    >
                      Get Started Now
                      <ArrowRightIcon className="w-5 h-5 ml-2" />
                    </Button>
                    <p className="text-center mt-4 text-sm text-gray-500">
                      No credit card required • Cancel anytime
                    </p>
                  </div>
                </CardContent>
              </Card>
            </MotionDiv>
          </div>
        </section>
      </div>
    </div>
  );
}
