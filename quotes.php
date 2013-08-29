<?php
	//if valid parameters are passed to the script
	if (isset($_GET['q']) && !empty($_GET['q'])) {
		//prepare YQL query statement	 
		$base_url      = "https://query.yahooapis.com/v1/public/yql?q="; 
		$criteria      = "'".str_replace(",","','",$_GET['q'])."'";
	  	$result_fields = 'symbol, Name, LastTradePriceOnly, PercentChange, PreviousClose, MarketCapitalization';
		
		// Form YQL query and build URI to YQL Web service
		$yql_query     = "select ".$result_fields." from yahoo.finance.quotes where symbol in (".$criteria.")";
		$yql_query_url = $base_url . urlencode($yql_query) . "&env=store://datatables.org/alltableswithkeys&format=json";
	 
		//turn off warnings if there is latency in the YAHOO API or obscure parameters are entered then try to get data 
		$current_error_reporting = error_reporting();
		error_reporting(0);
		
		// Make cURL call to pull JSON data 
		$session = curl_init($yql_query_url);
		curl_setopt($session, CURLOPT_RETURNTRANSFER, true);
		$json = strip_tags(curl_exec($session));
		
		//set error reporting to original state
		error_reporting($current_error_reporting);
		  
	 	//return output of script
	 	echo $json;
	}
?>