import { ClosestQuestionComponent } from "./cards/closest";
export { ClosestQuestionComponent };
import { HotColdQuestionComponent } from "./cards/hot-cold";
export { HotColdQuestionComponent };
import { MatchQuestionComponent } from "./cards/match";
export { MatchQuestionComponent };
import { MeasureQuestionComponent } from "./cards/measure";
export { MeasureQuestionComponent };
import { PhotoQuestionComponent } from "./cards/photo";
export { PhotoQuestionComponent };
import { RadarQuestionComponent } from "./cards/radar";
export { RadarQuestionComponent };

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
