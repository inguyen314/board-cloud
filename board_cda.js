var allData = [];

document.addEventListener('DOMContentLoaded', async function () {
	// Display the loading_alarm_mvs indicator
	const loadingIndicator = document.getElementById('loading');
	loadingIndicator.style.display = 'block';

	// Gage control json file
	let jsonFileURL = null;
	if (cda === "public") {
		jsonFileURL = '../../../php_data_api/public/json/gage_control.json';
	} else if (cda === "internal") {
		jsonFileURL = '../../../php_data_api/public/json/gage_control.json';
	}
	console.log('jsonFileURL: ', jsonFileURL);

	const response = await fetch(jsonFileURL);
	// console.log('response: ', response);

	if (!response.ok) {
		throw new Error('Network response was not ok');
	}
	const gageControlData = await response.json();

	// Check if data_items array is present in the gageControlData
	console.log('gageControlData: ', gageControlData);

	console.log('basin: ', basin);

	let basinData = null;
	if (display_type === "FloodStage" || display_type === "LWRP") {
		// Extracted gageControlData for the basin
		basinData = filterBasins(gageControlData, basin);
		// Print the extracted data for basin
		console.log('basinData: ', basinData);
	} else if (display_type === "Lake") {
		// Extracted gageControlData for the basin
		basinData = filterGagesByLocationIdWithBasin(gageControlData, basin);
		// Print the extracted data for basin
		console.log('basinData: ', basinData);
	}

	// Combine all secondDataArray into one object based on name
	const combinedFirstData = [];
	const combinedSecondData = [];
	const combinedThirdData = [];
	const combinedForthData = [];
	const combinedFifthData = [];
	const combinedSixthData = [];
	const combinedSeventhData = [];
	const combinedEighthData = [];
	const combinedNinethData = [];
	const combinedTenthData = [];
	const combinedEleventhData = [];
	const combinedTwelfthData = [];
	const combinedThirteenthData = [];
	const combinedFourthteenthData = [];

	// Array to store all promises from API requests
	const apiPromises = [];

	// Iterate over each object in basinData and append location levels and letadata
	for (const basin of basinData) {
		for (const locData of basin.gages) {
			// Prepare variable to pass in when call api
			const locationId = locData.location_id;
			// console.log('locationId: ', locationId);

			//====================================================
			// ============== Level Id Setup =====================
			//====================================================

			// Location level "Flood"
			const levelIdFlood = locData.level_id_flood;
			const levelIdEffectiveDateFlood = locData.level_id_effective_date_flood;
			const levelIdUnitIdFlood = locData.level_id_unit_id_flood;
			// console.log("levelIdFlood = ", levelIdFlood);

			// Location level "NGVD29"
			const levelIdNgvd29 = locData.level_id_ngvd29;
			const levelIdEffectiveDateNgvd29 = locData.level_id_effective_date_ngvd29;
			const levelIdUnitIdNgvd29 = locData.level_id_unit_id_ngvd29;

			// Location level "Record Stage"
			const levelIdRecordStage = locData.level_id_record_stage;
			const levelIdEffectiveDateRecordStage = locData.level_id_effective_date_record_stage;
			const levelIdUnitIdRecordStage = locData.level_id_unit_id_record_stage;
			// console.log('levelIdRecordStage: ', levelIdRecordStage);

			// Location level "Phase 1"
			const levelIdPhase1 = locData.level_id_phase1;
			const levelIdEffectiveDatePhase1 = locData.level_id_effective_date_phase1;
			const levelIdUnitIdPhase1 = locData.level_id_unit_id_phase1;
			// console.log('levelIdPhase1: ', levelIdPhase1);

			// Location level "Phase 2"
			const levelIdPhase2 = locData.level_id_phase2;
			const levelIdEffectiveDatePhase2 = locData.level_id_effective_date_phase2;
			const levelIdUnitIdPhase2 = locData.level_id_unit_id_phase2;
			// console.log('levelIdPhase2: ', levelIdPhase2);

			// Location level "LWRP"
			const levelIdLwrp = locData.level_id_lwrp;
			const levelIdEffectiveDateLwrp = locData.level_id_effective_date_lwrp;
			const levelIdUnitIdLwrp = locData.level_id_unit_id_lwrp;
			// console.log('levelIdLwrp: ', levelIdLwrp);

			// Location level "Top of Flood"
			const levelIdTof = locData.level_id_top_of_flood;
			const levelIdEffectiveDateTof = locData.level_id_effective_date_top_of_flood;
			const levelIdUnitIdTof = locData.level_id_unit_id_top_of_flood;
			// console.log('levelIdTof: ', levelIdTof);

			// Location level "Bottom of Flood"
			const levelIdBof = locData.level_id_bottom_of_flood;
			const levelIdEffectiveDateBof = locData.level_id_effective_date_bottom_of_flood;
			const levelIdUnitIdBof = locData.level_id_unit_id_bottom_of_flood;
			// console.log('levelIdBof: ', levelIdBof);

			// Location level "Top of Con"
			const levelIdToc = locData.level_id_top_of_conservation;
			const levelIdEffectiveDateToc = locData.level_id_effective_date_top_of_conservation;
			const levelIdUnitIdToc = locData.level_id_unit_id_top_of_conservation;
			// console.log('levelIdToc: ', levelIdToc);

			// Location level "Bottom of Con"
			const levelIdBoc = locData.level_id_bottom_of_conservation;
			const levelIdEffectiveDateBoc = locData.level_id_effective_date_bottom_of_conservation;
			const levelIdUnitIdBoc = locData.level_id_unit_id_bottom_of_conservation;
			// console.log('levelIdBoc: ', levelIdBoc);

			// Location level "Bankfull"
			const levelIdBankfull = locData.level_id_bankfull;
			const levelIdEffectiveDateBankfull = locData.level_id_effective_date_bankfull;
			const levelIdUnitIdBankfull = locData.level_id_unit_id_bankfull;


			//====================================================
			// ============== START CDA CALL =====================
			//====================================================

			// Construct the URL for the API first request - metadata
			(() => {
				let firstApiUrl = null;
				if (cda === "public") {
					firstApiUrl = `https://cwms-data.usace.army.mil/cwms-data/locations/${locationId}?office=MVS`;
				} else if (cda === "internal") {
					firstApiUrl = `https://coe-mvsuwa04mvs.mvs.usace.army.mil:8243/mvs-data/locations/${locationId}?office=MVS`;
				}
				// console.log('firstApiUrl: ', firstApiUrl);

				// Push the fetch promise to the apiPromises array
				apiPromises.push(fetch(firstApiUrl)
					.then(response => {
						if (!response.ok) {
							throw new Error('Network response was not ok');
						}
						return response.json();
					})
					.then(firstData => {
						// Process the response firstData as needed
						// console.log('firstData :', firstData);
						combinedFirstData.push(firstData);
					})
				);
			})();

			// Construct the URL for the API second request - flood
			(() => {
				if (levelIdFlood !== null || levelIdEffectiveDateFlood !== null || levelIdUnitIdFlood !== null) {
					let secondApiUrl = null;
					if (cda === "public") {
						secondApiUrl = `https://cwms-data.usace.army.mil/cwms-data/levels/${levelIdFlood}?office=MVS&effective-date=${levelIdEffectiveDateFlood}&unit=${levelIdUnitIdFlood}`;
					} else if (cda === "internal") {
						secondApiUrl = `https://coe-mvsuwa04mvs.mvs.usace.army.mil:8243/mvs-data/levels/${levelIdFlood}?office=MVS&effective-date=${levelIdEffectiveDateFlood}&unit=${levelIdUnitIdFlood}`;
					}
					// console.log('secondApiUrl: ', secondApiUrl);

					apiPromises.push(
						fetch(secondApiUrl)
							.then(response => {
								if (!response.ok) {
									throw new Error('Network response was not ok');
								}
								return response.json();
							})
							.then(secondData => {
								// Check if secondData is null
								if (secondData === null) {
									// Handle the case when secondData is null
									// console.log('secondData is null');
									// You can choose to return or do something else here
								} else {
									// Process the response from another API as needed
									// console.log('secondData:', secondData);
									combinedSecondData.push(secondData);
								}
							})
							.catch(error => {
								// Handle any errors that occur during the fetch or processing
								console.error('Error fetching or processing data:', error);
							})
					)
				}
			})();

			// Construct the URL for the API third request - basin
			(() => {
				let thirdApiUrl = null;
				if (cda === "public") {
					thirdApiUrl = `https://cwms-data.usace.army.mil/cwms-data/location/group/${basin.basin}?office=MVS&category-id=RDL_Basins`;
				} else if (cda === "internal") {
					thirdApiUrl = `https://coe-mvsuwa04mvs.mvs.usace.army.mil:8243/mvs-data/location/group/${basin.basin}?office=MVS&category-id=RDL_Basins`;
				}
				// console.log('thirdApiUrl: ', thirdApiUrl);

				// Push the fetch promise to the apiPromises array
				apiPromises.push(
					fetch(thirdApiUrl)
						.then(response => {
							// Check if the network response is successful
							if (!response.ok) {
								throw new Error('Network response was not ok');
							}
							return response.json();
						})
						.then(thirdData => {
							// Check if thirdData is null
							if (thirdData === null) {
								console.log('thirdData is null');
								// Handle the case when thirdData is null (optional)
							} else {
								// Process the response from another API as needed
								// console.log('thirdData:', thirdData);

								// Filter the assigned locations array to find the desired location
								const foundThirdLocation = thirdData["assigned-locations"].find(location => location["location-id"] === locationId);

								// Extract thirdData if the location is found
								let extractedThirdData = null;
								if (foundThirdLocation) {
									extractedThirdData = {
										"office-id": thirdData["office-id"],
										"id": thirdData["id"],
										"location-id": foundThirdLocation["location-id"]
									};
								}
								// console.log("extractedThirdData", extractedThirdData);

								// Push the extracted thirdData to the combinedThirdData array
								combinedThirdData.push(extractedThirdData);
							}
						})
				);
			})();

			// Construct the URL for the API forth request - owner
			(() => {
				let forthApiUrl = null;
				if (cda === "public") {
					forthApiUrl = `https://cwms-data.usace.army.mil/cwms-data/location/group/MVS?office=MVS&category-id=RDL_MVS`;
				} else if (cda === "internal") {
					forthApiUrl = `https://coe-mvsuwa04mvs.mvs.usace.army.mil:8243/mvs-data/location/group/MVS?office=MVS&category-id=RDL_MVS`;
				}
				// console.log('forthApiUrl: ', forthApiUrl);

				// Push the fetch promise to the apiPromises array
				apiPromises.push(
					fetch(forthApiUrl)
						.then(response => {
							// Check if the network response is successful
							if (!response.ok) {
								throw new Error('Network response was not ok');
							}
							return response.json();
						})
						.then(forthData => {
							// Check if forthData is null
							if (forthData === null) {
								console.log('forthData is null');
								// Handle the case when forthData is null (optional)
							} else {
								// Process the response from another API as needed
								// console.log('forthData:', forthData);

								// Filter the assigned locations array to find the desired location
								const foundForthLocation = forthData["assigned-locations"].find(location => location["location-id"] === locationId);

								// Extract forthData if the location is found
								let extractedForthData = null;
								if (foundForthLocation) {
									extractedForthData = {
										"office-id": forthData["office-id"],
										"id": forthData["id"],
										"location-id": foundForthLocation["location-id"]
									};
								}
								// console.log("extractedForthData", extractedForthData);

								// Push the extracted forthData to the combinedForthData array
								combinedForthData.push(extractedForthData);
							}
						})
				);
			})();

			// Construct the URL for the API fifth request - Record Stage
			(() => {
				if (levelIdRecordStage != null && levelIdEffectiveDateRecordStage != null && levelIdUnitIdRecordStage != null) {
					let fifthApiUrl = null;
					if (cda === "public") {
						fifthApiUrl = `https://cwms-data.usace.army.mil/cwms-data/levels/${levelIdRecordStage}?office=MVS&effective-date=${levelIdEffectiveDateRecordStage}&unit=${levelIdUnitIdRecordStage}`;
					} else if (cda === "internal") {
						fifthApiUrl = `https://coe-mvsuwa04mvs.mvs.usace.army.mil:8243/mvs-data/levels/${levelIdRecordStage}?office=MVS&effective-date=${levelIdEffectiveDateRecordStage}&unit=${levelIdUnitIdRecordStage}`;
					}

					apiPromises.push(
						fetch(fifthApiUrl)
							.then(response => {
								if (!response.ok) {
									throw new Error('Network response was not ok');
								}
								return response.json();
							})
							.then(fifthData => {
								if (fifthData == null) { // Check for null or undefined
									combinedFifthData.push(null);
									// console.log('fifthData is null or undefined');
								} else {
									combinedFifthData.push(fifthData);
									// console.log('combinedFifthData:', combinedFifthData);
								}
							})
							.catch(error => {
								if (error.name === 'AbortError') {
									console.error('The fetch operation was aborted.');
								} else {
									console.error('Error fetching or processing data:', error);
								}
								combinedFifthData.push(null); // Maintain array structure even on error
							})
					);
				} else {
					combinedFifthData.push(null);
				}
			})();

			// Construct the URL for the API sixth request - NGVD29
			(() => {
				if (levelIdNgvd29) {
					let sixthApiUrl = null;
					if (cda === "public") {
						sixthApiUrl = `https://cwms-data.usace.army.mil/cwms-data/levels/${levelIdNgvd29}?office=MVS&effective-date=${levelIdEffectiveDateNgvd29}&unit=${levelIdUnitIdNgvd29}`;
					} else if (cda === "internal") {
						sixthApiUrl = `https://coe-mvsuwa04mvs.mvs.usace.army.mil:8243/mvs-data/levels/${levelIdNgvd29}?office=MVS&effective-date=${levelIdEffectiveDateNgvd29}&unit=${levelIdUnitIdNgvd29}`;
					}
					// console.log('sixthApiUrl: ', sixthApiUrl);

					apiPromises.push(
						fetch(sixthApiUrl)
							.then(response => {
								if (!response.ok) {
									throw new Error('Network response was not ok');
								}
								return response.json();
							})
							.then(sixthData => {
								// Check if sixthData is null
								if (sixthData === null) {
									// Handle the case when sixthData is null
									// console.log('sixthData is null');
								} else {
									// Process the response from another API as needed
									combinedSixthData.push(sixthData);
									// console.log('combinedSixthData:', combinedSixthData);
								}
							})
							.catch(error => {
								// Handle any errors that occur during the fetch or processing
								console.error('Error fetching or processing data:', error);
							})
					);
				} else {
					combinedSixthData.push(null);
				}
			})();

			// Construct the URL for the API second request - Phase1
			(() => {
				if (levelIdPhase1 !== null || levelIdEffectiveDatePhase1 !== null || levelIdUnitIdPhase1 !== null) {
					let seventhApiUrl = null;
					if (cda === "public") {
						seventhApiUrl = `https://cwms-data.usace.army.mil/cwms-data/levels/${levelIdPhase1}?office=MVS&effective-date=${levelIdEffectiveDatePhase1}&unit=${levelIdUnitIdPhase1}`;
					} else if (cda === "internal") {
						seventhApiUrl = `https://coe-mvsuwa04mvs.mvs.usace.army.mil:8243/mvs-data/levels/${levelIdPhase1}?office=MVS&effective-date=${levelIdEffectiveDatePhase1}&unit=${levelIdUnitIdPhase1}`;
					}
					// console.log('seventhApiUrl: ', seventhApiUrl);

					apiPromises.push(
						fetch(seventhApiUrl)
							.then(response => {
								if (!response.ok) {
									throw new Error('Network response was not ok');
								}
								return response.json();
							})
							.then(seventhData => {
								// Check if seventhData is null
								if (seventhData === null) {
									// Handle the case when seventhData is null
									// console.log('seventhData is null');
									// You can choose to return or do something else here
								} else {
									// Process the response from another API as needed
									// console.log('seventhData:', seventhData);
									combinedSeventhData.push(seventhData);
								}
							})
							.catch(error => {
								// Handle any errors that occur during the fetch or processing
								console.error('Error fetching or processing data:', error);
							})
					)
				}
			})();

			// Construct the URL for the API second request - Phase1
			(() => {
				if (levelIdPhase2 !== null || levelIdEffectiveDatePhase2 !== null || levelIdUnitIdPhase2 !== null) {
					let eighthApiUrl = null;
					if (cda === "public") {
						eighthApiUrl = `https://cwms-data.usace.army.mil/cwms-data/levels/${levelIdPhase2}?office=MVS&effective-date=${levelIdEffectiveDatePhase2}&unit=${levelIdUnitIdPhase2}`;
					} else if (cda === "internal") {
						eighthApiUrl = `https://coe-mvsuwa04mvs.mvs.usace.army.mil:8243/mvs-data/levels/${levelIdPhase2}?office=MVS&effective-date=${levelIdEffectiveDatePhase2}&unit=${levelIdUnitIdPhase2}`;
					}
					// console.log('eighthApiUrl: ', eighthApiUrl);

					apiPromises.push(
						fetch(eighthApiUrl)
							.then(response => {
								if (!response.ok) {
									throw new Error('Network response was not ok');
								}
								return response.json();
							})
							.then(eighthData => {
								// Check if eighthData is null
								if (eighthData === null) {
									// Handle the case when eighthData is null
									// console.log('eighthData is null');
									// You can choose to return or do something else here
								} else {
									// Process the response from another API as needed
									// console.log('eighthData:', eighthData);
									combinedEighthData.push(eighthData);
								}
							})
							.catch(error => {
								// Handle any errors that occur during the fetch or processing
								console.error('Error fetching or processing data:', error);
							})
					)
				}
			})();

			// Construct the URL for the API nineth request - Lwrp
			(() => {
				if (levelIdLwrp) {
					if (levelIdLwrp !== null || levelIdEffectiveDateLwrp !== null || levelIdUnitIdLwrp !== null) {
						let ninethApiUrl = null;
						if (cda === "public") {
							ninethApiUrl = `https://cwms-data.usace.army.mil/cwms-data/levels/${levelIdLwrp}?office=MVS&effective-date=${levelIdEffectiveDateLwrp}&unit=${levelIdUnitIdLwrp}`;
						} else if (cda === "internal") {
							ninethApiUrl = `https://coe-mvsuwa04mvs.mvs.usace.army.mil:8243/mvs-data/levels/${levelIdLwrp}?office=MVS&effective-date=${levelIdEffectiveDateLwrp}&unit=${levelIdUnitIdLwrp}`;
						}
						// console.log('ninethApiUrl: ', ninethApiUrl);

						apiPromises.push(
							fetch(ninethApiUrl)
								.then(response => {
									if (!response.ok) {
										throw new Error('Network response was not ok');
									}
									return response.json();
								})
								.then(ninethData => {
									// Check if ninethData is null
									if (ninethData === null) {
										// Handle the case when ninethData is null
										// console.log('ninethData is null');
										// You can choose to return or do something else here
									} else {
										// Process the response from another API as needed
										// console.log('ninethData:', ninethData);
										combinedNinethData.push(ninethData);
									}
								})
								.catch(error => {
									// Handle any errors that occur during the fetch or processing
									console.error('Error fetching or processing data:', error);
								})
						)
					}
				} else {
					combinedNinethData.push(null);
				}
			})();

			// Construct the URL for the API tenth request - Top of Flood
			(() => {
				if (levelIdTof) {
					if (levelIdTof !== null || levelIdEffectiveDateTof !== null || levelIdUnitIdTof !== null) {
						let tenthApiUrl = null;
						if (cda === "public") {
							tenthApiUrl = `https://cwms-data.usace.army.mil/cwms-data/levels/${levelIdTof}?office=MVS&effective-date=${levelIdEffectiveDateTof}&unit=${levelIdUnitIdTof}`;
						} else if (cda === "internal") {
							tenthApiUrl = `https://coe-mvsuwa04mvs.mvs.usace.army.mil:8243/mvs-data/levels/${levelIdTof}?office=MVS&effective-date=${levelIdEffectiveDateTof}&unit=${levelIdUnitIdTof}`;
						}
						// console.log('tenthApiUrl: ', tenthApiUrl);

						apiPromises.push(
							fetch(tenthApiUrl)
								.then(response => {
									if (!response.ok) {
										throw new Error('Network response was not ok');
									}
									return response.json();
								})
								.then(tenthData => {
									// Check if tenthData is null
									if (tenthData === null) {
										// console.log('tenthData is null');
										// You can choose to return or do something else here
									} else {
										// console.log('tenthData:', tenthData);
										combinedTenthData.push(tenthData);
									}
								})
								.catch(error => {
									// Handle any errors that occur during the fetch or processing
									console.error('Error fetching or processing data:', error);
								})
						)
					}
				} else {
					combinedTenthData.push(null);
				}
			})();

			// Construct the URL for the API tenth request - Bottom of Flood
			(() => {
				if (levelIdBof) {
					if (levelIdBof !== null || levelIdEffectiveDateBof !== null || levelIdUnitIdBof !== null) {
						let eleventhApiUrl = null;
						if (cda === "public") {
							eleventhApiUrl = `https://cwms-data.usace.army.mil/cwms-data/levels/${levelIdBof}?office=MVS&effective-date=${levelIdEffectiveDateBof}&unit=${levelIdUnitIdBof}`;
						} else if (cda === "internal") {
							eleventhApiUrl = `https://coe-mvsuwa04mvs.mvs.usace.army.mil:8243/mvs-data/levels/${levelIdBof}?office=MVS&effective-date=${levelIdEffectiveDateBof}&unit=${levelIdUnitIdBof}`;
						}
						// console.log('eleventhApiUrl: ', eleventhApiUrl);

						apiPromises.push(
							fetch(eleventhApiUrl)
								.then(response => {
									if (!response.ok) {
										throw new Error('Network response was not ok');
									}
									return response.json();
								})
								.then(eleventhData => {
									// Check if eleventhData is null
									if (eleventhData === null) {
										// console.log('eleventhData is null');
										// You can choose to return or do something else here
									} else {
										// console.log('eleventhData:', eleventhData);
										combinedEleventhData.push(eleventhData);
									}
								})
								.catch(error => {
									// Handle any errors that occur during the fetch or processing
									console.error('Error fetching or processing data:', error);
								})
						)
					}
				} else {
					combinedEleventhData.push(null);
				}
			})();

			// Construct the URL for the API tenth request - Bottom of Consevation
			(() => {
				if (levelIdBoc) {
					if (levelIdBoc !== null || levelIdEffectiveDateBoc !== null || levelIdUnitIdBoc !== null) {
						let twelfthApiUrl = null;
						if (cda === "public") {
							twelfthApiUrl = `https://cwms-data.usace.army.mil/cwms-data/levels/${levelIdBoc}?office=MVS&effective-date=${levelIdEffectiveDateBoc}&unit=${levelIdUnitIdBoc}`;
						} else if (cda === "internal") {
							twelfthApiUrl = `https://coe-mvsuwa04mvs.mvs.usace.army.mil:8243/mvs-data/levels/${levelIdBoc}?office=MVS&effective-date=${levelIdEffectiveDateBoc}&unit=${levelIdUnitIdBoc}`;
						}
						// console.log('twelfthApiUrl: ', twelfthApiUrl);

						apiPromises.push(
							fetch(twelfthApiUrl)
								.then(response => {
									if (!response.ok) {
										throw new Error('Network response was not ok');
									}
									return response.json();
								})
								.then(twelfthData => {
									// Check if twelfthData is null
									if (twelfthData === null) {
										// console.log('twelfthData is null');
										// You can choose to return or do something else here
									} else {
										// console.log('twelfthData:', twelfthData);
										combinedTwelfthData.push(twelfthData);
									}
								})
								.catch(error => {
									// Handle any errors that occur during the fetch or processing
									console.error('Error fetching or processing data:', error);
								})
						)
					}
				} else {
					combinedTwelfthData.push(null);
				}
			})();

			// Construct the URL for the API tenth request - Top of Consevation
			(() => {
				if (levelIdToc) {
					if (levelIdToc !== null || levelIdEffectiveDateToc !== null || levelIdUnitIdToc !== null) {
						let thirteenthApiUrl = null;
						if (cda === "public") {
							thirteenthApiUrl = `https://cwms-data.usace.army.mil/cwms-data/levels/${levelIdToc}?office=MVS&effective-date=${levelIdEffectiveDateToc}&unit=${levelIdUnitIdToc}`;
						} else if (cda === "internal") {
							thirteenthApiUrl = `https://coe-mvsuwa04mvs.mvs.usace.army.mil:8243/mvs-data/levels/${levelIdToc}?office=MVS&effective-date=${levelIdEffectiveDateToc}&unit=${levelIdUnitIdToc}`;
						}
						// console.log('thirteenthApiUrl: ', thirteenthApiUrl);

						apiPromises.push(
							fetch(thirteenthApiUrl)
								.then(response => {
									if (!response.ok) {
										throw new Error('Network response was not ok');
									}
									return response.json();
								})
								.then(thirteenthData => {
									// Check if thirteenthData is null
									if (thirteenthData === null) {
										// console.log('thirteenthData is null');
										// You can choose to return or do something else here
									} else {
										// console.log('thirteenthData:', thirteenthData);
										combinedThirteenthData.push(thirteenthData);
									}
								})
								.catch(error => {
									// Handle any errors that occur during the fetch or processing
									console.error('Error fetching or processing data:', error);
								})
						)
					}
				} else {
					combinedThirteenthData.push(null);
				}
			})();

			// Construct the URL for the API nineth request - bankfull
			(() => {
				if (levelIdBankfull) {
					if (levelIdBankfull !== null || levelIdEffectiveDateBankfull !== null || levelIdUnitIdBankfull !== null) {
						let fourthteenthApiUrl = null;
						if (cda === "public") {
							fourthteenthApiUrl = `https://cwms-data.usace.army.mil/cwms-data/levels/${levelIdBankfull.split('-')[0]}?office=MVS&effective-date=${levelIdEffectiveDateBankfull}&unit=${levelIdUnitIdBankfull}`;
						} else if (cda === "internal") {
							fourthteenthApiUrl = `https://coe-mvsuwa04mvs.mvs.usace.army.mil:8243/mvs-data/levels/${levelIdBankfull.split('-')[0]}?office=MVS&effective-date=${levelIdEffectiveDateBankfull}&unit=${levelIdUnitIdBankfull}`;
						}
						// console.log('fourthteenthApiUrl: ', fourthteenthApiUrl);

						apiPromises.push(
							fetch(fourthteenthApiUrl)
								.then(response => {
									if (!response.ok) {
										throw new Error('Network response was not ok');
									}
									return response.json();
								})
								.then(fourthteenthData => {
									// Check if fourthteenthData is null
									if (fourthteenthData === null) {
										// Handle the case when fourthteenthData is null
										// console.log('fourthteenthData is null');
										// You can choose to return or do something else here
									} else {
										// Process the response from another API as needed
										// console.log('fourthteenthData:', fourthteenthData);
										combinedFourthteenthData.push(fourthteenthData);
									}
								})
								.catch(error => {
									// Handle any errors that occur during the fetch or processing
									console.error('Error fetching or processing data:', error);
								})
						)
					}
				} else {
					combinedFourthteenthData.push(null);
				}
			})();

			// END CDA CALL 

			// Wait for all API requests to finish
			await Promise.all(apiPromises);

			// Call mergeDataCda
			mergeDataCda(basinData,
				combinedFirstData,
				combinedSecondData,
				combinedThirdData,
				combinedForthData,
				combinedFifthData,
				combinedSixthData,
				combinedSeventhData,
				combinedEighthData,
				combinedNinethData,
				combinedTenthData,
				combinedEleventhData,
				combinedTwelfthData,
				combinedThirteenthData,
				combinedFourthteenthData
			);
		}
	};

	console.log('allData:', allData);

	// Call the function to create and populate the table
	console.log("===== Calling createTable with allData =====");
	createTable(allData);

	loadingIndicator.style.display = 'none';
});

//================================================
// ============== FORM DATA ======================
//================================================
if (display_type == "FloodStage" && display_tributary == "False") {
	// Function to make an AJAX request
	function fetchData() {
		return new Promise((resolve, reject) => {
			var xhr = new XMLHttpRequest();
			xhr.open('GET', 'form_values.json', true);
			xhr.setRequestHeader('Content-Type', 'application/json');

			xhr.onreadystatechange = function () {
				if (xhr.readyState === 4) {
					if (xhr.status === 200) {
						resolve(JSON.parse(xhr.responseText));
					} else {
						reject('Failed to fetch data');
					}
				}
			};

			xhr.send();
		});
	}

	// Use the fetchData function to get JSON data and assign it to a variable
	var jsonData;

	// Wrap the asynchronous operation in a promise
	var fetchDataPromise = fetchData()
		.then(data => {
			jsonData = data;
			// console.log('JSON Data:', jsonData);

			// Now you can use jsonData anywhere in your JavaScript file
			// For example:
			//displayData();
			return useJsonDataCreateForm();
		})
		.catch(error => {
			console.error('Error:', error);
		});
}

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
		document.write("<div id='formsContainer'><div id='switch_php_board'><a href='https://wm.mvs.ds.usace.army.mil/web_apps/board/public/board.php?display_type=FloodStage&display_tributary=False'>Switch to PHP Board</a></div></div>");
	} else {
		document.write("<div id='switch_php_board'><a href='https://wm.mvs.ds.usace.army.mil/web_apps/board/public/board.php?display_type=LWRP&display_tributary=False'>Switch to PHP Board</a></div>");
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
		document.write("<th colspan='2' rowspan='1'><a href='board_cda.html?display_type=FloodStage&display_tributary=False&dev=True'>Switch to FloodStage</a></th>");
	} else if (display_type == "FloodStage") {
		document.write("<th colspan='2' rowspan='1'><a href='board_cda.html?display_type=LWRP&display_tributary=False&dev=True'>Switch to LWRP</a></th>");
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
		document.write("<div class='Flood_Stage_Switch_Tributary'><a href='board_cda.html?display_type=FloodStage&display_tributary=True&dev=True'>Switch to FloodStage</a></div>");
		document.write("</table>");
	} else if (display_type == "FloodStage") {
		document.write("<table id='board_cda'>");
		document.write("<div class='Last_Modified_Tributary'>Last Modified:&nbsp;&nbsp" + currentDateTime + "</div>");
		document.write("<div class='Last_Modified_Tributary'><a href='https://wm.mvs.ds.usace.army.mil/web_apps/board/public/board.php?display_type=FloodStage&display_tributary=True'>Switch to PHP Board</a></div>");
		document.write("<div class='Flood_Stage_Switch_Tributary'><a href='board_cda.html?display_type=LWRP&display_tributary=True&dev=True'>Switch to LWRP</a></div>");
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
async function createTable(dataArray) {
	// Create a table element
	const table = document.createElement('table');
	table.setAttribute('id', 'board_cda');

	console.log('dataArray:', dataArray);

	// Flag to track if the basin has been printed
	let hasPrintedBasin = false;

	// Get current date and time
	const currentDateTime = new Date();
	// console.log('currentDateTime:', currentDateTime);

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

		for (const data of arrayElement.gages) {
			const currentDateTime = new Date();
			const subtractedDateTime = subtractHoursFromDate(currentDateTime, 2);
			// console.log('currentDateTime:', currentDateTime);
			// console.log('subtractedDateTime :', subtractedDateTime);

			// GET GAGEZERO
			var stageFloodLevel = data.flood['constant-value'];
			// console.log("stageFloodLevel = ", stageFloodLevel);
			// console.log("stageFloodLevel =", typeof stageFloodLevel);

			if (data.ngvd29) {
				var stage29GageZero = data.ngvd29['constant-value'];
				// console.log("stage29GageZero = ", stage29GageZero);
				// console.log("stage29GageZero =", typeof stage29GageZero);
			}

			var elevation = data.metadata['elevation'];
			// console.log("elevation = ", elevation);
			// console.log("elevation =", typeof elevation);

			var stage29FloodLevel = stageFloodLevel + stage29GageZero;
			// console.log("stage29FloodLevel = ", stage29FloodLevel);
			// console.log("stage29FloodLevel =", typeof stage29FloodLevel);

			var elevFloodLevel = elevation + stageFloodLevel;
			// console.log("elevFloodLevel = ", elevFloodLevel);
			// console.log("elevFloodLevel =", typeof elevFloodLevel);

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

			if (data.lwrp) {
				var lwrpLevel = data.lwrp['constant-value'];
				// console.log("lwrpLevel = ", lwrpLevel);
			}

			if (data.bankfull) {
				var bankfullLevel = data.bankfull['constant-value'];
				// console.log("bankfullLevel = ", bankfullLevel);
			}


			//==============================================================================================================================================
			// RIVER
			//==============================================================================================================================================
			if (data.display_board === "True" && display_type !== "Lake") {
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

					// Check if the 'river_mile_hard_coded' property in data is a valid number
					if (!isNaN(parseFloat(data.river_mile_hard_coded)) && Number.isInteger(parseFloat(data.river_mile_hard_coded))) {
						data.river_mile_hard_coded = data.river_mile_hard_coded + '.0';
					}

					// Update the inner HTML of the cell with data, preserving HTML
					riverMileCellInnerHTML = "<span class='hard_coded'>" + parseFloat(data.river_mile_hard_coded).toFixed(1) + "</span>";
					// console.log("riverMileCellInnerHTML =", riverMileCellInnerHTML);
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
					publicNameCellInnerHTML = "<span title='" + data.tsid_stage_rev + "'>" + data.location_id.split('-')[0] + "</span>";
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
					if (data.location_id === "Alton-Mississippi") {
						tsidStage = data.tsid_stage_29
					} else if (data.location_id === "Nav TW-Kaskaskia") {
						tsidStage = data.tsid_stage_rev
					} else if (data.display_stage_29 === true) {
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

						if (data.tsid_stage_nws_3_day_forecast !== null) {
							// console.log("The last two characters are not '29'");

							// Fetch the time series data from the API using the determined query string
							let urlNWS = null;
							if (cda === "public") {
								urlNWS = `https://cwms-data.usace.army.mil/cwms-data/timeseries?name=${data.tsid_stage_nws_3_day_forecast}&begin=${currentDateTimeMidNightISO}&end=${currentDateTimePlus4DaysMidNightISO}&office=MVS`;
							} else if (cda === "internal") {
								urlNWS = `https://coe-mvsuwa04mvs.mvs.usace.army.mil:8243/mvs-data/timeseries?name=${data.tsid_stage_nws_3_day_forecast}&begin=${currentDateTimeMidNightISO}&end=${currentDateTimePlus4DaysMidNightISO}&office=MVS`;
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
									const firstFirstValue = valuesWithTimeNoon[1][0];
									const firstMiddleValue = (valuesWithTimeNoon[1][1] !== null) ? (((parseFloat(valuesWithTimeNoon[1][1])).toFixed(1) < 10) & ((parseFloat(valuesWithTimeNoon[1][1])).toFixed(1) >= 0) ? (parseFloat(valuesWithTimeNoon[1][1])).toFixed(1) : (parseFloat(valuesWithTimeNoon[1][1])).toFixed(1)) : "";
									// console.log("x = ", valuesWithTimeNoon[1][0]);

									// Extract the second second middle value
									const secondFirstValue = valuesWithTimeNoon[2][0];
									const secondMiddleValue = (valuesWithTimeNoon[2][1] !== null) ? (((parseFloat(valuesWithTimeNoon[2][1])).toFixed(1) < 10) & ((parseFloat(valuesWithTimeNoon[2][1])).toFixed(1) >= 0) ? (parseFloat(valuesWithTimeNoon[2][1])).toFixed(1) : (parseFloat(valuesWithTimeNoon[2][1])).toFixed(1)) : "";

									// Extract the third second middle value
									const thirdFirstValue = valuesWithTimeNoon[3][0];
									const thirdMiddleValue = (valuesWithTimeNoon[3][1] !== null) ? (((parseFloat(valuesWithTimeNoon[3][1])).toFixed(1) < 10) & ((parseFloat(valuesWithTimeNoon[3][1])).toFixed(1) >= 0) ? (parseFloat(valuesWithTimeNoon[3][1])).toFixed(1) : (parseFloat(valuesWithTimeNoon[3][1])).toFixed(1)) : "";

									// Dertermine Flood Classes
									var floodClassDay1 = determineStageClass(firstMiddleValue, flood_level, firstFirstValue);
									// console.log("floodClassDay1:", floodClassDay1);

									var floodClassDay2 = determineStageClass(secondMiddleValue, flood_level, secondFirstValue);
									// console.log("floodClassDay2:", floodClassDay2);

									var floodClassDay3 = determineStageClass(thirdMiddleValue, flood_level, thirdFirstValue);
									// console.log("floodClassDay3:", floodClassDay3);

									if (nws3Days !== null) {
										nwsDayOneCellInnerHTML = "<span class='" + floodClassDay1 + "'>" + firstMiddleValue + "</span>";
										nwsDayTwoCellInnerHTML = "<span class='" + floodClassDay2 + "'>" + secondMiddleValue + "</span>";
										nwsDayThreeCellInnerHTML = "<span class='" + floodClassDay3 + "'>" + thirdMiddleValue + "</span>";

										// TODO: When CDA return data entry date, hide forecast if the data entry date is late.
										// Forecast Time from exported PHP Json file
										fetchAndLogNwsData(data.tsid_stage_nws_3_day_forecast, forecastTimeCell);
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
					const tsidCrest = data.tsid_crest;
					// console.log("tsidCrest = ", tsidCrest);

					// Prepare time to send to CDA
					const { currentDateTimeMidNightISO, currentDateTimePlus4DaysMidNightISO } = generateDateTimeStrings(currentDateTime, currentDateTimePlus4Days);


					if (tsidCrest !== null) {
						// Fetch the time series data from the API using the determined query string
						let urlCrest = null;
						if (cda === "public") {
							urlCrest = `https://cwms-data.usace.army.mil/cwms-data/timeseries?name=${tsidCrest}&begin=${currentDateTimeMidNightISO}&end=${currentDateTimePlus4DaysMidNightISO}&office=MVS`;
						} else if (cda === "internal") {
							urlCrest = `https://coe-mvsuwa04mvs.mvs.usace.army.mil:8243/mvs-data/timeseries?name=${tsidCrest}&begin=${currentDateTimeMidNightISO}&end=${currentDateTimePlus4DaysMidNightISO}&office=MVS`;
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
											crestCellInnerHTML = "<span class='" + floodClass + "' title='" + crest.name + ", Value = " + valueLastCrest + ", Date Time = " + timestampLastCrest + "'>" + valueLastCrest + "</span>";
										}
										crestCell.innerHTML = crestCellInnerHTML;

										if (valueLastCrest === null) {
											crestDateCellInnerHTML = "<span class='missing'>" + "-M-" + "</span>";
										} else if (valueLastCrest === undefined) {
											crestDateCellInnerHTML = "<span>" + "" + "</span>";
										} else {
											crestDateCellInnerHTML = "<span class='" + floodClass + "' title='" + crest.name + ", Value = " + valueLastCrest + ", Date Time = " + timestampLastCrest + "'>" + timestampLastCrest.substring(0, 5) + "</span>";
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
							urlTainter = `https://cwms-data.usace.army.mil/cwms-data/timeseries?name=${tsidTaint}&begin=${currentDateTimeMinus30Hours.toISOString()}&end=${currentDateTime.toISOString()}&office=MVS`;
						} else if (cda === "internal") {
							urlTainter = `https://coe-mvsuwa04mvs.mvs.usace.army.mil:8243/mvs-data/timeseries?name=${tsidTaint}&begin=${currentDateTimeMinus30Hours.toISOString()}&end=${currentDateTime.toISOString()}&office=MVS`;
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
									lDSettingCellInnerHTML += "<span class='Board_Roller' title='No Roller'>" + "-n/a-" + "</span>";
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
										plusMinusLwrp = ((valueLast - 0) - data.lwrp['constant-value']).toFixed(1);
									} else {
										plusMinusLwrp = (valueLast - data.lwrp['constant-value']).toFixed(1);
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
											plusMinusLWRPCellInnerHTML = "<span class='missing'>-</span>";
										}
									} else {
										plusMinusLWRPCellInnerHTML = "<span class='missing'>---</span>";
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

									// FLOOD CLASS
									var floodClass = determineStageClass(valueLast, flood_level, timestampLast);
									// console.log("floodClass:", floodClass);

									if (valueLast) {
										stageCellInnerHTML = "<span class='" + floodClass + "' title='" + data.name + ", Value = " + valueLast + ", Date Time = " + timestampLast + "'>"
											+ valueLast.toFixed(1)
											+ "</span>";

										stageDeltaCellInnerHTML = "<span class='last_max_value' title='" + data.name + ", Value = " + value24HoursLast + ", Date Time = " + timestamp24HoursLast + ", Delta = (" + valueLast + " - " + value24HoursLast + ") = " + delta_24 + "'>"
											+ delta_24.toFixed(2)
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

									if (valueLast !== null || valueLast !== undefined) {
										twDoCellInnerHTML = "<span>"
											+ "Tw Do: " + valueLast.toFixed(2) + " (" + delta_24.toFixed(2) + ")" + " mg/L"
											+ "</span>";
									} else {
										twDoCellInnerHTML = "<span class='missing'>" + "-M-" + "</span>"
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
											reregDoCellInnerHTML = "<span>"
												+ "DO1: " + valueLast.toFixed(2) + " (" + delta_24.toFixed(2) + ")"
												+ "</span>";
										} else {
											reregDoCellInnerHTML = "<span class='missing'>" + "-M-" + "</span>"
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

										if (valueLast !== null || valueLast !== undefined) {
											reregDoCell2InnerHTML = "<span>"
												+ "DO2: " + valueLast.toFixed(2) + " (" + delta_24.toFixed(2) + ")"
												+ "</span>";
										} else {
											reregDoCell2InnerHTML = "<span class='missing'>" + "-M-" + "</span>"
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