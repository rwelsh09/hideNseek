// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { registerSW } from "virtual:pwa-register";

registerSW({
    immediate: true,
    onRegisteredSW() {},
    onOfflineReady() {},
});
