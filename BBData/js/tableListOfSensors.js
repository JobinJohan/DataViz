/* Author:       Johan Jobin, university of Fribourg, 2018
   Requires to have DataTable plug-in installed
   Description: Draw a table of all sensors of Bbdata
                and create a search engine to filter sensors by id, description, tags etc..
*/


/*function tableCreate:
  json: the json data
  parentDiv: id ot the div containing the SVG in order to append it inside
  Description: Draw a table of all sensors of Bbdata
               and create a search engine to filter sensors by id, description, tags etc...
*/
function tableCreate(parentDiv,json) {
  // Element to insert the table
    var toAdd = document.getElementById(parentDiv);

  // Creation of the table
    var tbl = document.createElement('table');
    tbl.style.width = '100%';
    tbl.setAttribute('border', '1');
    tbl.setAttribute('id', 'tableSensors');

  // Table head
    var tbh = document.createElement("thead")
    var trh = document.createElement('tr');
    var tdh1 = document.createElement('td');
    tdh1.appendChild(document.createTextNode("Description"));
    var tdh2 = document.createElement('td');
    tdh2.appendChild(document.createTextNode("Id"));
    var tdh3 = document.createElement('td');
    tdh3.appendChild(document.createTextNode("Name"));
    var tdh7 = document.createElement('td');
    tdh7.appendChild(document.createTextNode('Unit'));
    var tdh4 = document.createElement('td');
    tdh4.appendChild(document.createTextNode("Tags"));
    var tdh5 = document.createElement('td');
    tdh5.appendChild(document.createTextNode("Disabled"));
    var tdh6 = document.createElement('td');
    trh.appendChild(tdh1);
    trh.appendChild(tdh2);
    trh.appendChild(tdh3);
    trh.appendChild(tdh7);
    trh.appendChild(tdh4);
    trh.appendChild(tdh5);
    tbh.appendChild(trh);

  // Table body
    var tbdy = document.createElement('tbody');
    var length = json.length;
    for (var i = 0; i < length; i++){
        var tr = document.createElement('tr');
        var td1 = document.createElement('td');
        td1.appendChild(document.createTextNode(json[i].description));
        var td2 = document.createElement('td');
        td2.appendChild(document.createTextNode(json[i].id));
        var td3 = document.createElement('td');
        td3.appendChild(document.createTextNode(json[i].name));
        var td7= document.createElement('td');
        td7.appendChild(document.createTextNode(json[i].unit.name+" / "+json[i].unit.symbol+" / "+json[i].unit.type));
        var td4 = document.createElement('td');
        td4.appendChild(document.createTextNode(JSON.stringify(json[i].tags)));
        var td5 = document.createElement('td');
        td5.appendChild(document.createTextNode(json[i].disabled));
        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);
        tr.appendChild(td7);
        tr.appendChild(td4);
        tr.appendChild(td5);
        tbdy.appendChild(tr);
    }

  // Append table head and table body to the table and then add the table to the element toAdd
    tbl.appendChild(tbh);
    tbl.appendChild(tbdy);
    toAdd.appendChild(tbl);

  // Search function of plug-in DataTable in jQuery
    $.fn.dataTable.ext.search.push(
      function(settings, data, dataIndex) {

      // Get the value of each input
        var descFilter= $('#descrFilter').val();
        var idFilter = $('#idFilter').val();
        var nameFilter= $('#nameFilter').val();
        var tagsFilter= $('#tagsFilter').val();
        var disableFilter= $('#disableFilter').val();

      // If an input is undefined give it the value of an empty string
        if(descFilter==undefined){descFilter="";}
        if(idFilter==undefined){idFilter="";}
        if(nameFilter==undefined){nameFilter="";}
        if(tagsFilter==undefined){tagsFilter="";}
        if(disableFilter==undefined){disableFilter="";}

      // Store each column of table in a variable
        var desc = data[0];
        var id = data[1]
        var name= data[2];
        var tags = data[4];
        var disable = data[5];


      // All combinations to make the search working
        if(descFilter==""){
          if(idFilter==""){
            if(nameFilter==""){
              if(tagsFilter==""){
                if(disableFilter=="true"){
                  if(disable==disableFilter){return true;}
                }
                else{
                  if(disable==disableFilter){return true;}
                }
              }
              else{
                if(disableFilter=="true"){
                  if(disable==disableFilter&&tags.indexOf(tagsFilter)!== -1){return true;}
                  }
                else{
                  if(disable==disableFilter&&tags.indexOf(tagsFilter)!== -1){return true;}
                }
              }
            }
            else{
              if(tagsFilter==""){
                if(disableFilter=="true"){
                  if(name.indexOf(nameFilter)!==-1 &&disable==disableFilter){return true;}
                }
                else{
                  if(name.indexOf(nameFilter)!== -1 &&disable==disableFilter){return true;}
                }
              }
              else{
                if(disableFilter=="true"){
                  if(name.indexOf(nameFilter)!== -1 && tags.indexOf(tagsFilter)!==-1 &&disable==disableFilter){return true;}
                }
                else{
                  if(name.indexOf(nameFilter)!== -1 && tags.indexOf(tagsFilter)!==-1 &&disable==disableFilter){return true;}
                }
              }
            }
          }
          else{
            if(nameFilter==""){
              if(tagsFilter==""){
                if(disableFilter=="true"){
                  if(id.indexOf(idFilter)!==-1 && disable==disableFilter){return true;}
                }
                else{
                  if(id.indexOf(idFilter)!==-1 && disable==disableFilter){return true;}
                }
              }
              else{
                if(disableFilter=="true"){
                  if(id.indexOf(idFilter)!==-1 && tags.indexOf(tagsFilter)!==-1 && disable==disableFilter ){return true;}
                }
                else{
                  if(id.indexOf(idFilter)!==-1 && tags.indexOf(tagsFilter)!==-1 && disable==disableFilter ){return true;}
                }
              }
            }
            else{
              if(tagsFilter==""){
                if(disableFilter=="true"){
                  if(id.indexOf(idFilter)!==-1 && name.indexOf(nameFilter)!==-1 && disable==disableFilter){return true;}
                }
                else{
                  if(id.indexOf(idFilter)!==-1 && name.indexOf(nameFilter)!==-1 && disable==disableFilter){return true;}
                }

              }
              else{
                if(disableFilter=="true"){
                  if(id.indexOf(idFilter)!==-1 && name.indexOf(nameFilter)!==-1 &&tags.indexOf(tagsFilter)!==-1 && disable==disableFilter){return true;}
                }
                else{
                  if(id.indexOf(idFilter)!==-1 && name.indexOf(nameFilter)!==-1 &&tags.indexOf(tagsFilter)!==-1 && disable==disableFilter){return true;}
                }
              }
            }
          }
        }
        else{
          if(idFilter==""){
            if(nameFilter==""){
              if(tagsFilter==""){
                if(disableFilter=="true"){
                  if(desc.indexOf(descFilter)!==-1&&disable==disableFilter){return true;}
                }
                else{
                  if(desc.indexOf(descFilter)!==-1&&disable==disableFilter){return true;}
                }
              }
              else{
                if(disableFilter=="true"){
                  if(desc.indexOf(descFilter)!==-1 && tags.indexOf(tagsFilter)!==-1 &&disable==disableFilter){return true;}
                }
                else{
                  if(desc.indexOf(descFilter)!==-1 && tags.indexOf(tagsFilter)!==-1 &&disable==disableFilter){return true;}
                }
              }
            }
            else{
              if(tagsFilter==""){
                if(disableFilter=="true"){
                  if(desc.indexOf(descFilter)!==-1 && name.indexOf(nameFilter)!==-1 && disable==disableFilter){return true;}
                }
                else{
                  if(desc.indexOf(descFilter)!==-1 && name.indexOf(nameFilter)!==-1 && disable==disableFilter){return true;}
                }
              }
              else{
                if(disableFilter=="true"){
                  if(desc.indexOf(descFilter)!==-1 && name.indexOf(nameFilter)!==-1 && tags.indexOf(tagsFilter)!==-1 && disable==disableFilter){return true;}
                }
                else{
                  if(desc.indexOf(descFilter)!==-1 && name.indexOf(nameFilter)!==-1 && tags.indexOf(tagsFilter)!==-1 && disable==disableFilter){return true;}
                }
              }
            }
          }
          else{
            if(nameFilter==""){
              if(tagsFilter==""){
                if(disableFilter=="true"){
                  if(desc.indexOf(descFilter)!==-1 && id.indexOf(idFilter)!==-1 && disable==disableFilter){return true;}
                }
                else{
                  if(desc.indexOf(descFilter)!==-1 && id.indexOf(idFilter)!==-1 && disable==disableFilter){return true;}
                }
              }
              else{
                if(disableFilter=="true"){
                  if(desc.indexOf(descFilter)!==-1 && id.indexOf(idFilter)!==-1 && tags.indexOf(tagsFilter)!==-1&& disable==disableFilter){return true;}
                }
                else{
                  if(desc.indexOf(descFilter)!==-1 && id.indexOf(idFilter)!==-1 && tags.indexOf(tagsFilter)!==-1&& disable==disableFilter){return true;}
                }

              }

            }
            if(tagsFilter==""){
              if(disableFilter=="true"){
                if(desc.indexOf(descFilter)!==-1 && id.indexOf(idFilter)!==-1 && name.indexOf(nameFilter)!==-1 && disable==disableFilter){return true;}
              }
              else{
                if(desc.indexOf(descFilter)!==-1 && id.indexOf(idFilter)!==-1 && name.indexOf(nameFilter)!==-1 && disable==disableFilter){return true;}
              }

            }
            else{
              if (disableFilter=="true"){
                if(desc.indexOf(descFilter)!==-1 && id.indexOf(idFilter)!==-1 && name.indexOf(nameFilter)!==-1 && tags.indexOf(tagsFilter)!==-1 && disable==disableFilter){return true;}
              }
              else{
                if(desc.indexOf(descFilter)!==-1 && id.indexOf(idFilter)!==-1 && name.indexOf(nameFilter)!==-1 && tags.indexOf(tagsFilter)!==-1 && disable==disableFilter){return true;}
              }
            }
          }
        }
        return false;
      }
    );

  // When the document is fully loaded, create the table, make it responsive and add listener on inputs
    $(document).ready(function() {
      var table = $('#tableSensors').DataTable({
        responsive: true,
        "pageLength": 10
      } );

      $('#descrFilter').keyup( function() {
        table.draw();
      } );

      $('#idFilter').keyup( function() {
        table.draw();
      } );

      $('#nameFilter').keyup( function() {
        table.draw();
      } );

      $('#tagsFilter').keyup( function() {
        table.draw();
      } );

      $('#idFilter').keyup( function() {
        table.draw();
      } );

      $('#disableFilter').click( function() {
        table.draw();
      } );
    } );

}
