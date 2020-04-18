import type { OutgoingMessages, IncomingMessages } from "@arduz/Connections";

export const sendMessageObservable = new Observable<{ connectionIds: string[]; data: Partial<OutgoingMessages>, reliable?: boolean }>();
export const onMessageObservable = new Observable<{ entity: Entity; data: Partial<IncomingMessages> }>();
export const closeConnectionObservable = new Observable<Connection>();

@Component("Connection")
export class Connection {
  constructor(public readonly connectionId: string, public readonly nick: string) {}

  entityId?: string;
}
