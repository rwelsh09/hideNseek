import { readFileSync } from 'fs';

const content = readFileSync('src/lib/context.ts', 'utf-8');
if (content.includes('isGameFinished')) {
    console.log('Already has isGameFinished');
} else {
    console.log('Ready to add isGameFinished');
}
