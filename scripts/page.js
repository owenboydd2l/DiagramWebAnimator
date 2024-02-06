function IsOverlap( objectTransform, point)
{
    return (point.X > objectTransform.X && point.X < objectTransform.X + objectTransform.width
        &&
        point.Y > objectTransform.Y && point.Y < objectTransform.Y + objectTransform.height);					
}

function SetupTimer()
{
    
    document.addEventListener('mousemove', (event) => {
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
            
            targetElement.innerText = JSON.stringify( percentPosition);
            
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

let globalEventCache = [];

function CreateNewEvent()
{
    let newEvent = new FlowEvent( id = uuidv4(), orderID = globalEventCache.length, -1, null, null, 2000, null);

    globalEventCache.push(newEvent)

    UpdateEventList();
}

function UpdateEventList()
{
    $('#controlTable').empty();

    globalEventCache.forEach(element => {
        
        var newTableRow = document.createElement("tr");

        if(element.id == selectedID)
        {
            newTableRow.style.backgroundColor = 'red';
        }
        
        var chk = document.createElement("input");
        chk.setAttribute("type", "button");
        chk.setAttribute("value", "select");
        chk.addEventListener("click", function () { SelectEventRow(element); });

        AddCellToRow(newTableRow, [ chk ]);
        
        AddTextCellToRow(newTableRow, element.orderID);

        $('#controlTable')[0].appendChild(newTableRow);

    });
}

let selectedID = null;

function SelectEventRow(event)
{
    selectedID = event.id;   
    
    UpdateEventList();
}

function AddTextCellToRow(row, content)
{
    var newCell = document.createElement("td");
    newCell.innerText = content;
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

function uuidv4() {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
  }
