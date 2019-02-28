import { MessageCallback } from '../../lib';
import { IAddEventListenerOptions } from '../eventHandling/interface';
import { RangeData, createRangeData } from '../utilities/rangeData';
import { marshalObject } from '../../lib/marshaling';
import { EventHandler } from '../eventHandling/handler';

export class SelectionHandler extends EventHandler {

  protected createHandler(
    callback: MessageCallback,
    properties: string[],
    options: IAddEventListenerOptions,
    ): EventListener {
    return (event) => {
      event.preventDefault();

      if (options.stopPropagation) {
        event.stopPropagation();
      }
      if (options.stopImmediatePropagation) {
        event.stopImmediatePropagation();
      }

      const selection = window.getSelection();
      const text = selection.toString();

      const range = selection.getRangeAt(0);
      selection.removeAllRanges();
      selection.addRange(range);

      const rangeData: RangeData = createRangeData(range);

      const obj = { text, rangeData };
      const ret = marshalObject(obj);

      callback(ret);
    };
  }
}
