

function check_close_points(coords)
{	var midpoint=0;
	var i=0,j=0;
	for(i=0;i<coords.length;i++)
	{
	for(j=0;j<coords.length;j++)
	{
	
	
	if((i-j)>100 || (j-i)>100)
	{ 
	//midpoint.x=(coords[i].x+coords[j].x)/2;
	//midpoint.y=(coords[i].y+coords[j].y)/2;
		if(distance(coords[i],coords[j])<0.001  )
		{animation_flag=1;//play_pause_moprhing();
		if(j-i>0)
		var x=j-i;
		else
		var x=i-j;
		RegionCoords1.splice(i,x);//remove_points(coords,i,j);
		//return;
		}
	
	}		
	}
	
}

}



function remove_points(coords,i,j)
{
var swap,k,l=0,m=0;
var coords1=[],coords2=[];
if(i>j)	
{ 
swap=i;
i=j;
j=swap;
}
for(k=0;k<coords.length;k++)
{
if(k>=i || k<=j)
coords1[l++]=coords[k];
else
coords2[m++]=coords[k];
}
RegionCoords1=coords2.splice(0);
}