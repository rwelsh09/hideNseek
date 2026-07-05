with open('src/components/cards/base.tsx', 'r') as f:
    content = f.read()

import re

# 1. Fix the imports
content = content.replace(
    'import { useState } from "react";\nimport { VscChevronDown, VscTrash } from "react-icons/vsc";',
    'import { useRef, useState } from "react";\nimport { VscChevronDown } from "react-icons/vsc";'
)

# 2. Fix the locked block
old_block = """                        <div className="flex gap-2 pt-2 px-2 justify-center">
                            <Button
                                variant="outline"
                                size="sm"
                                aria-label="Delete Question"
                                data-tutorial-id="tutorial-delete-question-btn"
                                disabled={$isLoading}
                                onClick={() => {
                                    if (questionData.drag) {
                                        questions.set(
                                            $questions.filter(
                                                (q) => q.key !== questionKey,
                                            ),
                                        );
                                    }
                                }}
                            >
                                <VscTrash />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                data-tutorial-id="tutorial-lock-btn"
                                aria-label={
                                    !questionData.drag
                                        ? "Unlock Question"
                                        : "Lock Question"
                                }
                                onClick={() => {
                                    const locked = questionData.drag;
                                    questionData.drag = !locked;
                                    questionModified();
                                    if (locked) {
                                        penaltyMinutes.set(
                                            penaltyMinutes.get() +
                                                TIME_PENALTIES[penaltyId],
                                        );
                                    } else {
                                        penaltyMinutes.set(
                                            Math.max(
                                                0,
                                                penaltyMinutes.get() -
                                                    TIME_PENALTIES[penaltyId],
                                            ),
                                        );
                                    }
                                }}
                                disabled={$isLoading}
                            >
                                {!questionData.drag ? (
                                    <LockIcon />
                                ) : (
                                    <UnlockIcon />
                                )}
                            </Button>
                        </div>"""

new_block = """                        <div className="flex gap-2 pt-2 px-2 justify-center">
                            <Button
                                variant="outline"
                                size="sm"
                                data-tutorial-id="tutorial-lock-btn"
                                aria-label={
                                    !questionData.drag
                                        ? "Unlock Question"
                                        : "Lock Question"
                                }
                                title={
                                    !questionData.drag
                                        ? "Unlock Question"
                                        : "Lock Question"
                                }
                                onClick={() => {
                                    const locked = questionData.drag;
                                    questionData.drag = !locked;
                                    questionModified();
                                    if (locked) {
                                        penaltyMinutes.set(
                                            penaltyMinutes.get() +
                                                TIME_PENALTIES[penaltyId],
                                        );
                                    } else {
                                        penaltyMinutes.set(
                                            Math.max(
                                                0,
                                                penaltyMinutes.get() -
                                                    TIME_PENALTIES[penaltyId],
                                            ),
                                        );
                                    }
                                }}
                                disabled={$isLoading}
                                className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
                            >
                                {!questionData.drag ? (
                                    <LockIcon className="w-4 h-4" />
                                ) : (
                                    <UnlockIcon className="w-4 h-4" />
                                )}
                            </Button>
                        </div>"""

content = content.replace(old_block, new_block)

with open('src/components/cards/base.tsx', 'w') as f:
    f.write(content)
