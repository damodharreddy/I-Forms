	var express = require('express'); 
    var app = express(); 
    var bodyParser = require('body-parser');
    var multer = require('multer');
    var xlstojson = require("xls-to-json-lc");
    var xlsxtojson = require("xlsx-to-json");
	var json2html = require('node-json2html');


    app.use(bodyParser.json());  

    var storage = multer.diskStorage({ //multers disk storage settings
        destination: function (req, file, cb) {
            cb(null, './uploads/')
        },
        filename: function (req, file, cb) {
            var datetimestamp = Date.now();
            cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
        }
    });

    var upload = multer({ //multer settings
		storage: storage,
        fileFilter : function(req, file, callback) { //file filter
			if (['xls', 'xlsx'].indexOf(file.originalname.split('.')[file.originalname.split('.').length-1]) === -1) {
				return callback(new Error('Wrong extension type'));
            }
            callback(null, true);
        }
    }).single('file');

    /** API path that will upload the files */
    app.post('/upload', function(req, res) {
        var exceltojson;
        upload(req,res,function(err){
            if(err){
                 res.json({error_code:1,err_desc:err});
                 return;
            }
            /** Multer gives us file info in req.file object */
            if(!req.file){
                res.json({error_code:1,err_desc:"No file passed"});
                return;
            }
            /** Check the extension of the incoming file and 
             *  use the appropriate module
             */
            if(req.file.originalname.split('.')[req.file.originalname.split('.').length-1] === 'xlsx'){
                exceltojson = xlsxtojson;
            } else {
                exceltojson = xlstojson;
            }
            console.log(req.file.path);
			console.log("-----------------------")
            try {
                exceltojson({
                    input: req.file.path,
                    output: null, //since we don't need output.json
                    lowerCaseHeaders:true
                }, function(err,result){
                    if(err) {
                        return res.json({error_code:1,err_desc:err, data: null});
                    } 
                    //covnsole.log(result)
                    var fs=require('fs');

                    fs.writeFile(__dirname + "/index2.html",JsontoHtml(result));

                    res.redirect('/result');
                });
            } catch (e){
                res.json({error_code:1,err_desc:"Corupted excel file"});
            }
        })
       
    });


	var JsontoHtml = function(result)
		{
            
			console.log(result)
			console.log("-----------------------")
            var html="<head><style>body{padding-left:10%;padding-right:10%;}</style><link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css'><script src='https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js'></script><script src='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js'></script></head><div class='jumbotron jumbotron-fluid'><div class='container' align='center'><h1 class='display-3 '>Preview of Form</h1></div></div>";
			for (var i=0;i<result.length;i++)
			{
                console.log(result[i].Field_Type)
				switch 	(result[i].Field_Type)
					{
						case "radio":
                            
							var transform={"<>":"form","class":"form-horizontal","children":[
    {"<>":"div","class":"form-group row","html":"","children":[    
        {"<>":"label","class":"control-label col-sm-4 ","html":"Gender:"},
        {"<>":"div","class":"col-sm-6","style":"padding-top:7px;","html":"","children":[
          {"<>":"input","class":"radio-inline","type":"${Field_Type}","name":"${Field_LabelName}","value":"${Field_Value3}","html":"${Field_Value3}"},
          {"<>":"input","class":"radio-inline","type":"${Field_Type}","name":"${Field_LabelName}","value":"${Field_Value2}","html":"${Field_Value2}"},
          {"<>":"input","class":"radio-inline","type":"${Field_Type}","name":"${Field_LabelName}","value":"${Field_Value3}","html":"${Field_Value3}"}
    ]}
  ]}
]};

                                        
							console.log("entered "+result[i].Field_Type)
                            break;
						
						case "text":
                            
							var transform={"<>":"form","class":"form-horizontal","children":[
    {"<>":"div","class":"form-group row","html":"","children":[
        {"<>":"label","class":"control-label col-sm-4","html":"${Field_LabelName}:"},
        {"<>":"div","class":"col-sm-6","html":"","children":[
            {"<>":"input","type":"${Field_Type}","class":"form-control","name":"${Field_Type}","placeholder":"${Field_LabelName}","html":""}
        ]}
    
    ]}
]};				
                              
                            
                            console.log("entered "+result[i].Field_Type)         
							break;
                         case "textarea":
                            var transform={"<>":"form","class":"form-horizontal","children":[
    {"<>":"div","class":"form-group row","html":"","children":[
        {"<>":"label","class":"control-label col-sm-4","html":"${Field_LabelName}:"},
        {"<>":"div","class":"col-sm-6","html":"","children":[
            {"<>":"textarea","class":"form-control","rows":"3","name":"${Field_Type}","placeholder":"${Field_LabelName}","html":""}
        ]}
    
    ]}
]};              
                             console.log("entered "+result[i].Field_Type)            
                            break;   
						case "dropdown":
						  var transform={"<>":"form","class":"form-horizontal","children":[
    {"<>":"div","class":"form-group row","html":"","children":[    
        {"<>":"label","class":"control-label col-sm-4","html":"${Field_LabelName}:"},
        {"<>":"div","class":"col-sm-6","html":"","children":[
          {"<>":"select","class":"form-control","children":[
            {"<>":"option","value":"${Field_Value1}","html":"${Field_Value1}"},
            {"<>":"option","value":"${Field_Value2}","html":"${Field_Value2}"},
            {"<>":"option","value":"${Field_Value3}","html":"${Field_Value3}"}
        ]}
    ]}
  ]}
]};  
                            console.log("entered "+result[i].Field_Type)          
						break;
						case "checkbox":
                            var transform={"<>":"form","class":"form-horizontal","children":[
    {"<>":"div","class":"form-group row","html":"","children":[
        {"<>":"label","class":"control-label col-sm-4","html":""},
        {"<>":"div","class":"col-sm-6 checkbox","html":"","children":[
            {"<>":"a","href":"https://www.abnamro.nl","target":"_blank","html":"",children:[
                {"<>":"input","type":"checkbox","html":"${Field_LabelName}"}
             ]}
        ]}    
    ]}
]};  
                        console.log("entered "+result[i].Field_Type)            
						break;
                        /*
                        case "link":
                            var transform={"<>":"div","id":"linkForm","html":[
                                          {"<>":"a","href":"https://www.abnamro.nl","target":"_blank","html":"${Field_LabelName}"},
                                          {"<>":"br","html":""}]}; 
                            */

                        console.log("entered "+result[i].Field_Type)            
                        break;
						case "button":
                            var transform={"<>":"form","action":"clickSubmit","method":"post","class":"form-horizontal","children":[
    {"<>":"div","class":"form-group row","html":"","children":[    
        {"<>":"div","class":"col-sm-4"},
        {"<>":"div","class":"col-sm-6","html":"","children":[
          {"<>":"button","class":"btn btn-warning pull-right","type":"submit","html":"${Field_LabelName}"}
    ]}
  ]}
]}; 

                        console.log("entered "+result[i].Field_Type)            
						break;
					}
				 //html= json2html.transform(result[i],transform);
                 html = html+json2html.transform(result[i],transform);
                 console.log("---------------")
				console.log(html)
                
                
			}
		return html ;
        };
	
	app.get('/',function(req,res){
		res.sendFile(__dirname + "/index.html");
	}); 
app.use(express.static(__dirname + '/style.css')); 

 app.get('/thankyou',function(req,res){
    res.sendFile(__dirname + "/thankyou.html");
  });
  app.get('/result',function(req,res){
    res.sendFile(__dirname + "/index2.html");
  });  
app.post('/clickSubmit', function(req, res) {
  // Your logic and then redirect
  res.redirect('/thankyou');
}); 


    app.listen('3030', function(){
        console.log('running on 3030...');
    });
	