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
function stopper(radius, pos, color){
	var struct = [];
	var stp1 = hermiteCircle(radius,pos,0);
	var stp1a = hermiteCircle(radius,[pos[0],pos[1]-0.5,pos[2]],0);
	struct.push(MAP(BEZIER(S1)([stp1[0],stp1a[0]]))(chassisDomain));
	struct.push(MAP(BEZIER(S1)([stp1[1],stp1a[1]]))(chassisDomain));
	struct.push(MAP(BEZIER(S1)([stp1a[0],stp1a[1]]))(chassisDomain));
	return COLOR(color)(STRUCT(struct));
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
function straightLeg(r, pos, h, color, foot){
	var struct = [];
	var c1 = hermiteCircle(r,[pos[0],pos[1],pos[2]],0);
	var c2 = hermiteCircle(r,[pos[0],pos[1]+h,pos[2]],0);
	
	struct.push(COLOR(color)(MAP(BEZIER(S1)([c1[0],c2[0]]))(chassisDomain)));
	struct.push(COLOR(color)(MAP(BEZIER(S1)([c1[1],c2[1]]))(chassisDomain)));
	struct.push(COLOR(color)(MAP(BEZIER(S1)([c1[1],c1[0]]))(chassisDomain)));

	if(foot){
		var c3 = hermiteCircle(r,[pos[0]+0.1,pos[1]+h+0.5,pos[2]+0.1],0);
		var c4 = hermiteCircle(r,[pos[0],pos[1]+h+1,pos[2]],0);
		struct.push(COLOR(stopperColor)(MAP(BEZIER(S1)([c3[0],c2[0]]))(chassisDomain)));
		struct.push(COLOR(stopperColor)(MAP(BEZIER(S1)([c3[1],c2[1]]))(chassisDomain)));
		struct.push(COLOR(stopperColor)(MAP(BEZIER(S1)([c3[0],c4[0]]))(chassisDomain)));
		struct.push(COLOR(stopperColor)(MAP(BEZIER(S1)([c3[1],c4[1]]))(chassisDomain)));
		struct.push(COLOR(stopperColor)(MAP(BEZIER(S1)([c4[0],c4[1]]))(chassisDomain)));
	}
	return STRUCT(struct);
}
// aumentando il numero dei pieces la molla viene interpolata utilizzando piu' cerchi
function spring(pieces, color){
	//più si accorcia distanza tra Ra e r, più si pizzica al centro la molla
	var Ra = 5; // distanza tra centro e tubo
	var r = 1; // raggio del tubo
	var P = 0.35; // velocita' angolare, se > 0 gira verso destra
	var u = 0;
	var v = 0;
	var res = [];
	var rot = 0;
	var p = 0;
	var struct = [];

	while(u<=(6*PI)){
		pos = [(Ra+(r*COS(v)))*COS(u), (Ra+(r*COS(v)))*SIN(u), (r*SIN(v))+((P*u)/PI)];
		rot = p*((2*PI)/(pieces/10));
		res.push(hermiteCircle(r,pos,rot));
		u += (20*PI)/pieces;
		v += (2*PI)/pieces;
		p++;
	}	
	for (var i = 0; i < res.length-1; i++) {
		struct.push(MAP(BEZIER(S1)([res[i][0],res[i+1][0]]))(springDomain));
		struct.push(MAP(BEZIER(S1)([res[i][1],res[i+1][1]]))(springDomain));
	}	
	struct.push(MAP(BEZIER(S1)([res[res.length-1][0],res[res.length-1][1]]))(springDomain));
	struct.push(MAP(BEZIER(S1)([res[0][0],res[0][1]]))(springDomain));
	return COLOR(color)(STRUCT(struct));
}
function stick(color){
	var struct = [];
	c1 = hermiteCircle(9.2,[-2.8,0,-4.6],PI/2);
	c2 = hermiteCircle(9.2,[-77.8,0,-4.6],PI/2);
	struct.push(MAP(BEZIER(S1)([c1[0],c2[0]]))(springDomain));
	struct.push(MAP(BEZIER(S1)([c1[1],c2[1]]))(springDomain));
	struct.push(MAP(BEZIER(S1)([c1[0],c1[1]]))(springDomain));
	struct.push(MAP(BEZIER(S1)([c2[0],c2[1]]))(springDomain));
	return COLOR(color)(STRUCT(struct));
}
function parquet(){
	var c1 = rgb01(114,66,38);
	var c2 = rgb01(120,66,38);
	var struct = [];
	var c = 1;
	for(var i = 0; i<30; i++){
		var putBricks = 0;
		var color;
		while(putBricks<120){
			if(c>0)
				color = c1;
			else
				color = c2;
			struct.push(COLOR(color)(T([0,1])([putBricks,i*4])(CUBOID([5,4,0.1]))));
			putBricks+=5;
			c = c*(-1);
		}
		c= c*(-1);
	}
	return STRUCT(struct);
}
var putParquet = true;
var chassisDomain = PROD1x1([INTERVALS(1)(8),INTERVALS(1)(8)]);
var springDomain = PROD1x1([INTERVALS(1)(6),INTERVALS(1)(6)]);
var springPieces = 100;
var profileColor = rgb01(190,190,190);
var stickColor = [0,0,0,1];
var springColor = rgb01(160,160,160,1);
var stopperColor = [0,0,0,1];

var profile1 = curvedProfile(0, PI/2, [57,1,40],[50.5,0,0],4,profileColor,5.0);
var profile2 = curvedProfile(0, PI/2, [57,1,-2],[50.5,0,0],4,profileColor,5.0);
var profile3 = curvedProfile(PI/2, 0,[3.8431242426624763,-2.656875757337522,40],[0,35,0],4,profileColor,5.0);
var profile4 = curvedProfile(PI/2, 0,[3.8431242426624763,-2.656875757337522,-2],[0,35,0],4,profileColor,5.0);

var stopper1 = stopper(4, [0.1862484853249547,-41.31375151467505,40], stopperColor);
var stopper2 = stopper(4, [0.1862484853249547,-41.31375151467505,-2], stopperColor);

var leg1 = R([0,1])([PI/24])(straightLeg(4,[5,-2.5,-2],47.55, profileColor, true));
var leg2 = R([0,1])([PI/24])(straightLeg(4,[5,-2.5,40],47.55, profileColor, true));
var leg3 = straightLeg(4,[57,0,-2],45, profileColor, true);
var leg4 = straightLeg(4,[57,0,40],45, profileColor, true);

var backBar = T([0,1])([0.2, -11])(R([1,2])(PI/2)(straightLeg(3,[0,0,0],42, profileColor, false)));
var frontBar = T([0,1])([57,9])(R([1,2])(PI/2)(straightLeg(3,[0,0,0],42, profileColor, false)));

var chassis = STRUCT([profile1,profile2,profile3,profile4, stopper1, stopper2, leg1, leg2, leg3, leg4, frontBar, backBar]);

var bStick = R([0,2])(PI/2)(stick(stickColor));
var oneSpring = STRUCT([spring(springPieces, springColor), T([0,1,2])([6,0.4,-3.5])(CYL_SURFACE([0.4,4])([8,2]))]);
var twoSprings = COLOR(rgb01(163,163,163))(STRUCT([oneSpring,T([2])([80])(R([1,2])(PI)(oneSpring))]));
var completeStick = S([0,1,2])([0.28,0.28,0.46])(R([0,1])([-PI/2])(STRUCT([twoSprings, bStick])));
var completeStick2 = S([0,1,2])([0.28,0.28,0.46])(STRUCT([twoSprings, bStick]));

var stick = T([0,1,2])([3,-2,2.9])(completeStick);
var stick2 = T([0])([5])(stick);
var stick3 = T([0])([10])(stick);
var stick4 = T([0])([15])(stick);
var stick5 = T([0])([20])(stick);
var stick6 = T([0])([25])(stick);
var stick7 = T([0])([30])(stick);
var stick8 = T([0])([35])(stick);
var stick9 = T([0])([40])(stick);   
var stick10 = T([0])([45])(stick);
var stick11 = T([0])([50])(stick);
var stick12 = T([0,1])([53.8,2.5])(stick);
var stick13 = T([0,1,2])([0.2,-25,2.5])(completeStick2);
var stick14 = T([0,1,2])([0.2,-30,2.5])(completeStick2);
var stick15 = T([0,1,2])([0.2,-35,2.5])(completeStick2);
var stick16 = T([0,1,2])([0.2,-40,2.5])(completeStick2);
var sticks = STRUCT([stick, stick2, stick3, stick4, stick5, stick6, stick7,stick8,stick9,stick10, stick11, stick12, stick13,stick14,stick15,stick16]);

var mod = R([1,2])(-PI/2)(STRUCT([sticks, chassis]));
var model;
if(putParquet){
	var parquet = parquet();
	model = STRUCT([mod, T([0,1,2])([-30,-60,-47])(parquet)])
}
else
	model = mod;
DRAW(model);