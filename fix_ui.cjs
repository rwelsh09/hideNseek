const fs = require('fs');
let code = fs.readFileSync('src/components/AddQuestionDialog.tsx', 'utf8');

// 1. Update defaults
code = code.replace(/qData\.type = detail \|\| "major-city";/, 'qData.type = detail || "museum-full";');
code = code.replace(/qData\.type = detail \|\| "coastline";/, 'qData.type = detail || "museum-full";');

// 2. Remove buttons
// Remove coastline button
code = code.replace(/<button[^>]*onClick=\{\(\) =>[^>]*handleQuestionSelect\([^>]*"measuring",[^>]*"coastline"[^>]*\)[^>]*\}[^>]*>[\s\S]*?<\/button>/, '');
// Remove city button
code = code.replace(/<button[^>]*onClick=\{\(\) =>[^>]*handleQuestionSelect\([^>]*"measuring",[^>]*"city"[^>]*\)[^>]*\}[^>]*>[\s\S]*?<\/button>/, '');
// Remove consulate button
code = code.replace(/<button[^>]*onClick=\{\(\) =>[^>]*handleQuestionSelect\([^>]*"tentacles",[^>]*"consulate"[^>]*\)[^>]*\}[^>]*>[\s\S]*?<\/button>/, '');
// Remove mountain/peak button ? The one for "photo", "landmark"
code = code.replace(/<button[^>]*onClick=\{\(\) =>[^>]*handleQuestionSelect\([^>]*"photo",[^>]*"landmark"[^>]*\)[^>]*\}[^>]*>[\s\S]*?<\/button>/, '');

// Also remove Mountain import
code = code.replace(/    Mountain,\n/, '');

fs.writeFileSync('src/components/AddQuestionDialog.tsx', code);
