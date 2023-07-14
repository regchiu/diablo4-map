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
import { locales } from './i18n'
import { useI18n } from 'vue-i18n'

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

const { locale, t } = useI18n()

function hideAllControl() {
  const hideAllControl = L.control.zoom({ position: 'topright' })
  hideAllControl.onAdd = function () {
    const button = L.DomUtil.create('button')
    button.innerHTML = t('hideAll')
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
    button.innerHTML = t('showAll')
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

function closeList() {
  const suggestions = document.getElementById('suggestions')
  if (suggestions?.parentNode) {
    suggestions.parentNode.removeChild(suggestions)
  }
}

function searchControl() {
  const searchControl = L.control.zoom({ position: 'topleft' })
  searchControl.onAdd = function () {
    const input = L.DomUtil.create('input')
    input.placeholder = t('searchRegions')
    const div = L.DomUtil.create('div')
    div.appendChild(input)
    L.DomEvent.addListener(input, 'input', function (e: Event) {
      closeList()
      const value = (e as InputEvent).data
      if (!value) {
        return
      }
      const suggestions = L.DomUtil.create('div')
      suggestions.setAttribute('id', 'suggestions')
      suggestions.setAttribute('class', 'autocomplete-items')
      div.appendChild(suggestions)
      for (let i = 0; i < regions.length; i++) {
        if (
          t(regions[i].name).slice(0, value.length).toUpperCase() ===
          value.toUpperCase()
        ) {
          const suggestion = L.DomUtil.create('div')
          suggestion.innerHTML = `<strong>${t(regions[i].name).slice(
            0,
            value.length
          )}</strong>`
          suggestion.innerHTML += t(regions[i].name).slice(value.length)
          suggestion.innerHTML += `<input type="hidden" value="${t(
            regions[i].name
          )}">`
          suggestion.addEventListener('click', function () {
            input.value = suggestion.getElementsByTagName('input')[0].value
            map.setView(regions[i].coordinates[0], 5)
            closeList()
          })
          suggestions.appendChild(suggestion)
        }
      }
    })
    return div
  }
  return searchControl
}

function layerControl() {
  const layerControl = L.control.layers({}, {})
  for (const key of Object.keys(group)) {
    layerControl.addOverlay(
      group[key as MarkerName],
      `<img class="marker-category-icon" src="${
        markers[key as MarkerName].icon.url
      }" /> <span class="marker-category-text">${t(
        markers[key as MarkerName].text
      )}</span>`
    )
  }
  return layerControl
}

function localeControl() {
  const localeControl = L.control.zoom({ position: 'topright' })
  localeControl.onAdd = function () {
    const select = L.DomUtil.create('select')
    for (const locale of locales) {
      const option = L.DomUtil.create('option')
      option.text = locale.label
      option.value = locale.value
      select.add(option)
    }
    select.value = locale.value

    L.DomEvent.addListener(select, 'input', function (e: Event) {
      locale.value = (e.target as HTMLSelectElement).value

      map.stop()
      map.remove()
      initMap()
    })

    return select
  }
  return localeControl
}

function initMap() {
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
          t(coord.name) +
            (coord.reward ? ` / ${t(coord.reward)}` : '') +
            (coord.job ? ` / (${t(coord.job)})` : '')
        )
      )
    }
  }

  for (const region of regions) {
    L.polygon(region.coordinates, { color: '#988f7b' })
      .bindTooltip(t(region.name), {
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

  searchControl().addTo(map)
  localeControl().addTo(map)
  hideAllControl().addTo(map)
  showAllControl().addTo(map)
  layerControl().addTo(map)
}

onMounted(() => {
  initMap()
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

.autocomplete-items div {
  padding: 10px;
  cursor: pointer;
  background-color: #fff;
  border-bottom: 1px solid #d4d4d4;
}

.autocomplete-items div:hover {
  background-color: #e9e9e9;
}

.autocomplete-active {
  background-color: dodgerblue !important;
  color: #fff;
}
</style>
