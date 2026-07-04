import { useStore } from "@nanostores/react";
import { LockIcon, UnlockIcon } from "lucide-react";
import { useRef, useState } from "react";
import { VscChevronDown } from "react-icons/vsc";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
} from "@/components/ui/sidebar-l";
import { isLoading, questions } from "@/lib/context";
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
                        {locked !== undefined && (
                            <div className="flex gap-2 pt-2 px-2 justify-center">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    data-tutorial-id="tutorial-lock-btn"
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
                            </div>
                        )}
                    </SidebarGroupContent>
                </div>
            </SidebarGroup>
            <Separator className="h-1" />
        </>
    );
};
