import React from 'react';
import { Issue } from '../types';
import { AlertCircle, Tag, CheckCircle2, GitPullRequest } from 'lucide-react';

interface IssueListProps {
  issues: Issue[];
  onSelectIssue: (issue: Issue) => void;
  selectedIssueId?: number;
}

export const IssueList: React.FC<IssueListProps> = ({ issues, onSelectIssue, selectedIssueId }) => {
  if (issues.length === 0) {
    return (
      <div className="text-center p-10 text-slate-500 italic border border-dashed border-slate-800 rounded-xl">
        <p className="mb-2">No matching issues found.</p>
        <p className="text-xs">We strictly filter for <span className="text-green-400 font-bold">Open</span>, <span className="text-indigo-400 font-bold">Unassigned</span> issues with <span className="text-red-400 font-bold">No PRs</span>.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-800/50">
      <table className="w-full text-left text-sm text-slate-400">
        <thead className="bg-slate-900 text-xs uppercase text-slate-400 font-semibold">
          <tr>
            <th className="px-6 py-4">Issue Details</th>
            <th className="px-6 py-4">Verified Status</th>
            <th className="px-6 py-4 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700">
          {issues.map((issue, idx) => {
            // We use idx as temporary ID if real ID missing from fresh search
            const isSelected = selectedIssueId === issue.id || (issue.id === undefined && selectedIssueId === idx); 
            
            return (
              <tr 
                key={idx} 
                onClick={() => onSelectIssue(issue)}
                className={`cursor-pointer transition-colors ${
                  isSelected ? 'bg-indigo-900/20' : 'hover:bg-slate-700/50'
                }`}
              >
                <td className="px-6 py-4 max-w-md">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 text-green-500 shrink-0" size={16} />
                    <div>
                      <div className="font-medium text-slate-200 break-words">{issue.title}</div>
                      <div className="text-xs text-slate-500 mb-2">#{issue.number}</div>
                      <div className="flex flex-wrap gap-1">
                        {issue.labels.map((label, i) => (
                          <span key={i} className="inline-flex items-center gap-1 rounded-full bg-slate-700 px-2 py-0.5 text-[10px] font-medium text-slate-300 border border-slate-600">
                            <Tag size={8} /> {label}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1 text-xs">
                     <span className="flex items-center gap-1 text-green-400 bg-green-900/20 px-2 py-0.5 rounded w-fit">
                        <AlertCircle size={12} /> Open
                     </span>
                     <span className="flex items-center gap-1 text-slate-400 bg-slate-700/30 px-2 py-0.5 rounded w-fit">
                        <GitPullRequest size={12} /> No PRs Linked
                     </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                    {issue.analysis ? (
                        <span className="inline-flex items-center gap-1 text-indigo-400 text-xs font-medium">
                            <CheckCircle2 size={14} /> Analyzed
                        </span>
                    ) : (
                        <span className="inline-block px-3 py-1 rounded bg-indigo-600 text-white text-xs hover:bg-indigo-500 transition-colors">
                            Analyze
                        </span>
                    )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};