function IsOverlap( objectTransform, point)
{
    return (point.X > objectTransform.X && point.X < objectTransform.X + objectTransform.width
        &&
        point.Y > objectTransform.Y && point.Y < objectTransform.Y + objectTransform.height);					
}

function SetupTimer()
{
    
    document.addEventListener('mousemove', (event) => {
        document.getElementById('currentposition').innerHTML = window.event.clientX + ', ' + window.event.clientY;
        
        $('#pageScrollTop').text( document.body.scrollTop );
        
        let diagram_area = document.getElementById('diagram_area');					
        
        let diagramTransform = TransformFromElement(diagram_area);	
        
        let mousePosition = { 'X' : window.event.clientX, 
            'Y' : window.event.clientY + document.body.scrollTop};
        
        document.getElementById('imagePosition').innerHTML = JSON.stringify(diagramTransform);
        
        if( IsOverlap(diagramTransform, mousePosition ) )
        {
            $('#isOverArea').text('YES');
        
            if(activateMode == NONE)
                return;
            
            let targetElement = null;
    
            let targetIndicator = null;
            
            if(activateMode == STARTMODE)
            {
                targetElement = document.getElementById('startData');							
                targetIndicator =startIndicator;
                    
            }
            else if (activateMode == ENDMODE)
            {
                targetElement = document.getElementById('endData')							
                targetIndicator = endIndicator;
            }
            
            
            let clickPosition = ViewToImagePosition(mousePosition.X, mousePosition.Y);
            
            
            let relativeClickPosition = { 'X' : clickPosition.X - (targetIndicator.offsetWidth / 2.0), 'Y': clickPosition.Y - (targetIndicator.offsetHeight / 2.0) };
            
            let diagramArea = document.getElementById('diagram_area');
            
            let percentPosition = PixelToPercent(diagramArea, relativeClickPosition.X, relativeClickPosition.Y);
            
            targetElement.innerHTML = JSON.stringify( percentPosition);
            
            SetImagePosition( targetIndicator, percentPosition.X, percentPosition.Y );
                
            
            
        }
        else
        {
            $('#isOverArea').text('NO');
        }
        
    
        
    });
    
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

const STARTMODE = 1;
const ENDMODE = 2;
const NONE = 0;

let activateMode = NONE;

let startIndicator = null;
let endIndicator = null;

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
        indicatorElement = document.createElement("img");
        let diagramArea = document.getElementById('diagram_area');
        diagramArea.insertBefore(indicatorElement, diagramArea.firstChild);
        
        if(isStart)
            indicatorElement.setAttribute('src', '800px-Circle_-_green_simple.png');
        else
            indicatorElement.setAttribute('src', '800px-Circle_-_black_simple.svg.png');

        indicatorElement.classList.add('indicator');
    }
    
    return indicatorElement;
}			

function ActivateImage(image)
{		
    activateMode = NONE;
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
    const box = document.getElementById('box') // Get the element we want to animate.

    let boxTransform = TransformFromElement(box);

    let startPosition = ObjectToPosition(startIndicator);
    let endPosition = ObjectToPosition(endIndicator);

    const startCoords = {x: startPosition.X - (boxTransform.width / 2.0), y: startPosition.Y};
    const endCoords = {x: endPosition.X - (boxTransform.width / 2.0), y: endPosition.Y};

    const tween = new TWEEN.Tween(startCoords, false) // Create a new tween that modifies 'coords'.
        .to(endCoords, 2000) 
        .easing(TWEEN.Easing.Quadratic.InOut) // Use an easing function to make the animation smooth.
        .onUpdate(() => {
            // Called after tween.js updates 'coords'.
            // Move 'box' to the position described by 'coords' with a CSS translation.
            box.style.setProperty('transform', 'translate(' + startCoords.x + 'px, ' + startCoords.y + 'px)')
        })
        .start() // Start the tween immediately.

    // Setup the animation loop.
    function animate(time) {
        tween.update(time)
        requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
}