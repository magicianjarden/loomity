'use client';

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import { motion } from "framer-motion";

const MotionDiv = motion.div;
const MotionHeading = motion.h1;
const MotionParagraph = motion.p;

export function HeroSection() {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-gray-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-gray-200/50 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]" />
      
      {/* Gradient Orbs */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
      <div className="absolute top-1/3 -right-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-32 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />

      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge className="mb-4 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors">
            ✨ Introducing Loomity
          </Badge>
        </MotionDiv>

        <MotionHeading 
          className="text-6xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Your workspace,
          <br />
          reimagined.
        </MotionHeading>

        <MotionParagraph 
          className="text-xl md:text-2xl text-gray-600 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          Your all-in-one platform for smart notes, study tools, and AI assistance.
          <br />
          Designed to help you learn better and achieve more.
        </MotionParagraph>

        <MotionDiv 
          className="flex gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Button 
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg"
            onClick={() => window.location.href = '/auth'}
          >
            Get Started Free
            <ArrowRightIcon className="w-5 h-5 ml-2" />
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-6 text-lg"
            onClick={() => {
              const features = document.getElementById('features');
              features?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Learn more
          </Button>
        </MotionDiv>
      </div>
    </section>
  );
}
