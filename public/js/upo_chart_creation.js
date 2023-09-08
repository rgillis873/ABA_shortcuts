const chartList = [unprotected_opening_limits_b, unprotected_opening_limits_c, unprotected_opening_limits_d, unprotected_opening_limits_e]

var selectedColumn = -1
var selectedRow = -1

document.addEventListener('DOMContentLoaded', function() {
    generateTableSelection()
    document.getElementById('tableType').addEventListener('change', function(evt) {
        generateTableSelection()
    })
});

// Function generates different table types depending on the dropdown selection
// made by the user
function generateTableSelection(){
    selectedColumn = -1
    selectedRow = -1
    clearTable()
    addChartInstructions()
    addFirstHeadersToTable()
    addSecondHeadersToTable()
    addColumnHeadersToTable()
    addRowsToTable()
}

// Function clears the contents of the table on the page
function clearTable(){
    upoTable = document.getElementById("upo_chart")
    upoTable.innerHTML = ""
}

// Function adds chart highlighting instructions to the page
function addChartInstructions(){
    var chartIndex = getChartIndex()
    var instructions = document.getElementById("chart_info")

    if(chartIndex < 2){
        instructions.innerText = "Click on column numbers to highlight a column in the table. Click on ratio values to highlight a row in the table"
    }else{
        instructions.innerText = "Click on column numbers to highlight a column in the table. Click on area values to highlight a row in the table"
    }
}

// Function adds first row of headers to the table
function addFirstHeadersToTable(){
    upoTable = document.getElementById("upo_chart")

    var row = document.createElement('tr')

    var chartIndex = getChartIndex()
    var chartTitle = chartList[chartIndex]["table_name"]
    var chartColumnNumber = chartList[chartIndex]["columns"]

    var headerOne = document.createElement('th')
    var headerTwo = document.createElement('th')
    if(chartIndex < 2){
        headerOne.colSpan = "2"
        headerTwo.colSpan = ""+(chartColumnNumber+1)+""
    }else{
        headerTwo.colSpan = ""+chartColumnNumber+""
    }
    headerOne.textContent = "Exposing Building Face"
    headerTwo.textContent = chartTitle

    row.appendChild(headerOne)
    row.appendChild(headerTwo)

    upoTable.appendChild(row)
}

// Function adds second row of headers to the table
function addSecondHeadersToTable(){
    upoTable = document.getElementById("upo_chart")

    var row = document.createElement('tr')

    var chartIndex = getChartIndex()
    var chartColumnNumber = chartList[chartIndex]["columns"]

    //var headerOne = document.createElement('td')
   // var headerTwo = document.createElement('td')

    var headerOne = document.createElement('th')
    var headerTwo = document.createElement('th')

    headerOne.rowSpan = "2"
    headerTwo.colSpan = ""+chartColumnNumber+""

    headerOne.textContent = "Maximum Area m^2"
    headerTwo.textContent = "Limiting Distance, m"

    row.appendChild(headerOne)

    if(chartIndex < 2){
        //var headerThree = document.createElement('td')
        var headerThree = document.createElement('th')
        headerThree.rowSpan = "2"
        headerThree.textContent = "Ratio (L/H or H/L)"
        row.appendChild(headerThree)        
    }

    row.appendChild(headerTwo)

    upoTable.appendChild(row)
}

// Function adds column headers to the table
function addColumnHeadersToTable(){
    upoTable = document.getElementById("upo_chart")

    var row = document.createElement('tr')

    var chartIndex = getChartIndex()
    var chartColumnNumber = chartList[chartIndex]["columns"]

    for(let i = 0;i<chartColumnNumber;i++){
        var cell = document.createElement('td')
        cell.id = "col "+i+""
        cell.textContent = chartList[chartIndex]["column_numbers"][i]
        cell.setAttribute('onclick', "highlightColumn(this.id)")
        cell.classList.add('td-divider')
        row.appendChild(cell)
    }

    upoTable.appendChild(row)
}

// Function is called when a column header cell is clicked. 
// It takes in the id of the clicked column cell and highlights/unhighlights
// the cells in that column
function highlightColumn(id){
    var columnNumber = Number(id.split(" ").pop())
    var chartIndex = getChartIndex()

    // If the column is being clicked and it was already highlighted
    if(selectedColumn === columnNumber){
        unselectAllInColumn(columnNumber)
        selectAllInRowAfterColumn(selectedRow, chartIndex)
        selectedColumn = -1

    // If another column was highlighted and now a new column is being highlighted
    }else if(selectedColumn > -1 && selectedColumn !== columnNumber){
        unselectAllInColumn(selectedColumn)
        selectedColumn = columnNumber
        selectAllInColumn(columnNumber)
        
        // If a row in the table was already highlighted, re-highlight only the 
        // cells in the row that occur before the column
        if(selectedRow > -1){
            if(chartIndex < 2){
                var areaIndex = Math.floor(selectedRow/3)
                var ratioIndex = selectedRow%3
                selectAllInRow(areaIndex,ratioIndex, chartIndex)
            }else{
                selectAllInRow(selectedRow, undefined, chartIndex)
            }
        }
  
    // Highlighting a column and no other column was already highlighted
    }else{
        selectedColumn = columnNumber
        selectAllInColumn(columnNumber)     
    }
}

// Function takes in a column number and highlights the cells that have a 
// matching column number
function selectAllInColumn(columnNumber){
    var allCells = document.getElementsByTagName('td')
    var chartIndex = getChartIndex()

    if(selectedRow > -1){
        unselectAllInRowAfterColumn(selectedRow, chartIndex)
    }

    Array.from(allCells).forEach((cell) =>{
        if(cell.id.startsWith("cell")){
            var cellIndices = cell.id.split(" ")
            var cellColumnNumber = Number(cellIndices.pop())
            if(columnNumber === cellColumnNumber){
                var cellRowNumber = -1
                if(chartIndex < 2){
                    cellRowNumber = Number(cellIndices.pop())+(Number(cellIndices.pop())*3)
                }else{
                    cellRowNumber = Number(cellIndices.pop())
                }
                if(selectedRow === -1 || cellRowNumber <= selectedRow){
                    cell.classList.add('selectedCol')
                }
            }
        }else if(cell.id.startsWith("col")){
            var cellIndices = cell.id.split(" ")
            var cellColumnNumber = Number(cellIndices.pop())
            if(selectedColumn === cellColumnNumber){
                cell.classList.add('selectedCol')
            }
        }
    })
}

// Function takes in a column number and unhighlights the cells that have a 
// matching column number
function unselectAllInColumn(columnNumber){
    var allCells = document.getElementsByTagName('td')

    Array.from(allCells).forEach( (cell) =>{
        if(cell.id.startsWith("cell")){
            var cellColumnNumber = Number(cell.id.split(" ").pop())
            if(columnNumber === cellColumnNumber){
                cell.classList.remove('selectedCol')
            }
        }else if(cell.id.startsWith("col")){
            var cellColumnNumber = Number(cell.id.split(" ").pop())
            if(selectedColumn === cellColumnNumber){
                cell.classList.remove('selectedCol')
            }
        }
    })
}


// Function is called when a row header cell is clicked. 
// It takes in the id of the clicked row cell and highlights/unhighlights
// the cells in that row
function highlightRow(id){
    var chartIndex = getChartIndex()
    var rowIndices= id.split(" ")

    // For tables types B&C that have sub-rows
    if(chartIndex < 2){
        var ratioIndex = Number(rowIndices.pop())
        var areaIndex = Number(rowIndices.pop())
        var rowNumber = (areaIndex*3)+ratioIndex
    }else{
        var rowNumber = Number(rowIndices.pop())
    }

    // If the row is being clicked and it was already highlighted
    if(selectedRow === rowNumber){
        unselectAllInRow(selectedRow, chartIndex)
        selectAllInColumnAfterRow(selectedColumn)
        selectedRow = -1
    
    // If another row was highlighted and now a new row is being highlighted
    }else if(selectedRow > -1 && selectedRow !== rowNumber){
        unselectAllInRow(selectedRow, chartIndex)
        selectedRow = rowNumber
        if(chartIndex < 2){
            selectAllInRow(areaIndex, ratioIndex, chartIndex)
        }else{
            selectAllInRow(rowNumber,undefined, chartIndex)
        }
        if(selectedColumn > -1){
            selectAllInColumn(selectedColumn)
        }
    // Highlighting a row and no other row was already highlighted
    }else{
        selectedRow = rowNumber
        if(chartIndex < 2){
            selectAllInRow(areaIndex, ratioIndex, chartIndex)
        }else{
            selectAllInRow(rowNumber,undefined, chartIndex)
        }
    }
}

// Function takes in an area number, ratio number and chartIndex. 
// Highlights the cells that have a matching area and ratio number if the 
// chartIndex value is less than 2 (it's a B or C type chart). Otherwise 
// it highlights cells with matching area number.
function selectAllInRow(areaIndex, ratioIndex, chartIndex){
    var allCells = document.getElementsByTagName('td')

    if(selectedColumn > -1){
        unselectAllInColumnAfterRow(selectedColumn)
    }

    Array.from(allCells).forEach((cell) =>{
        if(cell.id.startsWith("cell")){
            if(chartIndex < 2){
                addHighlightToChartRowCell(cell, chartIndex, areaIndex, ratioIndex)
            }else{
                addHighlightToChartRowCell(cell, chartIndex, selectedRow, undefined)
            }
        }else if(cell.id.startsWith("area")){
            if(chartIndex < 2){
                addHighlightToAreaRowCell(cell, areaIndex)
            }else{
                addHighlightToAreaRowCell(cell, selectedRow)
            }
        }else if(cell.id.startsWith("ratio")){
            addHighlightToRatioRowCell(cell, areaIndex, ratioIndex)
        }
    })
}

// Function highlights a cell storing an area value
function addHighlightToAreaRowCell(cell, selectedRow){
    var cellIndices = cell.id.split(" ")
    var cellAreaNumber = Number(cellIndices[1])
    if(selectedRow === cellAreaNumber){
        cell.classList.add('selectedRow')
    }
}

// Function highlights a cell in a row of the chart
function addHighlightToChartRowCell(cell, chartIndex, areaIndex, ratioIndex){
    var cellIndices = cell.id.split(" ")
    var cellAreaNumber = Number(cellIndices[1])
    if(chartIndex < 2){
        var cellRatioNumber = Number(cellIndices[2])
        if(areaIndex === cellAreaNumber && ratioIndex === cellRatioNumber){
            var cellColumnNumber = Number(cellIndices[3])
            if(selectedColumn === -1 || cellColumnNumber <= selectedColumn){
                cell.classList.add('selectedRow')
            }
        }
    }else{
        if(areaIndex === cellAreaNumber){
            var cellColumnNumber = Number(cellIndices[2])
            if(selectedColumn === -1 || cellColumnNumber <= selectedColumn){
                cell.classList.add('selectedRow')
            }
        }
    }
}

// Function highlights a cell storing a ratio value
function addHighlightToRatioRowCell(cell, areaIndex, ratioIndex){
    var cellIndices = cell.id.split(" ")
    var cellAreaNumber = Number(cellIndices[1])
    var cellRatioNumber = Number(cellIndices[2])
    if(areaIndex === cellAreaNumber && ratioIndex === cellRatioNumber){
        cell.classList.add('selectedRow')
    }
}

// Function removes the highlight from all cells in a row
function unselectAllInRow(selectedRow, chartIndex){
    var allCells = document.getElementsByTagName('td')
    if(chartIndex < 2){
        var areaIndex = Math.floor(selectedRow/3)
        var ratioIndex = selectedRow%3
    }

    if(selectedColumn > -1){
        selectAllInColumn(selectedColumn)
    }

    Array.from(allCells).forEach( (cell) =>{
        if(cell.id.startsWith("cell")){
            if(chartIndex < 2){
                removeHighlightFromChartRowCell(cell, chartIndex, areaIndex, ratioIndex)
            }else{
                removeHighlightFromChartRowCell(cell, chartIndex, selectedRow, undefined)
            }
        }else if(cell.id.startsWith("area")){
            if(chartIndex < 2){
                removeHighlightFromAreaRowCell(cell, areaIndex)
            }else{
                removeHighlightFromAreaRowCell(cell, selectedRow) 
            }
        }else if(cell.id.startsWith("ratio")){
            removeHighlightFromRatioRowCell(cell, areaIndex, ratioIndex)
        }
    })
}

// Function removes highlighting from a area cell
function removeHighlightFromAreaRowCell(cell, selectedRow){
    var cellAreaNumber = Number(cell.id.split(" ").pop())
    if(selectedRow === cellAreaNumber){
        cell.classList.remove('selectedRow')
    }
}

// Function removes highlighting from a cell in a row
function removeHighlightFromChartRowCell(cell, chartIndex, selectedRow, ratioIndex){
    var cellIndices = cell.id.split(" ")
    var cellAreaNumber = Number(cellIndices[1])
    if(chartIndex < 2){
        var cellRatioNumber = Number(cellIndices[2])
        if(selectedRow === cellAreaNumber && ratioIndex === cellRatioNumber){
            cell.classList.remove('selectedRow')
        }
    }else{
        if(selectedRow === cellAreaNumber){
            cell.classList.remove('selectedRow')
        }
    }
}

// Function removes highlighting from a ratio cell
function removeHighlightFromRatioRowCell(cell, areaIndex, ratioIndex){
    var cellIndices = cell.id.split(" ")
    var cellAreaNumber = Number(cellIndices[1])
    var cellRatioNumber = Number(cellIndices[2])
    if(areaIndex === cellAreaNumber && ratioIndex === cellRatioNumber){
        cell.classList.remove('selectedRow')
    }
}

// Function highlights all cells in selectedRow that occur after the selected column
function selectAllInRowAfterColumn(selectedRow, chartIndex){
    var allCells = document.getElementsByTagName('td')
    var areaIndex = Math.floor(selectedRow/3)
    var ratioIndex = selectedRow%3
    
    Array.from(allCells).forEach( (cell) =>{
        if(cell.id.startsWith("cell")){
            var cellIndices = cell.id.split(" ")
            var cellAreaNumber = Number(cellIndices[1])
            if(chartIndex < 2){
                var cellRatioNumber = Number(cellIndices[2])
                var cellColumnNumber = Number(cellIndices[3])
                if(areaIndex === cellAreaNumber && ratioIndex === cellRatioNumber && cellColumnNumber >= selectedColumn){
                    cell.classList.add('selectedRow')
                }
            }else{
                var cellColumnNumber = Number(cellIndices[2])
                if(selectedRow === cellAreaNumber && cellColumnNumber >= selectedColumn){
                    cell.classList.add('selectedRow')
                }    
            }
        }
    })
}

// Function unhighlights all cells in selectedRow that occur after the selected column
function unselectAllInRowAfterColumn(selectedRow, chartIndex){
    var allCells = document.getElementsByTagName('td')
    var areaIndex = Math.floor(selectedRow/3)
    var ratioIndex = selectedRow%3
    
    Array.from(allCells).forEach( (cell) =>{
        if(cell.id.startsWith("cell")){
            var cellIndices = cell.id.split(" ")
            var cellAreaNumber = Number(cellIndices[1])

            if(chartIndex < 2){
                var cellRatioNumber = Number(cellIndices[2])
                var cellColumnNumber = Number(cellIndices[3])
                if(areaIndex === cellAreaNumber && ratioIndex === cellRatioNumber && cellColumnNumber > selectedColumn){
                    cell.classList.remove('selectedRow')
                }
            }else{
                var cellColumnNumber = Number(cellIndices[2])
                if(selectedRow === cellAreaNumber && cellColumnNumber > selectedColumn){
                    cell.classList.remove('selectedRow')
                }
            }
        }
    })
}


// Function highlights all cells in columnNumber that occur after the selected row
function selectAllInColumnAfterRow(columnNumber){
    var allCells = document.getElementsByTagName('td')
    var chartIndex = getChartIndex()

    Array.from(allCells).forEach( (cell) =>{
        if(cell.id.startsWith("cell")){
            var cellIndices = cell.id.split(" ")
            var cellAreaNumber = Number(cellIndices[1])
            var cellColumnNumber = -1
            var cellRow = -1
            if(chartIndex < 2){
                var cellRatioNumber = Number(cellIndices[2])
                cellColumnNumber = Number(cellIndices[3])
                cellRow = cellAreaNumber*3 + cellRatioNumber
            }else{
                cellColumnNumber = Number(cellIndices[2])
                cellRow = cellAreaNumber
            }
            if(columnNumber === cellColumnNumber && cellRow >= selectedRow){
                cell.classList.add('selectedCol')
            }
        }
    })
}

// Function unhighlights all cells in columnNumber that occur after the selected row
function unselectAllInColumnAfterRow(columnNumber){
    var allCells = document.getElementsByTagName('td')
    var chartIndex = getChartIndex()

    Array.from(allCells).forEach( (cell) =>{
        if(cell.id.startsWith("cell")){
            var cellIndices = cell.id.split(" ")
            var cellAreaNumber = Number(cellIndices[1])
            var cellColumnNumber = -1
            var cellRow = -1
            if(chartIndex < 2){
                var cellRatioNumber = Number(cellIndices[2])
                cellColumnNumber = Number(cellIndices[3])
                cellRow = cellAreaNumber*3 + cellRatioNumber
            }else{
                cellColumnNumber = Number(cellIndices[2])
                cellRow = cellAreaNumber
            }
            if(columnNumber === cellColumnNumber && cellRow > selectedRow){
                cell.classList.remove('selectedCol')
            }
        }
    })
}

// Function adds the rows of data to the displayed table depending on the chart type.
// Chart types corresponding index values are ( B = 0, C = 1, D = 2, E = 3).
// B & C charts are for Non-Sprinklered. D&E are for Sprinklered
function addRowsToTable(){
    var upoTable = document.getElementById("upo_chart")

    var chartIndex = getChartIndex()
  
    if(chartIndex <= 1){
        createNonSprinkleredRows(upoTable, chartIndex)
    }else{
        createSprinkleredRows(upoTable, chartIndex)
    }

}

// Function adds rows to the table for the Non-Sprinklered (B&C) type tables
function createNonSprinkleredRows(upoTable, chartIndex){
    var chartColumnNumber = chartList[chartIndex]["columns"]
    var rowNumbers = chartList[chartIndex]["row_numbers"]
    var rowNumbersLength = rowNumbers.length

    for(let i = 0;i<rowNumbersLength;i++){
        var rowOne = document.createElement('tr')

        var cellForMaxArea = document.createElement('td')
        cellForMaxArea.rowSpan = "4"

        cellForMaxArea.textContent = ""+rowNumbers[i]+""
        cellForMaxArea.id = "area "+i
        cellForMaxArea.classList.add('td-divider')
        rowOne.appendChild(cellForMaxArea)
        upoTable.appendChild(rowOne)

        var ratioValues = ["Less than 3:1", "3:1 to 10:1", "over 10:1"]

        for(let j = 0;j<3;j++){
            var rowTwo = document.createElement('tr')
            var cellForRatio = document.createElement('td')
            cellForRatio.textContent = ratioValues[j]
            cellForRatio.id = "ratio "+i+" "+j
            cellForRatio.setAttribute('onclick', "highlightRow(this.id)")
            cellForRatio.classList.add('td-divider')
            rowTwo.appendChild(cellForRatio)

            var rowValues = chartList[chartIndex][rowNumbers[i]][j+1]
            var rowValuesLength = rowValues.length

            for(let l = 0;l<chartColumnNumber;l++){
                    
                var cellForRowValue = document.createElement('td')
                cellForRowValue.id = "cell "+i+" "+j+" "+l
                cellForRowValue.style.width = '40px'
                if(l < rowValuesLength){
                    cellForRowValue.textContent = rowValues[l]
                }else{
                    cellForRowValue.textContent = 100
                }
                rowTwo.appendChild(cellForRowValue)
            }
            upoTable.appendChild(rowTwo)
        }
    }
}

// Function adds rows to the table for the Sprinklered (D&E) type tables
function createSprinkleredRows(upoTable, chartIndex){
    var chartColumnNumber = chartList[chartIndex]["columns"]
    var rowNumbers = chartList[chartIndex]["row_numbers"]
    var rowNumbersLength = rowNumbers.length

    
    for(let i = 0;i<rowNumbersLength;i++){
        var rowOne = document.createElement('tr')

        var cellForMaxArea = document.createElement('td')

        cellForMaxArea.textContent = ""+rowNumbers[i]+""
        cellForMaxArea.id = "area "+i
        cellForMaxArea.setAttribute('onclick', "highlightRow(this.id)")
        cellForMaxArea.classList.add('td-divider')
        rowOne.appendChild(cellForMaxArea)
       
        var rowValues = chartList[chartIndex][rowNumbers[i]][1]
        var rowValuesLength = rowValues.length

        for(let j = 0;j<chartColumnNumber;j++){
            
            var cellForRowValue = document.createElement('td')
            cellForRowValue.id = "cell "+i+" "+j
            cellForRowValue.style.width = '70px'
            
            if(j < rowValuesLength){
                cellForRowValue.textContent = rowValues[j]
            }else{
                cellForRowValue.textContent = 100
            }
            rowOne.appendChild(cellForRowValue)
        }
        upoTable.appendChild(rowOne)
    }
}

// Function determines the chart index based on what chart type the user has selected with 
// the table selector dropdown displayed on the page
function getChartIndex(){
    var chartType = document.getElementById('tableType').value
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