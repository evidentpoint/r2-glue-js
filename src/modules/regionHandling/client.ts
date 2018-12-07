import { Client } from '../../lib/client';
import { Region, IAddRegionListenerOptions, RegionEventHandlingMessage } from './interface';

export class RegionHandling extends Client {
  public typeName: string = 'RegionHandling';
  public frameID: number;

  public constructor(targetWindow: Window) {
    super('region-handling', targetWindow);
  }

  public async addEventListener(
    eventType: string,
    region: Region,
    listener: EventListener,
    options: IAddRegionListenerOptions = {},
  ): Promise<number> {
    const properties: string[] = [];
    const target = 'html';

    options.region = region;
    let type = eventType;
    if (eventType === 'mouseenter' || eventType === 'mouseout') {
      type = 'mousemove';
      options.eventType = eventType;
    }

    return this.sendMessage(
      RegionEventHandlingMessage.AddEventListener,
      [target, type, properties, options],
      (event) => {
        listener(event);
      },
    );
  }

  public setOptions(
    options: IAddRegionListenerOptions,
    id?: number,
    ): void {
    this.sendMessage(
      RegionEventHandlingMessage.SetOptions,
      [options, id],
    );
  }

  public removeEventListener(listenerID: number): void {
    this.sendMessage(RegionEventHandlingMessage.RemoveEventListener, [listenerID]);
  }
}
