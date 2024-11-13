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

    // Check if midnight or evening exceeds or equals bankfullLevel, apply blinking red style if so
    const midnightStyle = midnight >= bankfullLevel ? 'color: red; animation: blink 1s step-start infinite;' : '';
    const eveningStyle = evening >= bankfullLevel ? 'color: red; animation: blink 1s step-start infinite;' : '';

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

    // Define the blinking animation in CSS
    if (!document.getElementById('blinking-style')) {
        const style = document.createElement('style');
        style.id = 'blinking-style';
        style.innerHTML = `
            @keyframes blink {
                50% { opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
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