/*Author: Johan Jobin, University of Fribourg 2018
Description: Functions used for different little tasks
*/

/*function arrayIdsToString:
  array: array containing all ids
  Description: create a string of all ids
*/
  function arrayIdsToString(array){
    var string="";
    for(var i=0; i<array.length; i++){
      string += array[i]+",";
    }
    return string;
  }

/*function getIds:
  array: array containing all ids
  unit: unit of sensor wanted
  Description: get all ids of sensors of the specified unit and return it in an array
*/
  function getIds(array, unit){
    var ids=[];
    for(var i = 0; i<array.length; i++){
      if(array[i].unit.symbol == unit){
      ids.push(array[i].id);
      }
    }
  return ids;
  }


  /*OLD CODE NOT USED IN THE FINAL VERSION  */


/*function requestListSensors:
  unit: unit of sensor wanted
  graphFunction: function that will create the graph
  width: width of the svg that will be created
  height: height of the svg that will be createTextNode
  id: id of the svg
  parentDiv: id of the div that will contain the svg
  from: date from which data will be requested
  to : date to which data will be requested
  Description: Get ids of sensors of specified unit and call requestFromIds
*/
  async function requestListSensors(unit, graphFunction, width, height, id, parentDiv, from, to){
  // If there are previous svg in the div, remove them
    d3.select(parentDiv).selectAll("svg").remove();

  // Append the logo of loading
    var x = document.createElement("IMG");
    x.setAttribute("src","ressources/loading.gif");
    x.setAttribute("id","loading"+id);
    document.getElementById(parentDiv.substring(1)).appendChild(x);

  // Make the request
    var userId= getCookie('userId');
    var bbtoken = getCookie('key');
    var url = "https://bbdata.daplab.ch/api/objects"
    const asyncData= await axios.get(url,{'headers': {'bbuser': userId, 'bbtoken': bbtoken}})
    var test= getIds(asyncData.data, unit);

  // Once we have the ids, request values for these ids
    requestFromIds(test, graphFunction, width, height, id, parentDiv, from, to);
  }

  /*function requestFromIds:
    array: array of ids
    graphFunction: function that will create the graph
    width: width of the svg that will be created
    height: height of the svg that will be createTextNode
    id: id of the svg
    parentDiv: id of the div that will contain the svg
    from: date from which data will be requested
    to : date to which data will be requested
    Description: Get measure of ids contained in the given array and then call the graphFunction
  */
  async function requestFromIds(array, graphFunction, width, height, id, parentDiv, from, to){
  // If there is not already a logo of loading, add it
    elem= document.getElementById("loading"+id);
    if(elem== null){
      var x = document.createElement("IMG");
      x.setAttribute("src","ressources/loading.gif");
      x.setAttribute("id","loading"+id);
      document.getElementById(parentDiv.substring(1)).appendChild(x);
    }
  // Make the request
    var userId= getCookie('userId');
    var bbtoken = getCookie('key');
    var stringIds= arrayIdsToString(array);
    var url = "https://bbdata.daplab.ch/api/values?ids="+stringIds+"&&from="+from+"&&to="+to;

    const asyncData= await axios.get(url,{'headers': {'bbuser': userId, 'bbtoken': bbtoken}})

  // Delete the logo
    elem= document.getElementById("loading"+id);
    if(elem!= null){
      elem.parentNode.removeChild(elem);
    }
    graphFunction(asyncData.data, width, height, id, parentDiv)
  }


/*function requestListSensorsCurrent:
  unit: unit of sensors wanted
  graphFunction: function that will create the graph
  width: width of the svg that will be created
  height: height of the svg that will be createTextNode
  id: array of ids
  parentDiv: id of the div that will contain the svg
  Description: Get ids of sensors of specified unit and call requestFromIds
*/
  async function requestListSensorsCurrent(unit, graphFunction, width, height, id, parentDiv){
  // Make the request
    var userId= getCookie('userId');
    var bbtoken = getCookie('key');
    var url = "https://bbdata.daplab.ch/api/objects?search="+unit
    const asyncData= await axios.get(url,{'headers': {'bbuser': userId, 'bbtoken': bbtoken}})

    var test= getIds(asyncData.data);
    requestFromIdsCurrent(test, graphFunction, width, height, id, parentDiv);
  }

/*function requestFromIdsCurrent:
  array: unit of sensors wanted
  graphFunction: function that will create the graph
  width: width of the svg that will be created
  height: height of the svg that will be createTextNode
  id: id of the svg
  parentDiv: id of the div that will contain the svg
  Description: Get ids of sensors of specified unit and call requestFromIds
*/
  async function requestFromIdsCurrent(array, graphFunction, width, height, id, parentDiv){
  // Make the request
    var userId= getCookie('userId');
    var bbtoken = getCookie('key');
    var stringIds= arrayIdsToString(array);

  // Date corresponding to now
    var now = new Date(Date.now());
    var url = "https://bbdata.daplab.ch/api/values/latest?ids="+stringIds+"&&before=2018-03-24T18";
    const asyncData= await axios.get(url,{'headers': {'bbuser': userId, 'bbtoken': bbtoken}});
    graphFunction(asyncData.data, width, height, id, parentDiv);
  }

/*function getLastMeasureOfSensor:
  id: id of the sensor from which the last value will be found
  Description: Get last value of the sensor corresponding to the given id
*/
  async function getLastMeasureOfSensor(id){
    var userId= getCookie('userId');
    var bbtoken = getCookie('key');
    var now = new Date(Date.now()).toJSON();
    var url = "https://bbdata.daplab.ch/api/values/latest?ids="+id+"&&before="+now;
    const asyncData= await axios.get(url,{'headers': {'bbuser': userId, 'bbtoken': bbtoken}});
    return asyncData
  }


  /*function getLast:
    json: json containing all sensors
    Description: Get last objectId
  */
  function getLast(json){
    return json.data[0].objectId;
  }
