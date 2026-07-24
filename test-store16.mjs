import { atom } from 'nanostores';

const _isLoading = atom(false);

const originalGet = _isLoading.get;
console.log('originalGet === _isLoading.get:', originalGet === _isLoading.get);

// try calling un-bound methods on nanostores atom
try {
    const v = originalGet();
    console.log('v =', v);
} catch (e) {
    console.log('error calling unbound get:', e);
}

try {
    const originalListen = _isLoading.listen;
    originalListen(() => {});
    console.log('listen success');
} catch (e) {
    console.log('error calling unbound listen:', e);
}
