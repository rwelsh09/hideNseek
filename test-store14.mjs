import { atom } from 'nanostores';

const _isLoading = atom(false);
const isLoading = {
    get: _isLoading.get,
    get value() { return _isLoading.get(); },
    listen: _isLoading.listen,
    subscribe: _isLoading.subscribe,
    set: (v) => _isLoading.set(v)
};

// Check if store.listen(emit(...)) is valid
console.log('listen typeof', typeof isLoading.listen);
// test if it returns a function
const unbind = isLoading.listen(() => {});
console.log('listen unbind typeof', typeof unbind);
