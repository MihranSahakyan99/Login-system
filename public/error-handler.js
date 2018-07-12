$(document).ready(function() {
    const alert_val = $('.alert').text();
    switch (true) {
        case alert_val.indexOf('Name') !== -1 :
            $('input[name="name"]').css({'border': '1px solid red', 'background-color' : '#f2dede', 'color': '#b94a48'});
            break;
        case alert_val.indexOf('email') !== -1 :
            $('input[name="email"]').css({'border': '1px solid red', 'background-color' : '#f2dede', 'color': '#b94a48'});
            break;

        case alert_val.indexOf('password') !== -1 :
            $('input[name="password"]').css({'border': '1px solid red', 'background-color' : '#f2dede', 'color': '#b94a48'});
            break;
    }
});

