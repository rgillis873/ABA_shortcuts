document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('excelFile').addEventListener('change', function(evt) {
        handleExcelParsing(evt)
    })
});

function handleExcelParsing(evt){
    var file = evt.target.files[0];
    var reader = new FileReader();
    reader.onload = function(e) {
        var jsonData = getJsonDataFromWorkbook(e)
      
        var table = document.getElementById('myTable');

        // Clear table if already displayed on page
        clearTable()

        // Add excel info to the table and display it
        fillOutTable(jsonData, table)

    };
    reader.readAsArrayBuffer(file);
}

function getJsonDataFromWorkbook(e){
    var data = new Uint8Array(e.target.result);
    var workbook = XLSX.read(data, {type: 'array'});

    var sheetNumber = getSheetNumber(workbook.SheetNames)
    var sheetName = workbook.SheetNames[sheetNumber];
    var jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {header:1});
    
    return jsonData
}

function clearTable(){
    var table = document.getElementById('myTable');
    table.innerHTML = "";
}

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
        if(j === 3){
            proposedUpo = (rowData[j] * 100).toFixed(2)
            var permittedUpo = getPermittedUpo(rowData[1], rowData[2])
            cell.textContent = permittedUpo
            if(permittedUpo < proposedUpo){
                upoWithinLimits = false
            }  
        }else{
            cell.textContent = (rowData[j] * 100).toFixed(2)     
        }
        changeUpoCellColourInTable(upoWithinLimits, cell)

        row.appendChild(cell)
    }
}

function changeUpoCellColourInTable(upoWithinLimits, cell){
    // Change cell colour to green or red depending on if predicted upo is within the allowed limits
    if(!upoWithinLimits){
        cell.className = "bg-danger"
    }else{
        cell.className = "bg-success"
    }
}

function getSheetNumber(listOfSheetNumbers){
    for(let i = 0;i<listOfSheetNumbers.length;i++){
        if(listOfSheetNumbers[i].startsWith("UPO Calculations - Part 9")){
            return i
        }
    }
    return 0
}

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

function limitingDistanceToArrayIndex(limDist){
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

function getChartSelectionBasedOnBuildingType(){
    buildingTypeSelection = document.getElementById("buildingType").value
    if(buildingTypeSelection === "C" || buildingTypeSelection ===  "D" || buildingTypeSelection === "F3"){
        return "residential"
    }
    return "mercantile"
}

function calculatePermittedUpo(chartSelection, maxTotalArea, limitingDistanceIndex){
    rowInChart = max_aggregate_area[chartSelection][maxTotalArea]
    if(limitingDistanceIndex >= rowInChart.length){
        return 100
    }
    return rowInChart[limitingDistanceIndex]
}

function getPermittedUpo(areaEBF, limDist){
    chartSelection = getChartSelectionBasedOnBuildingType()
    limitingDistanceIndex = limitingDistanceToArrayIndex(limDist)
    maxTotalArea = calculateMaxArea(areaEBF)
    console.log(" ")
    console.log(chartSelection)
    console.log(maxTotalArea)
    console.log(limitingDistanceIndex)
    var permittedUpo = calculatePermittedUpo(chartSelection, maxTotalArea, limitingDistanceIndex)
    return permittedUpo
}

  