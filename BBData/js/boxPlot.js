/*Author: Johan Jobin, University of Fribourg 2018
Inspired from this: https://stackoverflow.com/questions/43281482/d3-js-boxplot-with-already-calculated-data
Description: Draw a boxPlot for all values given in the json file
*/

/*function oneBoxPlotPerSensor:
  json: the json data
  width: width of the SVG
  height: height of the SVG
  id: id of the SVG
  parentDiv: id ot the div containing the SVG in order to append it inside
  Description: This function creates a div element and an id for each sensor
              and then draw one boxPlot for each sensor.
*/
function oneBoxPlotPerSensor(json, width, height, id, parentDiv){
  for(sensors in json){

  // Creation of the div
    div = document.createElement("div");
    div.setAttribute("id","divBoxPlot"+sensors);
    div.setAttribute("class","deleteAll");

  // Append the new div to the one given in arg.
    document.getElementById(parentDiv).append(div);

  // Creation of a unique id for each graph
    uniqueId= id+sensors

  // Put the data of each sensor in an array
    var array=[];
    array.push(json[sensors]);

  // Create one boxPlot for each sensor
    boxPlot(array, width, height, uniqueId, div);
  }
}


/*function BoxPlot:
  json: the json data
  width: width of the SVG
  height: height of the SVG
  id: id of the SVG
  parentDiv: id ot the div containing the SVG in order to append it in the SVG
  Description: Draw a boxPlot: the mustaches corresponds to min and max, the red line to currentMean, the yellow line to median
                and the quantiles are shown when the mouse is on the blue zone.
*/
function boxPlot(json, width, height, id, parentDiv){
  console.log(json);

// If there already is a svg in the parentDiv, remove it
  d3.select(parentDiv).selectAll("svg").remove();

//Defining margin etc..
  var margin = {top: 20, right: 10, bottom: 60, left: 50};
  var innerWidth = width - margin.left - margin.right;
  var innerHeight = height - margin.top - margin.bottom;
  var totalWidth = width + margin.left + margin.right;
  var totalheight = height + margin.top + margin.bottom;
  var barWidth = width/4;

// If there are no data available
  if(json[0].values.length==0){
    var svg = d3.select(parentDiv)
      .append("svg")
      .attr("id",id)
      .attr("class","deleteAll")
      .attr('viewBox','0,0,'+width+','+height+'');

    svg.append("text")
    .attr('transform', 'translate(' + (innerWidth / 2)+ ',' + (innerHeight / 2)+ ')')
    .text("No data available, try with another interval of time");
    return;
  }



//Pushing all values in an array to compute max, min, median, first quartile etc..
  var allValuesY=[];
  var allLastMeasure=[];

  for(var sensors in json){
    var length = json[sensors].values.length-1;
    for(var measure in json[sensors].values){
      allValuesY.push(parseFloat(json[sensors].values[measure].value));
      if(measure == length-1){
        allLastMeasure.push(parseFloat(json[sensors].values[measure].value));
      }
    }
  }

  if (allValuesY.length==0){
    return 0;
  }

// Computation of different values used to draw the boxplot
  var median = stats(allValuesY).median();
  var minY = stats(allValuesY).min();
  var maxY = stats(allValuesY).max();
  var q1 = stats(allValuesY).q1();
  var q3 = stats(allValuesY).q3();
  var mean = stats(allValuesY).mean();


// Definition of the scale used to choose among 10 colors
  var colorScale = d3.scaleOrdinal(d3.schemeCategory10);

// Linear scale for y-axis
  var yScale = d3.scaleLinear()
    .domain([minY-10, maxY+10 ])
    .range([innerHeight, 0]);

// Discrete scale for x-axis
  var xScale = d3.scaleLinear()
    .domain([0,1])
    .range([0, innerWidth]);

// Create X-axis and Y-axis
    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale).ticks(5);


// Append the svg that will contain all elements of the graph to the parentDiv
  svg = d3.select(parentDiv)
    .append("svg")
    .attr("id",id)
    .attr("class","deleteAll")
    .attr('viewBox','0,0,'+width+','+height+'');

// Append a group that will contain the caption of the graph
  svg.append("g")
    .append("text")
    .style("font-weight", "bold")
    .attr("transform","translate("+width/2+","+ (height-(margin.bottom/2))+")")
    .style("text-anchor", "middle")
    .text("Box Plot ("+json[0].unit.name+") of sensor id: "+json[0].objectId);


// Append a group to the svg that will contain the Y-axis and the gridlines
  var gY = svg.append("g")
    .attr("class", "grid")
    .attr("transform", "translate(" + margin.left + ","+ margin.top +")")
    .call(yAxis.tickSize(-width))
    .selectAll(".grid line")
    .attr("stroke", "lightgrey")
    .attr('stroke-opacity', '0.7')
    .attr('shape-rendering', 'crispEdges');

// Create a group that will contain the lines and the rectangles of the boxPlot
  var boxPlot =svg
    .append("g")
    .attr("transform", "translate(" + margin.left + ","+ margin.top +")")
    .attr('id', 'boxPlot')
    .attr('fill', "#0e1a35");

// Append the vertical line from the max until the min
  boxPlot.append("line")
    .attr("stroke", "#0e1a35")
    .attr("stroke-width",2 )
    .attr("x1", xScale(0.4)+ barWidth/2)
    .attr("x2", xScale(0.4)+ barWidth/2)
    .attr("y1", yScale(maxY))
    .attr("y2", yScale(minY));

// Append the top mustache
  boxPlot.append("line")
    .attr("class", "boxPlotSelectable")
    .attr("category", "max")
    .attr("max", maxY)
    .attr("stroke", "#0e1a35")
    .attr("stroke-width",2 )
    .attr("x1", xScale(0.4))
    .attr("x2", xScale(0.4)+ barWidth)
    .attr("y1", yScale(maxY))
    .attr("y2", yScale(maxY));

// Append the bottom mustache
  boxPlot.append("line")
    .attr("min", minY)
    .attr("class", "boxPlotSelectable")
    .attr("category", "min")
    .attr("stroke", "#0e1a35")
    .attr("stroke-width",2 )
    .attr("x1", xScale(0.4))
    .attr("x2", xScale(0.4)+ barWidth)
    .attr("y1", yScale(minY))
    .attr("y2", yScale(minY));


// Append the rectangle for the 1st quartile and the 3td quartile
  boxPlot.append("rect")
    .attr("class", "boxPlotSelectable")
    .attr("category", "q")
    .attr("q1", q1)
    .attr("q3", q3)
    .attr("id", "boxPlot")
    .attr("fill", "#0e1a35")
    .attr("stroke", "black")
    .attr('x', xScale(0.4))
    .attr('y', yScale(q3))
    .attr('width', barWidth )
    .attr('height', yScale(q1)-yScale(q3));


// Append the median
  boxPlot.append("line")
    .attr("stroke", "yellow")
    .attr("class", "boxPlotSelectable")
    .attr("category", "median")
    .attr("median", median)
    .attr("stroke-width",1 )
    .attr("x1", xScale(0.4))
    .attr("x2", xScale(0.4)+ barWidth)
    .attr("y1", yScale(median))
    .attr("y2", yScale(median));


//Append the mean
  boxPlot.append("line")
        .attr("stroke", "red")
        .attr("class", "boxPlotSelectable")
        .attr("category", "mean")
        .attr("mean", mean)
        .attr("stroke-width",1)
        .attr("x1", xScale(0.4))
        .attr("x2", xScale(0.4)+ barWidth)
        .attr("y1", yScale(mean))
        .attr("y2", yScale(mean));


// Creation of the div that will contain the information about each cell
  var tooltip = d3.select(parentDiv)
    .append('div')
    .attr('class', 'tooltip');

// One div for the objectId and the other for the value
  tooltip.append('div')
    .attr('class', 'info');

// When the mouse is on a cell (i.e a sensor)
  d3.selectAll(".boxPlotSelectable")
    .on('mouseover', function(d){
      d3.select(this).attr("style", "stroke-width:4px;")
      if(d3.select(this).attr("category")=="max"){
        tooltip.select('.info').html("Max: <b>" + d3.select(this).attr("max") +json[0].unit.symbol+ "</b>");
      }
      else if(d3.select(this).attr("category")=="min"){
        tooltip.select('.info').html("Min: <b>" + d3.select(this).attr("min") + json[0].unit.symbol+"</b>");
      }
      else if(d3.select(this).attr("category")=="q"){
        tooltip.select('.info').html("Q1: <b>" + d3.select(this).attr("q1") + "</b> Q3: <b>"+ d3.select(this).attr("q3")+json[0].unit.symbol+"</b>");
        }
      else if(d3.select(this).attr("category")=="mean"){
        tooltip.select('.info').html("Mean: <b>" + d3.select(this).attr("mean") + json[0].unit.symbol+ "</b>");
      }
      else if(d3.select(this).attr("category")=="median"){
        tooltip.select('.info').html("Median: <b>" + d3.select(this).attr("median") + json[0].unit.symbol+ "</b>");
      }
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
      d3.select(this).attr("style", "stroke-width:2px;")
      tooltip.style('display', 'none');
      tooltip.style('opacity',0);
    });
}
