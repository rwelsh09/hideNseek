import { test } from "vitest";

const generateQuestions = (count: number) => {
    return Array(count)
        .fill(0)
        .map(() => ({
            id: "tentacles",
            data: { drag: true },
        }));
};

const mockHiderifyQuestion = async (q: any) => {
    await new Promise((r) => setTimeout(r, 10)); // simulate 10ms async work
    return q;
};

test("benchmark", async () => {
    const questions = generateQuestions(100);

    const start1 = performance.now();
    for (const question of questions) {
        await mockHiderifyQuestion(question);
    }
    const end1 = performance.now();
    console.log(`Sequential: ${end1 - start1}ms`);

    const questions2 = generateQuestions(100);
    const start2 = performance.now();
    await Promise.all(questions2.map((q) => mockHiderifyQuestion(q)));
    const end2 = performance.now();
    console.log(`Concurrent: ${end2 - start2}ms`);
});
