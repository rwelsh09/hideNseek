import React, { useState } from "react";

import { Button } from "@/components/ui/button";

const QUIZ_QUESTIONS = [
    {
        question: "What defines the bounds of the game?",
        options: [
            "Any road within city limits.",
            "The Calgary Rapid Transit Network.",
            "A 10km radius from city hall.",
            "Only places the Hider has visited before.",
        ],
        correct: 1,
    },
    {
        question: "Where is a valid hiding spot once the end game begins?",
        options: [
            "A bathroom stall.",
            "Someone's private home.",
            "Any publicly accessible spot within 3 meters of a Google Maps path.",
            "Deep inside a large store.",
        ],
        correct: 2,
    },
    {
        question:
            "Can the Hider use ride-shares (like Uber) during the head start?",
        options: [
            "Yes, to save time.",
            "Only if agreed upon.",
            "No, only public transit (trains, buses) and walking.",
            "Yes, if they pay for it themselves.",
        ],
        correct: 2,
    },
    {
        question:
            "According to the map, which transit lines go through Westbrook station?",
        options: [
            "Blue Line and Red Line.",
            "Red Line and MAX Teal.",
            "Blue Line and MAX Teal.",
            "Red Line only.",
        ],
        correct: 2,
    },
    {
        question: "What happens when Seekers ask a question?",
        options: [
            "The Hider gives them $5.",
            "A Time Penalty is incurred, added to the game clock to compensate the Hider.",
            "The Seekers lose 5 minutes.",
            "The Hider has to move.",
        ],
        correct: 1,
    },
    {
        question: "When does the game round end?",
        options: [
            "After exactly 2 hours.",
            "When the Hider gets bored and goes home.",
            "When Seekers physically spot the Hider.",
            "When all questions have been asked.",
        ],
        correct: 2,
    },
];

export const RulesQuiz = () => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);

    const handleOptionClick = (index: number) => {
        if (isAnswered) return;

        setSelectedOption(index);
        setIsAnswered(true);

        if (index === QUIZ_QUESTIONS[currentQuestionIndex].correct) {
            setScore(score + 1);
        }
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex + 1 < QUIZ_QUESTIONS.length) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
            setShowResults(true);
        }
    };

    const resetQuiz = () => {
        setCurrentQuestionIndex(0);
        setScore(0);
        setShowResults(false);
        setSelectedOption(null);
        setIsAnswered(false);
    };

    if (showResults) {
        return (
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 text-center">
                <h3 className="text-2xl font-bold text-white mb-4">
                    Quiz Complete!
                </h3>
                <p className="text-slate-300 mb-6 text-lg">
                    You scored{" "}
                    <span className="font-bold text-blue-400">{score}</span> out
                    of {QUIZ_QUESTIONS.length}!
                </p>
                <Button
                    onClick={resetQuiz}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                    Retake Quiz
                </Button>
            </div>
        );
    }

    const currentQuestion = QUIZ_QUESTIONS[currentQuestionIndex];

    return (
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <div className="mb-6 flex justify-between items-center text-slate-400 text-sm">
                <span>
                    Question {currentQuestionIndex + 1} of{" "}
                    {QUIZ_QUESTIONS.length}
                </span>
                <span>Score: {score}</span>
            </div>

            <h3 className="text-xl font-medium text-white mb-6">
                {currentQuestion.question}
            </h3>

            <div className="space-y-3 mb-6">
                {currentQuestion.options.map((option, index) => {
                    let optionClass =
                        "w-full text-left p-4 rounded-lg border transition-colors ";

                    if (!isAnswered) {
                        optionClass +=
                            "bg-slate-700 border-slate-600 hover:bg-slate-600 text-slate-200 cursor-pointer";
                    } else {
                        if (index === currentQuestion.correct) {
                            optionClass +=
                                "bg-green-900/50 border-green-500 text-green-200";
                        } else if (index === selectedOption) {
                            optionClass +=
                                "bg-red-900/50 border-red-500 text-red-200";
                        } else {
                            optionClass +=
                                "bg-slate-800 border-slate-700 text-slate-400 opacity-50";
                        }
                    }

                    return (
                        <button
                            key={index}
                            className={optionClass}
                            onClick={() => handleOptionClick(index)}
                            disabled={isAnswered}
                        >
                            {option}
                        </button>
                    );
                })}
            </div>

            {isAnswered && (
                <div className="flex justify-end mt-4">
                    <Button
                        onClick={handleNextQuestion}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        {currentQuestionIndex + 1 === QUIZ_QUESTIONS.length
                            ? "Show Results"
                            : "Next Question"}
                    </Button>
                </div>
            )}
        </div>
    );
};
