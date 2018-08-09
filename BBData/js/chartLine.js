/*
Author: Johan Jobin, University of Fribourg 2018
Inspired from : http://bl.ocks.org/tompiler/24fc6c48058e575576915479c8ae8ab5
Description: Draw a lineChart with brush, zoom and statistics about each line.

Schema:

/*                 SVG Width
  --------------------------------------------------------------
  |                   margin.top                               |
  |                   ___________________________              |
  |                  |        innerWidth         |             |
  |                 |                           |              |
  | margin.left    |                innerHeight|  margin.right |  SVG Height
  |               |                           |                |
  |              |                           |                 |
  |              -----------------------------                 |
  |             margin.bottom                                  |
  |                                                            |
  |             -------------------------------                |
  |            |                               |               |
  |            |          TimeLine             |               |
  |            ---------------------------------               |
  |                                                            |
  --------------------------------------------------------------

*/

/*function chartLine:
  json: the json data
  width: width of the SVG
  height: height of the SVG
  id: id of the SVG
  parentDiv: id ot the div containing the SVG in order to append it in the SVG
  Description: Draw a chartLine
*/
function chartLine(json, width, height, id, parentDiv){

  console.log(json);

// If there already is a svg in the parentDiv, remove it
    d3.select(parentDiv).selectAll("svg").remove();

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

// Creation of the SVG
const svg = d3.select(parentDiv)
  .append('svg')
  .attr('id', id)
  .attr("class", "deleteAll")
  .attr('viewBox','0,0,'+width+','+height+'');


// Position of the two differents graphs (main graph and TimeLine) in svg
    var margin = {top: 20, right: 300, bottom: 130, left: 80};
    var marginTimeLine = {top:430, right:300, bottom: 30, left:80};
    var innerWidth = width - margin.left - margin.right;
    var innerHeight = height - margin.top - margin.bottom;
    heightTimeLine= height- marginTimeLine.top-marginTimeLine.bottom;


// Ordinal Scale for line coloring
    const color = d3.scaleOrdinal(d3.schemeCategory10);


/* Store information about each line of the graph: index[i] = infos about ith sensor*/
    var allValuesX=[];
    var allValuesY=[];
    var test=[];

    for(var sensors in json){
      for(var measure in json[sensors].values){
        allValuesX.push(json[sensors].values[measure].timestamp);
        allValuesY.push(parseFloat(json[sensors].values[measure].value));
        test.push(parseFloat(json[sensors].values[measure].value));
      }
      json[sensors].unit.max=(d3.max(test));
      json[sensors].unit.min=(d3.min(test));
      json[sensors].unit.mean=(arr.mean(test));
      json[sensors].unit.median=(arr.median(test));
      json[sensors].unit.mode=(arr.modes(test));
      json[sensors].unit.variance=(arr.variance(test));
      json[sensors].unit.standardDeviation=(arr.standardDeviation(test));
      test.length=0;
    }

    var maxValueX = d3.max(allValuesX);
    var minValueX = d3.min(allValuesX);
    var maxValueY = d3.max(allValuesY);
    var minValueY = d3.min(allValuesY);

// Sample the array with two algorithm (see below) in order to speed up the drawing process
  sampleArray = sampleModeMedian(json, innerWidth, minValueY, maxValueY);
  console.log(sampleArray);

// X axis  --> scaletime --> creation of date
    var minDate= new Date(minValueX);
    var maxDate= new Date(maxValueX);

// X axis  of the first graph
    var xScale = d3.scaleTime().domain([minDate,maxDate]).range([0, innerWidth]);

// X axis of the timeline
    var xScaleTimeLine = d3.scaleTime().domain(xScale.domain()).range([0, innerWidth]);

// Linear scale for y axis of the first graph
    var yScale = d3.scaleLinear().domain([minValueY-5,maxValueY+5]).range([innerHeight,0]);

// Linear scale of the y axis of the timeline
    var yScaleTimeLine= d3.scaleLinear().domain(yScale.domain()).range([heightTimeLine,0]);

// Creation of the X axes
    var xAxis = d3.axisBottom().scale(xScale)
    var xAxisTimeLine=d3.axisBottom().scale(xScaleTimeLine);

// Creation of the Y axes
    var yAxis = d3.axisLeft().scale(yScale)

/* Creation of the brush of the timeline: we give two coordonates to draw the rectangle
   and add a eventListener called brushed end
*/
    var brush = d3.brushX()
              .extent([[0, 0], [innerWidth, heightTimeLine]])
              .on("brush end", brushed);

// Implementation of the zoom
    var zoom = d3.zoom()
      .scaleExtent([1, Infinity])
      .translateExtent([[0, 0], [innerWidth, innerHeight]])
      .extent([[0,0], [innerWidth, innerHeight]])
      .on("zoom", zoomed);

// linerGenerator for th main graph: positioning the x and y coordonate with respect to xScale and yScale
    const lineFn = d3.line()
      .x(d => xScale(new Date(d.timestamp)))
      .y(d => yScale(d.value))

// linerGenerator for timeLine: positioning the x and y coordonate with respect to xScaleTimeLine and yScaleTimeLine
    const lineTimeLine =d3.line()
      .x(d=> xScaleTimeLine(new Date(d.timestamp)))
      .y(d=> yScaleTimeLine(d.value));

// Define a clipPath: it allows to define the area in which the zoom will be used.
    var clip = svg.append("defs").append("svg:clipPath")
      .attr("id", "clipChartLine")
      .append("svg:rect")
      .attr("width", innerWidth)
      .attr("height", innerHeight)
      .attr("x", 0)
      .attr("y", 0);

// Create a rect that will be used to capture the zoom event
    svg.append("rect")
      .attr("class", "zoom")
      .attr("width", innerWidth)
      .attr("height", innerHeight)
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .call(zoom);

// Create a groupe that will contain all the lines
    var Line_chart = svg
      .append("g")
      .attr("class", "focus")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .attr("clip-path", "url(#clipChartLine)")
      .selectAll("bouh").data(sampleArray)
      .enter();


// Draw of all lines of all sensors
    Line_chart.append("path")
      .style('stroke', (d,i)=>color(i))
      .style("stroke-width", "1")
      .attr("objectId", d=>d.objectId)
      .attr("name", d=>d.unit.name)
      .attr("symbol", d=>d.unit.symbol)
      .attr("type", d=>d.unit.type)
      .attr("min", d=>d.min)
      .attr("max", d=>d.max)
      .attr("mean", d=>d.mean)
      .attr("median", d=>d.median)
      .attr("mode", d=>d.mode)
      .attr('variance', d=>d.variance)
      .attr('standardDeviation', d=>d.standardDeviation)
      .datum(d=>d.values)
      .attr("class", "line")
      .attr('d', lineFn)
      .style("fill", "none")
      .on("mouseover", showInfo)
      .on("mouseout", hide);

// Y-axis label
  svg.append("g")
      .append("text")
      .attr('transform', "translate("+((margin.left/2)-5)+","+innerHeight/2+")rotate(-90)")
      .text(json[0].unit.name);

// X-axis label
  svg.append("g")
      .append("text")
      .attr('transform', "translate("+((margin.left + width-margin.right)/2)+","+((innerHeight+margin.top+marginTimeLine.top)/2)+")")
      .text("Time");


// Append a group that will contain the axes
  var focus = svg.append("g")
     .attr("class", "focus")
     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Append X-axis and Y-axis
  focus.append("g").attr("class","axis axis--y").call(yAxis);
  focus.append("g").attr("class","axis axis--x grid").attr("transform", "translate(0,"+(innerHeight)+")").call(xAxis.tickSize(-height)) .selectAll(".grid line")
    .attr("stroke", "lightgrey")
    .attr('stroke-opacity', '0.7')
    .attr('shape-rendering', 'crispEdges');

//Create the group called context that will contain the lines for the timeline
  var context = svg
    .append("g")
    .attr("class", "context")
    .attr("transform", "translate(" + marginTimeLine.left + "," + marginTimeLine.top + ")");

// Draw the line of the timeline
  context.selectAll('.test2')
    .data(sampleArray).enter().append("path")
    .style('stroke', (d,i) => color(i))
    .style("fill", "none")
    .datum(d=>d.values)
    .attr("class","line")
    .attr('d', lineTimeLine);

// Append X-axis (it is the only axe of the timeline)
  context.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + heightTimeLine + ")")
    .call(xAxisTimeLine);

// Append the brush created previously
  context.append("g")
    .attr("class", "brush")
    .call(brush)
    .call(brush.move, xScale.range());


// When the mouse is on a line, the function showInfo is called
  function showInfo(){

// Grow the width of the line
  d3.select(this).style('stroke-width', '3.5')
  d3.select("#informationMenu").remove();

// Create a group that will contain the infos of each line
  menu = d3.select("#"+id)
    .append("g")
    .attr('id', 'informationMenu')
    .attr('fill', d3.select(this).style("stroke"))
    .attr('font-family', 'Times New Roman');


// Append the title of the rectangle
  menu.append('text')
    .attr('x',  (width - margin.right+width)/2)
    .attr('y', margin.top +30)
    .attr('text-anchor', 'middle')
    .attr("text-decoration","underline")
    .attr("font-size", "15")
    .text("About the last selected sensor");

// Minimum value
  menu.append('text')
    .attr('x', width - margin.right+10)
    .attr('y', margin.top + 50)
    .text("Object ID: "+ d3.select(this).attr("objectId"));

// Minimum value
  menu.append('text')
    .attr('x', width - margin.right+10)
    .attr('y', margin.top + 70)
    .text("Minimum value: "+ d3.select(this).attr("min") +" " + d3.select(this).attr("symbol"));

// Maximum value
  menu.append('text')
    .attr('x', width - margin.right+10)
    .attr('y', margin.top +90)
    .text("Maximum value: "+ d3.select(this).attr("max")+ " " + d3.select(this).attr("symbol"));

// Mean
  menu.append('text')
    .attr('x', width - margin.right+10)
    .attr('y', margin.top +110)
    .text("Mean (rounded): "+ Math.round(d3.select(this).attr("mean")*100)/100 + " " + d3.select(this).attr("symbol"));

// Median value
  menu.append('text')
    .attr('x', width - margin.right+10)
    .attr('y', margin.top +130)
    .text("Median:  "+ d3.select(this).attr("median") + " " + d3.select(this).attr("symbol"));

// Mode
  menu.append('text')
    .attr('x', width - margin.right+10)
    .attr('y', margin.top +150)
    .text("Mode: "+ d3.select(this).attr("mode") + " " + d3.select(this).attr("symbol"));

// Variance
  menu.append('text')
    .attr('x', width - margin.right+10)
    .attr('y', margin.top +170)
    .text("Variance (rounded): "+ Math.round(d3.select(this).attr("variance")*100)/100 );

// Standard Deviation
  menu.append('text')
    .attr('x', width - margin.right+10)
    .attr('y', margin.top +190)
    .text("Standard Deviation (rounded): "+ Math.round(d3.select(this).attr("standardDeviation")*100)/100 );
}

// function hide is used when the mouse leaves each line to redraw the line
  function hide(){
    d3.selectAll("#informationMenu").remove();
    d3.select(this).style("stroke-width", "1");
  }


//function brushed used to move the brush
  function brushed() {

    // when a zoom event occurs, just ignore it
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return;


/* variable s contains the start and the end of the brush zone [0,580]:
either it is the selected event zone or either the standard range
*/
    var s = d3.event.selection || xScaleTimeLine.range();


// Update the scale of the main graph with the s
    xScale.domain(s.map(xScaleTimeLine.invert, xScaleTimeLine));

// Update the lines by drawing each line again
    Line_chart.selectAll(".line").attr("d", lineFn);

// Append the new xAxis because the xScale has changed (see 4 lines above)
    focus.select(".axis--x").call(xAxis.tickSize(-height)).selectAll(".grid line").attr("stroke", "lightgrey")
      .attr('stroke-opacity', '0.7')
      .attr('shape-rendering', 'crispEdges');

// Update the zoom previously created
    svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
      .scale(innerWidth / (s[1] - s[0]))
      .translate(-s[0], 0));
}

  function zoomed() {

  // When a brush event occurs, just ignore it
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return;

  // Variable t contains {k: factor of zoom x: coordonate x y: coordonate y}
    var t = d3.event.transform;

  // Update the xScale
    xScale.domain(t.rescaleX(xScaleTimeLine).domain());

  // Update the lines by drawing each of them again
    Line_chart.selectAll(".line").attr("d", lineFn);

  // Append the X-axis update with the new xScale
    focus.select(".axis--x").call(xAxis.tickSize(-height)).selectAll(".grid line")
      .attr("stroke", "lightgrey")
      .attr('stroke-opacity', '0.7')
      .attr('shape-rendering', 'crispEdges');
    context.select(".brush").call(brush.move, xScale.range().map(t.invertX, t));
  }


// End of chartLine function
}

/*function sampleDataChartLine:
  jsonOriginal: the json containing the data
  Description: This algorithm samples the data this way:
                - It deletes the same consecutive values to keep only the first and the last one of the serie
  Remark: this algorithm is less efficient than the Mode Median algorithm due to the "splice" operation that besides removing
          an element, should also change the position of all elements in the list (high complexity)
*/
function sampleDataChartLine(jsonOriginal){
  var json = JSON.parse(JSON.stringify(jsonOriginal));
  for(var sensors in json){
    for(var measure=0; measure<json[sensors].values.length; measure+=1){

      // Define the first measure as the measure of reference
      if (measure==0){
        var refValue= json[sensors].values[0].value;
        continue;
      }
      // End condition to stop the algorithm
      else if(measure == json[sensors].values.length-1){
        break;
      }

      // if that's not the first measure neither the last one
      else{
        // If the current measure is not equal to the value of reference, it becomes the new value of reference
        if(json[sensors].values[measure].value != refValue){
          refValue= json[sensors].values[measure].value;
        }
        // If the current measure is equal to the value of reference,
        else{
          // if the next value is equal to the value of reference, delete the middle value
          if(json[sensors].values[parseInt(measure)+1].value==refValue){
            json[sensors].values.splice(parseInt(measure),1);
            measure= measure-1;
          }
          else{
            continue;
          }
        }

      }
    }
  }
  return json;

}


/*function sampleModeMedian:
  jsonOriginal: the json containing the data
  threshold: number maximal of measure to keep (here we used the width in pixel)
  globalMin: minimum value in the data
  globalMax: maximun value in the data
  Description: This algorithm samples the data this way:
                - first it distributes the values in buckets of equal size
                - For each bucket, if it contains a extremum keep the extremum.
                  Otherwise compute the mode of each different value. Take the value with the biggest mode
                - If there are two or more values with the same mode, take the median of the bucket.
                - Return the json containing threshold values.
  Adapted from: https://github.com/d3fc/d3fc-sample
*/
function sampleModeMedian(jsonOriginal, threshold, globalMin, globalMax){

  var json = JSON.parse(JSON.stringify(jsonOriginal));
  var arrayToReturn = [];

  for(var sensors in json){
    var objectId= json[sensors].objectId;
    var unit = json[sensors].unit;
    var toAppend ={};
    toAppend["max"]= json[sensors].unit.max;
    toAppend["min"]= json[sensors].unit.min;
    toAppend["mean"]= json[sensors].unit.mean;
    toAppend["median"]= json[sensors].unit.median;
    toAppend["mode"]= json[sensors].unit.mode;
    toAppend["variance"]= json[sensors].unit.variance;
    toAppend["standardDeviation"]= json[sensors].unit.standardDeviation;
    toAppend["objectId"]= objectId;
    toAppend["unit"]=unit;

    // If the number of measure is < the maximal number of pixel we have, just display each data
    if(json[sensors].values.length<threshold){
      if(json[sensors].values.length==0){
        continue;
      }
      else{
        toAppend["values"]= json[sensors].values;
        arrayToReturn.push(JSON.parse(JSON.stringify(toAppend)));
      }
    }

    // Too much data, necessary to sample
    else{
      var numberPerBucket=Math.ceil(json[sensors].values.length/threshold);
      var array=[];


      //Put numberPerBucket elements in each bucket
      while(json[sensors].values.length>0){
        array.push(json[sensors].values.splice(0, numberPerBucket));
      }
      //  console.log(array);

      // For each bucket
      for(var i=0; i<array.length; ++i){
        // console.log("-----------------------------------I:"+i+"---------------------------------------------------");
        var frequencies = {};
        var z;
        var mostFrequentValue=undefined;
        var mostFrequentIndex=0;
        var singleMostFrequent = 1;

        // For each element in each bucket
        for(var j=0; j<array[i].length;++j){

          // If there is an extremum in the bucket
          if(parseInt(array[i][j].value)==parseInt(globalMin) || parseInt(array[i][j].value)==parseInt(globalMax)){
            array[i]=array[i][j];
            singleMostFrequent=3;
            break;
          }

          // Used for the first frequency of the elements that still are not in the frequencies object
          if(frequencies[array[i][j].value]===undefined){
            frequencies[array[i][j].value]=0;
            frequencies[array[i][j].value]+=1;
          }

          // If the element already is in frequencies, just increment the frequency by 1
          else{
            frequencies[array[i][j].value]+=1
          }

          if(mostFrequentValue===undefined){
            mostFrequentValue= array[i][j].value;
            z=j;
          }

          // Different conditions to define which value has the biggest frequency
          else{
            if(frequencies[mostFrequentValue]<frequencies[array[i][j].value]){
              mostFrequentValue= array[i][j].value;
              z=j;
              singleMostFrequent=1;
            }
            if(frequencies[mostFrequentValue]>frequencies[array[i][j].value]){
              singleMostFrequent=1;
            }

            if(frequencies[mostFrequentValue]==frequencies[array[i][j].value]&&mostFrequentValue==array[i][j].value){
              singleMostFrequent=1;
            }
            if(frequencies[mostFrequentValue]==frequencies[array[i][j].value]&&mostFrequentValue!=array[i][j].value){
              singleMostFrequent=0;
            }
          }


        }

        // if there is a value with the biggest mode
        if(singleMostFrequent==1){
          array[i]=array[i][z];
        }
        // if there is no value with the biggest mode
        else if(singleMostFrequent==0){
          array[i]= array[i][(Math.floor(array[i].length / 2))];
        }
      }


      toAppend["values"] = array.slice(0);
      arrayToReturn.push(JSON.parse(JSON.stringify(toAppend)));
     }
  }

  return arrayToReturn;
}

//Useful functions for Statistics
//Author Daniel-Hug/arr-stat.js https://gist.github.com/Daniel-Hug/7273430



var arr = {
	max: function(array) {
		return Math.max.apply(null, array);
	},

	min: function(array) {
		return Math.min.apply(null, array);
	},

	range: function(array) {
		return arr.max(array) - arr.min(array);
	},

	midrange: function(array) {
		return arr.range(array) / 2;
	},

	sum: function(array) {
		var num = 0;
		for (var i = 0, l = array.length; i < l; i++) num += array[i];
		return num;
	},

	mean: function(array) {
		return arr.sum(array) / array.length;
	},

	median: function(array) {
		array.sort(function(a, b) {
			return a - b;
		});
		var mid = array.length / 2;
		return mid % 1 ? array[mid - 0.5] : (array[mid - 1] + array[mid]) / 2;
	},

	modes: function(array) {
		if (!array.length) return [];
		var modeMap = {},
			maxCount = 0,
			modes = [];

		array.forEach(function(val) {
			if (!modeMap[val]) modeMap[val] = 1;
			else modeMap[val]++;

			if (modeMap[val] > maxCount) {
				modes = [val];
				maxCount = modeMap[val];
			}
			else if (modeMap[val] === maxCount) {
				modes.push(val);
				maxCount = modeMap[val];
			}
		});
		return modes;
	},

	variance: function(array) {
		var mean = arr.mean(array);
		return arr.mean(array.map(function(num) {
			return Math.pow(num - mean, 2);
		}));
	},

	standardDeviation: function(array) {
		return Math.sqrt(arr.variance(array));
	},

	meanAbsoluteDeviation: function(array) {
		var mean = arr.mean(array);
		return arr.mean(array.map(function(num) {
			return Math.abs(num - mean);
		}));
	},

	zScores: function(array) {
		var mean = arr.mean(array);
		var standardDeviation = arr.standardDeviation(array);
		return array.map(function(num) {
			return (num - mean) / standardDeviation;
		});
	}
};

// Function alias:
arr.average = arr.mean;
