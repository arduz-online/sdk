export class MapBlock {
  blocked: number = 0;
}

@Component("mapData")
export class MapData {
  width: number = 6 * 4;
  height: number = 4 * 4;
  blocks: MapBlock[][] = [];

  constructor(public mapId: string) {
    if (!mapId) {
      throw new Error("Cannot create a MapData without a mapId");
    }
  }

  async load() {
    // this.shaHash = map.getHash();
    this.blocks = [];
    // this.width = map.getWidth();
    // // this.height = map.getHeight();
    for (var x = 0; x < this.width; x++) {
      var row: MapBlock[] = [];
      this.blocks.push(row);
      for (var y = 0; y < this.height; y++) {
        const block = new MapBlock();
        block.blocked = 0; // 1 | 2 | 4 | 8; // block all directions
        row.push(block);
      }
    }
    // const tiles = map.getTilesList();
    // for (let i = 0; i < tiles.length; i++) {
    //   const tile = tiles[i];
    //   const block = this.blocks[tile.getX()][tile.getY()];
    //   block.blocked = tile.getBlocked();
    // }
  }

  isWalkableTile(x: number, y: number): boolean {
    const block = this.getBlock(x, y);
    if (block) {
      if (block.blocked === 0) {
        return true;
      }
    }
    return false;
  }

  getBlock(x: number, y: number): MapBlock | null {
    if (!this.blocks[x]) return null;
    if (!this.blocks[x][y]) return null;
    return this.blocks[x][y];
  }

  *findWalkableTile() {
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        if (this.isWalkableTile(x, y)) {
          yield { x, y };
        }
      }
    }
  }

  *findReverseWalkableTile() {
    for (let x = this.width; x >= 0; x--) {
      for (let y = this.height; y >= 0; y--) {
        if (this.isWalkableTile(x, y)) {
          yield { x, y };
        }
      }
    }
  }
}
