"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Question {
  id: string;
  question: string;
  options: {
    label: string;
    value: string;
    scores: Record<string, number>;
  }[];
}

interface Destination {
  slug: string;
  country_name: string;
  flag: string;
  region: string;
  hero_subtitle?: string;
  hero_image_url?: string;
}

// Quiz questions with scoring for different destination profiles
const QUESTIONS: Question[] = [
  {
    id: "budget",
    question: "What's your monthly budget for living expenses?",
    options: [
      { label: "Under $1,500/month", value: "low", scores: { thailand: 3, mexico: 3, indonesia: 3, portugal: 1 } },
      { label: "$1,500 - $2,500/month", value: "medium", scores: { portugal: 3, spain: 3, greece: 3, italy: 2, mexico: 2 } },
      { label: "$2,500 - $4,000/month", value: "high", scores: { germany: 3, netherlands: 3, france: 2, uk: 2, australia: 2 } },
      { label: "Over $4,000/month", value: "luxury", scores: { dubai: 3, uk: 3, australia: 3, canada: 2 } },
    ],
  },
  {
    id: "climate",
    question: "What climate do you prefer?",
    options: [
      { label: "Warm & sunny year-round", value: "tropical", scores: { thailand: 3, indonesia: 3, dubai: 3, spain: 2, portugal: 2 } },
      { label: "Mediterranean (mild winters, hot summers)", value: "mediterranean", scores: { spain: 3, portugal: 3, greece: 3, italy: 3, cyprus: 3, malta: 2 } },
      { label: "Four distinct seasons", value: "temperate", scores: { germany: 3, netherlands: 3, france: 3, uk: 2, canada: 2 } },
      { label: "Doesn't matter to me", value: "any", scores: {} },
    ],
  },
  {
    id: "language",
    question: "How important is English accessibility?",
    options: [
      { label: "Essential - I only speak English", value: "essential", scores: { uk: 3, australia: 3, canada: 3, malta: 3, ireland: 3, dubai: 2 } },
      { label: "Important but willing to learn basics", value: "important", scores: { netherlands: 3, germany: 2, portugal: 2, spain: 1 } },
      { label: "I'm happy to learn a new language", value: "flexible", scores: { spain: 3, portugal: 3, france: 3, italy: 3, germany: 2 } },
      { label: "I already speak multiple languages", value: "multilingual", scores: {} },
    ],
  },
  {
    id: "work",
    question: "What's your work situation?",
    options: [
      { label: "Remote worker / Digital nomad", value: "remote", scores: { portugal: 3, spain: 3, thailand: 3, indonesia: 3, mexico: 2, dubai: 2 } },
      { label: "Looking for local employment", value: "local", scores: { germany: 3, uk: 3, netherlands: 3, canada: 3, australia: 3 } },
      { label: "Starting a business", value: "entrepreneur", scores: { dubai: 3, netherlands: 3, uk: 2, germany: 2 } },
      { label: "Retired / Independent income", value: "retired", scores: { portugal: 3, spain: 3, greece: 3, mexico: 3, thailand: 2 } },
    ],
  },
  {
    id: "visa",
    question: "What visa pathway interests you most?",
    options: [
      { label: "Digital Nomad Visa", value: "nomad", scores: { portugal: 3, spain: 3, germany: 2, greece: 2, croatia: 2, indonesia: 2 } },
      { label: "Work Visa / Skilled Worker", value: "work", scores: { canada: 3, australia: 3, uk: 3, germany: 3, netherlands: 2 } },
      { label: "Golden Visa / Investment", value: "investment", scores: { portugal: 3, spain: 3, greece: 3, malta: 3, cyprus: 2 } },
      { label: "Retirement Visa", value: "retirement", scores: { portugal: 3, thailand: 3, mexico: 2, spain: 2 } },
    ],
  },
  {
    id: "lifestyle",
    question: "What lifestyle aspects matter most to you?",
    options: [
      { label: "Vibrant nightlife & social scene", value: "social", scores: { spain: 3, portugal: 2, uk: 2, thailand: 2, mexico: 2 } },
      { label: "Outdoor activities & nature", value: "nature", scores: { "new-zealand": 3, australia: 3, canada: 3, portugal: 2, spain: 2 } },
      { label: "Culture, history & arts", value: "culture", scores: { italy: 3, france: 3, spain: 2, germany: 2, uk: 2 } },
      { label: "Modern amenities & convenience", value: "modern", scores: { dubai: 3, netherlands: 3, germany: 2, uk: 2 } },
    ],
  },
  {
    id: "healthcare",
    question: "How important is healthcare quality?",
    options: [
      { label: "Top priority - need excellent healthcare", value: "essential", scores: { germany: 3, france: 3, uk: 3, netherlands: 3, spain: 2 } },
      { label: "Important but affordable options work", value: "balanced", scores: { spain: 3, portugal: 3, thailand: 2, mexico: 2 } },
      { label: "Basic coverage is fine for now", value: "basic", scores: { thailand: 2, mexico: 2, indonesia: 2 } },
      { label: "I have international insurance", value: "covered", scores: {} },
    ],
  },
];

export default function QuizPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [scores, setScores] = useState<Record<string, number>>({});
  const [isComplete, setIsComplete] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch destinations on mount
  useEffect(() => {
    async function fetchDestinations() {
      try {
        const res = await fetch("/api/destinations?limit=50");
        const data = await res.json();
        setDestinations(data.destinations || []);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch destinations:", error);
        setLoading(false);
      }
    }
    fetchDestinations();
  }, []);

  const handleAnswer = (optionValue: string, optionScores: Record<string, number>) => {
    // Save answer
    setAnswers(prev => ({
      ...prev,
      [QUESTIONS[currentQuestion].id]: optionValue,
    }));

    // Update scores
    setScores(prev => {
      const newScores = { ...prev };
      Object.entries(optionScores).forEach(([dest, score]) => {
        newScores[dest] = (newScores[dest] || 0) + score;
      });
      return newScores;
    });

    // Move to next question or complete
    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setIsComplete(true);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      // Remove the previous answer's scores
      const prevQuestion = QUESTIONS[currentQuestion - 1];
      const prevAnswer = answers[prevQuestion.id];
      const prevOption = prevQuestion.options.find(o => o.value === prevAnswer);

      if (prevOption) {
        setScores(prev => {
          const newScores = { ...prev };
          Object.entries(prevOption.scores).forEach(([dest, score]) => {
            newScores[dest] = Math.max(0, (newScores[dest] || 0) - score);
          });
          return newScores;
        });
      }

      setAnswers(prev => {
        const newAnswers = { ...prev };
        delete newAnswers[prevQuestion.id];
        return newAnswers;
      });

      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setScores({});
    setIsComplete(false);
  };

  // Get top recommendations
  const getRecommendations = () => {
    const sortedScores = Object.entries(scores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    return sortedScores.map(([slug, score]) => {
      const dest = destinations.find(d => d.slug === slug);
      return dest ? { ...dest, score } : null;
    }).filter(Boolean) as (Destination & { score: number })[];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100;
  const question = QUESTIONS[currentQuestion];

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-500 to-pink-500 text-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Link href="/tools" className="text-white/80 hover:text-white text-sm mb-4 inline-block">
            ← Back to Tools
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Relocation Readiness Quiz</h1>
          <p className="text-white/90 text-lg">
            Find out which destinations match your priorities
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {!isComplete ? (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Progress Bar */}
            <div className="h-2 bg-stone-100">
              <div
                className="h-full bg-gradient-to-r from-rose-500 to-pink-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Question */}
            <div className="p-8">
              <div className="text-sm text-stone-500 mb-2">
                Question {currentQuestion + 1} of {QUESTIONS.length}
              </div>
              <h2 className="text-2xl font-bold text-stone-800 mb-8">
                {question.question}
              </h2>

              {/* Options */}
              <div className="space-y-3">
                {question.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(option.value, option.scores)}
                    className="w-full p-4 text-left rounded-xl border-2 border-stone-200 hover:border-rose-300 hover:bg-rose-50 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full border-2 border-stone-300 group-hover:border-rose-400 flex items-center justify-center text-sm font-medium text-stone-500 group-hover:text-rose-500">
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <span className="text-stone-700 group-hover:text-stone-900 font-medium">
                        {option.label}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Navigation */}
              <div className="mt-8 flex justify-between">
                <button
                  onClick={handleBack}
                  disabled={currentQuestion === 0}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    currentQuestion === 0
                      ? "text-stone-300 cursor-not-allowed"
                      : "text-stone-600 hover:text-stone-800 hover:bg-stone-100"
                  }`}
                >
                  ← Back
                </button>
                <button
                  onClick={handleRestart}
                  className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors"
                >
                  Start Over
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Results */
          <div className="space-y-6">
            {/* Results Header */}
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="text-5xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-stone-800 mb-2">Your Results Are In!</h2>
              <p className="text-stone-600">
                Based on your answers, here are your top destination matches
              </p>
            </div>

            {/* Top Recommendations */}
            <div className="grid gap-4">
              {getRecommendations().map((dest, idx) => (
                <Link
                  key={dest.slug}
                  href={`/destinations/${dest.slug}`}
                  className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="flex">
                    {/* Rank */}
                    <div className={`w-16 flex items-center justify-center text-2xl font-bold ${
                      idx === 0 ? "bg-gradient-to-b from-amber-400 to-amber-500 text-white" :
                      idx === 1 ? "bg-gradient-to-b from-stone-300 to-stone-400 text-white" :
                      idx === 2 ? "bg-gradient-to-b from-amber-600 to-amber-700 text-white" :
                      "bg-stone-100 text-stone-500"
                    }`}>
                      #{idx + 1}
                    </div>

                    {/* Image */}
                    <div className="w-32 h-24 relative hidden sm:block">
                      {dest.hero_image_url ? (
                        <img
                          src={dest.hero_image_url}
                          alt={dest.country_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-rose-400 to-pink-500" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{dest.flag}</span>
                        <h3 className="font-bold text-stone-800">{dest.country_name}</h3>
                      </div>
                      <p className="text-sm text-stone-500 line-clamp-2">
                        {dest.hero_subtitle || `Explore living in ${dest.country_name}`}
                      </p>
                    </div>

                    {/* Score */}
                    <div className="w-24 flex flex-col items-center justify-center bg-stone-50 px-4">
                      <div className="text-2xl font-bold text-rose-500">{dest.score}</div>
                      <div className="text-xs text-stone-500">Match Score</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Actions */}
            <div className="bg-rose-50 rounded-xl p-6 text-center">
              <h3 className="font-semibold text-stone-800 mb-4">What's Next?</h3>
              <div className="flex flex-wrap justify-center gap-4">
                <button
                  onClick={handleRestart}
                  className="px-6 py-3 bg-white text-rose-600 border border-rose-200 rounded-lg font-medium hover:bg-rose-50 transition-colors"
                >
                  Retake Quiz
                </button>
                <Link
                  href="/tools/compare"
                  className="px-6 py-3 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 transition-colors"
                >
                  Compare Top Destinations
                </Link>
                <Link
                  href="/"
                  className="px-6 py-3 bg-stone-800 text-white rounded-lg font-medium hover:bg-stone-900 transition-colors"
                >
                  Talk to ATLAS
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
