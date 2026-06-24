import { useStore } from "@nanostores/react";
import { LockIcon, UnlockIcon } from "lucide-react";
import { useRef, useState } from "react";
import {
    VscChevronDown,
    VscQuestion,
    VscShare,
    VscTrash,
} from "react-icons/vsc";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
} from "@/components/ui/sidebar-l";
import { isLoading, questions } from "@/lib/context";
import { QUESTION_RULES } from "@/lib/rules";
import { cn } from "@/lib/utils";

export const QuestionCard = ({
    children,
    questionKey,
    className,
    label,
    sub,
    collapsed,
    locked,
    setLocked,
    setCollapsed,
}: {
    children: React.ReactNode;
    questionKey: number;
    className?: string;
    label?: string;
    sub?: string;
    collapsed?: boolean;
    locked?: boolean;
    setLocked?: (locked: boolean) => void;
    setCollapsed?: (collapsed: boolean) => void;
}) => {
    const [isCollapsed, setIsCollapsed] = useState(collapsed ?? false);
    const $questions = useStore(questions);
    const $isLoading = useStore(isLoading);
    const copyButtonRef = useRef<HTMLButtonElement>(null);

    const toggleCollapse = () => {
        if (setCollapsed) {
            setCollapsed(!isCollapsed);
        }
        setIsCollapsed((prevState) => !prevState);
    };

    return (
        <>
            <SidebarGroup className={className}>
                <div className="relative">
                    <button
                        type="button"
                        onClick={toggleCollapse}
                        aria-label={
                            isCollapsed
                                ? "Expand Question"
                                : "Collapse Question"
                        }
                        aria-expanded={!isCollapsed}
                        className={cn(
                            "absolute top-2 left-2 text-white border rounded-md transition-all duration-500",
                            isCollapsed && "-rotate-90",
                        )}
                    >
                        <VscChevronDown />
                    </button>
                    <SidebarGroupLabel
                        className="ml-8 mr-8 cursor-pointer"
                        onClick={toggleCollapse}
                    >
                        {label} {sub && `(${sub})`}
                    </SidebarGroupLabel>
                    <SidebarGroupContent
                        className={cn(
                            "overflow-hidden transition-all duration-1000 max-h-[100rem]", // 100rem is arbitrary
                            isCollapsed && "max-h-0",
                        )}
                    >
                        <SidebarMenu>{children}</SidebarMenu>
                        <div className="flex gap-2 pt-2 px-2 justify-center">
                            <Dialog>
                                {QUESTION_RULES[
                                    $questions.find(
                                        (q) => q.key === questionKey,
                                    )?.id as keyof typeof QUESTION_RULES
                                ] && (
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                aria-label="Question Rules"
                                            >
                                                <VscQuestion />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-80 p-4">
                                            <h4 className="font-semibold mb-2">
                                                How it works
                                            </h4>
                                            <p className="text-sm text-muted-foreground">
                                                {
                                                    QUESTION_RULES[
                                                        $questions.find(
                                                            (q) =>
                                                                q.key ===
                                                                questionKey,
                                                        )
                                                            ?.id as keyof typeof QUESTION_RULES
                                                    ]
                                                }
                                            </p>
                                        </PopoverContent>
                                    </Popover>
                                )}
                                <DialogTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        aria-label="Share Question"
                                    >
                                        <VscShare />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle className="text-2xl">
                                            Share this Question!
                                        </DialogTitle>
                                        <DialogDescription>
                                            Below you can access the JSON
                                            representing the question. Send this
                                            to another player for them to copy.
                                            They can then click &ldquo;Paste
                                            Question&rdquo; at the bottom of the
                                            &ldquo;Questions&rdquo; sidebar.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="mb-2 sm:mb-0 transition-colors"
                                        ref={copyButtonRef}
                                        onClick={() => {
                                            navigator.clipboard
                                                .writeText(
                                                    JSON.stringify(
                                                        $questions.find(
                                                            (q) =>
                                                                q.key ===
                                                                questionKey,
                                                        ),
                                                        null,
                                                        4,
                                                    ),
                                                )
                                                .then(() => {
                                                    if (copyButtonRef.current) {
                                                        copyButtonRef.current.textContent =
                                                            "Copied!";
                                                        copyButtonRef.current.classList.add(
                                                            "bg-green-500",
                                                        );
                                                        setTimeout(() => {
                                                            if (
                                                                copyButtonRef.current
                                                            ) {
                                                                copyButtonRef.current.textContent =
                                                                    "Copy to Clipboard";
                                                                copyButtonRef.current.classList.remove(
                                                                    "bg-green-500",
                                                                );
                                                            }
                                                        }, 2000);
                                                    }
                                                })
                                                .catch(() => {
                                                    if (copyButtonRef.current) {
                                                        copyButtonRef.current.textContent =
                                                            "Failed to Copy";
                                                        copyButtonRef.current.classList.add(
                                                            "bg-red-500",
                                                        );
                                                        setTimeout(() => {
                                                            if (
                                                                copyButtonRef.current
                                                            ) {
                                                                copyButtonRef.current.textContent =
                                                                    "Copy to Clipboard";
                                                                copyButtonRef.current.classList.remove(
                                                                    "bg-red-500",
                                                                );
                                                            }
                                                        }, 2000);
                                                    }
                                                });
                                        }}
                                    >
                                        Copy to Clipboard
                                    </Button>
                                    <textarea
                                        className="w-full h-[300px] bg-slate-900 text-white rounded-md p-2"
                                        readOnly
                                        value={JSON.stringify(
                                            $questions.find(
                                                (q) => q.key === questionKey,
                                            ),
                                            null,
                                            4,
                                        )}
                                    ></textarea>
                                </DialogContent>
                            </Dialog>
                            <Button
                                variant="outline"
                                size="sm"
                                aria-label="Delete Question"
                                disabled={$isLoading}
                                onClick={() => {
                                    if (!locked) {
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
                            {locked !== undefined && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    aria-label={
                                        locked
                                            ? "Unlock Question"
                                            : "Lock Question"
                                    }
                                    onClick={() => setLocked!(!locked)}
                                    disabled={$isLoading}
                                >
                                    {locked ? <LockIcon /> : <UnlockIcon />}
                                </Button>
                            )}
                        </div>
                    </SidebarGroupContent>
                </div>
            </SidebarGroup>
            <Separator className="h-1" />
        </>
    );
};
