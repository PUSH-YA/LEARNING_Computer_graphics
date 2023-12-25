CPSC 314 A6  (Sept 2023)

NAME or NAMES: Pushya Jain, cwl: pushya

If working in a group, briefly state the work done by each person.

CALL GRAPH (part a):
- first all the variables / structs are created before running any function
- then the main() is called in fragment shader
- initialise() initialises all the spheres (sphere0 is the light ball) and adds them to the scene property (scene_spheres list)
- then for each pixel, a ray is created according to the FOV and the pixel location
- raytrace() is called on each pixel which calls nearestT() and bgColor() if showing background
- bgColor() also calls nearestT()
- -----------------------------------------------------------------------------------
- /////////////////after my implementation /////////////////////////////////////////
- -----------------------------------------------------------------------------------
- raytrace() then calls localShade for local illumination which calls nearestT()
- raytrace() calls raytrace2() for second bounce which calls bgColor() and nearestT()
- raytrace2() then calls raytrace3() for third bounce which calls bgColor() and nearestT()

CREATIVE COMPONENT:
- added a 3rd bounce
- can toggle between max bounces 1, 2 and 3 bounce with "1", "2", and "3" keys
- changed bcg color (weird rainy beach) and floor pattern to more beach like (sinusodial waves to simulate waves)
- changes the positions and animate function so, blue ball orbits pink ball and is tidally locked    

COMMENTS:
I had to offset shadow ray origin so, the shadow rays from light source would actuall intersect itself otherwise it would miss the self intersection
This would also be helpful to ensure that the sphere's positions that are in its own shadow will remain in its own shadow.
