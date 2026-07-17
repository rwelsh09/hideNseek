/// <reference types="vite-plugin-pwa/client" />
import { registerSW } from "virtual:pwa-register";
import { toast } from "react-toastify";

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
