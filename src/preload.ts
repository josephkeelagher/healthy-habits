// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from 'electron';

export {}

declare global {
    interface Window {
        hh: {
            dismiss: () => void;
        }
    }
}

contextBridge.exposeInMainWorld('hh', {
    dismiss: () => ipcRenderer.send('dismiss-reminder')
});
