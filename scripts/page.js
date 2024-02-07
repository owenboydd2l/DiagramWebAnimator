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

let assetList = [ new Asset(1, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTukEhbRDPETDiNMl5ZO8Lm3nQRSzPLnvdsPK30nTmMig&s'),
    new Asset(2, 'images/136443.png'),
    new Asset(3, 'images/1950399.webp') ];



function IsOverlap( objectTransform, point)
{
    return (point.X > objectTransform.X && point.X < objectTransform.X + objectTransform.width
        &&
        point.Y > objectTransform.Y && point.Y < objectTransform.Y + objectTransform.height);					
}

function PerformLocationCheck(event)
{
    document.getElementById('currentposition').innerHTML = event.clientX + ', ' + event.clientY;
        
    $('#pageScrollTop').text( document.body.scrollTop );
    
    let diagram_area = document.getElementById('diagram_area');					
    
    let diagramTransform = TransformFromElement(diagram_area);	
    
    let mousePosition = { 'X' : event.clientX, 
        'Y' : event.clientY + document.body.scrollTop};
    
    document.getElementById('imagePosition').innerHTML = JSON.stringify(diagramTransform);
    
    if( IsOverlap(diagramTransform, mousePosition ) )
    {
        
        $('#isOverArea').text('YES');

        let clickPosition = ViewToImagePosition(mousePosition.X, mousePosition.Y);        
        
        cacheMousePosition = PixelToPercent(diagram_area, clickPosition.X, clickPosition.Y);
    
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

        let relativeClickPosition = { 'X' : clickPosition.X - (targetIndicator.offsetWidth / 2.0), 'Y': clickPosition.Y - (targetIndicator.offsetHeight / 2.0) };
        
        let percentPosition = PixelToPercent(diagram_area, relativeClickPosition.X, relativeClickPosition.Y);

        targetElement.innerText = JSON.stringify( percentPosition);

        SetImagePosition( targetIndicator, percentPosition.X, percentPosition.Y );
        
        
        
    }
    else
    {
        $('#isOverArea').text('NO');
    }

}

function SetupTimer()
{
    
    document.addEventListener('mousemove', (event) => {
        
        PerformLocationCheck(event);   
        
    });
    

    UpdateAssetList();

}



function TransformFromElement(targetElement)
{
    let data =
        { 
            'X': targetElement.offsetLeft, 
            'Y': targetElement.offsetTop,
            'width' : targetElement.offsetWidth,
            'height' : targetElement.offsetHeight						
        };
        
    return data;
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
    
    return { 'X' : (clientX - offsetLeft), 'Y' : (clientY - offsetTop) };
}

function CreateNewIndicator(indicatorElement, isStart = false)
{
    if(indicatorElement === undefined || indicatorElement == null)
    {
        console.log('creating new indicator');
        indicatorElement = document.createElement("img");
        let diagramArea = document.getElementById('diagram_area');
        diagramArea.insertBefore(indicatorElement, diagramArea.firstChild);
        
        if(isStart)
            indicatorElement.setAttribute('src', 'images/800px-Circle_-_green_simple.png');
        else
            indicatorElement.setAttribute('src', 'images/800px-Circle_-_black_simple.svg.png');

        indicatorElement.classList.add('indicator');
    }
    
    return indicatorElement;
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



function ActivateImage(image)
{		
    if(isStreamlineMode)
        CreateStreamlineEvent();
    else
        PerformSingleEventStep();
    
}

function PixelToPercent(image, x, y)
{
    return { 'X' :  x / image.offsetWidth, 'Y' : Math.abs(y) / image.offsetHeight };
}

function SetImagePosition(image, x, y)
{
    image.style.left = (x * 100) + '%';
    image.style.top = (y * 100) + '%';
    
}

function ObjectToPosition(image)
{
    return { 'X' : image.offsetLeft + (image.offsetWidth / 2.0),
        'Y' : image.offsetTop - (image.offsetHeight / 2.0) };
}

function startTween()
{
    
    ChangeStreamlineMode(false);

    let box = GetCacheBox();

    var foundEvent = globalEventCache.find( (ev) => ev.id == selectedID );

    box.setAttribute('src', assetList.find( 
        (a) => a.id == foundEvent.target).fileName);

    let boxTransform = TransformFromElement(box);

    let startPosition = ObjectToPosition(startIndicator);
    let endPosition = ObjectToPosition(endIndicator);

    const startCoords = {x: startPosition.X - (boxTransform.width / 2.0), y: startPosition.Y};
    const endCoords = {x: endPosition.X - (boxTransform.width / 2.0), y: endPosition.Y};

    const tween = new TWEEN.Tween(startCoords, false) // Create a new tween that modifies 'coords'.
        .to(endCoords, 2000) 
        .easing(TWEEN.Easing.Quadratic.InOut) // Use an easing function to make the animation smooth.
        .onUpdate(() => {
            box.style.setProperty('transform', 'translate(' + startCoords.x + 'px, ' + startCoords.y + 'px)')
        })
        .onComplete()
        .start(); // Start the tween immediately.

    // Setup the animation loop.
    function animate(time) {
        tween.update(time)
        requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
}



function OnFinishTween()
{
    runningEventIndex++;

    if(runningEventIndex >= globalEventCache.length)
    {
        console.log("Finished all tweens");
        ClearEditorSettings();
    }
    else
    {
        console.log("Trigger Next Step");
        SetupAllEventTween();
    }
}

let box = null;

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
       box.style.display = 'inline-block';
    }

    return box;
}

function PlayAllEvents()
{
    ChangeStreamlineMode(false);
    SetupAllEventTween();
}

function SetupAllEventTween()
{
    let box = GetCacheBox();

    let boxTransform = TransformFromElement(box);

    let foundEvent = globalEventCache[runningEventIndex];

    box.setAttribute('src', assetList.find( 
        (a) => a.id == foundEvent.target).fileName);

    startIndicator = CreateNewIndicator(startIndicator, true);
    endIndicator = CreateNewIndicator(endIndicator, false);

    SetImagePosition(startIndicator, foundEvent.startOffset.X, foundEvent.startOffset.Y);
    SetImagePosition(endIndicator, foundEvent.endPosition.X, foundEvent.endPosition.Y);

    let startPosition = ObjectToPosition(startIndicator);
    let endPosition = ObjectToPosition(endIndicator);

    const startCoords = {x: startPosition.X - (boxTransform.width / 2.0), y: startPosition.Y};
    const endCoords = {x: endPosition.X - (boxTransform.width / 2.0), y: endPosition.Y};
    
    startIndicator.style.zIndex = -1;
    endIndicator.style.zIndex = -1;

    const tween = new TWEEN.Tween(startCoords, false) // Create a new tween that modifies 'coords'.
        .to(endCoords, 2000) 
        .easing(TWEEN.Easing.Quadratic.InOut) // Use an easing function to make the animation smooth.
        .onUpdate(() => {
            box.style.setProperty('transform', 'translate(' + startCoords.x + 'px, ' + startCoords.y + 'px)')
        })
        .onComplete(OnFinishTween)
        .start(); // Start the tween immediately.

    // Setup the animation loop.
    function animate(time) {
        tween.update(time)
        requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
}