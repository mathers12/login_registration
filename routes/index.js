var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var passport = require('passport');
var passportLocal = require('passport-local');
var passportHttp = require("passport-http");
var nodemailer = require('nodemailer');


//Nodemailer
var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "Gmail",  // sets automatically host, port and connection security settings
    auth: {
        user: "dsoft.tesla@gmail.com",
        pass: "something001"
    }
});

function mailOptions(email,link,meno,priezvisko)
{
    mailOptions={
        to : email,
        subject : "Prosím, potvrďte tento e-mail!",
        html : "Dobrý deň pán,<b>"+meno+" "+priezvisko+"</b><br> Prosím potvrďte tento verifikačný e-mail!<br><a href="+link+">Potvrdiť kliknutím tu!</a>"
    }

}
function sendEmail (body)
{

    smtpTransport.sendMail({  //email options
        from: "Michal Krajnak<dsoft.tesla@gmail.com>", // sender address.  Must be the same as authenticated user if using Gmail.
        to: "<michaall.k@gmail.com>", // receiver
        subject: "Hlavička",
        html: body,
        attachments:[

            {
                fileName: "top-shadow-right.gif",
                cid: "top-shadow-right",
                filePath: "public/images/top-shadow-right.gif"
            },
            {

                fileName: "footer-shadow.gif",
                cid: "footer-shadow",
                filePath: "public/images/footer-shadow.gif"

            }
        ]
    }, function(error, response){  //callback
        if(error){
            console.log(error);
        }else{
            console.log("Message sent: " + response.message);
        }

        smtpTransport.close(); // shut down the connection pool, no more messages.  Comment this line out to continue sending emails.
    });


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
    heslo: String
});

var Users = mongoose.model('uzivatelia',schema,"uzivatelia");



//ROUTES
router.get('/',function(req,res) // Prihlasenie
{
   res.render('index',{
       authenticated: req.isAuthenticated(),
       user: req.user
   });
});

router.get('/registration',function(req,res) // Registracia
{
   res.render('registration');
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

              var rand=Math.floor((Math.random() * 100000) + 100);
              var link="http://"+req.get('host')+"/verify?id="+rand;

              mailoptions(req.body['email'],link); // Volanie funkcie na nastavenie verifikacie e-mailu

              var data = new Users();
              data.meno = req.body['meno'];
              data.priezvisko = req.body['priezvisko'];
              data.email = req.body['email'];
              data.heslo = req.body['heslo'];

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
