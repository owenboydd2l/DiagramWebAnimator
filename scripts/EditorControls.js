const STREAMLINESTAGE_START = 0;
const STREAMLINESTAGE_END = 1;

let streamlineStage = STREAMLINESTAGE_START;
let isStreamlineMode = false;

let pathPreviewMode = false; 


function ChangePathPreviewMode()
{
    pathPreviewMode = !pathPreviewMode;

    UpdatePathPreview();
}

function ChangeStreamlineMode(in_isNewStreamlineMode)
{
    isStreamlineMode = in_isNewStreamlineMode;

    if(!isStreamlineMode)
    {
        if(globalEventCache[globalEventCache.length - 1].endPosition == null)
        {
            let newList = [];

            for(let i =0; i < globalEventCache.length - 1; ++i)
                newList.push(globalEventCache[i]);

            globalEventCache = newList;
            UpdateEventList();
        }
    }
}

function AddAsset()
{
    var newFilePath = $('#txtNewAssetPath')[0].value;

    var newAsset = new Asset(id = assetList.length, fileName = newFilePath );

    assetList.push(newAsset);

    UpdateAssetList();
}

function UpdateAssetList()
{
    $('#assetTable').empty();

    assetList.forEach(element => {
        var newImage = document.createElement('img');
        newImage.setAttribute('src', element.fileName);
        newImage.classList.add('previewImage');
        $('#assetTable')[0].appendChild(newImage);
    });
}

function uuidv4() {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
  }

function SelectEventRow(event)
{
    ClearEditorSettings();
    selectedID = event.id;   
    
    UpdateEventList();

    var foundEvent = globalEventCache.find( (ev) => ev.id == selectedID);

    if(foundEvent.startOffset != null)
    {
        startIndicator = CreateNewIndicator(startIndicator, true);

        SetImagePosition(startIndicator, foundEvent.startOffset.X, foundEvent.startOffset.Y);
    }

    if(foundEvent.endPosition != null)
    {
        endIndicator = CreateNewIndicator(endIndicator, false);

        SetImagePosition(endIndicator, foundEvent.endPosition.X, foundEvent.endPosition.Y);
    }
}

function AddTextCellToRow(row, content, className = '')
{
    var newCell = document.createElement("td");
    newCell.innerText = content;
    
    if(className != '' && className !== undefined)
        newCell.classList.add(className);

    row.appendChild(newCell);
}

function AddCellToRow(row, elementList)
{
    var newCell = document.createElement("td");
    elementList.forEach(element => {
        newCell.appendChild(element);
    });
    
    row.appendChild(newCell);
}

function ClearEditorSettings()
{
    streamlineStage = STREAMLINESTAGE_START;
    isStreamlineMode = false;
    activateMode = NONE;
    runningEventIndex = 0;
    selectedID = 0;
}

function CreateNewEvent(in_startOffset = null, in_endPosition = null)
{
    
    let newEvent = new FlowEvent( id = uuidv4(), 
        orderID = globalEventCache.length, 
        target = 1, 
        endPosition = in_endPosition, 
        startOffset =  in_startOffset, 
        duration = 2000, 
        transformType = null);

    globalEventCache.push(newEvent)

    UpdateEventList();
}

function UpdatePathPreview()
{
    let diagramCanvas = $('#diagram_canvas')[0];
    let canvasContext = diagramCanvas.getContext('2d');
    canvasContext.clearRect(0, 0, diagramCanvas.offsetWidth, diagramCanvas.offsetHeight);

    if(!pathPreviewMode)
        return;

    let previewData = [];

    for(let i=0; i < globalEventCache.length; ++i)
    {
        previewData.push( { start : globalEventCache[i].startOffset, end : globalEventCache[i].endPosition });
    }

    let diagramArea = $('#diagram_area')[0];
    
    for(let j=0; j < previewData.length; ++j)
    {
        console.log(previewData[j].start.X * diagramArea.offsetWidth);
        canvasContext.beginPath(); 
        canvasContext.moveTo( previewData[j].start.X * diagramArea.offsetWidth, previewData[j].start.Y * diagramArea.offsetHeight);
        canvasContext.lineTo( previewData[j].end.X * diagramArea.offsetWidth, previewData[j].end.Y * diagramArea.offsetHeight);
        canvasContext.strokeStyle = "red";
        canvasContext.stroke();
    }    
    
}

function UpdateEventList()
{
    $('#controlTable').empty();

    globalEventCache.forEach(element => {
        
        if(element == null || element === undefined)
            return;

        var newTableRow = document.createElement("tr");

        if(element.id == selectedID)
        {
            newTableRow.style.backgroundColor = 'red';
        }
        
        {
            let selectButton = document.createElement("input");
            selectButton.setAttribute("type", "button");
            selectButton.setAttribute("value", "sel");
            selectButton.style.fontSize = 'x-small';
            selectButton.addEventListener("click", function () { SelectEventRow(element); });

            AddCellToRow(newTableRow, [ selectButton ]);
        }

        AddTextCellToRow(newTableRow, element.orderID);

        {
            let previewIcon = document.createElement('img');
            previewIcon.src = assetList.find( (a) => a.id == element.target).fileName;
            previewIcon.classList.add("previewImage");
            previewIcon.addEventListener('click', function() {  ChangeFlowEventTarget(element.id); });
            AddCellToRow(newTableRow, [ previewIcon ] );
        }
        

        if(element.startOffset != null)
            AddTextCellToRow(newTableRow, PrintNiceTransform(element.startOffset.X, element.startOffset.Y), "locationData");
        else
            AddTextCellToRow(newTableRow, "");

        if(element.endPosition != null)
            AddTextCellToRow(newTableRow, PrintNiceTransform(element.endPosition.X,element.endPosition.Y), "locationData");
        else
            AddTextCellToRow(newTableRow,"");

        $('#controlTable')[0].appendChild(newTableRow);

    });

    UpdatePathPreview();
}

function ChangeFlowEventTarget(id)
{
    
    let foundIndex = -1;

    let foundEvent = globalEventCache.find((ev) => ev.id == id);

    for(let i =0; i < assetList.length; ++i)
    {
        if(assetList[i].id == foundEvent.target)
        {
            foundIndex = i;
        }
    }    

    if(foundIndex + 1 >= assetList.length)
        foundEvent.target = assetList[0].id;
    else
        foundEvent.target = assetList[foundIndex + 1].id;

    UpdateEventList();
    
}

function PrintNiceTransform(x, y)
{
    return 'X: ' + RoundFloat(x) + '\nY: ' + RoundFloat(y); 
}

function RoundFloat(val)
{
    return Math.round(val * 100) / 100;
}



function CreateStreamlineEvent()
{
    if(streamlineStage == STREAMLINESTAGE_START)
    {
        CreateNewEvent(cacheMousePosition, null );
        selectedID = globalEventCache[globalEventCache.length - 1].id;
        streamlineStage = STREAMLINESTAGE_END;
    }
    else if (streamlineStage == STREAMLINESTAGE_END)
    {
        var foundEvent = globalEventCache.find( (ev) => ev.id == selectedID);

        if(foundEvent !== undefined)
        {
            foundEvent.endPosition = cacheMousePosition;

            CreateNewEvent(cacheMousePosition, null );
            selectedID = globalEventCache[globalEventCache.length - 1].id;
        }
        else
        {
            console.error('ID not found in event cache ' + selectedID);
        }
        
    }
    
    UpdateEventList();
}