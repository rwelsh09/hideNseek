const fs = require('fs');
let code = fs.readFileSync('src/components/AddQuestionDialog.tsx', 'utf8');

code = code.replace(/    Building2,\n/, '');
code = code.replace(/    Flag,\n/, '');

fs.writeFileSync('src/components/AddQuestionDialog.tsx', code);
