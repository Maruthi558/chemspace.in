import React from 'react';
import AIAgentWorkspace from '../components/automation/AIAgentWorkspace';

/**
 * AIAutomationCenter / AI Workspace Page
 * Clean, focused, uncluttered environment hosting the ChemSpace Autonomous AI Workspace:
 * - Natural Language Prompt Line at bottom
 * - Conversational Execution & Step-by-Step Tool Chain
 * - Integrated Google Gemini & OpenAI API key configuration
 * - Big Molecules & Clinical Trial Drug Discovery Artifacts on right Stage
 * - Fully aligned with website obsidian dark theme and design system
 */
export default function AIAutomationCenter() {
  return (
    <div
      aria-label="ChemSpace Autonomous AI Workspace"
      className="flex-1 w-full h-[calc(100vh-3.25rem)] flex flex-col overflow-hidden bg-[var(--bg-page)] text-[var(--text-primary)] font-sans"
    >
      <AIAgentWorkspace />
    </div>
  );
}
