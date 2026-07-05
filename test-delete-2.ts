import { questions, questionModified } from "./src/lib/context";

questions.set([]);
questions.set([
    {
        id: "radius",
        key: 1,
        data: {
            lat: 0,
            lng: 0,
            type: "museum",
            drag: false, // Locked
            collapsed: false,
            radius: 100,
            unit: "meters",
            within: true,
            color: "orange"
        }
    } as any
]);

const qList = questions.get();
const questionKey = 1;

const currentQ = qList.find((q) => q.key === questionKey);
console.log(currentQ);
if (currentQ && currentQ.data && currentQ.data.drag) {
    console.log("Delete logic inside if");
} else {
    console.log("Cannot delete because of drag");
}
