#pragma strict
//--Perlin Visualizer--
//Needing a more intuitive way to understand how to use perlin noise I wrote this tool.  The idea is to have a quicker
//and easier way to generate maps so the settings can be reused in other applications to create maps that better meet
//thier expectations.
  
//The Perlin Noise plugin(PerlinNoise.cs) included was written by *figureout*. 
//There is no identifing information with the MarchingCubes package the perlin plugin is from.

//--To Done List
//8-15-14
//Had a sit down with Unity GUI, came to an understanding.
//Create multiple maps and maintain the settings for each.
//8-16-14
//Added some basic functions to shape the noise(see function effectsOut )
//Added a color tint option(Does not effect base map/should it?)
//8-17-14
//added to github
//8-18-14
//centered perlin noise, increasing frequency doesnt change global position
//Added positioning and scaling
//
//--To Do List
//Can I Make the GUI smaller, in one/two moves
//	Can I put the Gui in a popup window?
//	Maybe a toolbar on top for menus and one on the bottom for the array control
//  Save, Perlin Settings/Effect, Output Type
//Make textfields and sliders work together
//Save maps to jpg
//Save Prefs to maintain work
//Did you release a button?  I'm gonna AutoUpdate
//Camera Controls: Zoom(fov?), Up, Down, Left, Right
//View Types: Slide(single), Slide Lineup , Layered, Tiled


//Texture Size Option (how big does it have to be for 20 Octaves to matter);
//Begin Alpha falloff at control
//Save Flatten Layer Map
//Gradients?
//Animations? Lerp Settings Values
//Generate Tiles
//2D Voxel representation
//3D Voxel representation
//Keyboard hotkeys

//--Some Issues
//Gui scaling
//Title Text Color
//Updating before previous update is done, or Too many updates in quick succession crashes with memory allocation error
//Runs too long it crashes(clean up/collections?)
//var passing to/from pmap class has gotten out of hand
//--------
//Perlin Generator
private var pNoise : PerlinNoise;
//Perlin Settings
var freq : float;
var amp : float;
var octv : int;
var seed : int;
var seedT : String;

//Perlin Effects
var cross : float;

var falloff : float;
var clampHi : float;
var clampLo : float;
var color : Color;
var fallType : int = 0;
var falloffTypeStrings : String[] = ["const", "exp", "log", "grav"];
//container and id
var id : int = 0;
var lastid : int;
var maps : PMap[] = new PMap[100]; //Holds settings, GameObject, and Texture Map for each map.

//color values
var clrR : float;
var clrG : float;
var clrB : float;	
var alphaBegin : float;
//template object and settings
var texObj : GameObject;
var texMap : Texture2D;
var texHeight : int;
var texWidth : int;

//positioning / scaling
var xPos : float;
var yPos : float;
var zPos : float;

var xScl : float;
var yScl : float;
var zScl : float;
function Start() { 
	updateMap(); 
	
} 
function OnGUI() {

	//--TITLE BAR
	GUI.backgroundColor = Color(.2,.2,.2,.2);
	//--SETTINGS MENU
	GUILayout.BeginArea(Rect(10, 10, 350, 320));
	GUILayout.Label("MAP:" + id.ToString() + " SETTINGS");
		GUILayout.BeginVertical("box");
			
			GUILayout.BeginHorizontal("box");
			GUILayout.Label("SEED", GUILayout.Width(85));
			seed = GUILayout.HorizontalSlider(seed, 0.0, 10000.0, GUILayout.Width(200) );
			GUILayout.Label(seed.ToString(), GUILayout.Width(45));
			GUILayout.EndHorizontal();
			
			GUILayout.BeginHorizontal("box");
			GUILayout.Label("OCTAVE", GUILayout.Width(85));
			octv = GUILayout.HorizontalSlider(octv, 1, 20, GUILayout.Width(200) );
			GUILayout.Label(octv.ToString(), GUILayout.Width(45));	
			GUILayout.EndHorizontal();
			
			GUILayout.BeginHorizontal("box");
			GUILayout.Label("FREQUENCY", GUILayout.Width(85));
			freq = GUILayout.HorizontalSlider(freq, 0.0, 100.0, GUILayout.Width(200) );
			var freqS : String = freq.ToString().Substring(0, Mathf.Min(freq.ToString().length, 6));
			GUILayout.Label(freqS, GUILayout.Width(45));	
			GUILayout.EndHorizontal();
			
			GUILayout.BeginHorizontal("box");
			GUILayout.Label("AMPLITUDE", GUILayout.Width(85));
			amp = GUILayout.HorizontalSlider(amp, 0.0, 3.0, GUILayout.Width(200) );
			var ampS : String = amp.ToString().Substring(0, Mathf.Min(amp.ToString().length, 6));
			GUILayout.Label(ampS.ToString(), GUILayout.Width(45));	
			GUILayout.EndHorizontal();
		
		GUILayout.EndVertical();
	GUILayout.EndArea();

	//--EFFECTS MENU
	GUILayout.BeginArea(Rect(10+10+350, 10, 350, 320));
	GUILayout.Label("EFFECTS");
		GUILayout.BeginVertical("box");
					
			GUILayout.BeginHorizontal("box");
			GUILayout.Label("FALLOFF", GUILayout.Width(85));
			falloff = GUILayout.HorizontalSlider(falloff, 0.0, 3.0, GUILayout.Width(200) );
			var falloffS : String = falloff.ToString().Substring(0, Mathf.Min(falloff.ToString().length, 6));
			GUILayout.Label(falloffS, GUILayout.Width(45));	
			GUILayout.EndHorizontal();
			
			GUILayout.BeginHorizontal("box");
			GUILayout.Label("CROSS", GUILayout.Width(85));
			cross = GUILayout.HorizontalSlider(cross, 0.0, 2.0, GUILayout.Width(200) );
			var crossS : String = cross.ToString().Substring(0, Mathf.Min(cross.ToString().length, 6));
			GUILayout.Label(crossS, GUILayout.Width(45));
			GUILayout.EndHorizontal();
						
			GUILayout.BeginHorizontal("box");
			GUILayout.Label("CLAMP HIGH", GUILayout.Width(85));
			clampHi = GUILayout.HorizontalSlider(clampHi, 0.0, 1.0, GUILayout.Width(200) );
			var clampHiS : String = clampHi.ToString().Substring(0, Mathf.Min(clampHi.ToString().length, 6));
			GUILayout.Label(clampHiS, GUILayout.Width(45));	
			GUILayout.EndHorizontal();
			
			GUILayout.BeginHorizontal("box");
			GUILayout.Label("CLAMP LOW", GUILayout.Width(85));
			clampLo = GUILayout.HorizontalSlider(clampLo, 0.0, 1.0, GUILayout.Width(200) );
			var clampLoS : String = clampLo.ToString().Substring(0, Mathf.Min(clampLo.ToString().length, 6));
			GUILayout.Label(clampLoS, GUILayout.Width(45));	
			GUILayout.EndHorizontal();
		
		GUILayout.EndVertical();
	GUILayout.EndArea();
	
	//--EFFECT OPTIONS MENU
	GUILayout.BeginArea(Rect(10+(10+350)*2, 10, 350, 320));
	GUILayout.Label("FALLOFF TYPE & MAP COLOR");
		GUILayout.BeginVertical("box");
			
			GUILayout.BeginHorizontal("box");
				fallType = GUILayout.Toolbar(fallType, falloffTypeStrings);
			GUILayout.EndHorizontal();
			
			GUILayout.BeginHorizontal("box");
				var tex = new Texture2D(40,40);
		        //RGB Color Sliders
		        GUILayout.BeginVertical("box");
			        clrR = GUILayout.HorizontalSlider(clrR, 0.0, 1.0);
			        clrG = GUILayout.HorizontalSlider(clrG, 0.0, 1.0);
			       	clrB = GUILayout.HorizontalSlider(clrB, 0.0, 1.0);
			       	color = Color(clrR, clrG, clrB);
			    GUILayout.EndVertical();		        
				//Display Map Color
		        GUI.color = Color(clrR, clrG, clrB);
		        GUILayout.Label(tex);
		        GUI.color = Color.white;
	        
	        GUILayout.EndHorizontal();
	        
	        GUILayout.BeginHorizontal("box");
			GUILayout.Label("ALPHA CUT", GUILayout.Width(85));
			alphaBegin = GUILayout.HorizontalSlider(alphaBegin, 0.0, 1.0, GUILayout.Width(200) );
			var alphaBeginS : String = alphaBegin.ToString().Substring(0, Mathf.Min(alphaBegin.ToString().length, 6));
			GUILayout.Label(alphaBeginS, GUILayout.Width(45));	
			GUILayout.EndHorizontal();
			
		GUILayout.EndVertical();
	GUILayout.EndArea();
	//positioning 
	GUILayout.BeginArea(Rect(10, 175, 350, 60));
		GUILayout.BeginHorizontal("box");
			GUILayout.Label("POS  XYZ", GUILayout.Width(30));
			GUILayout.BeginVertical("box");
	
				xPos = GUILayout.HorizontalSlider(xPos, -100.0, 100.0, GUILayout.Width(200) );
				yPos = GUILayout.HorizontalSlider(yPos, -100.0, 100.0, GUILayout.Width(200) );
				zPos = GUILayout.HorizontalSlider(zPos, -100.0, 100.0, GUILayout.Width(200) );
				
			GUILayout.EndVertical();				
			GUILayout.BeginVertical("box");		

				var xPosS : String = xPos.ToString().Substring(0, Mathf.Min(xPos.ToString().length, 6));
				var yPosS : String = yPos.ToString().Substring(0, Mathf.Min(yPos.ToString().length, 6));
				var zPosS : String = zPos.ToString().Substring(0, Mathf.Min(zPos.ToString().length, 6));
				GUILayout.Label(xPosS + "\n" + yPosS + "\n" + zPosS, GUILayout.Width(45));	
			
			GUILayout.EndVertical();
		GUILayout.EndHorizontal();
	GUILayout.EndArea();
	//scaling
	GUILayout.BeginArea(Rect(20+350, 175, 350, 60));
		GUILayout.BeginHorizontal("box");
			GUILayout.Label("SCL  XYZ", GUILayout.Width(30));
			GUILayout.BeginVertical("box");
	
				xScl = GUILayout.HorizontalSlider(xScl, 0.0, 10.0, GUILayout.Width(200) );
				yScl = GUILayout.HorizontalSlider(yScl, 0.0, 10.0, GUILayout.Width(200) );
				zScl = GUILayout.HorizontalSlider(zScl, 0.0, 10.0, GUILayout.Width(200) );
				
			GUILayout.EndVertical();				
			GUILayout.BeginVertical("box");		

				var xSclS : String = xScl.ToString().Substring(0, Mathf.Min(xScl.ToString().length, 6));
				var ySclS : String = yScl.ToString().Substring(0, Mathf.Min(yScl.ToString().length, 6));
				var zSclS : String = zScl.ToString().Substring(0, Mathf.Min(zScl.ToString().length, 6));
				GUILayout.Label(xSclS + "\n" + ySclS + "\n" + zSclS, GUILayout.Width(45));	
			
			GUILayout.EndVertical();
		GUILayout.EndHorizontal();
	GUILayout.EndArea();	
	//maps[] Array Control Bar
	GUILayout.BeginArea(Rect(10, 175+64, (350)*3, 60));
		GUILayout.BeginHorizontal("box");
		if(GUILayout.Button("<<<FIRST")  ) { firstMap(); }
		if(GUILayout.Button("<<PREVIOUS")) { previousMap(); }
		if(GUILayout.Button("<UPDATE>")  ) { updateMap(); }
		if(GUILayout.Button("NEXT>>")    ) { nextMap(); }
		if(GUILayout.Button("LAST>>>")   ) { lastMap(); }
		
		GUILayout.EndHorizontal();
	GUILayout.EndArea();
}
//Array Control Bar Functions
function firstMap() {
	id = 0;
	getSettings();
}
function previousMap() {
	id--;
	if(id < 0) { id = 0; }
	getSettings();
}
function updateMap() {
	if(!maps[id].filled) { //if map is new, initialize
		var temp : GameObject = Instantiate(texObj);
		maps[id].init(id, temp); 
	}
	maps[id].fill(buildPerlinMap(), color, 
				  freq, amp, octv, seed, 
				  cross, falloff, fallType, clampHi, clampLo, alphaBegin,
				  xPos, yPos, zPos, xScl, yScl, zScl); 
}
function nextMap() {
	id++;
	if(id > lastid) { lastid++; }
	if(!maps[id].filled) { //if map is new, initialize
		var temp : GameObject = Instantiate(texObj);
		maps[id].init(id, temp); 
		updateMap();
	} else { getSettings(); }
}
function lastMap() {
	id = lastid;
	getSettings();
}
//Transfer settings from maps[id] to GUI Controls
function getSettings() { 
	freq = maps[id].freq;
	amp = maps[id].amp;
  	octv = maps[id].octv;
   	seed = maps[id].seed;
    cross = maps[id].cross;
    falloff = maps[id].falloff;
    fallType = maps[id].fallType;
    clampHi = maps[id].clampHi;
    clampLo = maps[id].clampLo;
    alphaBegin = maps[id].alphaBegin;
    color = maps[id].color;
    clrR = color.r;
    clrG = color.g;
    clrB = color.b;
    xPos = maps[id].xPos;
    yPos = maps[id].yPos;
    zPos = maps[id].zPos;
    xScl = maps[id].xScl;
    yScl = maps[id].yScl;
    zScl = maps[id].zScl;
}
//Perlin Noise to Texture Map Generator
function buildPerlinMap() { 
	pNoise = new PerlinNoise(seed); //fresh generator
	texMap = new Texture2D(texWidth, texHeight); //empty texture

	for(var x : int = 0; x < texWidth; x++) { //Create map equal to texture size
		for(var y : int = 0; y < texHeight; y++) {
			//FractalNoise2D(x : float, y : float, octave : int, frequency : float, amplitude : float);
			//Output is half of amplitude
			//Frequency is equilvent to a sample rate, not a sound wave.  
			//0 to 7 octaves it seems is fine for most uses, but in very large size maps 
			//higher octaves may be required for definition.
			//Each octave raises processing time
			//var samp : float = pNoise.FractalNoise2D(x, y, octv, freq, amp);  
			var xp : float = xPos + xScl * (x - (texWidth/2));
			var yp : float = yPos + yScl * (y - (texHeight/2));
			var samp : float = pNoise.FractalNoise2D(xp, yp, octv, freq, amp);
			samp = effectOut(samp); 
			var alf : float = alphaOut(samp);
			
			texMap.SetPixel(x,y, Color(samp, samp, samp, alf));
			
		}
	}
	return texMap;
}
function alphaOut(pIn : float) {
	var aOut : float = 1.0;
	if(pIn < alphaBegin) {
		//aOut = 1.0 - (alphaBegin - pIn) / alphaBegin;
		aOut = Mathf.Lerp(1.0, 0.0, Mathf.Clamp01(alphaBegin - pIn) / alphaBegin);
	}
	return aOut;
}
//MATH EFFECTS
function effectOut(pIn : float) {
	var pOut : float;
	
	//CROSS: Shifts values up and inverts over 1.0 
	pOut = cross + pIn;
	if(pOut > 1.0) { pOut = 1.0 - (pOut - 1.0); }
	
	//CLAMP: Hard Limits
	if(pOut > clampHi) { pOut = 1.0; }
	if(pOut < clampLo) { pOut = 0.0; }
	
	//FALLOFF: Decreases values based on difference to 1.0
	switch(fallType) {
		case 0 : //Linear
			pOut = pOut - ((1.0 - pOut) * falloff);
			break;
		case 1 : //Expoential
			pOut = pOut - Mathf.Pow((1.0 - pOut), falloff);
			break;
		case 2 : //Log its log, it's big it's heavy it's wood
			pOut = pOut - Mathf.Log((1.0 - pOut), falloff);
			break;
		case 3 : //Gravity 32ft/s  (32/1000) * (1.0 - pOut)?????????????
			pOut = pOut - ((1.0 - pOut) * falloff * .32);	
			break;
	}
	//Falloff Limiter
	pOut = Mathf.Clamp01(pOut);
		
	return pOut;
}
class PMap {
	var filled : boolean = false; //has been initilized
	var texMap : Texture2D; //texmap to link to//might not really need this.
	var texObj : GameObject;//Just a plane gameobject

	
	//Perlin Settings
	var freq : float;
	var amp : float;
	var octv : int;
	var seed : int;

	//Perlin Effects
	var cross : float;
	var falloff : float;
	var fallType : int;
	var clampHi : float;
	var clampLo : float;
	var alphaBegin : float;
	var color : Color;
	var toolbarInt : int;
	
	var id : int;
	var x : float;
	var y : float;
	var posType : int;
	var posPad : float;
	//positioning / scaling
	var xPos : float;
	var yPos : float;
	var zPos : float;

	var xScl : float;
	var yScl : float;
	var zScl : float;
	
	//Setup a New Map
	function init(i : int, template : GameObject) {
		id = i;
		texObj = template;
		texObj.renderer.material.mainTexture = texMap;
		texObj.transform.position.z = 4.0 + .0001 * id;
		filled = true;
	}
	//Thought it better to make maps as needed instead of having a number of large textures loaded in memory
	function PMap() { }
	//Transfer GUI control settings and Perlin Map Texture to class
	function fill(t : Texture2D, c : Color, 
				  f : float, a : float, o : int, s : int, 
				  cr : float, fo : float, fot : int, ch : float, cl : float, ap : float,
				  xP : float, yP : float , zP : float, xS : float, yS : float, zS : float){
		freq = f;
		amp = a;
		octv = o;
		seed = s;
		cross = cr;
		falloff = fo;
		fallType = fot;
		clampHi = ch;
		clampLo = cl;
		alphaBegin = ap;		
		texMap = t;
		color = c;
		xPos = xP;
		yPos = yP;
		zPos = zP;
		xScl = xS;
		yScl = yS;
		zScl = zS;

		texObj.renderer.material.mainTexture = texMap;
		texObj.renderer.material.color = color;
		texMap.Apply();
	}
}