
function PauseActiveTween(targetArea)
{
    let tweenID = targetArea.getAttribute('data-tween-id');

    let activeTween = tweenList.find( (t) => t.id == tweenID).tween;

    let isPaused = GetIsPaused(targetArea);
    
    isPaused = !isPaused;
    
    SetIsPaused(targetArea, isPaused);

    if(isPaused)
    {
        activeTween.pause();
    }
    else
    {
        activeTween.resume();
    }
}

function ShiftEvent(targetArea, direction)
{//fix this function so it uses the orderid instead of the index of the collection
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
    $(targetArea).find('#ddl_event_steps')[0].value = selectedID;
}



function ChangePathPreviewMode(targetArea)
{
    let previewPathMode = GetIsPathPreviewMode(targetArea);

    SetIsPathPreviewMode(targetArea, !previewPathMode );

    UpdatePathPreview();
}

function CreateDiagramControls()
{
    let diagramAreaJ = $('#diagram_area');

    diagramAreaJ.each(function()
    {
        let diagramArea = this;

        let diagramImage = $(diagramArea).find('#diagram_image')[0];

        let controlArea = document.createElement('div');
        controlArea.classList.add('DiagramControlBar');
    
    {//main animation drop down
        let ddlFlowAnimation = document.createElement('select');
        ddlFlowAnimation.id = 'ddl_flow_animation';
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
                UpdateEventDropDown(diagramArea);
            });
        
        controlArea.appendChild(document.createTextNode("Animation: ") );
        controlArea.appendChild(ddlFlowAnimation);
    }

    {//Event drop down        
        let ddlEventSteps = document.createElement('select');
        ddlEventSteps.id = 'ddl_event_steps';

        controlArea.appendChild(document.createTextNode("Event: ") );
        controlArea.appendChild(ddlEventSteps);
        
        UpdateEventDropDown(diagramArea);
    }

    {//Play all
        controlArea.appendChild( CreateInputControl('Play All Events', () => { StartTween(diagramArea, RUNMODE_MULTIPLE); } ));
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
        ddShowPath.addEventListener('click', () => { ChangePathPreviewMode(diagramArea) } );
        controlArea.appendChild(document.createTextNode('Show Path:'));
        controlArea.appendChild(ddShowPath);
    }

    let playButtons = document.createElement('div');
    playButtons.classList.add('playButtonBar');

    {//prev
        playButtons.appendChild( CreateInputControl('PREV', () => { ShiftEvent(diagramArea, -1); } ));
    }

    {//play single
        playButtons.appendChild( CreateInputControl('Play Event', () => { StartTween (diagramArea, RUNMODE_SINGLE); } ));
    }

    {//play single
        playButtons.appendChild( CreateInputControl('(Un)Pause', () => { PauseActiveTween(diagramArea); } ));        
    }

    {//next
        playButtons.appendChild( CreateInputControl('NEXT', () => { ShiftEvent(diagramArea, 1); } ));        
    }

    controlArea.appendChild(playButtons);
    
    diagramArea.insertBefore(controlArea, diagramImage);
    });
}

function CreateInputControl(text, onclick)
{
    let ddlNew = document.createElement('input');
    ddlNew.setAttribute('type', 'button');
    ddlNew.setAttribute('value', text);
    ddlNew.addEventListener('click', onclick );
    return ddlNew;
}

function UpdateEventDropDown(targetArea)
{
    
    let ddlEventSteps = $(targetArea).find('#ddl_event_steps')[0];

    let ddlFlowAnimation = $(targetArea).find('#ddl_flow_animation')[0];

    if(!ddlEventSteps)
        return;

    $(ddlEventSteps).empty();

    let emptyOption = document.createElement('option');
    emptyOption.text = '----';

    let foundAnimation = loadedData.find( (an) => an.id == ddlFlowAnimation.value);

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