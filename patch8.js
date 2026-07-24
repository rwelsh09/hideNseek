import fs from 'fs';

const file = 'src/lib/context.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    'export const isLoading = {\n    get: _isLoading.get.bind(_isLoading),\n    get value() { return _isLoading.get(); },\n    listen: _isLoading.listen.bind(_isLoading),\n    subscribe: _isLoading.subscribe.bind(_isLoading),\n    set: (value: boolean) => {',
    'export const isLoading = _isLoading;\nconst _originalSet = _isLoading.set.bind(_isLoading);\n\n_isLoading.set = (value: boolean) => {'
);

fs.writeFileSync(file, content);
