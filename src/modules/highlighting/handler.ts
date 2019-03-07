import { MessageCallback, MessageHandler, MessageResponders } from '../../lib';
import * as EPUBcfi from 'readium-cfi-js';
import { EventHandlingMessage, IHighlightOptions, IHighlightDeletionOptions } from './interface';
import {
  RangeData,
  createRangeFromRangeData,
  createSelectorFromStringArray,
  createRange,
} from '../utilities/rangeData';

export class Highlighter extends MessageHandler {
  public declarations: MessageResponders = {
    [EventHandlingMessage.CreateHighlight]: this._createHighlight,
    [EventHandlingMessage.DeleteHighlight]: this._deleteHighlight,
  };

  private async _createHighlight(
    callback: MessageCallback,
    rangeData: RangeData | string,
    options: IHighlightOptions,
  ): Promise<number> {
    const cfi = `epubcfi(/99!${rangeData})`;

    let range;
    if (typeof(rangeData) === 'string') {
      range = this._getRangeFromCFI(cfi);
    } else {
      range = createRangeFromRangeData(rangeData);
    }

    if (!range) {
      return -1;
    }

    let highlightsContainer = document.getElementById('highlights');
    if (!highlightsContainer) highlightsContainer = this._createHighlightsContainer();
    const clientRects = range.getClientRects();
    const id = this._createHighlightId(rangeData);

    const el = document.getElementById(id);
    if (el) {
      return -1;
    }

    const highlight = this._createHighlightDivs(clientRects, id);
    highlightsContainer.append(highlight);

    return 1;
  }

  private async _deleteHighlight(
    callback: MessageCallback,
    rangeData: RangeData | string,
    options: IHighlightDeletionOptions,
  ): Promise<number> {
    const id = this._createHighlightId(rangeData);
    const el = document.getElementById(id);
    if (!el) {
      return -1;
    }

    // Get the child div that's responsible for visibly showing a highlight
    const div = el.getElementsByTagName('div')[0];
    let timeout = 0;
    if (options && options.fadeOut) {
      div.style.setProperty('opacity', '1');
      div.style.setProperty('transition', `opacity ${options.fadeOut}ms ease 0s`);
      timeout = options.fadeOut || 0;
    }

    if (timeout) {
      div.style.setProperty('opacity', '0');
      div.addEventListener('transitionend', () => {
        el.remove();
      });
    } else {
      el.remove();
    }

    return 1;
  }

  private _createHighlightId(rangeDataOrCFI: RangeData | string): string {
    let id = '';
    // Use the CFI as-is, if it's present
    if (typeof(rangeDataOrCFI) === 'string') {
      id = rangeDataOrCFI;
    } else {
      const startSelector = createSelectorFromStringArray(rangeDataOrCFI.startContainer);
      const endSelector = createSelectorFromStringArray(rangeDataOrCFI.endContainer);
      id = startSelector + rangeDataOrCFI.startOffset + endSelector + rangeDataOrCFI.endOffset;
      id = id.replace(/ /g, '');
    }

    return `highlight-${id}`;
  }

  private _createHighlightsContainer(): HTMLElement {
    const div = document.createElement('div');
    div.setAttribute('id', 'highlights');
    div.style.setProperty('pointer-events', 'none');
    document.body.append(div);

    return div;
  }

  private _createHighlightDivs(
    clientRects: ClientRectList | DOMRectList,
    id: string,
  ): HTMLDivElement {
    const divElements: HTMLDivElement[] = [];
    const container: HTMLDivElement = document.createElement('div');
    container.setAttribute('class', 'highlight');
    container.setAttribute('id', id);

    for (let i = 0; i < clientRects.length; i += 1) {
      const clientRect = clientRects[i];
      const divEl = this._createHighlightDiv(clientRect);
      divElements.push(divEl);
    }

    for (const el of divElements) {
      container.append(el);
    }
    return container;
  }

  private _createHighlightDiv(
    clientRect: ClientRect | DOMRect,
  ): HTMLDivElement {
    const docRect = document.body.getBoundingClientRect();
    const highlight = document.createElement('div');
    highlight.style.setProperty('position', 'absolute');
    highlight.style.setProperty('background', 'rgba(220, 255, 15, 0.40)');
    highlight.style.setProperty('width', `${clientRect.width}px`);
    highlight.style.setProperty('height', `${clientRect.height}px`);
    highlight.style.setProperty('left', `${clientRect.left - docRect.left}px`);
    highlight.style.setProperty('top', `${clientRect.top - docRect.top}px`);
    highlight.style.setProperty('opacity', '1');

    return highlight;
  }

  private _getRangeFromCFI(cfi: string): Range | null {
    let range;
    // Highlight ranage
    if (EPUBcfi.Interpreter.isRangeCfi(cfi)) {
      const target = EPUBcfi.Interpreter.getRangeTargetElements(cfi, document);
      range = createRange(
        target.startElement,
        target.startOffset || 0,
        target.endElement,
        target.endOffset || 0,
      );
    // Highlight next word of cfi
    } else {
      const target = EPUBcfi.Interpreter.getTargetElement(cfi, document);
      const sentence = target[0].wholeText;
      // Get offset
      const match = cfi.match(/:(\d*)/);
      const targetOffset = match ? Number.parseInt(match[1], 10) : 0;
      let startOffset = targetOffset === 0 ? 0 : -1;
      let endOffset = -1;

      // Find first word after offset
      let charGroup = '';
      let finishWord = false;
      for (let i = 0; i < sentence.length; i += 1) {
        const char = sentence[i];
        if (i > targetOffset) {
          finishWord = true;
        }

        if (char === ' ') {
          if (finishWord && charGroup.length !== 0) {
            startOffset = i - charGroup.length;
            endOffset = i;
            break;
          }
          charGroup = '';
        } else {
          charGroup += char;
        }
      }

      range = createRange(
        target[0],
        startOffset,
        target[0],
        endOffset,
      );
    }

    return range || null;
  }
}
