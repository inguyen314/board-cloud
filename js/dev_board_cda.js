var allData = [];

document.addEventListener('DOMContentLoaded', async function () {
	const loadingIndicator = document.getElementById('loading');
	loadingIndicator.style.display = 'block';

	let setBaseUrl = null;
	if (cda === "internal") {
		setBaseUrl = `https://wm.${office.toLowerCase()}.ds.usace.army.mil/${office.toLowerCase()}-data/`;
	} else if (cda === "internal-coop") {
		setBaseUrl = `https://wm-${office.toLowerCase()}coop.mvk.ds.usace.army.mil/${office.toLowerCase()}-data/`;
	} else if (cda === "public") {
		setBaseUrl = `https://cwms-data.usace.army.mil/cwms-data/`;
	}
	console.log("setBaseUrl: ", setBaseUrl);

	const lakeLocs = [
		"Lk Shelbyville-Kaskaskia",
		"Carlyle Lk-Kaskaskia",
		"Rend Lk-Big Muddy",
		"Wappapello Lk-St Francis",
		"Mark Twain Lk-Salt"
	];

	// Get gage_control.json
	if (json === "true") {
		fetch(`json/gage_control_dev.json`)
			.then(response => {
				if (!response.ok) {
					throw new Error('Network response was not ok');
				}
				return response.json();
			})
			.then(combinedData => {
				console.log('combinedData:', combinedData);

				const formatDate = (daysToAdd) => {
					const date = new Date();
					date.setDate(date.getDate() + daysToAdd);
					return ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);
				};

				const [day1, day2, day3] = [1, 2, 3].map(days => formatDate(days));
				const combinedDataRiver = JSON.parse(JSON.stringify(combinedData));
				const combinedDataReservoir = JSON.parse(JSON.stringify(combinedData));

				console.log('combinedDataRiver:', combinedDataRiver);
				console.log('combinedDataReservoir:', combinedDataReservoir);

				let tableRiver = null;
				tableRiver = createTable(combinedDataReservoir, setBaseUrl, display_type, display_tributary, day1, day2, day3, lakeLocs);
				// console.log(tableRiver);

				document.getElementById(`tableContainer`).append(tableRiver);

				loadingIndicator.style.display = 'none';
			})
			.catch(error => {
				console.error('Error fetching data:', error);
			});
	} else {
		const setLocationCategory = "Basins";
		const setLocationGroupOwner = "River-Reservoir";
		const setTimeseriesGroup1 = "Stage";
		const setTimeseriesGroup2 = "Forecast-NWS"; // NWS next 3 days forecast
		const setTimeseriesGroup3 = "Crest"; // NWS Crest
		const setTimeseriesGroup4 = "Precip-Lake-Test"; // Precip
		const setTimeseriesGroup5 = "Consensus-Test"; // Yesterdays Inflow
		const setTimeseriesGroup6 = "Storage"; // Storage Utilized
		const setTimeseriesGroup7 = "Crest-Forecast-Lake"; //Pool Forecast
		const setTimeseriesGroup8 = "Outflow-Total-Lake-Test"; // Controlled Outflow
		const setTimeseriesGroup9 = "Gate-Total-Lake-Test"; // Controlled Outflow
		const setTimeseriesGroup10 = "Forecast-Lake"; // Lake Forecast
		const setTimeseriesGroup11 = "Conc-DO-Lake";

		const categoryApiUrl = `${setBaseUrl}location/group?office=${office}&group-office-id=${office}&category-office-id=${office}&category-id=${setLocationCategory}`;

		// Maps
		const stageTsidMap = new Map();
		const metadataMap = new Map();
		const floodMap = new Map();
		const ngvd29Map = new Map();
		const riverMileMap = new Map();
		const precipLakeTsidMap = new Map();
		const inflowYesterdayLakeTsidMap = new Map();
		const storageLakeTsidMap = new Map();
		const topOfFloodMap = new Map();
		const topOfConservationMap = new Map();
		const bottomOfFloodMap = new Map();
		const bottomOfConservationMap = new Map();
		const seasonalRuleCurveMap = new Map();
		const crestForecastLakeMap = new Map();
		const outflowTotalLakeMap = new Map();
		const gateTotalLakeMap = new Map();
		const forecastLakeMap = new Map();
		const recordStageMap = new Map();
		const forecastNwsTsidMap = new Map();
		const crestNwsTsidMap = new Map();
		const eocPhase1Map = new Map();
		const eocPhase2Map = new Map();
		const lwrpMap = new Map();
		const bankfullMap = new Map();
		const doMap = new Map();

		// Promises
		const stageTsidPromises = [];
		const metadataPromises = [];
		const floodPromises = [];
		const ngvd29Promises = [];
		const riverMilePromises = [];
		const precipLakeTsidPromises = [];
		const inflowYesterdayLakeTsidPromises = [];
		const storageLakeTsidPromises = [];
		const topOfFloodPromises = [];
		const topOfConservationPromises = [];
		const bottomOfFloodPromises = [];
		const bottomOfConservationPromises = [];
		const seasonalRuleCurvePromises = [];
		const crestForecastLakePromises = [];
		const outflowTotalLakePromises = [];
		const gateTotalLakePromises = [];
		const forecastLakePromises = [];
		const recordStagePromises = [];
		const forecastNwsTsidPromises = [];
		const crestNwsTsidPromises = [];
		const eocPhase1Promises = [];
		const eocPhase2Promises = [];
		const lwrpPromises = [];
		const bankfullPromises = [];
		const doPromises = [];

		const apiPromises = [];

		// Set empty data array to store gage_data.json
		let combinedData = [];

		// Fetch initial category
		fetch(categoryApiUrl)
			.then(validateResponse)
			.then(data => {
				const filteredArray = filterByLocationCategory(data, {
					"office-id": office,
					"id": setLocationCategory
				});

				const basins = filteredArray.map(item => item.id);
				if (basins.length === 0) {
					console.warn('No basins found for the given category.');
					return;
				}

				console.log('Filtered basins:', basins);

				basins.forEach(basin => {
					const basinApiUrl = `${setBaseUrl}location/group/${basin}?office=${office}&category-id=${setLocationCategory}`;

					apiPromises.push(
						fetch(basinApiUrl)
							.then(validateResponse)
							.then(getBasin => {
								if (!getBasin) return;

								const locationIds = getBasin['assigned-locations'].map(loc => loc['location-id']);
								return Promise.all(locationIds.map(id =>
									fetchAdditionalLocationGroupOwnerData(id, setBaseUrl, setLocationGroupOwner, office)
								))
									.then(results => {
										const result = results[0];

										getBasin['assigned-locations'] = getBasin['assigned-locations']
											.filter(loc => result?.['assigned-locations']?.some(r => r['location-id'] === loc['location-id']))
											.filter(loc => loc.attribute <= 900)
											.sort((a, b) => a.attribute - b.attribute);

										combinedData.push(getBasin);

										for (const location of getBasin['assigned-locations']) {
											if (lakeLocs.includes(location['location-id'])) {
												// For Lake Only
												fetchAndStoreDataForLakeLocation(location);
											} else {
												// For River Only
												fetchAndStoreDataForRiverLocation(location);
											}
										}
									});
							})
							.catch(err => console.error(`Fetch error for basin ${basin}:`, err))
					);
				});

				return Promise.all(apiPromises);
			})
			.then(() => Promise.all([
				...metadataPromises,
				...floodPromises,
				...ngvd29Promises,
				...stageTsidPromises,
				...riverMilePromises,
				...precipLakeTsidPromises,
				...inflowYesterdayLakeTsidPromises,
				...topOfFloodPromises,
				...topOfConservationPromises,
				...bottomOfFloodPromises,
				...bottomOfConservationPromises,
				...seasonalRuleCurvePromises,
				...crestForecastLakePromises,
				...outflowTotalLakePromises,
				...gateTotalLakePromises,
				...forecastLakePromises,
				...recordStagePromises,
				...forecastNwsTsidMap,
				...crestNwsTsidPromises,
				...eocPhase1Promises,
				...eocPhase2Promises,
				...lwrpPromises,
				...bankfullPromises,
				...doPromises
			]))
			.then(() => {
				// Merge fetched data into locations
				combinedData.forEach(basin => {
					basin['assigned-locations'].forEach(loc => {
						loc['metadata'] = metadataMap.get(loc['location-id']);
						loc['flood'] = floodMap.get(loc['location-id']);
						loc['ngvd29'] = floodMap.get(loc['location-id']);
						loc['tsid-stage'] = stageTsidMap.get(loc['location-id']);
						loc['river-mile'] = riverMileMap.get(loc['location-id']);
						loc['tsid-lake-precip'] = precipLakeTsidMap.get(loc['location-id']);
						loc['tsid-lake-inflow-yesterday'] = inflowYesterdayLakeTsidMap.get(loc['location-id']);
						loc['tsid-lake-storage'] = storageLakeTsidMap.get(loc['location-id']);
						loc['top-of-flood'] = topOfFloodMap.get(loc['location-id']);
						loc['top-of-conservation'] = topOfConservationMap.get(loc['location-id']);
						loc['bottom-of-flood'] = bottomOfFloodMap.get(loc['location-id']);
						loc['bottom-of-conservation'] = bottomOfConservationMap.get(loc['location-id']);
						loc['seasonal-rule-curve'] = seasonalRuleCurveMap.get(loc['location-id']);
						loc['tsid-crest-forecast-lake'] = crestForecastLakeMap.get(loc['location-id']);
						loc['tsid-outflow-total-lake'] = outflowTotalLakeMap.get(loc['location-id']);
						loc['tsid-gate-total-lake'] = gateTotalLakeMap.get(loc['location-id']);
						loc['tsid-forecast-lake'] = forecastLakeMap.get(loc['location-id']);
						loc['record-stage'] = recordStageMap.get(loc['location-id']);
						loc['tsid-nws-forecast'] = forecastNwsTsidMap.get(loc['location-id']);
						loc['tsid-nws-crest'] = crestNwsTsidMap.get(loc['location-id']);
						loc['eoc-phase-1'] = eocPhase1Map.get(loc['location-id']);
						loc['eoc-phase-2'] = eocPhase1Map.get(loc['location-id']);
						loc['lwrp'] = eocPhase1Map.get(loc['location-id']);
						loc['bankfull'] = bankfullMap.get(loc['location-id']);
						loc['tsid-do-lake'] = doMap.get(loc['location-id']);
					});
				});

				console.log('All combined data fetched:', combinedData);

				// Filter and sort
				combinedData.forEach(group => {
					group['assigned-locations'] = group['assigned-locations']
						.filter(loc => !loc.attribute.toString().endsWith('.1'))
						.filter(loc => loc['tsid-stage']);
				});

				combinedData = combinedData.filter(group => group['assigned-locations'].length > 0);

				const sortOrder = ['Mississippi', 'Illinois', 'Cuivre', 'Missouri', 'Meramec', 'Ohio', 'Kaskaskia', 'Big Muddy', 'St Francis', 'Salt'];
				combinedData.sort((a, b) => {
					const aIndex = sortOrder.indexOf(a.id);
					const bIndex = sortOrder.indexOf(b.id);
					return (aIndex === -1 ? 1 : aIndex) - (bIndex === -1 ? 1 : bIndex);
				});

				console.log('Final sorted combinedData:', combinedData);

				const formatDate = offset => {
					const d = new Date();
					d.setDate(d.getDate() + offset);
					return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
				};

				const [day1, day2, day3] = [1, 2, 3].map(formatDate);

				const combinedDataRiver = structuredClone?.(combinedData) || JSON.parse(JSON.stringify(combinedData));
				const combinedDataReservoir = structuredClone?.(combinedData) || JSON.parse(JSON.stringify(combinedData));

				let tableRiver = null;
				tableRiver = createTable(combinedDataReservoir, setBaseUrl, display_type, display_tributary, day1, day2, day3, lakeLocs);
				// console.log(tableRiver);

				document.getElementById(`tableContainer`).append(tableRiver);

				loadingIndicator.style.display = 'none';
			})
			.catch(err => {
				console.error('Final processing error:', err);
				loadingIndicator.style.display = 'none';
			});

		// Helpers
		function validateResponse(response) {
			if (!response.ok) throw new Error(`Network error: ${response.status}`);
			return response.json();
		}

		function fetchAndStoreDataForRiverLocation(loc) {
			const locationId = loc['location-id'];
			const levelIdEffectiveDate = "2025-04-01T06:00:00Z";

			metadataPromises.push(
				fetch(`${setBaseUrl}locations/${locationId}?office=${office}`)
					.then(res => res.ok ? res.json() : null)
					.then(data => data && metadataMap.set(locationId, data))
					.catch(err => console.error(`TSID fetch failed for ${locationId}:`, err))
			);

			const floodUrl = `${setBaseUrl}levels/${locationId}.Stage.Inst.0.Flood?office=${office}&effective-date=${levelIdEffectiveDate}&unit=ft`;
			floodPromises.push(
				fetch(floodUrl)
					.then(res => res.status === 404 ? null : res.ok ? res.json() : Promise.reject(`Flood fetch error: ${res.statusText}`))
					.then(data => floodMap.set(locationId, data ?? null))
					.catch(err => console.error(`TSID fetch failed for ${locationId}:`, err))
			);

			const ngvd29Url = `${setBaseUrl}levels/${locationId}.Height.Inst.0.NGVD29?office=${office}&effective-date=${levelIdEffectiveDate}&unit=ft`;
			ngvd29Promises.push(
				fetch(ngvd29Url)
					.then(res => res.status === 404 ? null : res.ok ? res.json() : Promise.reject(`Flood fetch error: ${res.statusText}`))
					.then(data => ngvd29Map.set(locationId, data ?? null))
					.catch(err => console.error(`TSID fetch failed for ${locationId}:`, err))
			);

			const tsidUrl = `${setBaseUrl}timeseries/group/${setTimeseriesGroup1}?office=${office}&category-id=${locationId}`;
			stageTsidPromises.push(
				fetch(tsidUrl)
					.then(res => res.ok ? res.json() : null)
					.then(data => data && stageTsidMap.set(locationId, data))
					.catch(err => console.error(`TSID fetch failed for ${locationId}:`, err))
			);

			const riverMileApiUrl = `${setBaseUrl}stream-locations?office-mask=${office}&name-mask=${loc['location-id']}`;
			riverMilePromises.push(
				fetch(riverMileApiUrl)
					.then(res => res.ok ? res.json() : null)
					.then(data => data && riverMileMap.set(locationId, data))
					.catch(err => console.error(`TSID fetch failed for ${locationId}:`, err))
			);

			const levelIdRecordStage = `${loc['location-id']}.Stage.Inst.0.Record Stage`;
			const recordStageApiUrl = `${setBaseUrl}levels?level-id-mask=${levelIdRecordStage}&office=${office}`;
			recordStagePromises.push(
				fetch(recordStageApiUrl)
					.then(res => res.ok ? res.json() : null)
					.then(data => data && recordStageMap.set(locationId, data))
					.catch(err => console.error(`TSID fetch failed for ${locationId}:`, err))
			);

			const tsidNwsForecastUrl = `${setBaseUrl}timeseries/group/${setTimeseriesGroup2}?office=${office}&category-id=${locationId}`;
			forecastNwsTsidPromises.push(
				fetch(tsidNwsForecastUrl)
					.then(res => res.ok ? res.json() : null)
					.then(data => data && forecastNwsTsidMap.set(locationId, data))
					.catch(err => console.error(`TSID fetch failed for ${locationId}:`, err))
			);

			const tsidNwsCrestUrl = `${setBaseUrl}timeseries/group/${setTimeseriesGroup3}?office=${office}&category-id=${locationId}`;
			crestNwsTsidPromises.push(
				fetch(tsidNwsCrestUrl)
					.then(res => res.ok ? res.json() : null)
					.then(data => data && crestNwsTsidMap.set(locationId, data))
					.catch(err => console.error(`TSID fetch failed for ${locationId}:`, err))
			);

			const eocPhase1Url = `${setBaseUrl}levels/${locationId}.Stage.Inst.0.EOC Action Stage - Phase 1?office=${office}&effective-date=${levelIdEffectiveDate}&unit=ft`;
			eocPhase1Promises.push(
				fetch(eocPhase1Url)
					.then(res => res.status === 404 ? null : res.ok ? res.json() : Promise.reject(`Flood fetch error: ${res.statusText}`))
					.then(data => eocPhase1Map.set(locationId, data ?? null))
					.catch(err => console.error(`TSID fetch failed for ${locationId}:`, err))
			);

			const eocPhase2Url = `${setBaseUrl}levels/${locationId}.Stage.Inst.0.EOC Action Stage - Phase 2?office=${office}&effective-date=${levelIdEffectiveDate}&unit=ft`;
			eocPhase2Promises.push(
				fetch(eocPhase2Url)
					.then(res => res.status === 404 ? null : res.ok ? res.json() : Promise.reject(`Flood fetch error: ${res.statusText}`))
					.then(data => eocPhase2Map.set(locationId, data ?? null))
					.catch(err => console.error(`TSID fetch failed for ${locationId}:`, err))
			);

			const lwrpUrl = `${setBaseUrl}levels/${locationId}.Stage.Inst.0.LWRP?office=${office}&effective-date=${levelIdEffectiveDate}&unit=ft`;
			lwrpPromises.push(
				fetch(lwrpUrl)
					.then(res => res.status === 404 ? null : res.ok ? res.json() : Promise.reject(`Flood fetch error: ${res.statusText}`))
					.then(data => lwrpMap.set(locationId, data ?? null))
					.catch(err => console.error(`TSID fetch failed for ${locationId}:`, err))
			);
		}

		function fetchAndStoreDataForLakeLocation(loc) {
			const locationId = loc['location-id'];
			const levelIdEffectiveDate = "2025-04-01T06:00:00Z";

			metadataPromises.push(
				fetch(`${setBaseUrl}locations/${locationId}?office=${office}`)
					.then(res => res.ok ? res.json() : null)
					.then(data => data && metadataMap.set(locationId, data))
					.catch(err => console.error(`Metadata fetch failed for ${locationId}:`, err))
			);

			const floodUrl = `${setBaseUrl}levels/${locationId}.Stage.Inst.0.Flood?office=${office}&effective-date=${levelIdEffectiveDate}&unit=ft`;
			floodPromises.push(
				fetch(floodUrl)
					.then(res => res.status === 404 ? null : res.ok ? res.json() : Promise.reject(`Flood fetch error: ${res.statusText}`))
					.then(floodData => floodMap.set(locationId, floodData ?? null))
					.catch(err => console.error(`Flood fetch failed for ${locationId}:`, err))
			);

			const tsidUrl = `${setBaseUrl}timeseries/group/${setTimeseriesGroup1}?office=${office}&category-id=${locationId}`;
			stageTsidPromises.push(
				fetch(tsidUrl)
					.then(res => res.ok ? res.json() : null)
					.then(data => data && stageTsidMap.set(locationId, data))
					.catch(err => console.error(`TSID fetch failed for ${locationId}:`, err))
			);

			const precipLakeApiUrl = `${setBaseUrl}timeseries/group/${setTimeseriesGroup4}?office=${office}&category-id=${loc['location-id']}`;
			precipLakeTsidPromises.push(
				fetch(precipLakeApiUrl)
					.then(res => res.ok ? res.json() : null)
					.then(data => data && precipLakeTsidMap.set(locationId, data))
					.catch(err => console.error(`TSID fetch failed for ${locationId}:`, err))
			);

			const inflowYesterdayLakeApiUrl = `${setBaseUrl}timeseries/group/${setTimeseriesGroup5}?office=${office}&category-id=${loc['location-id']}`;
			inflowYesterdayLakeTsidPromises.push(
				fetch(inflowYesterdayLakeApiUrl)
					.then(res => res.ok ? res.json() : null)
					.then(data => {
						if (data) {
							// console.log(`Fetched inflow data for ${locationId}:`, data);  // Log fetched data
							inflowYesterdayLakeTsidMap.set(locationId, data);
						} else {
							// console.warn(`No inflow data returned for ${locationId}`);
						}
					})
					.catch(err => console.error(`TSID fetch failed for ${locationId}:`, err))
			);

			const storageLakeApiUrl = `${setBaseUrl}timeseries/group/${setTimeseriesGroup6}?office=${office}&category-id=${loc['location-id']}`;
			storageLakeTsidPromises.push(
				fetch(storageLakeApiUrl)
					.then(res => res.ok ? res.json() : null)
					.then(data => data && storageLakeTsidMap.set(locationId, data))
					.catch(err => console.error(`TSID fetch failed for ${locationId}:`, err))
			);

			const levelIdTopOfFlood = `${loc['location-id'].split('-')[0]}.Stor.Inst.0.Top of Flood`;
			const topOfFloodApiUrl = `${setBaseUrl}levels/${levelIdTopOfFlood}?office=${office}&effective-date=${levelIdEffectiveDate}&unit=ac-ft`;
			topOfFloodPromises.push(
				fetch(topOfFloodApiUrl)
					.then(res => res.ok ? res.json() : null)
					.then(data => data && topOfFloodMap.set(locationId, data))
					.catch(err => console.error(`TSID fetch failed for ${locationId}:`, err))
			);

			const levelIdBottomOfFlood = `${loc['location-id'].split('-')[0]}.Stor.Inst.0.Bottom of Flood`;
			const bottomOfFloodApiUrl = `${setBaseUrl}levels/${levelIdBottomOfFlood}?office=${office}&effective-date=${levelIdEffectiveDate}&unit=ac-ft`;
			bottomOfFloodPromises.push(
				fetch(bottomOfFloodApiUrl)
					.then(res => res.ok ? res.json() : null)
					.then(data => data && bottomOfFloodMap.set(locationId, data))
					.catch(err => console.error(`TSID fetch failed for ${locationId}:`, err))
			);

			const levelIdTopOfConservation = `${loc['location-id'].split('-')[0]}.Stor.Inst.0.Top of Conservation`;
			const topOfConservationApiUrl = `${setBaseUrl}levels/${levelIdTopOfConservation}?office=${office}&effective-date=${levelIdEffectiveDate}&unit=ac-ft`;
			topOfConservationPromises.push(
				fetch(topOfConservationApiUrl)
					.then(res => res.ok ? res.json() : null)
					.then(data => data && topOfConservationMap.set(locationId, data))
					.catch(err => console.error(`TSID fetch failed for ${locationId}:`, err))
			);

			const levelIdBottomOfConservation = `${loc['location-id'].split('-')[0]}.Stor.Inst.0.Bottom of Conservation`;
			const bottomOfConservationApiUrl = `${setBaseUrl}levels/${levelIdBottomOfConservation}?office=${office}&effective-date=${levelIdEffectiveDate}&unit=ac-ft`;
			bottomOfConservationPromises.push(
				fetch(bottomOfConservationApiUrl)
					.then(res => res.ok ? res.json() : null)
					.then(data => data && bottomOfConservationMap.set(locationId, data))
					.catch(err => console.error(`TSID fetch failed for ${locationId}:`, err))
			);

			const levelIdSeasonalRuleCurve = `${loc['location-id']}.Elev.Inst.0.Seasonal Rule Curve Production`;
			const seasonalRuleCurveApiUrl = `${setBaseUrl}levels/${levelIdSeasonalRuleCurve}?office=${office}&effective-date=${levelIdEffectiveDate}&unit=ft`;
			seasonalRuleCurvePromises.push(
				fetch(seasonalRuleCurveApiUrl)
					.then(res => res.ok ? res.json() : null)
					.then(data => data && seasonalRuleCurveMap.set(locationId, data))
					.catch(err => console.error(`TSID fetch failed for ${locationId}:`, err))
			);

			const crestForecastLakeUrl = `${setBaseUrl}timeseries/group/${setTimeseriesGroup7}?office=${office}&category-id=${loc['location-id']}`;
			crestForecastLakePromises.push(
				fetch(crestForecastLakeUrl)
					.then(res => res.ok ? res.json() : null)
					.then(data => {
						if (data) {
							// console.log(`Fetched data for ${locationId}:`, data);  // Log fetched data
							crestForecastLakeMap.set(locationId, data);
						} else {
							// console.warn(`No data returned for ${locationId}`);
						}
					})
					.catch(err => console.error(`TSID fetch failed for ${locationId}:`, err))
			);

			const outflowTotalLakeUrl = `${setBaseUrl}timeseries/group/${setTimeseriesGroup8}?office=${office}&category-id=${loc['location-id']}`;
			outflowTotalLakePromises.push(
				fetch(outflowTotalLakeUrl)
					.then(res => res.ok ? res.json() : null)
					.then(data => {
						if (data) {
							// console.log(`Fetched data for ${locationId}:`, data);  // Log fetched data
							outflowTotalLakeMap.set(locationId, data);
						} else {
							// console.warn(`No data returned for ${locationId}`);
						}
					})
					.catch(err => console.error(`TSID fetch failed for ${locationId}:`, err))
			);

			const gateTotalLakeUrl = `${setBaseUrl}timeseries/group/${setTimeseriesGroup9}?office=${office}&category-id=${loc['location-id']}`;
			gateTotalLakePromises.push(
				fetch(gateTotalLakeUrl)
					.then(res => res.ok ? res.json() : null)
					.then(data => {
						if (data) {
							// console.log(`Fetched data for ${locationId}:`, data);  // Log fetched data
							gateTotalLakeMap.set(locationId, data);
						} else {
							// console.warn(`No data returned for ${locationId}`);
						}
					})
					.catch(err => console.error(`TSID fetch failed for ${locationId}:`, err))
			);

			const forecastLakeUrl = `${setBaseUrl}timeseries/group/${setTimeseriesGroup10}?office=${office}&category-id=${loc['location-id']}`;
			forecastLakePromises.push(
				fetch(forecastLakeUrl)
					.then(res => res.ok ? res.json() : null)
					.then(data => {
						if (data) {
							// console.log(`Fetched data for ${locationId}:`, data);  // Log fetched data
							forecastLakeMap.set(locationId, data);
						} else {
							// console.warn(`No data returned for ${locationId}`);
						}
					})
					.catch(err => console.error(`TSID fetch failed for ${locationId}:`, err))
			);

			const levelIdRecordStage = `${loc['location-id']}.Stage.Inst.0.Record Stage`;
			const recordStageApiUrl = `${setBaseUrl}levels?level-id-mask=${levelIdRecordStage}&office=${office}`;
			recordStagePromises.push(
				fetch(recordStageApiUrl)
					.then(res => res.ok ? res.json() : null)
					.then(data => data && recordStageMap.set(locationId, data))
					.catch(err => console.error(`TSID fetch failed for ${locationId}:`, err))
			);

			const bankfullUrl = `${setBaseUrl}levels/${locationId.split('-')[0]}.Flow.Inst.0.Bankfull?office=${office}&effective-date=${levelIdEffectiveDate}&unit=cfs`;
			bankfullPromises.push(
				fetch(bankfullUrl)
					.then(res => res.status === 404 ? null : res.ok ? res.json() : Promise.reject(`Flood fetch error: ${res.statusText}`))
					.then(data => bankfullMap.set(locationId, data ?? null))
					.catch(err => console.error(`Flood fetch failed for ${locationId}:`, err))
			);

			const tsidDoUrl = `${setBaseUrl}timeseries/group/${setTimeseriesGroup11}?office=${office}&category-id=${locationId}`;
			doPromises.push(
				fetch(tsidDoUrl)
					.then(res => res.ok ? res.json() : null)
					.then(data => data && doMap.set(locationId, data))
					.catch(err => console.error(`TSID fetch failed for ${locationId}:`, err))
			);
		}
	}
});

//====================================================
// ============== TABLE HEADER  ======================
//====================================================

// RIVER TITLE
if (display_tributary === "False" && display_type !== "Lake") {
	document.write("<table id='board_cda'>");
	document.write("<tr>");
	document.write("<th colspan='15'>");
	document.write("<div id='board_title'>MVS RIVER DATA</div>");
	document.write("</th>");
	document.write("</tr>");

	document.write("<tr>");
	document.write("<th colspan='2'>");
	document.write("<div class='Last_Modified'>Last Modified:&nbsp;&nbsp" + currentDateTime + "</div>");
	document.write("</th>");
	document.write("<th colspan='13'>");
	if (display_type === "FloodStage" && display_tributary === "False") {
		document.write("<div id='formsContainer'><div id='switch_php_board'><a href='https://wm.mvs.ds.usace.army.mil/mvs/board/dev.html?display_type=FloodStage&display_tributary=False&dev=True'>Switch to Dev Board</a></div></div>");
	} else {
		document.write("<div id='switch_php_board'><a href='https://wm.mvs.ds.usace.army.mil/mvs/board/dev.html?display_type=LWRP&display_tributary=False&dev=True'>Switch to PHP Board</a></div>");
	}
	document.write("</th>");
	document.write("</tr>");

	document.write("<tr>");
	document.write("<th rowspan='3' width='6%' style='font-size: 1.2em;'>River Mile</th>");
	document.write("<th rowspan='3'width='16%' style='font-size: 1.2em;'>Location</th>");
	document.write("<th rowspan='3' width='6%' style='font-size: 1.2em;'>Current<br>" +
		((currentMinute >= 0 && currentMinute < 30) ? currentHour + ":00" : currentHour + ":30") +
		"<br>Levels</th>");
	document.write("<th rowspan='3' width='5%' style='font-size: 1.2em;'>24hr<br>Change</th>");
	document.write("<th colspan='6' style='font-size: 1.2em;'>National Weather Service River Forcast</th>");
	document.write("<th rowspan='3' width='15%' style='font-size: 1.2em;'> LD Settings<br>[Tainter] [Roller]</th>");

	if (display_type === "LWRP") {
		document.write("<th colspan='2' rowspan='1'><a href='dev.html?display_type=FloodStage&display_tributary=False&dev=True'>Switch to FloodStage</a></th>");
	} else if (display_type == "FloodStage") {
		document.write("<th colspan='2' rowspan='1'><a href='dev.html?display_type=LWRP&display_tributary=False&dev=True'>Switch to LWRP</a></th>");
	} else {
		document.write("<th colspan='2' rowspan='1' width='8%'></th>");
	}

	document.write("<th rowspan='3' width='6%' style='font-size: 1.2em;'>Gage Zero<br>NAVD88</th>");
	document.write("</tr>");

	document.write("<tr>");
	document.write("<th colspan='3' style='font-size: 1.2em;'>Next 3 days</th>");
	document.write("<th width='8%' style='font-size: 1.2em;'>Forecast Time</th>");
	document.write("<th width='5%' style='font-size: 1.2em;'>Crest</th>");
	document.write("<th width='5%' style='font-size: 1.2em;'>Date</th>");

	if (display_type === "LWRP") {
		document.write("<th rowspan='2' width='5%'>LWRP</th>");
		document.write("<th rowspan='2' width='8%'>Plus or <br>Minus<br>LWRP</th>");
	} else if (display_type === "FloodStage") {
		document.write("<th rowspan='2' width='5%' style='font-size: 1.2em;'>Flood<br>Stage</th>");
		document.write("<th rowspan='2' width='8%' style='font-size: 1.2em;'>Action<br>Stages<br>[Phase 1/2]</th>");
	} else {
		document.write("<th colspan='2' rowspan='2'></th>");
		document.write("<th colspan='2' rowspan='2'></th>");
	}

	document.write("</tr>");

	document.write("<tr>");
	document.write("<th width='5%'>" + currentPlusOneDayAbbreviation + " " + nws_day1_date_title + "</th>");
	document.write("<th width='5%'>" + currentPlusTwoDayAbbreviation + " " + nws_day2_date_title + "</th>");
	document.write("<th width='5%'>" + currentPlusThreeDayAbbreviation + " " + nws_day3_date_title + "</th>");
	document.write("<th colspan='3'></th>");
	document.write("</tr>");
	document.write("</table>");
} else {
	if (display_type === "LWRP") {
		document.write("<table id='board_cda'>");
		document.write("<div class='Last_Modified_Tributary'>Last Modified:&nbsp;&nbsp" + currentDateTime + "</div>");
		document.write("<div class='Last_Modified_Tributary'><a href='https://wm.mvs.ds.usace.army.mil/web_apps/board/public/board.php?display_type=LWRP&display_tributary=True'>Switch to PHP Board</a></div>");
		document.write("<div class='Flood_Stage_Switch_Tributary'><a href='dev.html?display_type=FloodStage&display_tributary=True&dev=True'>Switch to FloodStage</a></div>");
		document.write("</table>");
	} else if (display_type == "FloodStage") {
		document.write("<table id='board_cda'>");
		document.write("<div class='Last_Modified_Tributary'>Last Modified:&nbsp;&nbsp" + currentDateTime + "</div>");
		document.write("<div class='Last_Modified_Tributary'><a href='https://wm.mvs.ds.usace.army.mil/web_apps/board/public/board.php?display_type=FloodStage&display_tributary=True'>Switch to PHP Board</a></div>");
		document.write("<div class='Flood_Stage_Switch_Tributary'><a href='dev.html?display_type=LWRP&display_tributary=True&dev=True'>Switch to LWRP</a></div>");
		document.write("</table>");
	} else {
		console.error();
	}
}

// LAKE TITLE
if (display_type === "Lake") {
	// Wrap your code inside the window load event listener
	window.addEventListener('load', function () {
		// Create the table structure
		// Create the static table structure
		var staticTable = document.createElement('table');
		staticTable.id = 'board_cda';

		// Create tbody element
		var tbody = document.createElement("tbody");

		// Row 1
		var row1 = staticTable.insertRow();

		// Use th instead of td for the header cell
		var headerCell = document.createElement('th');
		headerCell.colSpan = 8;
		headerCell.classList.add('Font_10');
		headerCell.innerHTML = "<div id='board_title'>MVS LAKE DATA</div>";
		row1.appendChild(headerCell);

		// Row 2
		var row2 = staticTable.insertRow(1);

		// Use th instead of td for the header cell
		var headerCell = document.createElement('th');
		headerCell.colSpan = 8;
		headerCell.innerHTML = "<div class='Last_Modified'>Last Modified:&nbsp;&nbsp" + currentDateTime + " <a href='https://wm.mvs.ds.usace.army.mil/web_apps/board/public/board.php?display_type=Lake&display_tributary=False'>Switch to PHP Board</a></div>";
		row2.appendChild(headerCell);

		// Row 3
		var row3 = staticTable.insertRow(2);

		var headerCell = document.createElement('th');
		headerCell.innerHTML = "Lake";
		headerCell.width = '15%'; // Set the width attribute
		headerCell.classList.add('Font_12');
		row3.appendChild(headerCell);

		// Column 2
		var headerCell2 = document.createElement('th');
		headerCell2.innerHTML = "Current " + ((currentMinute >= 0 && currentMinute < 30) ? currentHour + ":00" : currentHour + ":30") + "<br>" + "Pool Level (ft)";
		headerCell2.width = '12%'; // Set the width attribute
		headerCell2.classList.add('Font_12');
		row3.appendChild(headerCell2);

		// Column 3
		var headerCell3 = document.createElement('th');
		headerCell3.innerHTML = "24hr<br>Change (ft)";
		headerCell3.width = '10%'; // Set the width attribute
		headerCell3.classList.add('Font_12');
		row3.appendChild(headerCell3);

		// Column 4
		var headerCell4 = document.createElement('th');
		headerCell4.innerHTML = "Current Storage Utilized <br> <span style='float: left; padding-left: 30px; padding-top: 10px; padding-bottom: 5px; font-size: 0.8em;'>Conservation</span><span style='float: right; padding-right: 30px; padding-top: 10px; padding-bottom: 5px; font-size: 0.8em;'>Flood</span>";
		headerCell4.width = '17%'; // Set the width attribute
		headerCell4.classList.add('Font_10');
		row3.appendChild(headerCell4);

		// Column 5
		var headerCell5 = document.createElement('th');
		headerCell5.innerHTML = "Precip (in)";
		headerCell5.width = '9%'; // Set the width attribute
		headerCell5.classList.add('Font_12');
		row3.appendChild(headerCell5);

		// Column 6
		var headerCell6 = document.createElement('th');
		headerCell6.innerHTML = "Yesterday<br>Inflow (dsf)";
		headerCell6.width = '9%'; // Set the width attribute
		headerCell6.classList.add('Font_12');
		row3.appendChild(headerCell6);

		// Column 7
		var headerCell7 = document.createElement('th');
		headerCell7.innerHTML = "Controlled Outflow (cfs) <br> <span style='float: left; padding-left: 30px; padding-top: 10px; padding-bottom: 5px; font-size: 0.8em;'>Midnight</span><span style='float: right; padding-right: 30px; padding-top: 10px; padding-bottom: 5px; font-size: 0.8em;'>Evening</span>";
		headerCell7.width = '17%'; // Set the width attribute
		headerCell7.classList.add('Font_12');
		row3.appendChild(headerCell7);

		// Column 8
		var headerCell8 = document.createElement('th');
		headerCell8.innerHTML = "Seasonal<br>Rule Curve (ft)";
		headerCell8.width = '11%'; // Set the width attribute
		headerCell8.classList.add('Font_12');
		row3.appendChild(headerCell8);

		// Assuming you have a container with an ID 'tableContainer' in your HTML
		const tableContainer = document.getElementById('tableContainer');

		// Check if the container is found
		if (tableContainer) {
			// Append the static table to the container
			tableContainer.appendChild(staticTable);
		} else {
			console.error("Container with ID 'tableContainer' not found.");
		}
	});
}

//====================================================
// ============== CREATE TABLE =======================
//====================================================

function createTable(combinedDataReservoir, setBaseUrl, display_type, display_tributary, day1, day2, day3, lakeLocs) {
	// Filter out locations not in lakeLocs, and remove basins without assigned-locations
	combinedDataReservoir = combinedDataReservoir.filter((basin) => {
		// Filter 'assigned-locations' within each basin
		basin['assigned-locations'] = basin['assigned-locations'].filter((location) => {
			const currentLocationId = location['location-id'];

			// Keep location only if it is found in lakeLocs
			return lakeLocs.includes(currentLocationId);
		});

		// Remove the basin if it has no assigned locations left
		return basin['assigned-locations'].length > 0;
	});
	console.log("combinedDataReservoir:", combinedDataReservoir);

	// Create a table element
	const table = document.createElement('table');
	table.setAttribute('id', 'board_cda');

	// Flag to track if the basin has been printed
	let hasPrintedBasin = false;

	const today = new Date();
	today.setHours(0, 0, 0, 0); // Set to local midnight (DST-aware)

	const isoDateMinus7 = new Date(today); isoDateMinus7.setDate(today.getDate() - 7);
	const isoDateMinus6 = new Date(today); isoDateMinus6.setDate(today.getDate() - 6);
	const isoDateMinus5 = new Date(today); isoDateMinus5.setDate(today.getDate() - 5);
	const isoDateMinus4 = new Date(today); isoDateMinus4.setDate(today.getDate() - 4);
	const isoDateMinus3 = new Date(today); isoDateMinus3.setDate(today.getDate() - 3);
	const isoDateMinus2 = new Date(today); isoDateMinus2.setDate(today.getDate() - 2);
	const isoDateMinus1 = new Date(today); isoDateMinus1.setDate(today.getDate() - 1);

	const isoDateToday = new Date(today); // today at midnight

	const isoDatePlus1 = new Date(today); isoDatePlus1.setDate(today.getDate() + 1);
	const isoDatePlus2 = new Date(today); isoDatePlus2.setDate(today.getDate() + 2);
	const isoDatePlus3 = new Date(today); isoDatePlus3.setDate(today.getDate() + 3);
	const isoDatePlus4 = new Date(today); isoDatePlus4.setDate(today.getDate() + 4);
	const isoDatePlus5 = new Date(today); isoDatePlus5.setDate(today.getDate() + 5);
	const isoDatePlus6 = new Date(today); isoDatePlus6.setDate(today.getDate() + 6);
	const isoDatePlus7 = new Date(today); isoDatePlus7.setDate(today.getDate() + 7);

	// Add this to minus one hour. isoDatePlus1.setHours(isoDatePlus1.getHours() - 1);
	const isoDateTodayPlus6Hour = new Date(new Date(new Date().setHours(0, 0, 0, 0)).setHours(6));

	// Convert to ISO strings (UTC-based)
	const isoDateMinus7Str = isoDateMinus7.toISOString();
	const isoDateMinus6Str = isoDateMinus6.toISOString();
	const isoDateMinus5Str = isoDateMinus5.toISOString();
	const isoDateMinus4Str = isoDateMinus4.toISOString();
	const isoDateMinus3Str = isoDateMinus3.toISOString();
	const isoDateMinus2Str = isoDateMinus2.toISOString();
	const isoDateMinus1Str = isoDateMinus1.toISOString();
	const isoDateTodayStr = isoDateToday.toISOString();
	const isoDatePlus1Str = isoDatePlus1.toISOString();
	const isoDatePlus2Str = isoDatePlus2.toISOString();
	const isoDatePlus3Str = isoDatePlus3.toISOString();
	const isoDatePlus4Str = isoDatePlus4.toISOString();
	const isoDatePlus5Str = isoDatePlus5.toISOString();
	const isoDatePlus6Str = isoDatePlus6.toISOString();
	const isoDatePlus7Str = isoDatePlus7.toISOString();

	const isoDateTodayPlus6HoursStr = isoDateTodayPlus6Hour.toISOString();
	console.log("isoDateTodayPlus6HoursStr: ", isoDateTodayPlus6HoursStr);

	console.log("isoDateTodayStr: ", isoDateTodayStr);

	// Get current date and time
	const currentDateTime = new Date();
	const currentDateTimeIso = currentDateTime.toISOString();

	const currentDateTimeMinus2Hours = subtractHoursFromDate(currentDateTime, 2);
	const currentDateTimeMinus2HoursIso = currentDateTimeMinus2Hours.toISOString();

	const currentDateTimeMinus8Hours = subtractHoursFromDate(currentDateTime, 8);
	const currentDateTimeMinus8HoursIso = currentDateTimeMinus8Hours.toISOString();

	const currentDateTimeMinus24Hours = subtractHoursFromDate(currentDateTime, 24);
	const currentDateTimeMinus24HoursIso = currentDateTimeMinus24Hours.toISOString();

	const currentDateTimeMinus30Hours = subtractHoursFromDate(currentDateTime, 30);
	const currentDateTimeMinus30HoursIso = currentDateTimeMinus30Hours.toISOString();

	const currentDateTimeMinus60Hours = subtractHoursFromDate(currentDateTime, 60);
	const currentDateTimeMinus60HoursIso = currentDateTimeMinus60Hours.toISOString();

	const currentDateTimePlus30Hours = plusHoursFromDate(currentDateTime, 30);
	const currentDateTimePlus30HoursIso = currentDateTimePlus30Hours.toISOString();

	const currentDateTimePlus1Day = addDaysToDate(currentDateTime, 1);
	const currentDateTimePlus1DayIso = currentDateTimePlus1Day.toISOString();

	const currentDateTimePlus4Days = addDaysToDate(currentDateTime, 4);
	const currentDateTimePlus4DaysIso = currentDateTimePlus4Days.toISOString();

	const currentDateTimePlus7Days = addDaysToDate(currentDateTime, 7);
	const currentDateTimePlus7DaysIso = currentDateTimePlus7Days.toISOString();

	const currentDateTimeMinus1Day = minusDaysToDate(currentDateTime, 1);
	const currentDateTimeMinus1DayIso = currentDateTimeMinus1Day.toISOString();

	console.log("currentDateTimeIso: ", currentDateTimeIso);

	combinedDataReservoir.forEach((basin) => {
		const headerRow = table.insertRow();

		// Create a new table cell for basin that spans 14 columns
		const basinCell = document.createElement('th');
		basinCell.classList.add("basin");
		basinCell.textContent = basin.id;
		basinCell.colSpan = 14;
		basinCell.style.textAlign = "left";
		headerRow.appendChild(basinCell);

		basin['assigned-locations'].forEach((location) => {

			//==============================================================================================================================================
			// LAKE
			//==============================================================================================================================================
			if (display_type === 'Lake') {
				// =====================
				// ======= ROW 1 ======= (STAGE, UTIL, INFLOW, OUTFLOW & RULE CURVE)
				// =====================
				(() => {
					// Create a new row for each lake data entry
					const row = table.insertRow();

					// 01-Lake
					(() => {
						// Create a new table cell for lake name
						const lakeTd = document.createElement('td');
						lakeTd.colSpan = 1;
						lakeTd.classList.add('Font_20');
						lakeTd.style.width = '15%';

						// Initialize lakeCellInnerHTML as an empty string
						let lakeCellInnerHTML = '--';

						// Update the inner HTML of the cell with data, preserving HTML
						lakeCellInnerHTML = "<span>" + location['metadata']['public-name'] + "</span>";
						// console.log('lakeCellInnerHTML =', lakeCellInnerHTML);
						lakeTd.innerHTML = lakeCellInnerHTML;

						row.appendChild(lakeTd);
					})();

					// 02-Midnight Level and 03-Delta Level
					(() => {
						const stageTd = document.createElement('td');
						const deltaTd = document.createElement('td');

						stageTd.style.width = "12%";
						deltaTd.style.width = "10%";

						stageTd.classList.add('Font_20');
						deltaTd.classList.add('Font_20');

						const floodValue = location['flood'] ? location['flood']['constant-value'] : null;
						const stageTsid = location?.['tsid-stage']?.['assigned-time-series']?.[0]?.['timeseries-id'] ?? null;

						if (stageTsid) {
							fetchAndUpdateStageMidnightTd(stageTd, deltaTd, stageTsid, floodValue, currentDateTimeIso, currentDateTimeMinus60HoursIso, setBaseUrl);
						}

						row.appendChild(stageTd);
						row.appendChild(deltaTd);
					})();

					// 04-Consr and 05-Flood Storage
					(() => {
						const ConsrTd = document.createElement('td');
						const FloodTd = document.createElement('td');

						ConsrTd.classList.add('Font_20');
						FloodTd.classList.add('Font_20');

						ConsrTd.style.width = '7%';
						FloodTd.style.width = '7%';

						const topOfConservationLevel = location['top-of-conservation']?.['constant-value'] || null;
						// console.log("topOfConservationLevel: ", topOfConservationLevel);

						const bottomOfConservationLevel = location['bottom-of-conservation']?.['constant-value'] || null;
						// console.log("bottomOfConservationLevel: ", bottomOfConservationLevel);

						const topOfFloodLevel = location['top-of-flood']?.['constant-value'] || null;
						// console.log("topOfFloodLevel: ", topOfFloodLevel);

						const bottomOfFloodLevel = location['bottom-of-flood']?.['constant-value'] || null;
						// console.log("bottomOfFloodLevel: ", bottomOfFloodLevel);

						const storageTsid = location?.['tsid-lake-storage']?.['assigned-time-series']?.[0]?.['timeseries-id'] ?? null;

						if (storageTsid) {
							fetchAndUpdateStorageTd(ConsrTd, FloodTd, storageTsid, currentDateTimeIso, currentDateTimeMinus60HoursIso, setBaseUrl, topOfConservationLevel, bottomOfConservationLevel, topOfFloodLevel, bottomOfFloodLevel);
						} else {
							ConsrTd.textContent = "--";
							FloodTd.textContent = "--";
						}

						row.appendChild(ConsrTd);
						row.appendChild(FloodTd);
					})();

					// 06-Precip
					(() => {
						const precipTd = document.createElement('td');
						precipTd.style.width = "9%";
						precipTd.classList.add('Font_20');

						const precipLakeTsid = location?.['tsid-lake-precip']?.['assigned-time-series']?.[0]?.['timeseries-id'] ?? null;

						if (precipLakeTsid) {
							fetchAndUpdatePrecipTd(precipTd, precipLakeTsid, currentDateTimeIso, currentDateTimeMinus60HoursIso, setBaseUrl);
						} else {
							precipTd.textContent = "--";
						}

						row.appendChild(precipTd);
					})();

					// 07-Yesterdays Inflow
					(() => {
						const yesterdayInflowTd = document.createElement('td');
						yesterdayInflowTd.style.width = "9%";
						yesterdayInflowTd.classList.add('Font_20');

						const yesterdayInflowTsid = location?.['tsid-lake-inflow-yesterday']?.['assigned-time-series']?.[0]?.['timeseries-id'] ?? null;

						if (yesterdayInflowTsid) {
							fetchAndUpdateYesterdayInflowTd(yesterdayInflowTd, yesterdayInflowTsid, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus60Hours, setBaseUrl);
						} else {
							yesterdayInflowTd.textContent = "--";
						}

						row.appendChild(yesterdayInflowTd);
					})();

					// 08-Midnight Controlled Outflow and 09-Evening Controlled Outflow
					(() => {
						let midnightControlledOutflowTd = document.createElement('td');
						let eveningControlledOutflowTd = document.createElement('td');

						midnightControlledOutflowTd.classList.add('Font_20');
						eveningControlledOutflowTd.classList.add('Font_20');

						midnightControlledOutflowTd.style.width = "8.5%";
						eveningControlledOutflowTd.style.width = "8.5%";

						midnightControlledOutflowTd.textContent = "";
						eveningControlledOutflowTd.textContent = "";

						const outflowTotalLakeTsid = location?.['tsid-outflow-total-lake']?.['assigned-time-series']?.[0]?.['timeseries-id'] ?? null;
						const gateTotalLakeTsid = location?.['tsid-gate-total-lake']?.['assigned-time-series']?.[0]?.['timeseries-id'] ?? null;
						const forecastLakeTsid = location?.['tsid-forecast-lake']?.['assigned-time-series']?.[0]?.['timeseries-id'] ?? null;

						if (location['metadata'][`public-name`] === "Shelbyville Pool" || location['metadata'][`public-name`] === "Carlyle Pool") {
							if (outflowTotalLakeTsid) {
								fetchAndUpdateControlledOutflowTd(outflowTotalLakeTsid, isoDateTodayStr, isoDatePlus1Str, setBaseUrl)
									.then(data => {
										// console.log("Fetched outflowTotalLakeTsid data:", data);
										const value = data?.values?.[0]?.[1];
										midnightControlledOutflowTd.textContent = value !== null && value !== undefined ? value.toFixed(0) : "--";
									})
									.catch(error => {
										console.error("Error during fetch:", error);
									});
							}
						}

						if (location['metadata'][`public-name`] === "Wappapello Pool" || location['metadata'][`public-name`] === "Mark Twain Pool") {
							if (gateTotalLakeTsid) {
								fetchAndUpdateControlledOutflowTd(gateTotalLakeTsid, isoDateTodayStr, isoDatePlus1Str, setBaseUrl)
									.then(data => {
										// console.log("Fetched gateTotalLakeTsid data:", data);
										const value = data?.values?.[0]?.[1];
										midnightControlledOutflowTd.textContent = value !== null && value !== undefined ? value.toFixed(0) : "--";
									})
									.catch(error => {
										console.error("Error during fetch:", error);
									});
							}
						}


						if (forecastLakeTsid) {
							fetchAndUpdateForecastTd(forecastLakeTsid, isoDateTodayStr, isoDatePlus1Str, isoDateTodayPlus6HoursStr, setBaseUrl)
								.then(data => {
									// console.log("Fetched forecastLakeTsid data:", data);
									const value = data?.values?.[0]?.[1];
									eveningControlledOutflowTd.textContent = value !== null && value !== undefined ? value.toFixed(0) : "--";
									if (location['metadata'][`public-name`] === "Rend Pool") {
										// TODO: what is the midnight outflow for Rend?
										midnightControlledOutflowTd.textContent = value !== null && value !== undefined ? value.toFixed(0) : "--";
									}
								})
								.catch(error => {
									console.error("Error during fetch:", error);
								});
						}

						row.appendChild(midnightControlledOutflowTd);
						row.appendChild(eveningControlledOutflowTd);
					})();

					// 10-Seasonal Rule Curve
					(() => {
						const seasonalRuleCurveTd = document.createElement('td');
						seasonalRuleCurveTd.classList.add('Font_20');

						// fetchAndLogSeasonalRuleCurveDataTd(location['location-id'], seasonalRuleCurveTd, setJsonFileBaseUrl);
						const seasonalRuleCurveValue = location['seasonal-rule-curve'][`constant-value`];
						if (seasonalRuleCurveValue) {
							seasonalRuleCurveTd.textContent = seasonalRuleCurveValue.toFixed(2);
						} else {
							seasonalRuleCurveTd.textContent = "--";
						}
						row.appendChild(seasonalRuleCurveTd);
					})();
				})();

				// ====================================================================================
				// ======= ROW 2 ======= CREST, TW DO, GAGED OUTFLOW AND RULECURVE
				// ====================================================================================

				(() => {
					// Create and add the second new row
					const row2 = table.insertRow();

					// ======= BLANK =======
					(() => {
						// Create a new table cell for lake name in the second row
						const blankTd = row2.insertCell(0);
						blankTd.colSpan = 1;
						blankTd.classList.add('Font_15');
						blankTd.style.width = '15%';

						// Initialize lakeCellInnerHTML as an empty string for the second row
						let blankCellInnerHTML = '--';

						// Update the inner HTML of the cell with data for the second row, preserving HTML
						blankCellInnerHTML = " ... ";
						// console.log('blankCellInnerHTML =', blankCellInnerHTML);

						blankTd.innerHTML = blankCellInnerHTML;
					})();

					// ======= CREST =======
					(() => {
						// Create a new table cell for lake name
						const crestTd = row2.insertCell(1);
						crestTd.colSpan = 2;
						crestTd.classList.add('Font_15');
						crestTd.style.width = '10%';
						crestTd.style.backgroundColor = '#404040';
						crestTd.style.color = 'lightgray';
						crestTd.style.textAlign = 'left';
						crestTd.style.paddingLeft = '10px';

						let crestCellInnerHTML = 'Crest:  ';

						const crestPoolForecastTsid = location?.['tsid-crest-forecast-lake']?.['assigned-time-series']?.[0]?.['timeseries-id'] ?? null;

						function getTodayAtSixCentral() {
							const today = new Date();
							const utcOffset = today.getTimezoneOffset();
							const isDST = (utcOffset === 300);
							const offset = isDST ? -5 : -6;

							const centralTime = new Date(today);
							centralTime.setHours(6, 0, 0, 0);
							centralTime.setMinutes(centralTime.getMinutes() - (utcOffset + (offset * 60)));

							const year = centralTime.getUTCFullYear();
							const month = String(centralTime.getUTCMonth() + 1).padStart(2, '0');
							const day = String(centralTime.getUTCDate()).padStart(2, '0');

							return `${year}-${month}-${day}T06:00:00.000Z`;
						}

						const dateAtSixCentral = getTodayAtSixCentral();

						if (crestPoolForecastTsid !== null) {
							const url = `${setBaseUrl}timeseries?name=${crestPoolForecastTsid}&begin=${currentDateTime.toISOString()}&end=${currentDateTimePlus7Days.toISOString()}&office=${office}&version-date=${dateAtSixCentral}`;

							fetch(url, {
								method: 'GET',
								headers: {
									'Accept': 'application/json;version=2'
								}
							})
								.then(response => {
									if (!response.ok) {
										throw new Error('Network response was not ok');
									}
									return response.json();
								})
								.then(data => {
									let valueLast = '';
									let valueLastDate = '';
									let valueLastQualityCode = '';

									if (
										data &&
										Array.isArray(data.values) &&
										data.values.length > 0 &&
										Array.isArray(data.values[0])
									) {
										const rawStage = data.values[0][1];
										const rawDate = data.values[0][0];
										const rawQualityCode = data.values[0][2];

										valueLast = isFinite(rawStage) ? Number(rawStage).toFixed(2) : '';
										valueLastDate = rawDate ? formatNWSDate(rawDate).split(' ')[0] : '';
										valueLastQualityCode = isFinite(rawQualityCode) ? Number(rawQualityCode) : '';
									}

									let label = null;
									if (valueLastQualityCode === 1) {
										label = "=" + " " + valueLast + " " + data.units;
									} else if (valueLastQualityCode === 3) {
										label = "<" + " " + valueLast + " " + data.units;
									} else if (valueLastQualityCode === 5) {
										label = "Cresting";
									} else if (valueLastQualityCode === 9) {
										label = "Crested";
									} else {
										label = " ";
									}

									crestTd.innerHTML = crestCellInnerHTML + label;
								})
								.catch(error => {
									console.error("Error fetching or processing data:", error);
									crestTd.innerHTML = crestCellInnerHTML + 'N/A';
								});
						} else {
							crestTd.innerHTML = crestCellInnerHTML + 'N/A';
						}
					})();

					// ======= BLANK =======
					(() => {
						// Create a new table cell for lake name
						const blankblankCell = row2.insertCell(2);
						blankblankCell.colSpan = 2;
						blankblankCell.classList.add('Font_15');
						blankblankCell.style.width = '10%';
						blankblankCell.style.backgroundColor = '#404040';
						blankblankCell.style.color = 'lightgray';

						// Initialize twDoCellInnerHTML as an empty string
						let blankblankCellInnerHTML = '--';

						blankblankCellInnerHTML = "<span style='float: left; padding-left: 15px;'>" + "" + "</span>";
						blankblankCellInnerHTML += "<span style='float: left; padding-left: 15px; color: lightblue;'>" + "" + "</span>";

						// Set the combined value to the cell, preserving HTML
						// console.log("blankblankCellInnerHTML = ", blankblankCellInnerHTML);

						// Set the HTML inside the cell once the fetch is complete
						blankblankCell.innerHTML = blankblankCellInnerHTML;
					})();

					// ======= TW DO =======
					(() => {
						// Create a new table cell for lake name
						const twDoCell = row2.insertCell(3);
						twDoCell.colSpan = 2;
						twDoCell.classList.add('Font_15');
						twDoCell.style.width = '10%';
						twDoCell.style.backgroundColor = '#404040';
						twDoCell.style.color = 'lightgray';
						twDoCell.style.textAlign = 'center';

						let twDoInnerHTML = 'TW DO:  ';

						const doTsid = location?.['tsid-do-lake']?.['assigned-time-series']?.[0]?.['timeseries-id'] ?? null;

						if (doTsid !== null) {
							const url = `${setBaseUrl}timeseries?name=${doTsid}&begin=${currentDateTimeMinus60HoursIso}&end=${currentDateTimeIso}&office=${office}`;

							fetch(url, {
								method: 'GET',
								headers: {
									'Accept': 'application/json;version=2'
								}
							})
								.then(response => {
									if (!response.ok) {
										throw new Error('Network response was not ok');
									}
									return response.json();
								})
								.then(data => {
									data.values.forEach(entry => {
										entry[0] = formatNWSDate(entry[0]);
									});

									// console.log("data: ", data);

									const c_count = calculateCCount(doTsid);
									// console.log("c_count: ", c_count);

									const lastNonNullValue = getLastNonNullMidnightValue(data, data.name, c_count);
									console.log("lastNonNullValue:", lastNonNullValue);

									let valueLast = null;
									let timestampLast = null;

									if (lastNonNullValue.current6am !== null && lastNonNullValue.valueCountRowsBefore !== null) {
										timestampLast = lastNonNullValue.current6am.timestamp;
										valueLast = parseFloat(lastNonNullValue.current6am.value).toFixed(2);
									}
									// console.log("valueLast:", valueLast);
									// console.log("timestampLast:", timestampLast);

									let value24HoursLast = null;
									let timestamp24HoursLast = null;

									if (lastNonNullValue.current6am !== null && lastNonNullValue.valueCountRowsBefore !== null) {
										timestamp24HoursLast = lastNonNullValue.valueCountRowsBefore.timestamp;
										value24HoursLast = parseFloat(lastNonNullValue.valueCountRowsBefore.value).toFixed(2);
									}

									// console.log("value24HoursLast:", value24HoursLast);
									// console.log("timestamp24HoursLast:", timestamp24HoursLast);

									let delta_24 = null;

									// Check if the values are numbers and not null/undefined
									if (valueLast !== null && value24HoursLast !== null && !isNaN(valueLast) && !isNaN(value24HoursLast)) {
										delta_24 = (valueLast - value24HoursLast).toFixed(2);
									} else {
										delta_24 = "--";  // or set to "-1" or something else if you prefer
									}
									// console.log("delta_24:", delta_24);

									// Make sure delta_24 is a valid number before calling parseFloat
									if (delta_24 !== "--" && delta_24 !== null && delta_24 !== undefined) {
										delta_24 = parseFloat(delta_24).toFixed(2);
									} else {
										delta_24 = "--";
									}

									let innerHTML;
									if (valueLast === null) {
										innerHTML = twDoInnerHTML + "<span class='missing'>-M-</span>";
									} else {
										innerHTML = twDoInnerHTML + `<span title='${timestampLast}'>${valueLast} (${delta_24}) ${data.units}</span>`;
									}

									twDoCell.innerHTML = innerHTML;
								})
								.catch(error => {
									console.error("Error fetching or processing data:", error);
									twDoCell.innerHTML = 'N/A';
								});
						} else {
							twDoCell.innerHTML = '';
						}
					})();

					// // ======= GAGED OUTFLOW =======
					// if ("gagedoutflow" === "gagedoutflow") {
					// 	// Create a new table cell for lake name
					// 	const gagedOutflowCell = row2.insertCell(4);
					// 	gagedOutflowCell.colSpan = 1;
					// 	gagedOutflowCell.classList.add('Font_15');
					// 	gagedOutflowCell.style.width = '10%';
					// 	gagedOutflowCell.style.backgroundColor = '#404040';
					// 	gagedOutflowCell.style.color = 'lightgray';

					// 	// Initialize gagedOutflowCellInnerHTML as an empty string
					// 	let gagedOutflowCellInnerHTML = '--';

					// 	let tsid = null;
					// 	if (data.display_stage_29 === true) {
					// 		tsid = data.tsid_gaged_outflow_board
					// 	} else {
					// 		tsid = data.tsid_gaged_outflow_board
					// 	}

					// 	if (tsid !== null) {
					// 		// Fetch the time series data from the API using the determined query string
					// 		let url = null;
					// 		if (cda === "public") {
					// 			url = `https://cwms-data.usace.army.mil/cwms-data/timeseries?name=${tsid}&begin=${currentDateTimeMinus30Hours.toISOString()}&end=${currentDateTime.toISOString()}&office=MVS`;
					// 		} else if (cda === "internal") {
					// 			url = `https://coe-mvsuwa04mvs.mvs.usace.army.mil:8243/mvs-data/timeseries?name=${tsid}&begin=${currentDateTimeMinus30Hours.toISOString()}&end=${currentDateTime.toISOString()}&office=MVS`;
					// 		} else {

					// 		}
					// 		// console.log("url = ", url);
					// 		fetch(url, {
					// 			method: 'GET',
					// 			headers: {
					// 				'Accept': 'application/json;version=2'
					// 			}
					// 		})
					// 			.then(response => {
					// 				// Check if the response is ok
					// 				if (!response.ok) {
					// 					// If not, throw an error
					// 					throw new Error('Network response was not ok');
					// 				}
					// 				// If response is ok, parse it as JSON
					// 				return response.json();
					// 			})
					// 			.then(data => {
					// 				// console.log("data:", data);

					// 				// Convert timestamps in the JSON object
					// 				data.values.forEach(entry => {
					// 					entry[0] = formatNWSDate(entry[0]); // Update timestamp
					// 				});

					// 				// console.log("data formatted = ", data);

					// 				// Get the last non-null value from the stage data
					// 				const lastNonNullValue = getLastNonNullValue(data);
					// 				// console.log("lastNonNullValue:", lastNonNullValue);

					// 				// Check if a non-null value was found
					// 				if (lastNonNullValue !== null) {
					// 					// Extract timestamp, value, and quality code from the last non-null value
					// 					var timestampLast = lastNonNullValue.timestamp;
					// 					var valueLast = lastNonNullValue.value;
					// 					var qualityCodeLast = lastNonNullValue.qualityCode;
					// 					// console.log("timestampLast:", timestampLast);
					// 					// console.log("timestampLast:", typeof (timestampLast));
					// 					// console.log("valueLast:", valueLast);
					// 					// console.log("qualityCodeLast:", qualityCodeLast);
					// 				} else {
					// 					// If no non-null valueLast is found, log a message
					// 					console.log("No non-null valueLast found.");
					// 				}

					// 				const c_count = calculateCCount(tsid);
					// 				// console.log("c_count:", c_count);

					// 				const lastNonNull24HoursValue = getLastNonNull24HoursValue(data, c_count);
					// 				// console.log("lastNonNull24HoursValue:", lastNonNull24HoursValue);

					// 				// Check if a non-null value was found
					// 				if (lastNonNull24HoursValue !== null) {
					// 					// Extract timestamp, value, and quality code from the last non-null value
					// 					var timestamp24HoursLast = lastNonNull24HoursValue.timestamp;
					// 					var value24HoursLast = lastNonNull24HoursValue.value;
					// 					var qualityCode24HoursLast = lastNonNull24HoursValue.qualityCode;

					// 					// console.log("timestamp24HoursLast:", timestamp24HoursLast);
					// 					// console.log("value24HoursLast:", value24HoursLast);
					// 					// console.log("qualityCode24HoursLast:", qualityCode24HoursLast);
					// 				} else {
					// 					// If no non-null valueLast is found, log a message
					// 					console.log("No non-null valueLast found.");
					// 				}

					// 				// Calculate the 24 hours change between first and last value
					// 				const delta_24 = valueLast - value24HoursLast;
					// 				// console.log("delta_24:", delta_24);

					// 				if (valueLast !== null || valueLast !== undefined) {
					// 					gagedOutflowCellInnerHTML = "<span>"
					// 						+ "Gaged Outflow: " + valueLast.toFixed(0) + " (" + delta_24.toFixed(0) + ")"
					// 						+ "</span>";
					// 				} else {
					// 					gagedOutflowCellInnerHTML = "<span class='missing'>" + "-M-" + "</span>"
					// 				}
					// 				gagedOutflowCell.innerHTML = gagedOutflowCellInnerHTML;
					// 			})
					// 			.catch(error => {
					// 				// Catch and log any errors that occur during fetching or processing
					// 				console.error("Error fetching or processing data:", error);
					// 			});
					// 	}

					// 	// // Create an object to hold all the properties you want to pass
					// 	// const gagedOutflowToSend = {
					// 	// 	cwms_ts_id: encodeURIComponent(data.tsid_gaged_outflow_board),
					// 	// };
					// 	// // console.log("gagedOutflowToSend: " + gagedOutflowToSend);

					// 	// const gagedOutflowLocationToSend = {
					// 	// 	location_id: encodeURIComponent(data.location_id),
					// 	// };
					// 	// // console.log("gagedOutflowLocationToSend: " + gagedOutflowLocationToSend);

					// 	// // Convert the object into a query string
					// 	// const gagedOutflowQueryString = Object.keys(gagedOutflowToSend).map(key => key + '=' + gagedOutflowToSend[key]).join('&');
					// 	// // console.log("gagedOutflowQueryString: " + gagedOutflowQueryString);

					// 	// const lowerUpperFlowLimitQueryString = Object.keys(gagedOutflowToSend).map(key => key + '=' + gagedOutflowToSend[key]).join('&');
					// 	// // console.log("lowerUpperFlowLimitQueryString: " + lowerUpperFlowLimitQueryString);

					// 	// const bankfullFlowLimitQueryString = Object.keys(gagedOutflowLocationToSend).map(key => key + '=' + gagedOutflowLocationToSend[key]).join('&');
					// 	// // console.log("bankfullFlowLimitQueryString: " + bankfullFlowLimitQueryString);

					// 	// // Make an AJAX request to the PHP script, passing all the variables
					// 	// var urlGagedOutFlow = `https://coe-mvsuwa04mvs.mvs.usace.army.mil/php_data_api/public/get_level.php?${gagedOutflowQueryString}`;
					// 	// // console.log("urlGagedOutFlow: " , urlGagedOutFlow);

					// 	// var urlLowerUpperFlowLimit = `https://coe-mvsuwa04mvs.mvs.usace.army.mil/php_data_api/public/get_lower_upper_flow_limit_by_tsid.php?${lowerUpperFlowLimitQueryString}`;
					// 	// // console.log("urlLowerUpperFlowLimit: " , urlLowerUpperFlowLimit);

					// 	// var urlBankfullFlowLimit = `https://coe-mvsuwa04mvs.mvs.usace.army.mil/php_data_api/public/get_bankfull_by_location_id.php?${bankfullFlowLimitQueryString}`;
					// 	// // console.log("urlBankfullFlowLimit: " , urlBankfullFlowLimit);

					// 	// async function fetchGagedOutflow() {
					// 	// 	try {
					// 	// 		const response = await fetch(urlGagedOutFlow);
					// 	// 		const gaged_outflow = await response.json();
					// 	// 		return gaged_outflow;
					// 	// 	} catch (error) {
					// 	// 		console.error("Error fetching data:", error);
					// 	// 		throw error; // Propagate the error to the caller
					// 	// 	}
					// 	// }

					// 	// async function fetchLowerUpperFlowLimit() {
					// 	// 	try {
					// 	// 		const response = await fetch(urlLowerUpperFlowLimit);
					// 	// 		const lower_upper_flow_limit = await response.json();
					// 	// 		return lower_upper_flow_limit;
					// 	// 	} catch (error) {
					// 	// 		console.error("Error fetching data:", error);
					// 	// 		throw error; // Propagate the error to the caller
					// 	// 	}
					// 	// }

					// 	// async function fetchBankfullFlowLimit() {
					// 	// 	try {
					// 	// 		const response = await fetch(urlBankfullFlowLimit);
					// 	// 		const bankfull_flow_limit = await response.json();
					// 	// 		return bankfull_flow_limit;
					// 	// 	} catch (error) {
					// 	// 		console.error("Error fetching data:", error);
					// 	// 		throw error; // Propagate the error to the caller
					// 	// 	}
					// 	// }

					// 	// // Call the asynchronous functions
					// 	// Promise.all([fetchGagedOutflow(), fetchLowerUpperFlowLimit(), fetchBankfullFlowLimit()])
					// 	// 	.then(([gaged_outflow, lower_upper_flow_limit, bankfull_flow_limit]) => {
					// 	// 		if (gaged_outflow && lower_upper_flow_limit && bankfull_flow_limit) {

					// 	// 			// console.log("gaged_outflow = ", gaged_outflow);
					// 	// 			// console.log("lower_upper_flow_limit = ", lower_upper_flow_limit);
					// 	// 			// console.log("bankfull_flow_limit = ", bankfull_flow_limit);

					// 	// 			// Extract lower and upper flow limits
					// 	// 			const lowerFlowLimit = parseFloat(lower_upper_flow_limit[0].constant_level);
					// 	// 			const upperFlowLimit = parseFloat(lower_upper_flow_limit[1].constant_level);
					// 	// 			const bankfullFlowLimit = parseFloat(bankfull_flow_limit.constant_level);

					// 	// 			// Extract lower and upper flow limit units
					// 	// 			const lowerFlowLimitUnit = lower_upper_flow_limit[0].level_unit;
					// 	// 			const upperFlowLimitUnit = lower_upper_flow_limit[1].level_unit;
					// 	// 			const bankfullFlowLimitUnit = bankfull_flow_limit.level_unit;

					// 	// 			// Now you can use lowerFlowLimit and upperFlowLimit as needed
					// 	// 			// console.log("lowerFlowLimit: ", lowerFlowLimit);
					// 	// 			// console.log("upperFlowLimit: ", upperFlowLimit);
					// 	// 			// console.log("bankfullFlowLimit: ", bankfullFlowLimit);

					// 	// 			const gaged_outflow_value = parseFloat(gaged_outflow.value);
					// 	// 			// console.log("gaged_outflow_value: ", gaged_outflow_value);

					// 	// 			const gaged_outflow_date_time_cst = gaged_outflow.date_time_cst;
					// 	// 			// console.log("gaged_outflow_date_time_cst = ", gaged_outflow_date_time_cst);
					// 	// 			var dateParts = gaged_outflow_date_time_cst.split(" ");
					// 	// 			var date = dateParts[0];
					// 	// 			var time = dateParts[1];
					// 	// 			var [month, day, year] = date.split("-");
					// 	// 			var [hours, minutes] = time.split(":");
					// 	// 			var gaged_outflow_date_time_cst_formatted = new Date(`${year}-${month}-${day}T${hours}:${minutes}:00`);
					// 	// 			// console.log("gaged_outflow_date_time_cst_formatted", gaged_outflow_date_time_cst_formatted);
					// 	// 			// console.log("gaged_outflow_date_time_cst_formatted: ", typeof gaged_outflow_date_time_cst_formatted);

					// 	// 			// Get the current date as a Date object
					// 	// 			const currentDate = new Date();
					// 	// 			// Subtract 2 hours (2 * 60 * 60 * 1000 milliseconds)
					// 	// 			const currentDateStageMinusTwoHours = new Date(currentDate.getTime() - (2 * 60 * 60 * 1000));
					// 	// 			// Subtract 2 hours (2 * 60 * 60 * 1000 milliseconds)
					// 	// 			const currentDateStageMinusOneDay = new Date(currentDate.getTime() - (24 * 60 * 60 * 1000));

					// 	// 			// console.log("currentDateStage:", currentDate);
					// 	// 			// console.log("currentDateStageMinusTwoHours:", currentDateStageMinusTwoHours);
					// 	// 			// console.log("currentDateStageMinusOneDay:", currentDateStageMinusOneDay);

					// 	// 			// Lower Upper Limit Class
					// 	// 			if (gaged_outflow_value > bankfullFlowLimit) {
					// 	// 				// console.log("Bankfull Flow Above Limit");
					// 	// 				var myFlowLimitClass = "Bankfull_Limit";
					// 	// 			} else {
					// 	// 				// console.log("Bankfull Flow Within Limit");
					// 	// 				var myFlowLimitClass = "--";
					// 	// 			}

					// 	// 			// CHECK DATA LATE
					// 	// 			if (gaged_outflow_date_time_cst_formatted < currentDateStageMinusOneDay) { 					// MISSING
					// 	// 				gagedOutflowCellInnerHTML = "<span style='float: left; padding-left: 15px;'>" + "</span>";
					// 	// 			} else if (gaged_outflow_date_time_cst_formatted < currentDateStageMinusTwoHours) { 		// LATE
					// 	// 				gagedOutflowCellInnerHTML = "<span style='float: left; padding-left: 15px;'>Gaged Outflow: " + "</span>";
					// 	// 				gagedOutflowCellInnerHTML += "<span id='flashingSpan' class='" + myFlowLimitClass + "' style='float: left; padding-left: 15px; font-style: italic;' title='" + gaged_outflow.cwms_ts_id + " " + gaged_outflow_date_time_cst_formatted + " Lower Limit: " + lowerFlowLimit.toFixed(0) + " " + lowerFlowLimitUnit + " Upper Limit: " + upperFlowLimit.toFixed(0) + " " + upperFlowLimitUnit + "'>" + parseFloat(gaged_outflow.value).toFixed(0) + " (" + parseFloat(gaged_outflow.delta_24).toFixed(0) + ") " + gaged_outflow.unit_id + "</span>";
					// 	// 			} else { 																					// CURRENT
					// 	// 				gagedOutflowCellInnerHTML = "<span style='float: left; padding-left: 15px;'>Gaged Outflow: " + "</span>";
					// 	// 				gagedOutflowCellInnerHTML += "<span id='flashingSpan' class='" + myFlowLimitClass + "' style='float: left; padding-left: 15px;' title='" + gaged_outflow.cwms_ts_id + " " + gaged_outflow_date_time_cst_formatted + " Lower Limit: " + lowerFlowLimit.toFixed(0) + " " + lowerFlowLimitUnit + " Upper Limit: " + upperFlowLimit.toFixed(0) + " " + upperFlowLimitUnit + " Bankfull = " + bankfullFlowLimit.toFixed(0) + " " + bankfullFlowLimitUnit + "'>" + parseFloat(gaged_outflow.value).toFixed(0) + " (" + parseFloat(gaged_outflow.delta_24).toFixed(0) + ") " + gaged_outflow.unit_id + "</span>";
					// 	// 			}

					// 	// 			// Set the combined value to the cell, preserving HTML
					// 	// 			// console.log("gagedOutflowCellInnerHTML = ", gagedOutflowCellInnerHTML);

					// 	// 			// Set the HTML inside the cell once the fetch is complete
					// 	// 			gagedOutflowCell.innerHTML = gagedOutflowCellInnerHTML;
					// 	// 		} else {
					// 	// 			console.log("No data fetched from either LWRP or stage API");
					// 	// 		}
					// 	// 	})
					// 	// 	.catch((error) => {
					// 	// 		console.error("Error:", error);
					// 	// 	});
					// }

					// // ======= SEASONAL RULE CURVE DELTA =======
					// if ("ruledelta" === "ruledelta") {
					// 	// Create a new table cell for lake name
					// 	const curveDeltaCell = row2.insertCell(5);
					// 	curveDeltaCell.colSpan = 1;
					// 	curveDeltaCell.classList.add('Font_15');
					// 	curveDeltaCell.style.width = '10%';
					// 	curveDeltaCell.style.backgroundColor = '#404040';
					// 	curveDeltaCell.style.color = 'lightgray';

					// 	// Initialize twDoCellInnerHTML as an empty string
					// 	let curveDeltaCellInnerHTML = '--';

					// 	// async function fetchStage29() {
					// 	// 	try {
					// 	// 		const response = await fetch(urlStage29);
					// 	// 		const stage29 = await response.json();
					// 	// 		return stage29;
					// 	// 	} catch (error) {
					// 	// 		console.error("Error fetching data:", error);
					// 	// 		throw error; // Propagate the error to the caller
					// 	// 	}
					// 	// }

					// 	// async function fetchRuleCurve() {
					// 	// 	try {
					// 	// 		const response = await fetch(urlRuleCurve);
					// 	// 		const rule_curve = await response.json();
					// 	// 		return rule_curve;
					// 	// 	} catch (error) {
					// 	// 		console.error("Error fetching data:", error);
					// 	// 		throw error; // Propagate the error to the caller
					// 	// 	}
					// 	// }

					// 	// // Call the asynchronous functions
					// 	// Promise.all([fetchStage29(), fetchRuleCurve()])
					// 	// 	.then(([stage29, rule_curve]) => {
					// 	// 		if (stage29 && rule_curve) {

					// 	// 			// console.log("stage29 = ", stage29);
					// 	// 			// console.log("rule_curve = ", rule_curve);

					// 	// 			let deltaRuleCurve = parseFloat(stage29.value).toFixed(2) - parseFloat(rule_curve[0].lev).toFixed(2);
					// 	// 			// console.log("deltaRuleCurve = ", deltaRuleCurve);

					// 	// 			// Add "+" for positive and "-" for negative values
					// 	// 			const deltaRuleCurveFormatted = deltaRuleCurve.toFixed(2) >= 0 ? `+${deltaRuleCurve.toFixed(2)}` : deltaRuleCurve.toFixed(2);
					// 	// 			// console.log("deltaRuleCurveFormatted = ", deltaRuleCurveFormatted);

					// 	// 			curveDeltaCellInnerHTML = "<span style='color: lightblue;' title='" + "Rule Curve Delta Compare to Current Pool Level" + "'>" + deltaRuleCurveFormatted + "</span>";

					// 	// 			// Set the combined value to the cell, preserving HTML
					// 	// 			// console.log("curveDeltaCellInnerHTML = ", curveDeltaCellInnerHTML);

					// 	// 			// Set the HTML inside the cell once the fetch is complete
					// 	// 			curveDeltaCell.innerHTML = curveDeltaCellInnerHTML;
					// 	// 		} else {
					// 	// 			console.log("No data fetched from API");
					// 	// 		}
					// 	// 	})
					// 	// 	.catch((error) => {
					// 	// 		console.error("Error:", error);
					// 	// 	});
					// }
				})();

				// ====================================================================================
				// ======= ROW 3 ======= (ONLY FOR MARKTWAIN, REREG, SCHD, GENERATION)
				// ====================================================================================

				// (() => {
				// 	if (data.location_id.split('-')[0] === "Mark Twain Lk") {
				// 		// Create and add the second new row
				// 		const row3 = table.insertRow();

				// 		// ======= BLANK =======
				// 		if ("blank" === "blank") {
				// 			// Create a new table cell for lake name in the second row
				// 			const blankCell3 = row3.insertCell(0);
				// 			blankCell3.colSpan = 1;
				// 			blankCell3.classList.add('Font_15');
				// 			blankCell3.style.color = 'white';

				// 			// Initialize lakeCellInnerHTML as an empty string for the second row
				// 			let blankCell3InnerHTML = '--';

				// 			// Update the inner HTML of the cell with data for the second row, preserving HTML
				// 			blankCell3InnerHTML = "-"; // Replace with the actual data for the second lake
				// 			// console.log('blankCell3InnerHTML =', blankCell3InnerHTML);
				// 			blankCell3.innerHTML = blankCell3InnerHTML;
				// 		}

				// 		// ======= REREG =======
				// 		if ("rereg" === "rereg") {
				// 			// Create a new table cell for lake name
				// 			const reregCell = row3.insertCell(1);
				// 			reregCell.colSpan = 2;
				// 			reregCell.classList.add('Font_15');
				// 			reregCell.style.width = '10%';
				// 			reregCell.style.backgroundColor = '#404040';
				// 			reregCell.style.color = 'lightgray';

				// 			// Initialize doCellInnerHTML as an empty string
				// 			let reregCellInnerHTML = '--';

				// 			let tsid = null;
				// 			if (data.display_stage_29 === true) {
				// 				tsid = data.tsid_rereg_board
				// 			} else {
				// 				tsid = data.tsid_rereg_board
				// 			}

				// 			if (tsid !== null) {
				// 				// Fetch the time series data from the API using the determined query string
				// 				let url = null;
				// 				if (cda === "public") {
				// 					url = `https://cwms-data.usace.army.mil/cwms-data/timeseries?name=${tsid}&begin=${currentDateTimeMinus30Hours.toISOString()}&end=${currentDateTime.toISOString()}&office=MVS`;
				// 				} else if (cda === "internal") {
				// 					url = `https://coe-mvsuwa04mvs.mvs.usace.army.mil:8243/mvs-data/timeseries?name=${tsid}&begin=${currentDateTimeMinus30Hours.toISOString()}&end=${currentDateTime.toISOString()}&office=MVS`;
				// 				} else {

				// 				}
				// 				// console.log("url = ", url);
				// 				fetch(url, {
				// 					method: 'GET',
				// 					headers: {
				// 						'Accept': 'application/json;version=2'
				// 					}
				// 				})
				// 					.then(response => {
				// 						// Check if the response is ok
				// 						if (!response.ok) {
				// 							// If not, throw an error
				// 							throw new Error('Network response was not ok');
				// 						}
				// 						// If response is ok, parse it as JSON
				// 						return response.json();
				// 					})
				// 					.then(data => {
				// 						// console.log("data:", data);

				// 						// Convert timestamps in the JSON object
				// 						data.values.forEach(entry => {
				// 							entry[0] = formatNWSDate(entry[0]); // Update timestamp
				// 						});

				// 						// console.log("data formatted = ", data);

				// 						// Get the last non-null value from the stage data
				// 						const lastNonNullValue = getLastNonNullValue(data);
				// 						// console.log("lastNonNullValue:", lastNonNullValue);

				// 						// Check if a non-null value was found
				// 						if (lastNonNullValue !== null) {
				// 							// Extract timestamp, value, and quality code from the last non-null value
				// 							var timestampLast = lastNonNullValue.timestamp;
				// 							var valueLast = lastNonNullValue.value;
				// 							var qualityCodeLast = lastNonNullValue.qualityCode;
				// 							// console.log("timestampLast:", timestampLast);
				// 							// console.log("timestampLast:", typeof (timestampLast));
				// 							// console.log("valueLast:", valueLast);
				// 							// console.log("qualityCodeLast:", qualityCodeLast);
				// 						} else {
				// 							// If no non-null valueLast is found, log a message
				// 							console.log("No non-null valueLast found.");
				// 						}

				// 						const c_count = calculateCCount(tsid);
				// 						// console.log("c_count:", c_count);

				// 						const lastNonNull24HoursValue = getLastNonNull24HoursValue(data, c_count);
				// 						// console.log("lastNonNull24HoursValue:", lastNonNull24HoursValue);

				// 						// Check if a non-null value was found
				// 						if (lastNonNull24HoursValue !== null) {
				// 							// Extract timestamp, value, and quality code from the last non-null value
				// 							var timestamp24HoursLast = lastNonNull24HoursValue.timestamp;
				// 							var value24HoursLast = lastNonNull24HoursValue.value;
				// 							var qualityCode24HoursLast = lastNonNull24HoursValue.qualityCode;

				// 							// console.log("timestamp24HoursLast:", timestamp24HoursLast);
				// 							// console.log("value24HoursLast:", value24HoursLast);
				// 							// console.log("qualityCode24HoursLast:", qualityCode24HoursLast);
				// 						} else {
				// 							// If no non-null valueLast is found, log a message
				// 							console.log("No non-null valueLast found.");
				// 						}

				// 						// Calculate the 24 hours change between first and last value
				// 						const delta_24 = valueLast - value24HoursLast;
				// 						// console.log("delta_24:", delta_24);

				// 						if (valueLast !== null || valueLast !== undefined) {
				// 							reregCellInnerHTML = "<span>"
				// 								+ "Re-Reg Pool: " + valueLast.toFixed(2) + " (" + delta_24.toFixed(2) + ")" + " ft"
				// 								+ "</span>";
				// 						} else {
				// 							reregCellInnerHTML = "<span class='missing'>" + "-M-" + "</span>"
				// 						}
				// 						reregCell.innerHTML = reregCellInnerHTML;
				// 					})
				// 					.catch(error => {
				// 						// Catch and log any errors that occur during fetching or processing
				// 						console.error("Error fetching or processing data:", error);
				// 					});
				// 			}
				// 		}

				// 		// ======= SCHD =======
				// 		if ("schd" === "schd") {
				// 			// Create a new table cell for lake name
				// 			const schdCell = row3.insertCell(2);
				// 			schdCell.colSpan = 1;
				// 			schdCell.classList.add('Font_15');
				// 			schdCell.style.width = '10%';
				// 			schdCell.style.backgroundColor = '#404040';
				// 			schdCell.style.color = 'lightgray';

				// 			// Initialize doCellInnerHTML as an empty string
				// 			let schdCellInnerHTML = '--';

				// 			// try {
				// 			// 	const ROutput = await fetchDataFromROutput();
				// 			// 	// console.log('ROutput:', ROutput);

				// 			// 	const filteredData = filterDataByLocationId(ROutput, data.location_id);
				// 			// 	// console.log("Filtered Data for", data.location_id + ":", filteredData);

				// 			// 	// // Update the HTML element with filtered data
				// 			// 	updateSchdHTML(filteredData, schdCell);

				// 			// 	// Further processing of ROutput data as needed
				// 			// } catch (error) {
				// 			// 	// Handle errors from fetchDataFromROutput
				// 			// 	console.error('Failed to fetch data:', error);
				// 			// }
				// 		}

				// 		// ======= REREG DO 1 =======
				// 		if ("reregdo" === "reregdo") {
				// 			// Create a new table cell for lake name
				// 			const reregDoCell = row3.insertCell(3);
				// 			reregDoCell.colSpan = 2;
				// 			reregDoCell.classList.add('Font_15');
				// 			reregDoCell.style.width = '10%';
				// 			reregDoCell.style.backgroundColor = '#404040';
				// 			reregDoCell.style.color = 'lightgray';

				// 			// Initialize doCellInnerHTML as an empty string
				// 			let reregDoCellInnerHTML = '--';

				// 			let tsid = null;
				// 			if (data.display_stage_29 === true) {
				// 				tsid = data.tsid_rereg_do
				// 			} else {
				// 				tsid = data.tsid_rereg_do
				// 			}

				// 			if (tsid !== null) {
				// 				// Fetch the time series data from the API using the determined query string
				// 				let url = null;
				// 				if (cda === "public") {
				// 					url = `https://cwms-data.usace.army.mil/cwms-data/timeseries?name=${tsid}&begin=${currentDateTimeMinus30Hours.toISOString()}&end=${currentDateTime.toISOString()}&office=MVS`;
				// 				} else if (cda === "internal") {
				// 					url = `https://coe-mvsuwa04mvs.mvs.usace.army.mil:8243/mvs-data/timeseries?name=${tsid}&begin=${currentDateTimeMinus30Hours.toISOString()}&end=${currentDateTime.toISOString()}&office=MVS`;
				// 				} else {

				// 				}
				// 				// console.log("url = ", url);
				// 				fetch(url, {
				// 					method: 'GET',
				// 					headers: {
				// 						'Accept': 'application/json;version=2'
				// 					}
				// 				})
				// 					.then(response => {
				// 						// Check if the response is ok
				// 						if (!response.ok) {
				// 							// If not, throw an error
				// 							throw new Error('Network response was not ok');
				// 						}
				// 						// If response is ok, parse it as JSON
				// 						return response.json();
				// 					})
				// 					.then(data => {
				// 						// console.log("data:", data);

				// 						// Convert timestamps in the JSON object
				// 						data.values.forEach(entry => {
				// 							entry[0] = formatNWSDate(entry[0]); // Update timestamp
				// 						});

				// 						// console.log("data formatted = ", data);

				// 						// Get the last non-null value from the stage data
				// 						const lastNonNullValue = getLastNonNullValue(data);
				// 						// console.log("lastNonNullValue:", lastNonNullValue);

				// 						// Check if a non-null value was found
				// 						if (lastNonNullValue !== null) {
				// 							// Extract timestamp, value, and quality code from the last non-null value
				// 							var timestampLast = lastNonNullValue.timestamp;
				// 							var valueLast = lastNonNullValue.value;
				// 							var qualityCodeLast = lastNonNullValue.qualityCode;
				// 							// console.log("timestampLast:", timestampLast);
				// 							// console.log("timestampLast:", typeof (timestampLast));
				// 							// console.log("valueLast:", valueLast);
				// 							// console.log("qualityCodeLast:", qualityCodeLast);
				// 						} else {
				// 							// If no non-null valueLast is found, log a message
				// 							// console.log("No non-null valueLast found.");
				// 						}

				// 						const c_count = calculateCCount(tsid);
				// 						// console.log("c_count:", c_count);

				// 						const lastNonNull24HoursValue = getLastNonNull24HoursValue(data, c_count);
				// 						// console.log("lastNonNull24HoursValue:", lastNonNull24HoursValue);

				// 						// Check if a non-null value was found
				// 						if (lastNonNull24HoursValue !== null) {
				// 							// Extract timestamp, value, and quality code from the last non-null value
				// 							var timestamp24HoursLast = lastNonNull24HoursValue.timestamp;
				// 							var value24HoursLast = lastNonNull24HoursValue.value;
				// 							var qualityCode24HoursLast = lastNonNull24HoursValue.qualityCode;

				// 							// console.log("timestamp24HoursLast:", timestamp24HoursLast);
				// 							// console.log("value24HoursLast:", value24HoursLast);
				// 							// console.log("qualityCode24HoursLast:", qualityCode24HoursLast);
				// 						} else {
				// 							// If no non-null valueLast is found, log a message
				// 							console.log("No non-null valueLast found.");
				// 						}

				// 						// Calculate the 24 hours change between first and last value
				// 						const delta_24 = valueLast - value24HoursLast;
				// 						// console.log("delta_24:", delta_24);

				// 						if (valueLast !== null && valueLast !== undefined) {
				// 							reregDoCellInnerHTML = "<span>"
				// 								+ "DO1: " + valueLast.toFixed(2) + " (" + delta_24.toFixed(2) + ")"
				// 								+ "</span>";
				// 						} else {
				// 							if ([10, 11, 12, 1, 2, 3].includes(currentMonth)) {
				// 								reregDoCellInnerHTML = "DO1: " + "<img src='images/loading7.gif' style='width: 20px; height: 20px;'>";
				// 							} else {
				// 								reregDoCellInnerHTML = "DO1: " + "<span class='missing'>" + "-M-" + "</span>"
				// 							}
				// 						}
				// 						reregDoCell.innerHTML = reregDoCellInnerHTML;
				// 					})
				// 					.catch(error => {
				// 						// Catch and log any errors that occur during fetching or processing
				// 						console.error("Error fetching or processing data:", error);
				// 					});
				// 			}
				// 		}

				// 		// ======= REREG DO 2 =======
				// 		if ("reregdo" === "reregdo") {
				// 			// Create a new table cell for lake name
				// 			const reregDoCell2 = row3.insertCell(4);
				// 			reregDoCell2.colSpan = 1;
				// 			reregDoCell2.classList.add('Font_15');
				// 			reregDoCell2.style.width = '10%';
				// 			reregDoCell2.style.backgroundColor = '#404040';
				// 			reregDoCell2.style.color = 'lightgray';

				// 			// Initialize doCellInnerHTML as an empty string
				// 			let reregDoCell2InnerHTML = '--';

				// 			let tsid = null;
				// 			if (data.display_stage_29 === true) {
				// 				tsid = data.tsid_rereg_do2
				// 			} else {
				// 				tsid = data.tsid_rereg_do2
				// 			}

				// 			if (tsid !== null) {
				// 				// Fetch the time series data from the API using the determined query string
				// 				let url = null;
				// 				if (cda === "public") {
				// 					url = `https://cwms-data.usace.army.mil/cwms-data/timeseries?name=${tsid}&begin=${currentDateTimeMinus30Hours.toISOString()}&end=${currentDateTime.toISOString()}&office=MVS`;
				// 				} else if (cda === "internal") {
				// 					url = `https://coe-mvsuwa04mvs.mvs.usace.army.mil:8243/mvs-data/timeseries?name=${tsid}&begin=${currentDateTimeMinus30Hours.toISOString()}&end=${currentDateTime.toISOString()}&office=MVS`;
				// 				} else {

				// 				}
				// 				// console.log("url = ", url);
				// 				fetch(url, {
				// 					method: 'GET',
				// 					headers: {
				// 						'Accept': 'application/json;version=2'
				// 					}
				// 				})
				// 					.then(response => {
				// 						// Check if the response is ok
				// 						if (!response.ok) {
				// 							// If not, throw an error
				// 							throw new Error('Network response was not ok');
				// 						}
				// 						// If response is ok, parse it as JSON
				// 						return response.json();
				// 					})
				// 					.then(data => {
				// 						// console.log("data:", data);

				// 						// Convert timestamps in the JSON object
				// 						data.values.forEach(entry => {
				// 							entry[0] = formatNWSDate(entry[0]); // Update timestamp
				// 						});

				// 						// console.log("data formatted = ", data);

				// 						// Get the last non-null value from the stage data
				// 						const lastNonNullValue = getLastNonNullValue(data);
				// 						// console.log("lastNonNullValue:", lastNonNullValue);

				// 						// Check if a non-null value was found
				// 						if (lastNonNullValue !== null) {
				// 							// Extract timestamp, value, and quality code from the last non-null value
				// 							var timestampLast = lastNonNullValue.timestamp;
				// 							var valueLast = lastNonNullValue.value;
				// 							var qualityCodeLast = lastNonNullValue.qualityCode;
				// 							// console.log("timestampLast:", timestampLast);
				// 							// console.log("timestampLast:", typeof (timestampLast));
				// 							// console.log("valueLast:", valueLast);
				// 							// console.log("qualityCodeLast:", qualityCodeLast);
				// 						} else {
				// 							// If no non-null valueLast is found, log a message
				// 							console.log("No non-null valueLast found.");
				// 						}

				// 						const c_count = calculateCCount(tsid);
				// 						// console.log("c_count:", c_count);

				// 						const lastNonNull24HoursValue = getLastNonNull24HoursValue(data, c_count);
				// 						// console.log("lastNonNull24HoursValue:", lastNonNull24HoursValue);

				// 						// Check if a non-null value was found
				// 						if (lastNonNull24HoursValue !== null) {
				// 							// Extract timestamp, value, and quality code from the last non-null value
				// 							var timestamp24HoursLast = lastNonNull24HoursValue.timestamp;
				// 							var value24HoursLast = lastNonNull24HoursValue.value;
				// 							var qualityCode24HoursLast = lastNonNull24HoursValue.qualityCode;

				// 							// console.log("timestamp24HoursLast:", timestamp24HoursLast);
				// 							// console.log("value24HoursLast:", value24HoursLast);
				// 							// console.log("qualityCode24HoursLast:", qualityCode24HoursLast);
				// 						} else {
				// 							// If no non-null valueLast is found, log a message
				// 							console.log("No non-null valueLast found.");
				// 						}

				// 						// Calculate the 24 hours change between first and last value
				// 						const delta_24 = valueLast - value24HoursLast;
				// 						// console.log("delta_24:", delta_24);

				// 						if (valueLast !== null && valueLast !== undefined) {
				// 							reregDoCell2InnerHTML = "<span>"
				// 								+ "DO2: " + valueLast.toFixed(2) + " (" + delta_24.toFixed(2) + ")"
				// 								+ "</span>";
				// 						} else {
				// 							if ([10, 11, 12, 1, 2, 3].includes(currentMonth)) {
				// 								reregDoCell2InnerHTML = "DO2: "
				// 									+ "<img src='images/loading7.gif' style='width: 20px; height: 20px;'>";
				// 							} else {
				// 								reregDoCell2InnerHTML = "DO2: "
				// 									+ "<span class='missing'>-M-</span>";
				// 							}
				// 						}
				// 						reregDoCell2.innerHTML = reregDoCell2InnerHTML;
				// 					})
				// 					.catch(error => {
				// 						// Catch and log any errors that occur during fetching or processing
				// 						console.error("Error fetching or processing data:", error);
				// 					});
				// 			}
				// 		}

				// 		// ======= GENERATION =======
				// 		if ("gen" === "gen") {
				// 			// Create a new table cell for lake name
				// 			const genCell = row3.insertCell(5);
				// 			genCell.colSpan = 1;
				// 			genCell.classList.add('Font_15');
				// 			genCell.style.width = '10%';
				// 			genCell.style.backgroundColor = '#404040';
				// 			genCell.style.color = 'lightgray';

				// 			// Initialize doCellInnerHTML as an empty string
				// 			let genCellInnerHTML = '';

				// 			genCell.innerHTML = genCellInnerHTML;

				// 			// // Make an AJAX request to the PHP script, passing all the variables
				// 			// var urlGen = `https://coe-mvsuwa04mvs.mvs.usace.army.mil/php_data_api/public/get_generation2.php`;
				// 			// // console.log("urlGen: " , urlGen);

				// 			// fetch(urlGen)
				// 			// 	.then(response => response.json())
				// 			// 	.then(gen => {
				// 			// 		// Log the stage to the console
				// 			// 		// console.log("gen: ", gen);

				// 			// 		// Extract lower and upper flow limits
				// 			// 		const genValueRereg = parseFloat(gen[0].value_rereg);
				// 			// 		const genDateTimeRereg = gen[0].date_time_rereg;
				// 			// 		const genLocationIdRereg = gen[0].location_id_rereg;
				// 			// 		// console.log("genValueRereg: ", genValueRereg);
				// 			// 		// console.log("genValueRereg: ", typeof genValueRereg);
				// 			// 		// console.log("genDateTimeRereg: ", genDateTimeRereg);
				// 			// 		// console.log("genLocationIdRereg: ", genLocationIdRereg);


				// 			// 		if (gen !== null && gen[0].value !== null) {
				// 			// 			const gen_date_time = gen[0].date_time;
				// 			// 			// console.log("gen_date_time = ", gen_date_time);
				// 			// 			var dateParts = gen_date_time.split(" ");
				// 			// 			var date = dateParts[0];
				// 			// 			var time = dateParts[1];
				// 			// 			var [month, day, year] = date.split("-");
				// 			// 			var [hours, minutes] = time.split(":");
				// 			// 			var gen_date_time_formatted = new Date(`${year}-${month}-${day}T${hours}:${minutes}:00`);
				// 			// 			// console.log("gen_date_time_formatted", gen_date_time_formatted);
				// 			// 			// console.log("gen_date_time_formatted: ", typeof gen_date_time_formatted);

				// 			// 			// Get the current date as a Date object
				// 			// 			const currentDate = new Date();
				// 			// 			// Subtract 2 hours (2 * 60 * 60 * 1000 milliseconds)
				// 			// 			const currentDateStageMinusTwoHours = new Date(currentDate.getTime() - (2 * 60 * 60 * 1000));
				// 			// 			// Subtract 2 hours (2 * 60 * 60 * 1000 milliseconds)
				// 			// 			const currentDateStageMinusOneDay = new Date(currentDate.getTime() - (24 * 60 * 60 * 1000));

				// 			// 			// console.log("currentDateStage:", currentDate);
				// 			// 			// console.log("currentDateStageMinusTwoHours:", currentDateStageMinusTwoHours);
				// 			// 			// console.log("currentDateStageMinusOneDay:", currentDateStageMinusOneDay);

				// 			// 			// Calculate the time difference in hours
				// 			// 			const timeDifferenceInMilliseconds = currentDate.getTime() - gen_date_time_formatted.getTime();
				// 			// 			const timeDifferenceInHours = timeDifferenceInMilliseconds / (1000 * 60 * 60);

				// 			// 			// console.log("Time Difference (in hours):", timeDifferenceInHours);
				// 			// 			// console.log("Time Difference (in hours):", typeof timeDifferenceInHours);

				// 			// 			// Gen Class
				// 			// 			if (timeDifferenceInHours <= 2) {
				// 			// 				// console.log("Generating Now");
				// 			// 				var myGenClass = "Gen_Now";
				// 			// 			} else if (timeDifferenceInHours > 24) {
				// 			// 				// console.log("No Generating");
				// 			// 				var myGenClass = "Gen_No";
				// 			// 			} else {
				// 			// 				// console.log("Generating Within 24Hours");
				// 			// 				var myGenClass = "Gen";
				// 			// 			}

				// 			// 			if (timeDifferenceInHours < 2) {
				// 			// 				genCellInnerHTML = "<span class='" + myGenClass + "' style='float: left; padding-left: 15px; align-items: center; display: flex;' title='" + parseFloat(gen[0].delta).toFixed(1) + " delta ft : " + gen[0].date_time + " Hours: " + timeDifferenceInHours.toFixed(0) + "'><img src='images/yes3.png' width='30' height='30'>&nbsp;Generating Now</span>";
				// 			// 			} else if (timeDifferenceInHours > 24) {
				// 			// 				genCellInnerHTML = "<span class='" + myGenClass + "' style='float: left; padding-left: 15px; align-items: center; display: flex;' title='" + parseFloat(gen[0].delta).toFixed(1) + " delta ft : " + gen[0].date_time + " Hours: " + timeDifferenceInHours.toFixed(0) + "'>" + "<a href='https://wm.mvs.ds.usace.army.mil/web_apps/plot_macro/public/plot_macro.php?basin=Mark%20Twain&cwms_ts_id=Mark%20Twain%20Lk%20TW-Salt.Stage.Inst.15Minutes.0.29&cwms_ts_id_2=ReReg%20Pool-Salt.Stage.Inst.15Minutes.0.29&start_day=4&end_day=0' target='_blank' style='color: #ccc;'>No Generating</a>" + "</span>";
				// 			// 			} else {
				// 			// 				genCellInnerHTML = "<span class='" + myGenClass + "' style='float: left; padding-left: 15px; align-items: center; display: flex;' title='" + parseFloat(gen[0].delta).toFixed(1) + " delta ft : " + gen[0].date_time + " Hours: " + timeDifferenceInHours.toFixed(0) + "'><img src='images/yes3.png' width='30' height='30'>&nbsp;Generated " + timeDifferenceInHours.toFixed(0) + " Hrs Ago" + "</span>";
				// 			// 			}
				// 			// 		} else {
				// 			// 			// If not gen in the past 24 hours. Determine of you need to gen. If Rereg below 521.5ft
				// 			// 			if (genValueRereg > 521.5) {
				// 			// 				genCellInnerHTML = "<span style='float: left; padding-left: 15px; align-items: center; display: flex;' title='No Gen in past 24 hours'>";
				// 			// 				genCellInnerHTML += "<a href='https://wm.mvs.ds.usace.army.mil/web_apps/plot_macro/public/plot_macro.php?basin=Mark%20Twain&cwms_ts_id=Mark%20Twain%20Lk%20TW-Salt.Stage.Inst.15Minutes.0.29&cwms_ts_id_2=ReReg%20Pool-Salt.Stage.Inst.15Minutes.0.29&start_day=4&end_day=0' target='_blank' style='color: #ccc;'>No Generating</a>";
				// 			// 				genCellInnerHTML += "</span>";
				// 			// 			} else {
				// 			// 				genCellInnerHTML = "<span style='float: left; padding-left: 15px; align-items: center; display: flex;' title='Rereg below 521.5ft'> <img src='images/call.png' width='25' height='25'>&nbsp;Call Rereg</span>";
				// 			// 			}
				// 			// 		}

				// 			// 		// Set the combined value to the cell, preserving HTML
				// 			// 		// console.log("genCellInnerHTML = ", genCellInnerHTML);

				// 			// 		// Set the HTML inside the cell once the fetch is complete
				// 			// 		genCell.innerHTML = genCellInnerHTML;
				// 			// 	})
				// 			// 	.catch(error => {
				// 			// 		console.error('Error:', error);
				// 			// 	});
				// 		}
				// 	}
				// })();

				// ====================================================================================
				// ======= ROW 4 ======= (NOTE)
				// ====================================================================================

				// (() => {
				// 	// Create and add the second new row
				// 	const row4 = table.insertRow();

				// 	// ======= BLANK =======
				// 	if ("blank" === "blank") {
				// 		// Create a new table cell for lake name in the second row
				// 		const blankCell4 = row4.insertCell(0);
				// 		blankCell4.colSpan = 1;
				// 		blankCell4.classList.add('Font_15');
				// 		blankCell4.style.width = '15%';

				// 		// Initialize lakeCellInnerHTML as an empty string for the second row
				// 		let blankCell4InnerHTML = '--';

				// 		// Update the inner HTML of the cell with data for the second row, preserving HTML
				// 		blankCell4InnerHTML = " "; // Replace with the actual data for the second lake
				// 		// console.log('blankCell4InnerHTML =', blankCell4InnerHTML);
				// 		blankCell4.innerHTML = blankCell4InnerHTML;
				// 	}

				// 	// ======= NOTE =======
				// 	if ("note" === "note") {
				// 		// Create a new table cell for lake name
				// 		const noteCell = row4.insertCell(1);
				// 		noteCell.colSpan = 7;
				// 		noteCell.classList.add('Font_15');
				// 		noteCell.style.width = '10%';
				// 		noteCell.style.backgroundColor = 'lightyellow';
				// 		noteCell.style.color = '#333333';
				// 		noteCell.style.textAlign = 'left'; // Add this line to align content to the left
				// 		noteCell.style.paddingLeft = '10px'; // Add this line to set left padding

				// 		// Initialize lakeCellInnerHTML as an empty string
				// 		let noteCellInnerHTML = '';

				// 		// try {
				// 		// 	const ROutput = await fetchDataFromROutput();
				// 		// 	// console.log('ROutput:', ROutput);

				// 		// 	const filteredData = filterDataByLocationId(ROutput, data.location_id);
				// 		// 	// console.log("Filtered Data for", data.location_id + ":", filteredData);

				// 		// 	// // Update the HTML element with filtered data
				// 		// 	updateNoteHTML(filteredData, noteCell);

				// 		// 	// Further processing of ROutput data as needed
				// 		// } catch (error) {
				// 		// 	// Handle errors from fetchDataFromROutput
				// 		// 	console.error('Failed to fetch data:', error);
				// 		// }
				// 	}
				// })();

				// ====================================================================================
				// ======= ROW 5 ======= (BLANK WHITE BLOCK)
				// ====================================================================================

				// (() => {
				// 	// Create and add the second new row
				// 	const row5 = table.insertRow();

				// 	// ======= BLANK =======
				// 	if ("blank" === "blank") {
				// 		// Create a new table cell for lake name in the second row
				// 		const blankCell5 = row5.insertCell(0);
				// 		blankCell5.colSpan = 8;
				// 		blankCell5.classList.add('Font_15');
				// 		blankCell5.style.color = 'white';
				// 		blankCell5.style.height = '20px'; // Add this line to set the height

				// 		// Initialize lakeCellInnerHTML as an empty string for the second row
				// 		let blankCell5InnerHTML = '--';

				// 		// Update the inner HTML of the cell with data for the second row, preserving HTML
				// 		blankCell5InnerHTML = ""; // Replace with the actual data for the second lake
				// 		// console.log('blankCell5InnerHTML =', blankCell5InnerHTML);
				// 		blankCell5.innerHTML = blankCell5InnerHTML;
				// 	}
				// })();
			} else {
				// Handle other display types if needed
			}
		});
	});

	return table;
}

/******************************************************************************
 *                            SUPPORT CDA FUNCTIONS                           *
 ******************************************************************************/

function filterByLocationCategory(array, category) {
	return array.filter(item =>
		item['location-category'] &&
		item['location-category']['office-id'] === category['office-id'] &&
		item['location-category']['id'] === category['id']
	);
}

async function fetchAdditionalLocationGroupOwnerData(locationId, setBaseUrl, setLocationGroupOwner, office) {
	const additionalDataUrl = `${setBaseUrl}location/group/${setLocationGroupOwner}?office=${office}&category-id=${office}`;

	console.log("additionalDataUrl: ", additionalDataUrl);

	return fetch(additionalDataUrl, {
		method: 'GET'
	})
		.then(response => {
			// If response is not OK, log the status and return null
			if (!response.ok) {
				console.warn(`Response not ok for ${locationId}: Status ${response.status}`);
				return null;
			}
			return response.json();
		})
		.then(data => {
			// If data is not null, log the fetched data
			if (data) {
				// console.log(`Fetched additional data for ${locationId}:`, data);
			}
			return data;
		})
		.catch(error => {
			// Catch any errors and log them
			console.error(`Error fetching additional data for ${locationId}:`, error);
			return null; // Return null in case of error
		});
}