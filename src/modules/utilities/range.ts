import * as EPUBcfi from 'readium-cfi-js';
import {
  getElementPath,
  getElementFromStringArray,
} from './helpers';

export interface RangeData {
  startOffset: number;
  startContainer: any[];
  endOffset: number;
  endContainer: any[];
  collapsed: boolean;
}

export function createRangeData(range: Range): RangeData {
  const startContainerPath = getElementPath(range.startContainer);
  const endContainerPath = getElementPath(range.endContainer);

  const rangeData: RangeData = {
    startOffset: range.startOffset,
    startContainer: startContainerPath,
    endOffset: range.endOffset,
    endContainer: endContainerPath,
    collapsed: range.collapsed,
  };

  return rangeData;
}

export function createRangeFromRangeData(rangeData: RangeData): Range {
  const startElement = getElementFromStringArray(rangeData.startContainer);
  const endElement = getElementFromStringArray(rangeData.endContainer);

  if (!startElement || !endElement) {
    console.error('Element was not successfully retrieved from rangeData');

    return new Range();
  }

  return createRange(startElement, rangeData.startOffset, endElement, rangeData.endOffset);
}

export function createRange(
  startContainer: Node,
  startOffset: number,
  endContainer: Node,
  endOffset: number,
): Range {
  const range = new Range();

  const position = startContainer.compareDocumentPosition(endContainer);
  let isBackwards = false;
  if (position === 0) {
    isBackwards = startOffset > endOffset;
  }
  if (position === startContainer.DOCUMENT_POSITION_PRECEDING) {
    isBackwards = true;
  }

  const sc = isBackwards ? endContainer : startContainer;
  const so = isBackwards ? endOffset : startOffset;
  const ec = isBackwards ? startContainer : endContainer;
  const eo = isBackwards ? startOffset : endOffset;

  range.setStart(sc, so);
  range.setEnd(ec, eo);

  return range;
}

export function getRangeFromCFI(cfi: string): Range | null {
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
  // Highlight first word of cfi target element
  } else {
    const target = EPUBcfi.Interpreter.getTargetElement(cfi, document);
    const sentence = target[0].wholeText;
    if (!sentence) {
      return null;
    }

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
      const nextChar = sentence[i + 1];
      if (i > targetOffset) {
        finishWord = true;
      }

      if (nextChar === ' ' || nextChar === undefined) {
        if (finishWord && charGroup.length !== 0) {
          charGroup += char;
          startOffset = i - (charGroup.length - 1);
          endOffset = i + 1;
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
