var express=require('express'),
    bodyParse=require('body-parser');

    function edit(req,res,next){
        if(req.method!=='GET'){
            return next();
        }
        res.setHeader('Content-Type','text/html');
        res.write('<form method="put">');
        res.write('<input type="text" name=user[name] value="Tobi"/>');
        res.write('<input type="submit" value="Update"/>');
        res.write('</form>');
        res.end();
    }

    function update(req,res,next){
        if(req.method!=='PUT') return next();
        res.end('update'+req.body.user.name);
    }

    var app=express();
        app.use(bodyParse())
           .use(edit)
           .use(update)
           .listen(3000,function(){
               console.log('start on port 3000');
           })