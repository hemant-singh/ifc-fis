								var map;
                                var canvasLayer;
                                var gl;

                                var pointProgram;
                                var pointArrayBuffer, squareVertexPositionBuffer;
                                var RegionCoords0 = [];
                                var RegionCoords1 = [];
                                var TargetCoords1 = [];
                                var HoleCoords1 = []; 
								var TextureCoords=[];		

                                var pixelsToWebGLMatrix = new Float32Array(16);
                                var mapMatrix = new Float32Array(16);
                                var startTime;
								var object_counter=0;
								var object_ref_array=[];
								var object_poly_array=[];
								var deleted_object_array=[];
								var deleted_object_counter=0;
								var MinX,MaxX,MinY,MaxY; //Used for texture mapping
								var canvas;	
								var Zoomlevel,mapObject;		
								
								//Next two variables are used in fragment shader
								var waveWidth=3.9;		
								var waveFrequency=1.6;
								var Parameter1=10.0;
								var Parameter2=0.03;
								var speed=22.0;
		
								
								//Sunctions which take value for shader parameters
								 function updateFrequencyInput(val) {
								  waveFrequency=val; 
								   document.getElementById('waveFrequency').innerText="Frequency = "+val; 
								}
								
								function updateWidthInput(val) {
								  waveWidth=val; 
								  document.getElementById('waveWidth').innerText="Width = "+val; 
								}
								
								function updateParameter1Input(val) {
								  Parameter1=val; 
								  document.getElementById('Parameter1').innerText="Parameter1 = "+val; 
								}
								
							/*	function updateParameter2Input(val) {
								  Parameter2=val; 
								  document.getElementById('Parameter2').innerText="Parameter2 = "+val; 
								}
								
								function updateSpeedInput(val) {
								  Speed=val; 
								  document.getElementById('Speed').innerText="Speed = "+val; 
								}
								
								*/
								var image = new Image();
								
								function loadImage(texData) {
									image.src = "water2.png";							
								 // MUST BE SAME DOMAIN!!!
								image.onload = function() {
								loadTexture(texData,image);
									}
								}
								
								  function init()
                                {
								
								
                                    // initialize the map
                                    var mapOptions = {
                                        zoom: 9,
                                        center: new google.maps.LatLng(24.663824, 88.015782),
                                        mapTypeId: google.maps.MapTypeId.TERRAIN,
										disableDefaultUI: true,
										zoomControl: true,
                                        styles: [
                                        {
                                            featureType: 'water',
                                            stylers: [
                                            {
                                                color: '#c3cfdd'
                                            }]
                                        }, {
                                            featureType: 'poi',
                                            stylers: [
                                            {
                                                visibility: 'off'
                                            }]
                                        }]
                                    };
                                    var mapDiv = document.getElementById('map-div');
									canvas=mapDiv;
                                    map = new google.maps.Map(mapDiv, mapOptions);

                                    // initialize the canvasLayer
                                    var canvasLayerOptions = {
                                        map: map,
                                        resizeHandler: resize,
                                        animate: false,
                                        updateHandler: update
                                    };
									
									
									//mapObject = new google.maps.Map(mapDiv, mapOptions);
									
									
                                    canvasLayer = new CanvasLayer(canvasLayerOptions);

                                    // initialize WebGL
                                    gl = canvasLayer.canvas.getContext('experimental-webgl');

                                    startTime = (new Date()).getTime();

                                    createShaderProgram();
									console.log("here");
									
									var polyOptions = 
									{
										  
										  fillOpacity: 0.5,
										  strokeColor: '#5E2612',
                                            strokeOpacity: 1,
                                            strokeWeight: 2,
										  
									};
										// Creates a drawing manager attached to the map that allows the user to draw
										// markers, lines, and shapes.
										drawingManager = new google.maps.drawing.DrawingManager({
										  drawingMode: google.maps.drawing.OverlayType.POLYGON,
										  markerOptions: {
											draggable: true
										  },
										  polylineOptions: {
											editable: true
										  },
										  rectangleOptions: polyOptions,
										  circleOptions: polyOptions,
										  polygonOptions: polyOptions,
										  map: map
										});

										google.maps.event.addListener(drawingManager, 'overlaycomplete', function(e) {
											if (e.type != google.maps.drawing.OverlayType.MARKER) {
											// Switch back to non-drawing mode after drawing a shape.
											drawingManager.setDrawingMode(null);

											// Add an event listener that selects the newly-drawn shape when the user
											// mouses down on it.
											var newShape = e.overlay;
											newShape.type = e.type;
											google.maps.event.addListener(newShape, 'click', function() {
											  setSelection(newShape);
											  //console.log(newShape.getPath());
											});
											
										 
										 }
										});

										// Clear the current selection when the drawing mode is changed, or when the
										// map is clicked.
										google.maps.event.addListener(drawingManager, 'drawingmode_changed', clearSelection);
										google.maps.event.addListener(map, 'click', clearSelection);
										google.maps.event.addDomListener(document.getElementById('delete-button'), 'click', deleteSelectedShape);
										drawingManager.setDrawingMode(null);
										
										google.maps.event.addListener(drawingManager, 'overlaycomplete', function(event) {
										   {
										   event.overlay.objectNumber=object_counter;
										   event.overlay.shapeDeleted=false;
										   object_ref_array[object_counter]=event.overlay;
											object_poly_array[object_counter]=event.overlay.getPath().getArray();
											object_poly_array[object_counter].shapeDeleted=false;
											object_counter++;
										  }
										});

										buildColorPalette();
									
                                }

                                function createShaderProgram()
                                {
								
                               // create vertex shader
                                    var vertexSrc = document.getElementById('pointVertexShader').text;
                                    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
                                    gl.shaderSource(vertexShader, vertexSrc);
                                    gl.compileShader(vertexShader);
									console.log("hello1");
									var success = gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS);
									  if (!success) {
										// Something went wrong during compilation; get the error
										throw "could not compile vertex shader:" + gl.getShaderInfoLog(vertexShader);
									  }

                                    // create fragment shader
                                    var fragmentSrc = document.getElementById('pointFragmentShader').text;
                                    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
                                    gl.shaderSource(fragmentShader, fragmentSrc);
                                    gl.compileShader(fragmentShader);
									console.log("hello2");
									
									  var success = gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS);
									  if (!success) {
										// Something went wrong during compilation; get the error
										throw "could not compile fragment shader:" + gl.getShaderInfoLog(fragmentShader);
									  }
									

                                    // link shaders to create our program
                                    pointProgram = gl.createProgram();
									console.log("hello3");
                                    gl.attachShader(pointProgram, vertexShader);
									console.log("hello4");
                                    gl.attachShader(pointProgram, fragmentShader);
									console.log("hello5");
                                    gl.linkProgram(pointProgram);								
									console.log("hello3");
									 var success = gl.getProgramParameter(pointProgram, gl.LINK_STATUS);
									  if (!success) {
										  // something went wrong with the link
										  throw ("program filed to link:" + gl.getProgramInfoLog (pointProgram));
									  }
									
									gl.useProgram(pointProgram);
									
                                }

                                // linear interpolate between a and b

                                
                                var bufferCounter = 0;
								var attributeLoc;

                                function load_in_gl(rawData2, attribname)
                                {

                                    // create webgl buffer, bind it, and load rawData into it
                                    if (bufferCounter == 0)
                                    {
                                        pointArrayBuffer = gl.createBuffer();
                                        bufferCounter++;
										attributeLoc = gl.getAttribLocation(pointProgram, attribname);
										gl.bindBuffer(gl.ARRAY_BUFFER, pointArrayBuffer);
										pointProgram.pTimeUniform = gl.getUniformLocation(pointProgram, "time");
										pointProgram.pResolutionUniform = gl.getUniformLocation(pointProgram, "resolution");
										pointProgram.pwaveWidthUniform = gl.getUniformLocation(pointProgram, "frequency");
										pointProgram.pwaveFrequencyUniform = gl.getUniformLocation(pointProgram, "width");
										pointProgram.pParameter1Uniform = gl.getUniformLocation(pointProgram, "Parameter1");
										pointProgram.pParameter2Uniform = gl.getUniformLocation(pointProgram, "Parameter2");
										pointProgram.pZoomUniform = gl.getUniformLocation(pointProgram, "zoom");
										pointProgram.pSpeedUniform = gl.getUniformLocation(pointProgram, "speed");
									}
                                    
                                    gl.bufferData(gl.ARRAY_BUFFER, rawData2, gl.STATIC_DRAW);
                                    // enable the 'worldCoord' attribute in the shader to receive buffer
                                  
                                    gl.enableVertexAttribArray(attributeLoc);
                                    // tell webgl how buffer is laid out (pairs of x,y coords)
                                    gl.vertexAttribPointer(attributeLoc, 3, gl.FLOAT, false, 0, 0);

                                    
                                    var time = (new Date()).getTime();
									var zoom=map.getZoom();
									//console.log(zoom);
                                    gl.uniform1f(pointProgram.pTimeUniform, (time - startTime) / 1000.0);
                                    gl.uniform1f(pointProgram.pwaveWidthUniform, waveWidth);
                                    gl.uniform1f(pointProgram.pwaveFrequencyUniform, waveFrequency);
									gl.uniform1f(pointProgram.pParameter1Uniform, Parameter1);
									//console.log(Parameter2);
									gl.uniform1f(pointProgram.pParameter2Uniform, Parameter2);
                                    gl.uniform1f(pointProgram.pZoomUniform, zoom);
                                    gl.uniform1f(pointProgram.pSpeedUniform, Speed);
                                    
									gl.uniform2f(pointProgram.pResolutionUniform, canvas.width, canvas.height);
                                }
								
								
								
								
								
								
								function loadTexture(texData,image)
								{
								
								 var texCoordLocation = gl.getAttribLocation(pointProgram, "a_texCoord");
								  var texCoordBuffer = gl.createBuffer();
								  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
								  gl.bufferData(gl.ARRAY_BUFFER,texData, gl.STATIC_DRAW);
								  gl.enableVertexAttribArray(texCoordLocation);
								  gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);
									
								 var texture = gl.createTexture();
								gl.bindTexture(gl.TEXTURE_2D, texture);

								  // Set the parameters so we can render any size image.
								  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
								  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
								  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
								  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

								  // Upload the image into the texture.
								  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);			
								
								
								}
                               

                                var centroid1;
								
								
								
                                function initial_data()
                                {
								drawingManager.setOptions({
									  drawingControl: false
									});
                                    var mapProjection = map.getProjection();
                                    RegionCoords1 = initialPoly_data(2);
/*Now we will increase the number of points to somewhere 10 times of current coordinates so that to smooothen the morphing.
The points are increased by calculating and adding midpoints of the given coordinates of the polygon		
*/
                                    var RegionCoords3 = RegionCoords1.slice(0);
                                    var i, j, k;
                                    var RegionCoords2 = [];
                                    for (i = 0; i < 3; i++)
                                    {
                                        for (j = 0, k = 0; j < (RegionCoords3.length - 1); j++, k + 2)
                                        {
                                            var oldCoord = new Coords(RegionCoords3[j].x, RegionCoords3[j].y);
                                            RegionCoords2.push(oldCoord);
                                            var newCoord = new Coords((RegionCoords3[j].x + RegionCoords3[j + 1].x) / 2, (RegionCoords3[j].y + RegionCoords3[j + 1].y) / 2);
                                            RegionCoords2.push(newCoord);
                                        }

                                        RegionCoords3 = RegionCoords2.slice(0);
                                        RegionCoords2.length = 0;
                                    }
                                    RegionCoords1 = RegionCoords3.slice(0);

                                    return RegionCoords1;
                                }

                                function initialPoly_data(x)
                                {
                                    var mapProjection = map.getProjection();
                                    var Coords1 = [],
                                        Coords2 = [];
                                    for (i = 0; i < InitPoly.length; i = i + 2)
                                    {
                                        var LatLngObject = new google.maps.LatLng(InitPoly[i], InitPoly[i + 1]);
                                        Coords1.push(LatLngObject);
                                        var XYObject = map.getProjection().fromLatLngToPoint(LatLngObject);
                                        Coords2.push(XYObject);
                                    }

                                    if (x == 1) return Coords1;
                                    else return Coords2;
                                } //This function returns target polygon data and value of x determines that wether the returned data should be in lat lng form or mercartor projections

                               
                                //Function loaddata converts data from object form to simple array of vertices and then calculates the triangulation	
                                var debug_counter = 0;

                                function loadData(CoordArray)
                                {

                                    var num_coods = CoordArray.length;
                                    var j = 0;
                                    var rawData2 = new Float32Array(2 * num_coods + 2);

                                    for (var i = 0, j = 0; j < CoordArray.length; i += 2, j += 1)
                                    {
                                        rawData2[i] = CoordArray[j].x;
                                        rawData2[i + 1] = CoordArray[j].y;
                                    }

                                    var triangulated_indices = PolyK.Triangulate(rawData2);
                                    var triangulatedData = new Float32Array(3 * (triangulated_indices.length - 1));
                                    POINT_COUNT = triangulated_indices.length - 1;
                                    for (var i = 0, j = 0; j < triangulated_indices.length - 1; i += 3, j += 1)
                                    {
                                        triangulatedData[i] = CoordArray[triangulated_indices[j]].x;
                                        triangulatedData[i + 1] = CoordArray[triangulated_indices[j]].y;
                                        triangulatedData[i + 2] = CoordArray[triangulated_indices[j]].z;
                                    }
                                    return triangulatedData;
                                }
								
								
								
                                function loadData1(CoordArray)
                                {

                                    var num_coods = CoordArray.length;
                                    var j = 0;
                                    var rawData2 = new Float32Array(2 * num_coods + 2);

                                    for (var i = 0, j = 0; j < CoordArray.length; i += 3, j += 1)
                                    {
                                        rawData2[i] = CoordArray[j].x;
                                        rawData2[i + 1] = CoordArray[j].y;
                                        rawData2[i + 2] = CoordArray[j].z;
                                    }

                                  
                                    return rawData2;
                                }
								
								
									
								
								
								
								/*
								function reduce_polygon(flag1,Coord,PCoords)
								{
								console.log("flaaag"+flag1);
								var newCoords=[];
								var i=0;
								var flag2=-1;
								for(i=0;i<PCoords.length ;i++)
								{
								if(i+10==flag1)
								{
								i=flag1+10;
								continue;
								}
								
								if(distance(Coord,PCoords[i])<0.05)
								{
								console.log("1111");
								var pt=new Coords((Coord.x+PCoords[i].x)/2,(Coord.y+PCoords[i].y)/2);
								if(!isPointInPoly(pt,PCoords))
								{
								console.log("dnfcjlkazbf");
								flag2=i;
								break;
								}
								}	
								}
								
								if(flag2==-1)
								{
								console.log("heya");
								return PCoords;
								}
								
								console.log("happy1");
								var exc;
								if(flag1>flag2)
								{
								exc=flag2;
								flag2=flag1;
								flag=exc;
								
								}
								console.log(flag1,flag2,i);	
								for(i=0;i<PCoords.length;i++)
								{
								newCoords[i]=PCoords[i];
								if(i==flag1)
								i=flag2+1;
								
								
								}
								console.log("happy2");
								return newCoords;
								
								
								}
								
								
								
								
*/
                               
/*
This function brings changes to geometry of the polygon which are responsible for the morphing effect.
For morphing the code is calculating a point on the perpendicular bisector of the line joining two consecutive
verices. The point lies at distance "step" from the edge of the old polygon.

In steps:	
1. First the code calculate the midpoint of two consecutive vertice
2. Then it calculates slope of normal to the line joining two consecutive vertices
3. The using this slope, midpoint and equation of line, a point at distace "Step" away is calculated
4. Using these new points we form the new polygon
*/

                               // var testangle = 1;
							   
								var step = 0.0005;
                                var area_diff = 0; //this variabvle stores the amount of area covered by morphing polygon in percentage and is used to stop animation

                                function updateData()
                                {
                                    var targetcoords = target_data(2);

                                   
                                    var targetcoordsForArea = target_data(3);
                                    var centroid = computePolygonCentroid(RegionCoords1, RegionCoords1.length);
										
                                    //This 
                                    var newCoords = [];
                                    
                                    var counter = 0;
                                    var arrayForArea = [] //This array is used for calculating area in the end
                                    //var i1=0;//this counter is used for area array increment
									//var start = new Date().getTime();
                                    for (i = 0; i < RegionCoords1.length; i++)
                                    {
                                        var y, x, m, slope, x1, x2, y1, y2,s1,s2,t1,t2, c, j = 0;
										if(RegionCoords1[i].over==true)
										{
										newCoords.push(RegionCoords1[i]);
										continue;
										}
                                        if (i == RegionCoords1.length - 1) j = 0;
                                        else j = i + 1;

                                        y = (RegionCoords1[i].y + RegionCoords1[j].y) / 2;
                                        x = (RegionCoords1[i].x + RegionCoords1[j].x) / 2;

                                        if ((RegionCoords1[i].x - RegionCoords1[j].x) != 0)
                                        {
                                            slope = (RegionCoords1[i].y - RegionCoords1[j].y) / (RegionCoords1[i].x - RegionCoords1[j].x);
                                        }
                                        else
                                        {
                                            slope = 0;
                                        }
                                        m = -1 / slope;
                                        //slope of normal
										//var step2=Math.sqrt(Math.pow(RegionCoords1[i].y - RegionCoords1[j].y, 2) + Math.pow(RegionCoords1[i].x - RegionCoords1[j].x, 2))/2;
                                        x1 = x + step * Math.cos(Math.atan(m));
                                        //Two x are calculated because there will be two points at distance step, one inside the current polygon and one outside.
                                        x2 = x - step * Math.cos(Math.atan(m));
                                        c = y - m * x;
                                        y1 = m * x1 + c;
                                        y2 = m * x2 + c;
                                        var newCoord1 = new Coords(x1, y1);
                                        var newCoord2 = new Coords(x2, y2);
                                        var newPoint;
										
										
										s1 = x + 4*step * Math.cos(Math.atan(m));
                                        //Two x are calculated because there will be two points at distance step, one inside the current polygon and one outside.
                                        s2 = x - 4*step * Math.cos(Math.atan(m));
                                        c = y - m * x;
                                        t1 = m * s1 + c;
                                        t2 = m * s2 + c;
										
										var newCoord3 = new Coords(s1, t1);
                                        var newCoord4 = new Coords(s2, t2);
										
                                        /*if (isPointInPoly(newCoord3, RegionCoords1) && isPointInPoly(newCoord4, RegionCoords1)) //This avoide formation of complex polygons
                                        {
										console.log("fass gaye :D");
										RegionCoords1=reduce_polygon(i,RegionCoords1[i],RegionCoords1);
                                          console.log("fass gaye111111111 :D");  
											continue;
											//play_pause_moprhing();
                                            //continue;
                                        }*/
                                        if (isPointInPoly(newCoord1, RegionCoords1)) //We take the point which is outside the current polygon
                                        {
                                            newCoord1.x = newCoord2.x;
                                            newCoord1.y = newCoord2.y;
                                        }

                                        if (isPointInPoly(newCoord1, targetcoords) && !isPointInHoles(newCoord1) ) //Is new point inside the target polygon, if yes we add it
									{
									  newCoords.push(newCoord1);
									} else {


									  RegionCoords1[i].over = true;
									  newCoords.push(RegionCoords1[i]);
									}

                                    }

                                  //area_diff = ((polygonArea(arrayForArea)) / polygonArea(targetcoordsForArea) * 100);
                                   // console.log(area_diff);
                                    area_diff=99;
                                    RegionCoords1 = newCoords.splice(0);
                                    var delete_distance = 0.001;
                                    var add_distance = 0.005;
									//var mid1 = new Date().getTime();
                                    for (i = 0; i < RegionCoords1.length; i++)
                                    {

										
                                        if (i == RegionCoords1.length - 1) j = 0;
                                        else j = i + 1;
                                        if (Math.sqrt(Math.pow(RegionCoords1[i].y - RegionCoords1[j].y, 2) + Math.pow(RegionCoords1[i].x - RegionCoords1[j].x, 2)) < delete_distance)
                                        {
                                            RegionCoords1.splice(i, 1);
											
                                            continue;
                                        }
											
                                        //If two consecutive points are too far away in the polygon, we add a point to smoothen the morphing
                                        if (Math.sqrt(Math.pow(RegionCoords1[i].y - RegionCoords1[j].y, 2) + Math.pow(RegionCoords1[i].x - RegionCoords1[j].x, 2)) > add_distance)
                                        {
                                            y = (RegionCoords1[i].y + RegionCoords1[j].y) / 2;
                                            x = (RegionCoords1[i].x + RegionCoords1[j].x) / 2;
                                            var newCoord1 = new Coords(x, y);
                                            RegionCoords1.splice(j, 0, newCoord1);
                                            i++;
                                        }
                                    }
									
									check_close_points(RegionCoords1);
									
									
									
									//var mid2 = new Date().getTime();
									//time1=mid1-start;
									//time2=mid2-mid1;
									//console.log(time1+"    "+time2+"  "+RegionCoords1.length); 
									
                                }

                                
                                var debug_counter = 0;
                                var DRAW_COUNT = 0;
                                var DRAW_HOLE_COUNTER = [];
                                var num_of_holes = HolePoly.length;
                                var animation_flag = 0;
								
								function attach_objects()
								{
								var i=0,c=HolePoly.length,d=object_poly_array.length,j1=0;
								
									for(i=0,j1=0;i<d;i++)
									{
									console.log((object_poly_array[i].shapeDeleted));
									if(!(object_poly_array[i].shapeDeleted))
									{
									
									var x=convert_obeject_data(object_poly_array[i]);
									
									HolePoly[c+j1]=x.slice(0);
									++j1;
									
									}															
									}
										
								}
								
								
								function setOrderOfVertices()//This function makes anti clockwise vertices in clockwise order
								{
								var i=0,c=HolePoly.length;
								console.log(c);	
								for(i=0;i<c;i++)
								{
								
								if(polygonArea(HolePoly[i])<0)
								{
								
								var newArr=reverseCoords(HolePoly[i]);
								HolePoly[i]=newArr.splice(0);
								
								}
								}
								
								if(polygonArea(InitPoly)<0)
								InitPoly=reverseCoords(InitPoly);
								
								if(!isPolyClockwise(TargetPoly))
								TargetPoly=reverseCoords(InitPoly);
								}
								
								function start_moprhing()
								{
								console.log("hi"+deleted_object_array);
								attach_objects();
								setOrderOfVertices();
								loadHoledata();	
								initial_data(); //initializing data
								
                                        updateData();
										
                                        i++;
                                        tick();
								
								
								}
								
								function play_pause_moprhing()
								{
								
								animation_flag++;
								
								}
								
								
								

                                function tick()
                                {
                                    {
                                        requestAnimFrame(tick);

                                        var converted_coord = [];
                                        if (!isNaN(parseFloat(area_diff)) && isFinite(area_diff) && area_diff > 99.4)
                                        {
                                            //console.log(area_diff);
                                            var targetcoords = target_data(2);
                                            converted_coord = loadData(targetcoords);
                                            animation_flag = 1;

                                        }
                                        else
                                        {	//console.log(RegionCoords1.length);
										
										   // var start = new Date().getTime();
                                            converted_coord = loadData(RegionCoords1);
											//var mid = new Date().getTime();
											if(animation_flag%2==0)
                                            updateData();
											//var end = new Date().getTime();
											//var time1=mid-start;
											//var time2=end-mid;
										//console.log(time1+"   "+time2);	
                                        }

                                        var i = 0;
										num_of_holes = HolePoly.length;
                                        var converted_coord_hole_array = [];
                                        for (i = 0; i < num_of_holes; i++)
                                        {
                                            var holecoords = hole_data(2, i);
                                            var converted_coord_hole = loadData(holecoords);
                                            DRAW_HOLE_COUNTER[i] = converted_coord_hole.length / 3;
                                            converted_coord_hole_array = combineArray(converted_coord_hole_array, converted_coord_hole);
                                        }
										
										var TexCoords=textureMap(converted_coord);
										loadImage(TexCoords);
										
                                        //converted_coord_hole1[2]=0;
                                        var newArray = combineArray(converted_coord, converted_coord_hole_array);
                                        //var newArray = combineArray(converted_coord, converted_coord_hole1);
                                        POINT_COUNT = (newArray.length) / 3;
                                        DRAW_COUNT = (converted_coord.length) / 3;
										//var start = new Date().getTime();
										
										
										
										
										
                                        load_in_gl(newArray, 'worldCoord');
										//var mid = new Date().getTime();
                                        if (debug_counter++ < 1) 
										console.log(TexCoords);

                                        drawScene();
										/*var end = new Date().getTime();
										var time1=mid-start;
										var time2=end-mid;
										console.log(time1+"   "+time2);	
                                    */}

                                }

                                var i = 0;

                              

                                function drawScene()
                                {
                                    gl.clear(gl.COLOR_BUFFER_BIT);
                                   

                                    var mapProjection = map.getProjection();

                                    /**
                                     * We need to create a transformation that takes world coordinate
                                     * points in the pointArrayBuffer to the coodinates WebGL expects.
                                     * 1. Start with second half in pixelsToWebGLMatrix, which takes pixel
                                     *     coordinates to WebGL coordinates.
                                     * 2. Scale and translate to take world coordinates to pixel coords
                                     * see https://developers.google.com/maps/documentation/javascript/maptypes#MapCoordinate
                                     */

                                    // copy pixel->webgl matrix
                                    mapMatrix.set(pixelsToWebGLMatrix);

                                    // Scale to current zoom (worldCoords * 2^zoom)
                                    var scale = Math.pow(2, map.zoom);
                                    scaleMatrix(mapMatrix, scale, scale);

                                    // translate to current view (vector from topLeft to 0,0)
                                    var offset = mapProjection.fromLatLngToPoint(canvasLayer.getTopLeft());
                                    translateMatrix(mapMatrix, -offset.x, -offset.y);

                                    // attach matrix value to 'mapMatrix' uniform in shader
                                    var matrixLoc = gl.getUniformLocation(pointProgram, 'mapMatrix');
                                    gl.uniformMatrix4fv(matrixLoc, false, mapMatrix);

                                    // draw!
                                    //  gl.drawArrays(gl.POINTS, 0, POINT_COUNT);
                                    gl.drawArrays(gl.TRIANGLES, 0, DRAW_COUNT);
                                    //Drawing holes
                                    var k = 0;
                                    var counter = DRAW_COUNT;

                                    for (k = 0; k < num_of_holes; k++)
                                    {
                                        gl.drawArrays(gl.TRIANGLES, counter, DRAW_HOLE_COUNTER[k]);

                                        counter = counter + DRAW_HOLE_COUNTER[k];
                                    }
                                    // gl.deleteBuffer(pointArrayBuffer);
                                    //console.log(POINT_COUNT);
                                }

                                function update()
                                {
                                    if (i == 0)
                                    {
									
                                        //Drawing the target polygon
                                        var j = 0;

                                        for (j = 0; j < num_of_holes; j++)
                                        {

                                            var TargetCoords = hole_data(1, j);

                                            TargetPolygon = new google.maps.Polygon(
                                            {
                                                paths: TargetCoords,
                                                strokeColor: '#FF0000',
                                                strokeOpacity: 1,
                                                strokeWeight: 2,
                                                fillColor: '#FF0000',
                                                fillOpacity: 0.1
                                            });

                                            TargetPolygon.setMap(map);

                                        }

                                        var TargetCoords = target_data(1);

                                        TargetPolygon = new google.maps.Polygon(
                                        {
                                            paths: TargetCoords,
                                            strokeColor: '#FF0000',
                                            strokeOpacity: 1,
                                            strokeWeight: 2,
                                            fillColor: '#FF0000',
                                            fillOpacity: 0.0
                                        });

                                        TargetPolygon.setMap(map);

                                        var TargetCoords = initialPoly_data(1);

                                        TargetPolygon = new google.maps.Polygon(
                                        {
                                            paths: TargetCoords,
                                            strokeColor: '#FF0000',
                                            strokeOpacity: 1,
                                            strokeWeight: 2,
                                            fillColor: '#FF0000',
                                            fillOpacity: 0.0
                                        });

                                        TargetPolygon.setMap(map);
										
										
										 var TargetCoords = target_data(2);
										 var minMax=minMaxXY(TargetCoords);
										 MinX=minMax[0];
										 MinY=minMax[1];
										 MaxX=minMax[2];									 	
										 MaxY=minMax[3];

											
										
                                        
                                    }
                                }

                                function new_Data() //Function to add new data from textbox
                                {
                                    var InitCoordInput = document.getElementById('initCoord').value;
                                    InitCoordInput = InitCoordInput.replace(/(\r\n|\n|\r)/gm, "");
                                    var HoleCoordInput = document.getElementById('holeCoord').value;
                                    HoleCoordInput = HoleCoordInput.replace(/(\r\n|\n|\r)/gm, "");
                                    var TarCoordInput = document.getElementById('tarCoord').value;
                                    TarCoordInput = TarCoordInput.replace(/(\r\n|\n|\r)/gm, "");
                                    //var new3=document.getElementById('tarCoord').value;
                                    //console.log(new1);
                                    //var n=InitCoordInput.split(',');
                                    //console.log(n);
                                    InitPoly = InitCoordInput.split(',');
									//console.log(InitPoly);

                                    //n=TarCoordInput.split(',');
                                    TargetPoly = TarCoordInput.split(',');
                                    //console.log(TargetPoly);

                                    var n = HoleCoordInput.split('#');
                                    var c = 0;
                                    for (c = 0; c < n.length; c++)
                                    {

                                        HolePoly[c] = n[c].split(',');
                                    }
                                    //console.log(HolePoly); //TargetPoly=n.splice(0);
                                    init();
                                } //document.addEventListener('DOMContentLoaded', init, false);
      
   
   
   
	