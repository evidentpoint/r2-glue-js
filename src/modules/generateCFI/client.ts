import { Client } from '../../lib/client';
import { IAddEventListenerOptions } from '../eventHandling/interface';
import { CFIEventHandlingMessage } from './interface';
import { RangeData } from '../utilities/range';

export class GenerateCFI extends Client {
  public typeName: string = 'GenerateCFI';

  public constructor(targetWindow: Window) {
    super('generateCFI', targetWindow);
  }

  public async fromRangeData(
    rangeData: RangeData,
    listener: EventListener,
    options?: IAddEventListenerOptions,
  ): Promise<string> {

    return this.sendMessage(
      CFIEventHandlingMessage.FromRange,
      [rangeData, options],
      (event) => {
        listener(event);
      },
    );
  }
}
