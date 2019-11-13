<script>
		document.getElementById('D1-on').addEventListener('click', function() {
				var ip = document.getElementById('ip').value;
				var url = "http://"+ ip + "/D1/1"
				var settings = {
				"async": true,
				"crossDomain": true,
				"url": url,
				"method": "GET",
				"headers": {
					"cache-control": "no-cache",
					'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'
					
					}
				}
				$.ajax(settings).done(function (response) {
				});
		});
		document.getElementById('LEFT').addEventListener('click', function() {
				var ip = document.getElementById('ip').value;
				var url = "http://"+ ip + "/D3/1"
				var settings = {
				"async": true,
				"crossDomain": true,
				"url": url,
				"method": "GET",
				"headers": {
					"cache-control": "no-cache",
					'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'
					
					}
				}
				$.ajax(settings).done(function (response) {
				});
		});
		

		document.getElementById('RIGHT').addEventListener('click', function() {
				var ip = document.getElementById('ip').value;
				var url = "http://"+ ip + "/D3/0"
				var settings = {
				"async": true,
				"crossDomain": true,
				"url": url,
				"method": "GET",
				"headers": {
					"cache-control": "no-cache",
					'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'
					
					}
				}
				$.ajax(settings).done(function (response) {
				});
		});

		document.getElementById('D1-off').addEventListener('click', function() {
				var ip = document.getElementById('ip').value;
				var url = "http://"+ ip + "/D1/0"
				var settings = {
				"async": true,
				"crossDomain": true,
				"url": url,
				"method": "GET",
				"headers": {
					"cache-control": "no-cache",
					'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'
					
					}
				}
				$.ajax(settings).done(function (response) {
				});
		});
		
		


		document.getElementById('D2-on').addEventListener('click', function() {
				var ip = document.getElementById('ip').value;
				var url = "http://"+ ip + "/D2/1"
				var settings = {
				"async": true,
				"crossDomain": true,
				"url": url,
				"method": "GET",
				"headers": {
					"cache-control": "no-cache",
					'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'
					
					}
				}
				$.ajax(settings).done(function (response) {
				});
		});
		
		document.getElementById('D2-off').addEventListener('click', function() {
				var ip = document.getElementById('ip').value;
				var url = "http://"+ ip + "/D2/0"
				var settings = {
				"async": true,
				"crossDomain": true,
				"url": url,
				"method": "GET",
				"headers": {
					"cache-control": "no-cache",
					'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'
					
					}
				}
				$.ajax(settings).done(function (response) {
					console.log(response);
				});
		});
		
		
	</script>