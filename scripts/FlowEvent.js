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

    ChangeTransformType()
    {
        if(this.transformType == TRANSFORM_NONE)
            this.transformType = TRANSFORM_SHRINK;
        else if (this.transformType == TRANSFORM_SHRINK)
            this.transformType = TRANSFORM_GROW;
        else if (this.transformType == TRANSFORM_GROW)
            this.transformType = TRANSFORM_NONE;
    }

    static fromJSON(json)
    {
        const flowEvent = JSON.parse(json);

        return Object.create(FlowEvent.prototype, Object.getOwnPropertyDescriptors(flowEvent));
    }
}