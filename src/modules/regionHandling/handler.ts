import { MessageCallback, MessageResponders, MessageHandler } from '../../lib';
import {
  IAddRegionListenerOptions,
  RegionScope,
  RegionEventHandlingMessage,
  Region,
} from './interface';
import { marshalObject } from '../../lib/marshaling';
import { IAddEventListenerOptions } from '../eventHandling/interface';
import { resolveEventTargetSelector } from '../../lib/util';
import { EventManager } from '../eventHandling/eventManager';

interface EventData {
  clientX: number;
  clientY: number;
  screenX: number;
  screenY: number;
  pageX: number;
  pageY: number;
}

export class RegionHandler extends MessageHandler {
  public declarations: MessageResponders = {
    [RegionEventHandlingMessage.AddEventListener]: this._addEventListener,
    [RegionEventHandlingMessage.RemoveEventListener]: this._removeEventListener,
    [RegionEventHandlingMessage.SetRegion]: this._setRegionAsync,
  };

  private eventManager: EventManager = new EventManager();

  protected createHandler(
    callback: MessageCallback,
    properties: string[],
    // Initial options
    initOptions: IAddRegionListenerOptions,
    id: number,
    ): EventListener {
    return (event) => {
      // Get the current options for this handler
      const handler = this.eventManager.getEventHandler(id);
      const options = handler.options;
      if (options.stopPropagation) {
        event.preventDefault();
      }

      if (options.stopPropagation) {
        event.stopPropagation();
      }
      if (options.stopImmediatePropagation) {
        event.stopImmediatePropagation();
      }
      const region = options.region;
      const eventType = options.eventType;
      if (!region) {
        console.error('"region" was not passed into RegionHandler');
        return;
      }
      if (!(event instanceof MouseEvent)) {
        console.error('Event is not an instance of MouseEvent');
        return;
      }

      let x = event.clientX;
      let y = event.clientY;
      if (region.scope === RegionScope.Document) {
        x = event.pageX;
        y = event.pageY;
      }

      options.wasWithinRegion = options.withinRegion;
      options.withinRegion =
        (x >= region.left && x <= region.left + region.width) &&
        (y >= region.top && y <= region.top + region.height);

      let shouldCallback = options.withinRegion;
      if (eventType === 'mouseenter') {
        shouldCallback = (options.wasWithinRegion === false && options.withinRegion === true);
      } else if (eventType === 'mouseout') {
        shouldCallback = (options.wasWithinRegion === true && options.withinRegion === false);
      }

      if (shouldCallback) {
        const eventData = this._getEventData(event);
        callback(eventData);
      }
    };
  }

  private async _setRegionAsync(
    callback: MessageCallback,
    region: Region,
    id?: number,
  ): Promise<void> {
    this._setRegion(region, id);
  }

  private _setRegion(
    region: Region,
    id?: number,
  ): void {
    const options = {
      region,
    };
    if (id) {
      this._setOptionsById(options, id);
    } else {
      this._setOptionsForAll(options);
    }
  }

  private _setOptionsById(
    options: IAddRegionListenerOptions,
    id: number,
  ): void {
    const handler = this.eventManager.getEventHandler(id);
    if (options.region) {
      handler.options.region = this._newRegion(options.region, handler.options.region);
      // For debugging only
      // this._makevisualdebug(id, options.region);
    }
    if (options.withinRegion) {
      handler.options.withinRegion = options.withinRegion;
    }
  }

  private _newRegion(
    newRegion: Region | undefined,
    oldRegion: Region,
  ): Region | undefined {

    return {
      left: (newRegion && newRegion.left) || oldRegion.left,
      top: (newRegion && newRegion.top) || oldRegion.top,
      width: (newRegion && newRegion.width) || oldRegion.width,
      height: (newRegion && newRegion.height) || oldRegion.height,
      scope: (newRegion && newRegion.scope) || oldRegion.scope,
    };
  }

  private _setOptionsForAll(
    options: IAddRegionListenerOptions,
  ): void {
    const handlers = this.eventManager.registeredEventHandlers;

    const keys = Object.keys(handlers);
    for (let i = 0; i < keys.length; i += 1) {
      const key = parseInt(keys[i], 10);
      this._setOptionsById(options, key);
    }
  }

  private _getEventData(event: MouseEvent): EventData {
    const data: EventData = {
      clientX: event.clientX,
      clientY: event.clientY,
      screenX: event.screenX,
      screenY: event.screenY,
      pageX: event.pageX,
      pageY: event.pageY,
    };

    const marshaledObj = marshalObject(data);
    return marshaledObj;
  }

  private async _addEventListener(
    callback: MessageCallback,
    target: string,
    eventType: string,
    properties: string[],
    options: IAddEventListenerOptions,
  ): Promise<number> {
    const targets = resolveEventTargetSelector(target);
    const newId = this.eventManager.generateEventID();
    const handler: EventListener = this.createHandler(callback, properties, options, newId);

    // For debugging only
    // this._makevisualdebug(newId, options.region);

    return this.eventManager.addEventListener(eventType, handler, options, targets, newId);
  }

  private async _removeEventListener({}: MessageCallback, listenerID: number): Promise<void> {
    this.eventManager.removeEventListener(listenerID);
  }

  // For debugging only
  // Visualizes the region on screen
  private _makevisualdebug(id: number, region: any): void {
    const delid = `debug-region-${id}`;
    let el = document.getElementById(delid);
    if (!el) {
      el = document.createElement('div');
      el.setAttribute('id', delid);
      el.style.setProperty('background', 'rgba(200, 200, 200, 0.3)');
      el.style.setProperty('border', '1px solid black');
      el.style.setProperty('position', 'absolute');
      document.body.append(el);
    }

    el.style.setProperty('left', `${region.left}px`);
    el.style.setProperty('top', `${region.top}px`);
    el.style.setProperty('width', `${region.width}px`);
    el.style.setProperty('height', `${region.height}px`);
  }
}
