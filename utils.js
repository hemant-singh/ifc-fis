								function target_data(x)
                                {
                                    var mapProjection = map.getProjection();

                                    var Coords1 = [],
                                        Coords2 = [],
                                        Coords3 = [];
                                    for (i = 0; i < TargetPoly.length; i = i + 2)
                                    {
                                        var LatLngObject = new google.maps.LatLng(TargetPoly[i], TargetPoly[i + 1]);
                                        Coords1.push(LatLngObject);
                                        var XYObject = map.getProjection().fromLatLngToPoint(LatLngObject);
                                        XYObject.z = 0;
                                        Coords2.push(XYObject);
                                        Coords3[i] = XYObject.x;
                                        Coords3[i + 1] = XYObject.y;

                                    }

                                    if (x == 1) return Coords1;
                                    else if (x == 2) return Coords2;
                                    else if (x == 3) return Coords3;

                                }
								
								
								
                                function hole_data(x, hole_number)
                                {
                                    var mapProjection = map.getProjection();

                                    var Coords1 = [],
                                        Coords2 = [];
                                    for (i = 0; i < HolePoly[hole_number].length; i = i + 2)
                                    {
                                        var LatLngObject = new google.maps.LatLng(HolePoly[hole_number][i], HolePoly[hole_number][i + 1]);
                                        Coords1.push(LatLngObject);
                                        var XYObject = map.getProjection().fromLatLngToPoint(LatLngObject);
                                        XYObject.z = 1;
                                        Coords2.push(XYObject);
                                    }

                                    if (x == 1) return Coords1;
                                    else return Coords2;
                                }
								
								
								
								function convert_obeject_data(data)//This function extracts lat lng from drawn objects
                                {
								var Coords1 = [];
                                        console.log(data);
                                    for (i = 0,j=0; i < data.length; i++,j=j+2)
                                    {
                                        Coords1[j]=data[i].lb;
                                        Coords1[j+1]=data[i].mb;
                                    }
									return Coords1;
                                    
                                }
								
								
								function minMaxXY(coords)//Coords should be in Coords.x and Coords.Y format
								{
								var c1=0,lMinX=lMaxX=coords[0].x,lMinY=lMaxY=coords[0].y;
								var arr=[lMinX,lMinY,lMaxX,lMaxY];
								console.log("hell"+arr);
								for(c1=1;c1<coords.length;c1++)
								{
								if(coords[c1].x>lMaxX)
								lMaxX=coords[c1].x;
								if(coords[c1].x<lMinX)
								lMinX=coords[c1].x;
								if(coords[c1].y>lMaxY)
								lMaxY=coords[c1].y;
								if(coords[c1].x<lMinY)
								lMinY=coords[c1].y;
								}
								arr=[lMinX,lMinY,lMaxX,lMaxY];
								console.log("hell"+arr);
								return arr;
								}
								
								var ccc=0;
								function textureMap(coords)//Generates texture coordinates
								{
								var c1=0,d1=0,x,y;
								var width=MaxX-MinX;
								var height=MaxY-MinY;
								
								var TexData = new Float32Array(coords.lenght);
								 
								for(c1=0,d1=0;c1<coords.length;c1=c1+3,d1=d1+2)
								{
								
								/*x=(coords[c1]%1);
								y=([c1+1])%1;	
								*/
								
								x=(MaxX-coords[c1])/width;
								y=(MaxY-coords[c1+1])/height;	
								if(x<0 || x>1 || y<0 || y>1)
								;//console.log("False");
								//console.log(coords[c1+1]);
								if(ccc==10)
								console.log(2.3 % 1);
							
								TexData[d1]=x/1000000;
								TexData[d1+1]=y/10000;
								
								
								}
								
								
								ccc++;
								
								return TexData;
								}
								
/*
funtion isPointInPoly Adapted from: [http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html] 
*/

                                function isPointInPoly(pt, poly)
                                {
                                    for (var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)((poly[i].y <= pt.y && pt.y < poly[j].y) || (poly[j].y <= pt.y && pt.y < poly[i].y)) && (pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x) && (c = !c);
                                    return c;
                                }
 
 
 function computePolygonCentroid(vertices, vertexCount)
                                {
                                    var centroid = [0, 0];
                                    var signedArea = 0.0;
                                    var x0 = 0.0;
                                    // Current vertex X
                                    var y0 = 0.0;
                                    // Current vertex Y
                                    var x1 = 0.0;
                                    // Next vertex X
                                    var y1 = 0.0;
                                    // Next vertex Y
                                    var a = 0.0;
                                    // Partial signed area
                                    // For all vertices except last
                                    var i = 0;
                                    for (i = 0; i < vertexCount - 1; ++i)
                                    {
                                        x0 = vertices[i].x;
                                        y0 = vertices[i].y;
                                        x1 = vertices[i + 1].x;
                                        y1 = vertices[i + 1].y;
                                        a = x0 * y1 - x1 * y0;
                                        signedArea += a;
                                        centroid[0] += (x0 + x1) * a;
                                        centroid[1] += (y0 + y1) * a;
                                    }

                                    // Do last vertex
                                    x0 = vertices[i].x;
                                    y0 = vertices[i].y;
                                    x1 = vertices[0].x;
                                    y1 = vertices[0].y;
                                    a = x0 * y1 - x1 * y0;
                                    signedArea += a;
                                    centroid[0] += (x0 + x1) * a;
                                    centroid[1] += (y0 + y1) * a;

                                    signedArea *= 0.5;
                                    centroid[0] /= (6.0 * signedArea);
                                    centroid[1] /= (6.0 * signedArea);

                                    return centroid;
                                }

                                function Coords(x, y) //function to create coordinate object
                                {
                                    this.x = x;
                                    this.y = y;
                                    this.z = 0;
                                }

                                function holeCoords(x, y) //function to create coordinate object
                                {
                                    this.x = x;
                                    this.y = y;
                                    this.z = 1;
                                }
									
								function isPolyClockwise(vert)
								{
								var i=0,sum=0,len=vert.length;
								for(i=2;i<len;i=i+2)
								{
								sum=sum+(vert[i]-vert[i-2])*(vert[i+1]+vert[i-1]);
														
								}
								
								if(sum>=0)
								return true;
								else
								return false;								
								}
								
								//Polygon area using Shoelace formula
								function polygonArea(vertices) { 
								var area = 0;
								for (var i = 0; i < vertices.length; i=i+2) {
									j = (i + 2) % vertices.length;
									area += vertices[i] * vertices[j+1];
									area -= vertices[j]* vertices[i+1];
								}
								return area / 2;
							}	
									
								
								function reverseCoords(vert)
								{
								var i=0,sum=0,len=vert.length,newArr=[];
								for(i=0,j=len-1;i<len;i=i+2,j=j-2)
								{
								newArr[i]=vert[j-1];
								newArr[i+1]=vert[j];
														
								}
								
								return newArr;
								}
								
								
								 function resize()
                                {
                                    var width = canvasLayer.canvas.width;
                                    var height = canvasLayer.canvas.height;

                                    gl.viewport(0, 0, width, height);

                                    // matrix which maps pixel coordinates to WebGL coordinates
                                    pixelsToWebGLMatrix.set([2 / width, 0, 0, 0, 0, -2 / height, 0, 0, 0, 0, 0, 0, -1, 1, 0, 1]);
                                }
                                function scaleMatrix(matrix, scaleX, scaleY)
                                {
                                    // scaling x and y, which is just scaling first two columns of matrix
                                    matrix[0] *= scaleX;
                                    matrix[1] *= scaleX;
                                    matrix[2] *= scaleX;
                                    matrix[3] *= scaleX;

                                    matrix[4] *= scaleY;
                                    matrix[5] *= scaleY;
                                    matrix[6] *= scaleY;
                                    matrix[7] *= scaleY;
                                }

                                function translateMatrix(matrix, tx, ty)
                                {
                                    // translation is in last column of matrix
                                    matrix[12] += matrix[0] * tx + matrix[4] * ty;
                                    matrix[13] += matrix[1] * tx + matrix[5] * ty;
                                    matrix[14] += matrix[2] * tx + matrix[6] * ty;
                                    matrix[15] += matrix[3] * tx + matrix[7] * ty;
                                }
								
								function combineArray(arr1, arr2)
                                {

                                    var c = new Float32Array(arr1.length + arr2.length);
                                    for (i = 0; i < arr1.length; i++)
                                    {
                                        c[i] = arr1[i];
                                    }
                                    for (i = arr1.length, j = 0; j < arr2.length; i++, j++)
                                    {
                                        c[i] = arr2[j];

                                    }
                                    return c;

                                }