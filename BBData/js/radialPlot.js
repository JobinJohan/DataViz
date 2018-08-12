/*Author: Johan Jobin, University of Fribourg 2018
Inspired from: https://bl.ocks.org/arpitnarechania/027e163073864ef2ac4ceb5c2c0bf616
Description: Draw a RadialPlot for all values given in the json file
*/


/*function radialPlot:
  json: the json data
  width: width of the SVG
  height: height of the SVG
  id: id of the SVG
  parentDiv: id ot the div containing the SVG in order to append it in the SVG
  Description: Draw a radialPlot: each circle corresponds to an entire day.
*/
function radialPlot(jsonTrue, width, height, id, parentDiv){

// If there already is a svg in the parentDiv, remove it
  d3.select(parentDiv).selectAll("svg").remove();
  json =JSON.parse(JSON.stringify(jsonTrue));
  console.log(json);

  var allValuesY=[];
  var allValuesX=[];
  for(var sensors in json){
      for(var measure in json[sensors].values){
        json[sensors].values[measure].cat= parseInt(sensors)+1;
        json[sensors].values[measure].id = json[sensors].objectId;
        allValuesX.push(json[sensors].values[measure].timestamp);
        allValuesY.push(parseFloat(json[sensors].values[measure].value));
    }
  }

  var maxDate= d3.max(allValuesX);
  var minDate= d3.min(allValuesX);
  var max = d3.max(allValuesY);
  var min = d3.min(allValuesY);
  var median = arr.median(allValuesY);
  var mean = d3.mean(allValuesY);

  test=[]
  var numberOfSensors=0;


//  Reorganize the json file in a more convenient way: store all data for each day
  for(sensors in json){
    test[sensors]= d3.nest()
      .key(function(d){return new Date(d.timestamp).getDate()})
      .entries(json[sensors].values);
  }


  maxLength = d3.max(test, function(d){
    return d.length;
  });
  // console.log(maxLength);

  var indexOfMax=0;
  for(elem in test){
    if(test[elem].length==maxLength){
      indexOfMax=elem;
    }
  }

  var allMeasureOfDay= Array.from(Array(maxLength), () => new Array());
  // console.log(allMeasureOfDay);
  for(sensors in test){
    for(day in test[sensors]){
      for(measure in test[sensors][day].values){
        // console.log(day);
        allMeasureOfDay[day].push(test[sensors][day].values[measure]);
      }
    }
  }

  var test2=[[]];
  for(day in allMeasureOfDay){
    var merge={};
    merge["key"]= test[indexOfMax][day].key
    merge["values"]= allMeasureOfDay[day];
    test2[0].push(merge);
  }

  var nest=test2[0];

// Definition of the variables to define size, margins and constants
  var margin = {top: 60, right: 250, bottom: 60, left: 90};
  var innerWidth = width - margin.left - margin.right;
  var innerHeight = height - margin.top - margin.bottom;
  const PI = Math.PI;
  var indexOfCircle=0;

// If the chosen dimensions are too little
  if(innerWidth<=0||innerHeight<=0){
    var svg = d3.select(parentDiv)
      .append("svg")
      .attr("id",id)
      .attr('viewBox','0,0,'+width+','+height+'');

    svg.append("text")
      .attr('transform', 'translate(' + (innerWidth / 2)+ ',' + (innerHeight / 2)+ ')')
      .text("Width or height too little");
      return;
  }

  newNest =sampleDataRadial(nest, innerWidth, innerHeight);

// If there aren't any data available
  if(newNest.length == 0){
    var svg = d3.select(parentDiv)
      .append("svg")
      .attr("id",id)
      .attr('viewBox','0,0,'+width+','+height+'');

    svg.append("text")
    .attr('transform', 'translate(' + (innerWidth / 2)+ ',' + (innerHeight / 2)+ ')')
    .text("No data available, try with another interval of time");
    return;
  }

  // If the user requested more than a week
  if(newNest.length > 7){
    var svg = d3.select(parentDiv)
      .append("svg")
      .attr("id",id)
      .attr("class", "deleteAll")
      .attr('viewBox','0,0,'+width+','+height+'');

    svg.append("text")
    .attr('transform', 'translate(' + (innerWidth / 2)+ ',' + (innerHeight / 2)+ ')')
    .text("Maximal interval of time: 7 days. Try with another interval of time");
    return;
  }


// Create the path with x=0, y=0, and a radius corresponding to the min (innerWidth/2, innerHeight/2)
  var circle=circleGen()
   .x(0)
   .y(0)
   .r(i=> 30 + (Math.min(innerWidth/newNest.length, innerHeight/newNest.length)*i)/2);


// Definition of the scale for each circles: it takes the length of the circles and apply the scale.
// 86400 = number of second in a day, therefore an entire circles corresponds to 24 hours
  var timeScale = function(value, circleLength){
    var result = d3.scaleTime()
    .domain([0, 86400])
    .range([0, circleLength]);
    return result(value);
  }

// yScale for a bar height
  var yScale = d3.scaleLinear()
    .domain([-1, json.length])
    .range([0, (Math.min(innerWidth/newNest.length, innerHeight/newNest.length))/2]);


// Creation of the svg that will contain all svg elements building the graph
  var svg = d3.select(parentDiv)
    .append("svg")
    .attr("id",id)
    .attr('viewBox','0,0,'+width+','+height+'');


// Append the group that will contain all the circles
  var circles = svg.append("g")
    .attr('transform', 'translate(' + ((innerWidth / 2)+margin.left )+ ',' + ((innerHeight / 2)+margin.top) + ')')
    .selectAll("hello")
    .data(newNest)
    .enter()
    .append("g");


// Draw all circles in the previous group
  circles.append("path")
    .attr("d", (d, i)=>circle(i))
    // .attr("r", (d,i)=> 20 + (Math.min(innerWidth/nest.length, innerHeight/nest.length)*i)/2)
    .attr("stroke","black")
    .attr("stroke-width", "3px")
    .attr("fill", "none")
    .attr("key", d=>d.key);

    let scale = d3.scaleLinear()
    .domain([0, 86400])
    .range([0, 2 * PI]);


// Radius of the lines that divide the day
  chartRadius = 30 + (Math.min(innerWidth/newNest.length, innerHeight/newNest.length)*newNest.length)/2

// Used to split the day in 8 parts of  3 hours each
  ticks=[0, 10800, 21600,32400, 43200, 54000, 64800, 75600]

// Append a group that will contain the line and a group for each line
  let axialAxis = svg.append('g')
    .attr('transform', 'translate(' + ((innerWidth / 2)+margin.left )+ ',' + ((innerHeight / 2)+margin.top) + ')')
    .attr('class', 'a axis')
    .selectAll('bonjour')
    .data(ticks)
    .enter().append('g')
    .attr('transform', d => 'rotate(' + (rad2deg(scale(d)) - 90) + ')');

// Append the line with his properties
  axialAxis.append('line')
    .attr('x2', chartRadius)
    .attr("stroke-width", 1)
    .attr("stroke", "lightgrey")
    .attr('stroke-opacity', '0.7')
    .attr('shape-rendering', 'crispEdges');

// At the end of each line, append the corresponding time value (i.e the tick the line represents)
  axialAxis.append('text')
    .attr('x', chartRadius + 20)
    .style('text-anchor', d => (scale(d) >= PI && scale(d) < 2 * PI ? 'end' : null))
    .attr('transform', d => 'rotate(' + (90 - rad2deg(scale(d))) + ',' + (chartRadius + 10) + ',0)')
    .text(d => d/3600 + ":00");


// Draw a bar for all value of each day
  var drawBars= circles.selectAll("hel")
    .data((d,i)=>newNest[i].values)
    .enter()
    .append("rect")
    .attr("x", function(d,i){
      // get the path element corresponding to a circle (indexOfCircle is incremented to choose from the inner circle to the outer circle)
      path = circles._groups[0][indexOfCircle].firstChild;

      // Variable used to compute the barWidth
      var circleLength = path.getTotalLength();

      // N = 365;
      // barWidth = (circleLength / N);
      if(nest[indexOfCircle].values.length>circleLength){
        barWidth = (circleLength / nest[indexOfCircle].values.length);
      }

      else{
        barWidth = 2;
      }


      // If i is the last value (i.e the last bar of the circle), increment the indexOfCircle such that next loop
      // the bars are appended to the outer circle
      if(i==newNest[indexOfCircle].values.length-1){indexOfCircle+=1}

      // Compute the distance with respect to the timeScale
      var linePer = timeScale((new Date(d.timestamp).getSeconds()+new Date(d.timestamp).getMinutes()*60 + new Date(d.timestamp).getHours()*60*60), circleLength);

      // Compute the distance on the circle from the beginning of the path
      var posOnLine = path.getPointAtLength(linePer);

      // Compute angle
      var angleOnLine = path.getPointAtLength(linePer - barWidth);

      // Add linePer, x, y and a attribute to the passed object
      d.linePer = linePer; // % distance are on the spiral
      d.x = posOnLine.x; // x postion on the spiral
      d.y = posOnLine.y; // y position on the spiral
      d.a = (Math.atan2(angleOnLine.y, angleOnLine.x) * 180 / Math.PI) - 90; //angle at the spiral position

      return d.x;
      })

// Y attribute of the rect
  .attr("y", function(d){
    return d.y;
  })

// Width attribute of the rect
  .attr("width", function(d){
    return barWidth;
  })
// Height attribute of the rect
  .attr("height", function(d){
    return yScale(d.cat);
  })
  .attr("time", d=>d.timestamp)
  .attr("value", d=>d.value)
  .attr("id", d=>d.id)
  // Fade (Dark red = hot <-> Blue = cold )
  .style("fill", d=>fade(d.value))
  .style("stroke", "none")
  .attr("transform", function(d){
    return "rotate(" + d.a + "," + d.x  + "," + d.y + ")"; // rotate the bar
  });


// Creation of the div that will contain the information about each bar
  var tooltip = d3.select(parentDiv)
    .append('div')
    .attr('class', 'tooltip');

// One div for the date and the other for the value
  tooltip.append('div')
    .attr('class', 'date');
  tooltip.append('div')
    .attr('class', 'value');
    tooltip.append('div')
      .attr('class', 'sensorId');

// When the mouse is on the bar
  svg.selectAll("rect")
    .on('mouseover', function(d) {
      tooltip.select('.date').html("Date: <b>" + d3.select(this).attr("time") + "</b>");
      tooltip.select('.value').html("Value: <b>" + d3.select(this).attr("value") +json[0].unit.symbol+ "<b>");
      tooltip.select('.sensorId').html("Id: <b>" + d3.select(this).attr("id") +"<b>");

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
        .style("fill", d=>fade(d.value))
        .style("stroke", "none")
        tooltip.style('display', 'none');
        tooltip.style('opacity',0);
    });



/*function rad2deg:
  angle: angle in radian
  Description:  Function to convert an angle in radian to degrees
*/
  function rad2deg(angle) {
    return angle * 180 / PI;
  }


/*function fade:
    value: value of the measure you want to convert to a color
    Description:  Function to create a gradient from blue to red
*/
  function fade(value){
  // Get the button for choosing scale
    var radiosInFade = document.getElementsByName('scaleRadialPlot');
    // If median scale is chosen
    if(radiosInFade[1].checked||radiosInFade[0]=="undefined"&& radiosInFade[1]=="undefined"){
      var test = d3.scaleLinear()
        .domain([min, median, max])
        .range([1, 0.5, 0]);
      return d3.interpolateRdBu(test(value));
    }
    // If mean scale is chosen
    else{
      var test = d3.scaleLinear()
        .domain([min, mean, max])
        .range([1,0.5,0]);
    return d3.interpolateRdBu(test(value));
    }
}

/*function sampleDataRadial:
    nest: value of the measure you want to convert to a color
    innerWidth: width that will be used to compute the maximum number of values it is necessary to keep
    innerHeight: Used to compute the length of the path
    Description:  Function to sample data if there are too many
*/
  function sampleDataRadial(nest, innerWidth, innerHeight){

    var jsonSample = JSON.parse(JSON.stringify(nest));
    for(var sensors in jsonSample){
      pathLength= 2* PI * (30 + (Math.min(innerWidth/jsonSample.length, innerHeight/jsonSample.length)*sensors)/2)
      var numberPerBucket= Math.ceil(jsonSample[sensors].values.length/pathLength);

    // If the number of data is smaller than the length of path
      if(jsonSample[sensors].values.length<pathLength){
        continue;
      }
      else{
        var toKeep={};
        var array=[];
        // We keep 1 value on 'numberPerBucket' values
        for(var j=0; j<jsonSample[sensors].values.length; j+=numberPerBucket){
          array.push(jsonSample[sensors].values[j]);
        }
      toKeep= array;
      jsonSample[sensors].values= toKeep;
      }
    }
    return jsonSample;
   }

// Scale for the bars
  var formatTime = d3.timeFormat(" %d %B %Y ");
  var radios = document.getElementsByName('scaleRadialPlot');
  if(radios[1].checked||radios[0]=="undefined"&&radios[1]=="undefined"){
    var color = d3.scaleLinear()
      .domain([min, median, max])
      .range([1, 0.5, 0]);
  var textScale= "Median: "+Math.round(median*100)/100 + json[0].unit.symbol;
  var choiceScale= median;
  }
  else{
    var color = d3.scaleLinear()
      .domain([min, mean, max])
      .range([1,0.5,0]);
    var choiceScale=mean;
    var textScale= "Mean: "+Math.round(mean*100)/100 + json[0].unit.symbol;
  }

// Scale for the caption
scaleRectCaption = d3.scaleLinear()
  .domain([min,max])
  .range([0, innerHeight]);


// Append a group that will contain all element of the caption
  caption = svg.append("g")
    .attr("class", "caption");

// Append the maximum value
  caption.append("text")
    .attr("x", innerWidth+margin.left+(margin.right/2))
    .attr("y", margin.top + scaleRectCaption(max)+10)
    .text("Max: "+Math.round(max*100)/100 + json[0].unit.symbol);

// Append the average value
  caption.append("text")
    .attr("x", innerWidth+margin.left+(margin.right/2)+10)
    .attr("y", margin.top + scaleRectCaption(choiceScale))
    .text(textScale);

// Append the minimum value
  caption.append("text")
    .attr("x", innerWidth+margin.left+(margin.right/2))
    .attr("y", margin.top + scaleRectCaption(min) )
    .text("Min: "+Math.round(min*100)/100 + json[0].unit.symbol);

  caption.append("text")
  .attr("x",margin.left)
  .attr("y", innerHeight+margin.top +(margin.bottom/2))
  .text("From: "+formatTime(new Date(minDate)) + " To: "+formatTime(new Date(maxDate)));

// Creation of an array containing all points between min and max with an interval of 0.1. It is used to draw the gradient
  var colourRangeYGB = d3.range(min, max, (max-min)/1000);



// Creation of the gradient
var defs = svg.append("defs");

// Vertical Gradient
var gradient = defs.append("linearGradient")
   .attr("id", "svgGradient")
   .attr("x1", "0%")
   .attr("x2", "0%")
   .attr("y1", "0%")
   .attr("y2", "100%")
   .selectAll("stop")
   .data(colourRangeYGB)
	 .enter().append("stop")
	 .attr("offset", function(d,i) {return i/(colourRangeYGB.length-1); })
	 .attr("stop-color", function(d) { return d3.interpolateRdBu(color(d)); });

// Append the rectangle that will contain the gradient
  caption.append("rect")
    .attr('x', innerWidth+margin.left+(margin.right/2))
    .attr('y', margin.top )
    .attr('width', "10px")
    .attr('height', innerHeight)
    .attr("fill", "url(#svgGradient)");

}
