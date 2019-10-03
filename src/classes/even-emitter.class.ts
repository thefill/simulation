import {EventCallback} from '../types';

/**
 * Event emitter
 * @constructor
 */
export class EventEmitter {

    // callback store
    protected callbacks: { [eventType: string]: EventCallback[] } = {};

    /**
     * Emit value to the listeners
     * @param {string} eventType
     * @param {any} values
     */
    public emit(eventType: string, ...values: any): void {
        const callbacks = this.callbacks[eventType];
        if (!callbacks) {
            return;
        }

        callbacks.forEach((callback) => {
            callback(...values);
        });
    }

    /**
     * Set listener
     * @param {string} eventType
     * @param {EventCallback} callback
     */
    public on(eventType: string, callback: EventCallback): void {
        if (!this.callbacks[eventType]) {
            this.callbacks[eventType] = [];
        }

        this.callbacks[eventType].push(callback);
    }

    /**
     * Remove listener
     * @param {string} eventType
     * @param {EventCallback} callback
     */
    public removeEventListener(eventType: string, callback: EventCallback): void {
        const callbacks = this.callbacks[eventType];
        if (!callbacks) {
            return;
        }

        callbacks.forEach((setCallback, index) => {
            if (setCallback === callback) {
                callbacks.splice(index, 1);
            }
        });
    }
}
