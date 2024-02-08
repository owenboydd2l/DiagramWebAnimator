
let isPaused = false;
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

