const STREAMLINESTAGE_START = 0;
const STREAMLINESTAGE_END = 1;

let streamlineStage = STREAMLINESTAGE_START;
let isStreamlineMode = false;

const PLACEMENTMODE_STARTMODE = 1;
const PLACEMENTMODE_ENDMODE = 2;
const PLACEMENTMODE_NONE = 0;

let activateMode = PLACEMENTMODE_NONE;

const EditorLiveData =
{
    cacheMousePosition : {},
    activateMode : PLACEMENTMODE_NONE
};

const default_assetList = 
[ 
    new Asset(1, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTukEhbRDPETDiNMl5ZO8Lm3nQRSzPLnvdsPK30nTmMig&s'),
    new Asset(2, 'static/images/136443.png'),
    new Asset(3, 'static/images/1950399.webp') 
];

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
        assets = default_assetList
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

    if(!isStreamlineMode)
    {
        let eventList = GetEventListFromSelection(targetArea);

        if(eventList.length == 0)
            return;

        if(eventList[eventList.length - 1].endPosition == null)
        {
            let newList = [];

            for(let i =0; i < eventList.length - 1; ++i)
                newList.push(eventList[i]);

            SetEventListFromSelection(targetArea, newList);
            UpdateEventList();
        }

        return;
    }

    let animationID = SelectedAnimationtFromArea(targetArea);

    if(animationID == '----')
    {
        console.log('creating new animation');

        CreateNewAnimation(targetArea);        
    }
    
}

function SetStart()
{
    EditorLiveData.activateMode = PLACEMENTMODE_STARTMODE;
    PageLiveData.startIndicator = CreateNewIndicator( document.getElementById('diagram_area'), PageLiveData.startIndicator, true);
}

function SetEnd()
{
    EditorLiveData.activateMode = PLACEMENTMODE_ENDMODE;
    PageLiveData.endIndicator = CreateNewIndicator(document.getElementById('diagram_area'), PageLiveData.endIndicator, false);
}

function AddAsset()
{
    var newFilePath = $('#txtNewAssetPath')[0].value;

    let diagramArea = $('#diagram_area');

    let selectedAssetList = GetAssetListFromSelection( diagramArea );

    var newAsset = new Asset(id = uuidv4(), fileName = newFilePath );

    selectedAssetList.push(newAsset);

    SetAssetListFromSelection(diagramArea, selectedAssetList);

    UpdateAssetList();
}

function UpdateAssetList()
{
    let assetTable = $('#assetTable');

    if(assetTable.length == 0)
        return;    

    assetTable.empty();

    let selectedAssetList = GetAssetListFromSelection( $('#diagram_area') );

    selectedAssetList.forEach(element => {
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
        PageLiveData.startIndicator = CreateNewIndicator(diagram_area, PageLiveData.startIndicator, true);
        
        let indicatorSize = PixelToPercent(diagram_area, PageLiveData.startIndicator.offsetWidth, PageLiveData.startIndicator.offsetHeight );
        SetImagePosition(PageLiveData.startIndicator, foundEvent.startOffset.x - (indicatorSize.x / 2.0), foundEvent.startOffset.y - (indicatorSize.y / 2.0));
    }

    if(foundEvent.endPosition != null)
    {
        PageLiveData.endIndicator = CreateNewIndicator(diagram_area, PageLiveData.endIndicator, false);

        let indicatorSize = PixelToPercent(diagram_area, PageLiveData.endIndicator.offsetWidth, PageLiveData.endIndicator.offsetHeight );

        SetImagePosition(PageLiveData.endIndicator, foundEvent.endPosition.x - (indicatorSize.x / 2.0), foundEvent.endPosition.y - (indicatorSize.y / 2.0));
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
    EditorLiveData.activateMode = PLACEMENTMODE_NONE;    
}

function DeleteSelected()
{
    let diagramArea = $("#diagram_area");

    let eventList = GetEventListFromSelection(diagramArea);

    if(eventList.length == 0)
        return;
    
    let eventID = SelectedEventFromArea(diagramArea);

    let newList = [];

    for(let i=0; i != eventList.length; ++i)
    {
        if(eventList[i].id !== eventID)
            newList.push(eventList[i]);
    }

    SetEventListFromSelection(diagramArea, newList);

    UpdateEventList();
    
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

    if(animationID == '----')
    {
        CreateNewAnimation(diagramArea);
        animationID = SelectedAnimationtFromArea(diagramArea);
    }

    UserLiveData.animationCache.find( t => t.imageName == imageName ).flowAnimations.find( a => a.id == animationID).stages[0].flowEvents.push(newEvent);    

    UpdateEventList();

    let ddlEventSteps = diagramArea.find("#ddl_event_steps")[0];

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
                return;
            }

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

    let selectedAssets = GetAssetListFromSelection(diagramArea);

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
            previewIcon.src = selectedAssets.find( (a) => a.id == element.target).fileName;
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

    let selectedAssetList = GetAssetListFromSelection(diagramArea);

    for(let i =0; i < selectedAssetList.length; ++i)
    {
        if(selectedAssetList[i].id == foundEvent.target)
        {
            foundIndex = i;
        }
    }    

    if(foundIndex + 1 >= selectedAssetList.length)
        foundEvent.target = selectedAssetList[0].id;
    else
        foundEvent.target = selectedAssetList[foundIndex + 1].id;

    UpdateEventList();
    
}


function CreateStreamlineEvent()
{
    let diagramArea = $("#diagram_area");
    
    let eventList = GetEventListFromSelection( diagramArea );

    let eventID = SelectedEventFromArea(diagramArea);

    if(streamlineStage == STREAMLINESTAGE_START)
    {
        CreateNewEvent(EditorLiveData.cacheMousePosition, null );

        streamlineStage = STREAMLINESTAGE_END;
    }
    else if (streamlineStage == STREAMLINESTAGE_END)
    {
        var foundEvent = eventList.find( (ev) => ev.id == eventID);

        if(foundEvent !== undefined)
        {
            foundEvent.endPosition = EditorLiveData.cacheMousePosition;

            CreateNewEvent(EditorLiveData.cacheMousePosition, null );
            
        }
        else
        {
            console.error('ID not found in event cache ' + eventID);
        }
        
    }
    
    UpdateEventList();
}