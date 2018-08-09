/* Author:       Johan Jobin, university of Fribourg, 2018
   Adapted from: https://codepen.io/davidbanks/pen/rksLn: the thermometer was not compatible with d3 v4,
                the code was complicated and the style didn't correspond to the one we have
                on the BBData vizualisation system.
   Description: Draw a thermometer that display the last temperature of a sensor
*/


/*function thermometer:
  json: the json data
  width: width of the SVG
  height: height of the SVG
  id: id of the SVG
  parentDiv: id ot the div containing the SVG in order to append it inside
  Description: Draw a radialPlot: each circle corresponds to an entire day.
*/
function thermometer(json, width, height, id, parentDiv){


// If there are no data available
  if(json[0].values.length<1){
    var svg = d3.select(parentDiv)
      .append("svg")
      .attr("id",id)
      .attr("width", width)
      .attr("height", height);

      svg.append("text")
      .attr('transform', 'translate(' + (width / 2)+ ',' + (height / 2)+ ')')
      .text("No data available")
      .style("text-anchor", "middle");
      return;
  }

// store last value, unit, symbol and id
  var lastValue = json[0].values[json[0].values.length-1];
  lastValue["unit"]= json[0].unit.name;
  lastValue["symbol"]= json[0].unit.symbol;
  lastValue["id"] = json[0].objectId;

// Variables to define the margins of the svg
  var margin = {top: 30, right: 10, bottom: 30, left: 10};
  var innerWidth = width - margin.left - margin.right;
  var innerHeight = height - margin.top - margin.bottom;


// Manage different errors
  if(lastValue===undefined||lastValue.unit!="degree celsius"||json.length>1){
    var svg = d3.select(parentDiv)
      .append("svg")
      .attr("id",id)
      .attr("width", width)
      .attr("height", height);
    if(lastValue===undefined){
      svg.append("text")
      .attr('transform', 'translate(' + (innerWidth / 2)+ ',' + (innerHeight / 2)+ ')')
      .text("No data available, try with another interval of time");
      return;
    }
    if(lastValue.unit!="degree celsius"){
      svg.append("text")
      .attr('transform', 'translate(' + (innerWidth / 2)+ ',' + (innerHeight / 2)+ ')')
      .text("This graph works only with measure of temperature");
      return;
    }
    if(json.length>1){
      svg.append("text")
      .attr('transform', 'translate(' + (innerWidth / 2)+ ',' + (innerHeight / 2)+ ')')
      .text("This graph accepts only one sensor at a time");
      return;
    }
  }

// Value that will be displayed in the thermometer
  var currentTemp = parseFloat(lastValue.value);

// Used to define the margin-top and margin-bottom
  var bottomY = height - margin.bottom;
  var topY = margin.top;

// Dimension of the tube
  var tubeWidth = 21.5;
  var tubeBorderWidth = 2;
  var tubeBorderColor = "#f4a041";

// Dimension of the main bulb (the bottom one) and colors
  var mercuryColor = "#0e1a35";
  var innerBulbColor = "#0e1a35";
  var bulbRadius = 20;
  var bulb_cy = bottomY - bulbRadius;
  var bulb_cx = width/2;

// Y position for the rounded top of the tube
var top_cy = topY + tubeWidth/2;

var svg = d3.select(parentDiv)
  .append("svg")
  .attr("width", width)
  .attr("height", height);

// Circle element for rounded tube top
svg.append("circle")
  .attr("r", tubeWidth/2)
  .attr("cx", width/2)
  .attr("cy", top_cy)
  .style("fill", "#FFFFFF")
  .style("stroke", tubeBorderColor)
  .style("stroke-width", tubeBorderWidth + "px");

// Rect element for tube
svg.append("rect")
  .attr("x", width/2 - tubeWidth/2)
  .attr("y", top_cy)
  .attr("height", bulb_cy - top_cy)
  .attr("width", tubeWidth)
  .style("shape-rendering", "crispEdges")
  .style("fill", "#FFFFFF")
  .style("stroke", tubeBorderColor)
  .style("stroke-width", tubeBorderWidth + "px");

// White fill for rounded tube top circle element
// to hide the border at the top of the tube rect element
svg.append("circle")
  .attr("r", tubeWidth/2 - tubeBorderWidth/2)
  .attr("cx", width/2)
  .attr("cy", top_cy)
  .style("fill", "#FFFFFF")
  .style("stroke", "none");

// Main bulb of thermometer (empty), white fill
svg.append("circle")
  .attr("r", bulbRadius)
  .attr("cx", bulb_cx)
  .attr("cy", bulb_cy)
  .style("fill", "#FFFFFF")
  .style("stroke", tubeBorderColor)
  .style("stroke-width", tubeBorderWidth + "px");


// Rect element for tube fill colour
svg.append("rect")
  .attr("x", width/2 - (tubeWidth - tubeBorderWidth)/2)
  .attr("y", top_cy)
  .attr("height", bulb_cy - top_cy)
  .attr("width", tubeWidth - tubeBorderWidth)
  .style("shape-rendering", "crispEdges")
  .style("fill", "#FFFFFF")
  .style("stroke", "none");


// D3 scale object
var scale = d3.scaleLinear()
  .domain([-20, 50])
  .range([bulb_cy, top_cy]);


var tubeFill_bottom = bulb_cy,
    tubeFill_top = scale(currentTemp);

// Rect element for the red mercury column
svg.append("rect")
  .attr("class", "mercuryRect")
  .attr("x", width/2 - (tubeWidth - 10)/2)
  .attr("y", tubeFill_top)
  .attr("width", tubeWidth - 10)
  .attr("height", tubeFill_bottom - tubeFill_top)
  .style("shape-rendering", "crispEdges")
  .style("fill", mercuryColor)


// Main thermometer bulb fill
  svg.append("circle")
    .attr("r", bulbRadius - 6)
    .attr("cx", bulb_cx)
    .attr("cy", bulb_cy)
    .style("fill", "#0e1a35")
    .style("stroke", mercuryColor)
    .style("stroke-width", "2px");

// Axis of the thermometer
  var axis = d3.axisLeft()
    .scale(scale)
    .tickValues([-20, -10, 0, 10, 20, 30, 40, 50]);

//Add the axis to the image
 var svgAxis = svg.append("g")
   .attr("id", "tempScale")
   .attr("transform", "translate(" + (width/2 - tubeWidth/2) + ",0)")
   .call(axis);

 // Format text labels
 svgAxis.selectAll(".tick text")
     .style("fill", "#0e1a35")
     .style("font-size", "10px");

 // Set main axis line to no stroke or fill
 svgAxis.select("path")
   .style("stroke", "none")
   .style("fill", "none")

 // Set the style of the ticks
 svgAxis.selectAll(".tick line")
   .style("stroke", tubeBorderColor)
   .style("shape-rendering", "crispEdges")
   .style("stroke-width", "1px");

  svg
     .append("text")
     .attr('transform', 'translate(' + (width / 2)+ ',' + (margin.top/2)+ ')')
     .style("font-weight", "bold")
     .style("text-anchor", "middle")
     .text("Last temperature of sensor: "+ lastValue.id);

  var formatTime = d3.timeFormat(" %d %B %Y ");
  var tooltip = d3.select(parentDiv)
       .append('div')
       .attr('class', 'tooltip');

   // One div for the date and the other for the value
     tooltip.append('div')
       .attr('class', 'date');
     tooltip.append('div')
       .attr('class', 'value');

   // When the mouse is on a rect (i.e a day in the calendar)
     svg.selectAll(".mercuryRect")
       .on('mouseover', function(d) {
         tooltip.select('.date').html("Date: <b>" + formatTime(new Date(lastValue.timestamp)) + "</b>");
         tooltip.select('.value').html("Temperature: <b>" + lastValue.value +json[0].unit.symbol+ "<b>");
         d3.select(this)
         .style("stroke","#ffffff")
         .style("stroke-width","2px");
         tooltip.style('display', 'block');
         tooltip.style('opacity',2);
     })

   // When the mouse is moved but still on the rect
       .on('mousemove', function(d) {
         tooltip.style('top', (d3.event.layerY + 10) + 'px')
         .style('left', (d3.event.layerX - 25) + 'px');
       })

   // When the mouse leaves a rect
       .on('mouseout', function(d) {
         d3.select(this).style("stroke", "none")
         tooltip.style('display', 'none');
         tooltip.style('opacity',0);
       });


}
