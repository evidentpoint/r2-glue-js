interface IRegisteredHandler {
  eventType: any;
  callback: any;
  options?: any;
}

export abstract class AbstractEventManager {
  private lastEventID: number = 0;
  private registeredEventHandlers: { [id: number]: IRegisteredHandler } = {};

  public getEventHandler(
    eventID: number,
  ): IRegisteredHandler {
    return this.registeredEventHandlers[eventID];
  }

  public generateEventID(): number {
    return this.lastEventID += 1;
  }

  public addEventListener(
    type: string,
    callback: any,
    options?: any,
  ): number {
    const id = this.generateEventID();
    this.registeredEventHandlers[id] = {
      eventType: type,
      callback: callback,
      options: options,
    };

    return id;
  }

  public removeEventListener(id: number): void {
    delete this.registeredEventHandlers[id];
  }
}
