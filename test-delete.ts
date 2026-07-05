import { questions, questionModified } from "./src/lib/context";

console.log("Initial:", questions.get().length);
questions.set([
    {
        id: "radius",
        key: 1,
        lat: 0,
        lng: 0,
        type: "museum",
        drag: true,
        collapsed: false,
        radius: 100,
        unit: "meters",
        within: true,
        color: "orange"
    } as any
]);

console.log("After add:", questions.get().length);

const qList = questions.get();
const questionKey = 1;

questions.set(
    qList.filter((q) => q.key !== questionKey)
);

console.log("After delete:", questions.get().length);
