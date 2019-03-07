export interface RangeData {
  startOffset: number;
  startContainer: any[];
  endOffset: number;
  endContainer: any[];
}

export function createRangeData(range: Range): RangeData {
  const startContainerPath = getElementPath(range.startContainer);
  const endContainerPath = getElementPath(range.endContainer);

  const rangeData: RangeData = {
    startOffset: range.startOffset,
    startContainer: startContainerPath,
    endOffset: range.endOffset,
    endContainer: endContainerPath,
  };

  return rangeData;
}

export function createRangeFromRangeData(rangeData: RangeData): Range {
  const startSelector = createSelectorFromStringArray(rangeData.startContainer);
  const endSelector = createSelectorFromStringArray(rangeData.endContainer);

  let startContainer: any = document.querySelector(startSelector);
  let endContainer: any = document.querySelector(endSelector);

  if (!startContainer || !endContainer) {
    console.error('Element was not successfully retrieved with selector');

    return new Range();
  }
  const firstStart = rangeData.startContainer[0];
  if (firstStart.includes('@text')) {
    const index = getTextNodeSelectorIndex(firstStart);
    startContainer = getTextNode(startContainer, index);
  }

  const firstEnd = rangeData.endContainer[0];
  if (firstEnd.includes('@text')) {
    const index = getTextNodeSelectorIndex(firstEnd);
    endContainer = getTextNode(endContainer, index);
  }

  return createRange(
    startContainer, rangeData.startOffset,
    endContainer, rangeData.endOffset,
  );
}

export function createSelectorFromStringArray(array: string[]): string {
  let selector: string = '';

  let value = '';
  for (let i = array.length - 1; i >= 0; i -= 1) {
    value = array[i];
    // Ignore custom selectors, such as @window and @document
    if (value.includes('@')) continue;
    if (value.includes('>')) {
      value = value.split('>')[1];
    }

    if (selector.length !== 0) selector += ' ';
    selector += value;
  }

  return selector;
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

function getTextNodeSelectorIndex(selector: string): number {
  let index = 0;
  if (selector.includes('@text:nth-child')) {
    const match = selector.match(/@text:nth-child\((\d*)\)/);
    if (match && match[1]) {
      index = Number.parseInt(match[1], 10) || 0;
    }
  }

  return index;
}

function getTextNode(element: HTMLElement, index: number = 0): Text | undefined {
  const nodes: NodeListOf<ChildNode> = element.childNodes;

  let textNode: Text | undefined;
  let textNodeIndex = 0;
  for (let i = 0; i < nodes.length; i += 1) {
    const node: Node = nodes[i];
    if (node.nodeType === Node.TEXT_NODE) {
      if (textNodeIndex === index) {
        textNode = <Text> node;
        break;
      }
      textNodeIndex += 1;
    }
  }

  return textNode;
}

function getElementPath(element: any, elements?: any[]): any[] {
  let els = elements;
  if (!els) {
    els = [];
  }
  els.push(element);

  const parentEl = element.parentElement;
  // If a parent element exists, run this method again with that parent element
  // Otherwise, return the elements with document and window appended to it
  return parentEl ? getElementPath(parentEl, els) : addDocumentAndWindowToPath(els);
}

function addDocumentAndWindowToPath(elements: any[]): any[] {
  elements.push(document);
  elements.push(window);

  return elements;
}
