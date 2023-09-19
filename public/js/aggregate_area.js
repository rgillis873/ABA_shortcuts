document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('excelFile').addEventListener('change', function(evt) {
        handleExcelParsing(evt)
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

    document.body.appendChild(table);
}

// Function adds the selected headers from the excel file to the table
function fillOutTableHeaders(row, rowData){
    row.className = "table-info"
    
    // Add bf, area and ld headers
    for(let i = 0;i<3;i++){
        var cell = document.createElement('td')
        cell.textContent = rowData[i]   
        row.appendChild(cell)
    }

    // Add upo heading before percentage headers
    var cell = document.createElement('td')
    cell.textContent = rowData[11]   
    row.appendChild(cell)

    // Add percentage headers
    for(let j = 3;j<5;j++){
        var cell = document.createElement('td')
        cell.textContent = rowData[j]   
        row.appendChild(cell)
    }
}

// Function fills adds data to the table displayed on the page
function fillOutTableData(row, rowData){
    var upoWithinLimits = true

    // Add bf, area and ld headers
    for(let i = 0;i<3;i++){
        var cell = document.createElement('td')
        cell.textContent = rowData[i]   
        row.appendChild(cell)
    }

    // Add upo heading before percentage amounts
    var cell = document.createElement('td')
    cell.textContent = rowData[11]   
    row.appendChild(cell)

    // Add percentage amounts
    for(let j = 3;j<5;j++){
        var cell = document.createElement('td')
        
        // For the permitted upo amount in the table
        if(j === 3){
            proposedUpo = (rowData[4] * 100).toFixed(2)
            var permittedUpo = getPermittedUpo(rowData[1], rowData[2])
            cell.textContent = permittedUpo

            if(permittedUpo < proposedUpo){
                upoWithinLimits = false
            }  
        }else{
            cell.textContent = (rowData[j] * 100).toFixed(2)     
        }

        // Change cell colours (red, green) based on whether the proposed upo value is 
        // less than the permitted amount
        changeUpoCellColourInTable(upoWithinLimits, cell)

        row.appendChild(cell)
    }
}

 // Function to change cell colour to green or red depending on if predicted upo is within the allowed limits
function changeUpoCellColourInTable(upoWithinLimits, cell){
    if(!upoWithinLimits){
        cell.className = "bg-danger"
    }else{
        cell.className = "bg-success"
    }
}

// Function to retrieve the index of the sheet in the excel that is for UPO Calculations - Part 9
function getSheetNumber(listOfSheetNumbers){
    for(let i = 0;i<listOfSheetNumbers.length;i++){
        if(listOfSheetNumbers[i].startsWith("UPO Calculations - Part 9")){
            return i
        }
    }
    return 0
}


// Function takes in area value and determines the closest matching max area value.
// The max area value returned is greater than or equal to the inputted area value.
function calculateMaxArea(area){
    if(area > 100){
        return 101
    }

    var areaValues = [10,15,20,25,30,40,50,100,101]
    for(let i = 0;i<areaValues.length;i++){
        if(area <= areaValues[i]){
            return areaValues[i]
        }
    }
}


// Function determines the correct limiting distance index to use when looking up the
// percentage in the chart 
function limitingDistanceToArrayIndex(limDist){
    if(limDist < 1.2){
        return 0
    }else if(limDist > 25){
        return 14
    }

    index = 0
    lim_distances = [0, 1.2, 1.5, 2, 2.5, 3 ,4, 6, 8, 10, 12, 16, 20, 25]

    for(let i = 0;i<lim_distances.length;i++){
        if(limDist <= lim_distances[i]){
            index = i
            break
        }
    }

    return index
}

// Function determines which of the two charts to use based on the user's selected building type.
// Buildings of type C,D, and F3 use one chart, while buildings of type E, F1 and F2 use the other chart.
function getChartSelectionBasedOnBuildingType(){
    buildingTypeSelection = document.getElementById("buildingType").value
    if(buildingTypeSelection === "C" || buildingTypeSelection ===  "D" || buildingTypeSelection === "F3"){
        return "residential"
    }
    return "mercantile"
}


// Function calculates the permitted upo by using the chart type max total area and limiting distance index to look 
// up the corresponding value in the chart.
function calculatePermittedUpo(chartSelection, maxTotalArea, limitingDistanceIndex){
    rowInChart = max_aggregate_area[chartSelection][maxTotalArea]
    if(limitingDistanceIndex >= rowInChart.length){
        return 100
    }
    return rowInChart[limitingDistanceIndex]
}

// Function retrieves the permitted upo value
function getPermittedUpo(areaEBF, limDist){
    chartSelection = getChartSelectionBasedOnBuildingType()
    limitingDistanceIndex = limitingDistanceToArrayIndex(limDist)
    maxTotalArea = calculateMaxArea(areaEBF)
    var permittedUpo = calculatePermittedUpo(chartSelection, maxTotalArea, limitingDistanceIndex)
    return permittedUpo
}

  