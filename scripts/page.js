let startIndicator = null;
let endIndicator = null;

let tweenList = [];

const RUNMODE_SINGLE = 0;
const RUNMODE_MULTIPLE = 1;

const GREEN_CIRCLE_IMAGE = 'static/images/800px-Circle_-_green_simple.png';

const WHITE_CIRCLE_IMAGE = 'static/images/800px-Circle_-_black_simple.svg.png';

function ResizeDiagramCanvas()
{
    let diagramCanvasList = $('#diagram_canvas');

    for(let i=0; i != diagramCanvasList.length; ++i)
    {
        let diagramCanvas = diagramCanvasList[i];
        diagramCanvas.setAttribute('width', diagramCanvas.parentElement.offsetWidth + "px");
        diagramCanvas.setAttribute('height', diagramCanvas.parentElement.offsetHeight + "px");

        UpdatePathPreview();
    }
}


function PerformLocationCheck(event)
{
    if($('#currentposition').length > 0)
        $('#currentposition')[0].innerHTML = event.clientX + ', ' + event.clientY;
        
    $('#pageScrollTop').text( document.body.scrollTop );
    
    let diagramAreaList = $('#diagram_area');

    diagramAreaList.each( function()
    {
        let diagramArea = this;
        
        let diagramTransform = TransformFromElement(diagramArea);        

        let mousePosition = new Point(event.clientX, 
            event.clientY + document.body.scrollTop);
        
        if($('#imagePosition').length > 0)
            $('#imagePosition')[0].innerHTML = JSON.stringify(diagramTransform);
        
        if( IsOverlap(diagramTransform, mousePosition ) )
        {
            
            $('#isOverArea').text('YES');

            let clickPosition = ViewToImagePosition(diagramArea, mousePosition.x, mousePosition.y);
            
            EditorLiveData.cacheMousePosition = PixelToPercent(diagramArea, clickPosition.x, clickPosition.y);
        
            if(activateMode == PLACEMENTMODE_NONE)
                return;
            
            let targetElement = null;

            let targetIndicator = null;
           
            if(activateMode == PLACEMENTMODE_STARTMODE)
            {
                targetElement = document.getElementById('startData');
                targetIndicator =startIndicator;
                    
            }
            else if (activateMode == PLACEMENTMODE_ENDMODE)
            {
                targetElement = document.getElementById('endData');
                targetIndicator = endIndicator;
            }
            
            let relativeClickPosition = new Point(x = clickPosition.x - (targetIndicator.offsetWidth / 2.0), y = clickPosition.y - (targetIndicator.offsetHeight / 2.0));
            
            let percentPosition = PixelToPercent(diagram_area, relativeClickPosition.x, relativeClickPosition.y);

            targetElement.innerText = JSON.stringify( percentPosition);

            SetImagePosition( targetIndicator, percentPosition.x, percentPosition.y );
            
            
            
        }
        else
        {
            $('#isOverArea').text('NO');
        }
    });
}

function SetupDiagramAnimator()
{
    
    document.addEventListener('mousemove', (event) => {
        
        PerformLocationCheck(event);
        
    });
    
    
    LoadSampleData();

    UpdateAssetList();

    CreateDiagramControls();

    ResizeDiagramCanvas();

}

function LoadSampleData()
{
    let newData = [];

    if(typeof sampleData === 'undefined')
        return;

    for(let i=0; i != sampleData.length; ++i)
    {
        let rawData = JSON.parse(sampleData[i]);

        for(let j=0; j != rawData.length; ++j)
        {
            let animationList = [];

            for(let k=0; k != rawData[j].flowAnimations.length;++k)
            {                
                let flowAnim = Object.create(FlowAnimation.prototype, Object.getOwnPropertyDescriptors(rawData[j].flowAnimations[k]))

                let convertedEvents = [];

                for(let l=0;l != flowAnim.stages[0].flowEvents.length;++l)
                    convertedEvents.push( Object.create(FlowEvent.prototype, Object.getOwnPropertyDescriptors(flowAnim.stages[0].flowEvents[l])) );

                flowAnim.stages[0].flowEvents = convertedEvents;

                animationList.push(flowAnim);
            }

            let newImage = new DiagramImage( imageName = rawData[j].imageName, flowAnimations = animationList);

            newData.push(newImage);
        }

    }

    animationCache = newData;
}

function ViewToImagePosition(targetArea, clientX, clientY)
{
    let offsetTop = targetArea.offsetTop;
    let offsetLeft = targetArea.offsetLeft;
    
    return new Point( (clientX - offsetLeft), (clientY - offsetTop));
}

function CreateNewIndicator(targetArea, indicatorElement, isStart = false)
{
    if(indicatorElement === undefined || indicatorElement == null)
    {
        console.log('creating new indicator');
        indicatorElement = document.createElement("img");
        AddElementToDiagram(targetArea, indicatorElement);
        
        if(isStart)
            indicatorElement.setAttribute('src', GREEN_CIRCLE_IMAGE);
        else
            indicatorElement.setAttribute('src', WHITE_CIRCLE_IMAGE);

        indicatorElement.classList.add('indicator');
    }

    indicatorElement.style.zIndex = 0;
    
    return indicatorElement;
}			

function AddElementToDiagram(diagramArea, element)
{
    diagramArea.insertBefore(element, diagramArea.firstChild);
}

function PerformSingleEventStep(targetImage)
{
    
    let eventList = GetEventListFromSelection(targetImage.parentElement);

    let eventID = SelectedEventFromArea(targetImage.parentElement);

    let foundEvent = eventList.find( (ev) => ev.id == eventID);

    if(foundEvent !== undefined)
    {
        if(activateMode == PLACEMENTMODE_STARTMODE)
        {
            foundEvent.startOffset = EditorLiveData.cacheMousePosition;            
        }
        else if (activateMode == PLACEMENTMODE_ENDMODE)
        {
            foundEvent.endPosition = EditorLiveData.cacheMousePosition;
        }

        UpdateEventList();
    }    

    activateMode = PLACEMENTMODE_NONE;    
}

function StartTween(targetArea, runMode = RUNMODE_SINGLE)
{
    
    SetRunMode(targetArea, runMode);

    let box = GetCacheBox(targetArea);
    
    box.setAttribute('data-start-width', box.offsetWidth);
    box.setAttribute('data-start-height', box.offsetHeight);

    SetRunningEventIndex(targetArea, 0);

    ChangeStreamlineMode(targetArea, false);

    SetupAllEventTween(targetArea);
}


function ActivateImage(image)
{		
    if(isStreamlineMode)
        CreateStreamlineEvent(image);
    else
        PerformSingleEventStep(image);
    
}

function OnFinishTween(targetArea)
{
    let isCleanupTime = true;

    let runningEventIndex = GetRunningEventIndex(targetArea);

    let runMode = GetRunMode(targetArea);

    let eventList = GetEventListFromSelection(targetArea);
    
    if(runMode == RUNMODE_MULTIPLE)
    {        
        runningEventIndex++;
        SetRunningEventIndex(targetArea, runningEventIndex);
    }

    if($(targetArea).find('#ddl_loop')[0].checked)
    {
        console.log('loop mode')
        isCleanupTime = false;

        if(runMode == RUNMODE_MULTIPLE)
        {
            if(runningEventIndex >= eventList.length)
            {
                runningEventIndex = 0;
                SetRunningEventIndex(targetArea, runningEventIndex);
            }
            
        }
        
    }   
    else
    {
        if(runMode == RUNMODE_MULTIPLE)
        {
            if(runningEventIndex < eventList.length)
            {
                isCleanupTime = false;
            }
        }
    }

    if(isCleanupTime)
    {
        console.log("Finished all tweens");
        let box = GetCacheBox(targetArea)
        box.style.display = 'none';
        box.style.width = box.getAttribute('data-start-width');
        box.style.height = box.getAttribute('data-start-height');
        
        ClearEditorSettings();

        let animationRequestID = targetArea.getAttribute("data-animation-id");
        cancelAnimationFrame(animationRequestID);
    }
    else
    {
        console.log("Trigger Next Step");
        SetupAllEventTween(targetArea);
    }
}

function GetCacheBox(targetArea)
{
    let box = $(targetArea).find('#box')[0];

    //TODO: Make box and don't rely on it being made on the page
    box.style.display = 'inline-block';

    return box;
}

function SetupAllEventTween(targetArea)
{

    let progressBar = new ProgressDisplay( $(targetArea)[0] );

    progressBar.UpdateProgress(0);
    progressBar.Redraw();

    let box = GetCacheBox(targetArea);

    let runMode = GetRunMode(targetArea);

    let isSingleMode = (runMode == RUNMODE_SINGLE);
    let foundEvent = null;

    //todo fix?
    let eventList = GetEventListFromSelection(targetArea);
    
    if(isSingleMode)
        foundEvent = eventList.find( (ev) => ev.id == SelectedEventFromArea(targetArea));
    else
        foundEvent = eventList[GetRunningEventIndex(targetArea)];

    if(!foundEvent)
    {
        box.style.display = "none";
        console.warn( runMode + ' EVENT NOT FOUND ' + (isSingleMode ? GetRunningEventIndex(targetArea) : GetRunningEventIndex(targetArea)));
        return;
    }

    let selectedAssetlist = GetAssetListFromSelection(targetArea);

    box.setAttribute('src', selectedAssetlist.find( 
        (a) => a.id == foundEvent.target).fileName);

    startIndicator = CreateNewIndicator(targetArea, startIndicator, true);
    endIndicator = CreateNewIndicator(targetArea, endIndicator, false);

    let indicatorSize = PixelToPercent(targetArea, startIndicator.offsetWidth, startIndicator.offsetHeight );

    SetImagePosition(startIndicator, foundEvent.startOffset.x  - (indicatorSize.x / 2.0), foundEvent.startOffset.y - (indicatorSize.y / 2.0));
    SetImagePosition(endIndicator, foundEvent.endPosition.x  - (indicatorSize.x / 2.0), foundEvent.endPosition.y - (indicatorSize.y / 2.0));

    let startPosition = ObjectToPosition(startIndicator);
    let endPosition = ObjectToPosition(endIndicator);

    const startCoords = {x: startPosition.x, y: startPosition.y};
    const endCoords = {x: endPosition.x, y: endPosition.y};
    
    if(isSingleMode)
    {
        startIndicator.style.zIndex = -1;
        endIndicator.style.zIndex = -1;
    }

    let newTween = new TWEEN.Tween(startCoords, false) // Create a new tween that modifies 'coords'.
        .to(endCoords, 3000) 
        .easing(TWEEN.Easing.Quadratic.InOut) // Use an easing function to make the animation smooth.
        .onUpdate(() => {
            
            
            let progress = PositionToProgress(startPosition, startCoords, endCoords);

            progressBar.UpdateProgress(progress);
            progressBar.Redraw();

            //let invertedParabolaVal = 4 * Math.pow(progress, 2) - (4/1 * progress) + 1;//secret knowledge O_o
            
            let newHeight = box.getAttribute('data-start-height');
            let newWidth = box.getAttribute('data-start-width');

            let foundTransform = transformList.find( (tt) => tt.id == foundEvent.transformType);

            
            if(foundTransform)
            {               
                newHeight *= foundTransform.formula(progress);
                newWidth *= foundTransform.formula(progress);
            }            
            
            box.style.width = newWidth;
            box.style.height = newHeight;            
            box.style.setProperty('transform', 'translate(' + (startCoords.x - (newWidth / 2.0)) + 'px, ' + (startCoords.y) + 'px)')
            
        })
        .onComplete( () => { OnFinishTween(targetArea); })
        .start(); // Start the tween immediately.

    // Setup the animation loop.
    function animate(time) {
        newTween.update(time)
        requestAnimationFrame(animate)
    }

    let newTweenRecord = { id : uuidv4(), tween : newTween };
    tweenList.push( newTweenRecord );

    targetArea.setAttribute('data-tween-id', newTweenRecord.id);

    targetArea.setAttribute("data-animation-id", requestAnimationFrame(animate));
}

function SetRunningEventIndex(target, index)
{
    target.setAttribute('data-running-event-index', index);
}

function GetRunningEventIndex(target)
{
    return GetAttrDefault(target, 'data-running-event-index', 0);
}

function GetAttrDefault(target, name, defaultValue = null)
{
    let attr_value = target.getAttribute(name);

    if(attr_value == null)
        return defaultValue;
    else
        return attr_value;
}

function GetIsPathPreviewMode(target)
{
    return GetAttrDefault(target, 'data-path-preview', false) === 'true';
}

function SetIsPathPreviewMode(target, newPathPreviewMode)
{
    target.setAttribute('data-path-preview', newPathPreviewMode);
}

function GetIsPaused(target)
{
    return GetAttrDefault(target, 'data-animation-paused', false) === 'true';
}

function SetIsPaused(target, newPaused)
{
    target.setAttribute('data-animation-paused', newPaused);
}


function GetRunMode(target)
{
    return GetAttrDefault(target, 'data-run-mode', RUNMODE_SINGLE);
}

function SetRunMode(target, newRunMode)
{
    target.setAttribute('data-run-mode', newRunMode);
}

function ImageFromDiagramArea(area)
{
    let imageName = $(area).find('#diagram_image').attr('src');

    let imageSplit = imageName.split('/');   

    return imageSplit[ imageSplit.length - 1];
}