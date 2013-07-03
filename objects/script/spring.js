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
// aumentando il numero dei pieces la molla viene interpolata utilizzando piu' cerchi
function spring(pieces, color){
	//più si accorcia distanza tra Ra e r, più si pizzica al centro la molla
	var Ra = 5; // distanza tra centro e tubo
	var r = 1; // raggio del tubo
	var P = 1; // velocita' angolare, se > 0 gira verso destra
	var u = 0;
	var v = 0;
	var res = [];
	var rot = 0;
	var p = 0;
	var struct = [];

	while(u<=(20*PI)){
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
var springDomain = PROD1x1([INTERVALS(1)(8),INTERVALS(1)(8)]);
var springPieces = 400;
var springColor = rgb01(160,160,160);
DRAW(spring(springPieces,springColor))