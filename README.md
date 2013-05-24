grapher
=======

Simple, lightweight JavaScript grapher


## Usage

To initialise a new grapher, call g() passing in either a string of the id of the canvas you want to use, or a DOM element of the canvas.

### Options

You can also pass in options to the constructor. This is done by passing in an object containing any number of the following properties:

* barColours: an array of hex colours
* lineColour: a single hex colour
* lineWidth: an integer for width of the line
* axisColour: a single hex colour
* axisWidth: an integer for width of the axes
* wagonColours: an array of hex colours
* wagonBackground: a single hex colour
* wagonWidth: an integer for width of lines in a wagon wheel
* pieColours: an array of hex colours
* pieBorderColour: a single hex colour
* pieBorderWidth: an integer for the width of the pie chart border

### Chart types

The following chart types are supported:

* Bar
* Line
* Wagon (cricket style wagon wheels)
* Pie

#### Bar/Line

Bar and line charts require axes to be drawn first. This is done by calling .drawAxes(), passing in:

* maxX: maximum on x axis
* maxY: maximum on y axis
* ticks: true/false for whether axes should show ticks
* bigTickX: how often larger ticks should show on x axis
* bigTickY: how often larger ticks should show on y axis
* titleX: x axis title
* titleY: y axis title

A bar graph can then be drawn by calling .bar() and passing in an array of values.

A line graph can be drawn by calling .line() and passing in an array of x, y values (e.g. [{x:1,y:2},{x:2,y:1}]).

Both line and bar graphs can be drawn on the same graph.

#### Wagon

A wagon chart can be drawn by calling .wagon() and passing in an array of objects containing "runs", "length", and "angle".

#### Pie

A pie chart can be drawn by calling .pie() and passing in an array of objects containing "key" and "value" properties.