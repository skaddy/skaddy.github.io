function rgb01(r, g, b){
	var r0 = r/255.0;
	var g0 = g/255.0;
	var b0 = b/255.0;
	return [r0, g0, b0, 1];
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
var parquet = parquet();
DRAW(parquet);