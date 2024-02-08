
let isPaused = false;
let pathPreviewMode = false; 

function PauseActiveTween()
{
    isPaused = !isPaused;

    if(isPaused)
    {
        activeTween.pause();
    }
    else
    {
        activeTween.resume();
    }
}

function ShiftEvent(direction)
{//fis this function so it uses the orderid instead of the index of the collection
    let foundIndex = -1;

    for(let i=0; i < globalEventCache.length && foundIndex == -1; ++i)
    {
        if(globalEventCache[i].id == selectedID)
        {
            foundIndex = i;
        }
    }

    if(foundIndex == -1)
        foundIndex = 0;

    let newIndex = foundIndex + direction;

    if(newIndex < 0)
        newIndex = globalEventCache.length -1;
    else if (newIndex >= globalEventCache.length )
        newIndex = 0;

    selectedID = globalEventCache[newIndex].id;
    $('#ddl_event_steps')[0].value = selectedID;
}



function ChangePathPreviewMode()
{
    pathPreviewMode = !pathPreviewMode;

    UpdatePathPreview();
}

function CreateDiagramControls()
{
    let diagramArea = $('#diagram_area')[0];

    let diagramImage = $('#diagram_image')[0];

    let controlArea = document.createElement('div');
    controlArea.classList.add('DiagramControlBar');
    
    {//main animation drop down        
        let ddlFlowAnimation = document.createElement('select');
        
        let emptyOption = document.createElement('option');
        emptyOption.text = '----';
        ddlFlowAnimation.appendChild(emptyOption);

        loadedData.forEach( (data) => {

            let newOption = document.createElement('option');
            newOption.text = data.name;
            newOption.value = data.id;
            ddlFlowAnimation.appendChild(newOption);
        }
        );

        ddlFlowAnimation.addEventListener('change', () => 
            {
                selectedAnimationID = ddlFlowAnimation.value;
                UpdateEventDropDown(); 
            });
        
        controlArea.appendChild(document.createTextNode("Animation: ") );
        controlArea.appendChild(ddlFlowAnimation);
    }

    {//Event drop down        
        let ddlEventSteps = document.createElement('select');
        ddlEventSteps.id = 'ddl_event_steps';

        controlArea.appendChild(document.createTextNode("Event: ") );
        controlArea.appendChild(ddlEventSteps);
        
        UpdateEventDropDown(ddlEventSteps);
    }

    {//Play all
        let ddlPlayAll = document.createElement('input');
        ddlPlayAll.setAttribute('type', 'button');
        ddlPlayAll.setAttribute('value', 'Play All Events');
        ddlPlayAll.addEventListener('click', () => { StartTween(RUNMODE_MULTIPLE); } )
        controlArea.appendChild(ddlPlayAll);
    }

    {//Loop
        let ddLoop = document.createElement('input');
        ddLoop.id = 'ddl_loop';
        ddLoop.setAttribute('type', 'checkbox');
        controlArea.appendChild(document.createTextNode('Loop:'));
        controlArea.appendChild(ddLoop);
    }

    {//Show Path
        let ddShowPath = document.createElement('input');
        ddShowPath.id = 'ddl_show_path';
        ddShowPath.setAttribute('type', 'checkbox');
        ddShowPath.addEventListener('click', ChangePathPreviewMode);
        controlArea.appendChild(document.createTextNode('Show Path:'));
        controlArea.appendChild(ddShowPath);
    }

    let playButtons = document.createElement('div');
    playButtons.classList.add('playButtonBar');

    {//prev
        let ddlPrev = document.createElement('input');
        ddlPrev.setAttribute('type', 'button');
        ddlPrev.setAttribute('value', 'PREV');        
        ddlPrev.addEventListener('click', () => { ShiftEvent(-1); } )
        playButtons.appendChild(ddlPrev);
    }

    {//play single
        let ddlPlayOne = document.createElement('input');
        ddlPlayOne.setAttribute('type', 'button');
        ddlPlayOne.setAttribute('value', 'Play Event');
        ddlPlayOne.addEventListener('click', () => { StartTween(RUNMODE_SINGLE); } )
        playButtons.appendChild(ddlPlayOne);
    }
    {//play single
        let ddlPause = document.createElement('input');
        ddlPause.setAttribute('type', 'button');
        ddlPause.setAttribute('value', '(Un)Pause');
        ddlPause.addEventListener('click', () => { PauseActiveTween(); } )
        playButtons.appendChild(ddlPause);
    }

    {//next
        let ddlNext = document.createElement('input');
        ddlNext.setAttribute('type', 'button');
        ddlNext.setAttribute('value', 'NEXT');        
        ddlNext.addEventListener('click', () => { ShiftEvent(1); } )
        playButtons.appendChild(ddlNext);
    }

    controlArea.appendChild(playButtons);

    diagramArea.insertBefore(controlArea, diagramImage);
}

function UpdateEventDropDown(ddlEventSteps = null)
{

    if(ddlEventSteps == null)
        ddlEventSteps = $('#ddl_event_steps')[0];

    $(ddlEventSteps).empty();

    let emptyOption = document.createElement('option');
    emptyOption.text = '----';

    let foundAnimation = loadedData.find( (an) => an.id == selectedAnimationID);

    if(!foundAnimation)
    {
        ddlEventSteps.appendChild(emptyOption);
        return;
    }

    if(foundAnimation.stages[0].flowEvents.length == 0)
    {
        ddlEventSteps.appendChild(emptyOption);
    }

    foundAnimation.stages[0].flowEvents.forEach( (event) => {

        let newOption = document.createElement('option');
        newOption.text = event.orderID;
        newOption.value = event.id;
        ddlEventSteps.appendChild(newOption);
    }
    );

    ddlEventSteps.addEventListener('change', () => { 
        selectedID = $('#ddl_event_steps')[0].value;         
    } );
    
    
    globalEventCache = foundAnimation.stages[0].flowEvents;

    assetList = foundAnimation.assets;

    UpdateEventList();
    
}