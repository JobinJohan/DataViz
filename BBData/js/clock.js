//Author: Mike Bostock
//Found on: https://bl.ocks.org/mbostock/1098617
//Last update january 22, 2018

//Adapted by Johan Jobin march 23 2018 because the above code was not working with D3 v.4
//and the style was not corresponding to the style of the dashboard

//Description: Draw a clock with current time


/*function clock:
  width: width of the SVG
  height: height of the SVG
  id: id of the SVG
  parentDiv: id ot the div containing the SVG in order to append it in the SVG
  Description: This function draws a clock using d3.v4 that uses transition and
                that updates itself automatically
*/
function clock(width, height, id, parentDiv){

  var fields = [
  {value: 24, size: 24, label: "h", update: function(date) { return date.getHours(); }},
  {value: 60, size: 60, label: "m", update: function(date) { return date.getMinutes(); }},
  {value: 60, size: 60, label: "s", update: function(date) { return date.getSeconds(); }}
  ];


// Arc generator, at first draw an entire arc
  var arc = d3.arc()
    .innerRadius(width / 6.5-30)
    .outerRadius(width / 6.5 - 5)
    .startAngle(0)
    .endAngle(function(d) { return (d.value / d.size) * 2 * Math.PI; });

// Create the SVG and append it to the container
  var svg = d3.select(parentDiv).append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("id", id);

// Append the title to the SVG, make it bold and center it
  svg.append("g")
    .append("text")
    .style("font-weight", "bold")
    .attr("transform","translate("+width/2+",30)")
    .style("text-anchor", "middle")
    .text("Current time");

// For each field, append a group that will contain the arc for each clock
  var field = svg.selectAll(".field")
    .data(fields)
    .enter().append("g")
    .attr("transform", function(d, i) { return "translate(" + (i * 2 + 1.25) / 6.5 * width + "," + height / 2 + ")"; })
    .attr("class", "field");

// Draw the entire clock and color it in orange, border black 2px
  field.append("path")
    .attr("class", "path path--background")
    .style("fill", "#F4A041")
    .style("stroke","black")
    .style("stroke-width", "2px")
    .attr("d", arc);

// Just append a class attribute that will be used to update the second arc and fill it in blue
  var path = field.append("path")
    .attr("class", "path path--foreground")
    .style("fill", "#0E1A35");

// Append the text in the middle of the arc
  var label = field.append("text")
    .attr("class", "label")
    .attr("dy", ".35em")
    .style('font', '24px sans-serif')
    .style("text-anchor", "middle");

// Anonymous function that will execute automatically to update the label and the s
(function update() {

  // Create a date containing the current time
    var now = new Date();

  // Store in d.previous the current value, and the update the current value and store it in d.value
    field.each(function(d) {d.previous = d.value, d.value = d.update(now); });

  // Create the transition between each clock: d3.easeElastic is responsible of the elastic move of the transition,
  // the duration of the transition is 750 ms
  // attrTween will create the second arc (the orange one)
    path.transition()
      .ease(d3.easeElastic)
      .duration(750)
      .attrTween("d", arcTween);

  //Update the label
    label.text(function(d) {return d.value + d.label; });

  // Run the update function each second
  setTimeout(update, 1000 - (now % 1000));
  })();


// d3.interpolate returns a function (interpolator) in i, b is the object containing the object with value, previous, size, update fields
  function arcTween(b) {
    var i = d3.interpolate({value: b.previous}, b);
    return function(t) {
      return arc(i(t));
    };
  }
}
