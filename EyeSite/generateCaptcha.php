<!DOCTYPE html>
 <html class="no-js"> 
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title></title>
        <meta name="description" content="">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" integrity="sha384-1q8mTJOASx8j1Au+a5WDVnPi2lkFfwwEAa8hDDdjZlpLegxhjVME1fgjWPGmkzs7" crossorigin="anonymous">
        <link rel="stylesheet" href="softkeys-0.0.1.css">

        <style>
        
        </style>
    </head>
    <body background="webbg2.jpg">
        <div class="container-fluid">
            <div class="row" style="margin-top: 20px; margin-left: 50px;">
                
    <div class="col-md-2 col-sm-3 col-xs-6" style="margin-left: 10px;" > <a href="homepage.php" class="btn btn-sm animated-button victoria-two"><img src="home.png" height="200"><br>HOME</a></div>
        			
        			
                </div>
            </div>
                    <form class="row form">
                        <div class="col-sm-offset-4 col-sm-4 form-group">
                            <input type="text" name="code" class="form-control input-lg">
                        </div>
					<button style="border-radius: 20px; margin-top: 10px;">SUBMIT</button>
                        <div class="softkeys" data-target="input[name='code']"></div>
                    </form>
                </div>
            </div>
        </div>

        <script src="http://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>
        <script src="softkeys-0.0.1.js"></script>

        <script>
            $(document).ready(function(){
                $('.softkeys').softkeys({
                    target : $('.softkeys').data('target'),
                    layout : [
                        [
                            ['`','~'],
                            ['1','!'],
                            ['2','@'],
                            ['3','#'],
                            ['4','$'],
                            ['5','%'],
                            ['6','^'],
                            ['7','&amp;'],
                            ['8','*'],
                            ['9','('],
                            ['0',')'],
                            ['-', '_'],
                            ['=','+'],
                            'delete'
                        ],
                        [
                            'q','w','e','r','t','y','u','i','o','p',
                            ['[','{'],
                            [']','}']
                        ],
                        [
                            'capslock',
                            'a','s','d','f','g','h','j','k','l',
                            [';',':'],
                            ["'",'&quot;'],
                            ['\\','|']
                        ],
                        [
                            'shift',
                            'z','x','c','v',' ','b','n','m',
                            [',','&lt;'],
                            ['.','&gt;'],
                            ['/','?'],
                            ['@']
                        ]
                    ]
                });
            });
        </script>
    </body>
</html>
