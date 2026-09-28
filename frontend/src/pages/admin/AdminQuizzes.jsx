import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Play, Edit3, Copy, Trash2, HelpCircle, Layers, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import { sounds } from '../../services/soundEffects';

export default function AdminQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showLaunchModal, setShowLaunchModal] = useState(false);
  const [selectedQuizToLaunch, setSelectedQuizToLaunch] = useState(null);

  // New Quiz Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('General');
  const [newDifficulty, setNewDifficulty] = useState('medium');
  const [newDescription, setNewDescription] = useState('');

  // Launch Options
  const [groupsEnabled, setGroupsEnabled] = useState(false);
  const [groupNames, setGroupNames] = useState('Team Blue, Team Red, Team Green, Team Yellow');
  const [paceMode, setPaceMode] = useState('self_paced'); // 'self_paced' or 'host_controlled'

  const navigate = useNavigate();

  const fetchQuizzes = async () => {
    try {
      const res = await api.get('/admin/quizzes', {
        params: { search, status: statusFilter }
      });
      setQuizzes(res.data.quizzes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, [search, statusFilter]);

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    sounds.playClick();

    try {
      const res = await api.post('/admin/quizzes', {
        title: newTitle,
        category: newCategory,
        difficulty: newDifficulty,
        description: newDescription,
        status: 'draft',
      });
      sounds.playCorrect();
      setShowCreateModal(false);
      navigate(`/admin/quizzes/${res.data.quiz.id}`);
    } catch (err) {
      sounds.playIncorrect();
      alert(err.response?.data?.message || 'Error creating quiz');
    }
  };

  const handleDuplicate = async (quizId) => {
    sounds.playClick();
    try {
      await api.post(`/admin/quizzes/${quizId}/duplicate`);
      sounds.playCorrect();
      fetchQuizzes();
    } catch (err) {
      alert('Failed to duplicate quiz');
    }
  };

  const handleDelete = async (quizId) => {
    if (!confirm('Are you sure you want to delete this quiz and all its questions?')) return;
    sounds.playClick();
    try {
      await api.delete(`/admin/quizzes/${quizId}`);
      fetchQuizzes();
    } catch (err) {
      alert('Failed to delete quiz');
    }
  };

  const handleLaunchSession = async (e) => {
    e.preventDefault();
    if (!selectedQuizToLaunch) return;
    sounds.playClick();

    try {
      const parsedGroups = groupsEnabled
        ? groupNames.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

      const res = await api.post(`/admin/quizzes/${selectedQuizToLaunch.id}/launch`, {
        groups_enabled: groupsEnabled,
        group_names: parsedGroups,
        lobby_enabled: paceMode === 'host_controlled',
        pace_mode: paceMode,
      });

      sounds.playFanfare();
      setShowLaunchModal(false);
      navigate(`/admin/sessions/${res.data.session.id}`);
    } catch (err) {
      sounds.playIncorrect();
      alert(err.response?.data?.message || 'Failed to launch session');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-slate-800">
            Quiz Management
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Create, edit, duplicate, and launch interactive quizzes
          </p>
        </div>

        <button
          onClick={() => {
            sounds.playClick();
            setShowCreateModal(true);
          }}
          className="btn-3d-primary px-5 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Quiz</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, description or category..."
            className="w-full bg-white border-2 border-slate-200 focus:border-[#6C5CE7] rounded-2xl pl-11 pr-4 py-2.5 text-sm font-semibold focus:outline-none transition-all shadow-sm"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-2xl shadow-sm">
          {['all', 'published', 'draft'].map((status) => (
            <button
              key={status}
              onClick={() => {
                sounds.playClick();
                setStatusFilter(status);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all ${
                statusFilter === status
                  ? 'bg-[#6C5CE7] text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Quizzes Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card-playful p-6 bg-white animate-pulse h-48" />
          ))}
        </div>
      ) : quizzes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="card-playful p-6 bg-white border-2 border-slate-100 shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#ECE9FE] text-[#6C5CE7]">
                    {quiz.category}
                  </span>
                  <span className={`text-[11px] font-bold uppercase px-2.5 py-1 rounded-full ${
                    quiz.status === 'published'
                      ? 'bg-[#E0F8F2] text-[#00B894]'
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {quiz.status}
                  </span>
                </div>

                <h2
                  onClick={() => {
                    sounds.playClick();
                    navigate(`/admin/quizzes/${quiz.id}`);
                  }}
                  className="font-display text-xl font-bold text-slate-800 mb-2 line-clamp-1 hover:text-[#6C5CE7] cursor-pointer transition-colors"
                >
                  {quiz.title}
                </h2>
                <p className="text-xs text-slate-500 mb-4 line-clamp-2">
                  {quiz.description || 'No description provided.'}
                </p>

                <div className="flex items-center gap-4 text-xs font-bold text-slate-600 mb-6">
                  <button
                    onClick={() => {
                      sounds.playClick();
                      navigate(`/admin/quizzes/${quiz.id}`);
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#ECE9FE]/60 text-[#6C5CE7] hover:bg-[#ECE9FE] transition-colors cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>{quiz.questions_count} Questions (Edit & View)</span>
                  </button>
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-[#00B894]" />
                    <span className="capitalize">{quiz.difficulty}</span>
                  </div>
                </div>
              </div>


              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    sounds.playClick();
                    setSelectedQuizToLaunch(quiz);
                    setShowLaunchModal(true);
                  }}
                  className="btn-3d-secondary px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Launch Live</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      sounds.playClick();
                      navigate(`/admin/quizzes/${quiz.id}`);
                    }}
                    title="Edit Quiz & Questions"
                    className="p-2 rounded-xl text-slate-500 hover:text-[#6C5CE7] hover:bg-[#ECE9FE] transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDuplicate(quiz.id)}
                    title="Duplicate Quiz"
                    className="p-2 rounded-xl text-slate-500 hover:text-[#00B894] hover:bg-[#E0F8F2] transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(quiz.id)}
                    title="Delete Quiz"
                    className="p-2 rounded-xl text-slate-500 hover:text-[#FF7675] hover:bg-[#FFEBEB] transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card-playful p-12 bg-white text-center max-w-md mx-auto">
          <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-display text-xl font-bold text-slate-700 mb-1">No quizzes found</h3>
          <p className="text-xs text-slate-400 mb-6">Create your first quiz to get started!</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-3d-primary px-4 py-2.5 rounded-xl text-xs font-bold"
          >
            Create Quiz
          </button>
        </div>
      )}

      {/* Create Quiz Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border-2 border-slate-100 shadow-2xl">
            <h3 className="font-display text-2xl font-bold text-slate-800 mb-4">Create New Quiz</h3>

            <form onSubmit={handleCreateQuiz} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. World History Lightning Round"
                  required
                  className="w-full bg-slate-50 border-2 border-slate-200 focus:border-[#6C5CE7] rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Category</label>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Science, Tech..."
                    required
                    className="w-full bg-slate-50 border-2 border-slate-200 focus:border-[#6C5CE7] rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Difficulty</label>
                  <select
                    value={newDifficulty}
                    onChange={(e) => setNewDifficulty(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-200 focus:border-[#6C5CE7] rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Short Description</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="What is this quiz about?"
                  rows={2}
                  className="w-full bg-slate-50 border-2 border-slate-200 focus:border-[#6C5CE7] rounded-xl px-4 py-2 text-sm font-medium focus:outline-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-3d-primary px-5 py-2.5 rounded-xl text-xs font-bold"
                >
                  Continue to Question Builder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Launch Session Modal */}
      {showLaunchModal && selectedQuizToLaunch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border-2 border-slate-100 shadow-2xl">
            <h3 className="font-display text-2xl font-bold text-slate-800 mb-1">
              Launch Live Session
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Quiz: <b>{selectedQuizToLaunch.title}</b> ({selectedQuizToLaunch.questions_count} questions)
            </p>

            <form onSubmit={handleLaunchSession} className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={groupsEnabled}
                    onChange={(e) => setGroupsEnabled(e.target.checked)}
                    className="w-4 h-4 text-[#6C5CE7] rounded"
                  />
                  <div>
                    <div className="text-sm font-bold text-slate-800">Enable Teams / Groups</div>
                    <div className="text-xs text-slate-500">Players will choose or be assigned to competing teams</div>
                  </div>
                </label>

                {groupsEnabled && (
                  <div className="mt-4 pt-3 border-t border-slate-200">
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Team Names (comma separated)
                    </label>
                    <input
                      type="text"
                      value={groupNames}
                      onChange={(e) => setGroupNames(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium"
                    />
                  </div>
                )}
              </div>

              {/* Pace Mode Toggle */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="text-sm font-bold text-slate-800 mb-3">Quiz Pacing Mode</div>
                <div className="grid grid-cols-1 gap-2">
                  <label
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      paceMode === 'self_paced'
                        ? 'border-[#00B894] bg-[#E0F8F2]'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paceMode"
                      value="self_paced"
                      checked={paceMode === 'self_paced'}
                      onChange={() => setPaceMode('self_paced')}
                      className="hidden"
                    />
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      paceMode === 'self_paced' ? 'border-[#00B894] bg-[#00B894]' : 'border-slate-300'
                    }`}>
                      {paceMode === 'self_paced' && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-800">⚡ Fast to Questions (Self-Paced)</div>
                      <div className="text-[11px] text-slate-500">Guests go straight to questions at their own speed</div>
                    </div>
                  </label>
                  <label
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      paceMode === 'host_controlled'
                        ? 'border-[#6C5CE7] bg-[#ECE9FE]'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paceMode"
                      value="host_controlled"
                      checked={paceMode === 'host_controlled'}
                      onChange={() => setPaceMode('host_controlled')}
                      className="hidden"
                    />
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      paceMode === 'host_controlled' ? 'border-[#6C5CE7] bg-[#6C5CE7]' : 'border-slate-300'
                    }`}>
                      {paceMode === 'host_controlled' && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-800">🎮 Hold in Lobby (Host-Controlled)</div>
                      <div className="text-[11px] text-slate-500">Guests wait for you to start and advance each question</div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowLaunchModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-3d-secondary px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Start Live Session</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
