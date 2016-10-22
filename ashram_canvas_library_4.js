/*
    opening png from hard drive with a prompt (alt-e)

    irfanview for thumbnails
    https://bytes.com/topic/html-css/answers/521971-how-use-irfanview-freeware-create-web-thumbnail-galleries

    http://stackoverflow.com/questions/3868259/importing-image-on-canvas-html5
    customize html5 color picker:
	/http://stackoverflow.com/questions/11167281/webkit-css-to-control-the-box-around-the-color-in-an-inputtype-color
*/

/////////////////////////////helpers////////////////////////////////
    $ = function(id){return document.getElementById(id)};
    $c = function(id){
        if(typeof id == 'string') {return $(id).getContext("2d")}
        else {return id.getContext("2d")} 
    };
    $l = function(id,event,handler){
        if(typeof id == 'string') {return $(id).addEventListener(event,
                handler, false)} 
        else {return id.addEventListener(event,handler,false)}
        };
    $rl = function(id,event,handler){
        if(typeof id == 'string') {return $(id).removeEventListener(event,
                handler, false)} 
        else {return id.removeEventListener(event,handler,false)}
        };
    function getMousePos(canvas, event){
        var obj = canvas;
        var top = 0;
        var left = 0;
        while (obj && obj.tagName != 'BODY') {
            top += obj.offsetTop;
            left += obj.offsetLeft;
            obj = obj.offsetParent;
        }
        var mouseX = event.clientX - left + window.pageXOffset;
        var mouseY = event.clientY - top + window.pageYOffset;
        return {
            x: mouseX,
            y: mouseY
        };
    }
    function getTouchPos(canvas, event){
       if (!e)

                    var e = event;

                e.preventDefault();

                canX = e.targetTouches[0].pageX - canvas.offsetLeft;

                canY = e.targetTouches[0].pageY - canvas.offsetTop;

                return { x: canX, y: canY};
    }
    //storage object for cookies fallback
    storage = {
            set: function(name,value) {
                    if( localstorage ) {
                        localStorage.setItem(name, value);
                    }
                    else {
                        //set expiration to 14 days
                        var date = new Date();
                        date.setTime(date.getTime()+(14*24*60*60*1000));
                        var expires = "; expires="+date.toGMTString();
                        //now set cookie
                        document.cookie = name+"="+value+expires+"; path=/";
                    }
            },
            get: function(name) {
                    if( localstorage ) {
                        return localStorage.getItem(name);
                    }
                    else {
                        var nameEQ = name + "=";
                        var ca = document.cookie.split(';');
                        for(var i=0;i < ca.length;i++) {
                            var c = ca[i];
                            while (c.charAt(0)==' ') c = c.substring(1,c.length);
                            if (c.indexOf(nameEQ) == 0) {
                                ret = c.substring(nameEQ.length,c.length);
                                switch (ret) {
                                  case 'true': 
                                      return true;
                                  case 'false':
                                      return false;
                                  default:
                                      return ret;
                                }
                            }
                        }
                        return null;
                    }
            },
            remove: function(name) {
                if( localstorage ) {
                    localStorage.removeItem(name);
                }
                else {
                    this.set(name,"",-1);
                }
            }
    }
    //utility image loader
    function loadImages(sources, callback) {
        var images = [];
        var loadedImages = 0;
        var numImages = 0;
        var n = sources.length;
        for (var i = 0; i <n; i++) {
                images[i] = new Image();
                images[i].onload = function() {
                    if(++loadedImages >= n) {
                        callback(images);
                    }
                };
            images[i].src = sources[i][0];
        }
    }
    function writeMessage(canvas, message,x,y){
        var context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.font = '20pt Calibri';
        context.fillStyle = '#777';
        context.fillText(message, x,y);  //10, 25  or 10,15
        };
    function drawLine(canvas,x1,y1,x2,y2){
        var context = canvas.getContext("2d");
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);  
        context.stroke();
        };
    function drawRect(canvas,x,y,w,h){
        var c = canvas.getContext("2d");
        c.beginPath();
        c.rect(x, y, w,w);
        c.fillStyle = "#ccc";
        c.fill();
        c.lineWidth = 1;
        c.strokeStyle = "#888";
        c.stroke();
        };
    function clearCanvas(canvas){
        var context = canvas.getContext('2d');
        context.clearRect(0,0,canvas.width, canvas.height);
        };
    function clearAll(){
        var can = $$('canvas'); 
        for(i=0; i < can.length; i += 1)
         if(can[i] !=$('mixerCanvas') && can[i] !=$('shaderCanvas') && can[i] 
            !=$('curColorCanvas')) {clearCanvas(can[i]);}
     };
    function toggle(element){
        if (element.style.display == 'none'){element.style.display='block';}
        else {element.style.display='none';}
        };
    //a helper function  // EXAMPLE: var color = 'rgba(255,0,0,.5)';
        // var m = color.match( /\d{1,3}|(\.\d)/g);//returns[255,0,0,.5]   because backslash escapes . and () means an expression, | means or, {} means in the range between
    function color2array( color ){
        return color.match( /\d{1,3}|(\.\d{1,2})/g); 
     };
    ///////////////////////////new element or new canvas/////////////////////////////////
    function new_element(tag,parent,w,h,id,o){
        var     el = document.createElement(tag),
            s = el.style;
        el.className = o.className;
        el.id = id;
        if(tag=='canvas'){el.width = w; el.height = h} else{s.width = w+'px';
                s.height = h+'px'};      
        //set defaults
        o = o || {};
        s.position = o.position || 'relative';
        s.display = o.display || 'inline-block';
        s.cursor = o.cursor || 'default';
        s.opacity = o.opacity || '1';
        if(o.left) {s.left = o.left+'px' || '0px';}
        if(o.top) {s.top = o.top+'px'  ||   '0px';}   
        if(o.center==true) {s.left = (window.innerWidth-w)/2+'px';}

        if(o.color){s.color = o.color};
        if(o.bgcolor){s.backgroundColor = o.bgcolor};
        if(o.border){s.border = o.border };

        if(o.type){el.type = o.type};
        if(o.size){el.size = o.size};
        if(o.value){el.value = o.value};

        if(o.fontWeight != undefined) {s.fontWeight = o.fontWeight;}
        if(o.right != undefined) {s.right = o.right+'px';}
        if(o.bottom != undefined) {s.bottom = o.bottom +'px';}
        if(o.innerHTML != undefined) {el.innerHTML = o.innerHTML;}
        if(o.zIndex != undefined){s.zIndex = o.zIndex;} 
        if(o.class != undefined) {el.className = o.className;}
        parent  && typeof parent =='string' ? $(parent).appendChild(el) :
        parent && typeof parent =='object' ? parent.appendChild(el) : 
        document.body.appendChild(el);  

        if(o.alive==true)   { $(id).onclick=target_handler;}
        };
    function new_canvas(parent,w,h,id,o){
        var tag = 'canvas';
        new_element(tag,parent,w,h,id,o);
        if(o.drawable == true) {$(id).onmousedown = simple_strokeHandler; $(id).ontouchstart = simple_strokeHandler;}
        };

/////////////////// ingredients for a simple drawing ui ///////
    var curLineWidth =1,
        curBrush = 'simple',
        curFGcolor = 'rgb(0,0,0)',
        prevMouseX, 
        prevMouseY;  //black
    function simple_stroke(context,a1,b1,a,b){   //a,b start a1,b1 end
        var c = context;  
        c.lineWidth = 2;
        c.strokeStyle = 'red';  
        c.lineCap = "round";   //butt,round,square
        c.beginPath();
        c.moveTo(a, b);
        c.lineTo(a1, b1);
        c.stroke();      
        }; 
    function simple_strokeHandler( event ){
        var canvas = $(event.target.id);
        var context = canvas.getContext("2d");
        var mousePos = getMousePos(canvas, event);
        var touchPos = getTouchPos(canvas, event);

        if(event.type == "mousedown"){       
            prevMouseX = mousePos.x;
            prevMouseY = mousePos.y;   
            canvas.onmousemove = simple_strokeHandler;
            canvas.onmouseup = simple_strokeHandler;
        };
        if(event.type == "mousemove"){
            simple_stroke(context,mousePos.x,mousePos.y, prevMouseX,prevMouseY);
            prevMouseX = mousePos.x;
            prevMouseY = mousePos.y;
        };  
        if(event.type == "mouseup"){
            canvas.onmousemove = null;
            canvas.onmouseup = null;
        };
        if(event.type == "touchstart"){       
            prevMouseX = touchPos.x;
            prevMouseY = touchPos.y;   
            canvas.ontouchmove = simple_strokeHandler;
            canvas.ontouchend = simple_strokeHandler;
        };
        if(event.type == "touchmove"){
            event.preventDefault();
            simple_stroke(context,touchPos.x,touchPos.y, prevMouseX,prevMouseY);
            prevMouseX = touchPos.x;
            prevMouseY = touchPos.y;
        };  
        if(event.type == "touchend"){
            canvas.ontouchmove = null;
            canvas.ontouchend = null;
        };
    }
    //now can just add a listener to make a canvas drawable 
    function make_simple_drawable( canvasId ){


        $(canvasId).onmousedown = simple_strokeHandler;
        $(canvasId).ontouchstart = simple_strokeHandler;
    }
    //or as an alternative to new_canvas
    function new_simple_drawable( parent,w,h,id,o ){
    new_canvas(parent,w,h,id,o);
    make_simple_drawable(id);
    };

/////ingredients for a more complex drawing ui with many more features////////////////
    var canvas, context;

    var curLineWidth = 1,
        curStrokeStyle='red',
        curBrush = 'ribbon',
        curFGcolor =  'rgb(255,0,0)',
        curFontColor = 'rgb(255,0,0)',
        curFontSize = 40+'px',  //fff
        curFillColor = 'rgb(0,255,0)',
        curBGcolor = 'rgb(255,255,255)',
        curAlpha = 1;
    var curSpacing = .25, //40  
        curScale = .8,  //.3  tte
        curPSbrush = 6 ;
     
    var fonts ={t:'Typo Garden Demo', d:'Kleins Dancing Slapzerif', k:'KidsFirstPrintFont',   
    z:'ZeitGeisterbahn',   g:'Gloria Hallelujah', 
        a:'Africain', kd:'KidsDrawings', ka:'ChildrenAnimalsFriends'};  //k,z,d,a
    var curFont = fonts.d;

    var prevMouseX, prevMouseY,
        points = new Array(),
        count = 0,
        pickerMouseDown = false;

//////////////////getting ready for ribbon brush///////////////////
    //global vars for ribbon brush
     var SCREEN_WIDTH = window.innerWidth,
        	SCREEN_HEIGHT = window.innerHeight,
     		mouseX = SCREEN_WIDTH / 2,  //globals
    	   mouseY = SCREEN_HEIGHT / 2,
        	painters = [],
        	interval;
     //init ribbon brush if selected
    function ribbon_init(){  //fires whenever select ribbon brush
    	var canvas =document.getElementById('mainCanvas'),
    			c = canvas.getContext('2d');

    	painters.length=0;  //clear and re-initialize
    	for (var i = 0; i < 50; i++){  //50 painters
    	   painters.push({ dx: SCREEN_WIDTH / 2, dy: SCREEN_HEIGHT / 2, 
    	   	ax: 0, ay: 0, div: 0.1, ease: Math.random() * 0.2 + 0.6 });
    	}
    	interval = setInterval( update, 1000/60 );

       function update(){
       	var COLOR = color2array(curFGcolor);
    		c.strokeStyle = "rgba(" + COLOR[0] + ", " + COLOR[1] + ", " 
    			+ COLOR[2] + ", " + 0.05  + ")";

    		for (var i = 0; i < 50; i++){
    			c.beginPath();
    			c.moveTo(painters[i].dx, painters[i].dy);
    			painters[i].dx -= painters[i].ax = 
    				(painters[i].ax + (painters[i].dx - mouseX) * painters[i].div) * painters[i].ease;
    			painters[i].dy -= painters[i].ay = 
    				(painters[i].ay + (painters[i].dy - mouseY) * painters[i].div) * painters[i].ease;
    			c.lineTo(painters[i].dx, painters[i].dy);
    			c.stroke();
    		}
       }
    }  //end ribbon init

//////////////////getting ready to use ps brushes!! ///////////////
    var ps= {
        scale : curScale,

        images : [   // brushes with default scale and spacing

        				['PS/0000.png', .2, 30],  //drip
        				['PS/0002.png', .2, 30],
        				['PS/0004.png', .2, 30],
        				['PS/0006.png', .2, 30],
        				['PS/0008.png', .2, 30],



                ['PS/W1.png', .3, 30],      //water color
                ['PS/W2.png', .2, 10],  //.3,20
                ['PS/W3.png', .3, 20],
                ['PS/W4.png', .02, 2],
                ['PS/W4.png', .1, 10],

                // ['PS/dp1.png', 1, 10],  //0  pastels
                // ['PS/dp2.png', 1, 10],
                // ['PS/dp3.png', 1, 10], 
             //    ['PS/dp4.png', 1, 10], //3
               
               ['PS/dp6.png', .5, 10],  //1,15

               ['PS/PA7.png', .5,10],

                // ['PS/PA1.png', .1, 8],
                ['PS/PA2.png', .3, 8],
                
                // ['PS/PA4.png', .3,10],
                // ['PS/PA5.png', .3,10],
                // ['PS/PA6.png', .3,10],
                
                //['PS/PA3.png', .3, 14],
                


                ['PS/PA8.png', 1,15],
                 ['PS/dp5.png', 1, 10],
                
                
                ['PS/CRAYON.png', .1, 4],//.5 20, .2,8
                ['PS/CRAYON.png', .5, 20],//.5 20, .2,8

                ['PS/PA9a.png', .3,30],

                ['PS/SP1.png', .5, 10],
                ['PS/SP2.png', .5, 10],
                //['PS/SP3.png', .5, 10],
                ['PS/SP4.png', .4, 10],
                ['PS/SP5.png', .3, 10],
                //['PS/SP6.png', .4, 10],
                //['PS/SP7.png', .5, 10],

                ['PS/SPONGE1a.png', .5, 10],
                ['PS/PENCIL1.png', .3, 30],




                ['PS/PAT1.png', .5, 20],
                ['PS/PAT2.png', .5, 20],
                ['PS/PAT3.png', .1, 30],
                //['PS/PAT4.png', .05, 35],
                ['PS/d_dots.png', .5, 20],
                ['PS/dc.png', .3, 30],  //6
                ['PS/d_lines.png', .3, 30]  //6
            ]


         // images : [ // brushes with default scale and spacing
                 

         //        ['SLIDER/ps_BRUSHES/dp1.png', 1, 10],  //0  pastels
         //        ['SLIDER/ps_BRUSHES/dp2.png', 1, 10],
         //        ['SLIDER/ps_BRUSHES/dp3.png', 1, 10], 
         //        ['SLIDER/ps_BRUSHES/dp4.png', 1, 10], //3
         //        ['SLIDER/ps_BRUSHES/dp5.png', 1, 10],
         //        ['SLIDER/ps_BRUSHES/dp6.png', 1, 15],

         //        ['SLIDER/ps_BRUSHES/dc.png', .3, 30],  //6  triceam,1,2
         //        ['SLIDER/ps_BRUSHES/d_lines.png', .3, 30],  //7
         //        ['SLIDER/ps_BRUSHES/d_dots.png', .3, 30],   //circles 
         //        ['SLIDER/ps_BRUSHES/triceam.png', 1, 2]   //9 caligraphy 

         //    ]
    };
    function rescaleCanvas(canvas,w,h){
            canvas.width = w;
            canvas.height = h;
            };
    function colorPSbrush(){   //draw on canvas
        var hcanvas = document.getElementById("hiddenCanvas");
        var hc = hcanvas.getContext("2d");
        var width =  hcanvas.width;
        var height = hcanvas.height;
        var imageData = hc.getImageData(0, 0, width, height);
        var pixels = imageData.data;
        for (var i = 0, il = pixels.length; i < il; i += 4){
        var COLOR = color2array(curFGcolor);
        pixels[i] = COLOR[0];
        pixels[i + 1] = COLOR[1];
        pixels[i + 2] = COLOR[2];
        };
        hc.putImageData(imageData, 0, 0);
        };
    function ps_init(curPSbrush){  //note dependency on current PS brush for flex
        var canvas =document.getElementById('mainCanvas');
        var c = canvas.getContext('2d');
        var hcanvas = document.getElementById("hiddenCanvas");
        var hc = hcanvas.getContext("2d");
        var prevMouseX, prevMouseY;   

        var img = new Image();   
        //var color = curFGcolor;
        img.onload = function(){
            var w = img.width*ps.images[curPSbrush][1];
            var h = img.height*ps.images[curPSbrush][1];
            //var w = img.width*curScale;
            //var h = img.height*curScale;

            rescaleCanvas(hcanvas,w,h);
            hc.drawImage(img, 0, 0,w,h);
            colorPSbrush();
            curScale = ps.images[curPSbrush][1]; 
            curSpacing=  ps.images[curPSbrush][2];       
        };
        img.src =  ps.images[curPSbrush][0];  
        };  

///////// an inventory of our non-PS and PS brush strokes ////////
    br = {};
    br.sketchy = function(context,a1,b1,a,b,points,count) {
        // context.globalCompositeOperation = 'source-over';
        var i, dx, dy, d;
        context.lineWidth = curLineWidth;
        var COLOR = color2array(curFGcolor);  
        context.strokeStyle = "rgba(" + COLOR[0] + ", " + COLOR[1] + ", " + COLOR[2] + ", " + 0.05 + ")";  //0.05
        context.beginPath();
        context.moveTo(a, b);
        context.lineTo(a1, b1);
        context.stroke();

        for (i = 0; i < points.length; i++){
            dx = points[i][0] - points[count][0];
            dy = points[i][1] - points[count][1];
            d = dx * dx + dy * dy;

            if (d < 4000 && Math.random() > (d / 2000)){    
                context.beginPath();
                context.moveTo( points[count][0] + (dx * 0.3), points[count][1] + (dy * 0.3));
                context.lineTo( points[i][0] - (dx * 0.3), points[i][1] - (dy * 0.3));
                context.stroke();
            }
        }
        };
    br.shaded = function(context,a1,b1,a,b,points,count) {  
        var i, dx, dy, d;
        context.lineWidth = curLineWidth;

        for (i = 0; i < points.length; i++){
            dx = points[i][0] - points[count][0];
            dy = points[i][1] - points[count][1];
            d = dx * dx + dy * dy;
            if (d < 1000){
                var COLOR = color2array(curFGcolor);  
                context.strokeStyle = "rgba(" + COLOR[0] + ", " + COLOR[1] + ", " + COLOR[2] + ", " + ((1 - (d / 1000)) * 0.1 )  + ")";  //0.05
                context.beginPath();
                context.moveTo( points[count][0], points[count][1]);
                context.lineTo( points[i][0], points[i][1]);
                context.stroke();
            }
        }
        };
    br.circles = function(context,a1,b1,a,b) {  
        var i, dx, dy, d, cx, cy, steB, step_delta;

        context.lineWidth = 1;
        var COLOR = color2array(curFGcolor);  
        context.strokeStyle = "rgba(" + COLOR[0] + ", " + COLOR[1] + ", " + COLOR[2] + ", " + 0.1  + ")";  //0.05
        dx = a1 - a;
        dy = b1 - b;
        d = Math.sqrt(dx * dx + dy * dy) * 2;
        cx = Math.floor(a1 / 100) * 100 + 50;
        cy = Math.floor(b1 / 100) * 100 + 50;
        steps = Math.floor( Math.random() * 10 );
        step_delta = d / steps;

        for (i = 0; i < steps; i++){
        context.beginPath();
        context.arc( cx, cy, (steps - i) * step_delta, 0, Math.PI*2, true);
        context.stroke();
            }
        };
    br.squares = function(context,a1,b1,a,b) {  
        var dx, dy, angle, px, py;
        dx = a1 - a;
        dy = b1 - b;
        angle = 1.57079633;
        px = Math.cos(angle) * dx - Math.sin(angle) * dy;
        py = Math.sin(angle) * dx + Math.cos(angle) * dy;

        context.lineWidth = 1;
        var COLOR = color2array(curFGcolor);   
        // context.strokeStyle = "rgba(" + COLOR[0] + ", " + COLOR[1] + ", " + COLOR[2] + ", " + 1.0  + ")";  //0.05
        context.fillStyle = curFillColor;  // "rgba(0,255,0,1)";   //background color 
        context.strokeStyle = "rgba(0,0,0,1)";

        context.beginPath();
        context.moveTo(a - px, b - py);
        context.lineTo(a + px, b + py);
        context.lineTo(a1 + px, b1 + py);
        context.lineTo(a1 - px, b1 - py);
        context.lineTo(a - px, b - py);
        context.fill();
        context.stroke();
        };
    br.simple = function(context,a1,b1,a,b) {
        context.lineWidth = curLineWidth;
        context.strokeStyle = curFGcolor;     ///'red'
        // var color = curFGcolor; 
        //context.strokeStyle = "rgba(" + COLOR[0] + ", " + COLOR[1] + ", " 
        //  + COLOR[2] + ", " + .99+ ")";  //0.05,.5, .99   
        context.lineCap = "round";   //butt,round,square
        context.beginPath();
        context.moveTo(a, b);
        context.lineTo(a1, b1);
        context.stroke();        //since js ignores extra params
        };
    br.eraser = function(context,a1,b1,a,b) {
    context.lineWidth = curLineWidth; 
    context.strokeStyle = 'rgb(0,0,0)'; 
    context.lineCap = "round"; 
    context.beginPath();
    context.moveTo(a, b);
    context.lineTo(a1, b1);
    context.stroke();      
    };

    //getting ready for ps brush stroke with total length var
    var tl = 0;
    br.ps = function(context,a1,b1,a,b) {   //there is also a directional variation
        var     dx = a1 - a,
                dy = b1 - b,
                curDist = Math.sqrt(dx*dx+dy*dy),
            spacing = curSpacing,   //or 8 as above
            curOff = tl % spacing;  //since stamp whenever tl%spacing==0

        if(curDist + curOff >= spacing){
            var s1x = (a+ (spacing- curOff)*dx/curDist); //stamp 1
            var s1y= (b+ (spacing- curOff)*dy/curDist);
            context.drawImage($('hiddenCanvas'), s1x-15, s1y-15); 
        };

        var dr = curDist - (spacing- curOff);  //distance remaining
        if (dr >= spacing){
            var nr  =  Math.floor(dr/spacing);  //number of remaining stamps
            for(i=1; i<= nr; i+=1){
               context.drawImage($('hiddenCanvas'), s1x+spacing*(dx/curDist)*i-15,
                s1y+spacing*(dy/curDist)*i-15);
            }
        }
        tl = tl+curDist;  //update total length
    };

    //here's our general-purpose brush handler to make any brush come to life
    function brush_handler(event){
        //alert(event.type); //!!!!
        var canvas = $(event.target.id);
        var context = canvas.getContext("2d");
        var mousePos = getMousePos(canvas, event);
        // var touchPos = getTouchPos(canvas,event);

	   if(curBrush !== 'ribbon')  clearInterval(interval);

        if(curBrush =='eraser'){ context.globalCompositeOperation = 'destination-out' }
        else { context.globalCompositeOperation = 'source-over' };

        if(event.type == "mousedown"){  //mstart
		    if(curBrush == 'ribbon'){
                mouseX = mousePos.x;
   	            mouseY = mousePos.y;
   	        }
		    if(curBrush=="ribbon" ){
    			for (var i = 0; i < 50; i++){
    				painters[i].dx = mouseX;
    				painters[i].dy = mouseY;
    			} 	
			//console.log(mouseX);
		    };
		    if(curBrush=="sketchy" || curBrush=="shaded"){
    			points.length = 0;  //clear array
    			count = 0;
    			points.push( [mousePos.x, mousePos.y ] );
    		}; 
		    if(curBrush=="ps"){
                colorPSbrush();  
                context.drawImage($('hiddenCanvas'), mousePos.x-15, mousePos.y-15);  
            }; 

    		prevMouseX = mousePos.x;
    		prevMouseY = mousePos.y;   
    		canvas.onmousemove = brush_handler;
    		canvas.onmouseup = brush_handler;
    	};
        if(event.type == "mousemove"){
            if(curBrush=="sketchy" || curBrush=="shaded"){
                points.push( [mousePos.x, mousePos.y])  
            }; 
            if(curBrush=='ribbon'){
            		mouseX = mousePos.x;
        			mouseY = mousePos.y;
            }
            else{
                var stroke = br[curBrush];  //names the function in br object
				stroke(context,mousePos.x,mousePos.y, prevMouseX,prevMouseY,points,count);
				prevMouseX = mousePos.x;
				prevMouseY = mousePos.y;
			};
			if(curBrush=="sketchy" || curBrush=="shaded"){count++};
        }
        if(event.type == "mouseup"){
            canvas.onmousemove = null;
            canvas.onmouseup = null;
        }
        
        if(event.type == "touchstart"){  //tstart
            event.preventDefault();
            var touchPos = getTouchPos(canvas, event);// !!!!!  
            // console.log(touchPos);  works
            mouseX = touchPos.x;
            mouseY = touchPos.y

            if(curBrush == 'ribbon'){  
    	        for (var i = 0; i < 50; i++){
    	            painters[i].dx = mouseX;
    	            painters[i].dy = mouseY;
    				}
    			 } 

            if(curBrush=="sketchy" || curBrush=="shaded"){
                points.length = 0;  //clear array
                count = 0;
                points.push( [touchPos.x, touchPos.y ] ); 
            } 
            if(curBrush=="ps"){
                colorPSbrush();  
                context.drawImage($('hiddenCanvas'), touchPos.x-15, touchPos.y-15);  //!!!
            } 
            prevMouseX = touchPos.x;
            prevMouseY = touchPos.y;   
            canvas.ontouchmove = brush_handler;
            canvas.ontouchend = brush_handler;
        }
        if(event.type == "touchmove"){
            event.preventDefault();
            var touchPos = getTouchPos(canvas, event);
            //console.log(touchPos);

            

            if(curBrush=="sketchy" || curBrush=="shaded") {
                points.push( [touchPos.x, touchPos.y])  
            }; 

            if(curBrush == 'ribbon'){
          		mouseX = touchPos.x;  //for ribbon_ update
    				 mouseY = touchPos.y;
    			}
    			else{
    				var stroke = br[curBrush];  //names the function in br object
            		stroke(context,touchPos.x,touchPos.y, prevMouseX,prevMouseY,points,count);
            		prevMouseX = touchPos.x;
            		prevMouseY = touchPos.y;
    			}
             if(curBrush=="sketchy" || curBrush=="shaded"){count++};
        }
        if(event.type == "touchend"){
            canvas.ontouchmove = null;
            canvas.ontouchend = null;
        }
    } 

    //now can just add a listener to make canvas drawable 
    function makeDrawable(canvasId){
        $(canvasId).onmousedown = brush_handler;
        $(canvasId).ontouchstart = brush_handler;
    }

////////////////////// making a color picker component /////////
    function fillMixerCanvas(){
        var c = $c('mixerCanvas');
        mixerGradient = c.createLinearGradient(10, 0, 240, 0);
        mixerGradient.addColorStop(0,'red');
        mixerGradient.addColorStop(1/6,'yellow');
        mixerGradient.addColorStop(3/12,'yellow');
        mixerGradient.addColorStop(5/12, 'rgb(0,255,0)');
        mixerGradient.addColorStop(3/6, 'cyan');
        mixerGradient.addColorStop(7/12, 'cyan');
        mixerGradient.addColorStop(4/6,'blue');
       // mixerGradient.addColorStop(9/12,'blue');
        mixerGradient.addColorStop(9/12,'magenta');
        mixerGradient.addColorStop(1,'magenta');
        c.fillStyle = mixerGradient;
        c.fillRect(10, 0, 240,  10);

      //   mixerGradient = c.createLinearGradient(10, 0, 200, 0);
      //   mixerGradient.addColorStop(0,'red');
      //   mixerGradient.addColorStop(.8,'orange');
      //   mixerGradient.addColorStop(0.137,'yellow');
      //   mixerGradient.addColorStop(0.34, 'rgb(0,255,0)');
      //   mixerGradient.addColorStop(.51, 'cyan');
      //  // mixerGradient.addColorStop(7/12, 'cyan');
      //   mixerGradient.addColorStop(.7,'blue');
      // //  mixerGradient.addColorStop(.67,'rgb(255,100,255)');
      //  mixerGradient.addColorStop(.8,'rgb(255,100,255)');
      //   mixerGradient.addColorStop(1,'red');
        // c.fillStyle = mixerGradient;
        // c.fillRect(10, 0, 210,  20);




        };
    function getColor(canvas,event){
        //if(window.netscape && netscape.security){netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead")};
       // onsole.log(canvas,event);
         var c = canvas.getContext('2d');
         var mousePos = getMousePos(canvas, event);
         var w=  canvas.width;
         var imageData = c.getImageData(0, 0, w, canvas.height);
       //  Access-Control-Allow-Origin: *
        //Access-Control-Allow-Credentials: true
         var pix = imageData.data;

         var x = mousePos.x;
         var y = mousePos.y;
         //onsole.log(w,y,x); //200 8.727267466300901 510
         //onsole.log(((w * y) + x) * 4, pix[5574], pix[5574.8]);//5573.813973040721 
         var red = pix[parseInt(((w * y) + x) * 4) ];
         var green = pix[parseInt(((w * y) + x) * 4 + 1)];
         var blue = pix[parseInt(((w * y) + x) * 4 + 2) >>0];
         var COLOR =[red,green,blue];
         return "rgb(" + COLOR[0] + "," + COLOR[1] + "," + COLOR[2] +  ")";
                //return COLOR;    
            }; 
    function fillShaderCanvas(){  
        var c = $c("shaderCanvas");
        var color = curFGcolor;
        //onsole.log(color);
        var shaderGradient = c.createLinearGradient(0, 0, 150, 0);
        shaderGradient.addColorStop(.1, 'white');
        shaderGradient.addColorStop(.7, color);
        shaderGradient.addColorStop(1,'black');
        c.fillStyle = shaderGradient;
        c.fillRect(0, 0, 150,  10);
        };
    function fillCurColorCanvas(){    //BBB
       var button = $("curColorCanvas");
       // var c = $c(canvas);
       //var color = color2string(curPIXcolor);
       //c.fillStyle = curFGcolor;
       //var input = document.getElementById("input2");
       button.style.backgroundColor = curFGcolor;};
    function pickerHandler(event){
        var id, canvas;
        if(event.target.id == 'mixerCanvas'){id='mixerCanvas'; canvas=$('mixerCanvas');};
        if(event.target.id == 'shaderCanvas'){id='shaderCanvas'; canvas = $('shaderCanvas');};
        if(event.type == "mousedown"){

            pickerMouseDown = true;
            var mousePos = getMousePos(canvas, event);
            var x = mousePos.x;
            if ( mousePos !== null) {
                var color =getColor(canvas,event);
               // onsole.log(canvas,event,color);
                curFGcolor = color;  
                fillCurColorCanvas();
                if(event.target.id == 'mixerCanvas'){fillShaderCanvas();};
                if(curBrush=='ps')       //  pspspsps
                    {colorPSbrush();};                  
            };
            $l(id,'mousemove',pickerHandler);
            $l(id,'mouseup',pickerHandler);
        };
        if(event.type == "mousemove"){
            var mousePos = getMousePos(canvas, event);
            if (pickerMouseDown && mousePos !== null) {
                var COLOR =getColor(canvas,event);
                curFGcolor = COLOR;  
                fillCurColorCanvas();
                if(event.target.id == 'mixerCanvas'){fillShaderCanvas();};
                if(curBrush=='ps')
                    {colorPSbrush();};  
            };
        };
        if(event.type == "mouseup"){
            $rl(id,'mousemove',pickerHandler);
            $rl(id,'mouseup',pickerHandler);
            pickerMouseDown = false;
        };
        };
    //putting it together
    function new_colorPicker(parent){
        //make a container for the picker, make it draggable for fun
        new_element('div',parent,250,20,'picker_container', 
            {border:  'none', // '1px dotted #ccc', 
            left:0,top:0, // -19  left:80,top:-5,
            resizable:false,
            alive:true});  

        ///////////
        // var input = document.getElementById("input2");
        // var button = document.getElementById("button");
        // input.onchange = function() {
        //     button.style.backgroundColor = input.value;    
        // }
        // button.style.backgroundColor = input.value;


        ///////////


        //make a canvas and fill it with the current color   CCC
        // new_canvas('picker_container',20,15,'curColorCanvas', //20
        //     {border: 'none',    ///1px dotted #ddd', 
        //     position: 'absolute', left: 165, top:0, alive:false });  //8
        // fillCurColorCanvas();

        //make a div  'button' instead of a cur color canvas 'button'. 
        //So id = 'curColorCanvas' is a misnmer in this version of the library
       new_element('div','picker_container',20,15,'curColorCanvas',
       	 {position: 'absolute', left: 165, top:-5, 
       	 bgcolor: curFGcolor, alive:false }); 
     	new_element('input','picker_container',30,30,'input2', {type: "color",  opacity: '0',
     		display: 'block', border: 'none',
    		 value: 'blue', 
    		 position: 'absolute', left: 165, top:0, alive:false }); 
     	//console.log($('input2'));

     	
       //make a new canvas and fill it with a rainbow gradient
       new_canvas('picker_container',200,10,'mixerCanvas', //20
            {border: 'none', 
            position: 'absolute',
            left: 200, top:0,  //10
            alive:false });
       fillMixerCanvas();

    	//make a new canvas and fill it with a shader gradient
    	new_canvas('picker_container',150,15,'shaderCanvas', 
            {border: 'none', 
            position: 'absolute',
            left: -10, top:0,  // left: 75, top:35+5,
            alive:false }
       );
       fillShaderCanvas();


      // yyy

    	//breath life into picker by adding handler and listeners
    	$l('mixerCanvas','mousedown',pickerHandler);
    	$l('shaderCanvas','mousedown',pickerHandler); 


    	function hex2rgb(hex) {
    			var hex = hex.replace(/[^0-9A-F]/gi, '');  //removes #
    	    	var bigint = parseInt(hex, 16);
    	    	var r = (bigint >> 16) & 255;
    	    	var g = (bigint >> 8) & 255;
    	    	var b = bigint & 255;
    	    	return [r,g,b];   //.toString();
    	}
    	function toString(rgb){
    				return "rgb(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ")";
    	}

    	$('input2').onchange = function(){
    		$("curColorCanvas").style.backgroundColor = this.value;
    		var hex = this.value;  //a string #00ff99
    		var rgb = hex2rgb(hex); //an array
    		curFGcolor =  toString(rgb);
    		fillShaderCanvas();
    		if(curBrush=='ps')
    		                {colorPSbrush();};



    		//console.log(curFGcolor); //yyy
    	}
    };

///////////////// making a slider component .....///////////////
    // function new_slider(){
    //     var parent = 'slidiv1';
    //     var layer0 = parent + '_layer0';
    //     var layer1 = parent + '_layer1';
    //     var layer2 = parent + '_layer2'
    //     new_element('div','',200,25,'slidiv1',{border: '1px dotted red', alive: true});
    //     new_canvas(parent, 165,25, layer0,{border: 'none', position: 'absolute', zIndex:0});
    //     new_canvas(parent,165,25,layer1,{border: 'none',position: 'absolute', zIndex:1});
    //     new_canvas(parent,165,25, layer2, {border: 'none',position: 'absolute', zIndex:2});

    //     var l0 = document.getElementById(layer0);
    //     var l1 = document.getElementById(layer1);
    //     var l2 = document.getElementById(layer2);  //l2=canvas

    //     drawLine(l0,10,10,110,10);
    //     drawRect(l1,13,0,15,15);
    //     writeMessage(l2, '1',120,15);

    //     sliHandler = function(event){
    //         var mousePos = getMousePos(l2, event);
    //         var pos= mousePos.x;
    //         var scl_pos =Math.floor((pos-10)*(30/100));  
    //         if(event.type == "mousedown"){
    //             $l(l2, 'mousemove', sliHandler);
    //             $l(l2,  'mouseup', sliHandler);
    //         };
    //         if(event.type == "mousedown"){
    //             if(pos>=10 && pos<=110){
    //                 writeMessage(l2, scl_pos,133,15);
    //                 clearCanvas(l1);
    //                 drawRect(l1,pos,0,15,15);
    //                 curLineWidth= scl_pos; 
    //             }
    //         }
    //         if(event.type == "mousemove"){
    //             if(pos>=10 && pos<=110){
    //                 writeMessage(l2, scl_pos,133,15);
    //                 clearCanvas(l1);
    //                 drawRect(l1,pos,0,15,15);
    //                 curLineWidth= scl_pos; 
    //             }
    //         }
    //         if(event.type == "mouseup"){ 
    //             l2.onmousemove = null;
    //             l2.onmouseup = null;
    //         }
    //     };

    //     //l2.onmousedown = sliHandler;
    //     $l(l2,'mousedown',sliHandler);
    //     };
    ///////////////////adding text////////////////////////////
    //var tcounter = 0;
    // function newText(){
    //     new_element('textarea','',200,150,'text'+tcounter, 
    //         {display: 'block', position:'absolute', top: 300, left:300,
    //         alive:true, zIndex:150 } );
    //     $('text'+tcounter).style.color = curFontColor;
    //     $('text'+tcounter).style.bakgroundColor = curBGcolor; //
    //     $('text'+tcounter).style.fontFamily = curFont;
    //     $('text'+tcounter).style.fontSize = curFontSize;

    //     //document.getElementsByTagName(“body”)[0].style.fontFamily = curFont;
    //     $('text'+tcounter).innerHTML = 'who is here? Tell me!';
    //     tcounter += 1;
    // };
    // function changeFont(name){   //fonts.z
    //     curFont = name;
    //     var t = document.getElementsByTagName('textarea');
    //     for(var i =0; i<t.length; i++){
    //         if(!t(i)==changeLetters){t[i].style.fontFamily = name;}
    //     }
    // }
    // function changeFontSize(){   
    //     var t = document.getElementsByTagName('textarea');
    //     for(var i =0; i<t.length; i++){ 
    //         if(!t(i)==changeLetters){t[i].style.fontSize = curFontSize;} 
    //     }
    // }
    // function changeFontColor(){   
    //     var t = document.getElementsByTagName('textarea');
    //     for(var i =0; i<t.length; i++)
    //         {t[i].style.color = curFontColor; 
    //     }
    // }
    // function wrapText(context, text, x, y, maxWidth, lineHeight){
    //     var words = text.split(" ");
    //     var line = "";
     
    //     for (var n = 0; n < words.length; n++) {
    //         var testLine = line + words[n] + " ";
    //         var metrics = context.measureText(testLine);
    //         var testWidth = metrics.width;
    //         if (testWidth > maxWidth) {
    //             context.fillText(line, x, y);
    //             line = words[n] + " ";
    //             y += lineHeight;
    //         }
    //         else {
    //             line = testLine;
    //         }
    //     }
    //     context.fillText(line, x, y);
    // };{}
    // function textFlatten(){
    //     var context = $c('mainCanvas');
    //     var t = document.getElementsByTagName('textarea');
    //     for(var i =0; i<t.length; i++){ 
    //         var el = document.getElementById('text'+i);
    //         var message = el.value;
    //         var x = parseInt(el.style.left);  //400
    //         var y = parseInt(el.style.top);     //300
    //         var w = parseInt(el.style.width);
    //         var h = 1.25*parseInt(curFontSize);
    //         context.font = curFontSize  + ' ' + curFont;
    //         context.fillStyle = curFontColor;
    //         wrapText(context, message, x-5, y+15, w, h); 
    //         el.style.display = 'none';
    //     }   
    // };
    //////////////////add Letters brush///////////////////////
    // function Letters_handler(evt){
    //     var canvas =$(evt.target.id);
    //     var m = getMousePos(canvas, evt);
    //     //curX = m.x;
    //     //curY = m.y;
    //     c.font = curFontSize  + ' ' + curFont;
    //     c.fillStyle = curFontColor;
    //     c.fillText(Letters[count], m.x, m.y);
    //     count = (count + 1) % Letters.length;
    // };
    ////////draggable, resizable, rotateable, & hideable
    /////////////////elements with mm (no handles) ///////////
    function drag_handler(event){
        var car =  $(event.target.id);
        var offsetX, offsetY;
        var mm = $('mm');
             
        if(event.type == "mousedown"){  
                car.style.cursor = 'move' ; 
                //record original position focusing on left and right
                offsetX = event.clientX - parseInt(car.style.left || 0);
                offsetY = event.clientY - parseInt(car.style.top || 0);
                // add other listeners
                document.onmousemove = onDraggerMove;
                document.onmouseup = onDraggerUp;       
                // prevent event propagation
                event.preventDefault();
                return false;
        };
                    
        function onDraggerMove(event){
            // change left and top of  container in accord with mouse movement
            car.style.left = event.clientX-offsetX;
            car.style.top = event.clientY-offsetY;          
        };  

        function onDraggerUp(event){ 
                car.style.cursor = 'default' ; 
                // remove listeners
                //car.onmousedown = null;
                if(mm_target){mm_target.onmousedown = null;}
                document.onmousemove = null;
                document.onmouseup = null;
                //mm.selection.empty(); //mm_target = null;  //blur() should remove the focus!


        };
            };
    function resize_handler(event){
        var car = $(event.target.id);  
        var offsetX,  offsetY;
        var mm = $('mm');

        if(event.type == "mousedown"){    
            car.style.cursor = 'e-resize';
            //record original position focusing on w and h
            if(car.tagName == 'CANVAS'){
                offsetX = event.clientX - parseInt(car.width || 0);
                offsetY = event.clientY - parseInt(car.height || 0);
            }
            else{offsetX = event.clientX - parseInt(car.style.width || 0);
                offsetY = event.clientY - parseInt(car.style.height || 0);
            }
            // add other listeners
            document.onmousemove = onResizerMove;
            document.onmouseup = onResizerUp;
            // prevent event propagation
            event.preventDefault();
            return false;
        };

        function onResizerMove(event){
            // change w and h of  container in accord with mouse movement
            if(car.tagName == 'CANVAS'){
                car.width = event.clientX-offsetX;
                car.height = event.clientY-offsetY;
            }
            else{car.style.width = event.clientX-offsetX;
                car.style.height = event.clientY-offsetY;
            };
        };

        function onResizerUp(event){  
            car.style.cursor = 'default';
            // remove listeners
            //$l(mm_target,'mousedown',resize_handler);
            document.onmousemove = null;
            document.onmouseup = null; 
        };
        };
    function rotate_handler(event){
        var car = $(event.target.id); 
        var mm = $('mm'); 
        var offsetX, offsetY;

             
        if(event.type == "mousedown"){ 
            car.style.cursor ='se-resize';   
            //add listeners
            document.onmousemove =  rotatorMove;
            document.onmouseup = rotatorUp;
            // prevent event propagation
            event.preventDefault();
            return false;
        };
        
        function rotatorMove(event){ 
            var w,h;
            if(car.tagName == 'CANVAS') {w=parseInt(car.width);
             h = parseInt(car.height)
            }
            else{
                w=parseInt(car.style.width); h = parseInt(car.style.height); 
            }
            var center_x = parseInt(car.style.left || 0) + (w/2);
            var center_y = parseInt(car.style.top || 0)   + (h/2);
            var mouse_x = event.pageX; 
            var mouse_y = event.pageY;  
            var radians = Math.atan2(mouse_x - center_x, mouse_y - center_y);
            var degree = (radians * (180 / Math.PI) * -1) + 90;
            car.style.MozTransform = 'rotate(' +degree+'deg)';
            //car.style.MozTransformOrigin = 'left' ; //-moz-transform-origin: bottom left,right,center;
            car.style.OTransform = 'rotate(' +degree+'deg)';  //opera!
        };

        function rotatorUp(event) {
            car.style.cursor ='default';   
            // remove listeners
            //$rl(mm_target,'mousedown',rotate_handler);
            document.onmousemove = null;
            document.onmouseup = null; 
        };
        };
    //and to hide:
    var Hidden = [];
    function hide_handler(event){
        var mm = $('mm');
        var t = $(event.target.id);
        Hidden.push(t);
        t.style.display='none';
        t.onmousedown = null;
        mm.focus; mm.value='';
        mm.select();
        setTimeout("$('mm').focus()",400);
        //alert('bye');
        }
    function show(num){
    var mm = $('mm');
    var t = Hidden[num];
    t.style.display='block';
    var i = Hidden.indexOf(t);
    Hidden.splice(i,1); //remove item from array  //at position i remove 1b item
    mm.focus; mm.value='';
    mm.select();
    setTimeout("$('mm').focus()",400);
    //alert('hi');
    };  

////////////////////// adding a magicmenu ////////////    
    var mm_target;
    function mm_init(id){    
        var mm = $(id);
        //mm.value = 'draw';  //to refresh the value -- perhaps a ff bug workaround

        function mm_options_handler(){
            var mm1 = mm.value.slice(1);
            //mm for draggable etc. element
            if(mm.value == 'turn'){mm_target.onmousedown=rotate_handler; }
            if(mm.value == 'move'){mm_target.onmousedown=drag_handler; }
            if(mm.value == 'resize'){mm_target.onmousedown=resize_handler; }
            if(mm.value == 'hide'){mm_target.onmousedown=hide_handler; }
            if(mm.value == 'show'){show(Hidden.length-1);}

            if(mm.value == 'draw'){mm_target.onclick=null; mm_target.onmousedown=brush_handler; }

            if(mm.value == 'Letters'){mm_target.onmousedown = null; mm_target.onmousemove = null; 
                mm_target.onclick=Letters_handler; }

            //adding brushes to mm
            if(mm.value == 'simple'){curBrush = 'simple';}
            if(mm.value == 'eraser'){curBrush = 'eraser';}
            if(mm.value == 'sketchy'){curBrush = 'sketchy';}
            if(mm.value == 'shaded'){curBrush = 'shaded';}
            if(mm.value == 'ps'){curBrush = 'ps';}
            var mm1 =mm.value.slice(1);
            //changing stroke width
            if( isNaN(mm.value) == false ){curLineWidth= mm.value;}
            //if( mm.value.match(/^[0-9]+$/) ){curLineWidth= mm.value;}

            if( mm.value == 'bg color') {setbgcolor();}
            if( mm.value == 'fill color') {curFillColor = curFGcolor; }
            if( mm.value == 'xclear') {clearCanvas(mm_target);}

            if(mm.value == 'text') {newText();}
            if( mm1.match(/^[0-9]+$/) && mm.value.charAt(0)=='t'){curFontSize= mm1+'px'; changeFontSize();} 
            //if(isNaN(mm1)==false && mm.value.charAt(0)=='t'){curFontSize= mm1; changeFontSize();}
            if(mm.value == 'tk'){ changeFont(fonts.k);}
            if(mm.value == 'tz'){ changeFont(fonts.z);}
            if(mm.value == 'td'){ changeFont(fonts.d);}
            if(mm.value == 'ta'){ changeFont(fonts.a);}
            if(mm.value == 'tt'){ changeFont(fonts.t);}
            if(mm.value == 'tf'){ textFlatten();}
            if(mm.value == 'tFG'){curFontColor= curFGcolor; changeFontColor();}

            if(mm.value == 'save'){saveit();}
            if(mm.value == 'open'){openit();}
            if(mm.value == 'store'){storeit();}

            //if(mm.value == 't'+num){ changeFontSize(num);}

        }

        var Picks = new Array('turn','move','resize','hide', 'show', 'draw', 'xclear',
                'simple','eraser','sketchy', 'shaded',
                'bg color', 'fill color','text', 'tk','tz','td', 'ta','tf','save',
                'store','open', 'Letters'); //kids,zeit,dancing,afr

        function  mm_completion_handler(e){
                var a=[], 
                    matches=0,  
                    t = $(e.target.id),
                    v=t.value;
                for(var i=0; i<Picks.length; i += 1){
                    var p=Picks[i];
                    var m = p.indexOf( v, 0 );   //index of match, 0 means from the beginning, -1 means none, 0 is opt start  position for search
                    if(m==0) {matches += 1; a.push(p)};
                };
                if(matches==1){ v = a[0];  mm.value=a[0];};
                };

        mm.addEventListener( 'keyup', mm_completion_handler, false );
        mm.addEventListener( 'keyup', mm_options_handler, false );
        };
    function target_handler(event){   
        //registers element to mm on click
        var mm=$('mm');
        mm_target = $(event.target.id);
        //alert(mm_target.id);
        mm.focus;
        mm.value='';
        //mm.select();
        //if(!mm.target=='text') {mm.select(); }; 
    };
    function setbgcolor(canvas){
        canvas = canvas || $('mainCanvas'); 
        curBGcolor = curFGcolor;
        storage.set('bgcolor',curBGcolor);
        canvas.style.backgroundColor = curBGcolor;
        //console.log(curFGcolor,curBGcolor );
        // for(var i = 0; i<tcounter; i++){ 
        //     $('text'+i).style.backgroundColor = curBGcolor;}; 
        //c.fillStyle = curBGcolor;
        //c.fillRect(0,0,canvas.width, canvas.height);
    };

//////////////adding a full-feature control panel ////////
    function new_drawingControlPanel(){
        //make a container for the controls, make it draggable and resizable for fun
        new_element('div','',940,20,'controls_container', 
            {border: 'none', //1px dotted #ccc', 
            position:'relative',
            top:40, center:true}); //30 tttop

        //add a color picker (component)
        new_colorPicker('controls_container');

        //add a  selector  with brush choices as options 
        var brushes  = ["brushes",' ', ' ', "sketchy","shaded","ribbon","simple","eraser","ps", 
              "circles","squares"]; // "chrome", "fur", "longfur", "web",  "grid" 
       
         new_element('select','controls_container','','','brushSelector',
          {position:'absolute', left: 450, top:-5, className:'fancySelect'} ); //10

        for (i = 0; i < brushes.length; i++){   
                option = document.createElement("option");
                option.className = 'fancyOptions';
                option.id = brushes[i];
                option.innerHTML = brushes[i];
                $('brushSelector').appendChild(option);
        };

        //add a mm 
        new_element('input','controls_container','','','mm', 
            {type: "text", size: '8', value :  "draw",
             position: 'absolute', left: 600, top:-5});  //15
    
        $l($('input2'), 'input', function(){  
            var hex = $('input2').value;  //a string #00ff99
            var rgb = hex2rgb(hex); //an array
            curFGcolor =  toString(rgb);
            if(curBrush=='ps')
                        {colorPSbrush();};
            //onsole.log(rgb,curFGcolor); // [0, 255, 64] "rgb(0,255,64)"
        })

        function toString(rgb){
                return "rgb(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ")";
        }


        //add a listener and handler to make brush selection come alive
        //     var psContainer = document.getElementById('psContainer');
       $l($('brushSelector'),'change', function(){
            // if(curBrush == 'ribbon') {    //ribbon  //moved to brush handler
            //  clearInterval(interval);};
            if(!(brushSelector.value=="brushes")){
                curBrush = brushSelector.value;};
                // console.log(brushSelector, $("brushSelector"));  //SAME!XXXXXX`curXX`XXXXXXX 
            if(brushSelector.value=="brushes"){
                    curBrush = "simple";  }
               // console.log(curBrush);

            if(curBrush =='eraser'){$c('mainCanvas').globalCompositeOperation = 'destination-out'}
            else {$c('mainCanvas').globalCompositeOperation = 'source-over'} 
                
            if(curBrush == 'ribbon'){ribbon_init()}   //ribbon
               // if(brushSelector.value=="ps"){
                //    $('psMenu').style.display='block';
                //     selector.value="brushes";
                //     curBrush = "ps";
               // }
            }
       )
    };

    window.addEventListener('resize',function(){
        var c = $('mainCanvas');
        var ch = c.height;
        var w = SCREEN_WIDTH = window.innerWidth;
        var h = SCREEN_HEIGHT = window.innerHeight;

        if(ch<h){ 
            // c.width =  w;
            //c.height =  h;

            /* make a copy of canvas */
            var copycanvas = document.createElement("canvas");
            copycanvas.width = c.width;
            copycanvas.height = c.height;
            copycanvas.getContext("2d").drawImage(c, 0, 0);

            /* change the size */
            c.width = w;
            c.height = h;

            /* draw the copy */
            c.getContext("2d").drawImage(copycanvas, 0, 0);
            copycanvas = null;
        }},false
    );
  
///////////////saveit, openit/////////////////////
    function saveit(){
        //textFlatten();

        var canvas = $('mainCanvas');
        var w = canvas.width;
        var h = canvas.height;
        
        var el = document.createElement('canvas');
        el.id = 'flattenCanvas';
        el.width = w;
        el.height= h;
        el.style.position ='absolute';
        var c = el.getContext("2d");
        c.fillStyle = curBGcolor;
        c.fillRect(0, 0, w, h);
        c.drawImage(canvas, 0, 0);
        window.open(el.toDataURL('image/png'),'mywindow');
    }
    //show io field, hide canvas (which covers it).  
    //So user can select an image file.
    //This function is called by typingIO 'open' into mm
    function openit(){
        cn.style.display = 'none' //hide main canvas display
        io.style.display = 'block'; //show input-file display
    }
    //This function is called by typing 'store' into mm:
    function storeit(){
        storage.set('bgcolor', curBGcolor);
        //save unflattened canvas to disk:
        window.open(uri,'mywindow'); 
    }





// io handler (onchange listener) 
// will draw selected img file onto main canvas(!):
function handleIO(e) {
    var f = e.target.files[0]; // FileList object
    var reader = new FileReader();
    reader.onload = function(e) {
        uri = e.target.result;  
        var img = new Image();   // Create new img element
        img.onload = function() {
            console.log(img.width, img.height);
            cn.width = img.width;
            cn.height = img.height;
            console.log(cn.width, cn.height);
           // curBGcolor = storage.get(bgcolor);
            c.drawImage(img, 0, -50); 
            //show canvas & hide io
            cn.style.display = 'block';
            io.style.display = 'none'; 
        }; 
        img.src = uri;
    };
    // Read  the image file as a data URL.
    reader.readAsDataURL(f);
}




 
    








  
    
    
    
       
