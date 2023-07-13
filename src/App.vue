<template>
  <div id="map"></div>
</template>

<script setup lang="ts">
import L from 'leaflet'
import 'leaflet-fullscreen'
import 'leaflet/dist/leaflet.css'
import 'leaflet-fullscreen/dist/leaflet.fullscreen.css'
import { onMounted } from 'vue'
import { markers } from './data/markers'
import type { Markers, MarkerName } from './data/markers'
import { regions } from './data/regions'

const MAP_LAT = -158
const MAP_LNG = 158
const southWest = L.latLng(0, MAP_LNG)
const northEast = L.latLng(MAP_LAT, 0)
const bounds = L.latLngBounds(southWest, northEast)

let map: L.Map

const group: Record<MarkerName, L.LayerGroup> = {
  altarOfLilith: L.layerGroup([]),
  worldBoss: L.layerGroup([]),
  dungeon: L.layerGroup([]),
  mysteriousChest: L.layerGroup([]),
  sideQuest: L.layerGroup([]),
  waypoint: L.layerGroup([]),
  stronghold: L.layerGroup([])
}

function onClick(e: L.LeafletMouseEvent) {
  console.log(`${e.latlng.lat}, ${e.latlng.lng}`)
}

function hideAllControl() {
  const hideAllControl = L.control.zoom({ position: 'topright' })
  hideAllControl.onAdd = function () {
    const button = L.DomUtil.create('button')
    button.innerHTML = '隱藏全部'
    L.DomEvent.addListener(button, 'click', function (e: Event) {
      L.DomEvent.stop(e)
      for (const key of Object.keys(group)) {
        if (map.hasLayer(group[key as MarkerName])) {
          map.removeLayer(group[key as MarkerName])
        }
      }
    })
    return button
  }
  return hideAllControl
}

function showAllControl() {
  const showAllControl = L.control.zoom({ position: 'topright' })
  showAllControl.onAdd = function () {
    const button = L.DomUtil.create('button')
    button.innerHTML = '顯示全部'
    L.DomEvent.addListener(button, 'click', function (e: Event) {
      L.DomEvent.stop(e)
      for (const key of Object.keys(group)) {
        if (!map.hasLayer(group[key as MarkerName])) {
          map.addLayer(group[key as MarkerName])
        }
      }
    })
    return button
  }
  return showAllControl
}

onMounted(() => {
  map = L.map('map', {
    maxBounds: bounds,
    minZoom: 3,
    maxZoom: 5,
    zoom: 3,
    crs: L.CRS.Simple,
    center: L.latLng(MAP_LAT / 2, MAP_LNG / 2),
    fullscreenControl: true,
    layers: [...Object.values(group)]
  })

  L.tileLayer(
    import.meta.env.PROD
      ? '/diablo4-map/map-tiles/z{z}x{x}y{y}.webp'
      : '/map-tiles/z{z}x{x}y{y}.webp',
    {
      bounds,
      maxNativeZoom: 5,
      tileSize: 512
    }
  ).addTo(map)

  for (const key of Object.keys(markers)) {
    for (const coord of markers[key as keyof Markers].coordinates) {
      group[key as MarkerName].addLayer(
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
        }).bindTooltip(
          coord.name +
            (coord.reward ? ` / ${coord.reward}` : '') +
            (coord.job ? ` / (${coord.job})` : '')
        )
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
      .on('mouseover', function (e: L.LayerEvent) {
        e.target.setStyle({
          color: 'white'
        })
        e.target.bringToFront()
      })
      .on('mouseout', function (e: L.LayerEvent) {
        e.target.setStyle({
          color: '#988f7b'
        })
      })
      .addTo(map)
  }

  hideAllControl().addTo(map)
  showAllControl().addTo(map)
  const layerControl = L.control.layers({}, {}).addTo(map)
  for (const key of Object.keys(group)) {
    layerControl.addOverlay(
      group[key as MarkerName],
      `<img class="marker-category-icon" src="${
        markers[key as MarkerName].icon.url
      }" /> <span class="marker-category-text">${
        markers[key as MarkerName].text
      }</span>`
    )
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

.marker-category-icon {
  width: 24px;
  height: 24px;
  vertical-align: middle;
}

.marker-category-text {
  vertical-align: middle;
}
</style>
