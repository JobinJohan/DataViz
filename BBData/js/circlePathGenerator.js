/*
Author: Joshuah Latimore
From: http://bl.ocks.org/jsl6906/cb75852db532cee284ed
Adapted by: Johan Jobin:
  - Function "functor" is not anymore in the d3.v4 library, need to add it here in order to make it work
  - The circle path that was drawn in the original code started at left-side, I wanted the path to start at the top
Description:
  - Path generator to draw a circle
    (there is a path generator in the standard d3 library but there does not exist any to draw circles)
*/

/*function functor:
  Description: If the value v is a function, it returns the value.
               Otherwise, it returns a function that returns the specified value.
*/
d3.functor = function functor(v) {
  return typeof v === "function" ? v : function() {
    return v;
  };
};

/* function circleGen:
  Description: Path generator to draw circles
*/
function circleGen() {
  //set defaults
  var r = function(d) { return d.radius; },
      x = function(d) { return d.x; },
      y = function(d) { return d.y; };


  function circle(d) {
    var cx = d3.functor(x).call(this, d),
        cy = d3.functor(y).call(this, d),
        myr = d3.functor(r).call(this, d);

// Parameters of the path --> In html <path d="...">
  return "M" + cx + "," + cy + " " +
               "m" + 0 + ","+ -myr  +
               "a" + myr + "," + myr + " 0 1,1 " + 0  + ","+ myr*2 +
               "a" + myr + "," + myr + " 0 1,1 " + 0 + "," + -myr*2 +"Z";


  //Original Code
  // return "M" + cx + "," + cy + " " +
  //        "m" + -myr + ", 0 " +
  //        "a" + myr + "," + myr + " 0 1,0 " + myr*2  + ",0 " +
  //        "a" + myr + "," + myr + " 0 1,0 " + -myr*2 + ",0Z";
  }

  //getter-setter methods
  circle.r = function(value) {
    if (!arguments.length) return r; r = value; return circle;
  };
  circle.x = function(value) {
    if (!arguments.length) return x; x = value; return circle;
  };
  circle.y = function(value) {
    if (!arguments.length) return y; y = value; return circle;
  };
  return circle;
}
