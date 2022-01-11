/*
MIT License

Copyright (c) Jason Miller (https://jasonformat.com/)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

// This file is based on https://github.com/developit/mitt/blob/v1.1.3/src/index.js
// It's been edited for the needs of this script
// See the LICENSE at the top of the file

export type UnlistenFn = () => void;

export type EventHandler = (...evts: any[]) => void;

export type EventEmitter = {
  on(type: string, handler: EventHandler): UnlistenFn;
  once(type: string, handler: EventHandler): void;
  off(type: string, handler: EventHandler): void;
  emit(type: string, ...evts: any[]): void;
};

export default function emitter(): EventEmitter {
  const all: { [s: string]: EventHandler[] } = Object.create(null);

  return {
    on(type: string, handler: EventHandler) {
      (all[type] || (all[type] = [])).push(handler);

      return () => {
        this.off(type, handler);
      };
    },

    off(type: string, handler: EventHandler) {
      const index = all[type].indexOf(handler);
      if (index >= 0) {
        all[type].splice(index, 1);
      }
    },

    once(type: string, handler: EventHandler) {
      let off: any;
      const onceHandler = () => {
        off();
        handler();
      };
      off = this.on(type, onceHandler);
    },

    emit(type: string, ...evts: any[]) {
      (all[type] || []).slice().forEach((handler: EventHandler) => {
        handler(...evts);
      });
    }
  };
}
