import React from 'react';
import { Repo } from '../types';
import { GitFork, Star, ExternalLink, ChevronRight } from 'lucide-react';

interface RepoCardProps {
  repo: Repo;
  onClick: (repo: Repo) => void;
  selected: boolean;
}

export const RepoCard: React.FC<RepoCardProps> = ({ repo, onClick, selected }) => {
  return (
    <div 
      onClick={() => onClick(repo)}
      className={`group cursor-pointer rounded-xl border p-5 transition-all duration-200 
        ${selected 
          ? 'bg-indigo-900/30 border-indigo-500 shadow-lg shadow-indigo-900/20' 
          : 'bg-slate-800 border-slate-700 hover:border-slate-500 hover:bg-slate-800/80'
        }`}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-lg text-slate-100 group-hover:text-indigo-400 transition-colors">
          {repo.name}
        </h3>
        <a 
          href={repo.url} 
          target="_blank" 
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-slate-400 hover:text-white"
        >
          <ExternalLink size={16} />
        </a>
      </div>
      
      <p className="text-sm text-slate-400 mb-4 line-clamp-2 h-10">
        {repo.description}
      </p>

      <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-amber-400">
            <Star size={14} fill="currentColor" />
            {repo.stars}
          </span>
          <span className="flex items-center gap-1">
            <GitFork size={14} />
            Fork
          </span>
        </div>
        
        <div className={`flex items-center gap-1 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity ${selected ? 'opacity-100' : ''}`}>
            Select <ChevronRight size={14} />
        </div>
      </div>
    </div>
  );
};
