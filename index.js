const TelegramBot = require('node-telegram-bot-api')
const config = require('./config')
const keyboards = require('./src/keyboard-buttons')

const QiwiBillPaymentsAPI = require('@qiwi/bill-payments-node-js-sdk');
const qiwiApi = new QiwiBillPaymentsAPI(config.SECRET_KEY);
const publicKey = config.PUBLIC_KEY;

const { P2P, Personal, Recipients, Detector, Currency } = require("qiwi-sdk")
const qiwi = new Personal(config.QIWI_ACESSTOKEN, config.QIWI_WALLET)
const detector = new Detector()

const postpone = require('node-postpone');

/* const params = {
    publicKey,
    amount: 200,
    billId: '893794793973',
    successUrl: 'https://merchant.com/payment/success?billId=893794793973'
};

const link = qiwiApi.createPaymentForm(params);
console.log(link) */

//====================INITIALIZE FIREBASE==============================
const firebase_connect = require('firebase')
const { reset } = require('nodemon')
const { captureRejectionSymbol } = require('node-telegram-bot-api')
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

//////////      ПЕРЕМЕННЫЕ_ПОЛЬЗОВАТЕЛЯ     ///////////////
let message_toedit = []
let messagetext_toedit = []
let message_todelete = []
let addmoney = []

let isWritingBlank = []
let isWritingBlank2 = []
let isWritingContacts = []
let isWritingContacts2 = []

let users_name = []
let users_realname = []
let userage = []
let userdescription = []
let userinsta = []
let userphone = []
let username = []
let userpic = []
let usercoins = []
let current_mode = []
let ischeckingmails = []
let user_donationlink = []

let isAddingcardinfo = []

let donateregisterstep = []
let donate_name = []
let donate_money = []
let donate_minmoney = []
let donate_duration = []
let donate_sendduration = []
let donate_private = []
let donate_photo = []
let donate_duration_secs = []
let donate_sendduration_secs = []
let donate_materials = []
let donate_editmaterials = []
let donate_editpreview = []
let donate_tempdonateid = []

let user_donations = []
let user_participants = []
let donationnames = []
let participantsnames = []

let participating_data = []

///////////////////     СООБЩЕНИЯ       //////////////////////////
let hellomessage = 'Привет. Этот бот позволит прозрачно собирать деньги на покупку цифрового контента. Автором сбора может выступать абсолютно любой пользователь, поэтому система работает одинаково <b>прозрачно для всех</b>.\n\nℹ️ <b>Работает сбор следующим образом:</b>\n\n1. Организатор создает сбор и отправляет ссылку другим участникам, которые оплачивают часть сбора и становятся участниками\n\n2. У каждого сбора есть дедлайн, после которого сбор либо завершается (участники получают обещанный контент, а автор - вырученные деньги), либо отменяется (участники получают деньги обратно)'
let newdonationsteps = [
'Привет. С этим ботом Вы можете организовать сборы и зарабатывать на этом деньги. \n\nДля начала скажите, <b>на что будем собирать?</b> Эту информацию увидят все пользователи (макс. 100 символов):', 
'<b>Сколько денег нужно собрать?</b>\n\nПользователи не увидят сумму, они будут видеть лишь прогресс в процентах (напр. 50%).\n\n<b>Укажите сумму в рублях (мин. 500 руб, макс. 300.000 руб):</b>', 
'<b>Сколько стоит участие в сборе?</b>\n\nПользователи смогут отправить эту сумму или больше.\n\n<b>Укажите сумму в рублях (мин. 50 руб, макс. 10.000 руб):</b>', 
'<b>Сколько дней будет идти сбор?</b>\n\nКогда сбор закончится, у Вас будет 3 дня, чтобы прикрепить материалы. Если материалы прикреплены, они отправятся участникам сбора автоматически\n\n<b>Введите количество дней (макс. 30 дней):</b>', 
'Есть превью материала (напр. заблюренное изображение)?\n\nСборы с картинками привлекают больше внимания.\n\nЕсли у Вас есть фотография для превью, отправьте ее сюда картинкой, с сжатием:', 
'<b>Вы уже приобрели материал?</b>\n\nВы можете отправить ссылку на него позже, но если Вы не сделаете этого <b>в течение 3-х дней после окончания своего дедлайна, сбор будет автоматически отменен</b> и вы не получите вырученные деньги',
'<b>Отправьте ссылку на материал</b>\n\nЭто может быть закрытый канал в ТГ или ссылка на сайт-хранилище с материалом (ссылка должна содержать https://):']

/////////////////////       КНОПКИ     /////////////////////////////////////
let backtostart = ['◀️ Назад', 'gotostart_cb']
let checkchannelfollow = ['Продолжить', 'channelfollw_cb']
let backtonewdonate = ['donatestep0_cb', 'donatestep1_cb', 'donatestep2_cb', 'donatestep3_cb', 'donatestep4_cb', 'donatestep5_cb']
let ihavematerials = ['📷 У меня есть материалы', 'ihavecontent_cb', 'Приложу позже', 'illsendlatermat_cb']
let sborprivacy = ['✅ Для всех', 'falseprivacy_cb', '🔒 Закрытый (по ссылке)', 'trueprivacy_cb']
let previewimg = ['📷 Загрузить превью', 'uploadpreview_cb', '❌ Без превью' , 'dontupload_preview']
let createdonation = ['🌐 Создать сбор', 'publishdonation_cb']
let backtomain = ['◀️ Назад', 'showadminpanel_cb']
let editmaterial = ['✏️ Доб./Изменить материал', 'editmaterials']
let editpreview = ['📷 Доб./Изменить превью', 'editphotopreview']
let checkparticipantsbutton = ['🧾 Список участников', 'checkparticipantsbtn']
let backeditmaterial = ['◀️ Назад', 'backerditmaterials_cb']
let backeditpreview = ['◀️ Назад', 'backerditpreview_cb']

let canceldonation = ['❌ Отменить сбор', 'canceldonationcb']
let finishdonation = ['✅ Завершить сбор', 'finishdonationcb']

let mybalancebutton = ['💸 Баланс', 'mybalance_cb']
let addmoneybutton = ['💳 Пополнить', 'addmoneybt_cb']
let addmoneyparticipant = ['💳 Пополнить', 'addmoneybt_cb']
let balancehistory = ['🧾 История', 'historybalance_cb']
let withdrawbutton = ['📤 Вывести', 'withdrawbutton_cb']
let cardinfobutton = ['💳 Доб./Изм. реквизиты', 'addwithdrawinfo']
let withdrawallbutton = ['🤑 Вывести все', 'withdrawall']
let withdrawcustombutton = ['💲 Вывести часть', 'withdrawcustom']
let acceptwithdrawal = ['✅ Принять', 'acceptwithdrawal']
let declinewithdrawal = ['❌ Отклонить', 'declinewithdrawal']

let participatebutton = ['Участвовать ', 'partcptbtncb']
let opendonationparticipant = 'opendonpartc_cb'

let alldonationslist = ['🎛 Все сборы', 'alldonations_cb']
let mydonationslist = ['🗄 Созданные сборы', 'mydonationslist_cb']
let myparticipantslist = ['👤 Участие в сборах', 'myparticipantslist_cb']
let publicdonationlist = ['🌍 Открытые сборы', 'myparticipantslist_cb']

let backtoblank = ['◀️ Назад', 'bcktblnk_cb']
let backtocontacts = ['◀️ Назад', 'bcktcntcs_cb']
let contactsbuttons = [['Как добавить ник?', 'hwtaddncknm_cb'], ['Телефон: ', 'usrnpnnmb_cb'], ['Инстаграм: ','instgrms_cb']]
let contactsbuttons2 = [['Телефон: ', 'usrnpnnmb2_cb'], ['Инстаграм: ','instgrms2_cb']]
const aboutyoublank_text = [['Ваше имя: ','aboutblank1_cb'], ['Возраст: ','aboutblank2_cb'], ['Предпочтения в сексе: ','aboutblank3_cb'], ['Контакты','aboutblank4_cb'], ['Найти пару','findpairblank_cb']]
const aboutyoublank_text2 = [['Ваше имя: ','aboutblank21_cb'], ['Возраст: ','aboutblank22_cb'], ['Предпочтения в сексе: ','aboutblank23_cb'], ['Контакты','aboutblank24_cb'], ['Найти пару','findpairblank2_cb']]
let sharenumber = ['Поделиться', '◀️ Назад']
let openmenubutton = ['Открыть меню', 'openmenu_cb']
let deleteaccount = ['❌ Удалить аккаунт', 'dltacctn_cb']
let addmoneyamount = 'addmnbs1_' // + amount of money added
let checkmoneyaddbutton = ['🔍 Проверить оплату', 'chckmnadd_', 'chckmnbckck_']
let deleteaccountbutton = ['Продолжить', 'continuedltn_cb', '◀️ Назад', 'bckfrmdltcn_cb']
let answermessage = ['✅ Да!', 'yesanswermsg_']
let getpartnerscontacts = ['📞 Написать партнеру', 'getparntncns_cb', '❌ Заблокировать партнера', 'blcmprntc_cb']
let whoareyoubutton = ['Я - организатор', 'createdonation_cb', 'Я - участник сбора', 'showdonations_cb']
let billid = []

/////////////////////       ОГРАНИЧЕНИЯ         //////////////////////////////
let userdescription_maxsymbols = 0

////////////////////    СТИКЕРЫ     //////////////////////////////
//Здесь указаны id используемых стикеров
let sticker_hello  /* = 'CAACAgIAAxkBAAIRSmDvAUTpAQABWFdBhIj3i-e5owJFvQACbwAD29t-AAGZW1Coe5OAdCAE' */
let openkeyboard_pic = 'https://storage.googleapis.com/upperrestaurant.appspot.com/Standards/howtoopen.jpg'

const deelay = ms => {
    return new Promise(r => setTimeout(() => r(), ms))
}

CheckDeadlinesList(true)

let stickers_presets = fb.database().ref('Grindr/presets/stickers')
stickers_presets.on('value', (result) => {
    sticker_hello = result.val().sticker_hello
})

let pricelists = fb.database().ref('Grindr/presets/payments/pricelist/')
pricelists.on('value', (result) => {
    pricelist_delete_account = result.val().delete_account
    pricelist_sharecontact = result.val().sharecontact
})

let restrictions = fb.database().ref('Grindr/presets/restrictions')
restrictions.on('value', (result) => {
    userdescription_maxsymbols = result.val().userdescription_maxsymbols
})

//Здесь мы реагируем на весь текст, который отправил пользователь боту, в том числе и на стандартную клавиатуру
bot.on('message', (msg) =>
{
    const { chat, message_id, text } = msg

    if (!text.includes('/')){
        if (donateregisterstep[chat.id] !== undefined && donateregisterstep[chat.id] > 0){
            bot.deleteMessage(chat.id, message_id).catch(err => {console.log('here: ' + err)})
    
            if (donateregisterstep[chat.id] === 6){
                if (msg.text.includes('https://')){
                    donate_materials[chat.id] = text
                    CreateDonation(chat)
                }
            }
    
            if (donateregisterstep[chat.id] === 5 && msg.photo !== undefined){
                donate_photo[chat.id] = msg.photo[0].file_id
                bot.editMessageText(newdonationsteps[5], {
                    parse_mode: 'HTML',
                    chat_id: chat.id,
                    message_id: message_toedit[chat.id][0],
                    reply_markup: {
                        inline_keyboard: [
                            [{
                                text: backtostart[0],
                                callback_data: backtonewdonate[3]
                            }],
                            [{
                                text: ihavematerials[0],
                                callback_data: ihavematerials[1]
                            },
                            {
                                text: ihavematerials[2],
                                callback_data: ihavematerials[3]
                            }]
                        ]
                    }
                })
            }
    
            if (donateregisterstep[chat.id] === 4){
                if (parseInt(text) >= 1 && parseInt(text) <= 30){
                    donate_duration[chat.id] = parseInt(text)
                    donateregisterstep[chat.id] = 5
                    bot.editMessageText(newdonationsteps[4], {
                        parse_mode: 'HTML',
                        chat_id: chat.id,
                        message_id: message_toedit[chat.id][0],
                        reply_markup: {
                            inline_keyboard: [
                                [{
                                    text: backtostart[0],
                                    callback_data: backtonewdonate[2]
                                }],
                                [{
                                    text: previewimg[2],
                                    callback_data: previewimg[3]
                                }]
                            ]
                        }
                    })
                }
            }
    
            if (donateregisterstep[chat.id] === 3){
                if (parseInt(text) >= 50 && parseInt(text) <= 10000){
                    donateregisterstep[chat.id] = 4
                    donate_minmoney[chat.id] = parseInt(text)
                    bot.editMessageText(newdonationsteps[3], {
                        parse_mode: 'HTML',
                        chat_id: chat.id,
                        message_id: message_toedit[chat.id][0],
                        reply_markup: {
                            inline_keyboard: [
                                [{
                                    text: backtostart[0],
                                    callback_data: backtonewdonate[1]
                                }]
                            ]
                        }
                    })
                }
            }
    
            if (donateregisterstep[chat.id] === 2){
                if (parseInt(text) >= 500 && parseInt(text) <= 300000){
                    donateregisterstep[chat.id] = 3
                    donate_money[chat.id] = parseInt(text)
                    bot.editMessageText(newdonationsteps[2], {
                        parse_mode: 'HTML',
                        chat_id: chat.id,
                        message_id: message_toedit[chat.id][0],
                        reply_markup: {
                            inline_keyboard: [
                                [{
                                    text: backtostart[0],
                                    callback_data: backtonewdonate[0]
                                }]
                            ]
                        }
                    })
                }
            }
            
            if (donateregisterstep[chat.id] === 1){
                if (text.length < 100){
                    donateregisterstep[chat.id] = 2
                    donate_name[chat.id] = text
    
                    bot.editMessageText(newdonationsteps[1], {
                        parse_mode: 'HTML',
                        chat_id: chat.id,
                        message_id: message_toedit[chat.id][0],
                        reply_markup: {
                            inline_keyboard: [
                                [{
                                    text: backtostart[0],
                                    callback_data: whoareyoubutton[1]
                                }]
                            ]
                        }
                    })
                }
                
            }
        }
    
        if (donate_editmaterials[chat.id] !== undefined && donate_editmaterials[chat.id] === true){
            bot.deleteMessage(chat.id, message_id).catch(err => {console.log('here: ' + err)})
            if (msg.text.includes('https://')){
                donate_materials[chat.id] = text
    
                let updates = {}
        
                updates['Kickstarter/users/' + chat.id + '/donations/' + donate_tempdonateid[chat.id] + '/materials'] = text
                fb.database().ref().update(updates)
                .then(() => {
                    OpenDonation(chat, donate_tempdonateid[chat.id])
                    donate_editmaterials[chat.id] = false
                    donate_tempdonateid[chat.id] = '/error/'
    
                    bot.deleteMessage(chat.id, message_toedit[chat.id][1]).catch(err => {console.log('here: ' + err)})
                })
            }
        }
    
        if (donate_editpreview[chat.id] !== undefined && donate_editpreview[chat.id] === true){
            bot.deleteMessage(chat.id, message_id).catch(err => {console.log('here: ' + err)})
            if (msg.photo !== undefined){
                let updates = {}
                updates['Kickstarter/users/' + chat.id + '/donations/' + donate_tempdonateid[chat.id] + '/photo'] = msg.photo[0].file_id
                fb.database().ref().update(updates)
                .then(() => {
                    OpenDonation(chat, donate_tempdonateid[chat.id])
                    donate_editpreview[chat.id] = false
                    donate_tempdonateid[chat.id] = '/error/'
    
                    bot.deleteMessage(chat.id, message_toedit[chat.id][1]).catch(err => {console.log('here: ' + err)})
                })
            }
        }
    
        if (isAddingcardinfo[chat.id] !== undefined && isAddingcardinfo[chat.id] !== null){
            bot.deleteMessage(chat.id, message_id).catch(err => {console.log('here: ' + err)})
    
            if (isAddingcardinfo[chat.id] === 'qiwi'){
                if (text.length >= 11 && text.length <= 12 && !isNaN(text)) {
                    let updates = {}
                    updates['Kickstarter/users/' + chat.id + '/balance/card'] = 'qiwi:' + text
                    fb.database().ref().update(updates).then(() => {
                        WithDrawInfo(chat)
                        isAddingcardinfo[chat.id] = undefined
                    })
                }
            }

            if (isAddingcardinfo[chat.id] === 'yoomoney'){
                if (text.length === 16 && !isNaN(text)) {
                    let updates = {}
                    updates['Kickstarter/users/' + chat.id + '/balance/card'] = 'yoomoney:' + text
                    fb.database().ref().update(updates).then(() => {
                        WithDrawInfo(chat)
                        isAddingcardinfo[chat.id] = undefined
                    })
                }
            }
        }
    
        if (participating_data[chat.id] !== undefined && participating_data[chat.id][0] !== undefined && participating_data[chat.id][0] === true) {
            bot.deleteMessage(chat.id, message_id).catch(err => {console.log('here: ' + err)})
            if (parseInt(text) >= participating_data[chat.id][1] && parseInt(text) <= participating_data[chat.id][2]){
                ParticipateDonation(chat, text)
            }
        }
    }
    
})

//Здесь мы отслеживаем все действия с инлайн-клавиатурой
bot.on('callback_query', query => {
    const { chat, message_id, text } = query.message

    //удалить заданное сообщение
    if (query.data.includes('deletemessage')){
        for (let i = 0; i< message_todelete[chat.id].length; i++){
            bot.deleteMessage(chat.id, message_todelete[chat.id][i]).catch(err => {console.log('here: ' + err)})
        }
        
    }

    //ДОБАВИТЬ СЮДА ВСЕ ЧТО ЕСТЬ ПРИ СТАРТЕ
    if (query.data === backtostart[1]){
        Start(query.message)
    }

    if (message_toedit[chat.id] !== undefined){
        if (query.data === backtomain[1]){
            bot.deleteMessage(chat.id, message_toedit[chat.id][0]).catch(err => {console.log('here: ' + err)})
            Auth(chat)
        }
    
        if (query.data === whoareyoubutton[1]){
            donateregisterstep[chat.id] = 1
            donate_name[chat.id] = ''
            donate_money[chat.id] = 0
            donate_minmoney[chat.id] = 0
            donate_duration[chat.id] = 0
            donate_sendduration[chat.id] = 3
            donate_photo[chat.id] = ''
            donate_duration_secs[chat.id] = 0
            donate_sendduration_secs[chat.id] = 0
            donate_materials[chat.id] = ''
    
            let creatordata = fb.database().ref('Kickstarter/mailing')
            creatordata.get().then(result => {
                donate_private[chat.id] = true
                if (result.exists()){
                    if (result.val().authors.includes(chat.id)){
                        donate_private[chat.id] = false
                        console.log('changing: ' + donate_private[chat.id])
                    }
                }
                bot.deleteMessage(chat.id, message_toedit[chat.id][0]).catch(err => {console.log('here: ' + err)})
                bot.sendMessage(chat.id, newdonationsteps[0], {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [{
                                text: backtostart[0],
                                callback_data: backtostart[1]
                            }]
                        ]
                    }
                })
                .then(res => {
                    message_toedit[chat.id][0] = res.message_id
                    messagetext_toedit[chat.id][0] = newdonationsteps[0]
                })
            })
    
            
        }
    
        if (query.data.includes(checkchannelfollow[1])){
            let checkuser = fb.database().ref('Kickstarter/settings/channel')
            checkuser.get().then(result => {
                if (query.data === checkchannelfollow[1] + '_0'){
                    let txt = 'Для того чтобы использовать бота, вам необходимо подписаться на наш канал.\nПодписка проверяется только один раз - сейчас.'
                    bot.editMessageText(txt, {
                        parse_mode: 'HTML',
                        chat_id: chat.id,
                        message_id: message_toedit[chat.id][0],
                        reply_markup: {
                            inline_keyboard: [
                                [{
                                    text: '🔗 Подписаться',
                                    url: result.val().invite_link
                                }],
                                [{
                                    text: 'Продолжить',
                                    callback_data: checkchannelfollow[1] + '_1'
                                }]
                            ]
                        }
                    })
                }
                if (query.data === checkchannelfollow[1] + '_1'){
                    bot.getChatMember(result.val().id, chat.id).then(res => {
                        console.log(res)
                        if (res.status === 'member' || res.status === 'creator' || res.status === 'administrator'){
                            console.log(user_donationlink[chat.id])
                            if (user_donationlink[chat.id] !== undefined){
                                OpenDonationParticipant(chat, null)
                            }
                            else {
                                myBalance(chat)
                                /* let txt = 'Для того, чтобы поучаствовать в сборе, Вам необходимо получить ссылку от автора этого сбора. Перейдя по ней, бот перезапустится и отобразит сбор 😊'
                                bot.editMessageText(txt, {
                                    parse_mode: 'HTML',
                                    chat_id: chat.id,
                                    message_id: message_toedit[chat.id][0],
                                }) */
                            }
                        }
                        else {
                            bot.answerCallbackQuery({
                                callback_query_id: query.id,
                                text: '🥺 Вы все еще не подписаны...\n\nНажмите на кнопку 🔗 Подписаться под сообщением',
                                show_alert: true
                            })
                        }
                        //грузим список сборов, в которых можно поучаствовать или если у нас
                        //есть ссылка-приглашение на конкретный сбор, то заходим в него
                    })
                    .catch(err => {
                        console.log(err)
                        bot.answerCallbackQuery({
                            callback_query_id: query.id,
                            text: '🥺 Вы все еще не подписаны...\n\nНажмите на кнопку 🔗 Подписаться под сообщением',
                            show_alert: true
                        })
                    })
                }
            })
            
            
        }
    
        if (query.data === mydonationslist[1]){
    
            donate_editmaterials[chat.id] = false
            
            bot.deleteMessage(chat.id, message_toedit[chat.id][1]).catch(err => {console.log('here: ' + err)})
            bot.deleteMessage(chat.id, message_toedit[chat.id][0]).catch(error => {console.log(error)})
            
            let txt = '<b>Список Ваших сборов:</b>'
    
            //user_donations[chat.id] = []
    
            let kb = []
    
            let num_online = 0
            let txt_online = ''
            let kb_online = []
    
            let num_waiting = 0
            let txt_waiting = ''
            let kb_waiting = []
    
            let num_canceled = 0
            let txt_canceled = ''
            let kb_canceled = []
            
            let num_offline = 0
            let txt_offline = ''
            let kb_offline = []
    
            for (let i=0; i< donationnames[chat.id].length; i++){
                let donationsdata = fb.database().ref('Kickstarter/users/' + chat.id + '/donations/' + donationnames[chat.id][i])
                donationsdata.get().then(result => {
                    if (result.val().status === 'online'){
                        if (num_online === 0) txt_online += '\n\n<b>🟢 Активные сборы:</b>'
    
                        //user_donations[chat.id][num_online] = result.val()
    
                        let stringlength = result.val().name.length
                        console.log(stringlength)
    
                        if (stringlength > 15) {
                            txt_online += '\n' + (result.val().name).slice(0, 15) + '...'
                            kb_online.push([{
                                text: '🟢 ' + (result.val().name).slice(0, 15) + '...',
                                callback_data: 'opendonation_' +  donationnames[chat.id][i]
                            }])
                        }
                        if (stringlength <= 15){
                            txt_online += '\n' + result.val().name
                            kb_online.push([{
                                text: '🟢 ' + result.val().name,
                                callback_data: 'opendonation_' +  donationnames[chat.id][i]
                            }])
                        }
    
                        num_online++
                    }
    
                    if (result.val().status === 'waiting'){
    
                        if (num_waiting === 0) txt_waiting += '\n\n<b>🟡 Ожидают:</b>'
    
                        let stringlength = result.val().name.length
                        console.log(stringlength)
    
                        if (stringlength > 15) {
                            txt_waiting += '\n' + (result.val().name).slice(0, 15) + '...'
                            kb_waiting.push([{
                                text: '🟡 ' + (result.val().name).slice(0, 15) + '...',
                                callback_data: 'opendonation_' +  donationnames[chat.id][i]
                            }])
                        }
                        if (stringlength <= 15){
                            txt_waiting += '\n' + result.val().name
                            kb_waiting.push([{
                                text: '🟡 ' + result.val().name,
                                callback_data: 'opendonation_' +  donationnames[chat.id][i]
                            }])
                        }
                        num_waiting++
                    }
    
                    if (result.val().status === 'canceled'){
    
                        if (num_canceled === 0) txt_canceled += '\n\n<b>🔴 Отмененные сборы:</b>'
    
                        let stringlength = result.val().name.length
                        console.log(stringlength)
    
                        if (stringlength > 15) {
                            txt_canceled += '\n' + (result.val().name).slice(0, 15) + '...'
                            kb_canceled.push([{
                                text: '🔴 ' + (result.val().name).slice(0, 15) + '...',
                                callback_data: 'opendonation_' +  donationnames[chat.id][i]
                            }])
                        }
                        if (stringlength <= 15){
                            txt_canceled += '\n' + result.val().name
                            kb_canceled.push([{
                                text: '🔴 ' + result.val().name,
                                callback_data: 'opendonation_' +  donationnames[chat.id][i]
                            }])
                        }
                        num_canceled++
                    }
    
                    if (result.val().status === 'offline'){
    
                        if (num_offline === 0) txt_offline += '\n\n<b>✅ Завершенные:</b>'
    
                        let stringlength = result.val().name.length
                        console.log(stringlength)
    
                        if (stringlength > 15) {
                            txt_offline += '\n' + (result.val().name).slice(0, 15) + '...'
                            kb_offline.push([{
                                text: '✅ ' + (result.val().name).slice(0, 15) + '...',
                                callback_data: 'opendonation_' +  donationnames[chat.id][i]
                            }])
                        }
                        if (stringlength <= 15){
                            txt_offline += '\n' + result.val().name
                            kb_offline.push([{
                                text: '✅ ' + result.val().name,
                                callback_data: 'opendonation_' +  donationnames[chat.id][i]
                            }])
                        }
                        num_offline++
                    }
    
                    if (i === donationnames[chat.id].length - 1){
                        txt += txt_online + txt_waiting + txt_canceled + txt_offline
                        txt += '\n\nДля просмотра сбора, нажмите на кнопку(-и) ниже'
                        console.log('here')
                        kb.push([{
                            text: backtomain[0],
                            callback_data: backtomain[1]
                        },
                        {
                            text: '➕ Новый сбор',
                            callback_data: whoareyoubutton[1]
                        }])
                        if (kb_online.length > 0){
                            for (let x=0; x < kb_online.length; x++){
                                kb.push(kb_online[x])
                            }
                        }
                        
                        if (kb_waiting.length > 0) {
                            for (let y=0; y < kb_waiting.length; y++){
                                kb.push(kb_waiting[y])
                            }
                        }
                        
                        if (kb_canceled.length > 0){
                            for (let z=0; z < kb_canceled.length; z++){
                                kb.push(kb_canceled[z])
                            }
                        }
                        
                        if (kb_offline.length > 0){
                            for (let b=0; b< kb_offline.length; b++){
                                kb.push(kb_offline[b])
                            }
                        }
    
                        bot.sendMessage(chat.id, txt, {
                            parse_mode: 'HTML',
                            reply_markup: {
                                inline_keyboard: kb
                            }
                        })
                        .then(res => {
                            message_toedit[chat.id][0] = res.message_id
                        })
                        .catch(err => {console.log('here: ' + err)})
                    }
                    
                })
    
                
            }
        }
    
        if (query.data.includes(checkparticipantsbutton[1])){
            let donationdata = fb.database().ref('Kickstarter/users/' + chat.id + '/donations/' + (query.data).split('_')[1] + '/participants')
            donationdata.get().then(result => {
                console.log('Kickstarter/users/' + chat.id + '/donations/' + query.data.split('_')[1] + '/participants')
                let txt = '<b>Список участников:</b> \n\n'
                for (let i = 0; i < result.val().length; i++){
                    txt += '<a href="tg://user?id='+ result.val()[i].id +'">'+  result.val()[i].name +'</a>, '
                    if (i === result.val().length - 1){
                        bot.sendMessage(chat.id, txt, {
                            parse_mode: 'HTML',
                        })
                        .then(res => {
                            message_toedit[chat.id][1] = res.message_id
                        })
                    }
                }
            })
        }
    
        if (query.data === publicdonationlist[1]){
            GlobalDonationList(chat)
        }
    
        if (query.data.includes('opendonation_')){
            OpenDonation(chat, (query.data).split('_')[1])
        }
    
        if (query.data.includes('opendonationparticipant_')){
            OpenDonationParticipant(chat, (query.data).split('_')[1] + '/donations/' + (query.data).split('_')[2])
        }
    
        if (query.data.includes(finishdonation[1])){
            if (query.data.includes(finishdonation[1] + '_0_')){
                let txt = 'Вы уверены, что хотите закончить сбор? Вы получите вырученные средства, а участники сбора - Ваш материал. \n\nЭто действие нельзя будет отменить'
                bot.editMessageText(txt, {
                    chat_id: chat.id,
                    message_id: message_toedit[chat.id][0],
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [{
                                text: backtostart[0],
                                callback_data: 'opendonation_' + query.data.split('_')[2]
                            },
                            {
                                text: finishdonation[0],
                                callback_data: finishdonation[1] + '_1_' + query.data.split('_')[2]
                            }]
                        ]
                    }
                }).catch(err => {
                    console.log('here: ' + err)
                    bot.editMessageCaption(txt, {
                        chat_id: chat.id,
                        message_id: message_toedit[chat.id][0],
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: [
                                [{
                                    text: backtostart[0],
                                    callback_data: 'opendonation_' + query.data.split('_')[2]
                                },
                                {
                                    text: finishdonation[0],
                                    callback_data: finishdonation[1] + '_1_' + query.data.split('_')[2]
                                }]
                            ]
                        }
                    })
                })
            }
            if (query.data.includes(finishdonation[1] + '_1_')){
                FinishDonation(chat, query.data.split('_')[2])
            }
        }
    
        if (query.data.includes(canceldonation[1])){
            if (query.data.includes(canceldonation[1] + '_0_')){
                let txt = 'Вы уверены, что хотите отменить сбор? Все собранные средства вернутся участникам, но они не увидят Ваш материал\n\nЭто действие нельзя будет отменить'
                bot.editMessageText(txt, {
                    chat_id: chat.id,
                    message_id: message_toedit[chat.id][0],
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [{
                                text: backtostart[0],
                                callback_data: 'opendonation_' + query.data.split('_')[2]
                            },
                            {
                                text: canceldonation[0],
                                callback_data: canceldonation[1] + '_1_' + query.data.split('_')[2]
                            }]
                        ]
                    }
                }).catch(err => {
                    console.log('here: ' + err)
                    bot.editMessageCaption(txt, {
                        chat_id: chat.id,
                        message_id: message_toedit[chat.id][0],
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: [
                                [{
                                    text: backtostart[0],
                                    callback_data: 'opendonation_' + query.data.split('_')[2]
                                },
                                {
                                    text: canceldonation[0],
                                    callback_data: canceldonation[1] + '_1_' + query.data.split('_')[2]
                                }]
                            ]
                        }
                    })
                })
            }
            if (query.data.includes(canceldonation[1] + '_1_')){
                CancelDonation(chat, query.data.split('_')[2])
            }
        }
    
        if (query.data.includes(editmaterial[1])){
            donate_editmaterials[chat.id] = true
            donate_tempdonateid[chat.id] = query.data.split('_')[1]
            console.log('lol:' + query.data)
    
            bot.sendMessage(chat.id, newdonationsteps[6], {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [{
                            text: backeditmaterial[0],
                            callback_data: backeditmaterial[1]
                        }]
                    ]
                }
            })
            .then(res => {
                message_toedit[chat.id][1] = res.message_id
            })
            .catch(err => {console.log('here: ' + err)})
        }

        if (query.data.includes(editpreview[1])){
            donate_editpreview[chat.id] = true
            donate_tempdonateid[chat.id] = query.data.split('_')[1]
            console.log('lol:' + query.data)
    
            bot.sendMessage(chat.id, newdonationsteps[4], {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [{
                            text: backeditpreview[0],
                            callback_data: backeditpreview[1]
                        }]
                    ]
                }
            })
            .then(res => {
                message_toedit[chat.id][1] = res.message_id
            })
            .catch(err => {console.log('here: ' + err)})
        }
    
        if (query.data === backeditmaterial[1]){
            console.log('heere')
            donate_editmaterials[chat.id] = false
            bot.deleteMessage(chat.id, message_toedit[chat.id][1]).catch(err => {console.log('here: ' + err)})
        }
        if (query.data === backeditpreview[1]){
            console.log('heere')
            donate_editmaterials[chat.id] = false
            bot.deleteMessage(chat.id, message_toedit[chat.id][1]).catch(err => {console.log('here: ' + err)})
        }
    
        if (query.data === sborprivacy[1]){
            donate_private[chat.id] = false
            donateregisterstep[chat.id] = 6
            if (donate_materials[chat.id] !== ''){
                bot.editMessageText(newdonationsteps[7], {
                    parse_mode: 'HTML',
                    chat_id: chat.id,
                    message_id: message_toedit[chat.id][0],
                    reply_markup: {
                        inline_keyboard: [
                            [{
                                text: backtostart[0],
                                callback_data: backtonewdonate[4]
                            }],
                            [{
                                text: previewimg[2],
                                callback_data: previewimg[3]
                            }]
                        ]
                    }
                })
            }
            if (donate_materials[chat.id] === ''){
                bot.editMessageText(newdonationsteps[6], {
                    parse_mode: 'HTML',
                    chat_id: chat.id,
                    message_id: message_toedit[chat.id][0],
                    reply_markup: {
                        inline_keyboard: [
                            [{
                                text: backtostart[0],
                                callback_data: backtonewdonate[4]
                            }],
                            [{
                                text: previewimg[2],
                                callback_data: previewimg[3]
                            }]
                        ]
                    }
                })
            }
        }
    
        if (query.data === sborprivacy[3]){
            donate_private[chat.id] = true
            donateregisterstep[chat.id] = 6
            if (donate_materials[chat.id] !== ''){
                bot.editMessageText(newdonationsteps[7], {
                    parse_mode: 'HTML',
                    chat_id: chat.id,
                    message_id: message_toedit[chat.id][0],
                    reply_markup: {
                        inline_keyboard: [
                            [{
                                text: backtostart[0],
                                callback_data: backtonewdonate[4]
                            }],
                            [{
                                text: previewimg[2],
                                callback_data: previewimg[3]
                            }]
                        ]
                    }
                })
            }
            if (donate_materials[chat.id] === ''){
                bot.editMessageText(newdonationsteps[6], {
                    parse_mode: 'HTML',
                    chat_id: chat.id,
                    message_id: message_toedit[chat.id][0],
                    reply_markup: {
                        inline_keyboard: [
                            [{
                                text: backtostart[0],
                                callback_data: backtonewdonate[4]
                            }],
                            [{
                                text: previewimg[2],
                                callback_data: previewimg[3]
                            }]
                        ]
                    }
                })
            }
        }
    
        if (query.data === previewimg[3]){
    
            donateregisterstep[chat.id] = 5
            bot.editMessageText(newdonationsteps[5], {
                parse_mode: 'HTML',
                chat_id: chat.id,
                message_id: message_toedit[chat.id][0],
                reply_markup: {
                    inline_keyboard: [
                        [{
                            text: backtostart[0],
                            callback_data: backtonewdonate[3]
                        }],
                        [{
                            text: ihavematerials[0],
                            callback_data: ihavematerials[1]
                        },
                        {
                            text: ihavematerials[2],
                            callback_data: ihavematerials[3]
                        }]
                    ]
                }
            })
        }
    
        if (query.data === createdonation[1]){
            let registerdata = fb.database().ref('Kickstarter/users/' + chat.id)
            registerdata.get().then(result => {
    
                let updates = {}
                let newdonation = {
                    name: donate_name[chat.id],
                    money: donate_money[chat.id],
                    minmoney: donate_minmoney[chat.id],
                    duration: donate_duration_secs[chat.id],
                    sendduration: donate_sendduration_secs[chat.id],
                    privacy: donate_private[chat.id],
                    photo: donate_photo[chat.id],
                    status: 'online',
                    bank: 0,
                    materials: donate_materials[chat.id]
                }
                let freeaut = fb.database().ref('Kickstarter/mailing')
                freeaut.get().then(reply => {
                    if (!reply.val().authors.includes(chat.id)){
                        if (!reply.val().free_authors.includes(chat.id)){
                            let new_updates = {}
                            if (reply.val().free_authors === ''){
                                new_updates['Kickstarter/mailing/free_authors'] = (chat.id).toString()
                            }
                            if (reply.val().free_authors !== ''){
                                new_updates['Kickstarter/mailing/free_authors'] = reply.val().free_authors + ',' + chat.id
                            }
                            fb.database().ref().update(new_updates)
                        }
                    }
                })
                
    
                /* if (donate_private[chat.id] === false){
                    let publicdon = fb.database().ref('Kickstarter/gallery/donations')
                    publicdon.get().then(reply => {
                        let donation_updates = {}
                        if (reply.val() !== undefined && result.exists()){
                            donation_updates['Kickstarter/gallery/donations/'+reply.val().length+'/user_id'] = chat.id
                            donation_updates['Kickstarter/gallery/donations/'+reply.val().length+'/name'] = donate_name[chat.id]
                            donation_updates['Kickstarter/gallery/donations/'+reply.val().length+'/donation_id'] = donate_duration_secs[chat.id]
                        }
                        else {
                            donation_updates['Kickstarter/gallery/donations/0/user_id'] = chat.id
                            donation_updates['Kickstarter/gallery/donations/0/name'] = donate_name[chat.id]
                            donation_updates['Kickstarter/gallery/donations/0/donation_id'] = donate_duration_secs[chat.id]
                        }
                        fb.database().ref().update(donation_updates)
                    })
                    
                } */
    
    
                if (!result.exists()) {
                    console.log('USER DIDNT REGISTER YET')
                    updates['Kickstarter/users/' + chat.id + '/profile/id'] = chat.id
                    updates['Kickstarter/users/' + chat.id + '/profile/name'] = chat.first_name
                    
                    updates['Kickstarter/users/' + chat.id + '/balance/bank'] = 0
                    updates['Kickstarter/users/' + chat.id + '/balance/comission'] = 10
                    updates['Kickstarter/users/' + chat.id + '/balance/overall'] = 0
                    updates['Kickstarter/users/' + chat.id + '/balance/withdrew'] = 0
                    updates['Kickstarter/users/' + chat.id + '/balance/withdroval_limit'] = 3000 //мин. сумма для вывода
                }
    
                updates['Kickstarter/users/' + chat.id + '/donations/' + donate_duration_secs[chat.id]] = newdonation
                fb.database().ref().update(updates)
                .then(() => {
                    bot.deleteMessage(chat.id, message_toedit[chat.id][0]).catch(err => {console.log('here: ' + err)})
                    Auth(chat)
                })
            })
        }
    
        if (query.data === backtonewdonate[6]){
            if (donate_materials[chat.id] === 'null'){
                donate_materials[chat.id] = 'null'
                donateregisterstep[chat.id] = 6
                if (msg.text.includes('https://')){
                    bot.editMessageText(newdonationsteps[7], {
                        parse_mode: 'HTML',
                        chat_id: chat.id,
                        message_id: message_toedit[chat.id][0],
                        reply_markup: {
                            inline_keyboard: [
                                [{
                                    text: backtostart[0],
                                    callback_data: backtonewdonate[5]
                                }]
                            ]
                        }
                    })
                }
            }
            else {
                donate_photo[chat.id] = ''
                donateregisterstep[chat.id] = 6
                bot.editMessageText(newdonationsteps[6], {
                    parse_mode: 'HTML',
                    chat_id: chat.id,
                    message_id: message_toedit[chat.id][0],
                    reply_markup: {
                        inline_keyboard: [
                            [{
                                text: backtostart[0],
                                callback_data: backtonewdonate[4]
                            }],
                            [{
                                text: previewimg[2],
                                callback_data: previewimg[3]
                            }]
                        ]
                    }
                })
            }
        }
    
        if (query.data === ihavematerials[3]){
            CreateDonation(chat)
        }
    
        if (query.data === backtonewdonate[5]){
            donate_photo[chat.id] = ''
            donateregisterstep[chat.id] = 6
            bot.editMessageText(newdonationsteps[6], {
                parse_mode: 'HTML',
                chat_id: chat.id,
                message_id: message_toedit[chat.id][0],
                reply_markup: {
                    inline_keyboard: [
                        [{
                            text: backtostart[0],
                            callback_data: backtonewdonate[4]
                        }],
                        [{
                            text: previewimg[2],
                            callback_data: previewimg[3]
                        }]
                    ]
                }
            })
        }
    
        if (query.data === backtonewdonate[4]){
            donate_materials[chat.id] = 'null'
            bot.editMessageText(newdonationsteps[5], {
                parse_mode: 'HTML',
                chat_id: chat.id,
                message_id: message_toedit[chat.id][0],
                reply_markup: {
                    inline_keyboard: [
                        [{
                            text: backtostart[0],
                            callback_data: backtonewdonate[3]
                        }],
                        [{
                            text: ihavematerials[0],
                            callback_data: ihavematerials[1]
                        },
                        {
                            text: ihavematerials[2],
                            callback_data: ihavematerials[3]
                        }]
                    ]
                }
            })
    
            bot.editMessageText(newdonationsteps[5], {
                parse_mode: 'HTML',
                chat_id: chat.id,
                message_id: message_toedit[chat.id][0],
                reply_markup: {
                    inline_keyboard: [
                        [{
                            text: backtostart[0],
                            callback_data: backtonewdonate[3]
                        }],
                        [{
                            text: sborprivacy[2],
                            callback_data: sborprivacy[3]
                        }]
                    ]
                }
            })
        }
    
        if (query.data === backtonewdonate[3]){
            donateregisterstep[chat.id] = 5
            donate_photo[chat.id] = ''
    
            bot.editMessageText(newdonationsteps[4], {
                parse_mode: 'HTML',
                chat_id: chat.id,
                message_id: message_toedit[chat.id][0],
                reply_markup: {
                    inline_keyboard: [
                        [{
                            text: backtostart[0],
                            callback_data: backtonewdonate[2]
                        }],
                        [{
                            text: previewimg[2],
                            callback_data: previewimg[3]
                        }]
                    ]
                }
            })
        }
    
        if (query.data === backtonewdonate[2]){
            donateregisterstep[chat.id] = 4
            donate_duration[chat.id] = 0
    
            bot.editMessageText(newdonationsteps[3], {
                parse_mode: 'HTML',
                chat_id: chat.id,
                message_id: message_toedit[chat.id][0],
                reply_markup: {
                    inline_keyboard: [
                        [{
                            text: backtostart[0],
                            callback_data: backtonewdonate[1]
                        }]
                    ]
                }
            })
        }
    
        if (query.data === backtonewdonate[1]){
            donateregisterstep[chat.id] = 3
            donate_minmoney[chat.id] = 0
    
            bot.editMessageText(newdonationsteps[2], {
                parse_mode: 'HTML',
                chat_id: chat.id,
                message_id: message_toedit[chat.id][0],
                reply_markup: {
                    inline_keyboard: [
                        [{
                            text: backtostart[0],
                            callback_data: backtonewdonate[0]
                        }]
                    ]
                }
            })
        }
    
        if (query.data === backtonewdonate[0]){
            donateregisterstep[chat.id] = 2
            donate_money[chat.id] = 0
    
            bot.editMessageText(newdonationsteps[1], {
                parse_mode: 'HTML',
                chat_id: chat.id,
                message_id: message_toedit[chat.id][0],
                reply_markup: {
                    inline_keyboard: [
                        [{
                            text: backtostart[0],
                            callback_data: whoareyoubutton[1]
                        }]
                    ]
                }
            })
        }
    
        if (query.data === ihavematerials[1]){
            donate_materials[chat.id] = 'null'
            donateregisterstep[chat.id] = 6
    
            bot.editMessageText(newdonationsteps[6], {
                parse_mode: 'HTML',
                chat_id: chat.id,
                message_id: message_toedit[chat.id][0],
                reply_markup: {
                    inline_keyboard: [
                        [{
                            text: backtostart[0],
                            callback_data: backtonewdonate[4]
                        }],
                        [{
                            text: ihavematerials[2],
                            callback_data: ihavematerials[3]
                        }]
                    ]
                }
            })
        }
    
        if (query.data === balancehistory[1]){
            bot.deleteMessage(chat.id, message_toedit[chat.id][1]).catch(err => {console.log('here: ' + err)})
    
            let balancedata = fb.database().ref('Kickstarter/users/' + chat.id)
            balancedata.get().then(result => {
                if (result.val().balance.history !== undefined){
                    let txt = '<b>Список Ваших операций:</b>\n'
    
                    for(let i = 0; i < result.val().balance.history.length; i++){
                        let created_date = new Date(result.val().balance.history[i].date)
                        let createddate = created_date.getDate() + '.' + (created_date.getMonth() + 1)
        
                        txt += '\n<b>' + createddate + ':</b> ' +  result.val().balance.history[i].description
        
                        if (i === result.val().balance.history.length - 1){
                            bot.editMessageText(txt, {
                                parse_mode: 'HTML',
                                chat_id: chat.id,
                                message_id: message_toedit[chat.id][0],
                                reply_markup: {
                                    inline_keyboard: [
                                        [{
                                            text: backtostart[0],
                                            callback_data: mybalancebutton[1]
                                        }]
                                    ]
                                }
                            })
                        }
                    }
                }
                else {
                    bot.answerCallbackQuery({
                        callback_query_id: query.id,
                        text: '😢 Вы пока не совершили ни одной операции',
                        show_alert: true
                    })
                }
            })
        }
    
        if (query.data === opendonationparticipant){
            OpenDonationParticipant(chat, null)
        }
    
        //ПОПОЛНЕНИЕ БАЛАНСА
        if (query.data === mybalancebutton[1]){
            myBalance(chat)
        }
        if (query.data === addmoneybutton[1]){
            AddMoney(chat, false)
        }
        if (query.data === addmoneyparticipant[1]){
            AddMoney(chat, true)
        }
        if (query.data.includes(addmoneyamount)){ 
    
            let amount = query.data.split('_')[1]
    
            let date = new Date()
            let utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
            let timeOfffset = 6 //Astana GMT +6
            let time_now = new Date(utcTime + (3600000 * timeOfffset))
    
            billid[chat.id] = time_now.getTime()
            
            const params = {
                publicKey,
                amount: amount,
                billId: time_now.getTime(),
                successUrl: 'https://merchant.com/payment/success?billId=' + time_now.getTime()
            };
            
            const link = qiwiApi.createPaymentForm(params)
            console.log(link)
    
            let txt = ''
            if (user_donationlink[chat.id] !== undefined && user_donationlink[chat.id] !== null) {
                txt += '<b>Счет сформирован. Для пополнения баланса ('+ amount +' руб.), нажмите на ссылку ниже:\n<a href="'+ link + '">https://oplata.qiwi.com/pay</a></b>'
            }
            if (user_donationlink[chat.id] === undefined || user_donationlink[chat.id] === null) {
                txt += messagetext_toedit[chat.id][0] + '\n\n<b>Счет сформирован. Для пополнения баланса ('+ amount +' руб.), нажмите на ссылку ниже:\n<a href="'+ link + '">https://oplata.qiwi.com/pay</a></b>'
            }
            
            bot.editMessageText(txt, {
                chat_id: chat.id,
                message_id: message_toedit[chat.id][0], 
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [{
                            text: checkmoneyaddbutton[0],
                            callback_data: checkmoneyaddbutton[1],
                        }],
                        [{
                            text: backtostart[0],
                            callback_data: checkmoneyaddbutton[2],
                        }]
                    ]
                }
            })
    
        }
        if (query.data === checkmoneyaddbutton[1]){
    
            qiwiApi.getBillInfo(billid[chat.id]).then(data => {
                console.log(data)
                console.log(data.status.value)
                if (data.status.value === 'WAITING'){
                    bot.answerCallbackQuery({
                        callback_query_id: query.id,
                        text: '⏳ Платеж ожидает оплаты',
                        show_alert: true
                    })
                }
                else if (data.status.value === 'PAID'){
                    let addmoney_data = fb.database().ref('Kickstarter/users/' + chat.id + '/balance/')
                    addmoney_data.get().then(result => {
                        let updates = {}
    
                        let newaction = {
                            description: 'Пополнение баланса на ' + parseInt(data.amount.value) + ' руб.',
                            date: parseInt(data.billId)
                        }
    
                        if (result.val().history !== undefined){
                            updates['Kickstarter/users/' + chat.id + '/balance/history/' + result.val().history.length] = newaction
                        }
                        if (result.val().history === undefined){
                            updates['Kickstarter/users/' + chat.id + '/balance/history/0'] = newaction
                        }
    
                        updates['Kickstarter/users/' + chat.id + '/balance/bank'] = result.val().bank + parseInt(data.amount.value)
                        fb.database().ref().update(updates)
                        bot.deleteMessage(chat.id, message_toedit[chat.id][1]).catch(err => {console.log('here: ' + err)})
                        bot.answerCallbackQuery({
                            callback_query_id: query.id,
                            text: '✅ Счет успешно пополнен',
                            show_alert: true
                        }).catch(err => {console.log('here: ' + err)})
                        if (user_donationlink[chat.id] === undefined || user_donationlink[chat.id] === null){
                            myBalance(chat)
                        }
                        if (user_donationlink[chat.id] !== undefined && user_donationlink[chat.id] !== null){
                            OpenDonationParticipant(chat, null)
                        }
                        
                    })
                }
                else{
                    bot.answerCallbackQuery({
                        callback_query_id: query.id,
                        text: '❌ Платеж был отклонен или истек',
                        show_alert: true
                    })
                }
            }).catch(err => {
                console.log('bill err => ' + err)
                bot.answerCallbackQuery({
                    callback_query_id: query.id,
                    text: '🙅‍♂️ Этот платеж не найден!',
                    show_alert: true
                })
            });
        }
        if (query.data === checkmoneyaddbutton[2]){
            qiwiApi.getBillInfo(billid[chat.id]).then(data => {
                console.log(data)
                console.log(data.status.value)
                if (data.status.value === 'PAID'){
                    let addmoney_data = fb.database().ref('Kickstarter/users/' + chat.id + '/balance/')
                    addmoney_data.get().then(result => {
                        let updates = {}
                        updates['Kickstarter/users/' + chat.id + '/balance/bank'] = result.val().bank + data.amount.value
                        fb.database().ref().update(updates)
                        bot.deleteMessage(chat.id, message_toedit[chat.id][1]).catch(err => {console.log('here: ' + err)})
                        bot.answerCallbackQuery({
                            callback_query_id: query.id,
                            text: '✅ Счет успешно пополнен',
                            show_alert: true
                        }).catch(err => {console.log('here: ' + err)})
                    })
                }
                if (user_donationlink[chat.id] === undefined || user_donationlink[chat.id] === null){
                    AddMoney(chat, false)
                }
                if (user_donationlink[chat.id] !== undefined && user_donationlink[chat.id] !== null){
                    OpenDonationParticipant(chat, null)
                }
    
            }).catch(err => {
                console.log('bill err => ' + err)
                bot.deleteMessage(chat.id, message_toedit[chat.id][1]).catch(err => {console.log('here: ' + err)})
                if (user_donationlink[chat.id] === undefined || user_donationlink[chat.id] === null){
                    AddMoney(chat, false)
                }
                if (user_donationlink[chat.id] !== undefined && user_donationlink[chat.id] !== null){
                    OpenDonationParticipant(chat, null)
                }
            });
        }
    
        //ВЫВОД
        if (query.data === withdrawbutton[1]){
            WithDrawInfo(chat)
            isAddingcardinfo[chat.id] = undefined
        }
        //ДОБАВИТЬ ИНФУ ПО КАРТЕ
        if (query.data.includes(cardinfobutton[1])) {
            if (query.data === cardinfobutton[1] + '_0'){
                let txt = 'Куда Вы хотите выводить деньги? Qiwi или ЮMoney?'
                bot.editMessageText(txt, {
                    chat_id: chat.id,
                    message_id: message_toedit[chat.id][0],
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [{
                                text: backtostart[0],
                                callback_data: withdrawbutton[1]
                            }],
                            [{
                                text: '🥝 Qiwi',
                                callback_data: cardinfobutton[1] + '_1_' + 'qiwi'
                            },
                            {
                                text: '💰 ЮМани',
                                callback_data: cardinfobutton[1] + '_1_' + 'yoomoney'
                            }]
                        ]
                    }
                })
            }
            if (query.data.includes(cardinfobutton[1] + '_1_')){
                let txt = ''    
                if (query.data.split('_')[2] === 'qiwi'){
                    txt = 'Отправьте номер QIWI, на который будут приходить Ваши доходы со сборов\n\n<b>Пример: 79390000000</b> (11/12 знаков, без пробелов и дефисов)'
                    isAddingcardinfo[chat.id] = 'qiwi'
                }
                if (query.data.split('_')[2] === 'yoomoney'){
                    txt = 'Отправьте номер счета ЮMoney, на который будут приходить Ваши доходы со сборов. <b>Не путайте с номером карты!</b>\n\n<b>Пример: 4100000000000000</b> (16 знаков, без пробелов и дефисов)'
                    isAddingcardinfo[chat.id] = 'yoomoney'
                }

                bot.editMessageText(txt, {
                    chat_id: chat.id,
                    message_id: message_toedit[chat.id][0],
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [{
                                text: backtostart[0],
                                callback_data: withdrawbutton[1]
                            }]
                        ]
                    }
                })
            }
        }
        //ВЫВЕСТИ ВСЕ
        if (query.data.includes(withdrawallbutton[1])){
            if (query.data.split('_')[1] === '0'){
                let txt = 'Вы уверены, что хотите снять все доступные средства с текущего баланса?\n\nКомиссия при снятии составляет ' + query.data.split('_')[2] + '%'
                bot.editMessageText(txt, {
                    chat_id: chat.id,
                    message_id: message_toedit[chat.id][0],
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [{
                                text: backtostart[0],
                                callback_data: withdrawbutton[1]
                            },
                            {
                                text: 'Да',
                                callback_data: withdrawallbutton[1] + '_1'
                            }]
                        ]
                    }
                })
            }
            if (query.data.split('_')[1] === '1'){
                let balancedata = fb.database().ref('Kickstarter/users/' + chat.id)
                balancedata.get().then(result => {
                    //Создать в базе данных в ветке админа запрос на выплату. Он включает в себя
                    //1. Имя автора
                    //2. chat.id автора
                    //3. Дату создания запроса
                    //4. Текущий баланс
                    //5. Сумму вывода
                    //6. Комиссию сервиса: Х руб. (У%)
                    //7. Реквизиты вывода
    
                    let date = new Date()
                    let utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
                    let timeOfffset = 6 //Astana GMT +6
                    let time_now = new Date(utcTime + (3600000 * timeOfffset))
    
                    let updates = {}
                    let newrequest = {
                        name: chat.first_name,
                        id: chat.id,
                        date: time_now.getTime(),
                        bank: result.val().balance.bank,
                        withdraw_amount: result.val().balance.bank,
                        comission: result.val().balance.comission,
                        card: result.val().balance.card,
                        status: 'WAITING'
                    }
    
                    let newaction = {
                        description: 'Запрос на вывод ' + result.val().balance.bank + '  руб.',
                        date: time_now.getTime()
                    }
    
                    updates['Kickstarter/payments/withdraw_requests/' + time_now.getTime()] = newrequest
    
                    let pending_withdrawal = 0
                    if (result.val().balance.pending_withdrawal !== null && result.val().balance.pending_withdrawal !== undefined) pending_withdrawal = result.val().balance.pending_withdrawal
                    updates['Kickstarter/users/' + chat.id + '/balance/pending_withdrawal'] = pending_withdrawal + result.val().balance.bank
                    updates['Kickstarter/users/' + chat.id + '/balance/bank'] = 0
    
                    if (result.val().balance.history !== undefined) {
                        updates['Kickstarter/users/' + chat.id + '/balance/history/' + result.val().balance.history.length] = newaction
                    }
    
                    if (result.val().balance.history === undefined) {
                        updates['Kickstarter/users/' + chat.id + '/balance/history/0'] = newaction
                    }
    
                    //Формируем сообщение для меня с этими данными и отправляем
                    let txt_admin = '📤 Запрос на вывод от <b><a href="tg://user?id='+ chat.id +'">'+ chat.first_name +'</a></b>'
                    txt_admin += '\n\n<b>Дата:</b> ' + time_now.toString()
                    txt_admin += '\n<b>Баланс:</b> ' + result.val().balance.bank
                    txt_admin += '\n<b>Выводит:</b> ' + result.val().balance.bank
                    txt_admin += '\n<b>Карта:</b> ' + result.val().balance.card
                    txt_admin += '\n\n<b>Комиссия: ' + Math.floor(result.val().balance.bank / 100 * result.val().balance.comission) + ' рублей ('+ result.val().balance.comission +'%)</b>'
                
                    fb.database().ref().update(updates)
    
                    let generaldata = fb.database().ref('Kickstarter/')
                    generaldata.get().then(res => {
                        bot.sendMessage(res.val().payments.info.moderator_id, txt_admin, {
                            parse_mode: 'HTML',
                            reply_markup: {
                                inline_keyboard: [
                                    [{
                                        text: acceptwithdrawal[0],
                                        callback_data: acceptwithdrawal[1] + '_' + time_now.getTime()
                                    },
                                    {
                                        text: declinewithdrawal[0],
                                        callback_data: declinewithdrawal[1] + '_' + time_now.getTime()
                                    }]
                                ]
                            }
                        })
                        .then(resulting => {
                            if (messagetext_toedit[res.val().payments.info.moderator_id] === undefined) messagetext_toedit[res.val().payments.info.moderator_id] = []
                            if (message_toedit[res.val().payments.info.moderator_id] === undefined) message_toedit[res.val().payments.info.moderator_id] = []
                            messagetext_toedit[res.val().payments.info.moderator_id][3] = resulting.text
                            message_toedit[res.val().payments.info.moderator_id][3] = resulting.message_id
                        })
    
                        let txt = 'Запрос на вывод ' + result.val().balance.bank + ' руб. был отправлен. Обычно обработка платежа занимает до трех дней'
                        txt += '\n\n<i>Если Ваш платеж отклонили или статус платежа не меняется, свяжитесь с <a href="tg://user?id='+ res.val().payments.info.moderator_id +'">модератором</a></i>'
                        bot.deleteMessage(chat.id, message_toedit[chat.id][0]).catch(err => {console.log('here: ' + err)})
                        bot.sendMessage(chat.id, txt, {
                            parse_mode: 'HTML',
                            reply_markup: {
                                inline_keyboard: [
                                    [{
                                        text: 'Понятно',
                                        callback_data: backtostart[1]
                                    }]
                                ]
                            }
                        })
                    })
                    
                    //Отправляем сообщение автору, что запрос был подан и ответ будет в течение 3 дней
    
                })
            }
        }
        //ВЫВЕСТИ СВОЮ СУММУ
        if (query.data.includes(withdrawcustombutton[1])){
            if (query.data.split('_')[1] === '0'){
                let balancedata = fb.database().ref('Kickstarter/users/' + chat.id + '/balance')
                balancedata.get().then(result => {
                    let kb = []
                    let procents = [Math.floor(result.val().bank  * 0.25), Math.floor(result.val().bank  * 0.5), Math.floor(result.val().bank  * 0.75), Math.floor(result.val().bank)]
                    let txt = '<b>Укажите, какую сумму вы хотите снять?</b>\nКомиссия при снятии составляет ' + query.data.split('_')[2] + '%'
                    
                    kb[0] = [{
                        text: backtostart[0],
                        callback_data: withdrawbutton[1]
                    }]
                    if (Math.floor(result.val().bank  * 0.25) >= result.val().withdroval_limit){
                        kb.push([{
                            text: procents[0] + 'руб. (25%)',
                            callback_data: withdrawcustombutton[1] + '_1_' + procents[0]
                        }])
                    }
                    if (Math.floor(result.val().bank  * 0.5) >= result.val().withdroval_limit){
                        kb.push([{
                            text: procents[1] + 'руб. (50%)',
                            callback_data: withdrawcustombutton[1] + '_1_' + procents[1]
                        }])
                    }
                    if (Math.floor(result.val().bank  * 0.75) >= result.val().withdroval_limit){
                        kb.push([{
                            text: procents[2] + 'руб. (75%)',
                            callback_data: withdrawcustombutton[1] + '_1_' + procents[2]
                        }])
                    }
                    kb.push([{
                        text: procents[3] + 'руб. (100%)',
                        callback_data: withdrawcustombutton[1] + '_1_' + procents[3]
                    }])
    
                    bot.editMessageText(txt, {
                        chat_id: chat.id,
                        message_id: message_toedit[chat.id][0],
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: kb
                        }
                    })
                })
            }
            if (query.data.split('_')[1] === '1'){
                let balancedata = fb.database().ref('Kickstarter/users/' + chat.id)
                balancedata.get().then(result => {
                    //Создать в базе данных в ветке админа запрос на выплату. Он включает в себя
                    //1. Имя автора
                    //2. chat.id автора
                    //3. Дату создания запроса
                    //4. Текущий баланс
                    //5. Сумму вывода
                    //6. Комиссию сервиса: Х руб. (У%)
                    //7. Реквизиты вывода
    
                    console.log(parseInt(query.data.split('_')[2]))
    
                    let date = new Date()
                    let utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
                    let timeOfffset = 6 //Astana GMT +6
                    let time_now = new Date(utcTime + (3600000 * timeOfffset))
    
                    let updates = {}
                    let newrequest = {
                        name: chat.first_name,
                        id: chat.id,
                        date: time_now.getTime(),
                        bank: result.val().balance.bank,
                        withdraw_amount: parseInt(query.data.split('_')[2]),
                        comission: result.val().balance.comission,
                        card: result.val().balance.card,
                        status: 'WAITING'
                    }
    
                    let newaction = {
                        description: 'Запрос на вывод ' + parseInt(query.data.split('_')[2]) + '  руб.',
                        date: time_now.getTime()
                    }
    
                    updates['Kickstarter/payments/withdraw_requests/' + time_now.getTime()] = newrequest
    
                    let pending_withdrawal = 0
                    if (result.val().balance.pending_withdrawal !== null && result.val().balance.pending_withdrawal !== undefined) pending_withdrawal = result.val().balance.pending_withdrawal
                    updates['Kickstarter/users/' + chat.id + '/balance/pending_withdrawal'] = pending_withdrawal + parseInt(query.data.split('_')[2])
                    updates['Kickstarter/users/' + chat.id + '/balance/bank'] = result.val().balance.bank - parseInt(query.data.split('_')[2])
    
                    if (result.val().balance.history !== undefined) {
                        updates['Kickstarter/users/' + chat.id + '/balance/history/' + result.val().balance.history.length] = newaction
                    }
    
                    if (result.val().balance.history === undefined) {
                        updates['Kickstarter/users/' + chat.id + '/balance/history/0'] = newaction
                    }
    
                    //Формируем сообщение для меня с этими данными и отправляем
                    let txt_admin = '📤 Запрос на вывод от <b><a href="tg://user?id='+ chat.id +'">'+ chat.first_name +'</a></b>'
                    txt_admin += '\n\n<b>Дата:</b> ' + time_now.toString()
                    txt_admin += '\n<b>Баланс:</b> ' + result.val().balance.bank
                    txt_admin += '\n<b>Выводит:</b> ' + parseInt(query.data.split('_')[2])
                    txt_admin += '\n<b>Карта:</b> ' + result.val().balance.card
                    txt_admin += '\n\n<b>Комиссия: ' + Math.floor(parseInt(query.data.split('_')[2]) / 100 * result.val().balance.comission) + ' рублей ('+ result.val().balance.comission +'%)</b>'
                
                    fb.database().ref().update(updates)
    
                    let generaldata = fb.database().ref('Kickstarter/')
                    generaldata.get().then(res => {
                        bot.sendMessage(res.val().payments.info.moderator_id, txt_admin, {
                            parse_mode: 'HTML',
                            reply_markup: {
                                inline_keyboard: [
                                    [{
                                        text: acceptwithdrawal[0],
                                        callback_data: acceptwithdrawal[1] + '_' + time_now.getTime()
                                    },
                                    {
                                        text: declinewithdrawal[0],
                                        callback_data: declinewithdrawal[1] + '_' + time_now.getTime()
                                    }]
                                ]
                            }
                        })
                        .then(resulting => {
                            if (messagetext_toedit[res.val().payments.info.moderator_id] === undefined) messagetext_toedit[res.val().payments.info.moderator_id] = []
                            if (message_toedit[res.val().payments.info.moderator_id] === undefined) message_toedit[res.val().payments.info.moderator_id] = []
                            messagetext_toedit[res.val().payments.info.moderator_id][3] = resulting.text
                            message_toedit[res.val().payments.info.moderator_id][3] = resulting.message_id
                        })
    
                        let txt = 'Запрос на вывод ' + parseInt(query.data.split('_')[2]) + ' руб. был отправлен. Обычно обработка платежа занимает до трех дней'
                        txt += '\n\n<i>Если Ваш платеж отклонили или статус платежа не меняется, свяжитесь с <a href="tg://user?id='+ res.val().payments.info.moderator_id +'">модератором</a></i>'
                        bot.deleteMessage(chat.id, message_toedit[chat.id][0]).catch(err => {console.log('here: ' + err)})
                        bot.sendMessage(chat.id, txt, {
                            parse_mode: 'HTML',
                            reply_markup: {
                                inline_keyboard: [
                                    [{
                                        text: 'Понятно',
                                        callback_data: backtostart[1]
                                    }]
                                ]
                            }
                        })
                    })
                    
                    //Отправляем сообщение автору, что запрос был подан и ответ будет в течение 3 дней
    
                })
            }
        }
        //ПРИНЯТЬ И ОТПРАВИТЬ ДЕНЬГИ ВЫВОД
        if (query.data.includes(acceptwithdrawal[1])){
            let generaldata = fb.database().ref('Kickstarter/')
            generaldata.get().then(res => {
                let withdrawdata = fb.database().ref('Kickstarter/payments/withdraw_requests/' + query.data.split('_')[1])
                withdrawdata.get().then(result => {
                    if (chat.id === res.val().payments.info.moderator_id){
                        let comission_amount = result.val().withdraw_amount / 100 * result.val().comission
                        let withdraw_amount = result.val().withdraw_amount - comission_amount
                        let comment = 'Вывод средств с бота. Код: ' + query.data.split('_')[1]
                        let comment_admin = 'Вывод комиссии с бота. Код: ' + query.data.split('_')[1]
                        let updates = {}
    
                        let txt = ''
                        sendPayment(result.val().card.split(':')[0], result.val().card.split(':')[1], withdraw_amount, comment).then(answ => {
                            txt += '✅ Деньги перечислены'
                            console.log(answ)
    
                            sendPayment('yoomoney', res.val().payments.info.yoomoney, comission_amount, comment_admin).then(() => {
                                txt += '\n✅ Комиссия переведена'
                                updates['Kickstarter/payments/withdraw_requests/' + query.data.split('_')[1] + '/status'] = 'SUCCESS'
                                if (messagetext_toedit[res.val().payments.info.moderator_id] === undefined) messagetext_toedit[res.val().payments.info.moderator_id] = []
                                if (message_toedit[res.val().payments.info.moderator_id] === undefined) message_toedit[res.val().payments.info.moderator_id] = []
    
                                bot.editMessageText(txt + '\n\n' + messagetext_toedit[res.val().payments.info.moderator_id][3], {
                                    chat_id: res.val().payments.info.moderator_id,
                                    message_id: message_toedit[res.val().payments.info.moderator_id][3],
                                    parse_mode: 'HTML',
                                })
        
                                let authordata = fb.database().ref('Kickstarter/users/' + result.val().id)
                                authordata.get().then(reply => {
        
                                    let date = new Date()
                                    let utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
                                    let timeOfffset = 6 //Astana GMT +6
                                    let time_now = new Date(utcTime + (3600000 * timeOfffset))
        
                                    let created_date = new Date(result.val().date)
                                    let createddate = created_date.getDate() + '.' + (created_date.getMonth() + 1)
        
                                    updates['Kickstarter/users/' + result.val().id + '/balance/pending_withdrawal'] = reply.val().balance.pending_withdrawal - result.val().withdraw_amount
                                    updates['Kickstarter/users/' + result.val().id + '/balance/withdrew'] = reply.val().balance.withdrew + result.val().withdraw_amount
                                    
                                    let newaction = {
                                        description: 'Запрос на вывод от ' + createddate + '. Результат: УСПЕШНО ('+result.val().withdraw_amount+' руб. выведено)',
                                        date: time_now.getTime()
                                    }
                                    if (reply.val().balance.history !== undefined) {
                                        updates['Kickstarter/users/' + result.val().id + '/balance/history/' + reply.val().balance.history.length] = newaction
                                    }
                    
                                    if (reply.val().balance.history === undefined) {
                                        updates['Kickstarter/users/' + result.val().id + '/balance/history/0'] = newaction
                                    }
        
                                    fb.database().ref().update(updates)
        
                                    let success_txt = '✅ Ваш запрос на вывод ' + result.val().withdraw_amount + ' руб. от ' + createddate + ' был одобрен. Деньги были отправлены на Ваш счет (' + result.val().card.split(':')[1] + ')'
    
                                    bot.sendMessage(result.val().id, success_txt, {
                                        parse_mode: 'HTML'
                                    })
                                    .then(msgansw => {
                                        message_toedit[result.val().id][1] = msgansw.message_id
                                    })
                                    
                                })
                            })
                            .catch(err => {
                                console.log(err)
                                txt += '\n❌ Комиссия не была переведена. Ошибка: ' + err
                                updates['Kickstarter/payments/withdraw_requests/' + query.data.split('_')[1] + '/status'] = 'SUCCESS_HALF'
                            
                                if (messagetext_toedit[res.val().payments.info.moderator_id] === undefined) messagetext_toedit[res.val().payments.info.moderator_id] = []
                                if (message_toedit[res.val().payments.info.moderator_id] === undefined) message_toedit[res.val().payments.info.moderator_id] = []
    
                                bot.editMessageText(txt + '\n\n' + messagetext_toedit[res.val().payments.info.moderator_id][3], {
                                    chat_id: res.val().payments.info.moderator_id,
                                    message_id: message_toedit[res.val().payments.info.moderator_id][3],
                                    parse_mode: 'HTML',
                                })
        
                                let authordata = fb.database().ref('Kickstarter/users/' + result.val().id)
                                authordata.get().then(reply => {
        
                                    let date = new Date()
                                    let utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
                                    let timeOfffset = 6 //Astana GMT +6
                                    let time_now = new Date(utcTime + (3600000 * timeOfffset))
        
                                    let created_date = new Date(result.val().date)
                                    let createddate = created_date.getDate() + '.' + (created_date.getMonth() + 1)
        
                                    updates['Kickstarter/users/' + result.val().id + '/balance/pending_withdrawal'] = reply.val().balance.pending_withdrawal - result.val().withdraw_amount
                                    updates['Kickstarter/users/' + result.val().id + '/balance/withdrew'] = reply.val().balance.withdrew + result.val().withdraw_amount
                                    
                                    let newaction = {
                                        description: 'Запрос на вывод от ' + createddate + '. Результат: УСПЕШНО ('+result.val().withdraw_amount+' руб. выведено)',
                                        date: time_now.getTime()
                                    }
                                    if (reply.val().balance.history !== undefined) {
                                        updates['Kickstarter/users/' + result.val().id + '/balance/history/' + reply.val().balance.history.length] = newaction
                                    }
                    
                                    if (reply.val().balance.history === undefined) {
                                        updates['Kickstarter/users/' + result.val().id + '/balance/history/0'] = newaction
                                    }
        
                                    fb.database().ref().update(updates)
        
                                    let success_txt = '✅ Ваш запрос на вывод ' + result.val().withdraw_amount + ' руб. от ' + createddate + ' был одобрен. Деньги были отправлены на Ваш счет (' + result.val().card.split(':')[1] + ')'
    
                                    bot.sendMessage(result.val().id, success_txt, {
                                        parse_mode: 'HTML'
                                    })
                                    .then(msgansw => {
                                        message_toedit[result.val().id][1] = msgansw.message_id
                                    })
                                    
                                })
                            })
                        })
                        .catch(error => {
                            console.log(error)
                            txt += '❌ Деньги и комиссия не были зачислены. Ошибка: ' + error
    
                            if (messagetext_toedit[res.val().payments.info.moderator_id] === undefined) messagetext_toedit[res.val().payments.info.moderator_id] = []
                            if (message_toedit[res.val().payments.info.moderator_id] === undefined) message_toedit[res.val().payments.info.moderator_id] = []
    
                            bot.editMessageText(txt + '\n\n' + messagetext_toedit[res.val().payments.info.moderator_id][3], {
                                chat_id: res.val().payments.info.moderator_id,
                                message_id: message_toedit[res.val().payments.info.moderator_id][3],
                                parse_mode: 'HTML',
                            })
    
                            updates['Kickstarter/payments/withdraw_requests/' + query.data.split('_')[1] + '/status'] = 'ERROR'
                            let authordata = fb.database().ref('Kickstarter/users/' + result.val().id)
                            authordata.get().then(reply => {
    
                                let date = new Date()
                                let utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
                                let timeOfffset = 6 //Astana GMT +6
                                let time_now = new Date(utcTime + (3600000 * timeOfffset))
    
                                let created_date = new Date(result.val().date)
                                let createddate = created_date.getDate() + '.' + (created_date.getMonth() + 1)
    
                                updates['Kickstarter/users/' + result.val().id + '/balance/pending_withdrawal'] = reply.val().balance.pending_withdrawal - result.val().withdraw_amount
                                updates['Kickstarter/users/' + result.val().id + '/balance/bank'] = reply.val().balance.bank + result.val().withdraw_amount
                                
                                let newaction = {
                                    description: 'Запрос на вывод от ' + createddate + '. Результат: ОТКЛОНЕНО (деньги возвращены на счет баланса)',
                                    date: time_now.getTime()
                                }
                                if (reply.val().balance.history !== undefined) {
                                    updates['Kickstarter/users/' + result.val().id + '/balance/history/' + reply.val().balance.history.length] = newaction
                                }
                
                                if (reply.val().balance.history === undefined) {
                                    updates['Kickstarter/users/' + result.val().id + '/balance/history/0'] = newaction
                                }
    
                                fb.database().ref().update(updates)
    
                                let error_txt = 'К сожалению, наш сервис столкнулся с ошибкой и мы были вынуждены отклонить Ваш запрос на вывод ' + result.val().withdraw_amount + ' руб. от ' + createddate
                                error_txt = '\nДеньги были возвращены на счет Вашего баланса'
                                error_txt = '\n❗️ Возможно Вы ввели некорректные данные для вывода. Попробуйте изменить номер счета для вывода'
                                error_txt += '\n\n Если ситуация не решится, свяжитесь с <a href="tg://user?id='+ res.val().payments.info.moderator_id +'">модератором</a>'
                                
                                bot.sendMessage(result.val().id, error_txt, {
                                    parse_mode: 'HTML',
                                    reply_markup: {
                                        inline_keyboard: [
                                            [{
                                                text: 'Служба поддержки',
                                                url: 'tg://user?id=' + res.val().payments.info.moderator_id
                                            }]
                                        ]
                                    }
                                })
                                .then(msgansw => {
                                    message_toedit[result.val().id][1] = msgansw.message_id
                                })
                                
                            })
                            
                        })
                    }
                })
            })
        }
        if (query.data.includes(declinewithdrawal[1])){
    
            let generaldata = fb.database().ref('Kickstarter/')
            generaldata.get().then(res => {
                let withdrawdata = fb.database().ref('Kickstarter/payments/withdraw_requests/' + query.data.split('_')[1])
                withdrawdata.get().then(result => {
                    let txt = '❌ Вы отклонили перевод'
            
                    bot.editMessageText(txt + '\n\n' + messagetext_toedit[res.val().payments.info.moderator_id][3], {
                        chat_id: res.val().payments.info.moderator_id,
                        message_id: message_toedit[res.val().payments.info.moderator_id][3],
                        parse_mode: 'HTML',
                    })
                    let updates = {}
                    updates['Kickstarter/payments/withdraw_requests/' + query.data.split('_')[1] + '/status'] = 'ERROR'
                    let authordata = fb.database().ref('Kickstarter/users/' + result.val().id)
                    authordata.get().then(reply => {
            
                        let date = new Date()
                        let utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
                        let timeOfffset = 6 //Astana GMT +6
                        let time_now = new Date(utcTime + (3600000 * timeOfffset))
            
                        let created_date = new Date(result.val().date)
                        let createddate = created_date.getDate() + '.' + (created_date.getMonth() + 1)
            
                        updates['Kickstarter/users/' + result.val().id + '/balance/pending_withdrawal'] = reply.val().balance.pending_withdrawal - result.val().withdraw_amount
                        updates['Kickstarter/users/' + result.val().id + '/balance/bank'] = reply.val().balance.bank + result.val().withdraw_amount
                        
                        let newaction = {
                            description: 'Запрос на вывод от ' + createddate + '. Результат: ОТКЛОНЕНО (деньги возвращены на счет баланса)',
                            date: time_now.getTime()
                        }
                        if (reply.val().balance.history !== undefined) {
                            updates['Kickstarter/users/' + result.val().id + '/balance/history/' + reply.val().balance.history.length] = newaction
                        }
            
                        if (reply.val().balance.history === undefined) {
                            updates['Kickstarter/users/' + result.val().id + '/balance/history/0'] = newaction
                        }
            
                        fb.database().ref().update(updates)
            
                        let error_txt = 'К сожалению, Ваш запрос на вывод ' + result.val().withdraw_amount + ' руб. от ' + createddate + ' не прошел модерацию и мы были вынуждены его <b>отклонить</b>'
                        error_txt = '\nДеньги были возвращены на счет Вашего баланса'
                        error_txt = '\n❗️ Возможно Вы ввели некорректные данные для вывода. Попробуйте изменить номер счета для вывода'
                        error_txt += '\n\n Если ситуация не решится, свяжитесь с <a href="tg://user?id='+ res.val().payments.info.moderator_id +'">модератором</a>'
                                
                        bot.sendMessage(result.val().id, error_txt, {
                            parse_mode: 'HTML',
                            reply_markup: {
                                inline_keyboard: [
                                    [{
                                        text: 'Служба поддержки',
                                        url: 'tg://user?id=' + res.val().payments.info.moderator_id
                                    }]
                                ]
                            }
                        })
                        .then(msgansw => {
                            message_toedit[result.val().id][1] = msgansw.message_id
                        })
                        
                    })
                })
            })
        }
    
        //ПРИНЯТЬ УЧАСТИЕ В СБОРЕ
        if (query.data.includes(participatebutton[1])){
            let userdata = fb.database().ref('Kickstarter/users/' + chat.id)
            userdata.get().then(result => {
                if (result.val().balance.bank >= parseInt(query.data.split('_')[1])){
                    //деньги есть
                    let txt = 'Введите сумму, которую хотите внести в сбор, либо внесите минимальную сумму для участия: <b>' + query.data.split('_')[1] + ' руб </b>(нажмите на кнопку снизу)'
                    txt += '\n\nВы можете внести сумму больше минимальной (до '+ result.val().balance.bank +' руб), чтобы ускорить сбор или просто порадовать автора сбора 🥰'
                    participating_data[chat.id] = []
                    participating_data[chat.id][0] = true
                    participating_data[chat.id][1] = parseInt(query.data.split('_')[1])
                    participating_data[chat.id][2] = result.val().balance.bank
    
                    bot.editMessageText(txt, {
                        parse_mode: 'HTML',
                        chat_id: chat.id,
                        message_id: message_toedit[chat.id][0],
                        reply_markup: {
                            inline_keyboard: [
                                [{
                                    text: backtostart[0],
                                    callback_data: opendonationparticipant
                                }],
                                [{
                                    text: query.data.split('_')[1] + ' руб. (мин.)',
                                    callback_data: 'participate_' + query.data.split('_')[1]
                                }]
                            ]
                        }
                    })
                    .catch(err => {
                        console.log('here: ' + err)
                        bot.editMessageCaption(txt, {
                            parse_mode: 'HTML',
                            chat_id: chat.id,
                            message_id: message_toedit[chat.id][0],
                            reply_markup: {
                                inline_keyboard: [
                                    [{
                                        text: backtostart[0],
                                        callback_data: opendonationparticipant
                                    }],
                                    [{
                                        text: query.data.split('_')[1] + ' руб. (мин)',
                                        callback_data: 'participate_' + query.data.split('_')[1]
                                    }]
                                ]
                            }
                        })
                    })
                }
    
                else {
                    let txt = 'К сожалению, у вас недостаточно средств для участия в сборе.\nВам нужно еще <b>' + (parseInt(query.data.split('_')[1]) - result.val().balance.bank) + ' руб.</b>'
                    bot.deleteMessage(chat.id, message_toedit[chat.id][1]).catch(err => {console.log('here: ' + err)})
                    bot.sendMessage(chat.id, txt, {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: [
                                [{
                                    text: addmoneyparticipant[0],
                                    callback_data: addmoneyparticipant[1]
                                }]
                            ]
                        }
                    }).then(res => {
                        if (messagetext_toedit[chat.id] === undefined) messagetext_toedit[chat.id] = []
                        if (message_toedit[chat.id] === undefined) message_toedit[chat.id] = []
                        messagetext_toedit[chat.id][1] = res.text
                        message_toedit[chat.id][1] = res.message_id
                    })
                }
            })
        }
    
        //ПРИНЯТЬ УЧАСТИЕ С МИНИМАЛЬНОЙ СУММОЙ
        if (query.data.includes('participate_')){
            ParticipateDonation(chat, query.data.split('_')[1])
        }
    
        //СПИСОК СБОРОВ
        if (query.data === myparticipantslist[1]){
            MyParticipateDonationsList(chat)
        }
    }

    if (message_toedit[chat.id] === undefined){
        Start(query.message)
    }
})

bot.on('channel_post', post => {
    console.log(post)
})

bot.onText(/\/balance/, msg =>
{
    const { chat, message_id, text } = msg
    myBalance(chat)
})

bot.onText(/\/faq/, msg =>
{
    const { chat, message_id, text } = msg
    if (!current_mode[chat.id].includes('evaluating')){
        let txt = 'Вот несколько часто задаваемых вопросов: \n\n' + faqquestions[0] + faqquestions[1] + faqquestions[2]
        bot.deleteMessage(chat.id, message_id)
        bot.deleteMessage(chat.id, message_toedit[chat.id][2]).catch(err => {console.log('here: ' + err)})
        bot.sendMessage(chat.id, txt, {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: backtoblank[0],
                        callback_data: openmenubutton[1]
                    }]
                ]
            }
        })
        .then(res=> {
            message_toedit[chat.id][2] = res.message_id
        })
    }
    
    
})

//Нужно для быстрого получения chatid пользователя. Достаточно ввести команду "/Admin_controller:GetChatInfo" и бот пришлет его в ответ.
bot.onText(/\/Admin_controller:GetChatInfo/, msg =>
    {
        //console.log(msg)
        const chatId = msg.chat.id
        bot.sendMessage(chatId, chatId)
    
})

bot.onText(/\/Admin_controller:CheckDonationsRenew/, msg =>
{
    //console.log(msg)
    const chatId = msg.chat.id
    CheckDeadlinesList(true)
})

bot.onText(/\/Admin_controller:CheckDonations/, msg =>
{
    //console.log(msg)
    const chatId = msg.chat.id
    CheckDeadlinesList(false)
})

function CreateDonation(chat){
    donateregisterstep[chat.id] = 0
    donate_sendduration[chat.id] = 3

    bot.deleteMessage(chat.id, message_toedit[chat.id][0]).catch(err => {console.log('here: ' + err)})

    let date = new Date()
    let utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
    let timeOfffset = 6 //Astana GMT +6
    let finaldate = new Date(utcTime + (3600000 * timeOfffset))

    donate_duration_secs[chat.id] = finaldate.getTime() + (donate_duration[chat.id] * 86400 * 1000)
    donate_sendduration_secs[chat.id] = donate_duration_secs[chat.id] + (donate_sendduration[chat.id] * 86400 * 1000)

    let created_date = new Date(donate_duration_secs[chat.id])
    let createddate = created_date.getDate() + '.' + (created_date.getMonth() + 1)
    console.log(createddate)

    let txt = '<b><a href="tg://user?id='+ chat.id +'">'+ chat.first_name +'</a></b> собирает на: <b>' +  donate_name[chat.id] + '</b>\n\n├ Собрано сейчас: <b>0%</b>\n├ Минимальная сумма участия: <b>' + donate_minmoney[chat.id] + ' руб.</b>\n└ Сбор закончится: <b>' + createddate + '</b>'
    
    bot.getMe().then(res => {
        /* if (donate_private[chat.id] === false) txt += '\nТип сбора: <b>открытый</b>'
        if (donate_private[chat.id] === true) txt += '\nТип сбора: <b>закрытый</b>' */
        txt += '\n\nСсылка-приглашение (НЕ НАЖИМАЙТЕ!): https://t.me/'+ res.username +'?start=_part_' + chat.id + '_' + donate_duration_secs[chat.id]
        txt += '\n\nЕсли все указано верно, нажмите на кнопку <b>' + createdonation[0] + '</b>'
    
        bot.sendPhoto(chat.id, donate_photo[chat.id], {
            caption: txt,
            parse_mode: 'HTML',
            disable_web_page_preview: true,
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: backtostart[0],
                        callback_data: backtonewdonate[4]
                    }],
                    [{
                        text: createdonation[0],
                        callback_data: createdonation[1]
                    }]
                ]
            }
        })
        .then(res => {
            message_toedit[chat.id][0] = res.message_id
        })
        .catch(err => {
            console.log('here: ' + err)
            bot.sendMessage(chat.id, txt, {
                parse_mode: 'HTML',
                disable_web_page_preview: true,
                reply_markup: {
                    inline_keyboard: [
                        [{
                            text: backtostart[0],
                            callback_data: backtonewdonate[4]
                        }],
                        [{
                            text: createdonation[0],
                            callback_data: createdonation[1]
                        }]
                    ]
                }
            })
            .then(res => {
                message_toedit[chat.id][0] = res.message_id
                console.log('here:')
            })
            .catch(err => {console.log('here: ' + err)})
        })
    }).catch(err => {console.log('here: ' + err)})
}

function ParticipateDonation(chat, text){
    let updates = {}
    let userdata = fb.database().ref('Kickstarter/users/' + chat.id)
    userdata.get().then(result => {
        if (result.val().participants !== null && result.val().participants !== undefined && result.val().participants !== ''){
            updates['Kickstarter/users/' + chat.id + '/participants'] = result.val().participants + ',' + user_donationlink[chat.id].split('/donations/')[0] + '.' + user_donationlink[chat.id].split('/donations/')[1]
        }
        else {
            updates['Kickstarter/users/' + chat.id + '/participants'] = user_donationlink[chat.id].split('/donations/')[0] + '.' + user_donationlink[chat.id].split('/donations/')[1]
        }
        let donationdata = fb.database().ref('Kickstarter/users/' + user_donationlink[chat.id])
        donationdata.get().then(reply => {
            let date = new Date()
            let utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
            let timeOfffset = 6 //Astana GMT +6
            let finaldate = new Date(utcTime + (3600000 * timeOfffset))

            let newparticipant = {
                id: chat.id,
                date: finaldate.getTime(),
                amount: parseInt(text),
                name: chat.first_name
            }
            if (reply.val().participants === undefined || reply.val().participants === undefined){
                updates['Kickstarter/users/' + user_donationlink[chat.id] + '/participants/0'] = newparticipant
            }
            if (reply.val().participants !== undefined && reply.val().participants !== undefined){
                updates['Kickstarter/users/' + user_donationlink[chat.id] + '/participants/' + reply.val().participants.length] = newparticipant
            }
            updates['Kickstarter/users/' + user_donationlink[chat.id] + '/bank'] = reply.val().bank += parseInt(text)
            updates['Kickstarter/users/' + chat.id + '/balance/bank'] = result.val().balance.bank -= parseInt(text)
            
            let newhistory = {
                date: finaldate.getTime(), 
                description: 'Участие в сборе ' + user_donationlink[chat.id].split('/donations/')[0] + '.' + user_donationlink[chat.id].split('/donations/')[1] + ' за ' + parseInt(text) + ' руб.'
            }
            if (result.val().balance.history === undefined || result.val().balance.history === undefined){
                updates['Kickstarter/users/' + chat.id + '/balance/history/0'] = newhistory
            }
            if (result.val().balance.history !== undefined && result.val().balance.history !== undefined){
                updates['Kickstarter/users/' + chat.id + '/balance/history/' + result.val().balance.history.length] = newhistory
            }

            fb.database().ref().update(updates).then(() => {
                participating_data[chat.id] = []
                OpenDonationParticipant(chat, null)
            })
            
        })
        
    })
}

function WithDrawInfo(chat){
    let balancedata = fb.database().ref('Kickstarter/users/' + chat.id)
    balancedata.get().then(result => {
        let txt = ''
        let kb = []
        kb[0] = [{
            text: backtostart[0],
            callback_data: mybalancebutton[1]
        }]

        kb[1] = [{
            text: cardinfobutton[0],
            callback_data: cardinfobutton[1] + '_0'
        }]

        if (result.val().balance.bank > 0) {
            if (result.val().balance.bank > result.val().balance.withdroval_limit){
                txt += '<b>💵 Средства, доступные для вывода:</b> ' + result.val().balance.bank + ' рублей'
                txt += '\n\nВы можете вывести все средства разом, а можете запросить конкретную сумму.\n\n<b>Минимальная сумма для вывода:</b> '+result.val().balance.withdroval_limit+' рублей'
                
                if (result.val().balance.card !== undefined && result.val().balance.card !== '' && (result.val().balance.card).includes(':')){
                    kb[2] = 
                    [{
                        text: withdrawallbutton[0],
                        callback_data: withdrawallbutton[1] + '_0_' + result.val().balance.comission
                    },
                    {
                        text: withdrawcustombutton[0],
                        callback_data: withdrawcustombutton[1] + '_0_' + result.val().balance.comission
                    }]
                }
            }
            else {
                txt += '<b>💵 Ваш баланс:</b> ' + result.val().balance.bank + ' рублей\n\nДля того, чтобы запросить вывод, необходимо иметь на балансе хотябы '+result.val().balance.withdroval_limit+' рублей'
            }
        }

        if (result.val().balance.bank <= 0) {
            txt += '<b>💵 Ваш баланс:</b> ' + result.val().balance.bank + ' рублей\n\nДля того, чтобы запросить вывод, необходимо иметь на балансе хотябы '+result.val().balance.withdroval_limit+' рублей'
        }

        if (result.val().balance.card === undefined || result.val().balance.card === ''){
            txt += '\n\n‼️ Для того, чтобы совершить вывод, необходимо указать свои реквизиты. Для этого нажмите на кнопку <b>' + cardinfobutton[0] + '</b>'
        }

        if (result.val().balance.card !== undefined && result.val().balance.card !== '' && (result.val().balance.card).includes(':')){
            if (result.val().balance.card.includes('qiwi')){
                txt += '\n\n🥝 <b>Привязанный номер Qiwi:</b> ' + result.val().balance.card.split(':')[1]
            }
            if (result.val().balance.card.includes('yoomoney')){
                txt += '\n\n<b>Привязанный счет ЮMoney:</b> ' + result.val().balance.card.split(':')[1]
            }
        }

        bot.editMessageText(txt, {
            chat_id: chat.id,
            message_id: message_toedit[chat.id][0],
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: kb
            }
        })
    })
}

function myBalance(chat){

    bot.deleteMessage(chat.id, message_toedit[chat.id][1]).catch(err => {console.log('here: ' + err)})
    bot.deleteMessage(chat.id, message_toedit[chat.id][0]).catch(err => {console.log('here: ' + err)})
    let balancedata = fb.database().ref('Kickstarter/users/' + chat.id)
    balancedata.get().then(result => {
        let txt = '💰 Ваш баланс: <b>' + result.val().balance.bank + ' руб.</b>'
        let kb = []
        kb[0] = 
        [{
            text: addmoneybutton[0],
            callback_data: addmoneybutton[1]
        },
        {
            text: balancehistory[0],
            callback_data: balancehistory[1]
        }]

        console.log(result.val().donations)
        if (result.val().donations !== undefined){

            let donatetitles = Object.keys(result.val().donations)
            
            let donationbank_overall = 0 
            for (let i = 0; i < donatetitles.length; i++){
                let donatebankdata = fb.database().ref('Kickstarter/users/' + chat.id + '/donations/' + donatetitles[i])
                donatebankdata.get().then(res => {

                    if (res.val().status === 'online' || res.val().status === 'waiting'){
                        donationbank_overall += res.val().bank
                    }

                    if (i === donatetitles.length - 1){
                        if (result.val().balance.pending_withdrawal !== undefined && result.val().balance.pending_withdrawal !== null && result.val().pending_withdrawal !== 0){
                            txt += '\n├ В процессе вывода: <b>' + result.val().balance.pending_withdrawal + ' руб.</b>'
                        }
                        if (donationbank_overall > 0){
                            txt += '\n├ В заморозке (активные сборы): <b>' + donationbank_overall + ' руб.</b>'
                        }
                        
                        txt += '\n├ Заработано за все время: <b>' + result.val().balance.overall + ' руб.</b>'
                        txt += '\n└ Выведено за все время: <b>' + result.val().balance.withdrew + ' руб.</b>'
                        
                        kb[1] = [{
                            text: withdrawbutton[0],
                            callback_data: withdrawbutton[1]
                        }]

                        kb.push([{
                            text: backtostart[0],
                            callback_data: backtostart[1]
                        }])

                        bot.sendMessage(chat.id, txt, {
                            parse_mode: 'HTML',
                            reply_markup: {
                                inline_keyboard: kb
                            }
                        })
                        .then(answer => {
                            message_toedit[chat.id][0] = answer.message_id
                        })
                
                        if (messagetext_toedit[chat.id] === undefined) messagetext_toedit[chat.id] = []
                        messagetext_toedit[chat.id][0] = txt
                    }
                })
            }
        }

        if (result.val().donations === undefined){
            kb.push([{
                text: backtostart[0],
                callback_data: backtostart[1]
            }])
    
            bot.sendMessage(chat.id, txt, {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: kb
                }
            })
            .then(answer => {
                message_toedit[chat.id][0] = answer.message_id
            })
    
            if (messagetext_toedit[chat.id] === undefined) messagetext_toedit[chat.id] = []
            messagetext_toedit[chat.id][0] = txt
        }
    })
}

function AddMoney(chat, isparticipant){
    let txt = ''

    let addmoneykeyboard = [[],[]]
    if (!isparticipant){
        txt += messagetext_toedit[chat.id][0] + '\n\nДля пополнения баланса, выберите сумму с помощью кнопок ниже:' 
        addmoneykeyboard[1] = [{
            text: backtoblank[0],
            callback_data: mybalancebutton[1]
        }]
    }
    if (isparticipant){
        txt += 'Для пополнения баланса, выберите сумму с помощью кнопок ниже:' 
        addmoneykeyboard[1] = [{
            text: backtoblank[0],
            callback_data: checkchannelfollow[1] + '_1'
        }]
    }
    let addmoney_data = fb.database().ref('Kickstarter/payments/addmoney/')
    addmoney_data.get().then(result => {
        addmoneykeyboard[0] = []
        for (let i = 0; i < result.val().length; i++){
            addmoney[i] = result.val()[i]
            addmoneykeyboard[0].push(
                {
                    text: addmoney[i] + ' руб.',
                    callback_data: addmoneyamount + addmoney[i]
                }
            )
            if (i === result.val().length - 1){
                bot.deleteMessage(chat.id, message_toedit[chat.id][1]).catch(err => {console.log('here: ' + err)})
                bot.editMessageText(txt, {
                    chat_id: chat.id,
                    message_id: message_toedit[chat.id][0],
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: addmoneykeyboard
                    }
                })
                .then(res => {
                    message_toedit[chat.id][0] = res.message_id
                })
            }
        }
    })
}

function CheckNewMails(chatid){
    let newmails = fb.database().ref('Grindr/users/' + chatid + '/dialogs/')
    newmails.on('value', (result) => {
        if (result.val() !== null){
            console.log(result.val())
            if (current_mode[chatid].split('_')[0] === 'dialog'  && current_mode[chatid].split('_')[1] === result.val()[result.val().length - 1]){
                bot.sendMessage(chatid, result.val()[result.val().length - 1].lastmessage)
            }
            else {
                bot.sendMessage(chatid, 'Вы получили сообщение от <b>' + result.val()[result.val().length - 1] + '</b>' + result.val().lastmessage + 'Желаете ответить?', {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [{
                                text: answermessage[0],
                                callback_data: answermessage[1] + result.val()[result.val().length - 1]
                            },
                            {
                                text: 'Нет',
                                callback_data: 'deletemessage'
                            }]
                        ]
                    }
                })
                .then(res => {
                    message_todelete[chatid][1] = res.message_id
                })
            }
        }
    }
    ).catch(err => {console.log(err)})
}

function OpenDonation(chat, link){
    let donationdata = fb.database().ref('Kickstarter/users/' + chat.id + '/donations/' + link)
    donationdata.get().then(result => {

        let endday = new Date(result.val().duration)
        let end_day = endday.getDate() + '.' + (endday.getMonth() + 1)

        let sendmaterialsday = new Date(result.val().sendduration)
        let materials_day = sendmaterialsday.getDate() + '.' + (sendmaterialsday.getMonth() + 1)

        bot.deleteMessage(chat.id, message_toedit[chat.id][0]).catch(error => {console.log(error)})
        bot.deleteMessage(chat.id, message_toedit[chat.id][1]).catch(error => {console.log(error)})
    
        let txt = '<b><a href="tg://user?id='+ chat.id +'">'+ chat.first_name +'</a></b> собирает на: <b>' + result.val().name + '</b>\n'
        txt += '\nСбор заканчивается: <b>' + end_day + '</b>\n' 
        txt += 'Прикрепить материалы до: <b>' + materials_day + '</b>\n\n'
        
        txt += 'Собрано: <b>' + result.val().bank + ' руб. из ' + result.val().money + ' руб. (' + Math.floor((100*result.val().bank) / result.val().money) + '%)</b>\n'
        if (result.val().participants === undefined || result.val().participants === null){
            txt += 'Участников: <b>0</b>\n'
        }
        if (result.val().participants !== undefined && result.val().participants !== null){
            txt += 'Участников: <b>'+ result.val().participants.length +'</b>\n'
        }

        if (result.val().materials !== 'null' && result.val().materials !== ''){
            txt += 'Материал прикреплен: <b>Да</b>\n' 
        }

        if (result.val().materials === 'null' || result.val().materials === ''){
            txt += 'Материал прикреплен: <b>Нет!</b>\n' 
        }

        bot.getMe().then(res => {
            if (result.val().privacy === false) txt += '\nТип сбора: <b>открытый</b>'
            if (result.val().privacy === true) txt += '\nТип сбора: <b>закрытый</b>'
            txt += '\nСсылка-приглашение (НЕ НАЖИМАЙТЕ!): https://t.me/'+ res.username +'?start=_part_' + chat.id + '_' + link
            
            let kb = []
            kb.push([{
                text: backtomain[0],
                callback_data: mydonationslist[1]
            }])
            if (result.val().status === 'online'){
                kb.push([{
                    text: editmaterial[0],
                    callback_data: editmaterial[1] + '_' + link
                }])
                kb.push([{
                    text: editpreview[0],
                    callback_data: editpreview[1] + '_' + link
                }])
                kb.push([{
                    text: canceldonation[0],
                    callback_data: canceldonation[1] + '_0_' + link
                }])
            }
            if (result.val().status === 'waiting'){
                if (result.val().materials === 'null' || result.val().materials === ''){
                    kb.push([{
                        text: editmaterial[0],
                        callback_data: editmaterial[1] + '_' + link
                    }])
                    kb.push([{
                        text: editpreview[0],
                        callback_data: editpreview[1] + '_' + link
                    }])
                }
                if (result.val().materials.includes('https://')){
                    kb.push([{
                        text: finishdonation[0],
                        callback_data: finishdonation[1] + '_0_' + link
                    }])
                }
                kb.push([{
                    text: canceldonation[0],
                    callback_data: canceldonation[1] + '_0_' + link
                }])
            }
            
            
            if (result.val().participants !== undefined && result.val().participants.length > 0){
                kb.push([{
                    text: checkparticipantsbutton[0],
                    callback_data: checkparticipantsbutton[1] + '_' + link
                }])
            }

            bot.sendPhoto(chat.id, result.val().photo, {
                caption: txt,
                parse_mode: 'HTML',
                disable_web_page_preview: true,
                reply_markup: {
                    inline_keyboard: kb
                }
            })
            .then(res => {
                message_toedit[chat.id][0] = res.message_id
            })
            .catch(err => {
                console.log('here: ' + err)
                bot.sendMessage(chat.id, txt, {
                    parse_mode: 'HTML',
                    disable_web_page_preview: true,
                    reply_markup: {
                        inline_keyboard: kb
                    }
                })
                .then(res => {
                    message_toedit[chat.id][0] = res.message_id
                })
                .catch(err => {console.log('here: ' + err)})
            })
        })
        
    })
}

function CancelDonation(chat, link){

    console.log('canceled')
    let date = new Date()
    let utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
    let timeOfffset = 6 //Astana GMT +6
    let currenttime = new Date(utcTime + (3600000 * timeOfffset))

    let donationdata = fb.database().ref('Kickstarter/users/' + chat.id + '/donations/' + link)
    donationdata.get().then(reply => {
        let updates = {}
        updates['Kickstarter/users/' + chat.id + '/donations/' + link + '/status'] = 'canceled'
        updates['Kickstarter/users/' + chat.id + '/donations/' + link + '/bank'] = 0
    
        BankCancelation(reply.val(), currenttime.getTime())

        let authorslists = fb.database().ref('Kickstarter/users/' + chat.id)
        authorslists.get().then(result => {
            
            let newaction = {
                date: currenttime.getTime(),
                description: 'Статус сбора '+chat.id+'.'+link +' изменен Вами на ОТМЕНЕН.'
            }
            if (result.val().balance.history !== undefined){
                updates['Kickstarter/users/' + chat.id + '/balance/history/' + result.val().balance.history.length] = newaction
            }
            if (result.val().balance.history === undefined){
                updates['Kickstarter/users/' + chat.id + '/balance/history/0'] = newaction
            }

            fb.database().ref().update(updates).then(() => {
                let txt_author = '🔴 Ваш сбор <b>"' + reply.val().name + '"</b> был отменен.\n\n<b>Деньги были возвращены участникам</b>'
                bot.sendMessage(chat.id, txt_author, {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [{
                                text: backtostart[0],
                                callback_data: 'opendonation_' + link
                            }]
                        ]
                    }
                })
            })
        })

        /* if (reply.val().privacy === false){
            let publicdonationdata = fb.database().ref('Kickstarter/gallery/donations')
            publicdonationdata.get().then(result => {
                let donation_updates = {}
                for (let i = 0; i < result.val().length; i++){
                    if (result.val()[i].user_id === chat.id && result.val()[i].donation_id === link){
                        donation_updates['Kickstarter/gallery/donations/' + i] = null
                        fb.database().ref().update(donation_updates)
                    }
                }
            })
        } */
        
    })
}

function FinishDonation(chat, link){
    let date = new Date()
    let utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
    let timeOfffset = 6 //Astana GMT +6
    let currenttime = new Date(utcTime + (3600000 * timeOfffset))

    let donationdata = fb.database().ref('Kickstarter/users/' + chat.id + '/donations/' + link)
    donationdata.get().then(reply => {
        let updates = {}
        updates['Kickstarter/users/' + chat.id + '/donations/' + link + '/status'] = 'offline'
        MaterialsMailing(reply.val(), reply.val().materials)

        let authorslists = fb.database().ref('Kickstarter/users/' + chat.id)
        authorslists.get().then(result => {
            updates['Kickstarter/users/' + chat.id + '/donations/' + link + '/bank'] = 0
            updates['Kickstarter/users/' + chat.id + '/balance/bank'] = result.val().balance.bank + reply.val().bank
            
            let newaction = {
                date: currenttime.getTime(),
                description: 'Окончание сбора '+chat.id+'.'+ link +'. Пополнение основного баланса: +' + reply.val().bank + ' руб.'
            }
            if (result.val().balance.history !== undefined){
                updates['Kickstarter/users/' + chat.id + '/balance/history/' + result.val().balance.history.length] = newaction
            }
            if (result.val().balance.history === undefined){
                updates['Kickstarter/users/' + chat.id + '/balance/history/0'] = newaction
            }
            
            let txt_author = '🥳 Сбор <b>"' + reply.val().name + '"</b> закрыт!\nМатериалы были автоматически разосланы участникам сбора, а на Ваш счет было зачислено <b>' + reply.val().bank + ' руб.</b>'
            
            fb.database().ref().update(updates).then(() => {
                bot.sendMessage(chat.id, txt_author, {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [{
                                text: backtostart[0],
                                callback_data: 'opendonation_' + link
                            }]
                        ]
                    }
                })
                .then(res => {
                    if (message_toedit[chat.id] === undefined) message_toedit[chat.id] = []
                    if (messagetext_toedit[chat.id] === undefined) messagetext_toedit[chat.id] = []
                    messagetext_toedit[chat.id][1] = res.text
                    message_toedit[chat.id][1] = res.message_id
                })
            })
            
        })

        /* if (reply.val().privacy === false){
            let publicdonationdata = fb.database().ref('Kickstarter/gallery/donations')
            publicdonationdata.get().then(result => {
                let donation_updates = {}
                for (let i = 0; i < result.val().length; i++){
                    if (result.val()[i].user_id === chat.id && result.val()[i].donation_id === link){
                        donation_updates['Kickstarter/gallery/donations/' + i] = null
                        fb.database().ref().update(donation_updates)
                    }
                }
            })
        } */
    })
}

function OpenDonationParticipant(chat, linkref){
    let link = user_donationlink[chat.id]
    if (linkref !== null) link = linkref
    let donationdata = fb.database().ref('Kickstarter/users/' + link)
    donationdata.get().then(result => {
        let authordata = fb.database().ref('Kickstarter/users/' + link.split('/donations/')[0])
        authordata.get().then(reply => {
            let endday = new Date(result.val().duration)
            let end_day = endday.getDate() + '.' + (endday.getMonth() + 1)
    
            let sendmaterialsday = new Date(result.val().duration)
            let materials_day = sendmaterialsday.getDate() + '.' + (sendmaterialsday.getMonth() + 1)
    
            bot.deleteMessage(chat.id, message_toedit[chat.id][0]).catch(error => {console.log('here: ' + error)})
            let txt = ''
            let kb = []
            kb[0] = [{
                text: backtostart[0],
                callback_data: backtomain[1]
            }]
            if (result.val().participants === undefined || result.val().participants === null){
                if (result.val().status === 'online' && link.split('/donations/')[0] !== (chat.id).toString()){
                    kb.push([{
                        text: participatebutton[0] + '(' + result.val().minmoney + ' руб.)',
                        callback_data: participatebutton[1] + '_' + result.val().minmoney
                    }])
                }
            }
            if (result.val().participants !== undefined && result.val().participants !== null){
                for (let i = 0; i< result.val().participants.length; i++){
                    if (result.val().participants[i].id === chat.id){
                        if (result.val().status === 'online'){
                            kb.push([{
                                text: '✅ Вы - участник ('+ result.val().participants[i].amount +' руб.)',
                                callback_data: 'emptyhandler'
                            }])
                        }
                        if (result.val().status === 'offline'){
                            kb.push([{
                                text: '🔗 Материалы',
                                url: result.val().materials
                            }])
                        }
                    }
                    if (i === result.val().participants.length - 1 && result.val().participants[i].id !== chat.id){
                        if (result.val().status === 'online' && link.split('/donations/')[0] !== (chat.id).toString()){
                            kb.push([{
                                text: participatebutton[0] + '(' + result.val().minmoney + ' руб.)',
                                callback_data: participatebutton[1] + '_' + result.val().minmoney
                            }])
                        }
                    }
                } 
            }

            if (result.val().status === 'canceled') txt  = '🔴 <b>Сбор отменен</b>\n\n'
            if (result.val().status === 'offline') txt  = '✅ <b>Сбор завершен</b>\n\n'
            if (result.val().status === 'waiting') txt  = '🟡 <b>Сбор завершен, идет рассылка</b>\n\n'

            txt += '<b><a href="tg://user?id='+ reply.val().profile.id +'">'+ reply.val().profile.name +'</a></b> собирает на: <b>' + result.val().name + '</b>\n'
            
            if (result.val().duration !== 0 && result.val().sendduration !== 0){
                txt += '\nСбор заканчивается: <b>' + end_day + '</b>\n'

                if (result.val().materials !== 'null' && result.val().materials !== ''){
                    txt += 'Рассылка контента: <b>моментально</b>\n\n'
                }
        
                if (result.val().materials === 'null' || result.val().materials === ''){
                    txt += 'Рассылка контента: <b>' + materials_day + '</b>\n\n'
                }
                
                if (result.val().status === 'online'){
                    txt += 'Собрано: <b>' + Math.floor((100*result.val().bank) / result.val().money) + '%</b>\n'
                }
            }

            if (result.val().duration === 0 && result.val().sendduration === 0){
                txt += '\n<b>Моментальный доступ к контенту</b>\n'
            }
            

            if (result.val().participants === undefined || result.val().participants === null){
                txt += 'Участников пока нет\n\n'
            }
            if (result.val().participants !== undefined && result.val().participants !== null){
                txt += 'Участников: <b>'+ result.val().participants.length +'</b>\n\n'
            }
    
            //txt += 'Мин. сумма участия: <b>' + result.val().minmoney + ' руб.</b>\n'
    
            bot.getMe().then(res => {
                if (result.val().privacy === false) txt += 'Тип сбора: <b>открытый</b>'
                if (result.val().privacy === true) txt += 'Тип сбора: <b>закрытый</b>'
                txt += '\nСсылка-приглашение (для друзей): https://t.me/'+ res.username +'?start=_part_' + link.split('/donations/')[0] + '_' + link.split('/donations/')[1]
    
                bot.sendPhoto(chat.id, result.val().photo, {
                    caption: txt,
                    parse_mode: 'HTML',
                    disable_web_page_preview: true,
                    reply_markup: {
                        inline_keyboard: kb
                    }
                })
                .then(res => {
                    message_toedit[chat.id][0] = res.message_id
                })
                .catch(err => {
                    console.log('here: ' + err)
                    bot.sendMessage(chat.id, txt, {
                        parse_mode: 'HTML',
                        disable_web_page_preview: true,
                        reply_markup: {
                            inline_keyboard: kb
                        }
                    })
                    .then(res => {
                        message_toedit[chat.id][0] = res.message_id
                    })
                    .catch(err => {console.log('here: ' + err)})
                })
            })
        })
    })
}

function MyParticipateDonationsList(chat){
    donate_editmaterials[chat.id] = false
    donate_editpreview[chat.id] = false
        
    bot.deleteMessage(chat.id, message_toedit[chat.id][1]).catch(err => {console.log('here: ' + err)})
    bot.deleteMessage(chat.id, message_toedit[chat.id][0]).catch(error => {console.log(error)})
    
    let txt = '<b>Список сборов, в которых Вы участвуете:</b>'

    //user_donations[chat.id] = []

    let kb = []

    let num_online = 0
    let txt_online = ''
    let kb_online = []

    let num_waiting = 0
    let txt_waiting = ''
    let kb_waiting = []

    let num_canceled = 0
    let txt_canceled = ''
    let kb_canceled = []
    
    let num_offline = 0
    let txt_offline = ''
    let kb_offline = []

    let participantsdata = fb.database().ref('Kickstarter/users/' + chat.id + '/participants/')
    participantsdata.get().then(reply => {
        //уже проверили, хотябы 1 сбор есть
        let donations = reply.val().split(',')
        for (let i = 0; i<donations.length; i++){
            let donationsdata = fb.database().ref('Kickstarter/users/' + donations[i].split('.')[0] + '/donations/' +  donations[i].split('.')[1])
            donationsdata.get().then(result => {
                if (result.val().status === 'online'){
                    if (num_online === 0) txt_online += '\n\n<b>🟢 Активные сборы:</b>'
        
                    //user_donations[chat.id][num_online] = result.val()
        
                    let stringlength = result.val().name.length
                    console.log(stringlength)
        
                    if (stringlength > 15) {
                        txt_online += '\n' + (result.val().name).slice(0, 15) + '...'
                        kb_online.push([{
                            text: '🟢 ' + (result.val().name).slice(0, 15) + '...',
                            callback_data: 'opendonationparticipant_' +  donations[i].split('.')[0] + '_' + donations[i].split('.')[1]
                        }])
                    }
                    if (stringlength <= 15){
                        txt_online += '\n' + result.val().name
                        kb_online.push([{
                            text: '🟢 ' + result.val().name,
                            callback_data: 'opendonationparticipant_' +  donations[i].split('.')[0] + '_' + donations[i].split('.')[1]
                        }])
                    }
        
                    num_online++
                }
                if (result.val().status === 'waiting'){
        
                    if (num_waiting === 0) txt_waiting += '\n\n<b>🟡 Ожидает материалов:</b>'
        
                    let stringlength = result.val().name.length
                    console.log(stringlength)
        
                    if (stringlength > 15) {
                        txt_waiting += '\n' + (result.val().name).slice(0, 15) + '...'
                        kb_waiting.push([{
                            text: '🟡 ' + (result.val().name).slice(0, 15) + '...',
                            callback_data: 'opendonationparticipant_' +  donations[i].split('.')[0] + '_' + donations[i].split('.')[1]
                        }])
                    }
                    if (stringlength <= 15){
                        txt_waiting += '\n' + result.val().name
                        kb_waiting.push([{
                            text: '🟡 ' + result.val().name,
                            callback_data: 'opendonationparticipant_' +  donations[i].split('.')[0] + '_' + donations[i].split('.')[1]
                        }])
                    }
                    num_waiting++
                }
                if (result.val().status === 'canceled'){
        
                    if (num_canceled === 0) txt_canceled += '\n\n<b>🔴 Отмененные сборы:</b>'
        
                    let stringlength = result.val().name.length
                    console.log(stringlength)
        
                    if (stringlength > 15) {
                        txt_canceled += '\n' + (result.val().name).slice(0, 15) + '...'
                        kb_canceled.push([{
                            text: '🔴 ' + (result.val().name).slice(0, 15) + '...',
                            callback_data: 'opendonationparticipant_' +  donations[i].split('.')[0] + '_' + donations[i].split('.')[1]
                        }])
                    }
                    if (stringlength <= 15){
                        txt_canceled += '\n' + result.val().name
                        kb_canceled.push([{
                            text: '🔴 ' + result.val().name,
                            callback_data: 'opendonationparticipant_' +  donations[i].split('.')[0] + '_' + donations[i].split('.')[1]
                        }])
                    }
                    num_canceled++
                }
                if (result.val().status === 'offline'){
        
                    if (num_offline === 0) txt_offline += '\n\n<b>✅ Завершенные:</b>'
        
                    let stringlength = result.val().name.length
                    console.log(stringlength)
        
                    if (stringlength > 15) {
                        txt_offline += '\n' + (result.val().name).slice(0, 15) + '...'
                        kb_offline.push([{
                            text: '✅ ' + (result.val().name).slice(0, 15) + '...',
                            callback_data: 'opendonationparticipant_' +  donations[i].split('.')[0] + '_' + donations[i].split('.')[1]
                        }])
                    }
                    if (stringlength <= 15){
                        txt_offline += '\n' + result.val().name
                        kb_offline.push([{
                            text: '✅ ' + result.val().name,
                            callback_data: 'opendonationparticipant_' +  donations[i].split('.')[0] + '_' + donations[i].split('.')[1]
                        }])
                    }
                    num_offline++
                }
                if (i === donations.length - 1){
                    txt += txt_online + txt_waiting + txt_canceled + txt_offline
                    txt += '\n\nДля просмотра сбора, нажмите на кнопку(-и) ниже'
                    console.log('here')
                    kb.push([{
                        text: backtomain[0],
                        callback_data: backtomain[1]
                    }])
                    if (kb_online.length > 0){
                        for (let x=0; x < kb_online.length; x++){
                            kb.push(kb_online[x])
                        }
                    }
                    
                    if (kb_waiting.length > 0) {
                        for (let y=0; y < kb_waiting.length; y++){
                            kb.push(kb_waiting[y])
                        }
                    }
                    
                    if (kb_canceled.length > 0){
                        for (let z=0; z < kb_canceled.length; z++){
                            kb.push(kb_canceled[z])
                        }
                    }
                    
                    if (kb_offline.length > 0){
                        for (let b=0; b< kb_offline.length; b++){
                            kb.push(kb_offline[b])
                        }
                    }
        
                    bot.sendMessage(chat.id, txt, {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: kb
                        }
                    })
                    .then(res => {
                        message_toedit[chat.id][0] = res.message_id
                    })
                    .catch(err => {console.log('here: ' + err)})
                }
            })
        }
    })
}

function GlobalDonationList(chat){
        
    bot.deleteMessage(chat.id, message_toedit[chat.id][1]).catch(err => {console.log('here: ' + err)})
    bot.deleteMessage(chat.id, message_toedit[chat.id][0]).catch(error => {console.log(error)})
    
    let txt = '<b>🔓 Список открытых сборов, в которых может участвовать каждый</b>'

    //user_donations[chat.id] = []

    let kb = []

    let donationlistdata = fb.database().ref('Kickstarter/gallery/donations')
    donationlistdata.get().then(result => {
        kb.push([{
            text: backtostart[0],
            callback_data: backtomain[1]
        }])
        for (let i = 0; i < result.val().length; i++){
            kb.push([{
                text: result.val()[i].name,
                callback_data: 'opendonationparticipant_' + result.val()[i].user_id + '_' + result.val()[i].donation_id
            }])
            if (i === result.val().length - 1){
                bot.sendMessage(chat.id, txt, {
                    parse_mode: 'HTML',
                })
                .then(res => {
                    message_toedit[chat.id][0] = res.message_id
                })
                .catch(err => {console.log('here: ' + err)})
            }
        }
    })
}

function CheckDeadlinesList(isRenew){
    let authorslists = fb.database().ref('Kickstarter/')
    authorslists.get().then(result => {
        if (result.val().mailing.authors !== ''){
            let authors = []
            if (result.val().mailing.authors.includes(',')){
                authors = (result.val().mailing.authors).split(',')
            }
            if (!result.val().mailing.authors.includes(',')){
                authors[0] = result.val().mailing.authors
            }

            if (isRenew){
                deelay(1000 * 86400).then(() => {CheckDeadlinesList(true)})
            }
            for (let x = 0; x < authors.length; x++) {
                let donationschekc = fb.database().ref('Kickstarter/users/' + authors[x] + '/donations')
                donationschekc.get().then(answ => {
                    let donations = Object.keys(answ.val())
                    for (let i = 0; i < donations.length; i++) {
                        let donationdata = fb.database().ref('Kickstarter/users/' + authors[x] + '/donations/' + donations[i])
                        donationdata.get().then(reply => {
                            if (reply.val().status === 'online' || reply.val().status === 'waiting'){
                                CheckDeadlines(authors[x] + '/donations/' + donations[i], reply.val())
                                console.log('started checking deadlines')
                            }
                        })
                    }
                })

                if (x === authors.length - 1){
                    bot.sendMessage(result.val().payments.info.moderator_id, '⚙️ Ведется проверка сборов ' + authors.length + ' VIP авторов')
                    .then(res => {
                        if (message_toedit[result.val().payments.info.moderator_id] === undefined) message_toedit[result.val().payments.info.moderator_id] = []
                        if (messagetext_toedit[result.val().payments.info.moderator_id] === undefined) messagetext_toedit[result.val().payments.info.moderator_id] = []
                        messagetext_toedit[result.val().payments.info.moderator_id][1] = res.text
                        message_toedit[result.val().payments.info.moderator_id][1] = res.message_id
                    })
                    .catch(err => {console.log('here: ' + err)})
                }
            }
        }
        if (result.val().mailing.free_authors !== ''){
            let authors = []
            if (result.val().mailing.free_authors.includes(',')){
                authors = (result.val().mailing.free_authors).split(',')
            }
            if (!result.val().mailing.free_authors.includes(',')){
                authors[0] = result.val().mailing.free_authors
            }

            if (isRenew){
                deelay(1000 * 86400).then(() => {CheckDeadlinesList(true)})
            }
            for (let x = 0; x < authors.length; x++) {
                let donationschekc = fb.database().ref('Kickstarter/users/' + authors[x] + '/donations')
                donationschekc.get().then(answ => {
                    let donations = Object.keys(answ.val())
                    for (let i = 0; i < donations.length; i++) {
                        let donationdata = fb.database().ref('Kickstarter/users/' + authors[x] + '/donations/' + donations[i])
                        donationdata.get().then(reply => {
                            if (reply.val().status === 'online' || reply.val().status === 'waiting'){
                                CheckDeadlines(authors[x] + '/donations/' + donations[i], reply.val())
                                console.log('started checking deadlines')
                            }
                        })
                    }
                })

                if (x === authors.length - 1){
                    bot.sendMessage(result.val().payments.info.moderator_id, '⚙️ Ведется проверка сборов ' + authors.length + ' авторов')
                    .then(res => {
                        if (message_toedit[result.val().payments.info.moderator_id] === undefined) message_toedit[result.val().payments.info.moderator_id] = []
                        if (messagetext_toedit[result.val().payments.info.moderator_id] === undefined) messagetext_toedit[result.val().payments.info.moderator_id] = []
                        messagetext_toedit[result.val().payments.info.moderator_id][1] = res.text
                        message_toedit[result.val().payments.info.moderator_id][1] = res.message_id
                    })
                    .catch(err => {console.log('here: ' + err)})
                }
            }
        }
    })
}

function CheckDeadlines(link, donationdata){

    let date = new Date()
    let utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
    let timeOfffset = 6 //Astana GMT +6
    let currenttime = new Date(utcTime + (3600000 * timeOfffset))
    let duration = new Date(donationdata.duration)
    let sendduration = new Date(donationdata.sendduration)
    console.log('time: ' + currenttime.getTime() + ', ' + duration.getTime())

    if (donationdata.status === 'online' && currenttime.getTime() >= duration.getTime()){
        let updates = {}

        if (donationdata.bank >= donationdata.money){
            if (donationdata.materials !== undefined && donationdata.materials.includes('https://')){
                updates['Kickstarter/users/' + link + '/status'] = 'offline'
                //1. получить список участников
                //2. отправить им сообщения по рассылке через другую функцию (с контентом)
                //+ указать в рассылке что можно если че связаться с модером

                console.log('stat mailing')
                MaterialsMailing(donationdata, donationdata.materials)

                //3. перевести баланс с банка сбора в банк автора
                let authorslists = fb.database().ref('Kickstarter/users/' + link.split('/donations/')[0])
                authorslists.get().then(result => {
                    updates['Kickstarter/users/' + link + '/bank'] = 0
                    updates['Kickstarter/users/' + link.split('/donations/')[0] + '/balance/bank'] = result.val().balance.bank + donationdata.bank
                    
                    //4. добавить в операции (history) автора инфу о том, что ему на счет поступили деньги за сбор *номер сбора*
                    let newaction = {
                        date: currenttime.getTime(),
                        description: 'Окончание сбора '+link.split('/donations/')[0]+'.'+link.split('/donations/')[1] +'. Пополнение основного баланса: +' + donationdata.bank + ' руб.'
                    }
                    if (result.val().balance.history !== undefined){
                        updates['Kickstarter/users/' + link.split('/donations/')[0] + '/balance/history/' + result.val().balance.history.length] = newaction
                    }
                    if (result.val().balance.history === undefined){
                        updates['Kickstarter/users/' + link.split('/donations/')[0] + '/balance/history/0'] = newaction
                    }
                    
                    //5. Послать автору сообщение мол сбор закрыт ты получаешь деньги
                    let txt_author = '🥳 Сбор <b>"' + donationdata.name + '"</b> закрыт!\nМатериалы были автоматически разосланы участникам сбора, а на Ваш счет было зачислено <b>' + donationdata.bank + ' руб.</b>'
                    
                    fb.database().ref().update(updates).then(() => {
                        bot.sendMessage(link.split('/donations/')[0], txt_author, {
                            parse_mode: 'HTML',
                        })
                        .then(res => {
                            if (message_toedit[link.split('/donations/')[0]] === undefined) message_toedit[link.split('/donations/')[0]] = []
                            if (messagetext_toedit[link.split('/donations/')[0]] === undefined) messagetext_toedit[link.split('/donations/')[0]] = []
                            messagetext_toedit[link.split('/donations/')[0]][1] = res.text
                            message_toedit[link.split('/donations/')[0]][1] = res.message_id
                        })
                    })
                    
                })

                /* if (reply.val().privacy === false){
                    let publicdonationdata = fb.database().ref('Kickstarter/gallery/donations')
                    publicdonationdata.get().then(result => {
                        let donation_updates = {}
                        for (let i = 0; i < result.val().length; i++){
                            if (result.val()[i].user_id === chat.id && result.val()[i].donation_id === query.data.split('_')[2]){
                                donation_updates['Kickstarter/gallery/donations/' + i] = null
                                fb.database().ref().update(donation_updates)
                            }
                        }
                    })
                } */
                
            }
            else {
                updates['Kickstarter/users/' + link + '/status'] = 'waiting'

                let authorslists = fb.database().ref('Kickstarter/users/' + link.split('/donations/')[0])
                authorslists.get().then(result => {
                    
                    let newaction = {
                        date: currenttime.getTime(),
                        description: 'Статус сбора '+link.split('/donations/')[0]+'.'+link.split('/donations/')[1] +' изменен на ОЖИДАНИЕ (деньги собраны)'
                    }
                    if (result.val().balance.history !== undefined){
                        updates['Kickstarter/users/' + link.split('/donations/')[0] + '/balance/history/' + result.val().balance.history.length] = newaction
                    }
                    if (result.val().balance.history === undefined){
                        updates['Kickstarter/users/' + link.split('/donations/')[0] + '/balance/history/0'] = newaction
                    }

                    fb.database().ref().update(updates).then(() => {
                        let txt_author = '🟡 Ваш сбор <b>"' + donationdata.name + '"</b> собрал нужную сумму денег и перешел в статус ожидания.\n<b>У Вас есть 3 дня, чтобы загрузить материалы.</b> Если Вы этого не сделаете, сбор будет отменен, деньги вернуться участникам'
                        bot.sendMessage(link.split('/donations/')[0], txt_author, {
                            parse_mode: 'HTML',
                        })
                        .then(res => {
                            if (message_toedit[link.split('/donations/')[0]] === undefined) message_toedit[link.split('/donations/')[0]] = []
                            if (messagetext_toedit[link.split('/donations/')[0]] === undefined) messagetext_toedit[link.split('/donations/')[0]] = []
                            messagetext_toedit[link.split('/donations/')[0]][1] = res.text
                            message_toedit[link.split('/donations/')[0]][1] = res.message_id
                        })
                    })
                })

                /* if (reply.val().privacy === false){
                    let publicdonationdata = fb.database().ref('Kickstarter/gallery/donations')
                    publicdonationdata.get().then(result => {
                        let donation_updates = {}
                        for (let i = 0; i < result.val().length; i++){
                            if (result.val()[i].user_id === chat.id && result.val()[i].donation_id === query.data.split('_')[2]){
                                donation_updates['Kickstarter/gallery/donations/' + i] = null
                                fb.database().ref().update(donation_updates)
                            }
                        }
                    })
                } */
            }
        }
        
        else {
            updates['Kickstarter/users/' + link + '/status'] = 'waiting'

            let authorslists = fb.database().ref('Kickstarter/users/' + link.split('/donations/')[0])
            authorslists.get().then(result => {
                
                let newaction = {
                    date: currenttime.getTime(),
                    description: 'Статус сбора '+link.split('/donations/')[0]+'.'+link.split('/donations/')[1] +' изменен на ОЖИДАНИЕ (собрана не вся сумма)'
                }
                if (result.val().balance.history !== undefined){
                    updates['Kickstarter/users/' + link.split('/donations/')[0] + '/balance/history/' + result.val().balance.history.length] = newaction
                }
                if (result.val().balance.history === undefined){
                    updates['Kickstarter/users/' + link.split('/donations/')[0] + '/balance/history/0'] = newaction
                }

                fb.database().ref().update(updates).then(() => {
                    let txt_author = ''
                    if (donationdata.materials !== undefined && donationdata.materials.includes('https://')){
                        txt_author = '🟡 Ваш сбор <b>"' + donationdata.name + '" не смог собрать нужную сумму ('+ donationdata.bank + ' из '+ donationdata.money +' руб.)</b>, но, из-за дедлайна, перешел в статус ожидания.\n\nВ следующие <b>3 дня</b> Вам необходимо либо отменить сбор (деньги вернутся участникам), либо признать сбор состоявшимся (участники получат материалы, а Вы - собранную сумму). Сделать это можно, открыв страницу сбора в этом боте.\n\nЕсли по истечении срока Вы не выполните эти действия, сбор будет отменен автоматически.'
                    }

                    if (donationdata.materials === undefined || !donationdata.materials.includes('https://')){
                        txt_author = '🟡 Ваш сбор <b>"' + donationdata.name + '" не смог собрать нужную сумму ('+ donationdata.bank + ' из '+ donationdata.money +' руб.)</b>, но, из-за дедлайна, перешел в статус ожидания.\n\nВ следующие <b>3 дня</b> Вам необходимо либо отменить сбор (деньги вернутся участникам), либо прикрепить ссылку на материалы и признать сбор состоявшимся (участники получат материалы, а Вы - собранную сумму). Сделать это можно, открыв страницу сбора в этом боте (кнопка закрытия сбора не появится, пока Вы не прикрепите ссылку на материалы).\n\nЕсли по истечении срока Вы не выполните эти действия, сбор будет отменен автоматически.'
                    }
                    
                    bot.sendMessage(link.split('/donations/')[0], txt_author, {
                        parse_mode: 'HTML',
                    })
                    .then(res => {
                        if (message_toedit[link.split('/donations/')[0]] === undefined) message_toedit[link.split('/donations/')[0]] = []
                        if (messagetext_toedit[link.split('/donations/')[0]] === undefined) messagetext_toedit[link.split('/donations/')[0]] = []
                        messagetext_toedit[link.split('/donations/')[0]][1] = res.text
                        message_toedit[link.split('/donations/')[0]][1] = res.message_id
                    })
                })
            })

            /* if (reply.val().privacy === false){
                let publicdonationdata = fb.database().ref('Kickstarter/gallery/donations')
                publicdonationdata.get().then(result => {
                    let donation_updates = {}
                    for (let i = 0; i < result.val().length; i++){
                        if (result.val()[i].user_id === chat.id && result.val()[i].donation_id === query.data.split('_')[2]){
                            donation_updates['Kickstarter/gallery/donations/' + i] = null
                            fb.database().ref().update(donation_updates)
                        }
                    }
                })
            } */
        }
        
    }
    if (donationdata.status === 'waiting' && currenttime.getTime() >= sendduration.getTime()){
        let updates = {}
        if (donationdata.bank < donationdata.money){
            //не собрали бабки + нет материала = отмена
            if (donationdata.materials === undefined || !donationdata.materials.includes('https://')){
                updates['Kickstarter/users/' + link + '/status'] = 'canceled'
                updates['Kickstarter/users/' + link + '/bank'] = 0

                BankCancelation(donationdata, currenttime.getTime())

                let authorslists = fb.database().ref('Kickstarter/users/' + link.split('/donations/')[0])
                authorslists.get().then(result => {
                    
                    let newaction = {
                        date: currenttime.getTime(),
                        description: 'Статус сбора '+link.split('/donations/')[0]+'.'+link.split('/donations/')[1] +' изменен на ОТМЕНЕН, т.к. не была вовремя прикреплена ссылка на материал, а также не была достигнута цель сбора'
                    }
                    if (result.val().balance.history !== undefined){
                        updates['Kickstarter/users/' + link.split('/donations/')[0] + '/balance/history/' + result.val().balance.history.length] = newaction
                    }
                    if (result.val().balance.history === undefined){
                        updates['Kickstarter/users/' + link.split('/donations/')[0] + '/balance/history/0'] = newaction
                    }

                    fb.database().ref().update(updates).then(() => {
                        let txt_author = '🔴 Ваш сбор <b>"' + donationdata.name + '"</b> не смог побить цель по сборам, поэтому он был отменен.\nТакже Вы не прикрепили ссылку на материал.\n\n<b>Деньги были возвращены участникам</b>'
                        bot.sendMessage(link.split('/donations/')[0], txt_author, {
                            parse_mode: 'HTML',
                        })
                        .then(res => {
                            if (message_toedit[link.split('/donations/')[0]] === undefined) message_toedit[link.split('/donations/')[0]] = []
                            if (messagetext_toedit[link.split('/donations/')[0]] === undefined) messagetext_toedit[link.split('/donations/')[0]] = []
                            messagetext_toedit[link.split('/donations/')[0]][1] = res.text
                            message_toedit[link.split('/donations/')[0]][1] = res.message_id
                        })
                    })
                })

                /* if (reply.val().privacy === false){
                    let publicdonationdata = fb.database().ref('Kickstarter/gallery/donations')
                    publicdonationdata.get().then(result => {
                        let donation_updates = {}
                        for (let i = 0; i < result.val().length; i++){
                            if (result.val()[i].user_id === chat.id && result.val()[i].donation_id === query.data.split('_')[2]){
                                donation_updates['Kickstarter/gallery/donations/' + i] = null
                                fb.database().ref().update(donation_updates)
                            }
                        }
                    })
                } */
            }
            //не собрали бабки + есть материал = отмена
            if (donationdata.materials !== undefined && donationdata.materials.includes('https://')){
                updates['Kickstarter/users/' + link + '/status'] = 'canceled'
                updates['Kickstarter/users/' + link + '/bank'] = 0

                BankCancelation(donationdata, currenttime.getTime())

                let authorslists = fb.database().ref('Kickstarter/users/' + link.split('/donations/')[0])
                authorslists.get().then(result => {
                    
                    let newaction = {
                        date: currenttime.getTime(),
                        description: 'Статус сбора '+link.split('/donations/')[0]+'.'+link.split('/donations/')[1] +' изменен на ОТМЕНЕН, т.к. не была достигнута цель сбора'
                    }
                    if (result.val().balance.history !== undefined){
                        updates['Kickstarter/users/' + link.split('/donations/')[0] + '/balance/history/' + result.val().balance.history.length] = newaction
                    }
                    if (result.val().balance.history === undefined){
                        updates['Kickstarter/users/' + link.split('/donations/')[0] + '/balance/history/0'] = newaction
                    }

                    fb.database().ref().update(updates).then(() => {
                        let txt_author = '🔴 Ваш сбор <b>"' + donationdata.name + '"</b> не смог побить цель по сборам, поэтому он был отменен.\n\n<b>Деньги были возвращены участникам, никто не получил доступ к Вашему материалу (ссылке)</b>'
                        bot.sendMessage(link.split('/donations/')[0], txt_author, {
                            parse_mode: 'HTML',
                        })
                        .then(res => {
                            if (message_toedit[link.split('/donations/')[0]] === undefined) message_toedit[link.split('/donations/')[0]] = []
                            if (messagetext_toedit[link.split('/donations/')[0]] === undefined) messagetext_toedit[link.split('/donations/')[0]] = []
                            messagetext_toedit[link.split('/donations/')[0]][1] = res.text
                            message_toedit[link.split('/donations/')[0]][1] = res.message_id
                        })
                    })
                })

                /* if (reply.val().privacy === false){
                    let publicdonationdata = fb.database().ref('Kickstarter/gallery/donations')
                    publicdonationdata.get().then(result => {
                        let donation_updates = {}
                        for (let i = 0; i < result.val().length; i++){
                            if (result.val()[i].user_id === chat.id && result.val()[i].donation_id === query.data.split('_')[2]){
                                donation_updates['Kickstarter/gallery/donations/' + i] = null
                                fb.database().ref().update(donation_updates)
                            }
                        }
                    })
                } */
            }
        }
        else {
            // собрали бабки - нет материала = отмена
            if (donationdata.materials === undefined || !donationdata.materials.includes('https://')){
                updates['Kickstarter/users/' + link + '/status'] = 'canceled'
                updates['Kickstarter/users/' + link + '/bank'] = 0

                BankCancelation(donationdata, currenttime.getTime())

                let authorslists = fb.database().ref('Kickstarter/users/' + link.split('/donations/')[0])
                authorslists.get().then(result => {
                    
                    let newaction = {
                        date: currenttime.getTime(),
                        description: 'Статус сбора '+link.split('/donations/')[0]+'.'+link.split('/donations/')[1] +' изменен на ОТМЕНЕН, т.к. за время ожидания материал не был прикреплен'
                    }
                    if (result.val().balance.history !== undefined){
                        updates['Kickstarter/users/' + link.split('/donations/')[0] + '/balance/history/' + result.val().balance.history.length] = newaction
                    }
                    if (result.val().balance.history === undefined){
                        updates['Kickstarter/users/' + link.split('/donations/')[0] + '/balance/history/0'] = newaction
                    }

                    fb.database().ref().update(updates).then(() => {
                        let txt_author = '🔴 Ваш сбор <b>"' + donationdata.name + '"</b> побил цель по сборам, но вы так и не прикрепили ссылку на материалы. Сбор был отменен.\n\n<b>Деньги были возвращены участникам</b>'
                        bot.sendMessage(link.split('/donations/')[0], txt_author, {
                            parse_mode: 'HTML',
                        })
                        .then(res => {
                            if (message_toedit[link.split('/donations/')[0]] === undefined) message_toedit[link.split('/donations/')[0]] = []
                            if (messagetext_toedit[link.split('/donations/')[0]] === undefined) messagetext_toedit[link.split('/donations/')[0]] = []
                            messagetext_toedit[link.split('/donations/')[0]][1] = res.text
                            message_toedit[link.split('/donations/')[0]][1] = res.message_id
                        })
                    })
                })

                /* if (reply.val().privacy === false){
                    let publicdonationdata = fb.database().ref('Kickstarter/gallery/donations')
                    publicdonationdata.get().then(result => {
                        let donation_updates = {}
                        for (let i = 0; i < result.val().length; i++){
                            if (result.val()[i].user_id === chat.id && result.val()[i].donation_id === query.data.split('_')[2]){
                                donation_updates['Kickstarter/gallery/donations/' + i] = null
                                fb.database().ref().update(donation_updates)
                            }
                        }
                    })
                } */
            }
            // собрали бабки - есть материал = готово!
            if (donationdata.materials !== undefined && donationdata.materials.includes('https://')){
                updates['Kickstarter/users/' + link + '/status'] = 'offline'
                MaterialsMailing(donationdata, donationdata.materials)

                let authorslists = fb.database().ref('Kickstarter/users/' + link.split('/donations/')[0])
                authorslists.get().then(result => {
                    updates['Kickstarter/users/' + link + '/bank'] = 0
                    updates['Kickstarter/users/' + link.split('/donations/')[0] + '/balance/bank'] = result.val().balance.bank + donationdata.bank
                    
                    let newaction = {
                        date: currenttime.getTime(),
                        description: 'Окончание сбора '+link.split('/donations/')[0]+'.'+link.split('/donations/')[1] +'. Пополнение основного баланса: +' + donationdata.bank + ' руб.'
                    }
                    if (result.val().balance.history !== undefined){
                        updates['Kickstarter/users/' + link.split('/donations/')[0] + '/balance/history/' + result.val().balance.history.length] = newaction
                    }
                    if (result.val().balance.history === undefined){
                        updates['Kickstarter/users/' + link.split('/donations/')[0] + '/balance/history/0'] = newaction
                    }
                    
                    let txt_author = '🥳 Сбор <b>"' + donationdata.name + '"</b> закрыт!\nМатериалы были автоматически разосланы участникам сбора, а на Ваш счет было зачислено <b>' + donationdata.bank + ' руб.</b>'
                    
                    fb.database().ref().update(updates).then(() => {
                        bot.sendMessage(link.split('/donations/')[0], txt_author, {
                            parse_mode: 'HTML',
                        })
                        .then(res => {
                            if (message_toedit[link.split('/donations/')[0]] === undefined) message_toedit[link.split('/donations/')[0]] = []
                            if (messagetext_toedit[link.split('/donations/')[0]] === undefined) messagetext_toedit[link.split('/donations/')[0]] = []
                            messagetext_toedit[link.split('/donations/')[0]][1] = res.text
                            message_toedit[link.split('/donations/')[0]][1] = res.message_id
                        })
                    })
                    
                })

                /* if (reply.val().privacy === false){
                    let publicdonationdata = fb.database().ref('Kickstarter/gallery/donations')
                    publicdonationdata.get().then(result => {
                        let donation_updates = {}
                        for (let i = 0; i < result.val().length; i++){
                            if (result.val()[i].user_id === chat.id && result.val()[i].donation_id === query.data.split('_')[2]){
                                donation_updates['Kickstarter/gallery/donations/' + i] = null
                                fb.database().ref().update(donation_updates)
                            }
                        }
                    })
                } */
            }
        }
    }
}

function MaterialsMailing(donationdata, materials){

    if (donationdata.participants !== undefined){
        let authorslists = fb.database().ref('Kickstarter/payments/info/moderator_id')
        authorslists.get().then(result => {
            let txt = '🥳 Ура! Вы и другие участники побили цель сбора <b>' + donationdata.name + '</b>. \nВы можете посмотреть материалы на странице сбора в боте, либо <b>нажав на кнопку ниже.</b>\n\n Если Вы считаете, что отправленный материал не соответствует описанию сбора, свяжитесь с <a href="tg://user?id='+ result.val() +'">модератором</a>'
            for (let i = 0; i < donationdata.participants.length; i++){
                bot.sendMessage(donationdata.participants[i].id, txt, {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [{
                                text: '🔗 Материалы',
                                url: materials
                            }]
                        ]
                    }
                })
                .then(res => {
                    if (message_toedit[donationdata.participants[i].id] === undefined) message_toedit[donationdata.participants[i].id] = []
                    if (messagetext_toedit[donationdata.participants[i].id] === undefined) messagetext_toedit[donationdata.participants[i].id] = []
                    messagetext_toedit[donationdata.participants[i].id][1] = res.text
                    message_toedit[donationdata.participants[i].id][1] = res.message_id
                })
                .catch(err => {console.log('here: ' + err)})
    
                if (i === donationdata.participants.length - 1){
                    bot.sendMessage(result.val(), '📩 По результату сбора ('+ donationdata.duration +') был отправлен <a href="tg://user?id='+ materials +'">материал</a> ' + donationdata.participants.length + ' людям.', {
                        parse_mode: 'HTML',
                    })
                    .then(res => {
                        if (message_toedit[result.val()] === undefined) message_toedit[result.val()] = []
                        if (messagetext_toedit[result.val()] === undefined) messagetext_toedit[result.val()] = []
                        messagetext_toedit[result.val()][1] = res.text
                        message_toedit[result.val()][1] = res.message_id
                    })
                    .catch(err => {console.log('here: ' + err)})
                }
            }
        })
    }
}

function BankCancelation(donationdata, time){
    if (donationdata.participants !== undefined){
        for (let i = 0; i < donationdata.participants.length; i++){
            let authorslists = fb.database().ref('Kickstarter/users/' + donationdata.participants[i].id)
            authorslists.get().then(result => {
                let updates = {}
                updates['Kickstarter/users/' + donationdata.participants[i].id + '/balance/bank'] = result.val().balance.bank + donationdata.participants[i].amount
                let newaction = {
                    date: time,
                    description: 'Сбор '+ donationdata.name +' был отменен, Ваши деньги (' + donationdata.participants[i].amount + ' руб) вернулись на Ваш баланс.'
                }
                if (result.val().balance.history !== undefined){
                    updates['Kickstarter/users/' + donationdata.participants[i].id + '/balance/history/' + result.val().balance.history.length] = newaction
                }
                if (result.val().balance.history === undefined){
                    updates['Kickstarter/users/' + donationdata.participants[i].id + '/balance/history/0'] = newaction
                }
    
                fb.database().ref().update(updates).then(() => {
                    bot.sendMessage(donationdata.participants[i].id, '😢 Сбор <b>'+ donationdata.name +'</b> был отменен. Ваши деньги были возвращены на баланс', {
                        parse_mode: 'HTML',
                    })
                    .then(res => {
                        if (message_toedit[donationdata.participants[i].id] === undefined) message_toedit[donationdata.participants[i].id] = []
                        if (messagetext_toedit[donationdata.participants[i].id] === undefined) messagetext_toedit[donationdata.participants[i].id] = []
                        messagetext_toedit[donationdata.participants[i].id][1] = res.text
                        message_toedit[donationdata.participants[i].id][1] = res.message_id
                    })
                    .catch(err => {console.log('here: ' + err)})
                })
            })
        }
    }
    
}

function Start(msg){
    const { chat, message_id, text } = msg
    for (let i=0; i<100; i++){
        bot.deleteMessage(chat.id, message_id - i).catch(err => {/* console.log() */})
    }

    if (message_toedit[chat.id] === undefined) {
        message_toedit[chat.id] = []
        messagetext_toedit[chat.id] = []
    }
    if (messagetext_toedit[chat.id] === undefined) {
        messagetext_toedit[chat.id] = []
        messagetext_toedit[chat.id] = []
    }

    let checkuser = fb.database().ref('Kickstarter/users/' + chat.id)
    checkuser.get().then(result => {
        if (result.exists()) {
            console.log('REGISTERED')
            if (text.includes('_part')){
                user_donationlink[chat.id] = text.split('part_')[1]
                user_donationlink[chat.id] = user_donationlink[chat.id].split('_')[0] + '/donations/' + user_donationlink[chat.id].split('_')[1]

                OpenDonationParticipant(chat, null)
            }
            else {
                Auth(chat)
            }
        }
        else {
            if (text.includes('_author')){
                let main_data = fb.database().ref('Kickstarter/')
                main_data.get().then(reply => {
                    if (reply.val().coupons.authors > 0){
                        let updates = {}
                        updates['Kickstarter/coupons/authors'] = reply.val().coupons.authors - 1
                        if (reply.val().mailing.authors === ''){
                            updates['Kickstarter/mailing/authors'] = (chat.id).toString()
                        }
                        if (reply.val().mailing.authors !== ''){
                            updates['Kickstarter/mailing/authors'] = reply.val().mailing.authors + ',' + chat.id
                        }

                        updates['Kickstarter/users/' + chat.id + '/profile/id'] = chat.id
                        updates['Kickstarter/users/' + chat.id + '/profile/name'] = chat.first_name
                        
                        updates['Kickstarter/users/' + chat.id + '/balance/bank'] = 0
                        updates['Kickstarter/users/' + chat.id + '/balance/comission'] = 10
                        updates['Kickstarter/users/' + chat.id + '/balance/overall'] = 0
                        updates['Kickstarter/users/' + chat.id + '/balance/withdrew'] = 0
                        updates['Kickstarter/users/' + chat.id + '/balance/withdroval_limit'] = 3000 //мин. сумма для вывода
                        fb.database().ref().update(updates).then(() => {
                            bot.sendMessage(chat.id, hellomessage, {
                                parse_mode: 'HTML',
                                reply_markup: {
                                    inline_keyboard: [
                                        [{
                                            text: checkchannelfollow[0],
                                            callback_data: backtostart[1]
                                        }]
                                    ]
                                }
                            }).then(res => {
                                message_toedit[chat.id][0] = res.message_id
                                messagetext_toedit[chat.id][0] = res.text
                            })
                        })
                        

                        /* fb.database().ref().update(updates).then(() => {
                            bot.deleteMessage(chat.id, message_toedit[chat.id][0]).catch(err => {console.log('here: ' + err)})
                            bot.sendMessage(chat.id, newdonationsteps[0], {
                                parse_mode: 'HTML',
                            })
                            .then(res => {
                                message_toedit[chat.id][0] = res.message_id
                                messagetext_toedit[chat.id][0] = newdonationsteps[0]
                            })
                        }) */
                        //создание первого сбора для админа
                        /* donateregisterstep[chat.id] = 1
                        donate_name[chat.id] = ''
                        donate_money[chat.id] = 0
                        donate_minmoney[chat.id] = 0
                        donate_duration[chat.id] = 0
                        donate_sendduration[chat.id] = 3 //три дня дается на ожидание
                        donate_private[chat.id] = false
                        donate_photo[chat.id] = ''
                        donate_duration_secs[chat.id] = 0
                        donate_sendduration_secs[chat.id] = 0
                        donate_materials[chat.id] = '' */
                    }
                })
                
            }
            if (text.includes('_part')){
                console.log('USER DIDNT REGISTER YET')
                user_donationlink[chat.id] = text.split('part_')[1]
                user_donationlink[chat.id] = user_donationlink[chat.id].split('_')[0] + '/donations/' + user_donationlink[chat.id].split('_')[1]
                
                let newuser = {
                    profile: {
                        name: chat.first_name,
                        id: chat.id,
                    },
                    balance: {
                        bank: 0,
                        comission: 25,
                        overall: 0,
                        withdrew: 0,
                        withdroval_limit: 1500
                    }
                }
                let updates = {}
                updates['Kickstarter/users/' + chat.id] = newuser
                fb.database().ref().update(updates)
                
                bot.sendMessage(chat.id, hellomessage, {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [{
                                text: checkchannelfollow[0],
                                callback_data: checkchannelfollow[1] + '_0'
                            }]
                        ]
                    }
                }).then(res => {
                    message_toedit[chat.id][0] = res.message_id
                    messagetext_toedit[chat.id][0] = res.text
                })
            }
            if (!text.includes('_part') && !text.includes('_author')) {

                let newuser = {
                    profile: {
                        name: chat.first_name,
                        id: chat.id,
                    },
                    balance: {
                        bank: 0,
                        comission: 25,
                        overall: 0,
                        withdrew: 0,
                        withdroval_limit: 1500
                    }
                }
                let updates = {}
                updates['Kickstarter/users/' + chat.id] = newuser
                fb.database().ref().update(updates)

                bot.sendMessage(chat.id, hellomessage, {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [{
                                text: checkchannelfollow[0],
                                callback_data: checkchannelfollow[1] + '_0'
                            }]
                        ]
                    }
                }).then(res => {
                    message_toedit[chat.id][0] = res.message_id
                    messagetext_toedit[chat.id][0] = res.text
                })
            }
        }
    }).catch(err => {})
}

//Кнопка меню ("Главная")
bot.onText(/\/start/, msg => {
    //const { chat, message_id, text } = msg
    Start(msg)
})

async function getProvider(method, account){
    switch(method){
        case 'qiwi': {
            return Recipients.QIWI
        }
        case 'yoomoney': {
            return Recipients.YooMoney
        }
        case 'card': {
            console.log(detector.getCardProvider(account))
            return detector.getCardProvider(account)
        }
        case 'mobile': {
            console.log(detector.getPhoneProvider(account))
            return detector.getPhoneProvider(account)
        }
    }
}

async function sendPayment(method, account, amount, comment) {
    const provider = await getProvider(method, account);
    const commission = await qiwi.getCommission(provider, account, amount);
    console.log('here: ' + provider)
    // Используем метод `pay2` вместо `pay` для лучшей читаемости
    await qiwi.pay2({
      // Пускай комиссию платит получатель
      amount: amount - commission,
      account,
  
      // Указываем провайдера так-как переводим не только на КИВИ
      provider,
    
      // Указываем валюту (хотя можно этого не делать)
      currency: Currency.RUB,
    }).then(res => {
        console.log(res)
    })
}

//Функция для сброса данных о пользователе. Применяется, когда цикл "старт-заказ принят" был выполнен. 
async function Auth(chat){
    
    //sendPayment("mobile", "77075112224", 20);
    //qiwi.getPersonProfile().then(console.log);
    /* sendPayment('yoomoney','4100117037853859', 30, 'lol').then(res => {
        console.log('works')
        console.log(res)
    }).catch(err => {console.log(err)}) */
    let creatordata = fb.database().ref('Kickstarter/users/' + chat.id)
    creatordata.get().then(result => {
        let txt = 'Привет, <b>' + chat.first_name + '</b>\n'

        if (result.val().donations !== null && result.val().donations !== undefined){
            donationnames[chat.id] = Object.keys(result.val().donations)
            console.log(result.val().donations)
        }
        
        if (result.val().participants !== null && result.val().participants !== undefined){
            if (result.val().participants.includes(','))participantsnames[chat.id] = result.val().participants.split(',')
            if (!result.val().participants.includes(',')){
                if (result.val().participants === ''){
                    participantsnames[chat.id] = undefined
                }
                if (result.val().participants !== ''){
                    participantsnames[chat.id] = result.val().participants.split(',')
                }
            }
        }

        let kb = []

        /* if (reply.exists() && reply.val().length > 0){
            kb.push([{
                text: publicdonationlist[0],
                callback_data: publicdonationlist[1]
            }])
        } */

        let donationbutton = []
        donationbutton.push({
            text: '➕ Новый сбор',
            callback_data: whoareyoubutton[1]
        })
        if (donationnames[chat.id] !== undefined && donationnames[chat.id].length > 0){ 
            txt += 'Вы открыли: <b>' + donationnames[chat.id].length + ' сборов</b>'
            donationbutton.push(
            {
                text: mydonationslist[0],
                callback_data: mydonationslist[1]
            })
        }
        kb.push(donationbutton)
        if (participantsnames[chat.id] !== undefined && participantsnames[chat.id].length > 0){ 
            txt += '\nВы участвовали/участвуете в: <b>' + participantsnames[chat.id].length + ' сборах</b>'
            kb.push([{
                text: myparticipantslist[0],
                callback_data: myparticipantslist[1]
            }])
        }

        if (participantsnames[chat.id] === undefined || participantsnames[chat.id].length === 0){ 
            if (donationnames[chat.id] === undefined || donationnames[chat.id].length === 0)
            txt += '\nВы участвовали/участвуете в: 0<b> сборах</b>'
        }

        txt += '\n\nЧтобы просмотреть подробную информацию, нажмите на кнопки ниже\n'

        kb.push([{
            text: mybalancebutton[0],
            callback_data: mybalancebutton[1]
        }])

        bot.sendMessage(chat.id, txt, {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: kb
            }
        })
        .then(res => {
            if (message_toedit[chat.id] === undefined) {
                message_toedit[chat.id] = []
            }
            message_toedit[chat.id][0] = res.message_id
        })
    })

}

//Все возникающие у пользователей критические ошибки отлавливаем и сохраняем в базу данных, а также админу в телеграм.
/* process.on('uncaughtException', function (err) {
    console.log(err)
    let userdata = fb.database().ref('Motherbase/logger/uncaughtException/')
    userdata.get().then((result) => {
        let counter = Object.keys(result.val())

        let date = new Date()
        let utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
        let timeOfffset = 6 //Astana GMT +6
        let time_now = new Date(utcTime + (3600000 * timeOfffset))

        let newreport = {
            when: time_now,
            error_text: err.message.toString(),
            error_stack: err.stack.toString()
        }

        let updates = {}
        updates['Motherbase/logger/uncaughtException/' + counter.length] = newreport
        fb.database().ref().update(updates)
        let mb_data = fb.database().ref('Motherbase/chats/')
        mb_data.get().then((result) => {
            let err_txt = `<b>⚠️ ВНИМАНИЕ ⚠️</b>
В работе скрипта DELIVERY произошла ошибка.

<b>ℹ️ Общая информация: </b>
├ Заведение: `+ userPoint[current_chat] + `
└ Время: ` + time_now + `

<b>💬 Информация: </b>
` + err.name.toString() + `

` + err.stack.toString() + `

` + err.message.toString()
            bot.sendMessage(result.val().god_id, err_txt, {
                parse_mode: 'HTML'
            })
        })
    
    })
    
}) */

process.on('uncaughtException', function (err) {
    console.log(err);
});
