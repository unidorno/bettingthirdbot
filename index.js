const TelegramBot = require('node-telegram-bot-api')
//const mongoose = require('mongoose')
var GeoPoint = require('geopoint')
const debug = require('./helpers')
const config = require('./config')
const database = require('./database.json')
const keyboards = require('./src/keyboard-buttons')
const NodeGeocoder = require('node-geocoder');
//const firebase = require('./firebase_connect')
console.log('bot has been started...')

//====================INITIALIZE FIREBASE==============================
const firebase_connect = require('firebase')
const { reset } = require('nodemon')

const fb = firebase_connect.initializeApp({
    apiKey:'AIzaSyA0wSxSsB938N4mKpV5Nec0tBWbpPFyZAQ',
    authDomain:'upperrestaurant.firebaseapp.com',
    databaseURL: 'https://upperrestaurant-default-rtdb.europe-west1.firebasedatabase.app'
})

//====================================================================

const bot = new TelegramBot(config.TOKEN,
    {
        polling:
            {
                interval: 300,
                autoStart: true,
                params: {
                    timeout: 10
                }
            }
    })

// text variables
let admin_id = []
let operators_chat = []
let current_chat = 0
let support_username = []

let temp_message = []
let userCity = [] // 0-NurSultan, 1-Almaty
let userCities = []
let userPoint = []
let userPoints = []
let cities_keyboard = []
let points_keyboard = []
let cities_count = []
let points_count = []
//
let userCategory = []
let userCategories = []
let category_keyboard = []
let categories_count = []
//
let userGyms = []
let gym_keyboard = []
let mother_link = 'https://t.me/ctos_nursultan'
let choosegym_text = 'Выберите спортзал, в котором занимаетесь '
//
let userProgram = []
let userProgrammesList = []
let programmes_keyboard = []
let trener_keyboard = []
let userTreners = []
let userTrener = []
const choosetrener_text = 'Выберите тренера, чтобы узнать о нем больше:'
let foodlist_count = []
//
let shop_keyboard = []
let userShopCategories = []
let chooseshopcategory_text = 'Выберите категорию продукта:'
let userShopCategory = []

let shopitems_keyboard = []
let userItemsList = []
let anothershopcategory_text = '◀️ Другие категории'
let chooseitem_text = 'Выберите товар:'
let userItem = []
let userItemPrice = []

let waitlist = []

/////////////////////////////////////////////////////////////////
let anotherpoint_multiple = []
let club_name_fb = []

let card_instructions_text = `<b>Почти готово!</b>

❓ Как работает виртуальный абонемент?
После оплаты менеджер выдаст Вам виртуальный абонемент. Вы получите уведомление "Абонемент активирован ✅" с инструкцией к использованию. 
Чтобы начать тренировку в зале, вам нужно либо отсканировать QR-код на ресепшне, либо нажать на кнопку "Начать тренировку" в нижней части экрана. Покажите экран сотруднику клуба и вперед!

💰 Как оплатить абонемент? 
Мы принимаем оплату через KASPI или стандартный перевод на карту. Ниже мы отправили реквизиты, куда необходимо отправить сумму стоимости абонемента. В описании к переводу укажите свое ФИО, которое указали ранее здесь. Так мы поймем, от кого пришли деньги.

После оплаты нажмите на кнопку <b>"☑️ Я оплатил"</b>. Наш менеджер проверит платеж и активирует ваш абонемент.`
/////////////////////////////////////////////////////
let cash_instructions_text = `<b>Почти готово!</b>

❓ Как работает виртуальный абонемент?
После оплаты менеджер выдаст Вам виртуальный абонемент. Вы получите уведомление "Абонемент активирован ✅" с инструкцией к использованию. 
Чтобы начать тренировку в зале, вам нужно либо отсканировать QR-код на ресепшне, либо нажать на кнопку "Начать тренировку" в нижней части экрана. Покажите экран сотруднику клуба и вперед!

💰 Как оплатить наличными? 
Подойдите к сотруднику клуба на ресепшне и скажите, что хотите заплатить безналичными. Покажите ему это сообщение и нажмите на кнопку <b>"☑️ Я оплатил"</b>. Совершите оплату наличными и в течение нескольких секунд сотрудник активирует ваш абонемент. `
const choosepoint_text = 'Выберите заведение, в котором хотите сделать заказ'
const backtoprogramme_text = ['◀️ Назад', 'backtoprogramme_cb']
const backtofillinginfo_text = ['◀️ Назад', 'backtofilling_cb']
const backtochoosepaingmethod_text = ['◀️ Назад', 'backtopme_cb']
const ihavepaid_text = ['☑️ Я оплатил', 'ivepaid_cb']
const accepttraining_text = ['☑️ Подтвердить', 'accpwarng_cb']
const refusetraining_text = ['Назад', 'rfswarng_cb']
const backtotreners_text = ['◀️ Назад к списку', 'backtotreners_cb']
const buyitem_text = ['🟢 Купить этот товар', 'buyitem_clbck']
const backtoitemslist_text = ['◀️ Назад', 'bcktoitemslst_cb']
const dontuseskidka_text = ['Нет, спасибо', 'dontuseskidka_cb']
const useskidka_text = ['Да, хочу!', 'useskidka_cb']
const igotmyitem_text = ['✅ Товар получен','igtmtm_cb']
const youchosepoint_text = '🛒 Заказать здесь'
const anotherpoint_text = '◀️ Выбрать другое заведение'
const backtomain_text = '◀️ Назад'
const anothercategory_text = '◀️ Выбрать другой тип'
let hellomessage_text = `Привет! Я бот Вашего фитнес-клуба. Со мной Вы можете узнать информацию о клубе и программах занятий, а также купить абонемент`
const youchosecafe_text = 'Вы выбрали кофейню Coffee BOOM, которая находится по адресу: '
const sendlocation = '📍 Отметить на карте'
const choosecategory_text = '<b>Выберите тип тренировки, на которую хотите записаться:</b>'
const chooseprogramme_text = '<b>Выберите программу тренировок:</b>'
const addto_basket_text = '✅ Добавить в корзину'
const changefoodamount_basket_text = '✏️ Изменить количество'
const addto_basket_text2 = 'Готово'
const addto_basket_text3 = 'Готово.'
const dont_addto_basket_text2 = '🗑 Удалить'
const anotherprogram_text = '◀️ Назад к другим программам'
const anotherfood_text2 = '◀️ Назад к списку'
const fillabonement_text = 'Оформить абонемент ▶️'
const chooseamountoffood_text = 'Введите нужное количество: '
const editbasket_text = '✏️ Редактировать корзину'
const paybasket_text = '✅ Сделать заказ'
const youwanttochangepoint_text = 'Вы точно хотите сделать предзаказ в другом заведении? При смене заведения придется выбирать блюда снова'
const query_deletethismessage = 'Нет, не хочу'
const choosefoodtoedit_text = 'Выберите номер блюда, которое нужно отредактировать:'
const delete_basketfood = '🗑  Удалить'
const basketisempty_text = 'Теперь корзина пустая. Давай наполним ее 😏'
const mybasket_text = '🛒 Моя корзина'
const myabonement_status = '🧾 Статус абонемента'
const choosetime_text = 'Через сколько минут Вы хотите получить заказ? (мин. 15 мин)'
const chooseanothertime_text = '⏳ Выбрать другое время'
const paybutton_text = '💳 Оплатить'
const location_text = '📍 Где мы находимся?'
const phone_text = '📞 Позвонить нам'
const didyougetorder_text = 'Вы точно получили свой заказ? Данные о заказе могут не сохраниться'
const yesigotorder_text = 'Да, заказ получен'
const noigotorder_text = 'Я еще не забрал заказ'
const almostthere_text = '🤗 Почти готово! Осталось только указать свой номер и ФИО'
const dataiscorrect_text = '✔️ Продолжить'
const almostthere2_text = 'Готово! Теперь нажми "'+ dataiscorrect_text +'"'
const order_status_button = '🚴‍♂️ Статус заказа'
const coins_text = '💰 Мой баланс'
const start_training_text = '⏱ Начать'
const add_email = '🔗 Добавить email'
const dont_add_email = 'Нет, спасибо'
const spendmycoins = 'Да, хочу'
const dontspendmycoins = 'Нет'
const gotomain_text = '🏠 Главное меню'
const declineorder_button = '❌ Отменить заказ'
let help_phone = []
const didntaddemail_text = '😕 Жаль, что вы не хотите указать свой email. Это еще одна возможность быть в курсе акций и уникальных предложений'
const emailalreadyadded_text = 'Спасибо за то, что выбираете нас! Вы можете сделать заказ еще один заказ: '
const badfeedback_text = '🙁 Нам жаль, что Вы недовольны доставкой. Скажите, как мы можем это исправить?'
const goodfeedback_text = '👍 Отлично! Мы рады, что вам все понравилось'
const dopblank_text = `Выберите способ оплаты. 
❗️ Чтобы оплатить наличными нужно в момент оплаты находиться в клубе. В противном случае ваш запрос будет отклонен`
const no_sdacha_text = 'Без сдачи 👍'
const no_howtocome_text = 'Не указывать'

const changeamountof_persons = 'Изменить количество персон'
const changepaying_method = 'Изменить способ оплаты'
const changedeliver_date = 'Изменить дату доставки'
const dataiscorrect2_text = 'Информация введена верно'

const leavecomment = '✏️ Написать отзыв'
const dontleavecomment = 'Завершить заказ'
/////////////////////////////////////////////////////////////////
const openkeyboard_pic = 'https://storage.googleapis.com/upperrestaurant.appspot.com/Fitness/Force/howtoopen_keyboard.jpg'
const sticker_hello = ['CAACAgIAAxkBAAMGYM3C1lBqxud-dg-iowVRkGW414MAAoMBAAIlA1IPWNNtHfsPGS0fBA', 'CAACAgIAAxkBAAIDqWDPepkl_U4La4z9-HJyBBHW-F3NAAKAAQACJQNSD7tHz-822-uaHwQ', 'CAACAgIAAxkBAAIDqmDPer1wMJFpjCOvjVn2mw9Va9ADAAKWAQACJQNSD1GYpaVpXb4FHwQ', 'CAACAgIAAxkBAAIDq2DPesqIO4cmZW7tzYiXN1ig0YSHAAKaAQACJQNSD6tgF3kuPi0sHwQ']
const sticker_success = 'CAACAgIAAxkBAAIG2mDQ-q0bypXtUaXFQsyObqaRI94tAAKHAQACJQNSD-j7MBUjpIIaHwQ'
const sticker_baddeliver = 'CAACAgIAAxkBAAIOamDD28hX7Watn4Rp6qHAHzXyJJNSAAL2WAACns4LAAFuAwYAAZJBuukfBA'
const sticker_gooddeliver = 'CAACAgIAAxkBAAIOa2DD3FBUep_gdhzbMSkCtAd_SxY4AALuWAACns4LAAGLlC_BC-4ctR8E'

/////////////////////////////////////////////////////////////////
let basket = [] //корзина (массив массивов)
let decrease_foodcount = '-'
let increase_foodcount = '+'
let decrease_foodcount2 = '.-.'
let increase_foodcount2 = '.+.'
let temp_foodamount = []
//let food_categories = [['☕️ Кофе', 0, 'coffee'], ['🍦 Мороженое', 0, 'icecream'], ['🍣 Суши', 0, 'sushi'], ['🍰 Десерты', 0, 'deserts'], ['🍔 Фаст-фуд', 0, 'fastfood'], ['Остальное', 0, 'other']]
let food_categories = []
let temp_program_types = [] //
let myprogram_type = []
let temp_food_text = [] //
let temp_backet_food = [] //
let finalbasket = [] //
let finalprice = [] //
let finaltime_deelay = ''
let finaltime = new Date()

//food_categories[current_chat] = [['☕️ Кофе', 0, 'coffee'], ['🍦 Мороженое', 0, 'icecream'], ['🍣 Суши', 0, 'sushi'], ['🍰 Десерты', 0, 'deserts'], ['🍔 Фаст-фуд', 0, 'fastfood'], ['Остальное', 0, 'other']]
//basket[current_chat] = []

///////////Настройки для системы лояльности///////////
let cashback = []
let max_cashback = []
let min_cashback = []
let min_price = []
let max_pay_percentage = 0
let min_pay_percentage = 0
let percent_foremail = 0
let skidka = [] //[current_chat]

///////////Настройки для рассылки///////////
let cheap_max = 0
let group_buys_amount = 0
let reach_min = 0

///////////////Данные о пользователе//////////////////
let user_phone = []
let user_email = []
let user_adress = []
let user_name = []
let user_username = []
//let user_lastbill = []
let user_id = []
let average_price = []
let average_purchases = []
let user_coins = []
let added_coins = []
let favourite_program = []
let abonements_bought = []
let userstatus = []
let order_name = []
let order_date = []
let abonement_status = []

let user_payingmethod = []
let user_payingmethods = [['Безналичные','payingtocard_callback'], ['Наличные', 'payingcash_callback']]
let user_timescame = []

/* user_phone[current_chat] = ''
user_email[current_chat] = ''
user_adress[current_chat] = ''
user_name[current_chat] = ''
user_username[current_chat] = 'unknown'
user_id[current_chat] = 0
average_price[current_chat] = 0
average_purchases[current_chat] = 0
user_coins[current_chat] = 0
added_coins[current_chat] = 0
favourite_food[current_chat] = 'unknown'
alltime_purchases_amount[current_chat] = 0
userstatus[current_chat] = 'unknown'
order_name[current_chat] = ''
order_date[current_chat] = ''
order_status[current_chat] = 'unknown'
skidka[current_chat] = 0 */

/* finalprice[current_chat] = 0
finalbasket[current_chat] = ''
temp_backet_food[current_chat] = 0
temp_food_text[current_chat] = ''
temp_food_price[current_chat] = 0
temp_foodamount[current_chat] = 1 */

let abonement_statuses_text = ['В обработке ⏳', '❄️ Заморожен', '✅ Активен', '❌ Отклонен']
let feedback_options = ['🤩 - Отлично', '😌 - Хорошо', '😒 - Плохо']
let answered_feedback = []
let isAnswered_feedback = []
///////////////////////////////////////////////////////

//////////////////QUERY USER DATA//////////////////////
const changename_text = 'Изменить имя'
const changephone_text = 'Изменить номер'
const changeadress_text = 'Изменить адрес'
let isMakingChanges = []
let isMakingChanges_2 = []
let isMakingChanges_3 = []
///////////////////////////////////////////////////////

let delivery_min_price = 0
let delivery_price = 0
let point_location = []
let point_adress = []
let morning_time = []
let evening_time = []
let card_data = []
const abonementrequest_sended = '⏳ Аккаунт создан! В скором времени это увидит наш менеджер и активирует его. Обычно это занимает не более суток.'

var userlocation = []
var nearest_place = [] //номер ближайшего заведения(в массиве)
var min_distance = []

//////////////////DATA FOR DELIVERS//////////////////////
let abonement_bill_topic_names = ['🎉 Новый заказ!', '✅ Абонемент создан ', '❌ Заказ отклонен']
let accept_order_callback = 'acc_n'
let refuse_order_callback = 'ref_n'
let isdelivered_callback = 'del_c'
let choosetype_callback = 'chstpe_'
let abonements_bill = ''
let abonements_bill_topic = ''
let abonemets_bill_client_info = ''
let abonements_bill_order_info = ''
let deliver_bill_finalprice = 0
let deliver_bill_order_details = ''
let accepted_order_name = ''
let deliver_bill_help_info = ''
///////////////////////////////////////////////////////

////////////////////MESSAGES_COUNTER////////////////////
let add_info_msg = []
let buttons_message = []
let messages_todelete = []
let messages_texts = []
///////////////////////////////////////////////////////
let types_keyboard = []
let unregistered_keyboard = []
unregistered_keyboard[0] = [
    [{
        text: mybasket_text
    }],
    [{
        text: paybasket_text
    }],
    [{
        text: location_text
    },{
        text: phone_text
    }]
]
unregistered_keyboard[1] = [
    [{
        text: start_training_text
    },{
        text: myabonement_status
    }],
    [{
        text: location_text
    },{
        text: phone_text
    }]
]
unregistered_keyboard[2] = [
    [{
        text: order_status_button
    },{
        text: myabonement_status
    }],
    [{
        text: location_text
    },{
        text: phone_text
    }]
]

unregistered_keyboard[3] = [
    [{
        text: myabonement_status
    }],
    [{
        text: location_text
    },{
        text: phone_text
    }]
]

let registered_keyboard = []
registered_keyboard[0] = [
    [{
        text: start_training_text
    }],
    [{
        text: gotomain_text
    }],
    [{
        text: location_text
    },{
        text: phone_text
    }]
]

 //console.log(new Date(1630346400000) + '   |   ' + new Date(1624205621683))
function StartCheckingOrder(chat){
    let order_data = fb.database().ref(order_name[chat] + '/abonement/abonement_status')
    order_data.on('value', (result) => 
    {
        abonement_status[chat] = result.val()
        console.log('ORDER STATUS: ' + result.val() + ', name: "' + order_name[chat] + '"')

        if (abonement_status[chat] === abonement_statuses_text[3]){
            bot.sendMessage(chat, 'Нам жаль, но мы были вынуждены отклонить Ваш заказ. Если Вы уверены, что произошла ошибка, свяжитесь с нами по телефону: ' + help_phone[chat], {
                reply_markup:{
                    keyboard:[
                        [{
                            text: '🔃 На главную',
                        }]
                    ],
                    resize_keyboard: true
                }
            })
        }
        
        if (abonement_status[chat] === abonement_statuses_text[2]){
            //мы получили заказ. На клаве вместо статус заказа поставить "заказ получен". Также написать сообщение мол ваш заказ был успешно доставлен. Нажмите на кнопку "готово", чтобы получить баллы или заказать еще раз. 
            //После нажатия на кнопку готово, мы очищаем все данные связывающие аккаунт с чеком доставки, чтобы если в чате доставщиков поменяют статус, клиент не получал опевещений. 
            
            const temp_text = `✅ Ваш абонемент активирован!
Для того, чтобы начать тренировку, нажмите кнопку <b>` + start_training_text + `. </b>
Удачной тренировки!`
            userstatus[chat] = 'registered'
            bot.sendSticker(chat, sticker_success)
            .then(() => {
                bot.sendMessage(chat, temp_text, {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [{
                                text: start_training_text,
                                callback_data: accepttraining_text[1]
                            },{
                                text: refusetraining_text[0],
                                callback_data: refusetraining_text[1]
                            }]
                        ],
                    }
                })
            })

        }
    }
)
}

function StartTraining(chatId, message_id){
    let userdata = fb.database().ref('Fitness/'+club_name_fb[chatId]+'/clients/' + chatId)
    userdata.get().then((result) => 
    {
        let is_refused = false

        let date = new Date()
        let utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
        let timeOfffset = 6 //Astana GMT +6
        let time_now = new Date(utcTime + (3600000 * timeOfffset))
        let end_time = new Date(result.val().abonement.end_date)

        if (result.val().abonement.abonement_status !== abonement_statuses_text[2] && is_refused === false){
            is_refused = true
            bot.sendMessage(chatId, 'Статус вашего абонемента: ' + result.val().abonement.abonement_status + '. С этим статусом нельзя начать тренировку 🙁', {
                reply_markup:{
                    inline_keyboard:[
                        [{
                            text: refusetraining_text[0],
                            callback_data: refusetraining_text[1]
                        }]
                    ]
                }
            })
        }

        console.log(time_now + ' \\ ' + end_time)
        if (time_now > end_time && is_refused === false){
            console.log('TRUE!')
            is_refused = true

            let minutes = end_time.getMinutes()
            if (minutes < 10) minutes = '0' + minutes
            let hours = end_time.getHours()
            if (hours < 10) hours = '0' + hours
            let visible_date_end = /* new Intl.DateTimeFormat('ru-RU', options).format(end_time) + ' ' +  */hours + ':' + minutes + ', ' + end_time.getDate() + '.' + (end_time.getMonth() + 1) + '.' + end_time.getFullYear()

            bot.sendMessage(chatId, 'Срок действия вашего абонемента истек. Он был годен до: ' + visible_date_end + '. Пожалуйста, оформите новый абонемент или продлите существующий', {
                reply_markup:{
                    inline_keyboard:[
                        [{
                            text: refusetraining_text[0],
                            callback_data: refusetraining_text[1]
                        }]
                    ]
                }
            })
        }

        if (result.val().abonement.visits !== 'unlimited' && result.val().abonement.visits < 1 && is_refused === false){
            is_refused = true
            bot.sendMessage(chatId, 'Вы уже посетили максимально возможное число тренировок в этом месяце. Пожалуйста, оформите новый абонемент или продлите существующий', {
                reply_markup:{
                    inline_keyboard:[
                        [{
                            text: refusetraining_text[0],
                            callback_data: refusetraining_text[1]
                        }]
                    ]
                }
            })
        }

        if (result.val().abonement.time !== 'unlimited' && is_refused === false){
            let restriction_time_max = time_now
            let restriction_time_min = time_now
            if (result.val().abonement.time === 'evening'){
                restriction_time_min.setHours(evening_time[chatId][0][0], evening_time[chatId][0][1])
                restriction_time_max.setHours(evening_time[chatId][1][0], evening_time[chatId][1][1])
                if (time_now < restriction_time_min || time_now > restriction_time_max){
                    is_refused = true
                    bot.sendMessage(chatId, '🙊 Упс, вы пришли не вовремя... Ваш абонемент активен с ' + evening_time[chatId][0][0] + ':' + evening_time[chatId][0][1] + ' по ' +  evening_time[chatId][1][0] + ':' + evening_time[chatId][1][1], {
                        reply_markup:{
                            inline_keyboard:[
                                [{
                                    text: refusetraining_text[0],
                                    callback_data: refusetraining_text[1]
                                }]
                            ]
                        }
                    })
                }
            }
            if (result.val().abonement.time === 'morning'){
                restriction_time_min.setHours(morning_time[chatId][0][0], morning_time[chatId][0][1])
                restriction_time_max.setHours(morning_time[chatId][1][0], morning_time[chatId][1][1])
                if (time_now < restriction_time_min || time_now > restriction_time_max){
                    is_refused = true
                    bot.sendMessage(chatId, '🙊 Упс, вы пришли не вовремя... Ваш абонемент активен с ' + morning_time[chatId][0][0] + ':' + morning_time[chatId][0][1] + ' по ' +  morning_time[chatId][1][0] + ':' + morning_time[chatId][1][1], {
                        reply_markup:{
                            inline_keyboard:[
                                [{
                                    text: refusetraining_text[0],
                                    callback_data: refusetraining_text[1]
                                }]
                            ]
                        }
                    })
                }
            }
        }
        
        if (is_refused === false){
            let updates = {}
            if (result.val().abonement.visits !== 'unlimited'){          
                updates['Fitness/'+club_name_fb[chatId]+'/clients/'+ chatId + '/abonement/visits'] = result.val().abonement.visits - 1
                //updates['Basement/clients/CLIENTID/EGO_CHECK'] = order_update
            }
            updates['Fitness/'+club_name_fb[chatId]+'/clients/'+ chatId + '/coins'] = result.val().coins + (result.val().abonement.price * cashback[chatId])
            bot.sendMessage(chatId, 'Тренировка началась! Больше делать ничего не нужно: когда придете снова, просто отсканируйте QR-код на ресепшне или нажмите на кнопку ' + start_training_text + '. Удачной тренировки!')
            .then(() => {
                fb.database().ref().update(updates)
            })
        }
        
    })
}

function CheckUser(userid, username, chatId, message_id){
    
    console.log('checking user: ' + userid + ' ' + username)
    let userdata = fb.database().ref('Fitness/'+club_name_fb[chatId]+'/clients/' + userid)
    userdata.get().then((result) => 
    {
        console.log('Пользователь зарегистрирован. ID: ' + userid + ' ' + result.val().id)
        //user_adress[chatId] = result.val().adress
        //user_email[chatId] = result.val().email
        user_name[chatId] = result.val().name
        user_username[chatId] = result.val().username
        user_phone[chatId] = result.val().phone
        user_id[chatId] = result.val().id
        //alltime_purchases_amount[chatId] = result.val().alltime_purchases_amount[chatId]
        user_coins[chatId] = result.val().coins

        userstatus[chatId] = 'registered'

        bot.sendMessage(chatId, almostthere_text, {
            reply_markup:{
                inline_keyboard:[
                    [{
                        text: backtoprogramme_text[0],
                        callback_data: backtoprogramme_text[1]
                    }]
                    [{
                        text: 'Имя: ' + user_name[chatId],
                        callback_data: changename_text
                    },
                    {
                        text: 'Телефон: ' + user_phone[chatId],
                        callback_data: changephone_text
                    }],
                    [{
                        text: dataiscorrect_text,
                        callback_data: dataiscorrect_text
                    }]
                ]
            }
        }).then(res => {
            add_info_msg[chatId] = message_id + 2
            messages_todelete[chatId][2] = res.message_id
            console.log('savedmessage = ' + add_info_msg[chatId] + ', ' + messages_todelete[chat.id][2])
        }).catch(err => {console.log(err)})

        //StartAnalitycs()

    }).catch(error => {
        console.log('Пользователь не зарегистрирован. ' + error)
        userstatus[chatId] = 'unregistered'
        /*fb.database().ref('Basement/clients/').set({
            userid : {
                adress: 'unknown'
            }
            username: name,
            email: email,
            profile_picture : imageUrl
          });*/
        user_name[chatId] = username
          bot.sendMessage(chatId, almostthere_text, {
            reply_markup:{
                inline_keyboard:[
                    [{
                        text: backtoprogramme_text[0],
                        callback_data: backtoprogramme_text[1]
                    }],
                    [{
                        text: 'Имя: ' + user_name[chatId],
                        callback_data: changename_text
                    },
                    {
                        text: 'Телефон: ' /* + user_phone[chatId] */,
                        callback_data: changephone_text
                    }]
                ]
            }
        }).then(res => {
            add_info_msg[chatId] = message_id + 2 
            messages_todelete[chatId][2] = res.message_id
            console.log('savedmessage = ' + add_info_msg[chatId] + ', ' + message_id)
        }).catch(err => {console.log(err)})

        //StartAnalitycs()
    })
}

function StartAnalitycs(){
    
    //узнаем любимую еду пользователя
    for (let i = 0; i < basket[current_chat].length; i++){
        if (basket[current_chat][i][3] === 0){
            //тут идут завтраки, а значит попадает в категорию "основное"
            food_categories[current_chat][5][1] = food_categories[current_chat][5][1] + basket[current_chat][i][1]
            console.log('Добавляем в категорию "основное" очки. Основного теперь: ' + food_categories[current_chat][5][1])
        }
        if (basket[current_chat][i][3] === 1){
            //тут идут десерты, значит попадает в "десерты"
            food_categories[current_chat][3][1] = food_categories[current_chat][3][1] + basket[current_chat][i][1]
            console.log('Добавляем в категорию "десерты" очки. Десертов теперь: ' + food_categories[current_chat][3][1])
        }
        if (i === basket[current_chat].length - 1){
            //все распределили, теперь узнаем какую еду любим
            console.log('Баллы определили. Теперь выбираем любимую еду')
            let favourite_food_number = []
            favourite_food_number[current_chat] = 0
            for (let i = 0; i < food_categories[current_chat].length; i++){
                if (i <= food_categories[current_chat].length - 1){
                    console.log('Сравниваем категорию #' + i + ' и #' + (i+1))
                    /* if (food_categories[current_chat][i][1] >= food_categories[current_chat][i+1][1]){
                        favourite_food[current_chat]= food_categories[current_chat][i][0]
                        console.log(i +' 1 Категория ' + food_categories[current_chat][i][0] + ' больше, чем категория ' + food_categories[current_chat][i+1][0])
                    }
                    else if (food_categories[current_chat][i][1] < food_categories[current_chat][i+1][1]){
                        favourite_food[current_chat]= food_categories[current_chat][i+1][0]
                        console.log(i + ' 2 Категория ' + food_categories[current_chat][i+1][0] + ' больше, чем категория ' + food_categories[current_chat][i][0])
                    }*/
                    if (food_categories[current_chat][i][1] >= favourite_food_number[current_chat]){
                        favourite_program[current_chat]= food_categories[current_chat][i][2]
                        favourite_food_number[current_chat] = food_categories[current_chat][i][1]
                        console.log(i +' 1 Категория ' + food_categories[current_chat][i][0] + ' больше')
                    }
                    if (i === food_categories[current_chat].length - 1){
                        console.log('WINNER: ' + favourite_program[current_chat])
                    } 

                }
            }
        }
    }

    //узаем средний чек пользователя
    if (average_price[current_chat] === 0){
        console.log('1 finalprice is ' + finalprice[current_chat])
        average_price[current_chat] = finalprice[current_chat]
    }
    if (average_price[current_chat] !== 0){
        console.log('2 finalprice is ' + finalprice[current_chat])
        average_price[current_chat] = (average_price[current_chat] + finalprice[current_chat]) / 2
        console.log('2 average price is ' + average_price[current_chat])
    }

    //узнаем среднее число заказываемых за раз блюд
    if (average_purchases[current_chat] === 0){
        for (let i = 0; i < basket[current_chat].length; i++){
            average_purchases[current_chat] += basket[current_chat][i][1]
            if (i === basket[current_chat] - 1){
                console.log('1 purchases amount = ' + average_purchases[current_chat])
            }
        }
    }
    if (average_purchases[current_chat] !== 0){
        let temp_purchases = 0
        for (let i = 0; i < basket[current_chat].length; i++){
            temp_purchases += basket[current_chat][i][1]
            if (i === basket[current_chat] - 1){
                console.log('2 old purchases amount = ' + average_purchases[current_chat])
                console.log('2 new purchases amount = ' + temp_purchases)
                average_purchases[current_chat] = (average_purchases[current_chat] + temp_purchases) / 2
                console.log('2 final purchases amount = ' + average_purchases[current_chat])
            }
        }
    }
}

function AddMailingData(){

    if (finalprice[current_chat] >= reach_min){
        console.log('!? reach_min: ' + reach_min)
        let userdata = fb.database().ref('Basement/mailing/categories/reach')
        userdata.get().then((result) => {
            let count = result.val().user_amount
            count++
            let user_ids_string = ''
            user_ids_string = result.val().user_ids
            let user_ids = user_ids_string.split(',')
            for (let i = 0; i < user_ids.length; i++){
                if (user_ids[i] === current_chat.toString()){
                    break
                }
                if (i === user_ids.length - 1 && user_ids[i] !== current_chat.toString()){
                    let updates = {}
                    updates['Basement/mailing/categories/reach/user_amount'] = count

                    if (user_ids_string !== ''){
                        user_ids_string += ',' + current_chat
                    }

                    else if (user_ids_string === ''){
                        user_ids_string += current_chat
                    }

                    updates['Basement/mailing/categories/reach/user_ids'] = user_ids_string

                    fb.database().ref().update(updates)
                }
            }
           
        })
    }

    if (finalprice[current_chat] <= cheap_max){
        let userdata = fb.database().ref('Basement/mailing/categories/cheap')
        userdata.get().then((result) => {
            let count = result.val().user_amount
            count++
            let user_ids_string = ''
            user_ids_string = result.val().user_ids
            let user_ids = user_ids_string.split(',')
            for (let i = 0; i < user_ids.length; i++){
                if (user_ids[i] === current_chat.toString()){
                    break
                }
                if (i === user_ids.length - 1 && user_ids[i] !== current_chat.toString()){
                    let updates = {}
                    updates['Basement/mailing/categories/cheap/user_amount'] = count

                    if (user_ids_string !== ''){
                        user_ids_string += ',' + current_chat
                    }

                    else if (user_ids_string === ''){
                        user_ids_string += current_chat
                    }
                    
                    updates['Basement/mailing/categories/cheap/user_ids'] = user_ids_string
                    
                    fb.database().ref().update(updates)
                }
            }
           
        })
    }

    for (let i = 0; i < food_categories[current_chat].length; i++){
        if (favourite_program[current_chat]=== food_categories[current_chat][i][2]){
            console.log('!!! Basement/mailing/categories/' + food_categories[current_chat][i][2])
            let userdata = fb.database().ref('Basement/mailing/categories/' + food_categories[current_chat][i][2])
            userdata.get().then((result) => 
            {
                let count = result.val().user_amount
                count++
                let user_ids_string = ''
                user_ids_string = result.val().user_ids
                let user_ids = user_ids_string.split(',')
                
                for (let i = 0; i < user_ids.length; i++){
                    console.log('category user ids list: ' + user_ids[i] + ' ' + current_chat)
                    if (user_ids[i] === current_chat.toString()){
                        console.log('found user_id. BREAK! ' + user_ids[i] + ' ' + current_chat)
                        break
                    }
                    if (i === user_ids.length - 1 && user_ids[i] !== current_chat.toString()){
                        console.log('users length = ' + user_ids.length + ', i =' + i)
                        let updates = {}
                        updates['Basement/mailing/categories/' + favourite_program[current_chat]+ '/user_amount'] = count

                        if (user_ids_string !== ''){
                            user_ids_string += ',' + current_chat
                        }
    
                        else if (user_ids_string === ''){
                            user_ids_string += current_chat
                        }

                        updates['Basement/mailing/categories/' + favourite_program[current_chat]+ '/user_ids'] = user_ids_string
                        
                        fb.database().ref().update(updates)
                    }
                }
            })

            
            
        }
    }

        let userdata = fb.database().ref('Basement/mailing/all')
        userdata.get().then((result) => {
            let count = result.val().user_amount
            count++
            let user_ids_string = ''
            user_ids_string = result.val().user_ids
            let user_ids = user_ids_string.split(',')
            for (let i = 0; i < user_ids.length; i++){
                console.log('all, user ids list: ' + user_ids[i] + ' ' + current_chat)
                if (user_ids[i] === current_chat.toString()){
                    console.log('found user_id. BREAK! "' + user_ids[i] + '" "' + current_chat + '"')
                    break
                }
                if (i === user_ids.length - 1 && user_ids[i] !== current_chat.toString()){
                    console.log('users length = "' + user_ids.length + '", i = "' + i + '". (user_ids[i] !== current_chat): ' + user_ids[i] + ' !== ' + current_chat)
                    let updates = {}
                    updates['Basement/mailing/all/user_amount'] = count

                    if (user_ids_string !== ''){
                        user_ids_string += ',' + current_chat
                    }

                    else if (user_ids_string === ''){
                        user_ids_string += current_chat
                    }

                    updates['Basement/mailing/all/user_ids'] = user_ids_string

                    fb.database().ref().update(updates)
                }
            }
           
        })
}

bot.on('polling_error', console.log);

bot.on('poll_answer', poll_answer => {
    answered_feedback[poll_answer.user.id] = poll_answer.option_ids
    console.log('^^ ' + isAnswered_feedback[poll_answer.user.id])
    if (isAnswered_feedback[poll_answer.user.id] === 0){
        console.log('answered!')
        isAnswered_feedback[poll_answer.user.id] = 1
        if (answered_feedback[poll_answer.user.id] > 1){
            bot.sendSticker(poll_answer.user.id, sticker_baddeliver).then(() => {
                bot.sendMessage(poll_answer.user.id, badfeedback_text, {
                    reply_markup:{
                        inline_keyboard:[
                            [{
                                text: leavecomment,
                                callback_data: leavecomment
                            }],
                            [{
                                text: dontleavecomment,
                                callback_data: dontleavecomment
                            }]
                        ]
                    }
                })
            })
        }
        if (answered_feedback[poll_answer.user.id] <= 1){
            bot.sendSticker(poll_answer.user.id, sticker_gooddeliver).then(() => {
                bot.sendMessage(poll_answer.user.id, goodfeedback_text, {
                    reply_markup:{
                        inline_keyboard:[
                            [{
                                text: leavecomment,
                                callback_data: leavecomment
                            }],
                            [{
                                text: dontleavecomment,
                                callback_data: dontleavecomment
                            }]
                        ]
                    }
                })
            })
        }
        
        
    }
})

bot.on('pre_checkout_query', pre_checkout_query => {
    bot.answerPreCheckoutQuery( pre_checkout_query.id, true, {
        error_message: 'При оплате произошла ошибка. Попробуйте повторить действие позже'
    })

})

bot.on('location', (msg) => {

    if (userCity[msg.chat.id] !== '' && userPoint[msg.chat.id] === ''){
        
        userlocation[msg.chat.id][0] = msg.location.latitude
        userlocation[msg.chat.id][1] = msg.location.longitude
        let point1 = []
        point1[msg.chat.id] = new GeoPoint(userlocation[msg.chat.id][0], userlocation[msg.chat.id][1], false)    
        let locations_arr = []
        locations_arr[msg.chat.id] = []

        let points_data = fb.database().ref('Basement/cities/' + userCity[msg.chat.id] + '/points/')
        points_data.get().then((snapshot) => {
            let array_len = [] 
            array_len[msg.chat.id] = Object.keys(snapshot.val())
            for (let i = 0; i < array_len[msg.chat.id].length; i++){
                let info = fb.database().ref('Basement/cities/' + userCity[msg.chat.id] + '/points/' + array_len[msg.chat.id][i] + '/is_waiter')
                info.get().then((snapshot2) => {
                    if (snapshot2.val() === true){
                        let info1 = fb.database().ref('Basement/cities/' + userCity[msg.chat.id] + '/points/' + array_len[msg.chat.id][i] + '/other_info/')
                        info1.get().then((snapshot1) => {
                            let newelement = [array_len[msg.chat.id][i], snapshot1.val().adress_text, snapshot1.val().latitude, snapshot1.val().longitude]
                            locations_arr[msg.chat.id].push(newelement)
                        })
                    }

                    if (snapshot2.val() === false){
                        if (i === array_len[msg.chat.id].length){

                        }
                    }
                })
            }
        })
    }
    /* if (userCity[current_chat] === 0){
        for (let i = 0; i < NurSultan_adresses.length; i++) {
            let point2 = new GeoPoint(NurSultan_geo1[i], NurSultan_geo2[i], false)
            let distance = point1.distanceTo(point2, true)//output in kilometers
            //console.log('дистанция до адреса: ' + NurSultan_adresses[i] + ' = ' + distance)
            if (distance < min_distance[current_chat]){
                min_distance[current_chat] = distance
                nearest_place[current_chat] = i
            }
            if (i === NurSultan_adresses.length - 1) {
                userPoint[current_chat] = nearest_place[current_chat]
                bot.sendLocation(msg.chat.id, NurSultan_geo1[nearest_place[current_chat]], NurSultan_geo2[nearest_place[current_chat]]).then(() => {
                    bot.sendMessage(msg.chat.id, 'Ближайшая к этой локации точка Coffee BOOM находится по адресу: ' + NurSultan_adresses[nearest_place[current_chat]], {
                        reply_markup:{
                            inline_keyboard:
                            [
                                [{
                                    text: youchosepoint_text,
                                    callback_data: youchosepoint_text
                                },
                                {
                                        text: anotherpoint_text,
                                        callback_data: anotherpoint_text
                                }]
                            ]
                        }
                    })
                })
            }
        }
    }
    else if (userCity[current_chat] === 1){
        for (let i = 0; i < Almaty_adresses.length; i++) {
            let point2 = new GeoPoint(Almaty_geo1[i], Almaty_geo2[i], false)
            let distance = point1.distanceTo(point2, true)//output in kilometers
            if (distance < min_distance[current_chat]){
                min_distance[current_chat] = distance
                nearest_place[current_chat] = i
            }
            if (i === Almaty_adresses.length - 1) {
                userPoint[current_chat] = nearest_place[current_chat]
                bot.sendLocation(msg.chat.id, Almaty_geo1[nearest_place[current_chat]], Almaty_geo2[nearest_place[current_chat]]).then(() => {
                    bot.sendMessage(msg.chat.id, 'Ближайшая к этой локации точка Coffee BOOM находится по адресу: ' + Almaty_adresses[nearest_place[current_chat]], {
                        reply_markup:{
                            inline_keyboard:
                                [
                                    [{
                                        text: youchosepoint_text,
                                        callback_data: youchosepoint_text
                                    },
                                        {
                                            text: anotherpoint_text,
                                            callback_data: anotherpoint_text
                                        }]
                                ]
                        }
                    })
                })
            }
        }
    } */
   // console.log('chat id: ' + msg.chat.id + /*'. Message_id: ' + msg.message + */'. Message_id2: ' + msg.message_id)
   /* for (let i = 0; i < 4; i++){
        if (msg.message_id - i > 0){
            if (i!== 0){
                bot.deleteMessage(msg.chat.id, msg.message_id - i)
            }
        }
   } */
})

bot.on('message', (msg) =>
{
    const chatId = msg.chat.id

    console.log(msg)

    current_chat = chatId

    if (userstatus[chatId] === 'unknown' || userstatus[chatId] === undefined && msg.text.includes('/start') === false){
        if (msg.chat.type === 'group' || msg.chat.type === 'supergroup'){
            bot.getChat(chatId).then(result => {
                if (result.description !== undefined && result.description !== null){
                    console.log('group: ' + result.description)
                    let del_userdata = []
                    del_userdata[msg.from.id] = result.description.split('/')
                    if (del_userdata[msg.from.id].length === 3 && del_userdata[msg.from.id][2] === (chatId).toString()){
                        club_name_fb[msg.from.id] = del_userdata[msg.from.id][0]
                        IdentifyUser(msg.from.id)
                    }
                }
            })
        }
        else {
            if (club_name_fb[chatId] === undefined || club_name_fb[chatId] === null){
                for (let i=0; i<100; i++){
                    bot.deleteMessage(chatId, msg.message_id - i).catch(err => {
                        //console.log(err)
                    })
                }
                IdentifyUser(chatId)
                keyboards.GymsKeyboard(gym_keyboard[chatId], userGyms[chatId], fb, bot, chatId, mother_link, choosegym_text)
            }
        }
        console.log('dont know users status, lets check it')
    }

    if (msg.text === '🔃 На главную'){
        for (let i=0; i<100; i++){
            bot.deleteMessage(chatId, msg.message_id - i).catch(err => {
                //console.log(err)
            })
        }
        bot.sendSticker(chatId, sticker_hello[Math.floor(Math.random() * sticker_hello.length)]).then(() => {
            if (userstatus[chat.id] !== 'registered'){
                IdentifyUser(chatId)
            }
            
            anotherpoint_multiple[chatId] = 2
            //keyboards.CategoriesKeyboard(category_keyboard[chatId], userCategories[chatId], categories_count[chatId], fb, bot, chatId, msg, anotherpoint_text, choosecategory_text, hellomessage_text, location_text, phone_text)
        })
    }

    if (msg.text === coins_text){
        /* bot.editMessageText(msg.text, {
            chat_id: chatId,
            message_id: msg.message_id - 1
        }).then(() => {
            bot.deleteMessage(chatId, msg.message_id).then(() => {
                bot.sendMessage(chatId, 'Ваш баланс: ' + user_coins[chatId] + ' тенге. Заказывайте больше блюд, чтобы получать больше денег на свой баланс.')
            })
        }) */

        bot.deleteMessage(chatId, msg.message_id).then(() => {
            bot.sendMessage(chatId, 'Ваш баланс: ' + user_coins[chatId] + ' тенге. Заказывайте больше блюд, чтобы получать больше денег на свой баланс.')
        })
    }

    if (msg.text === anotherpoint_text){
        finalprice[chatId] = 0
        finaltime_deelay = 0
        finalbasket[chatId] = 0
        console.log('2414124')
        if (userProgram[chatId] !== null || userProgrammesList[chatId] !== []){
            bot.deleteMessage(chatId, msg.message_id)
            bot.sendMessage(chatId, youwanttochangepoint_text, {
                reply_markup: {
                    inline_keyboard: [
                        [{
                            text: anotherpoint_text,
                            callback_data: anotherpoint_text
                        },{
                            text: query_deletethismessage,
                            callback_data: query_deletethismessage
                        }]
                    ],
                },
                remove_keyboard: true
            })
        }
        else {

        }
    }

    if (msg.text === start_training_text){
        bot.deleteMessage(chatId, msg.message_id)
        .then(()=> {
            const temp_tex = 'Подтвердите начало тренировки. Нажимая на кнопку Вы <b>подтверждаете свое присутсвие на тренировке.</b>'
            bot.sendMessage(chatId, temp_tex, {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [{
                            text: accepttraining_text[0],
                            callback_data: accepttraining_text[1]
                        },{
                            text: refusetraining_text[0],
                            callback_data: refusetraining_text[1]
                        }]
                    ],
                }
            })
        })
    }

    if (msg.text === gotomain_text){
        for (let i=0; i<100; i++){
            bot.deleteMessage(chatId, msg.message_id - i).catch(err => {
                //console.log(err)
            })
        }
        bot.sendSticker(chatId, sticker_hello[Math.floor(Math.random() * sticker_hello.length)], {
            reply_markup:{
                keyboard:registered_keyboard[0],
                resize_keyboard: true
            }
        })
        .then(() => {
            anotherpoint_multiple[chatId] = 2
            bot.sendMessage(chatId, hellomessage_text, {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: keyboards.main_menu_keyboard
                }
            })
        })
    }

    if (msg.text === myabonement_status){

        //bot.deleteMessage(chatId, msg.message_id-1)
        bot.deleteMessage(chatId, msg.message_id).then(() => {
            bot.sendMessage(chatId, 'Статус вашей заявки: ' + abonement_status[chatId])
        })
        
    }

    if (msg.text === paybasket_text){
        console.log('!!!' + (finalprice[chatId] - 1000))
        if (finalprice[chatId] - 1000 < delivery_min_price){
            bot.sendMessage(chatId, 'Минимальная сумма заказа: ' + delivery_min_price + '. Закажите что-нибудь еще 😇')
        }
        else {
            finaltime_deelay = 0
            bot.deleteMessage(chatId, msg.message_id - 1)
            bot.deleteMessage(chatId, msg.message_id).then(() => {
                let editmsg = `Ваш заказ: `
                let finalsum = 0
                for (let i = 0; i < basket[chatId].length; i++){
                                finalsum += (basket[chatId][i][2] * basket[chatId][i][1])
                                if (i === basket[chatId].length - 1){
                                    editmsg += finalsum + 'тг. +' + delivery_price + 'тг. (доставка)'
                                    console.log(finalsum + ' ' + i)
                                    finalprice[chatId] = finalsum + delivery_price
                                    for (let i = 0; i < basket[chatId].length; i++){
                                        console.log('1Блюдо: ' + basket[chatId][i][0] + '. Цена: ' + basket[chatId][i][2] + ' х ' + basket[chatId][i][1] + ' = ' + (basket[chatId][i][1] * basket[chatId][i][2]))
                                        editmsg += `
` + (i+1) + `. ` + basket[chatId][i][0] + `. Цена: ` + basket[chatId][i][2] + `тг. х ` + basket[chatId][i][1] + ` = ` + (basket[chatId][i][1] * basket[chatId][i][2]) + `тг.`
                                        if (i === basket[chatId].length - 1){
                                            finalbasket[chatId] = editmsg
                                            bot.sendMessage(chatId,  editmsg).then(() => {
                                                CheckUser(chatId, msg.chat.first_name, chatId, msg.message_id)
                                            })
                
                                        }
                                    }
                                }
                }
            })
        }
        
    }

    if (msg.text === location_text){
        bot.sendLocation(chatId, point_location[chatId][0], point_location[chatId][1]).then(() => {
            bot.sendMessage(chatId, '📍 Мы находимся по адресу: ' + point_adress[chatId])
        })
        
    }
    if (msg.text === phone_text){
        bot.sendContact(chatId, help_phone[chatId], club_name_fb)
    }

    if (isMakingChanges[chatId] !== 0  && userstatus[chatId] !== undefined){
        if (isMakingChanges[chatId] === 1){
            isMakingChanges[chatId] = 0
            user_name[chatId] = msg.text
        }

        if (isMakingChanges[chatId] === 2){
            isMakingChanges[chatId] = 0
            user_phone[chatId] = msg.text
        }

        if (isMakingChanges[chatId] === 3){
            isMakingChanges[chatId] = 0
            user_adress[chatId] = msg.text
        }

        if (isMakingChanges[chatId] === 4){
            isMakingChanges[chatId] = 0
            user_email[chatId] = msg.text
            user_coins[chatId] = user_coins[chatId] + (added_coins[chatId] * percent_foremail)
            user_coins[chatId] = Math.round(user_coins[chatId])
            //тут возвращаем пользователя на главную, но уже регистеред

            let updates = {};
            updates['Basement/clients/' + msg.chatId + '/email'] = user_email[chatId]
            updates['Basement/clients/' + msg.chatId + '/coins'] = user_coins[chatId]
            fb.database().ref().update(updates).then(() => {
                //тут отправить в главное меню
                for (let i=0; i<100; i++){
                    bot.deleteMessage(chatId, msg.message_id - i).catch(err => {
                        console.log(err)
                    })
                }
                bot.sendMessage(chatId, 'Ура! Email подтвержден. Вам было зачислено ' + (added_coins[chatId] * percent_foremail) + ' тенге. Ваш баланс: ' + user_coins[chatId] + ' тенге').then(() => {
                    IdentifyUser(chatId)
                    anotherpoint_multiple[chatId] = 2
                    keyboards.CategoriesKeyboard(category_keyboard[chatId], userCategories[chatId], fb, bot, chatId, query.message, anotherpoint_text, choosecategory_text, location_text, phone_text, userCity[chatId], userPoint[chatId], user_mode[chatId])
                })
            })
        }

        if (isMakingChanges[chatId] === 5){
            isMakingChanges[chatId] = 0
            let orderinfo = fb.database().ref(order_name[chatId]);
            orderinfo.get().then((snapshot) => 
            {
                console.log('saving poll...')
                let updates = {}
                let bill_update = {
                    adress: snapshot.val().adress,
                    client_name: snapshot.val().client_name,
                    date_ordered: snapshot.val().date_ordered,
                    client_id: snapshot.val().client_id,
                    order_info: snapshot.val().order_info,
                    phone: snapshot.val().phone,
                    price: snapshot.val().price,
                    order_status: snapshot.val().order_status,
                    deliver_name: snapshot.val().deliver_name,
                    accept_date: snapshot.val().accept_date,
                    deliver_id: snapshot.val().deliver_id,
                    message_id: snapshot.val().message_id,
                    delivered_date: snapshot.val().delivered_date,
                    feedback: feedback_options[answered_feedback[chatId]],
                    feedback_message: msg.text,
                    bill_text: snapshot.val().bill_text,
                    user_personsamount: snapshot.val().user_personsamount,
                    user_payingmethod: snapshot.val().user_payingmethod,
                    user_deliverdate: snapshot.val().user_deliverdate,
                    user_sdachainfo: snapshot.val().user_sdachainfo,
                    user_howtocome: snapshot.val().user_howtocome
                }
                updates[order_name[chatId]] = bill_update
                updates['Basement/clients/' + chatId + '/coins'] = user_coins[chatId]
                fb.database().ref().update(updates).then(() => {
                    for (let i=0; i<100; i++){
                        bot.deleteMessage(chatId, msg.message_id - i).catch(err => {
                            console.log(err)
                        })
                    }
                    bot.sendSticker(chatId, sticker_hello[Math.floor(Math.random() * sticker_hello.length)]).then(() => {
                        IdentifyUser(chatId)
                        anotherpoint_multiple[chatId] = 2
                        keyboards.CategoriesKeyboard(category_keyboard[chatId], userCategories[chatId], fb, bot, chatId, query.message, anotherpoint_text, choosecategory_text, location_text, phone_text, userCity[chatId], userPoint[chatId], user_mode[chatId])
                    })

                    let temp_bill = snapshot.val().bill_text + `
<b>💬 Отзыв о доставке:</b>                    
├ Оценка клиента: ` + feedback_options[answered_feedback[chatId]] + `
└ Сообщение: ` + msg.text
                    bot.editMessageText(temp_bill, {
                        parse_mode: 'HTML',
                        chat_id: operators_chat[chatId],
                        message_id: snapshot.val().message_id
                    })
                }).catch(error => {
                    console.log(error)
                })
            }) 
        }

        if (/* user_adress[chatId] !== '' &&  */user_phone[chatId] !== '' && user_name[chatId] !== '' && isMakingChanges[chatId] !== 4 && isMakingChanges[chatId] !== 5){
            //order_status = order_statuses_text[0]
            console.log('LOL ' + msg.message_id + ', ' + (msg.message_id - 1))
            bot.deleteMessage(chatId, msg.message_id).then(() => {
                console.log('LOL2 ' + msg.message_id + ', ' + (msg.message_id - 1))
            })

            bot.editMessageText(almostthere2_text, {
                chat_id: chatId,
                message_id: add_info_msg[chatId],
                reply_markup:{
                    inline_keyboard:[
                        [{
                            text: backtoprogramme_text[0],
                            callback_data: backtoprogramme_text[1]
                        }],
                        [{
                            text: 'Имя: ' + user_name[chatId],
                            callback_data: changename_text
                        },
                        {
                            text: 'Телефон: ' + user_phone[chatId],
                            callback_data: changephone_text
                        }],
                        [{
                            text: dataiscorrect_text,
                            callback_data: dataiscorrect_text
                        }]
                    ]
                }
            }
            ).catch(err => {
                console.log(err)
            })
            .then(res => {
                messages_todelete[chatId][2] = res.message_id
            })
            
        }
        if (user_phone[chatId] === '' || user_name[chatId] === '' && isMakingChanges[chatId] !== 4 && isMakingChanges[chatId] !== 5)
        {
            console.log('LOL3 ' + msg.message_id + ', ' + (msg.message_id - 1) + ', save_msgid: ' + add_info_msg[chatId])
            bot.deleteMessage(chatId, msg.message_id)
            
            bot.editMessageText(almostthere_text, {
                chat_id: chatId,
                message_id: add_info_msg[chatId],
                reply_markup:{
                    inline_keyboard:[
                        [{
                            text: backtoprogramme_text[0],
                            callback_data: backtoprogramme_text[1]
                        }],
                        [{
                            text: 'Имя: ' + user_name[chatId],
                            callback_data: changename_text
                        },
                        {
                            text: 'Телефон: ' + user_phone[chatId],
                            callback_data: changephone_text
                        }]
                    ]
                }
            }
            ).catch(err => {
                console.log(err)
            })
            .then(res => {
                messages_todelete[chatId][2] = res.message_id
            })
            
            
        }
    }

    if (isMakingChanges_3[chatId] === 1  && userstatus[chatId] !== undefined){
        isMakingChanges_3[chatId] = 0
        isMakingChanges_2[chatId] = 0
        console.log('isMakingChanges 3!')
        
        user_howtocome[chatId] = msg.text
        if (userstatus[chatId] !== 'unregistered'){
            bot.deleteMessage(chatId, add_info_msg[chatId])
            if (user_coins[chatId] >= (finalprice[chatId] * min_pay_percentage)){
                if (user_coins[chatId] <= (finalprice[chatId] * max_pay_percentage)){
                    //тут можно оплатить всеми баллами.
                    bot.deleteMessage(chatId, add_info_msg[chatId])
                    skidka[chatId] = user_coins[chatId]
                    bot.sendMessage(chatId, 'У вас есть ' + user_coins[chatId] + ' тенге, которыми можно оплатить заказ. Сумма заказа с учетом скидки: ' + (finalprice[chatId]-user_coins[chatId]) + ' тенге. Хотите потратить их сейчас?', {
                        reply_markup: {
                            inline_keyboard: [
                                [{
                                    text: spendmycoins,
                                    callback_data: spendmycoins
                                },{
                                    text: dontspendmycoins,
                                    callback_data: dontspendmycoins
                                }]
                            ],
                        },
                    })
                }
                else if (user_coins[chatId] > (finalprice[chatId] * max_pay_percentage)){
                    bot.deleteMessage(chatId, add_info_msg[chatId])
                    //тут оплачиваем максимальным количеством баллов
                    skidka[chatId] = finalprice[chatId] * max_pay_percentage
                    bot.sendMessage(chatId, 'Ваш баланс: ' + user_coins[chatId] + ' тенге. Вы можете потратить ' + finalprice[chatId] * max_pay_percentage + 'тенге на оплату заказа. Сумма заказа с учетом скидки: ' + (finalprice[chatId] - ( finalprice[chatId] * max_pay_percentage)) + ' тенге. Хотите сделать это?', {
                        reply_markup: {
                            inline_keyboard: [
                                [{
                                    text: spendmycoins,
                                    callback_data: spendmycoins
                                },{
                                    text: dontspendmycoins,
                                    callback_data: dontspendmycoins
                                }]
                            ],
                        },
                    })
                }
            }
            else {
                skidka[chatId] = 0
                abonement_status[chatId] = abonement_statuses_text[0]
                bot.sendMessage(chatId, abonementrequest_sended, {
                    reply_markup: {
                        keyboard: unregistered_keyboard[3],
                        resize_keyboard: true
    
                    }
                })
                
                let updates = {};

                let username = []
                username[chatId] = "undefined"
                if (msg.chat.username != undefined) username[chatId] = msg.chat.username.toString()
                
                let alltimepurchases = []
                alltimepurchases[chatId] = 1
                if (abonements_bought[chatId] > 0){
                    alltimepurchases[chatId] = abonements_bought[chatId] + 1
                }

                let newuser = {
                    adress: user_adress[chatId],
                    average_price: average_price[chatId],
                    average_purchases: average_purchases[chatId],
                    coins: user_coins[chatId],
                    email: user_email[chatId],
                    favourite_food: favourite_program[chatId],
                    id: chatId,
                    name: user_name[chatId],
                    phone: user_phone[chatId],
                    username: username[chatId],
                    alltime_purchases_amount: alltimepurchases[chatId]
                }

                let date = new Date()
                let utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
                let timeOfffset = 6 //Astana GMT +6
                let Astana_date = new Date(utcTime + (3600000 * timeOfffset))
                let date_now = Astana_date.getDate() + '_' + (Astana_date.getMonth() + 1) + '_' + Astana_date.getFullYear() + '__' + Astana_date.getHours() + '_' + Astana_date.getMinutes()                

                order_name[chatId] = 'Basement/cities/' + userCity[chatId] + '/points/' + userPoint[chatId] + '/bills/' + date_now.toString()
                console.log('ORDER NAME: ' + order_name[chatId])
                order_date[chatId] = date_now.toString()

                //date_now = Date.now()
                //date_string = date_now.getDate() + ',' + date_now.getHours() + ':' + date_now.getMinutes()
                let newbill = {
                    date_ordered: Astana_date.getTime(),
                    order_info: finalbasket[chatId],
                    price: finalprice[chatId],
                    client_id: chatId,
                    phone: user_phone[chatId],
                    order_status: abonement_statuses_text[0],
                    adress: user_adress[chatId],
                    client_name: user_name[chatId],
                    user_personsamount: user_personsamount[chatId],
                    user_payingmethod: user_payingmethod[chatId],
                    user_deliverdate: user_deliverdate[chatId],
                    user_sdachainfo: user_sdachainfo[chatId],
                    user_howtocome: user_howtocome[chatId]
                }

                let clientsamount = fb.database().ref('Basement/clients/clients_amount');
                    clientsamount.get().then((snapshot) => {
                    let count = snapshot.val();
                    if (userstatus[chatId] === 'unregistered'){
                        count++
                        updates['Basement/clients/clients_amount'] = count
                        userstatus[chatId] = 'registered'
                    }

                    updates['Basement/clients/' + chatId] = newuser
                    updates[order_name[chatId]] = newbill

                    fb.database().ref().update(updates)

                    AddMailingData()
                    StartCheckingOrder()
                })

                                  ////////////////////ОТПРАВКА ЧЕКА///////////////////////////////////                 
    let options = { weekday: 'short'}
    
let minutes = Astana_date.getMinutes()
if (minutes < 10) minutes = '0' + minutes
let hours = Astana_date.getHours()
if (hours < 10) hours = '0' + hours
let visible_date = /* new Intl.DateTimeFormat('ru-RU', options).format(Astana_date) + ' ' +  */hours + ':' + minutes + ', ' + Astana_date.getDate() + '.' + (Astana_date.getMonth() + 1)

    abonements_bill_topic = abonement_bill_topic_names[0]
    abonemets_bill_client_info = `

<b>👤 Заказчик</b> (Нур-Султан GMT+6)
├ ФИО: ` + user_name[chatId] + `
├ Адрес: ` + user_adress[chatId] + `
└ Номер: ` + user_phone[chatId] + `

`
    abonements_bill_order_info = `<b>🧾 Описание заказа:</b>
` + finalbasket[chatId] + `

`
    
    deliver_bill_finalprice = `<b>💵 Итого к оплате:</b>
` + finalprice[chatId] + ` тг.

`

    deliver_bill_order_details = `<b>ℹ️ Детали заказа</b> (Нур-Султан GMT+6)
└ Дата заказа: ` + visible_date + `

`
    deliver_bill_help_info = `<b>📌 Доп. информация</b>
├ Кол-во персон: ` + user_personsamount[chatId] + `
├ Способ оплаты: ` + user_payingmethod[chatId] + `
├ Купюра оплаты: ` + user_sdachainfo[chatId] + `
└ Когда доставить: ` + user_deliverdate[chatId] + `

<b>🚴‍♂️ Как пройти?</b>
` + user_howtocome[chatId] + `

`
    console.log('order_date! ' + order_date[chatId])
    abonements_bill = abonements_bill_topic + abonemets_bill_client_info + abonements_bill_order_info + deliver_bill_finalprice + deliver_bill_help_info + deliver_bill_order_details
    console.log('last message id: ' + msg.message_id)
    let current_chat = fb.database().ref('Basement/cities/' + userCity[chatId] + '/points/' + userPoint[chatId] + '/chats/');
    current_chat.get().then((snapshot) => {
        if (user_mode[chatId] === usermodes[0][1]){
            operators_chat[chatId] = snapshot.val().delivers_chat
        }
        if (user_mode[chatId] === usermodes[1][1]){
            operators_chat[chatId] = snapshot.val().waiters_chat
        }

        bot.sendMessage(operators_chat[chatId], abonements_bill, {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard:[
                    [{
                        text: '✅ Принять заказ',
                        callback_data: accept_order_callback + order_date[chatId]
                    }],
                    [{
                        text: '❌ Отклонить заказ',
                        callback_data: refuse_order_callback + order_date[chatId]
                    }]
                ]
            }
        }).then(() => {
            //bot.sendContact(delivery_chat, user_phone[chatId], user_name[chatId]).then(() => {
            
            /* let update = {}
            let bill_message_id = query.message.message_id
            console.log('bills message id: ' + bill_message_id)
            update['Basement/bills/' + order_date/*  + '/bill_message_id' ] = bill_message_id
            console.log('adding message id: ' + 'Basement/bills/' + order_date) */
        })
    })

    
            }
        }
        else {
            bot.deleteMessage(chatId, add_info_msg[chatId]).then(() => {
                abonement_status[chatId] = abonement_statuses_text[0]
                bot.sendMessage(chatId, abonementrequest_sended, {
                    reply_markup: {
                        keyboard: unregistered_keyboard[3],
                        resize_keyboard: true
    
                    }
                })

                let updates = {};

                let username = []
                username[chatId] = "undefined"
                if (msg.chat.username != undefined) username[chatId] = msg.chat.username.toString()
                
                let alltimepurchases = []
                alltimepurchases[chatId] = 1
                if (abonements_bought[chatId] > 0){
                    alltimepurchases[chatId] = abonements_bought[chatId] + 1
                }
                

                let newuser = {
                    adress: user_adress[chatId],
                    average_price: average_price[chatId],
                    average_purchases: average_purchases[chatId],
                    coins: user_coins[chatId],
                    email: user_email[chatId],
                    favourite_food: favourite_program[chatId],
                    id: chatId,
                    name: user_name[chatId],
                    phone: user_phone[chatId],
                    username: username[chatId],
                    alltime_purchases_amount: alltimepurchases[chatId]
                }

                let date = new Date()
                let utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
                let timeOfffset = 6 //Astana GMT +6
                let Astana_date = new Date(utcTime + (3600000 * timeOfffset))
                let date_now = Astana_date.getDate() + '_' + (Astana_date.getMonth() + 1) + '_' + Astana_date.getFullYear() + '__' + Astana_date.getHours() + '_' + Astana_date.getMinutes()                

                //date_now = Date.now()
                //date_string = date_now.getDate() + ',' + date_now.getHours() + ':' + date_now.getMinutes()
                order_name[chatId] = 'Basement/cities/' + userCity[chatId] + '/points/' + userPoint[chatId] + '/bills/' + date_now.toString()
                order_date[chatId] = date_now.toString()
                console.log('ORDER NAME: ' + order_name[chatId])

                let newbill = {
                    date_ordered: Astana_date.getTime(),
                    order_info: finalbasket[chatId],
                    price: finalprice[chatId],
                    client_id: chatId,
                    phone: user_phone[chatId],
                    order_status: abonement_statuses_text[0],
                    adress: user_adress[chatId],
                    client_name: user_name[chatId],
                    user_personsamount: user_personsamount[chatId],
                    user_payingmethod: user_payingmethod[chatId],
                    user_deliverdate: user_deliverdate[chatId],
                    user_sdachainfo: user_sdachainfo[chatId],
                    user_howtocome: user_howtocome[chatId]
                }

                let clientsamount = fb.database().ref('Basement/clients/clients_amount');
                    clientsamount.get().then((snapshot) => {
                    let count = snapshot.val();
                    console.log('WARNING! ' + userstatus[chatId])
                    if (userstatus[chatId] === 'unregistered'){
                        count++
                        updates['Basement/clients/clients_amount'] = count
                        userstatus[chatId] = 'registered'
                    }

                    updates['Basement/clients/' + chatId] = newuser
                    updates[order_name[chatId]] = newbill

                    fb.database().ref().update(updates)

                    AddMailingData()
                    StartCheckingOrder() 
                    
                }).catch(err => {
                    console.log('error: ' + err)
                })

                   ////////////////////ОТПРАВКА ЧЕКА///////////////////////////////////                 
    let options = { weekday: 'short'}
    let minutes = Astana_date.getMinutes()
    if (minutes < 10) minutes = '0' + minutes
    let hours = Astana_date.getHours()
    if (hours < 10) hours = '0' + hours
    let visible_date = /* new Intl.DateTimeFormat('ru-RU', options).format(Astana_date) + ' ' +  */hours + ':' + minutes + ', ' + Astana_date.getDate() + '.' + (Astana_date.getMonth() + 1)
    
    abonements_bill_topic = abonement_bill_topic_names[0]
    abonemets_bill_client_info = `

<b>👤 Заказчик</b>
├ ФИО: ` + user_name[chatId] + `
├ Адрес: ` + user_adress[chatId] + `
└ Номер: ` + user_phone[chatId] + `

`
    abonements_bill_order_info = `<b>🧾 Описание заказа:</b>
` + finalbasket[chatId] + `

`
    
    deliver_bill_finalprice = `<b>💵 Итого к оплате:</b>
` + finalprice[chatId] + ` тг.

`

    deliver_bill_order_details = `<b>ℹ️ Детали заказа</b> (Нур-Султан GMT+6)
└ Дата заказа: ` + visible_date + `

`
deliver_bill_help_info = `<b>📌 Доп. информация</b>
├ Кол-во персон: ` + user_personsamount[chatId] + `
├ Способ оплаты: ` + user_payingmethod[chatId] + `
├ Купюра оплаты: ` + user_sdachainfo[chatId] + `
└ Когда доставить: ` + user_deliverdate[chatId] + `

<b>🚴‍♂️ Как пройти?</b>
` + user_howtocome[chatId] + `

`
    console.log('order_date! ' + order_date[chatId])

    abonements_bill = abonements_bill_topic + abonemets_bill_client_info + abonements_bill_order_info + deliver_bill_finalprice + deliver_bill_help_info + deliver_bill_order_details
    console.log('last message id: ' + msg.message_id)
    let current_chat = fb.database().ref('Basement/cities/' + userCity[chatId] + '/points/' + userPoint[chatId] + '/chats/');
    current_chat.get().then((snapshot) => {
        if (user_mode[chatId] === usermodes[0][1]){
            operators_chat[chatId] = snapshot.val().delivers_chat
        }
        if (user_mode[chatId] === usermodes[1][1]){
            operators_chat[chatId] = snapshot.val().waiters_chat
        }

        bot.sendMessage(operators_chat[chatId], abonements_bill, {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard:[
                    [{
                        text: '✅ Принять заказ',
                        callback_data: accept_order_callback + order_date[chatId]
                    }],
                    [{
                        text: '❌ Отклонить заказ',
                        callback_data: refuse_order_callback + order_date[chatId]
                    }]
                ]
            }
        }).then(() => {
            //bot.sendContact(delivery_chat, user_phone[chatId], user_name[chatId])
            /* let update = {}
            let bill_message_id = query.message.message_id
            console.log('bills message id: ' + bill_message_id)
            update['Basement/bills/' + order_date/*  + '/bill_message_id' ] = bill_message_id
            console.log('adding message id: ' + 'Basement/bills/' + order_date) */
        }).catch(err => {
            console.log('error: ' + err)
        })
    })
    

    ////////////////////////////////////////////////////////////////////////

                //console.log('Date: ' + date_now.getHours() + ':' + date_now.getMinutes())
            }).catch(err => {
                console.log('error: ' + err)
            })
        }
    }

    if (msg.text === order_status_button){
        bot.deleteMessage(msg.chatId, msg.message_id).then(() => {
            console.log('Order name: "' + order_name[chatId] + '"')
            let userdata = fb.database().ref(order_name[chatId])
            userdata.get().then((result) => {
                abonement_status[chatId] = result.val().order_status
                console.log('order_status: ' + result.val().order_status)
                console.log('order link: Basement/bills/' + order_name[chatId])
                bot.sendMessage(msg.chatId, 'Статус вашего заказа: ' + abonement_status[chatId])
            }) 
        })
    }

    if (msg.text === 'erheoirhjeoihri'){
        bot.deleteMessage(chatId, msg.message_id - 1)
        bot.deleteMessage(chatId, msg.message_id).then(() => {

            user_coins[chatId] = user_coins[chatId] + (finalprice[chatId] * cashback)
            user_coins[chatId] = Math.round(user_coins[chatId])
            added_coins[chatId] = (finalprice[chatId] * cashback)
            added_coins[chatId] = Math.round(added_coins[chatId])
            console.log('coins = ' + user_coins[chatId] + '. Было начислено ' + added_coins[chatId] + '. Cashback: ' + cashback + '. Finalprice: ' + finalprice[chatId])

/*             order_status[chatId] = 'unknown'
            order_name[chatId] = ''
            finalbasket[chatId] = ''
            finalprice[chatId] = 0
            basket[chatId] = [] */

            let poll_text = 'Спасибо за заказ! Пожалуйста, оцените качество доставки: '
            bot.sendMessage(chatId, poll_text).then(() => {
                bot.sendPoll(chatId, 'Как оцените наш сервис?', feedback_options, {
                    is_anonymous: false
                })
            })

            /* if (user_email[chatId] === 'unknown'){
                
                let tmp_text = `Вам было зачислено <b>` + added_coins[chatId] + `</b> тенге. Ваш счет: ` + user_coins[chatId] + ` тенге. Ими можно оплачивать следующие заказы. 
                
Кстати, если Вы привяжете к этому аккаунту свой email, то получите еще <b>` + (added_coins[chatId] * percent_foremail) + `</b> тенге. 

Не волнуйтесь, мы не будем слать Вам спам 😏 `
                bot.sendMessage(chatId, tmp_text, {
                    parse_mode: 'HTML',
                    reply_markup:{
                        inline_keyboard:[
                            [{
                                text: add_email,
                                callback_data: add_email
                            }],
                            [{
                                text: dont_add_email,
                                callback_data: dont_add_email
                            }]
                        ]
                    }
                })
            }

            else if (user_email[chatId] !== 'unknown'){
                let updates = {};
                updates['Basement/clients/' + msg.chatId + '/coins'] = user_coins[chatId]
                fb.database().ref().update(updates).then(() => {
                    //тут отправить в главное меню
                    for (let i=0; i<100; i++){
                        bot.deleteMessage(chatId, msg.message_id - i).catch(err => {
                            console.log(err)
                        })
                    }
                    bot.sendMessage(chatId, 'Теперь ваш баланс: ' + user_coins[chatId] + '. ' + emailalreadyadded_text).then(() => {
                        Reset(chatId)
                        anotherpoint_multiple[chatId] = 2
                        keyboards.CategoriesKeyboard(category_keyboard[chatId], userCategories[chatId], categories_count[chatId], fb, bot, chatId, msg, anotherpoint_text, choosecategory_text, hellomessage_text, location_text, phone_text)
                    })
                })
            } */
        })
    }

    if (msg.text === dont_add_email){
        isMakingChanges[chatId] = 0
        //теперь можно совершать новые покупки, но ты регистеред

        let updates = {};
        updates['Basement/clients/' + msg.chatId + '/coins'] = user_coins[chatId]
        fb.database().ref().update(updates).then(() => {
            //тут отправить в главное меню
            for (let i=0; i<100; i++){
                bot.deleteMessage(chatId, msg.message_id - i).catch(err => {
                    console.log(err)
                })
            }
            bot.sendMessage(chatId, didntaddemail_text).then(() => {
                IdentifyUser(chatId)
                anotherpoint_multiple[chatId] = 2
                keyboards.CategoriesKeyboard(category_keyboard[chatId], userCategories[chatId], fb, bot, chatId, query.message, anotherpoint_text, choosecategory_text, location_text, phone_text, userCity[chatId], userPoint[chatId], user_mode[chatId])
            })
        })

    }

    if (msg.text === declineorder_button){
        let updates = {}
        updates[order_name[chatId]] = null
        bot.deleteMessage(chatId, msg.message_id)
        fb.database().ref().update(updates).then(() => {
            for (let i=0; i<100; i++){
                bot.deleteMessage(chatId, msg.message_id - i).catch(err => {
                    //console.log(err)
                })
            }
            bot.sendMessage(chatId, 'Жаль, что вы решили отменить заказ 😢').then(() => {
                IdentifyUser(chatId)
                anotherpoint_multiple[chatId] = 2
                keyboards.CategoriesKeyboard(category_keyboard[chatId], userCategories[chatId], fb, bot, chatId, query.message, anotherpoint_text, choosecategory_text, location_text, phone_text, userCity[chatId], userPoint[chatId], user_mode[chatId])
            })
        }).catch(err => {
            console.log(err)
        })
    }
})

bot.on('callback_query', query => {
    const { chat, message_id, text } = query.message
    current_chat = chat.id

    console.log(query.data)
    console.log(query)

    if (userstatus[query.from.id] === 'unknown' || userstatus[query.from.id] === undefined){
        if (chat.type === 'group' || chat.type === 'supergroup'){
            bot.getChat(chat.id).then(result => {
                if (result.description !== undefined && result.description !== null){
                    console.log('group: ' + result.description)
                    let del_userdata = []
                    del_userdata[chat.id] = result.description.split('/')
                    if (del_userdata[chat.id].length === 3 && del_userdata[chat.id][2] === (chat.id).toString()){
                        club_name_fb[query.from.id] = del_userdata[chat.id][0]
                        IdentifyUser(query.from.id)
                    }
                }
            })
        }
        else {
            if (club_name_fb[chat.id] === undefined || club_name_fb[chat.id] === null){
                for (let i=0; i<100; i++){
                    bot.deleteMessage(chat.id, message_id - i + 1).catch(err => {
                        //console.log(err)
                    })
                }
                IdentifyUser(chat.id)
                keyboards.GymsKeyboard(gym_keyboard[chat.id], userGyms[chat.id], fb, bot, chat.id, mother_link, choosegym_text)
            }
        }
        console.log('dont know users status, lets check it')
        
    }

    if (chat.type === 'private'  && chat.id !== admin_id[chat.id]){ 
    
        if (query.data === keyboards.main_menu_buttons[1][1]){
            //bot.deleteMessage(chat.id, message_id).catch(err => {console.log('here: ' + err)})
            bot.editMessageText(text, {
                chat_id: chat.id,
                message_id: message_id
            }).catch(err => {console.log('here: ' + err)})
            keyboards.ProgramCategoriesKeyboard(category_keyboard[chat.id], userCategories[chat.id], fb, bot, chat.id, backtomain_text, choosecategory_text, club_name_fb[chat.id])
        }

        if (query.data === keyboards.main_menu_buttons[2][1]){
            bot.editMessageText(text, {
                chat_id: chat.id,
                message_id: message_id
            }).catch(err => {console.log('here: ' + err)})
            keyboards.TrenersKeyboard(trener_keyboard[chat.id], userTreners[chat.id], fb, bot, chat.id, backtomain_text, choosetrener_text, club_name_fb[chat.id])
        }
    
        if (query.data === query_deletethismessage){
            bot.deleteMessage(chat.id, message_id).catch(err => {console.log('here: ' + err)})
            for (let i=0; i<100; i++){
                bot.deleteMessage(chat.id, message_id - i).catch(err => {
                    //console.log(err)
                })
            }
            bot.sendSticker(chat.id, sticker_hello[Math.floor(Math.random() * sticker_hello.length)])
            .then(() => {
                anotherpoint_multiple[chat.id] = 2
                bot.sendMessage(chat.id, hellomessage_text, {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: keyboards.main_menu_keyboard
                    }
                })
            })
        }

        if (query.data === igotmyitem_text[1]){
            if (skidka[chat.id] !== 0) {
                let updates = {}
                updates['Fitness/'+club_name_fb[chat.id]+'/clients/'+chat.id + '/coins'] = user_coins[chat.id] - skidka[chat.id]
                fb.database().ref().update(updates)
            }
            if (userstatus[chat.id] === 'registered'){
                for (let i=0; i<100; i++){
                    bot.deleteMessage(chat.id, message_id - i).catch(err => {
                        //console.log(err)
                    })
                }
                bot.sendSticker(chat.id, sticker_hello[Math.floor(Math.random() * sticker_hello.length)])
                .then(() => {
                    anotherpoint_multiple[chat.id] = 2
                    bot.sendMessage(chat.id, hellomessage_text, {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: keyboards.main_menu_keyboard
                        }
                    })
                })
            }
        }

        if (query.data === keyboards.main_menu_buttons[0][1]){
            if (userstatus[chat.id] !== 'registered'){
                bot.editMessageText(text, {
                    parse_mode: 'HTML',
                    chat_id: chat.id,
                    message_id: message_id
                }).then(() => {
                    bot.sendMessage(chat.id, 'У вас еще нет абонемента. Самое время его выбрать!', {
                        parse_mode: 'HTML',
                        reply_markup:{
                            inline_keyboard:[
                                [{
                                    text: backtomain_text,
                                    callback_data: backtomain_text
                                }],
                                [{
                                    text: keyboards.main_menu_buttons[1][0],
                                    callback_data: keyboards.main_menu_buttons[1][1]
                                }]
                            ]
                        }
                    })
                })
            }
            if (userstatus[chat.id] === 'registered'){
                
                bot.editMessageText(text, {
                    parse_mode: 'HTML',
                    chat_id: chat.id,
                    message_id: message_id
                }).then(() => {
                    let abonem_data = fb.database().ref('Fitness/'+club_name_fb[chat.id]+'/clients/' + chat.id)
                    abonem_data.on('value', (result) => {

                        let Astana_date_end = new Date(result.val().abonement.end_date)  
                        let minutes = Astana_date_end.getMinutes()
                        if (minutes < 10) minutes = '0' + minutes
                        let hours = Astana_date_end.getHours()
                        if (hours < 10) hours = '0' + hours
                        let visible_date_end = /* new Intl.DateTimeFormat('ru-RU', options).format(Astana_date_end) + ' ' +  */hours + ':' + minutes + ', ' + Astana_date_end.getDate() + '.' + (Astana_date_end.getMonth() + 1) + '.' + Astana_date_end.getFullYear()        

                        let temp_mes = `<b>Ваш абонемент: </b>` + result.val().abonement.abonement_status + `

<b>Название программы:</b> ` + result.val().abonement.name + `
<b>Продолжительность: </b>` + result.val().abonement.period + ` мес.
<b>Стоимость: </b>` + result.val().abonement.price + ` тенге

<b>🕔 Абонемент годен до:</b> ` + visible_date_end

                        if (result.val().abonement.freeze_amount !== false){
                            temp_mes += `
❄️ Заморозок осталось: ` + result.val().abonement.freeze_amount
                        }

                        if (result.val().coins > 0){
                            temp_mes += `
💰 Баланс: ` + result.val().coins + ` тенге`
                        }
                        
                        bot.sendMessage(chat.id, temp_mes, {
                            parse_mode: 'HTML',
                            reply_markup:{
                                inline_keyboard:[
                                    [{
                                        text: backtomain_text,
                                        callback_data: backtomain_text
                                    }]
                                ]
                            }
                        })
                    })
                    
                })
            }
        }

        if (query.data === keyboards.main_menu_buttons[3][1]){
            bot.editMessageText(text, {
                chat_id: chat.id,
                message_id: message_id
            }).catch(err => {console.log('here: ' + err)})
            keyboards.ShopCategoriesKeyboard(shop_keyboard[chat.id], userShopCategories[chat.id], fb, bot, chat.id, backtomain_text, chooseshopcategory_text, club_name_fb[chat.id])
        }

        for (let i=0; i<userShopCategories[chat.id].length; i++){
            if (query.data === userShopCategories[chat.id][i]){
                userShopCategory[chat.id] = userShopCategories[chat.id][i]
                keyboards.ShopItemsKeyboard(shopitems_keyboard[chat.id], userItemsList[chat.id], userShopCategory[chat.id], fb, bot, chat, message_id, anothershopcategory_text, chooseitem_text, club_name_fb[chat.id])
            }
        }

        for (let i=0; i < 100; i++){
            console.log(query.data + ', usershopcategory = ' + userShopCategory[chat.id])
            if (query.data === i.toString() && userShopCategory[chat.id] !== undefined && userShopCategory[chat.id] !== null /* && userItem[chat.id] === '' */) {
                console.log(query.data + ', usershopcategory = ' + userShopCategory[chat.id])
                userItem[chat.id] = i
                bot.deleteMessage(chat.id, message_id)
                let itemdata = fb.database().ref('Fitness/'+club_name_fb[current_chat]+'/shop/categories/' + userShopCategory[chat.id] + '/items/' + query.data)
                itemdata.get().then((result) => {
                    let temp_text = `<b>`+ result.val().name + `</b>
` + result.val().description + `

💰 Цена: ` + result.val().price + ` тенге`
                    userItemPrice[chat.id] = result.val().price
                    if (userstatus[chat.id] === 'registered'){
                        bot.sendPhoto(chat.id, result.val().photo, {
                            parse_mode: 'HTML',
                            caption: temp_text,
                            reply_markup:{
                                inline_keyboard:[
                                    [{
                                        text: backtoitemslist_text[0],
                                        callback_data: backtoitemslist_text[1]
                                    }],
                                    [{
                                        text: buyitem_text[0],
                                        callback_data: buyitem_text[1]
                                    }]
                                ]
                            }
                        })
                    }
                    if (userstatus[chat.id] !== 'registered'){
                        bot.sendPhoto(chat.id, result.val().photo, {
                            parse_mode: 'HTML',
                            caption: temp_text,
                            reply_markup:{
                                inline_keyboard:[
                                    [{
                                        text: backtoitemslist_text[0],
                                        callback_data: backtoitemslist_text[1]
                                    }]
                                ]
                            }
                        })
                    }
                })
            }
        }

        if (query.data === buyitem_text[1]){
            bot.deleteMessage(chat.id, message_id).catch(err => {console.log(err)})
            let userdata = fb.database().ref('Fitness/'+club_name_fb[chat.id]+'/clients/' + chat.id)
            userdata.get().then((result) => {
                user_coins[chat.id] = result.val().coins
                if(user_coins[chat.id] >= (userItemPrice[chat.id] * min_cashback[chat.id]) && userItemPrice[chat.id] >= min_price[chat.id]){
                    if (user_coins[chat.id] > (userItemPrice[chat.id] * max_cashback[chat.id])){
                        skidka[chat.id] = userItemPrice[chat.id] * max_cashback[chat.id]
                    }
                    else skidka[chat.id] = user_coins[chat.id]

                    bot.sendMessage(chat.id, 'У вас есть ' + user_coins[chat.id] + ' тенге, их которых вы можете потратить ' + skidka[chat.id] + ' тенге на покупку этого товара. Хотите воспользоваться ими?', {
                        parse_mode: 'HTML',
                        reply_markup:{
                            inline_keyboard:[
                                [{
                                    text: useskidka_text[0],
                                    callback_data: useskidka_text[1]
                                }],
                                [{
                                    text: dontuseskidka_text[0],
                                    callback_data: dontuseskidka_text[0]
                                }]
                            ]
                        }
                    })

                }
                else {
                    let itemdata = fb.database().ref('Fitness/'+club_name_fb[current_chat]+'/shop/categories/' + userShopCategory[chat.id] + '/items/' + userItem[chat.id])
            itemdata.get().then((result) => {
                let billtext = `

<b>⏳ Запрос на покупку</b>
├ Клиент: ` + user_name[chat.id] + `
└ Номер: ` + user_phone[chat.id] + `

<b>ℹ️ Информация о товаре</b>
├ Название: ` + result.val().name + `
├ Цена: ` + result.val().price + `
└ Клиент не использовал бонусы `

                bot.sendMessage(chat.id, 'Спасибо за покупку! Покажите это сообщение сотруднику клуба. После получения товара нажмите "✅ Товар получен"' + billtext, {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [{
                                text:igotmyitem_text[0],
                                callback_data: query_deletethismessage
                            }]
                        ]
                    }
                })

                bot.sendMessage(operators_chat[chat.id], billtext, {
                    parse_mode: 'HTML'
                })
            })
                }
            })
        }

        if (query.data === dontuseskidka_text[1]){
            let itemdata = fb.database().ref('Fitness/'+club_name_fb[chat.id]+'/shop/categories/' + userShopCategory[chat.id] + '/items/' + userItem[chat.id])
            itemdata.get().then((result) => {
                let billtext = `

<b>⏳ Запрос на покупку</b>
├ Клиент: ` + user_name[chat.id] + `
└ Номер: ` + user_phone[chat.id] + `

<b>ℹ️ Информация о товаре</b>
├ Название: ` + result.val().name + `
├ Цена: ` + result.val().price + `
└ Клиент не использовал бонусы `

                bot.sendMessage(chat.id, 'Спасибо за покупку! Покажите это сообщение сотруднику клуба. После получения товара нажмите "✅ Товар получен"' + billtext, {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [{
                                text:igotmyitem_text[0],
                                callback_data: query_deletethismessage
                            }]
                        ]
                    }
                })

                bot.sendMessage(operators_chat[chat.id], billtext, {
                    parse_mode: 'HTML'
                })
            })
        }

        if (query.data === useskidka_text[1]){
            let itemdata = fb.database().ref('Fitness/'+club_name_fb[chat.id]+'/shop/categories/' + userShopCategory[chat.id] + '/items/' + userItem[chat.id])
            itemdata.get().then((result) => {
                let billtext = `

<b>⏳ Запрос на покупку</b>
├ Клиент: ` + user_name[chat.id] + `
└ Номер: ` + user_phone[chat.id] + `

<b>ℹ️ Информация о товаре</b>
├ Название: ` + result.val().name + `
├ Цена: ` + result.val().price + `
└ Клиент использовал бонусы: ` + skidka[chat.id] + ` тенге

💰 Итоговая цена за товар: ` + (result.val().price - skidka[chat.id])

                bot.sendMessage(chat.id, 'Спасибо за покупку! Покажите это сообщение сотруднику клуба. После получения товара нажмите "✅ Товар получен"' + billtext, {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [{
                                text: igotmyitem_text[0],
                                callback_data: igotmyitem_text[1]
                            }]
                        ]
                    }
                })

                bot.sendMessage(operators_chat[chat.id], billtext, {
                    parse_mode: 'HTML'
                })
            })
        }

        if (query.data === sendlocation){
            const msgtext = `Отправьте нам свою локацию, и мы найдем ближайший <b>Coffee BOOM</b> ☕️. Для этого нажмите на иконку скрепки (слева снизу) и выберите <b>"Геопозиция"</b>
🏪 Вы также можете отметить заведение на карте`
            bot.sendVideo(chat.id, './pictures/tutorial.mp4').then(() => {
                bot.sendMessage(chat.id, msgtext, {parse_mode: 'HTML'})
            })
        }

        if (query.data === backtomain_text){
            if (userstatus[chat.id] !== 'registered'){
                IdentifyUser(chat.id)
            }
            for (let i=0; i<100; i++){
                bot.deleteMessage(chat.id, message_id - i).catch(err => {
                    //console.log(err)
                })
            }
            bot.sendSticker(chat.id, sticker_hello[Math.floor(Math.random() * sticker_hello.length)]).then(() => {
                anotherpoint_multiple[chat.id] = 2
                bot.sendMessage(chat.id, hellomessage_text, {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: keyboards.main_menu_keyboard
                    }
                })
            })
            
        }

        for (let i = 0; i < userCategories[chat.id].length; i++){
            //console.log('categorycheck: ' + userCategories[chat.id][i])
            if (query.data === userCategories[chat.id][i] && userProgram[chat.id] === ''){
                userCategory[chat.id] = userCategories[chat.id][i]
                userProgram[chat.id] = 'unknown'
                console.log('PRESSED ON CATEGORY!!!')
                //bot.deleteMessage(chat.id, message_id).catch(err => {console.log('here: ' + err)})
                keyboards.ProgramKeyboard(programmes_keyboard[chat.id], userProgrammesList[chat.id], userCategory[chat.id], fb, bot, chat, message_id, anothercategory_text, chooseprogramme_text, club_name_fb[chat.id])
            }
        }

        if (query.data === anothercategory_text){
            userCategory[chat.id] = ''
            userProgram[chat.id] = ''
            bot.deleteMessage(chat.id, message_id)
            keyboards.ProgramCategoriesKeyboard(category_keyboard[chat.id], userCategories[chat.id], fb, bot, chat.id, backtomain_text, choosecategory_text, club_name_fb[chat.id])
        }

        if (query.data === anothershopcategory_text){
            userShopCategory[chat.id] = ''
            bot.deleteMessage(chat.id, message_id)
            keyboards.ShopCategoriesKeyboard(shop_keyboard[chat.id], userShopCategories[chat.id], fb, bot, chat.id, backtomain_text, chooseshopcategory_text, club_name_fb[chat.id])
        }

        if (query.data === backtoitemslist_text[1]){
            userItem[chat.id] = ''
            userItemPrice[chat.id] = 0
            bot.deleteMessage(chat.id, message_id)
            keyboards.ShopItemsKeyboard(shopitems_keyboard[chat.id], userItemsList[chat.id], userShopCategory[chat.id], fb, bot, chat, message_id, anothershopcategory_text, chooseitem_text, club_name_fb[chat.id])
        }

        for (let i = 0; i < temp_program_types[chat.id].length; i++){
            if (query.data === choosetype_callback + temp_program_types[chat.id][i][3]){
                    myprogram_type[chat.id] = temp_program_types[chat.id][i]
                    bot.editMessageCaption(messages_texts[chat.id][0], {
                        parse_mode: 'HTML',
                        chat_id: chat.id,
                        message_id: messages_todelete[chat.id][0]
                    })
                    .catch(err => {console.log(err)})
                    /* for (let i = 0; i < messages_todelete[chat.id].length; i++){
                        console.log('why? ' + messages_todelete[chat.id].length)
                        bot.deleteMessage(chat.id, messages_todelete[chat.id][i])
                    } */
                    let texttosend = []
                    texttosend[chat.id] = `<b>Описание абонимента: </b>
⏳ Длительность тренировок: ` + temp_program_types[chat.id][i][0] + ` мес. 
`
                    if (temp_program_types[chat.id][i][4] !== 'unlimited'){
                        texttosend[chat.id] += `👣 Количество посещений: ` + temp_program_types[chat.id][i][4] + `
`
                    }
                    
                    if (temp_program_types[chat.id][i][2] === 'morning') {
                        texttosend[chat.id] += `🕓 Часы посещения: с ` + morning_time[chat.id][0][0] + ':' + morning_time[chat.id][0][1] + ' по ' + morning_time[chat.id][1][0] + ':' + morning_time[chat.id][1][1] + `
`
                    }

                    if (temp_program_types[chat.id][i][2] === 'evening') {
                        texttosend[chat.id] += `🕓 Часы посещения: с ` + evening_time[chat.id][0][0] + ':' + evening_time[chat.id][0][1] + ' по ' + evening_time[chat.id][1][0] + ':' + evening_time[chat.id][1][1] + `
`
                    }

                    texttosend[chat.id] += `💰 Цена абонемента: ` + temp_program_types[chat.id][i][1] + ` тенге`

                    if (temp_program_types[chat.id][i][5] !== false){
                        texttosend[chat.id] += `

<i>❄️ В абонемент входит возможность заморозки (`+ temp_program_types[chat.id][i][5] +` дн.) </i>`
                    }

                    if (temp_program_types[chat.id][i][5] === false){
                        texttosend[chat.id] += `

<i>❄️ В абонемент не входит возможность заморозки </i>`
                    }
                    types_keyboard[chat.id][2][0] = 
                    {
                        text: fillabonement_text,
                        callback_data: fillabonement_text + temp_program_types[chat.id][i][3]
                    }
                    if (messages_todelete[chat.id][1] !== undefined){
                        bot.editMessageText(texttosend[chat.id], {
                            parse_mode: 'HTML',
                            chat_id: chat.id,
                            message_id: messages_todelete[chat.id][1],
                            reply_markup: {
                                inline_keyboard: types_keyboard[chat.id]
                            }
                        }).catch(err => {console.log('2 ' + err)})
                        .then(res => {messages_texts[chat.id][1] = res.text})
                    }

                    if (messages_todelete[chat.id][1] === undefined){
                        bot.sendMessage(chat.id, texttosend[chat.id], {
                            parse_mode: 'HTML',
                            reply_markup: {
                                inline_keyboard: types_keyboard[chat.id]
                            }
                        }) 
                        .then(res => {
                            messages_todelete[chat.id][1] = res.message_id
                            messages_texts[chat.id][1] = res.text
                        })
                        .catch(err => {console.log('1 ' + err)})
                    }
                    
                    
            }
        }

        for (let i = 0; i < userGyms[chat.id].length; i++){
            if (query.data === userGyms[chat.id][i]){
                userstatus[chat.id] = 'unknown'
                club_name_fb[chat.id] = userGyms[chat.id][i]
                console.log('@#$@%')
                
                for (let i=0; i<100; i++){
                    bot.deleteMessage(chat.id, message_id - i).catch(err => {
                        //console.log(err)
                    })
                }
                bot.sendSticker(chat.id, sticker_hello[Math.floor(Math.random() * sticker_hello.length)])
                .then(() => {
                    anotherpoint_multiple[chat.id] = 2
                    bot.sendMessage(chat.id, hellomessage_text, {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: keyboards.main_menu_keyboard
                        }
                    })
                    .then(() => {
                        IdentifyUser(chat.id)
                    })
                })
                
            }
        }
    
    for (let i = 0; i < userProgrammesList[chat.id].length; i++){
        if (query.data === userProgrammesList[chat.id][i]){
            //console.log('Кнопку нашли')
            userProgram[chat.id] = userProgrammesList[chat.id][i]
            let program_photo_link = []
            program_photo_link[chat.id] = ''
            let program_description = []
            program_description[chat.id] = ''
            let program_peopleamount = []
            program_peopleamount[chat.id] = ''
            let program_trener_link = []
            program_trener_link[chat.id] = ''
            let program_trener_name = []
            program_trener_name[chat.id] = ''
            let program_name = []
            program_name[chat.id] = ''
            
            bot.deleteMessage(chat.id, message_id).then(() => {
                let prg_info = fb.database().ref('Fitness/'+club_name_fb[chat.id]+'/Program/categories/' + userCategory[chat.id] + '/programmes/' + userProgram[chat.id] + '/')
                prg_info.get().then((snapshot) =>
                {
                    program_photo_link[chat.id] = snapshot.val().photo_link

                    program_description[chat.id] = snapshot.val().description
                    program_name[chat.id] = snapshot.val().name
                    program_trener_link[chat.id] = snapshot.val().trener_link
                    program_trener_name[chat.id] = snapshot.val().trener_name

                    program_peopleamount[chat.id] = snapshot.val().people_in_group

                    let pamount_values = []
                    pamount_values[chat.id] = []

                    if (program_peopleamount[chat.id] !== 'unlimited') {
                        pamount_values[chat.id] = program_peopleamount[chat.id].split('/')
                        pamount_values[chat.id][0] = parseInt(pamount_values[chat.id][0])
                        pamount_values[chat.id][1] = parseInt(pamount_values[chat.id][1])
                    }

                    let types_info = fb.database().ref('Fitness/'+club_name_fb[chat.id]+'/Program/categories/' + userCategory[chat.id] + '/programmes/' + userProgram[chat.id] + '/types/')
                    types_info.get().then((snapshot) => {
                        let types_amount = []
                        types_amount[chat.id] = Object.keys(snapshot.val())
                        types_keyboard[chat.id] = [[],[], []]
                        types_keyboard[chat.id][0][0] = 
                        {
                            text: anotherprogram_text,
                            callback_data: anotherprogram_text
                        }
                        console.log(Object.keys(snapshot.val()))
                        for (let i = 0; i < types_amount[chat.id].length; i++){
                            let info = fb.database().ref('Fitness/'+club_name_fb[chat.id]+'/Program/categories/' + userCategory[chat.id] + '/programmes/' + userProgram[chat.id] + '/types/' + types_amount[chat.id][i])
                            info.get().then((result) => {
                                temp_program_types[chat.id][i] = [result.val().period, result.val().price, result.val().time, result.val().type_name, result.val().visits, result.val().is_freeze, program_name[chat.id]] 
                                console.log(temp_program_types[chat.id][i])
                                if (pamount_values[chat.id][0] < pamount_values[chat.id][1] || program_peopleamount[chat.id] === 'unlimited') {
                                    types_keyboard[chat.id][1][i] = 
                                    {
                                        text: result.val().type_name,
                                        callback_data: choosetype_callback + result.val().type_name
                                    }
                                }
                                

                                if (i === types_amount[chat.id].length - 1){
                                    temp_food_text[chat.id] = `<b>` + program_name[chat.id] + `</b>
` + program_description[chat.id]
                                    if (program_trener_link[chat.id] !== 'unknown' && program_trener_name[chat.id] !== 'unknown') {
                                        temp_food_text[chat.id] += `
                                            
<b>Тренер: </b><a href="`+ program_trener_link[chat.id] +`">`+ program_trener_name[chat.id] + `</a>` 
                                    }
                                    if (program_trener_link[chat.id] === 'unknown' && program_trener_name[chat.id] !== 'unknown') {
                                        temp_food_text[chat.id] += `
                                            
<b>Тренер: </b>`+ program_trener_name[chat.id] 
                                    }

                                    if (program_peopleamount[chat.id] !== 'unlimited'){
                                        temp_food_text[chat.id] += `
                                    
<b>Записались:</b> ` + program_peopleamount[chat.id]
                                    }

                                    

                                    if (pamount_values[chat.id][0] < pamount_values[chat.id][1] ||  program_peopleamount[chat.id] === 'unlimited') {
                                        temp_food_text[chat.id] += `
                                    
Выберите подходящий тип программы: `
                                    }

                                    if (pamount_values[chat.id][0] >= pamount_values[chat.id][1]) {
                                        favourite_program[chat.id] = myprogram_type[chat.id][6]
                                        if (waitlist[chat.id] === ''){
                                            waitlist[chat.id] = myprogram_type[chat.id][6]
                                            let wait_data = fb.database().ref('Fitness/'+club_name_fb[chat.id]+'/mailing/waitlist/programmes/' + myprogram_type[chat.id][6])
                                            wait_data.get().then((result) => {
                                                let local_waitlist = result.val()
                                                let lists_array = local_waitlist.split(',')
                                                for(let i = 0; i<lists_array; i++){
                                                    if (lists_array[i] === chat.id){
                                                        break
                                                    }
                                                    if (i === lists_array - 1 && lists_array[i] !== chat.id){
                                                        if (local_waitlist = '0'){
                                                            local_waitlist = (chat.id).toString()
                                                        }
                                                        if (local_waitlist !== '0'){
                                                            local_waitlist += ',' + chat.id
                                                        }
    
                                                        let updates = {}
                                                        updates['Fitness/'+club_name_fb[chat.id]+'/mailing/waitlist/programmes/' + myprogram_type[chat.id][6]] = local_waitlist
                                                        fb.database().ref().update(updates)
                                                    }
                                                }
                                            })
                                        }
                                        
                                        temp_food_text[chat.id] += `
                                    
<i>К сожалению, все места заняты</i> `
                                        types_keyboard[chat.id][1][0] = 
                                        {
                                            text: 'Оставить заявку',
                                            url: 'https://t.me/' + support_username[chat.id]
                                        }
                                    }
                                    

                                    bot.sendPhoto(chat.id, program_photo_link[chat.id], {
                                        parse_mode: 'HTML',
                                        caption: temp_food_text[chat.id],
                                        reply_markup:{
                                            inline_keyboard:types_keyboard[chat.id]
                                        }
                                    })
                                    .then(res => {
                                        messages_todelete[chat.id][0] = res.message_id
                                        messages_texts[chat.id][0] = res.caption
                                    })
                                    .catch(err => {console.log(err)})
                                }
                            })
                        }
                    })

                }).catch((err) => {console.log(err)})
            })
        }
    }

        for (let i = 0; i < userTreners[chat.id].length; i++){
            if (query.data === userTreners[chat.id][i]){
                userTrener[chat.id] = userTreners[chat.id][i]

                bot.deleteMessage(chat.id, message_id).then(() => {
                    let prg_info = fb.database().ref('Fitness/'+club_name_fb[chat.id]+'/treners/' + userTreners[chat.id][i])
                    prg_info.get().then((snapshot) =>
                    {
                        let description = snapshot.val().description
                        let name = snapshot.val().name
                        let social_link = snapshot.val().social_link
                        let photo_link = snapshot.val().photo
                        
                        const texty = `<b>`+ name +`</b>
` + description

                        bot.sendPhoto(chat.id, photo_link, {
                            parse_mode: 'HTML',
                            caption: texty,
                            reply_markup:{
                                inline_keyboard:[
                                    [{
                                        text: 'Узнать больше',
                                        url: social_link
                                    }],
                                    [{
                                        text: backtotreners_text[0],
                                        callback_data: backtotreners_text[1]
                                    }]
                                ]
                            }
                        })
                        .then(res => {
                            messages_todelete[chat.id][0] = res.message_id
                            messages_texts[chat.id][0] = res.caption
                        })
                        .catch(err => {console.log(err)})
    
                    }).catch((err) => {console.log(err)})
                })
            }
        }

    
    if (query.data === anotherprogram_text){
        userProgram[chat.id] = ''
        bot.deleteMessage(chat.id, messages_todelete[chat.id][0]).catch(err => {console.log(err)})
        .then(() => {messages_todelete[chat.id][0] = undefined})
        if (messages_todelete[chat.id][1] !== null){
            console.log('!!')
            bot.deleteMessage(chat.id, messages_todelete[chat.id][1]).catch(err => {console.log(err)})
            .then(() => {messages_todelete[chat.id][1] = undefined})
        }
        keyboards.ProgramKeyboard(programmes_keyboard[chat.id], userProgrammesList[chat.id], userCategory[chat.id], fb, bot, chat, message_id, anothercategory_text, chooseprogramme_text, club_name_fb[chat.id])
        
    }

    if (query.data === backtotreners_text[1]){
        userTrener[chat.id] = ''
        bot.deleteMessage(chat.id, messages_todelete[chat.id][0]).catch(err => {console.log(err)})
        .then(() => {messages_todelete[chat.id][0] = undefined})
        if (messages_todelete[chat.id][1] !== null){
            console.log('!!')
            bot.deleteMessage(chat.id, messages_todelete[chat.id][1]).catch(err => {console.log(err)})
            .then(() => {messages_todelete[chat.id][1] = undefined})
        }
        keyboards.TrenersKeyboard(trener_keyboard[chat.id], userTreners[chat.id], fb, bot, chat.id, backtomain_text, choosetrener_text, club_name_fb[chat.id])        
    }

    if (query.data === fillabonement_text + myprogram_type[chat.id][3]){
        bot.editMessageText(messages_texts[chat.id][1], {
            parse_mode: 'HTML',
            chat_id: chat.id,
            message_id: messages_todelete[chat.id][1]
        })
        CheckUser(chat.id, chat.first_name, chat.id, message_id)
    }

    if (query.data === backtofillinginfo_text[1]){
        bot.deleteMessage(chat.id, add_info_msg[chat.id])
        CheckUser(chat.id, chat.first_name, chat.id, message_id)
    }

    if (query.data === backtoprogramme_text[1]){
        console.log('14^ '  + add_info_msg[chat.id])
        bot.deleteMessage(chat.id, messages_todelete[chat.id][2]).catch(err => {console.log('124 ' + err)})
        bot.editMessageText(messages_texts[chat.id][1], {
            parse_mode: 'HTML',
            chat_id: chat.id,
            message_id: messages_todelete[chat.id][1],
            reply_markup: {
                inline_keyboard: types_keyboard[chat.id]
            }
        })
    }

    if (query.data === backtochoosepaingmethod_text[1]){
        user_payingmethod[chat.id] = ''
        bot.editMessageText(dopblank_text, {
            parse_mode: 'HTML',
            chat_id: chat.id,
            message_id: message_id,
            reply_markup:{
                inline_keyboard:[
                    [{
                        text: backtofillinginfo_text[0],
                        callback_data: backtofillinginfo_text[1]
                    }],
                    [{
                        text: user_payingmethods[0][0],
                        callback_data: user_payingmethods[0][1]
                    },
                    {
                        text: user_payingmethods[1][0],
                        callback_data: user_payingmethods[1][1]
                    }]
                ]
            }
        }).then(() => {
            add_info_msg[chat.id] = message_id
            console.log('savedmessage = ' + add_info_msg[chat.id] + ', ' + message_id)
        })
    }

    if (query.data === user_payingmethods[0][1]){
        user_payingmethod[chat.id] = user_payingmethods[0][0]
        let finaltext = card_instructions_text + `

<b>🧾 Ваш абонемент:</b> 
├ Программа: ` + myprogram_type[chat.id][6] + `
├ Длительность: ` + myprogram_type[chat.id][0] + ` мес. 
└ Цена: ` + myprogram_type[chat.id][1] + ` тенге
                
<b>💳 Реквизиты:</b>`
        
        if (card_data[chat.id][0] !== 0) {
            finaltext += `
├ KASPI номер: ` + card_data[chat.id][0]
        }
        
        if (card_data[chat.id][1] !== 0){
            finaltext += `
├ Карта: ` + card_data[chat.id][1]
        }
        
        finaltext += `
└ ФИО: ` + card_data[chat.id][2]

        bot.editMessageText(finaltext, {
            parse_mode: 'HTML',
            chat_id: chat.id,
            message_id: message_id,
            reply_markup:{
                inline_keyboard:[
                    [{
                        text: backtochoosepaingmethod_text[0],
                        callback_data: backtochoosepaingmethod_text[1]
                    }],
                    [{
                        text: ihavepaid_text[0],
                        callback_data: dataiscorrect2_text
                    }]
                ]
            }
        })
    }

    if (query.data === user_payingmethods[1][1]){
        user_payingmethod[chat.id] = user_payingmethods[1][0]
        let finaltext = cash_instructions_text + `

<b>🧾 Ваш абонемент:</b> 
├ Программа: ` + myprogram_type[chat.id][6] + `
├ Длительность: ` + myprogram_type[chat.id][0] + ` мес. 
└ Цена: ` + myprogram_type[chat.id][1] + ` тенге`

        bot.editMessageText(finaltext, {
            parse_mode: 'HTML',
            chat_id: chat.id,
            message_id: message_id,
            reply_markup:{
                inline_keyboard:[
                    [{
                        text: backtochoosepaingmethod_text[0],
                        callback_data: backtochoosepaingmethod_text[1]
                    }],
                    [{
                        text: ihavepaid_text[0],
                        callback_data: ihavepaid_text[1]
                    }]
                ]
            }
        })
    }

    if (query.data === dataiscorrect2_text){
        bot.editMessageText('Вы уверены, что совершили оплату?', {
            parse_mode: 'HTML',
            chat_id: chat.id,
            message_id: message_id,
            reply_markup:{
                inline_keyboard:[
                    [{
                        text: backtochoosepaingmethod_text[0],
                        callback_data: backtochoosepaingmethod_text[1]
                    }],
                    [{
                        text: 'Да, я оплатил',
                        callback_data: ihavepaid_text[1]
                    }]
                ]
            }
        })
    }

    if (query.data === ihavepaid_text[1]){
        favourite_program[chat.id] = myprogram_type[chat.id][6]
        //Создаем акк и отправляем чек в группу админов
        if (userstatus[chat.id] !== 'unregistered'){

        }

        else {
            bot.deleteMessage(chat.id, message_id).then(() => 
            {
                abonement_status[chat.id] = abonement_statuses_text[0]
                bot.sendChatAction(chat.id, 'upload_document')
                .catch(err => {console.log('24 ' + err)})
                
                let updates = {};

/*                 let date = new Date()
                let utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
                let timeOfffset = 6 //Astana GMT +6
                let Astana_date = new Date(utcTime + (3600000 * timeOfffset))
                let date_now = Astana_date.getDate() + '_' + (Astana_date.getMonth() + 1) + '_' + Astana_date.getFullYear() + '__' + Astana_date.getHours() + '_' + Astana_date.getMinutes()                
 */
               

                ////////////////////ОТПРАВКА ЧЕКА///////////////////////////////////                 
    
/* let minutes = Astana_date.getMinutes()
if (minutes < 10) minutes = '0' + minutes
let hours = Astana_date.getHours()
if (hours < 10) hours = '0' + hours
let visible_date = /* new Intl.DateTimeFormat('ru-RU', options).format(Astana_date) + ' ' +  hours + ':' + minutes + ', ' + Astana_date.getDate() + '.' + (Astana_date.getMonth() + 1)
*/
    abonements_bill_topic = abonement_bill_topic_names[0]
    abonemets_bill_client_info = `

<b>👤 Заказчик</b>
├ ФИО: ` + user_name[chat.id] + `
└ Номер: ` + user_phone[chat.id] + `

`
    abonements_bill_order_info = `<b>🧾 Описание абонемента:</b>
├ Программа: ` + myprogram_type[chat.id][6] + `
├ Срок действия: ` + myprogram_type[chat.id][0] + ` мес.
└ Стоимость: ` + myprogram_type[chat.id][1] + `  тенге.

`

if (myprogram_type[chat.id][2] === 'unlimited'){
    abonements_bill_order_info += `<b>ℹ️ Дополнительно:</b>
├ Время суток: неограниченное`
}

if (myprogram_type[chat.id][2] !== 'unlimited'){
    if (myprogram_type[chat.id][2] === 'morning'){
        abonements_bill_order_info += `<b>ℹ️ Дополнительно:</b>
├ Время суток: c ` + morning_time[chat.id][0][0] + `:` + morning_time[chat.id][0][1] + ` до ` + morning_time[chat.id][1][0] + `:` + morning_time[chat.id][1][1] 
    }

    if (myprogram_type[chat.id][2] === 'evening'){
        abonements_bill_order_info += `<b>ℹ️ Дополнительно:</b>
├ Время суток: c ` + evening_time[chat.id][0][0] + `:` + evening_time[chat.id][0][1] + ` до ` + evening_time[chat.id][1][0] + `:` + evening_time[chat.id][1][1] 
    }
}

if (myprogram_type[chat.id][4] === 'unlimited'){
    abonements_bill_order_info += `
├ Кол-во посещений: неограниченное`
}

if (myprogram_type[chat.id][4] !== 'unlimited'){
    abonements_bill_order_info += `
├ Кол-во посещений: ` + myprogram_type[chat.id][4]
}

if (myprogram_type[chat.id][5] === false){
    abonements_bill_order_info += `
└ Нет функции заморозки`
}

if (myprogram_type[chat.id][5] !== false){
    abonements_bill_order_info += `
└ Кол-во заморозок: ` + myprogram_type[chat.id][5] + ` дней.`
}

    console.log('order_date! ' + order_date[chat.id])
    abonements_bill = abonements_bill_topic + abonemets_bill_client_info + abonements_bill_order_info
    //console.log('last message id: ' + query.message.message_id)

    let username = []
    username[chat.id] = "undefined"
    if (chat.username != undefined) username[chat.id] = chat.username.toString()

    let newuser = {
        coins: user_coins[chat.id],
        email: user_email[chat.id],
        favourite_program: favourite_program[chat.id],
        id: chat.id,
        name: user_name[chat.id],
        phone: user_phone[chat.id],
        username: username[chat.id],
        abonements_bought: abonements_bought[chat.id],
        times_came: user_timescame[chat.id],
        bill_text: abonements_bill,
        bill_msg: 0,
        abonement: {
            name: myprogram_type[chat.id][6],
            time: myprogram_type[chat.id][2],
            visits: myprogram_type[chat.id][4],
            freeze_amount: myprogram_type[chat.id][5],
            period: myprogram_type[chat.id][0],
            price: myprogram_type[chat.id][1],
            freeze_start: '0',
            start_date: '0',
            end_date: '0',
            abonement_status: abonement_statuses_text[0],
            activator_name: 'unknown',
            activator_id: 'unknown',
            paying_method: user_payingmethod[chat.id]
        }
    }

    order_name[chat.id] = 'Fitness/'+club_name_fb[chat.id]+'/clients/' + chat.id
    console.log('ORDER NAME: ' + order_name[chat.id])

    userstatus[chat.id] = 'registered'
    updates[order_name[chat.id]] = newuser

    fb.database().ref().update(updates)
    StartCheckingOrder(chat.id)
    //AddMailingData()

    console.log('delivery_chat: ' + operators_chat[chat.id])
    let cr_chat = fb.database().ref('Fitness/'+club_name_fb[chat.id]+'/chats/');
    cr_chat.get().then((snapshot) => {
        operators_chat[chat.id] = snapshot.val().operators_chat
        console.log('IT WORKS: ' + operators_chat[chat.id])

        bot.sendMessage(operators_chat[chat.id], abonements_bill, {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard:[
                    [{
                        text: '✅ Создать абонемент',
                        callback_data: accept_order_callback + chat.id
                    }],
                    [{
                        text: '❌ Отклонить заказ',
                        callback_data: refuse_order_callback + chat.id
                    }]
                ]
            }
        }).then(() => {
            bot.sendMessage(chat.id, abonementrequest_sended, {
                reply_markup: {
                    keyboard: unregistered_keyboard[3],
                    resize_keyboard: true

                }
            })
        })
    })
    

    ////////////////////////////////////////////////////////////////////////

                //console.log('Date: ' + date_now.getHours() + ':' + date_now.getMinutes())
            })
        }
    }

    if (query.data === accepttraining_text[1]){
        bot.deleteMessage(chat.id, message_id)
        StartTraining(chat.id, message_id)
    }
    if (query.data === refusetraining_text[1]){
        bot.deleteMessage(chat.id, message_id)
    }

    if (query.data === anotherfood_text2){
        /* bot.editMessageText(choosefood_text,
            {
                parse_mode: 'HTML',
                chat_id: chat.id,
                message_id: message_id, //!!!! НЕ ТОТ МЕССЕДЖ ID УДАЛЯЕМ
                reply_markup:{
                    inline_keyboard:foodlist_keyboard[chat.id]
                }
            }) */
            userProgram[chat.id] = ''
            keyboards.ProgramKeyboard(programmes_keyboard[chat.id], userProgrammesList[chat.id], foodlist_count[chat.id], userCategory[chat.id], fb, bot, chat, message_id, anothercategory_text, query, chooseprogramme_text, club_name_fb[chat.id])

        //bot.deleteMessage(chat.id, message_id - 1)
    }
    if (query.data === addto_basket_text){
        bot.editMessageText(text, {
            chat_id: chat.id,
            message_id: message_id
        }) //убираем клаву в описании блюда
        for (let i = 0; i < basket[chat.id].length; i++){
            console.log('!!!! ' + basket[chat.id][i][0] + ' ' + userProgrammesList[chat.id][userProgram[chat.id]])
            if (basket[chat.id][i][0] === userProgrammesList[chat.id][userProgram[chat.id]]){

                bot.sendMessage(chat.id, chooseamountoffood_text + basket[chat.id][i][1] + ' x ' + temp_program_types[chat.id] + 'тг. = ' + (basket[chat.id][i][1] * temp_program_types[chat.id] + 'тг.'), {
                    reply_markup:{
                        inline_keyboard:[
                            [{
                                text: decrease_foodcount,
                                callback_data: decrease_foodcount
                            },
                            {
                                text: increase_foodcount,
                                callback_data: increase_foodcount
                            }],
                            [{
                                
                                text: dont_addto_basket_text2,
                                callback_data: dont_addto_basket_text2
                            },
                            {
                                text: addto_basket_text2,
                                callback_data: addto_basket_text2
                            }]
                        ]
                    }
                })
                break
            }
            if (i === basket[chat.id].length - 1 && basket[chat.id][i][0] !== userProgrammesList[chat.id][userProgram[chat.id]]){
                //когда мы проверили все ячейки и ни одна не совпала...
                console.log('ALARM2: ' + i + ' ' + basket[chat.id].length)
                /*if (i === basket[chat.id].length){
                    bot.sendMessage(chat.id, chooseamountoffood_text + temp_foodamount[chat.id] + ' x ' + temp_food_price[chat.id] + 'тг. = ' + (temp_foodamount[chat.id] * temp_food_price[chat.id] + 'тг.'), {
                        reply_markup:{
                            inline_keyboard:[
                                [{
                                    text: decrease_foodcount,
                                    callback_data: decrease_foodcount
                                },
                                    {
                                        text: increase_foodcount,
                                        callback_data: increase_foodcount
                                    }],
                                [{
                                    text: addto_basket_text2,
                                    callback_data: addto_basket_text2
                                },
                                    {
                                        text: dont_addto_basket_text2,
                                        callback_data: dont_addto_basket_text2
                                    }]
                            ]
                        }
                    })
                }*/
                temp_foodamount[chat.id] = 1
                bot.sendMessage(chat.id, chooseamountoffood_text + temp_foodamount[chat.id] + ' x ' + temp_program_types[chat.id] + 'тг. = ' + (temp_foodamount[chat.id] * temp_program_types[chat.id] + 'тг.'), {
                    reply_markup:{
                        inline_keyboard:[
                            [{
                                text: decrease_foodcount,
                                callback_data: decrease_foodcount
                            },
                                {
                                    text: increase_foodcount,
                                    callback_data: increase_foodcount
                                }],
                            [{
                                text: dont_addto_basket_text2,
                                callback_data: dont_addto_basket_text2
                            },
                            {
                                text: addto_basket_text2,
                                callback_data: addto_basket_text2
                            }]
                        ]
                    }
                })
            }
        }
        if (basket[chat.id].length === 0){
            //когда мы проверили все ячейки и ни одна не совпала...
            bot.sendMessage(chat.id, chooseamountoffood_text + temp_foodamount[chat.id] + ' x ' + temp_program_types[chat.id] + 'тг. = ' + (temp_foodamount[chat.id] * temp_program_types[chat.id] + 'тг.'), {
                reply_markup:{
                    inline_keyboard:[
                        [{
                            text: decrease_foodcount,
                            callback_data: decrease_foodcount
                        },
                            {
                                text: increase_foodcount,
                                callback_data: increase_foodcount
                            }],
                        [{
                            text: dont_addto_basket_text2,
                            callback_data: dont_addto_basket_text2
                        },
                        {
                            text: addto_basket_text2,
                            callback_data: addto_basket_text2
                        }]
                    ]
                }
            })
        }
    }
    //тут мы прибавляем или убавляем кол-во выбранного блюда
    if (query.data === increase_foodcount || query.data === decrease_foodcount){
        console.log(decrease_foodcount + ' ' + increase_foodcount + ' ' + dont_addto_basket_text2 + ' ' + addto_basket_text2)
        if (query.data === increase_foodcount){
            for (let i = 0; i < basket[chat.id].length; i++){
                console.log('226 ' + basket[chat.id][i][0] + ' ' + userProgrammesList[chat.id][userProgram[chat.id]])
                if (basket[chat.id][i][0] === userProgrammesList[chat.id][userProgram[chat.id]]){
                    basket[chat.id][i][1]++
                    console.log('increasing existing food postion +1 ' + basket[chat.id][i][1])
                    bot.editMessageText(chooseamountoffood_text + basket[chat.id][i][1] + ' x ' + temp_program_types[chat.id] + 'тг. = ' + (basket[chat.id][i][1] * temp_program_types[chat.id]) + 'тг.', {
                        chat_id: chat.id,
                        message_id: message_id,
                        reply_markup:{
                            inline_keyboard:[
                                [{
                                    text: decrease_foodcount,
                                    callback_data: decrease_foodcount
                                },
                                    {
                                        text: increase_foodcount,
                                        callback_data: increase_foodcount
                                    }],
                                [{
                                    text: dont_addto_basket_text2,
                                    callback_data: dont_addto_basket_text2
                                },
                                {
                                    text: addto_basket_text2,
                                    callback_data: addto_basket_text2
                                }]
                            ]
                        }
                    })
                    break
                }
                if (i === basket[chat.id].length - 1 && basket[chat.id][i][0] !== userProgrammesList[chat.id][userProgram[chat.id]]){
                    console.log('227 ' + basket[chat.id][i][0] + ' ' + userProgrammesList[chat.id][userProgram[chat.id]])
                    temp_foodamount[chat.id]++
                        bot.editMessageText(chooseamountoffood_text + temp_foodamount[chat.id] + ' x ' + temp_program_types[chat.id] + 'тг. = ' + (temp_foodamount[chat.id] * temp_program_types[chat.id]) + 'тг.', {
                            chat_id: chat.id,
                            message_id: message_id,
                            reply_markup:{
                                inline_keyboard:[
                                    [{
                                        text: decrease_foodcount,
                                        callback_data: decrease_foodcount
                                    },
                                        {
                                            text: increase_foodcount,
                                            callback_data: increase_foodcount
                                        }],
                                    [{
                                        text: dont_addto_basket_text2,
                                        callback_data: dont_addto_basket_text2
                                    },
                                    {
                                        text: addto_basket_text2,
                                        callback_data: addto_basket_text2
                                    }]
                                ]
                            }
                        })
                        break
                }
            }
            if (basket[chat.id].length === 0){
                temp_foodamount[chat.id]++
                bot.editMessageText(chooseamountoffood_text + temp_foodamount[chat.id] + ' x ' + temp_program_types[chat.id] + 'тг. = ' + (temp_foodamount[chat.id] * temp_program_types[chat.id]) + 'тг.', {
                    chat_id: chat.id,
                    message_id: message_id,
                    reply_markup:{
                        inline_keyboard:[
                            [{
                                text: decrease_foodcount,
                                callback_data: decrease_foodcount
                            },
                                {
                                    text: increase_foodcount,
                                    callback_data: increase_foodcount
                                }],
                            [{
                                text: dont_addto_basket_text2,
                                callback_data: dont_addto_basket_text2
                            },
                            {
                                text: addto_basket_text2,
                                callback_data: addto_basket_text2
                            }]
                        ]
                    }
                })
            }
        }
        if (query.data === decrease_foodcount){
            console.log('descrease')
            for (let i = 0; i < basket[chat.id].length; i++){
                if (basket[chat.id][i][0] === userProgrammesList[chat.id][userProgram[chat.id]]){
                    if (basket[chat.id][i][1] > 1){
                        basket[chat.id][i][1]--
                        bot.editMessageText(chooseamountoffood_text + basket[chat.id][i][1] + ' x ' + temp_program_types[chat.id] + 'тг. = ' + (basket[chat.id][i][1] * temp_program_types[chat.id]) + 'тг.', {
                            chat_id: chat.id,
                            message_id: message_id,
                            reply_markup:{
                                inline_keyboard:[
                                    [{
                                        text: decrease_foodcount,
                                        callback_data: decrease_foodcount
                                    },
                                        {
                                            text: increase_foodcount,
                                            callback_data: increase_foodcount
                                        }],
                                    [{
                                        text: dont_addto_basket_text2,
                                        callback_data: dont_addto_basket_text2
                                    },
                                    {
                                        text: addto_basket_text2,
                                        callback_data: addto_basket_text2
                                    }]
                                ]
                            }
                        })
                    }
                }
                else{
                    //когда мы проверили все ячейки и ни одна не совпала...
                    /*if (i === basket[chat.id].length){
                        if (temp_foodamount[chat.id] > 1){
                            temp_foodamount[chat.id]--
                            bot.editMessageText(chooseamountoffood_text + temp_foodamount[chat.id] + ' x ' + temp_food_price[chat.id] + 'тг. = ' + (temp_foodamount[chat.id] * temp_food_price[chat.id]) + 'тг.', {
                                chat_id: chat.id,
                                message_id: message_id,
                                reply_markup:{
                                    inline_keyboard:[
                                        [{
                                            text: decrease_foodcount,
                                            callback_data: decrease_foodcount
                                        },
                                            {
                                                text: increase_foodcount,
                                                callback_data: increase_foodcount
                                            }],
                                        [{
                                            text: addto_basket_text2,
                                            callback_data: addto_basket_text2
                                        },
                                            {
                                                text: dont_addto_basket_text2,
                                                callback_data: dont_addto_basket_text2
                                            }]
                                    ]
                                }
                            })
                        }
                    }*/

                    if (temp_foodamount[chat.id] > 1){
                        temp_foodamount[chat.id]--
                        bot.editMessageText(chooseamountoffood_text + temp_foodamount[chat.id] + ' x ' + temp_program_types[chat.id] + 'тг. = ' + (temp_foodamount[chat.id] * temp_program_types[chat.id]) + 'тг.', {
                            chat_id: chat.id,
                            message_id: message_id,
                            reply_markup:{
                                inline_keyboard:[
                                    [{
                                        text: decrease_foodcount,
                                        callback_data: decrease_foodcount
                                    },
                                        {
                                            text: increase_foodcount,
                                            callback_data: increase_foodcount
                                        }],
                                    [{
                                        text: dont_addto_basket_text2,
                                        callback_data: dont_addto_basket_text2
                                    },
                                    {
                                        text: addto_basket_text2,
                                        callback_data: addto_basket_text2
                                    }]
                                ]
                            }
                        })
                        break
                    }
                }
            }
            if (basket[chat.id].length === 0){
                if (temp_foodamount[chat.id] > 1){
                    temp_foodamount[chat.id]--
                    bot.editMessageText(chooseamountoffood_text + temp_foodamount[chat.id] + ' x ' + temp_program_types[chat.id] + 'тг. = ' + (temp_foodamount[chat.id] * temp_program_types[chat.id]) + 'тг.', {
                        chat_id: chat.id,
                        message_id: message_id,
                        reply_markup:{
                            inline_keyboard:[
                                [{
                                    text: decrease_foodcount,
                                    callback_data: decrease_foodcount
                                },
                                    {
                                        text: increase_foodcount,
                                        callback_data: increase_foodcount
                                    }],
                                [{
                                    text: dont_addto_basket_text2,
                                    callback_data: dont_addto_basket_text2
                                },
                                {
                                    text: addto_basket_text2,
                                    callback_data: addto_basket_text2
                                }]
                            ]
                        }
                    })
                }
            }
        }
    }
    if (query.data === increase_foodcount2 || query.data === decrease_foodcount2){
        if (query.data === increase_foodcount2){
            console.log('Увеличиваем: ' + basket[chat.id][temp_backet_food[chat.id]][0])
            basket[chat.id][temp_backet_food[chat.id]][1]++
            bot.editMessageText(chooseamountoffood_text + basket[chat.id][temp_backet_food[chat.id]][1] + ' x ' + basket[chat.id][temp_backet_food[chat.id]][2] + 'тг. = ' + (basket[chat.id][temp_backet_food[chat.id]][1] * basket[chat.id][temp_backet_food[chat.id]][2]) + 'тг.', {
                chat_id: chat.id,
                message_id: message_id,
                reply_markup:{
                    inline_keyboard:[
                        [{
                            text: decrease_foodcount,
                            callback_data: decrease_foodcount2
                        },
                            {
                                text: increase_foodcount,
                                callback_data: increase_foodcount2
                            }],
                        [{
                            text: dont_addto_basket_text2,
                            callback_data: delete_basketfood
                        },
                        {
                            text: addto_basket_text2,
                            callback_data: addto_basket_text3
                        }]
                    ]
                }
            })
        }
        if (query.data === decrease_foodcount2){
            console.log('Уменьшаем: ' + basket[chat.id][temp_backet_food[chat.id]][0])
            basket[chat.id][temp_backet_food][1]--
            bot.editMessageText(chooseamountoffood_text + basket[chat.id][temp_backet_food[chat.id]][1] + ' x ' + basket[chat.id][temp_backet_food[chat.id]][2] + 'тг. = ' + (basket[chat.id][temp_backet_food[chat.id]][1] * basket[chat.id][temp_backet_food[chat.id]][2]) + 'тг.', {
                chat_id: chat.id,
                message_id: message_id,
                reply_markup:{
                    inline_keyboard:[
                        [{
                            text: decrease_foodcount,
                            callback_data: decrease_foodcount2
                        },
                            {
                                text: increase_foodcount,
                                callback_data: increase_foodcount2
                            }],
                        [{
                            text: dont_addto_basket_text2,
                            callback_data: delete_basketfood
                        },
                        {
                            text: addto_basket_text2,
                            callback_data: addto_basket_text3
                        }]
                    ]
                }
            })
        }
    }
    if (query.data === dont_addto_basket_text2){
        for (let i = 0; i < basket[chat.id].length; i++){
            if (userProgrammesList[chat.id][userProgram[chat.id]] === basket[chat.id][i][0]){
                basket[chat.id].splice(i, 1)
                console.log('DELETED')
                //тут можно выводить список если удаляем предмет, а если еще не добавляли то нет
            }
        }
        bot.deleteMessage(chat.id, message_id).then(() => {
            bot.editMessageText(temp_food_text[chat.id], {
                parse_mode: 'HTML',
                chat_id: chat.id,
                message_id: message_id - 1,
                reply_markup:{
                    inline_keyboard: [
                        [{
                            text: addto_basket_text,
                            callback_data: addto_basket_text
                        }],
                        [{
                            text: anotherprogram_text,
                            callback_data: anotherprogram_text
                        }]
                    ]
                }
            })
        })
    }
    if (query.data === yesigotorder_text){
        for(let i = 0; i < 100; i++){
            if (i <= 98){
                bot.deleteMessage(chat.id, message_id - i - 1).catch(err => {
                    console.log('Очистка закончена: ' + err)
                })
            }
            if (i === 99){
                bot.deleteMessage(chat.id, message_id - i - 1).catch(err => {
                    console.log('Очистка закончена: ' + err)
                }).then(() => {
                    bot.sendMessage(chat.id, hellomessage_text,
                        {
                                reply_markup:{
                                    inline_keyboard:[
                                        [{
                                            text: 'Нур-Султан',
                                            callback_data: 'Нур-Султан'
                                        }]/*,
                                        [{
                                            text: 'Алматы',
                                            callback_data: 'Алматы'
                                        }]*/
                                    ]
                                }
                        })
                })
                
            }
        }
        
    }
    if (query.data === changename_text){
        isMakingChanges[chat.id] = 1
        bot.editMessageText('🙂 Введите свое имя, оно будет указано на абонементе:', {
            chat_id: chat.id, 
            message_id: message_id,
        })
        .then(res => 
            {
                add_info_msg[chat.id] = res.message_id
                messages_todelete[chat.id][2] = res.message_id
            })
    }
    if (query.data === changephone_text){
        isMakingChanges[chat.id] = 2
        bot.editMessageText('📞 Введите свой номер, мы свяжемся с Вами если это потребуется:', {
            chat_id: chat.id, 
            message_id: message_id,
        })
        .then(res => 
            {
                add_info_msg[chat.id] = res.message_id
                messages_todelete[chat.id][2] = res.message_id
            })
    }
    if (query.data === changeadress_text){
        isMakingChanges[chat.id] = 3
        bot.editMessageText('📍 Введите адрес доставки в формате Улица, Дом, Квартира, Этаж:', {
            chat_id: chat.id, 
            message_id: message_id,
        })
    }
    if (query.data === changeamountof_persons){
        isMakingChanges_2[chat.id] = 1
        bot.editMessageText('👥 Введите количество персон: ', {
            chat_id: chat.id, 
            message_id: add_info_msg[chat.id],
        })
    }
    if (query.data === changepaying_method){
        //isMakingChanges_2[chat.id] = 2
        bot.editMessageText('💳 Выберите способ оплаты', {
            chat_id: chat.id, 
            message_id: add_info_msg[chat.id],
            reply_markup:{
                inline_keyboard:[
                    [{
                        text: 'Наличными курьеру',
                        callback_data: /* user_payingmethod[chat.id].toString() + */ 'Наличными курьеру'
                    }],
                    [{
                        text: 'Безналичными курьеру',
                        callback_data: /* user_payingmethod[chat.id].toString() +  */'Безналичными курьеру'
                    }]
                ]
            }
        })
    }
    if (query.data === /* user_payingmethod[chat.id] +  */'Наличными курьеру' || query.data === /* user_payingmethod[chat.id] + */ 'Безналичными курьеру'){
        if (query.data === /* user_payingmethod[chat.id] + */ 'Наличными курьеру'){
            user_payingmethod[chat.id] = 'Наличными курьеру'

            bot.editMessageText(dopblank_text, {
                chat_id: chat.id, 
                message_id: add_info_msg[chat.id],
                reply_markup:{
                    inline_keyboard:[
                        [{
                            text: 'Кол-во персон: ' + user_personsamount[current_chat],
                            callback_data: changeamountof_persons
                        }],
                        [{
                            text: 'Когда доставить: ' + user_deliverdate[current_chat],
                            callback_data: changedeliver_date
                        }],
                        [{
                            text: 'Способ оплаты: ' + user_payingmethod[current_chat],
                            callback_data: changepaying_method
                        }],
                        [{
                            text: dataiscorrect_text,
                            callback_data: dataiscorrect2_text
                        }]
                    ]
                }
            })
        }

        else if (query.data === /* user_payingmethod[chat.id] + */ 'Безналичными курьеру'){
            user_payingmethod[chat.id] = 'Безналичными курьеру'

            bot.editMessageText(dopblank_text, {
                chat_id: chat.id, 
                message_id: add_info_msg[chat.id],
                reply_markup:{
                    inline_keyboard:[
                        [{
                            text: 'Кол-во персон: ' + user_personsamount[current_chat],
                            callback_data: changeamountof_persons
                        }],
                        [{
                            text: 'Когда доставить: ' + user_deliverdate[current_chat],
                            callback_data: changedeliver_date
                        }],
                        [{
                            text: 'Способ оплаты: ' + user_payingmethod[current_chat],
                            callback_data: changepaying_method
                        }],
                        [{
                            text: dataiscorrect_text,
                            callback_data: dataiscorrect2_text
                        }]
                    ]
                }
            })
        }
    }
    if (query.data === changedeliver_date){
        isMakingChanges_2[chat.id] = 2
        bot.editMessageText('⏰ Укажите, когда вам нужно доставить заказ: ', {
            chat_id: chat.id, 
            message_id: add_info_msg[chat.id],
        })
    }
    if (query.data === dataiscorrect_text){
        isMakingChanges[chat.id] = 0
        bot.editMessageText(dopblank_text, {
            parse_mode: 'HTML',
            chat_id: chat.id,
            message_id: message_id,
            reply_markup:{
                inline_keyboard:[
                    [{
                        text: backtofillinginfo_text[0],
                        callback_data: backtofillinginfo_text[1]
                    }],
                    [{
                        text: user_payingmethods[0][0],
                        callback_data: user_payingmethods[0][1]
                    }],
                    [{
                        text: user_payingmethods[1][0],
                        callback_data: user_payingmethods[1][1]
                    }]
                ]
            }
        }).then(() => {
            add_info_msg[chat.id] = message_id
            console.log('savedmessage = ' + add_info_msg[chat.id] + ', ' + message_id)
        })
    }
    if (query.data === dataiscorrect2_text){
        if (user_payingmethod[chat.id] === 'Наличными курьеру'){
            isMakingChanges_2[chat.id] = 3
            bot.editMessageText('Напишите, с какой суммы вы хотите получить сдачу: ', {
                chat_id: chat.id, 
                message_id: add_info_msg[chat.id],
                reply_markup:{
                    inline_keyboard:[
                        [{
                            text: no_sdacha_text,
                            callback_data: no_sdacha_text
                        }]
                    ]
                }
            })
        }
        else {
            isMakingChanges_2[chat.id] = 4
            user_sdachainfo[chat.id] = no_sdacha_text
            bot.editMessageText('Уточните, как курьер может до вас добраться: ', {
                chat_id: chat.id, 
                message_id: add_info_msg[chat.id],
                reply_markup:{
                    inline_keyboard:[
                        [{
                            text: no_howtocome_text,
                            callback_data: no_howtocome_text
                        }]
                    ]
                }
            })
        }
        
    }
    if (query.data === no_sdacha_text){
        isMakingChanges_2[chat.id] = 4
        user_sdachainfo[chat.id] = no_sdacha_text
        bot.editMessageText('Уточните, как курьер может до вас добраться: ', {
            chat_id: chat.id, 
            message_id: add_info_msg[chat.id],
            reply_markup:{
                inline_keyboard:[
                    [{
                        text: no_howtocome_text,
                        callback_data: no_howtocome_text
                    }]
                ]
            }
        })
    }
    if (query.data === no_howtocome_text){
        isMakingChanges_2[chat.id] = 0
        isMakingChanges_3[chat.id] = 0
        isMakingChanges[chat.id] = 0
        user_howtocome[chat.id] = 'Не указано'
        if (userstatus[chat.id] !== 'unregistered'){
            if (user_coins[chat.id] >= (finalprice[chat.id] * min_pay_percentage)){
                if (user_coins[chat.id] <= (finalprice[chat.id] * max_pay_percentage)){
                    //тут можно оплатить всеми баллами.
                    skidka[chat.id] = user_coins[chat.id]
                    bot.sendMessage(chat.id, 'У вас есть ' + user_coins[chat.id] + ' тенге, которыми можно оплатить заказ. Сумма заказа с учетом скидки: ' + (finalprice[chat.id]-user_coins[chat.id]) + ' тенге. Хотите потратить их сейчас?', {
                        reply_markup: {
                            inline_keyboard: [
                                [{
                                    text: spendmycoins,
                                    callback_data: spendmycoins
                                },{
                                    text: dontspendmycoins,
                                    callback_data: dontspendmycoins
                                }]
                            ],
                        },
                    })
                }
                else if (user_coins[chat.id] > (finalprice[chat.id] * max_pay_percentage)){
                    //тут оплачиваем максимальным количеством баллов
                    skidka[chat.id] = finalprice[chat.id] * max_pay_percentage
                    bot.sendMessage(chat.id, 'Ваш баланс: ' + user_coins[chat.id] + ' тенге. Вы можете потратить ' + finalprice[chat.id] * max_pay_percentage + 'тенге на оплату заказа. Сумма заказа с учетом скидки: ' + (finalprice[chat.id] - ( finalprice[chat.id] * max_pay_percentage)) + ' тенге. Хотите сделать это?', {
                        reply_markup: {
                            inline_keyboard: [
                                [{
                                    text: spendmycoins,
                                    callback_data: spendmycoins
                                },{
                                    text: dontspendmycoins,
                                    callback_data: dontspendmycoins
                                }]
                            ],
                        },
                    })
                }
            }
            else {
                skidka[chat.id] = 0
             bot.deleteMessage(chat.id, message_id - 1)
            bot.deleteMessage(chat.id, message_id).then(() => {
                abonement_status[chat.id] = abonement_statuses_text[0]
                bot.sendMessage(chat.id, abonementrequest_sended, {
                    reply_markup: {
                        keyboard: unregistered_keyboard[3],
                        resize_keyboard: true
    
                    }
                })
                
                let updates = {};

                let username = []
                username[chat.id] = "undefined"
                if (chat.username != undefined) username[chat.id] = chat.username.toString()
                
                let alltimepurchases = []
                alltimepurchases[chat.id] = 1
                if (abonements_bought[chat.id] > 0){
                    alltimepurchases[chat.id] = abonements_bought[chat.id] + 1
                }

                let newuser = {
                    adress: user_adress[chat.id],
                    average_price: average_price[chat.id],
                    average_purchases: average_purchases[chat.id],
                    coins: user_coins[chat.id],
                    email: user_email[chat.id],
                    favourite_food: favourite_program[chat.id],
                    id: chat.id,
                    name: user_name[chat.id],
                    phone: user_phone[chat.id],
                    username: username[chat.id],
                    alltime_purchases_amount: alltimepurchases[chat.id]
                }

                let date = new Date()
                let utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
                let timeOfffset = 6 //Astana GMT +6
                let Astana_date = new Date(utcTime + (3600000 * timeOfffset))
                let date_now = Astana_date.getDate() + '_' + (Astana_date.getMonth() + 1) + '_' + Astana_date.getFullYear() + '__' + Astana_date.getHours() + '_' + Astana_date.getMinutes()                

                order_name[chat.id] = 'Basement/cities/' + userCity[chat.id] + '/points/' + userPoint[chat.id] + '/bills/' + date_now.toString()
                console.log('ORDER NAME: ' + order_name[chat.id])
                order_date[chat.id] = date_now.toString()

                //date_now = Date.now()
                //date_string = date_now.getDate() + ',' + date_now.getHours() + ':' + date_now.getMinutes()
                let newbill = {
                    date_ordered: Astana_date.getTime(),
                    order_info: finalbasket[chat.id],
                    price: finalprice[chat.id] + 1000,
                    client_id: chat.id,
                    phone: user_phone[chat.id],
                    order_status: abonement_statuses_text[0],
                    adress: user_adress[chat.id],
                    client_name: user_name[chat.id],
                    user_personsamount: user_personsamount[chat.id],
                    user_payingmethod: user_payingmethod[chat.id],
                    user_deliverdate: user_deliverdate[chat.id],
                    user_sdachainfo: user_sdachainfo[chat.id],
                    user_howtocome: user_howtocome[chat.id]
                }

                let clientsamount = fb.database().ref('Basement/clients/clients_amount');
                    clientsamount.get().then((snapshot) => {
                    let count = snapshot.val();
                    if (userstatus[chat.id] === 'unregistered'){
                        count++
                        updates['Basement/clients/clients_amount'] = count
                        userstatus[chat.id] = 'registered'
                    }

                    updates['Basement/clients/' + chat.id] = newuser
                    updates[order_name[chat.id]] = newbill

                    fb.database().ref().update(updates)

                    AddMailingData()
                    StartCheckingOrder()
                })

                                  ////////////////////ОТПРАВКА ЧЕКА///////////////////////////////////                 
    let options = { weekday: 'short'}
    
let minutes = Astana_date.getMinutes()
if (minutes < 10) minutes = '0' + minutes
let hours = Astana_date.getHours()
if (hours < 10) hours = '0' + hours
let visible_date = /* new Intl.DateTimeFormat('ru-RU', options).format(Astana_date) + ' ' +  */hours + ':' + minutes + ', ' + Astana_date.getDate() + '.' + (Astana_date.getMonth() + 1)

    abonements_bill_topic = abonement_bill_topic_names[0]
    abonemets_bill_client_info = `

<b>👤 Заказчик</b> (Нур-Султан GMT+6)
├ ФИО: ` + user_name[chat.id] + `
├ Адрес: ` + user_adress[chat.id] + `
└ Номер: ` + user_phone[chat.id] + `

`
    abonements_bill_order_info = `<b>🧾 Описание заказа:</b>
` + finalbasket[chat.id] + `

`
    
    deliver_bill_finalprice = `<b>💵 Итого к оплате:</b>
` + finalprice[chat.id] + ` тг.

`

    deliver_bill_order_details = `<b>ℹ️ Детали заказа</b> (Нур-Султан GMT+6)
└ Дата заказа: ` + visible_date + `

`
    deliver_bill_help_info = `<b>📌 Доп. информация</b>
├ Кол-во персон: ` + user_personsamount[chat.id] + `
├ Способ оплаты: ` + user_payingmethod[chat.id] + `
├ Купюра оплаты: ` + user_sdachainfo[chat.id] + `
└ Когда доставить: ` + user_deliverdate[chat.id] + `

<b>🚴‍♂️ Как пройти?</b>
` + user_howtocome[chat.id] + `

`
    console.log('order_date! ' + order_date[chat.id])
    abonements_bill = abonements_bill_topic + abonemets_bill_client_info + abonements_bill_order_info + deliver_bill_finalprice + deliver_bill_help_info + deliver_bill_order_details
    console.log('last message id: ' + query.message.message_id)
    console.log('delivery_chat: ' + operators_chat[chat.id])
    let current_chat = fb.database().ref('Basement/cities/' + userCity[chat.id] + '/points/' + userPoint[chat.id] + '/chats/');
    current_chat.get().then((snapshot) => {
        if (user_mode[chat.id] === usermodes[0][1]){
            operators_chat[chat.id] = snapshot.val().delivers_chat
            console.log('IT WORKS: ' + operators_chat[chat.id])
        }
        if (user_mode[chat.id] === usermodes[1][1]){
            operators_chat[chat.id] = snapshot.val().waiters_chat
            console.log('IT WORKS: ' + operators_chat[chat.id])
        }

        bot.sendMessage(operators_chat[chat.id], abonements_bill, {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard:[
                    [{
                        text: '✅ Принять заказ',
                        callback_data: accept_order_callback + order_date[chat.id]
                    }],
                    [{
                        text: '❌ Отклонить заказ',
                        callback_data: refuse_order_callback + order_date[chat.id]
                    }]
                ]
            }
        }).then(() => {
            //bot.sendContact(delivery_chat, user_phone[chat.id], user_name[chat.id]).then(() => {
            
            /* let update = {}
            let bill_message_id = query.message.message_id
            console.log('bills message id: ' + bill_message_id)
            update['Basement/bills/' + order_date/*  + '/bill_message_id' ] = bill_message_id
            console.log('adding message id: ' + 'Basement/bills/' + order_date) */
        })
    })
    

    ////////////////////////////////////////////////////////////////////////

                //console.log('Date: ' + date_now.getHours() + ':' + date_now.getMinutes())
            })
            }
        }
        else {
            bot.deleteMessage(chat.id, message_id - 1)
            bot.deleteMessage(chat.id, message_id).then(() => {
                abonement_status[chat.id] = abonement_statuses_text[0]
                bot.sendMessage(chat.id, abonementrequest_sended, {
                    reply_markup: {
                        keyboard: unregistered_keyboard[3],
                        resize_keyboard: true
    
                    }
                })

                let updates = {};

                let username = []
                username[chat.id] = "undefined"
                if (chat.username != undefined) username[chat.id] = chat.username.toString()
                
                let alltimepurchases = []
                alltimepurchases[chat.id] = 1
                if (abonements_bought[chat.id] > 0){
                    alltimepurchases[chat.id] = abonements_bought[chat.id] + 1
                }
                

                let newuser = {
                    adress: user_adress[chat.id],
                    average_price: average_price[chat.id],
                    average_purchases: average_purchases[chat.id],
                    coins: user_coins[chat.id],
                    email: user_email[chat.id],
                    favourite_food: favourite_program[chat.id],
                    id: chat.id,
                    name: user_name[chat.id],
                    phone: user_phone[chat.id],
                    username: username[chat.id],
                    alltime_purchases_amount: alltimepurchases[chat.id]
                }

                let date = new Date()
                let utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
                let timeOfffset = 6 //Astana GMT +6
                let Astana_date = new Date(utcTime + (3600000 * timeOfffset))
                let date_now = Astana_date.getDate() + '_' + (Astana_date.getMonth() + 1) + '_' + Astana_date.getFullYear() + '__' + Astana_date.getHours() + '_' + Astana_date.getMinutes()                

                //date_now = Date.now()
                //date_string = date_now.getDate() + ',' + date_now.getHours() + ':' + date_now.getMinutes()
                order_name[chat.id] = 'Basement/cities/' + userCity[chat.id] + '/points/' + userPoint[chat.id] + '/bills/' + date_now.toString()
                order_date[chat.id] = date_now.toString()
                console.log('ORDER NAME: ' + order_name[chat.id])

                let newbill = {
                    date_ordered: Astana_date.getTime(),
                    order_info: finalbasket[chat.id],
                    price: finalprice[chat.id] + 1000,
                    client_id: chat.id,
                    phone: user_phone[chat.id],
                    order_status: abonement_statuses_text[0],
                    adress: user_adress[chat.id],
                    client_name: user_name[chat.id],
                    user_personsamount: user_personsamount[chat.id],
                    user_payingmethod: user_payingmethod[chat.id],
                    user_deliverdate: user_deliverdate[chat.id],
                    user_sdachainfo: user_sdachainfo[chat.id],
                    user_howtocome: user_howtocome[chat.id]
                }

                let clientsamount = fb.database().ref('Basement/clients/clients_amount');
                    clientsamount.get().then((snapshot) => {
                    let count = snapshot.val();
                    console.log('WARNING! ' + userstatus[chat.id])
                    if (userstatus[chat.id] === 'unregistered'){
                        count++
                        updates['Basement/clients/clients_amount'] = count
                        userstatus[chat.id] = 'registered'
                    }

                    updates['Basement/clients/' + chat.id] = newuser
                    updates[order_name[chat.id]] = newbill

                    fb.database().ref().update(updates)

                    AddMailingData()
                    StartCheckingOrder() 
                    
                }).catch(err => {
                    console.log('error: ' + err)
                })

                   ////////////////////ОТПРАВКА ЧЕКА///////////////////////////////////                 
    let options = { weekday: 'short'}
    let minutes = Astana_date.getMinutes()
    if (minutes < 10) minutes = '0' + minutes
    let hours = Astana_date.getHours()
    if (hours < 10) hours = '0' + hours
    let visible_date = /* new Intl.DateTimeFormat('ru-RU', options).format(Astana_date) + ' ' +  */hours + ':' + minutes + ', ' + Astana_date.getDate() + '.' + (Astana_date.getMonth() + 1)
    
    abonements_bill_topic = abonement_bill_topic_names[0]
    abonemets_bill_client_info = `

<b>👤 Заказчик</b>
├ ФИО: ` + user_name[chat.id] + `
├ Адрес: ` + user_adress[chat.id] + `
└ Номер: ` + user_phone[chat.id] + `

`
    abonements_bill_order_info = `<b>🧾 Описание заказа:</b>
` + finalbasket[chat.id] + `

`
    
    deliver_bill_finalprice = `<b>💵 Итого к оплате:</b>
` + finalprice[chat.id] + ` тг.

`

    deliver_bill_order_details = `<b>ℹ️ Детали заказа</b> (Нур-Султан GMT+6)
└ Дата заказа: ` + visible_date + `

`

    deliver_bill_help_info = `<b>📌 Доп. информация</b>
├ Кол-во персон: ` + user_personsamount[chat.id] + `
├ Способ оплаты: ` + user_payingmethod[chat.id] + `
├ Купюра оплаты: ` + user_sdachainfo[chat.id] + `
└ Когда доставить: ` + user_deliverdate[chat.id] + `

<b>🚴‍♂️ Как пройти?</b>
` + user_howtocome[chat.id] + `

`
    console.log('order_date! ' + order_date[chat.id])

    abonements_bill = abonements_bill_topic + abonemets_bill_client_info + abonements_bill_order_info + deliver_bill_finalprice + deliver_bill_help_info + deliver_bill_order_details
    console.log('last message id: ' + query.message.message_id)
    let current_chat = fb.database().ref('Basement/cities/' + userCity[chat.id] + '/points/' + userPoint[chat.id] + '/chats/');
    current_chat.get().then((snapshot) => {
        if (user_mode[chat.id] === usermodes[0][1]){
            operators_chat[chat.id] = snapshot.val().delivers_chat
        }
        if (user_mode[chat.id] === usermodes[1][1]){
            operators_chat[chat.id] = snapshot.val().waiters_chat
        }

        bot.sendMessage(operators_chat[chat.id], abonements_bill, {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard:[
                    [{
                        text: '✅ Принять заказ',
                        callback_data: accept_order_callback + order_date[chat.id]
                    }],
                    [{
                        text: '❌ Отклонить заказ',
                        callback_data: refuse_order_callback + order_date[chat.id]
                    }]
                ]
            }
        }).then(() => {
            //bot.sendContact(delivery_chat, user_phone[chat.id], user_name[chat.id])
            /* let update = {}
            let bill_message_id = query.message.message_id
            console.log('bills message id: ' + bill_message_id)
            update['Basement/bills/' + order_date/*  + '/bill_message_id' ] = bill_message_id
            console.log('adding message id: ' + 'Basement/bills/' + order_date) */
        }).catch(err => {
            console.log('error: ' + err)
        })
    })
    

    ////////////////////////////////////////////////////////////////////////

                //console.log('Date: ' + date_now.getHours() + ':' + date_now.getMinutes())
            }).catch(err => {
                console.log('error: ' + err)
            })
        }
    }
    if (query.data === spendmycoins){
        skidka[chat.id] = Math.round(skidka[chat.id])
        finalprice[chat.id] = finalprice[chat.id] - skidka[chat.id]
        finalprice[chat.id] = Math.round(finalprice[chat.id])
        user_coins[chat.id] -= skidka[chat.id]
        user_coins[chat.id] = Math.round(user_coins[chat.id])
        finalbasket[chat.id] += `

Цена с учетом скидки: ` + finalprice[chat.id] + ' тг.'

        bot.deleteMessage(chat.id, message_id - 1)
            bot.deleteMessage(chat.id, message_id).then(() => {
                abonement_status[chat.id] = abonement_statuses_text[0]
                bot.sendMessage(chat.id, abonementrequest_sended, {
                    reply_markup: {
                        keyboard: unregistered_keyboard[3],
                        resize_keyboard: true
    
                    }
                })

                let updates = {}

                let username = []
                username[chat.id] = "undefined"
                if (chat.username != undefined) username[chat.id] = chat.username.toString()
                
                let alltimepurchases = []
                alltimepurchases[chat.id] = 1
                if (abonements_bought[chat.id] > 0){
                    alltimepurchases[chat.id] = abonements_bought[chat.id] + 1
                }

                //console.log(user_adress[chat.id] + ' ' + average_price[chat.id] + ' ' + average_purchases[chat.id] + ' ' + user_coins[chat.id] + ' ' + user_email[chat.id] + ' ' + favourite_food + ' ' + chat.id + ' ' + user_name[chat.id] + ' ' + user_phone[chat.id] + ' ' + username[chat.id] + ' ' + alltimepurchases[chat.id])

                let newuser = {
                    adress: user_adress[chat.id],
                    average_price: average_price[chat.id],
                    average_purchases: average_purchases[chat.id],
                    coins: user_coins[chat.id],
                    email: user_email[chat.id],
                    favourite_food: favourite_program[chat.id],
                    id: chat.id,
                    name: user_name[chat.id],
                    phone: user_phone[chat.id],
                    username: username[chat.id],
                    alltime_purchases_amount: alltimepurchases[chat.id]
                }

                let date = new Date()
                let utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
                let timeOfffset = 6 //Astana GMT +6
                let Astana_date = new Date(utcTime + (3600000 * timeOfffset))
                let date_now = Astana_date.getDate() + '_' + (Astana_date.getMonth() + 1) + '_' + Astana_date.getFullYear() + '__' + Astana_date.getHours() + '_' + Astana_date.getMinutes()                

                order_name[chat.id] = 'Basement/cities/' + userCity[chat.id] + '/points/' + userPoint[chat.id] + '/bills/' + date_now.toString()
                order_date[chat.id] = date_now.toString()
                console.log('ORDER NAME: ' + order_name[chat.id])

                //date_now = Date.now()
                //date_string = date_now.getDate() + ',' + date_now.getHours() + ':' + date_now.getMinutes()
                let newbill = {
                    date_ordered: Astana_date.getTime(),
                    order_info: finalbasket[chat.id],
                    price: finalprice[chat.id] + 1000,
                    client_id: chat.id,
                    phone: user_phone[chat.id],
                    order_status: abonement_statuses_text[0],
                    adress: user_adress[chat.id],
                    client_name: user_name[chat.id],
                    user_personsamount: user_personsamount[chat.id],
                    user_payingmethod: user_payingmethod[chat.id],
                    user_deliverdate: user_deliverdate[chat.id],
                    user_sdachainfo: user_sdachainfo[chat.id],
                    user_howtocome: user_howtocome[chat.id]
                }

                let clientsamount = fb.database().ref('Basement/clients/clients_amount');
                    clientsamount.get().then((snapshot) => {
                    let count = snapshot.val();
                    if (userstatus[chat.id] === 'unregistered'){
                        count++
                        updates['Basement/clients/clients_amount'] = count
                        userstatus[chat.id] = 'registered'
                    }

                    updates['Basement/clients/' + chat.id] = newuser
                    updates[order_name[chat.id]] = newbill

                    fb.database().ref().update(updates)

                    AddMailingData()
                    StartCheckingOrder()
                }).catch(error => {
                    console.log(error)
                })

                                ////////////////////ОТПРАВКА ЧЕКА///////////////////////////////////                 
    let options = { weekday: 'short'}
    
let minutes = Astana_date.getMinutes()
if (minutes < 10) minutes = '0' + minutes
let hours = Astana_date.getHours()
if (hours < 10) hours = '0' + hours
let visible_date = /* new Intl.DateTimeFormat('ru-RU', options).format(Astana_date) + ' ' +  */hours + ':' + minutes + ', ' + Astana_date.getDate() + '.' + (Astana_date.getMonth() + 1)  
    
abonements_bill_topic = abonement_bill_topic_names[0]
    abonemets_bill_client_info = `

<b>👤 Заказчик</b>
├ ФИО: ` + user_name[chat.id] + `
├ Адрес: ` + user_adress[chat.id] + `
└ Номер: ` + user_phone[chat.id] + `

`
    abonements_bill_order_info = `<b>🧾 Описание заказа:</b>
` + finalbasket[chat.id] + `

`
    
    deliver_bill_finalprice = `<b>💵 Итого к оплате:</b>
` + finalprice[chat.id] + ` тг.

`

    deliver_bill_order_details = `<b>ℹ️ Детали заказа</b> (Нур-Султан GMT+6)
└ Дата заказа: ` + visible_date + `

`
    deliver_bill_help_info = `<b>📌 Доп. информация</b>
├ Кол-во персон: ` + user_personsamount[chat.id] + `
├ Способ оплаты: ` + user_payingmethod[chat.id] + `
├ Купюра оплаты: ` + user_sdachainfo[chat.id] + `
└ Когда доставить: ` + user_deliverdate[chat.id] + `

<b>🚴‍♂️ Как пройти?</b>
` + user_howtocome[chat.id] + `

`
    console.log('order_date! ' + order_date[chat.id])
    abonements_bill = abonements_bill_topic + abonemets_bill_client_info + abonements_bill_order_info + deliver_bill_finalprice + deliver_bill_help_info + deliver_bill_order_details
    console.log('last message id: ' + query.message.message_id)
    let current_chat = fb.database().ref('Basement/cities/' + userCity[chat.id] + '/points/' + userPoint[chat.id] + '/chats/');
    current_chat.get().then((snapshot) => {
        if (user_mode[chat.id] === usermodes[0][1]){
            operators_chat[chat.id] = snapshot.val().delivers_chat
        }
        if (user_mode[chat.id] === usermodes[1][1]){
            operators_chat[chat.id] = snapshot.val().waiters_chat
        }

        bot.sendMessage(operators_chat[chat.id], abonements_bill, {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard:[
                    [{
                        text: '✅ Принять заказ',
                        callback_data: accept_order_callback + order_date[chat.id]
                    }],
                    [{
                        text: '❌ Отклонить заказ',
                        callback_data: refuse_order_callback + order_date[chat.id]
                    }]
                ]
            }
        }).then(() => {
            //bot.sendContact(delivery_chat, user_phone[chat.id], user_name[chat.id])
            /* let update = {}
            let bill_message_id = query.message.message_id
            console.log('bills message id: ' + bill_message_id)
            update['Basement/bills/' + order_date/*  + '/bill_message_id' ] = bill_message_id
            console.log('adding message id: ' + 'Basement/bills/' + order_date) */
        })
    })
    

    ////////////////////////////////////////////////////////////////////////

                //console.log('Date: ' + date_now.getHours() + ':' + date_now.getMinutes())
            })
    }
    if (query.data === dontspendmycoins){
        skidka[chat.id] = 0
        bot.deleteMessage(chat.id, message_id - 1)
            bot.deleteMessage(chat.id, message_id).then(() => {
                abonement_status[chat.id] = abonement_statuses_text[0]
                bot.sendMessage(chat.id, abonementrequest_sended, {
                    reply_markup: {
                        keyboard: unregistered_keyboard[3],
                        resize_keyboard: true
    
                    }
                })
                
                let updates = {};

                let username = []
                username[chat.id] = "undefined"
                if (chat.username != undefined) username[chat.id] = chat.username.toString()
                
                let alltimepurchases = []
                alltimepurchases[chat.id] = 1
                if (abonements_bought[chat.id] > 0){
                    alltimepurchases[chat.id] = abonements_bought[chat.id] + 1
                }

                let newuser = {
                    adress: user_adress[chat.id],
                    average_price: average_price[chat.id],
                    average_purchases: average_purchases[chat.id],
                    coins: user_coins[chat.id],
                    email: user_email[chat.id],
                    favourite_food: favourite_program[chat.id],
                    id: chat.id,
                    name: user_name[chat.id],
                    phone: user_phone[chat.id],
                    username: username[chat.id],
                    alltime_purchases_amount: alltimepurchases[chat.id]
                }

                let date = new Date()
                let utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
                let timeOfffset = 6 //Astana GMT +6
                let Astana_date = new Date(utcTime + (3600000 * timeOfffset))
                let date_now = Astana_date.getDate() + '_' + (Astana_date.getMonth() + 1) + '_' + Astana_date.getFullYear() + '__' + Astana_date.getHours() + '_' + Astana_date.getMinutes()                

                order_name[chat.id] = 'Basement/cities/' + userCity[chat.id] + '/points/' + userPoint[chat.id] + '/bills/' + date_now.toString()
                console.log('ORDER NAME: ' + order_name[chat.id])
                order_date[chat.id] = date_now.toString()

                //date_now = Date.now()
                //date_string = date_now.getDate() + ',' + date_now.getHours() + ':' + date_now.getMinutes()
                let newbill = {
                    date_ordered: Astana_date.getTime(),
                    order_info: finalbasket[chat.id],
                    price: finalprice[chat.id] + 1000,
                    client_id: chat.id,
                    phone: user_phone[chat.id],
                    order_status: abonement_statuses_text[0],
                    adress: user_adress[chat.id],
                    client_name: user_name[chat.id],
                    user_personsamount: user_personsamount[chat.id],
                    user_payingmethod: user_payingmethod[chat.id],
                    user_deliverdate: user_deliverdate[chat.id],
                    user_sdachainfo: user_sdachainfo[chat.id],
                    user_howtocome: user_howtocome[chat.id]
                }

                let clientsamount = fb.database().ref('Basement/clients/clients_amount');
                    clientsamount.get().then((snapshot) => {
                    let count = snapshot.val();
                    if (userstatus[chat.id] === 'unregistered'){
                        count++
                        updates['Basement/clients/clients_amount'] = count
                        userstatus[chat.id] = 'registered'
                    }

                    updates['Basement/clients/' + chat.id] = newuser
                    updates[order_name[chat.id]] = newbill

                    fb.database().ref().update(updates)

                    AddMailingData()
                    StartCheckingOrder()
                })

                                  ////////////////////ОТПРАВКА ЧЕКА///////////////////////////////////                 
    let options = { weekday: 'short'}
    
let minutes = Astana_date.getMinutes()
if (minutes < 10) minutes = '0' + minutes
let hours = Astana_date.getHours()
if (hours < 10) hours = '0' + hours
let visible_date = /* new Intl.DateTimeFormat('ru-RU', options).format(Astana_date) + ' ' +  */hours + ':' + minutes + ', ' + Astana_date.getDate() + '.' + (Astana_date.getMonth() + 1)

    abonements_bill_topic = abonement_bill_topic_names[0]
    abonemets_bill_client_info = `

<b>👤 Заказчик</b> (Нур-Султан GMT+6)
├ ФИО: ` + user_name[chat.id] + `
├ Адрес: ` + user_adress[chat.id] + `
└ Номер: ` + user_phone[chat.id] + `

`
    abonements_bill_order_info = `<b>🧾 Описание заказа:</b>
` + finalbasket[chat.id] + `

`
    
    deliver_bill_finalprice = `<b>💵 Итого к оплате:</b>
` + finalprice[chat.id] + ` тг.

`

    deliver_bill_order_details = `<b>ℹ️ Детали заказа</b> (Нур-Султан GMT+6)
└ Дата заказа: ` + visible_date + `

`
    deliver_bill_help_info = `<b>📌 Доп. информация</b>
├ Кол-во персон: ` + user_personsamount[chat.id] + `
├ Способ оплаты: ` + user_payingmethod[chat.id] + `
├ Купюра оплаты: ` + user_sdachainfo[chat.id] + `
└ Когда доставить: ` + user_deliverdate[chat.id] + `

<b>🚴‍♂️ Как пройти?</b>
` + user_howtocome[chat.id] + `

`
    console.log('order_date! ' + order_date[chat.id])
    abonements_bill = abonements_bill_topic + abonemets_bill_client_info + abonements_bill_order_info + deliver_bill_finalprice + deliver_bill_help_info + deliver_bill_order_details
    console.log('last message id: ' + query.message.message_id)
    let current_chat = fb.database().ref('Basement/cities/' + userCity[chat.id] + '/points/' + userPoint[chat.id] + '/chats/');
    current_chat.get().then((snapshot) => {
        if (user_mode[chat.id] === usermodes[0][1]){
            operators_chat[chat.id] = snapshot.val().delivers_chat
        }
        if (user_mode[chat.id] === usermodes[1][1]){
            operators_chat[chat.id] = snapshot.val().waiters_chat
        }

        bot.sendMessage(operators_chat[chat.id], abonements_bill, {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard:[
                    [{
                        text: '✅ Принять заказ',
                        callback_data: accept_order_callback + order_date[chat.id]
                    }],
                    [{
                        text: '❌ Отклонить заказ',
                        callback_data: refuse_order_callback + order_date[chat.id]
                    }]
                ]
            }
        }).then(() => {
            //bot.sendContact(delivery_chat, user_phone[chat.id], user_name[chat.id]).then(() => {
            
            /* let update = {}
            let bill_message_id = query.message.message_id
            console.log('bills message id: ' + bill_message_id)
            update['Basement/bills/' + order_date/*  + '/bill_message_id' ] = bill_message_id
            console.log('adding message id: ' + 'Basement/bills/' + order_date) */
        })
    })
    

    ////////////////////////////////////////////////////////////////////////

                //console.log('Date: ' + date_now.getHours() + ':' + date_now.getMinutes())
            })
    }
    if (query.data === add_email){
        isMakingChanges[chat.id] = 4
        bot.deleteMessage(chat.id, message_id)
        bot.sendMessage(chat.id, '📩 Напишите ваш email:', {
            reply_markup:{
                keyboard:[
                    [{
                        text: dont_add_email,
                    }]
                ],
                resize_keyboard: true
            }
        })
    }
    if (query.data === dont_add_email){
        isMakingChanges[chat.id] = 0

        let updates = {};
        updates['Basement/clients/' + chat.id + '/coins'] = user_coins[chat.id]
        fb.database().ref().update(updates).then(() => {
            //тут отправить в главное меню
            for (let i=0; i<100; i++){
                bot.deleteMessage(chat.id, message_id - i).catch(err => {
                    console.log(err)
                })
            }
            bot.sendMessage(chat.id, didntaddemail_text).then(() => {
                IdentifyUser(chat.id)
                anotherpoint_multiple[chat.id] = 2
                keyboards.CategoriesKeyboard(category_keyboard[chat.id], userCategories[chat.id], fb, bot, chat.id, query.message, anotherpoint_text, choosecategory_text, location_text, phone_text, userCity[chat.id], userPoint[chat.id], user_mode[chat.id])
            })
        })
    }  
    if (query.data === dontleavecomment){
        let orderinfo = fb.database().ref(order_name[chat.id]);
        orderinfo.get().then((snapshot) => 
        {
            console.log('saving poll...')
            let updates = {}
            let bill_update = {
                adress: snapshot.val().adress,
                client_name: snapshot.val().client_name,
                date_ordered: snapshot.val().date_ordered,
                client_id: snapshot.val().client_id,
                order_info: snapshot.val().order_info,
                phone: snapshot.val().phone,
                price: snapshot.val().price,
                order_status: snapshot.val().order_status,
                deliver_name: snapshot.val().deliver_name,
                accept_date: snapshot.val().accept_date,
                deliver_id: snapshot.val().deliver_id,
                message_id: snapshot.val().message_id,
                delivered_date: snapshot.val().delivered_date,
                feedback: feedback_options[answered_feedback[chat.id]],
                bill_text: snapshot.val().bill_text,
                user_personsamount: snapshot.val().user_personsamount,
                user_payingmethod: snapshot.val().user_payingmethod,
                user_deliverdate: snapshot.val().user_deliverdate,
                user_sdachainfo: snapshot.val().user_sdachainfo,
                user_howtocome: snapshot.val().user_howtocome
            }
            updates[order_name[chat.id]] = bill_update
            updates['Basement/clients/' + chat.id + '/coins'] = user_coins[chat.id]
            fb.database().ref().update(updates).then(() => {
                for (let i=0; i<100; i++){
                    bot.deleteMessage(chat.id, query.message.message_id - i).catch(err => {
                        //console.log(err)
                    })
                }

                let temp_bill = snapshot.val().bill_text + `
<b>💬 Отзыв о доставке:</b>                    
└ Оценка клиента: ` + feedback_options[answered_feedback[chat.id]]
                    bot.editMessageText(temp_bill, {
                        parse_mode: 'HTML',
                        chat_id: operators_chat[chat.id],
                        message_id: snapshot.val().message_id
                    })
                bot.sendSticker(chat.id, sticker_hello[Math.floor(Math.random() * sticker_hello.length)]).then(() => {
                    IdentifyUser(chat.id)
                    anotherpoint_multiple[chat.id] = 2
                    //keyboards.CategoriesKeyboard(category_keyboard[chat.id], userCategories[chat.id], fb, bot, chat.id, query.message, anotherpoint_text, choosecategory_text, location_text, phone_text, userCity[chat.id], userPoint[chat.id], user_mode[chat.id])
                    bot.sendMessage(chat.id, hellomessage_text, {
                        parse_mode: 'HTML',
                        reply_markup:{
                            inline_keyboard:[
                                [{
                                    text: usermodes[0][0],
                                    callback_data: usermodes[0][1]
                                },
                                {
                                    text: usermodes[1][0],
                                    callback_data: usermodes[1][1]
                                }]
                            ]
                        }
                    })
                })
            })
        }) 
    }
    if (query.data === leavecomment){
        bot.editMessageText('💬 Напишите отзыв:', {
            chat_id: chat.id,
            message_id: message_id
        }).then(() => {
            buttons_message[chat.id] = message_id
            isMakingChanges[chat.id] = 5
        })/* .catch(err => {
            bot.editMessageText('💬 Напишите отзыв:', {
                chat_id: chat.id,
                message_id: message_id - 1
            }).then(() => {
                buttons_message[chat.id] = message_id - 1
                isMakingChanges[chat.id] = 5
            }).catch(err2 => {
                bot.editMessageText('💬 Напишите отзыв:', {
                    chat_id: chat.id,
                    message_id: message_id - 2
                }).then(() => {
                    buttons_message[chat.id] = message_id - 2
                    isMakingChanges[chat.id] = 5
                }).catch(err3 => {
                    for (let i=0; i<100; i++){
                        bot.deleteMessage(chat.id, message_id - i).catch(smth => {
                            //console.log(smth)
                        })
                    }
                    bot.sendSticker(chat.id, sticker_hello).then(() => {
                        Reset(chat.id)
                        anotherpoint_multiple[chat.id] = 2
                        keyboards.CategoriesKeyboard(category_keyboard[chat.id], userCategories[chat.id], categories_count[chat.id], fb, bot, chat.id, query.message, anotherpoint_text, choosecategory_text, hellomessage_text, location_text, phone_text)
                    })
                })
            })
        }) */
        
    }
    }

    if (chat.type === 'group' || chat.type === 'supergroup'){
        bot.getChat(chat.id).then((result0) => {
            if (result0.description !== null || result0.description !== undefined){
                let del_userdata = []
                console.log(result0)
                del_userdata[chat.id] = result0.description.split('/')
                console.log('Chats| this: ' + chat.id + ', ' + del_userdata[chat.id][2])
                if (del_userdata[chat.id][2] === (chat.id).toString()){
                    let userdata = fb.database().ref('Fitness/'+del_userdata[chat.id][0]+'/clients/')
                    userdata.get().then((result) => {
                        let clients_array = Object.keys(result.val())
                        console.log('Вы нажимаете на кнопку callback для операторов: ' + query.data + ', array = ' + clients_array.length)
                        for(let i = clients_array.length - 1; i >= 0; i--){
                            console.log(i + ' Processing... ' + query.data + ', ' + (accept_order_callback + clients_array[i]))
                            if (query.data === accept_order_callback + clients_array[i].toString()){
                                accepted_order_name = clients_array[i]
                                console.log('Вы приняли заказ: ' + accepted_order_name)
                                //сохранить в чеке айди доставщика чтобы только он мог нажимать на кнопки
                                let orderinfo = fb.database().ref('Fitness/'+del_userdata[chat.id][0]+'/clients/' + clients_array[i]);
                                orderinfo.get().then((snapshot) => 
                                {
                                    console.log(query)
                                    console.log('acceptor name2 : ' + query.from.first_name + ', ' + query.from.id)
                                    let date = new Date()
                                    let utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
                                    let timeOfffset = 6 //Astana GMT +6
                                    let accept_date = new Date(utcTime + (3600000 * timeOfffset))
                                    let end_date = new Date (accept_date.getFullYear(), accept_date.getMonth(), accept_date.getDate(), accept_date.getHours(), accept_date.getMinutes())
                                    end_date.setMonth(accept_date.getMonth() + snapshot.val().abonement.period, accept_date.getDate())
                                    /* if (snapshot.val().abonement.period < 12){
                                    }
                                    if (snapshot.val().abonement.period >= 12){
                                        end_date.setFullYear(accept_date.getFullYear() + 1,accept_date.getMonth(), accept_date.getDate())
                                    } */
                                    console.log('дата начала: ' + accept_date.getTime() + ', дата конца: ' + end_date.getTime() + ', ' + snapshot.val().abonement.period)
                                      
                                    /////ИЗМЕНЯЕМ ЧЕК///////////////

                                    let Astana_date_accept = new Date(accept_date.getTime())  
                                    let minutes2 = Astana_date_accept.getMinutes()
                                    if (minutes2 < 10) minutes2 = '0' + minutes2
                                    let hours2 = Astana_date_accept.getHours()
                                    if (hours2 < 10) hours2 = '0' + hours2
                                    let visible_date_accept = /* new Intl.DateTimeFormat('ru-RU', options).format(Astana_date_accept) + ' ' +  */hours2 + ':' + minutes2 + ', ' + Astana_date_accept.getDate() + '.' + (Astana_date_accept.getMonth() + 1) + '.' + Astana_date_accept.getFullYear()
                                
                                    let Astana_date_end = new Date(end_date.getTime())  
                                    let minutes = Astana_date_end.getMinutes()
                                    if (minutes < 10) minutes = '0' + minutes
                                    let hours = Astana_date_end.getHours()
                                    if (hours < 10) hours = '0' + hours
                                    let visible_date_end = /* new Intl.DateTimeFormat('ru-RU', options).format(Astana_date_end) + ' ' +  */hours + ':' + minutes + ', ' + Astana_date_end.getDate() + '.' + (Astana_date_end.getMonth() + 1) + '.' + Astana_date_end.getFullYear()
                                
                                    abonements_bill_topic = abonement_bill_topic_names[1]
                                    abonemets_bill_client_info = `
                                
<b>👤 Заказчик</b>
├ ФИО: ` + snapshot.val().name + `
└ Номер: ` + snapshot.val().phone + `
                                
`
                                    abonements_bill_order_info = `<b>🧾 Описание абонемента:</b>
├ Программа: ` + snapshot.val().abonement.name + `
├ Срок действия: ` + snapshot.val().abonement.period + ` мес.
└ Стоимость: ` +snapshot.val().abonement.price + `  тенге.
                                
`
                                
                                if (snapshot.val().abonement.time === 'unlimited'){
abonements_bill_order_info += `<b>ℹ️ Дополнительно:</b>
├ Время суток: неограниченное`
                                }
                                
                                if (snapshot.val().abonement.time !== 'unlimited'){
                                    if (snapshot.val().abonement.time === 'morning'){
                                        abonements_bill_order_info += `<b>ℹ️ Дополнительно:</b>
├ Время суток: c ` + morning_time[query.from.id][0][0] + `:` + morning_time[query.from.id][0][1] + ` до ` + morning_time[query.from.id][1][0] + `:` + morning_time[query.from.id][1][1] 
                                    }
                                
                                    if (snapshot.val().abonement.time === 'evening'){
                                        abonements_bill_order_info += `<b>ℹ️ Дополнительно:</b>
├ Время суток: c ` + evening_time[query.from.id][0][0] + `:` + evening_time[query.from.id][0][1] + ` до ` + evening_time[query.from.id][1][0] + `:` + evening_time[query.from.id][1][1] 
                                    }
                                }
                                
                                if (snapshot.val().abonement.visits === 'unlimited'){
                                    abonements_bill_order_info += `
├ Кол-во посещений: неограниченное`
                                }
                                
                                if (snapshot.val().abonement.visits !== 'unlimited'){
                                    abonements_bill_order_info += `
├ Кол-во посещений: ` + snapshot.val().abonement.visits
                                }
                                
                                if (snapshot.val().abonement.freeze_amount === false){
                                    abonements_bill_order_info += `
└ Нет функции заморозки`
                                }
                                
                                if (snapshot.val().abonement.freeze_amount !== false){
                                    abonements_bill_order_info += `
└ Кол-во заморозок: ` + snapshot.val().abonement.freeze_amount + ` дней.`
                                }

                                    abonements_bill_order_info += `

<b>🕔 Детализация:</b>
├ Дата старта абонемента: ` + visible_date_accept + `
├ Дата конца абонемента: ` + visible_date_end + `
└ Имя сотрудника: ` + query.from.first_name + ', id: ' + query.from.id
                                
                                    abonements_bill = abonements_bill_topic + abonemets_bill_client_info + abonements_bill_order_info

                                    let updates = {}
                                    let abonement_update = {
                                        coins: snapshot.val().coins,
                                        email: snapshot.val().email,
                                        favourite_program: snapshot.val().favourite_program,
                                        id: snapshot.val().id,
                                        name: snapshot.val().name,
                                        phone: snapshot.val().phone,
                                        username: snapshot.val().username,
                                        abonements_bought: snapshot.val().abonements_bought + 1,
                                        times_came: snapshot.val().times_came,
                                        bill_text: abonements_bill,
                                        bill_msg: query.message.message_id,
                                        abonement: {
                                            name: snapshot.val().abonement.name,
                                            time: snapshot.val().abonement.time,
                                            visits: snapshot.val().abonement.visits,
                                            freeze_amount: snapshot.val().abonement.freeze_amount,
                                            period: snapshot.val().abonement.period,
                                            price: snapshot.val().abonement.price,
                                            freeze_start: snapshot.val().abonement.freeze_start,
                                            start_date: accept_date.getTime(),
                                            end_date: end_date.getTime(),
                                            abonement_status: abonement_statuses_text[2],
                                            activator_name: query.from.first_name,
                                            activator_id: query.from.id,
                                            paying_method: snapshot.val().abonement.paying_method
                                        }
                                    }
                                    updates['Fitness/'+del_userdata[chat.id][0]+'/clients/'+ clients_array[i]] = abonement_update
                                    //updates['Basement/clients/CLIENTID/EGO_CHECK'] = order_update
                                    fb.database().ref().update(updates)

                                    bot.editMessageText(abonements_bill, {
                                        parse_mode: 'HTML',
                                        chat_id: chat.id,
                                        message_id: message_id
                                    })
                                })
                                break
                            }
                            else if (query.data === refuse_order_callback + clients_array[i]){
                                console.log('Вы отклонили заказ: ' + clients_array[i])
                                let orderinfo = fb.database().ref('Fitness/'+del_userdata[chat.id][0]+'/clients/' + clients_array[i]);
                                orderinfo.get().then((snapshot) => 
                                {
                                    let date = new Date()
                                    let utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
                                    let timeOfffset = 6 //Astana GMT +6
                                    let refuse_date = new Date(utcTime + (3600000 * timeOfffset))
                                    
                                    let Astana_date_accept = new Date(refuse_date)
                                    let minutes2 = Astana_date_accept.getMinutes()
                                    if (minutes2 < 10) minutes2 = '0' + minutes2
                                    let hours2 = Astana_date_accept.getHours()
                                    if (hours2 < 10) hours2 = '0' + hours2
                                    let visible_date_refuse = /* new Intl.DateTimeFormat('ru-RU', options).format(Astana_date_accept) + ' ' +  */hours2 + ':' + minutes2 + ', ' + Astana_date_accept.getDate() + '.' + (Astana_date_accept.getMonth() + 1) + '.' + Astana_date_accept.getFullYear()
                                
                                    abonements_bill_topic = abonement_bill_topic_names[2]
                                    abonemets_bill_client_info = `
                                
<b>👤 Заказчик</b>
├ ФИО: ` + snapshot.val().name + `
└ Номер: ` + snapshot.val().phone + `
                                
`
                                    abonements_bill_order_info = `<b>🧾 Описание абонемента:</b>
├ Программа: ` + snapshot.val().abonement.name + `
├ Срок действия: ` + snapshot.val().abonement.period + ` мес.
└ Стоимость: ` +snapshot.val().abonement.price + `  тенге.
                                
`
                                
                                if (snapshot.val().abonement.time === 'unlimited'){
abonements_bill_order_info += `<b>ℹ️ Дополнительно:</b>
├ Время суток: неограниченное`
                                }
                                
                                if (snapshot.val().abonement.time !== 'unlimited'){
                                    if (snapshot.val().abonement.time === 'morning'){
                                        abonements_bill_order_info += `<b>ℹ️ Дополнительно:</b>
├ Время суток: c ` + morning_time[chat.id][0][0] + `:` + morning_time[chat.id][0][1] + ` до ` + morning_time[chat.id][1][0] + `:` + morning_time[chat.id][1][1] 
                                    }
                                
                                    if (snapshot.val().abonement.time === 'evening'){
                                        abonements_bill_order_info += `<b>ℹ️ Дополнительно:</b>
├ Время суток: c ` + evening_time[chat.id][0][0] + `:` + evening_time[chat.id][0][1] + ` до ` + evening_time[chat.id][1][0] + `:` + evening_time[chat.id][1][1] 
                                    }
                                }
                                
                                if (snapshot.val().abonement.visits === 'unlimited'){
                                    abonements_bill_order_info += `
├ Кол-во посещений: неограниченное`
                                }
                                
                                if (snapshot.val().abonement.visits !== 'unlimited'){
                                    abonements_bill_order_info += `
├ Кол-во посещений: ` + snapshot.val().abonement.visits
                                }
                                
                                if (snapshot.val().abonement.freeze_amount === false){
                                    abonements_bill_order_info += `
└ Нет функции заморозки`
                                }
                                
                                if (snapshot.val().abonement.freeze_amount !== false){
                                    abonements_bill_order_info += `
└ Кол-во заморозок: ` + snapshot.val().abonement.freeze_amount + ` дней.`
                                }

                                    abonements_bill_order_info += `

<b>🕔 Детализация:</b>
├ Дата отказа в заявке: ` + visible_date_refuse + `
└ Имя сотрудника: ` + query.from.first_name + ', id: ' + query.from.id
                                
                                    abonements_bill = abonements_bill_topic + abonemets_bill_client_info + abonements_bill_order_info

                                    let updates = {}
                                    let abonement_update = {
                                        coins: snapshot.val().coins,
                                        email: snapshot.val().email,
                                        favourite_program: snapshot.val().favourite_program,
                                        id: snapshot.val().id,
                                        name: snapshot.val().name,
                                        phone: snapshot.val().phone,
                                        username: snapshot.val().username,
                                        abonements_bought: snapshot.val().abonements_bought + 1,
                                        times_came: snapshot.val().times_came,
                                        bill_text: abonements_bill,
                                        bill_msg: query.message.message_id,
                                        abonement: {
                                            name: snapshot.val().abonement.name,
                                            time: snapshot.val().abonement.time,
                                            visits: snapshot.val().abonement.visits,
                                            freeze_amount: snapshot.val().abonement.freeze_amount,
                                            period: snapshot.val().abonement.period,
                                            price: snapshot.val().abonement.price,
                                            freeze_start: snapshot.val().abonement.freeze_start,
                                            start_date: '0',
                                            end_date: '0',
                                            abonement_status: abonement_statuses_text[3],
                                            activator_name: query.from.first_name,
                                            activator_id: query.from.id,
                                            paying_method: snapshot.val().abonement.paying_method
                                        }
                                    }
                                    updates['Fitness/'+del_userdata[chat.id][0]+'/clients/'+ clients_array[i]] = abonement_update
                                    //updates['Basement/clients/CLIENTID/EGO_CHECK'] = order_update
                                    fb.database().ref().update(updates)

                                    bot.editMessageText(abonements_bill, {
                                        parse_mode: 'HTML',
                                        chat_id: chat.id,
                                        message_id: message_id
                                    })
                                })
                                break
                            }
                            else if (i === 0) {
                                console.log(i + 'HERE IT IS')
                                bot.editMessageText('💭 Заявка не найдена.', {
                                    chat_id: chat.id,
                                    message_id: message_id
                                })
                            }
                        }
                    })
                }
            }
            else {
                bot.sendMessage(chat.id, 'Извините, этот бот пока не работает в группах и каналах 🥺')
            }
        })
    
    }
})

bot.onText(/Admin_controller:GetChatInfo/, msg =>
{
    //console.log(msg)
    const chatId = msg.chat.id
    bot.sendMessage(chatId, chatId)

})
bot.onText(/\/start/, msg => {
    const chatId = msg.chat.id
    current_chat = chatId
    //userstatus[chatId] = 'registered'
    if (msg.chat.type === 'private'){
        if (msg.text === '/start'){
            if (club_name_fb[chatId] !== undefined && club_name_fb[chatId] !== ''){
                //чел уже пользовался ботом клуба, идентифицируем и говорим привет
                
                for (let i=0; i<100; i++){
                    bot.deleteMessage(chatId, msg.message_id - i).catch(err => {
                        //console.log(err)
                    })
                }
                bot.sendSticker(chatId, sticker_hello[Math.floor(Math.random() * sticker_hello.length)])
                .then(() => {
                    anotherpoint_multiple[chatId] = 2
                    bot.sendMessage(chatId, hellomessage_text, {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: keyboards.main_menu_keyboard
                        }
                    })
                    .then(() => {
                        IdentifyUser(chatId)
                    })
                })
            }
    
            else {
                //посылаем клавиатуру с выбором качалок
                //IdentifyUser(chatId)
                gym_keyboard[chatId] = []
                userGyms[chatId] = []
                keyboards.GymsKeyboard(gym_keyboard[chatId], userGyms[chatId], fb, bot, chatId, mother_link, choosegym_text)
            }
        }
        else {
            let userdata = fb.database().ref('Fitness/')
            userdata.get().then((result) => 
            {
                let clubs = Object.keys(result.val())
                for (let i = 0; i < clubs.length; i++){
                    if (msg.text === '/start ' + clubs[i] + '_start'){
                        let temp = (msg.text).split(' ')
                        temp[1] = temp[1].split('_')
                        //
                        console.log(club_name_fb[chatId])
                        if (userstatus[chatId] === 'registered' && club_name_fb[chatId] === temp[1][0]){
                            console.log('Пользователь зареган и его клуб совпадает с клубом из ссылки. Можно начать тренировку')
                            StartTraining(chatId, msg.message_id)
    
                            for (let i=0; i<100; i++){
                                bot.deleteMessage(chatId, msg.message_id - i).catch(err => {
                                    //console.log(err)
                                })
                            }
                            bot.sendSticker(chatId, sticker_hello[Math.floor(Math.random() * sticker_hello.length)])
                            .then(() => {
                                anotherpoint_multiple[chatId] = 2
                                bot.sendMessage(chatId, hellomessage_text, {
                                    parse_mode: 'HTML',
                                    reply_markup: {
                                        inline_keyboard: keyboards.main_menu_keyboard
                                    }
                                })
                            })
                        }
                        else {
                            club_name_fb[chatId] = temp[1][0]
                            console.log(club_name_fb[chatId])
                            
                            for (let i=0; i<100; i++){
                                bot.deleteMessage(chatId, msg.message_id - i).catch(err => {
                                    //console.log(err)
                                })
                            }
                            bot.sendSticker(chatId, sticker_hello[Math.floor(Math.random() * sticker_hello.length)])
                            .then(() => {
                                anotherpoint_multiple[chatId] = 2
                                bot.sendMessage(chatId, hellomessage_text, {
                                    parse_mode: 'HTML',
                                    reply_markup: {
                                        inline_keyboard: keyboards.main_menu_keyboard
                                    }
                                })
                                .then(() => {
                                    IdentifyUser(chatId)
                                })
                            })
    
                        }
                    }
                }
            })
        }
    }

    if (msg.chat.type === 'group' || msg.chat.type === 'supergroup'){
        bot.getChat(chatId).then(result => {
            if (result.description !== undefined && result.description !== null){
                console.log('group: ' + result.description)
                let del_userdata = []
                del_userdata[chatId] = result.description.split('/')
                if (del_userdata[chatId].length === 3 && del_userdata[chatId][2] === (chatId).toString())(
                    bot.sendMessage(chatId, 'Привет! Я буду скидывать сюда заявки на абонементы. Вы можете одобрить или отклонить заявку на абонемент. Сверьте данные в сообщении с оплатой, поступившей на Ваш счет. Если все верно, нажмите ✅ Создать абонемент')
                )
                else {
                    bot.sendMessage(chatId, 'Извините, этот бот не работает в группах, напишите ему в личные сообщения', {
                        reply_markup: {
                            inline_keyboard:[
                                [{
                                    text: 'ctOS 🤖',
                                    url: mother_link
                                }]
                            ]
                        }
                    })
                }
            }
            else {
                bot.sendMessage(chatId, 'Извините, этот бот не работает в группах, напишите ему в личные сообщения', {
                    reply_markup: {
                        inline_keyboard:[
                            [{
                                text: 'ctOS 🤖',
                                url: mother_link
                            }]
                        ]
                    }
                })
            }
        })
    }
})

function IdentifyUser(current_chat){

    console.log(club_name_fb[current_chat])
    user_phone[current_chat] = ''
    user_email[current_chat] = 'unknown'
    user_adress[current_chat] = ''
    user_name[current_chat] = ''
    user_username[current_chat] = 'unknown'
    user_id[current_chat] = 0
    average_price[current_chat] = 0
    average_purchases[current_chat] = 0
    user_coins[current_chat] = 0
    added_coins[current_chat] = 0
    favourite_program[current_chat] = 'unknown'
    abonements_bought[current_chat] = 0
        userstatus[current_chat] = 'unknown'
    order_name[current_chat] = ''
    order_date[current_chat] = ''
    abonement_status[current_chat] = 'unknown'
    skidka[current_chat] = 0
    //user_lastbill[current_chat] = []

    finalprice[current_chat] = 0
    finalbasket[current_chat] = ''
    temp_backet_food[current_chat] = 0
    temp_food_text[current_chat] = ''
    temp_program_types[current_chat] = []
    myprogram_type[current_chat] = []
    temp_foodamount[current_chat] = 1

    basket[current_chat] = []

    food_categories[current_chat] = [['☕️ Кофе', 0, 'coffee'], ['🍦 Мороженое', 0, 'icecream'], ['🍣 Суши', 0, 'sushi'], ['🍰 Десерты', 0, 'deserts'], ['🍔 Фаст-фуд', 0, 'fastfood'], ['Остальное', 0, 'other']]

    add_info_msg[current_chat] = 0

    anotherpoint_multiple[current_chat] = 0

    temp_message[current_chat] = 0
    userCity[current_chat] = 0 // 0-NurSultan, 1-Almaty
    userPoint[current_chat] = 0
    //
    userCategory[current_chat] = ''
    userCategories[current_chat] = []
    category_keyboard[current_chat] = []
    categories_count[current_chat] = 0
    //
    userProgram[current_chat] = ''
    userProgrammesList[current_chat] = []
    programmes_keyboard[current_chat] = []
    foodlist_count[current_chat] = 0
    //
    userCity[current_chat] = ''
    userCities[current_chat] = []
    userPoint[current_chat] = ''
    userPoints[current_chat] = []
    cities_keyboard[current_chat] = []
    points_keyboard[current_chat] = []
    cities_count[current_chat] = 0
    points_count[current_chat] = 0

    trener_keyboard[current_chat] = []
    userTreners[current_chat] = []
    userTrener[current_chat] = ''

    isMakingChanges[current_chat] = 0
    isMakingChanges_2[current_chat] = 0
    isMakingChanges_3[current_chat] = 0

    userlocation[current_chat] = [0.1,0.1]
    nearest_place[current_chat] = 0
    min_distance[current_chat] = 9999999

    buttons_message[current_chat] = 0
    messages_todelete[current_chat] = []
    messages_texts[current_chat] = []
    
    answered_feedback[current_chat] = 0
    isAnswered_feedback[current_chat] = 0

    user_payingmethod[current_chat] = ''
    user_timescame[current_chat] = 0

    operators_chat[current_chat] = 0
    types_keyboard[current_chat] = []

    waitlist[current_chat] = ''
    //club_name_fb[current_chat] = ''

    userGyms[current_chat] = []
    gym_keyboard[current_chat] = []

    card_data[current_chat] = []
    point_location[current_chat] = []

    morning_time[current_chat] = []
    evening_time[current_chat] = []

    shop_keyboard[current_chat] = []
    userShopCategories[current_chat] = []
    userShopCategory[current_chat] = ''

    shopitems_keyboard[current_chat] = []
    userItemsList[current_chat] = []
    userItem[current_chat] = ''
    userItemPrice[current_chat] = 0

    var other_data = fb.database().ref('Fitness/'+club_name_fb[current_chat]+'/other_info')
    other_data.get().then((snapshot) => 
    {
        help_phone[current_chat] = snapshot.val().contact_phone
        point_location[current_chat][0] = snapshot.val().latitude
        point_location[current_chat][1] = snapshot.val().longitude
        point_adress[current_chat] = snapshot.val().adress_text

        morning_time[current_chat] = snapshot.val().morning_time
        morning_time[current_chat] = snapshot.val().morning_time.split('-')
        morning_time[current_chat][0] = morning_time[current_chat][0].split(':')
        morning_time[current_chat][1] = morning_time[current_chat][1].split(':')

        evening_time[current_chat] = snapshot.val().evening_time
        evening_time[current_chat] = snapshot.val().evening_time.split('-')
        evening_time[current_chat][0] = evening_time[current_chat][0].split(':')
        evening_time[current_chat][1] = evening_time[current_chat][1].split(':')

        support_username[current_chat] = snapshot.val().support_username

        card_data[current_chat][0] = snapshot.val().kaspi_phone
        card_data[current_chat][1] = snapshot.val().card
        card_data[current_chat][2] = snapshot.val().fio

    })

    var loyalsys_data = fb.database().ref('Fitness/'+ club_name_fb[current_chat] + '/loyal_system/')
    loyalsys_data.get().then((snapshot) => 
        {
            cashback[current_chat] = snapshot.val().cashback
            max_cashback[current_chat] = snapshot.val().max_cashback
            min_cashback[current_chat] = snapshot.val().min_cashback
            min_price[current_chat] = snapshot.val().min_price
        }
    )
    
/*     var mailing_data = fb.database().ref('Basement/mailing/preferences')
        mailing_data.get().then((snapshot) => 
        {
            reach_min = snapshot.val().reach_min
            group_buys_amount = snapshot.val().group_buys_amount
            cheap_max = snapshot.val().cheap_max
        }
    ) */
    
    var chats_data = fb.database().ref('Fitness/'+club_name_fb[current_chat]+'/chats')
        chats_data.get().then((snapshot) => 
        {
            admin_id[current_chat] = snapshot.val().admin_chat
            operators_chat[current_chat] = snapshot.val().operators_chat
            console.log('!!! ' + admin_id[current_chat] + ' ' + operators_chat[current_chat])
        }
    )

    //теперь проверить зареган ли юзер. Если д - предлагаем начать тренировку
    let identifyes = fb.database().ref('Fitness/'+club_name_fb[current_chat]+'/clients/' + current_chat);
    identifyes.get().then((snapshot) => {
        if (snapshot.exists()){
            userstatus[current_chat] = 'registered'
            user_coins[current_chat] = snapshot.val().coins
            user_email[current_chat] = snapshot.val().email
            favourite_program[current_chat] = snapshot.val().favourite_program
            user_name[current_chat] = snapshot.val().name
            abonements_bought[current_chat] = snapshot.val().abonements_bought
            user_timescame[current_chat] = snapshot.val().times_came
            user_phone[current_chat] = snapshot.val().phone

            myprogram_type[current_chat][6] = snapshot.val().abonement.name
            myprogram_type[current_chat][2] = snapshot.val().abonement.time
            myprogram_type[current_chat][4] = snapshot.val().abonement.visits
            myprogram_type[current_chat][5] = snapshot.val().abonement.freeze_amount
            myprogram_type[current_chat][0] = snapshot.val().abonement.period
            myprogram_type[current_chat][1] = snapshot.val().abonement.price
            user_payingmethod[current_chat] = snapshot.val().paying_method

            const temp_tex = 'Хотите начать тренировку? Нажимая на кнопку Вы <b>подтверждаете свое присутсвие на тренировке.</b>'
            bot.sendMessage(current_chat, temp_tex, {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [{
                            text: accepttraining_text[0],
                            callback_data: accepttraining_text[1]
                        },{
                            text: refusetraining_text[0],
                            callback_data: refusetraining_text[1]
                        }]
                    ],
                }
            })
        }
        else {
            userstatus[current_chat] = 'unregistered'
        }
    }).catch(err => {console.log('1 ' + err)})

}

process.on('uncaughtException', function (err) {
    console.log(err);
});

