import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Plus,
  HelpCircle,
  X,
  Sparkles,
  Clock,
  Award,
  FileUp,
  FileCheck,
  BookOpen,
  ArrowRight,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import api from '../../services/api';
import { sounds } from '../../services/soundEffects';

export default function QuestionImportModal({
  isOpen,
  onClose,
  targetQuizId = null,
  targetQuizTitle = null,
  onSuccess,
}) {
  const [step, setStep] = useState('upload'); // 'upload' | 'review'
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState(null);
  const [showFormatGuide, setShowFormatGuide] = useState(false);

  // Parsed Questions state
  const [parsedQuestions, setParsedQuestions] = useState([]);
  const [rawTextPreview, setRawTextPreview] = useState('');

  // Destination Mode: 'current' | 'new_quiz' | 'existing_quiz'
  const [destinationMode, setDestinationMode] = useState(targetQuizId ? 'current' : 'new_quiz');
  const [existingQuizzes, setExistingQuizzes] = useState([]);
  const [selectedExistingQuizId, setSelectedExistingQuizId] = useState(targetQuizId || '');

  // New Quiz metadata
  const [newQuizTitle, setNewQuizTitle] = useState('');
  const [newQuizCategory, setNewQuizCategory] = useState('General');
  const [newQuizDifficulty, setNewDifficulty] = useState('medium');
  const [newQuizDescription, setNewQuizDescription] = useState('');

  const fileInputRef = useRef(null);

  // Fetch quizzes if user wants to import into an existing quiz
  useEffect(() => {
    if (isOpen) {
      api.get('/admin/quizzes')
        .then((res) => {
          const list = res.data.quizzes || [];
          setExistingQuizzes(list);
          if (!selectedExistingQuizId && list.length > 0) {
            setSelectedExistingQuizId(list[0].id);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      setStep('upload');
      setFile(null);
      setError(null);
      setParsedQuestions([]);
      setDestinationMode(targetQuizId ? 'current' : 'new_quiz');
    }
  }, [isOpen, targetQuizId]);

  if (!isOpen) return null;

  // Handle Drag & Drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleSelectFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleSelectFile(e.target.files[0]);
    }
  };

  const handleSelectFile = (selectedFile) => {
    const validExtensions = ['pdf', 'docx', 'doc', 'txt', 'md'];
    const ext = selectedFile.name.split('.').pop().toLowerCase();

    if (!validExtensions.includes(ext)) {
      sounds.playIncorrect();
      setError(`Invalid file type (.${ext}). Please select a PDF (.pdf), Word document (.docx), or text file (.txt).`);
      return;
    }

    if (selectedFile.size > 15 * 1024 * 1024) {
      sounds.playIncorrect();
      setError('File is too large. Maximum supported file size is 15MB.');
      return;
    }

    setError(null);
    setFile(selectedFile);
    sounds.playClick();

    // Suggest default quiz title based on filename
    const baseName = selectedFile.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    const formattedTitle = baseName.charAt(0).toUpperCase() + baseName.slice(1);
    setNewQuizTitle(formattedTitle);
  };

  // Upload and Parse document
  const handleParseDocument = async () => {
    if (!file) return;

    sounds.playClick();
    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/admin/questions/parse-document', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      sounds.playCorrect();
      setParsedQuestions(res.data.questions || []);
      setRawTextPreview(res.data.raw_text_preview || '');
      setStep('review');
    } catch (err) {
      sounds.playIncorrect();
      setError(err.response?.data?.message || 'Failed to parse document. Please check the document format.');
    } finally {
      setUploading(false);
    }
  };

  // Update question field
  const handleUpdateQuestion = (index, field, value) => {
    const updated = [...parsedQuestions];
    updated[index][field] = value;
    setParsedQuestions(updated);
  };

  // Toggle option correct
  const handleSetCorrectOption = (qIdx, optIdx) => {
    sounds.playClick();
    const updated = [...parsedQuestions];
    const q = updated[qIdx];

    if (q.type === 'multiple_select') {
      q.options[optIdx].is_correct = !q.options[optIdx].is_correct;
    } else {
      q.options.forEach((opt, i) => {
        opt.is_correct = i === optIdx;
      });
    }
    q.needs_review = false;
    setParsedQuestions(updated);
  };

  // Update option text
  const handleUpdateOptionText = (qIdx, optIdx, text) => {
    const updated = [...parsedQuestions];
    updated[qIdx].options[optIdx].option_text = text;
    setParsedQuestions(updated);
  };

  // Delete option
  const handleRemoveOption = (qIdx, optIdx) => {
    const updated = [...parsedQuestions];
    if (updated[qIdx].options.length <= 2) {
      alert('Questions must have at least 2 options.');
      return;
    }
    sounds.playClick();
    updated[qIdx].options.splice(optIdx, 1);
    setParsedQuestions(updated);
  };

  // Add new option to question
  const handleAddOption = (qIdx) => {
    sounds.playClick();
    const updated = [...parsedQuestions];
    const nextLetter = String.fromCharCode(65 + updated[qIdx].options.length);
    updated[qIdx].options.push({
      option_text: `Option ${nextLetter}`,
      is_correct: false,
      order: updated[qIdx].options.length + 1,
    });
    setParsedQuestions(updated);
  };

  // Delete question from review list
  const handleDeleteQuestion = (qIdx) => {
    sounds.playClick();
    const updated = parsedQuestions.filter((_, i) => i !== qIdx);
    setParsedQuestions(updated);
  };

  // Final Confirmation: Import to database
  const handleConfirmImport = async () => {
    if (parsedQuestions.length === 0) {
      alert('No questions to import.');
      return;
    }

    sounds.playClick();
    setImporting(true);
    setError(null);

    try {
      if (destinationMode === 'new_quiz') {
        if (!newQuizTitle.trim()) {
          setError('Please provide a title for the new quiz.');
          setImporting(false);
          return;
        }

        const res = await api.post('/admin/quizzes/create-with-questions', {
          title: newQuizTitle,
          category: newQuizCategory,
          difficulty: newQuizDifficulty,
          description: newQuizDescription,
          status: 'published',
          questions: parsedQuestions,
        });

        sounds.playCorrect();
        if (onSuccess) onSuccess(res.data.quiz);
        onClose();
      } else {
        const destId = destinationMode === 'current' ? targetQuizId : selectedExistingQuizId;
        if (!destId) {
          setError('Please select a target quiz.');
          setImporting(false);
          return;
        }

        const res = await api.post(`/admin/quizzes/${destId}/import-questions`, {
          questions: parsedQuestions,
        });

        sounds.playCorrect();
        if (onSuccess) onSuccess(res.data);
        onClose();
      }
    } catch (err) {
      sounds.playIncorrect();
      setError(err.response?.data?.message || 'Error importing questions.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl p-4 sm:p-6 lg:p-8 max-w-3xl w-full border-2 border-slate-100 shadow-2xl my-auto max-h-[92vh] flex flex-col justify-between overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#6C5CE7] to-[#8C7AE6] flex items-center justify-center text-white shadow-md shadow-[#6C5CE7]/20">
              <FileUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-lg sm:text-xl text-slate-800">
                  Import Questions from File
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-[#ECE9FE] text-[#6C5CE7]">
                  PDF / DOCX
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {step === 'upload'
                  ? 'Upload a PDF, Word, or text file to extract quiz questions automatically'
                  : `Review and customize ${parsedQuestions.length} parsed questions`}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-4 p-3 rounded-2xl bg-[#FFEBEB] border border-[#FF7675]/30 text-[#E85B5A] text-xs font-semibold flex items-center gap-2 shrink-0 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 1: UPLOAD & PARSE */}
        {/* ============================================================== */}
        {step === 'upload' && (
          <div className="py-4 space-y-4 overflow-y-auto flex-1 pr-1">
            {/* Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-6 sm:p-10 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-[#6C5CE7] bg-[#ECE9FE]/40 scale-[1.01]'
                  : 'border-slate-200 bg-slate-50/60 hover:border-[#6C5CE7]/50 hover:bg-[#ECE9FE]/20'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc,.txt,.md"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 text-[#6C5CE7] flex items-center justify-center mx-auto mb-3 shadow-sm group-hover:scale-105 transition-transform">
                <UploadCloud className="w-7 h-7" />
              </div>

              {file ? (
                <div>
                  <div className="font-display font-bold text-slate-800 text-sm sm:text-base flex items-center justify-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-[#00B894]" />
                    <span className="truncate max-w-xs">{file.name}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {(file.size / 1024).toFixed(1)} KB — Click or drag to replace
                  </p>
                </div>
              ) : (
                <div>
                  <div className="font-display font-bold text-slate-800 text-sm sm:text-base">
                    Click to browse or drag and drop your document
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Supported formats: PDF (.pdf), Word (.docx), Plain Text (.txt) up to 15MB
                  </p>
                </div>
              )}

              {/* Supported Pills */}
              <div className="flex items-center justify-center gap-2 mt-4">
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-slate-600">
                  📄 PDF Document
                </span>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-slate-600">
                  📝 Word (.docx)
                </span>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-slate-600">
                  📋 Text File
                </span>
              </div>
            </div>

            {/* Formatting Guide Collapsible */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setShowFormatGuide(!showFormatGuide);
                }}
                className="w-full flex items-center justify-between text-xs font-bold text-slate-700 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#6C5CE7]" />
                  <span>How does automatic question parsing work?</span>
                </div>
                {showFormatGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showFormatGuide && (
                <div className="mt-3 pt-3 border-t border-slate-200/80 text-xs text-slate-600 space-y-2 animate-fade-in font-sans">
                  <p>
                    The smart parser detects question numbers, options, answer keys, and timers. Your document can use any of these common formats:
                  </p>
                  <pre className="p-3 bg-white border border-slate-200 rounded-xl font-mono text-[11px] text-slate-700 overflow-x-auto leading-relaxed">
{`1. What is the capital of France?
A) Berlin
B) Paris (Correct)
C) Rome
D) Madrid
Explanation: Paris is the capital of France.

2. Which planet is known as the Red Planet?
a. Venus
*b. Mars
c. Jupiter
Points: 100
Time: 20s

3. True or False: The Earth is flat.
A. True
B. False
Ans: B`}
                  </pre>
                  <div className="text-[11px] text-slate-500 font-medium">
                    💡 <b>Tip:</b> Mark correct answers with an asterisk (<code>*B</code>), an explicit line (<code>Answer: B</code>), or by adding <code>(Correct)</code> next to the option. You can also edit and fine-tune every question in the preview step before importing!
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={!file || uploading}
                onClick={handleParseDocument}
                className={`btn-3d-primary px-6 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-sm ${
                  !file || uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                {uploading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Extracting & Parsing...</span>
                  </>
                ) : (
                  <>
                    <span>Extract Questions</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 2: REVIEW & CUSTOMIZE QUESTIONS */}
        {/* ============================================================== */}
        {step === 'review' && (
          <div className="py-4 space-y-4 overflow-y-auto flex-1 pr-1">
            {/* Target Selection Card */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Where should these questions be added?
              </div>

              <div className="flex flex-wrap gap-2">
                {targetQuizId && (
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setDestinationMode('current');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      destinationMode === 'current'
                        ? 'bg-[#6C5CE7] text-white shadow-sm'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Add to "{targetQuizTitle || 'Current Quiz'}"
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setDestinationMode('new_quiz');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    destinationMode === 'new_quiz'
                      ? 'bg-[#6C5CE7] text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Create as a Brand New Quiz
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setDestinationMode('existing_quiz');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    destinationMode === 'existing_quiz'
                      ? 'bg-[#6C5CE7] text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Add to Another Existing Quiz
                </button>
              </div>

              {/* Destination Form Fields */}
              {destinationMode === 'new_quiz' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                      New Quiz Title
                    </label>
                    <input
                      type="text"
                      value={newQuizTitle}
                      onChange={(e) => setNewQuizTitle(e.target.value)}
                      placeholder="e.g. World History Lightning Round"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-[#6C5CE7]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      value={newQuizCategory}
                      onChange={(e) => setNewQuizCategory(e.target.value)}
                      placeholder="General"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-[#6C5CE7]"
                    />
                  </div>
                </div>
              )}

              {destinationMode === 'existing_quiz' && (
                <div className="pt-2 border-t border-slate-200">
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Select Target Quiz
                  </label>
                  <select
                    value={selectedExistingQuizId}
                    onChange={(e) => setSelectedExistingQuizId(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#6C5CE7]"
                  >
                    {existingQuizzes.map((qz) => (
                      <option key={qz.id} value={qz.id}>
                        {qz.title} ({qz.questions_count} questions)
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Questions Header */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Questions to Import ({parsedQuestions.length})
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                Tap radio buttons to change the correct answer
              </span>
            </div>

            {/* Question Cards List */}
            <div className="space-y-4 max-h-[48vh] overflow-y-auto pr-1">
              {parsedQuestions.map((q, qIdx) => (
                <div
                  key={qIdx}
                  className={`p-4 rounded-2xl border-2 transition-all space-y-3 ${
                    q.needs_review
                      ? 'border-[#FF7675]/50 bg-[#FFEBEB]/20'
                      : 'border-slate-100 bg-white hover:border-slate-200'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-[#ECE9FE] text-[#6C5CE7] flex items-center justify-center font-display font-bold text-xs">
                        {qIdx + 1}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 uppercase px-2 py-0.5 rounded-full bg-slate-100">
                        {q.type.replace('_', ' ')}
                      </span>
                      {q.needs_review && (
                        <span className="text-[10px] font-extrabold text-[#FF7675] uppercase flex items-center gap-1 animate-pulse">
                          <AlertCircle className="w-3 h-3" />
                          Verify Answer
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Timer & Points inputs */}
                      <div className="flex items-center gap-1 text-xs font-bold text-slate-500">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <input
                          type="number"
                          min="5"
                          max="120"
                          value={q.time_limit}
                          onChange={(e) => handleUpdateQuestion(qIdx, 'time_limit', parseInt(e.target.value) || 20)}
                          className="w-12 text-center bg-slate-50 border border-slate-200 rounded-lg py-0.5 text-xs"
                        />
                        <span>s</span>
                      </div>

                      <div className="flex items-center gap-1 text-xs font-bold text-[#00B894]">
                        <Award className="w-3.5 h-3.5" />
                        <input
                          type="number"
                          min="10"
                          max="500"
                          step="10"
                          value={q.points}
                          onChange={(e) => handleUpdateQuestion(qIdx, 'points', parseInt(e.target.value) || 100)}
                          className="w-14 text-center bg-slate-50 border border-slate-200 rounded-lg py-0.5 text-xs text-[#00B894] font-bold"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteQuestion(qIdx)}
                        className="p-1 text-slate-300 hover:text-[#FF7675] transition-colors ml-1"
                        title="Remove Question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Question Text Input */}
                  <div>
                    <input
                      type="text"
                      value={q.question_text}
                      onChange={(e) => handleUpdateQuestion(qIdx, 'question_text', e.target.value)}
                      placeholder="Question prompt..."
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#6C5CE7] focus:bg-white rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-slate-800 focus:outline-none"
                    />
                  </div>

                  {/* Options List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options?.map((opt, optIdx) => (
                      <div
                        key={optIdx}
                        className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all ${
                          opt.is_correct
                            ? 'border-[#00B894] bg-[#E0F8F2]/60'
                            : 'border-slate-100 bg-slate-50/70'
                        }`}
                      >
                        <input
                          type={q.type === 'multiple_select' ? 'checkbox' : 'radio'}
                          name={`q_${qIdx}_correct`}
                          checked={!!opt.is_correct}
                          onChange={() => handleSetCorrectOption(qIdx, optIdx)}
                          className="w-4 h-4 text-[#00B894] accent-[#00B894] cursor-pointer shrink-0"
                          title="Click to mark as correct answer"
                        />
                        <input
                          type="text"
                          value={opt.option_text}
                          onChange={(e) => handleUpdateOptionText(qIdx, optIdx, e.target.value)}
                          className="flex-1 bg-transparent text-xs font-semibold text-slate-800 focus:outline-none"
                        />
                        {q.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(qIdx, optIdx)}
                            className="p-1 text-slate-300 hover:text-[#FF7675] transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add option button & explanation */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleAddOption(qIdx)}
                      className="text-[11px] font-bold text-[#6C5CE7] hover:bg-[#ECE9FE] px-2 py-0.5 rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Option</span>
                    </button>

                    <input
                      type="text"
                      value={q.explanation || ''}
                      onChange={(e) => handleUpdateQuestion(qIdx, 'explanation', e.target.value)}
                      placeholder="Optional explanation shown after answering..."
                      className="flex-1 min-w-[200px] bg-transparent border-b border-dashed border-slate-200 focus:border-[#6C5CE7] text-[11px] font-medium text-slate-500 focus:outline-none px-1 py-0.5"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setStep('upload');
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors"
              >
                ← Choose Another File
              </button>

              <button
                type="button"
                disabled={importing || parsedQuestions.length === 0}
                onClick={handleConfirmImport}
                className={`btn-3d-primary px-6 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-sm ${
                  importing || parsedQuestions.length === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                {importing ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Importing Questions...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Import {parsedQuestions.length} Questions</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
