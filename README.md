PerlinVisualizer
================

Needing a more intuitive way to understand how to use perlin noise I created this tool. The idea is to have a quicker
and easier way to generate, shape, and preview noise maps while being able to save the settings for each to be reused
in other applications to create maps that better meet thier expectations.  

The Perlin Noise/Marching Cubes plugins included were written by *figureout*.  They are worth looking at themselves for
a better understanding of how perlin works, and can be easily expanded to suit more complex needs.

--To Done List.
8-15-14.
Had a sit down with Unity GUI, came to an understanding.
Create multiple maps and maintain the settings for each.
8-16-14
Added some basic functions to shape the noise(see function effectsOut )
Added a color tint option(Does not effect base map/should it?)
8-17-14
Added to GitHub

--To Do List
Can I Make the GUI smaller, in one/two moves
 Can I put the Gui in a popup window?
 Maybe a toolbar on top for menus and one on the bottom for the array control
 Save, Perlin Settings/Effect, Output Type
Make textfields and sliders work together
Save maps to jpg
Save Prefs to maintain work
Did you release a button? I'm gonna AutoUpdate
Camera Controls: Zoom(fov?), Up, Down, Left, Right
View Types: Slide(single), Slide Lineup , Layered, Tiled
X/Y base positioning for perlin
Function Zooming with Global and Local Positioning: ENHANCE!!
 The perlin function can be zoomed in on by maintaining position over the same 1:1 location while creating
 maps with frequency:1 resolution. local = global * freq.
X/Y/Z Scaling within function. Get your smear on
Texture Size Option (how big does it have to be for 20 Octaves to matter);
Begin Alpha falloff at control
Save Flatten Layer Map
Gradients?
Animations? Lerp Settings Values
Generate Tiles
2D Voxel representation
3D Voxel representation
--Some Issues
Gui scaling
Title Text Color
Updating before previous update is done, or Too many updates in quick succession crashes with memory allocation error
