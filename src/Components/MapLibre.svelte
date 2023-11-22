<svelte:head>
  <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
</svelte:head>
<script context="module" lang="ts">
	import maplibre from 'maplibre-gl';
	import { page } from '$app/stores';
	import tileDatabase from '$lib/tile_database';
	import LayerColorSwitcher from './LayerColorSwitcher.svelte';
	import LayerSwitcher from './LayerSwitcher.svelte';
	import RouteDropdown from './RouteDropdown.svelte';
	import { Tag } from 'carbon-components-svelte';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import 'carbon-components-svelte/css/white.css';

	import {getDataSetFeatureFromID,toggleRouteAndSetMapViewFromFilter} from '../utils/MapFunctions.svelte'

	if (browser) {
		tileDatabase?.on('ready', () => {
			maplibre.addProtocol('mbtiles', (params, callback) => {
				const filePath = params.url.split('://')[1];
				const arg = params.url.match(/\/([0-9]+)\/([0-9]+)\/([0-9]+)\.pbf/);
				if (arg?.length != 4) return callback(new Error(`Tile fetch error: bad params`));
				const z = parseInt(arg[1]);
				const x = parseInt(arg[2]);
				const y = parseInt(arg[3]);

				const dxres = tileDatabase.mapTiles
					.where('[z+x+y]')
					.equals([z, x, y])
					.toArray()
					.then((e) => {
						if (e.length == 1) {
							callback(null, e[0].data, null, null);
						} else callback(new Error(e));
					})
					.catch('NotFoundError', (e) => callback(new Error(e)));
				return { cancel: () => {} };
			});
		});
	}
</script>

<script lang="ts">
	import { onMount } from 'svelte';

	import { Map, NavigationControl } from 'maplibre-gl';
	import { browser } from '$app/environment';
	import { base } from '$app/paths';

	export let lat = -36.88;
	export let lon = 174.77;
	export let zoom = 12;

	$: if (map) {
		map.flyTo({ center: [lon, lat], zoom: zoom, essential: true });
	}
	// Map
	let mapContainer: HTMLDivElement;
	let map: Map;
	let mbtilesOrigin: string;
	let staticOrigin: string;
	let targetLayers: string[];
	let clickedSourceFeature: maplibregl.GeoJSONFeature;
	let clickedDataSetFeature = null;
	let bookmarks = {};

	interface StyleLayer {
		id: number;
		text: string;
		visibility: string;
	}
	let styleLayers: StyleLayer[];
	let layerColorSwitcherIds: StyleLayer[] = [];
	let layerSwitcherIds: StyleLayer[] = [];
	let layerSwitcherSelectedIds: number[];
	interface Layer {
		id: string;
		metadata?: { switch: boolean };
	}
	// Tags
	let tagList: string[] = [];

	// RouteSwitcher
	let routeDataSetFeatures = [];
	let filteredRouteDataSetFeatures = [];
	let groupedFilteredRouteDataSetFeatures = {};
	let routeMin = 0;
	let routeMax = 1;
	const nice = (d) => {
		if (!d && d !== 0) return '';
		return d.toFixed(2);
	};

	onMount(async () => {
		// Map Style
		console.log('Page Url Origin:', $page.url.origin);
		console.log('Base path:', base);
		mbtilesOrigin = `mbtiles://${$page.url.origin.split('://')[1]}`;
		staticOrigin = `${$page.url.origin}${base}`;
		const style = await (await fetch(`${base}/mystyle.json`)).json();
		style.sources.openmaptiles.tiles = style.sources.openmaptiles.tiles.map((s: string) => {
			return s.replace('@mbtilesOrigin@', mbtilesOrigin);
		});
		style.sprite = style.sprite.replace('@staticOrigin@', staticOrigin);
		style.glyphs = style.glyphs.replace('@staticOrigin@', staticOrigin);
		// Style Layers
		styleLayers = style.layers.map((layer: { id: number }, id: number) => ({
			id,
			text: layer.id,
			visibility: layer.layout?.visibility || null
		}));
		// Layer Color Switcher
		layerColorSwitcherIds = styleLayers.filter((layer) => {
			const metadata = style.layers[layer.id]?.metadata;
			return metadata && metadata.color === true;
		});

		// Layer Switcher
		layerSwitcherIds = styleLayers.filter((layer) => {
			const layerData = style.layers[layer.id];
			return layerData.metadata && layerData.metadata.switch === true;
		});
		layerSwitcherSelectedIds = layerSwitcherIds
			.filter((layer) => layer.visibility === 'visible')
			.map((layer) => layer.id);

		// Route Switcher
		routeDataSetFeatures = await (await fetch(`${base}/route_dataset.json`)).json();
		console.log('routeDataSet:', routeDataSetFeatures);
		// filteredRouteDataSetFeatures contains the filtered set
		filteredRouteDataSetFeatures = routeDataSetFeatures;
		// Group the features by category
		filteredRouteDataSetFeatures.forEach((feature) => {
			if (!groupedFilteredRouteDataSetFeatures[feature.subclass]) {
				groupedFilteredRouteDataSetFeatures[feature.subclass] = [];
			}
			groupedFilteredRouteDataSetFeatures[feature.subclass].push(feature);
		});

		// Bookmarks
		bookmarks = await (await fetch(`${base}/bookmarks.geojson`)).json();
		console.log('bookmarks:', bookmarks);
		let bounds = new maplibre.LngLatBounds([174.398279, -37.104532], [175.33349, -36.828027]);
		targetLayers = ['poi-food_and_drink', 'poi-lodging', 'poi-transportation'];

		// Map
		map = new Map({
			container: mapContainer,
			style: style,
			center: [lon, lat],
			// zoom: zoom,
			// maxTileCacheSize: 5000,
			refreshExpiredTiles: false,
			maxBounds: bounds
		});

		map.on('load', function () {
			// control
			map.addControl(new NavigationControl(), 'top-right');
			map.addControl(
				new maplibre.GeolocateControl({
					positionOptions: {
						enableHighAccuracy: true
					},
					trackUserLocation: true
				})
			);

			// POI
			map.on('click', (e) => {
				let features = map.queryRenderedFeatures(e.point, {
					layers: targetLayers
				});
				if (!features.length) return;
				else {
					console.log(features[0]);
					clickedSourceFeature = features[0];
					map.flyTo({
						center: clickedSourceFeature.geometry.coordinates,
						zoom: 20
					});
					updateFeatureInfo();
				}
			});

			// Route_midpoint
			map.on('click', (e) => {
				let renderedSourceFeatures = map.queryRenderedFeatures(e.point, {
					layers: ['route_midpoint']
				});
				if (!renderedSourceFeatures.length) return;
				else {
					clickedSourceFeature = renderedSourceFeatures[0];
					console.log('clickedSourceFeature', clickedSourceFeature);
					clickedDataSetFeature = getDataSetFeatureFromID(
						filteredRouteDataSetFeatures,
						clickedSourceFeature.properties.id
					);
					const { id, type, bbox, members } = clickedDataSetFeature;
					console.log('clickedDataSetFeature', clickedDataSetFeature);
					const routeData = {
						id: id,
						type: type,
						bbox: bbox,
						zoom: 14
					};
					const filterWayMembers = ['in', ['id'], ['literal', members]];
					const filterRelation = ['==', 'id', id];
					toggleRouteAndSetMapViewFromFilter(map, filterWayMembers, filterRelation, bbox);
				}
			});
		});
	});

	function updateFeatureInfo() {
		tagList = [];
		const propertiesToInclude = ['name:latin', 'class', 'subclass', 'category', 'cuisine'];

		propertiesToInclude.forEach((property) => {
			const value = clickedSourceFeature['properties'][property];
			if (value !== undefined && value !== null && value !== '') {
				tagList.push(value);
			}
		});
	}
</script>

	<div>
	<div id="map" bind:this={mapContainer} />
	<LayerColorSwitcher {map} {layerColorSwitcherIds} />
	<LayerSwitcher {map} {layerSwitcherIds} {layerSwitcherSelectedIds} />
	<div id="feature-info">
		<RouteDropdown {map} {filteredRouteDataSetFeatures} {groupedFilteredRouteDataSetFeatures} />

		{#if tagList.length > 0}
			{#each tagList as tag (tag)}
				<Tag>{tag}</Tag>
			{/each}
		{/if}
	</div>
</div>
<style>

	#map {
		width: 100%; /* Adjust as needed */
		height: 80vh; /* Adjust as needed */
	}
	#feature-info {
		padding: 10px;
	}
</style>
