class FlowEvent extends OrderEntity
{
    constructor(id, orderID, target, endPosition, startOffset, duration, transformType)
    {
        super(id, orderID);
        this.target = target;

        this.endPosition = endPosition;
        this.startOffset = startOffset;
        this.duration = duration;
        this.transformType = transformType;
    }
}