with open('src/components/LatLngPicker.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'import { VscQuestion, VscShare } from "react-icons/vsc";',
    'import { VscQuestion, VscShare, VscTrash } from "react-icons/vsc";'
)

trash_button = """                                )}
                                <Button
                                    variant="outline"
                                    size="icon"
                                    aria-label="Delete Question"
                                    data-tutorial-id="tutorial-delete-question-btn"
                                    disabled={disabled}
                                    onClick={() => {
                                        const qList = questions.get();
                                        const currentQ = qList.find((q) => q.key === questionKey);
                                        if (currentQ && currentQ.drag) {
                                            questions.set(
                                                qList.filter((q) => q.key !== questionKey)
                                            );
                                        }
                                    }}
                                >
                                    <VscTrash />
                                </Button>
                                <Dialog>"""

content = content.replace(
    """                                )}
                                <Dialog>""",
    trash_button
)

with open('src/components/LatLngPicker.tsx', 'w') as f:
    f.write(content)
