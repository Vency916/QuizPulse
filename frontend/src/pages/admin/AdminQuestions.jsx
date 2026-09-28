import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, Search, Filter, CheckCircle2, Clock, Award, Eye, Edit3, ArrowRight, Layers, Sparkles } from 'lucide-react';
import api from '../../services/api';
import { sounds } from '../../services/soundEffects';

export default function AdminQuestions() {
  const [questions, setQuestions] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuizId, setSelectedQuizId] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [previewQuestion, setPreviewQuestion] = useState(null);

  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [qRes, quizRes] = await Promise.all([
        api.get('/admin/questions', {
          params: {
            quiz_id: selectedQuizId !== 'all' ? selectedQuizId : undefined,
            search: search || undefined,
          },
        }),
        api.get('/admin/quizzes'),
      ]);
      setQuestions(qRes.data.questions || []);
      setQuizzes(quizRes.data.quizzes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedQuizId, search]);

  const typeLabels = {
    multiple_choice: 'Multiple Choice',
    true_false: 'True / False',
    multiple_select: 'Multiple Select',
    short_answer: 'Short Answer',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-slate-800">
            Questions Explorer
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Browse, inspect answer keys, and preview all quiz questions
          </p>
        </div>

        <button
          onClick={() => {
            sounds.playClick();
            navigate('/admin/quizzes');
          }}
          className="btn-3d-primary px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2"
        >
          <span>Open Quiz Builder</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions or answers..."
            className="w-full bg-white border-2 border-slate-200 focus:border-[#6C5CE7] rounded-2xl pl-11 pr-4 py-2.5 text-sm font-semibold focus:outline-none transition-all shadow-sm"
          />
        </div>

        {/* Filter by Quiz */}
        <select
          value={selectedQuizId}
          onChange={(e) => {
            sounds.playClick();
            setSelectedQuizId(e.target.value);
          }}
          className="bg-white border-2 border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm focus:outline-none focus:border-[#6C5CE7]"
        >
          <option value="all">All Quizzes ({quizzes.length})</option>
          {quizzes.map((qz) => (
            <option key={qz.id} value={qz.id}>
              {qz.title} ({qz.category})
            </option>
          ))}
        </select>
      </div>

      {/* Questions Counter */}
      <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
        Showing {questions.length} {questions.length === 1 ? 'Question' : 'Questions'}
      </div>

      {/* Questions List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card-playful p-6 bg-white animate-pulse h-32" />
          ))}
        </div>
      ) : questions.length > 0 ? (
        <div className="space-y-4">
          {questions.map((q, idx) => (
            <div
              key={q.id}
              className="card-playful p-6 bg-white border-2 border-slate-100 shadow-sm hover:border-[#DCD6FA] transition-all"
            >
              {/* Top Row: Quiz Category, Type, Order, Time, Points */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-[#ECE9FE] text-[#6C5CE7] flex items-center justify-center font-display font-bold text-xs">
                    {q.order}
                  </span>
                  <span className="text-xs font-bold text-[#6C5CE7] bg-[#ECE9FE]/60 px-2.5 py-0.5 rounded-full">
                    {q.quiz?.title || 'Quiz'}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full uppercase">
                    {typeLabels[q.type] || q.type}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {q.time_limit}s
                  </span>
                  <span className="flex items-center gap-1 text-[#00B894]">
                    <Award className="w-3.5 h-3.5" />
                    {q.points} pts
                  </span>

                  <button
                    onClick={() => {
                      sounds.playClick();
                      setPreviewQuestion(q);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-[#6C5CE7] hover:bg-[#ECE9FE] transition-colors"
                    title="Simulate Participant View"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      sounds.playClick();
                      navigate(`/admin/quizzes/${q.quiz_id}`);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-[#00B894] hover:bg-[#E0F8F2] transition-colors"
                    title="Edit in Quiz Builder"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Question Text */}
              <h3 className="font-display text-lg sm:text-xl font-bold text-slate-800 mb-4">
                {q.question_text}
              </h3>

              {/* Options Grid with Correct Answer Highlight */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {q.options?.map((opt) => (
                  <div
                    key={opt.id}
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold transition-all ${
                      opt.is_correct
                        ? 'border-[#00B894] bg-[#E0F8F2] text-[#008D72] shadow-sm'
                        : 'border-slate-100 bg-slate-50 text-slate-600'
                    }`}
                  >
                    <span>{opt.option_text}</span>
                    {opt.is_correct && (
                      <span className="flex items-center gap-1 text-[11px] font-extrabold uppercase text-[#00B894]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Correct
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Explanation if present */}
              {q.explanation && (
                <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 font-medium">
                  <span className="font-bold text-slate-700">Explanation: </span>
                  {q.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="card-playful p-12 bg-white text-center max-w-md mx-auto">
          <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-display text-xl font-bold text-slate-700 mb-1">No questions found</h3>
          <p className="text-xs text-slate-400 mb-6">Create questions in your quizzes to populate the explorer.</p>
          <button
            onClick={() => navigate('/admin/quizzes')}
            className="btn-3d-primary px-4 py-2.5 rounded-xl text-xs font-bold"
          >
            Go to Quizzes
          </button>
        </div>
      )}

      {/* Question Simulation / Preview Modal */}
      {previewQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border-2 border-slate-100 shadow-2xl relative">
            <div className="text-center mb-6">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#6C5CE7] bg-[#ECE9FE] px-3 py-1 rounded-full">
                Player View Simulation
              </span>
              <h3 className="font-display text-2xl font-bold text-slate-800 mt-3">
                {previewQuestion.question_text}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {previewQuestion.options?.map((opt, i) => (
                <div
                  key={opt.id || i}
                  className={`p-4 rounded-2xl border-2 font-display font-bold text-center text-sm shadow-sm ${
                    opt.is_correct
                      ? 'border-[#00B894] bg-[#E0F8F2] text-[#008D72]'
                      : 'border-slate-200 bg-slate-50 text-slate-700'
                  }`}
                >
                  {opt.option_text}
                </div>
              ))}
            </div>

            {previewQuestion.explanation && (
              <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 mb-6">
                <span className="font-bold text-slate-700">Explanation: </span>
                {previewQuestion.explanation}
              </div>
            )}

            <div className="text-center">
              <button
                type="button"
                onClick={() => setPreviewQuestion(null)}
                className="btn-3d-primary px-6 py-2.5 rounded-xl text-xs font-bold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
