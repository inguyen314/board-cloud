function clearCookie(cookieName) {
    document.cookie = cookieName + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

// Call the function to clear a specific cookie when the page is loaded
window.onload = function () {
    clearCookie("PHPSESSID");
};
//===============================================
// ============== DATE TIME =====================
//===============================================
function subtractHoursFromDate(date, hoursToSubtract) {
    return new Date(date.getTime() - (hoursToSubtract * 60 * 60 * 1000));
}

//===============================================
// ============== JSON DATA =====================
//===============================================
function mergeData(basinData, metaData) {
    // Flatten the metaData array
    const flatMetaData = metaData.flat();

    // Create a map from location_id to the corresponding data from metaData
    const metaDataMap = new Map(flatMetaData.map(data => [data.location_id, data]));

    // Iterate over each basin
    basinData.forEach(basin => {
        // Iterate over each gage in the basin
        basin.gages.forEach(gage => {
            // Find corresponding data from metaDataMap using location_id
            const correspondingData = metaDataMap.get(gage.location_id);

            // If corresponding data exists, merge it with the gage data
            if (correspondingData) {
                Object.assign(gage, correspondingData);
            }
        });
    });

    return basinData;
}

function filterBasin(gageControlData, basin) {
    // Filter entries to include only those in the basin array
    const filteredData = gageControlData.filter(entry => basin.includes(entry.basin));

    // Sort the filtered data based on the order of the basin array
    filteredData.sort((a, b) => basin.indexOf(a.basin) - basin.indexOf(b.basin));

    return filteredData;
}

function filterByLocationId(gageControlData, locationIds) {
    // Create a map of locationIds for quick lookup of index
    const locationIdOrderMap = new Map(locationIds.map((id, index) => [id, index]));

    // Filter and sort gages within each basin based on the locationIds array
    const filteredData = gageControlData.map(basinData => {
        const filteredGages = basinData.gages
            .filter(gage => locationIds.includes(gage.location_id))
            .sort((a, b) => locationIdOrderMap.get(a.location_id) - locationIdOrderMap.get(b.location_id));

        return {
            ...basinData,
            gages: filteredGages
        };
    }).filter(basinData => basinData.gages.length > 0); // Remove any basins without gages after filtering

    // Sort the basins data based on the first gage's location_id order
    filteredData.sort((a, b) => locationIdOrderMap.get(a.gages[0].location_id) - locationIdOrderMap.get(b.gages[0].location_id));

    return filteredData;
}

function convertJsonFormat(input) {
    return input.flatMap(basin => basin.gages);
}

// Function to filter gageControlData
function filterBasin(gageControlData) {
    return gageControlData.filter(entry => entry.basin === basin);
}

// Function to filter gageControlData based on basin array and keep the same order
function filterBasins(gageControlData, basin) {
    // Filter the gageControlData to include only the entries with basins in the basin array
    const filteredData = gageControlData.filter(entry => basin.includes(entry.basin));

    // Sort the filtered data according to the order of basins in the basin array
    return filteredData.sort((a, b) => {
        return basin.indexOf(a.basin) - basin.indexOf(b.basin);
    });
}

function filterGagesByLocationIdWithBasin(gageControlData, locationIds) {
    // Create a map to associate location_id with its corresponding basin data
    const basinMap = new Map();
    gageControlData.forEach(basinData => {
        basinData.gages.forEach(gage => {
            basinMap.set(gage.location_id, basinData);
        });
    });

    // Filter and group gages by their basin
    const filteredBasinData = gageControlData.map(basinData => {
        // Filter gages by location_id
        const filteredGages = basinData.gages.filter(gage => locationIds.includes(gage.location_id));

        // Return the basinData with filtered gages
        if (filteredGages.length > 0) {
            return {
                basin: basinData.basin,
                gages: filteredGages
            };
        } else {
            return null; // Exclude empty basin data
        }
    }).filter(basin => basin !== null); // Remove null entries

    // Flatten the filtered gages and sort according to location_ids
    const allFilteredGages = filteredBasinData.flatMap(basinData => basinData.gages);
    const sortedGages = allFilteredGages.sort((a, b) => {
        return locationIds.indexOf(a.location_id) - locationIds.indexOf(b.location_id);
    });

    // Rebuild the structure to match the original format
    const finalResult = [];
    filteredBasinData.forEach(basinData => {
        const basinGages = sortedGages.filter(gage => basinData.gages.some(basinGage => basinGage.location_id === gage.location_id));
        if (basinGages.length > 0) {
            finalResult.push({
                basin: basinData.basin,
                gages: basinGages
            });
        }
    });

    // Define custom order for basins
    const basinOrder = ["Kaskaskia", "Big Muddy", "St Francis", "Salt"];

    // Sort finalResult based on the custom order
    finalResult.sort((a, b) => {
        const indexA = basinOrder.indexOf(a.basin);
        const indexB = basinOrder.indexOf(b.basin);
        // Handle cases where a basin is not in the defined order
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
    });

    return finalResult;
}

// Function to fetch R output for lake table
async function fetchDataFromROutput() {
    let urlR = null;
    if (cda === "public") {
        urlR = '../../../php_data_api/public/json/outputR.json';
    } else if (cda === "internal") {
        urlR = 'https://wm.mvs.ds.usace.army.mil/web_apps/board/public/outputR.json';
    } else {

    }
    console.log("urlR: ", urlR);

    try {
        const response = await fetch(urlR);
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

// Function to filter ROutput data by location_id
function filterDataByLocationId(ROutput, location_id) {
    const filteredData = {};

    for (const key in ROutput) {
        if (ROutput.hasOwnProperty(key) && key === location_id) {
            filteredData[key] = ROutput[key];
            break; // Since location_id should be unique, we can break early
        }
    }

    return filteredData;
}

// Function to update the HTML element with filtered data
function updateOutflowHTML(filteredData, midnightCell, bankfullLevel) {
    const locationData = filteredData[Object.keys(filteredData)[0]]; // Get the first (and only) key's data
    const midnight = locationData.outflow_midnight;
    const evening = locationData.outflow_evening;

    // Check if midnight or evening exceeds or equals bankfullLevel, apply gradual red style if so
    const midnightStyle = midnight >= bankfullLevel ? 'color: red; transition: color 5s ease-in;' : '';
    const eveningStyle = evening >= bankfullLevel ? 'color: red; transition: color 5s ease-in;' : '';

    midnightCell.innerHTML = `
        <span title="Uses PHP Json Output, No Cloud Option to Access Custom Schema Yet" 
              class="hard_coded_php" 
              style="float: left; padding-left: 30px; ${midnightStyle}">
            ${midnight}
        </span>
        <span title="Uses PHP Json Output, No Cloud Option to Access Custom Schema Yet" 
              class="hard_coded_php" 
              style="float: right; padding-right: 30px; ${eveningStyle}">
            ${evening}
        </span>`;
}

// Function to update the HTML element with filtered data
function updateRuleCurveHTML(filteredData, seasonalRuleCurveCell) {
    const locationData = filteredData[Object.keys(filteredData)[0]]; // Get the first (and only) key's data
    seasonalRuleCurveCell.innerHTML = `<div class="hard_coded_php" title="Uses PHP Json Output, No Cloud Option to Access Custom Schema Yet">${(parseFloat(locationData.rule_curve)).toFixed(2)}</div>`;
}

// Function to update the HTML element with filtered data
function updateSchdHTML(filteredData, schdCell) {
    const locationData = filteredData[Object.keys(filteredData)[0]]; // Get the first (and only) key's data
    schdCell.innerHTML = `Schedule: <div style="color: lightgray;" class="hard_coded_php" title="Uses PHP Json Output, No Cloud Option to Access Custom Schema Yet">${((locationData.schd))}</div>`;
}

// Function to update the HTML element with filtered data
function updateNoteHTML(filteredData, noteCell) {
    const locationData = filteredData[Object.keys(filteredData)[0]]; // Get the first (and only) key's data
    if (locationData.note) {
        noteCell.innerHTML = `Note: <div class="hard_coded_php" title="Uses PHP Json Output, No Cloud Option to Access Custom Schema Yet">${((locationData.note))}</div>`;
    } else {
        noteCell.innerHTML = `Note: <div class="hard_coded_php" title="Uses PHP Json Output, No Cloud Option to Access Custom Schema Yet"></div>`;
    }
}

// Function to update the HTML element with filtered data
function updateCrestHTML2(filteredData, crestCell) {
    const locationData = filteredData[Object.keys(filteredData)[0]]; // Get the first (and only) key's data
    if (locationData.crest) {
        // Parse crest as a float and format it to 1 decimal place
        const crestValue = parseFloat(locationData.crest).toFixed(1);
        // Extract only the date part from crest_date_time
        const crestDate = locationData.crest_date_time ? locationData.crest_date_time.split(' ')[0] : '';
        const crestOption = locationData.option;
        crestCell.innerHTML = `Crest: <div style="color: lightgray;" class="hard_coded_php" title="Uses PHP Json Output, No Cloud Option to Access Custom Schema Yet!">${crestOption} ${crestValue} | ${crestDate}</div>`;
    } else {
        crestCell.innerHTML = `Crest: <div style="color: lightgray;" class="hard_coded_php" title="Uses PHP Json Output, No Cloud Option to Access Custom Schema Yet!"></div>`;
    }
}

//=========================================================
// ============== FORM SAVE JSON DATA =====================
//=========================================================
function submitSelectedForm() {
    // Array to store values from all forms
    var formValues = [];

    // Loop through each form with the class 'myForm'
    document.querySelectorAll('.myForm').forEach(function (form) {
        // Get the selected option from the dropdown in the form
        var selectedOption = form.querySelector('select').value;

        // Add the form's ID and the selected option to the array
        formValues.push({
            formId: form.id,             // Store the form ID
            selectedOption: selectedOption // Store the selected option value
        });
    });

    // Log the collected form values to the console for debugging
    console.log('formValues:', formValues);

    // Create a new XMLHttpRequest to send data to the server
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'submit.php', true); // Initialize a POST request to 'submit.php'
    xhr.setRequestHeader('Content-Type', 'application/json'); // Set the content type to JSON

    // Define a callback function to handle the server's response
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) { // Check if the request is complete
            if (xhr.status === 200) { // Check if the response status is OK
                // Show a popup indicating the form data was submitted successfully
                alert('Form data submitted successfully!');
            } else {
                // Show a popup indicating there was an error submitting the form data
                alert('Failed to submit form data. Please try again.');
            }
        }
    };

    // Send the form values as a JSON string to the server
    xhr.send(JSON.stringify(formValues));
}

function useJsonDataCreateForm() {
    // You can use jsonData in other parts of your code
    if (jsonData && Array.isArray(jsonData) && jsonData.length >= 1) {
        var form1 = jsonData[0].selectedOption;
        var form2 = jsonData[1].selectedOption;
        var form3 = jsonData[2].selectedOption;
        // console.log('Using jsonData Create Form1:', form1);
        // console.log('Using jsonData Create Form2:', form2);
        // console.log('Using jsonData Create Form3:', form3);

        // Use form1 to conditionally generate the form
        if (parseFloat(form1) === 24) {
            createForm(24, 1); // Pass form number as 1
        } else if (parseFloat(form1) === 48) {
            createForm(48, 1); // Pass form number as 1
        } else if (parseFloat(form1) === 72) {
            createForm(72, 1); // Pass form number as 1
        } else {
            createForm(0, 1); // Default form creation with form number as 1
        }

        // Use form2 to conditionally generate the second form
        if (parseFloat(form2) === 24) {
            createForm(24, 2); // Pass form number as 2
        } else if (parseFloat(form2) === 48) {
            createForm(48, 2); // Pass form number as 2
        } else if (parseFloat(form2) === 72) {
            createForm(72, 2); // Pass form number as 2
        } else {
            createForm(0, 2); // Default form creation with form number as 2
        }

        // Use form3 to conditionally generate the third form
        if (parseFloat(form3) === 24) {
            createForm(24, 3); // Pass form number as 3
        } else if (parseFloat(form3) === 48) {
            createForm(48, 3); // Pass form number as 3
        } else if (parseFloat(form3) === 72) {
            createForm(72, 3); // Pass form number as 3
        } else {
            createForm(0, 3); // Default form creation with form number as 3
        }

        // Create a common submit button
        var commonSubmitButton = document.createElement('button');
        commonSubmitButton.type = 'button'; // Set the type to 'button'
        commonSubmitButton.textContent = 'Submit Forms';

        // Add click event listener to the common submit button
        commonSubmitButton.addEventListener('click', submitAllForms);

        // Append the common submit button to the formsContainer div
        var formsContainer = document.getElementById('formsContainer');
        formsContainer.appendChild(commonSubmitButton);

        return [form1, form2, form3];
    } else {
        console.error('jsonData is not in the expected format for useJsonDataCreateForm');
        return null;
    }
}

function createForm(selectedOption, formNumber) {
    // console.log('createForm:', 'Created Form' + formNumber, selectedOption);

    var form = document.createElement('form');
    form.id = 'form' + formNumber; // Set a unique ID for each form
    form.className = 'myForm';

    var label = document.createElement('label');
    label.setAttribute('for', 'options' + formNumber);
    // Customize label text based on formNumber
    if (formNumber === 1) {
        label.textContent = 'NCRFC';
    } else if (formNumber === 2) {
        label.textContent = 'MBRFC';
    } else if (formNumber === 3) {
        label.textContent = 'LMRFC';
    } else {
        label.textContent = 'DefaultLabel';
    }

    var select = document.createElement('select');
    select.id = 'options' + formNumber;
    select.name = 'options';

    // Options for the select element
    var options = [24, 48, 72];

    options.forEach(optionValue => {
        var option = document.createElement('option');
        option.value = optionValue;
        option.textContent = optionValue + ' Hours';

        // Set the selected attribute based on the condition
        if (optionValue === selectedOption) {
            option.selected = true;
        }

        select.appendChild(option);
    });

    // Set the value of the select element to the selected option
    select.value = selectedOption;

    // Append elements to the form
    form.appendChild(label);
    form.appendChild(select);

    // Append the form to the formsContainer div
    var formsContainer = document.getElementById('formsContainer');
    formsContainer.appendChild(form);
}

function submitAllForms() {
    // Create an array to store form data
    var formDataArray = [];

    // Loop through each form
    for (var i = 1; i <= 3; i++) {
        var formNumber = i;
        var selectedOption = document.getElementById('options' + formNumber).value;

        // Create an object with form data
        var formData = {
            formNumber: formNumber,
            selectedOption: selectedOption
        };

        // Add the form data to the array
        formDataArray.push(formData);
    }

    // Convert the array to JSON
    var jsonDataToSave = JSON.stringify(formDataArray);

    // Send the JSON data to the server using fetch
    fetch('submit.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: jsonDataToSave,
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                console.log('Data saved successfully on the server');
                // Optionally, reset the forms or perform other actions after successful submission

                // Show a popup message for success
                alert('Data saved successfully on the server to form_values.json');
            } else {
                console.error('Error:', data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

//=========================================
// ============== CDA =====================
//=========================================
// Function to merge basinData with additional data
function mergeDataCda(basinData,
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
    combinedFourthteenthData) {
    // Clear allData before merging data
    allData = [];

    // Iterate through each basin in basinData
    basinData.forEach(basin => {
        // Iterate through each gage in the current basin's gages
        basin.gages.forEach(gage => {
            const locationId = gage.location_id;

            // Find the corresponding firstData object
            const firstData = combinedFirstData.find(data => data["name"] === locationId);
            if (firstData) {
                // Append the firstData properties to the gage object
                gage.metadata = firstData;
            }

            // Find the corresponding secondData object
            if (Array.isArray(combinedSecondData)) {
                const secondData = combinedSecondData.find(data => data && data['location-level-id'].split('.')[0] === locationId);
                if (secondData) {
                    // Append the fifthData properties to the gage object
                    gage.flood = secondData;
                } else {
                    gage.flood = null;
                }
            } else {
                gage.flood = null;
            }

            // Find the corresponding thirdData object
            if (Array.isArray(combinedThirdData)) {
                const thirdData = combinedThirdData.find(data => data && data['location-id'] === locationId);
                if (thirdData) {
                    // Append the thirdData properties to the gage object
                    gage.basin = thirdData;
                } else {
                    gage.basin = null;
                }
            } else {
                gage.basin = null;
            }

            // Find the corresponding forthData object
            if (Array.isArray(combinedForthData)) {
                const forthData = combinedForthData.find(data => data && data['location-id'] === locationId);
                if (forthData) {
                    // Append the forthData properties to the gage object
                    gage.owner = forthData;
                } else {
                    gage.owner = null;
                }
            } else {
                gage.owner = null;
            }

            // Find the corresponding secondData object
            if (Array.isArray(combinedFifthData)) {
                const fifthData = combinedFifthData.find(data => data && data['location-level-id'].split('.')[0] === locationId);
                if (fifthData) {
                    // Append the fifthData properties to the gage object
                    gage.recordstage = fifthData;
                } else {
                    gage.recordstage = null;
                }
            } else {
                gage.recordstage = null;
            }

            // Find the corresponding sixthData object
            if (Array.isArray(combinedSixthData)) {
                const sixthData = combinedSixthData.find(data => data && data['location-level-id'].split('.')[0] === locationId);
                if (sixthData) {
                    // Append the sixthData properties to the gage object
                    gage.ngvd29 = sixthData;
                } else {
                    gage.ngvd29 = null;
                }
            } else {
                gage.ngvd29 = null;
            }

            // Find the corresponding seventhData object
            if (Array.isArray(combinedSeventhData)) {
                const seventhData = combinedSeventhData.find(data => data && data['location-level-id'].split('.')[0] === locationId);
                if (seventhData) {
                    // Append the fifthData properties to the gage object
                    gage.phase1 = seventhData;
                } else {
                    gage.phase1 = null;
                }
            } else {
                gage.phase1 = null;
            }

            // Find the corresponding eighthData object
            if (Array.isArray(combinedEighthData)) {
                const eighthData = combinedEighthData.find(data => data && data['location-level-id'].split('.')[0] === locationId);
                if (eighthData) {
                    // Append the fifthData properties to the gage object
                    gage.phase2 = eighthData;
                } else {
                    gage.phase2 = null;
                }
            } else {
                gage.phase2 = null;
            }

            // Find the corresponding ninethData object
            if (Array.isArray(combinedNinethData)) {
                const ninethData = combinedNinethData.find(data => data && data['location-level-id'].split('.')[0] === locationId);
                if (ninethData) {
                    // Append the fifthData properties to the gage object
                    gage.lwrp = ninethData;
                } else {
                    gage.lwrp = null;
                }
            } else {
                gage.lwrp = null;
            }

            // Find the corresponding tenthData object
            if (Array.isArray(combinedTenthData)) {
                const tenthData = combinedTenthData.find(data => data && data['location-level-id'].split('.')[0] === locationId.split('-')[0]);
                if (tenthData) {
                    // Append the fifthData properties to the gage object
                    gage.tof = tenthData;
                } else {
                    gage.tof = null;
                }
            } else {
                gage.tof = null;
            }

            // Find the corresponding eleventhData object
            if (Array.isArray(combinedEleventhData)) {
                const eleventhData = combinedEleventhData.find(data => data && data['location-level-id'].split('.')[0] === locationId.split('-')[0]);
                if (eleventhData) {
                    // Append the fifthData properties to the gage object
                    gage.bof = eleventhData;
                } else {
                    gage.bof = null;
                }
            } else {
                gage.bof = null;
            }

            // Find the corresponding twelfthData object
            if (Array.isArray(combinedTwelfthData)) {
                const twelfthData = combinedTwelfthData.find(data => data && data['location-level-id'].split('.')[0] === locationId.split('-')[0]);
                if (twelfthData) {
                    // Append the fifthData properties to the gage object
                    gage.boc = twelfthData;
                } else {
                    gage.boc = null;
                }
            } else {
                gage.boc = null;
            }

            // Find the corresponding thirteenthData object
            if (Array.isArray(combinedThirteenthData)) {
                const thirteenthData = combinedThirteenthData.find(data => data && data['location-level-id'].split('.')[0] === locationId.split('-')[0]);
                if (thirteenthData) {
                    // Append the fifthData properties to the gage object
                    gage.toc = thirteenthData;
                } else {
                    gage.toc = null;
                }
            } else {
                gage.toc = null;
            }

            // Find the corresponding fourthteenthData object
            if (Array.isArray(combinedFourthteenthData)) {
                const fourthteenthData = combinedFourthteenthData.find(data => data && data['location-level-id'].split('.')[0] === locationId.split('-')[0]);
                if (fourthteenthData) {
                    // Append the fourthteenthData properties to the gage object
                    gage.bankfull = fourthteenthData;
                } else {
                    gage.bankfull = null;
                }
            } else {
                gage.bankfull = null;
            }
        })
    });

    // Push the updated basinData to allData
    allData = basinData;
}

// Function to get current data time
function subtractHoursFromDate(date, hoursToSubtract) {
    return new Date(date.getTime() - (hoursToSubtract * 60 * 60 * 1000));
}

// Function to get the first non-null value from values array
function getFirstNonNullValue(data) {
    // Iterate over the values array
    for (let i = 0; i < data.values.length; i++) {
        // Check if the value at index i is not null
        if (data.values[i][1] !== null) {
            // Return the non-null value as separate variables
            return {
                timestamp: data.values[i][0],
                value: data.values[i][1],
                qualityCode: data.values[i][2]
            };
        }
    }
    // If no non-null value is found, return null
    return null;
}

// Function to get the last non null value from values array
function getLastNonNullValue(data) {
    // Iterate over the values array in reverse
    for (let i = data.values.length - 1; i >= 0; i--) {
        // Check if the value at index i is not null
        if (data.values[i][1] !== null) {
            // Return the non-null value as separate variables
            return {
                timestamp: data.values[i][0],
                value: data.values[i][1],
                qualityCode: data.values[i][2]
            };
        }
    }
    // If no non-null value is found, return null
    return null;
}

// Find time series value at 24 hours ago
function getLastNonNull24HoursValue(data, c_count) {
    let nonNullCount = 0;
    for (let i = data.values.length - 1; i >= 0; i--) {
        if (data.values[i][1] !== null) {
            nonNullCount++;
            if (nonNullCount > c_count) {
                return {
                    timestamp: data.values[i][0],
                    value: data.values[i][1],
                    qualityCode: data.values[i][2]
                };
            }
        }
    }
    return null;
}

// Function to convert timestamp to specified format
function formatNWSDate(timestamp) {
    const date = new Date(timestamp);
    const mm = String(date.getMonth() + 1).padStart(2, '0'); // Month
    const dd = String(date.getDate()).padStart(2, '0'); // Day
    const yyyy = date.getFullYear(); // Year
    const hh = String(date.getHours()).padStart(2, '0'); // Hours
    const min = String(date.getMinutes()).padStart(2, '0'); // Minutes
    return `${mm}-${dd}-${yyyy} ${hh}:${min}`;
}

// Function to find the c_count for each interval id
function calculateCCount(tsid) {
    // Split the string at the period
    const splitString = tsid.split('.');

    // Access the fifth element
    const forthElement = splitString[3];
    // console.log("forthElement = ", forthElement);

    // Initialize c_count variable
    let c_count;

    // Set c_count based on the value of firstTwoCharacters
    switch (forthElement) {
        case "15Minutes":
            c_count = 96;
            break;
        case "10Minutes":
            c_count = 144;
            break;
        case "30Minutes":
            c_count = 48;
            break;
        case "1Hour":
            c_count = 24;
            break;
        case "6Hours":
            c_count = 4;
            break;
        case "~2Hours":
            c_count = 12;
            break;
        case "5Minutes":
            c_count = 288;
            break;
        case "~1Day":
            c_count = 1;
            break;
        default:
            // Default value if forthElement doesn't match any case
            c_count = 0;
    }

    return c_count;
}

// Function to convert cda date time to mm-dd-yyyy 24hh:mi
function formatTimestampToString(timestampLast) {
    const date = new Date(timestampLast);
    const formattedDate = `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}-${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    return formattedDate;
}

// Convert date time object to ISO format for CDA
function generateDateTimeStrings(currentDateTime, currentDateTimePlus4Days) {
    // Convert current date and time to ISO string
    const currentDateTimeISO = currentDateTime.toISOString();
    // Extract the first 10 characters from the ISO string
    const first10CharactersDateTimeISO = currentDateTimeISO.substring(0, 10);

    // Get midnight in the Central Time zone
    const midnightCentral = new Date(currentDateTime.toLocaleDateString('en-US', { timeZone: 'America/Chicago' }));
    midnightCentral.setHours(0, 0, 0, 0); // Set time to midnight

    // Convert midnight to ISO string
    const midnightCentralISO = midnightCentral.toISOString();

    // Append midnight central time to the first 10 characters of currentDateTimeISO
    const currentDateTimeMidNightISO = first10CharactersDateTimeISO + midnightCentralISO.substring(10);

    // Convert currentDateTimePlus4Days to ISO string
    const currentDateTimePlus4DaysISO = currentDateTimePlus4Days.toISOString();
    // Extract the first 10 characters from the ISO string of currentDateTimePlus4Days
    const first10CharactersDateTimePlus4DaysISO = currentDateTimePlus4DaysISO.substring(0, 10);

    // Append midnight central time to the first 10 characters of currentDateTimePlus4DaysISO
    const currentDateTimePlus4DaysMidNightISO = first10CharactersDateTimePlus4DaysISO + midnightCentralISO.substring(10);

    return {
        currentDateTimeMidNightISO,
        currentDateTimePlus4DaysMidNightISO
    };
}

// Function to extract values where time ends in "13:00"
function extractValuesWithTimeNoon(values) {
    return values.filter(entry => {
        const timestamp = new Date(entry[0]);
        const hours = timestamp.getHours();
        const minutes = timestamp.getMinutes();
        return (hours === 7 || hours === 6) && minutes === 0; // Check if time is 13:00
    });
}

/******************************************************************************
 *                               FUNCTIONS PHP JSON                           *
 ******************************************************************************/
// Function to fetch R output for lake table
async function fetchDataFromROutput() {
    let urlR = null;
    if (cda === "public") {
        urlR = '../../../php_data_api/public/json/outputR.json';
    } else if (cda === "internal") {
        urlR = 'https://wm.mvs.ds.usace.army.mil/web_apps/board/public/outputR.json';
    } else {

    }
    // console.log("urlR: ", urlR);

    try {
        const response = await fetch(urlR);
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

// Function to filter ROutput data by location_id
function filterDataByLocationId(ROutput, location_id) {
    const filteredData = {};

    for (const key in ROutput) {
        if (ROutput.hasOwnProperty(key) && key === location_id) {
            filteredData[key] = ROutput[key];
            break; // Since location_id should be unique, we can break early
        }
    }

    return filteredData;
}

// Function to fetch and log ROutput data
async function fetchAndLogFlowData(location_id, midnightCell, eveningCell, seasonalRuleCurveCell, crestCell, crestDateCell) {
    try {
        const ROutput = await fetchDataFromROutput();
        console.log('ROutput:', ROutput);

        const filteredData = filterDataByLocationId(ROutput, location_id);
        console.log("Filtered Data for", location_id + ":", filteredData);

        // Update the HTML element with filtered data
        updateFlowMidnightHTML(filteredData, midnightCell);

        // Update the HTML element with filtered data
        updateFlowEveningHTML(filteredData, eveningCell);

        // Update the HTML element with filtered data
        updateRuleCurveHTML(filteredData, seasonalRuleCurveCell);

        // Update the HTML element with filtered data
        updateCrestHTML(filteredData, crestCell);

        // Update the HTML element with filtered data
        updateCrestDateHTML(filteredData, crestDateCell);

        // Further processing of ROutput data as needed
    } catch (error) {
        // Handle errors from fetchDataFromROutput
        console.error('Failed to fetch data:', error);
    }
}

// Function to update the HTML element with filtered data
function updateFlowMidnightHTML(filteredData, midnightCell) {
    const locationData = filteredData[Object.keys(filteredData)[0]]; // Get the first (and only) key's data
    midnightCell.innerHTML = `<div class="hard_coded_php" title="Uses PHP Json Output, No Cloud Option to Access Custom Schema Yet">${locationData.outflow_midnight}</div>`;
}

// Function to update the HTML element with filtered data
function updateFlowEveningHTML(filteredData, eveningCell) {
    const locationData = filteredData[Object.keys(filteredData)[0]]; // Get the first (and only) key's data
    eveningCell.innerHTML = `<div class="hard_coded_php" title="Uses PHP Json Output, No Cloud Option to Access Custom Schema Yet">${locationData.outflow_evening}</div>`;
}

// Function to update the HTML element with filtered data
function updateRuleCurveHTML(filteredData, seasonalRuleCurveCell) {
    const locationData = filteredData[Object.keys(filteredData)[0]]; // Get the first (and only) key's data
    seasonalRuleCurveCell.innerHTML = `<div class="hard_coded_php" title="Uses PHP Json Output, No Cloud Option to Access Custom Schema Yet">${(parseFloat(locationData.rule_curve)).toFixed(2)}</div>`;
}

// Function to update the HTML element with filtered data
function updateCrestHTML(filteredData, crestCell) {
    const locationData = filteredData[Object.keys(filteredData)[0]]; // Get the first (and only) key's data
    if (locationData.crest !== 999.99) {
        crestCell.innerHTML = `<div class="hard_coded_php" title="Uses PHP Json Output, No Cloud Option to Access Custom Schema Yet">${locationData.crest}</div>`;
    } else {
        crestCell.innerHTML = `<div class="hard_coded_php" title="Uses PHP Json Output, No Cloud Option to Access Custom Schema Yet"></div>`;
    }
}

// Function to update the HTML element with filtered data
function updateCrestDateHTML(filteredData, crestDateCell) {
    const locationData = filteredData[Object.keys(filteredData)[0]]; // Get the first (and only) key's data
    if (locationData.crest !== 999.99) {
        crestDateCell.innerHTML = `<div class="hard_coded_php" title="Uses PHP Json Output, No Cloud Option to Access Custom Schema Yet">${locationData.crest_date_time}</div>`;
    } else {
        crestCell.innerHTML = `<div class="hard_coded_php" title="Uses PHP Json Output, No Cloud Option to Access Custom Schema Yet"></div>`;
    }
}

// Function to fetch exportNwsForecasts2Json.json
async function fetchDataFromNwsForecastsOutput() {
    let urlNwsForecast = null;
    if (cda === "public") {
        urlNwsForecast = '../../../php_data_api/public/json/exportNwsForecasts2Json.json';
    } else if (cda === "internal") {
        urlNwsForecast = '../../../php_data_api/public/json/exportNwsForecasts2Json.json';
    } else {

    }
    // console.log("urlNwsForecast: ", urlNwsForecast);

    try {
        const response = await fetch(urlNwsForecast);
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

// Function to filter ROutput data by tsid_stage_nws_3_day_forecast
function filterDataByTsid(NwsOutput, cwms_ts_id) {
    const filteredData = NwsOutput.filter(item => {
        return item !== null && item.cwms_ts_id_day1 === cwms_ts_id;
    });

    return filteredData;
}

// Function to fetch and log NwsOutput data
async function fetchAndLogNwsData(tsid_stage_nws_3_day_forecast, forecastTimeCell) {
    try {
        const NwsOutput = await fetchDataFromNwsForecastsOutput();
        // console.log('NwsOutput:', NwsOutput);

        const filteredData = filterDataByTsid(NwsOutput, tsid_stage_nws_3_day_forecast);
        // console.log("Filtered NwsOutput Data for", tsid_stage_nws_3_day_forecast + ":", filteredData);

        // Update the HTML element with filtered data
        updateNwsForecastTimeHTML2(filteredData, forecastTimeCell);

        // Further processing of ROutput data as needed
    } catch (error) {
        // Handle errors from fetchDataFromROutput
        console.error('Failed to fetch data:', error);
    }
}

// Function to update the HTML element with filtered data using data_entry_date_cst1 from json
function updateNwsForecastTimeHTML(filteredData, forecastTimeCell) {
    // console.log("filteredData = ", filteredData);

    const locationData = filteredData.find(item => item !== null); // Find the first non-null item
    if (!locationData) {
        forecastTimeCell.innerHTML = ''; // Handle case where no valid data is found
        return;
    }

    const entryDate = locationData.data_entry_date_cst1;

    // Parse the entry date string
    const dateParts = entryDate.split('-'); // Split by hyphen
    const day = dateParts[0]; // Day part
    // console.log("day = ", day);
    const monthAbbreviation = dateParts[1]; // Month abbreviation (e.g., JUL)
    const year = '20' + dateParts[2].substring(0, 2); // Full year (e.g., 2024)

    // Map month abbreviation to month number
    const months = {
        'JAN': '01', 'FEB': '02', 'MAR': '03', 'APR': '04',
        'MAY': '05', 'JUN': '06', 'JUL': '07', 'AUG': '08',
        'SEP': '09', 'OCT': '10', 'NOV': '11', 'DEC': '12'
    };

    const month = months[monthAbbreviation]; // Get numeric month
    // console.log("month = ", month);

    // Parse time parts
    const timeParts = entryDate.split(' ')[1].split('.'); // Split time part by period
    const hours = timeParts[0]; // Hours part
    // console.log("hours = ", hours);
    const minutes = timeParts[1]; // Minutes part

    // Determine period (AM/PM)
    const period = timeParts[3] === 'PM' ? 'PM' : 'AM';

    // Construct formatted date and time without the year
    const formattedDateTime = `${month}-${day} ${hours}:${minutes} ${period}`;

    // Parse the formatted date and time to a Date object
    const [datePart, timePart, periodPart] = formattedDateTime.split(' ');
    const [monthPart, dayPart] = datePart.split('-');
    const [hoursPart, minutesPart] = timePart.split(':');

    let hours24 = parseInt(hoursPart, 10);
    if (periodPart === 'PM' && hours24 !== 12) {
        hours24 += 12;
    } else if (periodPart === 'AM' && hours24 === 12) {
        hours24 = 0;
    }

    const entryDateTime = new Date(`${year}-${monthPart}-${dayPart}T${hours24.toString().padStart(2, '0')}:${minutesPart}:00`);
    // console.log("entryDateTime = ", entryDateTime);

    // Get the current date and time
    const now = new Date();
    // console.log('now: ', now);

    // Calculate the difference in hours
    const diffHours = (now - entryDateTime) / (1000 * 60 * 60);
    // console.log('diffHours: ', diffHours);

    // Create a new JavaScript Date object for the current date and time
    var date = new Date();
    // console.log('date: ', date);

    // Format the date in "Y-m-d H:i" format
    var currentDateTime = date.getFullYear() + '-' +
        ('0' + (date.getMonth() + 1)).slice(-2) + '-' +
        ('0' + date.getDate()).slice(-2) + ' ' +
        ('0' + date.getHours()).slice(-2) + ':' +
        ('0' + date.getMinutes()).slice(-2);

    // Output the formatted date
    // console.log('currentDateTime: ', currentDateTime);

    // Output each component
    // console.log('currentYear: ', date.getFullYear());
    // console.log('currentMonth: ', ('0' + (date.getMonth() + 1)).slice(-2));
    // console.log('currentDay: ', ('0' + date.getDate()).slice(-2));
    // console.log('currentHour: ', ('0' + date.getHours()).slice(-2));
    // console.log('currentMinute: ', ('0' + date.getMinutes()).slice(-2));

    // forecastTimeClass
    if (parseFloat(currentMonth) !== parseFloat(month)) {
        var forecastTimeClass = "--";
        // console.log("forecastTimeClass:", forecastTimeClass);
    } else {
        if (parseFloat(currentDay) === parseFloat(day)) {
            var forecastTimeClass = "NWS_today_morning_forecast";
            // console.log("forecastTimeClass:", forecastTimeClass);
        } else if ((parseFloat(currentDay) > parseFloat(day)) && (parseFloat(hours) < 12)) {
            var forecastTimeClass = "NWS_yesterday_morning_forecast";
            // console.log("forecastTimeClass:", forecastTimeClass);
        } else if ((parseFloat(currentDay) > parseFloat(day)) && (parseFloat(hours) > 12)) {
            var forecastTimeClass = "NWS_yesterday_evening_forecast";
            // console.log("forecastTimeClass:", forecastTimeClass);
        } else {
            var forecastTimeClass = "error";
            // console.log("forecastTimeClass:", forecastTimeClass);
        }
    }

    if (diffHours >= 42) {
        // forecastTimeCell.innerHTML = 'missing';
        forecastTimeCell.innerHTML = `<div class="${forecastTimeClass}" title="Forecast is more than 24 hours late">--</div>`;
    } else {
        // Update the HTML content with formatted date and time without the year
        forecastTimeCell.innerHTML = `<div class="${forecastTimeClass}" title="Uses PHP exportNwsForecasts2Json.json Output, No Cloud Option Yet">${formattedDateTime}</div>`;
    }
}

// Function to update the HTML element with filtered data using data_entry_date_day1 from json
function updateNwsForecastTimeHTML2(filteredData, forecastTimeCell) {
    // console.log("filteredData = ", filteredData);

    const locationData = filteredData.find(item => item !== null); // Find the first non-null item
    if (!locationData) {
        forecastTimeCell.innerHTML = ''; // Handle case where no valid data is found
        return;
    }

    const entryDate = locationData.data_entry_date_day1;

    // Parse the entry date and time string
    const [datePart, timePart] = entryDate.split(' '); // Split date and time by space
    const [month, day] = datePart.split('/'); // Split date by slash for MM/DD
    const [hours, minutes] = timePart.split(':'); // Split time by colon for HH:MM

    const year = new Date().getFullYear(); // Use current year since it's not provided

    // Construct the full date-time string
    const formattedDateTime = `${month}-${day} ${hours}:${minutes}`;

    // Parse the formatted date and time to a Date object
    let hours24 = parseInt(hours, 10);
    const entryDateTime = new Date(`${year}-${month}-${day}T${hours24.toString().padStart(2, '0')}:${minutes}:00`);
    // console.log("entryDateTime = ", entryDateTime);

    // Get the current date and time
    const now = new Date();
    // console.log('now: ', now);

    // Calculate the difference in hours
    const diffHours = (now - entryDateTime) / (1000 * 60 * 60);
    // console.log('diffHours: ', diffHours);

    // Get the current date components for comparison
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // Months are 0-based in JS Date
    const currentDay = now.getDate();
    const currentHour = now.getHours();

    // forecastTimeClass
    let forecastTimeClass = "--"; // Default value
    if (parseFloat(currentMonth) === parseFloat(month)) {
        if (parseFloat(currentDay) === parseFloat(day)) {
            forecastTimeClass = "NWS_today_morning_forecast";
        } else if ((parseFloat(currentDay) > parseFloat(day)) && (parseFloat(hours) < 12)) {
            forecastTimeClass = "NWS_yesterday_morning_forecast";
        } else if ((parseFloat(currentDay) > parseFloat(day)) && (parseFloat(hours) >= 12)) {
            forecastTimeClass = "NWS_yesterday_evening_forecast";
        } else {
            forecastTimeClass = "error";
        }
    }

    if (diffHours >= 42) {
        forecastTimeCell.innerHTML = `<div class="${forecastTimeClass}" title="Forecast is more than 24 hours late">--</div>`;
    } else {
        forecastTimeCell.innerHTML = `<div class="${forecastTimeClass}" title="Uses PHP exportNwsForecasts2Json.json Output, No Cloud Option Yet">${formattedDateTime}</div>`;
    }
}

/******************************************************************************
 *                               SUPPORT FUNCTIONS                            *
 ******************************************************************************/
// Function to get current data time
function subtractHoursFromDate(date, hoursToSubtract) {
    return new Date(date.getTime() - (hoursToSubtract * 60 * 60 * 1000));
}

// Function to get current data time
function plusHoursFromDate(date, hoursToSubtract) {
    return new Date(date.getTime() + (hoursToSubtract * 60 * 60 * 1000));
}

// Function to add days to a given date
function addDaysToDate(date, days) {
    return new Date(date.getTime() + (days * 24 * 60 * 60 * 1000));
}

// Function to format number with leading zero if less than 9
function formatNumberWithLeadingZero(number) {
    return number < 10 ? number.toFixed(2).padStart(5, '0') : number.toFixed(2);
}

// Function to get current date time
function formatDateTime(dateTimeString) {
    var dateParts = dateTimeString.split(" ");
    var date = dateParts[0];
    var time = dateParts[1];
    var [month, day, year] = date.split("-");
    var [hours, minutes] = time.split(":");
    return new Date(`${year}-${month}-${day}T${hours}:${minutes}:00`);
}

// Function to format date time to cst for comparison
function formatStageDateTimeCST(stage_date_time_cst) {
    console.log("stage_date_time_cst = ", stage_date_time_cst);
    var stage_date_time_cst_formatted = formatDateTime(stage_date_time_cst);
    console.log("stage_date_time_cst_formatted", stage_date_time_cst_formatted);
    return stage_date_time_cst_formatted;
}

// Function determine last max class
function determineStageClass(stage_value, flood_value, timestampLast) {
    // console.log("determineStageClass = ", stage_value + typeof(stage_value) + " " + flood_value + typeof(flood_value));

    if (timestampLast) {
        // Convert the string to a Date object
        // You may need to adjust the parsing based on the format of the string and the locale
        const [datePart, timePart] = timestampLast.split(' ');
        const [month, day, year] = datePart.split('-').map(Number);
        const [hours, minutes] = timePart.split(':').map(Number);
        const timestampLastDate = new Date(year, month - 1, day, hours, minutes);

        // Get the current date as a Date object
        const currentDate = new Date();
        // console.log("currentDate:", currentDate);
        const currentDateStageMinusTwoHours = new Date(currentDate.getTime() - (2 * 60 * 60 * 1000));
        // console.log("currentDateStageMinusTwoHours:", currentDateStageMinusTwoHours);
        const currentDateStageMinusOneDay = new Date(currentDate.getTime() - (24 * 60 * 60 * 1000));
        // console.log("currentDateStageMinusOneDay:", currentDateStageMinusOneDay);

        // Compare the two dates
        var myStageClass = null;
        if (currentDateStageMinusTwoHours > timestampLastDate) {
            // console.log('timestampLast date is late');
            if (stage_value >= flood_value) {
                // console.log("determineStageClass = ", stage_value + " >= " + flood_value);
                myStageClass = "Above_Flood_Stage_Late";
            } else {
                myStageClass = "Below_Flood_Stage_Late";
            }
        } else if (currentDateStageMinusTwoHours < timestampLastDate) {
            // console.log('timestampLast date is on time');
            if (stage_value >= flood_value) {
                // console.log("determineStageClass = ", stage_value + " >= " + flood_value);
                myStageClass = "Above_Flood_Stage_On_Time";
            } else {
                myStageClass = "Below_Flood_Stage_On_Time";
            }
        } else {
            console.log('Both dates are the same.');
        }
    }
    return myStageClass;
}

// Function determine date time class
function determineStageDateTimeClass(stage29_date_time_cst_formatted, currentDateTimeMinusHours) {
    var myStage29DateTimeClass;
    if (stage29_date_time_cst_formatted >= currentDateTimeMinusHours) {
        myStage29DateTimeClass = "date_time_current";
        // console.log("on_time = ", stage29_date_time_cst_formatted);
    } else {
        myStage29DateTimeClass = "date_time_late";
        // console.log("late = ", stage29_date_time_cst_formatted);
    }
    // console.log("myStage29DateTimeClass = ", myStage29DateTimeClass);
    return myStage29DateTimeClass;
}

function minusDaysToDate(date, days) {
    return new Date(date.getTime() - (days * 24 * 60 * 60 * 1000));
}

function fetchAndUpdateStageMidnightTd(stageTd, DeltaTd, tsidStage, flood_level, currentDateTimeIso, currentDateTimeMinus60HoursIso, setBaseUrl) {
    return new Promise((resolve, reject) => {
        if (tsidStage !== null) {
            const urlStage = `${setBaseUrl}timeseries?name=${tsidStage}&begin=${currentDateTimeMinus60HoursIso}&end=${currentDateTimeIso}&office=${office}`;

            // console.log("urlStage = ", urlStage);
            fetch(urlStage, {
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
                .then(stage => {
                    stage.values.forEach(entry => {
                        entry[0] = formatNWSDate(entry[0]);
                    });
                    // console.log("stage:", stage);

                    const c_count = calculateCCount(tsidStage);

                    const lastNonNullValue = getLastNonNullMidnightValue(stage, stage.name, c_count);
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

                    let innerHTMLStage;
                    if (valueLast === null) {
                        innerHTMLStage = "<span class='missing'>-M-</span>";
                    } else {
                        const floodClass = determineStageClass(valueLast, flood_level);
                        innerHTMLStage = `<span class='${floodClass}' title='${timestampLast}'>${valueLast}</span>`;
                    }

                    stageTd.innerHTML = innerHTMLStage;
                    DeltaTd.innerHTML = delta_24;

                    resolve({ stageTd: valueLast, deltaTd: delta_24 });

                })
                .catch(error => {
                    console.error("Error fetching or processing data:", error);
                    reject(error);
                });
        } else {
            resolve({ stageTd: null, deltaTd: null });
        }
    });
}

function fetchAndUpdateStageTd(stageTd, DeltaTd, tsidStage, flood_level, currentDateTimeIso, currentDateTimeMinus60HoursIso, setBaseUrl) {
    return new Promise((resolve, reject) => {
        if (tsidStage !== null) {
            const urlStage = `${setBaseUrl}timeseries?name=${tsidStage}&begin=${currentDateTimeMinus60HoursIso}&end=${currentDateTimeIso}&office=${office}`;

            // console.log("urlStage = ", urlStage);
            fetch(urlStage, {
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
                    data.values.forEach(entry => {
                        entry[0] = formatNWSDate(entry[0]);
                    });
                    // console.log("data:", data);

                    const c_count = calculateCCount(tsidStage);

                    const lastNonNullValue = getLastNonNullValue(data);
                    // console.log("lastNonNullValue:", lastNonNullValue);

                    let valueLast = null;
                    let timestampLast = null;

                    if (lastNonNullValue !== null) {
                        timestampLast = lastNonNullValue.timestamp;
                        valueLast = parseFloat(lastNonNullValue.value).toFixed(2);
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

                    let innerHTMLStage;
                    if (valueLast === null) {
                        innerHTMLStage = "<span class='missing'>-M-</span>";
                    } else {
                        const floodClass = determineStageClass(valueLast, flood_level);
                        innerHTMLStage = `<span class='${floodClass}' title='${data.name + " " + timestampLast}'>${valueLast}</span>`;
                    }

                    let innerHTMLDelta;
                    if (value24HoursLast === null) {
                        innerHTMLDelta = "<span class='missing'>-M-</span>";
                    } else {
                        const floodClass = determineStageClass(valueLast, flood_level);
                        innerHTMLDelta = `<span title='${data.name + " " + value24HoursLast + " " + timestamp24HoursLast}'>${delta_24}</span>`;
                    }

                    stageTd.innerHTML = innerHTMLStage;
                    DeltaTd.innerHTML = innerHTMLDelta;

                    resolve({ stageTd: valueLast, deltaTd: delta_24 });

                })
                .catch(error => {
                    console.error("Error fetching or processing data:", error);
                    reject(error);
                });
        } else {
            resolve({ stageTd: null, deltaTd: null });
        }
    });
}

function getLastNonNullMidnightValue(data, tsid, c_count) {
    if (!data || !Array.isArray(data.values)) {
        return {
            current6am: null,
            valueCountRowsBefore: null
        };
    }

    const parseTimestamp = (timestampStr) => {
        if (typeof timestampStr !== 'string') {
            // console.warn('Invalid timestampStr:', timestampStr);
            return null;
        }

        // Assumes input format: "MM-DD-YYYY HH:mm"
        const parts = timestampStr.split(' ');
        if (parts.length !== 2) return null;

        const [datePart, timePart] = parts;
        const [month, day, year] = datePart.split('-');
        if (!month || !day || !year || !timePart) return null;

        const isoString = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${timePart.padStart(5, '0')}:00Z`;
        const date = new Date(isoString);
        return isNaN(date.getTime()) ? null : date;
    };

    for (let i = data.values.length - 1; i >= 0; i--) {
        const [timestampStr, value, qualityCode] = data.values[i];
        const date = parseTimestamp(timestampStr);
        if (!date) continue;

        const adjustedHours = (date.getUTCHours() + 24) % 24;
        const minutes = date.getUTCMinutes();

        if (adjustedHours === 0 && minutes === 0 && value !== null) {
            const result = {
                current6am: {
                    tsid,
                    timestamp: timestampStr,
                    value,
                    qualityCode
                },
                valueCountRowsBefore: null
            };

            if (i - c_count >= 0) {
                const [prevTs, prevVal, prevQual] = data.values[i - c_count];
                result.valueCountRowsBefore = {
                    tsid,
                    timestamp: prevTs,
                    value: prevVal,
                    qualityCode: prevQual
                };
            }

            return result;
        }
    }

    return {
        current6am: null,
        valueCountRowsBefore: null
    };
}

async function fetchAndUpdateStorageTd(consrTd, floodTd, tsidStorage, currentDateTimeIso, currentDateTimeMinus60HoursIso, setBaseUrl, topOfConservationLevel, bottomOfConservationLevel, topOfFloodLevel, bottomOfFloodLevel) {
    if (!tsidStorage) {
        consrTd.innerHTML = "-";
        floodTd.innerHTML = "-";
        return { consrTd: null, floodTd: null };
    }

    const urlStorage = `${setBaseUrl}timeseries?name=${tsidStorage}&begin=${currentDateTimeMinus60HoursIso}&end=${currentDateTimeIso}&office=${office}`;

    try {
        const response = await fetch(urlStorage, {
            method: 'GET',
            headers: {
                "Accept": "application/json;version=2",
                "cache-control": "no-cache"
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const stage = await response.json();
        stage.values.forEach(entry => {
            entry[0] = formatNWSDate(entry[0]);
        });

        const dstOffsetHours = getDSTOffsetInHours();
        const c_count = calculateCCount(tsidStorage);
        const lastNonNullValue = getLastNonNullValue(stage);

        let valueLast = null;
        let timestampLast = null;

        if (lastNonNullValue !== null) {
            timestampLast = lastNonNullValue.timestamp;
            valueLast = parseFloat(lastNonNullValue.value).toFixed(2);
        }

        let conservationStorageValue = "%";
        if (valueLast > 0.0 && topOfConservationLevel > 0.0 && bottomOfConservationLevel >= 0.0) {
            if (valueLast < bottomOfConservationLevel) {
                conservationStorageValue = "0.00%";
            } else if (valueLast > topOfConservationLevel) {
                conservationStorageValue = "100.00%";
            } else {
                const total = ((valueLast - bottomOfConservationLevel) / (topOfConservationLevel - bottomOfConservationLevel)) * 100;
                conservationStorageValue = total.toFixed(2) + "%";
            }
        }

        let floodStorageValue = "%";
        if (valueLast > 0.0 && topOfFloodLevel > 0.0 && bottomOfFloodLevel >= 0.0) {
            if (valueLast < bottomOfFloodLevel) {
                floodStorageValue = "0.00%";
            } else if (valueLast > topOfFloodLevel) {
                floodStorageValue = "100.00%";
            } else {
                const total = ((valueLast - bottomOfFloodLevel) / (topOfFloodLevel - bottomOfFloodLevel)) * 100;
                floodStorageValue = total.toFixed(2) + "%";
            }
        }

        consrTd.innerHTML = conservationStorageValue ?? "-";
        floodTd.innerHTML = floodStorageValue ?? "-";

        return { consrTd: conservationStorageValue, floodTd: floodStorageValue };

    } catch (error) {
        console.error("Error fetching or processing data:", error);
        consrTd.innerHTML = "-";
        floodTd.innerHTML = "-";
        return { consrTd: null, floodTd: null };
    }
}

function getDSTOffsetInHours() {
    // Get the current date
    const now = new Date();

    // Get the current time zone offset in minutes (with DST, if applicable)
    const currentOffset = now.getTimezoneOffset();

    // Convert the offset from minutes to hours
    const dstOffsetHours = currentOffset / 60;

    return dstOffsetHours; // Returns the offset in hours (e.g., -5 or -6)
}

function fetchAndUpdatePrecipTd(precipTd, tsid, end, begin, setBaseUrl) {
    if (tsid !== null) {
        const urlPrecip = `${setBaseUrl}timeseries?name=${tsid}&begin=${begin}&end=${end}&office=${office}`;

        fetch(urlPrecip, {
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
                data.values.forEach(entry => {
                    entry[0] = formatNWSDate(entry[0]);
                });

                const lastNonNullPrecipValue = getLastNonNullValue(data);

                if (lastNonNullPrecipValue !== null) {
                    var timestampPrecipLast = lastNonNullPrecipValue.timestamp;
                    var valuePrecipLast = parseFloat(lastNonNullPrecipValue.value).toFixed(2);
                    var qualityCodePrecipLast = lastNonNullPrecipValue.qualityCode;
                }

                const c_count = calculateCCount(tsid);

                const lastNonNull6HoursPrecipValue = getLastNonNull6HoursValue(data, c_count);
                if (lastNonNull6HoursPrecipValue !== null) {
                    var timestampPrecip6HoursLast = lastNonNull6HoursPrecipValue.timestamp;
                    var valuePrecip6HoursLast = parseFloat(lastNonNull6HoursPrecipValue.value).toFixed(2);
                    var qualityCodePrecip6HoursLast = lastNonNull6HoursPrecipValue.qualityCode;
                }

                const lastNonNull24HoursPrecipValue = getLastNonNull24HoursValue(data, c_count);
                if (lastNonNull24HoursPrecipValue !== null) {
                    var timestampPrecip24HoursLast = lastNonNull24HoursPrecipValue.timestamp;
                    var valuePrecip24HoursLast = parseFloat(lastNonNull24HoursPrecipValue.value).toFixed(2);
                    var qualityCodePrecip24HoursLast = lastNonNull24HoursPrecipValue.qualityCode;
                }

                const precip_delta_6 = (valuePrecipLast - valuePrecip6HoursLast).toFixed(2);
                const precip_delta_24 = (valuePrecipLast - valuePrecip24HoursLast).toFixed(2);

                const formattedLastValueTimeStamp = formatTimestampToStringIOS(timestampPrecipLast);
                const timeStampDateObject = new Date(timestampPrecipLast);
                const timeStampDateObjectMinus24Hours = new Date(timestampPrecipLast - (24 * 60 * 60 * 1000));

                let innerHTMLPrecip;
                if (lastNonNullPrecipValue === null) {
                    innerHTMLPrecip = "<span class='missing'>" + "-M-" + "</span>";
                } else {
                    innerHTMLPrecip = "<span class='last_max_value' title='"+ data.name + " " + timestampPrecipLast + "'>" + valuePrecipLast + "</span>";
                }
                return precipTd.innerHTML += innerHTMLPrecip;
            })
            .catch(error => {
                console.error("Error fetching or processing data:", error);
            });
    } else {
        return precipTd.innerHTML = "";
    }
}

function getLastNonNull6HoursValue(data, c_count) {
    let nonNullCount = 0;
    for (let i = data.values.length - 1; i >= 0; i--) {
        if (data.values[i][1] !== null) {
            nonNullCount++;
            if (nonNullCount > (c_count / 4)) {
                return {
                    timestamp: data.values[i][0],
                    value: data.values[i][1],
                    qualityCode: data.values[i][2]
                };
            }
        }
    }
    return null;
}

function formatTimestampToStringIOS(timestamp) {
    if (!timestamp) return "Invalid date";

    // Split the timestamp into date and time parts
    const [datePart, timePart] = timestamp.split(" ");
    const [day, month, year] = datePart.split("-").map(Number);
    const [hours, minutes] = timePart.split(":").map(Number);

    // Create a new Date object (Month is 0-based in JS)
    const dateObj = new Date(Date.UTC(year, month - 1, day, hours, minutes));

    if (isNaN(dateObj.getTime())) return "Invalid date";

    // Format as "YYYY-MM-DD HH:mm"
    return dateObj.toISOString().replace("T", " ").slice(0, 16);
}

function fetchAndUpdateYesterdayInflowTd(precipCell, tsid, currentDateTimeMinus2Hours, currentDateTime, currentDateTimeMinus30Hours, setBaseUrl) {
    if (tsid !== null) {
        // Fetch the time series data from the API using the determined query string
        const urlPrecip = `${setBaseUrl}timeseries?name=${tsid}&begin=${currentDateTimeMinus30Hours.toISOString()}&end=${currentDateTime.toISOString()}&office=${office}`;
        // console.log("urlPrecip = ", urlPrecip);

        fetch(urlPrecip, {
            method: 'GET',
            headers: {
                "Accept": "application/json;version=2", // Ensuring the correct version is used
                "cache-control": "no-cache"
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
                // console.log("precip: ", precip);

                // Convert timestamps in the JSON object
                data.values.forEach(entry => {
                    entry[0] = formatNWSDate(entry[0]); // Update timestamp
                });

                // Get the last non-null value from the stage data
                const lastNonNullPrecipValue = getLastNonNullValue(data);
                // console.log("lastNonNullPrecipValue:", lastNonNullPrecipValue);

                // Check if a non-null value was found
                if (lastNonNullPrecipValue !== null) {
                    // Extract timestamp, value, and quality code from the last non-null value
                    var timestampPrecipLast = lastNonNullPrecipValue.timestamp;
                    var valuePrecipLast = parseFloat(lastNonNullPrecipValue.value).toFixed(0);
                    var qualityCodePrecipLast = lastNonNullPrecipValue.qualityCode;

                    // Log the extracted valueLasts
                    // console.log("timestampPrecipLast:", timestampPrecipLast);
                    // console.log("valuePrecipLast:", valuePrecipLast);
                    // console.log("qualityCodePrecipLast:", qualityCodePrecipLast);
                } else {
                    // If no non-null valueLast is found, log a message
                    // console.log("No non-null valueLast found.");
                }

                if (lastNonNullPrecipValue === null) {
                    innerHTMLPrecip = "<span class='missing' title='(The last Consensus value, previous day)'>" + "-M-" + "</span>";
                } else {
                    innerHTMLPrecip = "<span class='last_max_value' title='" + "(The last Consensus value, previous day) " + data.name + " " + timestampPrecipLast + "'>" + valuePrecipLast + "</span>";
                }
                return precipCell.innerHTML += innerHTMLPrecip;
            })
            .catch(error => {
                // Catch and log any errors that occur during fetching or processing
                console.error("Error fetching or processing data:", error);
            });
    } else {
        return precipCell.innerHTML = "";
    }
}

function fetchAndUpdateControlledOutflowTd(tsid, isoDateTodayStr, isoDatePlus1Str, setBaseUrl, flowUpperLimit) {
    return new Promise((resolve, reject) => {
        if (tsid !== null) {
            const urlForecast = `${setBaseUrl}timeseries?name=${tsid}&begin=${isoDateTodayStr}&end=${isoDatePlus1Str}&office=${office}`;

            fetch(urlForecast, {
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
                    // console.log("data: ", data);

                    if (data?.values?.length) {
                        data.values.forEach(entry => {
                            entry[0] = formatNWSDate(entry[0]);
                        });
                    }
                    resolve(data);
                })
                .catch(error => {
                    console.error("Error fetching or processing data:", error);
                    reject(error);
                });
        } else {
            resolve(null);
        }
    });
}

function fetchAndUpdateForecastTd(tsid, isoDateTodayStr, isoDatePlus1Str, isoDateTodayPlus6HoursStr, setBaseUrl) {
    return new Promise((resolve, reject) => {
        if (tsid !== null) {
            const urlForecast = `${setBaseUrl}timeseries?name=${tsid}&begin=${isoDateTodayStr}&end=${isoDatePlus1Str}&office=${office}&version-date=${isoDateTodayPlus6HoursStr}`;

            fetch(urlForecast, {
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
                    if (data?.values?.length) {
                        data.values.forEach(entry => {
                            entry[0] = formatNWSDate(entry[0]);
                        });
                    }
                    resolve(data);
                })
                .catch(error => {
                    console.error("Error fetching or processing data:", error);
                    reject(error);
                });
        } else {
            resolve(null);
        }
    });
}

function fetchAndUpdateCrestPoolForecastTd(stageTd, DeltaTd, tsidStage, currentDateTime, currentDateTimePlus7Days, setBaseUrl) {
    function getTodayAtSixCentral() {
        const today = new Date();
        const utcOffset = today.getTimezoneOffset(); // Get the difference in minutes from UTC
        const centralOffset = -6 * 60; // Central Time is UTC-6 (during daylight saving time, it will be UTC-5)

        // Adjust if Daylight Saving Time is in effect (UTC-5)
        const isDST = (utcOffset === 300); // 300 minutes = UTC-5
        const offset = isDST ? -5 : -6;

        // Create a new Date object with the time adjusted for Central Time
        const centralTime = new Date(today);
        centralTime.setHours(6, 0, 0, 0); // Set the time to 06:00:00.000
        centralTime.setMinutes(centralTime.getMinutes() - (utcOffset + (offset * 60))); // Adjust to Central Time

        // Format the date in the required format
        const year = centralTime.getUTCFullYear();
        const month = String(centralTime.getUTCMonth() + 1).padStart(2, '0');
        const day = String(centralTime.getUTCDate()).padStart(2, '0');

        return `${year}-${month}-${day}T06:00:00.000Z`;
    }

    const dateAtSixCentral = getTodayAtSixCentral();
    // console.log(dateAtSixCentral);

    return new Promise((resolve, reject) => {
        if (tsidStage !== null) {
            const url = `${setBaseUrl}timeseries?name=${tsidStage}&begin=${currentDateTime.toISOString()}&end=${currentDateTimePlus7Days.toISOString()}&office=${office}&version-date=${dateAtSixCentral}`;

            // console.log("url = ", url);
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
                    // console.log("data:", data);

                    let valueLast = '';
                    let valueLastDate = '';

                    if (
                        data &&
                        Array.isArray(data.values) &&
                        data.values.length > 0 &&
                        Array.isArray(data.values[0])
                    ) {
                        const rawStage = data.values[0][1];
                        const rawDate = data.values[0][0];

                        valueLast = isFinite(rawStage) ? Number(rawStage).toFixed(2) : '';
                        valueLastDate = rawDate ? formatNWSDate(rawDate).split(' ')[0] : '';
                    }

                    stageTd.innerHTML = valueLast;
                    DeltaTd.innerHTML = valueLastDate;

                    resolve({ stageTd: valueLast, deltaTd: valueLastDate });
                })
                .catch(error => {
                    console.error("Error fetching or processing data:", error);
                    reject(error);
                });
        } else {
            resolve({ stageTd: null, deltaTd: null });
        }
    });
}