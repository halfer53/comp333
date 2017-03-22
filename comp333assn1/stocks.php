<?php
	//the reason to use a single php page rather than multiple php page is because I want to check the username and password every time a post is sent
	//if I were to use multiple php page, then there are redundant code (which check the username and password) in every php page
	//, since I don't know how to import and make custom library in php
	
	$con = mysqli_connect("mysql.cms.waikato.ac.nz","jt136","dragon53", "jt136");
	if($con){
		$query = "select * from Users";
		//get results using the query
		if($result = mysqli_query($con, $query)){
			$username = $_POST['username'];
			$password = $_POST['password'];
			
			//if 1, it displays all the visible companies for this user; if 0, display all the invisible companies for this user
			$visible = isset($_POST['visible']) ? $_POST['visible'] :null;
			
			//display specific content
			$specStockID = isset($_POST['specStockID']) ? $_POST['specStockID'] :null;
			
			//make specific stock id visible to certain user
			$changeVisibleID = isset($_POST['changeVisibleID']) ? $_POST['changeVisibleID'] :null;
			
			//make specific stock id not visible to certain user
			$changeInvisibleID = isset($_POST['changeInvisibleID']) ? $_POST['changeInvisibleID'] :null;
			
			//change notes for specific user for specific stock
			$stockIDforNotes = isset($_POST['stockIDforNotes']) ? $_POST['stockIDforNotes'] :null;
			$notesContent = isset($_POST['notesContent']) ? $_POST['notesContent'] :null;
			
			testfield($visible,$specStockID,$changeVisibleID,$changeInvisibleID,$stockIDforNotes);
			
			
			//get every row in the database
			while($row = mysqli_fetch_assoc($result)){
				if($row['username'] == $username && $row['password'] == $password){
					if($specStockID != null){
						displayStocks($con,$row['uid'],$specStockID,null);
					}
					else if($changeVisibleID != null){
						changeVisible($con,$row['uid'],$changeVisibleID,1);
						
					}
					else if($changeInvisibleID != null){
						
						changeVisible($con,$row['uid'],$changeInvisibleID, 0);

					}
					else if($stockIDforNotes != null){
						updatenotes($con,$row['uid'],$stockIDforNotes,$notesContent);
					}
					else{	
						displayStocks($con,$row['uid'],null,$visible);
					}
					return;
				}
			}
			//if no user with correct password can be found, then it returns error
				header('HTTP/1.0 401 Unauthorized');
				echo "password or username are wrong";
				exit;
		}
		//if connection to database fails
		else{
			error500();
		}
	}
	else{
		error500();
	}
	
	function error500(){
		header("HTTP/1.1 500 Internal Server Error");
		echo "failure to connect to database";
		exit;
	}
	
	//test if the parameters are correct
	function testfield($visible,$specStockID,$changeVisibleID,$changeInvisibleID,$stockIDforNotes){
		$testingparameter = znull($visible)+znull($specStockID)+znull($changeInvisibleID)+znull($changeVisibleID);
		//only one of the four parameters above can present in a single post
		//or none of them present
			if( $testingparameter != 1 && $testingparameter != 0){
				header('HTTP/1.1 407 Expectation Failed');
				echo "please provide proper parameteraa";
				exit;
			}
			//if none of the previous 4 parameters present, then the $stockIDforNotes must present
			//note that $notesContent can be null because of empty content in the textarea
			if($testingparameter == 0 && $stockIDforNotes==null){
				header('HTTP/1.1 407 Expectation Failed');
				echo "please provide proper parameter";
				exit;
			}
	}
	
	//return the stocks info to the caller
	//first parameter $con is the mysqli_connection
	//second parameter is the username
	//thrid parameter is the company's id
	//fourth parameter determines whether display the added companies  (1) or the removed companities (0)
	//if third and fourth are null, then we echo all the companies info
	function displayStocks($con,$uid,$specStockID,$visible){
		if($specStockID != null && $visible !=null){
			header('HTTP/1.1 407 Expectation Failed');
			echo "specStockID and visible cannot present at the same time";
			exit;
		}
		
		
		$query = "";
		if($specStockID != null){
			$query = "SELECT distinct `Stocks`.*, `relation`.`notes`
						FROM `Stocks`, `relation`
						WHERE ((`Stocks`.`id` = `relation`.`stockid`)AND (`relation`.`uid`= ".$uid.")AND( `Stocks`.`id` =".$specStockID."))";	
		}
		
		else if($visible != null){
			$query = "SELECT distinct `Stocks`.*, `relation`.`notes`
						FROM `Stocks`, `relation`
						WHERE ((`Stocks`.`id` = `relation`.`stockid`)AND (`relation`.`uid`= ".$uid.")AND(`relation`.`visible` = ".$visible."))";
		}
		
		else {
			$query = "select * from Stocks";
		}
		
		$stocks = array();
		if($result = mysqli_query($con,$query)){
			while($row = mysqli_fetch_assoc($result)){
					$stocks[] = $row;
			}
			//return the jason encoded contents
			echo json_encode($stocks);
		}
		else{
			error500();
		}
	}
	
	//update notes for specific company
	function updatenotes($con,$uid,$stockid,$notes){
		$query = "update `relation` set `relation`.`notes` = '".$notes."' where `relation`.`uid` =".$uid." AND `relation`.`stockid`=".$stockid.";";
		$selection = "select * from `relation` where `relation`.`uid` =".$uid." AND `relation`.`stockid`=".$stockid;
		if($result = mysqli_query($con, $selection)){
			if($result->num_rows > 0){
				//test the select query first to ensure data safety
				$con ->query($query);
				echo "successfully updated the notes for this company";
			}else{
				error500();
			}
		}else{
				error500();
		}
	}
	
	//add or remove companies from the user pannel
	function changeVisible($con,$uid,$stockid,$visible){
		

			$query = "update `relation` set `relation`.`visible` = ".$visible." where `relation`.`uid` =".$uid." AND `relation`.`stockid`=".$stockid.";";
			$selection = "select * from `relation` where `relation`.`uid` =".$uid." AND `relation`.`stockid`=".$stockid;

			if($result = mysqli_query($con, $selection)){
				if($result->num_rows > 0){
					//test the select query first to ensure data safety
					$con ->query($query);
				}else{
					error500();
				}
			}else{
					error500();
			}
		$action = $visible == 1 ? "add":"remove";
		displayStocks($con,$uid,null,1);
		
	}
	
	//return 1 if input is not null, otherwise 0
	function znull($input){
		if($input == null){
			return 0;
		}
		else {
			return 1;
		}
	}
	
	
	mysqli_close($con);
?>
