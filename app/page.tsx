'use client';

import { useState, useRef, DragEvent, ChangeEvent, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Upload, Play, Pause, Loader2, CheckCircle2, XCircle, Sparkles, Brain, FileAudio, Wand2, Zap } from 'lucide-react';
import { EVALUATION_PARAMETERS, INPUT_TYPES, getScorePercentage } from '@/lib/evaluation-params';

interface CallScores {
  [key: string]: number;
}

interface ProcessingResult {
  scores: CallScores;
  overallFeedback: string;
  observation: string;
  transcript?: string;
}

type ProcessingStage = 'idle' | 'uploading' | 'transcribing' | 'analyzing' | 'complete';

const ProcessingStageIndicator = ({ stage }: { stage: ProcessingStage }) => {
  const stages = [
    { key: 'uploading', label: 'Uploading', icon: Upload },
    { key: 'transcribing', label: 'Transcribing', icon: FileAudio },
    { key: 'analyzing', label: 'Analyzing', icon: Brain },
  ];

  const getCurrentStageIndex = () => {
    const index = stages.findIndex(s => s.key === stage);
    return index === -1 ? 0 : index;
  };

  const currentIndex = getCurrentStageIndex();

  return (
    <div className="flex items-center justify-center gap-4 py-8">
      {stages.map((s, index) => {
        const Icon = s.icon;
        const isActive = stage === s.key;
        const isComplete = index < currentIndex || stage === 'complete';
        
        return (
          <div key={s.key} className="flex items-center">
            <div className={`flex flex-col items-center gap-2 transition-all duration-500 ${
              isActive ? 'scale-110' : 'scale-100'
            }`}>
              <div className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 ${
                isComplete 
                  ? 'bg-green-500/20 border-2 border-green-500' 
                  : isActive 
                  ? 'bg-blue-500/20 border-2 border-blue-500 animate-pulse' 
                  : 'bg-slate-800/50 border-2 border-slate-700'
              }`}>
                {isComplete && !isActive ? (
                  <CheckCircle2 className="w-8 h-8 text-green-400" />
                ) : (
                  <>
                    <Icon className={`w-8 h-8 ${
                      isActive ? 'text-blue-400 animate-bounce' : 'text-slate-500'
                    }`} />
                    {isActive && (
                      <div className="absolute inset-0 rounded-full border-4 border-blue-500 animate-ping opacity-75"></div>
                    )}
                  </>
                )}
              </div>
              <span className={`text-sm font-medium transition-colors ${
                isActive ? 'text-blue-400' : isComplete ? 'text-green-400' : 'text-slate-500'
              }`}>
                {s.label}
              </span>
            </div>
            {index < stages.length - 1 && (
              <div className={`w-16 h-1 mx-2 rounded-full transition-all duration-500 ${
                isComplete || (isActive && index < currentIndex) 
                  ? 'bg-green-500' 
                  : 'bg-slate-700'
              }`}></div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default function Home() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [processingStage, setProcessingStage] = useState<ProcessingStage>('idle');
  const [displayedTranscript, setDisplayedTranscript] = useState('');
  const [showScores, setShowScores] = useState(false);
  const [animatedScores, setAnimatedScores] = useState<CallScores>({});
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === 'audio/mpeg' || file.type === 'audio/wav') {
        handleFileSelect(file);
      } else {
        alert('Please upload an .mp3 or .wav file');
      }
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    setAudioFile(file);
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    setResult(null);
    setIsPlaying(false);
    setDisplayedTranscript('');
    setShowScores(false);
    setProcessingStage('idle');
    setAnimatedScores({});
  };

  // Typewriter effect for transcript
  useEffect(() => {
    if (!result?.transcript || displayedTranscript === result.transcript) return;
    
    const timeout = setTimeout(() => {
      setDisplayedTranscript(result.transcript!.slice(0, displayedTranscript.length + 1));
    }, 10);

    return () => clearTimeout(timeout);
  }, [displayedTranscript, result?.transcript]);

  // Trigger score animations after transcript starts
  useEffect(() => {
    if (result?.scores && showScores) {
      const initialScores: CallScores = {};
      Object.keys(result.scores).forEach(key => {
        initialScores[key] = 0;
      });
      setAnimatedScores(initialScores);

      // Animate each score
      Object.entries(result.scores).forEach(([key, targetValue], index) => {
        setTimeout(() => {
          let current = 0;
          const increment = targetValue / 30;
          const interval = setInterval(() => {
            current += increment;
            if (current >= targetValue) {
              setAnimatedScores(prev => ({ ...prev, [key]: targetValue }));
              clearInterval(interval);
            } else {
              setAnimatedScores(prev => ({ ...prev, [key]: Math.floor(current) }));
            }
          }, 30);
        }, index * 100);
      });
    }
  }, [showScores, result?.scores]);

  // Trigger score animations shortly after processing completes
  useEffect(() => {
    if (result?.transcript) {
      setTimeout(() => setShowScores(true), 500);
    }
  }, [result?.transcript]);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleProcess = async () => {
    if (!audioFile) return;

    setIsProcessing(true);
    setProcessingStage('uploading');
    setDisplayedTranscript('');
    setShowScores(false);
    
    const formData = new FormData();
    formData.append('audio', audioFile);

    try {
      setProcessingStage('transcribing');
      
      const response = await fetch('/api/analyze-call', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process audio');
      }

      setProcessingStage('analyzing');
      
      const data: ProcessingResult = await response.json();
      
      setProcessingStage('complete');
      setResult(data);
      
    } catch (error: any) {
      console.error('Error processing audio:', error);
      alert(error.message || 'Failed to process audio. Please try again.');
      setProcessingStage('idle');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-linear-to-br from-slate-950 via-blue-950 to-slate-900">
      {/* Animated background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-size-[14px_24px] mask-[radial-gradient(ellipse_80%_50%_at_50%_0%,#000,transparent)]"></div>
      <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-transparent to-transparent"></div>
      
      {/* Floating orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
      
      <div className="relative max-w-6xl mx-auto px-4 py-12 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-4 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
            <span className="text-sm font-medium text-blue-300">AI-Powered Analysis</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-linear-to-r from-blue-200 via-blue-400 to-purple-400 bg-clip-text text-transparent leading-tight">
            Voice Call Analyzer
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Upload your call recording and let AI provide instant, detailed feedback with actionable insights
          </p>
        </div>

        {/* Upload Section */}
        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl text-slate-100 flex items-center gap-2">
              <Upload className="w-6 h-6 text-blue-400" />
              Upload Audio Recording
            </CardTitle>
            <CardDescription className="text-slate-400">
              Drag and drop or click to upload a .mp3 or .wav file
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
                isDragging
                  ? 'border-blue-500 bg-blue-500/10 scale-105'
                  : 'border-slate-700 bg-slate-800/30 hover:border-slate-600 hover:bg-slate-800/50'
              }`}
            >
              <input
                type="file"
                accept=".mp3,.wav,audio/mpeg,audio/wav"
                onChange={handleFileChange}
                className="hidden"
                id="audio-upload"
              />
              <label
                htmlFor="audio-upload"
                className="cursor-pointer flex flex-col items-center gap-4"
              >
                <div className="relative">
                  <Upload className={`w-16 h-16 transition-all duration-300 ${
                    isDragging ? 'text-blue-400 scale-110' : 'text-slate-500'
                  }`} />
                  {isDragging && (
                    <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-xl animate-pulse"></div>
                  )}
                </div>
                <div>
                  <p className="text-xl font-semibold text-slate-200 mb-1">
                    {audioFile ? audioFile.name : 'Drop your audio file here'}
                  </p>
                  <p className="text-sm text-slate-500">
                    or click to browse • MP3 or WAV • Max 25MB
                  </p>
                </div>
              </label>
            </div>

            {/* Audio Player */}
            {audioUrl && (
              <div className="space-y-4 p-6 bg-slate-800/40 rounded-xl border border-slate-700 backdrop-blur-sm">
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  onEnded={() => setIsPlaying(false)}
                  className="hidden"
                />
                <div className="flex items-center gap-4">
                  <Button
                    onClick={togglePlayPause}
                    size="lg"
                    className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-5 h-5" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5" />
                        Play
                      </>
                    )}
                  </Button>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-300">
                      {audioFile?.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {(audioFile?.size! / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleProcess}
                  disabled={isProcessing}
                  size="lg"
                  className="w-full bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-purple-500/30 relative overflow-hidden group"
                >
                  <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                  <span className="relative flex items-center justify-center gap-2">
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-5 h-5" />
                        Analyze with AI
                      </>
                    )}
                  </span>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Processing Indicator */}
        {isProcessing && (
          <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl shadow-2xl">
            <CardContent className="pt-6">
              <ProcessingStageIndicator stage={processingStage} />
              <div className="text-center">
                <p className="text-slate-400 text-sm">
                  {processingStage === 'transcribing' && 'Converting speech to text using Whisper AI...'}
                  {processingStage === 'analyzing' && 'Evaluating call quality with Llama AI...'}
                  {processingStage === 'uploading' && 'Preparing your audio file...'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Section */}
        {result && (
          <div className="space-y-6 animate-fade-in">
            {/* Transcript with Typewriter Effect */}
            {result.transcript && (
              <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-2xl text-slate-100 flex items-center gap-2">
                    <FileAudio className="w-6 h-6 text-green-400" />
                    Call Transcript
                    {displayedTranscript !== result.transcript && (
                      <span className="ml-auto text-sm text-blue-400 flex items-center gap-1">
                        <Zap className="w-4 h-4 animate-pulse" />
                        Transcribing...
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Real-time transcription powered by Whisper AI
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <Textarea
                      value={displayedTranscript}
                      readOnly
                      className="min-h-[200px] resize-none font-mono text-sm bg-slate-800/50 border-slate-700 text-slate-300 focus-visible:ring-blue-500"
                    />
                    {displayedTranscript !== result.transcript && (
                      <div className="absolute bottom-4 right-4">
                        <div className="w-2 h-4 bg-blue-400 animate-pulse"></div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Overall Score Summary */}
            {showScores && (
              <Card className="border-2 border-blue-500/30 bg-linear-to-br from-blue-900/30 to-purple-900/30 backdrop-blur-xl shadow-2xl animate-scale-in">
                <CardHeader>
                  <CardTitle className="text-3xl text-slate-100 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-blue-400" />
                    </div>
                    Overall Performance
                  </CardTitle>
                  <CardDescription className="text-lg text-slate-300">
                    Total Score: {getScorePercentage(result.scores)}% • {Object.values(result.scores).reduce((a, b) => a + b, 0)} / {EVALUATION_PARAMETERS.reduce((sum, p) => sum + p.weight, 0)} points
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Progress 
                      value={getScorePercentage(result.scores)} 
                      className="h-6 bg-slate-800" 
                    />
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Performance Level</span>
                      <span className={`font-semibold ${
                        getScorePercentage(result.scores) >= 85 ? 'text-green-400' :
                        getScorePercentage(result.scores) >= 70 ? 'text-blue-400' :
                        'text-yellow-400'
                      }`}>
                        {getScorePercentage(result.scores) >= 85 ? 'Excellent' :
                         getScorePercentage(result.scores) >= 70 ? 'Good' :
                         'Needs Improvement'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Detailed Scores */}
            {showScores && (
              <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-2xl text-slate-100 flex items-center gap-2">
                    <Brain className="w-6 h-6 text-purple-400" />
                    Detailed Evaluation
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Performance breakdown by evaluation criteria
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {EVALUATION_PARAMETERS.map((param, index) => {
                    const score = result.scores[param.key] || 0;
                    const animatedScore = animatedScores[param.key] || 0;
                    const percentage = (animatedScore / param.weight) * 100;
                    const isPassed = param.type === INPUT_TYPES.PASS_FAIL && score > 0;
                    const isFailed = param.type === INPUT_TYPES.PASS_FAIL && score === 0;

                    return (
                      <div 
                        key={param.key} 
                        className="p-5 rounded-xl border bg-slate-800/40 border-slate-700 hover:bg-slate-800/60 transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm"
                        style={{
                          animation: `slideInUp 0.5s ease-out ${index * 0.1}s both`
                        }}
                      >
                        <div className="flex justify-between items-start gap-4 mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Label className="text-base font-semibold text-slate-200">
                                {param.name}
                              </Label>
                              {param.type === INPUT_TYPES.PASS_FAIL && (
                                <span className={`text-xs px-3 py-1 rounded-full font-medium transition-all duration-500 ${
                                  isPassed 
                                    ? 'bg-green-500/20 text-green-300 border border-green-500/50' 
                                    : 'bg-red-500/20 text-red-300 border border-red-500/50'
                                }`}>
                                  {isPassed ? '✓ PASSED' : '✗ FAILED'}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-slate-400 leading-relaxed">
                              {param.description}
                            </p>
                          </div>
                          <div className="text-right flex items-center gap-3">
                            {param.type === INPUT_TYPES.PASS_FAIL && (
                              isPassed ? (
                                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                                  <CheckCircle2 className="w-6 h-6 text-green-400" />
                                </div>
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                                  <XCircle className="w-6 h-6 text-red-400" />
                                </div>
                              )
                            )}
                            <div>
                              <span className="text-2xl font-bold text-slate-100 tabular-nums">
                                {Math.floor(animatedScore)}
                              </span>
                              <span className="text-slate-500">/{param.weight}</span>
                            </div>
                          </div>
                        </div>
                        {param.type === INPUT_TYPES.SCORE && (
                          <Progress 
                            value={percentage} 
                            className="h-2 bg-slate-700/50" 
                          />
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {/* Feedback Cards */}
            {showScores && (
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl shadow-2xl animate-slide-in-left">
                  <CardHeader>
                    <CardTitle className="text-xl text-slate-100">Overall Feedback</CardTitle>
                    <CardDescription className="text-slate-400">
                      Summary of call performance
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={result.overallFeedback}
                      readOnly
                      className="min-h-[150px] resize-none bg-slate-800/50 border-slate-700 text-slate-300 leading-relaxed"
                    />
                  </CardContent>
                </Card>

                <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl shadow-2xl animate-slide-in-right">
                  <CardHeader>
                    <CardTitle className="text-xl text-slate-100">Detailed Observations</CardTitle>
                    <CardDescription className="text-slate-400">
                      Specific insights and improvements
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={result.observation}
                      readOnly
                      className="min-h-[150px] resize-none bg-slate-800/50 border-slate-700 text-slate-300 leading-relaxed"
                    />
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        
        .animate-scale-in {
          animation: scale-in 0.5s ease-out;
        }
        
        .animate-slide-in-left {
          animation: slide-in-left 0.5s ease-out;
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
