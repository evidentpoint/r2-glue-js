import { Client } from '../../lib/client';
import { EventHandlingMessage, IHighlightOptions, IHighlightDeletionOptions } from './interface';
import { RangeData } from '../utilities/rangeData';

export class Highlighting extends Client {
  public typeName: string = 'Highlighting';

  public constructor(targetWindow: Window) {
    super('highlighting', targetWindow);
  }

  public async createHighlight(
    rangeDataOrCFI: RangeData | string,
    options?: IHighlightOptions,
  ): Promise<void> {

    return this.sendMessage(
      EventHandlingMessage.CreateHighlight,
      [rangeDataOrCFI, options],
    );
  }

  public async deleteHighlight(
    rangeDataOrCFI: RangeData | string,
    options?: IHighlightDeletionOptions,
  ): Promise<void> {

    return this.sendMessage(
      EventHandlingMessage.DeleteHighlight,
      [rangeDataOrCFI, options],
    );
  }
}
