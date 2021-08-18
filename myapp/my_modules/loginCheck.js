const loginCheck = (req, res, next) => {

    let login = false;
    let mem = req.session.login;
    
    if(mem != undefined)
      login = true;
  
    req.login = login;
    next(); 
}

module.exports.loginCheck = loginCheck; 
