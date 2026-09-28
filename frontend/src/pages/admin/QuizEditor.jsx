import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, Copy, MoveUp, MoveDown, Check, CheckSquare, Sparkles, HelpCircle, Eye, Play } from 'lucide-react';
import api from '../../services/api';
import { sounds } from '../../services/soundEffects';

export default function QuizEditor() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fetch Quiz and Questions
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await api.get(`/admin/quizzes/${id}`);
        setQuiz(res.data.quiz);
        setQuestions(res.data.quiz.questions || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id]);

  const currentQuestion = questions[selectedQuestionIndex] || null;

  // Add Question
  const handleAddQuestion = () => {
    sounds.playClick();
    const newQ = {
      id: 'temp_' + Date.now(),
      type: 'multiple_choice',
      question_text: 'Enter your question here...',
      time_limit: 20,
      points: 100,
      negative_points: 0,
      explanation: '',
      options: [
        { id: 'opt_1', option_text: 'Option A', is_correct: true, order: 1 },
        { id: 'opt_2', option_text: 'Option B', is_correct: false, order: 2 },
        { id: 'opt_3', option_text: 'Option C', is_correct: false, order: 3 },
        { id: 'opt_4', option_text: 'Option D', is_correct: false, order: 4 },
      ],
    };
    setQuestions([...questions, newQ]);
    setSelectedQuestionIndex(questions.length);
  };

  // Duplicate Question
  const handleDuplicateQuestion = (idx) => {
    sounds.playClick();
    const source = questions[idx];
    const copy = {
      ...source,
      id: 'temp_' + Date.now(),
      question_text: source.question_text + ' (Copy)',
      options: source.options.map(o => ({ ...o, id: 'temp_opt_' + Math.random() })),
    };
    const updated = [...questions];
    updated.splice(idx + 1, 0, copy);
    setQuestions(updated);
    setSelectedQuestionIndex(idx + 1);
  };

  // Delete Question
  const handleDeleteQuestion = (idx) => {
    if (questions.length <= 1) {
      alert('A quiz must have at least one question.');
      return;
    }
    sounds.playClick();
    const updated = questions.filter((_, i) => i !== idx);
    setQuestions(updated);
    setSelectedQuestionIndex(Math.max(0, idx - 1));
  };

  // Move Question Up/Down
  const handleMoveQuestion = (idx, direction) => {
    if ((direction === -1 && idx === 0) || (direction === 1 && idx === questions.length - 1)) return;
    sounds.playClick();
    const updated = [...questions];
    const temp = updated[idx];
    updated[idx] = updated[idx + direction];
    updated[idx + direction] = temp;
    setQuestions(updated);
    setSelectedQuestionIndex(idx + direction);
  };

  // Update current question fields
  const handleUpdateCurrentQuestion = (field, value) => {
    const updated = [...questions];
    updated[selectedQuestionIndex] = {
      ...updated[selectedQuestionIndex],
      [field]: value,
    };
    setQuestions(updated);
  };

  // Update option fields
  const handleUpdateOption = (optIdx, field, value) => {
    const updated = [...questions];
    const opts = [...updated[selectedQuestionIndex].options];
    
    // If setting is_correct for multiple_choice or true_false, uncheck others
    if (field === 'is_correct' && value === true && (currentQuestion.type === 'multiple_choice' || currentQuestion.type === 'true_false')) {
      opts.forEach((o, i) => {
        opts[i] = { ...o, is_correct: i === optIdx };
      });
    } else {
      opts[optIdx] = { ...opts[optIdx], [field]: value };
    }

    updated[selectedQuestionIndex] = {
      ...updated[selectedQuestionIndex],
      options: opts,
    };
    setQuestions(updated);
  };

  // Add Option to question
  const handleAddOption = () => {
    sounds.playClick();
    const updated = [...questions];
    const opts = [...(updated[selectedQuestionIndex].options || [])];
    opts.push({
      id: 'temp_opt_' + Date.now(),
      option_text: `Option ${String.fromCharCode(65 + opts.length)}`,
      is_correct: false,
      order: opts.length + 1,
    });
    updated[selectedQuestionIndex] = {
      ...updated[selectedQuestionIndex],
      options: opts,
    };
    setQuestions(updated);
  };

  // Remove Option
  const handleRemoveOption = (optIdx) => {
    if (currentQuestion.options.length <= 2) {
      alert('Must have at least 2 answer options.');
      return;
    }
    sounds.playClick();
    const updated = [...questions];
    const opts = updated[selectedQuestionIndex].options.filter((_, i) => i !== optIdx);
    updated[selectedQuestionIndex] = {
      ...updated[selectedQuestionIndex],
      options: opts,
    };
    setQuestions(updated);
  };

  // Save Quiz and All Questions to SQLite via API
  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    sounds.playClick();

    try {
      // 1. Update Quiz metadata
      await api.put(`/admin/quizzes/${id}`, {
        title: quiz.title,
        description: quiz.description,
        category: quiz.category,
        difficulty: quiz.difficulty,
        status: quiz.status,
        settings: quiz.settings,
      });

      // 2. Save Questions
      for (const q of questions) {
        if (typeof q.id === 'string' && q.id.startsWith('temp_')) {
          // Create new question
          await api.post(`/admin/quizzes/${id}/questions`, {
            type: q.type,
            question_text: q.question_text,
            time_limit: q.time_limit,
            points: q.points,
            negative_points: q.negative_points || 0,
            explanation: q.explanation || '',
            options: q.options.map(o => ({ option_text: o.option_text, is_correct: !!o.is_correct })),
          });
        } else {
          // Update existing question
          await api.put(`/admin/questions/${q.id}`, {
            type: q.type,
            question_text: q.question_text,
            time_limit: q.time_limit,
            points: q.points,
            negative_points: q.negative_points || 0,
            explanation: q.explanation || '',
            options: q.options.map(o => ({ option_text: o.option_text, is_correct: !!o.is_correct })),
          });
        }
      }

      // Refresh
      const refreshed = await api.get(`/admin/quizzes/${id}`);
      setQuiz(refreshed.data.quiz);
      setQuestions(refreshed.data.quiz.questions || []);

      sounds.playCorrect();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      sounds.playIncorrect();
      alert(err.response?.data?.message || 'Error saving quiz');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-bold">Loading quiz builder...</div>;
  }

  if (!quiz) return <div>Quiz not found</div>;

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="card-playful p-4 sm:p-5 bg-white border-2 border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sounds.playClick();
              navigate('/admin/quizzes');
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={quiz.title}
                onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
                className="font-display text-xl sm:text-2xl font-extrabold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-[#6C5CE7] focus:outline-none"
              />
              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                quiz.status === 'published' ? 'bg-[#E0F8F2] text-[#00B894]' : 'bg-slate-100 text-slate-500'
              }`}>
                {quiz.status}
              </span>
            </div>
            <p className="text-xs text-slate-400">{questions.length} questions created</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="text-xs font-bold text-[#00B894] flex items-center gap-1 animate-fade-in">
              <Check className="w-4 h-4" /> Saved!
            </span>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-3d-primary px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* 3-Column Layout: Questions List | Question Editor | Quiz Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Questions List (3 cols) */}
        <div className="lg:col-span-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Questions ({questions.length})
            </span>
            <button
              onClick={handleAddQuestion}
              className="text-xs font-bold text-[#6C5CE7] hover:bg-[#ECE9FE] px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
            {questions.map((q, idx) => {
              const isSelected = selectedQuestionIndex === idx;
              return (
                <div
                  key={q.id || idx}
                  onClick={() => {
                    sounds.playClick();
                    setSelectedQuestionIndex(idx);
                  }}
                  className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between group ${
                    isSelected
                      ? 'border-[#6C5CE7] bg-[#ECE9FE] shadow-sm'
                      : 'border-slate-100 bg-white hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-black/5 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-800 truncate">
                      {q.question_text || 'Untitled Question'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleMoveQuestion(idx, -1); }}
                      title="Move Up"
                      className="p-1 hover:text-[#6C5CE7]"
                    >
                      <MoveUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleMoveQuestion(idx, 1); }}
                      title="Move Down"
                      className="p-1 hover:text-[#6C5CE7]"
                    >
                      <MoveDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDuplicateQuestion(idx); }}
                      title="Duplicate"
                      className="p-1 hover:text-[#00B894]"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteQuestion(idx); }}
                      title="Delete"
                      className="p-1 hover:text-[#FF7675]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center Column: Dedicated Question Editor (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {currentQuestion ? (
            <div className="card-playful p-6 bg-white border-2 border-slate-100 shadow-md space-y-6">
              {/* Question Header & Type Selector */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-display font-extrabold text-lg text-slate-800">
                    Question {selectedQuestionIndex + 1}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">Type:</label>
                  <select
                    value={currentQuestion.type}
                    onChange={(e) => handleUpdateCurrentQuestion('type', e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#6C5CE7]"
                  >
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="true_false">True / False</option>
                    <option value="multiple_select">Multiple Select</option>
                    <option value="short_answer">Short Answer</option>
                  </select>
                </div>
              </div>

              {/* Question Text */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Question Prompt
                </label>
                <textarea
                  value={currentQuestion.question_text}
                  onChange={(e) => handleUpdateCurrentQuestion('question_text', e.target.value)}
                  placeholder="Enter the question participants will see..."
                  rows={3}
                  className="w-full bg-slate-50 border-2 border-slate-200 focus:border-[#6C5CE7] focus:bg-white rounded-2xl p-4 font-display text-base font-bold text-slate-800 focus:outline-none transition-all shadow-inner"
                />
              </div>

              {/* Sliders: Time Limit & Points */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-slate-500 uppercase">Time Limit</span>
                    <span className="text-[#6C5CE7]">{currentQuestion.time_limit} sec</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="120"
                    step="5"
                    value={currentQuestion.time_limit}
                    onChange={(e) => handleUpdateCurrentQuestion('time_limit', parseInt(e.target.value))}
                    className="w-full accent-[#6C5CE7]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-slate-500 uppercase">Base Points</span>
                    <span className="text-[#00B894]">{currentQuestion.points} pts</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="500"
                    step="50"
                    value={currentQuestion.points}
                    onChange={(e) => handleUpdateCurrentQuestion('points', parseInt(e.target.value))}
                    className="w-full accent-[#00B894]"
                  />
                </div>
              </div>

              {/* Answer Options Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Answer Options (Check the correct answer)
                  </span>
                  {currentQuestion.type !== 'true_false' && (
                    <button
                      type="button"
                      onClick={handleAddOption}
                      className="text-xs font-bold text-[#6C5CE7] hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Option</span>
                    </button>
                  )}
                </div>

                <div className="space-y-2.5">
                  {currentQuestion.options?.map((opt, optIdx) => (
                    <div
                      key={opt.id || optIdx}
                      className={`p-3 rounded-2xl border-2 flex items-center gap-3 transition-all ${
                        opt.is_correct
                          ? 'border-[#00B894] bg-[#E0F8F2]/60 shadow-sm'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      {/* Correct Checkbox */}
                      <button
                        type="button"
                        onClick={() => handleUpdateOption(optIdx, 'is_correct', !opt.is_correct)}
                        title="Mark as correct answer"
                        className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all ${
                          opt.is_correct
                            ? 'bg-[#00B894] border-[#00B894] text-white shadow-sm'
                            : 'border-slate-300 text-transparent hover:border-[#00B894]'
                        }`}
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </button>

                      {/* Option Text Input */}
                      <input
                        type="text"
                        value={opt.option_text}
                        onChange={(e) => handleUpdateOption(optIdx, 'option_text', e.target.value)}
                        placeholder={`Option ${optIdx + 1}`}
                        className="flex-1 bg-transparent font-sans font-bold text-sm text-slate-800 focus:outline-none"
                      />

                      {/* Remove Option Button */}
                      {currentQuestion.type !== 'true_false' && currentQuestion.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(optIdx)}
                          className="p-1 text-slate-300 hover:text-[#FF7675] transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Explanation Text */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Explanation (Shown to players after answer is revealed)
                </label>
                <input
                  type="text"
                  value={currentQuestion.explanation || ''}
                  onChange={(e) => handleUpdateCurrentQuestion('explanation', e.target.value)}
                  placeholder="e.g. Saturn's rings are made of billions of tiny chunks of ice and rock."
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#6C5CE7] rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none"
                />
              </div>
            </div>
          ) : (
            <div className="card-playful p-12 text-center text-slate-400">
              Select or create a question to begin editing.
            </div>
          )}
        </div>

        {/* Right Column: Quiz Metadata & Game Rules (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="card-playful p-5 bg-white border-2 border-slate-100 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-base text-slate-800 pb-2 border-b border-slate-100">
              Quiz Settings
            </h3>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Status</label>
              <select
                value={quiz.status}
                onChange={(e) => setQuiz({ ...quiz, status: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none"
              >
                <option value="draft">Draft (Not launchable)</option>
                <option value="published">Published (Ready for live play)</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Category</label>
              <input
                type="text"
                value={quiz.category}
                onChange={(e) => setQuiz({ ...quiz, category: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Difficulty</label>
              <select
                value={quiz.difficulty}
                onChange={(e) => setQuiz({ ...quiz, difficulty: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            {/* Speed Bonus Toggle */}
            <div className="pt-3 border-t border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={quiz.settings?.speed_bonus ?? true}
                  onChange={(e) => setQuiz({
                    ...quiz,
                    settings: { ...(quiz.settings || {}), speed_bonus: e.target.checked }
                  })}
                  className="rounded text-[#6C5CE7]"
                />
                <span>Award Speed Bonus</span>
              </label>
              <p className="text-[11px] text-slate-400 mt-1 pl-5">
                Faster correct answers get up to 400 extra bonus points.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
