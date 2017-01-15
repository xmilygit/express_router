var express=require('express'),
    bodyparser=require('body-parser'),
    passport=require('passport'),
    localstrategy=require('passport-local').Strategy;


var users = {
  zack: {
    username: 'zack',
    password: '1234',
    id: 1,
  },
  node: {
    username: 'node',
    password: '5678',
    id: 2,
  },
}


var localS=new localstrategy({
    usernameField:'',
    passwordField:''
},
function(username,password,done){
    user=users[username];
    if(user==null){
        return done(null,false,{message:'无效用户'});
    };

    if(user.password!==password){
        return done(null,false,{message:'无效密码'});
    };
    done(null,user);
}
)

passport.use('local',localS);

var app=express();
app.use(bodyparser.urlencoded({extended:false}));
app.use(bodyparser.json());
app.use(passport.initialize());

app.post('/login',
    passport.authenticate('local',{session:false}),
    function(req,res){
        res.send('User ID:'+req.user.id);
    }
)



app.listen(3000,function(){
    console.log('用户认证示例正在运行.....')
})


