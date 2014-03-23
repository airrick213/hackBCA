var imgsource;
var groups = new Array();

function Region() 
{
    this.pixels = new Array();
    this.color = -1;
}

function analyze() {
    makeBlackOrWhite();
    refine();
    createRegions(groups);
}
    
function makeBlackOrWhite() {
    for(var i = 0; i < imgData.length; i += 4) {
        if((imgData[i] + imgData[i + 1] + imgData[i + 2]) > 600) {
            imgData[i] = 255;
            imgData[i+1] = 255;
            imgData[i+2] = 255;
        }
        else
        {
            imgData[i] = 0;
            imgData[i+1] = 0;
            imgData[i+2] = 0;
        }
    }
}
function makeBlack(imgData) {
   imgData[0] = 0;
   imgData[1] = 0;
   imgData[2] = 0;
}
function makeWhite(imgData) {
   imgData[0] = 255;
   imgData[1] = 255;
   imgData[2] = 255;
}

function refine() {
    var canvas = document.getElementById("canvas");
    var context = canvas.getContext("2d");
    var width = canvas.width;
    var height = canvas.height;
    
    for(var x=1;x<width;x+=3)
    {
        //if(x != width-1)
        //    x++;
        for(var y=1;y<height;y+=3)
        {
            //if(y != height-1)
            //    y++;
            var thispx = context.getImageData(x, y, 1, 1);
            var rightpx, uprightpx, uppx, upleftpx, leftpx, downleftpx, downpx, downrightpx;
            var goodRight = x<width-1;
            var goodUp = y>0;
            var goodLeft = x>0;
            var goodDown = y>height-1;
            if(goodUp)  uppx = context.getImageData(x, y-1, 1, 1);
            if(goodDown) downpx = context.getImageData(x, y+1, 1, 1);
            if(goodRight)   
            {
                rightpx = context.getImageData(x+1, y, 1, 1);
                if(goodUp)      uprightpx = context.getImageData(x+1, y-1, 1, 1);
                if(goodDown)    downrightpx = context.getImageData(x+1, y+1, 1, 1);
            }
            if(goodLeft)
            {
                leftpx = context.getImageData(x-1, y, 1, 1);
                if(goodUp)      upleftpx = context.getImageData(x-1, y-1, 1, 1);
                if(goodDown)    downleftpx = context.getImageData(x-1, y+1, 1, 1);
            }
            var count = 0;
            count = thispx.data[0];
            count = rightpx.data[0];
            count = uprightpx.data[0];
            count = uppx.data[0];
            count = upleftpx.data[0];
            count = leftpx.data[0];
            count = downleftpx.data[0];
            count = downpx.data[0];
            count = downrightpx.data[0];
            if(count >= 1275)   //if white
            {
                makeWhite(thispx);
                makeWhite(rightpx);
                makeWhite(uprightpx);
                makeWhite(uppx);
                makeWhite(upleftpx);
                makeWhite(leftpx);
                makeWhite(downleftpx);
                makeWhite(downpx);
                makeWhite(downrightpx);
            }
            else
            {
                makeBlack(thispx);
                makeBlack(rightpx);
                makeBlack(uprightpx);
                makeBlack(uppx);
                makeBlack(upleftpx);
                makeBlack(leftpx);
                makeBlack(downleftpx);
                makeBlack(downpx);
                makeBlack(downrightpx);
            }
        }
    }
}

function createRegions(groups)
{
    var canvas = document.getElementById("canvas");
    var context = canvas.getContext("2d");
    var width = canvas.width;
    var height = canvas.height;
    makeNewRegion(groups, context, 0, 0, width, height);
}

function makeNewRegion(groups, context, x, y, width, height)
{
    var thispx = context.getImageData(x, y, 1, 1);
    var thispxcolor = thispx.data[0];
    var reg = new Region();
    reg.pixels = new Array();
    reg.color = thispxcolor;
    groups.push(reg);
    reg.push(thispx);
    if(x>0)
    {
        var leftpx = context.getImageData(x-1, y, 1, 1);
        if(!checkPixel(leftpx))
        {
            if(leftpx.data[0] == thispxcolor)
                continueRegion(groups, reg, context, x-1, y, width, height);
            else
                makeNewRegion(groups, context, x-1, y, width, height);
        }
    }
    if(y>0)
    {
        var uppx = context.getImageData(x, y-1, 1, 1);
        if(!checkPixel(uppx))
        {
            if(uppx.data[0] == thispxcolor)
                continueRegion(groups, reg, context, x, y-1, width, height);
            else
                makeNewRegion(groups, context, x, y-1, width, height);
        }
    }
    if(x<width-1)
    {
        var rightpx = context.getImageData(x+1, y, 1, 1);
        if(!checkPixel(rightpx))
        {
            if(rightpx.data[0] == thispxcolor)
                continueRegion(groups, reg, context, x+1, y, width, height);
            else
                makeNewRegion(groups, context, x+1, y, width, height);
        }
    }
    if(y<height-1)
    {
        var downpx = context.getImageData(x, y+1, 1, 1);
        if(!checkPixel(downpx))
        {
            if(downpx.data[0] == thispxcolor)
                continueRegion(groups, reg, context, x, y+1, width, height);
            else
                makeNewRegion(groups, context, x, y+1, width, height);
        }
    }
}

function continueRegion(groups, reg, context, x, y, width, height)
{ 
    var thispx = context.getImageData(x, y, 1, 1);
    var thispxcolor = thispx.data[0];
    reg.push(thispx);
    if(x>0)
    {
        var leftpx = context.getImageData(x-1, y, 1, 1);
        if(!checkPixel(leftpx))
        {
            if(leftpx.data[0] == thispxcolor)
                continueRegion(groups, reg, context, x-1, y, width, height);
            else
                makeNewRegion(groups, context, x-1, y, width, height);
        }
    }
    if(y>0)
    {
        var uppx = context.getImageData(x, y-1, 1, 1);
        if(!checkPixel(uppx))
        {
            if(uppx.data[0] == thispxcolor)
                continueRegion(groups, reg, context, x, y-1, width, height);
            else
                makeNewRegion(groups, context, x, y-1, width, height);
        }
    }
    if(x<width-1)
    {
        var rightpx = context.getImageData(x+1, y, 1, 1);
        if(!checkPixel(rightpx))
        {
            if(rightpx.data[0] == thispxcolor)
                continueRegion(groups, reg, context, x+1, y, width, height);
            else
                makeNewRegion(groups, context, x+1, y, width, height);
        }
    }
    if(y<height-1)
    {
        var downpx = context.getImageData(x, y+1, 1, 1);
        if(!checkPixel(downpx))
        {
            if(downpx.data[0] == thispxcolor)
                continueRegion(groups, reg, context, x, y+1, width, height);
            else
                makeNewRegion(groups, context, x, y+1, width, height);
        }
    }
}

function checkPixel(pixel) //Checks if a pixel is in any region;
{
    for(var i=0;i<groups.length;i++)
    {
        var reg = groups[i];
        if(reg.indexOf(pixel) != -1)
            return true;
    }
    return false;
}