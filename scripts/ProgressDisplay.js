class ProgressDisplay
{


    constructor(target)
    {
        this.progress = 0;       

        this.loadingControl = this.CreateProgressBar();

        target.appendChild(this.loadingControl);
    }

    UpdateProgress(newProgress)
    {
        this.progress = newProgress;

        if(this.progress > 1)
            this.progress = 1;
        else if (this.progress < 0)
            this.progress = 0;
    }

    Redraw()
    {
        var newWidth = this.progress * 100;
        this.loadingControl.firstChild.style.width = newWidth + '%';
        this.loadingControl.style.display = "block";
    }

    Destroy()
    {
        delete this.loadingControl;
    }

    Hide()
    {
        this.loadingControl.style.display = "none";
    }

    CreateProgressBar()
    {
        let newProgressArea = document.createElement('div');
        let progressBar = document.createElement('div');

        newProgressArea.style.position = 'absolute';
        newProgressArea.style.backgroundColor = 'silver';
        newProgressArea.style.bottom = 0;
        newProgressArea.style.width = '100%';
        newProgressArea.style.height = "10px";

        progressBar.style.width = '0%';
        progressBar.style.height = '100%';
        progressBar.style.backgroundColor = 'green';       

        newProgressArea.appendChild(progressBar);

        return newProgressArea;
    }

}