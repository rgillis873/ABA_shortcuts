const chartList = [unprotected_opening_limits_b, unprotected_opening_limits_c, unprotected_opening_limits_d, unprotected_opening_limits_e]

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('tableType').addEventListener('change', function(evt) {
        tableSelection = document.getElementById('tableType').value
        clearTable()
        addFirstHeadersToTable(tableSelection)
        addSecondHeadersToTable(tableSelection)
        addThirdHeadersToTable(tableSelection)
        addRowsToTable(tableSelection)
    })
});

function clearTable(){
    upoTable = document.getElementById("upo_chart")
    upoTable.innerHTML = ""
}

function addFirstHeadersToTable(chartType){
    upoTable = document.getElementById("upo_chart")

    // Create a new row
    var row = document.createElement('tr')

    var chartIndex = getChartIndex(chartType)
    var chartTitle = chartList[chartIndex]["table_name"]
    var chartColumnNumber = chartList[chartIndex]["columns"]

    var headerOne = document.createElement('th')
    var headerTwo = document.createElement('th')
    headerOne.colSpan = "2"
    headerTwo.colSpan = ""+chartColumnNumber+""
    headerOne.textContent = "Exposing Building Face"
    headerTwo.textContent = chartTitle

    row.appendChild(headerOne)
    row.appendChild(headerTwo)

    upoTable.appendChild(row)
}

function addSecondHeadersToTable(chartType){
    upoTable = document.getElementById("upo_chart")

    // Create a new row
    var row = document.createElement('tr')

    var chartIndex = getChartIndex(chartType)
    var chartColumnNumber = chartList[chartIndex]["columns"]

    var headerOne = document.createElement('td')
    var headerTwo = document.createElement('td')

    headerOne.rowSpan = "2"
    headerTwo.colSpan = ""+chartColumnNumber+""

    headerOne.textContent = "Maximum Area m^2"
    headerTwo.textContent = "Limiting Distance, m"

    row.appendChild(headerOne)

    if(chartType === "B" || chartType === "C"){
        var headerThree = document.createElement('td')
        headerThree.rowSpan = "2"
        headerThree.textContent = "Ratio (L/H or H/L)"
        row.appendChild(headerThree)        
    }

    row.appendChild(headerTwo)

    upoTable.appendChild(row)
}

function addThirdHeadersToTable(chartType){
    upoTable = document.getElementById("upo_chart")

    // Create a new row
    var row = document.createElement('tr')

    var chartIndex = getChartIndex(chartType)
    var chartColumnNumber = chartList[chartIndex]["columns"]

    for(let i = 0;i<chartColumnNumber;i++){
        var cell = document.createElement('td')
        cell.id = "col "+i+""
        cell.textContent = chartList[chartIndex]["column_numbers"][i]
        row.appendChild(cell)
    }

    upoTable.appendChild(row)
}

function addRowsToTable(chartType){
    var upoTable = document.getElementById("upo_chart")

    var chartIndex = getChartIndex(chartType)
  
    if(chartIndex <= 1){
        createNonSprinkleredRows(upoTable, chartIndex)
    }else{
        createSprinkleredRows(upoTable, chartIndex)
    }

}

function createNonSprinkleredRows(upoTable, chartIndex){
    var chartColumnNumber = chartList[chartIndex]["columns"]
    var rowNumbers = chartList[chartIndex]["row_numbers"]
    console.log(rowNumbers)
    var rowNumbersLength = rowNumbers.length

    for(let i = 0;i<rowNumbersLength;i++){
        var rowOne = document.createElement('tr')
        var rowTwo = document.createElement('tr')

        var cellForMaxArea = document.createElement('td')
        cellForMaxArea.rowSpan = "4"

        cellForMaxArea.textContent = ""+rowNumbers[i]+""
        cellForMaxArea.id = "area "+i
        rowOne.appendChild(cellForMaxArea)

        var ratioValues = ["Less than 3:1", "3:1 to 10:1", "over 10:1"]

        for(let j = 0;j<ratioValues.length;j++){
            var cellForRatio = document.createElement('td')
            cellForRatio.textContent = ratioValues[j]
            cellForRatio.id = "ratio "+j
            rowTwo.appendChild(cellForRatio)


            for(let k = 1;k<4;k++){
                console.log("chart index: " + chartIndex+" i: "+rowNumbers[i]+" k: "+k)
                var rowValues = chartList[chartIndex][rowNumbers[i]][k]
                var rowValuesLength = rowValues.length

                for(let l = 0;l<rowValuesLength;l++){
                
                    var cellForRowValue = document.createElement('td')
                    cellForRowValue.id = i+"-"+j+"-"+l
                    cellForRowValue.textContent = rowValues[l]
                    rowTwo.appendChild(cellForRowValue)
                }
            }
        }
        upoTable.appendChild(rowOne)
        upoTable.appendChild(rowTwo)
    }
}

function createSprinkleredRows(upoTable, chartIndex){
    var chartColumnNumber = chartList[chartIndex]["columns"]
    var rowNumbers = chartList[chartIndex]["row_numbers"]
    var rowNumbersLength = rowNumbers.length
}

function getChartIndex(chartType){
    var chartIndex = -1
    if(chartType === "B"){
        chartIndex = 0
    }else if(chartType === "C"){
        chartIndex = 1
    }else if(chartType === "D"){
        chartIndex = 2
    }else{
        chartIndex = 3
    }
    return chartIndex
}