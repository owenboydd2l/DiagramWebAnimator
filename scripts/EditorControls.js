const STREAMLINESTAGE_START = 0;
const STREAMLINESTAGE_END = 1;

let streamlineStage = STREAMLINESTAGE_START;
let isStreamlineMode = false;

const PLACEMENTMODE_STARTMODE = 1;
const PLACEMENTMODE_ENDMODE = 2;
const PLACEMENTMODE_NONE = 0;

let activateMode = PLACEMENTMODE_NONE;

let cacheMousePosition = {};

function PlaySingleFromEditor()
{
    StartTween(document.getElementById('diagram_area'), RUNMODE_SINGLE);
}

function CreateNewAnimation(targetArea)
{
    console.log('making new animation');


    let flowAnimation = new FlowAnimation(
        id = uuidv4(),
        name = uuidv4().substring(0,8),
        stages = [ 
            new AnimationStage( 
                id = uuidv4(),
                orderID = 0,
                flowEvents = []
                )],
        assets = []
    );

    let diagramData = DataFromArea(targetArea);

    
    diagramData.flowAnimations.push(flowAnimation);

    let animationOption = document.createElement("option");
    animationOption.text = flowAnimation.name;
    animationOption.value = flowAnimation.id;
    
    let ddlFlowAnimation = $(targetArea).find("#ddl_flow_animation");
    ddlFlowAnimation[0].appendChild(animationOption);
    ddlFlowAnimation.val(flowAnimation.id);
    
    UpdateEventList();

}

function ChangeStreamlineMode(targetArea, in_isNewStreamlineMode = null)
{
    
    if(in_isNewStreamlineMode == null)
        isStreamlineMode = !isStreamlineMode;
    else
        isStreamlineMode = in_isNewStreamlineMode;

    let animationID = SelectedAnimationtFromArea(targetArea);

    if(animationID == '----')
    {
        console.log('creating new animation');
        CreateNewAnimation(targetArea);
    }

    let eventList = GetEventListFromSelection(targetArea);

    if(eventList.length == 0)
        return;

    if(!isStreamlineMode)
    {
        if(eventList[eventList.length - 1].endPosition == null)
        {
            let newList = [];

            for(let i =0; i < eventList.length - 1; ++i)
                newList.push(eventList[i]);

            SetEventListFromSelection(targetArea, newList);
            UpdateEventList();
        }
    }
}

function SetStart()
{
    activateMode = PLACEMENTMODE_STARTMODE;
    startIndicator = CreateNewIndicator( document.getElementById('diagram_area'), startIndicator, true);
}

function SetEnd()
{
    activateMode = PLACEMENTMODE_ENDMODE;
    endIndicator = CreateNewIndicator(document.getElementById('diagram_area'), endIndicator, false);
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
   
    let diagram_area = $('#diagram_area')[0];

    $(diagram_area).find('#ddl_event_steps').val( event.id);

    let eventList = GetEventListFromSelection(diagram_area);

    UpdateEventList();
    
    var foundEvent = eventList.find( (ev) => ev.id == event.id);    

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
    activateMode = PLACEMENTMODE_NONE;    
}

function CreateNewEvent(in_startOffset = null, in_endPosition = null)
{
    let diagramArea = $("#diagram_area");

    let imageName = ImageFromDiagramArea(diagramArea)

    let eventList = GetEventListFromSelection(diagramArea);
    
    let newEvent = new FlowEvent( id = uuidv4(), 
        orderID = eventList.length == 0 ? 1 : eventList.reduce((max, event) => max.orderID > event.orderID ? max : event).orderID + 1, 
        target = 1, 
        endPosition = in_endPosition, 
        startOffset =  in_startOffset, 
        duration = 2000, 
        transformType = null);

    let animationID = SelectedAnimationtFromArea(diagramArea);

    animationCache.find( t => t.imageName == imageName ).flowAnimations.find( a => a.id == animationID).stages[0].flowEvents.push(newEvent);    

    UpdateEventList();

    let ddlEventSteps = diagramArea.find("#ddl_event_steps")[0];

    console.log(ddlEventSteps);
    
    let newOption = document.createElement('option');
    newOption.text = newEvent.orderID;
    newOption.value = newEvent.id;

    ddlEventSteps.appendChild(newOption);

    ddlEventSteps.value = newEvent.id;

    

    return newEvent;
}

function UpdatePathPreview()
{
    let diagramAreaJ = $('#diagram_area');

    console.log(diagramAreaJ);

    diagramAreaJ.each( function()
    {
        let diagramArea = this;
            
        let diagramCanvasJ = $(diagramArea).find('#diagram_canvas');

        diagramCanvasJ.each( function()
        {
            let diagramCanvas = this;
        
            let canvasContext = diagramCanvas.getContext('2d');
            canvasContext.clearRect(0, 0, diagramCanvas.offsetWidth, diagramCanvas.offsetHeight);

            let diagramArea = diagramAreaJ[0];

            if(!GetIsPathPreviewMode(diagramArea))
            {
                console.log("Not in path preview mode");
                return;
            }
            else
                console.log("path preview mode");

            let previewData = [];

            let eventList = GetEventListFromSelection(diagramArea);

            for(let i=0; i < eventList.length; ++i)
            {
                if(eventList[i].startOffset == null || eventList[i].endPosition == null)
                    continue;

                previewData.push( { start : eventList[i].startOffset, end : eventList[i].endPosition });
            }            
        
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

    let diagramArea = $('#diagram_area');

    let eventList = GetEventListFromSelection(diagramArea);

    let selectedEventID = SelectedEventFromArea(diagramArea);    

    eventList.forEach(element => {
        
        if(element == null || element === undefined)
            return;

        var newTableRow = document.createElement("tr");

        if(element.id === selectedEventID)
        {
            newTableRow.style.backgroundColor = 'red';
        }
        
        {//select button
            let selectButton = document.createElement("input");
            selectButton.setAttribute("type", "button");
            selectButton.setAttribute("value", "sel");
            selectButton.style.fontSize = 'x-small';
            selectButton.addEventListener("click", function () { SelectEventRow(element); });

            AddCellToRow(newTableRow, [ selectButton ]);
        }

        AddTextCellToRow(newTableRow, element.orderID);

        {//icon preview
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
            
            transformIcon.addEventListener("click", function() { EditorChangeTransformType(element);  } );
            AddCellToRow(newTableRow, [ transformIcon ]);
        }

        if(controlTable.length > 0)
            controlTable[0].appendChild(newTableRow);

    });

    UpdatePathPreview();

    ExportEventsToJson();
}

function ExportEventsToJson()
{
    let diagramData = DataFromArea( $('#diagram_area') );
    
    $('#event_json').text( JSON.stringify(diagramData, null, 2) );
}

function EditorChangeTransformType(flowEvent)
{
    flowEvent.ChangeTransformType();
    UpdateEventList();
}

function ChangeFlowEventTarget(id)
{
    let diagramArea = $('#diagram_area');

    let eventlist = GetEventListFromSelection(diagramArea);

    let foundIndex = -1;

    let foundEvent = eventlist.find((ev) => ev.id == id);

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
    let diagramArea = $("#diagram_area");
    
    let eventList = GetEventListFromSelection( diagramArea );

    let eventID = SelectedEventFromArea(diagramArea);

    if(streamlineStage == STREAMLINESTAGE_START)
    {
        CreateNewEvent(cacheMousePosition, null );

        streamlineStage = STREAMLINESTAGE_END;
    }
    else if (streamlineStage == STREAMLINESTAGE_END)
    {
        var foundEvent = eventList.find( (ev) => ev.id == eventID);

        if(foundEvent !== undefined)
        {
            foundEvent.endPosition = cacheMousePosition;

            CreateNewEvent(cacheMousePosition, null );
            
        }
        else
        {
            console.error('ID not found in event cache ' + eventID);
        }
        
    }
    
    UpdateEventList();
}