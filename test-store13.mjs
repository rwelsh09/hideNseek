import { atom } from 'nanostores';
import { useStore } from '@nanostores/react';
import React, { useState } from 'react';
import { render, act } from '@testing-library/react';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;

const _isLoading = atom(false);
const isLoading = {
    get: _isLoading.get,
    get value() { return _isLoading.get(); },
    listen: _isLoading.listen,
    subscribe: _isLoading.subscribe,
    set: (v) => _isLoading.set(v)
};

function App() {
    const v = useStore(isLoading);
    console.log('App render, v=', v);
    return React.createElement('div', { onClick: () => { isLoading.set(true); } }, String(v));
}

let container;
act(() => {
    container = render(React.createElement(App)).container;
});

act(() => {
    container.firstChild.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
});
