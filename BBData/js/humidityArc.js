/* Author: Johan Jobin
   Draw a circle displaying the last percentage of a sensor
*/

/*function humidityArc:
  width: width of the SVG
  height: height of the SVG
  id: id of the SVG
  parentDiv: id ot the div containing the SVG in order to append it inside
  Description: This function draws an arc standing for the last measure of humid of one specified sensor
*/
function humidityArc(json, width, height, id, parentDiv){


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

// Creation of an object lastValue that will contain the information for the thermometer
  var lastValue = json[0].values[json[0].values.length-1];
  lastValue["unit"]= json[0].unit.name;
  lastValue["symbol"]= json[0].unit.symbol;
  lastValue["id"] = json[0].objectId;

  //console.log(lastValue);

// Variables to define the margins of the svg
  var margin = {top: 20, right: 50, bottom: 20, left: 50};
  var innerWidth = width - margin.left - margin.right;
  var innerHeight = height - margin.top - margin.bottom;

// Manage different errors
  if(lastValue===undefined||lastValue.unit!="percentage"||json.length>1){
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
    if(lastValue.unit!="percentage"){
      svg.append("text")
      .attr('transform', 'translate(' + (innerWidth / 2)+ ',' + (innerHeight / 2)+ ')')
      .text("This graph works only with measure of humidity");
      return;
    }
    if(json.length>1){
      svg.append("text")
      .attr('transform', 'translate(' + (innerWidth / 2)+ ',' + (innerHeight / 2)+ ')')
      .text("This graph accepts only one sensor at a time");
      return;
    }
  }

// Used to draw an entire circle
  var arcFull = d3.arc()
      .innerRadius(innerWidth / 7)
      .outerRadius(innerWidth / 5)
      .startAngle(0)
      .endAngle(2 * Math.PI);

// Used to compute the end angle of the circle expressing the percentage
  var scale= d3.scaleLinear()
      .domain([0,100])
      .range([0, 2*Math.PI]);

// Draw the circle expressing the percentage
  var arc = d3.arc()
      .innerRadius(innerWidth/7)
      .outerRadius(innerWidth/5)
      .startAngle(0)
      .endAngle(scale(lastValue.value));

// Append the svg that will contain all elements
  var svg = d3.select(parentDiv).append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("id", id);

// Append the texts
  svg
    .append("text")
    .attr('transform', 'translate(' + (innerWidth / 2)+ ',' + ((innerHeight / 2)- (innerWidth/5)- 15)+ ')')
    .style("font-weight", "bold")
    .style("text-anchor", "middle")
    .text("Last humidity of sensor: "+ lastValue.id);

  svg
    .append("text")
    .attr('transform', 'translate(' + (innerWidth / 2)+ ',' + (innerHeight / 2)+')')
    .style("text-anchor", "middle")
    .text(""+lastValue.value + lastValue.symbol+"");

  svg
    .append("text")
    .attr('transform', 'translate(' + (innerWidth / 2)+ ',' + ((innerHeight / 2)+(innerWidth/5)+15)+')')
    .style("text-anchor", "middle")
    .text(""+lastValue.timestamp+"");

// Append a group that will contain the 2 circles
  arcs = svg.append("g")
        .attr("class", "arcs");

// Draw the first circle
  arcs.append("path")
    .attr('transform', 'translate(' + (innerWidth / 2)+ ',' + (innerHeight / 2)+ ')')
    .style("fill", "#F4A041")
    .style("stroke","black")
    .style("stroke-width", "2px")
    .attr("d", arcFull);

// Draw the second circle
  arcs.append("path")
    .attr('transform', 'translate(' + (innerWidth / 2)+ ',' + (innerHeight / 2)+ ')')
    .style("fill", "#0e1a35")
    .style("stroke","black")
    .style("stroke-width", "2px")
    .attr("d", arc);

}
