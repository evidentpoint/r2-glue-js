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
      if (!event.hasOwnProperty('path')) return;
      // tslint:disable-next-line:no-any
      const path = (<any>event).path;

      let i = 0;
      const length = path.length;
      let anchor: HTMLAnchorElement | null = null;
      // tslint:disable-next-line:no-increment-decrement
      for (i; i < length; i++) {
        if (path[i].tagName === 'a') anchor = path[i];
      }
      if (!anchor) return;

      const href = anchor && anchor.href;
      if (!href)  return;

      event.preventDefault();
      event.stopPropagation();

      if (options.stopImmediatePropagation) {
        event.stopImmediatePropagation();
      }

      const newHref = { href: anchor.href };
      const obj = marshalObject(newHref);
      callback(obj);
    };
  }
}
