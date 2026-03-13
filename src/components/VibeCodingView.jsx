import React from 'react';
import { Bot, Lightbulb, Rocket, FileCode2 } from 'lucide-react';

const SectionCard = ({ icon: Icon, title, children }) => (
  <section className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm">
    <div className="flex items-center gap-2 mb-3">
      <Icon size={18} className="text-blue-600 dark:text-blue-400" />
      <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">{title}</h3>
    </div>
    <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">{children}</div>
  </section>
);

const VibeCodingView = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div className="rounded-2xl border border-blue-200 dark:border-blue-900 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/40 dark:to-cyan-950/40 p-6">
        <div className="flex items-center gap-3 mb-2">
          <Bot size={24} className="text-blue-700 dark:text-blue-400" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Vibe Coding</h2>
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Use this space for your AI development playbook, reusable prompts, and synthetic starter files.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard icon={Lightbulb} title="What Is Vibe Coding?">
          <p>
            Vibe coding is rapid prototyping with AI pair-programming. You provide intent and constraints,
            then iterate quickly with generated code, tests, and refinements.
          </p>
          <p>
            The goal is speed with control: small increments, frequent validation, and clear acceptance criteria.
          </p>
        </SectionCard>

        <SectionCard icon={Rocket} title="Getting Started">
          <p>1. Define a narrow problem statement and success metric.</p>
          <p>2. Ask AI for a minimal first version with testable behavior.</p>
          <p>3. Review output, run it, and request targeted improvements.</p>
          <p>4. Capture reusable prompts and patterns in this page.</p>
        </SectionCard>

        <SectionCard icon={FileCode2} title="Synthetic Files">
          <p>
            Add representative sample files and payloads for fast testing. Keep examples small and realistic.
          </p>
          <p>
            Suggested structure: sample inputs, expected outputs, and one edge case for each scenario.
          </p>
        </SectionCard>

        <SectionCard icon={Bot} title="Prompt Tips">
          <p>Ask for: objective, constraints, acceptance criteria, and output format.</p>
          <p>Include: coding style, libraries to use, and what to avoid.</p>
          <p>Request: a short test plan before large refactors.</p>
        </SectionCard>
      </div>
    </div>
  );
};

export default VibeCodingView;
