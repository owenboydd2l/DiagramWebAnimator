let runningEventIndex = 0;
const STARTMODE = 1;
const ENDMODE = 2;
const NONE = 0;

let activateMode = NONE;

let startIndicator = null;
let endIndicator = null;
let cacheMousePosition = {};

let globalEventCache = [];

let selectedID = null;

let progressBar = null;

let selectedAnimationID = null;

let activeTween = null;

let box = null;


const RUNMODE_SINGLE = 0;
const RUNMODE_MULTIPLE = 1;

let runMODE = RUNMODE_SINGLE;

function ResizeDiagramCanvas()
{
    let diagramCanvas = $('#diagram_canvas')[0];

    diagramCanvas.setAttribute('width', diagramCanvas.parentElement.offsetWidth + "px");
    diagramCanvas.setAttribute('height', diagramCanvas.parentElement.offsetHeight + "px");

    UpdatePathPreview();
}


function PerformLocationCheck(event)
{
    document.getElementById('currentposition').innerHTML = event.clientX + ', ' + event.clientY;
        
    $('#pageScrollTop').text( document.body.scrollTop );
    
    let diagram_area = document.getElementById('diagram_area');
    
    let diagramTransform = TransformFromElement(diagram_area);
    
    let mousePosition = new Point(x = event.clientX, 
        y = event.clientY + document.body.scrollTop);
    
    document.getElementById('imagePosition').innerHTML = JSON.stringify(diagramTransform);
    
    if( IsOverlap(diagramTransform, mousePosition ) )
    {
        
        $('#isOverArea').text('YES');

        let clickPosition = ViewToImagePosition(mousePosition.x, mousePosition.y);
        
        cacheMousePosition = PixelToPercent(diagram_area, clickPosition.x, clickPosition.y);
    
        if(activateMode == NONE)
            return;
        
        let targetElement = null;

        let targetIndicator = null;

        let isStart = false;
        
        if(activateMode == STARTMODE)
        {
            isStart = true;
            targetElement = document.getElementById('startData');							
            targetIndicator =startIndicator;
                
        }
        else if (activateMode == ENDMODE)
        {
            targetElement = document.getElementById('endData')							
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
    for(let i=0; i != sampleData.length; ++i)
    {
        let data = sampleData[i];

        loadedData.push( JSON.parse(data) );
    }
}

function CreateDiagramControls()
{
    let diagramArea = $('#diagram_area')[0];

    let diagramImage = $('#diagram_image')[0];

    let controlArea = document.createElement('div');
    controlArea.classList.add('DiagramControlBar');
    
    {

        
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

    {
        let ddlEventSteps = document.createElement('select');
        ddlEventSteps.id = 'ddl_event_steps';

        controlArea.appendChild(document.createTextNode("Event: ") );
        controlArea.appendChild(ddlEventSteps);
        
        UpdateEventDropDown(ddlEventSteps);
    }

    {
        let ddlPlayAll = document.createElement('input');
        ddlPlayAll.setAttribute('type', 'button');
        ddlPlayAll.setAttribute('value', 'Play All Events');        
        ddlPlayAll.addEventListener('click', () => { StartTween(RUNMODE_MULTIPLE); } )
        controlArea.appendChild(ddlPlayAll);
    }
    controlArea.appendChild(document.createElement('br'));

    {
        let ddlPlayAll = document.createElement('input');
        ddlPlayAll.setAttribute('type', 'button');
        ddlPlayAll.setAttribute('value', 'PREV');        
        controlArea.appendChild(ddlPlayAll);
    }

    {
        let ddlPlayOne = document.createElement('input');
        ddlPlayOne.setAttribute('type', 'button');
        ddlPlayOne.setAttribute('value', 'Play Event');
        ddlPlayOne.addEventListener('click', () => { StartTween(RUNMODE_SINGLE); } )
        controlArea.appendChild(ddlPlayOne);
    }

    
    
    {
        let ddlPlayAll = document.createElement('input');
        ddlPlayAll.setAttribute('type', 'button');
        ddlPlayAll.setAttribute('value', 'NEXT');        
        controlArea.appendChild(ddlPlayAll);
    }

    diagramArea.insertBefore(controlArea, diagramImage);
}

function UpdateEventDropDown(ddlEventSteps = null)
{

    if(ddlEventSteps == null)
        ddlEventSteps = $('#ddl_event_steps')[0];

    $(ddlEventSteps).empty();

    let emptyOption = document.createElement('option');
    emptyOption.text = '----';
    ddlEventSteps.appendChild(emptyOption);

    let foundAnimation = loadedData.find( (an) => an.id == selectedAnimationID);

    if(!foundAnimation)
        return;

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

function SetStart()
{
    activateMode = STARTMODE;
    startIndicator = CreateNewIndicator(startIndicator, true);
}

function SetEnd()
{
    activateMode = ENDMODE;
    endIndicator = CreateNewIndicator(endIndicator, false);
}

function ViewToImagePosition(clientX, clientY)
{
    let diagram_image = document.getElementById('diagram_area');
    
    let offsetTop = diagram_image.offsetTop;
    let offsetLeft = diagram_image.offsetLeft;
    
    return new Point( x = (clientX - offsetLeft), y = (clientY - offsetTop));
}

function CreateNewIndicator(indicatorElement, isStart = false)
{
    if(indicatorElement === undefined || indicatorElement == null)
    {
        console.log('creating new indicator');
        indicatorElement = document.createElement("img");
        AddElementToDiagram(indicatorElement);
        
        if(isStart)
            indicatorElement.setAttribute('src', 'images/800px-Circle_-_green_simple.png');
        else
            indicatorElement.setAttribute('src', 'images/800px-Circle_-_black_simple.svg.png');

        indicatorElement.classList.add('indicator');
    }

    indicatorElement.style.zIndex = 0;
    
    return indicatorElement;
}			

function AddElementToDiagram(element)
{
    let diagramArea = $('#diagram_area')[0];
    diagramArea.insertBefore(element, diagramArea.firstChild);
}

function PerformSingleEventStep()
{
    let foundEvent = globalEventCache.find( (ev) => ev.id == selectedID);

    if(foundEvent !== undefined)
    {
        if(activateMode == STARTMODE)
        {
            foundEvent.startOffset = cacheMousePosition;            
        }
        else if (activateMode == ENDMODE)
        {
            foundEvent.endPosition = cacheMousePosition;
        }

        UpdateEventList();
    }    

    activateMode = NONE;    
}

function StartTween(newRunMode = RUNMODE_SINGLE)
{
    runMODE = newRunMode;

    let box = GetCacheBox();
    
    box.setAttribute('data-start-width', box.offsetWidth);
    box.setAttribute('data-start-height', box.offsetHeight);

    ChangeStreamlineMode(false);

    SetupAllEventTween();
}


function ActivateImage(image)
{		
    if(isStreamlineMode)
        CreateStreamlineEvent();
    else
        PerformSingleEventStep();
    
}

function OnFinishTween()
{
    runningEventIndex++;

    if(runningEventIndex >= globalEventCache.length || runMODE == RUNMODE_SINGLE)
    {
        console.log("Finished all tweens");
        let box = GetCacheBox()
        box.style.display = 'none';
        box.style.width = box.getAttribute('data-start-width');
        box.style.height = box.getAttribute('data-start-height');
        progressBar.Hide();
        ClearEditorSettings();
    }
    else
    {
        console.log("Trigger Next Step");
        SetupAllEventTween();
    }
}



function GetCacheBox()
{
    if(box == null)
    {
        console.log('creating box');
        /*
        box = document.createElement('box') // Get the element we want to animate.
        box.setAttribute('src', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTukEhbRDPETDiNMl5ZO8Lm3nQRSzPLnvdsPK30nTmMig&s');
        box.classList.add('box');
        
        
        let diagramArea = $('#diagram_area')[0];
        diagramArea.insertBefore(box, diagramArea.firstChild);
        */
        box = document.getElementById('box');

        
       
    }

    box.style.display = 'inline-block';   

    return box;
}

function SetupAllEventTween()
{

    if(progressBar == null)
    {
        progressBar = new ProgressDisplay( $('#diagram_area')[0] );
    }

    progressBar.UpdateProgress(0);
    progressBar.Redraw();

    let box = GetCacheBox();

    let boxTransform = TransformFromElement(box);

    let isSingleMode = (runMODE == RUNMODE_SINGLE);
    let foundEvent = null;
    
    if(isSingleMode)
        foundEvent = globalEventCache.find( (ev) => ev.id == selectedID);
    else
        foundEvent = globalEventCache[runningEventIndex];

    if(!foundEvent)
    {
        console.error( runMODE + ' EVENT NOT FOUND ' + (isSingleMode ? selectedID : runningEventIndex));
        return;
    }

    box.setAttribute('src', assetList.find( 
        (a) => a.id == foundEvent.target).fileName);

    startIndicator = CreateNewIndicator(startIndicator, true);
    endIndicator = CreateNewIndicator(endIndicator, false);

    let indicatorSize = PixelToPercent($('#diagram_area')[0], startIndicator.offsetWidth, startIndicator.offsetHeight );

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

    activeTween = new TWEEN.Tween(startCoords, false) // Create a new tween that modifies 'coords'.
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
        .onComplete(OnFinishTween)
        .start(); // Start the tween immediately.

    // Setup the animation loop.
    function animate(time) {
        activeTween.update(time)
        requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
}

