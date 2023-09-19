document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('excelFile').addEventListener('change', function(evt) {
        handleExcelParsing(evt)
    })

    document.getElementById('sprinkle').addEventListener('change', function(evt) {
        removeBuildingTypeOptions()
        addBuildingTypeOptions()
    })
});

// Function to parse info from the user-chosen excel file and 
// add it to the table displayed on the page
function handleExcelParsing(evt){
    var file = evt.target.files[0];
    var reader = new FileReader();
    reader.onload = function(e) {
        var jsonData = getJsonDataFromWorkbook(e)
      
        // Clear table if already displayed on page or create it if it doesn't exist
        clearOrCreateTable()

        var table = document.getElementById('myTable');

        // Add excel info to the table and display it
        fillOutTable(jsonData, table)

    };
    reader.readAsArrayBuffer(file);
}

// Get data from excel in json form
function getJsonDataFromWorkbook(e){
    var data = new Uint8Array(e.target.result);
    var workbook = XLSX.read(data, {type: 'array'});

    // Determine the correct sheet number to read from in the excel file
    var sheetNumber = getSheetNumber(workbook.SheetNames)
    var sheetName = workbook.SheetNames[sheetNumber];
    
    var jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {header:1});
    
    return jsonData
}

// Function either clears the data from a pre-existing table or creates a new table if
// it has not been added before
function clearOrCreateTable(){
    var table = document.getElementById('myTable');

    // Clear table if it already exists
    if(table !== null){
        table.innerHTML = "";
    
    // Create table if it doesn't exist
    }else{
        var body = document.getElementsByTagName('body')[0]
        var newTable = document.createElement("table")
        newTable.id = "myTable"
        newTable.classList.add("table", "table-sm", "table-bordered")
        body.appendChild(newTable)
    }
}

// Function fills out data in the table displayed on the page
function fillOutTable(jsonData, table){
    var count = 0;

    // For each row in the JSON data
    jsonData.forEach(function(rowData) {
        if(rowData[0] != undefined && rowData[0].length > 0){
                
            var row = document.createElement('tr');

            // Create column headers
            if(count == 0){
                fillOutTableHeaders(row, rowData)
          
            // Use info from filled in columns
            }else if(count > 1){
                fillOutTableData(row, rowData)
            }

            // Add the row to the table
            table.appendChild(row);
            
        }
        count++;
    })

    // Add the table to the body of the document
    document.body.appendChild(table);
}

// Function adds the selected headers from the excel file to the table
function fillOutTableHeaders(row, rowData){
    row.className = "table-info"
    for(let i = 0;i<7;i++) {
        
        var cell = document.createElement('td');
        cell.textContent = rowData[i];
            
        row.appendChild(cell);
    }
}

// Function fills adds data to the table displayed on the page
function fillOutTableData(row, rowData){
    var upoWithinLimits = true
    for(let i = 0;i<7;i++) {
        
        var cell = document.createElement('td');
           
        // For column on permitted upo
        if(i == 5){
            isBuildingSprinklered = document.getElementById('sprinkle').value === 'Sprinklered'
            buildingType = document.getElementById('buildingType').value
            allowableOpening = getAllowableUnprotectedOpeningPercentage(rowData[1], rowData[3], rowData[2], isBuildingSprinklered, buildingType)
                            
            if(rowData[6] != undefined && (rowData[6] * 100).toFixed(2) > allowableOpening){
                upoWithinLimits = false
            }
            cell.textContent = allowableOpening
        
        // For column on proposed upo
        }else if(i == 6){
            if(rowData[6] != undefined){
                cell.textContent = (rowData[6] * 100).toFixed(2)
            }else{
                cell.textContent = " "
            }
        }else{
            cell.textContent = rowData[i];
        }

        changeUpoCellColourInTable(i,upoWithinLimits, cell)
                               
        // Add the cell to the row
        row.appendChild(cell);
    }
}

// Function to change cell colour to green or red depending on if predicted upo is within the allowed limits
function changeUpoCellColourInTable(column, upoWithinLimits, cell){
     // Change cell colour to green or red depending on if predicted upo is within the allowed limits
     if(column >= 5 && !upoWithinLimits){
        cell.className = "bg-danger"
    }else if(column >= 5){
        cell.className = "bg-success"
    }
}

// Function removes all options from select dropdown for 
// building type
function removeBuildingTypeOptions(){
    var buildingTypeSelect = document.getElementById('buildingType')

    while (buildingTypeSelect.options.length > 0) {
        buildingTypeSelect.remove(0);
    }
}

// Function adds options from select dropdown for 
// building type
function addBuildingTypeOptions(){
    var sprinkleredSelect = document.getElementById('sprinkle')
    var buildingTypeSelect = document.getElementById('buildingType')
    var isSprinklered = sprinkleredSelect.value
    buildingTypeSelect.add(new Option('A','A'), undefined)
    
    // Include Building Type B if it is a sprinklered building
    if(isSprinklered === 'Sprinklered'){
        buildingTypeSelect.add(new Option('B','B'), undefined)
    }

    buildingTypeSelect.add(new Option('C','C'), undefined)
    buildingTypeSelect.add(new Option('D','D'), undefined)
    buildingTypeSelect.add(new Option('E','E'), undefined)
    buildingTypeSelect.add(new Option('F1','F1'), undefined)
    buildingTypeSelect.add(new Option('F2','F2'), undefined)
    buildingTypeSelect.add(new Option('F3','F3'), undefined)
}

// Function to retrieve the index of the sheet in the excel that is for UPO Calculations - Part 9
function getSheetNumber(listOfSheetNumbers){
    for(let i = 0;i<listOfSheetNumbers.length;i++){
        if(listOfSheetNumbers[i].startsWith("UPO Calculations - Part 3")){
            return i
        }
    }
    return 0
}


// Function takes in area value and determines the corresponding max value 
// that is listed in the chart
function determineMaxArea(areaValue, isBuildingSprinklered, buildingType){
    if(isBuildingSprinklered){
        if((buildingType === 'A' || buildingType === 'B' || buildingType === 'C' || buildingType === 'D' || buildingType === 'F3') && 
        areaValue >= 150){
            return 150
        }

        if((buildingType === 'E' || buildingType === 'F1' || buildingType === 'F2') && areaValue >= 200){
            return 200
        }
    }

    var areaValues = [10,15,20,25,30,40,50,60,80,100,150,250,350,500,1000,2000]
    for(let i = 0;i<areaValues.length;i++){
        if(areaValue <= areaValues[i]){
            return areaValues[i]
        }
    }
}

// Function determines which ratio value to use for chart lookup of
// upo value
function determineRatioLengthHeight(ratio){
    ratioOption = 0
    if(ratio < 3){
        ratioOption =  1 
    }else if(ratio >= 3 && ratio <= 10){
        ratioOption =  2
    }else{
        ratioOption = 3
    } 
    return ratioOption
}

// Function determines the correct limiting distance index to use when looking up the
// percentage in the chart 
function limitingDistanceToIndex(limDist){
    index = 0
    limDistances = [0, 1.2, 1.5, 2, 2.5, 3 ,4, 5 ,6,7,8,9,10,11,12,13,14,16,18,20,25,30,35,40,45,50,55,60, 65, 70]

    for(let i = 0;i<limDistances.length;i++){
        if(limDist <= limDistances[i]){
            index = i
            break
        }
    }

    return index
}


// Fuction retrieves the upo percentage by doing a chart lookup using the 
// inputted values
function getUpoPercentage(maxArea, ratioLengthHeight, limDistIndex, chartToUse){
    chartList = [unprotected_opening_limits_b, unprotected_opening_limits_c, unprotected_opening_limits_d, unprotected_opening_limits_e]
    openingLimitsList = chartList[chartToUse][maxArea][ratioLengthHeight]
    if(limDistIndex >= openingLimitsList.length){
        percentage = 100
    }else{
        percentage = openingLimitsList[limDistIndex]
    }
    return percentage
}

// Function determines which of the 4 charts to use based on 
// whether the building is sprinklered and the building type
function determineWhichChartToUse(isBuildingSprinklered, buildingType){
    var chartToUse = -1
    if(!isBuildingSprinklered){
        if(buildingType === 'A' || buildingType === 'C' || buildingType === 'D' || buildingType === 'F3'){
            chartToUse = 0
        }else{
            chartToUse = 1
        }
    }else{
        if(buildingType === 'A' || buildingType === 'B' || buildingType === 'C' || buildingType === 'D' || buildingType === 'F3'){
            chartToUse = 2
        }else{
            chartToUse = 3
        }
    }
    return chartToUse
}


// Function determines the correct chart indices to use for 
// upo percentage lookup and then returns the correct upo value
function getAllowableUnprotectedOpeningPercentage(area, lhRatio, limitingDistance, isBuildingSprinklered, buildingType){
    maxArea = determineMaxArea(area, isBuildingSprinklered, buildingType)
    ratioLengthHeight = 1
    if(!isBuildingSprinklered){
        ratioLengthHeight = determineRatioLengthHeight(lhRatio)
    }
    limitDistanceIndex = limitingDistanceToIndex(limitingDistance)
    chartToUse = determineWhichChartToUse(isBuildingSprinklered, buildingType)
    openingPercentage = getUpoPercentage(maxArea, ratioLengthHeight, limitDistanceIndex, chartToUse)
    return openingPercentage
}

  