/* Author: Johan Jobin
   Inspired from: https://bl.ocks.org/danbjoseph/3f42bb3f0ab6133cfc192e878c9030ed
   Draw a calendar heat map
*/


/*function calendarHeatMap:
  json: the json data
  width: width of the SVG
  height: height of the SVG
  id: id of the SVG
  parentDiv: id ot the div containing the SVG in order to append it in the SVG
  Description: Draw a chartLine
*/
function calendarHeatMap(json, width, height, id, parentDiv){
  d3.select(parentDiv).selectAll("svg").remove();
  // console.log(json);

// Variables to define the format desired to print the date
  var formatTime = d3.timeFormat(" %d %B %Y ");
  var day = d3.timeFormat("%w");
  var week = d3.timeFormat("%W");
  var format = d3.timeFormat("%Y-%m-%d");
  var titleFormat = d3.utcFormat("%a, %d-%b");
  var monthName = d3.timeFormat("%B");
  var dayName = d3.timeFormat("%a");

// Array used to shift the y position of the rectange for each day because initially sunday is index 0, here sunday is index 6, monday is 0 etc..
  dayPosition =[6,0,1,2,3,4,5];

// variable to define the margins of the svg
  var margin = {top: 5, right: 100, bottom: 5, left: 100};
  var innerWidth = width - margin.left - margin.right;
  var innerHeight = height - margin.top - margin.bottom;

// Push all values in an array
  var allValues=[];
    for(var sensors in json){
      for(var measure in json[sensors].values){
        allValues.push(json[sensors].values[measure]);
      }
    }


// reorganize the json file in a more convenient way: store all data for each year, each month and compute the mean for each day
  var nestBeforeCompletion = d3.nest()
    .key(function(d){return new Date(d.timestamp).getFullYear()})
    .key(function(d){return new Date(d.timestamp).getMonth()})
    .key(function(d){return new Date(d.timestamp).getDate()})
    .rollup(function(v){
      toReturn={};
      toReturn["timestamp"]=v[0].timestamp;
      toReturn["value"]= d3.mean(v, function(v){return v.value});
      return toReturn;})
     //.rollup(function(v){return v[0].timestamp})
    .entries(allValues);

  console.log(nestBeforeCompletion);

// If there is no data, don't display any graph but tell the user that the data is empty
  if(nestBeforeCompletion.length==0){
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
  // if(nestBeforeCompletion[0].values.length>12){
  //   var svg = d3.select(parentDiv)
  //     .append("svg")
  //     .attr("id",id)
  //     .attr("class", "deleteAll")
  //     .attr("width", width)
  //     .attr("height", height);
  //
  //   svg.append("text")
  //   .attr('transform', 'translate(' + (innerWidth / 2)+ ',' + (innerHeight / 2)+ ')')
  //   .text("Maximum interval: 1 year. Try with another interval");
  //   return;
  // }



// Complete the month in order to have a complete JSON such that all days with no value are drawn in black
  nest = completeMonthNest(nestBeforeCompletion);

  var allValuesMean=[];
    for(var month in nest[0].values){
      for(var measure in nest[0].values[month].values){
        allValuesMean.push(nest[0].values[month].values[measure].value.value);
      }
    }

    // Max and min for scales
      var maxValue = d3.max(allValuesMean);
      var minValue = d3.min(allValuesMean);
      var mean = d3.mean(allValuesMean);
      var median = arr.median(allValuesMean);

      console.log(median);
      console.log(mean);


// Compute the number of week during the month
  var calendarRows = function(month) {
    var m = d3.timeMonth.floor(month);
    return d3.timeWeeks(d3.timeWeek.floor(m), d3.timeMonth.offset(m,1)).length;
  }



// Compute the max and min for the scales
  var minDate= new Date();
  minDate.setFullYear(nest[0].key);
  minDate.setMonth("0");
  minDate.setDate("1");
  minDate.setUTCHours("5");
  minDate.setUTCMinutes("0");
  // console.log(minDate);

  var maxDate= new Date();
  maxDate.setFullYear(nest[0].key);
  maxDate.setMonth("10");
  maxDate.setDate("31");
  maxDate.setUTCHours("23");
  maxDate.setUTCMinutes("59");
  // console.log(maxDate);

  var radiosCalendar = document.getElementsByName('scaleCalendar');

  if(radiosCalendar[1].checked||radiosCalendar[0]=="undefined"&& radiosCalendar[1]=="undefined"){
    // Scale used to color each rect
      scale = d3.scaleLinear()
     .domain([maxValue,median,minValue])
     .range([0,0.5,1]);
     var choice = median;
  }
  else{
    // Scale used to color each rect
      scale = d3.scaleLinear()
     .domain([maxValue,mean,minValue])
     .range([0,0.5,1]);
     var choice = mean;
  }

 // console.log(minDate);
 // console.log(maxDate);


// Margin between each day in the calendar
 var cellMargin = 2;
 var cellSize = (innerWidth-cellMargin*96)/84;


// Return an array containing the last day of each month
 months= d3.timeMonth.range(d3.timeMonth.floor(minDate), maxDate);
 // console.log(months);


// Creation of the svg that will contain all svg elements building the graph
  var svg1 = d3.select(parentDiv)
    .append("svg")
    .attr("id",id)
    .attr("class","deleteAll")
    .attr('viewBox','0,0,'+width+','+height+'');

var days =["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  svg1.append("g")
  .attr('transform', 'translate('+(margin.left-35)+','+(innerHeight / 2 +20)+')')
  .selectAll("DayName")
  .data([0,1,2,3,4,5,6])
  .enter()
  .append("text")
  .attr("x",0)
  .attr("y", function(d){ return (d * cellSize) + (d * cellMargin) + cellMargin; })
  .text(function(d){return days[d]});

// For each month append a svg
  svg = svg1.append("g")
    .selectAll("months")
    .data(months)
    .enter().append("svg")
    .attr('transform', 'translate('+margin.left+','+0+')')
    .append("g")
    .attr('transform', function(d,i){return 'translate(' +((cellSize * 7) + (cellMargin * 8))*i + ',' + innerHeight / 2 + ')' } )
    .attr("class", "month")
    .attr("width", (cellSize * 7) + (cellMargin * 8) )
    .attr("height", function(d) {
      var rows = calendarRows(d);
      return (cellSize * rows) + (cellMargin * (rows + 1)) + 20; // the 20 is for the month labels
    })
    .append("g");

// Append the name of the month over all rect of each month
  svg.append("text")
    .attr("class", "month-name")
    .attr("x", ((cellSize * 7) + (cellMargin * 8)) / 2 )
    .attr("y", 0)
    .attr("text-anchor", "middle")
    .style("font-weight", "bold")
    .text(function(d) {return monthName(d); })

// Append the year on the right of the calendar
  svg1.append("text")
    .attr("class", "year-name")
    .attr("x", 0)
    .attr("y", innerHeight/2+4*cellSize+3*cellMargin)
    .style("font-weight", "bold")
    .text(nest[0].key);

// Append a group that will contain all element of the caption
  caption = svg1.append("g")
    .attr("class", "caption");

// Scale used to fix the position of the text elements
  var rectScale = d3.scaleLinear().domain([minValue,maxValue]).range([0,(cellSize * 7) + (cellMargin * 8)])

// Append the maximum value
  caption.append("text")
    .attr("x", innerWidth+margin.left+ 11*cellMargin)
    .attr("y", innerHeight/2+rectScale(maxValue))
    .text(Math.round(maxValue*100)/100 + json[0].unit.symbol);

// Append the average value
  console.log(minValue);
  console.log(maxValue);
  console.log(Math.round((minValue+maxValue)*100/2)/100);
  console.log(mean);
  caption.append("text")
    .attr("x", innerWidth+margin.left+ 11*cellMargin)
    .attr("y", innerHeight/2 + rectScale(choice))
    .text(Math.round(choice*100)/100 + json[0].unit.symbol);

// Append the minimum value
  caption.append("text")
    .attr("x", innerWidth+margin.left+11*cellMargin)
    .attr("y",innerHeight/2+ rectScale(minValue))
    .text(Math.round(minValue*100)/100 + json[0].unit.symbol);

// Creation of an array containing all points between min and max with an interval of 0.1. It is used to draw the gradient
  var colourRangeYGB = d3.range(minValue, maxValue, 0.001);

// Creation of the gradient
var defs = svg1.append("defs");

// Vertical Gradient
var gradient = defs.append("linearGradient")
   .attr("id", "svgGradientCalendar")
   .attr("x1", "0%")
   .attr("x2", "0%")
   .attr("y1", "0%")
   .attr("y2", "100%")
   .selectAll("stop")
   .data(colourRangeYGB)
	 .enter().append("stop")
	 .attr("offset", function(d,i) { return i/(colourRangeYGB.length-1); })
	 .attr("stop-color", function(d) { return d3.interpolateRdBu(scale(d)); });

// Append the rectangle that will contain the gradient
  caption.append("rect")
    .attr('x', innerWidth+margin.left+ 5*cellMargin)
    .attr('y', innerHeight/2 )
    .attr('width', 5*cellMargin)
    .attr('height', (cellSize * 7) + (cellMargin * 8))
    // .attr("fill","red");
    .attr("fill", "url(#svgGradientCalendar)");

// Append a little square to explain that black square are used to express the fact that there is no data available
  blackSquare= svg1.append("g")
    .attr("class", "blackSquare");

  blackSquare.append("rect")
    .attr("x",innerWidth+margin.left- 5*cellMargin - 15*cellSize)
    .attr("y",(innerHeight/2)+(cellSize * 8) + (cellMargin * 8))
    .attr("width", cellSize)
    .attr("height",cellSize)
    .attr("fill", "black");


  blackSquare.append("text")
     .attr("x",innerWidth+margin.left- 5*cellMargin - 13*cellSize)
     .attr("y", (innerHeight/2)+(cellSize * 9) + (cellMargin * 8))
     .text(" = No data for this day");


// Horizontal heat map: append a rectangle for each day
    // var rect = svg.selectAll("rect.day")
    // .data(function(d, i) {
    //   // console.log(d)
    //   // console.log(d3.timeDays(d, new Date(d.getFullYear(), d.getMonth()+1, 1)));
    //   return d3.timeDays(d, new Date(d.getFullYear(), d.getMonth()+1, 1));
    // })
    // .enter().append("rect")
    //   .attr("class", "day")
    //   .attr("width", cellSize)
    //   .attr("height", cellSize)
    //   .attr("rx", 3).attr("ry", 3) // rounded corners
    //   .attr("fill", '#eaeaea') // default light grey fill
    //   .attr("time", d=>d)
    //   .attr("x", function(d) {
    //     return (day(d) * cellSize) + (day(d) * cellMargin) + cellMargin;
    //   })
    //   .attr("y", function(d) {
    //     return ((week(d) - week(new Date(d.getFullYear(),d.getMonth(),1))) * cellSize) +
    //            ((week(d) - week(new Date(d.getFullYear(),d.getMonth(),1))) * cellMargin) +
    //            cellMargin + 20;
    //    })
    //  .datum(format);


// Vertical Heat Map: append a rectangle for each day
    var rect = svg.selectAll("rect.day")
    .data(function(d, i) {
      // console.log(d)
      // console.log(d3.timeDays(d, new Date(d.getFullYear(), d.getMonth()+1, 1)));
      return d3.timeDays(d, new Date(d.getFullYear(), d.getMonth()+1, 1));
    })
    .enter().append("rect")
      .attr("class", "day")
      .attr("width", cellSize)
      .attr("height", cellSize)
      .attr("rx", 3).attr("ry", 3) // rounded corners
      .attr("fill", '#eaeaea') // default light grey fill
      .attr("time", d=>d)
      .attr("transform", "translate(0, 10)")
      .attr("y", function(d) { return (dayPosition[day(d)] * cellSize) + (dayPosition[day(d)] * cellMargin) + cellMargin; })
      .attr("x", function(d) { return ((week(d) - week(new Date(d.getFullYear(),d.getMonth(),1))) * cellSize) + ((week(d) - week(new Date(d.getFullYear(),d.getMonth(),1))) * cellMargin) + cellMargin ; })
     .datum(format);

// Creation of the div that will contain the information about each bar
  var tooltip = d3.select(parentDiv)
    .append('div')
    .attr('class', 'tooltip');

// One div for the date and the other for the value
  tooltip.append('div')
    .attr('class', 'date');
  tooltip.append('div')
    .attr('class', 'value');

// When the mouse is on a rect (i.e a day in the calendar)
  svg.selectAll("rect")
    .on('mouseover', function(d) {
      tooltip.select('.date').html("Date: <b>" + formatTime(new Date(d3.select(this).attr("time"))) + "</b>");
      tooltip.select('.value').html("Average of the day: <b>" + d3.select(this).attr("value") +json[0].unit.symbol+ "<b>");
      d3.select(this)
      .style("stroke","#000000")
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


// Define the color of each rectangle with respect to the mean of each day
  rect.style("fill", function(d) {
      d= new Date(d);
      // console.log(d);
      for(month in nest[0].values){
        if(parseInt(d.getMonth())==nest[0].values[month].key){
            for(day in nest[0].values[month].values){
              if(nest[0].values[month].values[day].key == parseInt(d.getDate())){
                d3.select(this).attr("value", Math.round(nest[0].values[month].values[day].value.value*100)/100);
                return d3.interpolateRdBu(scale(nest[0].values[month].values[day].value.value))
              }
            }
        }
      }
      return "black";
    });

}


function completeMonthNest(nest){
  var json = JSON.parse(JSON.stringify(nest));
  var array=[];
  for(var i=0; i<12; i++){
    var toAdd={};
    toAdd["key"]=i;
    toAdd["values"]=[];
    for(var j=0; j<json[0].values.length; j++){
      // console.log("i:" + i + "j:"+ json[0].values[j].key);
      if(parseInt(json[0].values[j].key) == i){
        // console.log("ALERT");
        toAdd["values"]= json[0].values[j].values;
        break;
      }
    }
    array.push(toAdd);
  }
  json[0].values= array;
  return json;
}
