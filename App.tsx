import React, { useState, useEffect } from 'react';
import { Search, History, Terminal, Database, Loader2 } from 'lucide-react';
import { Repo, Issue, SearchTopic, AgentStatus, GroundingSource } from './types';
import * as dbService from './services/dbService';
import * as geminiService from './services/geminiService';
import { RepoCard } from './components/RepoCard';
import { IssueList } from './components/IssueList';
import { AnalysisPanel } from './components/AnalysisPanel';

const App = () => {
  const [topic, setTopic] = useState('');
  const [status, setStatus] = useState<AgentStatus>(AgentStatus.IDLE);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [searchHistory, setSearchHistory] = useState<SearchTopic[]>([]);
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    const init = async () => {
        await dbService.initDB();
        setDbReady(true);
        setSearchHistory(dbService.getTopics());
    };
    init();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setStatus(AgentStatus.SEARCHING_REPOS);
    setRepos([]);
    setIssues([]);
    setSelectedRepo(null);
    setSelectedIssue(null);
    setSources([]);

    // Save topic to DB
    const topicId = dbService.saveTopic(topic);
    setSearchHistory(dbService.getTopics());

    // Call Gemini
    const { repos: foundRepos, sources: repoSources } = await geminiService.findHotRepos(topic);
    
    // Save found repos to DB
    const savedRepos = foundRepos.map(r => ({
      ...r,
      id: dbService.saveRepo(r, topicId),
      topic_id: topicId
    }));

    setRepos(savedRepos);
    setSources(repoSources);
    setStatus(AgentStatus.IDLE);
  };

  const handleSelectRepo = async (repo: Repo) => {
    setSelectedRepo(repo);
    setSelectedIssue(null);
    setIssues([]);
    setStatus(AgentStatus.FINDING_ISSUES);
    
    // We fetch fresh issues to ensure we check for "OPEN" status and no PRs as per user request.
    const { issues: foundIssues, sources: issueSources } = await geminiService.findPotentialIssues(repo.name, repo.url);
    
    // Save to DB
    const savedIssues = foundIssues.map(i => ({
      ...i,
      id: dbService.saveIssue(i, repo.id!),
      repo_id: repo.id!
    }));

    setIssues(savedIssues);
    setSources(issueSources);
    setStatus(AgentStatus.IDLE);
  };

  const handleSelectIssue = async (issue: Issue) => {
    setSelectedIssue(issue);
    
    if (issue.analysis) {
        return; // Already analyzed
    }

    setStatus(AgentStatus.ANALYZING_ISSUE);
    const analysis = await geminiService.analyzeIssue(issue.title, selectedRepo?.name || '');
    
    if (analysis && issue.id) {
        dbService.updateIssueAnalysis(issue.id, analysis);
        const updatedIssue = { ...issue, analysis };
        setSelectedIssue(updatedIssue);
        // Update list state as well
        setIssues(prev => prev.map(i => i.id === issue.id ? updatedIssue : i));
    }
    setStatus(AgentStatus.IDLE);
  };

  const loadHistoryItem = (historyTopic: SearchTopic) => {
    setTopic(historyTopic.term);
    // In a real app we would load the relational data from DB.
    // For this simple copilot, let's just restore the repo list from DB for this topic.
    const savedRepos = dbService.getReposByTopic(historyTopic.id!);
    setRepos(savedRepos);
    setIssues([]);
    setSelectedRepo(null);
    setSelectedIssue(null);
  };

  if (!dbReady) {
      return (
          <div className="min-h-screen bg-slate-950 flex items-center justify-center text-indigo-400">
              <Loader2 className="animate-spin mr-2" /> Initializing Memory...
          </div>
      )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-200">
      
      {/* Sidebar - History */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex-shrink-0 flex flex-col">
        <div className="p-4 border-b border-slate-800">
          <h1 className="flex items-center gap-2 font-bold text-lg text-white">
            <Terminal className="text-indigo-500" />
            OS Copilot
          </h1>
          <p className="text-xs text-slate-500 mt-1">Open Source Contributor Agent</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase mb-3">
                <History size={12} /> Recent Topics
            </div>
            <ul className="space-y-1">
                {searchHistory.map(item => (
                    <li key={item.id}>
                        <button 
                            onClick={() => loadHistoryItem(item)}
                            className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-800 text-sm text-slate-400 hover:text-white transition-colors truncate"
                        >
                            {item.term}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
        
        <div className="p-4 border-t border-slate-800 text-xs text-slate-600 flex items-center gap-2">
            <Database size={12} /> SQLite Memory Active
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Header / Search */}
        <header className="border-b border-slate-800 bg-slate-900/50 p-6">
            <form onSubmit={handleSearch} className="max-w-3xl mx-auto relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Search className="text-slate-500" size={20} />
                </div>
                <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Enter a topic (e.g. 'React UI Libraries', 'Rust Web Servers')..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-full py-4 pl-12 pr-6 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-xl"
                />
                {status !== AgentStatus.IDLE && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-indigo-400 text-sm animate-pulse font-medium">
                        <Loader2 className="animate-spin" size={16} />
                        {status === AgentStatus.SEARCHING_REPOS && "Scanning Repos..."}
                        {status === AgentStatus.FINDING_ISSUES && "Finding Issues..."}
                        {status === AgentStatus.ANALYZING_ISSUE && "Analyzing..."}
                    </div>
                )}
            </form>
        </header>

        {/* Content Grid */}
        <div className="flex-1 overflow-hidden">
            <div className="h-full flex flex-col md:flex-row">
                
                {/* Left Panel: Repos & Issues */}
                <div className="flex-1 overflow-y-auto p-6 border-r border-slate-800">
                    
                    {/* Sources Section (if exists) */}
                    {sources.length > 0 && (
                        <div className="mb-6 p-3 bg-slate-900/50 rounded-lg border border-slate-800">
                             <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Grounding Sources</h4>
                             <ul className="text-xs text-indigo-400 space-y-1">
                                {sources.slice(0, 3).map((s, i) => (
                                    <li key={i} className="truncate">
                                        <a href={s.uri} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1">
                                            <span className="w-1 h-1 rounded-full bg-indigo-500"></span>
                                            {s.title}
                                        </a>
                                    </li>
                                ))}
                             </ul>
                        </div>
                    )}

                    {/* Repos Section */}
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-white mb-4">Trending Repositories</h2>
                        {repos.length === 0 ? (
                            <div className="text-slate-500 italic text-sm">
                                Enter a topic above to find repositories.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {repos.map(repo => (
                                    <RepoCard 
                                        key={repo.id} 
                                        repo={repo} 
                                        onClick={handleSelectRepo}
                                        selected={selectedRepo?.id === repo.id}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Issues Section */}
                    {selectedRepo && (
                        <div className="mb-8">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center justify-between">
                                <span>Potential Issues in <span className="text-indigo-400">{selectedRepo.name}</span></span>
                            </h2>
                            <IssueList 
                                issues={issues}
                                onSelectIssue={handleSelectIssue}
                                selectedIssueId={selectedIssue?.id}
                            />
                        </div>
                    )}
                </div>

                {/* Right Panel: Analysis Agent */}
                <div className="w-full md:w-[450px] bg-slate-900/30">
                    <AnalysisPanel 
                        issue={selectedIssue}
                        loading={status === AgentStatus.ANALYZING_ISSUE}
                    />
                </div>

            </div>
        </div>
      </main>
    </div>
  );
};

export default App;