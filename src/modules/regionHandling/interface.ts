import { IAddEventListenerOptions, EventHandlingMessage } from '../eventHandling/interface';

export enum RegionScope {
  Viewport = 'viewport',
  Document = 'document',
}

export type Region = {
  left: number,
  top: number,
  width: number,
  height: number,
  scope?: RegionScope,
};

export interface RegionOffset {
  x?: number;
  y?: number;
}

export interface IAddRegionListenerOptions extends IAddEventListenerOptions {
  region?: Region;
  eventType?: string;
  wasWithinRegion?: boolean;
  withinRegion?: boolean;
  offset?: RegionOffset;
}

export enum RegionEventHandlingMessage {
  AddEventListener = 'ADD_EVENT_LISTENER',
  RemoveEventListener = 'REMOVE_EVENT_LISTENER',
  SetOptions = 'SET_OPTIONS',
}
