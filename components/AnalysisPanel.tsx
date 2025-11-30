import React from 'react';
import { Issue } from '../types';
import { Clock, BarChart, ExternalLink, Wrench, Lightbulb, Code } from 'lucide-react';

interface AnalysisPanelProps {
  issue: Issue | null;
  loading: boolean;
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ issue, loading }) => {
  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400 animate-pulse">
        <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center mb-4">
          <Wrench className="text-indigo-400 animate-spin" size={24} />
        </div>
        <h3 className="text-lg font-medium text-slate-200">Issue Analysis Agent</h3>
        <p className="text-sm mt-2">Reading issue details, estimating workload, and formulating a plan...</p>
      </div>
    );
  }

  if (!issue || !issue.analysis) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-500">
        <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4 grayscale opacity-50">
          <BarChart size={32} />
        </div>
        <p>Select an issue to generate an AI contribution plan.</p>
      </div>
    );
  }

  const { analysis } = issue;
  
  // Color code difficulty
  const diffColor = analysis.difficulty <= 2 ? 'text-green-400' : analysis.difficulty <= 3 ? 'text-amber-400' : 'text-red-400';

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      <div className="border-b border-slate-700 pb-4">
        <h2 className="text-xl font-semibold text-white mb-2">{issue.title}</h2>
        <a href={issue.url} target="_blank" rel="noreferrer" className="text-sm text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1">
          View on GitHub <ExternalLink size={12} />
        </a>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
          <div className="text-slate-500 text-xs uppercase font-semibold mb-1 flex items-center gap-2">
            <BarChart size={14} /> Difficulty
          </div>
          <div className={`text-2xl font-bold ${diffColor}`}>
            {analysis.difficulty}/5
          </div>
        </div>
        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
          <div className="text-slate-500 text-xs uppercase font-semibold mb-1 flex items-center gap-2">
            <Clock size={14} /> Est. Time
          </div>
          <div className="text-2xl font-bold text-slate-200">
            {analysis.estimated_hours}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-400 uppercase mb-3 flex items-center gap-2">
            <Wrench size={16} /> Required Skills
        </h3>
        <div className="flex flex-wrap gap-2">
            {analysis.required_skills.map((skill, i) => (
                <span key={i} className="px-3 py-1 bg-indigo-900/40 text-indigo-300 text-sm rounded-md border border-indigo-500/30">
                    {skill}
                </span>
            ))}
        </div>
      </div>

      <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
        <h3 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
            <Lightbulb size={16} className="text-amber-400" /> Summary
        </h3>
        <p className="text-slate-400 text-sm leading-relaxed">
            {analysis.summary}
        </p>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <Code size={16} className="text-green-400" /> Implementation Plan
        </h3>
        <div className="space-y-3">
            {analysis.implementation_plan.map((step, i) => (
                <div key={i} className="flex gap-3">
                    <div className="flex-none w-6 h-6 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center text-xs font-bold mt-0.5">
                        {i + 1}
                    </div>
                    <p className="text-sm text-slate-400 pt-0.5">{step}</p>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};
