/* Author: Johan Jobin
   Description: Draw a histogram that show the occurencies of the values
*/

/*function oneHistogramPerSensor:
  json: the json data
  width: width of the SVG
  height: height of the SVG
  id: id of the SVG
  parentDiv: id ot the div containing the SVG in order to append it inside
  Description: Draw a histogram per sensor that shows the occurencies of the values
*/

function oneHistogramPerSensor(json, width, height, id, parentDiv){
  for(sensors in json){
    div = document.createElement("div");
    div.setAttribute("id","divHistogram"+sensors);
    div.setAttribute("class","deleteAll");
    document.getElementById(parentDiv).append(div);


    uniqueId= id+sensors
    var array=[];
    console.log(json[sensors]);
    array.push(json[sensors]);
    console.log(array);
    histogram(array, width, height, uniqueId, div);
  }
}

function histogram(json, width, height, id, parentDiv){

// If there are no data available
  if(json[0].values.length==0){
    var errorsvg = d3.select(parentDiv)
      .append("svg")
      .attr("id",id)
      .attr("class","deleteAll")
      .attr('viewBox','0,0,'+width+','+height+'');

    errorsvg.append("text")
      .attr('transform', 'translate(' + (width / 2)+ ',' + (height / 2)+ ')')
      .text("No data available, try with another interval of time");
      return;
  }

// If there already is a svg in the parentDiv, remove it
  d3.select(parentDiv).selectAll("svg").remove();
  console.log(json);

// variable to define the margins of the svg
  var margin = {top: 0.1*height, right: 30, bottom: 0.1*height, left: 30};
  var innerWidth = width - margin.left - margin.right;
  var innerHeight = height - margin.top - margin.bottom;

// Creation of an array containing all values of the histogram
  var allValues=[];
    for(var sensors in json){
      for(var measure in json[sensors].values){
        allValues.push(parseFloat(json[sensors].values[measure].value));
      }
    }

// linear Scale for x-axis
  var x = d3.scaleLinear()
    .domain(d3.extent(allValues))
    .rangeRound([0, innerWidth])

// Use of d3.histogram() that creates an array of arrays (each array corresponds to an interval)
  var histogram = d3.histogram()
    .thresholds(d3.range(x.domain()[0], x.domain()[1], (x.domain()[1]-x.domain()[0])/20))
    (allValues)

// console.log(d3.range(x.domain()[0], x.domain()[1], (x.domain()[1]-x.domain()[0])/6));


// Creation of a linear scale for the y-axis
  var y = d3.scaleLinear()
    .domain([0, d3.max(histogram, function(d) {
      return d.length;
    })])
    .range([innerHeight, 0]);

// Creation of a svg element that will contain all elements of the histogram
  svg = d3.select(parentDiv)
    .append("svg")
    .attr("id", id)
    .attr('viewBox','0,0,'+width+','+height+'');

// Creation of a group that will contain all rects
  var bars1 = svg
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// For each interval of the histogram translate to the good position
  bars2 =bars1.selectAll("bars")
    .data(histogram)
    .enter()
    .append("g")
    .attr("transform", function(d){
    return "translate(" + x(d.x0) + "," + y(d.length) + ")";
  });

// For each interval append a rect
  bars2.append("rect")
    .attr("class", "histogramRect")
    .attr("x0", function(d){return d.x0})
    .attr("x1", function(d){return d.x1})
    .attr("nbOcc", function(d){return d.length})
    .attr("x", 1)
    .attr("width", function(d){return (x(d.x1)-x(d.x0))})
    .attr("height", function(d){return innerHeight-y(d.length)})
    .attr("fill", "#0e1a35");

// Definition of the format of the text that will show the number of values in this interval
  var formatCount = d3.format(",.1f");

  var totalNumberOfMeasure= json[0].values.length;

// Append the text
  texte = bars2.append("text")
    .attr("dy", ".75em")
    .attr("y", 6)
    .attr("x",function(d){return (x(d.x1) - x(d.x0)) / 2})
    .attr("text-anchor", "middle")
    .text(function(d) {
      return formatCount((d.length/totalNumberOfMeasure)*100) +"%";
    })
    .style("fill", "#f4a041")
    .style("font-size", "10px");



// Append the x-axis at the bottom of the graph
  bars1.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + (innerHeight) + ")")
    .call(d3.axisBottom(x));

// Append the title of the histogram
  var formatTime = d3.timeFormat(" %d %B %Y ");
  svg
    .append("text")
    .attr('transform', 'translate(' + (width / 2)+ ',' + (margin.top/2)+ ')')
    .style("font-weight", "bold")
    .style("text-anchor", "middle")
    .text("Distribution of sensor "+ json[0].objectId + " from: "+ formatTime(new Date(json[0].values[0].timestamp)) + "to: " + formatTime(new Date(json[0].values[json[0].values.length-1].timestamp)));

// x-axis label
  svg
    .append("text")
    .attr('transform', "translate("+(margin.left + innerWidth/2)+","+(height-(margin.bottom/2))+")")
    .text(json[0].unit.name);


// Creation of the div that will contain the information about each bar
  var tooltip = d3.select(parentDiv)
    .append('div')
    .attr('class', 'tooltip');

// One div for the beginning of the interval and the other for the end
  tooltip.append('div')
    .attr('class', 'x0');
  tooltip.append('div')
    .attr('class', 'x1');
  tooltip.append('div')
    .attr('class', 'nbOcc')

// When the mouse is on the bar
  svg.selectAll(".histogramRect")
    .on('mouseover', function(d) {

  tooltip.select('.x0').html("x0: <b>" + Math.round(d3.select(this).attr("x0")*100)/100 + json[0].unit.symbol+"</b>");
  tooltip.select('.x1').html("x1: <b>" + Math.round(d3.select(this).attr("x1")*100)/100 + json[0].unit.symbol+"</b>");
  tooltip.select('.nbOcc').html("Nb of elements: <b>" + Math.round(d3.select(this).attr("nbOcc")*100)/100+"</b>");
  d3.select(this)
    .style("fill","#FFFFFF")
    .style("stroke","#000000")
    .style("stroke-width","2px");

  tooltip.style('display', 'block');
    tooltip.style('opacity',2);
  })

// When the mouse is moved but still on the bar
  .on('mousemove', function(d) {
    tooltip.style('top', (d3.event.layerY + 10) + 'px')
      .style('left', (d3.event.layerX - 25) + 'px');
  })

// When the mouse leaves a bar
  .on('mouseout', function(d) {
    d3.select(this)
      .style("stroke", "none")
      .style("fill",   "#0e1a35")
    tooltip.style('display', 'none');
    tooltip.style('opacity',0);
    });

}
