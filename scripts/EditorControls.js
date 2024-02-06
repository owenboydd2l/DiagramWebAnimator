function AddAsset()
{
    var newFilePath = $('#txtNewAssetPath')[0].value;

    var newAsset = new Asset(id = assetList.length, fileName = newFilePath );

    assetList.push(newAsset);

    UpdateAssetList();
}

function UpdateAssetList()
{
    $('#assetTable').empty();

    assetList.forEach(element => {
        var newImage = document.createElement('img');
        newImage.setAttribute('src', element.fileName);
        newImage.classList.add('previewImage');
        $('#assetTable')[0].appendChild(newImage);
    });
}

function uuidv4() {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
  }

function SelectEventRow(event)
{
    selectedID = event.id;   
    
    UpdateEventList();

    var foundEvent = globalEventCache.find( (ev) => ev.id == selectedID);

    if(foundEvent.startOffset != null)
    {
        startIndicator = CreateNewIndicator(startIndicator, true);

        SetImagePosition(startIndicator, foundEvent.startOffset.X, foundEvent.startOffset.Y);
    }

    if(foundEvent.endPosition != null)
    {
        endIndicator = CreateNewIndicator(endIndicator, false);

        SetImagePosition(endIndicator, foundEvent.endPosition.X, foundEvent.endPosition.Y);
    }
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

function CreateNewEvent()
{
    let newEvent = new FlowEvent( id = uuidv4(), orderID = globalEventCache.length, target = 1, null, null, duration = 2000, null);

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
        AddTextCellToRow(newTableRow, element.target);

        if(element.startOffset != null)
            AddTextCellToRow(newTableRow, PrintNiceTransform(element.startOffset.X, element.startOffset.Y));
        else
            AddTextCellToRow(newTableRow, "");

        if(element.endPosition != null)
            AddTextCellToRow(newTableRow, PrintNiceTransform(element.endPosition.X,element.endPosition.Y));
        else
            AddTextCellToRow(newTableRow,"");

        $('#controlTable')[0].appendChild(newTableRow);

    });
}

function PrintNiceTransform(x, y)
{
    return 'X: ' + RoundFloat(x) + ', Y:' + RoundFloat(y); 
}

function RoundFloat(val)
{
    return Math.round(val * 100) / 100;
}