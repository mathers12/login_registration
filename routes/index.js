var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var passport = require('passport');
var passportLocal = require('passport-local');
var passportHttp = require("passport-http");
var nodemailer = require('nodemailer');
var crypto = require('crypto');

//Nodemailer
var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "Gmail",  // sets automatically host, port and connection security settings
    auth: {
        user: "dsoft.tesla@gmail.com",
        pass: "something001"
    }
});

function sendEmail (email,link,meno,priezvisko)
{

    smtpTransport.sendMail({  //email options
        from: "dSoft Solutions s.r.o<dsoft.tesla@gmail.com>",
        to: email,
        subject: "Prosím, potvrďte tento e-mail!",
        html: "Dobrý deň pán <b>"+meno+" "+priezvisko+"</b><br><br>Prosím potvrďte tento verifikačný e-mail!<br><a href="+link+">Potvrdiť kliknutím tu!</a>"

    }, function(error, response){  //callback
        if(error){
            console.log(error);
        }else{
            console.log("Message sent: " + response.message);
        }

        smtpTransport.close(); // shut down the connection pool, no more messages.  Comment this line out to continue sending emails.
    });


}
function randomValueHex (len) {
    return crypto.randomBytes(Math.ceil(len/2))
        .toString('hex') // convert to hexadecimal format
        .slice(0,len);   // return required number of characters
}

function getUniqueRandomId() { // Kontrola na jedinecne ID verify email

            var randomId = randomValueHex(20);
            mongoose.model('uzivatelia').find({emailId: randomId}, function (err, user) {
            if (user.length) {
                console.log("je to tam, musim generovat");
                getUniqueRandomId();
            }
            else {
                console.log("Nie je to tam"+ randomId);


            }
        });

    return randomId;
}

//PASSPORT LOCAL
passport.use(new passportLocal.Strategy(function(username,password,done)
{

}));
//PASSPORT HTTP
passport.use(new passportHttp.BasicStrategy(function(username,password,done)
{

}));
//MONGOOSE
var schema = mongoose.Schema({ // Schema tabulky
    meno: String,
    priezvisko: String,
    email: String,
    heslo: String,
    emailId: String,
    verifiedEmail: Boolean
});

var Users = mongoose.model('uzivatelia',schema,"uzivatelia");



//ROUTES
router.get('/',function(req,res) // Prihlasenie
{
   res.render('index',{
       authenticated: req.isAuthenticated(),
       user: req.user,
       success: false
   });
});

router.get('/registration',function(req,res) // Registracia
{
   res.render('registration');
});

router.get('/verify',function(req,res)
{
    var id = req.query.id
    mongoose.model('uzivatelia').find({emailId: req.query.id},function(err,users)
    {

    });

});

router.post('/registration',function(req,res) // Spracovanie registracie
{

    mongoose.model('uzivatelia').find({email: req.body['email']},function(err,users)
   {

      if (users.length)//Ak uz je v DB
      {
          res.write("<script>alert('E-mailova adresa uz existuje!');</script>");
          console.log("E-mail uz je v DB");
      }

      else {

          if (req.body['heslo'] === req.body['heslo2']) // Skontrolujem zhodu hesiel a ukladam do DB
          {

              var rand = getUniqueRandomId();
              console.log("Vysledne generovane cislo"+ rand);
              var link="http://"+req.get('host')+"/verify?id="+rand;

              sendEmail(req.body['email'],link,req.body['meno'],req.body['priezvisko']); // Volanie funkcie na posielanie ver. emailu

              var data = new Users();
              data.meno = req.body['meno'];
              data.priezvisko = req.body['priezvisko'];
              data.email = req.body['email'];
              data.heslo = req.body['heslo'];
              data.emailId = rand;
              data.verifiedEmail = false;
              data.save(function (err) {
                  if (!err) {
                      console.log("Saved");
                      res.write("<script>alert('Uspesne ulozene v DB');</script>");
                  }
                  else console.log("Error");
              });
          }
          else
          {
             console.log("Hesla sa nezhoduju");
          }
      }
   });
});
module.exports = router;
