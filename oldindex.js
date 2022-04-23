const TelegramBot = require('node-telegram-bot-api')
const config = require('./config')
var https = require('follow-redirects').https;
var fs = require('fs');

//====================INITIALIZE FIREBASE==============================
const firebase_connect = require('firebase')
const { reset } = require('nodemon')
const { chat } = require('googleapis/build/src/apis/chat')

const fb = firebase_connect.initializeApp({
    apiKey:'AIzaSyA0wSxSsB938N4mKpV5Nec0tBWbpPFyZAQ',
    authDomain:'upperrestaurant.firebaseapp.com',
    databaseURL: 'https://upperrestaurant-default-rtdb.europe-west1.firebasedatabase.app'
})
//====================================================================

//Подключаем бота
const bot = new TelegramBot(config.TOKEN,
{
    polling:
    {
        interval: 300,
        autoStart: true,
        params: 
        {
            timeout: 10
        }
    }
})

const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

let active_session = []
let postpone_delay = 60 * 24
let postpone_enabled = false
let timer = setTimeout(() => PostPonePosting(), 1000);

let message_nobutton = []
let message_todelete = []
let product_id = '393193'//- PLATINUM, '348357' - STANDARD, 
let product_link = 'https://sportwetten-university.de/stop-geheimes-video/' //- PLATINUM, STANDARD - 'https://sportwetten-university.de/sportwetten-insider/'
//let product_image = 'https://d7jiromw385hv.cloudfront.net/merchant_584674/image/product/NQQQ0Z6G'
let channel_id = -1001224734962 //PLATINUM:-1001569887769 | INSIDER:-1001637428332
let admin_id = 338134907
let linkexpiretime = 1000 * 60 * 5
let users_emails = []
let isTypingEmail = []
let isTypingMessageAdmin = []

const digistore_key = '621668-hev9iWtyp73T8bS0txxjLvl89IPk4Ia81EQxEu2b'
/* let method = 'listBuyers'
let params = 'page_no=1&page_size=1000' //14790664 //platinum id = 393193
let cookie = 'ds24=produ62546e26ed3747.84477455jRJV6aC37JjGM1l1fBXxATRA7UCKUQ9fWplebEEE3rz29TuhnVxcT7KTogvMuZlE68XevNWKSMYBQvptkHa4QJpMorfNZlMdUy8' */

let group_name = '🔐 PLATINUM INSIDER 🥇💎' //'Insider Tipps 💰'

let hellomessage = 'Hallo, mit diesem Bot bekommst du Zugang zu den' + group_name/*  + '\n\nTo get invite link you have to subscribe for this product' */
let hellomessage_authed = 'Hallo, du bist erfolgreich angemeldet zu dem ' + group_name
let hellomessage_admin = 'Hello, you are admin of ' + group_name + '\n\nYou can send message to every participant in private'
let typeemail = 'Schreibe unten deine E-Mail Adresse ein mit der du bestellt hast:'
let yourlinkmessage = '✅ Hier ist dein persönlicher geschützer Link. Klicke auf den unteren Button!'
let email_not_found = 'Deine E-Mail Adresse wurde nicht gefunden. Bitte nutze die E-Mail, welche du bei der Bestellung genutzt hast. Schaue bitte in dein E-Mail Postfach und verwende 1:1 die selbe E-Mail von der du die Bestellbestätigung von Digistore24 bekommen hast.'
let renewsubscription = 'Deine Mitgliedschaft endet demnächst! Bitte nehme die Zahlung wieder auf!\nAnsonsten wirst du automatisch an diesem Tag entfernt:'
let youarekicked = 'Deine Mitgliedschaft ist abgelaufen! Um die ' + group_name + ' weiter zu nutzen, bestelle hier erneut: https://bit.ly/3vdA0FV'
let emailexists = 'Diese E-Mail ist bereits verwendet. Bestelle hier sofern du noch kein Kunde bist: https://bit.ly/3vdA0FV'
let wrongemail = 'Das ist keine E-Mail. Versuche es erneut!'
let typemessagetext = 'Type message for each client of your channel. It will be sent to clients with active subscription only'
let messagefromadmin = '<b>Du hast eine neue Nachricht von ' + group_name + '</b>'
let messagewassenttext = 'Your message was successfully sent to your clients'

let b_gotostart = ['◀️ Zurück', 'gotostartcb']
let b_typeemail = ['Ich bin bereits Mitglied ▶️', 'enteremail_cb']
let b_requestlink = ['🔗 Link erhalten', 'requestlink_cb']
let b_sendmessageadmin = ['✉️ Nachricht senden', 'sendmessageadmin_cb']
let b_renew = 'Renew now'

/* var options_0 = {
    'method': 'GET',
    'hostname': 'www.digistore24.com',
    'path': '/api/call/listBuyers/?page_no=1&page_size=1000',
    'headers': {
      'X-DS-API-KEY': digistore_key,
      'Accept': 'application/json',
      'Cookie': 'ds24=produ62546e26ed3747.84477455jRJV6aC37JjGM1l1fBXxATRA7UCKUQ9fWplebEEE3rz29TuhnVxcT7KTogvMuZlE68XevNWKSMYBQvptkHa4QJpMorfNZlMdUy8'
    },
    'maxRedirects': 20
}; */
/* var req_0 = https.request(options_0, function (res_0) {
    var chunks = [];
  
    res_0.on("data", function (chunk) {
      chunks.push(chunk);
    });
  
    res_0.on("end", function (chunk) {
        var body = Buffer.concat(chunks);
        let result = JSON.parse(body.toString())
        let numdisplay = 0
        if (numdisplay <= 2){
            for (let i = 0; i < result.data.items.length; i++){
                var options_1 = {
                    'method': 'GET',
                    'hostname': 'www.digistore24.com',
                    'path': '/api/call/listPurchasesOfEmail/?email='+result.data.items[i].email+'&limit=1000',
                    'headers': {
                      'X-DS-API-KEY': digistore_key,
                      'Accept': 'application/json',
                      'Cookie': 'ds24=produ62546e26ed3747.84477455jRJV6aC37JjGM1l1fBXxATRA7UCKUQ9fWplebEEE3rz29TuhnVxcT7KTogvMuZlE68XevNWKSMYBQvptkHa4QJpMorfNZlMdUy8'
                    },
                    'maxRedirects': 20
                };
                var req_1 = https.request(options_1, function (res_1) {
                    var chunks1 = [];
                    res_1.on("data", function (chunk) {
                      chunks1.push(chunk);
                    });

                    res_1.on("end", function (chunk) {
                        var body1 = Buffer.concat(chunks1);
                        let result_1 = JSON.parse(body1.toString())
                        for (let x = 0; x < result_1.data.purchase_list.length; x++){
                            if (!users_emails.includes(result.data.items[i].email)){
                                for (let u = 0; u < result_1.data.purchase_list[x].items.length; u++){
    
                                    if (result_1.data.purchase_list[x].items[u].product_id === '348357' && result_1.data.purchase_list[x].last_payment.pay_method !== 'test' && result_1.data.purchase_list[x].billing_type === 'subscription' && result_1.data.purchase_list[x].billing_status === 'paying'){
                                        users_emails.push(result.data.items[i].email)
                                        numdisplay++;
                                        //console.log(result_1)
                                        console.log(result.data.items[i].email)
                                        break
                                    }
                                }
                            }
                        }
                    })
                    res_1.on("error", function (error) {
                      console.error('here: ' + error);
                    });
                });
                req_1.end();
            }
        }
    });
  
    res_0.on("error", function (error) {
      console.error('here: ' + error);
    });
}); */
/* req_0.end(); */

bot.on('channel_post', msg => {
    console.log(msg)
    let date = new Date()
    let utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
    let timeOfffset = 3
    last_post = new Date(utcTime + (3600000 * timeOfffset))
})
bot.on('message', (msg) =>
{
    const { chat, message_id, text } = msg
    //FixMessages(chat)

    if (active_session[chat.id] !== undefined && !text.includes('/start') && !text.includes('/mitgliederbereich') && !text.includes('/Admin_controller:GetChatInfo')){
        if (isTypingEmail[chat.id] === true && text.includes('@')){
            bot.deleteMessage(chat.id, message_id).catch(err => {console.log('err: ' + err)})
            isTypingEmail[chat.id] = false
            let success = false
            let userdata = fb.database().ref('bettingbot/platinum/users/')
            userdata.get().then(result => {
                if (result.val().length === 1 && result.val()[0] === 0) {
                    var options_1 = {
                        'method': 'GET',
                        'hostname': 'www.digistore24.com',
                        'path': '/api/call/listPurchasesOfEmail/?email='+text+'&limit=1000',
                        'headers': {
                          'X-DS-API-KEY': digistore_key,
                          'Accept': 'application/json',
                          'Cookie': 'ds24=produ62546e26ed3747.84477455jRJV6aC37JjGM1l1fBXxATRA7UCKUQ9fWplebEEE3rz29TuhnVxcT7KTogvMuZlE68XevNWKSMYBQvptkHa4QJpMorfNZlMdUy8'
                        },
                        'maxRedirects': 20
                    };
                    var req_1 = https.request(options_1, function (res_1) {
                        var chunks1 = [];
                        res_1.on("data", function (chunk) {
                          chunks1.push(chunk);
                        });
        
                        res_1.on("end", function (chunk) {
                            var body1 = Buffer.concat(chunks1);
                            let result_1 = JSON.parse(body1.toString())
                            console.log(result_1);
                            if (result_1.result === 'success'){
                                for (let x = 0; x < result_1.data.purchase_list.length; x++){
                                    for (let u = 0; u < result_1.data.purchase_list[x].items.length; u++){
                                        if (result_1.data.purchase_list[x].items[u].product_id === product_id && result_1.data.purchase_list[x].last_payment.pay_method !== 'test' && result_1.data.purchase_list[x].billing_type === 'subscription' && result_1.data.purchase_list[x].billing_status === 'paying'){
                                            success = true
                                            let newuser = {
                                                tg_id: chat.id,
                                                buyer_id: result_1.data.purchase_list[x].buyer_id,
                                                email: text,
                                                billing_mode: result_1.data.purchase_list[x].billing_mode,
                                                next_payment_at: result_1.data.purchase_list[x].next_payment_at,
                                                next_amount: result_1.data.purchase_list[x].next_amount,
                                                status: 'active'
                                            }
                                            let updates = {}
                                            updates['bettingbot/platinum/users/' + result.val().length] = newuser
                                            fb.database().ref().update(updates)
                                            bot.createChatInviteLink(channel_id, {
                                                name: 'newuser_' + chat.id, 
                                                expire_date: result.date + 3600,
                                                member_limit: 1
                                            })
                                            .then(invite => {
                                                FixMessages(chat)
                                                bot.sendMessage(chat.id, yourlinkmessage, {
                                                    parse_mode: 'HTML',
                                                    protect_content: true/* ,
                                                    reply_markup: {
                                                        inline_keyboard: [
                                                            [{
                                                                text: 'Join group',
                                                                url: invite.invite_link
                                                            }]
                                                        ]
                                                    } */
                                                }).catch(err1 => {console.log(err1)})
                                            })
                                            .catch(err => {console.log(err)})
                                            break
                                        }
                                    }
                                    if (x === result_1.data.purchase_list.length - 1 && !success) EmailNotFound(chat)
                                }
                            }
                            else EmailNotFound(chat)
                        })
                        res_1.on("error", function (error) {
                          console.error('here: ' + error);
                        });
                    });
                    req_1.end();
                } 
                else {
                    for (let i = 0; i < result.val().length; i++){
                        if (result.val()[i].email !== null && result.val()[i].email === text){
                            bot.sendMessage(chat.id, emailexists, {
                                parse_mode: 'HTML',
                            })
                            .then(res => {
                                isTypingEmail[chat.id] = true
                            })
                        }
                        if (i === result.val().length - 1 && (result.val()[i].email !== null || result.val()[i].email !== text)){
                            var options_1 = {
                                'method': 'GET',
                                'hostname': 'www.digistore24.com',
                                'path': '/api/call/listPurchasesOfEmail/?email='+text+'&limit=1000',
                                'headers': {
                                  'X-DS-API-KEY': digistore_key,
                                  'Accept': 'application/json',
                                  'Cookie': 'ds24=produ62546e26ed3747.84477455jRJV6aC37JjGM1l1fBXxATRA7UCKUQ9fWplebEEE3rz29TuhnVxcT7KTogvMuZlE68XevNWKSMYBQvptkHa4QJpMorfNZlMdUy8'
                                },
                                'maxRedirects': 20
                            };
                            var req_1 = https.request(options_1, function (res_1) {
                                var chunks1 = [];
                                res_1.on("data", function (chunk) {
                                  chunks1.push(chunk);
                                });
                
                                res_1.on("end", function (chunk) {
                                    var body1 = Buffer.concat(chunks1);
                                    let result_1 = JSON.parse(body1.toString())
                                    console.log(result_1);
                                    if (result_1.result === 'success'){
                                        for (let x = 0; x < result_1.data.purchase_list.length; x++){
                                            for (let u = 0; u < result_1.data.purchase_list[x].items.length; u++){
                                                if (result_1.data.purchase_list[x].items[u].product_id === product_id && result_1.data.purchase_list[x].last_payment.pay_method !== 'test' && result_1.data.purchase_list[x].billing_type === 'subscription' && result_1.data.purchase_list[x].billing_status === 'paying'){
                                                    success = true
                                                    let newuser = {
                                                        tg_id: chat.id,
                                                        buyer_id: result_1.data.purchase_list[x].buyer_id,
                                                        email: text,
                                                        billing_mode: result_1.data.purchase_list[x].billing_mode,
                                                        next_payment_at: result_1.data.purchase_list[x].next_payment_at,
                                                        next_amount: result_1.data.purchase_list[x].next_amount,
                                                        status: 'active'
                                                    }
                                                    let updates = {}
                                                    updates['bettingbot/platinum/users/' + result.val().length] = newuser
                                                    fb.database().ref().update(updates)
                                                    bot.createChatInviteLink(channel_id, {
                                                        name: 'newuser_' + chat.id, 
                                                        expire_date: result.date + 3600,
                                                        member_limit: 1
                                                    })
                                                    .then(invite => {
                                                        FixMessages(chat)
                                                        bot.sendMessage(chat.id, yourlinkmessage, {
                                                            parse_mode: 'HTML',
                                                            protect_content: true,
                                                            reply_markup: {
                                                                inline_keyboard: [
                                                                    [{
                                                                        text: 'Join group',
                                                                        url: invite.invite_link
                                                                    }]
                                                                ]
                                                            }
                                                        }).catch(err1 => {console.log(err1)})
                                                    })
                                                    .catch(err => {console.log(err)})
                                                    break
                                                }
                                            }
                                            if (x === result_1.data.purchase_list.length - 1 && !success) EmailNotFound(chat)
                                        }
                                    }
                                    else EmailNotFound(chat)
                                })
                                res_1.on("error", function (error) {
                                  console.error('here: ' + error);
                                });
                            });
                            req_1.end();
                        }
                        if (i === result.val().length - 1 && result.val()[i].email === text) EmailNotFound(chat)
                    }
                }
                
            })  
        }
        else if (isTypingEmail[chat.id] === true && !text.includes('@')) {
            bot.deleteMessage(chat.id, message_id).catch(err => {console.log('err: ' + err)})
            bot.sendMessage(chat.id, wrongemail, {
                parse_mode: 'HTML',
            }).then(res => {
                if (message_todelete[chat.id] === undefined) message_todelete[chat.id] = []
                message_todelete[chat.id].push(res.message_id)
            })
            isTypingEmail[chat.id] = true
        }
        else if (isTypingMessageAdmin[chat.id] === true){
            isTypingMessageAdmin[chat.id] = false
            let userdata = fb.database().ref('bettingbot/platinum/users/')
            userdata.get().then(result => {
                for (let i = 0; i < result.val().length; i++){
                    if (result.val()[i].status === 'active'){
                        bot.sendMessage(result.val()[i].tg_id, messagefromadmin + '\n\n' + text, {
                            parse_mode: 'HTML',
                        })
                    }
                    if (i === result.val().length - 1){
                        bot.sendMessage(chat.id, messagewassenttext, {
                            parse_mode: 'HTML',
                            reply_markup: {
                                inline_keyboard: [
                                    [{
                                        text: b_gotostart[0],
                                        callback_data: b_gotostart[1]
                                    }]
                                ]
                            }
                        }).then(res => {
                            if (message_todelete[chat.id] === undefined) message_todelete[chat.id] = []
                            message_todelete[chat.id].push(res.message_id)
                        })
                    }
                }
            })
        }
    }
    else {
        if (!text.includes('/start') && !text.includes('/mitgliederbereich') && !text.includes('/Admin_controller:GetChatInfo')) {
            for (let i = 0; i < 50; i++){
                bot.deleteMessage(chat.id, message_id - i).catch(err => {console.log('err: ' + err)})
            }
            Start(msg)
        }
        
    }
})
bot.on('callback_query', query => {
    const { chat, message_id, text } = query.message
    FixMessages(chat)

    let sessionchecker = 0
    if (query.message.chat.type === 'private') sessionchecker = chat.id
    if (query.message.chat.type !== 'private') sessionchecker = query.from.id
    console.log(sessionchecker)

    if (active_session[sessionchecker] !== undefined){
        if (query.data === b_gotostart[1]){
            isTypingEmail[chat.id] = undefined
            isTypingMessageAdmin[chat.id] = undefined
            Start(query.message)
        }
        else if (query.data === b_typeemail[1]){
            isTypingEmail[chat.id] = true
            bot.sendMessage(chat.id, typeemail, {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [{
                            text: b_gotostart[0],
                            callback_data: b_gotostart[1]
                        }]
                    ]
                }
            }).then(res => {
                if (message_nobutton[chat.id] === undefined) message_nobutton[chat.id] = []
                message_nobutton[chat.id].push([res.message_id, typeemail])
            })
        }
        else if (query.data === b_requestlink[1]){
            bot.getChatMember(channel_id, chat.id)
            .then(res => {
                if (res.status !== 'kicked'){
                    bot.createChatInviteLink(channel_id, {
                        name: 'newlink_' + chat.id, 
                        expire_date: res.date + 3600,
                        member_limit: 1
                    })
                    .then(invite => {
                        bot.sendMessage(chat.id, yourlinkmessage, {
                            parse_mode: 'HTML',
                            protect_content: true,
                            reply_markup: {
                                inline_keyboard: [
                                    [{
                                        text: 'Join group',
                                        url: invite.invite_link
                                    }]
                                ]
                            }
                        }).catch(err1 => {console.log(err1)})
                    })
                    .catch(err => {console.log(err)})
                }
                else {
                    let userdata = fb.database().ref('bettingbot/platinum/users/')
                    userdata.get().then(result => {
                        console.log(result.exists())
                        if (result.exists()) {
                            for (let i = 0; i < result.val().length; i++) {
                                if (result.val()[i].tg_id === chat.id){
                                    if (result.val()[i].status === 'stopped'){
                                        var options_1 = {
                                            'method': 'GET',
                                            'hostname': 'www.digistore24.com',
                                            'path': '/api/call/listPurchasesOfEmail/?email='+result.val()[i].email+'&limit=1000',
                                            'headers': {
                                              'X-DS-API-KEY': digistore_key,
                                              'Accept': 'application/json',
                                              'Cookie': 'ds24=produ62546e26ed3747.84477455jRJV6aC37JjGM1l1fBXxATRA7UCKUQ9fWplebEEE3rz29TuhnVxcT7KTogvMuZlE68XevNWKSMYBQvptkHa4QJpMorfNZlMdUy8'
                                            },
                                            'maxRedirects': 20
                                        };
                                        var req_1 = https.request(options_1, function (res_1) {
                                            var chunks1 = [];
                                            res_1.on("data", function (chunk) {
                                              chunks1.push(chunk);
                                            });
                        
                                            res_1.on("end", function (chunk) {
                                                var body1 = Buffer.concat(chunks1);
                                                let result_1 = JSON.parse(body1.toString())
                                                for (let x = 0; x < result_1.data.purchase_list.length; x++){
                                                    if (!users_emails.includes(result.data.items[i].email)){
                                                        for (let u = 0; u < result_1.data.purchase_list[x].items.length; u++){
                                                            if (result_1.data.purchase_list[x].items[u].product_id === product_id && result_1.data.purchase_list[x].last_payment.pay_method !== 'test' && result_1.data.purchase_list[x].billing_type === 'subscription'){
                                                                if (result_1.data.purchase_list[x].is_canceled_now === 'N' && result_1.data.purchase_list[x].next_payment_at !== '' && result_1.data.purchase_list[x].billing_status === 'paying'){
                                                                    let date = new Date()
                                                                    let utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
                                                                    let timeOfffset = 0
                                                                    let current_date = new Date(utcTime + (3600000 * timeOfffset))
                                                                    let local_date = result_1.data.purchase_list[x].next_payment_at.split('-')
                                                                    let localdate = new Date(parseInt(local_date[0]), parseInt(local_date[1]), parseInt(local_date[2]))

                                                                    if ((localdate.getTime() - current_date.getTime()) > -100){
                                                                        let updates = {}
                                                                        updates['bettingbot/platinum/users/' + i + '/status'] = 'active'
                                                                        updates['bettingbot/platinum/users/' + i + '/next_payment_at'] = result_1.data.purchase_list[x].next_payment_at
                                                                        fb.database().ref().update(updates)

                                                                        /* bot.unbanChatMember(channel_id, chat.id)
                                                                        .then(res1 => {
                                                                            bot.createChatInviteLink(channel_id, {
                                                                                name: 'newlink_' + chat.id, 
                                                                                expire_date: res1.date + 3600,
                                                                                member_limit: 1
                                                                            })
                                                                            .then(invite => {
                                                                                bot.sendMessage(chat.id, yourlinkmessage, {
                                                                                    parse_mode: 'HTML',
                                                                                    protect_content: true,
                                                                                    reply_markup: {
                                                                                        inline_keyboard: [
                                                                                            [{
                                                                                                text: 'Join group',
                                                                                                url: invite.invite_link
                                                                                            }]
                                                                                        ]
                                                                                    }
                                                                                }).catch(err1 => {console.log(err1)})
                                                                            })
                                                                            .catch(err => {console.log(err)})
                                                                        }) */

                                                                        bot.sendMessage(chat.id, yourlinkmessage, {
                                                                            parse_mode: 'HTML',
                                                                            protect_content: true/* ,
                                                                            reply_markup: {
                                                                                inline_keyboard: [
                                                                                    [{
                                                                                        text: 'Join group',
                                                                                        url: invite.invite_link
                                                                                    }]
                                                                                ]
                                                                            } */
                                                                        }).catch(err1 => {console.log(err1)})
                                                                    }
                                                                }
                                                                else {
                                                                    bot.sendMessage(chat.id, youarekicked, {
                                                                        parse_mode: 'HTML',
                                                                        /* reply_markup: {
                                                                            inline_keyboard: [
                                                                                [{
                                                                                    text: b_renew,
                                                                                    url: result_1.data.purchase_list[x].renew_url
                                                                                }]
                                                                            ]
                                                                        } */
                                                                    })
                                                                    .then(res => {
                                                                        if (message_todelete[result.val()[i].tg_id] === undefined) message_todelete[result.val()[i].tg_id] = []
                                                                        message_todelete[result.val()[i].tg_id].push(res.message_id)
                                                                    })
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            })
                                            res_1.on("error", function (error) {
                                              console.error('here: ' + error);
                                            });
                                        });
                                        req_1.end();
                                    }
                                    if (result.val()[i].status === 'active'){
                                        /* bot.unbanChatMember(channel_id, chat.id)
                                        .then(res1 => {
                                            bot.createChatInviteLink(channel_id, {
                                                name: 'newlink_' + chat.id, 
                                                expire_date: res1.date + 3600,
                                                member_limit: 1
                                            })
                                            .then(invite => {
                                                bot.sendMessage(chat.id, yourlinkmessage, {
                                                    parse_mode: 'HTML',
                                                    protect_content: true,
                                                    reply_markup: {
                                                        inline_keyboard: [
                                                            [{
                                                                text: 'Join group',
                                                                url: invite.invite_link
                                                            }]
                                                        ]
                                                    }
                                                }).catch(err1 => {console.log(err1)})
                                            })
                                            .catch(err => {console.log(err)})
                                        }) */
                                        bot.sendMessage(chat.id, yourlinkmessage, {
                                            parse_mode: 'HTML',
                                            protect_content: true/* ,
                                            reply_markup: {
                                                inline_keyboard: [
                                                    [{
                                                        text: 'Join group',
                                                        url: invite.invite_link
                                                    }]
                                                ]
                                            } */
                                        }).catch(err1 => {console.log(err1)})
                                        let updates = {}
                                        updates['bettingbot/platinum/users/' + i + '/status'] = 'active'
                                        fb.database().ref().update(updates)
                                    }
                                }
                            }
                        }
                    })
                }
            })
            .catch(err => {console.log('err: ' + err)})
        }
        else if (query.data === b_sendmessageadmin[1]){
            isTypingMessageAdmin[chat.id] = true
            bot.sendMessage(chat.id, typemessagetext, {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [{
                            text: b_gotostart[0],
                            callback_data: b_gotostart[1]
                        }]
                    ]
                }
            })
            .then(res => {
                if (message_todelete[chat.id] === undefined) message_todelete[chat.id] = []
                message_todelete[chat.id].push(res.message_id)
            })
        }
    }
    else {
        bot.deleteMessage(chat.id, message_id).catch(err => {console.log('err: ' + err)})
        for (let i = 0; i < 50; i++){
            bot.deleteMessage(chat.id, message_id - i).catch(err => {console.log('err: ' + err)})
        }
        active_session[chat.id] = true
        Start(query.message)
    }
})
bot.onText(/\/Admin_controller:GetChatInfo/, msg =>
    {
        //console.log(msg)
        const chatId = msg.chat.id
        bot.sendMessage(chatId, chatId)
    
})
//Кнопка меню ("Главная")
bot.onText(/\/start/, msg => {
    active_session[msg.chat.id] = true
    Start(msg)
})
bot.onText(/\/mitgliederbereich/, msg => {
    const { chat, message_id, text } = msg

    bot.sendMessage(chat.id, 'Mitgliederbereich', {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [
                [{
                    text: 'Mitgliederbereich',
                    url: 'https://sportwetten-university.de/kursliste/'
                }]
            ]
        }
    }).catch(err => {console.log('err: ' + err)})

})
function Start(msg){
    const { chat, message_id, text } = msg
    
    bot.getChatMember(channel_id, chat.id).then(reply => {
        if (reply.status === 'administrator' || reply.status === 'creator'){
            bot.sendMessage(chat.id, hellomessage_admin, {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [{
                            text: b_sendmessageadmin[0],
                            callback_data: b_sendmessageadmin[1]
                        }]
                    ]
                }
            }).then(res => {
                if (message_todelete[chat.id] === undefined) message_todelete[chat.id] = []
                message_todelete[chat.id].push(res.message_id)
            })
        }
        else {
            let userdata = fb.database().ref('bettingbot/platinum/users/')
            userdata.get().then(result => {
                console.log(result.exists())
                if (result.exists()) {
                    let isauthed = false
                    for (let i = 0; i < result.val().length; i++) {
                        if (result.val()[i].tg_id == chat.id){
                            console.log('authed')
                            isauthed = true
        
                            bot.sendMessage(chat.id, hellomessage_authed, {
                                parse_mode: 'HTML'/* ,
                                reply_markup: {
                                    inline_keyboard: [
                                        [{
                                            text: b_requestlink[0],
                                            callback_data: b_requestlink[1]
                                        }]
                                    ]
                                } */
                            }).then(res => {
                                if (message_nobutton[chat.id] === undefined) message_nobutton[chat.id] = []
                                message_nobutton[chat.id].push([res.message_id, hellomessage])
                            })
                        }
                    }
                    if (!isauthed){
                        bot.sendMessage(chat.id, hellomessage, {
                            parse_mode: 'HTML',
                            reply_markup: {
                                inline_keyboard: [
                                    [{
                                        text: b_typeemail[0],
                                        callback_data: b_typeemail[1]
                                    }]/* ,
                                    [{
                                        text: '🔗 Subscribe',
                                        url: product_link
                                    }] */
                                ]
                            }
                        }).then(res => {
                            if (message_nobutton[chat.id] === undefined) message_nobutton[chat.id] = []
                            message_nobutton[chat.id].push([res.message_id, hellomessage])
                        })
                    }
                }
                else {
                    console.log('no info')
                   /*  let updates = {}
                    updates['hrbot/users/' + chat.id + '/info/'] = chat.first_name
                    fb.database().ref().update(updates)
        
                    let txt = 'Привет. С помощью этого бота Вы сможете опубликовать вакансию на канале <b><a href="https://t.me/jobs_designglory">Design Jobs</a></b>'
                    txt += '\n\nДля размещения вакансии, вам необходимо заполнить анкету и внести оплату в размере <b>' + job_post_price + ' руб.</b> '
                    txt += 'После прохождения модерации, Вы сможете выбрать дату для публикации'
        
                    bot.sendMessage(chat.id, txt, {
                        parse_mode: 'HTML',
                        disable_web_page_preview: true,
                        reply_markup: {
                            inline_keyboard: [
                                [{
                                    text: newjob[0],
                                    callback_data: newjob[1]
                                }]
                            ]
                        }
                    })
                    .then(res => {
                        if (message_nobutton[chat.id] === undefined) message_nobutton[chat.id] = []
                        message_nobutton[chat.id].push([res.message_id, txt])
                    }) */
                }
            })
        }
    })
    
}
function EmailNotFound(chat){
    FixMessages(chat)
    bot.sendMessage(chat.id, email_not_found, {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [
                [{
                    text: b_typeemail[0],
                    callback_data: b_typeemail[1]
                }]/* ,
                [{
                    text: '🔗 Subscribe',
                    callback_data: product_link
                }] */
            ]
        }
    }).then(res => {
        if (message_nobutton[chat.id] === undefined) message_nobutton[chat.id] = []
        message_nobutton[chat.id].push([res.message_id, email_not_found])
    })
}
function FixMessages(chat){

    if (message_todelete[chat.id] !== undefined){
        for (let i = 0; i < message_todelete[chat.id].length; i++){
            bot.deleteMessage(chat.id, message_todelete[chat.id][i]).catch(err => {/* console.log('err: ' + err) */})
        }
    }

    if (message_nobutton[chat.id] !== undefined){
        for (let i = 0; i < message_nobutton[chat.id].length; i++){
            bot.editMessageText(message_nobutton[chat.id][i][1], {
                parse_mode: 'HTML',
                chat_id: chat.id,
                message_id: message_nobutton[chat.id][i][0],
                disable_web_page_preview: true
            }).catch(err => {/* console.log('err: ' + err) */})
            if (message_nobutton[chat.id][i][2] === true){
                if (message_todelete[chat.id] === undefined) message_todelete[chat.id] = []
                message_todelete[chat.id].push(message_nobutton[chat.id][i][0])
            }
        }
    }
}
function PostPonePosting(){
    console.log('postpone')
    clearTimeout(timer);
    timer = setTimeout(() => PostPonePosting(), 1000 * 60 * postpone_delay);
    //Получаем список постов с сегодняшней датой
    let userdata = fb.database().ref('bettingbot/platinum/users')
    userdata.get().then(result => {
        if (result.val() !== null){
            let date = new Date()
            let utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
            let timeOfffset = 0
            let current_date = new Date(utcTime + (3600000 * timeOfffset))

            for (let i = 0; i < result.val().length; i++){
                if (result.val()[i].status === 'active'){
                    var options_1 = {
                        'method': 'GET',
                        'hostname': 'www.digistore24.com',
                        'path': '/api/call/listPurchasesOfEmail/?email='+result.val()[i].email+'&limit=1000',
                        'headers': {
                          'X-DS-API-KEY': digistore_key,
                          'Accept': 'application/json',
                          'Cookie': 'ds24=produ62546e26ed3747.84477455jRJV6aC37JjGM1l1fBXxATRA7UCKUQ9fWplebEEE3rz29TuhnVxcT7KTogvMuZlE68XevNWKSMYBQvptkHa4QJpMorfNZlMdUy8'
                        },
                        'maxRedirects': 20
                    };
                    var req_1 = https.request(options_1, function (res_1) {
                        var chunks1 = [];
                        res_1.on("data", function (chunk) {
                          chunks1.push(chunk);
                        });
        
                        res_1.on("end", function (chunk) {
                            var body1 = Buffer.concat(chunks1);
                            let result_1 = JSON.parse(body1.toString())
                            //console.log(result_1);
                            let updates = {}
                            if (result_1.result === 'success'){
                                for (let x = 0; x < result_1.data.purchase_list.length; x++){
                                    for (let u = 0; u < result_1.data.purchase_list[x].items.length; u++){
                                        if (result_1.data.purchase_list[x].items[u].product_id === product_id && result_1.data.purchase_list[x].last_payment.pay_method !== 'test' && result_1.data.purchase_list[x].billing_type === 'subscription'){
                                            if (result_1.data.purchase_list[x].is_canceled_now === 'N'){
                                                if (result_1.data.purchase_list[x].billing_status !== 'paying'){
                                                    if (result_1.data.purchase_list[x].billing_status === 'aborted'){
                                                        //прерван, kick user
                                                        updates['bettingbot/platinum/users/' + i + '/status'] = 'stopped'
                                                        bot.kickChatMember(channel_id, result.val()[i].tg_id).catch(err => {console.log('err: ' + err)})
                                                        bot.sendMessage(result.val()[i].tg_id, youarekicked, {
                                                            parse_mode: 'HTML',
                                                            /* reply_markup: {
                                                                inline_keyboard: [
                                                                    [{
                                                                        text: b_renew,
                                                                        url: result_1.data.purchase_list[x].renew_url
                                                                    }]
                                                                ]
                                                            } */
                                                        })
                                                        .then(res => {
                                                            if (message_todelete[result.val()[i].tg_id] === undefined) message_todelete[result.val()[i].tg_id] = []
                                                            message_todelete[result.val()[i].tg_id].push(res.message_id)
                                                        })
                                                    }
                                                }
                                                if (result_1.data.purchase_list[x].billing_status === 'paying'){
                                                    if (result_1.data.purchase_list[x].next_payment_at !== result.val()[i].next_payment_at){
                                                        updates['bettingbot/platinum/users/' + i + '/next_payment_at'] = result_1.data.purchase_list[x].next_payment_at
                                                    }
                                                    let local_date = result_1.data.purchase_list[x].next_payment_at.split('-')
                                                    let localdate = new Date(parseInt(local_date[0]), parseInt(local_date[1]), parseInt(local_date[2]))
                                                    if (localdate.getTime() - current_date.getTime() < 1000 * 3600 * 24 * 3){
                                                        //less than 3 days left
        
                                                        console.log(current_date.getTime() + ' | ' + localdate.getTime())
                                                        //time is up
                                                        if ((localdate.getTime() - current_date.getTime()) < -100){
                                                            //time is up, kick user
                                                            updates['bettingbot/platinum/users/' + i + '/status'] = 'stopped'
                                                            bot.kickChatMember(channel_id, result.val()[i].tg_id).catch(err => {console.log('err: ' + err)})
                                                            bot.sendMessage(result.val()[i].tg_id, youarekicked, {
                                                                parse_mode: 'HTML',
                                                                /* reply_markup: {
                                                                    inline_keyboard: [
                                                                        [{
                                                                            text: b_renew,
                                                                            url: result_1.data.purchase_list[x].renew_url
                                                                        }]
                                                                    ]
                                                                } */
                                                            })
                                                            .then(res => {
                                                                if (message_todelete[result.val()[i].tg_id] === undefined) message_todelete[result.val()[i].tg_id] = []
                                                                message_todelete[result.val()[i].tg_id].push(res.message_id)
                                                            })
                                                        }
    
                                                        //auto is not enabled and less then 3 days left
                                                        else if ((localdate.getTime() - current_date.getTime()) > -100 && result_1.data.purchase_list[x].billing_mode !== 'auto'){
                                                            //remind to renew
                                                            bot.sendMessage(result.val()[i].tg_id, renewsubscription + result_1.data.purchase_list[x].next_payment_at, {
                                                                parse_mode: 'HTML',
                                                                /* reply_markup: {
                                                                    inline_keyboard: [
                                                                        [{
                                                                            text: b_renew,
                                                                            url: result_1.data.purchase_list[x].renew_url
                                                                        }]
                                                                    ]
                                                                } */
                                                            })
                                                            .then(res => {
                                                                if (message_todelete[result.val()[i].tg_id] === undefined) message_todelete[result.val()[i].tg_id] = []
                                                                message_todelete[result.val()[i].tg_id].push(res.message_id)
                                                            })
                                                        }
                                                    }
        
                                                }
                                            }
                                            else {
                                                //прерван, kick user
                                                updates['bettingbot/platinum/users/' + i + '/status'] = 'stopped'
                                                bot.kickChatMember(channel_id, result.val()[i].tg_id).catch(err => {console.log('err: ' + err)})
                                                bot.sendMessage(result.val()[i].tg_id, youarekicked, {
                                                    parse_mode: 'HTML',
                                                    /* reply_markup: {
                                                        inline_keyboard: [
                                                            [{
                                                                text: b_renew,
                                                                url: result_1.data.purchase_list[x].renew_url
                                                            }]
                                                        ]
                                                    } */
                                                })
                                                .then(res => {
                                                    if (message_todelete[result.val()[i].tg_id] === undefined) message_todelete[result.val()[i].tg_id] = []
                                                    message_todelete[result.val()[i].tg_id].push(res.message_id)
                                                })
                                            }
                                            break
                                        }
                                    }/* 
                                    if (x === result_1.data.purchase_list.length - 1) {
                                        //kick user
                                        updates['bettingbot/platinum/users/' + i + '/status'] = 'stopped'
                                        bot.kickChatMember(channel_id, result.val()[i].tg_id).catch(err => {console.log('err: ' + err)})
                                        bot.sendMessage(result.val()[i].tg_id, youarekicked, {
                                            parse_mode: 'HTML',
                                            reply_markup: {
                                                inline_keyboard: [
                                                    [{
                                                        text: b_renew,
                                                        url: result_1.data.purchase_list[x].renew_url
                                                    }]
                                                ]
                                            }
                                        })
                                        .then(res => {
                                            if (message_todelete[result.val()[i].tg_id] === undefined) message_todelete[result.val()[i].tg_id] = []
                                            message_todelete[result.val()[i].tg_id].push(res.message_id)
                                        })

                                    } */
                                }
                            }
                            else {
                                //kick user
                                bot.kickChatMember(channel_id, result.val()[i].tg_id).catch(err => {console.log('err: ' + err)})
                                bot.sendMessage(result.val()[i].tg_id, youarekicked, {
                                    parse_mode: 'HTML',
                                    /* reply_markup: {
                                        inline_keyboard: [
                                            [{
                                                text: b_renew,
                                                url: result_1.data.purchase_list[x].renew_url
                                            }]
                                        ]
                                    } */
                                })
                                .then(res => {
                                    if (message_todelete[result.val()[i].tg_id] === undefined) message_todelete[result.val()[i].tg_id] = []
                                    message_nobutton[result.val()[i].tg_id].push(res.message_id)
                                })
                            }
                            fb.database().ref().update(updates)
                        })
                        res_1.on("error", function (error) {
                          console.error('here: ' + error);
                        });
                    });
                    req_1.end();
                }
            }
        }

        else {
            timer = setTimeout(() => PostPonePosting(), 1000 * 60 * postpone_delay);
        }
    })
}
process.on('uncaughtException', function (err) {
    console.log(err);
});
