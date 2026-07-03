import sys
with open('src/components/AddQuestionDialog.tsx', 'r') as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if 'Transit' in line and lines[i-2].find('TramFront') != -1:
        measure_idx = i + 3
        # Ensure we don't duplicate
        found = False
        for j in range(measure_idx, measure_idx+10):
            if "McDonald's" in lines[j]:
                found = True
        if not found:
            lines.insert(measure_idx, '''                            <button
                                onClick={() =>
                                    handleQuestionSelect("measure", "mcdonalds")
                                }
                                className="bg-green-600 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-green-700 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none"
                            >
                                <Hamburger className="w-5 h-5 sm:w-5 sm:h-5 shrink-0" />
                                <span className="text-[9px] sm:text-[10px] leading-tight text-center w-full px-0.5 line-clamp-2">
                                    McDonald's
                                </span>
                            </button>
                            <button
                                onClick={() =>
                                    handleQuestionSelect("measure", "seven11")
                                }
                                className="bg-green-600 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-green-700 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none"
                            >
                                <Store className="w-5 h-5 sm:w-5 sm:h-5 shrink-0" />
                                <span className="text-[9px] sm:text-[10px] leading-tight text-center w-full px-0.5 line-clamp-2">
                                    7-Eleven
                                </span>
                            </button>\n''')
        break

closest_idx = -1
for i, line in enumerate(lines):
    if 'handleQuestionSelect("closest", "pub")' in line:
        for j in range(i, i+15):
            if 'Pub' in lines[j] and '</span>' in lines[j]:
                closest_idx = j + 3
                found = False
                for k in range(closest_idx, closest_idx+10):
                    if "McDonald's" in lines[k]:
                        found = True
                if not found:
                    lines.insert(closest_idx, '''                                <button
                                    onClick={() =>
                                        handleQuestionSelect("closest", "mcdonalds")
                                    }
                                    className="bg-purple-600 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-purple-700 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none"
                                >
                                    <Hamburger className="w-5 h-5 sm:w-5 sm:h-5 shrink-0" />
                                    <span className="text-[9px] sm:text-[10px] leading-tight text-center w-full px-0.5 line-clamp-2">
                                        McDonald's
                                    </span>
                                </button>
                                <button
                                    onClick={() =>
                                        handleQuestionSelect("closest", "seven11")
                                    }
                                    className="bg-purple-600 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-purple-700 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none"
                                >
                                    <Store className="w-5 h-5 sm:w-5 sm:h-5 shrink-0" />
                                    <span className="text-[9px] sm:text-[10px] leading-tight text-center w-full px-0.5 line-clamp-2">
                                        7-Eleven
                                    </span>
                                </button>\n''')
                break
        break

with open('src/components/AddQuestionDialog.tsx', 'w') as f:
    f.writelines(lines)
