<template>
  <div id="map"></div>
</template>

<script setup lang="ts">
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { onMounted } from 'vue'
import { markers } from './data/markers'
import type { Markers } from './data/markers'
import { regions } from './data/regions'

const MAP_LAT = -158
const MAP_LNG = 158
const southWest = L.latLng(0, MAP_LNG)
const northEast = L.latLng(MAP_LAT, 0)
const bounds = L.latLngBounds(southWest, northEast)

let map: L.Map

function onClick(e: L.LeafletMouseEvent) {
  console.log(`${e.latlng.lat}, ${e.latlng.lng}`)
}

onMounted(() => {
  map = L.map('map', {
    maxBounds: bounds,
    minZoom: 3,
    maxZoom: 5,
    zoom: 3,
    crs: L.CRS.Simple,
    center: L.latLng(MAP_LAT / 2, MAP_LNG / 2)
  })

  L.tileLayer('/map-tiles/z{z}x{x}y{y}.webp', {
    bounds,
    maxNativeZoom: 5,
    tileSize: 512
  }).addTo(map)

  for (const key of Object.keys(markers)) {
    for (const coord of markers[key as keyof Markers].coordinates) {
      L.marker([coord.lat, coord.lng], {
        icon: L.icon({
          iconUrl: markers[key as keyof Markers].icon.url,
          iconSize: [
            markers[key as keyof Markers].icon.width,
            markers[key as keyof Markers].icon.height
          ],
          iconAnchor: [
            markers[key as keyof Markers].icon.width / 2,
            markers[key as keyof Markers].icon.height / 2
          ]
        })
      })
        .addTo(map)
        .bindTooltip(
          coord.name +
            (coord.reward ? ` / ${coord.reward}` : '') +
            (coord.job ? ` / (${coord.job})` : '')
        )
    }
  }

  for (const region of regions) {
    L.polygon(region.coordinates, { color: '#988f7b' })
      .bindTooltip(region.name, {
        permanent: true,
        direction: 'center',
        className: 'region-label'
      })
      .on('mouseover', function (this: any) {
        this.setStyle({
          color: 'white'
        })
      })
      .on('mouseout', function (this: any) {
        this.setStyle({
          color: '#988f7b'
        })
      })
      .addTo(map)
  }

  map.on('click', onClick)
})
</script>

<style lang="scss">
#map {
  background-color: #101010;
  width: 100vw;
  height: 100vh;
}

.region-label {
  background: transparent;
  border: 0;
  color: white;
  text-shadow: -1px 0 black, 0 1px black, 1px 0 black, 0 -1px black;
  box-shadow: none;
  font-weight: bold;
}
</style>
