/// <reference types="vite-plugin-pwa/client" />
import { toast } from "react-toastify";
import { registerSW } from "virtual:pwa-register";

const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
        toast.info("Update available! Click here to reload.", {
            onClick: () => {
                updateSW(true);
            },
            autoClose: false,
            closeOnClick: true,
            draggable: false,
        });
    },
    onRegisteredSW() {},
    onOfflineReady() {
        toast.success("App is ready to work offline.");
    },
});
