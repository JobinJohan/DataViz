/*Author: Johan Jobin, University of Fribourg 2018
  Description: This file contains functions that manage cookies
               for the authentification on Bbdata
*/



/*function getCookie:
  cname: the name of the cookie
  Description: This function looks for the specified cookie. It returns an empty
              list if not found and the content of the cookie if found
*/

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie); //useful to drop $ character in URL
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";  //return empty list in case not found

}

/*function checkConn:
  Description: This function checks if the necessary cookies for authentification
               are available, and if not, it redirect the user on the log in page
*/
function checkConn(){

// If the cookie whose name is "expiration" does not exist, create a date corresponding to 0 ms
// else get the content of the cookie "expiration"
  if(getCookie("expiration")==""){
    var d = new Date(0);
  }
  else{
    var d= new Date(parseInt(getCookie("expiration")));
  }

// If the cookie "key" and "expiration" exists and the above date is prior to now, return an empty string
  if(getCookie("key")!="" && getCookie("expiration")!="" && (d.getMilliseconds()<Date.now())){
    return "";
  }

// The cookies needed for authentification are not available, return to the log in page
  else{
    if(new RegExp("/BBData/connexionV2.html").test(document.location.pathname)){
      return "";
    }
  document.location="connexionV2.html";
  }
}
