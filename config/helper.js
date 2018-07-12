const isValidEmail     = function(email) {
    const  re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
};

const isValidPassword  = function (password) {
    if(password.length < 6)
        return false;
    const variations = {
        digits   : /\d/.test(password),
        lower    : /[a-z]/.test(password),
        upper    : /[A-Z]/.test(password),
        nonWords : /\W/.test(password)
    };

    let score = 0;
    for (let check in variations) {
        score += (variations[check] === true) ? 1 : 0;
    }
    score += score * 13;
    console.log(score);
    return (score >= 30);
};

const isValidName = function (name) {
    const  re = /^[a-zA-Z]+$/;
    return re.test(name);
};

module.exports.isValidEmail    = isValidEmail;
module.exports.isValidPassword = isValidPassword;
module.exports.isValidName     = isValidName;


