import { AbstractEventManager } from './abstractEventManager';

export class EventManager extends AbstractEventManager {
  private registeredEventRemovers: { [id: number]: Function[] } = {};

  public addEventListener(
    type: string,
    callback: any,
    options?: any,
    resolvedTargets?: EventTarget[],
  ): number {
    if (!(resolvedTargets && resolvedTargets.length)) resolvedTargets = [window];

    const listenerRemovers = resolvedTargets.map((resolvedTarget: EventTarget) => {
      resolvedTarget.addEventListener(type, callback, options);

      return () => {
        resolvedTarget.removeEventListener(type, callback, options);
      };
    });

    const id = super.addEventListener(type, callback, options);
    this.registeredEventRemovers[id] = listenerRemovers;

    return id;
  }

  public removeEventListener(id: number): void {
    super.removeEventListener(id);

    const eventRemovers = this.registeredEventRemovers[id] || [];
    eventRemovers.forEach((remove) => {
      remove();
    });

    delete this.registeredEventRemovers[id];
  }
}
