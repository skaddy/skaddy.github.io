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
function straightLeg(r, pos, h, color, foot, rot){
	var struct = [];
	var c1 = hermiteCircle(r,[pos[0],pos[1],pos[2]],rot);
	var hx = 0;
	var hy = 0;
	if(rot==0)
		hy = h;
	if(rot==(PI/2))
		hx = h;
	var c2 = hermiteCircle(r,[pos[0]+hx,pos[1]+hy,pos[2]],rot);
	
	struct.push(COLOR(color)(MAP(BEZIER(S1)([c1[0],c2[0]]))(chassisDomain)));
	struct.push(COLOR(color)(MAP(BEZIER(S1)([c1[1],c2[1]]))(chassisDomain)));
	struct.push(COLOR(color)(MAP(BEZIER(S1)([c1[1],c1[0]]))(chassisDomain)));
	struct.push(COLOR(color)(MAP(BEZIER(S1)([c2[1],c2[0]]))(chassisDomain)));

	if(foot){
		var c3 = hermiteCircle(r,[pos[0]+0.1,pos[1]+h+0.5,pos[2]+0.1],rot);
		var c4 = hermiteCircle(r,[pos[0],pos[1]+h+1,pos[2]],rot);
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

var chassisDomain = PROD1x1([INTERVALS(1)(6),INTERVALS(1)(6)]);
var springDomain = PROD1x1([INTERVALS(1)(5),INTERVALS(1)(5)]);
var springPieces = 80;
var profileColor = rgb01(190,190,190);
var stickColor = [0,0,0,1];
var springColor = rgb01(160,160,160,1);
var stopperColor = [0,0,0,1];

var bStick = R([0,2])(PI/2)(stick(stickColor));
var oneSpring = STRUCT([spring(springPieces, springColor), T([0,1,2])([6,0.4,-3.5])(CYL_SURFACE([0.4,4])([8,2]))]);
var twoSprings = COLOR(rgb01(163,163,163))(STRUCT([oneSpring,T([2])([80])(R([1,2])(PI)(oneSpring))]));
var completeStick = R([0,2])(PI)(S([0,1,2])([0.46,0.25,0.25])(R([0,2])([PI/2])(STRUCT([twoSprings, bStick]))));
var completeStick2 = R([0,1])(-PI/2)(S([0,1,2])([0.25,0.25,0.52])(STRUCT([twoSprings, bStick])));
var completeStick3 = S([0,1,2])([0.25,0.25,0.52])(STRUCT([twoSprings, bStick]));


var prof1 = straightLeg(4, [0,0,0], 80, profileColor, false, 0)
var prof2 = straightLeg(4, [42,0,0], 80, profileColor, false, 0)
var prof3 = straightLeg(4, [0,78,0], 42, profileColor, false, PI/2)
var prof4 = R([0,2])(PI)(curvedProfile(0, PI/2, [0,1,-4],[0,0,0],4,profileColor,5.0));
var prof5 = curvedProfile(0, PI/2, [42,1,0],[0,0,0],4,profileColor,5.0);
var prof6 = straightLeg(4, [38.343124242662476,-2.656875757337522,0],-34.68, profileColor, false, PI/2);

var stick1 = T([0,1,2])([39.5,5,1.8])(completeStick)
var stick2 = T([0,1,2])([39.5,10,1.8])(completeStick)
var stick3 = T([0,1,2])([39.5,15,1.8])(completeStick)
var stick4 = T([0,1,2])([39.5,20,1.8])(completeStick)
var stick5 = T([0,1,2])([39.5,25,1.8])(completeStick)
var stick6 = T([0,1,2])([39.5,30,1.8])(completeStick)
var stick7 = T([0,1,2])([39.5,35,1.8])(completeStick)
var stick8 = T([0,1,2])([39.5,40,1.8])(completeStick)
var stick9 = T([0,1,2])([39.5,45,1.8])(completeStick)
var stick10 = T([0,1,2])([39.5,50,1.8])(completeStick)

var topChassisSticks = STRUCT([stick1, stick2, stick3, stick4, stick5, stick6, stick7, stick8, stick9, stick10])
var topChassis = STRUCT([prof1, prof2, prof3, prof4, prof5, prof6]);
var profileUp = STRUCT([topChassis,topChassisSticks]);

var prof8 = curvedProfile(0, PI/2, [57,1,43],[0,0,0],4,profileColor,12.0);
var prof9 = curvedProfile(0, PI/2, [57,1,-5],[0,0,0],4,profileColor,12.0);
var prof10 = R([0,1])(-PI/12)(straightLeg(4, [-24.4,6.1,-5], 75, profileColor, false, PI/2));
var prof11 = R([0,1])(-PI/12)(straightLeg(4, [-24.4,6.1,43], 75, profileColor, false, PI/2));
var prof12 = R([0,1])(PI/2-PI/12)(curvedProfile(PI/3,0,[12.3,33.8,-5],[0,0,0],4,profileColor,12.0));
var prof13 = R([0,1])(PI/2-PI/12)(curvedProfile(PI/3,0,[12.3,33.8,43],[0,0,0],4,profileColor,12.0));
var leg1 = straightLeg(4,[-29.141045910999983,19.13237859636788,-5] ,15, profileColor, true, 0);
var leg2 = straightLeg(4,[-29.141045910999983,19.13237859636788,43] ,15, profileColor, true, 0);
var leg3 = straightLeg(4,[57,0,-5],36, profileColor, true, 0);
var leg4 = straightLeg(4,[57,0,43],36, profileColor, true, 0);
var backBar = R([1,2])(PI/2)(straightLeg(3,[-28,-2,-20],46, profileColor, false,0));
var frontBar = R([1,2])(PI/2)(straightLeg(3,[57,-2,-5],46, profileColor, false,0));

var downChassis = STRUCT([prof8,prof9,prof10,prof11,prof12,prof13,leg1,leg2,leg3,leg4,backBar,frontBar])

var stick11 = T([0,1])([28,-0.6])(completeStick2);
var stick12 = T([0,1])([33,-1.9])(completeStick2);
var stick13 = T([0,1])([38,-3.2])(completeStick2);
var stick14 = T([0,1])([42,-4.5])(completeStick2);
var stick15 = T([0,1])([47,-5.8])(completeStick2);
var stick16 = T([0,1])([52,-6.5])(completeStick2);
var stick17 = T([0,1])([55,-5])(completeStick3);
var stick18 = T([0,1])([56,-1.5])(completeStick3);

var downChassisSticks = STRUCT([stick11,stick12,stick13,stick14,stick15,stick16, stick17, stick18]);

var model = R([1,2])(-PI/2)(STRUCT([downChassisSticks,downChassis, R([0,1])(-PI/5)(T([0,1,2])([15,-40,42])(R([0,2])(PI/2)(profileUp)))]));

DRAW(model);