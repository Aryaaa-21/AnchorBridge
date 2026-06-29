import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import type { Project } from '../utils/mockData';
import { 
  Search, 
  Grid, 
  List, 
  ArrowUpDown, 
  Plus, 
  ChevronRight, 
  FolderKanban 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Projects: React.FC = () => {
  const navigate = useNavigate();
  const { projects, user } = useStore();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'disputed' | 'draft'>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'totalEscrow' | 'title'>('totalEscrow');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Filter projects by user participation first (if logged in)
  const userProjects = user
    ? projects.filter(p => p.client === user.address || p.freelancer === user.address)
    : projects;

  // Search & Filter Logic
  const filteredProjects = userProjects
    .filter((p) => {
      const matchSearch = 
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase()) ||
        p.clientName.toLowerCase().includes(search.toLowerCase()) ||
        p.freelancerName.toLowerCase().includes(search.toLowerCase());
      
      const matchStatus = statusFilter === 'all' || p.status === statusFilter;
      
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'totalEscrow') {
        comparison = a.totalEscrow - b.totalEscrow;
      } else if (sortBy === 'dueDate') {
        comparison = a.dueDate.localeCompare(b.dueDate);
      } else if (sortBy === 'title') {
        comparison = a.title.localeCompare(b.title);
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

  const getProgress = (project: Project) => {
    if (!project.milestones || project.milestones.length === 0) return 0;
    const approved = project.milestones.filter(m => m.status === 'approved').length;
    return Math.round((approved / project.milestones.length) * 100);
  };

  const handleSort = (field: 'dueDate' | 'totalEscrow' | 'title') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.04 } }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border-app pb-6">
        <div>
          <h1 className="text-2xl font-black text-primary-brand dark:text-text-dark tracking-tight">
            Escrow Contracts
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Manage, review, and initiate milestone contracts.
          </p>
        </div>
        <Link
          to="/projects/create"
          className="flex items-center gap-1.5 bg-primary-brand text-text-dark text-xs font-bold px-4 py-2.5 rounded-lg hover:opacity-95 shadow-sm active:scale-98 transition-all min-h-[44px]"
          aria-label="Create new escrow contract"
        >
          <Plus className="h-4.5 w-4.5" aria-hidden="true" />
          <span>Create Escrow</span>
        </Link>
      </div>

      {/* Search and Filters Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-text-muted">
            <Search className="h-4 w-4" aria-hidden="true" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-lg bg-surface-app border border-border-app text-xs transition-all focus:ring-2 focus:ring-accent-brand focus:border-accent-brand"
            placeholder="Search projects, clients, freelancers, or tags..."
            aria-label="Search projects"
          />
        </div>

        {/* Filters and View Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status filter tab */}
          <div className="flex rounded-lg bg-border-app/20 p-1">
            {(['all', 'active', 'completed', 'disputed'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 text-[10px] font-bold rounded-md uppercase tracking-wider transition-all cursor-pointer min-h-[32px] ${
                  statusFilter === status
                    ? 'bg-primary-brand text-text-dark shadow-sm'
                    : 'text-text-main hover:text-accent-brand'
                }`}
                aria-label={`Filter by ${status} status`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="h-5 w-[1px] bg-border-app hidden sm:block" aria-hidden="true" />

          {/* Sort Switcher */}
          <button
            onClick={() => handleSort('totalEscrow')}
            className="flex items-center gap-1.5 h-11 px-3 border border-border-app rounded-lg bg-surface-app text-xs font-bold text-text-main hover:bg-border-app/10 transition-colors cursor-pointer min-h-[44px]"
            aria-label="Sort by budget amount"
          >
            <ArrowUpDown className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Budget</span>
          </button>

          {/* View Mode Toggle */}
          <div className="flex border border-border-app rounded-lg bg-surface-app overflow-hidden" role="group" aria-label="View display options">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-3 cursor-pointer transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center ${
                viewMode === 'grid' ? 'bg-primary-brand text-text-dark' : 'text-text-muted hover:bg-border-app/10'
              }`}
              title="Grid View"
              aria-label="Grid layout view"
            >
              <Grid className="h-4.5 w-4.5" aria-hidden="true" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-3 cursor-pointer transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center ${
                viewMode === 'table' ? 'bg-primary-brand text-text-dark' : 'text-text-muted hover:bg-border-app/10'
              }`}
              title="Table/List View"
              aria-label="Table list layout view"
            >
              <List className="h-4.5 w-4.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Projects Display */}
      <AnimatePresence mode="wait">
        {filteredProjects.length === 0 ? (
          <motion.div 
            key="empty-state"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-12 text-center rounded-xl border border-border-app glass-panel space-y-4"
          >
            <FolderKanban className="h-12 w-12 mx-auto text-accent-brand opacity-60 animate-bounce" aria-hidden="true" />
            <h2 className="text-sm font-bold text-text-main uppercase tracking-wider">No Contracts Found</h2>
            <p className="text-xs text-text-muted max-w-sm mx-auto">
              We couldn't find any escrow projects matching your filters. Create a new contract to get started.
            </p>
            <Link
              to="/projects/create"
              className="inline-flex items-center gap-2 bg-primary-brand text-text-dark text-xs font-bold px-4 py-2.5 rounded-lg hover:opacity-90 transition-all min-h-[44px]"
            >
              Create Your First Escrow
            </Link>
          </motion.div>
        ) : viewMode === 'grid' ? (
          // Grid View
          <motion.div 
            key="grid-view"
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredProjects.map((p) => {
              const progress = getProgress(p);
              return (
                <motion.div 
                  key={p.id}
                  variants={cardVariants}
                  whileHover={{ y: -4, borderColor: '#ac5c2c' }}
                  onClick={() => navigate(`/projects/${p.id}`)}
                  className="p-6 rounded-xl border border-border-app glass-panel flex flex-col justify-between hover:shadow-lg transition-all duration-300 cursor-pointer group"
                >
                  <div>
                    {/* Category and Status */}
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-accent-brand bg-accent-brand/10 px-2 py-0.5 rounded">
                        {p.category}
                      </span>
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        p.status === 'active' 
                          ? 'bg-accent-brand/10 text-accent-brand' 
                          : p.status === 'completed' 
                          ? 'bg-success-brand/10 text-success-brand'
                          : 'bg-error-brand/10 text-error-brand'
                      }`}>
                        {p.status}
                      </span>
                    </div>

                    {/* Title and ID */}
                    <h3 className="text-base font-bold text-text-main group-hover:text-accent-brand transition-colors line-clamp-1 mb-1">
                      {p.title}
                    </h3>
                    <span className="text-[10px] text-text-muted font-mono block mb-3">ID: {p.id}</span>
                    
                    <p className="text-xs text-text-muted line-clamp-2 mb-6">
                      {p.description}
                    </p>
                  </div>

                  <div>
                    {/* Progress bar */}
                    <div className="space-y-1.5 mb-6">
                      <div className="flex justify-between items-center text-[10px] font-bold text-text-muted">
                        <span>Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-border-app/20 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-accent-brand transition-all duration-500" 
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Footer details */}
                    <div className="flex justify-between items-center pt-4 border-t border-border-app/40 text-xs">
                      <div>
                        <span className="text-[9px] text-text-muted block font-semibold uppercase">Escrow Vault</span>
                        <span className="font-mono font-bold text-text-main">{p.totalEscrow.toLocaleString()} XLM</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-text-muted block font-semibold uppercase text-right">Freelancer</span>
                        <span className="font-medium text-text-main block text-right truncate max-w-[100px]" title={p.freelancerName}>
                          {p.freelancerName}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          // Table View
          <motion.div 
            key="table-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-border-app glass-panel rounded-xl overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-border-app text-text-muted bg-border-app/5">
                    <th className="p-4 font-semibold uppercase tracking-wider text-[10px]">Project Name</th>
                    <th className="p-4 font-semibold uppercase tracking-wider text-[10px]">Client / Freelancer</th>
                    <th className="p-4 font-semibold uppercase tracking-wider text-[10px]">Total Escrow</th>
                    <th className="p-4 font-semibold uppercase tracking-wider text-[10px]">Progress</th>
                    <th className="p-4 font-semibold uppercase tracking-wider text-[10px]">Status</th>
                    <th className="p-4 text-center text-[10px] font-semibold uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-app/30">
                  {filteredProjects.map((p) => {
                    const progress = getProgress(p);
                    return (
                      <tr key={p.id} className="hover:bg-border-app/10 transition-colors">
                        <td className="p-4">
                          <span className="font-bold text-text-main block">{p.title}</span>
                          <span className="text-[9px] text-text-muted font-mono">ID: {p.id}</span>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-text-main">Client: {p.clientName}</span>
                            <span className="text-[10px] text-text-muted">Freelancer: {p.freelancerName}</span>
                          </div>
                        </td>
                        <td className="p-4 font-mono font-bold text-text-main">
                          {p.totalEscrow.toLocaleString()} XLM
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 max-w-[120px]">
                            <div className="w-full h-1.5 bg-border-app/20 rounded-full overflow-hidden">
                              <div className="h-full bg-accent-brand" style={{ width: `${progress}%` }} />
                            </div>
                            <span className="font-mono text-[10px] text-text-muted">{progress}%</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                            p.status === 'active' 
                              ? 'bg-accent-brand/10 text-accent-brand' 
                              : p.status === 'completed' 
                              ? 'bg-success-brand/10 text-success-brand'
                              : 'bg-error-brand/10 text-error-brand'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => navigate(`/projects/${p.id}`)}
                            className="p-2 rounded-md hover:bg-border-app text-accent-brand cursor-pointer min-w-[44px] min-h-[44px] inline-flex items-center justify-center"
                            aria-label={`View contract details for ${p.title}`}
                          >
                            <ChevronRight className="h-4.5 w-4.5" aria-hidden="true" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
