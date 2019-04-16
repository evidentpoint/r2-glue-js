import { IAddEventListenerOptions } from './interface';
import { MessageCallback } from '../../lib';

interface IRegisteredHandler {
  eventType: any;
  callback: any;
  options?: any;
}

export abstract class AbstractEventManager {
  private lastEventID: number = 0;
  public registeredEventHandlers: { [id: number]: IRegisteredHandler } = {};

  public getEventHandler(
    eventID: number,
  ): IRegisteredHandler {
    return this.registeredEventHandlers[eventID];
  }

  public generateEventID(): number {
    return this.lastEventID += 1;
  }

  public addEventListener(
    eventType: string,
    callback: MessageCallback,
    options?: IAddEventListenerOptions,
    resolvedTargets?: EventTarget[],
    customId?: number,
  ): number {
    const id = customId || this.generateEventID();
    this.registeredEventHandlers[id] = {
      eventType,
      callback,
      options,
    };

    return id;
  }

  public removeEventListener(id: number): void {
    delete this.registeredEventHandlers[id];
  }
}
