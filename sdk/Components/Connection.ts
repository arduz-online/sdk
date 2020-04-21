import type { OutgoingMessages, IncomingMessages } from "@arduz/Connections";

export const sendMessageObservable = new Observable<{ connectionIds: string[]; data: Partial<OutgoingMessages>, reliable?: boolean }>();
export const onMessageObservable = new Observable<{ entity: Entity; data: Partial<IncomingMessages> }>();

// Add a message to this channel to kick a connection
export const closeConnectionObservable = new Observable<Connection>();

// On Connection removed, triggered after a conection is closed both from our side
// and from the network side
export const onDisconnection = new Observable<{ entity: IEntity, connection: Connection }>();

@Component("Connection")
export class Connection {
  constructor(public readonly connectionId: string, public readonly nick: string) {}

  entityId?: string;
}
