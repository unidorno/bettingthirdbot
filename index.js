const TelegramBot = require('node-telegram-bot-api')
const config = require('./config')

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

let job_post_price = 0 
let channel_link = ''
let bot_link = ''
let group_id = 0
let channel_id = 0
let customer_support = ''
let active_session = []

let message_nobutton = []
let message_todelete = []
let jobediting = []

let jobbody = []

const newjob = ['➕ Новая вакансия', 'newjobcb']
const joblist = ['🧾 Мои вакансии', 'myjobscb']
const editjob = ['Редактировать вакансию', 'editjobcb']
const previewjob = ['Продолжить ▶️', 'previewjob_cb']
const gotostart = ['🏠 Главная', 'gotostart']
const acceptpost = ['✅ Опубликовать', 'acceptpublishcb']

let settingsrequest = fb.database().ref('hrbot/settings')
settingsrequest.on('value', (result) => {
    console.log(result.val())
    job_post_price = result.val().price_info.job_post_price
    channel_link = result.val().basic_info.channel_link
    bot_link = result.val().basic_info.bot_link
    group_id = result.val().basic_info.group_id
    channel_id = result.val().basic_info.channel_id
    customer_support = result.val().basic_info.customer_support
})
bot.on('channel_post', msg => {
    console.log(msg)
})
bot.on('message', (msg) =>
{
    const { chat, message_id, text } = msg
    FixMessages(chat)

    if (active_session[chat.id] !== undefined){
        if (jobediting[chat.id] !== undefined) {
            bot.deleteMessage(chat.id, message_id).catch(err => {console.log('err: ' + err)})
    
            if (jobediting[chat.id] === 0) jobbody[chat.id].job_type = text
            if (jobediting[chat.id] === 1) jobbody[chat.id].company_name = text
            if (jobediting[chat.id] === 2) jobbody[chat.id].company_description = text
            if (jobediting[chat.id] === 3) jobbody[chat.id].city = text
            if (jobediting[chat.id] === 4) jobbody[chat.id].requirements = text
            if (jobediting[chat.id] === 5) jobbody[chat.id].tasks = text
            if (jobediting[chat.id] === 6) jobbody[chat.id].conditions = text
            if (jobediting[chat.id] === 7 && text.includes('@')) jobbody[chat.id].email = text
    
            let updates = {}
            updates['hrbot/users/' + chat.id + '/jobs/' + jobbody[chat.id].job_number] = jobbody[chat.id]
            fb.database().ref().update(updates)
    
            EditJob(chat)
            jobediting[chat.id] = undefined
        }
    }
    else {
        for (let i = 0; i < 50; i++){
            bot.deleteMessage(chat.id, message_id - i).catch(err => {console.log('err: ' + err)})
        }
        if (!text.includes('/start')) Start(msg)
        
    }
})
bot.on('callback_query', query => {
    const { chat, message_id, text } = query.message
    console.log(query.data)
    FixMessages(chat)

    if (active_session[chat.id] !== undefined){
        if (query.data === newjob[1] || query.data.includes(editjob[1])){
            if (query.data === newjob[1]){
                let creatordata = fb.database().ref('hrbot/users/' + chat.id)
                creatordata.get().then(result => {
                    let jobamount = 0
                    if (result.val().jobs !== undefined) {
                        jobamount = result.val().jobs.length
                    }
                    jobbody[chat.id] = {
                        job_type: '',
                        company_name: '',
                        company_description: '',
                        city: '',
                        requirements: '',
                        tasks: '',
                        conditions: '',
                        email: ' ',
                        sender: chat.id,
                        job_number: jobamount,
                        time_created: 0,
                        time_paid: 0,
                        time_approved: 0,
                        time_published: 0,
                        status: 'preparing', //preparing -> paid -> approved -> published
                        message_id: 0,
                        publish_id: 0
                    }
                    EditJob(chat)
                })
            }
            if (query.data.includes(editjob[1])){
                if (query.data.includes('_')){
                    let creatordata = fb.database().ref('hrbot/users/' + chat.id + '/jobs/' + query.data.split('_')[1])
                    creatordata.get().then(result => {
                        console.log(result.val())
                        jobbody[chat.id] = {
                            job_type: result.val().job_type,
                            company_name: result.val().company_name,
                            company_description: result.val().company_description,
                            city: result.val().city,
                            requirements: result.val().requirements,
                            tasks: result.val().tasks,
                            conditions: result.val().conditions,
                            email: result.val().email,
                            sender: chat.id,
                            job_number: result.val().job_number,
                            time_created: result.val().time_created,
                            time_paid: result.val().time_paid,
                            time_approved: result.val().time_approved,
                            time_published: result.val().time_published,
                            status: result.val().status, //preparing -> paid -> approved -> published
                            message_id: result.val().message_id,
                            publish_id: result.val().publish_id
                        }
                        if (jobbody[chat.id].status === 'paid' || jobbody[chat.id].status === 'published') PreviewJob(chat)
                        if (jobbody[chat.id].status !== 'paid' && jobbody[chat.id].status !== 'published') EditJob(chat)
                    })
                }
                else {
                    if (jobbody[chat.id].status === 'paid' || jobbody[chat.id].status === 'published') PreviewJob(chat)
                    if (jobbody[chat.id].status !== 'paid' && jobbody[chat.id].status !== 'published') EditJob(chat)
                }
            }
            
        }
    
        if (query.data.includes('editjoparam')){
            jobediting[chat.id] = parseInt(query.data.split('_')[1])
    
            let txt = ''
            if (jobediting[chat.id] === 0) txt = 'Кого Вы ищете? Укажите специальность/должность:'
            if (jobediting[chat.id] === 1) txt = 'В какой компании Вы работаете?'
            if (jobediting[chat.id] === 2) txt = 'Расскажите коротко о своей компании:'
            if (jobediting[chat.id] === 3) txt = 'В каком городе Вы ищите кандидатов? Укажите, если это удаленный тип работы'
            if (jobediting[chat.id] === 4) txt = 'Опишите требования к кандидату:'
            if (jobediting[chat.id] === 5) txt = 'Какие задачи будет выполнять кандидат?'
            if (jobediting[chat.id] === 6) txt = 'Какие условия Вы предлагаете?'
            if (jobediting[chat.id] === 7) txt = 'Укажите почту для связи. Если Вы оставите это поле пустым, мы используем ссылку на Ваш телеграм-аккаунт'
            
            bot.sendMessage(chat.id, txt, {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [{
                            text: '◀️ Назад',
                            callback_data: editjob[1]
                        }]
                    ]
                }
            }).then(res => {
                if (message_todelete[chat.id] === undefined) message_todelete[chat.id] = []
                message_todelete[chat.id].push(res.message_id)
            })
        }
    
        if (query.data === gotostart[1]){
            jobbody[chat.id] = undefined
            jobediting[chat.id] = undefined
            Start(query.message)
        }
    
        if (query.data === previewjob[1]) PreviewJob(chat)
    
        if (query.data.includes('pay_')){
            if (query.data.split('_')[1] === 'jobpost'){
                console.log(bot_link)
                bot.sendInvoice(chat.id, 'Размещение вакансии', 'Размещение вакансии в телеграм-канале: ' + channel_link, 
                'PAYLOAD_' + chat.id + '_' + jobbody[chat.id].job_number, config.LIQPAY_TEST, 'RANDOM_KEY', 'RUB',
                    [{
                        label: 'Размещение вакансии',
                        amount: job_post_price * 100
                    }],
                    {
                        disable_web_page_preview: true,
                        reply_markup: {
                            inline_keyboard: [
                                [{
                                    text: 'Оплатить (' + job_post_price + ' руб.)',
                                    pay: true
                                }],
                                [{
                                    text: '◀️ Назад',
                                    callback_data: previewjob[1],
                                }]
                            ]
                        }
                    }
                ).then(res => {
                    if (message_todelete[chat.id] === undefined) message_todelete[chat.id] = []
                    message_todelete[chat.id].push(res.message_id)
                })
            }
        }
    
        if (query.data === joblist[1]){
            let creatordata = fb.database().ref('hrbot/users/' + chat.id)
            creatordata.get().then(result => {
                if (result.val().jobs !== undefined){
                    let txt = 'Список Ваших вакансий, которые еще не опубликованы:\n\n'
                    let kb = []
                    kb.push([{
                        text: '◀️ Назад',
                        callback_data: gotostart[1]
                    }])
                    for (let i = 0; i < result.val().jobs.length; i++){
                        let temptxt = ''
                        if (result.val().jobs[i].status === 'preparing') temptxt += '- ШАБЛОН | '
                        if (result.val().jobs[i].status === 'paid') temptxt += '- ОПЛАЧЕНО | '
                        if (result.val().jobs[i].status === 'approved') temptxt += '- ОЖИДАНИЕ | '
                        if (result.val().jobs[i].status === 'published') temptxt += '- ОПУБЛИКОВАНО | '
                        temptxt += result.val().jobs[i].job_type + ' в ' + result.val().jobs[i].company_name + '\n'
                        txt += temptxt
                        kb.push([{
                            text: temptxt,
                            callback_data: editjob[1] + '_' + result.val().jobs[i].job_number
                        }])
                    }
                    bot.sendMessage(chat.id, txt, {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: kb
                        }
                    }).then(res => {
                        if (message_todelete[chat.id] === undefined) message_todelete[chat.id] = []
                        message_todelete[chat.id].push(res.message_id)
                    })
                }
                if (result.val().jobs === undefined){
                    bot.sendMessage(chat.id, 'Вы пока не опубликовали ни одной вакансии. Самое время сделать это', {
                        disable_web_page_preview: true,
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: [
                                [{
                                    text: '◀️ Назад',
                                    callback_data: gotostart[1]
                                },
                                {
                                    text: newjob[0],
                                    callback_data: newjob[1]
                                }]
                            ]
                        }
                    }).then(res => {
                        if (message_todelete[chat.id] === undefined) message_todelete[chat.id] = []
                        message_todelete[chat.id].push(res.message_id)
                    })
                }
            })
        }
    
        if (query.data.includes(acceptpost[1])){
            //DONE 1. Опубликовать пост
            //2. Отправить клиенту ссылку на пост
            //3. Поменять статус заявки и добавить туда ссылку на пост
            //4. Поменять сообщение
            //5. Когда открываешь опубликованную вакансию, кидать ссылку
    
            let id = query.data.split('_')[1]
            let local_jobnum = query.data.split('_')[2]
            let updates = {}
    
            let creatordata = fb.database().ref('hrbot/users/' + id + '/jobs/' + local_jobnum)
            creatordata.get().then(result => {
    
                let txt = '🚀 Ищем <b>' + result.val().job_type + '</b> в <b>' + result.val().company_name + '</b>'
                txt += '\n\n<b>Город:</b> ' + result.val().city
                txt += '\n\n<b>О компании:</b>\n' + result.val().company_description
                txt += '\n\n<b>Требования: </b>\n' + result.val().requirements
                txt += '\n\n<b>Задачи: </b>\n' + result.val().tasks
                txt += '\n\n<b>Условия: </b>\n' + result.val().conditions
                if (result.val().email.includes('@')) txt += '\n\nОтправьте свой отклик на почту: ' + result.val().email
                if (!result.val().email.includes('@')) txt += '\n\nОтправьте свой отклик <a href="tg://user?id='+ result.val().sender +'">сюда</a>'
    
                bot.sendMessage(channel_id, txt, {
                    parse_mode: 'HTML'
                })
                .then(res => {
                    console.log(res)
                    updates['hrbot/users/' + id + '/jobs/' + local_jobnum + '/publish_id'] = res.message_id
                    updates['hrbot/users/' + id + '/jobs/' + local_jobnum + '/status'] = 'published'
                    updates['hrbot/users/' + id + '/jobs/' + local_jobnum + '/time_published'] = res.date * 1000
                    
                    let clienttext = 'Ваша вакансия <b><a href="'+ channel_link +'/'+ res.message_id +'">' + result.val().job_type + ' в '+ result.val().company_name +'"</a></b> была опубликована.'
                    bot.sendMessage(id, clienttext, {
                        disable_web_page_preview: true,
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: [
                                [{
                                    text: 'Хорошо 👍🏻',
                                    callback_data: gotostart[1]
                                }]
                            ]
                        }
                    }).then(res2 => {
                        if (message_todelete[id] === undefined) message_todelete[id] = []
                        message_todelete[id].push(res2.message_id)
                    })
    
                    let admingroup_text = 'Вы успешно <a href="'+ channel_link +'/'+ res.message_id +'">опубликовали</a> пост <a href="tg://user?id='+id+'">пользователя</a>'
                    bot.editMessageText(admingroup_text, {
                        chat_id: group_id,
                        message_id: result.val().message_id, 
                        parse_mode: 'HTML',
                        disable_web_page_preview: true,
                        reply_markup: {
                            inline_keyboard: [
                                [{
                                    text: '💬 Связаться с клиентом',
                                    url: 'tg://user?id='+id
                                }],
                                [{
                                    text: 'Показать пост',
                                    url: channel_link +'/'+ res.message_id
                                }]
                            ]
                        }
                    })
        
                    fb.database().ref().update(updates)
                })
            })
    
            
        }
    }
    else {
        bot.deleteMessage(chat.id, message_id).catch(err => {console.log('err: ' + err)})
        for (let i = 0; i < 50; i++){
            bot.deleteMessage(chat.id, message_id - i).catch(err => {console.log('err: ' + err)})
        }
        Start(query.message)
    }
})
bot.on('pre_checkout_query', query => {
    bot.answerPreCheckoutQuery(query.id, true)
})
bot.on('successful_payment', query => {
    console.log('success: ' + query.successful_payment.invoice_payload)
    let id = (query.successful_payment.invoice_payload).split('_')[1]
    let job_number = (query.successful_payment.invoice_payload).split('_')[2]
    let updates = {}
    updates['hrbot/users/' + id + '/jobs/' + job_number + '/status/'] = 'paid'
    updates['hrbot/users/' + id + '/jobs/' + job_number + '/time_paid/'] = query.date * 1000

    let creatordata = fb.database().ref('hrbot/users/' + id)
    creatordata.get().then(result => {
        
        let txt = '🚀 Ищем <b>' + result.val().jobs[job_number].job_type + '</b> в <b>' + result.val().jobs[job_number].company_name + '</b>'
        txt += '\n\n<b>Город:</b> ' + result.val().jobs[job_number].city
        txt += '\n\n<b>О компании:</b>\n' + result.val().jobs[job_number].company_description
        txt += '\n\n<b>Требования: </b>\n' + result.val().jobs[job_number].requirements
        txt += '\n\n<b>Задачи: </b>\n' + result.val().jobs[job_number].tasks
        txt += '\n\n<b>Условия: </b>\n' + result.val().jobs[job_number].conditions
        if (result.val().jobs[job_number].email.includes('@')) txt += '\n\nОтправьте свой отклик на почту: ' + result.val().jobs[job_number].email
        if (!result.val().jobs[job_number].email.includes('@')) txt += '\n\nОтправьте свой отклик <a href="tg://user?id='+ result.val().jobs[job_number].sender +'">сюда</a>'
        
        let date = new Date(result.val().jobs[job_number].time_created)
        let utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
        let timeOfffset = 3
        let finaldate = new Date(utcTime + (3600000 * timeOfffset))

        let minutes = finaldate.getUTCMinutes()
        if (minutes < 10) minutes = '0' + minutes
        let hours = finaldate.getUTCHours()
        if (hours < 10) hours = '0' + hours
        let data = finaldate.getUTCDate()
        let month = finaldate.getUTCMonth() + 1
        if (month < 10) month = '0' + month
        let readable_date = data + '.' + month + ', ' + hours + ':' + minutes

        let admin_text = '💵 Оплаченная вакансия от <b><a href="tg://user?id='+id+'">'+query.chat.first_name+'</a></b>'
        admin_text += '\n├ <b>Дата заявки:</b> ' + readable_date

        date = new Date(query.date * 1000)
        utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
        timeOfffset = 3
        finaldate = new Date(utcTime + (3600000 * timeOfffset))

        minutes = finaldate.getUTCMinutes()
        if (minutes < 10) minutes = '0' + minutes
        hours = finaldate.getUTCHours()
        if (hours < 10) hours = '0' + hours
        data = finaldate.getUTCDate()
        month = finaldate.getUTCMonth() + 1
        if (month < 10) month = '0' + month
        readable_date = data + '.' + month + ', ' + hours + ':' + minutes

        admin_text += '\n├ <b>Дата оплаты:</b> ' + readable_date
        admin_text += '\n├ <b>Статус заявки:</b> Оплачено, ожидает модерации'
        admin_text += '\n\n<b>Текст вакансии:</b>\n\n'
        admin_text += txt

        bot.deleteMessage(group_id, result.val().jobs[job_number].message_id).catch(err => {console.log('err: ' + err)})
        bot.sendMessage(group_id, admin_text, {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: '💬 Связаться с клиентом',
                        url: 'tg://user?id='+ id
                    }],
                    [{
                        text: acceptpost[0],
                        callback_data: acceptpost[1] + '_' + id + '_' + job_number
                    }]
                ]
            }
        }).then(res => {
            updates['hrbot/users/' + id + '/jobs/' + job_number + '/message_id/'] = res.message_id
            fb.database().ref().update(updates)
        })

        bot.sendMessage(id, '💵 Оплата была произведена, пост отправлен на модерацию. В случае возникновения вопросов, свяжитесь с <a href="https://t.me/'+ customer_support +'">модерацией</a>', {
            parse_mode: 'HTML',
            disable_web_page_preview: true,
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: '◀️ Назад',
                        callback_data: gotostart[1]
                    }]
                ]
            }
        }).then(res => {
            if (message_todelete[query.chat.id] === undefined) message_todelete[query.chat.id] = []
            message_todelete[query.chat.id].push(res.message_id)
        })
        
    })
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

function Start(msg){
    const { chat, message_id, text } = msg
    
    let creatordata = fb.database().ref('hrbot/users/' + chat.id)
    creatordata.get().then(result => {
        console.log(result.exists())
        if (result.exists()) {
            let txt = 'Привет, ' + chat.first_name + '. Выберите действие:'

            let kb = []
            kb[0] = []
            kb[0].push({
                text: newjob[0],
                callback_data: newjob[1]
            })
            if (result.val().jobs !== undefined){
                kb[0].push({
                    text: joblist[0],
                    callback_data: joblist[1]
                })
            }
            bot.sendMessage(chat.id, txt, {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: kb
                }
            }).then(res => {
                if (message_nobutton[chat.id] === undefined) message_nobutton[chat.id] = []
                message_nobutton[chat.id].push([res.message_id, txt, true])
            })
        }
        else {
            let updates = {}
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
            })
        }
    })
}

function FixMessages(chat){

    if (message_todelete[chat.id] !== undefined){
        for (let i = 0; i < message_todelete[chat.id].length; i++){
            bot.deleteMessage(chat.id, message_todelete[chat.id][i]).catch(err => {console.log('err: ' + err)})
        }
    }

    if (message_nobutton[chat.id] !== undefined){
        for (let i = 0; i < message_nobutton[chat.id].length; i++){
            bot.editMessageText(message_nobutton[chat.id][i][1], {
                parse_mode: 'HTML',
                chat_id: chat.id,
                message_id: message_nobutton[chat.id][i][0],
                disable_web_page_preview: true
            }).catch(err => {console.log('err: ' + err)})
            if (message_nobutton[chat.id][i][2] === true){
                if (message_todelete[chat.id] === undefined) message_todelete[chat.id] = []
                message_todelete[chat.id].push(message_nobutton[chat.id][i][0])
            }
        }
    }
}

function EditJob(chat){

    console.log('editing job')
    let txt = 'После того, как все поля будут заполнены, Вы сможете продолжить\n\n'
    txt += '<b>Кого ищем?</b> ' + jobbody[chat.id].job_type + '\n'
    txt += '<b>Название компании: </b>' + jobbody[chat.id].company_name + '\n'
    txt += '<b>О компании: </b>' + jobbody[chat.id].company_description + '\n'
    txt += '<b>Город: </b>' + jobbody[chat.id].city + '\n'
    txt += '<b>Требования: </b>\n' + jobbody[chat.id].requirements + '\n'
    txt += '<b>Задачи: </b>\n' + jobbody[chat.id].tasks + '\n'
    txt += '<b>Условия: </b>\n' + jobbody[chat.id].conditions + '\n'
    txt += '<b>Почта (необязательно): </b>' + jobbody[chat.id].email + '\n'

    let kb = [
        [{
            text: 'Кого ищем? ' + jobbody[chat.id].job_type,
            callback_data: 'editjoparam_0'
        }],
        [{
            text: 'Название компании: ' + jobbody[chat.id].company_name,
            callback_data: 'editjoparam_1'
        }],
        [{
            text: 'О компании: ' + jobbody[chat.id].company_description,
            callback_data: 'editjoparam_2'
        }],
        [{
            text: 'Город: ' + jobbody[chat.id].city,
            callback_data: 'editjoparam_3'
        }],
        [{
            text: 'Требования: ' + jobbody[chat.id].requirements,
            callback_data: 'editjoparam_4'
        }],
        [{
            text: 'Задачи: ' + jobbody[chat.id].tasks,
            callback_data: 'editjoparam_5'
        }],
        [{
            text: 'Условия: ' + jobbody[chat.id].conditions,
            callback_data: 'editjoparam_6'
        }],
        [{
            text: 'Почта: ' + jobbody[chat.id].email,
            callback_data: 'editjoparam_7'
        }]
    ]
    if (jobbody[chat.id].job_type !== '' && jobbody[chat.id].company_name !== '' && jobbody[chat.id].company_description !== '' && jobbody[chat.id].city !== '' && jobbody[chat.id].requirements !== '' && jobbody[chat.id].tasks !== '' && jobbody[chat.id].conditions !== ''){
        kb.push(
        [
            {
                text: '◀️ Назад',
                callback_data: gotostart[1]
            },
            {
                text: previewjob[0],
                callback_data: previewjob[1]
            }
        ]
        )
    }
    if (jobbody[chat.id].job_type === '' || jobbody[chat.id].company_name === '' || jobbody[chat.id].company_description === '' || jobbody[chat.id].city === '' || jobbody[chat.id].requirements === '' || jobbody[chat.id].tasks === '' || jobbody[chat.id].conditions === ''){
        kb.push([
            {
                text: '◀️ Назад',
                callback_data: gotostart[1]
            }
        ])
    }

    bot.sendMessage(chat.id, txt, {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: kb
        }
    }).then(res => {
        if (message_todelete[chat.id] === undefined) message_todelete[chat.id] = []
        message_todelete[chat.id].push(res.message_id)
    })
}

function PreviewJob(chat){

    FixMessages(chat)
    let txt = '🚀 Ищем <b>' + jobbody[chat.id].job_type + '</b> в <b>' + jobbody[chat.id].company_name + '</b>'
    txt += '\n\n<b>Город:</b> ' + jobbody[chat.id].city
    txt += '\n\n<b>О компании:</b>\n' + jobbody[chat.id].company_description
    txt += '\n\n<b>Требования: </b>\n' + jobbody[chat.id].requirements
    txt += '\n\n<b>Задачи: </b>\n' + jobbody[chat.id].tasks
    txt += '\n\n<b>Условия: </b>\n' + jobbody[chat.id].conditions
    if (jobbody[chat.id].email.includes('@')) txt += '\n\nОтправьте свой отклик на почту: ' + jobbody[chat.id].email
    if (!jobbody[chat.id].email.includes('@')) txt += '\n\nОтправьте свой отклик <a href="tg://user?id='+ jobbody[chat.id].sender +'">сюда</a>'
    
    let customer_message = ''
    let kb = []
    
    if (jobbody[chat.id].status === 'preparing'){
        customer_message = 'Проверьте правильность введенных данных и если все верно, нажмите "Оплатить". После оплаты и модерации поста, Вы получите уведомление о публикации с ссылкой на пост\n\n'
        customer_message += txt

        kb = [
            [{
                text: 'Перейти к оплате',
                callback_data: 'pay_jobpost'
            }],
            [{
                text: '◀️ Назад',
                callback_data: editjob[1]
            }]
        ]
        if (jobbody[chat.id].time_created === 0){

            let today = new Date()
            let utcTime = today.getTime() + (today.getTimezoneOffset() * 60000)
            let timeOfffset = 3
            let finaldate = new Date(utcTime + (3600000 * timeOfffset))
    
            let minutes = finaldate.getUTCMinutes()
            if (minutes < 10) minutes = '0' + minutes
            let hours = finaldate.getUTCHours()
            if (hours < 10) hours = '0' + hours
            let date = finaldate.getUTCDate()
            let month = finaldate.getUTCMonth() + 1
            if (month < 10) month = '0' + month
            let readable_date = date + '.' + month + ', ' + hours + ':' + minutes

            let admin_text = '🥳 Новая вакансия от <b><a href="tg://user?id='+chat.id+'">' + chat.first_name + '</a></b>'
            admin_text += '\n├ <b>Дата заявки:</b> ' + readable_date
            admin_text += '\n├ <b>Статус заявки:</b> Ожидание оплаты'
            admin_text += '\n\n<b>Текст вакансии:</b>\n\n'
            admin_text += txt

            bot.sendMessage(group_id, admin_text, {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [{
                            text: '💬 Связаться с клиентом',
                            url: 'tg://user?id='+ chat.id
                        }]
                    ]
                }
            })
            .then(res => {
                jobbody[chat.id].message_id = res.message_id
                if (jobbody[chat.id].time_created === 0) jobbody[chat.id].time_created = finaldate.getTime()
                console.log(jobbody[chat.id].time_created)
                let updates = {}
                updates['hrbot/users/' + chat.id + '/jobs/' + jobbody[chat.id].job_number] = jobbody[chat.id]
                fb.database().ref().update(updates)
            })
        }

        /* bot.sendMessage(chat.id, customer_message, {
            parse_mode: 'HTML',
            disable_web_page_preview: true,
            reply_markup: {
                inline_keyboard: kb
            }
        }).then(res => {
            if (message_nobutton[chat.id] === undefined) message_nobutton[chat.id] = []
            message_nobutton[chat.id].push([res.message_id, txt, true])
        }) */
    }

    if (jobbody[chat.id].status === 'approved'){

        kb = [
            [{
                text: '◀️ Назад',
                callback_data: editjob[1]
            }]
        ]

        let date = new Date(jobbody[chat.id].time_approved)
        let utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
        let timeOfffset = 3
        let finaldate = new Date(utcTime + (3600000 * timeOfffset))

        let minutes = finaldate.getUTCMinutes()
        if (minutes < 10) minutes = '0' + minutes
        let hours = finaldate.getUTCHours()
        if (hours < 10) hours = '0' + hours
        let data = finaldate.getUTCDate()
        let month = finaldate.getUTCMonth() + 1
        if (month < 10) month = '0' + month
        let readable_date = data + '.' + month + ', ' + hours + ':' + minutes

        customer_message = 'Ваша вакансия была одобрена '+ readable_date + ' и должна опубликоваться в ближайшее время'
        customer_message += '. Если Ваша вакансия не публикуется долгое время, свяжитесь с <a href="https://t.me/' + customer_support + '">службой поддержки</a>\n\n'
        customer_message += txt

        /* bot.sendMessage(chat.id, customer_message, {
            parse_mode: 'HTML',
            disable_web_page_preview: true,
            reply_markup: {
                inline_keyboard: kb
            }
        }).then(res => {
            if (message_nobutton[chat.id] === undefined) message_nobutton[chat.id] = []
            message_nobutton[chat.id].push([res.message_id, txt, true])
        }) */
    }
    if (jobbody[chat.id].status === 'paid'){

        kb = [
            [{
                text: '◀️ Назад',
                callback_data: gotostart[1]
            }]
        ]

        let date = new Date(jobbody[chat.id].time_paid)
        let utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
        let timeOfffset = 3
        let finaldate = new Date(utcTime + (3600000 * timeOfffset))

        let minutes = finaldate.getUTCMinutes()
        if (minutes < 10) minutes = '0' + minutes
        let hours = finaldate.getUTCHours()
        if (hours < 10) hours = '0' + hours
        let data = finaldate.getUTCDate()
        let month = finaldate.getUTCMonth() + 1
        if (month < 10) month = '0' + month
        let readable_date = data + '.' + month + ', ' + hours + ':' + minutes
        
        customer_message = 'Вы оплатили размещение этой вакансии ' + readable_date
        customer_message += '. Если Ваша вакансия не публикуется долгое время, свяжитесь с <a href="https://t.me/' + customer_support + '">службой поддержки</a>\n\n'
        customer_message += txt

        /* bot.sendMessage(chat.id, customer_message, {
            parse_mode: 'HTML',
            disable_web_page_preview: true,
            reply_markup: {
                inline_keyboard: kb
            }
        }).then(res => {
            if (message_todelete[chat.id] === undefined) message_todelete[chat.id] = []
            message_todelete[chat.id].push(res.message_id)
        }) */
    }
    if (jobbody[chat.id].status === 'published'){

        kb = [
            [{
                text: '◀️ Назад',
                callback_data: gotostart[1]
            }]
        ]
        
        let date = new Date(jobbody[chat.id].time_published)
        let utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
        let timeOfffset = 3
        let finaldate = new Date(utcTime + (3600000 * timeOfffset))

        let minutes = finaldate.getUTCMinutes()
        if (minutes < 10) minutes = '0' + minutes
        let hours = finaldate.getUTCHours()
        if (hours < 10) hours = '0' + hours
        let data = finaldate.getUTCDate()
        let month = finaldate.getUTCMonth() + 1
        if (month < 10) month = '0' + month
        let readable_date = data + '.' + month + ', ' + hours + ':' + minutes
        
        customer_message = 'Ваша вакансия была опубликована ' + readable_date
        customer_message += '\n\n🔗 Ссылка на <a href="'+ channel_link +'/' + jobbody[chat.id].publish_id + '">пост с вакансией</a>\n\n'
        customer_message += txt

        /* bot.sendMessage(chat.id, customer_message, {
            parse_mode: 'HTML',
            disable_web_page_preview: true,
            reply_markup: {
                inline_keyboard: kb
            }
        }).then(res => {
            if (message_todelete[chat.id] === undefined) message_todelete[chat.id] = []
            message_todelete[chat.id].push(res.message_id)
        }) */
    }

    bot.sendMessage(chat.id, customer_message, {
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        reply_markup: {
            inline_keyboard: kb
        }
    }).then(res => {
        if (message_todelete[chat.id] === undefined) message_todelete[chat.id] = []
        message_todelete[chat.id].push(res.message_id)
    })
}

process.on('uncaughtException', function (err) {
    console.log(err);
});
