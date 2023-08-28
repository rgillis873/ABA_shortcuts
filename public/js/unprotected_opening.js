document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('excelFile').addEventListener('change', function(evt) {
        handleExcelParsing(evt)
    })

    document.getElementById('sprinkle').addEventListener('change', function(evt) {
        removeBuildingTypeOptions()
        addBuildingTypeOptions()
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
    // Create a new table
    var table = document.getElementById('myTable');
    table.innerHTML = "";
}

function fillOutTable(jsonData, table){
    var count = 0;

    // For each row in the JSON data
    jsonData.forEach(function(rowData) {
        if(rowData[0] != undefined && rowData[0].length > 0){
                
            // Create a new row
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

function fillOutTableHeaders(row, rowData){
    row.className = "table-info"
    for(let i = 0;i<7;i++) {
        // Create a new cell
        var cell = document.createElement('td');
        cell.textContent = rowData[i];
            
        // Add the cell to the row
        row.appendChild(cell);
    }
}

function fillOutTableData(row, rowData){
    var upoWithinLimits = true
    for(let i = 0;i<7;i++) {
        // Create a new cell
        var cell = document.createElement('td');
                    
        if(i == 5){
            isBuildingSprinklered = document.getElementById('sprinkle').value === 'Sprinklered'
            buildingType = document.getElementById('buildingType').value
            allowable_opening = get_allowable_unprotected_opening_percentage(rowData[1], rowData[3], rowData[2], isBuildingSprinklered, buildingType)
                            
            if(rowData[6] != undefined && Math.round((rowData[6] + Number.EPSILON) * 100) > allowable_opening){
                upoWithinLimits = false
            }
            cell.textContent = allowable_opening
        }else if(i == 6){
            if(rowData[6] != undefined){
                cell.textContent = Math.round((rowData[6] + Number.EPSILON) * 100)
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

function changeUpoCellColourInTable(column, upoWithinLimits, cell){
     // Change cell colour to green or red depending on if predicted upo is within the allowed limits
     if(column >= 5 && !upoWithinLimits){
        cell.className = "bg-danger"
    }else if(column >= 5){
        cell.className = "bg-success"
    }
}

function removeBuildingTypeOptions(){
    var buildingTypeSelect = document.getElementById('buildingType')

    while (buildingTypeSelect.options.length > 0) {
        buildingTypeSelect.remove(0);
    }
}

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

function getSheetNumber(list_of_sheet_numbers){
    for(let i = 0;i<list_of_sheet_numbers.length;i++){
        if(list_of_sheet_numbers[i].startsWith("UPO Calculations")){
            return i
        }
    }
    return 0
}

function determine_max_area(area_value){
    if(area_value <= 10){
        final_area = 10
    }else if(area_value <= 15){
        final_area = 15
    }else if(area_value <= 20){
        final_area = 20
    }else if(area_value <= 25){
        final_area = 25
    }else if(area_value <= 30){
        final_area = 30
    }else if(area_value <= 40){
        final_area = 40
    }else if(area_value <= 50){
        final_area = 50
    }else if(area_value <= 60){
        final_area = 60
    }else if(area_value <= 80){
        final_area = 80
    }else if(area_value <= 100){
        final_area = 100
    }else if(area_value <= 150){
        final_area = 150
    }else if(area_value <= 250){
        final_area = 250
    }else if(area_value <= 350){
        final_area = 350
    }else if(area_value <= 500){
        final_area = 500
    }else if(area_value <= 1000){
        final_area = 1000
    }else{
        final_area = 2000
    }
    return final_area
}

function determine_ratio_length_height(ratio){
    ratio_option = 0
    if(ratio < 3){
        ratio_option =  1 
    }else if(ratio >= 3 && ratio <= 10){
        ratio_option =  2
    }else{
        ratio_option = 3
    } 
    return ratio_option
}

function limiting_distance_to_index(lim_dist){
    index = 0
    lim_distances = [0, 1.2, 1.5, 2, 2.5, 3 ,4, 5 ,6,7,8,9,10,11,12,13,14,16,18,20,25,30,35,40,45,50]

    for(let i = 0;i<lim_distances.length;i++){
        if(lim_dist <= lim_distances[i]){
            index = i
            break
        }
    }

    return index
}

function get_percentage(max_area, ratio_length_height, lim_dist_index, chartToUse){
    chart_list = [unprotected_opening_limits_b, unprotected_opening_limits_c, unprotected_opening_limits_d, unprotected_opening_limits_e]
    opening_limits_list = chart_list[chartToUse][max_area][ratio_length_height]
    if(lim_dist_index >= opening_limits_list.length){
        percentage = 100
    }else{
        percentage = opening_limits_list[lim_dist_index]
    }
    return percentage
}

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

function get_allowable_unprotected_opening_percentage(area, lh_ratio, limiting_distance, isBuildingSprinklered, buildingType){
    max_area = determine_max_area(area)
    ratio_length_height = 1
    if(!isBuildingSprinklered){
        ratio_length_height = determine_ratio_length_height(lh_ratio)
    }
    limit_distance_index = limiting_distance_to_index(limiting_distance)
    chartToUse = determineWhichChartToUse(isBuildingSprinklered, buildingType)
    opening_percentage = get_percentage(max_area, ratio_length_height, limit_distance_index, chartToUse)
    return opening_percentage
}

  