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
				tableRiver = createTable(combinedDataRiver, combinedDataReservoir, setBaseUrl, display_type, display_tributary, day1, day2, day3, lakeLocs);
				// console.log(tableRiver);

				document.getElementById(`tableContainer`).append(tableRiver);

				loadingIndicator.style.display = 'none';
			})
			.catch(error => {
				console.error('Error fetching data:', error);
			});
	} else {
		const setLocationCategory = "Basins";
		const setLocationGroupBoard = "Board";
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
		const setTimeseriesGroup11 = "Conc-DO-Re-Reg-Lake";
		const setTimeseriesGroup12 = "Gaged-Outflow-Lake";
		const setTimeseriesGroup13 = "Re-Reg-Lake";
		const setTimeseriesGroup14 = "Schedule";
		const setTimeseriesGroup15 = "Conc-DO-Tw-Lake";
		const setTimeseriesGroup16 = "Turbines-Lake-Test";
		const setTimeseriesGroup17 = "Note-Lake";
		const setTimeseriesGroup18 = "Outflow-Average-Lake-Test";
		const setTimeseriesGroup19 = "Tainter";
		const setTimeseriesGroup20 = "Roller";

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
		const doReRegLakeMap = new Map();
		const gagedOutflowMap = new Map();
		const reRegLakeTsidMap = new Map();
		const scheduleTsidMap = new Map();
		const doTwLakeTsidMap = new Map();
		const turbinesTsidMap = new Map();
		const noteLakeTsidMap = new Map();
		const flowUpperLimitMap = new Map();
		const outflowAverageLakeTsidMap = new Map();
		const boardLocationsMap = new Map();
		const taintTsidMap = new Map();
		const rollTsidMap = new Map();
		const closureMap = new Map();

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
		const doReRegLakePromises = [];
		const gagedOutflowPromises = [];
		const reRegLakePromises = [];
		const schedulePromises = [];
		const doTwLakePromises = [];
		const turbinesPromises = [];
		const noteLakePromises = [];
		const flowUpperLimitPromises = [];
		const outflowAverageLakePromises = [];
		const boardLocationsPromises = [];
		const taintPromises = [];
		const rollPromises = [];
		const closurePromises = [];

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
				...doReRegLakePromises,
				...gagedOutflowPromises,
				...reRegLakePromises,
				...schedulePromises,
				...doTwLakePromises,
				...turbinesPromises,
				...noteLakePromises,
				...flowUpperLimitPromises,
				...outflowAverageLakePromises,
				...boardLocationsPromises,
				...taintPromises,
				...rollPromises,
				...closurePromises
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
						loc['lwrp'] = lwrpMap.get(loc['location-id']);
						loc['bankfull'] = bankfullMap.get(loc['location-id']);
						loc['tsid-do-re-reg-lake'] = doReRegLakeMap.get(loc['location-id']);
						loc['tsid-gaged-outflow-lake'] = gagedOutflowMap.get(loc['location-id']);
						loc['tsid-re-reg-lake'] = reRegLakeTsidMap.get(loc['location-id']);
						loc['tsid-schedule-lake'] = scheduleTsidMap.get(loc['location-id']);
						loc['tsid-do-tw-lake'] = doTwLakeTsidMap.get(loc['location-id']);
						loc['tsid-turbines-lake'] = turbinesTsidMap.get(loc['location-id']);
						loc['tsid-note-lake'] = noteLakeTsidMap.get(loc['location-id']);
						loc['flow-upper-limit'] = flowUpperLimitMap.get(loc['location-id']);
						loc['tsid-outflow-average-lake'] = outflowAverageLakeTsidMap.get(loc['location-id']);
						loc['board-locations'] = boardLocationsMap.get(loc['location-id']);
						loc['tsid-taint'] = taintTsidMap.get(loc['location-id']);
						loc['tsid-roll'] = rollTsidMap.get(loc['location-id']);
						loc['closure'] = closureMap.get(loc['location-id']);
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
				tableRiver = createTable(combinedDataRiver, combinedDataReservoir, setBaseUrl, display_type, display_tributary, day1, day2, day3, lakeLocs);
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

			const tsidBoardLocationsUrl = `${setBaseUrl}location/group/${setLocationGroupBoard}?office=${office}&category-id=${office}`;
			boardLocationsPromises.push(
				fetch(tsidBoardLocationsUrl)
					.then(res => res.ok ? res.json() : null)
					.then(data => data && boardLocationsMap.set(locationId, data))
					.catch(err => console.error(`Fetch failed for ${locationId}:`, err))
			);

			const tsidTaintUrl = `${setBaseUrl}timeseries/group/${setTimeseriesGroup19}?office=${office}&category-id=${locationId}`;
			taintPromises.push(
				fetch(tsidTaintUrl)
					.then(res => res.ok ? res.json() : null)
					.then(data => data && taintTsidMap.set(locationId, data))
					.catch(err => console.error(`TSID fetch failed for ${locationId}:`, err))
			);

			const tsidRollUrl = `${setBaseUrl}timeseries/group/${setTimeseriesGroup20}?office=${office}&category-id=${locationId}`;
			rollPromises.push(
				fetch(tsidRollUrl)
					.then(res => res.ok ? res.json() : null)
					.then(data => data && rollTsidMap.set(locationId, data))
					.catch(err => console.error(`TSID fetch failed for ${locationId}:`, err))
			);

			const closureUrl = `${setBaseUrl}levels/${locationId}.Stage.Inst.0.Closure?office=${office}&effective-date=${levelIdEffectiveDate}&unit=ft`;
			closurePromises.push(
				fetch(closureUrl)
					.then(res => res.status === 404 ? null : res.ok ? res.json() : Promise.reject(`Flood fetch error: ${res.statusText}`))
					.then(data => closureMap.set(locationId, data ?? null))
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
			doReRegLakePromises.push(
				fetch(tsidDoUrl)
					.then(res => res.ok ? res.json() : null)
					.then(data => data && doReRegLakeMap.set(locationId, data))
					.catch(err => console.error(`TSID fetch failed for ${locationId}:`, err))
			);

			const tsidGagedOutflowUrl = `${setBaseUrl}timeseries/group/${setTimeseriesGroup12}?office=${office}&category-id=${locationId}`;
			gagedOutflowPromises.push(
				fetch(tsidGagedOutflowUrl)
					.then(res => res.ok ? res.json() : null)
					.then(data => data && gagedOutflowMap.set(locationId, data))
					.catch(err => console.error(`TSID fetch failed for ${locationId}:`, err))
			);

			const reReglakeUrl = `${setBaseUrl}timeseries/group/${setTimeseriesGroup13}?office=${office}&category-id=${locationId}`;
			reRegLakePromises.push(
				fetch(reReglakeUrl)
					.then(res => res.ok ? res.json() : null)
					.then(data => data && reRegLakeTsidMap.set(locationId, data))
					.catch(err => console.error(`TSID fetch failed for ${locationId}:`, err))
			);

			const schedulelakeUrl = `${setBaseUrl}timeseries/group/${setTimeseriesGroup14}?office=${office}&category-id=${locationId}`;
			schedulePromises.push(
				fetch(schedulelakeUrl)
					.then(res => res.ok ? res.json() : null)
					.then(data => data && scheduleTsidMap.set(locationId, data))
					.catch(err => console.error(`TSID fetch failed for ${locationId}:`, err))
			);

			const tsidDoTwUrl = `${setBaseUrl}timeseries/group/${setTimeseriesGroup15}?office=${office}&category-id=${locationId}`;
			doTwLakePromises.push(
				fetch(tsidDoTwUrl)
					.then(res => res.ok ? res.json() : null)
					.then(data => data && doTwLakeTsidMap.set(locationId, data))
					.catch(err => console.error(`TSID fetch failed for ${locationId}:`, err))
			);

			const tsidturbinesUrl = `${setBaseUrl}timeseries/group/${setTimeseriesGroup16}?office=${office}&category-id=${locationId}`;
			turbinesPromises.push(
				fetch(tsidturbinesUrl)
					.then(res => res.ok ? res.json() : null)
					.then(data => data && turbinesTsidMap.set(locationId, data))
					.catch(err => console.error(`TSID fetch failed for ${locationId}:`, err))
			);

			const tsidNoteUrl = `${setBaseUrl}timeseries/group/${setTimeseriesGroup17}?office=${office}&category-id=${locationId}`;
			noteLakePromises.push(
				fetch(tsidNoteUrl)
					.then(res => res.ok ? res.json() : null)
					.then(data => data && noteLakeTsidMap.set(locationId, data))
					.catch(err => console.error(`TSID fetch failed for ${locationId}:`, err))
			);

			let limitLocationId = null;

			if (locationId === "Lk Shelbyville-Kaskaskia") {
				limitLocationId = "Shelbyville TW-Kaskaskia";
			} else if (locationId === "Carlyle Lk-Kaskaskia") {
				limitLocationId = "Carlyle-Kaskaskia";
			} else if (locationId === "Rend Lk-Big Muddy") {
				limitLocationId = "Rend Lk-Big Muddy";
			} else if (locationId === "Wappapello Lk-St Francis") {
				limitLocationId = "Iron Bridge-St Francis";
			} else if (locationId === "Mark Twain Lk-Salt") {
				limitLocationId = "Norton Bridge-Salt";
			}
			const flowUpperLimitUrl = `${setBaseUrl}levels/${limitLocationId}.Flow.Inst.0.Flow Upper Limit?office=${office}&effective-date=${levelIdEffectiveDate}&unit=cfs`;
			flowUpperLimitPromises.push(
				fetch(flowUpperLimitUrl)
					.then(res => res.status === 404 ? null : res.ok ? res.json() : Promise.reject(`fetch error: ${res.statusText}`))
					.then(data => flowUpperLimitMap.set(locationId, data ?? null))
					.catch(err => console.error(`Flood fetch failed for ${locationId}:`, err))
			);

			const tsidOutflowAverageUrl = `${setBaseUrl}timeseries/group/${setTimeseriesGroup18}?office=${office}&category-id=${locationId}`;
			outflowAverageLakePromises.push(
				fetch(tsidOutflowAverageUrl)
					.then(res => res.ok ? res.json() : null)
					.then(data => data && outflowAverageLakeTsidMap.set(locationId, data))
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
	const table = document.createElement('table');
	table.id = 'board_cda';

	// Row 1: Title row using <th>
	const row1 = table.insertRow();
	const th1 = document.createElement('th');
	th1.colSpan = 15;
	th1.innerHTML = "<div id='board_title'>MVS RIVER DATA</div>";
	row1.appendChild(th1);

	// Row 2: Last Modified + Switch Link using <th>
	const row2 = table.insertRow();

	// Last Modified cell
	const th2_1 = document.createElement('th');
	th2_1.colSpan = 2;
	th2_1.innerHTML = `<div class='Last_Modified'>Last Modified:&nbsp;&nbsp;${currentDateTime}</div>`;
	row2.appendChild(th2_1);

	// Switch link cell
	const th2_2 = document.createElement('th');
	th2_2.colSpan = 13;
	if (dev === "True") {
		th2_2.innerHTML = `<div id='formsContainer'><div id='switch_php_board'><a href='https://wm.mvs.ds.usace.army.mil/mvs/board/dev.html?display_type=${display_type}&display_tributary=${display_tributary}&dev=False&json=${json}'>Switch to Production Board</a></div></div>`;
	} else {
		th2_2.innerHTML = `<div id='switch_php_board'><a href='https://wm.mvs.ds.usace.army.mil/mvs/board/dev.html?display_type=${display_type}&display_tributary=${display_tributary}&dev=True&json=${json}'>Switch to Dev Board</a></div>`;
	}
	row2.appendChild(th2_2);

	// Row 3: Header row
	const row3 = table.insertRow();
	row3.innerHTML = `
    <th rowspan='3' width='6%' style='font-size: 1.2em;'>River Mile</th>
    <th rowspan='3' width='16%' style='font-size: 1.2em;'>Location</th>
    <th rowspan='3' width='6%' style='font-size: 1.2em;'>Current<br>${(currentMinute >= 0 && currentMinute < 30) ? currentHour + ":00" : currentHour + ":30"
		}<br>Levels</th>
    <th rowspan='3' width='5%' style='font-size: 1.2em;'>24hr<br>Change</th>
    <th colspan='6' style='font-size: 1.2em;'>National Weather Service River Forecast</th>
    <th rowspan='3' width='15%' style='font-size: 1.2em;'> LD Settings<br>[Tainter] [Roller]</th>
`;

	const typeCell = document.createElement('th');
	typeCell.colSpan = 2;
	typeCell.rowSpan = 1;
	if (display_type === "LWRP") {
		typeCell.innerHTML = `<a href='dev.html?display_type=FloodStage&display_tributary=${display_tributary}&dev=${dev}&json=${json}'>Switch to FloodStage</a>`;
	} else if (display_type === "FloodStage") {
		typeCell.innerHTML = `<a href='dev.html?display_type=LWRP&display_tributary=${display_tributary}&dev=${dev}&json=${json}'>Switch to LWRP</a>`;
	}
	row3.appendChild(typeCell);

	const gageZeroCell = document.createElement('th');
	gageZeroCell.rowSpan = 3;
	gageZeroCell.style.fontSize = '1.2em';
	gageZeroCell.width = '6%';
	gageZeroCell.innerHTML = 'Gage Zero<br>NAVD88';
	row3.appendChild(gageZeroCell);

	// Row 4: Forecast Headers
	const row4 = table.insertRow();
	row4.innerHTML = `
    <th colspan='3' style='font-size: 1.2em;'>Next 3 days</th>
    <th width='8%' style='font-size: 1.2em;'>Forecast Time</th>
    <th width='5%' style='font-size: 1.2em;'>Crest</th>
    <th width='5%' style='font-size: 1.2em;'>Date</th>
`;

	if (display_type === "LWRP") {
		row4.innerHTML += `
        <th rowspan='2' width='5%'>LWRP</th>
        <th rowspan='2' width='8%'>Plus or <br>Minus<br>LWRP</th>
    `;
	} else if (display_type === "FloodStage") {
		row4.innerHTML += `
        <th rowspan='2' width='5%' style='font-size: 1.2em;'>Flood<br>Stage</th>
        <th rowspan='2' width='8%' style='font-size: 1.2em;'>Action<br>Stages<br>[Phase 1/2]</th>
    `;
	} else {
		row4.innerHTML += `
        <th colspan='2' rowspan='2'></th>
        <th colspan='2' rowspan='2'></th>
    `;
	}

	// Row 5: Day Labels
	const row5 = table.insertRow();
	row5.innerHTML = `
    <th width='5%'>${currentPlusOneDayAbbreviation} ${nws_day1_date_title}</th>
    <th width='5%'>${currentPlusTwoDayAbbreviation} ${nws_day2_date_title}</th>
    <th width='5%'>${currentPlusThreeDayAbbreviation} ${nws_day3_date_title}</th>
    <th colspan='3'></th>
`;

	// Append the table to the body or another container
	document.body.appendChild(table);
} else {
	if (display_type === "LWRP" || display_type === "FloodStage") {
		// Create and append Last Modified div
		const lastModifiedDiv = document.createElement('div');
		lastModifiedDiv.className = 'Last_Modified_Tributary';
		lastModifiedDiv.innerHTML = `Last Modified:&nbsp;&nbsp;${currentDateTime}`;
		document.body.appendChild(lastModifiedDiv);

		// Create and append PHP Board link
		const phpBoardDiv = document.createElement('div');
		phpBoardDiv.className = 'Last_Modified_Tributary';
		phpBoardDiv.innerHTML = `<a href='dev.html?display_type=${display_type}&display_tributary=${display_tributary}&dev=False&json=${json}'>Switch to Production Board</a>`;
		document.body.appendChild(phpBoardDiv);

		// Create and append switch link
		const switchDiv = document.createElement('div');
		switchDiv.className = 'Flood_Stage_Switch_Tributary';
		if (display_type === "LWRP") {
			switchDiv.innerHTML = `<a href='dev.html?display_type=FloodStage&display_tributary=${display_tributary}&dev=${dev}&json=${json}'>Switch to FloodStage</a>`;
		} else {
			switchDiv.innerHTML = `<a href='dev.html?display_type=LWRP&display_tributary=${display_tributary}&dev=${dev}&json=${json}'>Switch to LWRP</a>`;
		}
		document.body.appendChild(switchDiv);

		// Create and append the table
		const table = document.createElement('table');
		table.id = 'board_cda';
		document.body.appendChild(table);
	} else {
		console.log("display_type:", display_type);
	}
}

// LAKE TITLE
if (display_type === "Lake") {
	window.addEventListener('load', function () {
		// Create the static table structure
		var staticTable = document.createElement('table');
		staticTable.id = 'board_cda';

		// Create thead and tbody
		var thead = document.createElement("thead");

		// === Row 1: Title Row ===
		var row1 = document.createElement('tr');

		var headerCell = document.createElement('th');
		headerCell.colSpan = 10;
		headerCell.classList.add('Font_10');
		headerCell.innerHTML = "<div id='board_title'>MVS LAKE DATA (CLOUD LAKE SHEET)</div>";
		headerCell.style.color = "lightblue";

		row1.appendChild(headerCell);
		thead.appendChild(row1);

		// === Row 2: Last Modified Row ===
		var row2 = document.createElement('tr');
		var modifiedCell = document.createElement('th');
		modifiedCell.colSpan = 10;
		modifiedCell.innerHTML = "<div class='Last_Modified'>Last Modified:&nbsp;&nbsp" + currentDateTime +
			" <a href='https://wm.mvs.ds.usace.army.mil/mvs/board/index.html?display_type=Lake&display_tributary=False&dev=True'>Switch to Original Board</a></div>";
		row2.appendChild(modifiedCell);
		thead.appendChild(row2);

		// === Row 3: Main Headers ===
		var row3 = document.createElement('tr');

		// Lake
		var headerCell1 = document.createElement('th');
		headerCell1.innerHTML = "Lake";
		headerCell1.style.width = '15%';
		headerCell1.classList.add('Font_20');
		headerCell1.rowSpan = 2;
		row3.appendChild(headerCell1);

		// Current Pool Level
		var headerCell2 = document.createElement('th');
		headerCell2.innerHTML = "Current " + ((currentMinute >= 0 && currentMinute < 30) ? currentHour + ":00" : currentHour + ":30") + "<br>Pool Level (ft)";
		headerCell2.style.width = '12%';
		headerCell2.classList.add('Font_12');
		headerCell2.rowSpan = 2;
		row3.appendChild(headerCell2);

		// 24hr Change
		var headerCell3 = document.createElement('th');
		headerCell3.innerHTML = "24hr<br>Change (ft)";
		headerCell3.style.width = '10%';
		headerCell3.classList.add('Font_12');
		headerCell3.rowSpan = 2;
		row3.appendChild(headerCell3);

		// Current Storage Utilized
		var headerCell4 = document.createElement('th');
		headerCell4.innerHTML = "Current Storage Utilized";
		headerCell4.classList.add('Font_12');
		headerCell4.colSpan = 2;
		row3.appendChild(headerCell4);

		// Precip (in)
		var headerCell5 = document.createElement('th');
		headerCell5.innerHTML = "Precip (in)";
		headerCell5.style.width = '9%';
		headerCell5.classList.add('Font_12');
		headerCell5.rowSpan = 2;
		row3.appendChild(headerCell5);

		// Yesterday Inflow
		var headerCell55 = document.createElement('th');
		headerCell55.innerHTML = "Yesterday Inflow (dsf)";
		headerCell55.style.width = '9%';
		headerCell55.classList.add('Font_12');
		headerCell55.rowSpan = 2;
		row3.appendChild(headerCell55);

		// Controlled Outflow
		var headerCell6 = document.createElement('th');
		headerCell6.innerHTML = "Controlled Outflow (cfs)";
		headerCell6.classList.add('Font_12');
		headerCell6.colSpan = 2;
		row3.appendChild(headerCell6);

		// Seasonal Rule Curve
		var headerCell7 = document.createElement('th');
		headerCell7.innerHTML = "Seasonal<br>Rule Curve (ft)";
		headerCell7.style.width = '11%';
		headerCell7.classList.add('Font_12');
		headerCell7.rowSpan = 2;
		row3.appendChild(headerCell7);

		thead.appendChild(row3);

		// === Row 4: Sub-Headers for Storage and Outflow ===
		var row4 = document.createElement('tr');

		// Conservation
		var subCell1 = document.createElement('th');
		subCell1.innerHTML = "Conservation";
		subCell1.classList.add('Font_10');
		subCell1.style.textAlign = 'left';
		subCell1.style.paddingLeft = '30px';
		subCell1.style.width = '8.5%';
		row4.appendChild(subCell1);

		// Flood
		var subCell2 = document.createElement('th');
		subCell2.innerHTML = "Flood";
		subCell2.classList.add('Font_10');
		subCell2.style.textAlign = 'right';
		subCell2.style.paddingRight = '30px';
		subCell2.style.width = '8.5%';
		row4.appendChild(subCell2);

		// (no sub for precip — skipped)

		// Midnight
		var subCell3 = document.createElement('th');
		subCell3.innerHTML = "Midnight";
		subCell3.classList.add('Font_10');
		subCell3.style.textAlign = 'left';
		subCell3.style.paddingLeft = '30px';
		subCell3.style.width = '8.5%';
		row4.appendChild(subCell3);

		// Evening
		var subCell4 = document.createElement('th');
		subCell4.innerHTML = "Evening";
		subCell4.classList.add('Font_10');
		subCell4.style.textAlign = 'right';
		subCell4.style.paddingRight = '30px';
		subCell4.style.width = '8.5%';
		row4.appendChild(subCell4);

		thead.appendChild(row4);

		// Append thead and tbody to the table
		staticTable.appendChild(thead);

		// Add to the page
		const tableContainer = document.getElementById('tableContainer');
		if (tableContainer) {
			tableContainer.appendChild(staticTable);
		} else {
			console.error("Container with ID 'tableContainer' not found.");
		}
	});
}


//====================================================
// ============== CREATE TABLE =======================
//====================================================

function createTable(combinedDataRiver, combinedDataReservoir, setBaseUrl, display_type, display_tributary, day1, day2, day3, lakeLocs) {
	// Prepare and sort gage control
	if (display_type === "Lake") {
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
	} else {
		combinedDataRiver = combinedDataRiver.filter((basin) => {
			// Filter 'assigned-locations' within each basin
			basin['assigned-locations'] = basin['assigned-locations'].filter((location) => {
				const currentLocationId = location['location-id'];
				const boardAssignedLocations = location?.['board-locations']?.['assigned-locations'] ?? [];

				// Check if any of the boardAssignedLocations match the currentLocationId
				return boardAssignedLocations.some((boardLocation) => {
					const boardLocationId = boardLocation?.['location-id'];
					return typeof boardLocationId === 'string' && boardLocationId.includes(currentLocationId);
				});
			});

			// Keep basin only if it has assigned locations
			return basin['assigned-locations'].length > 0;
		});

		let basinsToKeep = null;
		if (display_tributary === "False") {
			basinsToKeep = ["Mississippi"];
		} else {
			basinsToKeep = ["Cuivre", "Illinois", "Missouri", "Meramec", "Kaskaskia", "Big Muddy", "Ohio"];
		}

		combinedDataRiver = combinedDataRiver
			.filter(basin => basinsToKeep.includes(basin.id))
			.map(basin => ({
				...basin,
				'assigned-locations': basin['assigned-locations'].filter(loc => loc)
			}))
			.filter(basin => basin['assigned-locations'].length > 0);

		console.log("combinedDataRiver:", combinedDataRiver);
	}

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

	const currentDateTimePlus14Days = addDaysToDate(currentDateTime, 14);
	const currentDateTimePlus14DaysIso = currentDateTimePlus14Days.toISOString();

	const currentDateTimePlus7Days = addDaysToDate(currentDateTime, 7);
	const currentDateTimePlus7DaysIso = currentDateTimePlus7Days.toISOString();

	const currentDateTimeMinus1Day = minusDaysToDate(currentDateTime, 1);
	const currentDateTimeMinus1DayIso = currentDateTimeMinus1Day.toISOString();

	console.log("currentDateTimeIso: ", currentDateTimeIso);

	// LAKE
	if (display_type === "Lake" && display_tributary === "False") {
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
						lakeTd.classList.add('Font_20');
						lakeTd.style.width = "15%";

						// Initialize lakeCellInnerHTML as an empty string
						let lakeCellInnerHTML = '--';

						// Update the inner HTML of the cell with data, preserving HTML
						lakeCellInnerHTML = "<span>" + location['metadata']['public-name'] + "</span>";
						// console.log('lakeCellInnerHTML =', lakeCellInnerHTML);
						lakeTd.innerHTML = lakeCellInnerHTML;

						row.appendChild(lakeTd);
					})();

					// 02-Current Level and 03-Delta Level
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
							fetchAndUpdateStageTd(stageTd, deltaTd, stageTsid, floodValue, currentDateTimeIso, currentDateTimeMinus60HoursIso, setBaseUrl);
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

						ConsrTd.style.width = "8.5%";
						FloodTd.style.width = "8.5%";

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
							fetchAndUpdatePrecipTd(precipTd, precipLakeTsid, currentDateTimeIso, currentDateTimeMinus24HoursIso, setBaseUrl);
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
							fetchAndUpdateYesterdayInflowTd(yesterdayInflowTd, yesterdayInflowTsid, isoDateMinus1Str, isoDateTodayStr, setBaseUrl);
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
						const yesterdayOutflowAverage = location?.['tsid-outflow-average-lake']?.['assigned-time-series']?.[0]?.['timeseries-id'] ?? null;

						const flowUpperLimit = location['flow-upper-limit']?.['constant-value'] ?? null;
						// console.log("flowUpperLimit: ", flowUpperLimit);

						if (location['metadata'][`public-name`] === "Shelbyville Pool" || location['metadata'][`public-name`] === "Carlyle Pool") {
							if (outflowTotalLakeTsid) {
								fetchAndUpdateControlledOutflowTd(outflowTotalLakeTsid, isoDateTodayStr, isoDatePlus1Str, setBaseUrl, flowUpperLimit)
									.then(data => {
										const value = data?.values?.[0]?.[1];
										// console.log("value: ", value);

										if (value !== null && value !== undefined) {
											midnightControlledOutflowTd.innerHTML = "<span title='" + "(Total outflow from the first row of the gate settings widget.) " + data.name + "'>" + value.toFixed(0) + "</span>";

											if (flowUpperLimit !== null && value > flowUpperLimit) {
												midnightControlledOutflowTd.style.color = 'red';
											} else {
												midnightControlledOutflowTd.style.color = ''; // reset to default
											}
										} else {
											midnightControlledOutflowTd.innerHTML = "<span class='missing' title='(Total outflow from the first row of the gate settings widget'>-M-</span>";
											midnightControlledOutflowTd.style.color = ''; // reset to default
										}
									})

							}
						}

						if (location['metadata'][`public-name`] === "Wappapello Pool" || location['metadata'][`public-name`] === "Mark Twain Pool") {
							if (gateTotalLakeTsid) {
								fetchAndUpdateControlledOutflowTd(gateTotalLakeTsid, isoDateTodayStr, isoDatePlus1Str, setBaseUrl, flowUpperLimit)
									.then(data => {
										const value = data?.values?.[0]?.[1];
										if (value !== null && value !== undefined) {
											midnightControlledOutflowTd.innerHTML = "<span title='" + "(Total outflow from the first row of the gate settings widget.) " + data.name + "'>" + value.toFixed(0) + "</span>";
											if (flowUpperLimit !== null && value > flowUpperLimit) {
												midnightControlledOutflowTd.style.color = 'red';
											} else {
												midnightControlledOutflowTd.style.color = ''; // reset to default
											}
										} else {
											midnightControlledOutflowTd.innerHTML = "<span class='missing' title='(Total outflow from the first row of the gate settings widget'>-M-</span>";
											midnightControlledOutflowTd.style.color = ''; // reset to default
										}
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
									const displayValue = typeof value === "number" ? value.toFixed(0) : value;

									if (value !== null && value !== undefined) {
										eveningControlledOutflowTd.innerHTML = "<span title='" + "(First forecasted lake value for tomorrow.) " + data.name + "'>" + displayValue + "</span>";
									} else {
										eveningControlledOutflowTd.innerHTML = "<span class='missing' title='(First forecasted lake value for tomorrow.'>-M-</span>";
									}
								})
								.catch(error => {
									console.error("Error during fetch:", error);
								});
						}

						if (location['metadata']['public-name'] === "Rend Pool") {
							if (yesterdayOutflowAverage) {
								fetchAndUpdateOutflowAverageTd(yesterdayOutflowAverage, isoDateTodayStr, isoDateTodayStr, setBaseUrl)
									.then(data => {
										// console.log("data:", data);

										let value = data?.values?.[0]?.[1];
										if (typeof value === "number") {
											value = Math.round(value / 10) * 10;
											const displayValue = value.toFixed(0);
											midnightControlledOutflowTd.innerHTML = `<span title="Yesterday Average Outflow. ${data?.name || ''}">${displayValue}</span>`;
										} else {
											midnightControlledOutflowTd.innerHTML = `<span class="missing" title="Yesterday Average Outflow.">-M-</span>`;
										}
									})
									.catch(error => {
										console.error("Error during fetch:", error);
									});
							}
						}

						row.appendChild(midnightControlledOutflowTd);
						row.appendChild(eveningControlledOutflowTd);
					})();

					// 10-Seasonal Rule Curve
					(() => {
						const seasonalRuleCurveTd = document.createElement('td');
						seasonalRuleCurveTd.style.width = "11%";
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
						crestTd.style.width = '22%';
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
									"Accept": "application/json;version=2", // Ensuring the correct version is used
									"cache-control": "no-cache"
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
										label = null;
									}

									if (label !== null) {
										crestTd.innerHTML = crestCellInnerHTML + label;
									} else {
										crestTd.innerHTML = "";
									}
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
						blankblankCell.style.width = '17%';
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
						twDoCell.style.width = '18%';
						twDoCell.style.backgroundColor = '#404040';
						twDoCell.style.color = 'lightgray';
						twDoCell.style.textAlign = 'center';

						let twDoInnerHTML = 'Tw Do:  ';

						const doTsid = location?.['tsid-do-tw-lake']?.['assigned-time-series']?.[0]?.['timeseries-id'] ?? null;

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

									const lastNonNullValue = getLastNonNullValue(data);
									// console.log("lastNonNullValue:", lastNonNullValue);

									let valueLast = null;
									let timestampLast = null;
									let unitLast = null;

									if (lastNonNullValue !== null) {
										timestampLast = lastNonNullValue.timestamp;
										valueLast = parseFloat(lastNonNullValue.value).toFixed(2);
										unitLast = data.units;
									}
									// console.log("valueLast:", valueLast);
									// console.log("timestampLast:", timestampLast);

									let value24HoursLast = null;
									let timestamp24HoursLast = null;

									const lastNonNull24HoursValue = getLastNonNull24HoursValue(data, c_count);
									// console.log("lastNonNull24HoursValue:", lastNonNull24HoursValue);

									if (lastNonNull24HoursValue !== null) {
										timestamp24HoursLast = lastNonNull24HoursValue.timestamp;
										value24HoursLast = parseFloat(lastNonNull24HoursValue.value).toFixed(2);
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

									let innerHTM;
									if (valueLast === null) {
										innerHTM = "<span class='missing'>-M-</span>";
									} else {
										innerHTM = `<span title='${timestampLast}'>Tw Do: ${valueLast} (${delta_24}) ${unitLast}</span>`;
									}

									twDoCell.innerHTML = innerHTM;
								})
								.catch(error => {
									console.error("Error fetching or processing data:", error);
									twDoCell.innerHTML = 'N/A';
								});
						} else {
							twDoCell.innerHTML = '';
						}
					})();

					// ======= GAGED OUTFLOW =======
					(() => {
						// Create a new table cell for lake name
						const gagedOutflowCell = row2.insertCell(4);
						gagedOutflowCell.colSpan = 2;
						gagedOutflowCell.classList.add('Font_15');
						gagedOutflowCell.style.width = '17%';
						gagedOutflowCell.style.backgroundColor = '#404040';
						gagedOutflowCell.style.color = 'lightgray';

						const gagedOutflowTsid = location?.['tsid-gaged-outflow-lake']?.['assigned-time-series']?.[0]?.['timeseries-id'] ?? null;
						// console.log("gagedOutflowTsid: ", gagedOutflowTsid);

						if (gagedOutflowTsid !== null) {
							const url = `${setBaseUrl}timeseries?name=${gagedOutflowTsid}&begin=${currentDateTimeMinus60HoursIso}&end=${currentDateTimeIso}&office=${office}`;

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

									const c_count = calculateCCount(gagedOutflowTsid);

									const lastNonNullValue = getLastNonNullValue(data);
									// console.log("lastNonNullValue:", lastNonNullValue);

									let valueLast = null;
									let timestampLast = null;
									let unitLast = null;

									if (lastNonNullValue !== null) {
										timestampLast = lastNonNullValue.timestamp;
										valueLast = parseFloat(lastNonNullValue.value).toFixed(0);
										unitLast = data.units;
									}
									// console.log("valueLast:", valueLast);
									// console.log("timestampLast:", timestampLast);

									let value24HoursLast = null;
									let timestamp24HoursLast = null;

									const lastNonNull24HoursValue = getLastNonNull24HoursValue(data, c_count);
									// console.log("lastNonNull24HoursValue:", lastNonNull24HoursValue);

									if (lastNonNull24HoursValue !== null) {
										timestamp24HoursLast = lastNonNull24HoursValue.timestamp;
										value24HoursLast = parseFloat(lastNonNull24HoursValue.value).toFixed(0);
									}
									// console.log("value24HoursLast:", value24HoursLast);
									// console.log("timestamp24HoursLast:", timestamp24HoursLast);

									let delta_24 = null;

									// Check if the values are numbers and not null/undefined
									if (valueLast !== null && value24HoursLast !== null && !isNaN(valueLast) && !isNaN(value24HoursLast)) {
										delta_24 = (valueLast - value24HoursLast).toFixed(0);
									} else {
										delta_24 = "--";  // or set to "-1" or something else if you prefer
									}

									// console.log("delta_24:", delta_24);

									// Make sure delta_24 is a valid number before calling parseFloat
									if (delta_24 !== "--" && delta_24 !== null && delta_24 !== undefined) {
										delta_24 = parseFloat(delta_24).toFixed(0);
									} else {
										delta_24 = "--";
									}

									let innerHTM;
									if (valueLast === null) {
										innerHTM = "<span class='missing'>-M-</span>";
									} else {
										innerHTM = `<span title='${timestampLast}'>Outflow: ${valueLast} (${delta_24}) ${unitLast}</span>`;
									}

									gagedOutflowCell.innerHTML = innerHTM;
								})
								.catch(error => {
									console.error("Error fetching or processing data:", error);
									gagedOutflowCell.innerHTML = 'N/A';
								});
						} else {
							gagedOutflowCell.innerHTML = '';
						}
					})();

					// ======= SEASONAL RULE CURVE DELTA =======
					(() => {
						// Create a new table cell for lake name
						const curveDeltaCell = row2.insertCell(5);
						curveDeltaCell.colSpan = 1;
						curveDeltaCell.classList.add('Font_15');
						curveDeltaCell.style.width = "11%";
						curveDeltaCell.style.backgroundColor = '#404040';
						curveDeltaCell.style.color = 'lightgray';

						const stageTsid = location?.['tsid-stage']?.['assigned-time-series']?.[0]?.['timeseries-id'] ?? null;

						if (stageTsid !== null) {
							const url = `${setBaseUrl}timeseries?name=${stageTsid}&begin=${currentDateTimeMinus60HoursIso}&end=${currentDateTimeIso}&office=${office}`;

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

									const c_count = calculateCCount(stageTsid);
									// console.log("c_count: ", c_count);

									const lastNonNullValue = getLastNonNullMidnightValue(data, data.name, c_count);
									// console.log("lastNonNullValue:", lastNonNullValue);

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

									const seasonalRuleCurveValue = location['seasonal-rule-curve'][`constant-value`];

									const delta = valueLast - seasonalRuleCurveValue;
									const deltaRuleCurve = (delta > 0 ? '+' : '') + delta.toFixed(2);


									let innerHTML;
									if (valueLast === null) {
										innerHTML = "<span class='missing'>-M-</span>";
									} else {
										innerHTML = `<span>${deltaRuleCurve}</span>`;
									}

									curveDeltaCell.innerHTML = innerHTML;
								})
								.catch(error => {
									console.error("Error fetching or processing data:", error);
									twDoCell.innerHTML = 'N/A';
								});
						} else {
							twDoCell.innerHTML = '';
						}
					})();
				})();

				// ====================================================================================
				// ======= ROW 3 ======= (ONLY FOR MARKTWAIN, REREG, SCHD, GENERATION)
				// ====================================================================================

				(() => {
					if (location['metadata']['public-name'] === "Mark Twain Pool") {
						// Create and add the second new row
						const row3 = table.insertRow();

						// ======= BLANK =======
						(() => {
							// Create a new table cell for lake name in the second row
							const blankCell3 = row3.insertCell(0);
							blankCell3.colSpan = 1;
							blankCell3.classList.add('Font_15');
							blankCell3.style.width = "15%";

							// Initialize lakeCellInnerHTML as an empty string for the second row
							let blankCell3InnerHTML = '';

							// Update the inner HTML of the cell with data for the second row, preserving HTML
							blankCell3InnerHTML = "..."; // Replace with the actual data for the second lake
							// console.log('blankCell3InnerHTML =', blankCell3InnerHTML);
							blankCell3.innerHTML = blankCell3InnerHTML;
						})();

						// ======= REREG =======
						(() => {
							// Create a new table cell for lake name
							const reregCell = row3.insertCell(1);
							reregCell.colSpan = 2;
							reregCell.classList.add('Font_15');
							reregCell.style.width = '22%';
							reregCell.style.backgroundColor = '#404040';
							reregCell.style.color = 'lightgray';

							let reregInnerTextHTML = 'Re-Reg Pool:  ';

							const gagedOutflowTsid = location?.['tsid-re-reg-lake']?.['assigned-time-series']?.[0]?.['timeseries-id'] ?? null;
							// console.log("gagedOutflowTsid: ", gagedOutflowTsid);

							if (gagedOutflowTsid !== null) {
								const url = `${setBaseUrl}timeseries?name=${gagedOutflowTsid}&begin=${currentDateTimeMinus60HoursIso}&end=${currentDateTimeIso}&office=${office}`;

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

										const c_count = calculateCCount(gagedOutflowTsid);
										// console.log("c_count: ", c_count);

										const lastNonNullValue = getLastNonNullMidnightValue(data, data.name, c_count);
										// console.log("lastNonNullValue:", lastNonNullValue);

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

										let gagedOutflowInnerHTML;
										if (valueLast === null) {
											gagedOutflowInnerHTML = reregInnerTextHTML + "<span class='missing'>-M-</span>";
										} else {
											gagedOutflowInnerHTML = reregInnerTextHTML + `<span title='${data['name']} ${timestampLast}'>${valueLast} (${delta_24}) ${data.units}</span>`;
										}

										reregCell.innerHTML = gagedOutflowInnerHTML;
									})
									.catch(error => {
										console.error("Error fetching or processing data:", error);
										reregCell.innerHTML = 'N/A';
									});
							} else {
								reregCell.innerHTML = '';
							}
						})();

						// ======= SCHD =======
						(() => {
							// Create a new table cell for lake name
							const schdCell = row3.insertCell(2);
							schdCell.colSpan = 1;
							schdCell.classList.add('Font_15');
							schdCell.style.width = '8.5%';
							schdCell.style.backgroundColor = '#404040';
							schdCell.style.color = 'lightgray';

							let scheduleTextHTML = 'Schedule:  ';

							const scheduleTsid = location?.['tsid-schedule-lake']?.['assigned-time-series']?.[0]?.['timeseries-id'] ?? null;
							// console.log("scheduleTsid: ", scheduleTsid);

							if (scheduleTsid !== null) {
								const url = `${setBaseUrl}timeseries/text?name=${scheduleTsid}&begin=${currentDateTimeMinus24HoursIso}&end=${currentDateTimeIso}&office=${office}`;

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
										// console.log("data: ", data);

										const currentSchedule = data['regular-text-values'] && data['regular-text-values'].length > 0
											? data['regular-text-values'][data['regular-text-values'].length - 1]['text-value']
											: null;

										let gagedOutflowInnerHTML;
										if (currentSchedule === null) {
											gagedOutflowInnerHTML = scheduleTextHTML + "<span title = '" + data['name'] + "' class='missing'>-M-</span>";
										} else {
											gagedOutflowInnerHTML = scheduleTextHTML + `<span title='${data['name']}'>${currentSchedule}</span>`;
										}

										schdCell.innerHTML = gagedOutflowInnerHTML;
									})
									.catch(error => {
										console.error("Error fetching or processing data:", error);
										schdCell.innerHTML = 'N/A';
									});
							} else {
								schdCell.innerHTML = '';
							}
						})();

						// ======= BLANK =======
						(() => {
							// Create a new table cell for lake name in the second row
							const blankCell33 = row3.insertCell(3);
							blankCell33.colSpan = 1;
							blankCell33.style.width = "8.5%";
							blankCell33.classList.add('Font_15');
							blankCell33.style.backgroundColor = '#404040';
							blankCell33.style.color = 'lightgray';

							// Initialize lakeCellInnerHTML as an empty string for the second row
							let blankCell3InnerHTML = '';

							// Update the inner HTML of the cell with data for the second row, preserving HTML
							blankCell3InnerHTML = ""; // Replace with the actual data for the second lake
							// console.log('blankCell3InnerHTML =', blankCell3InnerHTML);
							blankCell33.innerHTML = blankCell3InnerHTML;
						})();

						// ======= REREG DO 1 =======
						(() => {
							// Create a new table cell for lake name
							const reregDoCell = row3.insertCell(4);
							reregDoCell.colSpan = 2;
							reregDoCell.classList.add('Font_15');
							reregDoCell.style.width = '18%';
							reregDoCell.style.backgroundColor = '#404040';
							reregDoCell.style.color = 'lightgray';

							const doReRegTsid = location?.['tsid-do-re-reg-lake']?.['assigned-time-series']?.[0]?.['timeseries-id'] ?? null;

							if (doReRegTsid !== null) {
								const url = `${setBaseUrl}timeseries?name=${doReRegTsid}&begin=${currentDateTimeMinus60HoursIso}&end=${currentDateTimeIso}&office=${office}`;

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

										const c_count = calculateCCount(doReRegTsid);

										const lastNonNullValue = getLastNonNullValue(data);
										// console.log("lastNonNullValue:", lastNonNullValue);

										let valueLast = null;
										let timestampLast = null;
										let unitLast = null;

										if (lastNonNullValue !== null) {
											timestampLast = lastNonNullValue.timestamp;
											valueLast = parseFloat(lastNonNullValue.value).toFixed(2);
											unitLast = data.units;
										}
										// console.log("valueLast:", valueLast);
										// console.log("timestampLast:", timestampLast);

										let value24HoursLast = null;
										let timestamp24HoursLast = null;

										const lastNonNull24HoursValue = getLastNonNull24HoursValue(data, c_count);
										// console.log("lastNonNull24HoursValue:", lastNonNull24HoursValue);

										if (lastNonNull24HoursValue !== null) {
											timestamp24HoursLast = lastNonNull24HoursValue.timestamp;
											value24HoursLast = parseFloat(lastNonNull24HoursValue.value).toFixed(2);
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

										let innerHTM;
										if (valueLast === null) {
											innerHTM = "<span class='missing'>-M-</span>";
										} else {
											innerHTM = `<span title='${data['name']} ${timestampLast}'>Do: ${valueLast} (${delta_24}) ${unitLast}</span>`;
										}

										reregDoCell.innerHTML = innerHTM;
									})
									.catch(error => {
										console.error("Error fetching or processing data:", error);
										reregDoCell.innerHTML = 'N/A';
									});
							} else {
								reregDoCell.innerHTML = '';
							}
						})();

						// ======= REREG DO 2 =======
						(() => {
							// Create a new table cell for lake name
							const reregDoCell2 = row3.insertCell(5);
							reregDoCell2.colSpan = 2;
							reregDoCell2.classList.add('Font_15');
							reregDoCell2.style.width = '17%';
							reregDoCell2.style.backgroundColor = '#404040';
							reregDoCell2.style.color = 'lightgray';

							const doReRegTsid2 = location?.['tsid-do-re-reg-lake']?.['assigned-time-series']?.[1]?.['timeseries-id'] ?? null;

							if (doReRegTsid2 !== null) {
								const url = `${setBaseUrl}timeseries?name=${doReRegTsid2}&begin=${currentDateTimeMinus60HoursIso}&end=${currentDateTimeIso}&office=${office}`;

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

										const c_count = calculateCCount(doReRegTsid2);

										const lastNonNullValue = getLastNonNullValue(data);
										// console.log("lastNonNullValue:", lastNonNullValue);

										let valueLast = null;
										let timestampLast = null;
										let unitLast = null;

										if (lastNonNullValue !== null) {
											timestampLast = lastNonNullValue.timestamp;
											valueLast = parseFloat(lastNonNullValue.value).toFixed(2);
											unitLast = data.units;
										}
										// console.log("valueLast:", valueLast);
										// console.log("timestampLast:", timestampLast);

										let value24HoursLast = null;
										let timestamp24HoursLast = null;

										const lastNonNull24HoursValue = getLastNonNull24HoursValue(data, c_count);
										// console.log("lastNonNull24HoursValue:", lastNonNull24HoursValue);

										if (lastNonNull24HoursValue !== null) {
											timestamp24HoursLast = lastNonNull24HoursValue.timestamp;
											value24HoursLast = parseFloat(lastNonNull24HoursValue.value).toFixed(2);
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

										let innerHTM;
										if (valueLast === null) {
											innerHTM = "<span class='missing'>-M-</span>";
										} else {
											innerHTM = `<span title='${data['name']} ${timestampLast}'>Do2: ${valueLast} (${delta_24}) ${unitLast}</span>`;
										}

										reregDoCell2.innerHTML = innerHTM;
									})
									.catch(error => {
										console.error("Error fetching or processing data:", error);
										reregDoCell2.innerHTML = 'N/A';
									});
							} else {
								reregDoCell2.innerHTML = '';
							}
						})();

						// ======= GENERATION TURBINES =======
						(() => {
							// Create a new table cell for lake name
							const genCell = row3.insertCell(6);
							genCell.colSpan = 1;
							genCell.classList.add('Font_15');
							genCell.style.width = '11%';
							genCell.style.backgroundColor = '#404040';
							genCell.style.color = 'lightgray';

							let turbinesTextHTML = 'Turbines:  ';

							const turbinesTsid = location?.['tsid-turbines-lake']?.['assigned-time-series']?.[0]?.['timeseries-id'] ?? null;
							// console.log("turbinesTsid: ", turbinesTsid);

							if (turbinesTsid !== null) {
								const url = `${setBaseUrl}timeseries?name=${turbinesTsid}&begin=${currentDateTimeMinus24HoursIso}&end=${currentDateTimeIso}&office=${office}`;

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
										// console.log("data: ", data);

										const currentSchedule = data['values'] && data['values'].length > 0
											? data['values'][data['values'].length - 1][1]
											: null;

										let gagedOutflowInnerHTML;
										if (currentSchedule === null) {
											gagedOutflowInnerHTML = turbinesTextHTML + `<span class='missing'>-M-</span>`;
										} else {
											gagedOutflowInnerHTML = turbinesTextHTML + `<span title='${data['name']}'>${currentSchedule} (dsf)</span>`;
										}

										genCell.innerHTML = gagedOutflowInnerHTML;
									})
									.catch(error => {
										console.error("Error fetching or processing data:", error);
										genCell.innerHTML = 'N/A';
									});
							} else {
								genCell.innerHTML = '';
							}
						})();
					}
				})();

				// ====================================================================================
				// ======= ROW 4 ======= (NOTE)
				// ====================================================================================

				(() => {
					// Create and add the second new row
					const row4 = table.insertRow();

					// ======= BLANK =======
					(() => {
						// Create a new table cell for lake name in the second row
						const blankCell4 = row4.insertCell(0);
						blankCell4.colSpan = 1;
						blankCell4.classList.add('Font_15');
						blankCell4.style.width = '15%';

						// Initialize lakeCellInnerHTML as an empty string for the second row
						let blankCell4InnerHTML = '--';

						// Update the inner HTML of the cell with data for the second row, preserving HTML
						blankCell4InnerHTML = "..."; // Replace with the actual data for the second lake
						// console.log('blankCell4InnerHTML =', blankCell4InnerHTML);
						blankCell4.innerHTML = blankCell4InnerHTML;
					})();

					// ======= NOTE =======
					(() => {
						// Create a new table cell for lake name
						const noteCell = row4.insertCell(1);
						noteCell.colSpan = 9;
						noteCell.classList.add('Font_15');
						noteCell.style.width = '85%';
						noteCell.style.backgroundColor = 'lightyellow';
						noteCell.style.color = '#333333';
						noteCell.style.textAlign = 'left'; // Add this line to align content to the left
						noteCell.style.paddingLeft = '10px'; // Add this line to set left padding

						let scheduleTextHTML = 'Note:  ';

						const noteTsid = location?.['tsid-note-lake']?.['assigned-time-series']?.[0]?.['timeseries-id'] ?? null;
						// console.log("noteTsid: ", noteTsid);

						if (noteTsid !== null) {
							const url = `${setBaseUrl}timeseries/text?name=${noteTsid}&begin=${currentDateTimeMinus24HoursIso}&end=${currentDateTimeIso}&office=${office}`;

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
									// console.log("data: ", data);

									const currentSchedule = data['regular-text-values'] && data['regular-text-values'].length > 0
										? data['regular-text-values'][data['regular-text-values'].length - 1]['text-value']
										: null;

									let gagedOutflowInnerHTML;
									if (currentSchedule === null) {
										gagedOutflowInnerHTML = scheduleTextHTML + "<span class='missing'>-M-</span>";
									} else {
										gagedOutflowInnerHTML = scheduleTextHTML + `<span >${currentSchedule}</span>`;
									}

									noteCell.innerHTML = gagedOutflowInnerHTML;
								})
								.catch(error => {
									console.error("Error fetching or processing data:", error);
									noteCell.innerHTML = 'N/A';
								});
						} else {
							noteCell.innerHTML = '';
						}
					})();
				})();

				// ====================================================================================
				// ======= ROW 5 ======= (BLANK WHITE BLOCK)
				// ====================================================================================

				(() => {
					// Create and add the second new row
					const row5 = table.insertRow();

					// ======= BLANK =======
					(() => {
						// Create a new table cell for lake name in the second row
						const blankCell5 = row5.insertCell(0);
						blankCell5.colSpan = 10;
						blankCell5.style.width = '100%';
						blankCell5.classList.add('Font_15');
						blankCell5.style.color = 'white';
						blankCell5.style.height = '20px'; // Add this line to set the height

						// Initialize lakeCellInnerHTML as an empty string for the second row
						let blankCell5InnerHTML = '--';

						// Update the inner HTML of the cell with data for the second row, preserving HTML
						blankCell5InnerHTML = "..."; // Replace with the actual data for the second lake
						// console.log('blankCell5InnerHTML =', blankCell5InnerHTML);
						blankCell5.innerHTML = blankCell5InnerHTML;
					})();
				})();

			});
		});
	}

	// RIVER
	if ((display_type === "LWRP" || display_type === "FloodStage")) {
		combinedDataRiver.forEach((basin) => {
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
				// RIVER / TRIBUTARY
				//==============================================================================================================================================
				const row = table.insertRow();

				// RIVER MILE
				(() => {
					// Create a new table cell for river mile
					const riverMileCell = row.insertCell(0);
					riverMileCell.colSpan = 1;
					riverMileCell.classList.add("Font_15");
					riverMileCell.style.width = "6%";

					// Initialize riverMileCellInnerHTML as an empty string
					let riverMileCellInnerHTML = "--";

					// Check if the 'river_mile_hard_coded' property in data is a valid number
					if (!isNaN(parseFloat(location['river-mile'][0]['published-station'])) && Number.isInteger(parseFloat(location['river-mile'][0]['published-station']))) {
						location['river-mile'][0]['published-station'] = location['river-mile'][0]['published-station'] + '.0';
					}

					// Update the inner HTML of the cell with data, preserving HTML
					riverMileCellInnerHTML = "<span class='hard_coded'>" + parseFloat(location['river-mile'][0]['published-station']).toFixed(1) + "</span>";
					// console.log("riverMileCellInnerHTML =", riverMileCellInnerHTML);
					riverMileCell.innerHTML = riverMileCellInnerHTML;
				})();

				// LOCATION
				(() => {
					// Create a new table cell for public name
					const publicNameCell = row.insertCell(1);
					publicNameCell.colSpan = 1;
					publicNameCell.classList.add("Font_18");
					publicNameCell.style.width = "16%";

					// Initialize publicNameCellInnerHTML as an empty string
					let publicNameCellInnerHTML = "--";

					// Update the inner HTML of the cell with data, preserving HTML
					publicNameCellInnerHTML = "<span title='" + location['location-id'] + "'>" + location['metadata']['public-name'] + "</span>";
					// publicNameCellInnerHTML = "<span title='" + location['location-id'] + "'>" + location['location-id'] + "</span>";
					// console.log("publicNameCellInnerHTML = ", publicNameCellInnerHTML);
					publicNameCell.innerHTML = publicNameCellInnerHTML;
				})();

				// CURRENT STAGE AND 24HR CHANGE
				(() => {
					// Create a new table cell
					const stageCell = row.insertCell(2);
					stageCell.style.width = "6%";
					stageCell.classList.add("Font_18");

					// Create a new table cell
					const stageDeltaCell = row.insertCell(3);
					stageDeltaCell.style.width = "5%";
					stageDeltaCell.classList.add("Font_18");

					// Initialize stageCell.innerHTML as an empty string
					let stageCellInnerHTML = "--";
					let stageDeltaCellInnerHTML = "--";

					const tsidStage = location['tsid-stage']['assigned-time-series'][0]['timeseries-id'];
					const flood_level = location['flood']['constant-value'];

					if (tsidStage !== null) {
						// Fetch the time series data from the API using the determined query string
						let urlStage = null;
						if (cda === "public") {
							urlStage = `${setBaseUrl}timeseries?name=${tsidStage}&begin=${currentDateTimeMinus30Hours.toISOString()}&end=${currentDateTime.toISOString()}&office=MVS`;
						} else if (cda === "internal") {
							urlStage = `${setBaseUrl}timeseries?name=${tsidStage}&begin=${currentDateTimeMinus30Hours.toISOString()}&end=${currentDateTime.toISOString()}&office=MVS`;
						} else {

						}
						// console.log("urlStage = ", urlStage);
						fetch(urlStage, {
							method: 'GET',
							headers: {
								'Accept': 'application/json;version=2'
							}
						})
							.then(response => {
								// Check if the response is ok
								if (!response.ok) {
									// If not, throw an error
									throw new Error('Network response was not ok');
								}
								// If response is ok, parse it as JSON
								return response.json();
							})
							.then(stage => {
								// console.log("stage:", stage);

								// Convert timestamps in the JSON object
								stage.values.forEach(entry => {
									entry[0] = formatNWSDate(entry[0]); // Update timestamp
								});

								// console.log("stage formatted = ", stage);

								// Get the last non-null value from the stage data
								const lastNonNullValue = getLastNonNullValue(stage);
								// console.log("lastNonNullValue:", lastNonNullValue);

								let timestampLast = null;
								let valueLast = null;
								let qualityCodeLast = null;

								// Check if a non-null value was found
								if (lastNonNullValue !== null) {
									// Extract timestamp, value, and quality code from the last non-null value
									timestampLast = lastNonNullValue.timestamp;
									valueLast = lastNonNullValue.value;
									qualityCodeLast = lastNonNullValue.qualityCode;
								} else {
									// If no non-null valueLast is found, log a message
									console.log("No lastNonNullValue found.");
								}

								const c_count = calculateCCount(tsidStage);
								// console.log("c_count:", c_count);

								const lastNonNull24HoursValue = getLastNonNull24HoursValue(stage, c_count);
								// console.log("lastNonNull24HoursValue:", lastNonNull24HoursValue);

								// Check if a non-null value was found
								if (lastNonNull24HoursValue !== null) {
									// Extract timestamp, value, and quality code from the last non-null value
									var timestamp24HoursLast = lastNonNull24HoursValue.timestamp;
									var value24HoursLast = lastNonNull24HoursValue.value;
									var qualityCode24HoursLast = lastNonNull24HoursValue.qualityCode;
								} else {
									// If no non-null valueLast is found, log a message
									console.log("No lastNonNull24HoursValue found.");
								}

								// Calculate the 24 hours change between first and last value
								const delta_24 = valueLast - value24HoursLast;
								// console.log("delta_24:", delta_24);

								// FLOOD CLASS
								var floodClass = determineStageClass(valueLast, flood_level, timestampLast);
								// console.log("floodClass:", floodClass);

								if (valueLast) {
									stageCellInnerHTML = "<span class='" + floodClass + "' title='" + stage.name + ", Value = " + valueLast.toFixed(2) + ", Date Time = " + timestampLast + ", Flood Level = " + flood_level.toFixed(2) + "'>"
										+ valueLast.toFixed(1)
										+ "</span>";

									stageDeltaCellInnerHTML = "<span class='last_max_value' title='" + stage.name + ", Value = " + value24HoursLast.toFixed(2) + ", Date Time = " + timestamp24HoursLast + ", Delta = (" + valueLast.toFixed(2) + " - " + value24HoursLast.toFixed(2) + ") = " + delta_24.toFixed(2) + "'>"
										+ delta_24.toFixed(1)
										+ "</span>";
								} else {
									stageCellInnerHTML = "<span class='missing'>" + "-M-" + "</span>"
								}
								stageCell.innerHTML = stageCellInnerHTML;
								stageDeltaCell.innerHTML = stageDeltaCellInnerHTML;
							})
							.catch(error => {
								// Catch and log any errors that occur during fetching or processing
								console.error("Error fetching or processing data:", error);
							});
					}
				})();

				// NWS DAY1, DAY2, DAY3, Forecast Time
				(() => {
					// Create a new table cell
					const nwsDayOneCell = row.insertCell(4);
					nwsDayOneCell.classList.add("next_3_days");
					nwsDayOneCell.style.width = "5%";

					const nwsDayTwoCell = row.insertCell(5);
					nwsDayTwoCell.classList.add("next_3_days");
					nwsDayTwoCell.style.width = "5%";

					const nwsDayThreeCell = row.insertCell(6);
					nwsDayThreeCell.classList.add("next_3_days");
					nwsDayThreeCell.style.width = "5%";

					const forecastTimeCell = row.insertCell(7);
					forecastTimeCell.classList.add("forecast_time");
					forecastTimeCell.style.width = "8%";

					// Initialize stageCwmsIdCell.innerHTML as an empty string
					let nwsDayOneCellInnerHTML = "--";
					let nwsDayTwoCellInnerHTML = "--";
					let nwsDayThreeCellInnerHTML = "--";
					let forecastTimeCellInnerHTML = "cdana";

					// Get stagerev tsid to check for version equal to 29
					const tsidStage = location['tsid-stage']?.['assigned-time-series']?.[0]?.['timeseries-id'] ?? null;

					const tsidNwsForecast = location['tsid-nws-forecast']?.['assigned-time-series']?.[0]?.['timeseries-id'] ?? null;

					const flood_level = location['flood']?.['constant-value'] ?? null;

					// Prepare time to send to CDA
					const { currentDateTimeMidNightISO, currentDateTimePlus4DaysMidNightISO } = generateDateTimeStrings(currentDateTime, currentDateTimePlus4Days);

					// Forecasts exist only at stage rev, no projects
					if (tsidStage !== null) {
						// console.log("tsidStage:", tsidStage);

						if (tsidNwsForecast !== null) {
							// console.log("The last two characters are not '29'");

							// Fetch the time series data from the API using the determined query string
							let urlNWS = null;
							if (cda === "public") {
								urlNWS = `${setBaseUrl}timeseries?name=${tsidNwsForecast}&begin=${currentDateTimeMidNightISO}&end=${currentDateTimePlus4DaysMidNightISO}&office=MVS`;
							} else if (cda === "internal") {
								urlNWS = `${setBaseUrl}timeseries?name=${tsidNwsForecast}&begin=${currentDateTimeMidNightISO}&end=${currentDateTimePlus4DaysMidNightISO}&office=MVS`;
							} else {
								urlNWS = null;
							}
							// console.log("urlNWS = ", urlNWS);
							fetch(urlNWS, {
								method: 'GET',
								headers: {
									'Accept': 'application/json;version=2'
								}
							})
								.then(response => {
									// Check if the response is ok
									if (!response.ok) {
										// If not, throw an error
										throw new Error('Network response was not ok');
									}
									// If response is ok, parse it as JSON
									return response.json();
								})
								.then(nws3Days => {
									// console.log("nws3Days: ", nws3Days);

									// Convert timestamps in the JSON object
									nws3Days.values.forEach(entry => {
										entry[0] = formatNWSDate(entry[0]); // Update timestamp
									});
									// console.log("nws3Days = ", nws3Days);

									// Extract values with time ending in "13:00"
									const valuesWithTimeNoon = extractValuesWithTimeNoon(nws3Days.values);
									// console.log("valuesWithTimeNoon = ", valuesWithTimeNoon);

									// Extract the first second middle value
									const firstFirstValue = valuesWithTimeNoon?.[1]?.[0];
									const firstMiddleValue = (valuesWithTimeNoon?.[1]?.[1] !== null) ? (((parseFloat(valuesWithTimeNoon?.[1]?.[1])).toFixed(1) < 10) & ((parseFloat(valuesWithTimeNoon?.[1]?.[1])).toFixed(1) >= 0) ? (parseFloat(valuesWithTimeNoon?.[1]?.[1])).toFixed(1) : (parseFloat(valuesWithTimeNoon?.[1]?.[1])).toFixed(1)) : "";
									// console.log("firstMiddleValue = ", firstMiddleValue);
									// console.log("firstMiddleValue = ", typeof (firstMiddleValue));

									// Extract the second second middle value
									const secondFirstValue = valuesWithTimeNoon?.[2]?.[0];
									const secondMiddleValue = (valuesWithTimeNoon?.[2]?.[1] !== null) ? (((parseFloat(valuesWithTimeNoon?.[2]?.[1])).toFixed(1) < 10) & ((parseFloat(valuesWithTimeNoon?.[2]?.[1])).toFixed(1) >= 0) ? (parseFloat(valuesWithTimeNoon?.[2]?.[1])).toFixed(1) : (parseFloat(valuesWithTimeNoon?.[2]?.[1])).toFixed(1)) : "";

									// Extract the third second middle value
									const thirdFirstValue = valuesWithTimeNoon?.[3]?.[0];
									const thirdMiddleValue = (valuesWithTimeNoon?.[3]?.[1] !== null) ? (((parseFloat(valuesWithTimeNoon?.[3]?.[1])).toFixed(1) < 10) & ((parseFloat(valuesWithTimeNoon?.[3]?.[1])).toFixed(1) >= 0) ? (parseFloat(valuesWithTimeNoon?.[3]?.[1])).toFixed(1) : (parseFloat(valuesWithTimeNoon?.[3]?.[1])).toFixed(1)) : "";

									// Dertermine Flood Classes
									var floodClassDay1 = determineStageClass(firstMiddleValue, flood_level, firstFirstValue);
									// console.log("floodClassDay1:", floodClassDay1);

									var floodClassDay2 = determineStageClass(secondMiddleValue, flood_level, secondFirstValue);
									// console.log("floodClassDay2:", floodClassDay2);

									var floodClassDay3 = determineStageClass(thirdMiddleValue, flood_level, thirdFirstValue);
									// console.log("floodClassDay3:", floodClassDay3);

									if (nws3Days !== null || nws3Days !== undefined) {
										if (firstMiddleValue !== null && !isNaN(firstMiddleValue)) {
											nwsDayOneCellInnerHTML = "<span class='" + floodClassDay1 + "'>" + firstMiddleValue + "</span>";
										} else {
											nwsDayOneCellInnerHTML = "<span class='" + floodClassDay1 + "'>" + "-" + "</span>";
										}

										if (secondMiddleValue !== null && !isNaN(secondMiddleValue)) {
											nwsDayTwoCellInnerHTML = "<span class='" + floodClassDay2 + "'>" + secondMiddleValue + "</span>";
										} else {
											nwsDayTwoCellInnerHTML = "<span class='" + floodClassDay2 + "'>" + "-" + "</span>";
										}

										if (thirdMiddleValue !== null && !isNaN(thirdMiddleValue)) {
											nwsDayThreeCellInnerHTML = "<span class='" + floodClassDay3 + "'>" + thirdMiddleValue + "</span>";
										} else {
											nwsDayThreeCellInnerHTML = "<span class='" + floodClassDay3 + "'>" + "-" + "</span>";
										}

										// fetchAndLogNwsData(tsidNwsForecast, forecastTimeCell); // Use PHP json method to get forecast time
									} else {
										nwsDayOneCellInnerHTML = "<span class='missing'>" + "-M-" + "</span>";
										nwsDayTwoCellInnerHTML = "<span class='missing'>" + "-M-" + "</span>";
										nwsDayThreeCellInnerHTML = "<span class='missing'>" + "-M-" + "</span>";
										forecastTimeCellInnerHTML = "<span class='missing' style='background-color: orange;'>" + "-cdana-" + "</span>";
									}

									nwsDayOneCell.innerHTML = nwsDayOneCellInnerHTML;
									nwsDayTwoCell.innerHTML = nwsDayTwoCellInnerHTML;
									nwsDayThreeCell.innerHTML = nwsDayThreeCellInnerHTML;
									forecastTimeCell.innerHTML = forecastTimeCellInnerHTML;
								})
								.catch(error => {
									// Catch and log any errors that occur during fetching or processing
									console.error("Error fetching or processing data:", error);
								});
						}
					}
				})();

				// CREST AND CREST DATE
				(() => {
					// Create a new table cell
					const crestCell = row.insertCell(8);
					crestCell.style.width = "5%";

					const crestDateCell = row.insertCell(9);
					crestDateCell.style.width = "5%";

					// Initialize stageCwmsIdCell.innerHTML as an empty string
					let crestCellInnerHTML = "cdana";
					let crestDateCellInnerHTML = "cdana";

					// Get tsid
					const tsidCrest = location['tsid-nws-crest']?.['assigned-time-series']?.[0]?.['timeseries-id'] ?? null;
					const flood_level = location['flood']['constant-value'];

					// Prepare time to send to CDA
					const { currentDateTimeMidNightISO, currentDateTimePlus4DaysMidNightISO } = generateDateTimeStrings(currentDateTime, currentDateTimePlus14Days);

					// // Use PHP 
					// fetchAndLogNwsCrestData(tsidCrest, crestCell, crestDateCell);

					if (tsidCrest !== null) {
						// Fetch the time series data from the API using the determined query string
						let urlCrest = null;
						if (cda === "public") {
							urlCrest = `${setBaseUrl}timeseries?name=${tsidCrest}&begin=${currentDateTimeMidNightISO}&end=${currentDateTimePlus4DaysMidNightISO}&office=MVS`;
						} else if (cda === "internal") {
							urlCrest = `${setBaseUrl}timeseries?name=${tsidCrest}&begin=${currentDateTimeMidNightISO}&end=${currentDateTimePlus4DaysMidNightISO}&office=MVS`;
						} else {
							urlCrest = null;
						}
						// console.log("urlCrest = ", urlCrest);
						fetch(urlCrest, {
							method: 'GET',
							headers: {
								'Accept': 'application/json;version=2'
							}
						})
							.then(response => {
								if (!response.ok) {
									if (response.status === 404) {
										throw new Error('Resource not found (404)');
									} else {
										throw new Error('Network response was not ok');
									}
								}
								return response.json();
							})
							.then(crest => {
								if (crest && crest.values) {
									crest.values.forEach(entry => {
										entry[0] = formatNWSDate(entry[0]); // Update timestamp
									});

									// console.log("crest = ", crest);

									const lastNonNullCrestValue = getLastNonNullValue(crest);

									if (lastNonNullCrestValue !== null) {
										var timestampLastCrest = lastNonNullCrestValue.timestamp;
										var valueLastCrest = parseFloat(lastNonNullCrestValue.value).toFixed(2);
										var qualityCodeLastCrest = lastNonNullCrestValue.qualityCode;

										const c_count = calculateCCount(tsidCrest);

										const formattedLastCrestValueTimeStamp = formatTimestampToString(timestampLastCrest);

										const timeStampDateCrestObject = new Date(timestampLastCrest);

										var floodClass = determineStageClass(valueLastCrest, flood_level);

										if (valueLastCrest === null) {
											crestCellInnerHTML = "<span class='missing'>" + "-M-" + "</span>";
										} else if (valueLastCrest === undefined) {
											crestCellInnerHTML = "<span>" + "" + "</span>";
										} else {
											crestCellInnerHTML = "<span style='font-weight: bold; color: red; font-size: 1.5em;' title='" + crest.name + ", Value = " + valueLastCrest + ", Date Time = " + timestampLastCrest + "'>" + valueLastCrest + "</span>";
										}
										crestCell.innerHTML = crestCellInnerHTML;

										if (valueLastCrest === null) {
											crestDateCellInnerHTML = "<span class='missing'>" + "-M-" + "</span>";
										} else if (valueLastCrest === undefined) {
											crestDateCellInnerHTML = "<span>" + "" + "</span>";
										} else {
											crestDateCellInnerHTML = "<span style='font-weight: bold; font-size: 1.5em;' title='" + crest.name + ", Value = " + valueLastCrest + ", Date Time = " + timestampLastCrest + "'>" + timestampLastCrest.substring(0, 5) + "</span>";
										}
										crestDateCell.innerHTML = crestDateCellInnerHTML;
									} else {
										crestCell.innerHTML = "";
										crestDateCell.innerHTML = "";
									}
								} else {
									crestCell.innerHTML = "";
									crestDateCell.innerHTML = "";
								}
							})
							.catch(error => {
								// Catch and log any errors that occur during fetching or processing
								console.error("Error fetching or processing data:", error);
								// Optionally provide user feedback for the error
								crestCell.innerHTML = "<span class='error'>--</span>";
								crestDateCell.innerHTML = "<span class='error'>--</span>";
							});
					} else {
						crestCell.innerHTML = crestCellInnerHTML;
						crestDateCell.innerHTML = crestDateCellInnerHTML;
					}
				})();

				// LD SETTINGS
				(() => {
					// Create a new table cell
					const lDSettingCell = row.insertCell(10);
					lDSettingCell.classList.add("project_gage");
					lDSettingCell.style.width = "15%";

					// console.log('data.location_id:', data.location_id);

					// Initialize stageCwmsIdCell.innerHTML as an empty string
					let lDSettingCellInnerHTML = "--";

					const tsidTaint = location['tsid-taint']?.['assigned-time-series']?.[0]?.['timeseries-id'] ?? null;
					// console.log("tsidTaint: " + tsidTaint);

					const tsidRoll = location['tsid-roll']?.['assigned-time-series']?.[0]?.['timeseries-id'] ?? null;
					// console.log("tsidRoll: " + tsidRoll);

					if (tsidTaint !== null || tsidRoll !== null) {
						let urlTainter = null;
						if (cda === "public") {
							urlTainter = `${setBaseUrl}timeseries?name=${tsidTaint}&begin=${currentDateTimeMinus30Hours.toISOString()}&end=${currentDateTime.toISOString()}&office=MVS`;
						} else if (cda === "internal") {
							urlTainter = `${setBaseUrl}timeseries?name=${tsidTaint}&begin=${currentDateTimeMinus30Hours.toISOString()}&end=${currentDateTime.toISOString()}&office=MVS`;
						}
						fetch(urlTainter, {
							method: 'GET',
							headers: {
								'Accept': 'application/json;version=2'
							}
						})
							.then(response => {
								if (!response.ok) {
									if (response.status === 404) {
										throw new Error('Resource not found (404)');
									} else {
										throw new Error('Network response was not ok');
									}
								}
								return response.json();
							})
							.then(tainter => {
								// Log the tainter to the console
								// console.log("tainter: ", data.location_id, data.tsid_taint, tainter);

								if (tainter !== null) {
									// Your code to be executed if tainter is not null
									// console.log("tainter is not null");

									// Convert timestamps in the JSON object
									tainter.values.forEach(entry => {
										entry[0] = formatNWSDate(entry[0]); // Update timestamp
									});

									// console.log("tainter formatted = ", tainter);

									// Get the last non-null value from the tainter data
									const lastNonNullValue = getLastNonNullValue(tainter);
									// console.log("lastNonNullValue:", lastNonNullValue);

									// Check if a non-null value was found
									if (lastNonNullValue !== null) {
										// Extract timestamp, value, and quality code from the last non-null value
										var timestampLast = lastNonNullValue.timestamp;
										var valueLast = lastNonNullValue.value;
										var qualityCodeLast = lastNonNullValue.qualityCode;
										// console.log("timestampLast:", timestampLast);
										// console.log("timestampLast:", typeof (timestampLast));
										// console.log("valueLast:", valueLast);
										// console.log("qualityCodeLast:", qualityCodeLast);
									} else {
										// If no non-null valueLast is found, log a message
										console.log("No non-null valueLast found.");
									}

									let tainter_value = "";
									if (valueLast > 900) {
										tainter_value = "OR";
									} else {
										tainter_value = valueLast.toFixed(1);
									}

									// Set the combined value to the cell, preserving HTML
									lDSettingCellInnerHTML = "<span class='Board_Tainter' title='" + "" + "'>" + tainter_value + "</span>";
									// console.log("lDSettingCellInnerHTML = ", lDSettingCellInnerHTML);

									// Set the HTML inside the cell once the fetch is complete
									lDSettingCell.innerHTML = lDSettingCellInnerHTML;
								} else if (tainter === null && data.tsid_taint !== null) {
									// console.log('data.location_id:', data.location_id);
									lDSettingCellInnerHTML = "<span class='Board_Tainter' title='Tsid Tainter Exist But Missing Value'>" + "-M-" + "</span>";
									// console.log("lDSettingCellInnerHTML = ", lDSettingCellInnerHTML);
								} else {
									// Your code to be executed if ld_setting is null
									// console.log("tainter is null");

									// Set the combined value to the cell, preserving HTML
									lDSettingCellInnerHTML = "";
									// console.log("lDSettingCellInnerHTML = ", lDSettingCellInnerHTML);
								}
								lDSettingCell.innerHTML = lDSettingCellInnerHTML;

								// console.log("Has Roller");

								let secondUrlRoller = null;
								if (cda === "public") {
									secondUrlRoller = `${setBaseUrl}timeseries?name=${tsidRoll}&begin=${currentDateTimeMinus30Hours.toISOString()}&end=${currentDateTime.toISOString()}&office=MVS`;
								} else if (cda === "internal") {
									secondUrlRoller = `${setBaseUrl}timeseries?name=${tsidRoll}&begin=${currentDateTimeMinus30Hours.toISOString()}&end=${currentDateTime.toISOString()}&office=MVS`;
								}
								// console.log("secondUrlRoller: ", secondUrlRoller);
								return fetch(secondUrlRoller, {
									method: 'GET',
									headers: {
										'Accept': 'application/json;version=2'
									}
								});
							})
							.then(response => response.json())
							.then(roller => {
								// Process the data from the third fetch
								// console.log('roller:', roller);

								if (roller !== null) {
									// Your code to be executed if roller is not null
									// console.log("roller is not null");

									// Get the last non-null value from the tainter data
									const lastNonNullValue = getLastNonNullValue(roller);
									// console.log("lastNonNullValue:", lastNonNullValue);

									// Check if a non-null value was found
									if (lastNonNullValue !== null) {
										// Extract timestamp, value, and quality code from the last non-null value
										var timestampLast = lastNonNullValue.timestamp;
										var valueLast = lastNonNullValue.value;
										var qualityCodeLast = lastNonNullValue.qualityCode;
										// console.log("timestampLast:", timestampLast);
										// console.log("timestampLast:", typeof (timestampLast));
										// console.log("valueLast:", valueLast);
										// console.log("qualityCodeLast:", qualityCodeLast);
									} else {
										// If no non-null valueLast is found, log a message
										console.log("No non-null valueLast found.");
									}

									let roller_value = "";
									if (valueLast > 900) {
										roller_value = "OR";
									} else {
										roller_value = valueLast.toFixed(1);
									}

									// Set the combined value to the cell, preserving HTML
									lDSettingCellInnerHTML += "<span class='Board_Roller' title='" + "" + "'>" + roller_value + "</span>";
									// console.log("lDSettingCellInnerHTML = ", lDSettingCellInnerHTML);

									// Set the HTML inside the cell once the fetch is complete
									lDSettingCell.innerHTML = lDSettingCellInnerHTML;
								} else if (roller === null && data.tsid_roll !== null) { // roller is missing
									lDSettingCellInnerHTML += "<span class='Board_Roller' title='Tsid Roller Exist But Missing Value'>" + "-M-" + "</span>";
									// console.log("lDSettingCellInnerHTML = ", lDSettingCellInnerHTML);
								} else {
									// Your code to be executed if ld_setting is null
									// console.log("roller is null");

									// Set the combined value to the cell, preserving HTML
									lDSettingCellInnerHTML += "<span class='Board_Roller_Hide' title='No Roller'>" + "" + "</span>";
									// console.log("lDSettingCellInnerHTML = ", lDSettingCellInnerHTML);
								}
								lDSettingCell.innerHTML = lDSettingCellInnerHTML;
							})
							.catch(error => {
								console.error('Error:', error);
							});
					} else {
						if (location['closure'] && location['closure']['level-comment']) {
							lDSettingCellInnerHTML = "<span>" + location['closure']['level-comment'].split(',')[0] + "</span>";
						} else {
							lDSettingCellInnerHTML = "";
						}
						lDSettingCell.innerHTML = lDSettingCellInnerHTML;
					}
				})();

				// LWRP OR FLOODSTAGE
				(() => {
					if (display_type === "LWRP") {
						// Create a new table cell
						const lwrpCell = row.insertCell(11);
						lwrpCell.classList.add("Font_15");
						lwrpCell.style.width = "5%";

						// Initialize stageCwmsIdCell.innerHTML as an empty string
						let lwrpCellInnerHTML = "--";

						if (location['lwrp']) {
							if (location['location-id'] === "Alton-Mississippi") {
								// Set the combined value to the cell, preserving HTML
								lwrpCellInnerHTML = "<span title='" + "--" + "'>" + (location['lwrp']['constant-value'] + 400).toFixed(1) + "</span>";
								// console.log("lwrpCellInnerHTML = ", lwrpCellInnerHTML);
							} else {
								if (location['lwrp']['constant-value'] < 900) {
									// Set the combined value to the cell, preserving HTML
									lwrpCellInnerHTML = "<span title='" + "--" + "'>" + location['lwrp']['constant-value'].toFixed(1) + "</span>";
									// console.log("lwrpCellInnerHTML = ", lwrpCellInnerHTML);
								} else {
									lwrpCellInnerHTML = "<span title='" + "--" + "'>" + "" + "</span>";
								}
							}

							// Set the HTML inside the cell once the fetch is complete
							lwrpCell.innerHTML = lwrpCellInnerHTML;
						} else {
							// Set the combined value to the cell, preserving HTML
							lwrpCellInnerHTML = "<span >" + "" + "</span>";
							// console.log("lwrpCellInnerHTML = ", lwrpCellInnerHTML);

							// Set the HTML inside the cell once the fetch is complete
							lwrpCell.innerHTML = lwrpCellInnerHTML;
						}
					} else if (display_type === "FloodStage") {
						// Create a new table cell
						const floodStageCell = row.insertCell(11);
						floodStageCell.classList.add("Font_15");
						floodStageCell.style.width = "5%";

						// Initialize stageCwmsIdCell.innerHTML as an empty string
						let floodStageCellInnerHTML = "";

						if (location['flood']["constant-value"] !== null) {

							if (location['flood']["constant-value"] > 900) {
								floodStageCellInnerHTML = "<span title='" + "" + "'>" + "" + "</span>";
							} else {
								floodStageCellInnerHTML = "<span title='" + location['flood']["location-level-id"] + "'>" + (location['flood']["constant-value"]).toFixed(1) + "</span>";
							}
							// Set the HTML inside the cell once the fetch is complete
							floodStageCell.innerHTML = floodStageCellInnerHTML;
						} else {
							floodStageCellInnerHTML = "";
							// Set the HTML inside the cell once the fetch is complete
							floodStageCell.innerHTML = floodStageCellInnerHTML;
						}
					} else {

					}
				})();

				// PLUS MINUS LWRP OR PHASE1/PHASE2 
				(() => {
					if (display_type === "LWRP") {
						// Create a new table cell
						const plusMinusLWRPCell = row.insertCell(12);
						plusMinusLWRPCell.classList.add("Font_15");
						plusMinusLWRPCell.style.width = "8%";

						// Initialize stageCwmsIdCell.innerHTML as an empty string
						let plusMinusLWRPCellInnerHTML = "";

						const tsidStage = location['tsid-stage']?.['assigned-time-series']?.[0]?.['timeseries-id'] ?? null;
						const flood_level = location['flood']['constant-value'];
						// console.log("tsidStage = ", tsidStage);

						if (tsidStage !== null) {
							// Fetch the time series data from the API using the determined query string
							let urlStage = null;
							if (cda === "public") {
								urlStage = `${setBaseUrl}timeseries?name=${tsidStage}&begin=${currentDateTimeMinus30Hours.toISOString()}&end=${currentDateTime.toISOString()}&office=${office}`;
							} else if (cda === "internal") {
								urlStage = `${setBaseUrl}timeseries?name=${tsidStage}&begin=${currentDateTimeMinus30Hours.toISOString()}&end=${currentDateTime.toISOString()}&office=${office}`;
							} else {

							}
							// console.log("urlStage = ", urlStage);
							fetch(urlStage, {
								method: 'GET',
								headers: {
									'Accept': 'application/json;version=2'
								}
							})
								.then(response => {
									// Check if the response is ok
									if (!response.ok) {
										// If not, throw an error
										throw new Error('Network response was not ok');
									}
									// If response is ok, parse it as JSON
									return response.json();
								})
								.then(stage => {
									// console.log("stage:", stage);

									// Convert timestamps in the JSON object
									stage.values.forEach(entry => {
										entry[0] = formatNWSDate(entry[0]); // Update timestamp
									});
									// console.log("stage formatted = ", stage);

									// Get the last non-null value from the stage data
									const lastNonNullValue = getLastNonNullValue(stage);
									// console.log("lastNonNullValue:", lastNonNullValue);

									// Check if a non-null value was found
									if (lastNonNullValue !== null) {
										// Extract timestamp, value, and quality code from the last non-null value
										var timestampLast = lastNonNullValue.timestamp;
										var valueLast = lastNonNullValue.value;
										var qualityCodeLast = lastNonNullValue.qualityCode;
									} else {
										// If no non-null valueLast is found, log a message
										console.log("No lastNonNullValue found.");
									}

									// Check for Nav TW-Kaskaskia
									let plusMinusLwrp = null;
									if (location['location-id'] === "Nav TW-Kaskaskia") {
										if (location['lwrp'] && location['lwrp']['constant-value'] !== undefined) {
											plusMinusLwrp = ((valueLast - 0) - location['lwrp']['constant-value']).toFixed(1);
										} else {
											console.warn("Warn: 'constant-value' is missing in location['lwrp']");
										}
									} else {
										if (location['lwrp'] && location['lwrp']['constant-value'] !== undefined) {
											plusMinusLwrp = (valueLast - location['lwrp']['constant-value']).toFixed(1);
										} else {
											console.warn("Warn: 'constant-value' is missing in location['lwrp']");
										}
									}

									// Add "+" for positive and "-" for negative values
									const formattedTotal = plusMinusLwrp >= 0 ? `+${plusMinusLwrp}` : plusMinusLwrp;

									if (location['lwrp'] !== null && valueLast !== null) {
										if (location['lwrp']['constant-value'] < 900) {
											if (valueLast !== null && valueLast !== undefined) {
												plusMinusLWRPCellInnerHTML = `<span title="${valueLast}, ${location['lwrp']['constant-value']}">${formattedTotal}</span>`;
											} else {
												plusMinusLWRPCellInnerHTML = "<span class='missing'>-M-</span>";
											}
										} else {
											plusMinusLWRPCellInnerHTML = "<span class='missing'></span>";
										}
									} else {
										plusMinusLWRPCellInnerHTML = "<span class='missing'></span>";
									}

									plusMinusLWRPCell.innerHTML = plusMinusLWRPCellInnerHTML;
								})
								.catch(error => {
									// Catch and log any errors that occur during fetching or processing
									console.error("Error fetching or processing data:", error);
								});
						}
						plusMinusLWRPCell.innerHTML = plusMinusLWRPCellInnerHTML;

					} else if (display_type === "FloodStage") {
						// Create a new table cell
						const actionStageCell = row.insertCell(12);
						actionStageCell.classList.add("Font_12");
						actionStageCell.style.width = "8%";

						// Initialize stageCwmsIdCell.innerHTML as an empty string
						let actionStageCellInnerHTML = "--";

						if (location['eoc-phase-1'] && location['eoc-phase-2']) {
							const phase1_value = location['eoc-phase-1']["constant-value"];
							const phase2_value = location['eoc-phase-2']["constant-value"];

							// Set the combined value to the cell, preserving HTML
							actionStageCellInnerHTML = "<span title='" + location['eoc-phase-1']["location-level-id"] + " : " + location['eoc-phase-2']["location-level-id"] + "'>" + phase1_value.toFixed(1) + "/" + phase2_value.toFixed(1) + "</span>";
							// console.log("actionStageCellInnerHTML = ", actionStageCellInnerHTML);

							// Set the HTML inside the cell once the fetch is complete
							actionStageCell.innerHTML = actionStageCellInnerHTML;
						} else {
							actionStageCell.innerHTML = actionStageCellInnerHTML;
							// console.log("No data fetched from either LWRP or stage API");
						}
					} else {
						// Create a new table cell
						const yCell = row.insertCell(12);
						yCell.classList.add("Font_12");
						yCell.style.width = "8%";

						// Initialize stageCwmsIdCell.innerHTML as an empty string
						let yCellInnerHTML = "-0-";
						yCell.innerHTML = yCellInnerHTML;
					}
				})();

				// GAGEZERO
				(() => {
					// Create a new table cell
					const gageZeroCell = row.insertCell(13);
					gageZeroCell.classList.add("Font_15");
					gageZeroCell.style.width = "6%";

					// Initialize stageCwmsIdCell.innerHTML as an empty string
					let gageZeroCellInnerHTML = "--";

					// TODO: Cairo still use NGVD29, needs to change to NAV88. NAVD88 = 271.08ft
					if (location['location_id'] === "Alton-Mississippi") {
						// Set the combined value to the cell, preserving HTML
						gageZeroCellInnerHTML = "<span title='" + "vertical_datum: " + "NAVD88" + "'>" + (location['metadata']["elevation"] - (location['ngvd29']["constant-value"])).toFixed(2) + "</span>";
						// console.log("gageZeroCellInnerHTML = ", gageZeroCellInnerHTML);
					} else {
						if (location['metadata']["vertical-datum"] === "NAVD88") {
							// Set the combined value to the cell, preserving HTML
							gageZeroCellInnerHTML = "<span title='" + "vertical_datum: " + location['metadata']["vertical-datum"] + "'>" + location['metadata']["elevation"].toFixed(2) + "</span>";
							// console.log("gageZeroCellInnerHTML = ", gageZeroCellInnerHTML);
						} else if (location['metadata']["vertical-datum"] === "NGVD29") {
							// Set the combined value to the cell, preserving HTML
							gageZeroCellInnerHTML = "<span style='color: black;' title='" + "vertical_datum: " + location['metadata']["vertical-datum"] + "'>" + location['metadata']["elevation"].toFixed(2) + "<sub style='font-size: 0.5em;'>(NGVD29)</sub>" + "</span>";
							// console.log("gageZeroCellInnerHTML = ", gageZeroCellInnerHTML);
						} else {
							// Set the combined value to the cell, preserving HTML
							gageZeroCellInnerHTML = "<span title='" + "vertical_datum: " + data.vertical_datum + "'>" + "  " + "</span>";
							// console.log("gageZeroCellInnerHTML = ", gageZeroCellInnerHTML);
						}
					}

					// Set the HTML inside the cell once the fetch is complete
					gageZeroCell.innerHTML = gageZeroCellInnerHTML;
				})();

			});
		});
	}

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