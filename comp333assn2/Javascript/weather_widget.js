/*
 * Constructor function for a WeatherWidget instance.
 * 
 * container_element : a DOM element inside which the widget will place its UI
 *
 */
 
function WeatherWidget(container_element){

	//declare the data properties of the object 
	var _sortMethod = 0;
	//0 for sorting by town
	//1 for sorting by max temp
	
	var _request;
	
	var _list = new Array();
	//list containing the list of weather data
	
	//declare an inner object literal to represent the widget's UI
	var _ui = {
		container:null,
		//general container containing all the elements
		title:null,
		//title contains selectTown and updateBTN
		selection:null,
		//select down provides a dropdown list for users to select a town
		btnUpdate:null,
		//a button to update the list, basically sending request to the server
		content:null,
		//content contains radio checkbox button and list 
		sortby:null,
		//sort by is a div container containing text, two checkboxes, one is sortbytown, one is sortby maxtemp
		list:null
		//list of weather lines
		
		
	}

	//write a function to create and configure the DOM elements for the UI
	var _createUI = function(container){
		_ui.container = container;
		_ui.container.className = "monitor";
		
		_ui.title = document.createElement("div");
		_ui.title.className = "title";
		
		//intialising selection
		_ui.selection = document.createElement("div");
		_ui.selection.className = "selection toolbar";
		//label for selection container
		_ui.selection.label = document.createElement("span");
		_ui.selection.label.className = "section_label";
		_ui.selection.label.innerHTML = "Select Town: ";
		//selector for selection container
	    _ui.selection.selector = document.createElement("select");
	    _ui.selection.selector.id = "selector";
	    _ui.selection.selector.onchange = function(){
	    	var town = this.options[this.selectedIndex].text;
	    	_GetWeatherOfSelectedCity(town);
	    }
	    var option0 = document.createElement("option");
	    option0.text = "";
	    var option1 = document.createElement("option");
	    option1.text = "Hamilton";
	    var option2 = document.createElement("option");
	    option2.text = "Auckland";
	    var option3 = document.createElement("option");
	    option3.text = "Christchurch";
	    var option4 = document.createElement("option");
	    option4.text = "Dunedin";
	    var option5 = document.createElement("option");
	    option5.text = "Tauranga";
	    var option6 = document.createElement("option");
	    option6.text = "Wellington";
	    _ui.selection.selector.add(option0);
	    _ui.selection.selector.add(option1);
	    _ui.selection.selector.add(option2);
	    _ui.selection.selector.add(option3);
	    _ui.selection.selector.add(option4);
	    _ui.selection.selector.add(option5);
	    _ui.selection.selector.add(option6);
	    //add selector and label to selection container
		_ui.selection.appendChild(_ui.selection.label);
		_ui.selection.appendChild(_ui.selection.selector);
		
		//intialising update button
		_ui.btnUpdate = document.createElement("input");
		_ui.btnUpdate.setAttribute("type", "button");
		_ui.btnUpdate.setAttribute("value", "Update");
		_ui.btnUpdate.onclick = function(){_update();};
		
		//add selection and update button to title
		_ui.title.appendChild(_ui.selection);
		_ui.title.appendChild(_ui.btnUpdate);
		
		_ui.container.appendChild(_ui.title);
		//title intialisation finished
		
		_ui.content = document.createElement("div");
		_ui.content.className = "section";
		
		//intialise sortby section
		_ui.sortby = document.createElement("div");
		_ui.sortby.className = "toolbar";
		_ui.sortby.label = document.createElement("span");
		_ui.sortby.label.className = "section_label";
		_ui.sortby.label.innerHTML = "Sort By: ";
		//intialise sort by town input
		_ui.sortby.town = document.createElement("input");
		_ui.sortby.town.setAttribute("type","radio");
		_ui.sortby.town.setAttribute("value","0");
		_ui.sortby.town.checked = true;
		_ui.sortby.town.onclick = function(){
			//deselect the other radio input since we do not have common name for those two inputs
			_ui.sortby.maxtemp.checked = false;
			_sortMethod = this.value;
			_refresh();
		};
		_ui.sortby.town.label = document.createElement("label");
		_ui.sortby.town.label.innerHTML = "Town";
		
		//intialise sort by max temp input 
		_ui.sortby.maxtemp = document.createElement("input");
		_ui.sortby.maxtemp.setAttribute("type","radio");
		_ui.sortby.maxtemp.setAttribute("value","1");
		_ui.sortby.maxtemp.onclick = function(){
			//deselect the other radio input since we do not have common name for those two inputs
			_ui.sortby.town.checked = false;
			_sortMethod = this.value;
			_refresh();
		};
		_ui.sortby.maxtemp.label = document.createElement("label");
		_ui.sortby.maxtemp.label.innerHTML = "Max Temperature";
		
		//add label, town radio input and max temp radio input to sortby section
		_ui.sortby.appendChild(_ui.sortby.label);
		_ui.sortby.appendChild(_ui.sortby.town);
		_ui.sortby.appendChild(_ui.sortby.town.label);
		_ui.sortby.appendChild(_ui.sortby.maxtemp);
		_ui.sortby.appendChild(_ui.sortby.maxtemp.label);
		
		//intialise list section for weather lines
		_ui.list = document.createElement("ul");
		_ui.list.className = "list";
		
		_ui.content.appendChild(_ui.sortby);
		_ui.content.appendChild(_ui.list);
		
		_ui.container.appendChild(_ui.content);
	}
	
	
	//put all the Wlines's Town Name in a separate list, then return the JSON stringified data
	var _ParseTownToJSON = function (list) {
		var townNames = [];
		for (var i=0;i<list.length;i++) {
			townNames.push(_list[i].getTown());
		}
		return JSON.stringify(townNames);
	}
	
	
	
	//send all the towns in the list as parameter to the server, to update the info
	var _update = function(){
		var data = "town="+_ParseTownToJSON(_list);
		_sendPostRequest("PHP/weather.php",'application/x-www-form-urlencoded',_UpdateLists,data);
		//empty the list before update
		_list = [];
	}
	
	//send the request with argument of a specific town
	var _GetWeatherOfSelectedCity = function(townSelected){
		for(var i=0;i<_list.length;i++){
			if(_list[i].getTown().localeCompare(townSelected) == 0){
				//if this town selected is alreaady in the _list
				alert("you've already selected this town");
				return;
			}
		}
		//the server only accepts Json stringified array, so we will have to put this town into a list first
		var list1 = [];
		list1.push(townSelected);
		var data1= JSON.stringify(list1);
		data1 = "town="+data1;
		
		_sendPostRequest("PHP/weather.php",'application/x-www-form-urlencoded',_UpdateLists,data1);
	}
	
	//common function to initialise ajax request
	var _sendPostRequest = function(nurl,contenttype,callbackFunction,data){
		_request = new XMLHttpRequest();
		_request.open("POST", nurl, true);
		_request.setRequestHeader('Content-Type', contenttype);
		_request.onreadystatechange = callbackFunction;
		_request.send(data);
	}
	//ajax callback function , check if the data is returned, if yes, add the new data into _list, then call _refresh to display the new data in the ui
	var _UpdateLists = function(){
		if(_request.readyState == 4){
				if(_request.status == 200){
					var response = JSON.parse(_request.responseText);
					for(var i=0;i<response.length;i++){
						var newtown = new WLine(response[i].town,response[i].outlook,response[i].min_temp,response[i].max_temp);
						_list.push(newtown);
					}
					
					_refresh();
				}
				else{alert(_request.responseText);}
		}
	}
	//empty the ui list first, then update the ui list using _list
	var _refresh = function(){
	  _ui.list.innerHTML = "";	
	  
	  	if (_sortMethod == 0) {
		  	  _list.sort(_townsort);
		}else if (_sortMethod == 1) {
		  	  _list.sort(_maxTempsort);
		}
		
	  for (var i=0;i<_list.length;i++) {
		  _ui.list.appendChild(_list[i].getDOM());
	  }
	}
	
	//custom sorting method for max temperature
	var _maxTempsort = function(a,b){
		return a.getMaxTemp() - b.getMaxTemp();
	}
	
	//custom sorting method for town sort
	var _townsort = function(a, b){
		if(a.getTown() > b.getTown())
			return 1;
		else if (a.getTown() < b.getTown())
			return -1;
		else
			return 0;
	}
	
	
	
	
	
	//add any other methods required for the functionality
	
	 
	 /**
	  * private method to intialise the widget's UI on start up
	  * this method is complete
	  */
	  var _initialise = function(container_element){
	  	_createUI(container_element);
	  	}
	  	
	  	
	/*********************************************************
	* Constructor Function for the inner WLine object to hold the 
	* full weather data for a town
	********************************************************/
	
	var WLine = function(wtown, woutlook, wmin, wmax){
		
		//declare the data properties for the object
		var _town = wtown;
		var _outlook = woutlook;
		var _min = wmin;
		var _max = wmax;
		//declare an inner object literal to represent the widget's UI
		
		var _ui = {
			//container contains all the elements
			container:null,
			//a span contain the name of the town
			townlabel:null,
			//a span containing the outlook
			outlooklabel:null,
			//a span containing the min temprature
			minlabel:null,
			//a span containing the max temprature
			maxlabel:null
		};

		//write a function to create and configure the DOM elements for the UI
		var _createUI = function(container){
			_ui.container = document.createElement("li");
			_ui.townlabel = document.createElement("span");
			_ui.townlabel.innerHTML = _town;
			_ui.outlooklabel = document.createElement("span");
			_ui.outlooklabel.innerHTML = _outlook;
			_ui.minlabel = document.createElement("span");
			_ui.minlabel.innerHTML = _min+"°";
			_ui.minlabel.className = "numeric";
			_ui.maxlabel = document.createElement("span");
			_ui.maxlabel.innerHTML = _max+"°";
			_ui.maxlabel.className = "numeric";
			_ui.container.appendChild(_ui.townlabel);
			_ui.container.appendChild(_ui.outlooklabel);
			_ui.container.appendChild(_ui.minlabel);
			_ui.container.appendChild(_ui.maxlabel);
		};
		
		//Add any remaining functions you need for the object
		
		this.getTown = function(){
			return _town;
		}
		
		this.getOutlook = function(){
			return _outlook;
		}
		
		this.getMinTemp = function(){
			return _min;
		}
		
		this.getMaxTemp = function(){
			return _max;
		}
		this.getDOM = function () {
			return _ui.container;
		}
		
	
		//_createUI() method is called when the object is instantiated
		_createUI();


	 
  	};  //this is the end of the constructor function for the WLine object 
	
	
	//  _initialise method is called when a WeatherWidget object is instantiated
	 _initialise(container_element);
}
	 
//end of constructor function for WeatherWidget 	 
	 
	 