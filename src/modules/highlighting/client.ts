import { Client } from '../../lib/client';
import { EventHandlingMessage, IHighlightOptions } from './interface';
import { RangeData } from '../utilities/rangeData';

export class Highlighting extends Client {
  public typeName: string = 'Highlighting';

  public constructor(targetWindow: Window) {
    super('highlighting', targetWindow);
  }

  public async createHighlight(
    rangeData: RangeData,
    listener?: EventListener,
    options?: IHighlightOptions,
  ): Promise<void> {
    const cb = listener ? (event: any) => {
      listener(event);
    } : undefined;

    return this.sendMessage(
      EventHandlingMessage.CreateHighlight,
      [rangeData, options],
      cb,
    );
  }
}
