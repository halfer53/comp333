<?php

    //check if we 've received latitude, if we do, set $latitude to the data, otherwise null
    $latitude = (isset($_POST['latitude'])) ? $_POST['latitude'] : null;

    $longtitude = isset($_POST['longtitude'])?$_POST['longtitude']: null;

    $query = (isset($_POST['query']))?$_POST['query']: null;

    checkfield($latitude,$longtitude,$query);

    $query = urlencode($query);//encode the query, replace white space with safe character

    $request = "https://maps.googleapis.com/maps/api/place/textsearch/json?location=".$latitude.",".$longtitude."&radius=500&query=".$query."&key=AIzaSyAMCC4YdelDN2baFMvSQOWEGShubLCX_is";
  //initialise the connection for the given URL
  $connection = curl_init($request);

  //configure the connection
  curl_setopt($connection, CURLOPT_HEADER, false);

  //provide the response as a string rather than
  //outputting it directly back to the browser
  curl_setopt($connection, CURLOPT_RETURNTRANSFER, true);

  //make the request and get the response
  $response = curl_exec($connection);
  if (!curl_errno($connection)) {
    switch ($info = curl_getinfo($connection, CURLINFO_HTTP_CODE)) {
      case 200:  # OK
        curl_close($connection);
        echo $response;
        break;
      default:
        //respond
        $http_codes = parse_ini_file("path/to/the/ini/file/I/pasted/above");
        header("HTTP/1.1 ".$info." ".$http_codes[$info['http_code']]);
        echo $response;
        exit;
    }
  }

  //check if all the parameter is correct;
  function checkfield($lat,$lng,$query){
    if($lat == null || $lng == null || $query == null){
      error407("please provide full parameter");
    }
  }
	 //return error is expectation is not met
	 function error407($message){
	 	header('HTTP/1.1 407 Expectation Failed');
				echo $message;
				exit;
	 }


?>
