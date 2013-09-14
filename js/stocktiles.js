//initialize default data array
var defaultSymbols = new Array();

//variable used to start and stop refresh
var refreshVar;

//default refresh rate in seconds
var time = 2;

//the name of the parent div to output the data to
var divName = 'quoteContent';

//the amount of days the cookie will be set for
var sessionTime = 1;




//format JSON data into multi-tiered unordered lists for output
function formatJsonOLD(data, parentSymbol) {
	//initialize variables
	var list   = '';
	var error  = false;
	var symbol = ''; 	
	        	
	if (data != null) {
	    //if the data is properly validated as JSON
	    if (typeof(data) == 'object') {
			
	    	//add CSS id property to the unordered lists so they can be differentiated from the main unordered list
	    	var isquote = (parentSymbol != undefined) ? ' id = "detailed_data" ': '';
	        
	        //display the start of the unordered list whether it is a sub list or not
	        list = list + '<ul' + isquote + '>';
	        
	        //traverse through entire JSON object
	        for (var i in data) {
	            // if there was an error pulling the data return a proper response
	            if (i == 'error') {
	            	error = true;
	            }
	    		
	    		//save to symbol value so it can later be set to the associated minus button name
	    		if (i == 'symbol') {
	    			symbol = data[i];	
	    		}
	    		
	    		//output properly formatted list heading
	            list = list + ('<li id="' + i + '">');
	            
	            //check for null values on stock symbols not found
	            var nullcheck = '';
	            if (data[i] != null) {
	            	//recursively add data to list until end of branch (allows multilevel unordered lists)
	            	nullcheck = formatJson(data[i], symbol);
	            } 
	            list = list + nullcheck;
	        }
            
	        //if not a specific stock quote then don't show the remove button
	        var button = "";
	        if (symbol != "") {
	        	button = "<li><input id='qtyminus' type='button' value='-' class='qtyminus' name='"+symbol.toUpperCase()+"'/></li>";
	        }
	        
	        //end of unordered list (w or w/o a button) + (w or w/o an anchor link)
	        list = list + button + "</ul>";
	    } 
	    else {
		        list = list + '<a href = "http://www.google.com/finance?q=' + parentSymbol + '" target="_blank">' + data + '</a>';  
	    }
	  //if error then return a "Loading.." prompt else output data
	  return (error == true) ? '<ul><li>Loading...</li></ul>' : list;
  }
  //return an empty string (for formating purposes)
  return '';
}



function formatJson (quoteList, count) {
	var ulString = "<ul id='quoteList'>";
	var transPlusMinus = {
		'+' : 'plus',
		'-' : 'minus'
	};	
	
	for (var i = 0; i < count; i++) {	
		var stockData = (count == 1 ? quoteList : quoteList[i]); 
		var plusMinus = stockData.PercentChange[0];
		
		//error checking for non-existent - don't show non-existent stocks in lise
		if ((stockData.MarketCapitalization !== null) && (stockData.PreviousClose !== null)) {
			ulString += "<li class='quote " + transPlusMinus[plusMinus] + "'>";
			
				ulString += "<button type='button' value='-' class='qtyminus' name='" + stockData.symbol.toUpperCase() + "'>-</button>";
				
				ulString += "<ul class='quoteDetailsList'>";
					ulString += "<li class='symbol'>" + stockData.symbol + "</li>";
					ulString += "<li class='name'>" + stockData.Name + "</li>";
					ulString += "<li class='marketCap'>" + stockData.MarketCapitalization + "</li>";		
					ulString += "<li class='lastTradePrice'>" + stockData.LastTradePriceOnly + "</li>";		
					ulString += "<li class='percentChange'>" + stockData.PercentChange + "</li>";
					ulString += "<li class='previousClose'>" + stockData.PreviousClose + "</li>";
				ulString += "</ul>";
			
			ulString += "</li>";
		}
	}
	ulString += "</ul>";
	return ulString;
}


//write updated data to cookie file
function writeCookie(name,value,days) {
    var date, expires;
    if (days) {
        date = new Date();
        date.setTime(date.getTime()+(days*24*60*60*1000));
        expires = "; expires=" + date.toGMTString();
    } 
    else {
        expires = "";
    }
    document.cookie = name + "=" + value + expires + "; path=/";
}


//read cookie data from file
function readCookie(name) {
    var i, c, ca, nameEQ = name + "=";
    ca = document.cookie.split(';');
    for(i = 0; i < ca.length; i++) {
        c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1, c.length);
        }
        if (c.indexOf(nameEQ) == 0) {
            return c.substring(nameEQ.length, c.length);
        }
    }
    return '';
}

//load Cookie value from cookie file
function loadCookie(){
	//if cookie data exists then load data else load default symbols GOOG and AAPL 
	var cookieValue = readCookie('quoteWidget');
	if (cookieValue) {
		//rebuild array from cookie data string (cookies only store strings)
		defaultSymbols = cookieValue.split(",");
	}
	else
		defaultSymbols = Array("GOOG","AAPL");
}

//get and save sub-data of a JSON object by name
function breakJsonBranch(data, name) {
	//traverse through the object branches
	for (var key in data) {
		//if matching branch is found
		if (key == name) {
			//get branch data and exit loop
			return data[key];
		}
	}
	//if branch not found return null
	return null;
}


//use AJAX to get data from PHP script
function get_data(symbols) {
	//get data from PHP script if there is at least one symbol
	if (symbols.toString() !== '') {
		xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange = function()
	  	{
	  		//if the results are fully processed and status is OK
	  		if ((xmlhttp.readyState == 4) && (xmlhttp.status == 200))
	    	{
	    		//save data from AJAX response from PHP script
	    		var data = xmlhttp.responseText;			
				
					//change data from string to JSON object
					jsonData = jQuery.parseJSON(data);
					var quoteCount = jsonData.query.count;
					if (jsonData.query.results.quote != null){	
						var quoteList = jsonData.query.results.quote;
					}
					
					//if (quoteList != null) {
	    		document.getElementById(divName).innerHTML = formatJson(quoteList, quoteCount);
	    		//}
	    
	    	}
	  	}
		
		xmlhttp.open("GET","quotes.php?q="+ symbols.toString(),true);	
		xmlhttp.send();
	}
}


//clear all symbols from page
function removeAll(){
	//if the list is not already empty
	if (defaultSymbols.length !== 0) {
		//stop pulling for new data
		stopRefresh();
		
		//clear out the symbols list
		defaultSymbols = [];
		
		//clear out the cookie values
		writeCookie('quoteWidget', defaultSymbols, sessionTime);
		
		//remove elements from list on screen
		$('#quoteList li').remove();
		
		//update the screen
		startRefresh(time);
	}	
}


//parse inputed symbols and separately add them if a comma is present
function parseSymbols() {
	//format string for passing in url by removing all special characters, whitespace and numbers
	var symbol = $('.stockSymbol').val().toUpperCase().replace(/[^A-Za-z0-9.:,]/g, "");
	
	//separate comma separated string into an array
	var symbolList = symbol.split(',');
	
	//for each item in symbolList add it to the tiles
	for (i = 0; i < symbolList.length; i++) {
		addSymbol(symbolList[i]);
	}
}


//add stock symbol to data list from textbox
function addSymbol(symbol) {
	//if not empty and the symbol doesn't already exist 
	if ((symbol) && (defaultSymbols.indexOf(symbol) == -1 )) {
		defaultSymbols.push(symbol.toUpperCase());
		//sort alphabetically
		defaultSymbols.sort();
		get_data(defaultSymbols);
	}

	//update cookie data
	writeCookie('quoteWidget', defaultSymbols, sessionTime);

	//reset input field to blank and set focus
	$('.stockSymbol').val("");
	$('.stockSymbol').focus();		
}


//set the refresh rate and display data
function startRefresh(seconds) {
	refreshVar = setInterval(function(){$(divName).text(get_data(defaultSymbols));},seconds * 1000);	
}


//stop the refresh rate to allow for computation
function stopRefresh(){
	clearInterval(refreshVar);
}


//jQuery to reload page every second 
$(document).ready(function () {
	//wrap a new div around the stock data and the input field
	$('#' + divName).wrapAll('<div id="quoteData" />');
	
	//start displaying data at set refresh rate
	startRefresh(time);
	
	//add input textbox to add new symbols
	$("#quoteData").prepend("<div id='addStock'>" + 
	"<input type='text' size='15' class='stockSymbol' />" +
	"<button type='submit' value='+' class='qtyplus'>+</button>" +
	"<button type='submit' value='--' class='allMinus'>Clear All</button>" +
	"</div>");
	
	//get saved symbols from previous session
	loadCookie();
});


//remove item from list if the minus sign is clicked
$(document).on('click', '.qtyminus', function() {
	//stop refreshing to allow for code to run
	stopRefresh();
	
	//get symbol and remove it from the list
	symbol = $(this).attr('name');
	defaultSymbols.splice(defaultSymbols.indexOf(symbol), 1);
	$(this).parents('li').remove();
	
	//update cookie data
	writeCookie('quoteWidget', defaultSymbols, sessionTime);
	
	//start back refresh updates after cookies is written to
	get_data(defaultSymbols);
	startRefresh(time);
});


//remove all items from list when the remove all is clicked
$(document).on('click', '.allMinus', function() {
	removeAll();
});


//add an item to the list of the plus sign is clicked
$(document).on('click','.qtyplus', function() {
	 parseSymbols();		
});


//trigger the add symbol function when enter is pressed
$(document).on('keypress', '.stockSymbol', function (e) {
   if ( e.keyCode == 13 ){
       parseSymbols();
    }
});


//show initial results before update script is set
get_data(defaultSymbols);