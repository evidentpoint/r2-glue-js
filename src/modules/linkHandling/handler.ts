import { MessageHandler, MessageResponders, MessageCallback } from '../../lib';
import { EventManager } from '../../lib/eventManager';
import { EventHandlingMessage, IAddEventListenerOptions } from './interface';
import { marshalEvent, marshalObject } from '../../lib/marshaling';
import { resolveEventTargetSelector } from '../../lib/util';
import { EventHandler } from '../eventHandling/handler';

export class LinkHandler extends EventHandler {

  protected createHandler(
    callback: MessageCallback,
    properties: string[],
    options: IAddEventListenerOptions,
    ): EventListener {
    return (event) => {
      const href = event.target && event.target.href;
      if (!href)  return;

      event.preventDefault();
      event.stopPropagation();

      if (options.stopImmediatePropagation) {
        event.stopImmediatePropagation();
      }

      // callback(marshalEvent(event, properties));

      // TODO: Figure out how marshalEvents works, and maybe use that instead
      const href = { href: event.target && event.target.href };
      const obj = marshalObject(href);
      callback(obj);
    };
  }
}
