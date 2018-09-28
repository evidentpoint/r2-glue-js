import { EventManager } from '../../lib/eventManager';
import { KeyHandlingMessage, IAddKeyListenerOptions, KeyEventType } from './interface';
import { marshalEvent } from '../../lib/marshaling';
import {
  MessageCallback,
  MessageHandler,
  MessageResponders,
} from '../../lib';

interface IRegisteredKeyHandler {
  eventType: KeyEventType;
  callback: MessageCallback;
  options?: IAddKeyListenerOptions;
}

const KEYBOARD_EVENT_PROPERTIES = [
  'key',
  'code',
  'location',
  'ctrlKey',
  'shiftKey',
  'altKey',
  'metaKey',
  'isComposing',
];

export class KeyHandler extends MessageHandler {
  public declarations: MessageResponders = {
    [KeyHandlingMessage.AddKeyEventListener]: this.addEventListener,
    [KeyHandlingMessage.RemoveKeyEventListener]: this.removeEventListener,
  };

  private registeredKeyHandlers: { [key: number]: IRegisteredKeyHandler } = {};
  private registeredKeyCodes: { [key: string]: number[] } = {};
  private lastUsedID: number = 0;
  private eventManager: EventManager = new EventManager();

  constructor() {
    super();
    const keyboardEventHandler = this.createEventHandler();
    this.eventManager.addEventListener('keydown', keyboardEventHandler, true);
    this.eventManager.addEventListener('keypress', keyboardEventHandler, true);
    this.eventManager.addEventListener('keyup', keyboardEventHandler, true);
  }

  private createEventHandler(): Function {
    return (event: KeyboardEvent) => {
      if (event.defaultPrevented) {
        // Skip if event is already handled
        return;
      }

      const matchingKeyCodeSet = this.registeredKeyCodes[event.key] || [];
      matchingKeyCodeSet.forEach((listenerID) => {
        const handlerInfo = this.registeredKeyHandlers[listenerID] || {};
        if (handlerInfo.eventType !== event.type) {
          return;
        }

        if (handlerInfo.options && handlerInfo.options.preventDefault) {
          event.preventDefault();
        }

        handlerInfo.callback(marshalEvent(event, KEYBOARD_EVENT_PROPERTIES));
      });
    };
  }

  private async addEventListener(
    callback: MessageCallback,
    target: string,
    eventType: KeyEventType,
    keyCode: string,
    options?: IAddKeyListenerOptions,
  ): Promise<number> {
    this.lastUsedID = this.lastUsedID + 1;
    const id = this.lastUsedID;
    if (!this.registeredKeyHandlers[id]) {
      this.registeredKeyHandlers[id] = { eventType, callback, options };
    }
    if (!this.registeredKeyCodes[keyCode]) {
      this.registeredKeyCodes[keyCode] = [];
    }
    this.registeredKeyCodes[keyCode].push(id);

    return this.lastUsedID;
  }

  private async removeEventListener({}: MessageCallback, listenerID: number): Promise<void> {
    delete this.registeredKeyHandlers[listenerID];

    const obj = this.registeredKeyCodes;
    for (const key of Object.keys(obj)) {
      const index = obj[key].indexOf(listenerID);
      if (index >= 0) {
        obj[key].splice(index, 1);
        break;
      }
    }
  }
}
