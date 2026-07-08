import { persistentAtom } from "@nanostores/persistent";
import { useStore } from "@nanostores/react";
import React, { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

const quizCurrentQuestionIndex = persistentAtom<number>(
    "quizCurrentQuestionIndex",
    0,
    { encode: JSON.stringify, decode: JSON.parse },
);
const quizScore = persistentAtom<number>("quizScore", 0, {
    encode: JSON.stringify,
    decode: JSON.parse,
});
const quizShowResults = persistentAtom<boolean>("quizShowResults", false, {
    encode: JSON.stringify,
    decode: JSON.parse,
});
const quizSelectedOption = persistentAtom<number | null>(
    "quizSelectedOption",
    null,
    { encode: JSON.stringify, decode: JSON.parse },
);
const quizIsAnswered = persistentAtom<boolean>("quizIsAnswered", false, {
    encode: JSON.stringify,
    decode: JSON.parse,
});

const QUIZ_QUESTIONS = [
    {
        question:
            "During the head start, what is the Hider's primary mode of transportation?",
        options: [
            "An Uber or taxi to get as far away as possible.",
            "A bicycle they brought from home.",
            "Approved public transit (trains, buses) and walking.",
            "Teleportation (if available).",
        ],
        correct: 2,
    },
    {
        question: "What happens when the Seekers enter your Hiding Zone?",
        options: [
            "The end game begins! You must stay completely stationary in a publicly accessible spot.",
            "You get an extra 10-minute head start.",
            "You have to start running to a new station.",
            "You must loudly announce your location.",
        ],
        correct: 0,
    },
    {
        question: "Which of these is a VALID final hiding spot?",
        options: [
            "A locked bathroom stall in a mall.",
            "A park bench within 3 meters of a path on Google Maps.",
            "Inside your friend's private apartment.",
            "In the middle of a busy highway.",
        ],
        correct: 1,
    },
    {
        question: "Why should you avoid hiding deep inside a retail store?",
        options: [
            "Stores are usually too small to hide in.",
            "The Seekers are banned from entering stores.",
            "The store might not be on the transit map.",
            "Standing in a store for hours might raise suspicion or get you kicked out.",
        ],
        correct: 3,
    },
    {
        question:
            "How are Time Penalties calculated when Seekers ask questions?",
        options: [
            "The webapp automatically calculates and applies them to the game clock.",
            "The Seekers must manually subtract minutes on their phones.",
            "The Hider decides the penalty based on how helpful the answer is.",
            "There are no Time Penalties, ask away!",
        ],
        correct: 0,
    },
    {
        question: "What defines the absolute boundaries of the game map?",
        options: [
            "A 5-kilometer radius from where you started.",
            "The entire Earth, if you have enough time.",
            "Only places the Hider has visited before.",
            "The Calgary Rapid Transit Network.",
        ],
        correct: 3,
    },
    {
        question: "How do the Seekers finally win a round?",
        options: [
            "By guessing the exact GPS coordinates of the Hider.",
            "By physically spotting the Hider (or getting within tagging distance).",
            "When the Hider runs out of battery.",
            "By asking 10 questions correctly.",
        ],
        correct: 1,
    },
    {
        question: "Can Seekers use Google Street View to look at a location?",
        options: [
            "Yes, if they don't want to walk there.",
            "Only if the Hider agrees to it.",
            "No, Seekers must physically go to places to search for the Hider's photos.",
            "Yes, but it costs a time penalty."
        ],
        correct: 2,
    },
    {
        question: "Should players other than the Hider share their live location?",
        options: [
            "No, that ruins the surprise.",
            "Yes, all players other than the Hider must share their location with the group.",
            "Only when they find the Hider.",
            "Yes, but only with the Seekers, not the Hider."
        ],
        correct: 1,
    },
    {
        question: "If you want to play a practice round, what is highly encouraged?",
        options: [
            "To not do it, practice makes imperfect.",
            "To choose a Hiding Spot together and discuss the different answers one would give.",
            "To only play in an area you know well.",
            "To limit the time to 10 minutes."
        ],
        correct: 1,
    },
];

export const RulesQuiz = () => {
    const currentQuestionIndex = useStore(quizCurrentQuestionIndex);
    const score = useStore(quizScore);
    const showResults = useStore(quizShowResults);
    const selectedOption = useStore(quizSelectedOption);
    const isAnswered = useStore(quizIsAnswered);

    // Prevent hydration mismatch between server-rendered Astro state and client nanostore state
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (isAnswered && currentQuestionIndex + 1 === QUIZ_QUESTIONS.length) {
            const timer = setTimeout(() => {
                quizShowResults.set(true);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [isAnswered, currentQuestionIndex]);

    const handleOptionClick = (index: number) => {
        if (isAnswered) return;

        quizSelectedOption.set(index);
        quizIsAnswered.set(true);

        if (index === QUIZ_QUESTIONS[currentQuestionIndex].correct) {
            quizScore.set(score + 1);
        }
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex + 1 < QUIZ_QUESTIONS.length) {
            quizCurrentQuestionIndex.set(currentQuestionIndex + 1);
            quizSelectedOption.set(null);
            quizIsAnswered.set(false);
        } else {
            quizShowResults.set(true);
        }
    };

    const resetQuiz = () => {
        quizCurrentQuestionIndex.set(0);
        quizScore.set(0);
        quizShowResults.set(false);
        quizSelectedOption.set(null);
        quizIsAnswered.set(false);
    };

    if (!isMounted) return null;

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
                            type="button"
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

            {currentQuestionIndex + 1 !== QUIZ_QUESTIONS.length && (
            <div className="flex justify-end mt-4 min-h-[40px]">
                <Button
                    onClick={handleNextQuestion}
                    disabled={!isAnswered}
                    className={`text-white transition-opacity duration-200 ${
                        isAnswered
                            ? "bg-blue-600 hover:bg-blue-700 opacity-100"
                            : "bg-slate-600 opacity-50 cursor-not-allowed"
                    }`}
                >
                    Next Question
                </Button>
            </div>
            )}
        </div>
    );
};
