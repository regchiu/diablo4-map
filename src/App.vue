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
import { SUPPORT_LOCALES } from './i18n'
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
    input.placeholder = t('searchMarkers')
    const search = L.DomUtil.create('div')
    search.className = 'search-box__input'
    search.appendChild(input)
    const icon = L.DomUtil.create('i')
    icon.className = 'search-box__icon'
    const searchBox = L.DomUtil.create('div')
    L.DomEvent.addListener(icon, 'click', function () {
      searchBox.classList.toggle('active')
    })
    searchBox.className = 'search-box'
    searchBox.appendChild(search)
    searchBox.appendChild(icon)
    const container = L.DomUtil.create('div')
    container.classList.add('leaflet-bar')
    container.appendChild(searchBox)
    L.DomEvent.addListener(input, 'input', function (e: Event) {
      closeList()
      const value = (e.target as HTMLInputElement).value
      if (!value) {
        return
      }
      const suggestions = L.DomUtil.create('div')
      suggestions.setAttribute('id', 'suggestions')
      suggestions.setAttribute('class', 'autocomplete-items')
      container.appendChild(suggestions)
      const coordinates = Object.values(markers).flatMap(
        (marker) => marker.coordinates
      )
      for (let i = 0; i < coordinates.length; i++) {
        let compoundName = t(coordinates[i].name)
        if (coordinates[i].reward) {
          compoundName += ` / ${t(coordinates[i].reward || '')}`
        }
        if (
          compoundName.slice(0, value.length).toUpperCase() ===
          value.slice(0).toUpperCase()
        ) {
          const suggestion = L.DomUtil.create('div')
          suggestion.innerHTML = `<strong>${compoundName.slice(
            0,
            value.length
          )}</strong>`
          suggestion.innerHTML += compoundName.slice(value.length)
          suggestion.innerHTML += `<input type="hidden" value="${compoundName}">`
          suggestion.addEventListener('click', function () {
            input.value = suggestion.getElementsByTagName('input')[0].value
            map.setView([coordinates[i].lat, coordinates[i].lng], 5)
            closeList()
          })
          suggestions.appendChild(suggestion)
        }
      }
    })
    return container
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
    for (const locale of SUPPORT_LOCALES) {
      const option = L.DomUtil.create('option')
      option.text = locale.title
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
  text-shadow:
    -1px 0 black,
    0 1px black,
    1px 0 black,
    0 -1px black;
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

.autocomplete-items {
  div {
    padding: 10px;
    cursor: pointer;
    background-color: #fff;
    border-bottom: 1px solid #d4d4d4;

    &:hover {
      background-color: #e9e9e9;
    }
  }
}

.search-box {
  width: 30px;
  height: 30px;
  background-color: #fff;
  transition: 0.5s;
  overflow: hidden;

  &.active {
    width: 300px;
  }

  &__icon {
    position: absolute;
    top: 0;
    left: 0;
    background-color: #fff;
    width: 30px;
    height: 30px;
    border-radius: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    cursor: pointer;

    &::before {
      content: '';
      position: absolute;
      width: 7.5px;
      height: 7.5px;
      border: 1.5px solid #000;
      border-radius: 50%;
      transform: translate(-2px, -2px);
    }

    &::after {
      content: '';
      position: absolute;
      width: 1.5px;
      height: 6px;
      background: #000;
      transform: translate(3px, 3px) rotate(315deg);
    }
  }

  &__input {
    position: relative;
    width: 300px;
    height: 30px;
    left: 30px;
    display: flex;
    justify-content: center;
    align-items: center;

    input {
      position: absolute;
      top: 0;
      width: 100%;
      height: 100%;
      border: none;
      outline: none;
      padding: 10px 0;
    }
  }
}
</style>
