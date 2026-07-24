import { ClosestQuestionComponent } from "./cards/closest";
import { HotColdQuestionComponent } from "./cards/hot-cold";
import { MatchQuestionComponent } from "./cards/match";
import { MeasureQuestionComponent } from "./cards/measure";
import { PhotoQuestionComponent } from "./cards/photo";
import { RadarQuestionComponent } from "./cards/radar";

import type { Question } from "@/maps/schema";

const QUESTION_COMPONENTS: Record<string, React.FC<any>> = {
    radar: RadarQuestionComponent,
    "hot/cold": HotColdQuestionComponent,
    closest: ClosestQuestionComponent,
    match: MatchQuestionComponent,
    measure: MeasureQuestionComponent,
    photo: PhotoQuestionComponent,
};

export const QuestionCardComponent = ({
    question,
    className,
}: {
    question: Question;
    className?: string;
}) => {
    const Component = QUESTION_COMPONENTS[question.id];
    if (!Component) return null;
    return (
        <Component
            data={question.data}
            questionKey={question.key}
            className={className}
        />
    );
};
