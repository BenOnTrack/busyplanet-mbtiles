<script context="module" lang="ts">
	import maplibre from 'maplibre-gl';
	import { page } from '$app/stores';
	import tileDatabase from '$lib/tile_database';
	import LayerColorSwitcher from '../lib/LayerColorSwitcher.svelte';
	import { Tag } from 'carbon-components-svelte';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import 'carbon-components-svelte/css/white.css';

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
	let bookmarks = {};
	
	interface LayerColorId {
		id: number;
		text: string;
	}
	let layerColorSwitcherIds: LayerColorId[] = [];
	interface Layer {
		id: string;
		metadata?: { switch: boolean };
	}
	// Tags
	let tagList: string[] = [];

	// Bookmarks

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
		// Layer Color Switcher
		layerColorSwitcherIds = style.layers
			.map((layer, index) => ({
				id: index,
				text: layer.id
			}))
			.filter((layer) => {
				const layerData = style.layers[layer.id];
				return layerData.metadata && layerData.metadata.color && layerData.metadata.color=== true;
			});
		// Bookmarks
		bookmarks = await (await fetch(`${base}/bookmarks.geojson`)).json();
		console.log('bookmarks:', bookmarks);
		let bounds = new maplibre.LngLatBounds([174.682908, -36.93552], [174.888902, -36.83529]);
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

<!-- <svelte:head>
	<link rel="stylesheet" href="https://cdn.skypack.dev/maplibre-gl/dist/maplibre-gl.css" />
</svelte:head> -->

<div class="container">
	<div id="map" bind:this={mapContainer} />
	<LayerColorSwitcher {map} {layerColorSwitcherIds} />
	<div id="feature-info">
		{#if tagList.length > 0}
			{#each tagList as tag (tag)}
				<Tag>{tag}</Tag>
			{/each}
		{/if}
	</div>
</div>

<style>
	.container {
		display: flex;
		flex-direction: column;
		height: 100%;
	}
	#map {
		width: 100%; /* Adjust as needed */
		height: 80vh; /* Adjust as needed */
		float: left;
	}
	#feature-info {
		padding: 10px;
	}
</style>
