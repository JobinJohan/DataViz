/*Author: Johan Jobin, University of Fribourg 2018
Inspired from: https://bl.ocks.org/arpitnarechania/027e163073864ef2ac4ceb5c2c0bf616
Description: Draw a Spiral Plot for all values given in the json file
*/


/*function spiralPlot:
  json: the json data
  width: width of the SVG
  height: height of the SVG
  id: id of the SVG
  parentDiv: id ot the div containing the SVG in order to append it inside
  Description: Draw a spiralPlot
*/
function spiralPlot(json, width, height, id, parentDiv){

  console.log(json)

  // Definition of the variables to define size, margins and constants
    var margin = {top: 60, right: 10, bottom: 60, left: 10};
    var innerWidth = width - margin.left - margin.right;
    var innerHeight = height - margin.top - margin.bottom;
    const PI = Math.PI;
    var numSpirals=3;
    var start=0;
    var end = 2.25;


// Reorganize the json file in a more convenient way: store all data for each month and compute the mean for each day
  var nest = d3.nest()
    .key(function(d){return new Date(d.timestamp).getMonth()})
    .key(function(d){return new Date(d.timestamp).getDate()})
    .rollup(function(v){
      toReturn={};
      toReturn["timestamp"]=v[0].timestamp;
      toReturn["value"]= d3.mean(v, function(v){return v.value});
      return toReturn;})
    .entries(json[0].values);


// If there is no data, don't display any graph but tell the user that the data is empty
    if(nest.length == 0){
      var svg = d3.select(parentDiv)
        .append("svg")
        .attr("id",id)
        .attr("width", width)
        .attr("height", height);

      svg.append("text")
      .attr('transform', 'translate(' + (innerWidth / 2)+ ',' + (innerHeight / 2)+ ')')
      .text("No data available, try with another interval of time");
      return;

    }

// If the interval of time is bigger than 1 year, display an error
    if(nest.length>12){
      var svg = d3.select(parentDiv)
        .append("svg")
        .attr("id",id)
        .attr("width", width)
        .attr("height", height);

      svg.append("text")
      .attr('transform', 'translate(' + (innerWidth / 2)+ ',' + (innerHeight / 2)+ ')')
      .text("Maximum interval: 1 year. Try with another interval");
      return;
    }


  nest = completeMonthNest2(nest);

  console.log(nest);


  var allValuesY=[];
  for(var sensors in json){
    for(var measure in json[sensors].values){
      allValuesY.push(parseFloat(json[sensors].values[measure].value));
    }
  }

  var maxValue = d3.max(allValuesY);
  var minValue = d3.min(allValuesY);

// Function that will return the radius
  var theta = function(r) {
    return numSpirals * Math.PI * r;
    };

// used to assign nodes color by group
  var color = d3.scaleOrdinal(d3.schemePaired);

// radius of the spiral
  var r = d3.min([width, height]) / 2 - 40;

// Scale used to draw the spiral (cf: spiral)
  var radius = d3.scaleLinear()
    .domain([start, end])
    .range([40, r]);


// The array points stores the points that will be passed in the radius linear scale
  var points = d3.range(start, end+0.001, (end - start) / 250);

// Spiral generator:
// .curve(d3.curveLinear) --> straight line between points
// .angle(theta) --> it takes the point of the array of points and define the angle
// .radius(radius) --> pass the point into the radius scale
  var spiral = d3.radialLine()
    .curve(d3.curveLinear)
    .angle(theta)
    .radius(radius);

// Creation of the SVG
  var svg = d3.select(parentDiv).append("svg")
    .attr("width", width + margin.right + margin.left)
    .attr("height", height + margin.left + margin.right)

// Append the group that will contain all the rect and the spiral
  var container = svg.append("g")
    .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')')
    .append("g");

//Draw the spiral with the points using the spiral generator called "spiral"
  var path = container.append("path")
    .datum(points)
    .attr("id", "spiral")
    .attr("d", spiral)
    .style("fill", "none")
    .style("stroke", "steelblue");
    // console.log(path);

// Variable used to compute the barWidth = length of the spiral/number of day in a year (-1 to keep space between bars)
  var spiralLength = path._groups[0][0].getTotalLength();
  //  console.log("spiralLength:" + spiralLength);
  var N = 365;
  var barWidth = (spiralLength / N) - 1;

// Time scale to set the position of each bar with respect to their timestamp
  var timeScale = d3.scaleTime()
   .domain([0, 365])
   .range([0, spiralLength]);

// yScale for the bar height
  var yScale = d3.scaleLinear()
   .domain([minValue, maxValue])
   .range([1, (r / numSpirals)-20]);


// Draw the graph
   container.selectAll("rect")
  .data(nest)
  .enter()
  .selectAll("dsjflkdsaéj")
  .data(function (d,i){
    return nest[i].values;
  })
  .enter()
  .append("rect")
  .attr("class", "rectDay")
  .attr("x", function(d,i){

    //Get the path to compute later the distance between a point from the beginning of the path
      newPath = path._groups[0][0];
      var linePer = timeScale(getNthDayOfYear(d.value.timestamp));


    // Compute the position on the path and the angle to append the rect
      posOnLine = newPath.getPointAtLength(linePer),
      angleOnLine = newPath.getPointAtLength(linePer - barWidth);

    // Store the result directly in the object
      d.linePer = linePer;
      d.x = posOnLine.x;
      d.y = posOnLine.y;
      d.a = (Math.atan2(angleOnLine.y, angleOnLine.x) * 180 / Math.PI) - 90; //angle at the spiral position
      return d.x;
      })

  .attr("y", function(d){
    return d.y;
  })
  .attr("width", function(d){
    return barWidth;
  })
  .attr("height", function(d){
    return yScale(d.value.value);
  })
  .attr("time", function(d){var month = ((new Date(d.value.timestamp).getMonth() + 1) < 10) ? '0' + (new Date(d.value.timestamp).getMonth() + 1) : (new Date(d.value.timestamp).getMonth() + 1);
    return new Date(d.value.timestamp).getFullYear()+":"+month+":"+new Date(d.value.timestamp).getDate()})

  .attr("value", d=>Math.round(d.value.value * 100) / 100)
  .style("fill", function(d){return color(new Date(d.value.timestamp).getMonth());})
  .style("stroke", "none")
  .attr("transform", function(d){
    return "rotate(" + d.a + "," + d.x  + "," + d.y + ")"; // rotate the bar
  });


// Array of month to make correspond index 0 to January, 1 to February ... 11 to December
  var year=["January","February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

  svg.append("g")
    .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')')
    .selectAll("text")
    .data(nest)
    .enter()
    .append("text")
    .attr("dy", 10)
    .style("text-anchor", "start")
    .style("font", "10px arial")
    .append("textPath")
    .text(function(d){
      return year[d.key];
    })
// place text along spiral
    .attr("xlink:href", "#spiral")
    .style("fill", "grey")
    .attr("startOffset", function(d){
      return ((timeScale(d.key*30 +10) / spiralLength) * 100) + "%";
    })


// Append a group that will contain all element of the caption
  caption = svg.append("g")
    .attr("class", "caption");


// Append the rectangle that will tell the length of the max value
  caption.append("rect")
    .attr('x', width- 7*barWidth)
    .attr('y', height-30-yScale(maxValue))
    .attr('width', barWidth)
    .attr('height', yScale(maxValue))
    .attr('fill', '#f4a041');

// Append the text of the maximum value
  caption.append("text")
    .attr("x", width-7*barWidth-5)
    .attr("y", height-30-yScale(maxValue)-5)
    .text(""+Math.round(maxValue*100)/100+json[0].unit.symbol+"");

// Append the rectangle that will tell the length of the average value
caption.append("rect")
    .attr('x', width - 14*barWidth)
    .attr('y', height-30-yScale(maxValue) )
    .attr('width', barWidth)
    .attr('height', function(){
      if(minValue<=0){return yScale(minValue +(maxValue-minValue)/2);}
      else{return yScale((maxValue+minValue)/2);}
    })
    .attr('fill', '#f4a041');

// Append the text of the average value
caption.append("text")
    .attr("x", width - 14*barWidth-5)
    .attr("y", height-30-yScale(maxValue)-5)
    .text(function(){
      if(minValue<=0){return (Math.round((minValue +(maxValue-minValue)/2)*100)/100).toString()+json[0].unit.symbol+"";}
      else{return (Math.round((maxValue+minValue/2)*100)/100).toString()+json[0].unit.symbol+"";}
    });

// Append the rectangle that will tell the length of the min value
  caption.append("rect")
    .attr('x', width - 21*barWidth)
    .attr('y', height-30-yScale(maxValue) )
    .attr('width', barWidth)
    .attr('height', yScale(minValue))
    .attr('fill', '#f4a041');

// Append the text of the minimum value
  caption.append("text")
    .attr("x", width - 21*barWidth - 5)
    .attr("y", height-30-yScale(maxValue) -5)
    .text(""+Math.round(minValue*100)/100+json[0].unit.symbol+"");

// Append the text containing the year of the graph
  var formatTime = d3.timeFormat(" %d %B %Y ");

  caption.append("text")
    .attr('x', width/2)
    .attr("y", height- 10)
    .style("font-weight", "bold")
    .style("text-anchor", "middle")
    .text("From: "+formatTime(new Date(json[0].values[0].timestamp)) + " To: "+formatTime(new Date(json[0].values[json[0].values.length-1].timestamp)));


// Creation of the div that will contain the information about each bar
  var tooltip = d3.select(parentDiv)
    .append('div')
    .attr('class', 'tooltip');

// One div for the date and the other for the value
  tooltip.append('div')
    .attr('class', 'date');
  tooltip.append('div')
    .attr('class', 'value');

// When the mouse is on the bar
  svg.selectAll(".rectDay")
    .on('mouseover', function(d) {
      tooltip.select('.date').html("Date: <b>" + d3.select(this).attr("time") + "</b>");
      tooltip.select('.value').html("Average of the day: <b>" + d3.select(this).attr("value") + json[0].unit.symbol+"<b>");
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
        .style("fill", function(d){return color(new Date(d.value.timestamp).getMonth());})
        .style("stroke", "none")
        tooltip.style('display', 'none');
        tooltip.style('opacity',0);
      });


// Returns the number of the day from the beginning of the year
  function getNthDayOfYear(date){
    var dateToKnow = new Date(date);
    var start = new Date(dateToKnow.getFullYear(), 0, 0);
    var diff = dateToKnow - start;
    var oneDay = 1000 * 60 * 60 * 24;
    var day = Math.floor(diff / oneDay);
    // console.log('Day of year: ' + day);
    return day;
  }

}


/*function completeMonthNest2:
  nest: the nest obtained from the json given by the BBdata REST interface
  Description: Complete the month of the give nest
*/
function completeMonthNest2(nest){

  var test = JSON.parse(JSON.stringify(nest));
  var array=[];

  for(var i=0; i<12; i++){
    var toAdd={};
    toAdd["key"]=i;
    toAdd["values"]=[];

    for(var j=0; j<test.length; j++){
      if(parseInt(test[j].key) == i){
        toAdd["values"]= test[i].values;
      }
      else{
        continue;
      }
    }
    array.push(toAdd);
  }
  return array;

}
