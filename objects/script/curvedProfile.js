function rgb01(r, g, b){
	var r0 = r/255.0;
	var g0 = g/255.0;
	var b0 = b/255.0;
	return [r0, g0, b0, 1];
}
function hermiteCircle(r,position,rot){
	var x = position[0];	
	var y = position[1];
	var z = position[2];
	var t1 = [(2 * r)*COS(rot), (2*r)*SIN(rot), 0];
	var t2 = [-(2 * r)*COS(rot), -(2*r)*SIN(rot), 0];
	var p0 = [[x, y, z],[x, y, r+z], t1, t2];
	var p1 = [[x, y, z],[x, y, r+z], t2, t1];
	var c0 = CUBIC_HERMITE(S0)(p0);
	var c1 = CUBIC_HERMITE(S0)(p1);
	return [c0, c1];
}
function curvedProfile(startAngle, finalAngle, startPoint, endPoint, radius, color, steps){
	var i = startAngle;
	var round = ABS(finalAngle-startAngle);
	var res = [];
	var pos = startPoint;
	if(startAngle>finalAngle){
		i=-startAngle;
		while(i<=finalAngle){
			pos = [pos[0]-ABS(SIN(i)),pos[1]-ABS(COS(i)),startPoint[2]]; 
			res.push(hermiteCircle(radius,pos,i));
			i+=round/steps;
		}
		res.push(hermiteCircle(radius,[pos[0]-endPoint[0],pos[1]-endPoint[1],pos[2]-endPoint[2]],finalAngle));
	}
	else{
		while(i>=(-finalAngle)){
			pos = [pos[0]-ABS(SIN(i)),pos[1]-ABS(COS(i)),startPoint[2]]; 
			res.push(hermiteCircle(radius,pos,i));
			i-=round/steps;
		}
		res.push(hermiteCircle(radius,[pos[0]-endPoint[0],pos[1]-endPoint[1],pos[2]-endPoint[2]],-finalAngle));
	}
	var struct = [];
	for(var j=0; j<res.length-1; j++){
		struct.push(MAP(BEZIER(S1)([res[j][0],res[j+1][0]]))(chassisDomain));
		struct.push(MAP(BEZIER(S1)([res[j][1],res[j+1][1]]))(chassisDomain));
	}	
	return COLOR(color)(STRUCT(struct));
}	
var chassisDomain = PROD1x1([INTERVALS(1)(16),INTERVALS(1)(16)]);
var profileColor = rgb01(190,190,190);
var profile1 = curvedProfile(0, PI/2, [0,0,0],[0,0,0],4,profileColor,10.0);
DRAW(profile1)