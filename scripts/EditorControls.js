const STREAMLINESTAGE_START = 0;
const STREAMLINESTAGE_END = 1;

let streamlineStage = STREAMLINESTAGE_START;
let isStreamlineMode = false;

function PlaySingleFromEditor()
{
    StartTween(document.getElementById('diagram_area'), RUNMODE_SINGLE);
}

function ChangeStreamlineMode(targetArea, in_isNewStreamlineMode)
{
    isStreamlineMode = in_isNewStreamlineMode;

    if(globalEventCache.length == 0)
        return;

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
    let assetTable = $('#assetTable');

    if(assetTable.length == 0)
        return; 

    assetTable.empty();

    assetList.forEach(element => {
        var newImage = document.createElement('img');
        newImage.setAttribute('src', element.fileName);
        newImage.classList.add('previewImage');
        assetTable[0].appendChild(newImage);
    });
}


function SelectEventRow(event)
{
    ClearEditorSettings();
    selectedID = event.id;
    
    UpdateEventList();

    var foundEvent = globalEventCache.find( (ev) => ev.id == selectedID);

    let diagram_area = $('#diagram_area')[0];

    if(foundEvent.startOffset != null)
    {
        startIndicator = CreateNewIndicator(diagram_area, startIndicator, true);
        
        let indicatorSize = PixelToPercent(diagram_area, startIndicator.offsetWidth, startIndicator.offsetHeight );
        SetImagePosition(startIndicator, foundEvent.startOffset.x - (indicatorSize.x / 2.0), foundEvent.startOffset.y - (indicatorSize.y / 2.0));
    }

    if(foundEvent.endPosition != null)
    {
        endIndicator = CreateNewIndicator(diagram_area, endIndicator, false);

        let indicatorSize = PixelToPercent(diagram_area, endIndicator.offsetWidth, endIndicator.offsetHeight );

        SetImagePosition(endIndicator, foundEvent.endPosition.x - (indicatorSize.x / 2.0), foundEvent.endPosition.y - (indicatorSize.y / 2.0));
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
}

function CreateNewEvent(in_startOffset = null, in_endPosition = null)
{
    
    let newEvent = new FlowEvent( id = uuidv4(), 
        orderID = globalEventCache.length == 0 ? 1 : globalEventCache.reduce((max, event) => max.orderID > event.orderID ? max : event).orderID + 1, 
        target = 1, 
        endPosition = in_endPosition, 
        startOffset =  in_startOffset, 
        duration = 2000, 
        transformType = null);

    globalEventCache.push(newEvent);

    selectedID = newEvent.id;

    UpdateEventList();

    return newEvent;
}

function UpdatePathPreview()
{
    let diagramAreaJ = $('#diagram_area');

    diagramAreaJ.each( function()
    {
        let diagramArea = this;
            
        let diagramCanvasJ = $(diagramArea).find('#diagram_canvas');

        diagramCanvasJ.each( function()
        {
            let diagramCanvas = this;
        
            let canvasContext = diagramCanvas.getContext('2d');
            canvasContext.clearRect(0, 0, diagramCanvas.offsetWidth, diagramCanvas.offsetHeight);

            if(!pathPreviewMode)
                return;

            let previewData = [];

            for(let i=0; i < globalEventCache.length; ++i)
            {
                if(globalEventCache[i].startOffset == null || globalEventCache[i].endPosition == null)
                    continue;

                previewData.push( { start : globalEventCache[i].startOffset, end : globalEventCache[i].endPosition });
            }

            let diagramArea = diagramAreaJ[0];
        
            for(let j=0; j < previewData.length; ++j)
            {
                canvasContext.beginPath(); 
                canvasContext.moveTo( previewData[j].start.x * diagramArea.offsetWidth, previewData[j].start.y * diagramArea.offsetHeight);
                canvasContext.lineTo( previewData[j].end.x * diagramArea.offsetWidth, previewData[j].end.y * diagramArea.offsetHeight);
                canvasContext.strokeStyle = "red";
                canvasContext.stroke();
            }    
        });
    });
    
}

function UpdateEventList()
{
    let controlTable = $('#controlTable');
    controlTable.empty();

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
            AddTextCellToRow(newTableRow, PrintNiceTransform(element.startOffset.x, element.startOffset.y), "locationData");
        else
            AddTextCellToRow(newTableRow, "");

        if(element.endPosition != null)
            AddTextCellToRow(newTableRow, PrintNiceTransform(element.endPosition.x,element.endPosition.y), "locationData");
        else
            AddTextCellToRow(newTableRow,"");

            {
                let transformIcon = document.createElement('img');
                transformIcon.style.width = 25 + "px";                

                let foundTransform = transformList.find( (tt ) => tt.id == element.transformType);

                if(foundTransform)
                {
                    transformIcon.setAttribute("src", foundTransform.icon );
                    transformIcon.setAttribute("title", foundTransform.tooltip);
                }
                
                transformIcon.addEventListener("click", function() { ChangeTransformType(element);  } );
                AddCellToRow(newTableRow, [ transformIcon ]);
            }

        if(controlTable.length > 0)
            controlTable[0].appendChild(newTableRow);

    });

    UpdatePathPreview();

    let stageList = [];

    stageList.push( new AnimationStage(
        id = uuidv4(),
        orderID = 1,
        flowEvents = globalEventCache
    ));

    let newAnimation = new FlowAnimation( id = uuidv4(),
        name = 'TEST',
        stages = stageList,
        assets = assetList);
    

    $('#event_json').text( JSON.stringify(newAnimation, null, 2) );
}

function ChangeTransformType(event)
{
    event.ChangeTransformType();
    UpdateEventList();
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


function CreateStreamlineEvent()
{
    if(streamlineStage == STREAMLINESTAGE_START)
    {
        CreateNewEvent(cacheMousePosition, null );

        streamlineStage = STREAMLINESTAGE_END;
    }
    else if (streamlineStage == STREAMLINESTAGE_END)
    {
        var foundEvent = globalEventCache.find( (ev) => ev.id == selectedID);

        if(foundEvent !== undefined)
        {
            foundEvent.endPosition = cacheMousePosition;

            CreateNewEvent(cacheMousePosition, null );
            
        }
        else
        {
            console.error('ID not found in event cache ' + selectedID);
        }
        
    }
    
    UpdateEventList();
}