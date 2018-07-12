$(document).ready(function () {
    const socket        = io(),
          message       = $('#message'),
          handle        = $('#handle'),
          btn           = $('#send'),
          output        = $('#output'),
          to            = $('#to'),
          msg           = $('#msg'),
          backToProfile = $('#bc-prf'),
          log_out       = $('#log-out'),
          url           = $(location).attr('href');

    msg.click(function () {
        $('.block-1').css({'display' : 'none'});
        $('.block-2').css({'display' : 'block'});
    });
    backToProfile.click(function () {
        $('.block-2').css({'display' : 'none'});
        $('.block-1').css({'display' : 'block'});
    });
    if (url.indexOf('profile') !== -1) {
        socket.emit('add-user', { "username": handle.val() });
    }
    $(document).on('click', '.active-user', function() {
        to.text($(this).text());
        socket.emit('get-chat', {
            username : handle.val(),
            to       : to.text()
        });
        btn.click(function() {
            socket.emit('chat', {
                content  : message.val(),
                username : handle.val(),
                to       : to.text()
            });
            message.val('');
        });
    });
    socket.emit('get-username', { username : handle.val() });
    socket.on('show-all-active-users', function (all_active_users) {
        console.log("show-all-active-users");
        const active_users = $('.active-users-list');

        all_active_users.map(function (active_user) {
            active_users.append("<li class='active-user list-group-item'>"+ active_user +"</li>");
        });
    });
    socket.on('show-active-user', function (user) {
        console.log("show-active-user");
        const active_users = $('.active-users-list');
        active_users.append("<li class='active-user list-group-item'>"+ user +"</li>");
    });
    log_out.on('click', function(){
        console.log('user disconnected');
        socket.emit('disconnected-user');
    });
    socket.on('show-updated-active-users', function (disconnected_user) {
        console.log('show-updated-active-users');
        $('li.active-user').each(function (i) {
            if ($(this).text() === disconnected_user) {
                $(this).remove();
            }
        });
    });
    socket.on('show-msg', function(data) {
        output.append('<p><strong>' + data.username + ': </strong>' + data.content + '</p>');
    });
    // #TODO Show chat history.
    socket.on('show-chat-history', function (chat_history) {
        //console.log(chat_history);
        //console.log($('#output > p').length);
        //if (!($('#output > p').length)) {
        $.when($('#output').empty()).done(
            chat_history.map(function (chat) {
                output.append('<p><strong>' + chat.author + ': </strong>' + chat.body + '</p>');
            })
        )

        //}
    });
});
