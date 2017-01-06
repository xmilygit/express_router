var express=require('express');
var methodoverride=require('method-override');
var bodyParse=require('body-parser');

var app=express();
var router=express.Router();

router.use(bodyParse.urlencoded({extended:true}));
router.use(methodoverride(function(req,res){
    if(req.body && typeof req.body==='object' && '_method' in req.body)
    var method=req.body._method
    delete req.body._method
    return method
}))

//
//路由的执行顺序是代码至上而下的
//


//router.use方法内的函数不管什么情况下都会执行，相当于asp.net中的过滤器只有有访问发生就会执行。
router.use(function(req,res,next){
    req.query['name']='tom';
    console.log('进入"router.use"路由,添加一个参数name="tom"');
    next();
});

//router.get方法内的函数仅在第一个参数路径满足的情况下才执行
router.get('/user/:id',function(req,res,next){
    console.log('参数id2 '+req.params.id);
    next();
});


router.get('/login',function(req,res,next){
    console.log('进入router.get"/login"路由，添加一个参数age=28');
    req.query['age']="28";
    next();
});

router.get('/',function(req,res,next){
    console.log('打印参数',req.query);
    next();
});


router.param('id',function(req,res,next,id){
    console.log('参数id1'+id);
    next();
});

router.put('/user/:user_id',function(req,res,next){
    console.log('已执行单独的路由router.put');
    next();
});


router.all('*',logic1,logic2);

function logic1(req,res,next){
    console.log('已执行logic1');
    //res.end();
    next();
};
function logic2(req,res,next){
    console.log('已执行logic2');
    //res.end();
    next();
};

router.route('/user/:user_id')
    .all(function(req,res,next){
        console.log('已执行router.route 的 all,命中路由地址时必执行');
        next();
    })
    .get(function(req,res,next){
        console.log('已执行router.route 的 get');
        res.setHeader('Content-Type','text/html');
        res.write('<form method="post">');
        res.write('<input type="text" name="user_name" value="xmily"/>');
        res.write('<input type="submit" value="Submit for POST"/>');
        res.write('</form>');

        res.write('<form method="put">');
        res.write('<input type="text" name="user_name" value="xmily"/>');
        res.write('<input type="submit" value="Submit for PUT"/>');
        res.write('<input type="hidden" value="DELETE" name="_method"/>');
        res.write('</form>');

        res.write('<form method="delete">');
        res.write('<input type="text" name="user_name" value="xmily"/>');
        res.write('<input type="submit" value="Submit for DELETE"/>');
        res.write('<input type="hidden" value="DELETE" name="_method"/>');
        res.write('</form>');


        res.end();        
        //res.json(req,user);
         next();
    })
    .put(function(req,res,next){
        console.log('已执行router.route 的 put');
        //req.user.name=req.params.name;
        //res.json(req.user);
         next();
    })
    .post(function(req,res,next){
        console.log('已执行router.route 的 post');
         next();
    })
    .delete(function(req,res,next){
        console.log('已执行router.route 的 delete');
         next();
    });

//app.use/app.get/ 在express中注册路由
app.use('/',router);
app.get('/login',router);
app.get('/login',function(req,res){
    console.log('打印参数',req.query);
    res.end('ok');
});



app.listen(3000);
