
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
    
    let diagramData = DataFromArea(targetArea);
    
    let eventID = SelectedEventFromArea(targetArea);
    let animID = SelectedAnimationtFromArea(targetArea);

    let foundIndex = -1;

    let foundAnimation = diagramData.flowAnimations.find( (anim) => anim.id == animID);

    let animEvents = foundAnimation.stages[0].flowEvents;
    
    for(let i=0; i != animEvents.length && foundIndex == -1; ++i)
    {
        if(animEvents[i].id == eventID)
        {
            foundIndex = i;
        }
    }

    if(foundIndex == -1)
    {
        console.warn('index not found ' + eventID);
        foundIndex = 0;
    }

    let newIndex = foundIndex + direction;

    if(newIndex < 0)
        newIndex = animEvents.length -1;
    else if (newIndex >= animEvents.length )
        newIndex = 0;

    $(targetArea).find('#ddl_event_steps')[0].value = animEvents[newIndex].id;
}



function ChangePathPreviewMode(targetArea)
{
    let previewPathMode = GetIsPathPreviewMode(targetArea);

    SetIsPathPreviewMode(targetArea, !previewPathMode );

    UpdatePathPreview();
}

function DataFromArea(targetArea)
{
    let imageName = ImageFromDiagramArea(targetArea);
    
    return animationCache.find( (cacheItem) => cacheItem.imageName === imageName );
}

function SelectedEventFromArea(targetArea)
{
    let ddlEvents = $(targetArea).find('#ddl_event_steps');

    return ddlEvents.val();
}

function SelectedAnimationtFromArea(targetArea)
{
    let ddlEvents = $(targetArea).find('#ddl_flow_animation');

    return ddlEvents.val();
}

function GetEventListFromSelection(targetArea)
{
    
    let diagramData = DataFromArea(targetArea);

    let animID = SelectedAnimationtFromArea(targetArea);

    let foundAnimation = diagramData.flowAnimations.find( (anim) => anim.id == animID);
    
    if(foundAnimation === undefined)
        return [];    

    return foundAnimation.stages[0].flowEvents;
}

function SetAssetListFromSelection(targetArea, assetlist)
{
    
    let diagramData = DataFromArea(targetArea);

    let animID = SelectedAnimationtFromArea(targetArea);

    let foundAnimation = diagramData.flowAnimations.find( (anim) => anim.id == animID);
    
    if(foundAnimation === undefined)
        return [];    

    foundAnimation.assets = assetlist;
}

function GetAssetListFromSelection(targetArea)
{
    
    let diagramData = DataFromArea(targetArea);

    let animID = SelectedAnimationtFromArea(targetArea);

    let foundAnimation = diagramData.flowAnimations.find( (anim) => anim.id == animID);
    
    if(foundAnimation === undefined)
        return [];    

    return foundAnimation.assets;
}

function SetEventListFromSelection(targetArea, eventList = [])
{

    let diagramData = DataFromArea(targetArea);

    let animID = SelectedAnimationtFromArea(targetArea);

    let foundAnimation = diagramData.flowAnimations.find( (anim) => anim.id == animID);

    foundAnimation.stages[0].flowEvents = eventList;
}

function CreateAnimationDropDown(targetArea)
{
    let diagramData = DataFromArea(targetArea);

    let ddlFlowAnimation = document.createElement('select');
    
    ddlFlowAnimation.id = 'ddl_flow_animation';
    
    let emptyOption = document.createElement('option');
    emptyOption.text = '----';
    ddlFlowAnimation.appendChild(emptyOption);

    diagramData.flowAnimations.forEach( (data) => {
            let newOption = document.createElement('option');
            newOption.text = data.name;
            newOption.value = data.id;
            ddlFlowAnimation.appendChild(newOption);
        }
    );

    ddlFlowAnimation.addEventListener('change', () => 
            {
                UpdateEventDropDown(targetArea);
            });
    
    return ddlFlowAnimation;
}

function CrateEventDropDown()
{
    let ddlEventSteps = document.createElement('select');
    ddlEventSteps.id = 'ddl_event_steps';
    return ddlEventSteps;
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
    
        //main animation drop down
        controlArea.appendChild(document.createTextNode("Animation: ") );
        controlArea.appendChild(CreateAnimationDropDown(diagramArea));    

        //Event drop down
        controlArea.appendChild(document.createTextNode("Event: ") );
        controlArea.appendChild(CrateEventDropDown());
        
        UpdateEventDropDown(diagramArea);    

        //Play all
        controlArea.appendChild( CreateInputControl('Play All Events', () => { StartTween(diagramArea, RUNMODE_MULTIPLE); } ));
    
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
        
        controlArea.appendChild(CreatePlayButtons(diagramArea));
    
        diagramArea.insertBefore(controlArea, diagramImage);
    });
}

function CreatePlayButtons(targetArea)
{
    let playButtons = document.createElement('div');
    playButtons.classList.add('playButtonBar');

    //prev
    playButtons.appendChild( CreateInputControl('PREV', () => { ShiftEvent(targetArea, -1); } ));

    //play single
    playButtons.appendChild( CreateInputControl('Play Event', () => { StartTween (targetArea, RUNMODE_SINGLE); } ));

    //play single
    playButtons.appendChild( CreateInputControl('(Un)Pause', () => { PauseActiveTween(targetArea); } ));

    //next
    playButtons.appendChild( CreateInputControl('NEXT', () => { ShiftEvent(targetArea, 1); } ));    

    return playButtons;
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
    
    let diagramData = DataFromArea(targetArea);

    let ddlEventSteps = $(targetArea).find('#ddl_event_steps')[0];

    let ddlFlowAnimation = $(targetArea).find('#ddl_flow_animation')[0];

    if(!ddlEventSteps)
        return;

    $(ddlEventSteps).empty();

    let emptyOption = document.createElement('option');
    emptyOption.text = '----';

    let foundAnimation = diagramData.flowAnimations.find( (an) => an.id == ddlFlowAnimation.value);

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
   
    UpdateEventList();
    
}