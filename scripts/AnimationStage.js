class AnimationStage extends OrderEntity
{
    constructor(id, orderID, flowEvents)
    {
        super(id, orderID);

        this.flowEvents = flowEvents;
    }
}