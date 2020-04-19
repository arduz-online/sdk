import { Connection, sendMessageObservable } from "../Components/Connection";
import type { OutgoingMessages } from "@arduz/Connections";
import { WorldPosition } from "../Components/WorldPosition";
import { Body, DEAD_HEAD, DEAD_BODY } from "../Components/Body";
import { MapData } from "../Components/MapData";
import { HeadingComponent } from "../Components/Heading";
import { Fx } from "../Components/Fx";
import { CharStatus } from "../Components/CharStatus";

export class GameMapSystem implements ISystem {
  private mapEntities!: ComponentGroup;
  mapEntitiesWithEffect!: ComponentGroup;
  private connectedEntities!: ComponentGroup;

  constructor() {}

  private addEntityWithFx = (entity: IEntity) => {
    const position = entity.getComponent(WorldPosition);
    const fx = entity.getComponent(Fx);
    this.sendToArea(position.x, position.y, [
      { Fx: { entityId: entity.uuid, fx: fx.fx, loops: fx.loops } },
    ]);
  };

  private removeEntityWithFx = (entity: IEntity) => {
    const position = entity.getComponent(WorldPosition);
    this.sendToArea(position.x, position.y, [
      { Fx: { entityId: entity.uuid, fx: 0, loops: 0 } },
    ]);
  };

  activate(engine: Engine) {
    this.mapEntities = engine.getComponentGroup(WorldPosition);
    this.mapEntitiesWithEffect = engine.getComponentGroup(
      {
        onAddEntity: this.addEntityWithFx,
        onRemoveEntity: this.removeEntityWithFx,
      },
      WorldPosition,
      Fx
    );
    this.connectedEntities = engine.getComponentGroup(
      WorldPosition,
      Connection
    );

    log("GameMapSystem started");
  }

  update() {
    for (let { entity, position } of this.entities()) {
      const data = this.presentEntity(entity, false);

      if (position.outgoingAreaButMeMessages.length) {
        const conn = entity.getComponentOrNull(Connection);
        if (conn) {
          this.sendToAreaBut(
            position.x,
            position.y,
            position.outgoingAreaButMeMessages,
            conn.connectionId
          );
        } else {
          this.sendToArea(
            position.x,
            position.y,
            position.outgoingAreaButMeMessages
          );
        }
        position.outgoingAreaButMeMessages.length = 0;
      }

      if (data) {
        this.sendToArea(position.x, position.y, [
          data,
          ...position.outgoingAreaMessages,
        ]);
      } else if (position.outgoingAreaMessages.length) {
        this.sendToArea(position.x, position.y, position.outgoingAreaMessages);
      }

      position.outgoingAreaMessages.length = 0;
    }
  }

  async load(mapId: string) {
    const newMapData = new MapData(mapId);

    await newMapData.load();

    engine.rootEntity.addComponentOrReplace(newMapData);
  }

  private *entities() {
    for (let entity of this.mapEntities.entities) {
      yield {
        entity,
        position: entity.getComponent(WorldPosition),
      };
    }
  }

  private presentEntity(
    entity: IEntity,
    force: true
  ): Partial<OutgoingMessages>;
  private presentEntity(
    entity: IEntity,
    force: false
  ): Partial<OutgoingMessages> | null;
  private presentEntity(
    entity: IEntity,
    force = false
  ): Partial<OutgoingMessages> | null {
    let hasContent = false;

    const position = entity.getComponent(WorldPosition);
    const body = entity.getComponentOrNull(Body);
    const heading = entity.getComponentOrNull(HeadingComponent);
    const fx = entity.getComponentOrNull(Fx);
    const status = entity.getComponentOrNull(CharStatus);

    const ret: Partial<OutgoingMessages> = {};

    if (body && (force || body.dirty)) {
      if (body.dead) {
        ret.SetBody = {
          entityId: entity.uuid,
          body: DEAD_BODY,
          color: body.color,
          dead: body.dead,
          head: DEAD_HEAD,
          helmet: 0,
          isLeftHandWeapon: body.isLeftHandWeapon,
          isRightHandWeapon: body.isRightHandWeapon,
          leftHand: 0,
          nick: body.nick,
          rightHand: 0,
          speed: body.speed * 1.5,
        };
      } else {
        ret.SetBody = {
          entityId: entity.uuid,
          body: body.body,
          color: body.color,
          dead: body.dead,
          head: body.head,
          helmet: body.helmet,
          isLeftHandWeapon: body.isLeftHandWeapon,
          isRightHandWeapon: body.isRightHandWeapon,
          leftHand: body.leftHand,
          nick: body.nick,
          rightHand: body.rightHand,
          speed: body.speed,
        };
      }
      if (!force) body.dirty = false;
      hasContent = true;
    }

    if (position && (force || position.dirty)) {
      ret.UpdatePosition = {
        entityId: entity.uuid,
        x: position.x,
        y: position.y,
      };
      if (!force) position.dirty = false;
      hasContent = true;
    }

    if (heading && (force || heading.dirty)) {
      ret.SetHeading = { entityId: entity.uuid, heading: heading.heading };
      if (!force) heading.dirty = false;
      hasContent = true;
    }

    if (fx && (force || fx.dirty)) {
      ret.Fx = { entityId: entity.uuid, fx: fx.fx, loops: fx.loops };
      if (!force) fx.dirty = false;
      hasContent = true;
    }

    if (status && (force || status.dirty)) {
      ret.Status = {
        entityId: entity.uuid,
        paralyzed: status.paralyzed,
        invisible: status.invisible,
        dumb: status.dumb,
        blind: status.blind,
      };
      if (!force) status.dirty = false;
      hasContent = true;
    }

    return hasContent ? ret : null;
  }

  onAddEntity(entity: Entity) {
    const position = entity.getComponentOrCreate(WorldPosition);
    const map = engine.rootEntity.getComponentOrNull(MapData);

    if (!map) {
      error("Map data not present in rootEntity");
      return;
    }

    const { x, y } = position;
    const connection = entity.getComponentOrNull(Connection);

    if (connection) {
      const { connectionId } = connection;
      // tell the user which character they control
      sendMessageObservable.notifyObservers({
        connectionIds: [connectionId],
        data: {
          LoadMap: { map: map.mapId },
        },
      });

      // send all the entities in the map to the player
      for (var p of this.mapEntities.entities) {
        sendMessageObservable.notifyObservers({
          connectionIds: [connectionId],
          data: this.presentEntity(p, true),
        });
      }

      // send the entity to all the connections but them, they had this already
      this.sendToAreaBut(
        x,
        y,
        [this.presentEntity(entity, true)],
        connectionId
      );

      // tell the user which character they control
      sendMessageObservable.notifyObservers({
        connectionIds: [connectionId],
        data: {
          SetEntityId: { entityId: entity.uuid },
        },
      });
    } else {
      // send the entity to all the connections
      this.sendToArea(x, y, [this.presentEntity(entity, true)]);
    }
  }

  onRemoveEntity(entity: Entity) {
    const position = entity.getComponentOrNull(WorldPosition);

    if (position) {
      const { x, y } = position;
      this.sendToArea(x, y, [{ RemoveEntity: { entityId: entity.uuid } }]);
    } else {
      this.sendToAll([{ RemoveEntity: { entityId: entity.uuid } }]);
    }
  }

  private sendToAreaBut(
    x: number,
    y: number,
    dataChunks: Array<Partial<OutgoingMessages>>,
    connectionId: string,
    reliable = true
  ) {
    const connectionIds: string[] = [];

    for (let e of this.connectedEntities.entities) {
      const conn = e.getComponent(Connection);

      // TODO area validations

      if (conn.connectionId !== connectionId) {
        connectionIds.push(conn.connectionId);
      }
    }

    for (let data of dataChunks) {
      sendMessageObservable.notifyObservers({ connectionIds, data, reliable });
    }
  }

  private sendToArea(
    x: number,
    y: number,
    dataChunks: Array<Partial<OutgoingMessages>>,
    reliable = true
  ) {
    const connectionIds: string[] = [];

    for (let e of this.connectedEntities.entities) {
      // TODO area validations
      connectionIds.push(e.getComponent(Connection).connectionId);
    }

    for (let data of dataChunks) {
      sendMessageObservable.notifyObservers({ connectionIds, data, reliable });
    }
  }

  private sendToAll(
    dataChunks: Array<Partial<OutgoingMessages>>,
    reliable = true
  ) {
    const connectionIds: string[] = [];

    for (let e of this.connectedEntities.entities) {
      connectionIds.push(e.getComponent(Connection).connectionId);
    }

    for (let data of dataChunks) {
      sendMessageObservable.notifyObservers({ connectionIds, data, reliable });
    }
  }
}
