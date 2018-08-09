/*Author: Johan Jobin, University of Fribourg 2018
Description: Draw a scatterPlot for all values given in the json file
*/

/*function scatterPlot:
  json: the json data
  width: width of the SVG
  height: height of the SVG
  id: id of the SVG
  parentDiv: id ot the div containing the SVG in order to append it inside
  Description: Draw a scatterPlot: an oragne circle == "on" state, a blue one is "off"
*/
function scatterPlot(json, width, height, id, parentDiv){
  console.log(json);
  json = scatterPlotSample(json, width);

  // If there already is a svg in the parentDiv, remove it
  d3.select(parentDiv).selectAll("svg").remove();

// Variables to define the margins of the svg
  var margin = {top: 80, right: 150, bottom: 20, left: 100};
  var innerWidth = width - margin.left - margin.right;
  var innerHeight = height - margin.top - margin.bottom;



// Find the min and max value
  var allValuesX=[];
  var allValuesY=[];
  for(var sensors in json){
      for(var measure in json[sensors].values){
      allValuesX.push(json[sensors].values[measure].timestamp);
    }
  }

  // If there are no data available
    if(allValuesX.length==0){
      var svg = d3.select(parentDiv)
        .append("svg")
        .attr("id",id)
        .attr('viewBox','0,0,'+width+','+height+'');

      svg.append("text")
      .attr('transform', 'translate(' + (innerWidth / 2)+ ',' + (innerHeight / 2)+ ')')
      .text("No data available, try with another interval of time");
      return;
    }

// Max, min for scales
    var maxValueX = d3.max(allValuesX);
    var minValueX = d3.min(allValuesX);
    var maxValueY = json[json.length-1].objectId;
    var minValueY = json[0].objectId;

// X axis  --> scaletime --> creation of date
    var minDate= new Date(minValueX);
    var maxDate= new Date(maxValueX);


// Creation of the SVG
  var svg= d3.selectAll(parentDiv)
      .append("svg")
      .attr('id', id)
      .attr("class", "deleteAll")
      .attr('viewBox','0,0,'+width+','+height+'');


// Y-axis label
  svg.append("g")
      .append("text")
      .attr('transform', "translate("+((margin.left/2)-10)+","+height/2+")rotate(-90)")
      .text("Id of sensor");

// Define a clipPath: it allows to define the area in which the zoom will be used.
svg.append("defs").append("svg:clipPath")
    .attr("id", "clipScatterPlot")
    .append("svg:rect")
    .attr("x",0)
    .attr("y",0)
    .attr("width",innerWidth)
    .attr("height", innerHeight);


// Create the zoom and wait for an event of type zoom to run zoomed function
    var zoom = d3.zoom()
    .scaleExtent([.5, 20])
    .extent([[0, 0], [innerWidth, innerHeight]])
    .on("zoom", zoomed);

// Create the rectangle on which the zoom will be applied
  zoomRect=svg.append("rect")
    .attr("width", innerWidth)
    .attr("height", innerHeight)
    .style("fill", "none")
    .style("pointer-events", "all")
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
    .call(zoom);

// Scale for the X-Axis
  var xScale = d3.scaleTime()
      .domain([minDate,maxDate])
      .range([0, innerWidth ]);


// Scale for the Y-Axis
  var yScale = d3.scaleLinear()
      .domain([minValueY-5,maxValueY+5])
      .range([innerHeight,0]);


// Function that checks if the state is "on" or "off" and returns red for the first case and black for the second
 var color=function(d){
   if(d.value=="on" || d.value=="true"){
     return "#f4a041";
   }
   else{
     return "#0e1a35";
   }
 }

// Creation of the X-axis
  var xAxis = d3.axisBottom()
                .scale(xScale)
                .ticks(7);

// Creation of the Y-axis
  var yAxis = d3.axisLeft()
                .scale(yScale);

// Read the data and draw a circle for each measure (red circle => "on", black circle => "off")
  var points = svg.selectAll("test")
      .data(json, function(d,i){
              for(var k=0; k<json[i].values.length; ++k){
                json[i].values[k]['objectId'] = json[i].objectId;
              }
              return json[i]})
      .enter()
      .append('g')
      .attr('class', 'sensor')
      .attr("transform","translate("+margin.left+", "+margin.top+")")
      .attr("clip-path", "url(#clipScatterPlot)")
      .selectAll("test2")
      .data((d,z)=>d.values)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("time", function(d,i){return d.timestamp;})
      .attr("state", function(d, i){return d.value;})
      .attr("objectId", function(d,i){return d.objectId;})
      .attr("cy",function(d,i){return yScale(d.objectId);})
      .attr("cx", function(d,i){return xScale(new Date(d.timestamp));})
      .attr("r", 3)
      .attr("fill", color);

// Call the x-axis and y-axis
  var gY = svg.append("g").attr("transform", "translate("+margin.left+", "+margin.top+")").call(yAxis);
  var gX = svg.append("g").attr("transform", "translate("+margin.left+","+(height-margin.bottom)+")").call(xAxis);


// Create a group for the caption
  caption = svg.append("g").attr("class","caption");

// function to choose in which format to display the date
  var formatTime = d3.timeFormat(" %d %B %Y");
  var formatTimeHours= d3.timeFormat("%H");
  var formatTimeMinutes=d3.timeFormat("%M");

// Append the text
  caption.append("text")
  .attr("x",width/2)
  .attr("y", margin.top/2)
  .text("From: "+formatTime(minDate) + " To: "+formatTime(maxDate))
  .style("font-weight", "bold")
  .style("text-anchor", "middle");

// Append an other caption on the right
  captionRight= caption.append("g").attr("class","captionLeft");

  captionRight.append("text")
    .attr("x", width-margin.right)
    .attr("y",2*margin.top)
    .text("State 'on'/'true'=");

  captionRight.append("circle")
    .attr("cx", width-margin.right+130)
    .attr("cy",2*margin.top-10)
    .attr("r",10)
    .attr("fill", "#f4a041");

    captionRight.append("text")
      .attr("x", width-margin.right)
      .attr("y",2.5*margin.top)
      .text("State 'off'/'false' =");

    captionRight.append("circle")
      .attr("cx", width-margin.right+130)
      .attr("cy",2.5*margin.top-10)
      .attr("r",10)
      .attr("fill", "#0e1a35");

// Creation of the div that will contain the information about each point
  var tooltip = d3.select(parentDiv)
    .append('div')
    .attr('class', 'tooltip');

// One div for the date and the other for the value
  tooltip.append('div')
    .attr('class', 'date');
  tooltip.append('div')
    .attr('class', 'id');

// When the mouse is on a rect (i.e a day in the calendar)
  svg.selectAll(".dot")
    .on('mouseover', function(d) {
      var timestamp =new Date(d3.select(this).attr("time"))
  tooltip.select('.date').html("Date: <b>" + formatTime(timestamp)+" "+formatTimeHours(timestamp)+"h:" +formatTimeMinutes(timestamp)+ "</b>");
  tooltip.select('.id').html("Id: <b>" + d3.select(this).attr("objectId") + ": '"+ d3.select(this).attr("state") +"'<b>");
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



/*function zoomed:
  Description: this function allows the user to zoom. It rescale the previous scales.
*/
  function zoomed() {
  // create new scale ojects based on event
    var new_xScale = d3.event.transform.rescaleX(xScale);
    var new_yScale = d3.event.transform.rescaleY(yScale);

  // update axes
    gX.call(xAxis.scale(new_xScale));
    gY.call(yAxis.scale(new_yScale));

  // Draw each point at the right place with the new scales
    d3.selectAll(".dot").nodes().map(function(d,i){
      newX= new_xScale(new Date(d.getAttribute("time")));
      d.setAttribute("cx", newX);
      newY=new_yScale(parseFloat(d.getAttribute("objectId")));
      d.setAttribute("cy", newY)
    });

  }

/*function scatterPlotSample:
  jsonOriginal: the json file
  threshold: the number of maximum values to keep
  Description: This function samples the data in order to keep at maximum 'threshold' values per sensor
*/
  function scatterPlotSample(jsonOriginal, threshold){

    var json = JSON.parse(JSON.stringify(jsonOriginal));
    var toReturnArray=[];
    var toReturn={};

    for(var i=0; i<json.length; ++i){
      toReturn['objectId']= json[i].objectId;
      toReturn['unit'] = json[i].unit;

    // If there are more values than the threshold -> sample
      if(json[i].values.length>=threshold){
        var interval = Math.ceil(json[i].values.length/threshold);
        var valuesArray=[];
        for(var k=0; k<json[i].values.length; ++k){

          if(k%interval==0){
            valuesArray.push(json[i].values[k])
          }
          else{
            continue
          }
        }
        toReturn['values']=valuesArray.slice(0);
      }
      // If there aren't more values than the threshold -> don't sample
      else{
        if(json[i].values.length==0){
          continue;
        }
        else{toReturn['values']=json[i].values;
        }
      }
      toReturnArray.push(JSON.parse(JSON.stringify(toReturn)));
    }
    return toReturnArray;
  }
}
