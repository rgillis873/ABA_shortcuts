const chartList = [unprotected_opening_limits_b, unprotected_opening_limits_c, unprotected_opening_limits_d, unprotected_opening_limits_e]

var selectedColumn = -1
var selectedRow = -1

document.addEventListener('DOMContentLoaded', function() {
    generateTableSelection()
    document.getElementById('tableType').addEventListener('change', function(evt) {
        generateTableSelection()
    })
});

function generateTableSelection(){
    selectedColumn = -1
    selectedRow = -1
    clearTable()
    addFirstHeadersToTable()
    addSecondHeadersToTable()
    addThirdHeadersToTable()
    addRowsToTable()
}

function clearTable(){
    upoTable = document.getElementById("upo_chart")
    upoTable.innerHTML = ""
}

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

function addSecondHeadersToTable(){
    upoTable = document.getElementById("upo_chart")

    var row = document.createElement('tr')

    var chartIndex = getChartIndex()
    var chartColumnNumber = chartList[chartIndex]["columns"]

    var headerOne = document.createElement('td')
    var headerTwo = document.createElement('td')

    headerOne.rowSpan = "2"
    headerTwo.colSpan = ""+chartColumnNumber+""

    headerOne.textContent = "Maximum Area m^2"
    headerTwo.textContent = "Limiting Distance, m"

    row.appendChild(headerOne)

    if(chartIndex < 2){
        var headerThree = document.createElement('td')
        headerThree.rowSpan = "2"
        headerThree.textContent = "Ratio (L/H or H/L)"
        row.appendChild(headerThree)        
    }

    row.appendChild(headerTwo)

    upoTable.appendChild(row)
}

function addThirdHeadersToTable(){
    upoTable = document.getElementById("upo_chart")

    var row = document.createElement('tr')

    var chartIndex = getChartIndex()
    var chartColumnNumber = chartList[chartIndex]["columns"]

    for(let i = 0;i<chartColumnNumber;i++){
        var cell = document.createElement('td')
        cell.id = "col "+i+""
        cell.textContent = chartList[chartIndex]["column_numbers"][i]
        cell.setAttribute('onclick', "highlightColumn(this.id)")
        row.appendChild(cell)
    }

    upoTable.appendChild(row)
}

function highlightColumn(id){
    var columnNumber = Number(id.split(" ").pop())
    var chartIndex = getChartIndex()

    if(selectedColumn === columnNumber){
        unselectAllInColumn(columnNumber)
        selectAllInRowAfterColumn(selectedRow, chartIndex)
        selectedColumn = -1
    }else if(selectedColumn > -1 && selectedColumn !== columnNumber){
        unselectAllInColumn(selectedColumn)
        selectedColumn = columnNumber
        selectAllInColumn(columnNumber)
        if(selectedRow > -1){
            if(chartIndex < 2){
                var areaIndex = Math.floor(selectedRow/3)
                var ratioIndex = selectedRow%3
                selectAllInRow(areaIndex,ratioIndex, chartIndex)
            }else{
                selectAllInRow(selectedRow, undefined, chartIndex)
                //selectAllInRowDE(selectedRow, chartIndex)
            }
        }
        
    }else{
        selectedColumn = columnNumber
        selectAllInColumn(columnNumber)     
    }
}

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

function highlightRow(id){
    var chartIndex = getChartIndex()
    var rowIndices= id.split(" ")
    if(chartIndex < 2){
        var ratioIndex = Number(rowIndices.pop())
        var areaIndex = Number(rowIndices.pop())
        var rowNumber = (areaIndex*3)+ratioIndex
    }else{
        var rowNumber = Number(rowIndices.pop())
    }

    if(selectedRow === rowNumber){
        unselectAllInRow(selectedRow, chartIndex)
        selectAllInColumnAfterRow(selectedColumn)
        selectedRow = -1
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
    }else{
        selectedRow = rowNumber
        if(chartIndex < 2){
            selectAllInRow(areaIndex, ratioIndex, chartIndex)
        }else{
            selectAllInRow(rowNumber,undefined, chartIndex)
        }
    }
}

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


function addHighlightToAreaRowCell(cell, selectedRow){
    var cellIndices = cell.id.split(" ")
    var cellAreaNumber = Number(cellIndices[1])
    if(selectedRow === cellAreaNumber){
        cell.classList.add('selectedRow')
    }
}

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

function addHighlightToRatioRowCell(cell, areaIndex, ratioIndex){
    var cellIndices = cell.id.split(" ")
    var cellAreaNumber = Number(cellIndices[1])
    var cellRatioNumber = Number(cellIndices[2])
    if(areaIndex === cellAreaNumber && ratioIndex === cellRatioNumber){
        cell.classList.add('selectedRow')
    }
}

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

function removeHighlightFromAreaRowCell(cell, selectedRow){
    var cellAreaNumber = Number(cell.id.split(" ").pop())
    if(selectedRow === cellAreaNumber){
        cell.classList.remove('selectedRow')
    }
}

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

function removeHighlightFromRatioRowCell(cell, areaIndex, ratioIndex){
    var cellIndices = cell.id.split(" ")
    var cellAreaNumber = Number(cellIndices[1])
    var cellRatioNumber = Number(cellIndices[2])
    if(areaIndex === cellAreaNumber && ratioIndex === cellRatioNumber){
        cell.classList.remove('selectedRow')
    }
}

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

function addRowsToTable(){
    var upoTable = document.getElementById("upo_chart")

    var chartIndex = getChartIndex()
  
    if(chartIndex <= 1){
        createNonSprinkleredRows(upoTable, chartIndex)
    }else{
        createSprinkleredRows(upoTable, chartIndex)
    }

}


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
        rowOne.appendChild(cellForMaxArea)
        upoTable.appendChild(rowOne)

        var ratioValues = ["Less than 3:1", "3:1 to 10:1", "over 10:1"]

        for(let j = 0;j<3;j++){
            var rowTwo = document.createElement('tr')
            var cellForRatio = document.createElement('td')
            cellForRatio.textContent = ratioValues[j]
            cellForRatio.id = "ratio "+i+" "+j
            cellForRatio.setAttribute('onclick', "highlightRow(this.id)")
            rowTwo.appendChild(cellForRatio)

            var rowValues = chartList[chartIndex][rowNumbers[i]][j+1]
            var rowValuesLength = rowValues.length

            for(let l = 0;l<chartColumnNumber;l++){
                    
                var cellForRowValue = document.createElement('td')
                cellForRowValue.id = "cell "+i+" "+j+" "+l
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
        rowOne.appendChild(cellForMaxArea)
       
        var rowValues = chartList[chartIndex][rowNumbers[i]][1]
        var rowValuesLength = rowValues.length

        for(let j = 0;j<chartColumnNumber;j++){
            
            var cellForRowValue = document.createElement('td')
            cellForRowValue.id = "cell "+i+" "+j
            
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