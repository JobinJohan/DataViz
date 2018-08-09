/*Author: Johan Jobin, University of Fribourg 2018
  Description: This creates a table that contains a cell for each sensor of
                Bbdata with his average value from the last month to now. It
                is also used as the main menu to draw all the visualizations.
*/

/*function debounce:
  func: function to call after an event occured
  Description: This function calls the specified function when an event occurs after a timeout of 100 ms
               It has been used to redraw the main table only when the window has been entirely resized.
*/
  function debounce(func){
    var timer;
    return function(event){
      if(timer){clearTimeout(timer);}
      timer = setTimeout(func,100,event);
    };
  }


/*function timestamp:
  str: string from which the date will be created
  Description: Create a new date from a string, return as a timestamp.
*/
  function timestamp(str){
    return new Date(str).getTime();
  };

/*function timestamp:
  str: string from which the date will be created
  Description: Append a suffix to dates, example: 23 => 23rd, 1 => 1st.
*/
  function nth(d){
    if(d>3 && d<21){return 'th';}
    switch (d % 10){
          case 1:  return "st";
          case 2:  return "nd";
          case 3:  return "rd";
          default: return "th";
      }
  };

/*function formatDate:
  date: the date
  Description: Create a string representation of the date.
*/
  function formatDate (date) {
    // Create a list of day and monthnames.
      var weekdays = ["Sunday", "Monday", "Tuesday","Wednesday", "Thursday", "Friday","Saturday"];
      var months = ["January", "February", "March","April", "May", "June", "July","August", "September", "October","November", "December"];
      return weekdays[date.getDay()] + ", " +
          date.getDate() + nth(date.getDate()) + " " +
          months[date.getMonth()] + " " +
          date.getFullYear();
  };


// Global variable used to indicate that firs we add cells, then remove, then add etc..
  var addOrRemoveCells=0;

/*function selectAllSensors:
  typeOfSensors: the type of sensors you want to select
  Description: Create a string representation of the date.
*/
  function selectAllSensors(typeOfSensors){
  // select all td whose unit= the specified type of sensors and whose value is different from "No value"
    string= "td[unit='"+typeOfSensors+"'][value!='No values']";
    // Select all cells
    if(addOrRemoveCells==0){
      // For each cell, check if it is already selected, if not add it in the selection
      $(string).each(function(){
        var index = selectedCellsIds.indexOf(this.id);
        if(index <=-1){
          selectedCellsIds.push(this.id);
          unitOfSelectedSensors.push(this.getAttribute("unit"));
          console.log(selectedCellsIds);
          console.log(unitOfSelectedSensors);
        }
      // Write highlighted in class attribute in order to make the border black
        this.setAttribute("class","sensorItem highlighted")});
        addOrRemoveCells=1;
    }
    // Remove all cells from the selection
    else{
      // For each cell, check if it is already selected, if yes remove it from the selection
      $(string).each(function(){
        var index = selectedCellsIds.indexOf(this.id);
        if(index >-1){
          selectedCellsIds.splice(index, 1);
          unitOfSelectedSensors.splice(index, 1);
        }
        this.setAttribute("class","sensorItem");
      });
      addOrRemoveCells=0;
    }

  }

// Global variable that will contain the result of the query with all measures for all sensors
  var asyncDataOutOfFunction;

/*function generateAllgraph:
    from: The date from which we want the measures
    to: The date to which we want the measures
    arrayOfIds: The ids of the sensors we want to have measures about
  Description: this function makes the request to Bbdata to have measure of the given ids from the specified date to the specified date
*/
  async function generateAllgraph(from, to, arrayOfIds){

  // Go at the top of the page
    goAtTheTopOfPage();

  // Delete all elements whose class is deleteAll (if there are some)
    elemToDel= document.getElementsByClassName("deleteAll");
    while(elemToDel[0]){
      elemToDel[0].parentNode.removeChild(elemToDel[0]);
    }

  // Format the date with the format of Bbdata API
    from= from.toJSON();
    to = to.toJSON();

  // Append the logo of loading
    var x = document.createElement("img");
    x.setAttribute("src","ressources/loading.gif");
    x.setAttribute("class","loadingChartLine");
    x.setAttribute("style", "text-align:center;");
    document.getElementById("chartLineTab").appendChild(x.cloneNode());
    document.getElementById("scatterPlotTab").appendChild(x.cloneNode());
    document.getElementById("boxPlotTab").appendChild(x.cloneNode());
    document.getElementById("radialPlotTab").appendChild(x.cloneNode());
    document.getElementById("calendarHeatMapTab").appendChild(x.cloneNode());
    document.getElementById("histogramTab").appendChild(x.cloneNode());

  // Request Bbdata API to get the measure of selected sensors
    var userId= getCookie('userId');
    var bbtoken = getCookie('key');
    var stringIds= arrayIdsToString(arrayOfIds);
    var url = "https://bbdata.daplab.ch/api/values?ids="+stringIds+"&&from="+from+"&&to="+to;
    const asyncData= await axios.get(url,{'headers': {'bbuser': userId, 'bbtoken': bbtoken}}).catch(err => alert(""+ err + " Please reload the page to retry"));
    asyncDataOutOfFunction = asyncData.data;

  // Remove all logos of loading
    elem= document.getElementsByClassName("loadingChartLine");
    while(elem[0]){
      elem[0].parentNode.removeChild(elem[0]);
    }

  // If the user requested binary values (on/off), call only scatterPlot function and display messages for the others
  if(asyncData.data[0].unit.symbol=="on"){
    document.getElementById("chartLineTab").innerHTML="<div class='deleteAll panel panel-primary'><div class='panel-heading'>Information</div><div class='panel-body'>Binary values (on/off) are not compatible with the chartLine</div></div>"
    document.getElementById("boxPlotTab").innerHTML="<div class='deleteAll panel panel-primary'><div class='panel-heading'>Information</div><div class='panel-body'>Binary values (on/off) are not compatible with the boxPlot</div></div>"
    document.getElementById("radialPlotTab").innerHTML="<div class='deleteAll panel panel-primary'><div class='panel-heading'>Information</div><div class='panel-body'>Binary values (on/off) are not compatible with the radialPlot</div></div><div id='radialPlotScale'></div>"
    document.getElementById("calendarHeatMapTab").innerHTML="<div class='deleteAll panel panel-primary'><div class='panel-heading'>Information</div><div class='panel-body'>Binary values (on/off) are not compatible with the calendarHeatMap</div></div> <div id='calendarHeatMapScale'></div>"
    document.getElementById("histogramTab").innerHTML="<div class='deleteAll panel panel-primary'><div class='panel-heading'>Information</div><div class='panel-body'>Binary values (on/off) are not compatible with the histogram</div></div>"
    scatterPlot(asyncData.data, 800, 500, "scatterPlotGraph", "#scatterPlotTab");
  }
  // If the user requested other values (float, int), call all functions to draw graphs
  else{
    chartLine(asyncData.data, 960, 500, "chartLineGraph", "#chartLineTab");
    oneBoxPlotPerSensor(asyncData.data, 1200, 400, "boxPlotGraph", "boxPlotTab");
    document.getElementById("radialPlotScale").innerHTML="<div class='deleteAll'>Mean scale: <input type='radio' name='scaleRadialPlot' value='meanCheck'  onclick=redrawRadial()> Median scale:<input type='radio' name='scaleRadialPlot' value='medianCheck'  onclick=redrawRadial() checked> </div>"
    radialPlot(asyncData.data,660,600, "radialPlotGraph", "#radialPlotTab");
    document.getElementById("calendarHeatMapScale").innerHTML="<div class='deleteAll'>Mean scale: <input type='radio' name='scaleCalendar' value='meanCheck' onclick=redrawCalendar()> Median scale:<input type='radio' name='scaleCalendar' value='medianCheck' onclick=redrawCalendar() checked> </div>"
    oneCalendarPerYear(asyncData.data,1300, 400, "calendarHeatMapGraph","calendarHeatMapTab");
    oneHistogramPerSensor(asyncData.data, 960, 500, "histogramGraph", "histogramTab");
    document.getElementById("scatterPlotTab").innerHTML="<div class='deleteAll panel panel-primary'><div class='panel-heading'>Information</div><div class='panel-body'>Continuous values are not compatible with the scatterPlot, choose on/off sensors to display it</div></div>";
  }
}

/*function redrawRadial:
  Description: Draw the radial plot again when scale is chosen
*/
  function redrawRadial(){
    if(asyncDataOutOfFunction!=undefined){
      radialPlot(asyncDataOutOfFunction,660,600, "radialPlotGraph", "#radialPlotTab");
    }
  }
/*function redrawCalendar:
  Description: Draw the calendar heat map again when scale is chosen
*/
  function redrawCalendar(){
    if(asyncDataOutOfFunction!=undefined){
      oneCalendarPerYear(asyncDataOutOfFunction,1300,400, "calendarHeatMapGraph", "calendarHeatMapTab");
    }
  }

/*function checkChoice:
  from: The date from which we want the measures
  to: The date to which we want the measures
  arrayOfIds: The ids of the sensors we want to have measures about
  Description: check some necessary conditions before generating all graphs
*/
  function checkChoice(from, to, arrayOfIds){
    if(selectedCellsIds.length==0){
      window.alert("No sensor chosen, please click on a cell to choose one");
    }
    else{
      for(var i=0; i<unitOfSelectedSensors.length; i++){
        if(unitOfSelectedSensors[0]!=unitOfSelectedSensors[i]){
          return window.alert("Please choose all sensors with the same unit");
        }
      }
      generateAllgraph(from, to, arrayOfIds);
    }
  }

  /*function goAtTheTopOfPage:
    Description: go at the top of the page when the button "Generate graphs" is clicked
  */
function goAtTheTopOfPage(){
  $('html, body').animate({ scrollTop: 0 }, 'fast');
}


var selectedCellsIds=[];
var unitOfSelectedSensors=[];
var from;
var to;
/*function createMainTable:
  nest:
  div:
  sideLength:
  Description: create the main table using the data of the nest, append it on the div
               and define the length of the side of the table
*/
function createMainTable(nest, div, sideLength){
  console.log(nest);

  // Colors used to draw each cell in function of which unit of measurement:http://www.iscc-archive.org/pdf/PC54_1724_001.pdf
  // Study from Kenneth L. Kelly that proves that theses colors had the maximum contrast between each other
    var colors=['#F2F3F4', '#222222', '#F3C300', '#875692',
                '#F38400', '#A1CAF1', '#BE0032', '#C2B280',
                '#848482', '#008856', '#E68FAC', '#0067A5',
                '#F99379', '#604E97', '#F6A600', '#B3446C',
                '#DCD300', '#882D17', '#8DB600', '#654522',
                '#E25822', '#2B3D26'];

  // Drawing the table
    toAdd = document.getElementById(div);
    var table = document.createElement("table");
    table.setAttribute('id', 'mainTable');


  // Table Head
    var tbh = document.createElement("thead")
    tbh.setAttribute("style","padding-top:50px;padding-bottom:50px;")
    var trh = document.createElement('tr');
    var tdh1 = document.createElement('td');
    var titleOfTable = document.createElement("h3");
    titleOfTable.appendChild(document.createTextNode("Mean value of each sensor from the beginning of the month to now"))
    tdh1.appendChild(titleOfTable);
    tdh1.setAttribute("colspan", sideLength+1);
    trh.appendChild(tdh1);
    tbh.appendChild(trh);

  // Table body
    var tbBody = document.createElement("tbody");
    cellCounter=0;
    rowCounter=0;


  // Loop for each measure
    for(var i=0; i<nest.length;i++){
      for(var j=0; j<nest[i].values.length;j++){
        if(rowCounter==0 && cellCounter==0){
        // For the first line and the first cell
          var tr = document.createElement('tr');
          var td = document.createElement('td');
          if(nest[i].values[j].values.length==0){
          // If there are no values
            td.appendChild(document.createTextNode("-"));
            td.setAttribute("bgcolor", colors[i]);
            td.setAttribute("class", "sensorItem");
            td.setAttribute("value", "No values");
          }
          else{
          // If there are values
            var divSVG = document.createElement("div");
            var idOfCell = "cell"+i+j;
            divSVG.setAttribute("id", idOfCell);
            drawBar(nest[i].values[j].values, parseFloat(nest[i].min), parseFloat(nest[i].max),9, 19, divSVG, "svg"+idOfCell);
            td.appendChild(divSVG);
            td.setAttribute("bgcolor", colors[i]);
            td.setAttribute("class", "sensorItem");
            td.setAttribute("value", nest[i].values[j].values +" "+ nest[i].values[j].unit.symbol);
          }
          // In all cases, add id and unit
          td.setAttribute("id", nest[i].values[j].objectId);
          td.setAttribute("unit", nest[i].values[j].unit.symbol);
          td.setAttribute("style","cursor:pointer;");
          tr.appendChild(td);
          cellCounter+=1;
          rowCounter+=1;
        }
      // For all cells between the first and the last
        else if(cellCounter<sideLength-1 && rowCounter!=0){
          var td = document.createElement('td');
          if(nest[i].values[j].values.length==0){
          // If there are no values
            td.appendChild(document.createTextNode("-"));
            td.setAttribute("bgcolor", colors[i]);
            td.setAttribute("class", "sensorItem");
            td.setAttribute("value", "No values");
          }
          else{
          // If there are values
            var divSVG = document.createElement("div");
            var idOfCell = "cell"+i+j;
            divSVG.setAttribute("id", idOfCell);
            drawBar(nest[i].values[j].values, parseFloat(nest[i].min), parseFloat(nest[i].max),9, 19, divSVG, "svg"+idOfCell);
            td.appendChild(divSVG);
            td.setAttribute("bgcolor", colors[i]);
            td.setAttribute("class", "sensorItem");
            td.setAttribute("value", nest[i].values[j].values +" "+ nest[i].values[j].unit.symbol );
          }
        // In all cases add id and unit
          td.setAttribute("id", nest[i].values[j].objectId);
          td.setAttribute("unit", nest[i].values[j].unit.symbol);
          td.setAttribute("style","cursor:pointer;");
          tr.appendChild(td);
          cellCounter+=1;
        }

      // If this is the last cell of each row
        else if(cellCounter==sideLength-1){
          var td= document.createElement('td');
          if(nest[i].values[j].values.length==0){
          // If there are no values
            td.appendChild(document.createTextNode("-"));
            td.setAttribute("bgcolor", colors[i]);
            td.setAttribute("class", "sensorItem");
            td.setAttribute("value", "No values");
          }
          else{
          // If there are values
            var divSVG = document.createElement("div");
            var idOfCell = "cell"+i+j;
            divSVG.setAttribute("id", idOfCell);
            drawBar(nest[i].values[j].values, parseFloat(nest[i].min), parseFloat(nest[i].max),9, 19, divSVG, "svg"+idOfCell);
            td.appendChild(divSVG);
            td.setAttribute("bgcolor", colors[i]);
            td.setAttribute("class", "sensorItem");
            td.setAttribute("value", nest[i].values[j].values+" "+nest[i].values[j].unit.symbol);
          }
          td.setAttribute("id", nest[i].values[j].objectId);
          td.setAttribute("unit", nest[i].values[j].unit.symbol);
          td.setAttribute("style","cursor:pointer;");
          tr.appendChild(td);

        //The cell containing the caption
          if(cellCounter==sideLength-1&&rowCounter==1){
            var td= document.createElement('td');

            var ul = document.createElement("ul");
            liNoValues= document.createElement("li");
            liNoValues.setAttribute("style", "text-align:center;border:none;")
            liValues= document.createElement("li");
            liValues.setAttribute("style", "text-align:center; border:none;")
            liNoValues.appendChild(document.createTextNode("- : No values"));
            liValues.appendChild(document.createTextNode("| : Mean value available"))

            ul.appendChild(liNoValues);
            ul.appendChild(liValues);

            td.appendChild(ul);
            for(var z=0; z<nest.length; z++){
              li= document.createElement("li");
              li.appendChild(document.createTextNode(nest[z].key));
              li.setAttribute("style", "background-color:"+ colors[z]+"; text-align:center;cursor:pointer; ");
              li.setAttribute("onclick", "selectAllSensors(this.textContent);")
              li.setAttribute("onmouseover", "this.style.backgroundColor='white'");
              li.setAttribute("onmouseout", "this.style.backgroundColor='"+colors[z]+"'");
              ul.appendChild(li);
            }
            td.setAttribute("rowspan", sideLength-1);
            tr.appendChild(td);
          }
          tbBody.appendChild(tr);
          tr = document.createElement("tr");
          rowCounter+=1;
          cellCounter=0;
        }
      }
    }
    tbBody.appendChild(tr);

  // Last line, slider for the date, button"generate graph"
    lastLine = document.createElement("tr");

    timeLine = document.createElement("td");
    timeLine.setAttribute("colspan", sideLength+1);

    divSpace = document.createElement("div");
    divSpace.setAttribute("style", 'padding-top:20px;padding-bottom:20px; font-weight:bold; text-align:center;');
    divSpace.appendChild(document.createTextNode("Choose the interval of time you want to display"));

    divSlider = document.createElement("div");
    divSlider.setAttribute("id",'slider-date');
    divSlider.setAttribute("style",'width:95%; margin:auto;');

    eventStart = document.createElement("div");
    eventStart.setAttribute("id",'event-start');
    eventStart.setAttribute("style",'text-align:center;padding-top:20px;');
    inputStart = document.createElement("input");
    inputStart.setAttribute("type", "text");
    inputStart.setAttribute("name", "test");
    inputStart.setAttribute("id", "inputStart");
    inputStart.setAttribute("style","text-align:center;");
    eventStart.appendChild(inputStart)


    eventEnd = document.createElement("div");
    eventEnd.setAttribute("id",'event-end');
    eventEnd.setAttribute("style",'text-align:center;');
    inputEnd = document.createElement("input");
    inputEnd.setAttribute("type", "text");
    inputEnd.setAttribute("name", "test");
    inputEnd.setAttribute("id", "inputEnd");
    inputEnd.setAttribute("style","text-align:center;");
    eventEnd.appendChild(inputEnd)


    button = document.createElement("button");
    button.appendChild(document.createTextNode("Generate graphs"));
    button.setAttribute("onmouseover", 'this.style.backgroundColor="#f4a041"');
    button.setAttribute("onmouseout", 'this.style.backgroundColor="#0e1a35"');
    button.setAttribute("onclick", "checkChoice(from, to, selectedCellsIds)");
    button.setAttribute("style", "background-color: #0e1a35;border: none;color: white; padding: 15px 32px;text-align: center;text-decoration: none;display: inline-block;font-size: 16px;");

    divButton = document.createElement("div");
    divButton.setAttribute("style", "padding-top: 30px;padding-bottom:30px; text-align: center;");
    divButton.appendChild(button);

    lastLine.appendChild(timeLine);
    timeLine.appendChild(divSpace);
    timeLine.appendChild(divSlider);
    timeLine.appendChild(eventStart);
    timeLine.appendChild(eventEnd);
    timeLine.appendChild(divButton);
    tbBody.appendChild(lastLine);


  // Append the head, the body to the table and append the table to toAdd
    table.appendChild(tbh);
    table.appendChild(tbBody);
    toAdd.appendChild(table);

// Slider for date
    var dateSlider = document.getElementById('slider-date');

    // Two more timestamps indicate the handle starting positions.
    var currentDate = new Date();
    var currentYear = currentDate;

    noUiSlider.create(dateSlider, {
      // Create two timestamps to define a range.
        range: {
          min: timestamp('2016'),
          max: timestamp(String(currentYear))
        },
      // Steps of one day
        step: 24 * 60 * 60 * 1000,
        start: [ timestamp('2016'), timestamp(String(currentYear))],
      });
      var format = d3.timeFormat("%Y-%m-%d");
      dateValues = [document.getElementById('inputStart'), document.getElementById('inputEnd')];
      updatePosSlider();
      dateSlider.noUiSlider.on('update', function( values, handle ){
        dateValues[handle].value = format(new Date(+values[handle]));
        from = new Date(+values[0]);
        to = new Date(+values[1]);
      });


/*function updatePosSlider:
  Description: this function update the positions of the slider when the user types himself the range
*/
  function updatePosSlider(){
    testDate= document.getElementsByName('test');
    testDate[0].addEventListener("keyup", function(){
      document.getElementById("inputStart").value=this.value;
    });

    testDate[1].addEventListener("keyup", function(){
      document.getElementById("inputEnd").value=this.value;
    });

    for(var k=0; k<testDate.length;k++){
      testDate[k].addEventListener("blur",function(){
      dateSlider.noUiSlider.set([new Date(testDate[0].value).getTime(),new Date(testDate[1].value).getTime()]);
    });
  }
}




// Jquery code to be able to select cells
  for(var b=0; b<selectedCellsIds.length; b++){
    $(document.getElementById(""+selectedCellsIds[b])).toggleClass("highlighted");
  }

  $(function () {
    var isMouseDown = false;
    $(".sensorItem")
    //We select all cells called of the array #tableTest
    .mousedown(function () {
      isMouseDown = true;
      // add class="highlighted"
      $(this).toggleClass("highlighted");

      // Checking if the cell is already selected
      var index = selectedCellsIds.indexOf($(this).attr("id"));
      if(index >-1){
        selectedCellsIds.splice(index, 1);
        unitOfSelectedSensors.splice(index,1);
      }
      else{
        selectedCellsIds.push($(this).attr("id"));
        unitOfSelectedSensors.push($(this).attr("unit"));
      }

      return false; // prevent text selection
      })

      .mouseover(function (){
        if(isMouseDown) {
          $(this).toggleClass("highlighted");
          var index = selectedCellsIds.indexOf($(this).attr("id"));
          if(index >-1){
            selectedCellsIds.splice(index, 1);
            unitOfSelectedSensors.splice(index,1);
          }
          else{
            selectedCellsIds.push($(this).attr("id"));
            unitOfSelectedSensors.push($(this).attr("unit"));
          }
        }
      });

    $(document)
      .mouseup(function () {
        isMouseDown = false;
      });
    });



// Creation of the div that will contain the information about each cell
  var tooltip = d3.select("#"+div)
    .append('div')
    .attr('class', 'tooltip');

// One div for the objectId and the other for the value
  tooltip.append('div')
    .attr('class', 'id');
  tooltip.append('div')
    .attr('class', 'value');

// When the mouse is on a cell (i.e a sensor)
  d3.selectAll(".sensorItem")
    .on('mouseover', function(d){
      tooltip.select('.id').html("Id: <b>" + d3.select(this).attr("id") + "</b>");
      tooltip.select('.value').html("Mean: <b>" + d3.select(this).attr("value")+"<b>");
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
      tooltip.style('display', 'none');
      tooltip.style('opacity',0);
    });
  }
