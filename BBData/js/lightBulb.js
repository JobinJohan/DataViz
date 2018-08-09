/* Author: Johan Jobin
   Description: Draw a light bulb that is orange when "on" and black when "off"
   The path for the bulb was found here: https://www.iconfinder.com/icons/111049/bulb_idea_light_icon#size=128
*/


/*function lightBulb:
  json: the json data
  width: width of the SVG
  height: height of the SVG
  id: id of the SVG
  parentDiv: id ot the div containing the SVG in order to append it in the SVG
  Description: Draw a black lightBulb if the light is off and an orange lightBulb otherwise
*/
function lightBulb(json, width, height, id, parentDiv){


json[0].values=[{'timestamp':'test', 'value':'on'}];

// Variables to define the margins of the svg
  var margin = {top: 30, right: 10, bottom: 30, left: 10};
  var innerWidth = width - margin.left - margin.right;
  var innerHeight = height - margin.top - margin.bottom;

// Check if there is data in the field "values" of the json
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

// if there are data
  else{
    var lastValue = json[0].values[json[0].values.length-1];
    lastValue["unit"]= json[0].unit.name;
    lastValue["symbol"]= json[0].unit.symbol;
    lastValue["id"] = json[0].objectId;


  // Manage different errors
    if(lastValue===undefined||lastValue.unit!="state"||json.length>1){
      var svg = d3.select(parentDiv)
        .append("svg")
        .attr("id",id)
        .attr("width", width)
        .attr("height", height);

      if(lastValue===undefined){
        svg.append("text")
        .attr('transform', 'translate(' + (width / 2)+ ',' + (height / 2)+ ')')
        .text("No data available, try with another interval of time");
        return;
      }
      if(lastValue.unit!="state"){
        svg.append("text")
        .attr('transform', 'translate(' + (width / 2)+ ',' + (height / 2)+ ')')
        .text("This graph works only with measure of humidity");
        return;
      }
      if(json.length>1){
        svg.append("text")
        .attr('transform', 'translate(' + (width / 2)+ ',' + (height / 2)+ ')')
        .text("This graph accepts only one sensor at a time");
        return;
      }
    }

// Creation of the first SVG on which the text will be appended
    var svg = d3.select(parentDiv)
      .append("svg")
      .attr("id", id)
      .attr("width", width)
      .attr("height", height);

// Creation of the second svg on which the light bulb will be drawn
    var svg2 = svg.append("g")
      .append("svg")
      .attr("width", width)
      .attr('height', height)
      .attr("viewBox", "0 0 500 500");

// If the state is on, draw an orange light bulb
    if(lastValue.value=='on'){
      svg2.append("g")
        .attr("id","bulb")
        .attr('transform', 'translate(' + (margin.right)+ ',' + (margin.top)+ ')')
        .append("path")
        .attr("d", "M177.317,367.111v27.346c0,12.72,5.27,24.264,13.717,32.523  l26.714,26.716c17.807,17.81,46.695,17.81,64.504,0l26.716-26.716c8.444-8.26,13.717-19.804,13.717-32.523v-18.26H241.82  c-10.54,0-19.076-8.182-19.076-18.172c0-9.992,8.536-18.173,19.076-18.173h83.223c12.448-70.049,70.324-99.124,70.324-167.441  c0-78.131-65.052-141.465-145.366-141.465c-80.315,0-145.368,63.333-145.368,141.465  C104.633,249.55,177.317,276.805,177.317,367.111z M274.08,112.715c-8.543-1.543-14.993-8.996-14.993-17.895  c0-9.99,8.181-18.445,18.172-18.445c14.442,0,31.973,10.265,46.695,24.807c14.993,14.898,25.985,34.799,25.985,47.876  c0,9.992-8.181,18.172-18.167,18.172c-8.911,0-16.354-6.451-17.906-14.995C309.323,133.975,293.708,117.259,274.08,112.715z")
        .attr("fill", "#f4a041");
    }

// If the state is off, draw a black light bulb
    else if(lastValue.value='off'){
      svg2.append("g")
        .attr("id","bulb")
        .append("path")
        .attr("d", "M177.317,367.111v27.346c0,12.72,5.27,24.264,13.717,32.523  l26.714,26.716c17.807,17.81,46.695,17.81,64.504,0l26.716-26.716c8.444-8.26,13.717-19.804,13.717-32.523v-18.26H241.82  c-10.54,0-19.076-8.182-19.076-18.172c0-9.992,8.536-18.173,19.076-18.173h83.223c12.448-70.049,70.324-99.124,70.324-167.441  c0-78.131-65.052-141.465-145.366-141.465c-80.315,0-145.368,63.333-145.368,141.465  C104.633,249.55,177.317,276.805,177.317,367.111z M274.08,112.715c-8.543-1.543-14.993-8.996-14.993-17.895  c0-9.99,8.181-18.445,18.172-18.445c14.442,0,31.973,10.265,46.695,24.807c14.993,14.898,25.985,34.799,25.985,47.876  c0,9.992-8.181,18.172-18.167,18.172c-8.911,0-16.354-6.451-17.906-14.995C309.323,133.975,293.708,117.259,274.08,112.715z")
        .attr("fill", "#000000");
    }

// Text containing the id of the sensor
    svg
      .append("text")
      .attr('transform', 'translate(' + (width / 2)+ ',' + margin.top/2+ ')')
      .style("font-weight", "bold")
      .style("text-anchor", "middle")
      .text("Sensor: "+ lastValue.id);

// Text containing the value of the sensor
      svg
        .append("text")
        .attr('transform', 'translate(' + (width / 2)+ ',' + height/2+ ')')
        .style("text-anchor", "middle")
        .text(""+ lastValue.value+"");
  }
}
