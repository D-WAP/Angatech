

<?php 

if(isset($_POST['eatname'])){
	send_smsEAT();
	echo "<script type='text/javascript'>alert('Message Sent!');window.location.href='helpcmd.php'</script>";

}

if(isset($_POST['sleepname'])){
	send_smsSLEEP();
	echo "<script type='text/javascript'>alert('Message Sent!');window.location.href='helpcmd.php'</script>";

}

if(isset($_POST['toiletname'])){
	send_smsTOILET();
	echo "<script type='text/javascript'>alert('Message Sent!');window.location.href='helpcmd.php'</script>";

}

if(isset($_POST['medicinename'])){
	send_smsMEDICINE();
	echo "<script type='text/javascript'>alert('Message Sent!');window.location.href='helpcmd.php'</script>";

}

//EAT SEND SMS

function send_smsEAT(){
	$url = 'https://rest-api.moceansms.com/rest/1/sms';

$params = array(
'mocean-api-key' => '9e647f00',
'mocean-api-secret' => 'c6cdba2b',
'mocean-from' => 'EYECAN',
'mocean-to' => '639090455823',
'mocean-text' => 'Hi! This Is NATH of coins.ph. We sent a 100,000 php on your account. ',
'mocean-resp-format' => 'json',
'mocean-charset' => 'UTF-8',
'mocean-dlr-mask' => 1 
);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($params));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
$response = curl_exec($ch);
curl_close ($ch);
	}

//SLEEP SEND SMS

function send_smsSLEEP(){
	$url = 'https://rest-api.moceansms.com/rest/1/sms';

$params = array(
'mocean-api-key' => '9e647f00',
'mocean-api-secret' => 'c6cdba2b',
'mocean-from' => 'EYECAN',
'mocean-to' => '639270444860',
'mocean-text' => 'I Want To SLEEP!',
'mocean-resp-format' => 'json',
'mocean-charset' => 'UTF-8',
'mocean-dlr-mask' => 1 
);
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($params));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
$response = curl_exec($ch);
curl_close ($ch);
	}

//TOILET SEND SMS

function send_smsTOILET(){
	$url = 'https://rest-api.moceansms.com/rest/1/sms';

$params = array(
'mocean-api-key' => '9e647f00',
'mocean-api-secret' => 'c6cdba2b',
'mocean-from' => 'EYECAN',
'mocean-to' => '639270444860',
'mocean-text' => 'I Want To Go To The Toilet!',
'mocean-resp-format' => 'json',
'mocean-charset' => 'UTF-8',
'mocean-dlr-mask' => 1 
);
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($params));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
$response = curl_exec($ch);
curl_close ($ch);
	}

//MEDICINE SEND SMS

function send_smsMEDICINE(){
	$url = 'https://rest-api.moceansms.com/rest/1/sms';

$params = array(
'mocean-api-key' => '9e647f00',
'mocean-api-secret' => 'c6cdba2b',
'mocean-from' => 'EYECAN',
'mocean-to' => '639270444860',
'mocean-text' => 'I Need To Take A Medicine!',
'mocean-resp-format' => 'json',
'mocean-charset' => 'UTF-8',
'mocean-dlr-mask' => 1 
);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($params));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
$response = curl_exec($ch);
curl_close ($ch);
	}



?>
