/*Author: Johan Jobin, University of Fribourg 2018
Description: Draw a bar for the each cell of the main table
*/


/*function drawBar:
  value: the json data
  width: width of the SVG
  height: height of the SVG
  parentDiv: id ot the div containing the SVG in order to append it in the SVG
  Description: Draw a radialPlot: each circle corresponds to an entire day.
*/
function drawBar(value, minValue, maxValue, width, height,parentDiv, id){

  var yScale = d3.scaleLinear().domain([minValue,maxValue]).range([1, height]);

  svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttributeNS(null,"id", id);
  svg.setAttributeNS(null,"width", width);
  svg.setAttributeNS(null,"height", height);
  rect = document.createElementNS("http://www.w3.org/2000/svg","rect");
  rect.setAttributeNS(null,"x",4);
  rect.setAttributeNS(null,"y",1);
  rect.setAttributeNS(null,"width",2);
  rect.setAttributeNS(null,"height",yScale(value));
  rect.setAttributeNS(null,"style","fill:black;");
  svg.appendChild(rect);
  parentDiv.appendChild(svg);


    //
    // g =document.createElement("g");
    //
    // g.setAttribute("transform","translate(1,1)");
    // rect = document.createElement("rect");
    // rect.setAttribute("x",4);
    // rect.setAttribute("y",1);
    // rect.setAttribute("width", 3);
    // rect.setAttribute("height", yScale(value));
    // rect.setAttribute("style", "fill:blue");
    // rect.setAttribute("transform","translate("+width/2+","+ (height-5)+")")
    // g.appendChild(rect);
    // svg.appendChild(g);
    // parentDiv.appendChild(svg);

}
