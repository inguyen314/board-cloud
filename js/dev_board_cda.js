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

	if (json === "true") {
		fetch(`json/gage_control.json`)
			.then(response => {
				if (!response.ok) {
					throw new Error('Network response was not ok');
				}
				return response.json();
			})
			.then(gageControlData => {
				console.log('gageControlData:', gageControlData);

				const formatDate = (daysToAdd) => {
					const date = new Date();
					date.setDate(date.getDate() + daysToAdd);
					return ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);
				};

				const [day1, day2, day3] = [1, 2, 3].map(days => formatDate(days));
				const combinedDataRiver = structuredClone ? structuredClone(gageControlData) : JSON.parse(JSON.stringify(gageControlData));
				const combinedDataReservoir = structuredClone ? structuredClone(gageControlData) : JSON.parse(JSON.stringify(gageControlData));

				console.log('combinedDataRiver:', combinedDataRiver);
				console.log('combinedDataReservoir:', combinedDataReservoir);

				let tableRiver = null;
				let tableReservoir = null;

				if ((display_type === "FloodStage" || display_type === "LWRP") && display_tributary === "False") {
					// Correctly filter `combinedDataRiver`
					const filteredDataRiver = combinedDataRiver.filter(item => item.id === "Mississippi");

					console.log('filteredDataRiver:', filteredDataRiver);

					if (filteredDataRiver.length > 0) {
						tableRiver = createTable(filteredDataRiver, setBaseUrl, display_type, display_tributary);
					}
				} else if (display_type === "Lake" && display_tributary === "False") {
					// tableReservoir = createTable(combinedDataReservoir, display_type, day1, day2, day3, lakeLocs, setBaseUrl);
				}

				loadingIndicator.style.display = 'none';
			})
			.catch(error => {
				console.error('Error fetching data:', error);
			});
	} else {
		let setLocationCategory = null;
		let setLocationGroupOwner = null;
		let setTimeseriesGroup1 = null;
		let setTimeseriesGroup2 = null;
		let setTimeseriesGroup3 = null;
		let setTimeseriesGroup4 = null;
		let setTimeseriesGroup5 = null;
		let setTimeseriesGroup6 = null;
		let setLookBack = null;
		let setLookForward = null;

		setLocationCategory = "Basins";
		setLocationGroupOwner = "River-Reservoir";
		setTimeseriesGroup1 = "Stage";
		setTimeseriesGroup2 = "Forecast-NWS";
		setTimeseriesGroup3 = "Crest";
		setTimeseriesGroup4 = "Precip-Lake";
		setTimeseriesGroup5 = "Inflow-Yesterday-Lake";
		setTimeseriesGroup6 = "Storage";
		setLookBack = subtractDaysFromDate(new Date(), 2);
		setLookForward = addDaysFromDate(new Date(), 14);

		const categoryApiUrl = setBaseUrl + `location/group?office=${office}&group-office-id=${office}&category-office-id=${office}&category-id=${setLocationCategory}`;

		// Initialize Maps to hold datasets
		const metadataMap = new Map();
		const recordStageMap = new Map();
		const lwrpMap = new Map();
		const floodMap = new Map();
		const stageTsidMap = new Map();
		const riverMileMap = new Map();
		const forecastNwsTsidMap = new Map();
		const crestNwsTsidMap = new Map();
		const precipLakeTsidMap = new Map();
		const inflowYesterdayLakeTsidMap = new Map();
		const storageLakeTsidMap = new Map();
		const topOfFloodMap = new Map();
		const topOfConservationMap = new Map();
		const bottomOfFloodMap = new Map();
		const bottomOfConservationMap = new Map();

		// Fetch data functions with promise arrays for async processing
		const metadataPromises = [];
		const recordStageTsidPromises = [];
		const lwrpPromises = [];
		const floodPromises = [];
		const stageTsidPromises = [];
		const riverMilePromises = [];
		const forecastNwsTsidPromises = [];
		const crestTsidPromises = [];
		const precipLakeTsidPromises = [];
		const inflowYesterdayLakeTsidPromises = [];
		const storageLakeTsidPromises = [];
		const topOfFloodPromises = [];
		const topOfConservationPromises = [];
		const bottomOfFloodPromises = [];
		const bottomOfConservationPromises = [];
		const apiPromises = [];

		let combinedData = [];

		// Initial category fetch
		fetch(categoryApiUrl)
			.then(response => {
				if (!response.ok) throw new Error('Network response was not ok');
				return response.json();
			})
			.then(data => {
				if (!Array.isArray(data) || data.length === 0) {
					console.warn('No data available from the initial fetch.');
					return;
				}

				// Filter data where category is "Basins"
				const targetCategory = { "office-id": office, "id": setLocationCategory };
				const filteredArray = filterByLocationCategory(data, targetCategory);

				let basins = filteredArray.map(item => item.id);
				if (basins.length === 0) {
					console.warn('No basins found for the given category.');
					return;
				}

				console.log("basins: ", basins);

				basins = basins.filter((basin, index) => index === 6);
				// basins = basins.slice(3, 6);

				console.log("basins filter: ", basins);

				// Loop through each basin and get all the assigned locations
				basins.forEach(basin => {
					const basinApiUrl = `${setBaseUrl}location/group/${basin}?office=${office}&category-id=${setLocationCategory}`;
					console.log("basinApiUrl: ", basinApiUrl)
					apiPromises.push(
						fetch(basinApiUrl)
							.then(response => {
								if (!response.ok) throw new Error(`Network response was not ok for basin ${basin}`);
								return response.json();
							})
							.then(getBasin => {
								// console.log("getBasin: ", getBasin);

								if (getBasin) {
									// Fetch additional data needed for filtering
									const additionalDataPromises = getBasin['assigned-locations'].map(location => {
										return fetchAdditionalLocationGroupOwnerData(location[`location-id`], setBaseUrl, setLocationGroupOwner, office);
									});

									// console.log("additionalDataPromises: ", additionalDataPromises);

									// Wait for all promises to resolve
									Promise.all(additionalDataPromises)
										.then(results => {
											results = results[0];
											console.log("results: ", results);

											// Loop through getBasin['assigned-locations'] and compare with results
											getBasin['assigned-locations'] = getBasin['assigned-locations'].filter(location => {
												let matchedData;
												// Check if 'assigned-locations' exists in the results object
												if (results && results['assigned-locations']) {
													for (const loc of results['assigned-locations']) {
														// console.log('Comparing:', loc['location-id'], 'with', location['location-id']);
														if (loc['location-id'] === location['location-id']) {
															matchedData = results;
															break;
														}
													}
												}
												// console.log("matchedData: ", matchedData);

												if (matchedData) {
													// If matchedData exists and contains a location with the same location-id, keep the location
													return true;
												} else {
													// Log the location that has been removed
													// console.log("Removed location: ", location);
													return false;  // Remove location if there is no match
												}
											});

											// Filter locations with attribute <= 900
											getBasin['assigned-locations'] = getBasin['assigned-locations'].filter(location => location.attribute <= 900);

											// Sort the locations by their attribute
											getBasin['assigned-locations'].sort((a, b) => a.attribute - b.attribute);

											// Push the updated basin data to combinedData
											combinedData.push(getBasin);

											console.log("combinedData: ", combinedData);
										})
										.catch(error => {
											console.error('Error in fetching additional data:', error);
										});

									getBasin['assigned-locations'].forEach(loc => {
										fetchAndStoreDataForLocation(loc);
									});
								}
							})
							.catch(error => console.error(`Problem with the fetch operation for basin ${basin}:`, error))
					);
				});

				// Fetch data for each location's attributes
				function fetchAndStoreDataForLocation(loc) {
					// Fetch location levels
					(() => {
						const metadataApiUrl = `${setBaseUrl}locations/${loc['location-id']}?office=${office}`;
						metadataPromises.push(fetch(metadataApiUrl)
							.then(response => response.ok ? response.json() : null)
							.then(data => {
								if (data) {
									console.log(`Fetched metadata for location ${loc['location-id']}:`, data); // Log the data
									metadataMap.set(loc['location-id'], data);
								}
							})
							.catch(error => console.error(`Error fetching metadata for ${loc['location-id']}:`, error))
						);

						const recordStageLevelId = `${loc['location-id']}.Stage.Inst.0.Record Stage`;
						const levelIdEffectiveDate = "2024-01-01T08:00:00";
						const recordStageApiUrl = `${setBaseUrl}levels/${recordStageLevelId}?office=${office}&effective-date=${levelIdEffectiveDate}&unit=ft`;
						recordStageTsidPromises.push(
							fetch(recordStageApiUrl)
								.then(response => response.status === 404 ? null : response.ok ? response.json() : Promise.reject(`Network response was not ok: ${response.statusText}`))
								.then(recordStageData => {
									// Set map to null if the data is null or undefined
									recordStageMap.set(loc['location-id'], recordStageData != null ? recordStageData : null);
								})
								.catch(error => console.error(`Error fetching record stage for ${loc['location-id']}:`, error))
						);

						// For Rivers only
						if (!lakeLocs.includes(loc['location-id'])) {
							const riverMileApiUrl = `${setBaseUrl}stream-locations?office-mask=${office}&name-mask=${loc['location-id']}`;
							riverMilePromises.push(fetch(riverMileApiUrl)
								.then(response => response.ok ? response.json() : null)
								.then(data => data && riverMileMap.set(loc['location-id'], data))
								.catch(error => console.error(`Error fetching river mile for ${loc['location-id']}:`, error))
							);

							const levelIdLwrp = `${loc['location-id']}.Stage.Inst.0.LWRP`;
							const lwrpApiUrl = `${setBaseUrl}levels/${levelIdLwrp}?office=${office}&effective-date=${levelIdEffectiveDate}&unit=ft`;
							lwrpPromises.push(
								fetch(lwrpApiUrl)
									.then(response => response.status === 404 ? null : response.ok ? response.json() : Promise.reject(`Network response was not ok: ${response.statusText}`))
									.then(lwrpData => {
										// Set map to null if the data is null or undefined
										lwrpMap.set(loc['location-id'], lwrpData != null ? lwrpData : null);
									})
									.catch(error => console.error(`Error fetching lwrp level for ${loc['location-id']}:`, error))
							);

							const levelIdFlood = `${loc['location-id']}.Stage.Inst.0.Flood`;
							const floodApiUrl = `${setBaseUrl}levels/${levelIdFlood}?office=${office}&effective-date=${levelIdEffectiveDate}&unit=ft`;
							floodPromises.push(
								fetch(floodApiUrl)
									.then(response => response.status === 404 ? null : response.ok ? response.json() : Promise.reject(`Network response was not ok: ${response.statusText}`))
									.then(floodData => {
										// Set map to null if the data is null or undefined
										floodMap.set(loc['location-id'], floodData != null ? floodData : null);
									})
									.catch(error => console.error(`Error fetching flood level for ${loc['location-id']}:`, error))
							);

						}

						// For Lakes only
						if (lakeLocs.includes(loc['location-id'])) {
							const levelIdTopOfFlood = `${loc['location-id'].split('-')[0]}.Stor.Inst.0.Top of Flood`;
							const topOfFloodApiUrl = `${setBaseUrl}levels/${levelIdTopOfFlood}?office=${office}&effective-date=${levelIdEffectiveDate}&unit=ac-ft`;
							topOfFloodPromises.push(
								fetch(topOfFloodApiUrl)
									.then(response => response.status === 404 ? null : response.ok ? response.json() : Promise.reject(`Network response was not ok: ${response.statusText}`))
									.then(topOfFloodData => {
										// Set map to null if the data is null or undefined
										topOfFloodMap.set(loc['location-id'], topOfFloodData != null ? topOfFloodData : null);
									})
									.catch(error => console.error(`Error fetching top of flood level for ${loc['location-id']}:`, error))
							);

							const levelIdBottomOfFlood = `${loc['location-id'].split('-')[0]}.Stor.Inst.0.Bottom of Flood`;
							const bottomOfFloodApiUrl = `${setBaseUrl}levels/${levelIdBottomOfFlood}?office=${office}&effective-date=${levelIdEffectiveDate}&unit=ac-ft`;
							bottomOfFloodPromises.push(
								fetch(bottomOfFloodApiUrl)
									.then(response => response.status === 404 ? null : response.ok ? response.json() : Promise.reject(`Network response was not ok: ${response.statusText}`))
									.then(bottomOfFloodData => {
										// Set map to null if the data is null or undefined
										bottomOfFloodMap.set(loc['location-id'], bottomOfFloodData != null ? bottomOfFloodData : null);
									})
									.catch(error => console.error(`Error fetching bottom of flood level for ${loc['location-id']}:`, error))
							);

							const levelIdTopOfConservation = `${loc['location-id'].split('-')[0]}.Stor.Inst.0.Top of Conservation`;
							const topOfConservationApiUrl = `${setBaseUrl}levels/${levelIdTopOfConservation}?office=${office}&effective-date=${levelIdEffectiveDate}&unit=ac-ft`;
							topOfConservationPromises.push(
								fetch(topOfConservationApiUrl)
									.then(response => response.status === 404 ? null : response.ok ? response.json() : Promise.reject(`Network response was not ok: ${response.statusText}`))
									.then(topOfConservationData => {
										// Set map to null if the data is null or undefined
										topOfConservationMap.set(loc['location-id'], topOfConservationData != null ? topOfConservationData : null);
									})
									.catch(error => console.error(`Error fetching top of conservation level for ${loc['location-id']}:`, error))
							);

							const levelIdBottomOfConservation = `${loc['location-id'].split('-')[0]}.Stor.Inst.0.Bottom of Conservation`;
							const bottomOfConservationApiUrl = `${setBaseUrl}levels/${levelIdBottomOfConservation}?office=${office}&effective-date=${levelIdEffectiveDate}&unit=ac-ft`;
							bottomOfConservationPromises.push(
								fetch(bottomOfConservationApiUrl)
									.then(response => response.status === 404 ? null : response.ok ? response.json() : Promise.reject(`Network response was not ok: ${response.statusText}`))
									.then(bottomOfConservationData => {
										// Set map to null if the data is null or undefined
										bottomOfConservationMap.set(loc['location-id'], bottomOfConservationData != null ? bottomOfConservationData : null);
									})
									.catch(error => console.error(`Error fetching bottom of conservation level for ${loc['location-id']}:`, error))
							);
						}
					})();

					// Fetch tsids
					(() => {
						const stageApiUrl = `${setBaseUrl}timeseries/group/${setTimeseriesGroup1}?office=${office}&category-id=${loc['location-id']}`;
						stageTsidPromises.push(fetch(stageApiUrl)
							.then(response => response.ok ? response.json() : null)
							.then(data => {
								if (data) {
									// console.log(`Fetched stage data for location ${loc['location-id']}:`, data); // Log the data
									stageTsidMap.set(loc['location-id'], data);
								}
							})
							.catch(error => console.error(`Error fetching stage TSID for ${loc['location-id']}:`, error))
						);

						// For Rivers only
						if (!lakeLocs.includes(loc['location-id'])) {
							const forecastNwsApiUrl = `${setBaseUrl}timeseries/group/${setTimeseriesGroup2}?office=${office}&category-id=${loc['location-id']}`;
							forecastNwsTsidPromises.push(fetch(forecastNwsApiUrl)
								.then(response => response.ok ? response.json() : null)
								.then(data => {
									if (data) {
										// console.log(`Fetched forecast NWS data for location ${loc['location-id']}:`, data); // Log the data
										forecastNwsTsidMap.set(loc['location-id'], data);
									}
								})
								.catch(error => console.error(`Error fetching forecast NWS TSID for ${loc['location-id']}:`, error))
							);

							const crestApiUrl = `${setBaseUrl}timeseries/group/${setTimeseriesGroup3}?office=${office}&category-id=${loc['location-id']}`;
							crestTsidPromises.push(fetch(crestApiUrl)
								.then(response => response.ok ? response.json() : null)
								.then(data => data && crestNwsTsidMap.set(loc['location-id'], data))
								.catch(error => console.error(`Error fetching crest TSID for ${loc['location-id']}:`, error))
							);
						}

						// For Lakes only
						if (lakeLocs.includes(loc['location-id'])) {
							const precipLakeApiUrl = `${setBaseUrl}timeseries/group/${setTimeseriesGroup4}?office=${office}&category-id=${loc['location-id']}`;
							precipLakeTsidPromises.push(
								fetch(precipLakeApiUrl)
									.then(response => response.status === 404 ? null : response.ok ? response.json() : Promise.reject(`Network response was not ok: ${response.statusText}`))
									.then(data => data && precipLakeTsidMap.set(loc['location-id'], data))
									.catch(error => console.error(`Error fetching precipLake TSID for ${loc['location-id']}:`, error))
							);

							const inflowYesterdayLakeApiUrl = `${setBaseUrl}timeseries/group/${setTimeseriesGroup5}?office=${office}&category-id=${loc['location-id']}`;
							inflowYesterdayLakeTsidPromises.push(
								fetch(inflowYesterdayLakeApiUrl)
									.then(response => response.status === 404 ? null : response.ok ? response.json() : Promise.reject(`Network response was not ok: ${response.statusText}`))
									.then(data => data && inflowYesterdayLakeTsidMap.set(loc['location-id'], data))
									.catch(error => console.error(`Error fetching inflowYesterdayLake TSID for ${loc['location-id']}:`, error))
							);

							const storageLakeApiUrl = `${setBaseUrl}timeseries/group/${setTimeseriesGroup6}?office=${office}&category-id=${loc['location-id']}`;
							storageLakeTsidPromises.push(
								fetch(storageLakeApiUrl)
									.then(response => response.status === 404 ? null : response.ok ? response.json() : Promise.reject(`Network response was not ok: ${response.statusText}`))
									.then(data => data && storageLakeTsidMap.set(loc['location-id'], data))
									.catch(error => console.error(`Error fetching storageLake TSID for ${loc['location-id']}:`, error))
							);
						}
					})();
				}

				// Resolve all initial fetches before processing
				Promise.all(apiPromises)
					.then(() => Promise.all([
						...metadataPromises,
						...recordStageTsidPromises,
						...lwrpPromises,
						...floodPromises,
						...topOfFloodPromises,
						...topOfConservationPromises,
						...bottomOfFloodPromises,
						...bottomOfConservationPromises,
						...riverMilePromises,
						...stageTsidPromises,
						...forecastNwsTsidPromises,
						...crestTsidPromises,
						...precipLakeTsidPromises,
						...inflowYesterdayLakeTsidPromises,
						...storageLakeTsidPromises]))
					.then(() => {
						// Process data to add to each location and display combinedData
						combinedData.forEach(basinData => {
							if (basinData['assigned-locations']) {
								basinData['assigned-locations'].forEach(loc => {
									loc['metadata'] = metadataMap.get(loc['location-id']);
									loc['record-stage'] = recordStageMap.get(loc['location-id']);
									loc['lwrp'] = lwrpMap.get(loc['location-id']);
									loc['flood'] = floodMap.get(loc['location-id']);
									loc['top-of-flood'] = topOfFloodMap.get(loc['location-id']);
									loc['top-of-conservation'] = topOfConservationMap.get(loc['location-id']);
									loc['bottom-of-flood'] = bottomOfFloodMap.get(loc['location-id']);
									loc['bottom-of-conservation'] = bottomOfConservationMap.get(loc['location-id']);
									loc['river-mile'] = riverMileMap.get(loc['location-id']);
									loc['tsid-stage'] = stageTsidMap.get(loc['location-id']);
									loc['tsid-nws-forecast'] = forecastNwsTsidMap.get(loc['location-id']);
									loc['tsid-nws-crest'] = crestNwsTsidMap.get(loc['location-id']);
									loc['tsid-lake-precip'] = precipLakeTsidMap.get(loc['location-id']);
									loc['tsid-lake-inflow-yesterday'] = inflowYesterdayLakeTsidMap.get(loc['location-id']);
									loc['tsid-lake-storage'] = storageLakeTsidMap.get(loc['location-id']);
								});
							}
						});

						console.log('All combined data fetched successfully:', combinedData);

						// Filter data
						(() => {
							// Step 1: Remove locations where 'attribute' ends with '.1'
							combinedData.forEach(dataObj => {
								dataObj['assigned-locations'] = dataObj['assigned-locations'].filter(location => !location['attribute'].toString().endsWith('.1'));
							});
							console.log('Filtered locations with attribute ending in .1:', combinedData);

							// Step 3: Remove locations where 'tsid-stage' is null
							combinedData.forEach(dataGroup => {
								dataGroup['assigned-locations'] = dataGroup['assigned-locations'].filter(location => location['tsid-stage'] != null);
							});
							console.log('Filtered locations with null tsid-stage:', combinedData);

							// Step 4: Remove basins with no 'assigned-locations'
							combinedData = combinedData.filter(item => item['assigned-locations']?.length > 0);
							console.log('Filtered empty basins:', combinedData);

							// Step 5: Sort basins by predefined order
							const sortOrderBasin = ['Mississippi', 'Illinois', 'Cuivre', 'Missouri', 'Meramec', 'Ohio', 'Kaskaskia', 'Big Muddy', 'St Francis', 'Salt'];
							combinedData.sort((a, b) => {
								const indexA = sortOrderBasin.indexOf(a.id);
								const indexB = sortOrderBasin.indexOf(b.id);
								return (indexA === -1 ? 1 : indexA) - (indexB === -1 ? 1 : indexB);
							});
							console.log('Sorted basins:', combinedData);
						})();
					})
					.then(() => {
						console.log('All combinedData fetched and filtered successfully:', combinedData);

						const formatDate = (daysToAdd) => {
							const date = new Date();
							date.setDate(date.getDate() + daysToAdd);
							return ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);
						};

						const [day1, day2, day3] = [1, 2, 3].map(days => formatDate(days));
						const combinedDataRiver = structuredClone ? structuredClone(combinedData) : JSON.parse(JSON.stringify(combinedData));
						const combinedDataReservoir = structuredClone ? structuredClone(combinedData) : JSON.parse(JSON.stringify(combinedData));

						console.log('combinedDataRiver:', combinedDataRiver);
						console.log('combinedDataReservoir:', combinedDataReservoir);

						let tableRiver = null;
						let tableReservoir = null;

						if ((display_type === "FloodStage" || display_type === "LWRP") && display_tributary === "False") {
							// Correctly filter `combinedDataRiver`
							const filteredDataRiver = combinedDataRiver.filter(item => item.id === "Mississippi");

							console.log('filteredDataRiver:', filteredDataRiver);

							if (filteredDataRiver.length > 0) {
								tableRiver = createTable(filteredDataRiver, setBaseUrl, display_type, display_tributary);
							}
						} else if (display_type === "Lake" && display_tributary === "False") {
							// tableReservoir = createTable(combinedDataReservoir, display_type, day1, day2, day3, lakeLocs, setBaseUrl);
						}

						loadingIndicator.style.display = 'none';
					})
					.catch(error => {
						console.error('There was a problem with one or more fetch operations:', error);
						loadingIndicator.style.display = 'none';
					});
			})
			.catch(error => {
				console.error('There was a problem with the initial fetch operation:', error);
				loadingIndicator.style.display = 'none';
			});
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
// Function to create and populate the table
async function createTable(dataArray, setBaseUrl, display_type, display_tributary, jsonFileURL) {
	// Create a table element
	const table = document.createElement('table');
	table.setAttribute('id', 'board_cda');

	console.log('dataArray:', dataArray);

	// Flag to track if the basin has been printed
	let hasPrintedBasin = false;

	// Get current date and time
	const currentDateTime = new Date();
	// console.log('currentDateTime:', currentDateTime);

	const currentMonth = new Date().getMonth() + 1;
	console.log("currentMonth: ", currentMonth);

	// Subtract two hours from current date and time
	const currentDateTimeMinus2Hours = subtractHoursFromDate(currentDateTime, 2);
	// console.log('currentDateTimeMinus2Hours :', currentDateTimeMinus2Hours);

	// Subtract thirty hours from current date and time
	const currentDateTimeMinus30Hours = subtractHoursFromDate(currentDateTime, 64);
	// console.log('currentDateTimeMinus30Hours :', currentDateTimeMinus30Hours);

	// Add thirty hours to current date and time
	const currentDateTimePlus30Hours = plusHoursFromDate(currentDateTime, 30);
	// console.log('currentDateTimePlus30Hours :', currentDateTimePlus30Hours);

	// Add four days to current date and time
	const currentDateTimePlus4Days = addDaysToDate(currentDateTime, 4);
	// console.log('currentDateTimePlus4Days :', currentDateTimePlus4Days);

	// Add fourteen days to current date and time
	const currentDateTimePlus14Days = addDaysToDate(currentDateTime, 14);
	// console.log('currentDateTimePlus14Days :', currentDateTimePlus14Days);

	// Subtract thirty hours from current date and time
	const currentDateTimeMinus48Hours = subtractHoursFromDate(currentDateTime, 48);
	// console.log('currentDateTimeMinus48Hours :', currentDateTimeMinus48Hours);

	for (const arrayElement of dataArray) {
		// ======= BASIN HEADER =======
		// Create a header row for the basin
		const headerRow = table.insertRow();

		// Create a new table cell for basin that spans 14 columns
		const basinCell = document.createElement('th');
		basinCell.classList.add("basin");
		basinCell.textContent = arrayElement.basin;
		basinCell.colSpan = 14; // Set the colspan to 14
		basinCell.style.textAlign = "left"; // Align text to the left
		headerRow.appendChild(basinCell);

		for (const data of arrayElement[`assigned-locations`]) {
			const currentDateTime = new Date();
			const subtractedDateTime = subtractHoursFromDate(currentDateTime, 2);
			// console.log('currentDateTime:', currentDateTime);
			// console.log('subtractedDateTime :', subtractedDateTime);

			// GET GAGEZERO
			var stageFloodLevel = data.flood['constant-value'];
			// console.log("stageFloodLevel = ", stageFloodLevel);

			var elevation = data.metadata['elevation'];
			// console.log("elevation = ", elevation);

			var stage29FloodLevel = stageFloodLevel + 0;
			// console.log("stage29FloodLevel = ", stage29FloodLevel);

			var elevFloodLevel = elevation + stageFloodLevel;
			// console.log("elevFloodLevel = ", elevFloodLevel);

			// Setup flood level variable
			let flood_level = null;
			if (stage29FloodLevel !== null && stageFloodLevel !== null) {
				if (data.location_id === "Nav TW-Kaskaskia") {
					flood_level = stageFloodLevel;
				} else if (data.display_stage_29 === true) {
					flood_level = stage29FloodLevel;
				} else {
					flood_level = stageFloodLevel;
				}
			} else {
				flood_level = 909;
			}
			// console.log("flood_level = ", flood_level);

			let lwrpLevel = null;
			if (data.lwrp) {
				lwrpLevel = data.lwrp['constant-value'];
			} else {
				lwrpLevel = 909;
			}
			// console.log("lwrpLevel = ", lwrpLevel);

			let bankfullLevel = null;
			if (data.bankfull) {
				bankfullLevel = data.bankfull['constant-value'];
			} else {
				bankfullLevel = 909;
			}
			// console.log("bankfullLevel = ", bankfullLevel);


			//==============================================================================================================================================
			// RIVER
			//==============================================================================================================================================
			if (display_type !== "Lake") {
				// Create a new row for each gage data entry
				const row = table.insertRow();

				// RIVER MILE
				(() => {
					// Create a new table cell for river mile
					const riverMileCell = row.insertCell(0);
					riverMileCell.colSpan = 1; // Set the colspan to 1 for River Mile
					riverMileCell.classList.add("Font_15");
					riverMileCell.style.width = "6%";

					// Initialize riverMileCellInnerHTML as an empty string
					let riverMileCellInnerHTML = "--";

					// Update the inner HTML of the cell with data, preserving HTML
					riverMileCellInnerHTML = "<span>" +
						(data['river-mile'] && Array.isArray(data['river-mile']) && data['river-mile'][0] && data['river-mile'][0]['published-station']
							? data['river-mile'][0]['published-station']
							: "--")
						+ "</span>";
					riverMileCell.innerHTML = riverMileCellInnerHTML;
				})();

				// LOCATION
				(() => {
					// Create a new table cell for public name
					const publicNameCell = row.insertCell(1);
					publicNameCell.colSpan = 1; // Set the colspan to 1 for Public Name
					publicNameCell.classList.add("Font_18");
					publicNameCell.style.width = "16%";

					// Initialize publicNameCellInnerHTML as an empty string
					let publicNameCellInnerHTML = "--";

					// Update the inner HTML of the cell with data, preserving HTML
					publicNameCellInnerHTML = "<span title='" + data[`location-id`] + "'>" + data[`metadata`][`public-name`] + "</span>";
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

					let tsidStage = null;
					if (data[`location_id`] === "Alton-Mississippi") {
						tsidStage = data[`tsid-stage`][`assigned-time-series`][0][`timeseries-id`];
					} else if (data[`location_id`] === "Nav TW-Kaskaskia") {
						tsidStage = data[`tsid-stage`][`assigned-time-series`][0][`timeseries-id`];
					} else {
						tsidStage = data[`tsid-stage`][`assigned-time-series`][0][`timeseries-id`];
					}
					// console.log("tsidStage = ", tsidStage);

					if (tsidStage !== null) {
						// Fetch the time series data from the API using the determined query string
						let urlStage = null;
						if (cda === "public") {
							urlStage = setBaseUrl + `timeseries?name=${tsidStage}&begin=${currentDateTimeMinus30Hours.toISOString()}&end=${currentDateTime.toISOString()}&office=MVS`;
						} else if (cda === "internal") {
							urlStage = setBaseUrl + `timeseries?name=${tsidStage}&begin=${currentDateTimeMinus30Hours.toISOString()}&end=${currentDateTime.toISOString()}&office=MVS`;
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
									// console.log("timestampLast:", timestampLast);
									// console.log("timestampLast:", typeof (timestampLast));
									// console.log("valueLast:", valueLast);
									// console.log("qualityCodeLast:", qualityCodeLast);
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

									// console.log("timestamp24HoursLast:", timestamp24HoursLast);
									// console.log("value24HoursLast:", value24HoursLast);
									// console.log("qualityCode24HoursLast:", qualityCode24HoursLast);
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
					let forecastTimeCellInnerHTML = "--";

					// Get stagerev tsid to check for version equal to 29
					const tsidStage = data.tsid_stage_rev
					// console.log("tsidStage = ", tsidStage);

					// Prepare time to send to CDA
					const { currentDateTimeMidNightISO, currentDateTimePlus4DaysMidNightISO } = generateDateTimeStrings(currentDateTime, currentDateTimePlus4Days);

					// Forecasts exist only at stage rev, no projects
					if (tsidStage !== null) {
						// console.log("tsidStage:", tsidStage);

						let tsid_stage_nws_3_day_forecast = null;
						if (data && data[`tsid-nws-forecast`] && data[`tsid-nws-forecast`][`assigned-time-series`]?.length) {
							tsid_stage_nws_3_day_forecast = data[`tsid-nws-forecast`][`assigned-time-series`][0][`timeseries-id`];
						}

						if (tsid_stage_nws_3_day_forecast !== null) {
							// console.log("The last two characters are not '29'");

							// Fetch the time series data from the API using the determined query string
							let urlNWS = null;
							if (cda === "public") {
								urlNWS = setBaseUrl + `timeseries?name=${tsid_stage_nws_3_day_forecast}&begin=${currentDateTimeMidNightISO}&end=${currentDateTimePlus4DaysMidNightISO}&office=MVS`;
							} else if (cda === "internal") {
								urlNWS = setBaseUrl + `timeseries?name=${tsid_stage_nws_3_day_forecast}&begin=${currentDateTimeMidNightISO}&end=${currentDateTimePlus4DaysMidNightISO}&office=MVS`;
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

										fetchAndLogNwsData(tsid_stage_nws_3_day_forecast, forecastTimeCell);
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
					let crestCellInnerHTML = "";
					let crestDateCellInnerHTML = "";

					// Get tsid
					let tsidCrest = null;
					if (data && data[`tsid-nws-forecast`] && data[`tsid-nws-forecast`][`assigned-time-series`]?.length) {
						tsidCrest = data[`tsid-nws-forecast`][`assigned-time-series`][0][`timeseries-id`];
					}

					// Prepare time to send to CDA
					const { currentDateTimeMidNightISO, currentDateTimePlus4DaysMidNightISO } = generateDateTimeStrings(currentDateTime, currentDateTimePlus14Days);

					if (tsidCrest !== null) {
						// Fetch the time series data from the API using the determined query string
						let urlCrest = null;
						if (cda === "public") {
							urlCrest = setBaseUrl + `timeseries?name=${tsidCrest}&begin=${currentDateTimeMidNightISO}&end=${currentDateTimePlus4DaysMidNightISO}&office=MVS`;
						} else if (cda === "internal") {
							urlCrest = setBaseUrl + `timeseries?name=${tsidCrest}&begin=${currentDateTimeMidNightISO}&end=${currentDateTimePlus4DaysMidNightISO}&office=MVS`;
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

										if (valueLastCrest === null) {
											crestCellInnerHTML = "<span class='missing'>" + "-M-" + "</span>";
										} else if (valueLastCrest === undefined) {
											crestCellInnerHTML = "<span>" + "" + "</span>";
										} else {
											crestCellInnerHTML = "<span style='font-weight: bold; color: darkorange; font-size: 1.5em;' title='" + crest.name + ", Value = " + valueLastCrest + ", Date Time = " + timestampLastCrest + "'>" + valueLastCrest + "</span>";
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

					if (data.tsid_taint !== null || data.tsid_roll !== null) {

						const tsidTaint = data.tsid_taint;
						// console.log("tsidTaint: " + tsidTaint);

						const tsidRoll = data.tsid_roll;
						// console.log("tsidRoll: " + tsidRoll);

						let urlTainter = null;
						if (cda === "public") {
							urlTainter = setBaseUrl + `timeseries?name=${tsidTaint}&begin=${currentDateTimeMinus30Hours.toISOString()}&end=${currentDateTime.toISOString()}&office=MVS`;
						} else if (cda === "internal") {
							urlTainter = setBaseUrl + `timeseries?name=${tsidTaint}&begin=${currentDateTimeMinus30Hours.toISOString()}&end=${currentDateTime.toISOString()}&office=MVS`;
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

								if (tainter !== null && data.tsid_taint !== null) {
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
									secondUrlRoller = `https://cwms-data.usace.army.mil/cwms-data/timeseries?name=${tsidRoll}&begin=${currentDateTimeMinus30Hours.toISOString()}&end=${currentDateTime.toISOString()}&office=MVS`;
								} else if (cda === "internal") {
									secondUrlRoller = `https://coe-mvsuwa04mvs.mvs.usace.army.mil:8243/mvs-data/timeseries?name=${tsidRoll}&begin=${currentDateTimeMinus30Hours.toISOString()}&end=${currentDateTime.toISOString()}&office=MVS`;
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

								if (roller !== null && data.tsid_roll !== null) {
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
						if (data.board_lib_title !== null) {
							lDSettingCellInnerHTML = "<span title='" + data.board_lib_note + "'>" + data.board_lib_title + "<span>";
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

						if (data.lwrp) {
							if (data['location_id'] === "Alton-Mississippi") {
								// Set the combined value to the cell, preserving HTML
								lwrpCellInnerHTML = "<span title='" + "--" + "'>" + (data.lwrp['constant-value'] + 400).toFixed(1) + "</span>";
								// console.log("lwrpCellInnerHTML = ", lwrpCellInnerHTML);
							} else {
								if (data.lwrp['constant-value'] < 900) {
									// Set the combined value to the cell, preserving HTML
									lwrpCellInnerHTML = "<span title='" + "--" + "'>" + data.lwrp['constant-value'].toFixed(1) + "</span>";
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

						if (data.flood["constant-value"] !== null) {

							if (data.flood["constant-value"] > 900) {
								floodStageCellInnerHTML = "<span title='" + "" + "'>" + "" + "</span>";
							} else {
								floodStageCellInnerHTML = "<span title='" + data.flood["location-level-id"] + "'>" + flood_level.toFixed(1) + "</span>";
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

						let tsidStage = null;
						if (data.display_stage_29 === true) {
							tsidStage = data.tsid_stage_29
						} else {
							tsidStage = data.tsid_stage_rev
						}
						// console.log("tsidStage = ", tsidStage);

						if (tsidStage !== null) {
							// Fetch the time series data from the API using the determined query string
							let urlStage = null;
							if (cda === "public") {
								urlStage = `https://cwms-data.usace.army.mil/cwms-data/timeseries?name=${tsidStage}&begin=${currentDateTimeMinus30Hours.toISOString()}&end=${currentDateTime.toISOString()}&office=MVS`;
							} else if (cda === "internal") {
								urlStage = `https://coe-mvsuwa04mvs.mvs.usace.army.mil:8243/mvs-data/timeseries?name=${tsidStage}&begin=${currentDateTimeMinus30Hours.toISOString()}&end=${currentDateTime.toISOString()}&office=MVS`;
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
										// console.log("timestampLast:", timestampLast);
										// console.log("valueLast:", valueLast);
										// console.log("qualityCodeLast:", qualityCodeLast);
									} else {
										// If no non-null valueLast is found, log a message
										console.log("No lastNonNullValue found.");
									}

									// Check for Nav TW-Kaskaskia
									let plusMinusLwrp = null;
									if (data.location_id === "Nav TW-Kaskaskia") {
										if (data.lwrp && data.lwrp['constant-value'] !== undefined) {
											plusMinusLwrp = ((valueLast - 0) - data.lwrp['constant-value']).toFixed(1);
										} else {
											console.warn("Warn: 'constant-value' is missing in data.lwrp");
										}
									} else {
										if (data.lwrp && data.lwrp['constant-value'] !== undefined) {
											plusMinusLwrp = (valueLast - data.lwrp['constant-value']).toFixed(1);
										} else {
											console.warn("Warn: 'constant-value' is missing in data.lwrp");
										}
									}

									// Add "+" for positive and "-" for negative values
									const formattedTotal = plusMinusLwrp >= 0 ? `+${plusMinusLwrp}` : plusMinusLwrp;

									if (data.lwrp !== null && valueLast !== null) {
										if (data.lwrp['constant-value'] < 900) {
											if (valueLast !== null && valueLast !== undefined) {
												plusMinusLWRPCellInnerHTML = `<span title="${valueLast}, ${data.lwrp['constant-value']}">${formattedTotal}</span>`;
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

						if (data.phase1 && data.phase2) {
							const phase1_value = data.phase1["constant-value"];
							const phase2_value = data.phase2["constant-value"];

							// Set the combined value to the cell, preserving HTML
							actionStageCellInnerHTML = "<span title='" + data.phase1["location-level-id"] + " : " + data.phase2["location-level-id"] + "'>" + phase1_value.toFixed(1) + "/" + phase2_value.toFixed(1) + "</span>";
							// console.log("actionStageCellInnerHTML = ", actionStageCellInnerHTML);

							// Set the HTML inside the cell once the fetch is complete
							actionStageCell.innerHTML = actionStageCellInnerHTML;
						} else {
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

					// console.log(data.location_id.split('-')[0], data.metadata["vertical-datum"], data.metadata["elevation"].toFixed(2));

					// TODO: Cairo still use NGVD29, needs to change to NAV88. NAVD88 = 271.08ft
					if (data.display_stage_29 === true || data.location_id === "Alton-Mississippi") {
						// Set the combined value to the cell, preserving HTML
						// gageZeroCellInnerHTML = "<span title='" + "vertical_datum: " + "NGVD29" + "'>" + (data.metadata["elevation"] - data.ngvd29["constant-value"]).toFixed(2) + "</span>";
						gageZeroCellInnerHTML = "<span title='" + "vertical_datum: " + "NAVD88" + "'>" + (data.metadata["elevation"] - (data.ngvd29["constant-value"])).toFixed(2) + "</span>";
						// console.log("gageZeroCellInnerHTML = ", gageZeroCellInnerHTML);
					} else {
						if (data.metadata["vertical-datum"] === "NAVD88") {
							// Set the combined value to the cell, preserving HTML
							gageZeroCellInnerHTML = "<span title='" + "vertical_datum: " + data.metadata["vertical-datum"] + "'>" + data.metadata["elevation"].toFixed(2) + "</span>";
							// console.log("gageZeroCellInnerHTML = ", gageZeroCellInnerHTML);
						} else if (data.metadata["vertical-datum"] === "NGVD29") {
							// Set the combined value to the cell, preserving HTML
							gageZeroCellInnerHTML = "<span style='color: darkorange;' title='" + "vertical_datum: " + data.metadata["vertical-datum"] + "'>" + data.metadata["elevation"].toFixed(2) + "</span>";
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

			} else {
				// NO VISIABLE GAGE
			}

			//==============================================================================================================================================
			// LAKE
			//==============================================================================================================================================
			if (display_type === 'Lake') {
				// =====================
				// ======= ROW 1 ======= (STAGE, UTIL, INFLOW, OUTFLOW & RULE CURVE)
				// =====================
				if (1 === 1) {
					// Create a new row for each lake data entry
					const row = table.insertRow();

					// LAKE
					(() => {
						// Create a new table cell for lake name
						const lakeCell = row.insertCell(0);
						lakeCell.colSpan = 1;
						lakeCell.classList.add('Font_20');
						lakeCell.style.width = '15%';

						// Initialize lakeCellInnerHTML as an empty string
						let lakeCellInnerHTML = '--';

						// Update the inner HTML of the cell with data, preserving HTML
						lakeCellInnerHTML = "<span>" + data.location_id.split('-')[0] + "</span>";
						// console.log('lakeCellInnerHTML =', lakeCellInnerHTML);
						lakeCell.innerHTML = lakeCellInnerHTML;
					})();

					// CURRENT POOL AND 24HR CHANGE
					(() => {
						// Create a new table cell for lake name
						const stageCell = row.insertCell(1);
						stageCell.colSpan = 1;
						stageCell.classList.add('Font_20');
						stageCell.style.width = '12%';

						// Create a new table cell for lake name
						const stageDeltaCell = row.insertCell(2);
						stageDeltaCell.colSpan = 1;
						stageDeltaCell.classList.add('Font_20');
						stageDeltaCell.style.width = '10%';

						// Initialize lakeCellInnerHTML as an empty string
						let stageCellInnerHTML = '--';

						// Initialize lakeCellInnerHTML as an empty string
						let stageDeltaCellInnerHTML = '--';

						let tsid = null;
						if (data.display_stage_29 === true) {
							tsid = data.tsid_stage_29
						} else {
							tsid = data.tsid_stage_rev
						}

						if (tsid !== null) {
							// Fetch the time series data from the API using the determined query string
							let url = null;
							if (cda === "public") {
								url = `https://cwms-data.usace.army.mil/cwms-data/timeseries?name=${tsid}&begin=${currentDateTimeMinus30Hours.toISOString()}&end=${currentDateTime.toISOString()}&office=MVS`;
							} else if (cda === "internal") {
								url = `https://coe-mvsuwa04mvs.mvs.usace.army.mil:8243/mvs-data/timeseries?name=${tsid}&begin=${currentDateTimeMinus30Hours.toISOString()}&end=${currentDateTime.toISOString()}&office=MVS`;
							} else {

							}
							// console.log("url = ", url);
							fetch(url, {
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
								.then(data => {
									// console.log("data:", data);

									// Convert timestamps in the JSON object
									data.values.forEach(entry => {
										entry[0] = formatNWSDate(entry[0]); // Update timestamp
									});

									// console.log("data formatted = ", data);

									// Get the last non-null value from the data data
									const lastNonNullValue = getLastNonNullValue(data);
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

									const c_count = calculateCCount(tsid);
									// console.log("c_count:", c_count);

									const lastNonNull24HoursValue = getLastNonNull24HoursValue(data, c_count);
									// console.log("lastNonNull24HoursValue:", lastNonNull24HoursValue);

									// Check if a non-null value was found
									if (lastNonNull24HoursValue !== null) {
										// Extract timestamp, value, and quality code from the last non-null value
										var timestamp24HoursLast = lastNonNull24HoursValue.timestamp;
										var value24HoursLast = lastNonNull24HoursValue.value;
										var qualityCode24HoursLast = lastNonNull24HoursValue.qualityCode;

										// console.log("timestamp24HoursLast:", timestamp24HoursLast);
										// console.log("value24HoursLast:", value24HoursLast);
										// console.log("qualityCode24HoursLast:", qualityCode24HoursLast);
									} else {
										// If no non-null valueLast is found, log a message
										console.log("No non-null valueLast found.");
									}

									// Calculate the 24 hours change between first and last value
									const delta_24 = valueLast - value24HoursLast;
									// console.log("delta_24:", delta_24);
									// console.log("delta_24:", typeof (delta_24));

									// FLOOD CLASS
									var floodClass = determineStageClass(valueLast, flood_level, timestampLast);
									// console.log("floodClass:", floodClass);

									if (valueLast) {
										stageCellInnerHTML = "<span class='" + floodClass + "' title='" + data.name + ", Value = " + valueLast + ", Date Time = " + timestampLast + "'>"
											+ valueLast.toFixed(1)
											+ "</span>";

										if (!isNaN(delta_24)) {
											if (parseFloat(delta_24) > 5 || parseFloat(delta_24) < -5) {
												stageDeltaCellInnerHTML = "<span class='missing'>" + delta_24.toFixed(2) + "</span>"
											} else {
												stageDeltaCellInnerHTML = "<span class='last_max_value' title='" + data.name + ", Value = " + value24HoursLast + ", Date Time = " + timestamp24HoursLast + ", Delta = (" + valueLast + " - " + value24HoursLast + ") = " + delta_24 + "'>"
													+ delta_24.toFixed(2)
													+ "</span>";
											}
										} else {
											stageDeltaCellInnerHTML = "<img src='images/loading5.gif' style='width: 30px; height: 30px;'>";
										}
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

					// STORAGE UTILIZED
					(() => {
						// Create a new table cell for lake name
						const storageCell = row.insertCell(3);
						storageCell.colSpan = 1;
						storageCell.classList.add('Font_20');
						storageCell.style.width = '17%';

						// Initialize lakeCellInnerHTML as an empty string
						let storageCellInnerHTML = '--';

						let tsid = null;
						if (data.display_stage_29 === true) {
							tsid = data.tsid_storage
						} else {
							tsid = data.tsid_storage
						}

						if (tsid !== null) {
							// Fetch the time series data from the API using the determined query string
							let url = null;
							if (cda === "public") {
								url = `https://cwms-data.usace.army.mil/cwms-data/timeseries?name=${tsid}&begin=${currentDateTimeMinus30Hours.toISOString()}&end=${currentDateTime.toISOString()}&office=MVS`;
							} else if (cda === "internal") {
								url = `https://coe-mvsuwa04mvs.mvs.usace.army.mil:8243/mvs-data/timeseries?name=${tsid}&begin=${currentDateTimeMinus30Hours.toISOString()}&end=${currentDateTime.toISOString()}&office=MVS`;
							} else {

							}
							// console.log("url = ", url);
							fetch(url, {
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
								.then(util => {
									// console.log("util:", util);

									// Convert timestamps in the JSON object
									util.values.forEach(entry => {
										entry[0] = formatNWSDate(entry[0]); // Update timestamp
									});

									// console.log("util formatted = ", util);

									// Get the last non-null value from the stage data
									const lastNonNullValue = getLastNonNullValue(util);
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

									if (valueLast !== null || valueLast !== undefined) {
										// CONSERVATION
										if (valueLast > 0.0 && data.toc['constant-value'] > 0.0 && data.boc['constant-value'] >= 0.0) {
											if (valueLast < data.boc['constant-value']) {
												storageCellInnerHTML = "<span style='float: left; padding-left: 15px;' title='Lake Storage < Bottom of Conservation'>" + "0.0%" + "</span>";
											} else if (valueLast > data.toc['constant-value']) {
												storageCellInnerHTML = "<span style='float: left; padding-left: 15px;' title='" + "Lake Storage > Top of Conservation: " + valueLast + " > " + data.toc['constant-value'] + "'>" + "100.0%" + "</span>";
											} else {
												const total = (valueLast - data.boc['constant-value']) / (data.toc['constant-value'] - data.boc['constant-value']) * 100;
												storageCellInnerHTML = "<span style='float: left; padding-left: 15px;' title='" + "(" + valueLast + "(Lake Storage)" + " - " + data.boc['constant-value'] + "(Bottom of Conservation)" + ")/(" + data.toc['constant-value'] + "(Top of Conservation)" + "-" + data.boc['constant-value'] + "(Bottom of Conservation)" + ")*100" + " = " + total + "%" + "'>" + total.toFixed(1) + "%" + "</span>";
											}
										} else {
											storageCellInnerHTML = " ";
										}

										// FLOOD
										if (valueLast > 0.0 && data.tof['constant-value'] > 0.0 && data.bof['constant-value'] >= 0.0) {
											if (valueLast < data.bof['constant-value']) {
												storageCellInnerHTML += "<span style='float: right; padding-right: 15px;' title='Lake Storage < Bottom of Flood'>" + "0.0%" + "</span>";
											} else if (valueLast > data.tof['constant-value']) {
												storageCellInnerHTML += "<span style='float: right; padding-right: 15px;' title='" + "Lake Storage > Top of Flood: " + valueLast + " > " + lake_storage.tof + "'>" + "100.0%" + "</span>";
											} else {
												const total = (valueLast - data.bof['constant-value']) / (data.tof['constant-value'] - data.bof['constant-value']) * 100;
												storageCellInnerHTML += "<span style='float: right; padding-right: 15px;' title='" + "(" + valueLast + "(Lake Storage)" + " - " + data.bof['constant-value'] + "(Bottom of Flood)" + ")/(" + data.tof['constant-value'] + "(Top of Flood)" + "-" + data.bof['constant-value'] + "(Bottom of Flood)" + ")*100" + " = " + total + "%" + "'>" + total.toFixed(1) + "%" + "</span>";
											}
										} else {
											storageCellInnerHTML += " ";
										}
									} else {
										storageCellInnerHTML = "<span class='missing'>" + "-M-" + "</span>"
									}
									storageCell.innerHTML = storageCellInnerHTML;
								})
								.catch(error => {
									// Catch and log any errors that occur during fetching or processing
									console.error("Error fetching or processing data:", error);
								});
						}
					})();

					// PRECIP
					(() => {
						// Create a new table cell for lake name
						const precipCell = row.insertCell(4);
						precipCell.colSpan = 1;
						precipCell.classList.add('Font_20');
						precipCell.style.width = '9%';

						// Initialize lakeCellInnerHTML as an empty string
						let precipCellInnerHTML = '--';

						let tsidPrecip = null;
						if (data.display_stage_29 === true) {
							tsidPrecip = data.tsid_precip_lake
						} else {
							tsidPrecip = data.tsid_precip_lake
						}

						if (tsidPrecip !== null) {
							// Fetch the time series data from the API using the determined query string
							let urlPrecip = null;
							if (cda === "public") {
								urlPrecip = `https://cwms-data.usace.army.mil/cwms-data/timeseries?name=${tsidPrecip}&begin=${currentDateTimeMinus30Hours.toISOString()}&end=${currentDateTime.toISOString()}&office=MVS`;
							} else if (cda === "internal") {
								urlPrecip = `https://coe-mvsuwa04mvs.mvs.usace.army.mil:8243/mvs-data/timeseries?name=${tsidPrecip}&begin=${currentDateTimeMinus30Hours.toISOString()}&end=${currentDateTime.toISOString()}&office=MVS`;
							} else {

							}
							// console.log("urlPrecip = ", urlPrecip);
							fetch(urlPrecip, {
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
								.then(precip => {
									// console.log("precip:", precip);

									// Convert timestamps in the JSON object
									precip.values.forEach(entry => {
										entry[0] = formatNWSDate(entry[0]); // Update timestamp
									});

									// console.log("precip formatted = ", precip);

									// Get the last non-null value from the stage data
									const lastNonNullValue = getLastNonNullValue(precip);
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

									if (valueLast !== null || valueLast !== undefined) {
										precipCellInnerHTML = "<span>"
											+ valueLast.toFixed(2)
											+ "</span>";
									} else {
										precipCellInnerHTML = "<span class='missing'>" + "-M-" + "</span>"
									}
									precipCell.innerHTML = precipCellInnerHTML;
								})
								.catch(error => {
									// Catch and log any errors that occur during fetching or processing
									console.error("Error fetching or processing data:", error);
								});
						}
					})();

					// YESTERDAY INFLOW
					(() => {
						// Create a new table cell for lake name
						const inflowCell = row.insertCell(5);
						inflowCell.colSpan = 1;
						inflowCell.classList.add('Font_20');
						inflowCell.style.width = '9%';

						// Initialize lakeCellInnerHTML as an empty string
						let inflowCellInnerHTML = '--';

						let tsid = null;
						if (data.display_stage_29 === true) {
							tsid = data.tsid_yesterday_inflow
						} else {
							tsid = data.tsid_yesterday_inflow
						}

						if (tsid !== null) {
							// Fetch the time series data from the API using the determined query string
							let url = null;
							if (cda === "public") {
								url = `https://cwms-data.usace.army.mil/cwms-data/timeseries?name=${tsid}&begin=${currentDateTimeMinus30Hours.toISOString()}&end=${currentDateTime.toISOString()}&office=MVS`;
							} else if (cda === "internal") {
								url = `https://coe-mvsuwa04mvs.mvs.usace.army.mil:8243/mvs-data/timeseries?name=${tsid}&begin=${currentDateTimeMinus30Hours.toISOString()}&end=${currentDateTime.toISOString()}&office=MVS`;
							} else {

							}
							// console.log("url = ", url);
							fetch(url, {
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
								.then(data => {
									// console.log("data:", data);

									// Convert timestamps in the JSON object
									data.values.forEach(entry => {
										entry[0] = formatNWSDate(entry[0]); // Update timestamp
									});

									// console.log("data formatted = ", data);

									// Get the last non-null value from the stage data
									const lastNonNullValue = getLastNonNullValue(data);
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

									if (valueLast) {
										inflowCellInnerHTML = "<span title='" + tsid + " - " + valueLast + " - " + timestampLast + "'>"
											+ valueLast.toFixed(0)
											+ "</span>";
									} else {
										inflowCellInnerHTML = "<span class='missing'>" + "-M-" + "</span>"
									}
									inflowCell.innerHTML = inflowCellInnerHTML;
								})
								.catch(error => {
									// Catch and log any errors that occur during fetching or processing
									console.error("Error fetching or processing data:", error);
								});
						}
					})();

					// ======= CONTROLLED OUTFLOW =======
					if ("outflow" === "outflow") {
						// Create a new table cell for lake name
						const outflowCell = row.insertCell(6);
						outflowCell.colSpan = 1;
						outflowCell.classList.add('Font_20');
						outflowCell.style.width = '17%';

						// Initialize lakeCellInnerHTML as an empty string
						let outflowCellInnerHTML = '--';

						try {
							const ROutput = await fetchDataFromROutput();
							// console.log('ROutput:', ROutput);

							const filteredData = filterDataByLocationId(ROutput, data.location_id);
							// console.log("Filtered Data for", data.location_id + ":", filteredData);

							// Update the HTML element with filtered data
							updateOutflowHTML(filteredData, outflowCell, bankfullLevel);

							// Further processing of ROutput data as needed
						} catch (error) {
							// Handle errors from fetchDataFromROutput
							console.error('Failed to fetch data:', error);
						}
					}

					// ======= SEASONAL RULE CURVE =======
					if ("rule" === "rule") {
						// Create a new table cell for lake name
						const ruleCurveCell = row.insertCell(7);
						ruleCurveCell.colSpan = 1;
						ruleCurveCell.classList.add('Font_20');
						ruleCurveCell.style.width = '11%';

						// Initialize lakeCellInnerHTML as an empty string
						let ruleCurveCellInnerHTML = '--';

						try {
							const ROutput = await fetchDataFromROutput();
							// console.log('ROutput:', ROutput);

							const filteredData = filterDataByLocationId(ROutput, data.location_id);
							// console.log("Filtered Data for", data.location_id + ":", filteredData);

							// // Update the HTML element with filtered data
							updateRuleCurveHTML(filteredData, ruleCurveCell);

							// Further processing of ROutput data as needed
						} catch (error) {
							// Handle errors from fetchDataFromROutput
							console.error('Failed to fetch data:', error);
						}
					}
				}

				// =====================
				// ======= ROW 2 ======= (CREST, TW DO AND GAGED OUTFLOW, RULECURVE)
				// =====================
				if (2 === 2) {
					// Create and add the second new row
					const row2 = table.insertRow();

					// ======= BLANK =======
					if ("blank" === "blank") {
						// Create a new table cell for lake name in the second row
						const blankCell = row2.insertCell(0);
						blankCell.colSpan = 1;
						blankCell.classList.add('Font_15');
						blankCell.style.width = '15%';

						// Initialize lakeCellInnerHTML as an empty string for the second row
						let blankCellInnerHTML = '--';

						// Update the inner HTML of the cell with data for the second row, preserving HTML
						blankCellInnerHTML = " "; // Replace with the actual data for the second lake
						// console.log('blankCellInnerHTML =', blankCellInnerHTML);
						blankCell.innerHTML = blankCellInnerHTML;
					}

					// ======= CREST =======
					if ("crest" === "crest") {
						// Create a new table cell for lake name
						const crestCell = row2.insertCell(1);
						crestCell.colSpan = 2;
						crestCell.classList.add('Font_15');
						crestCell.style.width = '10%';
						crestCell.style.backgroundColor = '#404040';
						crestCell.style.color = 'lightgray';
						crestCell.style.textAlign = 'left'; // Add this line to align content to the left
						crestCell.style.paddingLeft = '10px'; // Add this line to set left padding

						// Initialize lakeCellInnerHTML as an empty string
						let crestCellInnerHTML = 'Crest:';

						try {
							const ROutput = await fetchDataFromROutput();
							// console.log('ROutput:', ROutput);

							const filteredData = filterDataByLocationId(ROutput, data.location_id);
							// console.log("Filtered Data for", data.location_id + ":", filteredData);

							// // Update the HTML element with filtered data
							updateCrestHTML2(filteredData, crestCell);

							// Further processing of ROutput data as needed
						} catch (error) {
							// Handle errors from fetchDataFromROutput
							console.error('Failed to fetch data:', error);
						}

						// // Create an object to hold all the properties you want to pass
						// const crestToSend = {
						// 	location_id: encodeURIComponent(data.location_id),
						// };
						// // console.log("crestToSend: " + crestToSend);

						// // Convert the object into a query string
						// const crestQueryString = Object.keys(crestToSend).map(key => key + '=' + crestToSend[key]).join('&');
						// // console.log("crestQueryString: " + crestQueryString);

						// // Make an AJAX request to the PHP script, passing all the variables
						// var urlCrest = `https://coe-mvsuwa04mvs.mvs.usace.army.mil/php_data_api/public/get_lake_crest_forecast.php?${crestQueryString}`;
						// // console.log("urlCrest: ", + urlCrest);
						// fetch(urlCrest)
						// 	.then(response => response.json())
						// 	.then(crest_forecast => {
						// 		// Log the stage to the console
						// 		// console.log("crest_forecast: ", crest_forecast);

						// 		let crestData = '';

						// 		if (crest_forecast) {
						// 			if (crest_forecast.opt === "CG") {
						// 				crestData = "Cresting";
						// 			} else if (crest_forecast.opt === "CD") {
						// 				crestData = "Crested";
						// 			} else if (crest_forecast.opt === "<") {
						// 				let crst_date = crest_forecast.crst_dt;
						// 				// console.log("crst_date: ", crst_date);
						// 				// console.log("crst_date: ", typeof crst_date);
						// 				// Parse the date string
						// 				let parsedDate = moment(crst_date, "DD-MM-YYYY HH:mm");
						// 				// console.log("parsedDate: ", parsedDate);

						// 				// Format the date
						// 				let formattedCrestDate = parsedDate.format("DD/MM A");

						// 				// console.log("formattedCrestDate: ", formattedCrestDate);
						// 				crestData = "< " + crest_forecast.crest + " ft " + crst_date.replace(" 00:00", "");
						// 			} else if (crest_forecast.crest !== null) {
						// 				let crst_date = crest_forecast.crst_dt;
						// 				// console.log("crst_date: ", crst_date);
						// 				// console.log("crst_date: ", typeof crst_date);
						// 				// Parse the date string
						// 				let parsedDate = moment(crst_date, "DD-MM-YYYY HH:mm");

						// 				// Format the date
						// 				let formattedCrestDate = parsedDate.format("DD/MM A");

						// 				// console.log("formattedCrestDate: ", formattedCrestDate);
						// 				crestData = "= " + crest_forecast.crest + " ft " + crst_date.replace(" 00:00", "");
						// 			}

						// 			crestCellInnerHTML = "<span style='float: left; padding-left: 15px;'> Crest Forecast:</span>";
						// 			crestCellInnerHTML += "<span style='float: left; padding-left: 15px; color: lightblue;'>" + crestData + "</span>";

						// 			// Set the combined value to the cell, preserving HTML
						// 			// console.log("crestCellInnerHTML = ", crestCellInnerHTML);

						// 			// Set the HTML inside the cell once the fetch is complete
						// 			crestCell.innerHTML = crestCellInnerHTML;
						// 		} else {
						// 			crestCellInnerHTML = "<span style='float: left; padding-left: 15px;'>" + "</span>";

						// 			// Set the combined value to the cell, preserving HTML
						// 			// console.log("crestCellInnerHTML = ", crestCellInnerHTML);

						// 			// Set the HTML inside the cell once the fetch is complete
						// 			crestCell.innerHTML = crestCellInnerHTML;
						// 		}
						// 	})
						// 	.catch(error => {
						// 		console.error('Error:', error);
						// 	});
					}

					// ======= BLANK =======
					if ("blank" === "blank") {
						// Create a new table cell for lake name
						const blankblankCell = row2.insertCell(2);
						blankblankCell.colSpan = 1;
						blankblankCell.classList.add('Font_15');
						blankblankCell.style.width = '10%';
						blankblankCell.style.backgroundColor = '#404040';
						blankblankCell.style.color = 'lightgray';

						// Initialize twDoCellInnerHTML as an empty string
						let blankblankCellInnerHTML = '--';

						blankblankCellInnerHTML = "<span style='float: left; padding-left: 15px;'>" + " " + "</span>";
						blankblankCellInnerHTML += "<span style='float: left; padding-left: 15px; color: lightblue;'>" + " " + "</span>";

						// Set the combined value to the cell, preserving HTML
						// console.log("blankblankCellInnerHTML = ", blankblankCellInnerHTML);

						// Set the HTML inside the cell once the fetch is complete
						blankblankCell.innerHTML = blankblankCellInnerHTML;
					}

					// ======= TW DO =======
					if ("twdo" === "twdo") {
						// console.log("data.location_id: " + data.location_id);
						// Create a new table cell for lake name
						const twDoCell = row2.insertCell(3);
						twDoCell.colSpan = 2;
						twDoCell.classList.add('Font_15');
						twDoCell.style.width = '10%';
						twDoCell.style.backgroundColor = '#404040';
						twDoCell.style.color = 'lightgray';

						// Initialize twDoCellInnerHTML as an empty string
						let twDoCellInnerHTML = '';

						let tsid = null;
						if (data.display_stage_29 === true) {
							tsid = data.tsid_tw_do_board
						} else {
							tsid = data.tsid_tw_do_board
						}

						if (tsid !== null) {
							// Fetch the time series data from the API using the determined query string
							let url = null;
							if (cda === "public") {
								url = `https://cwms-data.usace.army.mil/cwms-data/timeseries?name=${tsid}&begin=${currentDateTimeMinus30Hours.toISOString()}&end=${currentDateTime.toISOString()}&office=MVS`;
							} else if (cda === "internal") {
								url = `https://coe-mvsuwa04mvs.mvs.usace.army.mil:8243/mvs-data/timeseries?name=${tsid}&begin=${currentDateTimeMinus30Hours.toISOString()}&end=${currentDateTime.toISOString()}&office=MVS`;
							} else {

							}
							// console.log("url = ", url);
							fetch(url, {
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
								.then(data => {
									// console.log("data:", data);

									// Convert timestamps in the JSON object
									data.values.forEach(entry => {
										entry[0] = formatNWSDate(entry[0]); // Update timestamp
									});

									// console.log("data formatted = ", data);

									// Get the last non-null value from the stage data
									const lastNonNullValue = getLastNonNullValue(data);
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

									const c_count = calculateCCount(tsid);
									// console.log("c_count:", c_count);

									const lastNonNull24HoursValue = getLastNonNull24HoursValue(data, c_count);
									// console.log("lastNonNull24HoursValue:", lastNonNull24HoursValue);

									// Check if a non-null value was found
									if (lastNonNull24HoursValue !== null) {
										// Extract timestamp, value, and quality code from the last non-null value
										var timestamp24HoursLast = lastNonNull24HoursValue.timestamp;
										var value24HoursLast = lastNonNull24HoursValue.value;
										var qualityCode24HoursLast = lastNonNull24HoursValue.qualityCode;

										// console.log("timestamp24HoursLast:", timestamp24HoursLast);
										// console.log("value24HoursLast:", value24HoursLast);
										// console.log("qualityCode24HoursLast:", qualityCode24HoursLast);
									} else {
										// If no non-null valueLast is found, log a message
										console.log("No non-null valueLast found.");
									}

									// Calculate the 24 hours change between first and last value
									const delta_24 = valueLast - value24HoursLast;
									// console.log("delta_24:", delta_24);

									if (valueLast !== null && valueLast !== undefined) {
										twDoCellInnerHTML = "<span>"
											+ "TW DO: " + valueLast.toFixed(2) + " (" + delta_24.toFixed(2) + ")" + " mg/L"
											+ "</span>";
									} else {
										if ([10, 11, 12, 1, 2, 3].includes(currentMonth)) {
											twDoCellInnerHTML = "TW DO: " + "<img src='images/loading7.gif' style='width: 20px; height: 20px;'>";
										} else {
											twDoCellInnerHTML = "TW DO: " + "<span class='missing'>" + "-M-" + "</span>"
										}
									}
									twDoCell.innerHTML = twDoCellInnerHTML;
								})
								.catch(error => {
									// Catch and log any errors that occur during fetching or processing
									console.error("Error fetching or processing data:", error);
								});
						}
					}

					// ======= GAGED OUTFLOW =======
					if ("gagedoutflow" === "gagedoutflow") {
						// Create a new table cell for lake name
						const gagedOutflowCell = row2.insertCell(4);
						gagedOutflowCell.colSpan = 1;
						gagedOutflowCell.classList.add('Font_15');
						gagedOutflowCell.style.width = '10%';
						gagedOutflowCell.style.backgroundColor = '#404040';
						gagedOutflowCell.style.color = 'lightgray';

						// Initialize gagedOutflowCellInnerHTML as an empty string
						let gagedOutflowCellInnerHTML = '--';

						let tsid = null;
						if (data.display_stage_29 === true) {
							tsid = data.tsid_gaged_outflow_board
						} else {
							tsid = data.tsid_gaged_outflow_board
						}

						if (tsid !== null) {
							// Fetch the time series data from the API using the determined query string
							let url = null;
							if (cda === "public") {
								url = `https://cwms-data.usace.army.mil/cwms-data/timeseries?name=${tsid}&begin=${currentDateTimeMinus30Hours.toISOString()}&end=${currentDateTime.toISOString()}&office=MVS`;
							} else if (cda === "internal") {
								url = `https://coe-mvsuwa04mvs.mvs.usace.army.mil:8243/mvs-data/timeseries?name=${tsid}&begin=${currentDateTimeMinus30Hours.toISOString()}&end=${currentDateTime.toISOString()}&office=MVS`;
							} else {

							}
							// console.log("url = ", url);
							fetch(url, {
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
								.then(data => {
									// console.log("data:", data);

									// Convert timestamps in the JSON object
									data.values.forEach(entry => {
										entry[0] = formatNWSDate(entry[0]); // Update timestamp
									});

									// console.log("data formatted = ", data);

									// Get the last non-null value from the stage data
									const lastNonNullValue = getLastNonNullValue(data);
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

									const c_count = calculateCCount(tsid);
									// console.log("c_count:", c_count);

									const lastNonNull24HoursValue = getLastNonNull24HoursValue(data, c_count);
									// console.log("lastNonNull24HoursValue:", lastNonNull24HoursValue);

									// Check if a non-null value was found
									if (lastNonNull24HoursValue !== null) {
										// Extract timestamp, value, and quality code from the last non-null value
										var timestamp24HoursLast = lastNonNull24HoursValue.timestamp;
										var value24HoursLast = lastNonNull24HoursValue.value;
										var qualityCode24HoursLast = lastNonNull24HoursValue.qualityCode;

										// console.log("timestamp24HoursLast:", timestamp24HoursLast);
										// console.log("value24HoursLast:", value24HoursLast);
										// console.log("qualityCode24HoursLast:", qualityCode24HoursLast);
									} else {
										// If no non-null valueLast is found, log a message
										console.log("No non-null valueLast found.");
									}

									// Calculate the 24 hours change between first and last value
									const delta_24 = valueLast - value24HoursLast;
									// console.log("delta_24:", delta_24);

									if (valueLast !== null || valueLast !== undefined) {
										gagedOutflowCellInnerHTML = "<span>"
											+ "Gaged Outflow: " + valueLast.toFixed(0) + " (" + delta_24.toFixed(0) + ")"
											+ "</span>";
									} else {
										gagedOutflowCellInnerHTML = "<span class='missing'>" + "-M-" + "</span>"
									}
									gagedOutflowCell.innerHTML = gagedOutflowCellInnerHTML;
								})
								.catch(error => {
									// Catch and log any errors that occur during fetching or processing
									console.error("Error fetching or processing data:", error);
								});
						}

						// // Create an object to hold all the properties you want to pass
						// const gagedOutflowToSend = {
						// 	cwms_ts_id: encodeURIComponent(data.tsid_gaged_outflow_board),
						// };
						// // console.log("gagedOutflowToSend: " + gagedOutflowToSend);

						// const gagedOutflowLocationToSend = {
						// 	location_id: encodeURIComponent(data.location_id),
						// };
						// // console.log("gagedOutflowLocationToSend: " + gagedOutflowLocationToSend);

						// // Convert the object into a query string
						// const gagedOutflowQueryString = Object.keys(gagedOutflowToSend).map(key => key + '=' + gagedOutflowToSend[key]).join('&');
						// // console.log("gagedOutflowQueryString: " + gagedOutflowQueryString);

						// const lowerUpperFlowLimitQueryString = Object.keys(gagedOutflowToSend).map(key => key + '=' + gagedOutflowToSend[key]).join('&');
						// // console.log("lowerUpperFlowLimitQueryString: " + lowerUpperFlowLimitQueryString);

						// const bankfullFlowLimitQueryString = Object.keys(gagedOutflowLocationToSend).map(key => key + '=' + gagedOutflowLocationToSend[key]).join('&');
						// // console.log("bankfullFlowLimitQueryString: " + bankfullFlowLimitQueryString);

						// // Make an AJAX request to the PHP script, passing all the variables
						// var urlGagedOutFlow = `https://coe-mvsuwa04mvs.mvs.usace.army.mil/php_data_api/public/get_level.php?${gagedOutflowQueryString}`;
						// // console.log("urlGagedOutFlow: " , urlGagedOutFlow);

						// var urlLowerUpperFlowLimit = `https://coe-mvsuwa04mvs.mvs.usace.army.mil/php_data_api/public/get_lower_upper_flow_limit_by_tsid.php?${lowerUpperFlowLimitQueryString}`;
						// // console.log("urlLowerUpperFlowLimit: " , urlLowerUpperFlowLimit);

						// var urlBankfullFlowLimit = `https://coe-mvsuwa04mvs.mvs.usace.army.mil/php_data_api/public/get_bankfull_by_location_id.php?${bankfullFlowLimitQueryString}`;
						// // console.log("urlBankfullFlowLimit: " , urlBankfullFlowLimit);

						// async function fetchGagedOutflow() {
						// 	try {
						// 		const response = await fetch(urlGagedOutFlow);
						// 		const gaged_outflow = await response.json();
						// 		return gaged_outflow;
						// 	} catch (error) {
						// 		console.error("Error fetching data:", error);
						// 		throw error; // Propagate the error to the caller
						// 	}
						// }

						// async function fetchLowerUpperFlowLimit() {
						// 	try {
						// 		const response = await fetch(urlLowerUpperFlowLimit);
						// 		const lower_upper_flow_limit = await response.json();
						// 		return lower_upper_flow_limit;
						// 	} catch (error) {
						// 		console.error("Error fetching data:", error);
						// 		throw error; // Propagate the error to the caller
						// 	}
						// }

						// async function fetchBankfullFlowLimit() {
						// 	try {
						// 		const response = await fetch(urlBankfullFlowLimit);
						// 		const bankfull_flow_limit = await response.json();
						// 		return bankfull_flow_limit;
						// 	} catch (error) {
						// 		console.error("Error fetching data:", error);
						// 		throw error; // Propagate the error to the caller
						// 	}
						// }

						// // Call the asynchronous functions
						// Promise.all([fetchGagedOutflow(), fetchLowerUpperFlowLimit(), fetchBankfullFlowLimit()])
						// 	.then(([gaged_outflow, lower_upper_flow_limit, bankfull_flow_limit]) => {
						// 		if (gaged_outflow && lower_upper_flow_limit && bankfull_flow_limit) {

						// 			// console.log("gaged_outflow = ", gaged_outflow);
						// 			// console.log("lower_upper_flow_limit = ", lower_upper_flow_limit);
						// 			// console.log("bankfull_flow_limit = ", bankfull_flow_limit);

						// 			// Extract lower and upper flow limits
						// 			const lowerFlowLimit = parseFloat(lower_upper_flow_limit[0].constant_level);
						// 			const upperFlowLimit = parseFloat(lower_upper_flow_limit[1].constant_level);
						// 			const bankfullFlowLimit = parseFloat(bankfull_flow_limit.constant_level);

						// 			// Extract lower and upper flow limit units
						// 			const lowerFlowLimitUnit = lower_upper_flow_limit[0].level_unit;
						// 			const upperFlowLimitUnit = lower_upper_flow_limit[1].level_unit;
						// 			const bankfullFlowLimitUnit = bankfull_flow_limit.level_unit;

						// 			// Now you can use lowerFlowLimit and upperFlowLimit as needed
						// 			// console.log("lowerFlowLimit: ", lowerFlowLimit);
						// 			// console.log("upperFlowLimit: ", upperFlowLimit);
						// 			// console.log("bankfullFlowLimit: ", bankfullFlowLimit);

						// 			const gaged_outflow_value = parseFloat(gaged_outflow.value);
						// 			// console.log("gaged_outflow_value: ", gaged_outflow_value);

						// 			const gaged_outflow_date_time_cst = gaged_outflow.date_time_cst;
						// 			// console.log("gaged_outflow_date_time_cst = ", gaged_outflow_date_time_cst);
						// 			var dateParts = gaged_outflow_date_time_cst.split(" ");
						// 			var date = dateParts[0];
						// 			var time = dateParts[1];
						// 			var [month, day, year] = date.split("-");
						// 			var [hours, minutes] = time.split(":");
						// 			var gaged_outflow_date_time_cst_formatted = new Date(`${year}-${month}-${day}T${hours}:${minutes}:00`);
						// 			// console.log("gaged_outflow_date_time_cst_formatted", gaged_outflow_date_time_cst_formatted);
						// 			// console.log("gaged_outflow_date_time_cst_formatted: ", typeof gaged_outflow_date_time_cst_formatted);

						// 			// Get the current date as a Date object
						// 			const currentDate = new Date();
						// 			// Subtract 2 hours (2 * 60 * 60 * 1000 milliseconds)
						// 			const currentDateStageMinusTwoHours = new Date(currentDate.getTime() - (2 * 60 * 60 * 1000));
						// 			// Subtract 2 hours (2 * 60 * 60 * 1000 milliseconds)
						// 			const currentDateStageMinusOneDay = new Date(currentDate.getTime() - (24 * 60 * 60 * 1000));

						// 			// console.log("currentDateStage:", currentDate);
						// 			// console.log("currentDateStageMinusTwoHours:", currentDateStageMinusTwoHours);
						// 			// console.log("currentDateStageMinusOneDay:", currentDateStageMinusOneDay);

						// 			// Lower Upper Limit Class
						// 			if (gaged_outflow_value > bankfullFlowLimit) {
						// 				// console.log("Bankfull Flow Above Limit");
						// 				var myFlowLimitClass = "Bankfull_Limit";
						// 			} else {
						// 				// console.log("Bankfull Flow Within Limit");
						// 				var myFlowLimitClass = "--";
						// 			}

						// 			// CHECK DATA LATE
						// 			if (gaged_outflow_date_time_cst_formatted < currentDateStageMinusOneDay) { 					// MISSING
						// 				gagedOutflowCellInnerHTML = "<span style='float: left; padding-left: 15px;'>" + "</span>";
						// 			} else if (gaged_outflow_date_time_cst_formatted < currentDateStageMinusTwoHours) { 		// LATE
						// 				gagedOutflowCellInnerHTML = "<span style='float: left; padding-left: 15px;'>Gaged Outflow: " + "</span>";
						// 				gagedOutflowCellInnerHTML += "<span id='flashingSpan' class='" + myFlowLimitClass + "' style='float: left; padding-left: 15px; font-style: italic;' title='" + gaged_outflow.cwms_ts_id + " " + gaged_outflow_date_time_cst_formatted + " Lower Limit: " + lowerFlowLimit.toFixed(0) + " " + lowerFlowLimitUnit + " Upper Limit: " + upperFlowLimit.toFixed(0) + " " + upperFlowLimitUnit + "'>" + parseFloat(gaged_outflow.value).toFixed(0) + " (" + parseFloat(gaged_outflow.delta_24).toFixed(0) + ") " + gaged_outflow.unit_id + "</span>";
						// 			} else { 																					// CURRENT
						// 				gagedOutflowCellInnerHTML = "<span style='float: left; padding-left: 15px;'>Gaged Outflow: " + "</span>";
						// 				gagedOutflowCellInnerHTML += "<span id='flashingSpan' class='" + myFlowLimitClass + "' style='float: left; padding-left: 15px;' title='" + gaged_outflow.cwms_ts_id + " " + gaged_outflow_date_time_cst_formatted + " Lower Limit: " + lowerFlowLimit.toFixed(0) + " " + lowerFlowLimitUnit + " Upper Limit: " + upperFlowLimit.toFixed(0) + " " + upperFlowLimitUnit + " Bankfull = " + bankfullFlowLimit.toFixed(0) + " " + bankfullFlowLimitUnit + "'>" + parseFloat(gaged_outflow.value).toFixed(0) + " (" + parseFloat(gaged_outflow.delta_24).toFixed(0) + ") " + gaged_outflow.unit_id + "</span>";
						// 			}

						// 			// Set the combined value to the cell, preserving HTML
						// 			// console.log("gagedOutflowCellInnerHTML = ", gagedOutflowCellInnerHTML);

						// 			// Set the HTML inside the cell once the fetch is complete
						// 			gagedOutflowCell.innerHTML = gagedOutflowCellInnerHTML;
						// 		} else {
						// 			console.log("No data fetched from either LWRP or stage API");
						// 		}
						// 	})
						// 	.catch((error) => {
						// 		console.error("Error:", error);
						// 	});
					}

					// ======= SEASONAL RULE CURVE DELTA =======
					if ("ruledelta" === "ruledelta") {
						// Create a new table cell for lake name
						const curveDeltaCell = row2.insertCell(5);
						curveDeltaCell.colSpan = 1;
						curveDeltaCell.classList.add('Font_15');
						curveDeltaCell.style.width = '10%';
						curveDeltaCell.style.backgroundColor = '#404040';
						curveDeltaCell.style.color = 'lightgray';

						// Initialize twDoCellInnerHTML as an empty string
						let curveDeltaCellInnerHTML = '--';

						// async function fetchStage29() {
						// 	try {
						// 		const response = await fetch(urlStage29);
						// 		const stage29 = await response.json();
						// 		return stage29;
						// 	} catch (error) {
						// 		console.error("Error fetching data:", error);
						// 		throw error; // Propagate the error to the caller
						// 	}
						// }

						// async function fetchRuleCurve() {
						// 	try {
						// 		const response = await fetch(urlRuleCurve);
						// 		const rule_curve = await response.json();
						// 		return rule_curve;
						// 	} catch (error) {
						// 		console.error("Error fetching data:", error);
						// 		throw error; // Propagate the error to the caller
						// 	}
						// }

						// // Call the asynchronous functions
						// Promise.all([fetchStage29(), fetchRuleCurve()])
						// 	.then(([stage29, rule_curve]) => {
						// 		if (stage29 && rule_curve) {

						// 			// console.log("stage29 = ", stage29);
						// 			// console.log("rule_curve = ", rule_curve);

						// 			let deltaRuleCurve = parseFloat(stage29.value).toFixed(2) - parseFloat(rule_curve[0].lev).toFixed(2);
						// 			// console.log("deltaRuleCurve = ", deltaRuleCurve);

						// 			// Add "+" for positive and "-" for negative values
						// 			const deltaRuleCurveFormatted = deltaRuleCurve.toFixed(2) >= 0 ? `+${deltaRuleCurve.toFixed(2)}` : deltaRuleCurve.toFixed(2);
						// 			// console.log("deltaRuleCurveFormatted = ", deltaRuleCurveFormatted);

						// 			curveDeltaCellInnerHTML = "<span style='color: lightblue;' title='" + "Rule Curve Delta Compare to Current Pool Level" + "'>" + deltaRuleCurveFormatted + "</span>";

						// 			// Set the combined value to the cell, preserving HTML
						// 			// console.log("curveDeltaCellInnerHTML = ", curveDeltaCellInnerHTML);

						// 			// Set the HTML inside the cell once the fetch is complete
						// 			curveDeltaCell.innerHTML = curveDeltaCellInnerHTML;
						// 		} else {
						// 			console.log("No data fetched from API");
						// 		}
						// 	})
						// 	.catch((error) => {
						// 		console.error("Error:", error);
						// 	});
					}
				}

				// =====================
				// ======= ROW 3 ======= (ONLY FOR MARKTWAIN, REREG, SCHD, GENERATION)
				// =====================
				if (3 === 3) {
					if (data.location_id.split('-')[0] === "Mark Twain Lk") {
						// Create and add the second new row
						const row3 = table.insertRow();

						// ======= BLANK =======
						if ("blank" === "blank") {
							// Create a new table cell for lake name in the second row
							const blankCell3 = row3.insertCell(0);
							blankCell3.colSpan = 1;
							blankCell3.classList.add('Font_15');
							blankCell3.style.color = 'white';

							// Initialize lakeCellInnerHTML as an empty string for the second row
							let blankCell3InnerHTML = '--';

							// Update the inner HTML of the cell with data for the second row, preserving HTML
							blankCell3InnerHTML = "-"; // Replace with the actual data for the second lake
							// console.log('blankCell3InnerHTML =', blankCell3InnerHTML);
							blankCell3.innerHTML = blankCell3InnerHTML;
						}

						// ======= REREG =======
						if ("rereg" === "rereg") {
							// Create a new table cell for lake name
							const reregCell = row3.insertCell(1);
							reregCell.colSpan = 2;
							reregCell.classList.add('Font_15');
							reregCell.style.width = '10%';
							reregCell.style.backgroundColor = '#404040';
							reregCell.style.color = 'lightgray';

							// Initialize doCellInnerHTML as an empty string
							let reregCellInnerHTML = '--';

							let tsid = null;
							if (data.display_stage_29 === true) {
								tsid = data.tsid_rereg_board
							} else {
								tsid = data.tsid_rereg_board
							}

							if (tsid !== null) {
								// Fetch the time series data from the API using the determined query string
								let url = null;
								if (cda === "public") {
									url = `https://cwms-data.usace.army.mil/cwms-data/timeseries?name=${tsid}&begin=${currentDateTimeMinus30Hours.toISOString()}&end=${currentDateTime.toISOString()}&office=MVS`;
								} else if (cda === "internal") {
									url = `https://coe-mvsuwa04mvs.mvs.usace.army.mil:8243/mvs-data/timeseries?name=${tsid}&begin=${currentDateTimeMinus30Hours.toISOString()}&end=${currentDateTime.toISOString()}&office=MVS`;
								} else {

								}
								// console.log("url = ", url);
								fetch(url, {
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
									.then(data => {
										// console.log("data:", data);

										// Convert timestamps in the JSON object
										data.values.forEach(entry => {
											entry[0] = formatNWSDate(entry[0]); // Update timestamp
										});

										// console.log("data formatted = ", data);

										// Get the last non-null value from the stage data
										const lastNonNullValue = getLastNonNullValue(data);
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

										const c_count = calculateCCount(tsid);
										// console.log("c_count:", c_count);

										const lastNonNull24HoursValue = getLastNonNull24HoursValue(data, c_count);
										// console.log("lastNonNull24HoursValue:", lastNonNull24HoursValue);

										// Check if a non-null value was found
										if (lastNonNull24HoursValue !== null) {
											// Extract timestamp, value, and quality code from the last non-null value
											var timestamp24HoursLast = lastNonNull24HoursValue.timestamp;
											var value24HoursLast = lastNonNull24HoursValue.value;
											var qualityCode24HoursLast = lastNonNull24HoursValue.qualityCode;

											// console.log("timestamp24HoursLast:", timestamp24HoursLast);
											// console.log("value24HoursLast:", value24HoursLast);
											// console.log("qualityCode24HoursLast:", qualityCode24HoursLast);
										} else {
											// If no non-null valueLast is found, log a message
											console.log("No non-null valueLast found.");
										}

										// Calculate the 24 hours change between first and last value
										const delta_24 = valueLast - value24HoursLast;
										// console.log("delta_24:", delta_24);

										if (valueLast !== null || valueLast !== undefined) {
											reregCellInnerHTML = "<span>"
												+ "Re-Reg Pool: " + valueLast.toFixed(2) + " (" + delta_24.toFixed(2) + ")" + " ft"
												+ "</span>";
										} else {
											reregCellInnerHTML = "<span class='missing'>" + "-M-" + "</span>"
										}
										reregCell.innerHTML = reregCellInnerHTML;
									})
									.catch(error => {
										// Catch and log any errors that occur during fetching or processing
										console.error("Error fetching or processing data:", error);
									});
							}
						}

						// ======= SCHD =======
						if ("schd" === "schd") {
							// Create a new table cell for lake name
							const schdCell = row3.insertCell(2);
							schdCell.colSpan = 1;
							schdCell.classList.add('Font_15');
							schdCell.style.width = '10%';
							schdCell.style.backgroundColor = '#404040';
							schdCell.style.color = 'lightgray';

							// Initialize doCellInnerHTML as an empty string
							let schdCellInnerHTML = '--';

							try {
								const ROutput = await fetchDataFromROutput();
								// console.log('ROutput:', ROutput);

								const filteredData = filterDataByLocationId(ROutput, data.location_id);
								// console.log("Filtered Data for", data.location_id + ":", filteredData);

								// // Update the HTML element with filtered data
								updateSchdHTML(filteredData, schdCell);

								// Further processing of ROutput data as needed
							} catch (error) {
								// Handle errors from fetchDataFromROutput
								console.error('Failed to fetch data:', error);
							}
						}

						// ======= REREG DO 1 =======
						if ("reregdo" === "reregdo") {
							// Create a new table cell for lake name
							const reregDoCell = row3.insertCell(3);
							reregDoCell.colSpan = 2;
							reregDoCell.classList.add('Font_15');
							reregDoCell.style.width = '10%';
							reregDoCell.style.backgroundColor = '#404040';
							reregDoCell.style.color = 'lightgray';

							// Initialize doCellInnerHTML as an empty string
							let reregDoCellInnerHTML = '--';

							let tsid = null;
							if (data.display_stage_29 === true) {
								tsid = data.tsid_rereg_do
							} else {
								tsid = data.tsid_rereg_do
							}

							if (tsid !== null) {
								// Fetch the time series data from the API using the determined query string
								let url = null;
								if (cda === "public") {
									url = `https://cwms-data.usace.army.mil/cwms-data/timeseries?name=${tsid}&begin=${currentDateTimeMinus30Hours.toISOString()}&end=${currentDateTime.toISOString()}&office=MVS`;
								} else if (cda === "internal") {
									url = `https://coe-mvsuwa04mvs.mvs.usace.army.mil:8243/mvs-data/timeseries?name=${tsid}&begin=${currentDateTimeMinus30Hours.toISOString()}&end=${currentDateTime.toISOString()}&office=MVS`;
								} else {

								}
								// console.log("url = ", url);
								fetch(url, {
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
									.then(data => {
										// console.log("data:", data);

										// Convert timestamps in the JSON object
										data.values.forEach(entry => {
											entry[0] = formatNWSDate(entry[0]); // Update timestamp
										});

										// console.log("data formatted = ", data);

										// Get the last non-null value from the stage data
										const lastNonNullValue = getLastNonNullValue(data);
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
											// console.log("No non-null valueLast found.");
										}

										const c_count = calculateCCount(tsid);
										// console.log("c_count:", c_count);

										const lastNonNull24HoursValue = getLastNonNull24HoursValue(data, c_count);
										// console.log("lastNonNull24HoursValue:", lastNonNull24HoursValue);

										// Check if a non-null value was found
										if (lastNonNull24HoursValue !== null) {
											// Extract timestamp, value, and quality code from the last non-null value
											var timestamp24HoursLast = lastNonNull24HoursValue.timestamp;
											var value24HoursLast = lastNonNull24HoursValue.value;
											var qualityCode24HoursLast = lastNonNull24HoursValue.qualityCode;

											// console.log("timestamp24HoursLast:", timestamp24HoursLast);
											// console.log("value24HoursLast:", value24HoursLast);
											// console.log("qualityCode24HoursLast:", qualityCode24HoursLast);
										} else {
											// If no non-null valueLast is found, log a message
											console.log("No non-null valueLast found.");
										}

										// Calculate the 24 hours change between first and last value
										const delta_24 = valueLast - value24HoursLast;
										// console.log("delta_24:", delta_24);

										if (valueLast !== null && valueLast !== undefined) {
											reregDoCellInnerHTML = "<span>"
												+ "DO1: " + valueLast.toFixed(2) + " (" + delta_24.toFixed(2) + ")"
												+ "</span>";
										} else {
											if ([10, 11, 12, 1, 2, 3].includes(currentMonth)) {
												reregDoCellInnerHTML = "DO1: " + "<img src='images/loading7.gif' style='width: 20px; height: 20px;'>";
											} else {
												reregDoCellInnerHTML = "DO1: " + "<span class='missing'>" + "-M-" + "</span>"
											}
										}
										reregDoCell.innerHTML = reregDoCellInnerHTML;
									})
									.catch(error => {
										// Catch and log any errors that occur during fetching or processing
										console.error("Error fetching or processing data:", error);
									});
							}
						}

						// ======= REREG DO 2 =======
						if ("reregdo" === "reregdo") {
							// Create a new table cell for lake name
							const reregDoCell2 = row3.insertCell(4);
							reregDoCell2.colSpan = 1;
							reregDoCell2.classList.add('Font_15');
							reregDoCell2.style.width = '10%';
							reregDoCell2.style.backgroundColor = '#404040';
							reregDoCell2.style.color = 'lightgray';

							// Initialize doCellInnerHTML as an empty string
							let reregDoCell2InnerHTML = '--';

							let tsid = null;
							if (data.display_stage_29 === true) {
								tsid = data.tsid_rereg_do2
							} else {
								tsid = data.tsid_rereg_do2
							}

							if (tsid !== null) {
								// Fetch the time series data from the API using the determined query string
								let url = null;
								if (cda === "public") {
									url = `https://cwms-data.usace.army.mil/cwms-data/timeseries?name=${tsid}&begin=${currentDateTimeMinus30Hours.toISOString()}&end=${currentDateTime.toISOString()}&office=MVS`;
								} else if (cda === "internal") {
									url = `https://coe-mvsuwa04mvs.mvs.usace.army.mil:8243/mvs-data/timeseries?name=${tsid}&begin=${currentDateTimeMinus30Hours.toISOString()}&end=${currentDateTime.toISOString()}&office=MVS`;
								} else {

								}
								// console.log("url = ", url);
								fetch(url, {
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
									.then(data => {
										// console.log("data:", data);

										// Convert timestamps in the JSON object
										data.values.forEach(entry => {
											entry[0] = formatNWSDate(entry[0]); // Update timestamp
										});

										// console.log("data formatted = ", data);

										// Get the last non-null value from the stage data
										const lastNonNullValue = getLastNonNullValue(data);
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

										const c_count = calculateCCount(tsid);
										// console.log("c_count:", c_count);

										const lastNonNull24HoursValue = getLastNonNull24HoursValue(data, c_count);
										// console.log("lastNonNull24HoursValue:", lastNonNull24HoursValue);

										// Check if a non-null value was found
										if (lastNonNull24HoursValue !== null) {
											// Extract timestamp, value, and quality code from the last non-null value
											var timestamp24HoursLast = lastNonNull24HoursValue.timestamp;
											var value24HoursLast = lastNonNull24HoursValue.value;
											var qualityCode24HoursLast = lastNonNull24HoursValue.qualityCode;

											// console.log("timestamp24HoursLast:", timestamp24HoursLast);
											// console.log("value24HoursLast:", value24HoursLast);
											// console.log("qualityCode24HoursLast:", qualityCode24HoursLast);
										} else {
											// If no non-null valueLast is found, log a message
											console.log("No non-null valueLast found.");
										}

										// Calculate the 24 hours change between first and last value
										const delta_24 = valueLast - value24HoursLast;
										// console.log("delta_24:", delta_24);

										if (valueLast !== null && valueLast !== undefined) {
											reregDoCell2InnerHTML = "<span>"
												+ "DO2: " + valueLast.toFixed(2) + " (" + delta_24.toFixed(2) + ")"
												+ "</span>";
										} else {
											if ([10, 11, 12, 1, 2, 3].includes(currentMonth)) {
												reregDoCell2InnerHTML = "DO2: "
													+ "<img src='images/loading7.gif' style='width: 20px; height: 20px;'>";
											} else {
												reregDoCell2InnerHTML = "DO2: "
													+ "<span class='missing'>-M-</span>";
											}
										}
										reregDoCell2.innerHTML = reregDoCell2InnerHTML;
									})
									.catch(error => {
										// Catch and log any errors that occur during fetching or processing
										console.error("Error fetching or processing data:", error);
									});
							}
						}

						// ======= GENERATION =======
						if ("gen" === "gen") {
							// Create a new table cell for lake name
							const genCell = row3.insertCell(5);
							genCell.colSpan = 1;
							genCell.classList.add('Font_15');
							genCell.style.width = '10%';
							genCell.style.backgroundColor = '#404040';
							genCell.style.color = 'lightgray';

							// Initialize doCellInnerHTML as an empty string
							let genCellInnerHTML = '';

							genCell.innerHTML = genCellInnerHTML;

							// // Make an AJAX request to the PHP script, passing all the variables
							// var urlGen = `https://coe-mvsuwa04mvs.mvs.usace.army.mil/php_data_api/public/get_generation2.php`;
							// // console.log("urlGen: " , urlGen);

							// fetch(urlGen)
							// 	.then(response => response.json())
							// 	.then(gen => {
							// 		// Log the stage to the console
							// 		// console.log("gen: ", gen);

							// 		// Extract lower and upper flow limits
							// 		const genValueRereg = parseFloat(gen[0].value_rereg);
							// 		const genDateTimeRereg = gen[0].date_time_rereg;
							// 		const genLocationIdRereg = gen[0].location_id_rereg;
							// 		// console.log("genValueRereg: ", genValueRereg);
							// 		// console.log("genValueRereg: ", typeof genValueRereg);
							// 		// console.log("genDateTimeRereg: ", genDateTimeRereg);
							// 		// console.log("genLocationIdRereg: ", genLocationIdRereg);


							// 		if (gen !== null && gen[0].value !== null) {
							// 			const gen_date_time = gen[0].date_time;
							// 			// console.log("gen_date_time = ", gen_date_time);
							// 			var dateParts = gen_date_time.split(" ");
							// 			var date = dateParts[0];
							// 			var time = dateParts[1];
							// 			var [month, day, year] = date.split("-");
							// 			var [hours, minutes] = time.split(":");
							// 			var gen_date_time_formatted = new Date(`${year}-${month}-${day}T${hours}:${minutes}:00`);
							// 			// console.log("gen_date_time_formatted", gen_date_time_formatted);
							// 			// console.log("gen_date_time_formatted: ", typeof gen_date_time_formatted);

							// 			// Get the current date as a Date object
							// 			const currentDate = new Date();
							// 			// Subtract 2 hours (2 * 60 * 60 * 1000 milliseconds)
							// 			const currentDateStageMinusTwoHours = new Date(currentDate.getTime() - (2 * 60 * 60 * 1000));
							// 			// Subtract 2 hours (2 * 60 * 60 * 1000 milliseconds)
							// 			const currentDateStageMinusOneDay = new Date(currentDate.getTime() - (24 * 60 * 60 * 1000));

							// 			// console.log("currentDateStage:", currentDate);
							// 			// console.log("currentDateStageMinusTwoHours:", currentDateStageMinusTwoHours);
							// 			// console.log("currentDateStageMinusOneDay:", currentDateStageMinusOneDay);

							// 			// Calculate the time difference in hours
							// 			const timeDifferenceInMilliseconds = currentDate.getTime() - gen_date_time_formatted.getTime();
							// 			const timeDifferenceInHours = timeDifferenceInMilliseconds / (1000 * 60 * 60);

							// 			// console.log("Time Difference (in hours):", timeDifferenceInHours);
							// 			// console.log("Time Difference (in hours):", typeof timeDifferenceInHours);

							// 			// Gen Class
							// 			if (timeDifferenceInHours <= 2) {
							// 				// console.log("Generating Now");
							// 				var myGenClass = "Gen_Now";
							// 			} else if (timeDifferenceInHours > 24) {
							// 				// console.log("No Generating");
							// 				var myGenClass = "Gen_No";
							// 			} else {
							// 				// console.log("Generating Within 24Hours");
							// 				var myGenClass = "Gen";
							// 			}

							// 			if (timeDifferenceInHours < 2) {
							// 				genCellInnerHTML = "<span class='" + myGenClass + "' style='float: left; padding-left: 15px; align-items: center; display: flex;' title='" + parseFloat(gen[0].delta).toFixed(1) + " delta ft : " + gen[0].date_time + " Hours: " + timeDifferenceInHours.toFixed(0) + "'><img src='images/yes3.png' width='30' height='30'>&nbsp;Generating Now</span>";
							// 			} else if (timeDifferenceInHours > 24) {
							// 				genCellInnerHTML = "<span class='" + myGenClass + "' style='float: left; padding-left: 15px; align-items: center; display: flex;' title='" + parseFloat(gen[0].delta).toFixed(1) + " delta ft : " + gen[0].date_time + " Hours: " + timeDifferenceInHours.toFixed(0) + "'>" + "<a href='https://wm.mvs.ds.usace.army.mil/web_apps/plot_macro/public/plot_macro.php?basin=Mark%20Twain&cwms_ts_id=Mark%20Twain%20Lk%20TW-Salt.Stage.Inst.15Minutes.0.29&cwms_ts_id_2=ReReg%20Pool-Salt.Stage.Inst.15Minutes.0.29&start_day=4&end_day=0' target='_blank' style='color: #ccc;'>No Generating</a>" + "</span>";
							// 			} else {
							// 				genCellInnerHTML = "<span class='" + myGenClass + "' style='float: left; padding-left: 15px; align-items: center; display: flex;' title='" + parseFloat(gen[0].delta).toFixed(1) + " delta ft : " + gen[0].date_time + " Hours: " + timeDifferenceInHours.toFixed(0) + "'><img src='images/yes3.png' width='30' height='30'>&nbsp;Generated " + timeDifferenceInHours.toFixed(0) + " Hrs Ago" + "</span>";
							// 			}
							// 		} else {
							// 			// If not gen in the past 24 hours. Determine of you need to gen. If Rereg below 521.5ft
							// 			if (genValueRereg > 521.5) {
							// 				genCellInnerHTML = "<span style='float: left; padding-left: 15px; align-items: center; display: flex;' title='No Gen in past 24 hours'>";
							// 				genCellInnerHTML += "<a href='https://wm.mvs.ds.usace.army.mil/web_apps/plot_macro/public/plot_macro.php?basin=Mark%20Twain&cwms_ts_id=Mark%20Twain%20Lk%20TW-Salt.Stage.Inst.15Minutes.0.29&cwms_ts_id_2=ReReg%20Pool-Salt.Stage.Inst.15Minutes.0.29&start_day=4&end_day=0' target='_blank' style='color: #ccc;'>No Generating</a>";
							// 				genCellInnerHTML += "</span>";
							// 			} else {
							// 				genCellInnerHTML = "<span style='float: left; padding-left: 15px; align-items: center; display: flex;' title='Rereg below 521.5ft'> <img src='images/call.png' width='25' height='25'>&nbsp;Call Rereg</span>";
							// 			}
							// 		}

							// 		// Set the combined value to the cell, preserving HTML
							// 		// console.log("genCellInnerHTML = ", genCellInnerHTML);

							// 		// Set the HTML inside the cell once the fetch is complete
							// 		genCell.innerHTML = genCellInnerHTML;
							// 	})
							// 	.catch(error => {
							// 		console.error('Error:', error);
							// 	});
						}
					}
				}

				// =====================
				// ======= ROW 4 ======= (NOTE)
				// =====================
				if (4 === 4) {
					// Create and add the second new row
					const row4 = table.insertRow();

					// ======= BLANK =======
					if ("blank" === "blank") {
						// Create a new table cell for lake name in the second row
						const blankCell4 = row4.insertCell(0);
						blankCell4.colSpan = 1;
						blankCell4.classList.add('Font_15');
						blankCell4.style.width = '15%';

						// Initialize lakeCellInnerHTML as an empty string for the second row
						let blankCell4InnerHTML = '--';

						// Update the inner HTML of the cell with data for the second row, preserving HTML
						blankCell4InnerHTML = " "; // Replace with the actual data for the second lake
						// console.log('blankCell4InnerHTML =', blankCell4InnerHTML);
						blankCell4.innerHTML = blankCell4InnerHTML;
					}

					// ======= NOTE =======
					if ("note" === "note") {
						// Create a new table cell for lake name
						const noteCell = row4.insertCell(1);
						noteCell.colSpan = 7;
						noteCell.classList.add('Font_15');
						noteCell.style.width = '10%';
						noteCell.style.backgroundColor = 'lightyellow';
						noteCell.style.color = '#333333';
						noteCell.style.textAlign = 'left'; // Add this line to align content to the left
						noteCell.style.paddingLeft = '10px'; // Add this line to set left padding

						// Initialize lakeCellInnerHTML as an empty string
						let noteCellInnerHTML = '';

						try {
							const ROutput = await fetchDataFromROutput();
							// console.log('ROutput:', ROutput);

							const filteredData = filterDataByLocationId(ROutput, data.location_id);
							// console.log("Filtered Data for", data.location_id + ":", filteredData);

							// // Update the HTML element with filtered data
							updateNoteHTML(filteredData, noteCell);

							// Further processing of ROutput data as needed
						} catch (error) {
							// Handle errors from fetchDataFromROutput
							console.error('Failed to fetch data:', error);
						}
					}
				}

				// =====================
				// ======= ROW 5 ======= (BLANK WHITE BLOCK)
				// =====================
				if (5 === 5) {
					// Create and add the second new row
					const row5 = table.insertRow();

					// ======= BLANK =======
					if ("blank" === "blank") {
						// Create a new table cell for lake name in the second row
						const blankCell5 = row5.insertCell(0);
						blankCell5.colSpan = 8;
						blankCell5.classList.add('Font_15');
						blankCell5.style.color = 'white';
						blankCell5.style.height = '20px'; // Add this line to set the height

						// Initialize lakeCellInnerHTML as an empty string for the second row
						let blankCell5InnerHTML = '--';

						// Update the inner HTML of the cell with data for the second row, preserving HTML
						blankCell5InnerHTML = ""; // Replace with the actual data for the second lake
						// console.log('blankCell5InnerHTML =', blankCell5InnerHTML);
						blankCell5.innerHTML = blankCell5InnerHTML;
					}
				}
			} else {
				// Handle other display types if needed
			}
		}
	}
	// Append the table to the element with the ID "tableContainer"
	const tableContainer = document.getElementById('tableContainer'); // Replace with the actual container ID
	tableContainer.appendChild(table);
}

// ******************************************************
// ******* Hard Coded Nws Forecast Time *****************
// ******************************************************

async function fetchDataFromNwsForecastsOutput(setJsonFileBaseUrl) {
	let url = null;
	url = 'https://wm.mvs.ds.usace.army.mil/php_data_api/public/json/exportNwsForecasts2Json.json';
	// console.log("url: ", url);

	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error('Network response was not ok');
		}
		const data = await response.json();
		return data;
	} catch (error) {
		console.error('Error fetching data:', error);
		throw error; // Propagate the error further if needed
	}
}

function filterDataByTsid(NwsOutput, cwms_ts_id) {
	const filteredData = NwsOutput.filter(item => {
		return item !== null && item.cwms_ts_id_day1 === cwms_ts_id;
	});

	return filteredData;
}

async function fetchAndLogNwsData(nwsForecastTsid, forecastTimeCell, setJsonFileBaseUrl) {
	try {
		const NwsOutput = await fetchDataFromNwsForecastsOutput(setJsonFileBaseUrl);
		// console.log('NwsOutput:', NwsOutput);

		const filteredData = filterDataByTsid(NwsOutput, nwsForecastTsid);
		// console.log("Filtered NwsOutput Data for", nwsForecastTsid + ":", filteredData);

		// Update the HTML element with filtered data
		updateNwsForecastTimeHTML(filteredData, forecastTimeCell);

		// Further processing of ROutput data as needed
	} catch (error) {
		// Handle errors from fetchDataFromROutput
		console.error('Failed to fetch data:', error);
	}
}

function updateNwsForecastTimeHTML(filteredData, forecastTimeCell) {
	const locationData = filteredData.find(item => item !== null); // Find the first non-null item
	if (!locationData) {
		forecastTimeCell.innerHTML = ''; // Handle case where no valid data is found
		return;
	}

	const entryDate = locationData.data_entry_date_cst1;

	// Parse the entry date string
	const dateParts = entryDate.split('-'); // Split by hyphen
	const day = dateParts[0]; // Day part
	const monthAbbreviation = dateParts[1]; // Month abbreviation (e.g., JUL)
	const year = dateParts[2].substring(0, 2); // Last two digits of the year (e.g., 24)

	// Map month abbreviation to month number
	const months = {
		'JAN': '01', 'FEB': '02', 'MAR': '03', 'APR': '04',
		'MAY': '05', 'JUN': '06', 'JUL': '07', 'AUG': '08',
		'SEP': '09', 'OCT': '10', 'NOV': '11', 'DEC': '12'
	};

	const month = months[monthAbbreviation]; // Get numeric month

	// Parse time parts
	const timeParts = entryDate.split(' ')[1].split('.'); // Split time part by period
	const hours = timeParts[0]; // Hours part
	const minutes = timeParts[1]; // Minutes part

	// Determine period (AM/PM)
	const period = timeParts[3] === 'PM' ? 'PM' : 'AM';

	// Construct formatted date and time
	const formattedDateTime = `${month}-${day}-${year} ${hours}:${minutes} ${period}`;

	// Update the HTML content
	forecastTimeCell.innerHTML = `<div class="hard_coded_php" title="Uses PHP exportNwsForecasts2Json.json Output, No Cloud Option Yet">${formattedDateTime}</div>`;
}

async function fetchInBatches(urls) {
	const results = [];

	// Loop over urls array in chunks
	for (let i = 0; i < urls.length; i += BATCH_SIZE) {
		const batch = urls.slice(i, i + BATCH_SIZE);

		// Fetch all URLs in the current batch concurrently
		const batchPromises = batch.map(url =>
			fetch(url)
				.then(response => {
					if (response.status === 404) return null; // Skip if not found
					if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`);
					return response.json();
				})
				.catch(error => {
					console.error(`Problem with the fetch operation for stage TSID data at ${url}:`, error);
					return null; // Return null on error to prevent batch failure
				})
		);

		// Wait for all requests in the batch to complete and store results
		const batchResults = await Promise.all(batchPromises);
		results.push(...batchResults);
	}

	return results;
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

function subtractDaysFromDate(date, daysToSubtract) {
	return new Date(date.getTime() - (daysToSubtract * 24 * 60 * 60 * 1000));
}

function addDaysFromDate(date, daysToSubtract) {
	return new Date(date.getTime() + (daysToSubtract * 24 * 60 * 60 * 1000));
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