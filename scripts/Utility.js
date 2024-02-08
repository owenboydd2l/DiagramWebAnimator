
function uuidv4() {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}


function lerp( a, b, alpha ) {
    return a + alpha * ( b - a );
}

function PositionToProgress(start, current, end)
{
    if( start.x != end.x)
    {
        return (start.x - current.x) / (start.x - end.x);
    }
    else
    {
        return (start.y - current.y) / (start.y - end.y);
    }
}

function IsOverlap( objectTransform, point)
{
    return (point.x > objectTransform.x && point.x < objectTransform.x + objectTransform.width
        &&
        point.y > objectTransform.y && point.y < objectTransform.y + objectTransform.height);					
}

function TransformFromElement(targetElement)
{
    let data =
        { 
            'x': targetElement.offsetLeft, 
            'y': targetElement.offsetTop,
            'width' : targetElement.offsetWidth,
            'height' : targetElement.offsetHeight						
        };
        
    return data;
}


function PixelToPercent(image, x, y)
{
    return new Point(x = x / image.offsetWidth, y = Math.abs(y) / image.offsetHeight);
}

function ObjectToPosition(image)
{
    return new Point( x = image.offsetLeft + (image.offsetWidth / 2.0),
        y = image.offsetTop - (image.offsetHeight / 2.0));
}

function SetImagePosition(image, x, y)
{
    image.style.left = (x * 100) + '%';
    image.style.top = (y * 100) + '%';
    
}

function PrintNiceTransform(x, y)
{
    return 'X: ' + RoundFloat(x) + '\nY: ' + RoundFloat(y); 
}

function RoundFloat(val)
{
    return Math.round(val * 100) / 100;
}