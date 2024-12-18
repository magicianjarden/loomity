'use client';

import * as React from "react"
import { useState } from 'react';
import AuthForm from "../../components/auth/auth-form";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs"
import { 
  Sparkles, 
  Zap, 
  Shield, 
  Clock,
  Users,
  Layers
} from 'lucide-react';
import { cn } from "../../lib/utils";

export default function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  const features = [
    {
      icon: <Sparkles className="h-5 w-5" />,
      title: "AI-Powered",
      description: "Experience the future with AI-driven insights"
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: "Security",
      description: "Encytped Data Stay Your Data"
    },
    {
      icon: <Clock className="h-5 w-5" />,
      title: "Real-time",
      description: "Seamless team collaboration"
    },
    {
      icon: <Zap className="h-5 w-5" />,
      title: "Lightning Fast",
      description: "Built for speed"
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: "Team-First",
      description: "Powerful tools for teams"
    },
    {
      icon: <Layers className="h-5 w-5" />,
      title: "All-in-One",
      description: "Your complete workspace"
    }
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left side - Auth form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">
              {mode === 'signin' ? 'Welcome back' : 'Create an account'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {mode === 'signin' 
                ? 'Enter your credentials to access your account' 
                : 'Start your 30-day free trial. No credit card required.'}
            </p>
          </div>

          <div
            role="tablist"
            className="w-full"
          >
            <Tabs defaultValue={mode}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger 
                  value="signin"
                  onClick={() => setMode('signin')}
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger 
                  value="signup"
                  onClick={() => setMode('signup')}
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>
              <TabsContent value="signin">
                <div className="mt-4">
                  <AuthForm mode="signin" />
                </div>
              </TabsContent>
              <TabsContent value="signup">
                <div className="mt-4">
                  <AuthForm mode="signup" />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Right side - Feature cards */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-sm">
          <div className="space-y-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className={cn(
                  "group relative p-6 rounded-3xl bg-white",
                  "border border-slate-100",
                  "flex items-start gap-4",
                  "hover:shadow-lg transition-all duration-300"
                )}
              >
                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {feature.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
