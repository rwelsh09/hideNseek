const fs = require("fs");
const file = "src/components/QuestionSidebar.tsx";
let code = fs.readFileSync(file, "utf8");

code = code.replace(
    `    const $penaltyMinutes = useStore(penaltyMinutes);

    // Add missing import for React`,
    `    const $penaltyMinutes = useStore(penaltyMinutes);`,
);

code = code.replace('import * as React from "react";\n', "");

fs.writeFileSync(file, code);
