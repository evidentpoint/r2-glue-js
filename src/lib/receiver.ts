import { IMessage, Message, MessageType } from './message';

interface IMessageEvent extends MessageEvent {
  readonly data: IMessage;
}

export type sendMessage = (type: MessageType, name: string, parameters: any[]) => void;

export abstract class Receiver {
  protected constructor(namespace: string) {
    const handler = (event: IMessageEvent) => {
      const request = event.data;

      if (!Message.validate(request) || request.namespace !== namespace) {
        return;
      }

      this.processMessage(request, (type: MessageType, name: string, parameters: any[]) => {
        if (!event.source) {
          return;
        }

        const sourceWindow = <Window>event.source;

        sourceWindow.postMessage(
          new Message(namespace, type, name, parameters, request.correlationId),
          event.origin,
        );
      });
    };
    window.addEventListener('message', handler);

    // This is a temporary solution
    // Allows demo-menu to clean up these listeners to avoid a memory leak
    if (!window.glueEventMessageRemovers) window.glueEventMessageRemovers = [];
    window.glueEventMessageRemovers.push(() => {
      window.removeEventListener('message', handler);
    });
  }

  protected abstract processMessage(message: IMessage, sendMessage: sendMessage): void;
}
