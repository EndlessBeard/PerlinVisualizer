#pragma strict
//--Perlin Visualizer--
//Needing a more intuitive way to understand how to use perlin noise I wrote this tool.  The idea is to have a quicker
//and easier way to generate maps so the settings can be reused in other applications to create maps that better meet
//thier expectations.
  
//The Perlin Noise plugin(PerlinNoise.cs) included was written by *figureout*. Who gets a 1000 internets for this greatness.

//--To Done List
//8-15-14
//Had a sit down with Unity GUI, came to an understanding.
//Create multiple maps and maintain the settings for each.
//8-16-14
//Added some basic functions to shape the noise(see function effectsOut )
//Added a color tint option(Does not effect base map/should it?)
//8-17-14
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
//X/Y base positioning for perlin
//Function Zooming with Global and Local Positioning: ENHANCE!!
//	The perlin function can be zoomed in on by maintaining position over the same 1:1 location while creating
//	maps with frequency:1 resolution. local = global * freq.
//X/Y/Z Scaling within function.  Get your smear on
//Texture Size Option (how big does it have to be for 20 Octaves to matter);
//Begin Alpha falloff at control
//Save Flatten Layer Map
//Gradients?
//Animations? Lerp Settings Values
//Generate Tiles
//2D Voxel representation
//3D Voxel representation

//--Some Issues
//Gui scaling
//Title Text Color
//Updating before previous update is done, or Too many updates in quick succession crashes with memory allocation error
//Perlin Generator
private var pNoise : PerlinNoise;
//Perlin Settings
var freq : float;
var amp : float;
var octv : int;
var seed : int;

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

//template object and settings
var texObj : GameObject;
var texMap : Texture2D;
var texHeight : int;
var texWidth : int;

//Notes: local Perlin position = Global Perlin Position * Frequency
//

function OnGUI() {

	//--TITLE BAR

	//--SETTINGS MENU
	GUILayout.BeginArea(Rect(10, 10, 350, 320));
	GUILayout.Label("SETTINGS");
		GUILayout.BeginVertical("box");
			
			GUILayout.BeginHorizontal("box");
			GUILayout.Label("SEED", GUILayout.Width(85));
			seed = GUILayout.HorizontalSlider(seed, 0.0, 10000.0, GUILayout.Width(200) );
			GUILayout.TextField(seed.ToString(), GUILayout.Width(45));
			GUILayout.EndHorizontal();
			
			GUILayout.BeginHorizontal("box");
			GUILayout.Label("OCTAVE", GUILayout.Width(85));
			octv = GUILayout.HorizontalSlider(octv, 1, 10, GUILayout.Width(200) );
			GUILayout.TextField(octv.ToString(), GUILayout.Width(45));	
			GUILayout.EndHorizontal();
			
			GUILayout.BeginHorizontal("box");
			GUILayout.Label("FREQUENCY", GUILayout.Width(85));
			freq = GUILayout.HorizontalSlider(freq, 0, 666, GUILayout.Width(200) );
			GUILayout.TextField(freq.ToString(), GUILayout.Width(45));	
			GUILayout.EndHorizontal();
			
			GUILayout.BeginHorizontal("box");
			GUILayout.Label("AMPLITUDE", GUILayout.Width(85));
			amp = GUILayout.HorizontalSlider(amp, 0.0, 2.0, GUILayout.Width(200) );
			GUILayout.TextField(amp.ToString(), GUILayout.Width(45));	
			GUILayout.EndHorizontal();
		
		GUILayout.EndVertical();
	GUILayout.EndArea();

	//--EFFECTS MENU
	GUILayout.BeginArea(Rect(10+10+350, 10, 350, 320));
	GUILayout.Label("EFFECTS");
		GUILayout.BeginVertical("box");
					
			GUILayout.BeginHorizontal("box");
			GUILayout.Label("FALLOFF", GUILayout.Width(85));
			falloff = GUILayout.HorizontalSlider(falloff, 0.0, 2.0, GUILayout.Width(200) );
			GUILayout.TextField(falloff.ToString(), GUILayout.Width(45));	
			GUILayout.EndHorizontal();
			
			GUILayout.BeginHorizontal("box");
			GUILayout.Label("CROSS", GUILayout.Width(85));
			cross = GUILayout.HorizontalSlider(cross, 0.0, 2.0, GUILayout.Width(200) );
			GUILayout.TextField(cross.ToString(), GUILayout.Width(45));
			GUILayout.EndHorizontal();
						
			GUILayout.BeginHorizontal("box");
			GUILayout.Label("CLAMP HIGH", GUILayout.Width(85));
			clampHi = GUILayout.HorizontalSlider(clampHi, 0.0, 1.0, GUILayout.Width(200) );
			GUILayout.TextField(clampHi.ToString(), GUILayout.Width(45));	
			GUILayout.EndHorizontal();
			
			GUILayout.BeginHorizontal("box");
			GUILayout.Label("CLAMP LOW", GUILayout.Width(85));
			clampLo = GUILayout.HorizontalSlider(clampLo, 0.0, 1.0, GUILayout.Width(200) );
			GUILayout.TextField(clampLo.ToString(), GUILayout.Width(45));	
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
		GUILayout.EndVertical();
	GUILayout.EndArea();
	//maps[] Array Control Bar
	GUILayout.BeginArea(Rect(10, 175, (350+10)*3, 60));
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
	maps[id].texObj.SetActive(false);
	id = 0;
	maps[id].texObj.SetActive(true);	
	getSettings();
}
function previousMap() {
	maps[id].texObj.SetActive(false);
	id = id - 1;
	if(id < 0) { id = 0; }
	maps[id].texObj.SetActive(true);
	getSettings();
}
function updateMap() {
	if(!maps[id].filled) { //if map is new, initialize
		var temp : GameObject = Instantiate(texObj);
		maps[id].init(id, temp); 
	}
	maps[id].fill(buildPerlinMap(), color, freq, amp, octv, seed, cross, falloff, fallType, clampHi, clampLo); 
}
function nextMap() {
	maps[id].texObj.SetActive(false);
	id++;
	if(id > lastid) { lastid++; }
	if(!maps[id].filled) { //if map is new, initialize
		var temp : GameObject = Instantiate(texObj);
		maps[id].init(id, temp); 
	} else { getSettings(); }
	maps[id].texObj.SetActive(true);
}
function lastMap() {
	maps[id].texObj.SetActive(false);
	id = lastid;
	maps[id].texObj.SetActive(true);
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
    color = maps[id].color;
    clrR = color.r;
    clrG = color.g;
    clrB = color.b;
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
			var samp : float = pNoise.FractalNoise2D(x, y, octv, freq, amp);  
			samp = effectOut(samp); 
			texMap.SetPixel(x,y, Color(samp, samp, samp));
		}
	}
	return texMap;
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
		case 3 : //Gravity 32ft/s  (32/1000) * (1.0 - pOut)
			pOut = pOut - ((1.0 - pOut) * falloff * .32);	
			break;
	}
	//Falloff Limiter
	if(pOut > 1.0) { pOut = 1.0; }
	if(pOut < 0.0) { pOut = 0.0; }	
	
	
	return pOut;
}
class PMap {
	var filled : boolean = false; //has been initilized
	var texMap : Texture2D; //texmap to link to//might not really need this.
	var texObj : GameObject;//Just a plane gameobject
	
	//Position Settings
	var globalPosX : float;
	var globalPosY : float;
	var localPosX : float;
	var localPosY : float;
	
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
	var color : Color;
	var toolbarInt : int;
	
	var id : int;
	var x : float;
	var y : float;
	var posType : int;
	var posPad : float;
	
	
	//Setup a New Map
	function init(id : int, template : GameObject) {
		texObj = template;
		texObj.renderer.material.mainTexture = texMap;
		filled = true;
	}
	//Thought it better to make maps as needed instead of having a number of large textures loaded in memory
	function PMap() { }
	//Transfer GUI control settings and Perlin Map Texture to class
	function fill(t : Texture2D, c : Color, f : float, a : float, o : int, s : int, cr : float, fo : float, fot : int, ch : float, cl : float){
		freq = f;
		amp = a;
		octv = o;
		seed = s;
		cross = cr;
		falloff = fo;
		fallType = fot;
		clampHi = ch;
		clampLo = cl;
				
		texMap = t;
		color = c;
		
		texObj.renderer.material.mainTexture = texMap;
		texObj.renderer.material.color = color;
		texMap.Apply();
	}
}