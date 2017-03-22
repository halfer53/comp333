<?php

	/**************************
	 * Add your code to connect to your database here
	 */
	 $con = mysqli_connect("mysql.cms.waikato.ac.nz","jt136","dragon53", "jt136");
	 if($con){
	 	$query = "select * from weather";
		 if($result = mysqli_query($con, $query)){
		 	
			//check if the town presents
			if (isset($_POST['town'])) {
				$townJSON = $_POST['town'];
			}
			else {
				error407("town parameter expected");
			}
			

			//check if the data is in correct format
		 	$town =  checkfield($townJSON);

		 	$lines = array();
			 while($row = mysqli_fetch_assoc($result)){
			 	if (in_array($row['town'], $town)) {
			 		//find all the towns required by the user, and add it to $lines
					 $lines[] = $row;
				 }
			 }
			 echo json_encode($lines);
		 }
		 else{
		 	error500();
		 }
	 }
	 else {
		 error500();
	 }
	 
	 //check if all the parameters meet the expectation, data must be JSON stringified array
	 //if its not met, the the server exits and return error
	 //if its met, then return the decoded json as array
	 function checkfield($townJSONdata){
		 $townArray = json_decode(stripslashes($townJSONdata),TRUE);
		 
		 if($townArray == null){
		 	error407("wrong data, must be json");
		 }
		 return $townArray;
	 }
	 
	 //return error if the codes go wrong or connection is lost
	 function error500(){
	 	header("HTTP/1.1 500 Internal Server Error");
		echo "failure to connect to database";
		exit;
	 }
	 //return error is expectation is not met
	 function error407($message){
	 	header('HTTP/1.1 407 Expectation Failed');
				echo $message;
				exit;
	 }
	 
	 mysqli_close($con);
	
	
	

   /***************************
    * 
    * Add code here to query the DB for weather information for the given town
    * 
    * Construct a PHP array object containing the weather data 
    * and return as JSON
    * 
    */
   
	
?>

