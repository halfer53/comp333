		var logrequest = new XMLHttpRequest();
		var username = "";
		var password = "";
		
		function openlogin(){
			if(username == "" && password == ""){
				showLoginINFO();
			}
			else{
				username = "";
				password = "";
				//clear the user cookie
				
				showLoginINFO();
				displayLogIn();
				clearStockpannel();
				clearSpecStockpannel();
			}
			
		}
		//send login request to server, using username, password, and visible = 1
		function loginRequest(){
			username = document.getElementById("username").value;
			password = document.getElementById("password").value;
			var url = "stocks.php";
			var stockscontents = document.getElementById("stockscontents");
			
			stockscontents.innerHTML = "<img src='ajax-loader.gif'>";
			
			logrequest.onreadystatechange = displaystocks;
			
			logrequest.open("POST", url, true);
			logrequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
			logrequest.send("username="+username+"&password="+password+"&visible=1");
			//visible=1 means choose all the companies that is in the stocks panel for this user
		}
		
		//display the stocks in the user main pannel
		function displaystocks(){
			if(logrequest.readyState == 4){
				if(logrequest.status == 200){
					clearSpecStockpannel();
					hideLoginINFO();
					var response = JSON.parse(logrequest.responseText);
					var stockscontents = document.getElementById("stockscontents");
					var contents = "<table><tr><th>Company Name</th><th>Recent Change</th></tr>";
					//stocks html contents for intialisation
					
					for(var i = 0; i < response.length; i++){
							//company name as button, so as to display specific company information 
							//response[i].id which is the stockid, is the unique id for the company, that is sent as a parameter
							var companyname = "<tr onclick=" + "'JavaScript:sendSpecificStockRequest(" + response[i].id + ")'><td>"+response[i].companyname + "</td>";
							var recentchange;
							if(response[i].recentchange < 0){
								recentchange = "<td class='red'>"+response[i].recentchange + "</td></tr>";
							}
							else {
								recentchange = "<td>"+response[i].recentchange + "</td></tr>";
							}
							contents += companyname+recentchange;
					}
					contents += "</table>";
					contents += "<button onclick='JavaScript:SendDisplayInvisibleCompanies()' class='btn' id='btnDisplayInvisible'>Add</button>";
					//display all the stocks that are previously removed by the user
					stockscontents.innerHTML = contents;
				}
				else{
					alert(logrequest.responseText);
					clearStockpannel();
				}
			}
		}
		function hidebtnAdd () {
			var btnadd = document.getElementById("btnDisplayInvisible");
		  btnadd.className = "btn hidden";
		}
		
		function showbtnAdd(){
			var btnadd = document.getElementById("btnDisplayInvisible");
		  btnadd.className = "btn";
		}
		
		//display the LoginINFO
		function showLoginINFO(){
			//remove the hidden classname
			var loginINFO = document.getElementById("loginINFO");
			loginINFO.className = "loginINFO";
		}
		//display log in on openlogin button
		function displayLogIn(){
			//change button oplogin's appearance to Log In
			var openlogin = document.getElementById("openlogin");
			openlogin.innerHTML = "Log In";
		}
		//hide LoginINFO
		function hideLoginINFO(){
			//hide the Login session, and change button oplogin's appearance to Log out
			var loginINFO = document.getElementById("loginINFO");
			loginINFO.className = "loginINFO hidden";
			var openlogin = document.getElementById("openlogin");
			openlogin.innerHTML = "Log Out";
		}
		
		function clearStockpannel(){
			//clear stockscontents
			var stockscontents = document.getElementById("stockscontents");
			stockscontents.innerHTML = "";
		}
		function clearSpecStockpannel(){
			// clear Specstockscontents
			var specStockContent = document.getElementById("specStockContent");
			specStockContent.innerHTML = "";
		}
		
		function closeSpecINFO(){
			showbtnAdd();
			clearSpecStockpannel();
		}
		
		//send a request to server to get specific company information
		function sendSpecificStockRequest(stockid){
			if(username == "" && password == ""){
				alert("you have not logged in");
				return;
			}
			var url = "stocks.php";
			var specStockcontent = document.getElementById("specStockContent");
			specStockcontent.innerHTML = "<img src='ajax-loader.gif'>";
			
			logrequest.onreadystatechange = displaySpecStock;
			
			logrequest.open("POST", url, true);
			logrequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
			logrequest.send("username="+username+"&password="+password+"&specStockID="+stockid);
		}
		
		//display all the stocks that is visible (chosen by the user)
		function displaySpecStock(){
			if(logrequest.readyState == 4){
				if(logrequest.status == 200){
					hidebtnAdd();
					clearSpecStockpannel();
					var response = JSON.parse(logrequest.responseText);
					var specStockcontent = document.getElementById("specStockContent");
					var contents = "<table><tr><th>"+response[0].companyname+"</th><td></td></tr>";
					contents += "<tr><th>Current Price</th><td>" + response[0].currentprice + "</td></tr>";
					contents += "<tr><th>Recent Change</th><td>" + response[0].recentchange + "</td></tr>";
					contents += "<tr><th>Annual Change</th><td>" + response[0].annualtrend + "</td></tr>";
					contents += "<tr><th>Notes</th><td></td></tr>";
					contents += "</table>";
					contents += "<button onclick='JavaScript:closeSpecINFO()' class='btn' id='btncloseSpecINFO'>Close</button>";
					contents += "<button onclick='JavaScript:SendremoveCompany("+response[0].id+")' class='btn' id='btnRemoveCompany'>Remove</button>";
					
					//send remove button to remove any particular stock in the pannel 
					
					contents += "<textarea rows='4' cols='50' id='notes' readonly>"+ response[0].notes + "</textarea>";
					contents += "<button onclick='JavaScript:editnotes()' id='btnEditNotes' class='btn' >EDIT</button>";
					//edit note button to make notes textarea editable
					
					contents += "<button onclick='JavaScript:Sendsavenotes("+response[0].id+")' id='btnSaveNotes' class='hidden'>SAVE</button>";
					//save note button to save the notes content and send it to the server
					
					specStockcontent.innerHTML = contents;
				}
				else{
					alert(logrequest.responseText);
					clearSpecStockpannel();
				}
			}
		}
		//make edit notes button disappear, and make save notes button visible
		function editnotes(){
			document.getElementById("notes").readOnly = false;
			
			document.getElementById("btnEditNotes").className += " hidden";
			document.getElementById("btnSaveNotes").className = "";
		}
		
		//post to server the content of notes and stockid and username and password
		function Sendsavenotes(stockid){
			if(username == "" && password == ""){
				alert("you have not logged in");
				return;
			}
			var notesContent = document.getElementById("notes").value;
			var url = "stocks.php";
			
			logrequest.onreadystatechange = responseProcess;
			
			logrequest.open("POST", url, true);
			logrequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
			logrequest.send("username="+username+"&password="+password+"&stockIDforNotes="+stockid+"&notesContent="+notesContent);
			//stockIDforNotes is the id for which the notes are edited
			//notesContent is the new content of the notes
		}
		//general response, this is used for simple interaction ajax
		function responseProcess(){
			if(logrequest.readyState == 4){
				if(logrequest.status == 200){
					alert(logrequest.responseText);
				}
				else{
					alert(logrequest.responseText);
				}
			}
		}
		
		//send remove company request to server
		function SendremoveCompany(stockid){
			if(username == "" && password == ""){
				alert("you have not logged in");
				return;
			}
			var url = "stocks.php";
			
			logrequest.onreadystatechange = displaystocks;
			
			logrequest.open("POST", url, true);
			logrequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
			logrequest.send("username="+username+"&password="+password+"&changeInvisibleID="+stockid);
			//changeInvisibleID is the ID of stock that the user want to remove
		}0.02
		//send display all the removed stocks to server
		function SendDisplayInvisibleCompanies(){
			if(username == "" && password == ""){
				alert("you have not logged in");
				return;
			}
			var url = "stocks.php";
			logrequest.onreadystatechange = DisplayInvisibleCompanies;
			
			logrequest.open("POST", url, true);
			logrequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
			logrequest.send("username="+username+"&password="+password+"&visible="+0);
			//visible = 0 indicating all the stocks that is previously removed by the user
		}
		
		//display all the removed stocks in a new section
		function DisplayInvisibleCompanies(){
			if(logrequest.readyState == 4){
				if(logrequest.status == 200){
					var response = JSON.parse(logrequest.responseText);
					if (response.length == 0){
						alert("there is no other stocks to add");
					}
					else{
						var specStockContent = document.getElementById("specStockContent");
						var contents = "<h3>Select Stocks to Add</h3>";
						//stocks html contents for intialisation
						
						for(var i = 0; i < response.length; i++){
							contents += "<div class='item'>";
							contents += "<input type='radio' value='"+response[i].id+"' name='InvisibleCompany'>";
							contents += "<label>"+response[i].companyname+"</label>";
							contents += "</div>";
						}
						contents += "<button onclick='JavaScript:validateCheckbox()' class='btn'>Add</button>";
						//this button is the add button. if the user wants to selected any stocks to add, this is the buttont that user will click after that
						specStockContent.innerHTML = contents;
					}
				}
				else{
					alert(logrequest.responseText);
					clearSpecStockpannel();
				}
			}
		}
		//validate the radio checkbox to see if any of them is checked
		function validateCheckbox(){
			var checkboxes = document.getElementsByName('InvisibleCompany');
			var selected = "";
			for (var i=0; i<checkboxes.length; i++) {
			    if (checkboxes[i].checked) {
			    	//find a radio (checkbox) that is checked by the user
			        SendChangeVisibleCompany(checkboxes[i].value);
			        return;
			    }
			}
			alert("no stocks selected");
			
		}
		//send request to add one stock from the removed stock list
		function SendChangeVisibleCompany(stockid){
			if(username == "" && password == ""){
				alert("you have not logged in");
				return;
			}
			var url = "stocks.php";
			logrequest.onreadystatechange = displaystocks;
			
			logrequest.open("POST", url, true);
			logrequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
			logrequest.send("username="+username+"&password="+password+"&changeVisibleID="+stockid);
			//changeVisibleID is the id of stock that the user wants to add in the main stock pannel
		}
		
