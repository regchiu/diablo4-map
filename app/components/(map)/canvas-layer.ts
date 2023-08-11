import leaflet, { Coords, TileLayer, TileLayerOptions } from "leaflet";

type Tile = HTMLCanvasElement & { complete: boolean };

const CanvasLayer = leaflet.TileLayer.extend({
  createCanvas: function (
    tile: Tile,
    coords: Coords,
    done: (err: unknown, tile: Tile) => void
  ) {
    let err: unknown;
    const ctx = tile.getContext("2d")!;

    const { x: width, y: height } = this.getTileSize();
    tile.width = width;
    tile.height = height;

    const img = new Image();
    img.onload = () => {
      try {
        ctx.drawImage(img, 0, 0);
        tile.complete = true;
      } catch (e) {
        err = e;
      } finally {
        done(err, tile);
      }
    };
    const tileZoom = this._getZoomForUrl();
    img.src = isNaN(tileZoom) ? "" : this.getTileUrl(coords);
    img.crossOrigin = "anonymous";
  },
  createTile: function (coords: Coords, done: () => void) {
    const { timeout } = this.options;
    const { z: zoom } = coords;
    const tile = document.createElement("canvas");

    if (timeout) {
      if (zoom !== this._delaysForZoom) {
        this._clearDelaysForZoom();
        this._delaysForZoom = zoom;
      }

      if (!this._delays[zoom]) this._delays[zoom] = [];

      this._delays[zoom].push(
        setTimeout(() => {
          this.createCanvas(tile, coords, done);
        }, timeout)
      );
    } else {
      this.createCanvas(tile, coords, done);
    }
    return tile;
  },
  _clearDelaysForZoom: function () {
    const prevZoom = this._delaysForZoom;
    const delays = this._delays[prevZoom];

    if (!delays) return;

    delays.forEach((delay: number, index: number) => {
      clearTimeout(delay);
      delete delays[index];
    });

    delete this._delays[prevZoom];
  },
}) as new (url: string, options: TileLayerOptions) => TileLayer;

export const createCanvasLayer = function (
  url: string,
  options: TileLayerOptions
) {
  return new CanvasLayer(url, options);
};
