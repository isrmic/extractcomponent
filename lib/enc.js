function enc (string, type, password){

  var crypto = require('crypto'),
      algorithm = 'aes-256-cbc',
      password = 'extractcomponent' + password ? password : '';

  function encrypt(text){
    var cipher = crypto.createCipher(algorithm, password)
    var crypted = cipher.update(text,'utf8','hex')
    crypted += cipher.final('hex');
    return crypted;
  }

  function decrypt(text){
    try {
        var decipher = crypto.createDecipher(algorithm,password)
        var dec = decipher.update(text,'hex','utf8');
        dec += decipher.final('utf8');
    } catch (err) {
        console.log(err);
    }
    return dec;
  }

  if(type === 1)
      return encrypt(string);
  else if(type === 2)
      return decrypt(string);
}

module.exports = enc;
