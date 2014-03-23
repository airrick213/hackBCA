/*jslint browser:true, devel:true, white:true, vars:true, eqeq:true */
/*global $:false, intel:false*/
/** 
 * This function runs once the page is loaded, but intel is not yet active 
 */

var windowHeight;
var init = function () {
    windowHeight=window.innerHeight;
    var currentpic = document.getElementById("slideshowpicid");
    document.getElementById("model").style.display="none";
};

window.addEventListener("load", init, false);  

/**
 * Prevent Default Scrolling 
 */
var preventDefaultScroll = function(event) 
{
    // Prevent scrolling on this element
    event.preventDefault();
    window.scroll(0,0);
    return false;
};
    
window.document.addEventListener("touchmove", preventDefaultScroll, false);

/**
 * Device Ready Code 
 * This event handler is fired once the JavaScript bridge library is ready
 */
function onDeviceReady()
{
    //lock orientation
    intel.xdk.device.setRotateOrientation("portrait");
    intel.xdk.device.setAutoRotate(false);
        
    //manage power
    intel.xdk.device.managePower(true,false);

    //hide splash screen
    intel.xdk.device.hideSplashScreen();
}
    
document.addEventListener("intel.xdk.device.ready",onDeviceReady,false); 
   
//Event listener for camera
document.addEventListener("intel.xdk.camera.picture.add",onSuccess); 
document.addEventListener("intel.xdk.camera.picture.busy",onSuccess); 
document.addEventListener("intel.xdk.camera.picture.cancel",onSuccess); 

var picTaken = false;

function onSuccess(event) 
{
    if (event.success === true)
    {
        var imagesrc = intel.xdk.camera.getPictureURL(event.filename);
        var pic1 = document.getElementById("photoone");           
        pic1.src = imagesrc;
        picTaken = true;
    }
    else
     {
        if (event.message !== undefined)
        {
            alert(event.message);
        }
        else
        {
            alert("Okay, no picture captued. <3");
        }
    }
}

function beginProcess() { 
  

    var pic1 = document.getElementById("photoone"); 
    
    
    if(!picTaken) {
        alert("Take a Picture before you submit sillycakes.");
        return;
    } else {
        document.getElementById("camera").style.display = 'none';
        document.getElementById("model").style.display = 'block';
        //intel.xdk.device.setRotateOrientation("landscape");
        //intel.xdk.device.setAutoRotate(false);
    }
    
        
    var c= document.getElementById("canvas");
    var ctx= c.getContext('2d');   
    //ctx.mozImageSmoothingEnabled=false;
    //var width = parseInt(pic1.width)+"px";
    //var height = parseInt(pic1.height)+"px";
    var width = 255+"px";
    var height = 400+"px";
    //ctx.fillRect(0,0,500,500);
    ctx.drawImage(pic1, 0, 0, c.width, c.height);
    
    analyze();
}

//Camera button functionality
function takepicture()
{
    intel.xdk.camera.takePicture(70, true, "jpg");
} 
///////////////////////////////////////////////////////////////////////
var groups = [];

function Region() 
{
    this.pixels = [];
    this.color = 0;
}

Region.prototype.contains = function(x, y)   {
    for(var i=0;i<this.pixels.length;i++)
    {
        if(this.pixels[i].x == x && this.pixels[i].y == y)
           return true;
    }
    return false;
};

function Pixel(imgData, x, y)
{
    this.imgData = imgData;
    this.x = x;
    this.y = y;
}

function analyze() {
    makeBlackOrWhite();
    //refine();
    createRegions(groups);
    alert("Done");
}
    
function makeBlackOrWhite() {
    var canvas = document.getElementById("canvas");
    var context = canvas.getContext('2d');
    var width = parseInt(canvas.width);
    var height = parseInt(canvas.height);
    var imgData = context.getImageData(0, 0, width, height);
    for(var i = 0; i < imgData.data.length;i+=4) {
        var div = document.getElementById("debugswag");
        div.innerHTML = "pixel #: "+i;
        if((imgData.data[i] + imgData.data[i + 1] + imgData.data[i + 2]) > 400) {
            imgData.data[i] = 255;
            imgData.data[i+1] = 255;
            imgData.data[i+2] = 255;
        }
        else
        {
            imgData.data[i] = 0;
            imgData.data[i+1] = 0;
            imgData.data[i+2] = 0;
        }
    }
    context.putImageData(imgData, 0, 0);
}
function makeBlack(imgData, x, y) {
    makeColor(imgData, x, y, 0, 0, 0);
}
function makeWhite(imgData, x, y) {
    makeColor(imgData, x, y, 255, 255, 255);
}

function refine() {
    var canvas = document.getElementById("canvas");
    var context = canvas.getContext("2d");
    var width = parseInt(canvas.width);
    var height = parseInt(canvas.height);
    
    for(var x=1;x<width;x+=3)
    {
        //if(x != width-1)
        //    x++;
        for(var y=1;y<height;y+=3)
        {
            //if(y != height-1)
            //    y++;
            var div = document.getElementById("debugswag");
            div.innerHTML = "pixel #: "+(x*y);
            var thispx = context.getImageData(x, y, 1, 1);
            var rightpx, uprightpx, uppx, upleftpx, leftpx, downleftpx, downpx, downrightpx;
            var goodRight = x<width-1;
            var goodUp = y>0;
            var goodLeft = x>0;
            var goodDown = y>height-1;
            var pixels = [];
            if(goodUp)  {   uppx = context.getImageData(x, y-1, 1, 1);  pixels.push([uppx, x, y-1]);  }
            if(goodDown){downpx = context.getImageData(x, y+1, 1, 1);   pixels.push([downpx, x, y+1]); }
            if(goodRight)   
            {
                rightpx = context.getImageData(x+1, y, 1, 1);
                pixels.push([rightpx, x+1, y]);
                if(goodUp)      {   uprightpx = context.getImageData(x+1, y-1, 1, 1);   pixels.push([uprightpx, x+1, y-1]); }
                if(goodDown)    {   downrightpx = context.getImageData(x+1, y+1, 1, 1); pixels.push([downrightpx, x+1, y+1]);}
            }
            if(goodLeft)
            {
                leftpx = context.getImageData(x-1, y, 1, 1);
                pixels.push([leftpx, x-1, y]);
                if(goodUp)  {   upleftpx = context.getImageData(x-1, y-1, 1, 1);    pixels.push([upleftpx, x-1, y-1]);  }
                if(goodDown){   downleftpx = context.getImageData(x-1, y+1, 1, 1);  pixels.push([downleftpx, x-1, y+1]);}
            }
            var count = 0;
            for(var i1=0;i1<pixels.length;i1++)
            {
                count += pixels[i1][0].data[0];
            }
            if(count >= 1275)   //if white
            {
                for(var i2=0;i2<pixels.length;i2++)
                {
                    var pix2 = pixels[i2];
                    makeWhite(pix2[0], pix2[1], pix2[2]);
                }
            }
            else
            {
                for(var i3=0;i3<pixels.length;i3++)
                {
                    var pix3 = pixels[i3];
                    makeBlack(pix3[0], pix3[1], pix3[2]);
                }
            }
        }
    }
}

/*
function createRegions(groups)
{
    var canvas = document.getElementById("canvas");
    var context = canvas.getContext("2d");
    var width = parseInt(canvas.width);
    var height = parseInt(canvas.height);
    makeNewRegion(groups, context, 0, 0, width, height);
    alert("done");
    highlight(0, 0, 0 ,225);
}

function makeNewRegion(groups, context, x, y, width, height)
{
    var thispx = context.getImageData(x, y, 1, 1);
    var thispxcolor = thispx.data[0];
    var reg = new Region();
    reg.pixels = [];
    reg.color = thispxcolor;
    groups.push(reg);
    reg.pixels.push(new Pixel(thispx, x, y));
    if(x>0)
    {
        var leftpx = context.getImageData(x-1, y, 1, 1);
        if(!checkPixel(leftpx, x-1, y))
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
        if(!checkPixel(uppx, x, y-1))
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
        if(!checkPixel(rightpx, x+1, y))
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
        if(!checkPixel(downpx, x, y+1))
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
    reg.pixels.push(new Pixel(thispx, x, y));
    if(x>0)
    {
        var leftpx = context.getImageData(x-1, y, 1, 1);
        if(!checkPixel(leftpx, x-1, y))
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
        if(!checkPixel(uppx, x, y-1))
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
        if(!checkPixel(rightpx, x+1, y))
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
        if(!checkPixel(downpx, x, y+1))
        {
            if(downpx.data[0] == thispxcolor)
                continueRegion(groups, reg, context, x, y+1, width, height);
            else
                makeNewRegion(groups, context, x, y+1, width, height);
        }
    }
} */

function createRegions(groups)
{
    var canvas = document.getElementById("canvas");
    var context = canvas.getContext("2d");
    var width = parseInt(canvas.width);
    var height = parseInt(canvas.height);
    for(var x=0;x<width;x++)
    {
        for(var y=0;y<height;y++)
        {
            var thispx = context.getImageData(x, y, 1, 1);
            if(!checkPixel(thispx))
            {
                var thispxcolor = thispx.data[0];
                var reg = new Region();
                reg.pixels = [];
                reg.color = thispxcolor;
                groups.push(reg);
                makeRegion(reg, context, x, y, width, height);
            }
        }
    }
}
                
function makeRegion(reg, context, x, y, width, height)
{
    var thispx = context.getImageData(x, y, 1, 1);
    var thispxcolor = thispx.data[0];
    reg.pixels.push(new Pixel(thispx, x, y));
    if(x>0)
    {
        var leftpx = context.getImageData(x-1, y, 1, 1);
        if(!checkPixel(x-1, y))
        {
            if(leftpx.data[0] == thispxcolor)
                makeRegion(reg, context, x-1, y, width, height);
        }
    }
    if(y>0)
    {
        var uppx = context.getImageData(x, y-1, 1, 1);
        if(!checkPixel(x, y-1))
        {
            if(uppx.data[0] == thispxcolor)
                makeRegion(reg, context, x, y-1, width, height);
        }
    }
    if(x<width-1)
    {
        var rightpx = context.getImageData(x+1, y, 1, 1);
        if(!checkPixel(x+1, y))
        {
            if(rightpx.data[0] == thispxcolor)
                makeRegion(reg, context, x+1, y, width, height);
        }
    }
    if(y<height-1)
    {
        var downpx = context.getImageData(x, y+1, 1, 1);
        if(!checkPixel(x, y+1))
        {
            if(downpx.data[0] == thispxcolor)
                makeRegion(reg, context, x, y+1, width, height);
        }
    }
}                 

function checkPixel(x, y) //Checks if a pixel is in any region;
{
    for(var i=0;i<groups.length;i++)
    {
        var reg = groups[i];
        if(reg.contains(x, y))
        {
            alert('true');
            return true;
        }
    }
    alert("false");
    return false;
}

/////////////////////////////////////////////////////////////////////

var currentGroupIndex = 0;

function makeColor(imgData, x, y, r, g, b)
{
    imgData.data[0] = r;
    imgData.data[1] = g;
    imgData.data[2] = b;
    var canvas = document.getElementById("canvas");
    var context = canvas.getContext('2d');
    context.putImageData(imgData, x, y);
}

function highlight(index, r, g, b)
{
    var reg = groups[index];
    for(var i=0;i<reg.pixels.length;i++)
    {
        makeColor(reg.pixels[i].imgData, reg.pixels[i].x, reg.pixels[i].y, 0, 0, 255);
    }
}

function Next()
{
    var prev = groups[currentGroupIndex];
    highlight(currentGroupIndex, prev.color, prev.color, prev.color);
    if(currentGroupIndex == groups.length-1)
        currentGroupIndex = 0;
    else
        currentGroupIndex++;
    highlight(currentGroupIndex, 0, 0, 225);
}